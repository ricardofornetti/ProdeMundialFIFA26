import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  limit,
  deleteDoc,
  deleteField,
  getDocFromServer
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential
} from "firebase/auth";
import { Match, User, PrivateGroup } from "../types";
import { db, auth, googleProvider } from "../firebase";

// --- ERROR HANDLING ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | null;
  };
}

export const handleFirestoreError = (
  err: any,
  operationType: OperationType,
  path: string | null = null
) => {
  const authInfo = {
    userId: auth.currentUser?.uid || null,
  };

  const errorInfo: FirestoreErrorInfo = {
    error: err?.message || 'Unknown error',
    operationType,
    path,
    authInfo,
  };

  if (err?.code?.startsWith('auth/')) {
    console.error('AUTH ERROR:', errorInfo);
    throw err;
  }

  if (err?.code?.startsWith('permission-denied') || err?.message?.includes('permission')) {
    console.error('PERMISSION DENIED:', errorInfo);
    throw new Error(`Permission denied on ${operationType}: ${path}`);
  }

  if (err?.code?.startsWith('not-found') || err?.message?.includes('not found')) {
    console.error('NOT FOUND:', errorInfo);
    throw new Error(`Resource not found: ${path}`);
  }

  console.error('FIRESTORE ERROR:', errorInfo);
  throw err;
};

// --- AUTHENTICATION ---

export const signInWithGoogle = async (): Promise<{ user: User; isNew: boolean } | null> => {
  if (!auth || !db) return null;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Check if user exists in Firestore with a small retry logic for potential race conditions
    let userDoc = null;
    for (let i = 0; i < 3; i++) {
      try {
        userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        break;
      } catch (e: any) {
        if (i === 2) {
          console.error('Firestore check failed after 3 attempts:', e);
          handleFirestoreError(e, OperationType.GET, `users/${firebaseUser.uid}`);
        }
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
      }
    }

    if (userDoc && userDoc.exists()) {
      return { user: { ...userDoc.data(), uid: firebaseUser.uid } as User, isNew: false };
    } else {
      // We don't create the user here anymore, we let the UI handle it if it's a registration
      // Or we can create a basic profile and return isNew: true
      const newUser: User = {
        uid: firebaseUser.uid,
        email: (firebaseUser.email || '').trim().toLowerCase(),
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
        photoUrl: firebaseUser.photoURL || '',
        isVerified: true,
        totalScore: 0,
        role: 'user',
        settings: {
          notifyResults: true,
          notifyMatchStart: true,
          theme: 'light'
        }
      };
      return { user: newUser, isNew: true };
    }
  } catch (error: any) {
    console.error('Full Google Login Error:', error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.');
    }
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      return null; // User closed the window, not a hard error
    }
    if (error.code?.startsWith('auth/')) {
      throw new Error(`Error de autenticación: ${error.code}`);
    }
    // If it's already a Firestore error thrown by handleFirestoreError inside the retry loop, just rethrow it
    if (error.message && error.message.includes('operationType')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.GET, "auth/google-signin-flow");
    return null;
  }
};

export const completeRegistration = async (user: User, password?: string): Promise<User | null> => {
  if (!auth || !db || !auth.currentUser) return null;
  try {
    const firebaseUser = auth.currentUser;

    // If password provided, link it
    if (password) {
      try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await firebaseUser.linkWithCredential(credential);
      } catch (e: any) {
        console.warn('Could not link password to Google account:', e?.message);
      }
    }

    const userData: User = {
      ...user,
      uid: firebaseUser.uid,
      email: (firebaseUser.email || user.email).trim().toLowerCase(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userData, { merge: true });
    return userData;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    return null;
  }
};

export const registerUser = async (user: User): Promise<User | null> => {
  if (!auth || !db) return null;
  try {
    // Create auth user
    const authResult = await createUserWithEmailAndPassword(auth, user.email, user.password || '');
    
    // Save to Firestore
    const userData: User = {
      ...user,
      uid: authResult.user.uid,
      email: (authResult.user.email || user.email).trim().toLowerCase(),
      isVerified: false,
    };

    await setDoc(doc(db, "users", authResult.user.uid), userData, { merge: true });
    return userData;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.WRITE, "users/register");
    return null;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  if (!auth || !db) return null;
  try {
    const authResult = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", authResult.user.uid));
    
    if (userDoc.exists()) {
      return { ...userDoc.data(), uid: authResult.user.uid } as User;
    } else {
      throw new Error('User profile not found');
    }
  } catch (error: any) {
    console.error(error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password');
    }
    handleFirestoreError(error, OperationType.GET, `users/login`);
    return null;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) return;
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.WRITE, `auth/reset-password`);
    throw error;
  }
};

export const onAuthChange = (callback: (user: any) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// --- USERS ---

export const saveUserProfile = async (user: User): Promise<boolean> => {
  if (!db || !user.uid) return false;
  try {
    await setDoc(doc(db, "users", user.uid), user, { merge: true });
    return true;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    return false;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  if (!db) return null;
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return { ...docSnap.data(), uid: userId } as User;
    }
    return null;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    return null;
  }
};

// --- PREDICTIONS ---

export const saveUserPrediction = async (
  userId: string,
  matchId: string,
  homeScore: number | '',
  awayScore: number | ''
): Promise<boolean> => {
  if (!db || !userId) return false;
  try {
    const predRef = doc(db, "users", userId, "predictions", matchId);
    await setDoc(
      predRef,
      {
        matchId,
        homeScore: homeScore === '' ? null : homeScore,
        awayScore: awayScore === '' ? null : awayScore,
        createdAt: new Date(),
      },
      { merge: true }
    );
    return true;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/predictions/${matchId}`);
    return false;
  }
};

export const getUserPredictions = async (userId: string): Promise<any[]> => {
  if (!db || !userId) return [];
  try {
    const q = query(
      collection(db, "users", userId, "predictions"),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const predictions: any[] = [];
    querySnapshot.forEach((doc) => {
      predictions.push({ ...doc.data() });
    });
    return predictions;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/predictions`);
    return [];
  }
};

// --- MATCHES ---

export const getRealMatches = async (): Promise<any[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "matches"));
    const querySnapshot = await getDocs(q);
    const matches: any[] = [];
    querySnapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });
    return matches;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.LIST, `matches`);
    return [];
  }
};

// --- GROUPS ---

export const createPrivateGroup = async (
  groupName: string,
  userId: string
): Promise<string | null> => {
  if (!db) return null;
  try {
    const groupRef = doc(collection(db, "private-groups"));
    const groupData = {
      name: groupName,
      createdBy: userId,
      members: [userId],
      createdAt: new Date(),
    };
    await setDoc(groupRef, groupData);
    return groupRef.id;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.CREATE, `private-groups`);
    return null;
  }
};

export const joinPrivateGroup = async (groupId: string, userId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const groupRef = doc(db, "private-groups", groupId);
    await updateDoc(groupRef, {
      members: [...(await getDoc(groupRef)).data()?.members || [], userId],
    });
    return true;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.WRITE, `private-groups/${groupId}`);
    return false;
  }
};

export const getPrivateGroups = async (userId: string): Promise<PrivateGroup[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "private-groups"),
      where("members", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    const groups: PrivateGroup[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() } as PrivateGroup);
    });
    return groups;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.LIST, `private-groups`);
    return [];
  }
};

export const getCloudGroup = async (groupId: string): Promise<PrivateGroup | null> => {
  if (!db) return null;
  try {
    const docSnap = await getDoc(doc(db, "private-groups", groupId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PrivateGroup;
    }
    return null;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.GET, `private-groups/${groupId}`);
    return null;
  }
};

export const joinCloudGroup = async (groupId: string, userId: string): Promise<boolean> => {
  if (!db || !userId) return false;
  try {
    const groupDocRef = doc(db, "private-groups", groupId);
    const groupSnapshot = await getDoc(groupDocRef);
    
    if (!groupSnapshot.exists()) {
      throw new Error("Group does not exist");
    }

    const groupData = groupSnapshot.data();
    const currentMembers = groupData?.members || [];

    if (currentMembers.includes(userId)) {
      return true; // Already a member
    }

    await updateDoc(groupDocRef, {
      members: [...currentMembers, userId],
    });

    return true;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.WRITE, `private-groups/${groupId}`);
    return false;
  }
};

// --- SCORES ---

export const recalculateAllScores = async (userId: string): Promise<number> => {
  if (!db) return 0;
  try {
    const predictionsSnap = await getDocs(
      collection(db, "users", userId, "predictions")
    );

    const matchesSnap = await getDocs(collection(db, "matches"));
    const matchesMap = new Map();
    matchesSnap.forEach((doc) => {
      matchesMap.set(doc.id, doc.data());
    });

    let totalScore = 0;

    predictionsSnap.forEach((predDoc) => {
      const prediction = predDoc.data();
      const match = matchesMap.get(prediction.matchId);

      if (
        match &&
        match.actualHomeScore !== null &&
        match.actualAwayScore !== null
      ) {
        if (
          prediction.homeScore === match.actualHomeScore &&
          prediction.awayScore === match.actualAwayScore
        ) {
          totalScore += 3; // Correct result
        } else if (
          (prediction.homeScore > prediction.awayScore &&
            match.actualHomeScore > match.actualAwayScore) ||
          (prediction.homeScore < prediction.awayScore &&
            match.actualHomeScore < match.actualAwayScore) ||
          (prediction.homeScore === prediction.awayScore &&
            match.actualHomeScore === match.actualAwayScore)
        ) {
          totalScore += 1; // Correct outcome
        }
      }
    });

    // Save total score to user profile
    await updateDoc(doc(db, "users", userId), { totalScore });

    return totalScore;
  } catch (error: any) {
    console.error(error);
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/score`);
    return 0;
  }
};

export const testConnection = async (): Promise<boolean> => {
  if (!db) return false;
  try {
    const testRef = doc(db, ".settings", "indexing");
    await getDocFromServer(testRef);
    return true;
  } catch (error) {
    console.error("Connection test failed: ", error);
    return false;
  }
};


