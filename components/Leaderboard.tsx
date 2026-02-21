
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db, getGlobalRanking } from '../services/firebaseService';

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
        if (cloudRanking.length > 0) {
          const formattedRanking = cloudRanking.map((p: any) => ({
            name: p.username,
            score: p.totalScore || 0,
            img: p.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
            current: (p.email === user.email || p.username === user.username)
          }));
          setPlayers(formattedRanking);
          setLoadingRanking(false);
          return;
        }
      }
      
      // Fallback local si no hay datos o no hay conexión
      setPlayers([
        { name: 'Tú', score: userScore, current: true, img: user.photoUrl },
        { name: 'Santiago99', score: 14, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Santiago' },
        { name: 'Carli_Gol', score: 8, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla' },
        { name: 'Leo_Prode', score: 4, img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
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
          className="flex items-center gap-3 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-xs sm:text-sm uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl transition-all active:scale-95"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Volver</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Tabla de Rankings */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">RANKING</h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global - Todos los jugadores</p>
          </div>

          <div className="space-y-4">
            {loadingRanking ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-black dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando clasificación global...</p>
              </div>
            ) : (
              players.map((p, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-4 sm:p-5 rounded-3xl transition-all border-2 ${
                    p.current 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xl' 
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black ${
                      p.current ? 'bg-white dark:bg-black text-black dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-400'
                    }`}>
                      {i + 1}
                    </span>
                    <img src={p.img} alt={p.name} className="w-10 h-10 rounded-full border-2 border-white/10 object-cover" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-tight truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black block">{p.score}</span>
                    <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">Pts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
