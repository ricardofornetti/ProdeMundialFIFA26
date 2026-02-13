
import React, { useState, useEffect } from 'react';
import { User, Prediction, View, Match, AuthMode } from './types';
import { AuthForm } from './components/AuthForm';
import { MatchCard } from './components/MatchCard';
import { GroupsSummary } from './components/GroupsSummary';
import { Leaderboard } from './components/Leaderboard';
import { AccountView } from './components/AccountView';
import { NextMatchesPreview } from './components/NextMatchesPreview';
import { WORLD_CUP_MATCHES, WORLD_CUP_GROUPS, KNOCKOUT_PHASES } from './constants';
import { db, saveUserPrediction, getUserPredictions, getRealMatches } from './services/firebaseService';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const PhaseIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'layers': // Dieciseisavos
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M12 1L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" className="opacity-40" />
          <path d="M16 5L17.5 9.5H22L18.5 12L19.5 16.5L16 14L12.5 16.5L13.5 12L10 9.5H14.5L16 5Z" />
        </svg>
      );
    case 'bracket': // Octavos
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <circle cx="12" cy="12" r="2" />
          <path d="M12 4L13 7H11L12 4ZM12 20L11 17H13L12 20ZM4 12L7 11V13L4 12ZM20 12L17 13V11L20 12ZM6.34 6.34L8.46 8.46L7.05 9.88L4.93 7.76L6.34 6.34ZM17.66 17.66L15.54 15.54L16.95 14.12L19.07 16.24L17.66 17.66ZM6.34 17.66L4.93 16.24L7.05 14.12L8.46 15.54L6.34 17.66ZM17.66 6.34L19.07 7.76L16.95 14.12L19.07 16.24L17.66 17.66ZM6.34 17.66L4.93 16.24L7.05 14.12L8.46 15.54L6.34 17.66ZM17.66 6.34L19.07 7.76L16.95 9.88L15.54 8.46L17.66 6.34Z" />
        </svg>
      );
    case 'shield': // Cuartos
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M12 2L4 5V11C4 16.5 7.5 21.3 12 22.5C16.5 21.3 20 16.5 20 11V5L12 2ZM12 15.5L8.5 17.5L9.5 13.5L6.5 11L10.5 10.5L12 6.5L13.5 10.5L17.5 11L14.5 13.5L15.5 17.5L12 15.5Z" />
        </svg>
      );
    case 'bolt': // Semifinal
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M12 2L13.5 6.5H18L14.5 9L15.5 13.5L12 11L8.5 13.5L9.5 9L6 6.5H10.5L12 2Z" />
          <path d="M12 15L13 18.5H16L13.5 20.5L14.5 24L12 22L9.5 24L10.5 20.5L8 18.5H11L12 15Z" className="opacity-50" />
        </svg>
      );
    case 'trophy': // Final
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
          <path d="M18 2H6V4H18V2ZM17 14C17 16.8 14.8 19 12 19C9.2 19 7 16.8 7 14V5H17V14ZM12 22C10.3 22 9 20.7 9 19H15C15 20.7 13.7 22 12 22Z" />
          <path d="M12 1L13 3H11L12 1Z" className="text-yellow-500" />
          <path d="M5 6L7 7L6 5L5 6Z" className="text-yellow-500" />
          <path d="M19 6L17 7L18 5L19 6Z" className="text-yellow-500" />
        </svg>
      );
    case 'soccer': // Grupos
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <circle cx="12" cy="12" r="10" className="opacity-20" />
          <path d="M12 2L13.5 6.5H18.5L14.5 9.5L16 14L12 11.5L8 14L9.5 9.5L5.5 6.5H10.5L12 2Z" />
          <path d="M12 22L10.5 17.5H5.5L9.5 14.5L8 10L12 12.5L16 10L14.5 14.5L18.5 17.5H13.5L12 22Z" className="opacity-40" />
        </svg>
      );
    default:
      return null;
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('auth');
  const [initialAuthMode, setInitialAuthMode] = useState<AuthMode>('login');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [realMatches, setRealMatches] = useState<Match[]>(WORLD_CUP_MATCHES);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Detectar si el usuario viene por un link de invitación
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'register') {
      setInitialAuthMode('register');
    }

    const activeUser = localStorage.getItem('active_user');
    if (activeUser) {
      try {
        const parsedUser = JSON.parse(activeUser);
        setUser(parsedUser);
        setView('main-menu');
        if (parsedUser.settings?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        setView('auth');
      }
    }
  }, []);

  useEffect(() => {
    const syncRealData = async () => {
      if (db) {
        const cloudMatches = await getRealMatches();
        if (cloudMatches.length > 0) {
          const updatedMatches = WORLD_CUP_MATCHES.map(m => {
            const cloudMatch = cloudMatches.find(cm => cm.id === m.id);
            return cloudMatch ? { ...m, ...cloudMatch } : m;
          });
          setRealMatches(updatedMatches);
        }
      }
    };
    syncRealData();
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (user) {
        if (db) {
          const cloudPreds = await getUserPredictions(user.email || user.username);
          if (cloudPreds.length > 0) {
            setPredictions(cloudPreds as Prediction[]);
            return;
          }
        }
        const savedPredictions = localStorage.getItem(`prode_predictions_${user.email || user.username}`);
        if (savedPredictions) {
          setPredictions(JSON.parse(savedPredictions));
        }
      }
    };
    fetchPredictions();
  }, [user]);

  const calculateTotalScore = (currentPredictions: Prediction[]) => {
    return currentPredictions.reduce((total, pred) => {
      const match = realMatches.find(m => m.id === pred.matchId);
      if (!match || match.actualHomeScore === undefined || match.actualAwayScore === undefined) return total;
      
      const pHome = Number(pred.homeScore);
      const pAway = Number(pred.awayScore);
      const rHome = match.actualHomeScore;
      const rAway = match.actualAwayScore;

      if (isNaN(pHome) || isNaN(pAway)) return total;

      const pResult = pHome > pAway ? 'home' : pHome < pAway ? 'away' : 'draw';
      const rResult = rHome > rAway ? 'home' : rHome < rAway ? 'away' : 'draw';
      
      let matchPoints = 0;
      if (pResult === rResult) {
        matchPoints += 3;
        if (pHome === rHome && pAway === rAway) {
          matchPoints += 1;
        }
      }
      return total + matchPoints;
    }, 0);
  };

  const handleAuthSuccess = async (authUser: User) => {
    localStorage.setItem('active_user', JSON.stringify(authUser));
    setUser(authUser);
    setView('main-menu');
    
    // Limpiar parámetros de la URL después de loguearse para una URL limpia
    window.history.replaceState({}, document.title, window.location.pathname);
    
    if (db) {
      const userRef = doc(db, "users", authUser.email || authUser.username);
      await setDoc(userRef, {
        username: authUser.username,
        photoUrl: authUser.photoUrl,
        email: authUser.email,
        totalScore: calculateTotalScore(predictions),
        lastLogin: new Date()
      }, { merge: true });
    }
  };

  const handlePredictionChange = (matchId: string, homeScore: number | '', awayScore: number | '') => {
    setPredictions(prev => {
      const existing = prev.find(p => p.matchId === matchId);
      if (existing) return prev.map(p => p.matchId === matchId ? { ...p, homeScore, awayScore } : p);
      return [...prev, { matchId, homeScore, awayScore }];
    });
    setSaveSuccess(false);
  };

  const handleSavePredictions = async () => {
    if (!user) return;
    setIsSaving(true);
    setValidationError(null);
    
    try {
      localStorage.setItem(`prode_predictions_${user.email || user.username}`, JSON.stringify(predictions));

      if (db) {
        await Promise.all(predictions.map(pred => {
          if (pred.homeScore !== '' && pred.awayScore !== '') {
            return saveUserPrediction(user.email || user.username, pred.matchId, Number(pred.homeScore), Number(pred.awayScore));
          }
          return Promise.resolve();
        }));
        
        const newScore = calculateTotalScore(predictions);
        const userRef = doc(db, "users", user.email || user.username);
        await setDoc(userRef, { 
          totalScore: newScore,
          lastUpdate: new Date()
        }, { merge: true });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Error al guardar:", e);
      setValidationError("Error al sincronizar con la nube.");
    } finally {
      setIsSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('active_user');
    setUser(null);
    setView('auth');
    setPredictions([]);
    document.documentElement.classList.remove('dark');
  };

  const userScore = calculateTotalScore(predictions);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 pb-20 transition-colors duration-300 overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-black border-b border-white/10 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <button onClick={() => setView('main-menu')} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all border-2 font-black text-[9px] sm:text-[10px] uppercase tracking-widest ${view === 'main-menu' ? 'bg-white border-white text-black' : 'bg-white/10 border-transparent text-white hover:bg-white/20'}`}>
             <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center font-black text-[8px] sm:text-[10px] ${view === 'main-menu' ? 'bg-black text-white' : 'bg-white text-black'}`}>26</div>
             <span className="hidden xs:inline">PRODE</span>
          </button>

          <div className="flex items-center gap-2 overflow-hidden">
            <button onClick={() => setView('leaderboard')} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all border-2 font-black text-[9px] sm:text-[10px] uppercase tracking-widest ${view === 'leaderboard' ? 'bg-white border-white text-black' : 'bg-white/10 border-transparent text-white hover:bg-white/20'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="hidden xs:inline">RANKING</span>
            </button>

            <button onClick={() => setView('account')} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all border-2 font-black text-[9px] sm:text-[10px] uppercase tracking-widest ${view === 'account' ? 'bg-white border-white text-black' : 'bg-white/10 border-transparent text-white hover:bg-white/20'}`}>
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-current flex-shrink-0"><img src={user?.photoUrl} className="w-full h-full object-cover" alt="" /></div>
              <span className="hidden xs:inline">CUENTA</span>
            </button>
          </div>
        </div>
      </header>

      {view === 'auth' ? (
        <main className="max-w-md mx-auto px-4 py-12">
          <AuthForm onAuthSuccess={handleAuthSuccess} initialMode={initialAuthMode} />
        </main>
      ) : view === 'main-menu' ? (
        <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in w-full">
          <div className="text-center mb-8">
            <h2 className="heading-font text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">BIENVENIDO</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em]">{user?.username} • {userScore} PTS</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button onClick={() => setView('groups')} className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-black dark:hover:border-white transition-all text-left flex flex-col justify-between h-44 sm:h-52">
              <div>
                <div className="w-10 h-10 bg-black dark:bg-white dark:text-black text-white rounded-xl flex items-center justify-center mb-3 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></div>
                <h3 className="heading-font text-lg font-black text-slate-900 dark:text-white uppercase">Clasificación</h3>
                <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest">Grupos y Equipos</p>
              </div>
              <div className="flex items-center gap-2 text-black dark:text-white font-black uppercase text-[8px] tracking-widest mt-auto">Abrir →</div>
            </button>

            <button onClick={() => setView('world-zones')} className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-green-600 transition-all text-left flex flex-col justify-between h-44 sm:h-52">
              <div>
                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <h3 className="heading-font text-lg font-black text-slate-900 dark:text-white uppercase">Cargar Prode</h3>
                <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest">Tus Predicciones</p>
              </div>
              <div className="flex items-center gap-2 text-black dark:text-white font-black uppercase text-[8px] tracking-widest mt-auto">Completar →</div>
            </button>

            <button onClick={() => setView('next-matches')} className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-blue-600 transition-all text-left flex flex-col justify-between h-44 sm:h-52">
              <div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <h3 className="heading-font text-lg font-black text-slate-900 dark:text-white uppercase">Próximos Encuentros</h3>
                <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest">Horario Argentina</p>
              </div>
              <div className="flex items-center gap-2 text-black dark:text-white font-black uppercase text-[8px] tracking-widest mt-auto">Ver Calendario →</div>
            </button>
          </div>
        </main>
      ) : view === 'next-matches' ? (
        <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in w-full">
           <div className="mb-6">
             <button onClick={() => setView('main-menu')} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">
               ← Volver
             </button>
           </div>
           <NextMatchesPreview matches={realMatches} />
        </main>
      ) : view === 'leaderboard' ? (
        <Leaderboard user={user!} userScore={userScore} onBack={() => setView('main-menu')} />
      ) : view === 'zone-detail' ? (
        <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in w-full">
          <div className="mb-4">
            <button onClick={() => setView('world-zones')} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">
              ← Volver
            </button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700">
             <div className="mb-8"><h2 className="heading-font text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{selectedZone}</h2></div>
             <div className="grid grid-cols-1 gap-4">
               {realMatches.filter(m => m.group === selectedZone).map((match) => (
                 <MatchCard key={match.id} match={match} prediction={predictions.find(p => p.matchId === match.id)} onPredictionChange={handlePredictionChange} />
               ))}
             </div>
             {realMatches.filter(m => m.group === selectedZone).length > 0 && (
               <div className="mt-8 flex justify-center flex-col items-center gap-2">
                 <button onClick={handleSavePredictions} disabled={isSaving} className="bg-black dark:bg-white dark:text-black text-white px-8 py-3 rounded-2xl font-black text-base hover:opacity-80 transition-all disabled:opacity-50">
                   {isSaving ? 'Guardando...' : 'Guardar'}
                 </button>
                 {saveSuccess && <p className="text-green-500 font-black text-[9px] uppercase">¡Sincronizado!</p>}
               </div>
             )}
          </div>
        </main>
      ) : view === 'world-zones' ? (
        <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in w-full">
          <div className="text-center mb-8">
            <h2 className="heading-font text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">FASES DEL MUNDIAL</h2>
          </div>
          
          <div className="space-y-8">
            {/* Grupos Section */}
            <div>
              <h3 className="heading-font text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">FASE DE GRUPOS</h3>
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-50 dark:divide-slate-700">
                  {WORLD_CUP_GROUPS.map((group) => (
                    <button key={group.name} onClick={() => { setSelectedZone(group.name); setView('zone-detail'); }} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-indigo-950 text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner border border-white/5">
                           <PhaseIcon type="soccer" />
                         </div>
                         <span className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-widest">{group.name}</span>
                      </div>
                      <span className="text-slate-300 font-black">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Knockout Section */}
            <div>
              <h3 className="heading-font text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">PLAY-OFFS</h3>
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 divide-y divide-slate-50 dark:divide-slate-700">
                  {KNOCKOUT_PHASES.map((phase) => (
                    <button key={phase.name} onClick={() => { setSelectedZone(phase.name); setView('zone-detail'); }} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left">
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 ${phase.name === 'Final' ? 'bg-gradient-to-br from-yellow-500 to-amber-700 text-white' : 'bg-indigo-900 text-indigo-200'}`}>
                           <PhaseIcon type={phase.iconType || 'bracket'} />
                         </div>
                         <span className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-widest">{phase.label}</span>
                      </div>
                      <span className="text-slate-300 font-black">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : view === 'account' ? (
        <AccountView user={user!} onLogout={logout} onUpdateUser={(u) => setUser(u)} onBack={() => setView('main-menu')} />
      ) : view === 'groups' ? (
        <GroupsSummary onContinue={() => setView('main-menu')} onBack={() => setView('main-menu')} />
      ) : null}
    </div>
  );
};

export default App;
