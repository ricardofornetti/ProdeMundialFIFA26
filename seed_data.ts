// 1. MATCHES_SCORES (m1-m72 con scores reales para completar la Fase de Grupos)
export const MATCHES_SCORES: Record<string, { home: number; away: number }> = {
  m1: { home: 2, away: 1 }, // México vs Sudáfrica
  m2: { home: 1, away: 2 }, // República de Corea vs República Checa
  m3: { home: 2, away: 0 }, // Canadá vs Bosnia y Herzegovina
  m4: { home: 3, away: 1 }, // EE. UU. vs Paraguay
  m5: { home: 0, away: 2 }, // Catar vs Suiza
  m6: { home: 2, away: 1 }, // Brasil vs Marruecos
  m7: { home: 0, away: 1 }, // Haití vs Escocia
  m8: { home: 1, away: 1 }, // Australia vs Turquía
  m9: { home: 4, away: 0 }, // Alemania vs Curazao
  m10: { home: 2, away: 1 }, // Países Bajos vs Japón
  m11: { home: 1, away: 1 }, // Costa de Marfil vs Ecuador
  m12: { home: 1, away: 2 }, // Túnez vs Suecia
  m13: { home: 3, away: 0 }, // España vs Cabo Verde
  m14: { home: 2, away: 0 }, // Bélgica vs Egipto
  m15: { home: 1, away: 2 }, // Arabia Saudita vs Uruguay
  m16: { home: 1, away: 0 }, // Irán vs Nueva Zelanda
  m17: { home: 2, away: 1 }, // Francia vs Senegal
  m18: { home: 0, away: 2 }, // Irak vs Noruega
  m19: { home: 3, away: 0 }, // Argentina vs Argelia
  m20: { home: 2, away: 0 }, // Austria vs Jordania
  m21: { home: 2, away: 0 }, // Portugal vs RD Congo
  m22: { home: 1, away: 1 }, // Inglaterra vs Croacia
  m23: { home: 1, away: 0 }, // Ghana vs Panamá
  m24: { home: 0, away: 2 }, // Uzbekistán vs Colombia
  m25: { home: 2, away: 1 }, // República Checa vs Sudáfrica
  m26: { home: 2, away: 1 }, // Suiza vs Bosnia y Herzegovina
  m27: { home: 3, away: 1 }, // Canadá vs Catar
  m28: { home: 2, away: 1 }, // México vs República de Corea
  m29: { home: 2, away: 1 }, // EE. UU. vs Australia
  m30: { home: 1, away: 2 }, // Escocia vs Marruecos
  m31: { home: 5, away: 0 }, // Brasil vs Haití
  m32: { home: 2, away: 1 }, // Turquía vs Paraguay
  m33: { home: 1, away: 1 }, // Países Bajos vs Suecia
  m34: { home: 3, away: 1 }, // Alemania vs Costa de Marfil
  m35: { home: 2, away: 0 }, // Ecuador vs Curazao
  m36: { home: 0, away: 1 }, // Túnez vs Japón
  m37: { home: 2, away: 0 }, // España vs Arabia Saudita
  m38: { home: 1, away: 0 }, // Bélgica vs Irán
  m39: { home: 2, away: 0 }, // Uruguay vs Cabo Verde
  m40: { home: 1, away: 2 }, // Nueva Zelanda vs Egipto
  m41: { home: 2, away: 0 }, // Argentina vs Austria
  m42: { home: 4, away: 0 }, // Francia vs Irak
  m43: { home: 1, away: 1 }, // Noruega vs Senegal
  m44: { home: 1, away: 2 }, // Jordania vs Argelia
  m45: { home: 3, away: 1 }, // Portugal vs Uzbekistán
  m46: { home: 2, away: 0 }, // Inglaterra vs Ghana
  m47: { home: 0, away: 2 }, // Panamá vs Croacia
  m48: { home: 3, away: 0 }, // Colombia vs RD Congo
  m49: { home: 1, away: 1 }, // Suiza vs Canadá
  m50: { home: 2, away: 1 }, // Bosnia y Herzegovina vs Catar
  m51: { home: 0, away: 3 }, // Escocia vs Brasil
  m52: { home: 2, away: 0 }, // Marruecos vs Haití
  m53: { home: 1, away: 2 }, // República Checa vs México
  m54: { home: 1, away: 2 }, // Sudáfrica vs República de Corea
  m55: { home: 1, away: 2 }, // Curazao vs Costa de Marfil
  m56: { home: 1, away: 2 }, // Ecuador vs Alemania
  m57: { home: 1, away: 1 }, // Japón vs Suecia
  m58: { home: 1, away: 3 }, // Túnez vs Países Bajos
  m59: { home: 1, away: 2 }, // Turquía vs EE. UU.
  m60: { home: 1, away: 2 }, // Paraguay vs Australia
  m61: { home: 1, away: 2 }, // Noruega vs Francia
  m62: { home: 2, away: 0 }, // Senegal vs Irak
  m63: { home: 1, away: 2 }, // Cabo Verde vs Arabia Saudita
  m64: { home: 1, away: 1 }, // Uruguay vs España
  m65: { home: 1, away: 1 }, // Egipto vs Irán
  m66: { home: 0, away: 3 }, // Nueva Zelanda vs Bélgica
  m67: { home: 0, away: 4 }, // Panamá vs Inglaterra
  m68: { home: 2, away: 1 }, // Croacia vs Ghana
  m69: { home: 1, away: 2 }, // Colombia vs Portugal
  m70: { home: 1, away: 2 }, // RD Congo vs Uzbekistán
  m71: { home: 1, away: 2 }, // Argelia vs Austria
  m72: { home: 0, away: 4 }, // Jordania vs Argentina
};

// 2. STANDINGS_BY_GROUP (Posiciones calculadas en base a MATCHES_SCORES)
export const STANDINGS_BY_GROUP: Record<string, any[]> = {
  "Grupo A": [
    { name: "México", flag: "MX", pj: 3, g: 3, e: 0, p: 0, gf: 6, gc: 3, dg: 3, pts: 9, groupLetter: "A" },
    { name: "República Checa", flag: "CZ", pj: 3, g: 2, e: 0, p: 1, gf: 5, gc: 4, dg: 1, pts: 6, groupLetter: "A" },
    { name: "República de Corea", flag: "KR", pj: 3, g: 1, e: 0, p: 2, gf: 4, gc: 5, dg: -1, pts: 3, groupLetter: "A" },
    { name: "Sudáfrica", flag: "ZA", pj: 3, g: 0, e: 0, p: 3, gf: 3, gc: 6, dg: -3, pts: 0, groupLetter: "A" }
  ],
  "Grupo B": [
    { name: "Canadá", flag: "CA", pj: 3, g: 2, e: 1, p: 0, gf: 6, gc: 2, dg: 4, pts: 7, groupLetter: "B" },
    { name: "Suiza", flag: "CH", pj: 3, g: 2, e: 1, p: 0, gf: 5, gc: 2, dg: 3, pts: 7, groupLetter: "B" },
    { name: "Bosnia y Herzegovina", flag: "BA", pj: 3, g: 1, e: 0, p: 2, gf: 3, gc: 5, dg: -2, pts: 3, groupLetter: "B" },
    { name: "Catar", flag: "QA", pj: 3, g: 0, e: 0, p: 3, gf: 2, gc: 7, dg: -5, pts: 0, groupLetter: "B" }
  ],
  "Grupo C": [
    { name: "Brasil", flag: "BR", pj: 3, g: 3, e: 0, p: 0, gf: 10, gc: 1, dg: 9, pts: 9, groupLetter: "C" },
    { name: "Marruecos", flag: "MA", pj: 3, g: 2, e: 0, p: 1, gf: 5, gc: 3, dg: 2, pts: 6, groupLetter: "C" },
    { name: "Escocia", flag: "GB-SCT", pj: 3, g: 1, e: 0, p: 2, gf: 2, gc: 5, dg: -3, pts: 3, groupLetter: "C" },
    { name: "Haití", flag: "HT", pj: 3, g: 0, e: 0, p: 3, gf: 0, gc: 8, dg: -8, pts: 0, groupLetter: "C" }
  ],
  "Grupo D": [
    { name: "EE. UU.", flag: "US", pj: 3, g: 3, e: 0, p: 0, gf: 7, gc: 3, dg: 4, pts: 9, groupLetter: "D" },
    { name: "Australia", flag: "AU", pj: 3, g: 1, e: 1, p: 1, gf: 4, gc: 4, dg: 0, pts: 4, groupLetter: "D" },
    { name: "Turquía", flag: "TR", pj: 3, g: 1, e: 1, p: 1, gf: 4, gc: 4, dg: 0, pts: 4, groupLetter: "D" },
    { name: "Paraguay", flag: "PY", pj: 3, g: 0, e: 0, p: 3, gf: 3, gc: 7, dg: -4, pts: 0, groupLetter: "D" }
  ],
  "Grupo E": [
    { name: "Alemania", flag: "DE", pj: 3, g: 3, e: 0, p: 0, gf: 9, gc: 2, dg: 7, pts: 9, groupLetter: "E" },
    { name: "Ecuador", flag: "EC", pj: 3, g: 1, e: 1, p: 1, gf: 5, gc: 3, dg: 2, pts: 4, groupLetter: "E" },
    { name: "Costa de Marfil", flag: "CI", pj: 3, g: 1, e: 1, p: 1, gf: 4, gc: 5, dg: -1, pts: 4, groupLetter: "E" },
    { name: "Curazao", flag: "CW", pj: 3, g: 0, e: 0, p: 3, gf: 1, gc: 9, dg: -8, pts: 0, groupLetter: "E" }
  ],
  "Grupo F": [
    { name: "Países Bajos", flag: "NL", pj: 3, g: 2, e: 1, p: 0, gf: 6, gc: 3, dg: 3, pts: 7, groupLetter: "F" },
    { name: "Suecia", flag: "SE", pj: 3, g: 1, e: 2, p: 0, gf: 4, gc: 3, dg: 1, pts: 5, groupLetter: "F" },
    { name: "Japón", flag: "JP", pj: 3, g: 1, e: 1, p: 1, gf: 3, gc: 3, dg: 0, pts: 4, groupLetter: "F" },
    { name: "Túnez", flag: "TN", pj: 3, g: 0, e: 0, p: 3, gf: 2, gc: 6, dg: -4, pts: 0, groupLetter: "F" }
  ],
  "Grupo G": [
    { name: "Bélgica", flag: "BE", pj: 3, g: 3, e: 0, p: 0, gf: 6, gc: 0, dg: 6, pts: 9, groupLetter: "G" },
    { name: "Egipto", flag: "EG", pj: 3, g: 1, e: 1, p: 1, gf: 3, gc: 4, dg: -1, pts: 4, groupLetter: "G" },
    { name: "Irán", flag: "IR", pj: 3, g: 1, e: 1, p: 1, gf: 2, gc: 2, dg: 0, pts: 4, groupLetter: "G" },
    { name: "Nueva Zelanda", flag: "NZ", pj: 3, g: 0, e: 0, p: 3, gf: 1, gc: 6, dg: -5, pts: 0, groupLetter: "G" }
  ],
  "Grupo H": [
    { name: "España", flag: "ES", pj: 3, g: 2, e: 1, p: 0, gf: 6, gc: 1, dg: 5, pts: 7, groupLetter: "H" },
    { name: "Uruguay", flag: "UY", pj: 3, g: 2, e: 1, p: 0, gf: 5, gc: 2, dg: 3, pts: 7, groupLetter: "H" },
    { name: "Arabia Saudita", flag: "SA", pj: 3, g: 1, e: 0, p: 2, gf: 2, gc: 5, dg: -3, pts: 3, groupLetter: "H" },
    { name: "Cabo Verde", flag: "CV", pj: 3, g: 0, e: 0, p: 3, gf: 2, gc: 7, dg: -5, pts: 0, groupLetter: "H" }
  ],
  "Grupo I": [
    { name: "Francia", flag: "FR", pj: 3, g: 3, e: 0, p: 0, gf: 8, gc: 2, dg: 6, pts: 9, groupLetter: "I" },
    { name: "Noruega", flag: "NO", pj: 3, g: 1, e: 1, p: 1, gf: 4, gc: 3, dg: 1, pts: 4, groupLetter: "I" },
    { name: "Senegal", flag: "SN", pj: 3, g: 1, e: 1, p: 1, gf: 4, gc: 3, dg: 1, pts: 4, groupLetter: "I" },
    { name: "Irak", flag: "IQ", pj: 3, g: 0, e: 0, p: 3, gf: 0, gc: 8, dg: -8, pts: 0, groupLetter: "I" }
  ],
  "Grupo J": [
    { name: "Argentina", flag: "AR", pj: 3, g: 3, e: 0, p: 0, gf: 9, gc: 0, dg: 9, pts: 9, groupLetter: "J" },
    { name: "Austria", flag: "AT", pj: 3, g: 2, e: 0, p: 1, gf: 4, gc: 3, dg: 1, pts: 6, groupLetter: "J" },
    { name: "Argelia", flag: "DZ", pj: 3, g: 1, e: 0, p: 2, gf: 3, gc: 6, dg: -3, pts: 3, groupLetter: "J" },
    { name: "Jordania", flag: "JO", pj: 3, g: 0, e: 0, p: 3, gf: 1, gc: 9, dg: -8, pts: 0, groupLetter: "J" }
  ],
  "Grupo K": [
    { name: "Portugal", flag: "PT", pj: 3, g: 3, e: 0, p: 0, gf: 7, gc: 2, dg: 5, pts: 9, groupLetter: "K" },
    { name: "Colombia", flag: "CO", pj: 3, g: 2, e: 0, p: 1, gf: 6, gc: 2, dg: 4, pts: 6, groupLetter: "K" },
    { name: "Uzbekistán", flag: "UZ", pj: 3, g: 1, e: 0, p: 2, gf: 3, gc: 6, dg: -3, pts: 3, groupLetter: "K" },
    { name: "RD Congo", flag: "CD", pj: 3, g: 0, e: 0, p: 3, gf: 1, gc: 7, dg: -6, pts: 0, groupLetter: "K" }
  ],
  "Grupo L": [
    { name: "Inglaterra", flag: "GB-ENG", pj: 3, g: 2, e: 1, p: 0, gf: 7, gc: 1, dg: 6, pts: 7, groupLetter: "L" },
    { name: "Croacia", flag: "HR", pj: 3, g: 2, e: 1, p: 0, gf: 5, gc: 2, dg: 3, pts: 7, groupLetter: "L" },
    { name: "Ghana", flag: "GH", pj: 3, g: 1, e: 0, p: 2, gf: 2, gc: 4, dg: -2, pts: 3, groupLetter: "L" },
    { name: "Panamá", flag: "PA", pj: 3, g: 0, e: 0, p: 3, gf: 0, gc: 7, dg: -7, pts: 0, groupLetter: "L" }
  ]
};
