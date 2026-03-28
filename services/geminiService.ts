import { GoogleGenAI } from "@google/genai";

export const getSportsAnalysis = async (username: string, score: number, analysisData: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
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
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    return "¡Buen intento! Sigue analizando los equipos, el Mundial recién empieza y tienes madera de campeón. ¡A seguir prediciendo!";
  }
};
