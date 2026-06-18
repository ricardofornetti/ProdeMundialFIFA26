import React, { useState } from 'react';
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
}

export const GroupsSummary: React.FC<GroupsSummaryProps> = ({ groups, matches, onContinue, onBack }) => {
  const [expandedTeamKey, setExpandedTeamKey] = useState<string | null>(null);

  const toggleExpand = (groupName: string, teamName: string) => {
    const key = `${groupName}-${teamName}`;
    setExpandedTeamKey(prev => prev === key ? null : key);
  };
  
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
              className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/30 mb-6"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Volver</span>
            </button>
          )}
          <h2 className="heading-font text-4xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter italic">Clasificación</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tablas de posiciones actualizadas en tiempo real</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {groups.map((group, idx) => {
          const stats = calculateGroupStandings(group.name, group.teams, group.flags);
          return (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-xl italic">{group.name}</h3>
              </div>
              
              {/* VISTA MOBILE COMPACTA (<640px) */}
              <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                {/* Header perfectamente alineado */}
                <div className="flex items-center px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <div className="flex-1 min-w-0 pr-2">Equipo</div>
                  <div className="w-10 text-center shrink-0">PJ</div>
                  <div className="w-12 text-center shrink-0">DG</div>
                  <div className="w-12 text-center shrink-0">Pts</div>
                  <div className="w-6 shrink-0"></div>
                </div>

                {stats.map((team, tIdx) => {
                  const isExpanded = expandedTeamKey === `${group.name}-${team.name}`;
                  const isClassified = tIdx < 2;
                  return (
                    <div key={tIdx} className="flex flex-col">
                      <button 
                        onClick={() => toggleExpand(group.name, team.name)}
                        className="w-full flex items-center px-4 py-3 min-h-[56px] text-left hover:bg-slate-50 dark:hover:bg-slate-700/10 transition-colors focus:outline-none"
                      >
                        {/* Posición, Bandera y Nombre */}
                        <div className="flex-1 flex items-center gap-2 min-w-0 pr-2">
                          <span className={`text-[10px] font-black w-4 shrink-0 text-center ${isClassified ? 'text-green-500' : 'text-slate-300'}`}>
                            {tIdx + 1}
                          </span>
                          <div className="w-6 h-4 overflow-hidden rounded shadow-xs border border-slate-100 dark:border-slate-700 shrink-0">
                            <img src={TEAM_FLAGS[team.flag] || TEAM_FLAGS['FIFA']} alt={team.name} className="w-full h-full object-cover" />
                          </div>
                          <span className={`text-[11px] font-bold uppercase truncate whitespace-nowrap min-w-0 flex-1 ${team.flag === 'FIFA' ? 'text-slate-300 italic' : 'text-slate-800 dark:text-slate-100'}`}>
                            {team.name}
                          </span>
                        </div>

                        {/* PJ */}
                        <div className="w-10 text-center shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                          {team.pj}
                        </div>

                        {/* DG */}
                        <div className={`w-12 text-center shrink-0 text-xs font-semibold tabular-nums ${team.dg > 0 ? 'text-green-600' : team.dg < 0 ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}>
                          {team.dg > 0 ? `+${team.dg}` : team.dg}
                        </div>

                        {/* PTS (Destacada) */}
                        <div className="w-12 text-center shrink-0 text-xs font-black text-slate-900 dark:text-white tabular-nums bg-slate-100 dark:bg-slate-700 px-1 py-1 rounded-md">
                          {team.pts}
                        </div>

                        {/* Chevron */}
                        <div className="w-6 flex justify-end shrink-0 text-slate-400 dark:text-slate-500">
                          <svg 
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-500' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Panel Expandido con estadísticas secundarias */}
                      {isExpanded && (
                        <div className="px-5 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100/35 dark:border-slate-700/30 animate-fade-in">
                          <div className="grid grid-cols-3 gap-2 text-center mt-2">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">PG</span>
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 tabular-nums">{team.g}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">PE</span>
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 tabular-nums">{team.e}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">PP</span>
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 tabular-nums">{team.p}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">GF</span>
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 tabular-nums">{team.gf}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">GC</span>
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 tabular-nums">{team.gc}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 font-semibold text-indigo-500">DIF</span>
                              <span className={`text-[11px] font-black tabular-nums ${team.dg > 0 ? 'text-green-600' : team.dg < 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>
                                {team.dg > 0 ? `+${team.dg}` : team.dg}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* VISTA DESKTOP COMPLETÍSIMA (>=640px) */}
              <div className="hidden sm:block overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                      <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipo</th>
                      <th className="px-3 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-16">PJ</th>
                      <th className="px-3 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-12">G</th>
                      <th className="px-3 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-12">E</th>
                      <th className="px-3 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-12">P</th>
                      <th className="px-3 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-12">GF</th>
                      <th className="px-3 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-12">GC</th>
                      <th className="px-3 py-3.5 text-[10px] font-black text-slate-400 uppercase text-center w-16">DG</th>
                      <th className="px-6 py-3.5 text-[10px] font-black text-slate-900 dark:text-white uppercase text-center bg-slate-100 dark:bg-slate-700 w-20">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {stats.map((team, tIdx) => (
                      <tr key={tIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors h-14">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-[10px] font-black w-4 shrink-0 text-center ${tIdx < 2 ? 'text-green-500' : 'text-slate-300'}`}>{tIdx + 1}</span>
                            <div className="w-8 h-5 overflow-hidden rounded shadow-xs border border-slate-100 dark:border-slate-700 shrink-0">
                              <img src={TEAM_FLAGS[team.flag] || TEAM_FLAGS['FIFA']} alt={team.name} className="w-full h-full object-cover" />
                            </div>
                            <span className={`text-xs font-bold uppercase truncate whitespace-nowrap min-w-0 flex-1 ${team.flag === 'FIFA' ? 'text-slate-300 italic' : 'text-slate-800 dark:text-slate-100'}`}>
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-500 text-center tabular-nums">{team.pj}</td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-500 text-center tabular-nums">{team.g}</td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-500 text-center tabular-nums">{team.e}</td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-500 text-center tabular-nums">{team.p}</td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-500 text-center tabular-nums">{team.gf}</td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-500 text-center tabular-nums">{team.gc}</td>
                        <td className={`px-3 py-3 text-xs font-bold text-center tabular-nums ${team.dg > 0 ? 'text-green-600' : team.dg < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {team.dg > 0 ? `+${team.dg}` : team.dg}
                        </td>
                        <td className="px-6 py-3 text-xs sm:text-sm font-black text-slate-900 dark:text-white text-center bg-slate-50/50 dark:bg-slate-700/50 tabular-nums">{team.pts}</td>
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
