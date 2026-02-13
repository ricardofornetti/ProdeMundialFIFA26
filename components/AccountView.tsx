
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Toast, ToastType } from './Toast';

interface AccountViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
}

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

const ThemeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.654 9h16.692M3.654 15h16.692M12 3a15.3 15.3 0 014.5 9 15.3 15.3 0 01-4.5 9 15.3 15.3 0 01-4.5-9 15.3 15.3 0 014.5-9z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

export const AccountView: React.FC<AccountViewProps> = ({ user, onLogout, onUpdateUser, onBack }) => {
  const [showRules, setShowRules] = useState(false);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [activeSettingsSubView, setActiveSettingsSubView] = useState<'theme' | null>(null);
  const [activeLegalSubView, setActiveLegalSubView] = useState<'tc' | 'privacy' | null>(null);
  
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user.username);
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

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
    showAlert(`${key === 'notifyResults' ? 'Resultados' : 'Inicio de partidos'} actualizado`, 'success');
  };

  const handleThemeSelection = (theme: 'light' | 'dark') => {
    const newSettings: NonNullable<User['settings']> = { ...settings, theme };
    setSettings(newSettings);
    onUpdateUser({ ...user, settings: newSettings });
    showAlert(`Tema ${theme === 'light' ? 'claro' : 'oscuro'} aplicado`, 'success');
    setActiveSettingsSubView(null);
  };

  const handleSaveNickname = () => {
    if (newNickname.trim()) {
      onUpdateUser({ ...user, username: newNickname });
      setIsEditingNickname(false);
      showAlert("Apodo actualizado correctamente", 'success');
    }
  };

  const handleSavePassword = () => {
    if (newPass.length < 6) {
      showAlert("La contraseña debe tener al menos 6 caracteres.", 'error');
      return;
    }
    
    if (newPass !== confirmNewPass) {
      showAlert("Las contraseñas no coinciden. Por favor, verifica nuevamente.", 'error');
      return;
    }

    if (newPass === user.password) {
      showAlert("La nueva contraseña debe ser distinta a la clave actual.", 'error');
      return;
    }

    onUpdateUser({ ...user, password: newPass });
    showAlert("¡Contraseña cambiada exitosamente!", 'success');
    
    setIsEditingPassword(false);
    setShowPasswords(false);
    setNewPass('');
    setConfirmNewPass('');
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

  const handleRejectPhoto = () => {
    setPendingPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEmail = () => {
    window.location.href = "mailto:soporte@prode2026.com?subject=Consulta Prode Mundial 2026";
  };

  const handleShare = () => {
    // Generar un enlace inteligente que incluya el modo registro
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('mode', 'register');
    
    const text = `⚽ ¡Sumate al Prode del Mundial 2026 conmigo! Registrate aca para jugar: ${currentUrl.toString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleWebRedirect = () => {
    window.open(window.location.origin, '_blank');
  };

  if (activeLegalSubView) {
    const isTC = activeLegalSubView === 'tc';
    return (
      <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
        <div className="mb-4">
          <button onClick={() => setActiveLegalSubView(null)} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Volver
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
          <h2 className="heading-font text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-6">{isTC ? 'Términos y Condiciones' : 'Política de Privacidad'}</h2>
          <div className="prose dark:prose-invert text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-4 font-medium">
            <p>Contenido legal para {isTC ? 'términos y condiciones' : 'política de privacidad'}. Al utilizar la app aceptas que tus datos están protegidos localmente.</p>
          </div>
        </div>
      </main>
    );
  }

  if (activeSettingsSubView === 'theme') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
        <div className="mb-4">
          <button onClick={() => setActiveSettingsSubView(null)} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Volver
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">TEMA</h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mt-1">Elige la apariencia visual</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleThemeSelection('light')} 
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border-2 ${settings.theme === 'light' ? 'bg-slate-50 dark:bg-slate-700/50 border-black dark:border-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${settings.theme === 'light' ? 'bg-yellow-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-yellow-500'}`}>
                  <SunIcon />
                </div>
                <span className="heading-font font-black uppercase text-[11px] tracking-widest text-slate-700 dark:text-slate-200">Modo Claro</span>
              </div>
              {settings.theme === 'light' && (
                <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-md">
                  <CheckIcon />
                </div>
              )}
            </button>

            <button 
              onClick={() => handleThemeSelection('dark')} 
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border-2 ${settings.theme === 'dark' ? 'bg-slate-50 dark:bg-slate-700/50 border-black dark:border-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-indigo-400'}`}>
                  <MoonIcon />
                </div>
                <span className="heading-font font-black uppercase text-[11px] tracking-widest text-slate-700 dark:text-slate-200">Modo Oscuro</span>
              </div>
              {settings.theme === 'dark' && (
                <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-md">
                  <CheckIcon />
                </div>
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (showSettingsScreen) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="mb-4">
          <button onClick={() => setShowSettingsScreen(false)} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Volver
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-6 border border-slate-100 dark:border-slate-700">
          <div className="mb-8">
            <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">AJUSTES</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="heading-font text-[12px] font-black text-black dark:text-white uppercase tracking-[0.3em] italic border-l-4 border-orange-500 pl-3">APARIENCIA</h3>
              <button onClick={() => setActiveSettingsSubView('theme')} className="w-full p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group border border-transparent shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:rotate-12 transition-transform"><ThemeIcon /></div>
                  <span className="heading-font font-black uppercase tracking-widest text-[10px] text-slate-700 dark:text-slate-300">Tema</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 italic">Modo {settings.theme === 'light' ? 'Claro' : 'Oscuro'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="heading-font text-[12px] font-black text-black dark:text-white uppercase tracking-[0.3em] italic border-l-4 border-blue-600 pl-3">NOTIFICACIONES</h3>
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><BellIcon /><span className="heading-font text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">Resultados en vivo</span></div>
                  <button onClick={() => handleToggle('notifyResults')} className={`w-10 h-5 rounded-full transition-colors relative ${settings.notifyResults ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.notifyResults ? 'left-5.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><BellIcon /><span className="heading-font text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">Inicio de partidos</span></div>
                  <button onClick={() => handleToggle('notifyMatchStart')} className={`w-10 h-5 rounded-full transition-colors relative ${settings.notifyMatchStart ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.notifyMatchStart ? 'left-5.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="heading-font text-[12px] font-black text-black dark:text-white uppercase tracking-[0.3em] italic border-l-4 border-red-500 pl-3">SEGURIDAD</h3>
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4">
                {!isEditingPassword ? (
                  <button onClick={() => setIsEditingPassword(true)} className="w-full flex items-center justify-between heading-font font-black uppercase tracking-widest text-[11px] text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors">
                    Cambiar Contraseña <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </button>
                ) : (
                  <div className="space-y-3 animate-slide-down">
                    <div className="relative">
                      <input 
                        type={showPasswords ? "text" : "password"} 
                        value={newPass} 
                        onChange={e => setNewPass(e.target.value)} 
                        placeholder="Nueva Contraseña" 
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 text-xs font-bold outline-none focus:border-red-500 text-black dark:text-white" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {showPasswords ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPasswords ? "text" : "password"} 
                        value={confirmNewPass} 
                        onChange={e => setConfirmNewPass(e.target.value)} 
                        placeholder="Confirmar Nueva Contraseña" 
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 text-xs font-bold outline-none focus:border-red-500 text-black dark:text-white" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSavePassword} className="flex-1 bg-black dark:bg-black text-white py-2 rounded-xl heading-font font-black uppercase text-[10px] tracking-widest shadow-md">Aceptar</button>
                      <button onClick={() => { setIsEditingPassword(false); setShowPasswords(false); }} className="flex-1 bg-slate-200 dark:bg-slate-300 text-slate-600 dark:text-slate-700 py-2 rounded-xl heading-font font-black uppercase text-[10px] tracking-widest shadow-md">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="heading-font text-[12px] font-black text-black dark:text-white uppercase tracking-[0.3em] italic border-l-4 border-green-600 pl-3">MÁS</h3>
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 shadow-sm border border-slate-100 dark:border-slate-700">
                <button onClick={handleEmail} className="w-full flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all heading-font text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-4">
                    <MailIcon />
                    <span>Soporte Técnico</span>
                  </div>
                  <span className="text-blue-600 tracking-[0.2em] italic">Email</span>
                </button>
                <button onClick={() => setActiveLegalSubView('tc')} className="w-full flex items-center p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all heading-font text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-4">
                    <DocumentIcon />
                    <span>Términos y Condiciones</span>
                  </div>
                </button>
                <button onClick={() => setActiveLegalSubView('privacy')} className="w-full flex items-center p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all heading-font text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-4">
                    <ShieldIcon />
                    <span>Política de Privacidad</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          Volver
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 text-center border-b border-slate-100 dark:border-slate-700">
          <div className="relative inline-block group cursor-pointer" onClick={() => !pendingPhoto && fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <img src={pendingPhoto || user.photoUrl} className={`w-28 h-28 rounded-full border-4 ${pendingPhoto ? 'border-blue-500 animate-pulse' : 'border-white dark:border-slate-800'} shadow-md object-cover mx-auto group-hover:opacity-75 transition-all`} alt="Avatar" />
            {!pendingPhoto && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md">
                <PencilIcon />
              </div>
            )}
            <div className={`absolute top-1 right-1 w-6 h-6 border-4 border-white dark:border-slate-800 rounded-full ${pendingPhoto ? 'bg-blue-500' : 'bg-green-500'}`}></div>
          </div>

          {pendingPhoto && (
            <div className="mt-6 flex gap-3 max-w-[240px] mx-auto animate-slide-down">
              <button onClick={handleAcceptPhoto} className="flex-1 bg-black dark:bg-black text-white py-2 rounded-xl heading-font font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Aceptar</button>
              <button onClick={handleRejectPhoto} className="flex-1 bg-slate-200 dark:bg-slate-300 text-slate-600 dark:text-slate-700 py-2 rounded-xl heading-font font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Cancelar</button>
            </div>
          )}

          <div className="mt-4">
            <span className="heading-font text-[10px] font-black text-slate-400 uppercase tracking-widest italic block mb-1">Tu Apodo</span>
            {!isEditingNickname ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{user.username}</h2>
                  <button onClick={() => setIsEditingNickname(true)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    <PencilIcon color="black" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 animate-fade-in max-w-[200px] mx-auto">
                <input type="text" value={newNickname} onChange={e => setNewNickname(e.target.value)} className="w-full bg-white dark:bg-slate-100 border-2 border-blue-500 rounded-xl px-4 py-2 text-sm font-black text-center outline-none text-black" autoFocus />
                <div className="flex gap-2 w-full">
                  <button onClick={handleSaveNickname} className="flex-1 bg-black dark:bg-black text-white py-2 rounded-xl heading-font font-black uppercase text-[10px] tracking-widest shadow-md">Aceptar</button>
                  <button onClick={() => setIsEditingNickname(false)} className="flex-1 bg-slate-200 dark:bg-slate-300 text-slate-600 dark:text-slate-700 py-2 rounded-xl heading-font font-black uppercase text-[10px] tracking-widest shadow-md">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <button onClick={() => setShowRules(!showRules)} className="w-full p-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-between hover:bg-slate-900 dark:hover:bg-slate-100 transition-all group shadow-lg">
            <div className="flex items-center gap-4"><div className="w-8 h-8 bg-white/20 dark:bg-black/10 rounded-xl flex items-center justify-center heading-font font-black text-sm">?</div><span className="heading-font font-black uppercase tracking-widest text-[11px]">Reglas del Juego</span></div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showRules ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showRules && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-700 animate-slide-down">
              <ul className="space-y-2 heading-font text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                <li className="flex gap-2"><span className="text-green-600">●</span> 3 Puntos: Acierto Ganador</li>
                <li className="flex gap-2"><span className="text-blue-600">●</span> +1 Punto: Marcador Exacto</li>
              </ul>
            </div>
          )}

          <div className="pt-2">
            <h3 className="heading-font text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em] mb-4 ml-2 italic">OPCIONES</h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={handleShare} className="w-full p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group border border-transparent hover:border-green-500/20 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><ShareIcon /></div>
                  <span className="heading-font font-black uppercase tracking-widest text-[11px] text-slate-700 dark:text-slate-300">Invitar Amigos</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-black dark:group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>

              <button onClick={handleWebRedirect} className="w-full p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group border border-transparent hover:border-blue-500/20 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><GlobeIcon /></div>
                  <span className="heading-font font-black uppercase tracking-widest text-[11px] text-slate-700 dark:text-slate-300">Aplicación Web</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-black dark:group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>

              <button onClick={() => setShowSettingsScreen(true)} className="w-full p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group border border-transparent hover:border-black/10 dark:hover:border-white/10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><SettingsIcon /></div>
                  <span className="heading-font font-black uppercase tracking-widest text-[11px] text-slate-700 dark:text-slate-300">Ajustes</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-black dark:group-hover:text-white transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>

              <button onClick={onLogout} className="w-full p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-900/20 transition-all group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-95 transition-transform"><LogoutIcon /></div>
                  <span className="heading-font font-black uppercase tracking-widest text-[11px] text-red-600">Cerrar Sesión</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
