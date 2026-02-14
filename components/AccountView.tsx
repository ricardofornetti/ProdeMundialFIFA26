
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Toast, ToastType } from './Toast';

interface AccountViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
}

const BellIcon = ({ className = "h-5 w-5 text-blue-600" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DocIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PencilIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-black dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

export const AccountView: React.FC<AccountViewProps> = ({ user, onLogout, onUpdateUser, onBack }) => {
  const [activeSubView, setActiveSubView] = useState<'menu' | 'theme' | 'tc' | 'privacy' | 'notifications' | null>(null);
  
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user.username);
  
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<NonNullable<User['settings']>>(user.settings || {
    notifyResults: true,
    notifyMatchStart: true,
    theme: 'light',
  });

  const showAlert = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const handleToggle = (key: 'notifyResults' | 'notifyMatchStart') => {
    const newSettings: NonNullable<User['settings']> = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    onUpdateUser({ ...user, settings: newSettings });
    showAlert("Preferencia actualizada", "success");
  };

  const handleThemeSelection = (theme: 'light' | 'dark') => {
    const newSettings: NonNullable<User['settings']> = { ...settings, theme };
    setSettings(newSettings);
    onUpdateUser({ ...user, settings: newSettings });
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    showAlert(`Tema ${theme === 'light' ? 'claro' : 'oscuro'} aplicado`, 'success');
    setActiveSubView('menu');
  };

  const handleSaveNickname = () => {
    if (newNickname.trim()) {
      onUpdateUser({ ...user, username: newNickname });
      setIsEditingNickname(false);
      showAlert("Apodo actualizado correctamente", 'success');
    }
  };

  const handleCancelNickname = () => {
    setNewNickname(user.username);
    setIsEditingNickname(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPendingPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAcceptPhoto = () => {
    if (pendingPhoto) {
      onUpdateUser({ ...user, photoUrl: pendingPhoto });
      setPendingPhoto(null);
      showAlert("Foto de perfil actualizada", 'success');
    }
  };

  const handleEmail = () => {
    window.location.href = "mailto:ricardofornetti@hotmail.com.ar?subject=Consulta Prode Mundial 2026";
  };

  const handleShare = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('mode', 'register');
    const text = `⚽ ¡Sumate al Prode del Mundial 2026 conmigo! Registrate aca para jugar: ${currentUrl.toString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Vista de Notificaciones
  if (activeSubView === 'notifications') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
        <div className="mb-4">
          <button onClick={() => setActiveSubView('menu')} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Volver a Configuración
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">NOTIFICACIONES</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-start justify-between p-5 bg-slate-50 dark:bg-slate-700/30 rounded-3xl">
              <div className="flex flex-col gap-1 pr-4">
                <h4 className="font-black uppercase text-[11px] text-slate-900 dark:text-white">Notificación de resultado</h4>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">Recibir una notificación por cada resultado de un partido</p>
              </div>
              <ToggleSwitch enabled={settings.notifyResults} onChange={() => handleToggle('notifyResults')} />
            </div>

            <div className="flex items-start justify-between p-5 bg-slate-50 dark:bg-slate-700/30 rounded-3xl">
              <div className="flex flex-col gap-1 pr-4">
                <h4 className="font-black uppercase text-[11px] text-slate-900 dark:text-white">Notificación de partido</h4>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">Recibir una notificación 30 minutos antes de que arranque el partido</p>
              </div>
              <ToggleSwitch enabled={settings.notifyMatchStart} onChange={() => handleToggle('notifyMatchStart')} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Vistas Legales (T&C y Privacidad)
  if (activeSubView === 'tc' || activeSubView === 'privacy') {
    const isTC = activeSubView === 'tc';
    return (
      <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
        <div className="mb-4">
          <button onClick={() => setActiveSubView('menu')} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Volver a Configuración
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
          <h2 className="heading-font text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-6">{isTC ? 'Términos y Condiciones' : 'Política de Privacidad'}</h2>
          <div className="prose dark:prose-invert text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-4 font-medium">
            {isTC ? (
              <>
                <p>Al participar en el Prode Mundial 2026, el usuario acepta que los pronósticos son recreativos.</p>
                <p>La administración se reserva el derecho de corregir errores en el ranking si se detectan fallas técnicas.</p>
              </>
            ) : (
              <>
                <p>Tus datos (Email y Foto) se utilizan exclusivamente para identificarte en el ranking del Prode.</p>
                <p>No compartimos información con terceros externos para fines publicitarios.</p>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Vista de Selección de Tema
  if (activeSubView === 'theme') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
        <div className="mb-4">
          <button onClick={() => setActiveSubView('menu')} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Volver a Configuración
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">TEMA</h2>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => handleThemeSelection('light')} className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${settings.theme === 'light' ? 'border-black dark:border-white bg-slate-50 dark:bg-slate-700' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
              <div className="flex items-center gap-4 text-slate-900 dark:text-white"><SunIcon /> <span className="font-black uppercase text-[11px]">Modo Claro</span></div>
              {settings.theme === 'light' && <div className="text-slate-900 dark:text-white"><CheckIcon /></div>}
            </button>
            <button onClick={() => handleThemeSelection('dark')} className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${settings.theme === 'dark' ? 'border-black dark:border-white bg-slate-50 dark:bg-slate-700' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
              <div className="flex items-center gap-4 text-slate-900 dark:text-white"><MoonIcon /> <span className="font-black uppercase text-[11px]">Modo Oscuro</span></div>
              {settings.theme === 'dark' && <div className="text-slate-900 dark:text-white"><CheckIcon /></div>}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Menú de Configuración
  if (activeSubView === 'menu') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
        <div className="mb-4">
          <button onClick={() => setActiveSubView(null)} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Volver
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">CONFIGURACIÓN</h2>
          </div>
          <div className="space-y-4">
            <button onClick={() => setActiveSubView('theme')} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-900 dark:text-white">
              <div className="flex items-center gap-4">
                {settings.theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                <span className="font-black uppercase text-[11px]">Cambiar Tema</span>
              </div>
              <span className="text-slate-300">→</span>
            </button>
            <button onClick={() => setActiveSubView('notifications')} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-900 dark:text-white">
              <div className="flex items-center gap-4"><BellIcon className="h-5 w-5 text-blue-600" /> <span className="font-black uppercase text-[11px]">Notificaciones</span></div>
              <span className="text-slate-300">→</span>
            </button>
            <button onClick={() => setActiveSubView('tc')} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-900 dark:text-white">
              <div className="flex items-center gap-4"><DocIcon /> <span className="font-black uppercase text-[11px]">Términos y Condiciones</span></div>
              <span className="text-slate-300">→</span>
            </button>
            <button onClick={() => setActiveSubView('privacy')} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-900 dark:text-white">
              <div className="flex items-center gap-4"><ShieldIcon /> <span className="font-black uppercase text-[11px]">Política de Privacidad</span></div>
              <span className="text-slate-300">→</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Vista Principal de Cuenta
  return (
    <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest">
          ← Volver
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black dark:border-white shadow-xl bg-slate-100 dark:bg-slate-900">
              <img src={pendingPhoto || user.photoUrl} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
              <PencilIcon />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          
          {pendingPhoto && (
            <div className="mt-4 flex gap-2">
              <button onClick={handleAcceptPhoto} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-[10px] uppercase">Aceptar</button>
              <button onClick={() => setPendingPhoto(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full font-black text-[10px] uppercase">Cancelar</button>
            </div>
          )}

          <div className="mt-4 text-center w-full">
            {isEditingNickname ? (
              <div className="flex flex-col gap-3 items-center max-w-xs mx-auto">
                <input 
                  value={newNickname} 
                  onChange={(e) => setNewNickname(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-700 px-4 py-3 rounded-xl font-black text-sm uppercase outline-none border-2 border-black dark:border-white text-slate-900 dark:text-white text-center" 
                  autoFocus
                />
                <div className="flex gap-2 w-full">
                  <button onClick={handleSaveNickname} className="flex-1 bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Aceptar</button>
                  <button onClick={handleCancelNickname} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="heading-font text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{user.username}</h2>
                <button onClick={() => setIsEditingNickname(true)} className="text-slate-400 hover:text-black dark:hover:text-white"><PencilIcon /></button>
              </div>
            )}
            <p className="text-slate-400 font-black uppercase text-[9px] tracking-widest mt-1">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button onClick={handleShare} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-900 dark:text-white">
            <div className="flex items-center gap-4"><ShareIcon /> <span className="font-black uppercase text-[11px]">Invitar Amigos</span></div>
            <span className="text-slate-300">→</span>
          </button>

          <button onClick={() => setActiveSubView('menu')} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-900 dark:text-white">
            <div className="flex items-center gap-4"><SettingsIcon /> <span className="font-black uppercase text-[11px]">Configuración</span></div>
            <span className="text-slate-300">→</span>
          </button>

          <button onClick={handleEmail} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left text-slate-900 dark:text-white">
            <div className="flex items-center gap-4"><BellIcon /> <span className="font-black uppercase text-[11px]">Soporte Técnico</span></div>
            <span className="text-slate-300">→</span>
          </button>

          <button onClick={onLogout} className="w-full flex items-center justify-between p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-left">
            <div className="flex items-center gap-4"><LogoutIcon /> <span className="font-black uppercase text-[11px] text-red-600">Cerrar Sesión</span></div>
            <span className="text-red-300">→</span>
          </button>
        </div>
      </div>
    </main>
  );
};
