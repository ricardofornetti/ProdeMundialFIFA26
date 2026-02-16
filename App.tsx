
import React, { useState, useEffect } from 'react';
import { User, Prediction, View, Match, AuthMode } from './types';
import { AuthForm } from './components/AuthForm';
import { MatchCard } from './components/MatchCard';
import { GroupsSummary } from './components/GroupsSummary';
import { Leaderboard } from './components/Leaderboard';
import { AccountView } from './components/AccountView';
import { GroupEditor } from './components/GroupEditor';
import { FullCalendar } from './components/FullCalendar';
import { HistoryView } from './components/HistoryView';
import { GalleryView } from './components/GalleryView';
import { PrivateGroupsView } from './components/PrivateGroupsView';
import { Chatbot } from './components/Chatbot';
import { WORLD_CUP_MATCHES, WORLD_CUP_GROUPS, KNOCKOUT_PHASES } from './constants';
import { db, saveUserPrediction, getUserPredictions, getRealMatches } from './services/firebaseService';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const PhaseIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'layers': return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12 1L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" className="opacity-40" /><path d="M16 5L17.5 9.5H22L18.5 12L19.5 16.5L16 14L12.5 16.5L13.5 12L10 9.5H14.5L16 5Z" /></svg>;
    case 'bracket': return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><circle cx="12" cy="12" r="2" /><path d="M12 4L13 7H11L12 4ZM12 20L11 17H13L12 20ZM4 12L7 11V13L4 12ZM20 12L17 13V11L20 12Z" /></svg>;
    case 'shield': return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12 2L4 5V11C4 16.5 7.5 21.3 12 22.5C16.5 21.3 20 16.5 20 11V5L12 2Z" /></svg>;
    case 'bolt': return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12 2L13.5 6.5H18L14.5 9L15.5 13.5L12 11L8.5 13.5L9.5 9L6 6.5H10.5L12 2Z" /></svg>;
    case 'trophy': return <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor"><path d="M18 2H6V4H18V2ZM17 14C17 16.8 14.8 19 12 19C9.2 19 7 16.8 7 14V5H17V14ZM12 22C10.3 22 9 20.7 9 19H15C15 20.7 13.7 22 12 22Z" /></svg>;
    case 'soccer': return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><circle cx="12" cy="12" r="10" className="opacity-20" /><path d="M12 2L13.5 6.5H18.5L14.5 9.5L16 14L12 11.5L8 14L9.5 9.5L5.5 6.5H10.5L12 2Z" /></svg>;
    default: return null;
  }
};

const NavIcon = ({ type }: { type: 'rank' | 'history' | 'gallery' | 'user' }) => {
  switch (type) {
    case 'rank': return <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
    case 'history': return <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'gallery': return <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case 'user': return <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('auth');
  const [initialAuthMode, setInitialAuthMode] = useState<AuthMode>('login');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [customGroups, setCustomGroups] = useState(WORLD_CUP_GROUPS);
  const [realMatches, setRealMatches] = useState<Match[]>(WORLD_CUP_MATCHES);
  const [expandedZones, setExpandedZones] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleZone = (zoneName: string) => {
    setExpandedZones(prev => 
      prev.includes(zoneName) 
        ? prev.filter(z => z !== zoneName) 
        : [...prev, zoneName]
    );
  };

  useEffect(() => {
    const savedGroups = localStorage.getItem('custom_world_cup_groups');
    if (savedGroups) {
      const parsedGroups = JSON.parse(savedGroups);
      setCustomGroups(parsedGroups);
      updateMatchesFromGroups(parsedGroups);
    }

    // Aplicar tema persistente inmediatamente
    const themePref = localStorage.getItem('theme_preference');
    if (themePref === 'dark') {
      document.documentElement.classList.add('dark');
    }

    const activeUser = localStorage.getItem('active_user');
    if (activeUser) {
      try {
        const parsedUser = JSON.parse(activeUser);
        setUser(parsedUser);
        setView('main-menu');
        
        // El tema del usuario logueado manda si existe
        if (parsedUser.settings?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (parsedUser.settings?.theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
        
        const savedPreds = localStorage.getItem(`prode_predictions_${parsedUser.email || parsedUser.username}`);
        if (savedPreds) {
          setPredictions(JSON.parse(savedPreds));
        }
      } catch (e) {
        setView('auth');
      }
    }

    const fetchMatches = async () => {
      const cloudMatches = await getRealMatches();
      if (cloudMatches.length > 0) {
        const merged = WORLD_CUP_MATCHES.map(m => {
          const cloud = cloudMatches.find(cm => cm.id === m.id);
          return cloud ? { ...m, ...cloud } : m;
        });
        setRealMatches(merged as Match[]);
      }
    };
    fetchMatches();
  }, []);

  const updateMatchesFromGroups = (groups: typeof WORLD_CUP_GROUPS) => {
    const newMatches = WORLD_CUP_MATCHES.map(match => {
      const groupInfo = groups.find(g => match.group.includes(g.name));
      if (!groupInfo) return match;
      return match;
    });
    setRealMatches(newMatches as Match[]);
  };

  const handleSaveCustomGroups = (updatedGroups: typeof WORLD_CUP_GROUPS) => {
    setCustomGroups(updatedGroups);
    localStorage.setItem('custom_world_cup_groups', JSON.stringify(updatedGroups));
    updateMatchesFromGroups(updatedGroups);
    setView('groups');
  };

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
        if (pHome === rHome && pAway === rAway) matchPoints += 1;
      }
      return total + matchPoints;
    }, 0);
  };

  const handleAuthSuccess = async (authUser: User) => {
    localStorage.setItem('active_user', JSON.stringify(authUser));
    setUser(authUser);
    setView('main-menu');
    
    // Aplicar tema del usuario al entrar
    if (authUser.settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (authUser.settings?.theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
    
    if (db) {
      const userRef = doc(db, "users", authUser.email || authUser.username);
      await setDoc(userRef, { ...authUser, lastLogin: new Date() }, { merge: true });
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
        await setDoc(userRef, { totalScore: newScore, lastUpdate: new Date() }, { merge: true });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Error al guardar:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('active_user');
    setUser(null);
    setView('auth');
    setPredictions([]);
    // Mantener el tema de localStorage incluso al cerrar sesión si se desea
    const themePref = localStorage.getItem('theme_preference');
    if (themePref !== 'dark') {
      document.documentElement.classList.remove('dark');
    }
  };

  const userScore = calculateTotalScore(predictions);

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('active_user', JSON.stringify(updatedUser));
    if (db) {
      try {
        const userRef = doc(db, "users", updatedUser.email || updatedUser.username);
        await setDoc(userRef, { ...updatedUser }, { merge: true });
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 pb-20 transition-colors duration-300 overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-black border-b border-white/10 shadow-xl w-full">
        <div className="w-full px-1 h-16 flex items-center">
          <div className="grid grid-cols-5 gap-1 w-full max-w-7xl mx-auto px-1">
            <button 
              onClick={() => setView('main-menu')} 
              className={`flex flex-row items-center justify-center py-2 rounded-xl transition-all border font-black text-[7.5px] sm:text-[10px] uppercase tracking-tighter sm:tracking-widest ${view === 'main-menu' ? 'bg-white border-white text-black' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/20'}`}
            >
              <span>PRODE</span>
              <div className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded flex items-center justify-center font-black text-[6px] sm:text-[9px] ml-1 ${view === 'main-menu' ? 'bg-black text-white' : 'bg-white text-black'}`}>26</div>
            </button>
            <button 
              onClick={() => setView('leaderboard')} 
              className={`flex flex-row items-center justify-center py-2 rounded-xl transition-all border font-black text-[7.5px] sm:text-[10px] uppercase tracking-tighter sm:tracking-widest ${view === 'leaderboard' ? 'bg-white border-white text-black' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/20'}`}
            >
              <span>RANKING</span>
              <NavIcon type="rank" />
            </button>
            <button 
              onClick={() => setView('history')} 
              className={`flex flex-row items-center justify-center py-2 rounded-xl transition-all border font-black text-[7.5px] sm:text-[10px] uppercase tracking-tighter sm:tracking-widest ${view === 'history' ? 'bg-white border-white text-black' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/20'}`}
            >
              <span>HISTORIA</span>
              <NavIcon type="history" />
            </button>
            <button 
              onClick={() => setView('gallery')} 
              className={`flex flex-row items-center justify-center py-2 rounded-xl transition-all border font-black text-[7.5px] sm:text-[10px] uppercase tracking-tighter sm:tracking-widest ${view === 'gallery' ? 'bg-white border-white text-black' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/20'}`}
            >
              <span>GALERIA</span>
              <NavIcon type="gallery" />
            </button>
            <button 
              onClick={() => setView('account')} 
              className={`flex flex-row items-center justify-center py-2 rounded-xl transition-all border font-black text-[7.5px] sm:text-[10px] uppercase tracking-tighter sm:tracking-widest ${view === 'account' ? 'bg-white border-white text-black' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/20'}`}
            >
              <span>CUENTA</span>
              <NavIcon type="user" />
            </button>
          </div>
        </div>
      </header>

      {view === 'auth' ? (
        <main className="max-w-md mx-auto px-4 py-12"><AuthForm onAuthSuccess={handleAuthSuccess} initialMode={initialAuthMode} /></main>
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
            <button onClick={() => setView('calendar')} className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-blue-600 transition-all text-left flex flex-col justify-between h-44 sm:h-52">
              <div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg></div>
                <h3 className="heading-font text-lg font-black text-slate-900 dark:text-white uppercase">Calendario</h3>
                <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest">Fixture Completo</p>
              </div>
              <div className="flex items-center gap-2 text-black dark:text-white font-black uppercase text-[8px] tracking-widest mt-auto">Ver Todo →</div>
            </button>
          </div>
        </main>
      ) : view === 'world-zones' ? (
        <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in w-full">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setView('main-menu')} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">← Volver</button>
            <button 
              onClick={handleSavePredictions} 
              disabled={isSaving} 
              className="bg-black dark:bg-white dark:text-black text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:opacity-80 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Todo'}
            </button>
          </div>
          <div className="text-center mb-8"><h2 className="heading-font text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">FASES DEL MUNDIAL</h2></div>
          
          <div className="space-y-12">
            <div>
              <h3 className="heading-font text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">FASE DE GRUPOS</h3>
              <div className="space-y-4">
                {customGroups.map((group) => {
                  const isExpanded = expandedZones.includes(group.name);
                  const groupMatches = realMatches.filter(m => m.group.includes(group.name));
                  const completedPreds = groupMatches.filter(m => predictions.find(p => p.matchId === m.id && p.homeScore !== '' && p.awayScore !== '')).length;

                  return (
                    <div key={group.name} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                      <button 
                        onClick={() => toggleZone(group.name)}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center shadow-inner"><PhaseIcon type="soccer" /></div>
                           <div>
                             <span className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-widest block">{group.name}</span>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                               {completedPreds} de {groupMatches.length} partidos cargados
                             </span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {completedPreds === groupMatches.length && <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg></div>}
                          <span className={`text-slate-300 font-black transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>→</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 space-y-4 border-t border-slate-100 dark:border-slate-700 animate-slide-down">
                          {groupMatches.map(match => (
                            <MatchCard 
                              key={match.id} 
                              match={match} 
                              prediction={predictions.find(p => p.matchId === match.id)} 
                              onPredictionChange={handlePredictionChange} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="heading-font text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">PLAY-OFFS</h3>
              <div className="space-y-4">
                {KNOCKOUT_PHASES.map((phase) => {
                  const isExpanded = expandedZones.includes(phase.name);
                  const phaseMatches = realMatches.filter(m => m.group === phase.name);
                  const completedPreds = phaseMatches.filter(m => predictions.find(p => p.matchId === m.id && p.homeScore !== '' && p.awayScore !== '')).length;

                  return (
                    <div key={phase.name} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                      <button 
                        onClick={() => toggleZone(phase.name)}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${phase.name === 'Final' ? 'bg-gradient-to-br from-yellow-500 to-amber-700 text-white' : 'bg-indigo-900 text-indigo-200'}`}><PhaseIcon type={phase.iconType || 'bracket'} /></div>
                           <div>
                             <span className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-widest block">{phase.label}</span>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                               {completedPreds} de {phaseMatches.length} partidos cargados
                             </span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {completedPreds === phaseMatches.length && phaseMatches.length > 0 && <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg></div>}
                          <span className={`text-slate-300 font-black transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>→</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 space-y-4 border-t border-slate-100 dark:border-slate-700 animate-slide-down">
                          {phaseMatches.length > 0 ? (
                            phaseMatches.map(match => (
                              <MatchCard 
                                key={match.id} 
                                match={match} 
                                prediction={predictions.find(p => p.matchId === match.id)} 
                                onPredictionChange={handlePredictionChange} 
                              />
                            ))
                          ) : (
                            <p className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Aún no se han definido estos cruces</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-4">
            <button 
              onClick={handleSavePredictions} 
              disabled={isSaving} 
              className="bg-black dark:bg-white dark:text-black text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Sincronizando...' : 'Guardar Resultados'}
            </button>
            {saveSuccess && <p className="text-green-500 font-black text-[10px] uppercase tracking-widest animate-fade-in">¡Tus predicciones han sido guardadas!</p>}
          </div>
        </main>
      ) : view === 'groups' ? (
        <GroupsSummary 
          groups={customGroups}
          matches={realMatches}
          onContinue={() => setView('main-menu')} 
          onBack={() => setView('main-menu')} 
          onCustomEdit={() => setView('predictions')} 
        />
      ) : view === 'predictions' ? (
        <GroupEditor 
          currentGroups={customGroups} 
          onSave={handleSaveCustomGroups} 
          onBack={() => setView('groups')} 
        />
      ) : view === 'leaderboard' ? (
        <Leaderboard user={user!} userScore={userScore} onBack={() => setView('main-menu')} />
      ) : view === 'history' ? (
        <HistoryView onBack={() => setView('main-menu')} />
      ) : view === 'gallery' ? (
        <GalleryView onBack={() => setView('main-menu')} />
      ) : view === 'account' ? (
        <AccountView 
          user={user!} 
          onLogout={logout} 
          onUpdateUser={handleUpdateUser} 
          onBack={() => setView('main-menu')} 
          onGoToPrivateGroups={() => setView('private-groups')}
        />
      ) : view === 'private-groups' ? (
        <PrivateGroupsView user={user!} onBack={() => setView('account')} />
      ) : view === 'calendar' ? (
        <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in w-full">
           <div className="mb-6"><button onClick={() => setView('main-menu')} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest">← Volver</button></div>
           <FullCalendar matches={realMatches} />
        </main>
      ) : null}
      
      {/* Chatbot Integrado */}
      <Chatbot />
    </div>
  );
};

export default App;
