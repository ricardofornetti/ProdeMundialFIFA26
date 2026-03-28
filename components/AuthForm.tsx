
import React, { useState } from 'react';
import { User, AuthMode } from '../types';
import { signInWithGoogle, loginUser, resetPassword, completeRegistration } from '../services/firebaseService';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode | 'set-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result) {
        if (result.isNew) {
          // If it's a new user, we need them to set a password
          setTempUser(result.user);
          setMode('set-password');
        } else {
          onAuthSuccess(result.user);
        }
      } else {
        setError('No se pudo completar el inicio de sesión con Google.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con Google. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;
    setError('');
    setIsLoading(true);
    try {
      const user = await completeRegistration(tempUser, password);
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
            <button onClick={() => setMode('login')} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs">Volver al inicio</button>
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

  if (mode === 'set-password') {
    return (
      <div className="max-w-[340px] xs:max-w-md w-full mx-auto bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-100 animate-fade-in">
        <div className="text-center mb-10">
          <h2 className="heading-font text-3xl text-slate-900 font-black mb-2 uppercase tracking-tighter">CASI LISTO</h2>
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Crea una contraseña para tu cuenta</p>
        </div>

        <form onSubmit={handleCompleteRegistration} className="space-y-6">
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
          <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50">
            {isLoading ? 'COMPLETANDO...' : 'FINALIZAR REGISTRO'}
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
          BIENVENIDO
        </h2>
        <p className="text-slate-400 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em]">
          Prode Mundial 2026
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email o Usuario</label>
          <input 
            type="text" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
            placeholder="Ingresa tu email o usuario"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
            <button 
              type="button" 
              onClick={() => setMode('forgot-password')}
              className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700"
            >
              ¿Olvidaste?
            </button>
          </div>
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
          {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
        </button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-100"></div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">O</span>
        <div className="flex-1 h-px bg-slate-100"></div>
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
        <span>INGRESAR CON GOOGLE</span>
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
          ¿No tienes cuenta? <button onClick={() => setMode('register')} className="text-indigo-600 font-black uppercase tracking-widest ml-1">Regístrate con Google</button>
        </p>
      </div>

      <div className="mt-12 text-center pt-8 border-t border-slate-50">
        <p className="text-slate-300 font-black uppercase text-[8px] tracking-[0.3em]">
          FIFA WORLD CUP 2026 • PRODE OFICIAL
        </p>
      </div>
    </div>
  );
};
