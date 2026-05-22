
import React, { useState, useEffect, useRef } from 'react';
import { User, PrivateGroup, GroupMember } from '../types';
import { saveCloudGroup, getUserCloudGroups, deleteCloudGroup, getAllUsers } from '../services/firebaseService';
import { db } from '../firebase';

interface PrivateGroupsViewProps {
  user: User;
  onBack: () => void;
}

const getShareUrl = (groupId: string): string => {
  return `https://ais-pre-ydglbzr3qz7odwvisz2dek-83270254799.us-east1.run.app/?joinGroup=${groupId}`;
};

export const PrivateGroupsView: React.FC<PrivateGroupsViewProps> = ({ user, onBack }) => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail' | 'ranking' | 'edit'>('list');
  const [groups, setGroups] = useState<PrivateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PrivateGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // States for creation/editing
  const [groupName, setGroupName] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [inviteInput, setInviteInput] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<GroupMember[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  // States for direct member invitation modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [isProcessingDirectInvite, setIsProcessingDirectInvite] = useState<{[key: string]: boolean}>({});
  const [localInvitedEmails, setLocalInvitedEmails] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carga inicial desde la nube
  useEffect(() => {
    if (!user || !user.email) return;

    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        const cloudGroups = await getUserCloudGroups(user.email);
        setGroups(cloudGroups);
      } catch (err) {
        console.error("Error fetching cloud groups:", err);
        // Fallback a local storage por si acaso el usuario no tiene conexión pero sí datos previos
        const saved = localStorage.getItem(`private_groups_${user.email}`);
        if (saved) setGroups(JSON.parse(saved));
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, [user?.email]);

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
    if (memberEmail === selectedGroup?.adminEmail && viewMode === 'edit') return;
    setInvitedMembers(invitedMembers.filter(m => m.email !== memberEmail));
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim() || !user) return;
    setIsProcessing(true);
    
    try {
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

        await saveCloudGroup(newGroup);
        setGroups(prev => [...prev, newGroup]);
        setSelectedGroup(newGroup);
        setGroupName('');
        setGroupPhoto(null);
        setInvitedMembers([]);
        setViewMode('detail');
      } else if (viewMode === 'edit' && selectedGroup) {
        const updatedGroup: PrivateGroup = {
          ...selectedGroup,
          name: groupName,
          groupPhotoUrl: groupPhoto || selectedGroup.groupPhotoUrl,
          members: invitedMembers
        };

        await saveCloudGroup(updatedGroup);
        setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
        setSelectedGroup(updatedGroup);
        resetFormAndToDetail();
      }
    } catch (err) {
      console.error("Error saving group:", err);
      alert("Hubo un error al guardar el grupo en la nube.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFormAndToList = () => {
    setGroupName('');
    setGroupPhoto(null);
    setInvitedMembers([]);
    setViewMode('list');
  };

  const resetFormAndToDetail = () => {
    setGroupName('');
    setGroupPhoto(null);
    setInvitedMembers([]);
    setViewMode('detail');
  };

  const openGroupDetail = (group: PrivateGroup) => {
    setSelectedGroup(group);
    setIsConfirmingDelete(false);
    setViewMode('detail');
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    setIsProcessing(true);
    try {
      await deleteCloudGroup(selectedGroup.id);
      setGroups(prev => prev.filter(g => g.id !== selectedGroup.id));
      setSelectedGroup(null);
      setIsConfirmingDelete(false);
      setViewMode('list');
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("Hubo un error al eliminar el grupo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKickMember = async (memberEmail: string) => {
    if (!selectedGroup) return;
    
    const isCreatorOrAdmin = selectedGroup.adminEmail === user.email || user.role === 'admin';
    if (!isCreatorOrAdmin) return;

    if (memberEmail === selectedGroup.adminEmail) {
      alert("No puedes eliminar al creador del grupo.");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar a esta persona del grupo?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const updatedMembers = selectedGroup.members.filter(m => m.email !== memberEmail);
      const updatedGroup: PrivateGroup = {
        ...selectedGroup,
        members: updatedMembers
      };

      await saveCloudGroup(updatedGroup);
      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      setSelectedGroup(updatedGroup);
    } catch (err) {
      console.error("Error forcing member out:", err);
      alert("Hubo un error al eliminar a la persona del grupo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditMode = () => {
    if (selectedGroup) {
      setGroupName(selectedGroup.name);
      setGroupPhoto(selectedGroup.groupPhotoUrl || null);
      setInvitedMembers(selectedGroup.members);
      setViewMode('edit');
    }
  };

  // Fetch registered users when modal opens
  useEffect(() => {
    if (isInviteModalOpen && allUsers.length === 0) {
      const fetchAllUsers = async () => {
        setIsFetchingUsers(true);
        try {
          const usersList = await getAllUsers();
          // Filter out the current user
          setAllUsers(usersList.filter(u => u.email !== user.email));
        } catch (err) {
          console.error("Error loading all users:", err);
        } finally {
          setIsFetchingUsers(false);
        }
      };
      fetchAllUsers();
    }
  }, [isInviteModalOpen, allUsers.length, user.email]);

  const handleInviteUserDirectly = async (targetUser: User) => {
    if (!selectedGroup) return;
    
    // Check if already in members
    if (selectedGroup.members.some(m => m.email === targetUser.email)) {
      return;
    }

    try {
      // Mark as locally invited
      if (targetUser.email && !localInvitedEmails.includes(targetUser.email)) {
        setLocalInvitedEmails(prev => [...prev, targetUser.email!]);
      }

      // Generate join URL
      const shareUrl = getShareUrl(selectedGroup.id);
      const customMessage = `¡Hola ${targetUser.username}! Te invito a unirte a mi grupo privado *${selectedGroup.name}* en el Prode de la Copa Mundial 2026! 🏆⚽️ Ingresa al enlace para unirte directamente: ${shareUrl}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(customMessage)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error("Error creating invite link:", err);
      alert("Hubo un error al generar la invitación por WhatsApp.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    if (!window.confirm(`¿Estás seguro de que deseas salir del grupo "${selectedGroup.name}"?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      const updatedMembers = selectedGroup.members.filter(m => m.email !== user.email);
      const updatedGroup: PrivateGroup = {
        ...selectedGroup,
        members: updatedMembers
      };

      await saveCloudGroup(updatedGroup);
      setGroups(prev => prev.filter(g => g.id !== selectedGroup.id));
      setSelectedGroup(null);
      setIsConfirmingDelete(false);
      setViewMode('list');
    } catch (err) {
      console.error("Error leaving group:", err);
      alert("Hubo un error al salir del grupo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const sortedMembers = selectedGroup 
    ? [...selectedGroup.members].sort((a, b) => b.score - a.score)
    : [];

  const filteredUsers = allUsers.filter(u => {
    if (!inviteSearchQuery.trim()) return true;
    const query = inviteSearchQuery.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  });

  const handleBack = () => {
    if (viewMode === 'list') onBack();
    else if (viewMode === 'ranking') setViewMode('detail');
    else if (viewMode === 'edit') setViewMode('detail');
    else setViewMode('list');
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-4 animate-fade-in relative">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={handleBack} 
          className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/30"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Volver</span>
        </button>

        {viewMode === 'list' && (
          <button 
            onClick={() => setViewMode('create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all shadow-indigo-600/20"
          >
            + Crear Grupo
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando grupos...</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">MIS GRUPOS</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Tus ligas privadas activas</p>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Aún no has creado ningún grupo exclusivo</p>
                <button 
                  onClick={() => setViewMode('create')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all shadow-indigo-600/20"
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
        ) : (viewMode === 'create' || viewMode === 'edit') ? (
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

              {viewMode === 'edit' && (
                <>
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
                </>
              )}

              <div className="pt-6">
                <button 
                  onClick={handleSaveGroup}
                  disabled={isProcessing || !groupName.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all shadow-indigo-600/20 disabled:opacity-30"
                >
                  {isProcessing ? 'PROCESANDO...' : viewMode === 'create' ? 'CREAR GRUPO' : 'GUARDAR CAMBIOS'}
                </button>
              </div>
            </div>
          </div>
        ) : viewMode === 'detail' && selectedGroup ? (
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
                  {selectedGroup.members.map((member, i) => {
                    const isCreatorOrAdmin = selectedGroup.adminEmail === user.email || user.role === 'admin';
                    const isGroupAdmin = member.email === selectedGroup.adminEmail;

                    return (
                      <div 
                        key={i} 
                        className={`flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border ${member.email === user.email ? 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/30' : 'border-transparent'}`}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-black dark:border-white shadow-md flex-shrink-0">
                          <img src={member.photoUrl} alt={member.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <span className="font-black text-slate-800 dark:text-white text-xs uppercase">{member.username}</span>
                          {isGroupAdmin && (
                            <span className="ml-2 text-[8px] font-black text-indigo-500 uppercase tracking-widest">Admin</span>
                          )}
                          {member.email === user.email && (
                            <span className="ml-2 text-[8px] font-black text-green-500 uppercase tracking-widest">(Tú)</span>
                          )}
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="block font-black text-slate-900 dark:text-white text-sm">{member.score}</span>
                            <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest">PTS</span>
                          </div>
                          {isCreatorOrAdmin && !isGroupAdmin && (
                            <button
                              onClick={() => handleKickMember(member.email || '')}
                              title="Sacar de grupo"
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40 p-1.5 rounded-lg transition-all active:scale-90"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-4 gap-2.5 sm:gap-4 my-4">
                  {/* Botón 1: Invitar más miembros directamente */}
                  <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    type="button"
                    title="Invitar más miembros directamente"
                    className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-800 transition-all hover:scale-[1.03] active:scale-95 text-center shadow-md select-none group focus:outline-none"
                  >
                    <div className="p-1 sm:p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-4 4 4 4 0 014-4zM3 20a6 6 0 0112 0v1H3z" />
                      </svg>
                    </div>
                    <span className="block font-black text-[7px] sm:text-[9px] uppercase tracking-wider text-slate-800 dark:text-slate-200 mt-1.5 leading-tight">
                      Invitar<br/>Directo
                    </span>
                  </button>

                  {/* Botón 2: Invitar amigos */}
                  <button 
                    onClick={() => {
                      const shareUrl = getShareUrl(selectedGroup.id);
                      const customMessage = `¡Súmate a mi grupo privado *${selectedGroup.name}* en el Prode de la Copa Mundial 2026! 🏆⚽️ Ingresa al enlace para unirte directamente: ${shareUrl}`;
                      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(customMessage)}`;
                      
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 3000);
                      }).catch(err => {
                        console.error('No se pudo copiar el enlace al portapapeles: ', err);
                      });
                      
                      window.open(whatsappUrl, '_blank');
                    }}
                    type="button"
                    title="Compartir enlace por WhatsApp"
                    className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/25 hover:bg-indigo-50 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/30 transition-all hover:scale-[1.03] active:scale-95 text-center shadow-md select-none group focus:outline-none text-indigo-600 dark:text-indigo-400 font-bold"
                  >
                    <div className="p-1 sm:p-2 bg-green-100 dark:bg-green-950/40 rounded-xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742a3.001 3.001 0 112.632 2.632M15 15.174a3 3 0 11-2.632-2.632M21 12H3m14-5v10" />
                      </svg>
                    </div>
                    <span className="block font-black text-[7px] sm:text-[9px] uppercase tracking-wider mt-1.5 leading-tight text-slate-800 dark:text-slate-200">
                      {copySuccess ? '¡Copiado!' : 'invitar\namigos'}
                    </span>
                  </button>

                  {/* Botón 3: Ver ranking del grupo (con el color amarillo-ámbar del inicio) */}
                  <button 
                    onClick={() => setViewMode('ranking')}
                    type="button"
                    title="Ver Tabla de Posiciones"
                    className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-yellow-300 dark:border-amber-600 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-black transition-all hover:scale-[1.03] active:scale-95 text-center shadow-md select-none group focus:outline-none"
                  >
                    <div className="p-1 sm:p-2 bg-white/30 rounded-xl text-slate-900 group-hover:rotate-12 transition-transform">
                      <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="block font-black text-[7px] sm:text-[9px] uppercase tracking-wider text-slate-900 mt-1.5 leading-tight">
                      ver<br/>ranking
                    </span>
                  </button>

                  {/* Botón 4: Eliminar o abandonar grupo */}
                  {(() => {
                    const isCreatorOrAdmin = selectedGroup.adminEmail === user.email || user.role === 'admin';
                    if (isCreatorOrAdmin) {
                      return (
                        <button 
                          onClick={() => setIsConfirmingDelete(true)}
                          type="button"
                          title="Eliminar este grupo permanentemente"
                          className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-red-200 dark:border-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-950/10 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-black transition-all hover:scale-[1.03] active:scale-95 text-center shadow-md select-none group focus:outline-none"
                        >
                          <div className="p-1 sm:p-2 bg-red-100 dark:bg-red-950/40 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                          <span className="block font-black text-[7px] sm:text-[9px] uppercase tracking-wider mt-1.5 leading-tight">
                            eliminar<br/>grupo
                          </span>
                        </button>
                      );
                    } else {
                      return (
                        <button 
                          onClick={handleLeaveGroup}
                          type="button"
                          title="Salir de este grupo"
                          className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-red-200 dark:border-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-950/10 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-black transition-all hover:scale-[1.03] active:scale-95 text-center shadow-md select-none group focus:outline-none"
                        >
                          <div className="p-1 sm:p-2 bg-red-100 dark:bg-red-950/40 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span className="block font-black text-[7px] sm:text-[9px] uppercase tracking-wider mt-1.5 leading-tight font-bold">
                            Abandonar<br/>Grupo
                          </span>
                        </button>
                      );
                    }
                  })()}
                </div>

                {/* Bloque de confirmación de eliminación */}
                {isConfirmingDelete && (
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-900/50 flex flex-col gap-2 mt-4 animate-fade-in">
                    <span className="text-[9px] font-black text-red-600 dark:text-red-400 text-center uppercase tracking-widest leading-normal">
                      ¿Estás seguro de que deseas eliminar este grupo permanentemente? Esta acción es irreversible.
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleDeleteGroup}
                        disabled={isProcessing}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all active:scale-95"
                      >
                        {isProcessing ? 'ELIMINANDO...' : 'SÍ, ELIMINAR'}
                      </button>
                      <button 
                        onClick={() => setIsConfirmingDelete(false)}
                        className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all active:scale-95"
                      >
                        CANCELAR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : viewMode === 'ranking' && selectedGroup ? (
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
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/30"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                <span>Volver</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* MODAL DE INVITACIÓN DIRECTA */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md p-6 border-2 border-slate-100 dark:border-slate-700 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="heading-font text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">INVITAR DIRECTAMENTE</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suma personas registradas en el Prode</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteSearchQuery('');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Buscador */}
            <div className="mb-4 relative">
              <input 
                type="text"
                placeholder="Buscar por apodo o email..."
                value={inviteSearchQuery}
                onChange={(e) => setInviteSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-xs text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>

            {/* Listado de usuarios */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-[220px]">
              {isFetchingUsers ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Buscando usuarios registrados...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-bold">No se encontraron usuarios</p>
                  <p className="text-[9px] font-black uppercase tracking-wider mt-1">Intenta con otra búsqueda</p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isAlreadyMember = selectedGroup?.members.some(m => m.email === u.email);
                  const isLocalInvited = u.email ? localInvitedEmails.includes(u.email) : false;

                  return (
                    <div 
                      key={u.uid || u.email}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-705/50 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0">
                          <img src={u.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt={u.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 dark:text-white text-xs uppercase truncate">{u.username || 'Usuario'}</p>
                          <p className="text-[9px] text-slate-400 font-bold truncate">{u.email}</p>
                        </div>
                      </div>

                      <div>
                        {isAlreadyMember ? (
                          <span className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900 px-2.5 py-1 rounded-lg font-black text-[8px] uppercase tracking-wider">
                            Miembro
                          </span>
                        ) : isLocalInvited ? (
                          <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 px-2.5 py-1 rounded-lg font-black text-[8px] uppercase tracking-wider">
                            Enlace Enviado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleInviteUserDirectly(u)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-1 focus:outline-none"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                            <span>Invitar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button 
                type="button"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteSearchQuery('');
                }}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all active:scale-95 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
