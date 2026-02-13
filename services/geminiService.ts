
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateValidationEmail = async (username: string, photoUrl: string) => {
  try {
    const prompt = `Redacta un correo electrónico formal pero muy entusiasta para validar el registro de un usuario en la aplicación "Prode Mundial 2026". 
    Datos del usuario:
    - Apodo: ${username}
    - Estado de foto: Recibida correctamente.
    
    El correo debe:
    1. Saludar al usuario por su apodo con mucha emoción futbolera.
    2. Confirmar que su perfil está casi listo.
    3. Indicar claramente que el código de verificación para activar su cuenta es: **2026**.
    4. Usar términos como "Saltar a la cancha", "Pitazo inicial", "Camino a la copa".
    Responde solo con el cuerpo del correo en texto plano, sin incluir el asunto ni el remitente en el texto.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    return `¡Hola, campeón! Estamos listos para el pitazo inicial. Valida tu cuenta de Prode Mundial 2026. Tu código de activación es: 2026. ¡Nos vemos en la final!`;
  }
};

export const getSportsAnalysis = async (username: string, score: number, analysisData: any[]) => {
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
