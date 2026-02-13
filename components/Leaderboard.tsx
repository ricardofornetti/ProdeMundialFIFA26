
import React, { useState, useEffect } from 'react';
import { User, Prediction } from '../types';
import { WORLD_CUP_MATCHES } from '../constants';
import { getSportsAnalysis } from '../services/geminiService';
import { db, getGlobalRanking } from '../services/firebaseService';

interface LeaderboardProps {
  user: User;
  userScore: number;
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ user, userScore, onBack }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  // Efecto para obtener el ranking real desde Firebase
  useEffect(() => {
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

  // Efecto para obtener el análisis de IA
  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoadingAnalysis(true);
      const savedPreds = localStorage.getItem(`prode_predictions_${user.email || user.username}`);
      if (savedPreds) {
        const predictions: Prediction[] = JSON.parse(savedPreds);
        const comparisonData = predictions.map(p => {
          const match = WORLD_CUP_MATCHES.find(m => m.id === p.matchId);
          return {
            partido: `${match?.homeTeam} vs ${match?.awayTeam}`,
            tu_prediccion: `${p.homeScore}-${p.awayScore}`,
            resultado_real: match?.actualHomeScore !== undefined ? `${match.actualHomeScore}-${match.actualAwayScore}` : 'Pendiente'
          };
        });

        const result = await getSportsAnalysis(user.username, userScore, comparisonData);
        setAnalysis(result);
      }
      setLoadingAnalysis(false);
    };

    fetchAnalysis();
  }, [user, userScore]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      <div className="space-y-6">
        {/* Tarjeta de Análisis IA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          </div>
          <h3 className="heading-font text-white font-black uppercase italic tracking-widest text-xs mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Análisis de IA en tiempo real
          </h3>
          {loadingAnalysis ? (
            <div className="flex flex-col items-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mb-2"></div>
              <p className="text-white/60 font-black text-[9px] uppercase tracking-[0.2em]">Escaneando resultados...</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="text-white text-xs sm:text-sm font-medium leading-relaxed italic">
                "{analysis}"
              </p>
            </div>
          )}
        </div>

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
