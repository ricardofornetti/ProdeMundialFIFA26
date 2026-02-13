
import React, { useState, useRef, useEffect } from 'react';
import { AuthMode, User } from '../types';
import { generateValidationEmail } from '../services/geminiService';
import { db, getUserAccount, saveUserAccount } from '../services/firebaseService';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
  initialMode?: AuthMode;
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
const GOOGLE_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser';

type GoogleStep = 'idle' | 'email' | 'password';

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, initialMode }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode || 'login');
  const [googleStep, setGoogleStep] = useState<GoogleStep>('idle');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedEmailContent, setSimulatedEmailContent] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
  }, [mode, googleStep]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isValidEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!photo) {
          setError('Carga una foto de perfil para continuar.');
          setIsLoading(false);
          return;
        }
        if (username.trim().length < 3) {
          setError('El usuario debe tener al menos 3 caracteres.');
          setIsLoading(false);
          return;
        }
        if (!isValidEmail(email)) {
          setError('Ingresa un correo válido.');
          setIsLoading(false);
          return;
        }
        
        const existingUser = await getUserAccount(email);
        if (existingUser) {
          setError('Este correo ya está registrado.');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden.');
          setIsLoading(false);
          return;
        }

        const emailBody = await generateValidationEmail(username, photo);
        setSimulatedEmailContent(emailBody);
        setMode('verify');
      } else if (mode === 'login') {
        const user = await getUserAccount(email); 
        
        if (user && user.password === password) {
          if (!user.isVerified) {
            setError('Cuenta no verificada.');
            setMode('verify');
            setIsLoading(false);
            return;
          }
          onAuthSuccess(user);
        } else {
          setError('Usuario o contraseña incorrectos.');
        }
      } else if (mode === 'forgot-password') {
        if (!isValidEmail(email)) {
          setError('Ingresa un correo válido.');
          setIsLoading(false);
          return;
        }
        setSuccessMsg('Si el correo existe, recibirás instrucciones de recuperación.');
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error en la conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (googleStep === 'email') {
      if (!isValidEmail(email) || !email.endsWith('@gmail.com')) {
        setError('Ingresa una cuenta de Gmail válida.');
        return;
      }
      setGoogleStep('password');
    } else if (googleStep === 'password') {
      setIsLoading(true);
      if (password.length < 4) {
        setError('La contraseña es demasiado corta.');
        setIsLoading(false);
        return;
      }
      
      try {
        const googleUser: User = {
          username: email.split('@')[0],
          email: email,
          photoUrl: GOOGLE_AVATAR,
          isVerified: true,
          password: 'google_oauth_simulated'
        };
        
        await saveUserAccount(googleUser);
        onAuthSuccess(googleUser);
      } catch (err) {
        setError('Error al sincronizar con Google.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === '2026') {
      setIsLoading(true);
      try {
        const newUser: User = { 
          username, 
          email, 
          photoUrl: photo || DEFAULT_AVATAR, 
          password, 
          isVerified: true,
          totalScore: 0
        };
        
        await saveUserAccount(newUser);
        onAuthSuccess(newUser);
      } catch (err) {
        setError('Error al crear la cuenta en la nube.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Código incorrecto. Intenta "2026"');
    }
  };

  if (googleStep !== 'idle') {
    return (
      <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200 animate-fade-in text-center font-sans relative transition-all">
        <button 
          onClick={() => setGoogleStep('idle')}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-blue-600 transition-colors"
          title="Regresar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 mb-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <h2 className="text-lg sm:text-xl font-medium text-slate-800 mb-1">Iniciar sesión</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Usa tu cuenta de Google</p>
          {googleStep === 'password' && (
            <div className="mt-3 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-600 uppercase">{email.charAt(0)}</div>
              <span className="text-[10px] font-medium text-slate-700">{email}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleGoogleSubmit} className="space-y-4 sm:space-y-6 text-left">
          {googleStep === 'email' ? (
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 sm:py-4 rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 placeholder-slate-400 font-sans text-sm"
                placeholder="Correo electrónico o teléfono"
                required
              />
              <button type="button" className="mt-2 text-blue-600 font-medium text-xs hover:underline">¿Has olvidado tu correo?</button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 sm:py-4 rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 placeholder-slate-400 font-sans text-sm"
                  placeholder="Introduce tu contraseña"
                  required
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="show-pass-google" 
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
                <label htmlFor="show-pass-google" className="text-xs text-slate-600 cursor-pointer select-none">Mostrar contraseña</label>
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-[10px] text-center bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex justify-between items-center mt-6 sm:mt-10">
            <button 
              type="button" 
              onClick={() => {
                if (googleStep === 'password') setGoogleStep('email');
                else setGoogleStep('idle');
              }}
              className="text-blue-600 font-medium text-xs px-3 py-2 hover:bg-blue-50 rounded-md transition-colors"
            >
              {googleStep === 'email' ? 'Crear cuenta' : 'Atrás'}
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 sm:px-8 py-2 sm:py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {isLoading ? '...' : 'Siguiente'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (mode === 'verify') {
    return (
      <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="heading-font text-xl text-slate-900 font-black mb-1 uppercase tracking-tighter">Validar Registro</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Revisa tu bandeja de entrada simulada</p>
        </div>

        {/* Bandeja de entrada simulada */}
        <div className="mb-6 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Email Recibido</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
          </div>
          <div className="p-4 bg-white max-h-48 overflow-y-auto text-left">
            <div className="mb-3">
              <p className="text-[9px] font-black text-slate-400 uppercase">De: <span className="text-blue-600">noreply@prode2026.com</span></p>
              <p className="text-[9px] font-black text-slate-400 uppercase">Asunto: <span className="text-slate-800">Tu código de acceso al Mundial</span></p>
            </div>
            <div className="prose prose-sm text-slate-600 font-medium text-[11px] leading-relaxed italic border-t border-slate-50 pt-3">
              {simulatedEmailContent}
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase text-center tracking-widest">Ingresa el código de 4 dígitos</label>
            <input 
              type="text" 
              maxLength={4} 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              className="w-full text-center text-3xl tracking-[0.5em] px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-black outline-none font-black text-black bg-slate-50 shadow-inner" 
              placeholder="0000" 
              required 
            />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black text-center uppercase animate-shake">{error}</p>}
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-4 bg-black text-white font-black text-sm rounded-2xl shadow-xl hover:bg-slate-900 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {isLoading ? 'ACTIVANDO...' : 'ACTIVAR CUENTA'}
          </button>
          <button 
            type="button" 
            onClick={() => setMode('register')} 
            className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-black transition-colors"
          >
            ¿No recibiste nada? Volver a intentar
          </button>
        </form>
      </div>
    );
  }

  if (mode === 'forgot-password') {
    return (
      <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-slate-100 animate-fade-in relative">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="heading-font text-2xl sm:text-3xl text-slate-900 font-black mb-1 uppercase tracking-tighter">RECUPERAR</h2>
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Restablece tu contraseña</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 sm:py-4 rounded-xl border-2 border-slate-50 focus:border-black outline-none transition-all font-bold text-slate-800 bg-slate-50/50 text-xs" placeholder="ejemplo@prode.com" required />
          </div>
          {error && <p className="text-red-600 text-[10px] font-black text-center uppercase bg-red-50 py-2 rounded-lg">{error}</p>}
          {successMsg && <p className="text-green-600 text-[10px] font-black text-center uppercase bg-green-50 py-2 rounded-lg">{successMsg}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-3 sm:py-4 bg-black text-white font-black rounded-2xl shadow-xl hover:bg-slate-900 transition-all uppercase tracking-widest text-xs sm:text-sm disabled:opacity-50">
            {isLoading ? 'ENVIANDO...' : 'ENVIAR INSTRUCCIONES'}
          </button>
          <button type="button" onClick={() => setMode('login')} className="w-full font-black text-slate-400 hover:text-black uppercase text-[9px] tracking-widest mt-2">Volver</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-slate-100 animate-fade-in relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-24 h-24 sm:w-32 sm:h-32 bg-slate-900/5 rounded-full blur-2xl"></div>
      
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="heading-font text-2xl sm:text-3xl text-slate-900 font-black mb-1 uppercase tracking-tighter">
          {mode === 'login' ? 'INGRESO' : 'REGISTRO'}
        </h2>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
          {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta prode'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {mode === 'register' && (
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-black cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-center bg-white overflow-hidden relative group" onClick={() => fileInputRef.current?.click()}>
              {photo ? <img src={photo} alt="Profile" className="w-full h-full object-cover" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-slate-200 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <span className="text-[8px] font-black text-slate-400 uppercase mt-2">Tu Foto de Perfil</span>
          </div>
        )}

        <div className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">Nombre de Usuario</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border-2 border-slate-50 focus:border-black outline-none transition-all font-bold text-slate-800 bg-slate-50/50 text-xs" placeholder="Ej: Messi_10" required={mode === 'register'} />
            </div>
          )}

          <div>
            <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">{mode === 'login' ? 'Usuario o Email' : 'Correo Electrónico'}</label>
            <input type={mode === 'login' ? "text" : "email"} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border-2 border-slate-50 focus:border-black outline-none transition-all font-bold text-slate-800 bg-slate-50/50 text-xs" placeholder={mode === 'login' ? "Tu usuario o email" : "ejemplo@prode.com"} required />
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border-2 border-slate-50 focus:border-black outline-none transition-all font-bold text-slate-800 bg-slate-50/50 text-xs" 
                placeholder="••••••••" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot-password')} className="mt-1 block text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline">¿Olvidaste tu contraseña?</button>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">Confirmar Contraseña</label>
              <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border-2 border-slate-50 focus:border-black outline-none transition-all font-bold text-slate-800 bg-slate-50/50 text-xs" placeholder="••••••••" required={mode === 'register'} />
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-[10px] font-black text-center uppercase bg-red-50 py-2 rounded-lg">{error}</p>}

        <div className="space-y-2 sm:space-y-3 pt-2">
          <button type="submit" disabled={isLoading} className="w-full py-3 sm:py-4 bg-black text-white font-black rounded-2xl shadow-xl hover:bg-slate-900 transition-all uppercase tracking-widest text-xs sm:text-sm disabled:opacity-50">
            {isLoading ? 'PROCESANDO...' : (mode === 'login' ? 'INGRESAR' : 'REGISTRARSE')}
          </button>

          {mode === 'login' && (
            <button 
              type="button" 
              onClick={() => setMode('register')}
              className="w-full py-3 sm:py-4 bg-black text-white font-black rounded-2xl shadow-xl hover:bg-slate-900 transition-all uppercase tracking-widest text-xs sm:text-sm"
            >
              REGISTRARSE
            </button>
          )}
          
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-[1px] bg-slate-100"></div>
            <span className="text-[8px] font-black text-slate-300 uppercase">o</span>
            <div className="flex-1 h-[1px] bg-slate-100"></div>
          </div>

          <button 
            type="button" 
            onClick={() => setGoogleStep('email')} 
            className="w-full py-3 sm:py-4 bg-white text-slate-700 font-black rounded-2xl border-2 border-slate-100 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            INICIAR SESION CON GOOGLE
          </button>
        </div>
      </form>

      <div className="mt-6 sm:mt-8 text-center pt-4 sm:pt-6 border-t border-slate-50">
        <button onClick={() => setMode(mode === 'register' ? 'login' : 'register')} className="font-black text-slate-400 hover:text-black transition-colors uppercase text-[9px] tracking-widest">
          {mode === 'register' ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
        </button>
      </div>
    </div>
  );
};
