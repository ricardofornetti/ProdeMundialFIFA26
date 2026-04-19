import React, { useState } from 'react';
import { Match } from '../types';
import { TEAM_FLAGS } from '../constants';
import { updateMatchResult, deleteMatchResult } from '../services/firebaseService';
import { ChevronLeft, Save, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  matches: Match[];
  onBack: () => void;
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ matches, onBack, onRefresh }) => {
  const [editingScores, setEditingScores] = useState<Record<string, { home: number | ''; away: number | '' }>>({});
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleScoreChange = (matchId: string, type: 'home' | 'away', value: string) => {
    const numValue = value === '' ? '' : parseInt(value);
    const match = matches.find(m => m.id === matchId);
    
    setEditingScores(prev => {
      const current = prev[matchId] || { 
        home: match?.actualHomeScore ?? '', 
        away: match?.actualAwayScore ?? '' 
      };
      
      return {
        ...prev,
        [matchId]: {
          ...current,
          [type]: numValue
        }
      };
    });
  };

  const handleSaveResult = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    const scores = editingScores[matchId] || { 
      home: match?.actualHomeScore ?? '', 
      away: match?.actualAwayScore ?? '' 
    };
    
    if (scores.home === '' || scores.away === '') {
      alert("Debes ingresar ambos resultados para cargar.");
      return;
    }

    setLoadingMatchId(matchId);
    try {
      await updateMatchResult(matchId, Number(scores.home), Number(scores.away));
      setSuccessId(matchId);
      setTimeout(() => setSuccessId(null), 3000);
      onRefresh(); // Re-fetch matches in parent
    } catch (e) {
      console.error("Error saving result:", e);
      alert("Error al guardar el resultado. Verifica tus permisos de administrador.");
    } finally {
      setLoadingMatchId(null);
    }
  };

  const handleDeleteResult = async (matchId: string) => {
    setIsDeleting(matchId);
    try {
      await deleteMatchResult(matchId);
      
      // Limpiar completamente el estado local de edición para este partido
      setEditingScores(prev => {
        const next = { ...prev };
        delete next[matchId];
        return next;
      });
      
      // Refrescar datos globales
      await onRefresh();
      
      setConfirmDeleteId(null);
      setSuccessId(matchId);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (e) {
      console.error("Error deleting result:", e);
      alert("Error al borrar el resultado: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b-2 border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-white dark:text-slate-400 dark:hover:text-white font-bold text-sm mb-4 transition-all hover:bg-indigo-600 px-4 py-2 rounded-xl active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver al Menú</span>
          </button>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Panel Admin</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Carga los resultados oficiales de los partidos</p>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight">Atención</p>
            <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Cargar un resultado bloqueará las predicciones y actualizará los puntos de todos los usuarios.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          const isProcessing = loadingMatchId === match.id;
          const isSuccess = successId === match.id;
          const currentEditing = editingScores[match.id] || { 
            home: match.actualHomeScore ?? '', 
            away: match.actualAwayScore ?? '' 
          };

          return (
            <div key={match.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-opacity ${isDeleting === match.id ? 'opacity-50' : ''}`}>
              <div className="flex-1 flex items-center justify-between w-full">
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 text-right">{match.homeTeam}</span>
                  <img src={TEAM_FLAGS[match.homeFlag]} alt="" className="w-8 h-5 object-cover rounded shadow-sm border border-slate-100" />
                </div>

                <div className="flex items-center gap-2 mx-4">
                  <input 
                    type="number"
                    min="0"
                    placeholder="-"
                    value={currentEditing.home}
                    onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                    className="w-12 h-12 text-center text-xl font-black border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none dark:bg-slate-700 dark:text-white"
                  />
                  <span className="font-black text-slate-300">:</span>
                  <input 
                    type="number"
                    min="0"
                    placeholder="-"
                    value={currentEditing.away}
                    onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                    className="w-12 h-12 text-center text-xl font-black border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <img src={TEAM_FLAGS[match.awayFlag]} alt="" className="w-8 h-5 object-cover rounded shadow-sm border border-slate-100" />
                  <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-200">{match.awayTeam}</span>
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  onClick={() => handleSaveResult(match.id)}
                  disabled={isProcessing || currentEditing.home === '' || currentEditing.away === ''}
                  className={`flex-1 sm:w-32 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isSuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-indigo-600 dark:bg-white dark:text-black text-white hover:opacity-90 active:scale-95 disabled:opacity-30'
                  }`}
                >
                  {isProcessing ? '...' : isSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{isSuccess ? 'CARGADO' : 'Cargar'}</span>
                </button>

                {(match.actualHomeScore !== undefined || match.actualAwayScore !== undefined) && (
                  <div className="flex items-center gap-1">
                    {confirmDeleteId === match.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-300">
                        <button
                          onClick={() => handleDeleteResult(match.id)}
                          disabled={isDeleting === match.id}
                          className="px-3 py-3 rounded-xl bg-red-600 text-white font-black text-[9px] uppercase tracking-tighter hover:bg-red-700 transition-all shadow-lg"
                        >
                          {isDeleting === match.id ? '...' : '¿Borrar?'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={isDeleting === match.id}
                          className="px-3 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-[9px] uppercase tracking-tighter"
                        >
                          NO
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(match.id)}
                        disabled={isDeleting === match.id}
                        title="Borrar resultado"
                        className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 border border-red-200 dark:border-red-800/20 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
