import React from 'react';
import { TEAM_FLAGS } from '../constants';

interface HistoryViewProps {
  onBack: () => void;
}

const WORLD_CHAMPIONS = [
  { name: 'Brasil', wins: 5, flag: 'BR', years: '1958, 1962, 1970, 1994, 2002' },
  { name: 'Alemania', wins: 4, flag: 'DE', years: '1954, 1974, 1990, 2014' },
  { name: 'Italia', wins: 4, flag: 'IT', years: '1934, 1938, 1982, 2006' },
  { name: 'Argentina', wins: 3, flag: 'AR', years: '1978, 1986, 2022' },
  { name: 'Francia', wins: 2, flag: 'FR', years: '1998, 2018' },
  { name: 'Uruguay', wins: 2, flag: 'UY', years: '1930, 1950' },
  { name: 'España', wins: 1, flag: 'ES', years: '2010' },
  { name: 'Inglaterra', wins: 1, flag: 'GB-ENG', years: '1966' },
];

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6 sm:py-8 animate-fade-in space-y-6 sm:space-y-8">
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-white font-black text-xs sm:text-sm uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-5 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/30"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Volver</span>
          </button>
        </div>

      {/* Ranking Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-4 sm:p-10 border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 dark:bg-amber-400/10 text-amber-500 dark:text-amber-400 rounded-3xl mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/5 transition-transform hover:scale-110 duration-300">
            <svg 
              className="w-8 h-8 sm:w-10 sm:h-10" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              <path d="m11.5 5.5.5 1.1 1.2.2-.9.9.2 1.2-1-.5-1 .5.2-1.2-.9-.9 1.2-.2z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="heading-font text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter italic">RANKING HISTÓRICO</h2>
          <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">CAMPEONES DE LA COPA DEL MUNDO</p>
        </div>

        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-50 dark:border-slate-700">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="w-10 sm:w-16 px-2 sm:px-6 py-3 sm:py-4 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">#</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">País</th>
                <th className="w-20 sm:w-32 px-2 sm:px-6 py-3 sm:py-4 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Títulos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {WORLD_CHAMPIONS.map((country, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-2 sm:px-6 py-3 sm:py-5 text-center">
                    <span className={`text-[10px] sm:text-xs font-black ${idx < 3 ? 'text-yellow-600' : 'text-slate-300'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-5 overflow-hidden">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-8 h-5 sm:w-10 sm:h-6 overflow-hidden rounded shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-50">
                        <img 
                          src={TEAM_FLAGS[country.flag] || `https://flagcdn.com/${country.flag.toLowerCase()}.svg`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate block">
                          {country.name}
                        </span>
                        <span className="text-[7px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter block truncate">
                          {country.years}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-5 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white">
                        {country.wins}
                      </span>
                      {country.wins > 0 && (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" />
                        </svg>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-700 text-center">
          <p className="text-[7px] sm:text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] italic">
            EL FÚTBOL NO ES SOLO UN JUEGO • 2026
          </p>
        </div>
      </div>
    </div>
  );
};