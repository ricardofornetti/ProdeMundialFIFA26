import React from 'react';
import { Match, Prediction } from '../types';
import { TEAM_FLAGS } from '../constants';

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onPredictionChange: (matchId: string, homeScore: number | '', awayScore: number | '') => void;
  onSavePrediction?: (matchId: string) => void;
  isSaving?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  prediction, 
  onPredictionChange, 
  onSavePrediction,
  isSaving = false
}) => {
  const isPredictionComplete = prediction && prediction.homeScore !== '' && prediction.awayScore !== '';
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-4 sm:p-6 border border-slate-100 dark:border-slate-700 transition-all duration-300">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] sm:text-sm font-bold tracking-wider uppercase px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 self-start">
            {match.group}
          </span>
          <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{match.venue.split(',')[0]}</p>
        </div>
        <div className="text-right">
          <p className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-200">{match.date}</p>
          <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter">{match.time} HS ARG</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-6">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1 space-y-2">
          <div className="w-14 h-10 xs:w-16 xs:h-12 sm:w-24 sm:h-16 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 bg-slate-50">
            <img 
              src={TEAM_FLAGS[match.homeFlag] || TEAM_FLAGS['FIFA']} 
              alt={match.homeTeam} 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="text-xs sm:text-xl font-black text-slate-900 dark:text-white text-center uppercase truncate w-full">{match.homeTeam}</span>
        </div>

        {/* Prediction Inputs */}
        <div className="flex flex-col items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <input
              type="number"
              min="0"
              value={prediction?.homeScore ?? ''}
              onChange={(e) => onPredictionChange(match.id, e.target.value === '' ? '' : parseInt(e.target.value), prediction?.awayScore ?? '')}
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 text-center text-xl xs:text-2xl sm:text-4xl font-black border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:border-black dark:focus:border-white focus:ring-4 focus:ring-slate-50 dark:focus:ring-slate-700 focus:outline-none transition-all text-black dark:text-white bg-white dark:bg-slate-700"
              placeholder="-"
            />
            <span className="text-2xl sm:text-4xl font-black text-slate-300 dark:text-slate-500">:</span>
            <input
              type="number"
              min="0"
              value={prediction?.awayScore ?? ''}
              onChange={(e) => onPredictionChange(match.id, prediction?.homeScore ?? '', e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 text-center text-xl xs:text-2xl sm:text-4xl font-black border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:border-black dark:focus:border-white focus:ring-4 focus:ring-slate-50 dark:focus:ring-slate-700 focus:outline-none transition-all text-black dark:text-white bg-white dark:bg-slate-700"
              placeholder="-"
            />
          </div>
          
          {onSavePrediction && (
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
          
          {!onSavePrediction && (
            <p className={`text-[10px] sm:text-sm font-black uppercase mt-1 ${isPredictionComplete ? 'text-green-500' : 'text-slate-400'}`}>
              {isPredictionComplete ? 'CARGADO' : 'Cargar'}
            </p>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1 space-y-2">
          <div className="w-14 h-10 xs:w-16 xs:h-12 sm:w-24 sm:h-16 overflow-hidden rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 bg-slate-50">
            <img 
              src={TEAM_FLAGS[match.awayFlag] || TEAM_FLAGS['FIFA']} 
              alt={match.awayTeam} 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="text-xs sm:text-xl font-black text-slate-900 dark:text-white text-center uppercase truncate w-full">{match.awayTeam}</span>
        </div>
      </div>
    </div>
  );
};