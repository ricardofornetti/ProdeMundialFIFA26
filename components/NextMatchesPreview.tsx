
import React from 'react';
import { Match } from '../types';
import { TEAM_FLAGS } from '../constants';

interface NextMatchesPreviewProps {
  matches: Match[];
}

export const NextMatchesPreview: React.FC<NextMatchesPreviewProps> = ({ matches }) => {
  // Obtenemos los próximos 5 partidos (aquellos que no tienen resultado aún)
  const nextMatches = matches
    .filter(m => m.actualHomeScore === undefined)
    .slice(0, 5);

  if (nextMatches.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No hay más encuentros programados próximamente.</p>
      </div>
    );
  }

  return (
    <section className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2 px-2">
        <h3 className="heading-font text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
          PRÓXIMOS ENCUENTROS
        </h3>
        <span className="self-start text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
          HORARIO ARGENTINA (GMT-3)
        </span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 divide-y divide-slate-50 dark:divide-slate-700 overflow-hidden">
        {nextMatches.map((match) => (
          <div key={match.id} className="p-6 sm:p-8 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all">
            {/* Info Temporal */}
            <div className="flex flex-col gap-1 w-24 sm:w-32 flex-shrink-0">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {match.date.split(' ').slice(0, 2).join(' ')}
              </span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 leading-none">
                {match.time} HS
              </span>
            </div>

            {/* Enfrentamiento Principal */}
            <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="hidden md:inline text-[13px] font-black text-slate-900 dark:text-white uppercase truncate">
                  {match.homeTeam}
                </span>
                <div className="w-10 h-7 sm:w-14 sm:h-9 overflow-hidden rounded-md shadow-md border border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-100">
                  <img src={TEAM_FLAGS[match.homeFlag] || TEAM_FLAGS['FIFA']} alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">VS</span>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-start">
                <div className="w-10 h-7 sm:w-14 sm:h-9 overflow-hidden rounded-md shadow-md border border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-100">
                  <img src={TEAM_FLAGS[match.awayFlag] || TEAM_FLAGS['FIFA']} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="hidden md:inline text-[13px] font-black text-slate-900 dark:text-white uppercase truncate">
                  {match.awayTeam}
                </span>
              </div>
            </div>

            {/* Detalles de Grupo / Sede */}
            <div className="w-20 sm:w-32 text-right flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-tighter block truncate max-w-full">
                {match.group}
              </span>
              <span className="hidden sm:block text-[8px] font-bold text-slate-400 uppercase truncate max-w-full">
                {match.venue.split(',')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center bg-slate-200/30 dark:bg-slate-800/50 py-4 rounded-3xl">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] italic">
          ¡PREPÁRATE PARA EL MUNDIAL 2026!
        </p>
      </div>
    </section>
  );
};
