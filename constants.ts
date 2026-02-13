
import { Match } from './types';

export const WORLD_CUP_MATCHES: Match[] = [
  {
    id: 'm1',
    homeTeam: 'México',
    awayTeam: 'Italia',
    homeFlag: 'MX',
    awayFlag: 'IT',
    group: 'Grupo A',
    date: '11 Jun 2026',
    time: '21:00',
    venue: 'Estadio Azteca, CDMX',
    actualHomeScore: 2,
    actualAwayScore: 1
  },
  {
    id: 'm2',
    homeTeam: 'Canadá',
    awayTeam: 'España',
    homeFlag: 'CA',
    awayFlag: 'ES',
    group: 'Grupo B',
    date: '12 Jun 2026',
    time: '19:00',
    venue: 'BMO Field, Toronto',
    actualHomeScore: 1,
    actualAwayScore: 1
  },
  {
    id: 'm3',
    homeTeam: 'EE.UU.',
    awayTeam: 'Alemania',
    homeFlag: 'US',
    awayFlag: 'DE',
    group: 'Grupo D',
    date: '12 Jun 2026',
    time: '23:00',
    venue: 'SoFi Stadium, Inglewood'
  },
  {
    id: 'm4',
    homeTeam: 'Argentina',
    awayTeam: 'Francia',
    homeFlag: 'AR',
    awayFlag: 'FR',
    group: 'Grupo C',
    date: '13 Jun 2026',
    time: '16:00',
    venue: 'MetLife Stadium, NJ'
  },
  {
    id: 'm5',
    homeTeam: 'Brasil',
    awayTeam: 'Marruecos',
    homeFlag: 'BR',
    awayFlag: 'MA',
    group: 'Grupo E',
    date: '13 Jun 2026',
    time: '22:00',
    venue: 'AT&T Stadium, Arlington'
  },
  {
    id: 'm6',
    homeTeam: 'Uruguay',
    awayTeam: 'Japón',
    homeFlag: 'UY',
    awayFlag: 'JP',
    group: 'Grupo F',
    date: '14 Jun 2026',
    time: '17:00',
    venue: 'Hard Rock Stadium, Miami'
  },
  {
    id: 'm7',
    homeTeam: 'Australia',
    awayTeam: 'Camerún',
    homeFlag: 'AU',
    awayFlag: 'CM',
    group: 'Grupo A',
    date: '15 Jun 2026',
    time: '18:00',
    venue: 'Levi\'s Stadium, Santa Clara'
  },
  // Knockout Stage Placeholder Matches
  {
    id: 'k1',
    homeTeam: '1° Grupo A',
    awayTeam: '3° Grupo C/D/E',
    homeFlag: 'FIFA',
    awayFlag: 'FIFA',
    group: 'Dieciseisavos',
    date: '28 Jun 2026',
    time: '15:00',
    venue: 'SoFi Stadium, Inglewood'
  },
  {
    id: 'k2',
    homeTeam: 'Ganador K1',
    awayTeam: 'Ganador K2',
    homeFlag: 'FIFA',
    awayFlag: 'FIFA',
    group: 'Octavos',
    date: '04 Jul 2026',
    time: '18:00',
    venue: 'MetLife Stadium, NJ'
  },
  {
    id: 'k3',
    homeTeam: 'Ganador O1',
    awayTeam: 'Ganador O2',
    homeFlag: 'FIFA',
    awayFlag: 'FIFA',
    group: 'Cuartos',
    date: '09 Jul 2026',
    time: '21:00',
    venue: 'Gillette Stadium, Foxborough'
  },
  {
    id: 'k4',
    homeTeam: 'Ganador C1',
    awayTeam: 'Ganador C2',
    homeFlag: 'FIFA',
    awayFlag: 'FIFA',
    group: 'Semifinal',
    date: '14 Jul 2026',
    time: '21:00',
    venue: 'AT&T Stadium, Arlington'
  },
  {
    id: 'k5',
    homeTeam: 'Finalista 1',
    awayTeam: 'Finalista 2',
    homeFlag: 'FIFA',
    awayFlag: 'FIFA',
    group: 'Final',
    date: '19 Jul 2026',
    time: '16:00',
    venue: 'MetLife Stadium, NJ'
  }
];

export const WORLD_CUP_GROUPS = [
  { name: 'Grupo A', teams: ['México', 'Italia', 'Australia', 'Camerún'], flags: ['MX', 'IT', 'AU', 'CM'] },
  { name: 'Grupo B', teams: ['Canadá', 'España', 'Marruecos', 'Japón'], flags: ['CA', 'ES', 'MA', 'JP'] },
  { name: 'Grupo C', teams: ['Argentina', 'Francia', 'Corea del Sur', 'Ecuador'], flags: ['AR', 'FR', 'KR', 'EC'] },
  { name: 'Grupo D', teams: ['EE.UU.', 'Alemania', 'Uruguay', 'Senegal'], flags: ['US', 'DE', 'UY', 'SN'] },
  { name: 'Grupo E', teams: ['Brasil', 'Países Bajos', 'Nigeria', 'Arabia Saudita'], flags: ['BR', 'NL', 'NG', 'SA'] },
  { name: 'Grupo F', teams: ['Portugal', 'Bélgica', 'Colombia', 'Irán'], flags: ['PT', 'BE', 'CO', 'IR'] },
  { name: 'Grupo G', teams: ['Inglaterra', 'Croacia', 'Egipto', 'Canadá'], flags: ['GB-ENG', 'HR', 'EG', 'CA'] },
  { name: 'Grupo H', teams: ['Dinamarca', 'Suiza', 'Ghana', 'Qatar'], flags: ['DK', 'CH', 'GH', 'QA'] },
];

export const KNOCKOUT_PHASES = [
  { name: 'Dieciseisavos', label: '16avos de Final', iconType: 'layers' },
  { name: 'Octavos', label: 'Octavos de Final', iconType: 'bracket' },
  { name: 'Cuartos', label: 'Cuartos de Final', iconType: 'shield' },
  { name: 'Semifinal', label: 'Semifinales', iconType: 'bolt' },
  { name: 'Final', label: 'Gran Final', iconType: 'trophy' }
];

export const TEAM_FLAGS: Record<string, string> = {
  MX: 'https://flagcdn.com/mx.svg',
  CA: 'https://flagcdn.com/ca.svg',
  US: 'https://flagcdn.com/us.svg',
  AR: 'https://flagcdn.com/ar.svg',
  BR: 'https://flagcdn.com/br.svg',
  ES: 'https://flagcdn.com/es.svg',
  DE: 'https://flagcdn.com/de.svg',
  UY: 'https://flagcdn.com/uy.svg',
  FR: 'https://flagcdn.com/fr.svg',
  IT: 'https://flagcdn.com/it.svg',
  MA: 'https://flagcdn.com/ma.svg',
  JP: 'https://flagcdn.com/jp.svg',
  KR: 'https://flagcdn.com/kr.svg',
  AU: 'https://flagcdn.com/au.svg',
  CM: 'https://flagcdn.com/cm.svg',
  EC: 'https://flagcdn.com/ec.svg',
  SN: 'https://flagcdn.com/sn.svg',
  NL: 'https://flagcdn.com/nl.svg',
  NG: 'https://flagcdn.com/ng.svg',
  SA: 'https://flagcdn.com/sa.svg',
  PT: 'https://flagcdn.com/pt.svg',
  BE: 'https://flagcdn.com/be.svg',
  CO: 'https://flagcdn.com/co.svg',
  IR: 'https://flagcdn.com/ir.svg',
  'GB-ENG': 'https://flagcdn.com/gb-eng.svg',
  HR: 'https://flagcdn.com/hr.svg',
  EG: 'https://flagcdn.com/eg.svg',
  DK: 'https://flagcdn.com/dk.svg',
  CH: 'https://flagcdn.com/ch.svg',
  GH: 'https://flagcdn.com/gh.svg',
  QA: 'https://flagcdn.com/qa.svg',
  FIFA: 'https://upload.wikimedia.org/wikipedia/commons/4/43/FIFA_World_Cup_2026_logo.svg'
};
