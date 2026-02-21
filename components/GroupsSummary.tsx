import React from 'react';
import { TEAM_FLAGS } from '../constants';
import { Match } from '../types';

interface TeamStats {
  name: string;
  flag: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

interface GroupsSummaryProps {
  groups: any[];
  matches: Match[];
  onContinue: () => void;
  onBack?: () => void;
  onCustomEdit: () => void;
}

export const GroupsSummary: React.FC<GroupsSummaryProps> = ({ groups, matches, onContinue, onBack, onCustomEdit }) => {
  
  const calculateGroupStandings = (groupName: string, teams: string[], flags: string[]): TeamStats[] => {
    // Inicializar estadísticas para cada equipo del grupo
    const standings: Record<string, TeamStats> = {};
    teams.forEach((team, idx) => {
      standings[team] = {
        name: team,
        flag: flags[idx],
        pj: 0, g: 0, e: 0, p: 0,
        gf: 0, gc: 0, dg: 0, pts: 0
      };
    });

    // Filtrar partidos que pertenecen a este grupo y tienen resultado cargado
    const groupMatches = matches.filter(m => 
      m.group.includes(groupName) && 
      m.actualHomeScore !== undefined && 
      m.actualAwayScore !== undefined
    );

    groupMatches.forEach(match => {
      const hScore = match.actualHomeScore!;
      const aScore = match.actualAwayScore!;
      const hTeam = match.homeTeam;
      const aTeam = match.awayTeam;

      // Asegurarse de que el equipo exista en nuestro objeto de estadísticas
      if (standings[hTeam] && standings[aTeam]) {
        standings[hTeam].pj += 1;
        standings[aTeam].pj += 1;
        standings[hTeam].gf += hScore;
        standings[hTeam].gc += aScore;
        standings[aTeam].gf += aScore;
        standings[aTeam].gc += hScore;

        if (hScore > aScore) {
          standings[hTeam].g += 1;
          standings[hTeam].pts += 3;
          standings[aTeam].p += 1;
        } else if (hScore < aScore) {
          standings[aTeam].g += 1;
          standings[aTeam].pts += 3;
          standings[hTeam].p += 1;
        } else {
          standings[hTeam].e += 1;
          standings[aTeam].e += 1;
          standings[hTeam].pts += 1;
          standings[aTeam].pts += 1;
        }
      }
    });

    // Calcular DG y convertir a array
    return Object.values(standings).map(s => ({
      ...s,
      dg: s.gf - s.gc
    })).sort((a, b) => {
      // Ordenar por Puntos -> DG -> GF
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6 border-b-4 border-black dark:border-white pb-6">
        <div>
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-3 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-xs sm:text-sm uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl transition-all active:scale-95 mb-6"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Volver</span>
            </button>
          )}
          <h2 className="heading-font text-4xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter italic">Clasificación</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tablas de posiciones actualizadas en tiempo real</p>
        </div>
        
        <button 
          onClick={onCustomEdit}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          Personalizar Grupos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {groups.map((group, idx) => {
          const stats = calculateGroupStandings(group.name, group.teams, group.flags);
          return (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-xl italic">{group.name}</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipo</th>
                      <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase text-center">PJ</th>
                      <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase text-center">G</th>
                      <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase text-center">E</th>
                      <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase text-center">P</th>
                      <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase text-center">GF</th>
                      <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase text-center">GC</th>
                      <th className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase text-center">DG</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-900 dark:text-white uppercase text-center bg-slate-100 dark:bg-slate-700">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {stats.map((team, tIdx) => (
                      <tr key={tIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <span className={`text-[10px] font-black w-4 ${tIdx < 2 ? 'text-green-500' : 'text-slate-300'}`}>{tIdx + 1}</span>
                          <div className="w-8 h-5 overflow-hidden rounded shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0">
                            <img src={TEAM_FLAGS[team.flag] || TEAM_FLAGS['FIFA']} alt={team.name} className="w-full h-full object-cover" />
                          </div>
                          <span className={`text-[11px] font-black uppercase ${team.flag === 'FIFA' ? 'text-slate-300 italic' : 'text-slate-800 dark:text-slate-100'}`}>
                            {team.name}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-[11px] font-bold text-slate-500 text-center">{team.pj}</td>
                        <td className="px-3 py-4 text-[11px] font-bold text-slate-500 text-center">{team.g}</td>
                        <td className="px-3 py-4 text-[11px] font-bold text-slate-500 text-center">{team.e}</td>
                        <td className="px-3 py-4 text-[11px] font-bold text-slate-500 text-center">{team.p}</td>
                        <td className="px-3 py-4 text-[11px] font-bold text-slate-500 text-center">{team.gf}</td>
                        <td className="px-3 py-4 text-[11px] font-bold text-slate-500 text-center">{team.gc}</td>
                        <td className={`px-3 py-4 text-[11px] font-bold text-center ${team.dg > 0 ? 'text-green-600' : team.dg < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {team.dg > 0 ? `+${team.dg}` : team.dg}
                        </td>
                        <td className="px-6 py-4 text-[13px] font-black text-slate-900 dark:text-white text-center bg-slate-50/50 dark:bg-slate-700/50">{team.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Zona de Clasificación</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};