import React, { useState } from 'react';
import { Match } from '../types';
import { TEAM_FLAGS } from '../constants';
import { updateMatchResult, deleteMatchResult, recalculateAllScores } from '../services/firebaseService';
import { ChevronLeft, Save, AlertTriangle, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

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
  const [recalculating, setRecalculating] = useState(false);
  const [recalcStatus, setRecalcStatus] = useState<string | null>(null);

  const handleManualRecalculate = async () => {
    setRecalculating(true);
    setRecalcStatus(null);
    try {
      const res = await recalculateAllScores();
      if (res.success) {
        setRecalcStatus(`¡Éxito! Se actualizaron los ranking de ${res.updatedCount} usuarios.`);
        setTimeout(() => setRecalcStatus(null), 5000);
      } else {
        setRecalcStatus(`Error: ${res.message}`);
      }
    } catch (e: any) {
      console.error(e);
      setRecalcStatus("Error al recalcular puntajes.");
    } finally {
      setRecalculating(false);
    }
  };

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
      
      // Auto-recalculate ranks and points for all users
      await recalculateAllScores();
      
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
      
      // Auto-recalculate ranks and points for all users
      await recalculateAllScores();
      
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
            className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/30 mb-4"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
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

      {/* Panel de Sincronización Manual */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-700/60 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Sincronización y Recálculo de Ranking</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Si notas que el ranking no se actualizó automáticamente, puedes forzar un recálculo global en tiempo real de todos los puntajes basados en los partidos oficiales guardados.
          </p>
          {recalcStatus && (
            <div className={`mt-3 text-[11px] font-bold p-2.5 rounded-lg border ${
              recalcStatus.includes('Error') 
                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30' 
                : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/30'
            }`}>
              {recalcStatus}
            </div>
          )}
        </div>
        <button 
          onClick={handleManualRecalculate}
          disabled={recalculating}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-white dark:text-black dark:hover:bg-slate-100 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalculando...' : 'Recalcular Ranking'}</span>
        </button>
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
