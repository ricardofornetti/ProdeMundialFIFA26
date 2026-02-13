
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Match, User } from "../types";

// Credenciales reales proporcionadas por el usuario
const firebaseConfig = {
  apiKey: "AIzaSyAs-UQmipJEKg94nIKffEB7b7cK-v7v6W4",
  authDomain: "mundialfifa2026-6364c.firebaseapp.com",
  projectId: "mundialfifa2026-6364c",
  storageBucket: "mundialfifa2026-6364c.firebasestorage.app",
  messagingSenderId: "753999332279",
  appId: "1:753999332279:web:f31348d66ebb25c9dc5e32"
};

let db: any = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Error al inicializar Firebase. Modo local activado.", e);
}

export { db };

// --- GESTIÓN DE USUARIOS ---

// Crea o actualiza una cuenta de usuario completa
export const saveUserAccount = async (user: User) => {
  if (!db) return;
  const userRef = doc(db, "users", user.email || user.username);
  await setDoc(userRef, {
    ...user,
    updatedAt: new Date()
  }, { merge: true });
};

// Busca un usuario para el login (por email o username)
export const getUserAccount = async (identifier: string): Promise<any | null> => {
  if (!db) return null;
  
  // Intentar buscar por el ID de documento (email o username exacto)
  const userRef = doc(db, "users", identifier);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    return userDoc.data();
  }

  // Si no se encuentra, intentar buscar en el campo 'username'
  const q = query(collection(db, "users"), where("username", "==", identifier), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }

  return null;
};

// --- GESTIÓN DE PARTIDOS Y PREDICCIONES ---

export const saveUserPrediction = async (userId: string, matchId: string, homeScore: number, awayScore: number) => {
  if (!db) return;
  const predictionRef = doc(db, "predictions", `${userId}_${matchId}`);
  await setDoc(predictionRef, {
    userId,
    matchId,
    homeScore,
    awayScore,
    updatedAt: new Date()
  }, { merge: true });
};

export const getUserPredictions = async (userId: string) => {
  if (!db) return [];
  const q = query(collection(db, "predictions"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const getRealMatches = async (): Promise<Partial<Match>[]> => {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, "matches"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    return [];
  }
};

export const getGlobalRanking = async () => {
  if (!db) return [];
  try {
    const q = query(collection(db, "users"), orderBy("totalScore", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.error("Error al obtener ranking:", e);
    return [];
  }
};
