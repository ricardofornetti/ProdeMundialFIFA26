import React, { useState, useEffect } from 'react';
import { Match, User } from '../types';
import { TEAM_FLAGS } from '../constants';
import { updateMatchResult, deleteMatchResult, recalculateAllScores, getAllUsers, getUserPredictions } from '../services/firebaseService';
import { ChevronLeft, Save, AlertTriangle, CheckCircle, Trash2, RefreshCw, Users, Search, Mail, ArrowLeft, Award, Calendar, Clock } from 'lucide-react';

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

  // States for registered users panel
  const [activeTab, setActiveTab] = useState<'results' | 'users'>('results');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // States for user predictions popup/sub-view
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPredictions, setUserPredictions] = useState<any[]>([]);
  const [loadingPreds, setLoadingPreds] = useState(false);

  const handleSelectUser = async (userObj: User) => {
    setSelectedUser(userObj);
    setLoadingPreds(true);
    try {
      const preds = await getUserPredictions(userObj.uid || '');
      setUserPredictions(preds || []);
    } catch (err) {
      console.error("Error fetching predictions for user:", err);
    } finally {
      setLoadingPreds(false);
    }
  };

  // Memoized stats calculation for the selected user predictions
  const userPredStats = React.useMemo(() => {
    if (!selectedUser) return { exact: 0, resultOnly: 0, failed: 0, pending: 0, total: 0 };
    let exact = 0;
    let resultOnly = 0;
    let failed = 0;
    let pending = 0;
    let withPrediction = 0;

    matches.forEach(match => {
      const pred = userPredictions.find(p => p.matchId === match.id);
      if (!pred) return;
      
      withPrediction++;
      
      if (match.actualHomeScore === undefined || match.actualAwayScore === undefined) {
        pending++;
      } else {
        const pHome = Number(pred.homeScore);
        const pAway = Number(pred.awayScore);
        const rHome = Number(match.actualHomeScore);
        const rAway = Number(match.actualAwayScore);
        
        if (!isNaN(pHome) && !isNaN(pAway)) {
          const pResult = pHome > pAway ? 'home' : pHome < pAway ? 'away' : 'draw';
          const rResult = rHome > rAway ? 'home' : rHome < rAway ? 'away' : 'draw';
          
          if (pResult === rResult) {
            if (pHome === rHome && pAway === rAway) {
              exact++;
            } else {
              resultOnly++;
            }
          } else {
            failed++;
          }
        }
      }
    });

    return { exact, resultOnly, failed, pending, total: withPrediction };
  }, [selectedUser, matches, userPredictions]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Error fetching registered users list:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const filteredUsers = users.filter((u) => {
    const query = userSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (u.username || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    // Admins first, then score descending, then name alphabetically
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    const scoreDiff = (b.totalScore || 0) - (a.totalScore || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (a.username || '').localeCompare(b.username || '');
  });

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

      {/* Selector de pestañas */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('results')}
          type="button"
          className={`px-4 py-3 font-black text-xs uppercase tracking-widest transition-all border-b-2 -mb-[2px] flex items-center gap-2 ${
            activeTab === 'results'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <span>Cargar Resultados</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          type="button"
          className={`px-4 py-3 font-black text-xs uppercase tracking-widest transition-all border-b-2 -mb-[2px] flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios Registrados ({loadingUsers ? '...' : users.length})</span>
        </button>
      </div>

      {activeTab === 'users' ? (
        selectedUser ? (
          <div className="space-y-6 animate-fade-in animate-duration-300">
            {/* Header del Jugador Seleccionado */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700 p-5 rounded-3xl shadow-sm">
              <button
                onClick={() => setSelectedUser(null)}
                type="button"
                className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 mb-4"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" strokeWidth={3} />
                <span>Volver a la Lista de Usuarios</span>
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.email}`}
                    alt={selectedUser.username}
                    className="w-14 h-14 rounded-full border-2 border-indigo-100 dark:border-slate-600 object-cover shrink-0 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                        {selectedUser.username}
                      </h3>
                      {selectedUser.role === 'admin' ? (
                        <span className="bg-rose-100 dark:bg-rose-950/45 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-indigo-100 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          Usuario
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedUser.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-6 bg-white dark:bg-slate-900/60 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-full md:w-auto self-stretch md:self-auto justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Puntaje Total</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {selectedUser.totalScore || 0} pts
                    </span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800"></div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Pronósticos</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-right">
                      {userPredStats.total} / {matches.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center">
                  <Award className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Clavados (+4 pts)</span>
                  <span className="text-base font-black text-slate-800 dark:text-white">{userPredStats.exact}</span>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mb-1" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Acertados (+3 pts)</span>
                  <span className="text-base font-black text-slate-800 dark:text-white">{userPredStats.resultOnly}</span>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center">
                  <Trash2 className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Errados (0 pts)</span>
                  <span className="text-base font-black text-slate-800 dark:text-white">{userPredStats.failed}</span>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center">
                  <Clock className="w-5 h-5 text-indigo-500 mb-1" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Pendientes</span>
                  <span className="text-base font-black text-slate-800 dark:text-white">{userPredStats.pending}</span>
                </div>
              </div>
            </div>

            {loadingPreds ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-xs uppercase tracking-widest font-black">Cargando pronósticos...</span>
              </div>
            ) : userPredictions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800/20">
                <Award className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <span className="text-xs uppercase tracking-widest font-black text-center px-4">Este usuario aún no ha realizado predicciones</span>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Predicciones del Prode</h4>
                {matches.map((match, idx) => {
                  const pred = userPredictions.find(p => p.matchId === match.id);
                  if (!pred) return null; // Only show calculated predictions

                  const hasOfficialResult = match.actualHomeScore !== undefined && match.actualAwayScore !== undefined;
                  let pointsEarned = 0;
                  let isExact = false;
                  let isResultOnly = false;

                  if (hasOfficialResult) {
                    const pHome = Number(pred.homeScore);
                    const pAway = Number(pred.awayScore);
                    const rHome = Number(match.actualHomeScore);
                    const rAway = Number(match.actualAwayScore);

                    if (!isNaN(pHome) && !isNaN(pAway)) {
                      const pResult = pHome > pAway ? 'home' : pHome < pAway ? 'away' : 'draw';
                      const rResult = rHome > rAway ? 'home' : rHome < rAway ? 'away' : 'draw';

                      if (pResult === rResult) {
                        pointsEarned = 3;
                        isResultOnly = true;
                        if (pHome === rHome && pAway === rAway) {
                          pointsEarned = 4;
                          isExact = true;
                          isResultOnly = false;
                        }
                      }
                    }
                  }

                  return (
                    <div
                      key={match.id || `pred-match-${idx}`}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm overflow-hidden"
                    >
                      {/* Card Meta Header */}
                      <div className="bg-slate-50/50 dark:bg-slate-900/30 px-4 py-2 border-b border-slate-100/80 dark:border-slate-700 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{match.date} - {match.time}</span>
                        </div>
                        <div className="text-[10px] bg-slate-100 dark:bg-slate-700 font-extrabold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-tight scale-90">
                          Grupo {match.group}
                        </div>
                      </div>

                      {/* Card Content body */}
                      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                        {/* Equipos */}
                        <div className="flex-1 flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 flex-1 justify-end">
                            <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 text-right">{match.homeTeam}</span>
                            <img src={TEAM_FLAGS[match.homeFlag]} alt="" className="w-8 h-5 object-cover rounded shadow-sm border border-slate-100 shrink-0" />
                          </div>

                          <div className="flex items-center gap-2 mx-4 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-base font-black text-slate-800 dark:text-white">{pred.homeScore}</span>
                            <span className="font-extrabold text-slate-300 select-none">:</span>
                            <span className="text-base font-black text-slate-800 dark:text-white">{pred.awayScore}</span>
                          </div>

                          <div className="flex items-center gap-3 flex-1">
                            <img src={TEAM_FLAGS[match.awayFlag]} alt="" className="w-8 h-5 object-cover rounded shadow-sm border border-slate-100 shrink-0" />
                            <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-200">{match.awayTeam}</span>
                          </div>
                        </div>

                        {/* Comparación de Resultado */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-700 pt-3 sm:pt-0">
                          {hasOfficialResult ? (
                            <div className="flex flex-col items-center sm:items-end">
                              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Resultado Oficial</span>
                              <div className="flex items-center gap-1.5 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 px-2.5 py-1 rounded-lg">
                                <span>{match.actualHomeScore}</span>
                                <span className="text-emerald-300 dark:text-emerald-800">-</span>
                                <span>{match.actualAwayScore}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center sm:items-end">
                              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Resultado Oficial</span>
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 px-2.5 py-1 rounded-lg">
                                Pendiente
                              </span>
                            </div>
                          )}

                          {/* Medallón de Puntos */}
                          <div className="shrink-0">
                            {hasOfficialResult ? (
                              isExact ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                                  ¡Exacto! 🔥 (+4)
                                </span>
                              ) : isResultOnly ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-100/40 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/40">
                                  Ganador 👍 (+3)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                                  Errado ❌ (0)
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                En juego ⏳
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por usuario o email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/15 focus:outline-none text-xs text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>
              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                type="button"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>{loadingUsers ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-xs uppercase tracking-widest font-black">Cargando usuarios...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/20">
                <span className="text-xs uppercase tracking-widest font-black">No se encontraron usuarios</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((userObj, index) => (
                  <div
                    key={userObj.uid || userObj.email || `user-${index}`}
                    onClick={() => handleSelectUser(userObj)}
                    className="bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md cursor-pointer px-4 py-3.5 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm flex items-center justify-between gap-4 transition-all hover:scale-[1.01] active:scale-95 group/usercard"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={userObj.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userObj.email}`}
                        alt={userObj.username}
                        className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-sm text-slate-800 dark:text-white truncate">
                            {userObj.username}
                          </span>
                          {userObj.role === 'admin' ? (
                            <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                              Admin
                            </span>
                          ) : (
                            <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                              Usuario
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{userObj.email}</span>
                          <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold opacity-0 group-hover/usercard:opacity-100 transition-opacity ml-1.5 uppercase tracking-wider shrink-0">
                            Ver prode →
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Puntos</span>
                      <span className="text-base font-black text-slate-800 dark:text-white leading-tight">
                        {userObj.totalScore || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        <>
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
              type="button"
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-white dark:text-black dark:hover:bg-slate-100 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              <span>{recalculating ? 'Recalculando...' : 'Recalcular Ranking'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {matches.map((match, index) => {
              const isProcessing = loadingMatchId === match.id;
              const isSuccess = successId === match.id;
              const currentEditing = editingScores[match.id] || { 
                home: match.actualHomeScore ?? '', 
                away: match.actualAwayScore ?? '' 
              };

              return (
                <div key={match.id || `match-${index}`} className={isDeleting === match.id ? 'opacity-50' : ''}>
                  {/* COMPONENTE RESPONSIVE MOBILE: Card apilada individual (<640px) */}
                  <div className="sm:hidden bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4">
                    {/* Línea superior: grupo + fecha */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2.5">
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight truncate max-w-[170px]">
                        {match.group}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                        {match.date}
                      </span>
                    </div>

                    {/* Nombres de los equipos e inputs de resultado apilados */}
                    <div className="space-y-3.5 my-1">
                      {/* Local */}
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <img 
                          src={TEAM_FLAGS[match.homeFlag]} 
                          alt="" 
                          className="w-8 h-5 object-cover rounded shadow-xs border border-slate-100 shrink-0" 
                        />
                        <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 truncate flex-1 min-w-0">
                          {match.homeTeam}
                        </span>
                        <input 
                          type="number"
                          min="0"
                          placeholder="-"
                          value={currentEditing.home}
                          onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                          className="w-11 h-11 text-center text-[15px] font-black border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none dark:bg-slate-700 dark:text-white shrink-0"
                        />
                      </div>

                      {/* Divisor */}
                      <div className="flex justify-center items-center h-1">
                        <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">versus</span>
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <img 
                          src={TEAM_FLAGS[match.awayFlag]} 
                          alt="" 
                          className="w-8 h-5 object-cover rounded shadow-xs border border-slate-100 shrink-0" 
                        />
                        <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 truncate flex-1 min-w-0">
                          {match.awayTeam}
                        </span>
                        <input 
                          type="number"
                          min="0"
                          placeholder="-"
                          value={currentEditing.away}
                          onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                          className="w-11 h-11 text-center text-[15px] font-black border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none dark:bg-slate-700 dark:text-white shrink-0"
                        />
                      </div>
                    </div>

                    {/* Botón de guardar / eliminar (full-width) */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <button
                        onClick={() => handleSaveResult(match.id)}
                        disabled={isProcessing || currentEditing.home === '' || currentEditing.away === ''}
                        type="button"
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          isSuccess 
                            ? 'bg-green-500 text-white' 
                            : 'bg-indigo-600 dark:bg-white dark:text-black text-white hover:opacity-90 active:scale-95 disabled:opacity-30'
                        }`}
                      >
                        {isProcessing ? '...' : isSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        <span>{isSuccess ? 'RESULTADO GUARDADO' : 'Guardar Resultado'}</span>
                      </button>

                      {(match.actualHomeScore !== undefined || match.actualAwayScore !== undefined) && (
                        <div className="w-full">
                          {confirmDeleteId === match.id ? (
                            <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-right-1 duration-200">
                              <button
                                onClick={() => handleDeleteResult(match.id)}
                                disabled={isDeleting === match.id}
                                type="button"
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-wider hover:bg-red-700 transition"
                              >
                                {isDeleting === match.id ? '...' : 'Sí, borrar'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={isDeleting === match.id}
                                type="button"
                                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-wider"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(match.id)}
                              disabled={isDeleting === match.id}
                              type="button"
                              className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-950/10 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 transition border border-red-100 dark:border-red-800/20 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Borrar Resultado</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COMPONENTE DESKTOP TABLET: Fila horizontal tradicional (>=640px) */}
                  <div className="hidden sm:flex bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex-row items-center gap-6">
                    <div className="flex-1 flex flex-row items-center justify-between w-full">
                      <div className="flex items-center gap-3 flex-1 justify-end w-auto min-w-0">
                        <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 text-right truncate">
                          {match.homeTeam}
                        </span>
                        <img 
                          src={TEAM_FLAGS[match.homeFlag]} 
                          alt="" 
                          className="w-8 h-5 object-cover rounded shadow-xs border border-slate-100 shrink-0" 
                        />
                      </div>

                      <div className="flex items-center gap-2 mx-4 shrink-0">
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

                      <div className="flex items-center gap-3 flex-1 justify-start w-auto min-w-0">
                        <img 
                          src={TEAM_FLAGS[match.awayFlag]} 
                          alt="" 
                          className="w-8 h-5 object-cover rounded shadow-xs border border-slate-100 shrink-0" 
                        />
                        <span className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 truncate">
                          {match.awayTeam}
                        </span>
                      </div>
                    </div>

                    <div className="w-auto flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSaveResult(match.id)}
                        disabled={isProcessing || currentEditing.home === '' || currentEditing.away === ''}
                        type="button"
                        className={`w-32 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
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
                                type="button"
                                className="px-3 py-3 rounded-xl bg-red-600 text-white font-black text-[9px] uppercase tracking-tighter hover:bg-red-700 transition"
                              >
                                {isDeleting === match.id ? '...' : '¿Borrar?'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={isDeleting === match.id}
                                type="button"
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
                              type="button"
                              className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-30 border border-red-200 dark:border-red-800/20 shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
