
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
import { WORLD_CUP_MATCHES, WORLD_CUP_GROUPS, KNOCKOUT_PHASES } from './constants';
import { db, saveUserPrediction, getUserPredictions, getRealMatches } from './services/firebaseService';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const PhaseIcon = ({ type }: { type: string }) => {
  const iconClass = "h-6 w-6 sm:h-8 sm:w-8";
  switch (type) {
    case 'layers': 
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'bracket': 
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v4" />
          <path d="M21 3v18" />
          <path d="M16 21h5v-4" />
          <path d="M3 7h5V3" />
          <path d="M3 3v18" />
          <path d="M3 17h5v4" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'shield': 
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'bolt': 
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'trophy': 
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-10 sm:w-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      );
    case 'soccer': 
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m12 12-2.5-3.5h5L12 12Z" fill="currentColor" fillOpacity="0.2" />
          <path d="m12 12 3.5 1.5v-3L12 12Z" fill="currentColor" fillOpacity="0.2" />
          <path d="m12 12-1 4h2l-1-4Z" fill="currentColor" fillOpacity="0.2" />
          <path d="m12 12-3.5 1.5v-3L12 12Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
          <path d="m4.93 4.93 2.47 2.47M16.6 16.6l2.47 2.47M4.93 19.07l2.47-2.47M16.6 7.4l2.47-2.47" />
        </svg>
      );
    case 'stadium':
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 10c0-4.4 4.5-8 10-8s10 3.6 10 8" />
          <path d="M22 14c0 4.4-4.5 8-10 8S2 18.4 2 14" />
          <path d="M2 10v4" />
          <path d="M22 10v4" />
          <path d="M12 6v12" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default: return null;
  }
};

const NavIcon = ({ type }: { type: 'rank' | 'history' | 'gallery' | 'user' | 'menu' }) => {
  switch (type) {
    case 'rank': return <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
    case 'history': return <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'gallery': return <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case 'user': return <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    case 'menu': return <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" /></svg>;
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
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleZone = (zoneName: string) => {
    setExpandedZones(prev => 
      prev.includes(zoneName) 
        ? prev.filter(z => z !== zoneName) 
        : [...prev, zoneName]
    );
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const themePref = localStorage.getItem('theme_preference');
    if (themePref === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedGroups = localStorage.getItem('custom_world_cup_groups');
    if (savedGroups) {
      const parsedGroups = JSON.parse(savedGroups);
      setCustomGroups(parsedGroups);
      updateMatchesFromGroups(parsedGroups);
    }

    const activeUser = localStorage.getItem('active_user');
    if (activeUser) {
      try {
        const parsedUser = JSON.parse(activeUser);
        setUser(parsedUser);
        setView('main-menu');
        
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

  const handleSaveSinglePrediction = async (matchId: string) => {
    if (!user) return;
    const pred = predictions.find(p => p.matchId === matchId);
    if (!pred || pred.homeScore === '' || pred.awayScore === '') return;

    setSavingMatchId(matchId);
    try {
      // Save to localStorage
      const updatedPredictions = [...predictions];
      localStorage.setItem(`prode_predictions_${user.email || user.username}`, JSON.stringify(updatedPredictions));

      if (db) {
        await saveUserPrediction(user.email || user.username, matchId, Number(pred.homeScore), Number(pred.awayScore));
        
        // Update score in background
        const newScore = calculateTotalScore(predictions);
        const userRef = doc(db, "users", user.email || user.username);
        await setDoc(userRef, { totalScore: newScore, lastUpdate: new Date() }, { merge: true });
      }
      
      // Visual feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Error al guardar predicción individual:", e);
    } finally {
      setSavingMatchId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('active_user');
    setUser(null);
    setView('auth');
    setPredictions([]);
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
      {!user || view === 'auth' ? (
        <main className="min-h-screen flex items-center justify-center max-w-md mx-auto px-4 py-12 animate-fade-in">
          <AuthForm onAuthSuccess={handleAuthSuccess} initialMode={initialAuthMode} />
        </main>
      ) : (
        <>
          <header className="sticky top-0 z-40 bg-indigo-600 border-b border-white/10 shadow-2xl w-full">
            <div className="w-full">
              <div className="grid grid-cols-6 gap-0 w-full max-w-full mx-auto h-24">
                <div className="relative h-full w-full">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className={`flex flex-col items-center justify-center h-full w-full transition-all border-r border-white/10 font-black text-[9px] sm:text-xs uppercase tracking-tight ${isMenuOpen ? 'text-white bg-white/20' : 'text-white/90 hover:bg-white/10'}`}
                  >
                    <NavIcon type="menu" />
                    <span>MENU</span>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute top-full left-0 w-48 bg-indigo-600 border border-white/10 shadow-2xl rounded-b-2xl overflow-hidden animate-slide-down z-50">
                      <button 
                        onClick={() => { setView('main-menu'); setIsMenuOpen(false); }}
                        className="w-full px-6 py-4 text-left text-[10px] font-black text-white/90 hover:bg-white/10 uppercase tracking-widest border-b border-white/5 flex items-center gap-3"
                      >
                        <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[8px]">26</div>
                        Prode
                      </button>
                      <button 
                        onClick={() => { setView('leaderboard'); setIsMenuOpen(false); }}
                        className="w-full px-6 py-4 text-left text-[10px] font-black text-white/90 hover:bg-white/10 uppercase tracking-widest border-b border-white/5 flex items-center gap-3"
                      >
                        <NavIcon type="rank" />
                        Ranking
                      </button>
                      <button 
                        onClick={() => { setView('history'); setIsMenuOpen(false); }}
                        className="w-full px-6 py-4 text-left text-[10px] font-black text-white/90 hover:bg-white/10 uppercase tracking-widest border-b border-white/5 flex items-center gap-3"
                      >
                        <NavIcon type="history" />
                        Historia
                      </button>
                      <button 
                        onClick={() => { setView('gallery'); setIsMenuOpen(false); }}
                        className="w-full px-6 py-4 text-left text-[10px] font-black text-white/90 hover:bg-white/10 uppercase tracking-widest border-b border-white/5 flex items-center gap-3"
                      >
                        <NavIcon type="gallery" />
                        Galería
                      </button>
                      <button 
                        onClick={() => { setView('account'); setIsMenuOpen(false); }}
                        className="w-full px-6 py-4 text-left text-[10px] font-black text-white/90 hover:bg-white/10 uppercase tracking-widest flex items-center gap-3"
                      >
                        <NavIcon type="user" />
                        Cuenta
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => { setView('main-menu'); setIsMenuOpen(false); }} 
                  className={`flex flex-col items-center justify-center h-full w-full transition-all border-r border-white/10 font-black text-[9px] sm:text-xs uppercase tracking-tight ${view === 'main-menu' ? 'text-white bg-white/20' : 'text-white/90 hover:bg-white/10'}`}
                >
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-[14px] mb-1 ${view === 'main-menu' ? 'bg-white text-indigo-600 shadow-inner' : 'bg-white/20 text-white'}`}>26</div>
                  <span>PRODE</span>
                </button>
                <button 
                  onClick={() => { setView('leaderboard'); setIsMenuOpen(false); }} 
                  className={`flex flex-col items-center justify-center h-full w-full transition-all border-r border-white/10 font-black text-[9px] sm:text-xs uppercase tracking-tight ${view === 'leaderboard' ? 'text-white bg-white/20' : 'text-white/90 hover:bg-white/10'}`}
                >
                  <NavIcon type="rank" />
                  <span className="hidden xs:inline">RANKING</span>
                  <span className="xs:hidden">TOP</span>
                </button>
                <button 
                  onClick={() => { setView('history'); setIsMenuOpen(false); }} 
                  className={`flex flex-col items-center justify-center h-full w-full transition-all border-r border-white/10 font-black text-[9px] sm:text-xs uppercase tracking-tight ${view === 'history' ? 'text-white bg-white/20' : 'text-white/90 hover:bg-white/10'}`}
                >
                  <NavIcon type="history" />
                  <span className="hidden xs:inline">HISTORIA</span>
                  <span className="xs:hidden">HITO</span>
                </button>
                <button 
                  onClick={() => { setView('gallery'); setIsMenuOpen(false); }} 
                  className={`flex flex-col items-center justify-center h-full w-full transition-all border-r border-white/10 font-black text-[9px] sm:text-xs uppercase tracking-tight ${view === 'gallery' ? 'text-white bg-white/20' : 'text-white/90 hover:bg-white/10'}`}
                >
                  <NavIcon type="gallery" />
                  <span className="hidden xs:inline">GALERIA</span>
                  <span className="xs:hidden">FOTO</span>
                </button>
                <button 
                  onClick={() => { setView('account'); setIsMenuOpen(false); }} 
                  className={`flex flex-col items-center justify-center h-full w-full transition-all font-black text-[9px] sm:text-xs uppercase tracking-tight ${view === 'account' ? 'text-white bg-white/20' : 'text-white/90 hover:bg-white/10'}`}
                >
                  <NavIcon type="user" />
                  <span className="hidden xs:inline">CUENTA</span>
                  <span className="xs:hidden">PERFIL</span>
                </button>
              </div>
            </div>
          </header>

          {view === 'main-menu' ? (
            <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in w-full">
              <div className="text-center mb-8">
                <h2 className="heading-font text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">BIENVENIDO</h2>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em]">{user?.username} • {userScore} PTS</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button onClick={() => setView('groups')} className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-indigo-600 transition-all text-left flex flex-col justify-between h-44 sm:h-52">
                  <div>
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></div>
                    <h3 className="heading-font text-lg font-black text-slate-900 dark:text-white uppercase">Clasificación</h3>
                    <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest">Grupos y Equipos</p>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[8px] tracking-widest mt-auto">Abrir →</div>
                </button>
                <button onClick={() => setView('world-zones')} className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-indigo-600 transition-all text-left flex flex-col justify-between h-44 sm:h-52">
                  <div>
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <h3 className="heading-font text-lg font-black text-slate-900 dark:text-white uppercase">Cargar Prode</h3>
                    <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest">Tus Predicciones</p>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[8px] tracking-widest mt-auto">Completar →</div>
                </button>
                <button onClick={() => setView('calendar')} className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-indigo-600 transition-all text-left flex flex-col justify-between h-44 sm:h-52">
                  <div>
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg></div>
                    <h3 className="heading-font text-lg font-black text-slate-900 dark:text-white uppercase">Calendario</h3>
                    <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest">Fixture Completo</p>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[8px] tracking-widest mt-auto">Ver Todo →</div>
                </button>
              </div>
            </main>
          ) : view === 'world-zones' ? (
            <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in w-full">
              <div className="mb-8 flex items-center justify-between gap-4">
                <button 
                  onClick={() => setView('main-menu')} 
                  className="flex items-center gap-3 text-slate-500 hover:text-black dark:text-slate-400 font-black text-xs sm:text-sm uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                  <span>Volver</span>
                </button>
                <button 
                  onClick={handleSavePredictions} 
                  disabled={isSaving} 
                  className="bg-indigo-600 dark:bg-white dark:text-black text-white px-8 py-4 rounded-2xl font-black text-xs sm:text-base uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                      <span>Guardar Todo</span>
                    </>
                  )}
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
                            <div className="flex items-center gap-4 sm:gap-6">
                               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-inner"><PhaseIcon type="soccer" /></div>
                               <div>
                                 <span className="font-black text-slate-900 dark:text-white uppercase text-sm sm:text-xl tracking-widest block">{group.name}</span>
                                 <span className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest">
                                   {completedPreds} de {groupMatches.length} partidos cargados
                                 </span>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {completedPreds === groupMatches.length && <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg></div>}
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
                                  onSavePrediction={handleSaveSinglePrediction}
                                  isSaving={savingMatchId === match.id}
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
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all text-left text-slate-900 dark:text-white"
                          >
                            <div className="flex items-center gap-4 sm:gap-6">
                               <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-inner ${phase.name === 'Final' ? 'bg-gradient-to-br from-yellow-500 to-amber-700 text-white' : 'bg-indigo-600 text-white'}`}><PhaseIcon type={phase.iconType || 'bracket'} /></div>
                               <div>
                                 <span className="font-black uppercase text-sm sm:text-xl tracking-widest block">{phase.label}</span>
                                 <span className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest">
                                   {completedPreds} de {phaseMatches.length} partidos cargados
                                 </span>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {completedPreds === phaseMatches.length && phaseMatches.length > 0 && <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg></div>}
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
                                    onSavePrediction={handleSaveSinglePrediction}
                                    isSaving={savingMatchId === match.id}
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
                  className="bg-indigo-600 dark:bg-white dark:text-black text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
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
            <Leaderboard user={user} userScore={userScore} onBack={() => setView('main-menu')} />
          ) : view === 'history' ? (
            <HistoryView onBack={() => setView('main-menu')} />
          ) : view === 'gallery' ? (
            <GalleryView onBack={() => setView('main-menu')} />
          ) : view === 'account' ? (
            <AccountView 
              user={user} 
              onLogout={logout} 
              onUpdateUser={handleUpdateUser} 
              onBack={() => setView('main-menu')} 
              onGoToPrivateGroups={() => setView('private-groups')}
            />
          ) : view === 'private-groups' ? (
            <PrivateGroupsView user={user} onBack={() => setView('account')} />
          ) : view === 'calendar' ? (
            <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in w-full">
               <div className="mb-6">
                <button 
                  onClick={() => setView('main-menu')} 
                  className="flex items-center gap-3 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-xs sm:text-sm uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                  <span>Volver</span>
                </button>
              </div>
               <FullCalendar matches={realMatches} />
            </main>
          ) : null}
        </>
      )}
    </div>
  );
};

export default App;
