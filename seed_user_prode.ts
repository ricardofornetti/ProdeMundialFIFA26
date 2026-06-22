import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Importar constante de partidos de la Copa Mundial desde constants
import { WORLD_CUP_MATCHES } from "./constants";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

async function run() {
  const targetEmail = "fornettiricardo@gmail.com";
  console.log(`Buscando usuario con email: ${targetEmail}...`);

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", targetEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.error(`Error: No se encontró ningún usuario registrado con el correo ${targetEmail}.`);
    process.exit(1);
  }

  const userDoc = querySnapshot.docs[0];
  const userId = userDoc.id;
  const userData = userDoc.data();
  console.log(`Usuario encontrado: ${userData.username || "Sin Nombre"} (UID: ${userId})`);

  // Guardar la predicción para Argentina (2) vs Austria (0) (m41)
  const matchId = "m41";
  const homeScore = 2;
  const awayScore = 0;

  console.log(`Guardando predicción para el partido ${matchId}: Argentina ${homeScore} - ${awayScore} Austria...`);
  const predictionId = `${userId}_${matchId}`;
  const predictionRef = doc(db, "predictions", predictionId);

  await setDoc(predictionRef, {
    userId,
    matchId,
    homeScore,
    awayScore,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log("¡Predicción guardada exitosamente!");

  // Ahora, recalculamos su puntuación total en base a todas sus predicciones y partidos con resultados reales.
  console.log("Recalculando el puntaje del usuario...");

  // 1. Obtener todas las predicciones del usuario
  const predictionsRef = collection(db, "predictions");
  const pq = query(predictionsRef, where("userId", "==", userId));
  const pSnapshot = await getDocs(pq);

  const predictions = pSnapshot.docs.map(doc => doc.data());
  console.log(`El usuario tiene un total de ${predictions.length} predicciones cargadas.`);

  // 2. Obtener partidos oficiales de Firestore si existen, y complementar con WORLD_CUP_MATCHES de constants
  const matchesRef = collection(db, "matches");
  const matchesSnapshot = await getDocs(matchesRef);
  
  // Mapear partidos de Firestore
  const repoMatchesMap = new Map<string, any>();
  matchesSnapshot.forEach(doc => {
    repoMatchesMap.set(doc.id, doc.data());
  });

  // Unificamos partidos oficiales usando constants como fallback
  const fullMatches = WORLD_CUP_MATCHES.map(m => {
    const dbMatch = repoMatchesMap.get(m.id);
    return {
      ...m,
      actualHomeScore: dbMatch?.actualHomeScore !== undefined ? dbMatch.actualHomeScore : m.actualHomeScore,
      actualAwayScore: dbMatch?.actualAwayScore !== undefined ? dbMatch.actualAwayScore : m.actualAwayScore,
    };
  });

  // 3. Evaluar aciertos
  let totalScore = 0;
  predictions.forEach(pred => {
    const match = fullMatches.find(m => m.id === pred.matchId);
    if (!match || match.actualHomeScore === undefined || match.actualAwayScore === undefined) return;

    const pHome = Number(pred.homeScore);
    const pAway = Number(pred.awayScore);
    const rHome = Number(match.actualHomeScore);
    const rAway = Number(match.actualAwayScore);

    if (!isNaN(pHome) && !isNaN(pAway)) {
      const pResult = pHome > pAway ? "home" : pHome < pAway ? "away" : "draw";
      const rResult = rHome > rAway ? "home" : rHome < rAway ? "away" : "draw";

      if (pResult === rResult) {
        if (pHome === rHome && pAway === rAway) {
          totalScore += 3; // Marcador exacto
          console.log(`  🔥 Acierto Exacto en '${match.homeTeam} vs ${match.awayTeam}' (${pHome}-${pAway}): +3 PTS`);
        } else {
          totalScore += 1; // Solo ganador/empate
          console.log(`  ✅ Acierto de Ganador/Empate en '${match.homeTeam} vs ${match.awayTeam}' (Pred: ${pHome}-${pAway}, Real: ${rHome}-${rAway}): +1 PT`);
        }
      } else {
        console.log(`  ❌ Sin puntos en '${match.homeTeam} vs ${match.awayTeam}' (Pred: ${pHome}-${pAway}, Real: ${rHome}-${rAway})`);
      }
    }
  });

  console.log(`Nuevo puntaje total calculado: ${totalScore} PTS.`);

  // 4. Actualizar el totalScore en el documento del usuario
  await updateDoc(doc(db, "users", userId), {
    totalScore: totalScore,
    lastUpdate: new Date().toISOString()
  });

  console.log(`¡Puntaje del usuario ${targetEmail} actualizado correctamente en Firestore a ${totalScore} PTS!`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Error al ejecutar el script de seed:", err);
  process.exit(1);
});
