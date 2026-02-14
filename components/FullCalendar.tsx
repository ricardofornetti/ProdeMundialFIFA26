import React from 'react';
import { Match } from '../types';
import { TEAM_FLAGS } from '../constants';

interface FullCalendarProps {
  matches: Match[];
}

export const FullCalendar: React.FC<FullCalendarProps> = ({ matches }) => {
  // Función para obtener objeto Date real para ordenamiento preciso
  const getSortableDate = (match: Match) => {
    // Convertir "11 Jun 2026" a un formato estándar
    return new Date(`${match.date} ${match.time}`).getTime();
  };

  // Ordenar cronológicamente de forma ascendente
  const sortedMatches = [...matches].sort((a, b) => getSortableDate(a) - getSortableDate(b));

  // Agrupar por fecha
  const groupedMatches = sortedMatches.reduce((groups: { [key: string]: Match[] }, match) => {
    const date = match.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(match);
    return groups;
  }, {});

  const dates = Object.keys(groupedMatches);

  return (
    <div className="animate-fade-in space-y-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-black dark:border-white pb-4 mb-8">
        <div>
          <h3 className="heading-font text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
            CALENDARIO
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">
            FIFA WORLD CUP 2026™
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-700">
            Horario Local (ARG)
          </span>
        </div>
      </div>

      <div className="space-y-16">
        {dates.map((date) => (
          <div key={date} className="relative">
            {/* Header de Fecha Estilo FIFA */}
            <div className="sticky top-16 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-4 border-b border-slate-200 dark:border-slate-700 mb-6">
              <div className="flex items-center gap-4">
                <span className="heading-font text-2xl font-black text-slate-900 dark:text-white uppercase">
                  {date}
                </span>
              </div>
            </div>

            {/* Lista de Partidos del Día */}
            <div className="space-y-4">
              {groupedMatches[date].map((match) => (
                <div 
                  key={match.id} 
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="p-5 sm:p-7">
                    {/* Top: Hora y Fase/Grupo */}
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                          {match.time} HS
                        </span>
                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-600"></div>
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                          {match.group}
                        </span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">FIFA WORLD CUP™</span>
                      </div>
                    </div>

                    {/* Middle: Equipos y Banderas */}
                    <div className="flex items-center justify-between gap-4 sm:gap-12 relative">
                      {/* Local */}
                      <div className="flex-1 flex flex-col items-center sm:flex-row sm:justify-end gap-3 text-center sm:text-right">
                        <span className="order-2 sm:order-1 text-sm sm:text-lg font-black text-slate-900 dark:text-white uppercase truncate w-full sm:w-auto">
                          {match.homeTeam}
                        </span>
                        <div className="order-1 sm:order-2 w-14 h-9 sm:w-20 sm:h-12 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-50">
                          <img src={TEAM_FLAGS[match.homeFlag] || TEAM_FLAGS['FIFA']} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>

                      {/* Separador VS */}
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">VS</span>
                      </div>

                      {/* Visitante */}
                      <div className="flex-1 flex flex-col items-center sm:flex-row sm:justify-start gap-3 text-center sm:text-left">
                        <div className="w-14 h-9 sm:w-20 sm:h-12 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-50">
                          <img src={TEAM_FLAGS[match.awayFlag] || TEAM_FLAGS['FIFA']} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white uppercase truncate w-full sm:w-auto">
                          {match.awayTeam}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Estadio y Ciudad (Debajo de las banderas) */}
                    <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                          {match.venue.split(',')[0]}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        {match.venue.split(',')[1]?.trim() || ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="py-20 text-center">
        <div className="inline-block p-10 bg-slate-100 dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.6em] mb-4 italic">
            CAMINO A LA GLORIA • 2026
          </p>
          <div className="flex items-center justify-center gap-6">
             <div className="h-[2px] w-12 bg-slate-300 dark:bg-slate-600"></div>
             <svg className="w-8 h-8 text-yellow-500 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" />
             </svg>
             <div className="h-[2px] w-12 bg-slate-300 dark:bg-slate-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};