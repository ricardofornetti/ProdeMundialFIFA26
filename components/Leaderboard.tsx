import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getGlobalRanking } from '../services/firebaseService';
import { db } from '../firebase';

interface LeaderboardProps {
  user: User;
  userScore: number;
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ user, userScore, onBack }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  // Efecto para obtener el ranking real desde Firebase
  useEffect(() => {
    if (!user) return; // Guard against null user

    const fetchRanking = async () => {
      setLoadingRanking(true);
      if (db) {
        const cloudRanking = await getGlobalRanking();
        if (cloudRanking && cloudRanking.length > 0) {
          const formattedRanking = cloudRanking.map((p: any) => ({
            name: p.username,
            score: p.totalScore || 0,
            img: p.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
            current: (p.email === user.email || p.username === user.username || p.uid === user.uid),
            role: p.role || 'user'
          }));
          setPlayers(formattedRanking);
          setLoadingRanking(false);
          return;
        }
      }
      
      // Fallback local si no hay datos o no hay conexión
      setPlayers([
        { name: 'Tú', score: userScore, current: true, img: user.photoUrl, role: user.role || 'user' },
        { name: 'Santiago99', score: 14, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Santiago', role: 'user' },
        { name: 'Carli_Gol', score: 8, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla', role: 'user' },
        { name: 'Leo_Prode', score: 4, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', role: 'admin' },
      ].sort((a, b) => b.score - a.score));
      setLoadingRanking(false);
    };

    fetchRanking();
  }, [user, userScore]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/30"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Volver</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Tabla de Rankings */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-4 sm:p-10 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 dark:bg-amber-400/10 text-amber-500 dark:text-amber-400 rounded-3xl mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/5 transition-transform hover:scale-110 duration-300">
              <svg 
                className="w-8 h-8 sm:w-10 sm:h-10" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 20h18" />
                <path d="M5 20v-6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6" />
                <path d="M10 20v-10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10" />
                <path d="M15 20v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4" />
                <path d="M12.5 3l.7 1.7 1.8.3-1.3 1.3.3 1.8-1.5-1-1.5 1 .3-1.8-1.3-1.3 1.8-.3z" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <h2 className="heading-font text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">EL CAMINO A LA CIMA...</h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global - Todos los jugadores</p>
          </div>

          <div>
            {loadingRanking ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-black dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando clasificación global...</p>
              </div>
            ) : (
              <>
                {/* VISTA MOBILE: Tarjetas apiladas compactas (<640px) */}
                <div className="sm:hidden space-y-3">
                  {players.map((p, i) => (
                    <div 
                      key={`mob-${i}`} 
                      className={`flex items-center justify-between p-4 rounded-[1.75rem] transition-all border-2 ${
                        p.current 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-xl' 
                        : 'bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 border-transparent shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-xs font-black ${
                          p.current 
                          ? 'bg-white dark:bg-black text-black dark:text-white' 
                          : 'bg-white dark:bg-slate-800 text-slate-400'
                        }`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </span>
                        <img 
                          src={p.img} 
                          alt={p.name} 
                          className="w-10 h-10 rounded-full border border-white/20 object-cover shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-tight truncate">
                            {p.name}
                          </p>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            p.current 
                              ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black' 
                              : p.role === 'admin' 
                                ? 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-400' 
                                : 'bg-slate-200/55 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                          }`}>
                            {p.role === 'admin' ? 'Organizador' : 'Jugador'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-lg font-black block leading-none">{p.score}</span>
                        <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">Pts</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VISTA DESKTOP/TABLET: Tabla clásica estructurada (>=640px) */}
                <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 font-black text-slate-400 text-left text-[10px] uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/20">
                        <th className="py-4 px-5 text-center w-20">POSICIÓN</th>
                        <th className="py-4 px-5">JUGADOR</th>
                        <th className="py-4 px-5 w-40">ROL DE USUARIO</th>
                        <th className="py-4 px-5 text-right w-32">PUNTAJE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {players.map((p, i) => (
                        <tr 
                          key={`desk-${i}`}
                          className={`transition-all ${
                            p.current 
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/20 text-slate-900 dark:text-white font-semibold' 
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black ${
                              p.current 
                              ? 'bg-indigo-600 text-white' 
                              : i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                            }`}>
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={p.img} 
                                alt={p.name} 
                                className={`w-9 h-9 rounded-full object-cover shrink-0 border-2 ${p.current ? 'border-indigo-500' : 'border-transparent'}`} 
                              />
                              <span className="text-sm font-black uppercase tracking-tight truncate max-w-[200px]">
                                {p.name} {p.current && <span className="text-[10px] text-indigo-600 dark:text-indigo-400 lowercase ml-1 font-medium">(tú)</span>}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                              p.role === 'admin' 
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {p.role === 'admin' ? 'Organizador' : 'Jugador'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right font-black">
                            <div className="flex flex-col items-end leading-none">
                              <span className="text-base font-black text-slate-800 dark:text-white">{p.score}</span>
                              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Puntos</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
