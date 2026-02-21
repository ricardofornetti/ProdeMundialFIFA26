
import React, { useState } from 'react';
import { WORLD_CUP_GROUPS, TEAM_FLAGS, TEAM_NAMES } from '../constants';

interface GroupEditorProps {
  currentGroups: typeof WORLD_CUP_GROUPS;
  onSave: (updatedGroups: typeof WORLD_CUP_GROUPS) => void;
  onBack: () => void;
}

export const GroupEditor: React.FC<GroupEditorProps> = ({ currentGroups, onSave, onBack }) => {
  const [tempGroups, setTempGroups] = useState(JSON.parse(JSON.stringify(currentGroups)));
  const availableFlags = Object.keys(TEAM_FLAGS);

  const handleTeamChange = (groupIdx: number, teamIdx: number, value: string) => {
    const newGroups = [...tempGroups];
    newGroups[groupIdx].teams[teamIdx] = value;
    setTempGroups(newGroups);
  };

  const handleFlagChange = (groupIdx: number, teamIdx: number, flag: string) => {
    const newGroups = [...tempGroups];
    newGroups[groupIdx].flags[teamIdx] = flag;
    
    // Auto-completar el nombre del equipo si está vacío o es un "?"
    const currentName = newGroups[groupIdx].teams[teamIdx];
    if ((!currentName || currentName === '?') && flag !== 'FIFA') {
      newGroups[groupIdx].teams[teamIdx] = TEAM_NAMES[flag] || '';
    }
    
    setTempGroups(newGroups);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <button 
            onClick={onBack} 
            className="flex items-center gap-3 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-xs sm:text-sm uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl transition-all active:scale-95 mb-6"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Volver</span>
          </button>
          <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Configurar Equipos</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asigna los países a cada zona del mundial</p>
        </div>
        <button 
          onClick={() => onSave(tempGroups)}
          className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-90 transition-all"
        >
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tempGroups.map((group: any, gIdx: number) => (
          <div key={gIdx} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">{group.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              {group.teams.map((team: string, tIdx: number) => (
                <div key={tIdx} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative group/flag">
                      <div className="w-12 h-8 rounded-md overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 flex-shrink-0 cursor-pointer flex items-center justify-center">
                        <img src={TEAM_FLAGS[group.flags[tIdx]] || TEAM_FLAGS['FIFA']} alt="" className="w-full h-full object-cover" />
                      </div>
                      <select 
                        value={group.flags[tIdx]} 
                        onChange={(e) => handleFlagChange(gIdx, tIdx, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      >
                        {availableFlags.map(f => (
                          <option key={f} value={f}>
                            {TEAM_NAMES[f] || f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between px-1">
                         <span className="text-[8px] font-black text-slate-400 uppercase">País / Bandera</span>
                         <span className="text-[8px] font-black text-blue-500 uppercase">{group.flags[tIdx]}</span>
                      </div>
                      <input 
                        type="text" 
                        value={team}
                        onChange={(e) => handleTeamChange(gIdx, tIdx, e.target.value)}
                        placeholder="Nombre del país..."
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-black dark:focus:border-white rounded-xl px-4 py-2 font-black text-[11px] uppercase outline-none transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
