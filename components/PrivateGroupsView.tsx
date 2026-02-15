
import React, { useState, useEffect } from 'react';
import { User, PrivateGroup } from '../types';

interface PrivateGroupsViewProps {
  user: User;
  onBack: () => void;
}

export const PrivateGroupsView: React.FC<PrivateGroupsViewProps> = ({ user, onBack }) => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');
  const [groups, setGroups] = useState<PrivateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PrivateGroup | null>(null);
  
  // States for creation
  const [groupName, setGroupName] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const savedGroups = localStorage.getItem(`private_groups_${user.email}`);
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  }, [user.email]);

  const saveGroupsToLocal = (newGroups: PrivateGroup[]) => {
    setGroups(newGroups);
    localStorage.setItem(`private_groups_${user.email}`, JSON.stringify(newGroups));
  };

  const handleAddMember = () => {
    if (inviteInput.trim() && !invitedMembers.includes(inviteInput)) {
      setInvitedMembers([...invitedMembers, inviteInput.trim()]);
      setInviteInput('');
    }
  };

  const handleRemoveMember = (member: string) => {
    setInvitedMembers(invitedMembers.filter(m => m !== member));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    setIsCreating(true);
    
    const newGroup: PrivateGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: groupName,
      adminEmail: user.email,
      members: [user.username, ...invitedMembers],
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      const updatedGroups = [...groups, newGroup];
      saveGroupsToLocal(updatedGroups);
      setIsCreating(false);
      setGroupName('');
      setInvitedMembers([]);
      setViewMode('list');
    }, 1000);
  };

  const openGroupDetail = (group: PrivateGroup) => {
    setSelectedGroup(group);
    setViewMode('detail');
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={viewMode === 'list' ? onBack : () => setViewMode('list')} 
          className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          {viewMode === 'list' ? 'Volver a la cuenta' : 'Volver al listado'}
        </button>

        {viewMode === 'list' && (
          <button 
            onClick={() => setViewMode('create')}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
          >
            + Crear Grupo
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 min-h-[400px]">
        {viewMode === 'list' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">MIS GRUPOS</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Tus ligas privadas activas</p>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Aún no has creado ningún grupo exclusivo</p>
                <button 
                  onClick={() => setViewMode('create')}
                  className="text-black dark:text-white font-black text-xs uppercase underline tracking-widest hover:opacity-70"
                >
                  ¡Empieza ahora!
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {groups.map((group) => (
                  <button 
                    key={group.id}
                    onClick={() => openGroupDetail(group)}
                    className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-transparent hover:border-black dark:hover:border-white transition-all text-left group"
                  >
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{group.name}</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{group.members.length} MIEMBROS</p>
                    </div>
                    <span className="text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'create' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">CREAR GRUPO</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Crea tu propia liga y compite con amigos</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Nombre del Grupo</label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ej: Los Pibes del Mundial"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-black dark:focus:border-white outline-none transition-all font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Invitar Miembros (Usuario o Email)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                    placeholder="ejemplo@prode.com"
                    className="flex-1 px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-black dark:focus:border-white outline-none transition-all font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900"
                  />
                  <button 
                    onClick={handleAddMember}
                    className="bg-black dark:bg-white text-white dark:text-black px-6 rounded-2xl font-black text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {invitedMembers.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Miembros a Invitar</label>
                  <div className="flex flex-wrap gap-2">
                    {invitedMembers.map((member, idx) => (
                      <div key={idx} className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full flex items-center gap-2 border border-slate-200 dark:border-slate-600">
                        <span className="text-[10px] font-bold text-slate-800 dark:text-white">{member}</span>
                        <button onClick={() => handleRemoveMember(member)} className="text-red-500 font-bold hover:scale-110 transition-transform">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6">
                <button 
                  onClick={handleCreateGroup}
                  disabled={isCreating || !groupName.trim()}
                  className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black text-sm rounded-[2rem] shadow-2xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-30"
                >
                  {isCreating ? 'CREANDO GRUPO...' : 'CREAR GRUPO EXCLUSIVO'}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'detail' && selectedGroup && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{selectedGroup.name}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Detalles del grupo exclusivo</p>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-700 pb-3 mb-4">
                  <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">INTEGRANTES</h3>
                  <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full font-black text-[9px] text-slate-800 dark:text-white uppercase">
                    {selectedGroup.members.length} TOTAL
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {selectedGroup.members.map((member, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-transparent"
                    >
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-[10px] uppercase">
                        {member.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <span className="font-black text-slate-800 dark:text-white text-xs uppercase">{member}</span>
                        {i === 0 && (
                          <span className="ml-2 text-[8px] font-black text-indigo-500 uppercase tracking-widest">Admin</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-black text-[10px] rounded-2xl uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Invitar más miembros
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className="w-full py-4 bg-transparent text-slate-400 font-black text-[10px] rounded-2xl uppercase tracking-widest hover:text-black dark:hover:text-white transition-all"
                >
                  Volver al listado
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
