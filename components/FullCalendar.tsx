import React from 'react';
import { Match, Prediction } from '../types';
import { TEAM_FLAGS } from '../constants';

interface FullCalendarProps {
  matches: Match[];
  predictions?: Prediction[];
  userId?: string;
}

function calcPoints(
  pHome: number, pAway: number,
  rHome: number, rAway: number
): number {
  const pResult = pHome > pAway ? 'home' : pHome < pAway ? 'away' : 'draw';
  const rResult = rHome > rAway ? 'home' : rHome < rAway ? 'away' : 'draw';
  if (pResult !== rResult) return 0;
  return pHome === rHome && pAway === rAway ? 4 : 3;
}

export const FullCalendar: React.FC<FullCalendarProps> = ({ matches, predictions = [] }) => {
  const [activeTab, setActiveTab] = React.useState<'pending' | 'finished'>('pending');

  const getSortableDate = (match: Match) =>
    new Date(`${match.date} ${match.time}`).getTime();

  const sortedMatches = [...matches].sort((a, b) => getSortableDate(a) - getSortableDate(b));

  const finishedMatches = sortedMatches.filter(
    m => m.actualHomeScore !== undefined && m.actualAwayScore !== undefined
  );
  const pendingMatches = sortedMatches.filter(
    m => m.actualHomeScore === undefined || m.actualAwayScore === undefined
  );

  const groupByDate = (list: Match[]) =>
    list.reduce((groups: { [key: string]: Match[] }, match) => {
      const date = match.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(match);
      return groups;
    }, {});

  const pendingGrouped = groupByDate(pendingMatches);
  const finishedGrouped = groupByDate(finishedMatches);

  const getPrediction = (matchId: string) =>
    predictions.find(p => p.matchId === matchId);

  const totalPredictionsSaved = predictions.filter(p => p.homeScore !== '' && p.awayScore !== '').length;

  const correctExactCount = predictions.filter(pred => {
    const m = matches.find(x => x.id === pred.matchId);
    if (!m || m.actualHomeScore === undefined || m.actualAwayScore === undefined) return false;
    return Number(pred.homeScore) === Number(m.actualHomeScore) && Number(pred.awayScore) === Number(m.actualAwayScore);
  }).length;

  const correctWinnerCount = predictions.filter(pred => {
    const m = matches.find(x => x.id === pred.matchId);
    if (!m || m.actualHomeScore === undefined || m.actualAwayScore === undefined) return false;
    const pSign = Math.sign(Number(pred.homeScore) - Number(pred.awayScore));
    const rSign = Math.sign(Number(m.actualHomeScore) - Number(m.actualAwayScore));
    return pSign === rSign && !(Number(pred.homeScore) === Number(m.actualHomeScore) && Number(pred.awayScore) === Number(m.actualAwayScore));
  }).length;

  const userScore = predictions.reduce((total, pred) => {
    const m = matches.find(x => x.id === pred.matchId);
    if (!m || m.actualHomeScore === undefined || m.actualAwayScore === undefined) return total;
    const pHome = Number(pred.homeScore);
    const pAway = Number(pred.awayScore);
    const rHome = m.actualHomeScore;
    const rAway = m.actualAwayScore;
    if (isNaN(pHome) || isNaN(pAway)) return total;
    const pResult = pHome > pAway ? 'home' : pHome < pAway ? 'away' : 'draw';
    const rResult = rHome > rAway ? 'home' : rHome < rAway ? 'away' : 'draw';
    let matchPoints = 0;
    if (pResult === rResult) {
      matchPoints += 3;
      if (pHome === rHome && pAway === rAway) matchPoints += 1;
    }
    return total + matchPoints;
  }, 0);

  const renderMatchRow = (match: Match, isFinished: boolean) => {
    const pred = getPrediction(match.id);
    const hasPred = pred && pred.homeScore !== '' && pred.awayScore !== '';
    const hasResult = match.actualHomeScore !== undefined && match.actualAwayScore !== undefined;

    let pointsEarned: number | null = null;
    if (hasPred && hasResult) {
      pointsEarned = calcPoints(
        Number(pred!.homeScore), Number(pred!.awayScore),
        Number(match.actualHomeScore), Number(match.actualAwayScore)
      );
    }

    return (
      <div
        key={match.id}
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border overflow-hidden transition-shadow group ${
          isFinished
            ? 'border-slate-200 dark:border-slate-600'
            : 'border-slate-100 dark:border-slate-700 hover:shadow-md'
        }`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                {match.time} HS
              </span>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-600" />
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                {match.group}
              </span>
            </div>
            {isFinished ? (
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/>
                </svg>
                Finalizado
              </span>
            ) : (
              <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">FIFA WORLD CUP™</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 relative">
            <div className="flex-1 flex flex-col items-center sm:flex-row sm:justify-end gap-3 text-center sm:text-right">
              <span className="order-2 sm:order-1 text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase truncate w-full sm:w-auto">
                {match.homeTeam}
              </span>
              <div className="order-1 sm:order-2 w-12 h-8 sm:w-16 sm:h-10 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-50">
                <img src={TEAM_FLAGS[match.homeFlag] || TEAM_FLAGS['FIFA']} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex flex-col items-center px-2 min-w-[80px]">
              {isFinished ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {match.actualHomeScore}
                  </span>
                  <span className="text-lg font-black text-slate-400">–</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {match.actualAwayScore}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">VS</span>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center sm:flex-row sm:justify-start gap-3 text-center sm:text-left">
              <div className="w-12 h-8 sm:w-16 sm:h-10 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0 bg-slate-50">
                <img src={TEAM_FLAGS[match.awayFlag] || TEAM_FLAGS['FIFA']} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase truncate w-full sm:w-auto">
                {match.awayTeam}
              </span>
            </div>
          </div>

          {/* RESPONSIVE: En finalizados, resultados, pronóstico y medallón de puntos se apilan de forma limpia en mobile */}
          {isFinished && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col xs:flex-row items-center justify-between gap-3 text-center xs:text-left">
              {hasPred ? (
                <>
                  <div className="flex flex-col xs:flex-row items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tu pronóstico:</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                      {pred!.homeScore} – {pred!.awayScore}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] xs:text-xs font-black uppercase tracking-wider shrink-0 ${
                    pointsEarned === 4
                      ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                      : pointsEarned === 3
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                    {pointsEarned === 4 && <span className="text-xs">⭐</span>}
                    {pointsEarned === 3 && <span className="text-xs">✓</span>}
                    {pointsEarned === 0 && <span className="text-xs">✗</span>}
                    <span>
                      {pointsEarned === 4
                        ? '+4 pts (exacto)'
                        : pointsEarned === 3
                        ? '+3 pts (resultado)'
                        : '0 pts'}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic mx-auto xs:mx-0">
                  Sin pronóstico registrado
                </span>
              )}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-0.5">
              <svg className="w-3 h-3 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                {match.venue.split(',')[0]}
              </span>
            </div>
            {/* RESPONSIVE: ocultar detalles no esenciales de la ciudad en mobile para ahorrar espacio vertical */}
            <span className="hidden xs:block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              {match.venue.split(',')[1]?.trim() || ''}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, icon: React.ReactNode, grouped: { [key: string]: Match[] }, isFinished: boolean) => {
    const dates = Object.keys(grouped);
    if (dates.length === 0) return null;

    return (
      <div className="space-y-10">
        <div className={`flex items-center gap-3 pb-3 border-b-2 ${
          isFinished ? 'border-emerald-500 dark:border-emerald-400' : 'border-indigo-500 dark:border-indigo-400'
        }`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isFinished
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          }`}>
            {icon}
          </div>
          <h4 className={`heading-font text-xl font-black uppercase tracking-tight italic ${
            isFinished ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-700 dark:text-indigo-400'
          }`}>
            {title}
          </h4>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            isFinished
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          }`}>
            {dates.reduce((acc, d) => acc + grouped[d].length, 0)} partidos
          </span>
        </div>

        {dates.map((date) => (
          <div key={date} className="relative">
            <div className="sticky top-16 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <span className="heading-font text-xl font-black text-slate-900 dark:text-white uppercase">
                {date}
              </span>
            </div>
            <div className="space-y-4">
              {grouped[date].map((match) => renderMatchRow(match, isFinished))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-black dark:border-white pb-4 mb-4">
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

      {/* Selector de sub-sección / Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-3 font-black text-xs sm:text-sm uppercase tracking-widest px-5 py-3 rounded-2xl transition-all active:scale-95 shadow-lg ${
            activeTab === 'pending'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:shadow-indigo-500/30 dark:bg-indigo-600 dark:hover:bg-indigo-700'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Por Jugar
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            activeTab === 'pending'
              ? 'bg-indigo-800 text-white dark:bg-indigo-900/50'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}>
            {pendingMatches.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('finished')}
          className={`flex items-center gap-3 font-black text-xs sm:text-sm uppercase tracking-widest px-5 py-3 rounded-2xl transition-all active:scale-95 shadow-lg ${
            activeTab === 'finished'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:shadow-indigo-500/30 dark:bg-indigo-600 dark:hover:bg-indigo-700'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Finalizados
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            activeTab === 'finished'
              ? 'bg-indigo-800 text-white dark:bg-indigo-900/50'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}>
            {finishedMatches.length}
          </span>
        </button>
      </div>

      {/* PANEL DE ESTADÍSTICAS DEL JUGADOR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm text-center flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase text-slate-400 block mb-1">Puntos Totales</span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {userScore} <span className="text-[10px] sm:text-xs text-indigo-500 font-bold ml-0.5">PTS</span>
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm text-center flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase text-slate-400 block mb-1">Pronósticos Guardados</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">{totalPredictionsSaved} / {matches.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm text-center flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase text-slate-400 block mb-1">Resultados Exactos</span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-500 flex items-center justify-center gap-1.5">
            <span className="text-lg">⭐</span> {correctExactCount}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm text-center flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase text-slate-400 block mb-1">Aciertos Ganador/Empate</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-500 flex items-center justify-center gap-1">
            <span className="text-xl">✓</span> {correctWinnerCount}
          </span>
        </div>
      </div>

      <div className="pt-4 transition-all duration-300">
        {activeTab === 'pending' ? (
          pendingMatches.length > 0 ? (
            renderSection(
              'Próximos Partidos',
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>,
              pendingGrouped,
              false
            )
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8">
              <span className="text-4xl">🎉</span>
              <h4 className="heading-font text-lg font-black uppercase text-slate-800 dark:text-slate-100 mt-4">¡No hay partidos pendientes!</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Todos los encuentros se han disputado.</p>
            </div>
          )
        ) : (
          finishedMatches.length > 0 ? (
            renderSection(
              'Resultados',
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>,
              finishedGrouped,
              true
            )
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8">
              <span className="text-4xl">⏳</span>
              <h4 className="heading-font text-lg font-black uppercase text-slate-800 dark:text-slate-100 mt-4">No hay partidos finalizados aún</h4>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Navegá a &apos;Por Jugar&apos; para predecir los próximos partidos.</p>
            </div>
          )
        )}
      </div>

      <div className="py-16 text-center">
        <div className="inline-block p-8 bg-slate-100 dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.6em] mb-4 italic">
            CAMINO A LA GLORIA • 2026
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="h-[2px] w-12 bg-slate-300 dark:bg-slate-600" />
            <svg className="w-8 h-8 text-yellow-500 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" />
            </svg>
            <div className="h-[2px] w-12 bg-slate-300 dark:bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
