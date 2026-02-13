
import React from 'react';
import { WORLD_CUP_GROUPS, TEAM_FLAGS } from '../constants';

interface GroupsSummaryProps {
  onContinue: () => void;
  onBack?: () => void;
}

export const GroupsSummary: React.FC<GroupsSummaryProps> = ({ onContinue, onBack }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        )}
      </div>

      <div className="text-center mb-12">
        <h2 className="heading-font text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Clasificación</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipos Confirmados por Grupo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
        {WORLD_CUP_GROUPS.map((group, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="bg-black dark:bg-slate-900 px-5 py-4">
              <h3 className="text-white font-black text-center uppercase tracking-widest text-lg">{group.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              {group.teams.map((team, tIdx) => (
                <div key={tIdx} className="flex items-center gap-4 py-1 border-b border-slate-50 dark:border-slate-700 last:border-0">
                  <div className="w-10 h-6 overflow-hidden rounded-md shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0">
                    <img src={TEAM_FLAGS[group.flags[tIdx]]} alt={team} className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-sm font-black ${group.flags[tIdx] === 'FIFA' ? 'text-slate-300 dark:text-slate-500 italic' : 'text-slate-800 dark:text-slate-200 uppercase'}`}>
                    {team}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
