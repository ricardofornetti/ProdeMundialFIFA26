
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
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential
} from "firebase/auth";
import { Match, User, PrivateGroup } from "../types";
import { db, auth } from "../firebase";

const googleProvider = new GoogleAuthProvider();

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- CONNECTION TEST ---

export async function testConnection() {
  if (!db) return;
  try {
    // Test connection by attempting to read a non-existent document from a test collection
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    // Other errors are expected if the document doesn't exist, but "offline" is a config issue.
  }
}

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- GESTIÓN DE USUARIOS ---

export const registerUser = async (user: User) => {
  if (!auth || !db) return;
  const path = "users";
  try {
    // 1. Create auth account
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password || '');
    const firebaseUser = userCredential.user;

    // 2. Save profile data to Firestore
    const userRef = doc(db, path, firebaseUser.uid);
    const { password, ...userData } = user; // Don't store password in Firestore
    const finalUserData = {
      ...userData,
      uid: firebaseUser.uid,
      role: 'user',
      updatedAt: new Date()
    };
    try {
      await setDoc(userRef, finalUserData);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`);
      return null;
    }

    // 3. Save username mapping for lookup
    try {
      await setDoc(doc(db, "usernames", user.username.toLowerCase()), {
        email: user.email,
        uid: firebaseUser.uid
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `usernames/${user.username.toLowerCase()}`);
      // Don't fail the whole registration if username mapping fails, but log it
    }
    
    return finalUserData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

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
        email: firebaseUser.email || '',
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
        await linkWithCredential(firebaseUser, credential);
      } catch (linkError: any) {
        console.error('Error linking email/password:', linkError);
        // If it fails because the email is already linked or something, we might still want to continue
        // but usually it's because the password doesn't meet requirements or email is taken
        if (linkError.code === 'auth/email-already-in-use') {
          // This shouldn't happen if they just signed up with Google for the first time
        }
      }
    }

    // Save profile to Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...user,
      updatedAt: new Date()
    });

    // Save username mapping
    try {
      await setDoc(doc(db, "usernames", user.username.toLowerCase()), {
        email: user.email,
        uid: firebaseUser.uid
      });
    } catch (e) {
      console.warn('Failed to save username mapping:', e);
    }

    return { ...user, uid: firebaseUser.uid };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "auth/complete-registration");
    return null;
  }
};

export const loginUser = async (emailOrUsername: string, password: string): Promise<User | null> => {
  if (!auth || !db) return null;
  try {
    const isValidEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    let email = emailOrUsername;
    
    // Check if it's a username (doesn't contain @)
    if (!emailOrUsername.includes('@')) {
      try {
        const usernameDoc = await getDoc(doc(db, "usernames", emailOrUsername.toLowerCase()));
        if (usernameDoc.exists()) {
          email = usernameDoc.data().email;
        } else {
          // Try to find by username in users collection (fallback for old users)
          // Note: This will only work if the user is already authenticated, 
          // which is not the case here. So it's mostly for debugging/future use.
          try {
            const q = query(collection(db, "users"), where("username", "==", emailOrUsername), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              email = querySnapshot.docs[0].data().email;
            }
          } catch (e) {
            // Ignore permission errors during lookup
          }
        }
      } catch (e) {
        console.warn('Username lookup failed:', e);
        // Continue with the original input as email
      }
    }

    // If it's still not a valid email, it's likely a missing username
    if (!isValidEmail(email)) {
      return null;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Fetch profile from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      return { ...userDoc.data(), uid: firebaseUser.uid } as User;
    } else {
      // Fallback if document doesn't exist but Auth succeeded
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: emailOrUsername,
        photoUrl: '',
        isVerified: true
      } as User;
    }
    return null;
  } catch (error: any) {
    // Don't throw for common auth errors, just return null so the UI can show "Invalid credentials"
    if (error.code?.startsWith('auth/')) {
      console.warn('Auth error during login:', error.code);
      return null;
    }
    handleFirestoreError(error, OperationType.GET, "auth/login");
    return null;
  }
};

export const resetPassword = async (email: string) => {
  if (!auth) return;
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "auth/reset");
  }
};

export const saveUserAccount = async (user: User) => {
  if (!db || !user.uid) return;
  const path = "users";
  try {
    const userRef = doc(db, path, user.uid);
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserAccount = async (identifier: string): Promise<any | null> => {
  if (!db) return null;
  const path = "users";
  try {
    const userRef = doc(db, path, identifier);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) return userDoc.data();
    
    const q = query(collection(db, path), where("username", "==", identifier), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) return querySnapshot.docs[0].data();
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

// --- GESTIÓN DE GRUPOS PRIVADOS ---

export const saveCloudGroup = async (group: PrivateGroup) => {
  if (!db) return;
  const path = "groups";
  try {
    const memberEmails = group.members.map(m => m.email).filter(Boolean);
    const groupRef = doc(db, path, group.id);
    await setDoc(groupRef, {
      ...group,
      memberEmails,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserCloudGroups = async (userEmail: string): Promise<PrivateGroup[]> => {
  if (!db) return [];
  const path = "groups";
  try {
    const q = query(collection(db, path), where("memberEmails", "array-contains", userEmail));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as PrivateGroup);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

// --- GESTIÓN DE PARTIDOS Y PREDICCIONES ---

export const updateMatchResult = async (matchId: string, homeScore: number, awayScore: number) => {
  if (!db) return;
  const path = "matches";
  try {
    const matchRef = doc(db, path, matchId);
    await setDoc(matchRef, {
      actualHomeScore: homeScore,
      actualAwayScore: awayScore,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${matchId}`);
  }
};

export const deleteMatchResult = async (matchId: string) => {
  if (!db) return;
  const path = "matches";
  try {
    const matchRef = doc(db, path, matchId);
    await deleteDoc(matchRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${matchId}`);
  }
};

export const saveUserPrediction = async (userId: string, matchId: string, homeScore: number, awayScore: number) => {
  if (!db) return;
  const path = "predictions";
  try {
    const predictionRef = doc(db, path, `${userId}_${matchId}`);
    await setDoc(predictionRef, {
      userId,
      matchId,
      homeScore,
      awayScore,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserPredictions = async (userId: string) => {
  if (!db) return [];
  const path = "predictions";
  try {
    const q = query(collection(db, path), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getRealMatches = async (): Promise<Partial<Match>[]> => {
  if (!db) return [];
  const path = "matches";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // Matches might be public, but if it fails, we should know why
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

// --- GESTIÓN DE GALERÍA ---

export const getGalleryCloudData = async (): Promise<any[]> => {
  if (!db) return [];
  const path = "gallery_uploads";
  try {
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const deleteGalleryCloudImage = async (docId: string) => {
  if (!db || !docId) return;
  const path = "gallery_uploads";
  try {
    const photoRef = doc(db, path, docId);
    await deleteDoc(photoRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const addGalleryCloudImage = async (year: number, host: string, url: string, caption: string) => {
  if (!db) return;
  const path = "gallery_uploads";
  try {
    const docRef = doc(collection(db, path));
    await setDoc(docRef, {
      year,
      host,
      url,
      caption: caption || "Aporte de la comunidad",
      createdAt: new Date()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getGlobalRanking = async () => {
  if (!db) return [];
  const path = "users";
  try {
    const q = query(collection(db, path), orderBy("totalScore", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

