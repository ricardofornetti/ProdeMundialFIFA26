
import React from 'react';
import ReactDOM from 'react-dom/client';

// Safe localStorage polyfill/wrapper to prevent SecurityError from breaking the iframe applets
if (typeof window !== 'undefined') {
  let isLocalStorageAvailable = false;
  try {
    const testKey = '__test_ls__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    isLocalStorageAvailable = true;
  } catch (e) {
    console.warn("localStorage is not available/blocked. Using in-memory fallback store.");
  }

  if (!isLocalStorageAvailable) {
    const memoryStore: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in memoryStore ? memoryStore[key] : null;
      },
      setItem: (key: string, value: string): void => {
        memoryStore[key] = String(value);
      },
      removeItem: (key: string): void => {
        delete memoryStore[key];
      },
      clear: (): void => {
        for (const key in memoryStore) {
          if (Object.prototype.hasOwnProperty.call(memoryStore, key)) {
            delete memoryStore[key];
          }
        }
      },
      key: (index: number): string | null => {
        const keys = Object.keys(memoryStore);
        return keys[index] || null;
      },
      get length(): number {
        return Object.keys(memoryStore).length;
      }
    };

    try {
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
        configurable: true
      });
    } catch (e) {
      console.error("Unable to override blocked window.localStorage:", e);
    }
  }
}

import App from './App';
import { registerSW } from 'virtual:pwa-register';

let updateSW: any = null;

// Global safety net for unhandled promise rejections (often caused by sandbox/iframe limits or blocked service workers/localStorages)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection caught safely:', event.reason);
    event.preventDefault();
  });
}

const isTopLevel = typeof window !== 'undefined' && window.self === window.top;

if (isTopLevel && 'serviceWorker' in navigator) {
  try {
    updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
          if (updateSW) updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('La aplicación está lista para usarse sin conexión.');
      },
    });
  } catch (error) {
    console.warn('Service worker registration failed safely:', error);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
