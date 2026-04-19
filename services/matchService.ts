
import { Match } from '../types';

/**
 * Determina si un partido está bloqueado para predicciones.
 * El bloqueo ocurre 15 minutos antes del inicio del partido (HS ARG).
 */
export const isMatchLocked = (match: Match): boolean => {
  if (!match.date || !match.time) return false;
  
  // Si el partido ya tiene resultado real, está bloqueado
  if (match.actualHomeScore !== undefined || match.actualAwayScore !== undefined) {
    return true;
  }

  try {
    // El formato en constants.ts es '11 Jun 2026' y '16:00'
    const monthMap: Record<string, string> = {
      'Jun': '06',
      'Jul': '07'
    };

    const parts = match.date.split(' ');
    if (parts.length < 3) return false;
    
    const day = parts[0].padStart(2, '0');
    const month = monthMap[parts[1]] || '06';
    const year = parts[2];
    
    // Construimos ISO string con el offset de Argentina (GMT-3)
    // Esto asegura que la comparación sea correcta independientemente de dónde esté el servidor/cliente
    const isoString = `${year}-${month}-${day}T${match.time}:00-03:00`;
    const matchTime = new Date(isoString).getTime();
    const now = Date.now();
    
    // Bloqueado si faltan menos de 15 minutos para el inicio
    const lockDeadline = matchTime - (15 * 60 * 1000);
    
    return now > lockDeadline;
  } catch (e) {
    console.error("Error al calcular bloqueo del partido:", e);
    return false;
  }
};
