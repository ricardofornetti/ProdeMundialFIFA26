import { Match } from './types';

// Definición exhaustiva del fixture para el Mundial 2026 basado en el calendario oficial proporcionado
export const WORLD_CUP_MATCHES: Match[] = [
  // --- JUEVES 11 JUNIO ---
  { id: 'm1', homeTeam: 'México', awayTeam: 'Sudáfrica', homeFlag: 'MX', awayFlag: 'ZA', group: 'Primera Fase • Grupo A', date: '11 Jun 2026', time: '16:00', venue: 'Estadio Ciudad de México, Ciudad de México' },
  { id: 'm2', homeTeam: 'República de Corea', awayTeam: 'DEN/MKD/CZE/IRL', homeFlag: 'KR', awayFlag: 'FIFA', group: 'Primera Fase • Grupo A', date: '11 Jun 2026', time: '23:00', venue: 'Estadio Guadalajara, Guadalajara' },
  
  // --- VIERNES 12 JUNIO ---
  { id: 'm3', homeTeam: 'Canadá', awayTeam: 'ITA/NIR/WAL/BIH', homeFlag: 'CA', awayFlag: 'FIFA', group: 'Primera Fase • Grupo B', date: '12 Jun 2026', time: '16:00', venue: 'Estadio de Toronto, Toronto' },
  { id: 'm4', homeTeam: 'EE. UU.', awayTeam: 'Paraguay', homeFlag: 'US', awayFlag: 'PY', group: 'Primera Fase • Grupo D', date: '12 Jun 2026', time: '22:00', venue: 'Estadio Los Angeles, Los Ángeles' },
  
  // --- SÁBADO 13 JUNIO ---
  { id: 'm5', homeTeam: 'Catar', awayTeam: 'Suiza', homeFlag: 'QA', awayFlag: 'CH', group: 'Primera Fase • Grupo B', date: '13 Jun 2026', time: '16:00', venue: 'Estadio de la Bahía de San Francisco, Área de la Bahía de San Francisco' },
  { id: 'm6', homeTeam: 'Brasil', awayTeam: 'Marruecos', homeFlag: 'BR', awayFlag: 'MA', group: 'Primera Fase • Grupo C', date: '13 Jun 2026', time: '19:00', venue: 'Estadio Nueva York/Nueva Jersey, Nueva York' },
  { id: 'm7', homeTeam: 'Haití', awayTeam: 'Escocia', homeFlag: 'HT', awayFlag: 'GB-SCT', group: 'Primera Fase • Grupo C', date: '13 Jun 2026', time: '22:00', venue: 'Estadio Boston, Boston' },
  
  // --- DOMINGO 14 JUNIO ---
  { id: 'm8', homeTeam: 'Australia', awayTeam: 'TUR/ROU/SVK/KOS', homeFlag: 'AU', awayFlag: 'FIFA', group: 'Primera Fase • Grupo D', date: '14 Jun 2026', time: '01:00', venue: 'Estadio BC Place Vancouver, Vancouver' },
  { id: 'm9', homeTeam: 'Alemania', awayTeam: 'Curazao', homeFlag: 'DE', awayFlag: 'CW', group: 'Primera Fase • Grupo E', date: '14 Jun 2026', time: '14:00', venue: 'Estadio Houston, Houston' },
  { id: 'm10', homeTeam: 'Países Bajos', awayTeam: 'Japón', homeFlag: 'NL', awayFlag: 'JP', group: 'Primera Fase • Grupo F', date: '14 Jun 2026', time: '17:00', venue: 'Estadio Dallas, Dallas' },
  { id: 'm11', homeTeam: 'Costa de Marfil', awayTeam: 'Ecuador', homeFlag: 'CI', awayFlag: 'EC', group: 'Primera Fase • Grupo E', date: '14 Jun 2026', time: '20:00', venue: 'Estadio Filadelfia, Filadelfia' },
  { id: 'm12', homeTeam: 'UKR/SWE/POL/ALB', awayTeam: 'Túnez', homeFlag: 'FIFA', awayFlag: 'TN', group: 'Primera Fase • Grupo F', date: '14 Jun 2026', time: '23:00', venue: 'Estadio Monterrey, Monterrey' },
  
  // --- LUNES 15 JUNIO ---
  { id: 'm13', homeTeam: 'España', awayTeam: 'Islas de Cabo Verde', homeFlag: 'ES', awayFlag: 'CV', group: 'Primera Fase • Grupo H', date: '15 Jun 2026', time: '13:00', venue: 'Estadio Atlanta, Atlanta' },
  { id: 'm14', homeTeam: 'Bélgica', awayTeam: 'Egipto', homeFlag: 'BE', awayFlag: 'EG', group: 'Primera Fase • Grupo G', date: '15 Jun 2026', time: '16:00', venue: 'Estadio de Seattle, Seattle' },
  { id: 'm15', homeTeam: 'Arabia Saudí', awayTeam: 'Uruguay', homeFlag: 'SA', awayFlag: 'UY', group: 'Primera Fase • Grupo H', date: '15 Jun 2026', time: '19:00', venue: 'Estadio Miami, Miami' },
  { id: 'm16', homeTeam: 'RI de Irán', awayTeam: 'Nueva Zelanda', homeFlag: 'IR', awayFlag: 'NZ', group: 'Primera Fase • Grupo G', date: '15 Jun 2026', time: '22:00', venue: 'Estadio Los Angeles, Los Ángeles' },
  
  // --- MARTES 16 JUNIO ---
  { id: 'm17', homeTeam: 'Francia', awayTeam: 'Senegal', homeFlag: 'FR', awayFlag: 'SN', group: 'Primera Fase • Grupo I', date: '16 Jun 2026', time: '16:00', venue: 'Estadio Nueva York/Nueva Jersey, Nueva York' },
  { id: 'm18', homeTeam: 'BOL/SUR/IRQ', awayTeam: 'Noruega', homeFlag: 'FIFA', awayFlag: 'NO', group: 'Primera Fase • Grupo I', date: '16 Jun 2026', time: '19:00', venue: 'Estadio Boston, Boston' },
  { id: 'm19', homeTeam: 'Argentina', awayTeam: 'Argelia', homeFlag: 'AR', awayFlag: 'DZ', group: 'Primera Fase • Grupo J', date: '16 Jun 2026', time: '22:00', venue: 'Estadio Kansas City, Kansas City' },
  
  // --- MIÉRCOLES 17 JUNIO ---
  { id: 'm20', homeTeam: 'Austria', awayTeam: 'Jordania', homeFlag: 'AT', awayFlag: 'JO', group: 'Primera Fase • Grupo J', date: '17 Jun 2026', time: '01:00', venue: 'Estadio de la Bahía de San Francisco, Área de la Bahía de San Francisco' },
  { id: 'm21', homeTeam: 'Portugal', awayTeam: 'NCL/JAM/COD', homeFlag: 'PT', awayFlag: 'FIFA', group: 'Primera Fase • Grupo K', date: '17 Jun 2026', time: '14:00', venue: 'Estadio Houston, Houston' },
  { id: 'm22', homeTeam: 'Inglaterra', awayTeam: 'Croacia', homeFlag: 'GB-ENG', awayFlag: 'HR', group: 'Primera Fase • Grupo L', date: '17 Jun 2026', time: '17:00', venue: 'Estadio Dallas, Dallas' },
  { id: 'm23', homeTeam: 'Ghana', awayTeam: 'Panamá', homeFlag: 'GH', awayFlag: 'PA', group: 'Primera Fase • Grupo L', date: '17 Jun 2026', time: '20:00', venue: 'Estadio de Toronto, Toronto' },
  { id: 'm24', homeTeam: 'Uzbekistán', awayTeam: 'Colombia', homeFlag: 'UZ', awayFlag: 'CO', group: 'Primera Fase • Grupo K', date: '17 Jun 2026', time: '23:00', venue: 'Estadio Ciudad de México, Ciudad de México' },
  
  // --- JUEVES 18 JUNIO ---
  { id: 'm25', homeTeam: 'DEN/MKD/CZE/IRL', awayTeam: 'Sudáfrica', homeFlag: 'FIFA', awayFlag: 'ZA', group: 'Primera Fase • Grupo A', date: '18 Jun 2026', time: '13:00', venue: 'Estadio Atlanta, Atlanta' },
  { id: 'm26', homeTeam: 'Suiza', awayTeam: 'ITA/NIR/WAL/BIH', homeFlag: 'CH', awayFlag: 'FIFA', group: 'Primera Fase • Grupo B', date: '18 Jun 2026', time: '16:00', venue: 'Estadio Los Angeles, Los Ángeles' },
  { id: 'm27', homeTeam: 'Canadá', awayTeam: 'Catar', homeFlag: 'CA', awayFlag: 'QA', group: 'Primera Fase • Grupo B', date: '18 Jun 2026', time: '19:00', venue: 'Estadio BC Place Vancouver, Vancouver' },
  { id: 'm28', homeTeam: 'México', awayTeam: 'República de Corea', homeFlag: 'MX', awayFlag: 'KR', group: 'Primera Fase • Grupo A', date: '18 Jun 2026', time: '22:00', venue: 'Estadio Guadalajara, Guadalajara' },
  
  // --- VIERNES 19 JUNIO ---
  { id: 'm29', homeTeam: 'EE. UU.', awayTeam: 'Australia', homeFlag: 'US', awayFlag: 'AU', group: 'Primera Fase • Grupo D', date: '19 Jun 2026', time: '16:00', venue: 'Estadio de Seattle, Seattle' },
  { id: 'm30', homeTeam: 'Escocia', awayTeam: 'Marruecos', homeFlag: 'GB-SCT', awayFlag: 'MA', group: 'Primera Fase • Grupo C', date: '19 Jun 2026', time: '19:00', venue: 'Estadio Boston, Boston' },
  { id: 'm31', homeTeam: 'Brasil', awayTeam: 'Haití', homeFlag: 'BR', awayFlag: 'HT', group: 'Primera Fase • Grupo C', date: '19 Jun 2026', time: '22:00', venue: 'Estadio Filadelfia, Filadelfia' },
  
  // --- SÁBADO 20 JUNIO ---
  { id: 'm32', homeTeam: 'TUR/ROU/SVK/KOS', awayTeam: 'Paraguay', homeFlag: 'FIFA', awayFlag: 'PY', group: 'Primera Fase • Grupo D', date: '20 Jun 2026', time: '01:00', venue: 'Estadio de la Bahía de San Francisco, Área de la Bahía de San Francisco' },
  { id: 'm33', homeTeam: 'Países Bajos', awayTeam: 'UKR/SWE/POL/ALB', homeFlag: 'NL', awayFlag: 'FIFA', group: 'Primera Fase • Grupo F', date: '20 Jun 2026', time: '14:00', venue: 'Estadio Houston, Houston' },
  { id: 'm34', homeTeam: 'Alemania', awayTeam: 'Costa de Marfil', homeFlag: 'DE', awayFlag: 'CI', group: 'Primera Fase • Grupo E', date: '20 Jun 2026', time: '17:00', venue: 'Estadio de Toronto, Toronto' },
  { id: 'm35', homeTeam: 'Ecuador', awayTeam: 'Curazao', homeFlag: 'EC', awayFlag: 'CW', group: 'Primera Fase • Grupo E', date: '20 Jun 2026', time: '21:00', venue: 'Estadio Kansas City, Kansas City' },
  
  // --- DOMINGO 21 JUNIO ---
  { id: 'm36', homeTeam: 'Túnez', awayTeam: 'Japón', homeFlag: 'TN', awayFlag: 'JP', group: 'Primera Fase • Grupo F', date: '21 Jun 2026', time: '01:00', venue: 'Estadio Monterrey, Monterrey' },
  { id: 'm37', homeTeam: 'España', awayTeam: 'Arabia Saudí', homeFlag: 'ES', awayFlag: 'SA', group: 'Primera Fase • Grupo H', date: '21 Jun 2026', time: '13:00', venue: 'Estadio Atlanta, Atlanta' },
  { id: 'm38', homeTeam: 'Bélgica', awayTeam: 'RI de Irán', homeFlag: 'BE', awayFlag: 'IR', group: 'Primera Fase • Grupo G', date: '21 Jun 2026', time: '16:00', venue: 'Estadio Los Angeles, Los Ángeles' },
  { id: 'm39', homeTeam: 'Uruguay', awayTeam: 'Islas de Cabo Verde', homeFlag: 'UY', awayFlag: 'CV', group: 'Primera Fase • Grupo H', date: '21 Jun 2026', time: '19:00', venue: 'Estadio Miami, Miami' },
  { id: 'm40', homeTeam: 'Nueva Zelanda', awayTeam: 'Egipto', homeFlag: 'NZ', awayFlag: 'EG', group: 'Primera Fase • Grupo G', date: '21 Jun 2026', time: '22:00', venue: 'Estadio BC Place Vancouver, Vancouver' },
  
  // --- LUNES 22 JUNIO ---
  { id: 'm41', homeTeam: 'Argentina', awayTeam: 'Austria', homeFlag: 'AR', awayFlag: 'AT', group: 'Primera Fase • Grupo J', date: '22 Jun 2026', time: '14:00', venue: 'Estadio Dallas, Dallas' },
  { id: 'm42', homeTeam: 'Francia', awayTeam: 'BOL/SUR/IRQ', homeFlag: 'FR', awayFlag: 'FIFA', group: 'Primera Fase • Grupo I', date: '22 Jun 2026', time: '18:00', venue: 'Estadio Filadelfia, Filadelfia' },
  { id: 'm43', homeTeam: 'Noruega', awayTeam: 'Senegal', homeFlag: 'NO', awayFlag: 'SN', group: 'Primera Fase • Grupo I', date: '22 Jun 2026', time: '21:00', venue: 'Estadio Nueva York/Nueva Jersey, Nueva York' },
  
  // --- MARTES 23 JUNIO ---
  { id: 'm44', homeTeam: 'Jordania', awayTeam: 'Argelia', homeFlag: 'JO', awayFlag: 'DZ', group: 'Primera Fase • Grupo J', date: '23 Jun 2026', time: '00:00', venue: 'Estadio de la Bahía de San Francisco, Área de la Bahía de San Francisco' },
  { id: 'm45', homeTeam: 'Portugal', awayTeam: 'Uzbekistán', homeFlag: 'PT', awayFlag: 'UZ', group: 'Primera Fase • Grupo K', date: '23 Jun 2026', time: '14:00', venue: 'Estadio Houston, Houston' },
  { id: 'm46', homeTeam: 'Inglaterra', awayTeam: 'Ghana', homeFlag: 'GB-ENG', awayFlag: 'GH', group: 'Primera Fase • Grupo L', date: '23 Jun 2026', time: '17:00', venue: 'Estadio Boston, Boston' },
  { id: 'm47', homeTeam: 'Panamá', awayTeam: 'Croacia', homeFlag: 'PA', awayFlag: 'HR', group: 'Primera Fase • Grupo L', date: '23 Jun 2026', time: '20:00', venue: 'Estadio de Toronto, Toronto' },
  { id: 'm48', homeTeam: 'Colombia', awayTeam: 'NCL/JAM/COD', homeFlag: 'CO', awayFlag: 'FIFA', group: 'Primera Fase • Grupo K', date: '23 Jun 2026', time: '23:00', venue: 'Estadio Guadalajara, Guadalajara' },
  
  // --- MIÉRCOLES 24 JUNIO ---
  { id: 'm49', homeTeam: 'Suiza', awayTeam: 'Canadá', homeFlag: 'CH', awayFlag: 'CA', group: 'Primera Fase • Grupo B', date: '24 Jun 2026', time: '16:00', venue: 'Estadio BC Place Vancouver, Vancouver' },
  { id: 'm50', homeTeam: 'ITA/NIR/WAL/BIH', awayTeam: 'Catar', homeFlag: 'FIFA', awayFlag: 'QA', group: 'Primera Fase • Grupo B', date: '24 Jun 2026', time: '16:00', venue: 'Estadio de Seattle, Seattle' },
  { id: 'm51', homeTeam: 'Escocia', awayTeam: 'Brasil', homeFlag: 'GB-SCT', awayFlag: 'BR', group: 'Primera Fase • Grupo C', date: '24 Jun 2026', time: '19:00', venue: 'Estadio Miami, Miami' },
  { id: 'm52', homeTeam: 'Marruecos', awayTeam: 'Haití', homeFlag: 'MA', awayFlag: 'HT', group: 'Primera Fase • Grupo C', date: '24 Jun 2026', time: '19:00', venue: 'Estadio Atlanta, Atlanta' },
  { id: 'm53', homeTeam: 'DEN/MKD/CZE/IRL', awayTeam: 'México', homeFlag: 'FIFA', awayFlag: 'MX', group: 'Primera Fase • Grupo A', date: '24 Jun 2026', time: '22:00', venue: 'Estadio Ciudad de México, Ciudad de México' },
  { id: 'm54', homeTeam: 'Sudáfrica', awayTeam: 'República de Corea', homeFlag: 'ZA', awayFlag: 'KR', group: 'Primera Fase • Grupo A', date: '24 Jun 2026', time: '22:00', venue: 'Estadio Monterrey, Monterrey' },
  
  // --- JUEVES 25 JUNIO ---
  { id: 'm55', homeTeam: 'Curazao', awayTeam: 'Costa de Marfil', homeFlag: 'CW', awayFlag: 'CI', group: 'Primera Fase • Grupo E', date: '25 Jun 2026', time: '17:00', venue: 'Estadio Filadelfia, Filadelfia' },
  { id: 'm56', homeTeam: 'Ecuador', awayTeam: 'Alemania', homeFlag: 'EC', awayFlag: 'DE', group: 'Primera Fase • Grupo E', date: '25 Jun 2026', time: '17:00', venue: 'Estadio Nueva York/Nueva Jersey, Nueva York' },
  { id: 'm57', homeTeam: 'Japón', awayTeam: 'UKR/SWE/POL/ALB', homeFlag: 'JP', awayFlag: 'FIFA', group: 'Primera Fase • Grupo F', date: '25 Jun 2026', time: '20:00', venue: 'Estadio Dallas, Dallas' },
  { id: 'm58', homeTeam: 'Túnez', awayTeam: 'Países Bajos', homeFlag: 'TN', awayFlag: 'NL', group: 'Primera Fase • Grupo F', date: '25 Jun 2026', time: '20:00', venue: 'Estadio Kansas City, Kansas City' },
  { id: 'm59', homeTeam: 'TUR/ROU/SVK/KOS', awayTeam: 'EE. UU.', homeFlag: 'FIFA', awayFlag: 'US', group: 'Primera Fase • Grupo D', date: '25 Jun 2026', time: '23:00', venue: 'Estadio Los Angeles, Los Ángeles' },
  { id: 'm60', homeTeam: 'Paraguay', awayTeam: 'Australia', homeFlag: 'PY', awayFlag: 'AU', group: 'Primera Fase • Grupo D', date: '25 Jun 2026', time: '23:00', venue: 'Estadio de la Bahía de San Francisco, Área de la Bahía de San Francisco' },
  
  // --- VIERNES 26 JUNIO ---
  { id: 'm61', homeTeam: 'Noruega', awayTeam: 'Francia', homeFlag: 'NO', awayFlag: 'FR', group: 'Primera Fase • Grupo I', date: '26 Jun 2026', time: '16:00', venue: 'Estadio Boston, Boston' },
  { id: 'm62', homeTeam: 'Senegal', awayTeam: 'BOL/SUR/IRQ', homeFlag: 'SN', awayFlag: 'FIFA', group: 'Primera Fase • Grupo I', date: '26 Jun 2026', time: '16:00', venue: 'Estadio de Toronto, Toronto' },
  { id: 'm63', homeTeam: 'Islas de Cabo Verde', awayTeam: 'Arabia Saudí', homeFlag: 'CV', awayFlag: 'SA', group: 'Primera Fase • Grupo H', date: '26 Jun 2026', time: '21:00', venue: 'Estadio Houston, Houston' },
  { id: 'm64', homeTeam: 'Uruguay', awayTeam: 'España', homeFlag: 'UY', awayFlag: 'ES', group: 'Primera Fase • Grupo H', date: '26 Jun 2026', time: '21:00', venue: 'Estadio Guadalajara, Guadalajara' },
  
  // --- SÁBADO 27 JUNIO ---
  { id: 'm65', homeTeam: 'Egipto', awayTeam: 'RI de Irán', homeFlag: 'EG', awayFlag: 'IR', group: 'Primera Fase • Grupo G', date: '27 Jun 2026', time: '00:00', venue: 'Estadio de Seattle, Seattle' },
  { id: 'm66', homeTeam: 'Nueva Zelanda', awayTeam: 'Bélgica', homeFlag: 'NZ', awayFlag: 'BE', group: 'Primera Fase • Grupo G', date: '27 Jun 2026', time: '00:00', venue: 'Estadio BC Place Vancouver, Vancouver' },
  { id: 'm67', homeTeam: 'Panamá', awayTeam: 'Inglaterra', homeFlag: 'PA', awayFlag: 'GB-ENG', group: 'Primera Fase • Grupo L', date: '27 Jun 2026', time: '18:00', venue: 'Estadio Nueva York/Nueva Jersey, Nueva York' },
  { id: 'm68', homeTeam: 'Croacia', awayTeam: 'Ghana', homeFlag: 'HR', awayFlag: 'GH', group: 'Primera Fase • Grupo L', date: '27 Jun 2026', time: '18:00', venue: 'Estadio Filadelfia, Filadelfia' },
  { id: 'm69', homeTeam: 'Colombia', awayTeam: 'Portugal', homeFlag: 'CO', awayFlag: 'PT', group: 'Primera Fase • Grupo K', date: '27 Jun 2026', time: '20:30', venue: 'Estadio Miami, Miami' },
  { id: 'm70', homeTeam: 'NCL/JAM/COD', awayTeam: 'Uzbekistán', homeFlag: 'FIFA', awayFlag: 'UZ', group: 'Primera Fase • Grupo K', date: '27 Jun 2026', time: '20:30', venue: 'Estadio Atlanta, Atlanta' },
  { id: 'm71', homeTeam: 'Argelia', awayTeam: 'Austria', homeFlag: 'DZ', awayFlag: 'AT', group: 'Primera Fase • Grupo J', date: '27 Jun 2026', time: '23:00', venue: 'Estadio Kansas City, Kansas City' },
  { id: 'm72', homeTeam: 'Jordania', awayTeam: 'Argentina', homeFlag: 'JO', awayFlag: 'AR', group: 'Primera Fase • Grupo J', date: '27 Jun 2026', time: '23:00', venue: 'Estadio Dallas, Dallas' },
  
  // --- ELIMINATORIAS: DIECISEISAVOS DE FINAL ---
  { id: 'm73', homeTeam: '2° Grupo A', awayTeam: '2° Grupo B', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '28 Jun 2026', time: '16:00', venue: 'Estadio Los Angeles, Los Ángeles' },
  { id: 'm74', homeTeam: '1° Grupo C', awayTeam: '2° Grupo F', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '29 Jun 2026', time: '14:00', venue: 'Estadio Houston, Houston' },
  { id: 'm75', homeTeam: '1° Grupo E', awayTeam: '3° A/B/C/D/F', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '29 Jun 2026', time: '17:30', venue: 'Estadio Boston, Boston' },
  { id: 'm76', homeTeam: '1° Grupo F', awayTeam: '2° Grupo C', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '29 Jun 2026', time: '22:00', venue: 'Estadio Monterrey, Monterrey' },
  { id: 'm77', homeTeam: '2° Grupo E', awayTeam: '2° Grupo I', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '30 Jun 2026', time: '14:00', venue: 'Estadio Dallas, Dallas' },
  { id: 'm78', homeTeam: '1° Grupo I', awayTeam: '3° C/D/F/G/H', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '30 Jun 2026', time: '18:00', venue: 'Estadio Nueva York/Nueva Jersey, Nueva York' },
  { id: 'm79', homeTeam: '1° Grupo A', awayTeam: '3° C/E/F/H/I', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '30 Jun 2026', time: '22:00', venue: 'Estadio Ciudad de México, Ciudad de México' },
  { id: 'm80', homeTeam: '1° Grupo L', awayTeam: '3° E/H/I/J/K', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '01 Jul 2026', time: '13:00', venue: 'Estadio Atlanta, Atlanta' },
  { id: 'm81', homeTeam: '1° Grupo G', awayTeam: '3° A/E/H/I/J', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '01 Jul 2026', time: '17:00', venue: 'Estadio de Seattle, Seattle' },
  { id: 'm82', homeTeam: '1° Grupo D', awayTeam: '3° B/E/F/I/J', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '01 Jul 2026', time: '21:00', venue: 'Estadio de la Bahía de San Francisco, Área de la Bahía de San Francisco' },
  { id: 'm83', homeTeam: '1° Grupo H', awayTeam: '2° Grupo J', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '02 Jul 2026', time: '16:00', venue: 'Estadio Los Angeles, Los Ángeles' },
  { id: 'm84', homeTeam: '2° Grupo K', awayTeam: '2° Grupo L', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '02 Jul 2026', time: '20:00', venue: 'Estadio de Toronto, Toronto' },
  { id: 'm85', homeTeam: '1° Grupo B', awayTeam: '3° E/F/G/I/J', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '03 Jul 2026', time: '00:00', venue: 'Estadio BC Place Vancouver, Vancouver' },
  { id: 'm86', homeTeam: '2° Grupo D', awayTeam: '2° Grupo G', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '03 Jul 2026', time: '15:00', venue: 'Estadio Dallas, Dallas' },
  { id: 'm87', homeTeam: '1° Grupo J', awayTeam: '2° Grupo H', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '03 Jul 2026', time: '19:00', venue: 'Estadio Miami, Miami' },
  { id: 'm88', homeTeam: '1° Grupo K', awayTeam: '3° D/E/I/J/L', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Dieciseisavos de Final', date: '03 Jul 2026', time: '22:30', venue: 'Estadio Kansas City, Kansas City' },

  // --- OCTAVOS DE FINAL ---
  { id: 'm89', homeTeam: 'Ganador 73', awayTeam: 'Ganador 75', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Octavos de Final', date: '04 Jul 2026', time: '14:00', venue: 'Estadio Houston, Houston' },
  { id: 'm90', homeTeam: 'Ganador 74', awayTeam: 'Ganador 77', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Octavos de Final', date: '04 Jul 2026', time: '18:00', venue: 'Estadio Filadelfia, Filadelfia' },
  { id: 'm91', homeTeam: 'Ganador 76', awayTeam: 'Ganador 78', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Octavos de Final', date: '05 Jul 2026', time: '17:00', venue: 'Estadio Nueva York/Nueva Jersey, Nueva York' },
  { id: 'm92', homeTeam: 'Ganador 79', awayTeam: 'Ganador 80', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Octavos de Final', date: '05 Jul 2026', time: '21:00', venue: 'Estadio Ciudad de México, Ciudad de México' },
  { id: 'm93', homeTeam: 'Ganador 83', awayTeam: 'Ganador 84', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Octavos de Final', date: '06 Jul 2026', time: '16:00', venue: 'Estadio Dallas, Dallas' },
  { id: 'm94', homeTeam: 'Ganador 81', awayTeam: 'Ganador 82', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Octavos de Final', date: '06 Jul 2026', time: '21:00', venue: 'Estadio de Seattle, Seattle' },
  { id: 'm95', homeTeam: 'Ganador 86', awayTeam: 'Ganador 88', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Octavos de Final', date: '07 Jul 2026', time: '13:00', venue: 'Estadio Atlanta, Atlanta' },
  { id: 'm96', homeTeam: 'Ganador 85', awayTeam: 'Ganador 87', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Octavos de Final', date: '07 Jul 2026', time: '17:00', venue: 'Estadio BC Place Vancouver, Vancouver' },

  // --- CUARTOS DE FINAL ---
  { id: 'm97', homeTeam: 'Ganador 89', awayTeam: 'Ganador 90', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Cuartos de Final', date: '09 Jul 2026', time: '17:00', venue: 'Estadio Boston, Boston' },
  { id: 'm98', homeTeam: 'Ganador 93', awayTeam: 'Ganador 94', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Cuartos de Final', date: '10 Jul 2026', time: '16:00', venue: 'Estadio Los Angeles, Los Ángeles' },
  { id: 'm99', homeTeam: 'Ganador 91', awayTeam: 'Ganador 92', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Cuartos de Final', date: '11 Jul 2026', time: '18:00', venue: 'Estadio Miami, Miami' },
  { id: 'm100', homeTeam: 'Ganador 95', awayTeam: 'Ganador 96', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Cuartos de Final', date: '11 Jul 2026', time: '22:00', venue: 'Estadio Kansas City, Kansas City' },

  // --- SEMIFINALES ---
  { id: 'm101', homeTeam: 'Ganador 97', awayTeam: 'Ganador 98', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Semifinal', date: '14 Jul 2026', time: '16:00', venue: 'Estadio Dallas, Dallas' },
  { id: 'm102', homeTeam: 'Ganador 99', awayTeam: 'Ganador 100', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Semifinal', date: '15 Jul 2026', time: '16:00', venue: 'Estadio Atlanta, Atlanta' },

  // --- TERCER PUESTO Y FINAL ---
  { id: 'm103', homeTeam: 'Perdedor 101', awayTeam: 'Perdedor 102', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Tercer Puesto', date: '18 Jul 2026', time: '18:00', venue: 'Estadio Miami, Miami' },
  { id: 'm104', homeTeam: 'Ganador 101', awayTeam: 'Ganador 102', homeFlag: 'FIFA', awayFlag: 'FIFA', group: 'Final', date: '19 Jul 2026', time: '16:00', venue: 'Estadio Nueva York/Nueva Jersey, Nueva York' }
];

export const WORLD_CUP_GROUPS = [
  { name: 'Grupo A', teams: ['México', 'Sudáfrica', 'República de Corea', 'DEN/MKD/CZE/IRL'], flags: ['MX', 'ZA', 'KR', 'FIFA'] },
  { name: 'Grupo B', teams: ['Canadá', 'Catar', 'Suiza', 'ITA/NIR/WAL/BIH'], flags: ['CA', 'QA', 'CH', 'FIFA'] },
  { name: 'Grupo C', teams: ['Brasil', 'Marruecos', 'Haití', 'Escocia'], flags: ['BR', 'MA', 'HT', 'GB-SCT'] },
  { name: 'Grupo D', teams: ['EE. UU.', 'Paraguay', 'Australia', 'TUR/ROU/SVK/KOS'], flags: ['US', 'PY', 'AU', 'FIFA'] },
  { name: 'Grupo E', teams: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'], flags: ['DE', 'CW', 'CI', 'EC'] },
  { name: 'Grupo F', teams: ['Países Bajos', 'Japón', 'Túnez', 'UKR/SWE/POL/ALB'], flags: ['NL', 'JP', 'TN', 'FIFA'] },
  { name: 'Grupo G', teams: ['Bélgica', 'Egipto', 'RI de Irán', 'Nueva Zelanda'], flags: ['BE', 'EG', 'IR', 'NZ'] },
  { name: 'Grupo H', teams: ['España', 'Islas de Cabo Verde', 'Arabia Saudí', 'Uruguay'], flags: ['ES', 'CV', 'SA', 'UY'] },
  { name: 'Grupo I', teams: ['BOL/SUR/IRQ', 'Francia', 'Senegal', 'Noruega'], flags: ['FIFA', 'FR', 'SN', 'NO'] },
  { name: 'Grupo J', teams: ['Argentina', 'Argelia', 'Austria', 'Jordania'], flags: ['AR', 'DZ', 'AT', 'JO'] },
  { name: 'Grupo K', teams: ['NCL/JAM/COD', 'Portugal', 'Uzbekistán', 'Colombia'], flags: ['FIFA', 'PT', 'UZ', 'CO'] },
  { name: 'Grupo L', teams: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'], flags: ['GB-ENG', 'HR', 'GH', 'PA'] },
];

export const KNOCKOUT_PHASES = [
  { name: 'Dieciseisavos de Final', label: '16avos de Final', iconType: 'layers' },
  { name: 'Octavos de Final', label: 'Octavos de Final', iconType: 'bracket' },
  { name: 'Cuartos de Final', label: 'Cuartos de Final', iconType: 'shield' },
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
  ZA: 'https://flagcdn.com/za.svg',
  PY: 'https://flagcdn.com/py.svg',
  HT: 'https://flagcdn.com/ht.svg',
  'GB-SCT': 'https://flagcdn.com/gb-sct.svg',
  CW: 'https://flagcdn.com/cw.svg',
  CI: 'https://flagcdn.com/ci.svg',
  TN: 'https://flagcdn.com/tn.svg',
  NZ: 'https://flagcdn.com/nz.svg',
  CV: 'https://flagcdn.com/cv.svg',
  NO: 'https://flagcdn.com/no.svg',
  DZ: 'https://flagcdn.com/dz.svg',
  AT: 'https://flagcdn.com/at.svg',
  JO: 'https://flagcdn.com/jo.svg',
  UZ: 'https://flagcdn.com/uz.svg',
  CL: 'https://flagcdn.com/cl.svg',
  PL: 'https://flagcdn.com/pl.svg',
  SE: 'https://flagcdn.com/se.svg',
  PA: 'https://flagcdn.com/pa.svg',
  HU: 'https://flagcdn.com/hu.svg',
  FIFA: 'https://upload.wikimedia.org/wikipedia/commons/4/43/FIFA_World_Cup_2026_logo.svg'
};

export const TEAM_NAMES: Record<string, string> = {
  MX: 'México',
  CA: 'Canadá',
  US: 'EE. UU.',
  AR: 'Argentina',
  BR: 'Brasil',
  ES: 'España',
  DE: 'Alemania',
  UY: 'Uruguay',
  FR: 'Francia',
  IT: 'Italia',
  MA: 'Marruecos',
  JP: 'Japón',
  KR: 'República de Corea',
  AU: 'Australia',
  CM: 'Camerún',
  EC: 'Ecuador',
  SN: 'Senegal',
  NL: 'Países Bajos',
  NG: 'Nigeria',
  SA: 'Arabia Saudí',
  PT: 'Portugal',
  BE: 'Bélgica',
  CO: 'Colombia',
  IR: 'RI de Irán',
  'GB-ENG': 'Inglaterra',
  HR: 'Croacia',
  EG: 'Egipto',
  DK: 'Dinamarca',
  CH: 'Suiza',
  GH: 'Ghana',
  QA: 'Catar',
  ZA: 'Sudáfrica',
  PY: 'Paraguay',
  HT: 'Haití',
  'GB-SCT': 'Escocia',
  CW: 'Curazao',
  CI: 'Costa de Marfil',
  TN: 'Túnez',
  NZ: 'Nueva Zelanda',
  CV: 'Islas de Cabo Verde',
  NO: 'Noruega',
  DZ: 'Argelia',
  AT: 'Austria',
  JO: 'Jordania',
  UZ: 'Uzbekistán',
  CL: 'Chile',
  PL: 'Polonia',
  SE: 'Suecia',
  PA: 'Panamá',
  HU: 'Hungría',
  FIFA: 'POR DEFINIR'
};