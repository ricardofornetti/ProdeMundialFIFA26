import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Importar constantes de la Copa Mundial
import { WORLD_CUP_MATCHES } from "./constants";

// Importar datos estáticos compartidos
import { MATCHES_SCORES, STANDINGS_BY_GROUP } from "./seed_data";

// --- FUNCIÓN PRINCIPAL DE CARGA ---
async function run() {
  console.log("Iniciando carga de resultados de fase de grupos m1-m72 en Firestore usando Firebase Admin SDK...");

  // Inicializar Firebase Admin SDK con Application Default Credentials
  initializeApp({
    projectId: firebaseConfig.projectId
  });
  const db = getFirestore();

  // 1. Guardar cada partido con su score real en la colección 'matches'
  console.log("Actualizando scores de partidos m1 a m72...");
  const batch = db.batch();
  
  let count = 0;
  for (const [matchId, scores] of Object.entries(MATCHES_SCORES)) {
    const matchRef = db.collection("matches").doc(matchId);
    batch.set(matchRef, {
      actualHomeScore: scores.home,
      actualAwayScore: scores.away,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    count++;
  }
  
  await batch.commit();
  console.log(`¡Se actualizaron exitosamente ${count} partidos en la colección 'matches'!`);

  // 2. Recalcular puntajes de todos los usuarios registrados
  console.log("Recalculando puntajes de usuarios basados en los nuevos resultados...");
  
  // Obtener todas las predicciones
  const predictionsSnapshot = await db.collection("predictions").get();
  const userPredictions = new Map<string, any[]>();
  
  predictionsSnapshot.forEach(doc => {
    const pred = doc.data();
    if (pred.userId) {
      if (!userPredictions.has(pred.userId)) {
        userPredictions.set(pred.userId, []);
      }
      userPredictions.get(pred.userId)!.push(pred);
    }
  });

  // Obtener todos los partidos oficiales cargados de la base de datos
  const matchesSnapshot = await db.collection("matches").get();
  const dbMatchesMap = new Map<string, any>();
  matchesSnapshot.forEach(doc => {
    dbMatchesMap.set(doc.id, doc.data());
  });

  const fullMatches = WORLD_CUP_MATCHES.map(m => {
    const dbMatch = dbMatchesMap.get(m.id);
    return {
      ...m,
      actualHomeScore: dbMatch?.actualHomeScore !== undefined ? dbMatch.actualHomeScore : m.actualHomeScore,
      actualAwayScore: dbMatch?.actualAwayScore !== undefined ? dbMatch.actualAwayScore : m.actualAwayScore,
    };
  });

  // Obtener todos los usuarios
  const usersSnapshot = await db.collection("users").get();
  
  let updatedUsersCount = 0;
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data();
    const predictions = userPredictions.get(userId) || [];
    
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
          totalScore += 3; // Acierto de resultado (ganador o empate)
          if (pHome === rHome && pAway === rAway) {
            totalScore += 1; // Acierto exacto (+1 punto adicional, total 4)
          }
        }
      }
    });

    await db.collection("users").doc(userId).update({
      totalScore: totalScore,
      lastUpdate: new Date().toISOString()
    });
    
    console.log(` - Usuario ${userData.email || userId}: ${totalScore} PTS recalculados.`);
    updatedUsersCount++;
  }

  console.log(`¡Puntaje recalculado y actualizado para ${updatedUsersCount} usuarios!`);
  console.log("Carga masiva completada con éxito.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error al ejecutar el script de seed:", err);
  process.exit(1);
});
