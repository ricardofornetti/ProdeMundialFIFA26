
import React, { useState, useEffect } from 'react';
import { User, AuthMode } from '../types';
import { signInWithGoogle, loginUser, resetPassword, completeRegistration, registerUser } from '../services/firebaseService';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode | 'setup-profile' | 'test-mode' | 'test-register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo_custom');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, []);

  const handleAppLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es muy pesada. Por favor sube una de menos de 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomLogo(dataUrl);
      localStorage.setItem('app_logo_custom', dataUrl);
      // Actualizar también en tiempo real si el usuario lo ve
      window.dispatchEvent(new Event('storage'));
    };
    reader.readAsDataURL(file);
  };
  const [tempUser, setTempUser] = useState<User | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result) {
        if (result.isNew) {
          setTempUser(result.user);
          setUsername(result.user.username);
          setPhotoPreview(result.user.photoUrl);
          setMode('setup-profile');
        } else {
          onAuthSuccess(result.user);
        }
      } else {
        setError('No se pudo completar el inicio de sesión con Google. ¿Tal vez bloqueaste el popup?');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('La ventana de Google se cerró antes de terminar. Intenta de nuevo.');
      } else {
        setError(err.message || 'Error al conectar con Google. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;
    setError('');
    setIsLoading(true);
    try {
      const updatedUser = {
        ...tempUser,
        username,
        photoUrl: photoPreview || tempUser.photoUrl
      };
      
      const user = await completeRegistration(updatedUser);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('No se pudo completar el registro.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al completar el registro. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const newUser = {
        username,
        email,
        password,
        photoUrl: photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
        isVerified: true,
        role: 'user' as const
      };
      
      const user = await registerUser(newUser);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('No se pudo registrar el usuario. Prueba con otro email.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al registrar usuario. Email o apodo duplicado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      setError('No pudimos enviar el correo de recuperación. Verifica el email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'forgot-password') {
    return (
      <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-100 animate-fade-in">
        <div className="text-center mb-10">
          <h2 className="heading-font text-3xl text-slate-900 font-black mb-2 uppercase tracking-tighter">RECUPERAR</h2>
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Ingresa tu correo para resetear</p>
        </div>

        {resetSent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
            </div>
            <p className="text-slate-600 text-sm font-medium">¡Listo! Revisa tu correo para las instrucciones.</p>
            <button onClick={() => setMode('login')} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95">Volver al inicio</button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
                placeholder="tu@email.com"
              />
            </div>
            <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50">
              {isLoading ? 'ENVIANDO...' : 'ENVIAR INSTRUCCIONES'}
            </button>
            <button type="button" onClick={() => setMode('login')} className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Cancelar</button>
          </form>
        )}
      </div>
    );
  }

  if (mode === 'setup-profile') {
    return (
      <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-100 animate-fade-in relative overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="heading-font text-3xl text-slate-900 font-black mb-2 uppercase tracking-tighter">CASI LISTO</h2>
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest px-4">Personaliza tu perfil de jugador</p>
        </div>

        <form onSubmit={handleCompleteProfile} className="space-y-6">
          <div className="flex flex-col items-center gap-4 mb-2">
            <div 
              className="w-24 h-24 rounded-3xl border-4 border-slate-100 bg-slate-50 overflow-hidden cursor-pointer relative group shadow-inner"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[8px] font-black uppercase">Cambiar Foto</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto de Perfil</label>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tu Apodo / Nickname</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
              placeholder="Ej: ElGoleador"
            />
          </div>

          <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50">
            {isLoading ? 'GUARDANDO...' : 'COMENZAR A JUGAR'}
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              setMode('login');
              setTempUser(null);
            }} 
            className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            Cancelar
          </button>
        </form>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-100 animate-fade-in relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-600/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-600/5 rounded-full blur-2xl"></div>
        
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner">
            <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="heading-font text-3xl sm:text-4xl text-slate-900 font-black mb-2 uppercase tracking-tighter">
            REGÍSTRATE
          </h2>
          <p className="text-slate-400 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em]">
            Solo con tu cuenta de Google
          </p>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="w-full py-4 sm:py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition-all uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" opacity="0.9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" opacity="0.8" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="currentColor" opacity="0.9" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>REGISTRAR CON GOOGLE</span>
        </button>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-100 p-3 rounded-xl animate-shake">
            <p className="text-red-600 text-[10px] font-black text-center uppercase tracking-wider">
              {error}
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-[10px] font-medium">
            ¿Ya tienes cuenta? <button onClick={() => setMode('login')} className="text-indigo-600 font-black uppercase tracking-widest ml-1">Inicia Sesión</button>
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'test-mode' || mode === 'test-register') {
    const isRegistering = mode === 'test-register';
    
    return (
      <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-100 animate-fade-in relative overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="heading-font text-3xl text-slate-900 font-black mb-2 uppercase tracking-tighter text-center">
            {isRegistering ? 'REGISTRO TEST' : 'LOGIN TEST'}
          </h2>
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-center mt-2 px-4">
            {isRegistering ? 'Crea una cuenta ficticia para pruebas' : 'Ingresa con una cuenta de prueba'}
          </p>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
          {isRegistering && (
            <>
              <div className="flex flex-col items-center gap-4 mb-2">
                <div 
                  className="w-20 h-20 rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[8px] font-black uppercase">Cambiar</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Foto de Perfil</label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Apodo / Username</label>
                <input 
                  type="text" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
                  placeholder="Ej: TestingFan"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
              placeholder="tu@test.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={isLoading}
            className="w-full py-4 sm:py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition-all uppercase tracking-widest text-xs sm:text-sm active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'PROCESANDO...' : (isRegistering ? 'CREAR CUENTA' : 'INGRESAR (TEST)')}
          </button>
          
          <div className="flex flex-col gap-4 items-center">
            <button 
              type="button" 
              onClick={() => setMode(isRegistering ? 'test-mode' : 'test-register')} 
              className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700"
            >
              {isRegistering ? '¿Ya tienes cuenta test? Login' : '¿No tienes cuenta? Registrarse'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setMode('login')} 
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all"
            >
              Volver a Google Login
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-100 p-3 rounded-xl">
            <p className="text-red-600 text-[10px] font-black text-center uppercase tracking-wider">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-100 animate-fade-in relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-600/5 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -right-10 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-600/5 rounded-full blur-2xl"></div>
      
      <div className="text-center mb-12 sm:mb-16">
        <div className="relative inline-block">
          <div className="w-28 h-28 sm:w-40 sm:h-40 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden border-2 border-slate-50">
            <img 
              src="./logo_mundial.png" 
              alt="App Logo" 
              className="w-full h-full object-contain p-4" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/FIFA_World_Cup_2026_logo.svg/800px-FIFA_World_Cup_2026_logo.svg.png";
              }}
            />
          </div>
        </div>
        
        <h2 className="heading-font text-3xl sm:text-4xl text-slate-900 font-black mb-2 uppercase tracking-tighter">
          COPA MUNDIAL <span className="text-indigo-600">FIFA 2026</span>
        </h2>
        <p className="min-h-[1.5em]"></p>
      </div>

      <div className="space-y-6">
        <button 
          type="button"
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="w-full py-4 sm:py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition-all uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" opacity="0.9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" opacity="0.8" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="currentColor" opacity="0.9" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{isLoading ? 'CARGANDO...' : 'INGRESAR CON GOOGLE'}</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">O</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="w-full py-4 sm:py-5 border-2 border-indigo-600 text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50"
        >
          <span>{isLoading ? 'PROCESANDO...' : 'REGISTRARSE'}</span>
        </button>

        {/* MODO TEST ACCESIBLE PARA EL CLIENTE */}
        <div className="pt-4 flex flex-col items-center border-t border-slate-50 mt-4">
          <button 
            type="button" 
            onClick={() => setMode('test-mode')}
            className="text-[8px] font-black text-slate-300 hover:text-indigo-400 uppercase tracking-[0.2em] transition-colors"
          >
            • Habilitar Modo Test (Email) •
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-100 p-3 rounded-xl animate-shake">
          <p className="text-red-600 text-[10px] font-black text-center uppercase tracking-wider">
            {error}
          </p>
        </div>
      )}

      <div className="mt-12 text-center pt-8 border-t border-slate-50">
        <p className="text-slate-300 font-black uppercase text-[8px] tracking-[0.3em]">
          FIFA WORLD CUP 2026
        </p>
      </div>
    </div>
  );
};
