import React from 'react';
import { Match, Prediction } from '../types';
import { TEAM_FLAGS } from '../constants';
import { Lock, CheckCircle2, XCircle, Star } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onPredictionChange: (matchId: string, homeScore: number | '', awayScore: number | '') => void;
  onSavePrediction?: (matchId: string) => void;
  isSaving?: boolean;
  isLocked?: boolean;
}

function calcPoints(pHome: number, pAway: number, rHome: number, rAway: number): number {
  const pResult = pHome > pAway ? 'home' : pHome < pAway ? 'away' : 'draw';
  const rResult = rHome > rAway ? 'home' : rHome < rAway ? 'away' : 'draw';
  if (pResult !== rResult) return 0;
  return pHome === rHome && pAway === rAway ? 4 : 3;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  prediction,
  onPredictionChange,
  onSavePrediction,
  isSaving = false,
  isLocked = false,
}) => {
  const isPredictionComplete = prediction && prediction.homeScore !== '' && prediction.awayScore !== '';
  const hasResult = match.actualHomeScore !== undefined && match.actualAwayScore !== undefined;
  const isFinished = hasResult;

  let pointsEarned: number | null = null;
  if (isFinished && isPredictionComplete) {
    pointsEarned = calcPoints(
      Number(prediction!.homeScore), Number(prediction!.awayScore),
      Number(match.actualHomeScore), Number(match.actualAwayScore)
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md p-4 sm:p-6 border transition-all duration-300 relative overflow-hidden ${
      isLocked
        ? 'border-slate-200 dark:border-slate-600 opacity-90'
        : 'border-slate-100 dark:border-slate-700 shadow-xl'
    }`}>
      {isLocked && (
        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl border-l border-b z-10 shadow-sm animate-fade-in flex items-center gap-2 ${
          isFinished
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
        }`}>
          {isFinished ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ) : (
            <Lock className="w-3 h-3 text-slate-400" />
          )}
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            isFinished ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}>
            {isFinished ? 'FINALIZADO' : 'BLOQUEADO'}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] sm:text-sm font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 self-start">
            {match.group}
          </span>
          <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
            {match.venue.split(',')[0]}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-200">{match.date}</p>
          <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter">{match.time} HS ARG</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-6">
        <div className="flex flex-col items-center flex-1 space-y-2">
          <div className="w-14 h-10 xs:w-16 xs:h-12 sm:w-24 sm:h-16 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 bg-slate-50">
            <img src={TEAM_FLAGS[match.homeFlag] || TEAM_FLAGS['FIFA']} alt={match.homeTeam} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs sm:text-xl font-black text-slate-900 dark:text-white text-center uppercase truncate w-full">{match.homeTeam}</span>
        </div>

        <div className="flex flex-col items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <input
              type="number"
              min="0"
              max="99"
              disabled={isLocked}
              value={prediction?.homeScore ?? ''}
              onChange={(e) =>
                onPredictionChange(match.id, e.target.value === '' ? '' : Math.min(99, parseInt(e.target.value)), prediction?.awayScore ?? '')
              }
              className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 text-center text-xl xs:text-2xl sm:text-4xl font-black border-2 rounded-2xl focus:outline-none transition-all text-black dark:text-white bg-white dark:bg-slate-700 ${
                isLocked
                  ? 'cursor-not-allowed opacity-50 bg-slate-50 border-slate-200 dark:border-slate-600'
                  : 'border-slate-200 dark:border-slate-600 focus:border-black dark:focus:border-white focus:ring-4 focus:ring-slate-50 dark:focus:ring-slate-700'
              }`}
              placeholder="-"
            />
            <span className="text-2xl sm:text-4xl font-black text-slate-300 dark:text-slate-500">:</span>
            <input
              type="number"
              min="0"
              max="99"
              disabled={isLocked}
              value={prediction?.awayScore ?? ''}
              onChange={(e) =>
                onPredictionChange(match.id, prediction?.homeScore ?? '', e.target.value === '' ? '' : Math.min(99, parseInt(e.target.value)))
              }
              className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 text-center text-xl xs:text-2xl sm:text-4xl font-black border-2 rounded-2xl focus:outline-none transition-all text-black dark:text-white bg-white dark:bg-slate-700 ${
                isLocked
                  ? 'cursor-not-allowed opacity-50 bg-slate-50 border-slate-200 dark:border-slate-600'
                  : 'border-slate-200 dark:border-slate-600 focus:border-black dark:focus:border-white focus:ring-4 focus:ring-slate-50 dark:focus:ring-slate-700'
              }`}
              placeholder="-"
            />
          </div>

          {onSavePrediction && !isLocked && (
            <button
              onClick={() => onSavePrediction(match.id)}
              disabled={!isPredictionComplete || isSaving}
              className={`mt-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-200 ${
                isPredictionComplete
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              } ${isSaving ? 'opacity-50' : ''}`}
            >
              {isSaving ? '...' : 'Guardar'}
            </button>
          )}

          {isLocked && !isFinished && (
            <p className={`text-[10px] sm:text-sm font-black uppercase mt-1 ${
              isPredictionComplete ? 'text-green-500' : 'text-slate-400'
            }`}>
              {isPredictionComplete ? 'ENVIADO' : 'CERRADO'}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center flex-1 space-y-2">
          <div className="w-14 h-10 xs:w-16 xs:h-12 sm:w-24 sm:h-16 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 bg-slate-50">
            <img src={TEAM_FLAGS[match.awayFlag] || TEAM_FLAGS['FIFA']} alt={match.awayTeam} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs sm:text-xl font-black text-slate-900 dark:text-white text-center uppercase truncate w-full">{match.awayTeam}</span>
        </div>
      </div>

      {(match.homeTeam.includes('3°') || match.awayTeam.includes('3°')) && (
        <div className="mt-4 px-3 py-2 bg-indigo-50/50 dark:bg-slate-700/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-slate-700 rounded-xl text-[10px] sm:text-xs font-semibold text-center select-none">
          ℹ️ Cruce según Anexo C de FIFA (Depende de qué 8 de los 12 mejores terceros clasifiquen)
        </div>
      )}

      {isFinished && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Resultado Final:</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {match.actualHomeScore} – {match.actualAwayScore}
            </span>
          </div>

          {isPredictionComplete ? (
            /* RESPONSIVE: Apilado vertical en móviles ultra-estrechos y fila horizontal en xs+ para evitar desbordes */
            <div className={`flex flex-col xs:flex-row items-center justify-between px-4 py-3 rounded-xl gap-3 ${
              pointsEarned === 4
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                : pointsEarned === 3
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex flex-col xs:flex-row items-center gap-2 text-center xs:text-left">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tu pronóstico:</span>
                <span className={`text-sm xs:text-base font-black ${
                  pointsEarned! > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 line-through'
                }`}>
                  {prediction!.homeScore} – {prediction!.awayScore}
                </span>
              </div>

              <div className={`flex items-center gap-1.5 text-[10px] xs:text-xs font-black uppercase tracking-wider ${
                pointsEarned === 4
                  ? 'text-yellow-700 dark:text-yellow-400'
                  : pointsEarned === 3
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {pointsEarned === 4 && <Star className="w-4 h-4 fill-current shrink-0" />}
                {pointsEarned === 3 && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {pointsEarned === 0 && <XCircle className="w-4 h-4 shrink-0" />}
                <span>
                  {pointsEarned === 4 ? '+4 pts ¡Exacto!' : pointsEarned === 3 ? '+3 pts' : '0 pts'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">
                No hiciste un pronóstico para este partido
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
