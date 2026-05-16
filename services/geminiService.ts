export const getSportsAnalysis = async (username: string, score: number, analysisData: any[]) => {
  try {
    const res = await fetch("/api/sports-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, score, analysisData }),
    });
    if (!res.ok) {
      throw new Error("HTTP error " + res.status);
    }
    const data = await res.json();
    return data.text || "No se pudo obtener el análisis deportivo en este momento.";
  } catch (error) {
    console.error("Error fetching sports analysis:", error);
    return "¡Buen intento! Sigue analizando los equipos, el Mundial recién empieza y tienes madera de campeón. ¡A seguir prediciendo!";
  }
};
