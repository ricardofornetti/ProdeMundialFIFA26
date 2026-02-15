
export interface User {
  username: string; // Apodo
  email: string;    // Correo electrónico
  password?: string;
  photoUrl: string;
  isVerified: boolean;
  // Puntaje total acumulado por el usuario en el prode
  totalScore?: number;
  settings?: {
    notifyResults: boolean;
    notifyMatchStart: boolean;
    theme?: 'light' | 'dark';
  };
}

export interface PrivateGroup {
  id: string;
  name: string;
  adminEmail: string;
  members: string[]; // Lista de nombres de usuario o emails
  createdAt: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  group: string;
  date: string;
  time: string;
  venue: string;
  actualHomeScore?: number;
  actualAwayScore?: number;
}

export interface Prediction {
  matchId: string;
  homeScore: number | '';
  awayScore: number | '';
}

export type AuthMode = 'login' | 'register' | 'verify' | 'forgot-password';

export type View = 'auth' | 'main-menu' | 'groups' | 'predictions' | 'leaderboard' | 'world-zones' | 'zone-detail' | 'calendar' | 'account' | 'history' | 'gallery' | 'private-groups';
