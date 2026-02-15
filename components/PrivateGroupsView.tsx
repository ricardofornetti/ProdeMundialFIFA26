
import React, { useState, useEffect, useRef } from 'react';
import { User, PrivateGroup, GroupMember } from '../types';

interface PrivateGroupsViewProps {
  user: User;
  onBack: () => void;
}

export const PrivateGroupsView: React.FC<PrivateGroupsViewProps> = ({ user, onBack }) => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail' | 'ranking' | 'edit'>('list');
  const [groups, setGroups] = useState<PrivateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PrivateGroup | null>(null);
  
  // States for creation/editing
  const [groupName, setGroupName] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [inviteInput, setInviteInput] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<GroupMember[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGroupPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = () => {
    if (inviteInput.trim() && !invitedMembers.find(m => m.email === inviteInput || m.username === inviteInput)) {
      const newMember: GroupMember = {
        username: inviteInput.split('@')[0],
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteInput}`,
        score: Math.floor(Math.random() * 10),
        email: inviteInput.trim()
      };
      setInvitedMembers([...invitedMembers, newMember]);
      setInviteInput('');
    }
  };

  const handleRemoveMember = (memberEmail?: string) => {
    // No permitir remover al administrador si es el creador
    if (memberEmail === selectedGroup?.adminEmail && viewMode === 'edit') return;
    setInvitedMembers(invitedMembers.filter(m => m.email !== memberEmail));
  };

  const handleSaveGroup = () => {
    if (!groupName.trim()) return;
    setIsProcessing(true);
    
    if (viewMode === 'create') {
      const adminMember: GroupMember = {
        username: user.username,
        photoUrl: user.photoUrl,
        score: user.totalScore || 0,
        email: user.email
      };

      const newGroup: PrivateGroup = {
        id: Math.random().toString(36).substr(2, 9),
        name: groupName,
        adminEmail: user.email,
        groupPhotoUrl: groupPhoto || undefined,
        members: [adminMember, ...invitedMembers],
        createdAt: new Date().toISOString()
      };

      setTimeout(() => {
        const updatedGroups = [...groups, newGroup];
        saveGroupsToLocal(updatedGroups);
        resetFormAndToList();
      }, 800);
    } else if (viewMode === 'edit' && selectedGroup) {
      const updatedGroups = groups.map(g => {
        if (g.id === selectedGroup.id) {
          return {
            ...g,
            name: groupName,
            groupPhotoUrl: groupPhoto || g.groupPhotoUrl,
            members: invitedMembers
          };
        }
        return g;
      });
      
      setTimeout(() => {
        saveGroupsToLocal(updatedGroups);
        const updated = updatedGroups.find(g => g.id === selectedGroup.id);
        if (updated) setSelectedGroup(updated);
        resetFormAndToDetail();
      }, 800);
    }
  };

  const resetFormAndToList = () => {
    setIsProcessing(false);
    setGroupName('');
    setGroupPhoto(null);
    setInvitedMembers([]);
    setViewMode('list');
  };

  const resetFormAndToDetail = () => {
    setIsProcessing(false);
    setGroupName('');
    setGroupPhoto(null);
    setInvitedMembers([]);
    setViewMode('detail');
  };

  const openGroupDetail = (group: PrivateGroup) => {
    setSelectedGroup(group);
    setViewMode('detail');
  };

  const openEditMode = () => {
    if (selectedGroup) {
      setGroupName(selectedGroup.name);
      setGroupPhoto(selectedGroup.groupPhotoUrl || null);
      setInvitedMembers(selectedGroup.members);
      setViewMode('edit');
    }
  };

  const sortedMembers = selectedGroup 
    ? [...selectedGroup.members].sort((a, b) => b.score - a.score)
    : [];

  const handleBack = () => {
    if (viewMode === 'list') onBack();
    else if (viewMode === 'ranking') setViewMode('detail');
    else if (viewMode === 'edit') setViewMode('detail');
    else setViewMode('list');
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={handleBack} 
          className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
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
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm bg-slate-200 flex-shrink-0">
                        {group.groupPhotoUrl ? (
                          <img src={group.groupPhotoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-lg">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{group.name}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{group.members.length} MIEMBROS</p>
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                {viewMode === 'create' ? 'CREAR GRUPO' : 'GESTIONAR INTEGRANTES'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                {viewMode === 'create' ? 'Define la identidad de tu liga' : 'Suma nuevos amigos a la competencia'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div 
                  className="w-24 h-24 rounded-3xl border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {groupPhoto ? (
                    <img src={groupPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[8px] font-black uppercase">Cambiar</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Foto del Grupo</label>
              </div>

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

              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Incorporar Usuario / Email</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                    placeholder="Escribe el nombre o correo..."
                    className="flex-1 px-5 py-4 rounded-2xl border-2 border-white dark:border-slate-700 focus:border-black dark:focus:border-white outline-none transition-all font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800"
                  />
                  <button 
                    onClick={handleAddMember}
                    className="bg-black dark:bg-white text-white dark:text-black px-6 rounded-2xl font-black text-xs hover:scale-105 active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>

              {invitedMembers.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Integrantes actuales ({invitedMembers.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {invitedMembers.map((member, idx) => (
                      <div key={idx} className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full flex items-center gap-2 border border-slate-200 dark:border-slate-600 animate-fade-in shadow-sm">
                        <img src={member.photoUrl} className="w-4 h-4 rounded-full border border-white" alt="" />
                        <span className="text-[10px] font-bold text-slate-800 dark:text-white truncate max-w-[100px]">{member.username}</span>
                        {member.email !== user.email && (
                          <button onClick={() => handleRemoveMember(member.email)} className="text-red-500 font-bold hover:scale-125 transition-transform ml-1">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6">
                <button 
                  onClick={handleSaveGroup}
                  disabled={isProcessing || !groupName.trim()}
                  className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black text-sm rounded-[2rem] shadow-2xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-30"
                >
                  {isProcessing ? 'PROCESANDO...' : viewMode === 'create' ? 'CREAR GRUPO EXCLUSIVO' : 'AGREGAR'}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'detail' && selectedGroup && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-black dark:border-white shadow-xl bg-slate-100 mb-4">
                {selectedGroup.groupPhotoUrl ? (
                   <img src={selectedGroup.groupPhotoUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300">
                    {selectedGroup.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{selectedGroup.name}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Detalles de la liga privada</p>
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
                      className={`flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border ${member.email === user.email ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/30' : 'border-transparent'}`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-black dark:border-white shadow-md flex-shrink-0">
                        <img src={member.photoUrl} alt={member.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <span className="font-black text-slate-800 dark:text-white text-xs uppercase">{member.username}</span>
                        {member.email === selectedGroup.adminEmail && (
                          <span className="ml-2 text-[8px] font-black text-indigo-500 uppercase tracking-widest">Admin</span>
                        )}
                        {member.email === user.email && (
                          <span className="ml-2 text-[8px] font-black text-green-500 uppercase tracking-widest">(Tú)</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-slate-900 dark:text-white text-sm">{member.score}</span>
                        <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest">PTS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={openEditMode}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-black text-[10px] rounded-2xl uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  Invitar más miembros
                </button>
                
                <button 
                  onClick={() => setViewMode('ranking')}
                  className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-[2rem] shadow-xl flex items-center justify-center gap-4 group hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <svg className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-black text-xs uppercase tracking-[0.2em]">VER RANKING DEL GRUPO</span>
                </button>

                <button 
                  onClick={() => setViewMode('list')}
                  className="w-full py-4 bg-transparent text-slate-400 font-black text-[10px] rounded-2xl uppercase tracking-widest hover:text-black dark:hover:text-white transition-all"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'ranking' && selectedGroup && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h3 className="text-yellow-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">TABLA DE POSICIONES</h3>
              <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{selectedGroup.name}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Ranking exclusivo de integrantes</p>
            </div>

            <div className="space-y-4">
              {sortedMembers.map((member, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-5 rounded-[2rem] transition-all border-2 ${
                    member.email === user.email 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xl scale-[1.02]' 
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black ${
                      member.email === user.email ? 'bg-white dark:bg-black text-black dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
                      <img src={member.photoUrl} alt={member.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-tight truncate max-w-[120px]">{member.username}</span>
                      {member.email === selectedGroup.adminEmail && <span className="text-[7px] font-black uppercase tracking-widest opacity-50">Administrador</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black block leading-none">{member.score}</span>
                    <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">Puntos</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <button 
                onClick={() => setViewMode('detail')}
                className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-black text-[10px] rounded-2xl uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
