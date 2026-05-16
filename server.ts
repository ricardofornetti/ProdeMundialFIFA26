import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// --- SECURE SEVER-SIDE GEMINI API ENDPOINTS ---

// End point 1: Chatbot Goleador IA
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      res.status(400).json({ error: "Mensaje inválido" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Critical Security config error: GEMINI_API_KEY is not defined.");
      res.status(500).json({ error: "Error de configuración de IA en el servidor." });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Instrucción de sistema: Eres el Asistente Oficial del Prode Mundial 2026. 
              Ayuda a los usuarios con dudas del prode (Reglas: 3 pts por acertar ganador/empate, +1 pt extra por marcador exacto). 
              Conoces el fixture (México abre el 11 de junio). Eres entusiasta, futbolero y usas modismos argentinos. 
              No inventes resultados futuros, habla de predicciones. 
              Mensaje del usuario: ${message}`
            }
          ]
        }
      ]
    });

    res.json({ text: response.text || "Perdón, me quedé fuera de juego un segundo. ¿Podés repetir?" });
  } catch (error: any) {
    console.error("Error en Chatbot Server:", error);
    res.status(500).json({ error: "Error al interactuar con el analizador de IA." });
  }
});

// End point 2: Sports Predictions Analysis
app.post("/api/sports-analysis", async (req, res) => {
  try {
    const { username, score, analysisData } = req.body;
    if (!username || typeof score !== "number" || !Array.isArray(analysisData)) {
      res.status(400).json({ error: "Datos de entrada inválidos para el análisis deportivo" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Critical Security config error: GEMINI_API_KEY is not defined.");
      res.status(500).json({ error: "Error de configuración de IA en el servidor." });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Actúa como un analista deportivo experto y apasionado. 
    El usuario "${username}" ha obtenido ${score} puntos en el Prode del Mundial 2026.
    Aquí tienes el detalle de sus predicciones vs resultados reales:
    ${JSON.stringify(analysisData)}
    
    Proporciona un análisis breve (máximo 3 párrafos) que:
    1. Evalúe su puntería basándose en los puntos.
    2. Mencione algún partido específico donde acertó o falló por mucho.
    3. Le dé un consejo "técnico" para las próximas fechas.
    Usa un lenguaje muy futbolero, dinámico y motivador.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ text: response.text || "¡Buen intento! Sigue analizando los equipos, el Mundial recién empieza y tienes madera de campeón. ¡A seguir prediciendo!" });
  } catch (error: any) {
    console.error("Error en Sports Analysis Server:", error);
    res.status(500).json({ error: "Error al procesar el análisis deportivo en el servidor." });
  }
});

// Vite middleware para desarrollo / estáticos para producción
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
