import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerSelection } from './features/lobby/components/ServerSelection';
import { PlayerSetup } from './features/lobby/components/PlayerSetup';
import { useSocket } from './features/bank/hooks/useSocket';
import { supabase } from './core/supabase';
import { Wallet, ArrowRightLeft, History, TrendingUp, AlertCircle, Home, Trash2, Plus } from 'lucide-react';

type Screen = 'LOBBY' | 'SETUP' | 'GAME';

export default function App() {
  const [screen, setScreen] = useState<Screen>('LOBBY');
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const selectedRoomIdRef = useRef<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankActionType, setBankActionType] = useState<'PAY' | 'RECEIVE'>('PAY');
  const [bankAmount, setBankAmount] = useState<string>('');

  // Modais custom
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Perfis da Família
  const [baseProfiles, setBaseProfiles] = useState<any[]>([]);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('1');

  const { gameState, isConnected, error, transfer, adjustBalance, fetchState } = useSocket(selectedRoomId || '');

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchState();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    fetchRooms();
    fetchBaseProfiles();
    
    const subscription = supabase
      .channel('public:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, fetchRooms)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfis_base' }, fetchBaseProfiles)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchBaseProfiles = async () => {
    const { data } = await supabase.from('perfis_base').select('*').order('nickname');
    if (data) setBaseProfiles(data);
  };

  const fetchRooms = async () => {
    const { data } = await supabase.from('partidas').select('*').eq('status', 'LOBBY');
    if (data) setRooms(data);
  };

  const handleCreateRoom = () => {
    setIsCreateRoomModalOpen(true);
  };

  const confirmCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    await supabase.from('partidas').insert({ 
      nome: newRoomName.trim(), 
      codigo_sala: Math.random().toString(36).substring(7).toUpperCase() 
    });
    setNewRoomName('');
    setIsCreateRoomModalOpen(false);
  };

  const handleDeleteRoom = (roomId: string) => {
    setDeleteConfirmId(roomId);
  };

  const confirmDeleteRoom = async () => {
    if (!deleteConfirmId) return;
    await supabase.from('partidas').delete().eq('id', deleteConfirmId);
    setDeleteConfirmId(null);
  };


  const handleAddProfile = async () => {
    if (!newProfileName.trim()) return;
    await supabase.from('perfis_base').insert({
      nickname: newProfileName.trim(),
      avatar: selectedAvatar
    });
    setNewProfileName('');
    setIsFamilyModalOpen(false);
  };

  const handleDeleteProfile = async (id: string) => {
    await supabase.from('perfis_base').delete().eq('id', id);
  };


  const handleJoinRoom = async (roomId: string) => {
    setSelectedRoomId(roomId);
    selectedRoomIdRef.current = roomId;
    setMyId(null); // Limpa ID anterior para forçar seleção de quem é você
    setScreen('GAME');
  };

  const incrementPlayerCount = async (roomId: string) => {
    const { error } = await supabase.rpc('increment_players', { room_id: roomId });
    if (error) {
      // Fallback se o RPC não existir
      const { data: partida } = await supabase.from('partidas').select('players_count').eq('id', roomId).single();
      if (partida) {
        await supabase.from('partidas').update({ players_count: (partida.players_count || 0) + 1 }).eq('id', roomId);
      }
    }
  };

  const decrementPlayerCount = async (roomId: string) => {
    const { error } = await supabase.rpc('decrement_players', { room_id: roomId });
    if (error) {
      // Fallback se o RPC não existir
      const { data: partida } = await supabase.from('partidas').select('players_count').eq('id', roomId).single();
      if (partida && (partida.players_count || 0) > 0) {
        await supabase.from('partidas').update({ players_count: (partida.players_count || 0) - 1 }).eq('id', roomId);
      }
    }
  };

  const handleSetupComplete = async (nickname: string, avatarId: string) => {
    const roomId = selectedRoomIdRef.current || selectedRoomId;
    if (!roomId) return;
    
    // Tenta encontrar se esse jogador já existe na sala (Resgate de Sessão)
    const { data: existingPlayer } = await supabase
      .from('jogadores')
      .select('id')
      .eq('partida_id', roomId)
      .eq('nickname', nickname)
      .single();

    if (existingPlayer) {
      setMyId(existingPlayer.id);
      setScreen('GAME');
      return;
    }

    // Se não existe, cria um novo
    const { data: partida } = await supabase.from('partidas').select('capital_inicial').eq('id', roomId).single();
    const capital = partida?.capital_inicial || 25000;

    const { data, error } = await supabase.from('jogadores').insert({
      partida_id: roomId,
      nickname,
      avatar: avatarId,
      saldo: capital
    }).select().single();
    
    if (data) {
      setSelectedRoomId(roomId);
      selectedRoomIdRef.current = roomId;
      setMyId(data.id);
      setScreen('GAME');
    } else {
      console.error('Erro ao criar jogador:', error);
    }
  };


  const hasIncremented = useRef(false);

  useEffect(() => {
    if (myId && selectedRoomId && screen === 'GAME' && !hasIncremented.current) {
      incrementPlayerCount(selectedRoomId);
      hasIncremented.current = true;
    }

    const handleBeforeUnload = () => {
      if (selectedRoomId && screen === 'GAME' && hasIncremented.current) {
        decrementPlayerCount(selectedRoomId);
        hasIncremented.current = false;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [myId, selectedRoomId, screen]);

  const me = gameState.players.find(p => p.id === myId);

  // Mapeamento de avatares para emoji
  const getAvatarEmoji = (id: string) => {
    const avatars: Record<string, string> = {
      '1': '🦊', '2': '🐉', '3': '🤖', '4': '🦄', '5': '🐱', '6': '👑'
    };
    return avatars[id] || '👤';
  };

  const handleTransfer = (amount: number) => {
    if (!myId || !selectedRecipientId || !selectedRoomId) return;
    transfer({ fromId: myId, toId: selectedRecipientId, amount, partidaId: selectedRoomId });
    setTransferAmount('');
    setIsTransferModalOpen(false);
  };

  const handleBankAction = (amount: number, label: string) => {
    if (!myId) return;
    adjustBalance(myId, amount, label);
    setBankAmount('');
    setIsBankModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {screen === 'LOBBY' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ServerSelection 
              rooms={rooms} 
              myRooms={[]} // Removido filtro de localStorage, lixeira aparece para todos
              onCreateRoom={handleCreateRoom} 
              onJoinRoom={handleJoinRoom} 
              onDeleteRoom={handleDeleteRoom}
              onOpenFamilyManager={() => setIsFamilyModalOpen(true)}
            />
          </motion.div>
        )}

        {screen === 'SETUP' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PlayerSetup 
              baseProfiles={baseProfiles}
              onComplete={handleSetupComplete} 
              onBack={() => setScreen('LOBBY')} 
            />
          </motion.div>
        )}

        {screen === 'GAME' && (
          <motion.div 
            key="game" 
            initial={{ opacity: 0, scale: 1.1 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 md:p-10"
          >
            <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-900/40 p-4 md:p-6 rounded-3xl border border-slate-800/50">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2">
                  <span className="bg-blue-600 p-1.5 md:p-2 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)]"><Wallet className="w-5 h-5 md:w-6 md:h-6" /></span>
                  BANCO <span className="text-blue-500 italic">DIGITAL</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">
                  {isConnected ? '● CONEXÃO ESTÁVEL' : '○ RECONECTANDO...'}
                </p>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {me && (
                  <div className="bg-slate-900 border border-slate-800 px-3 md:px-4 py-2 rounded-2xl flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg md:text-2xl shadow-[0_0_10px_rgba(37,99,235,0.3)] border border-slate-700">
                      {getAvatarEmoji(me.avatar)}
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest">HERÓI</p>
                      <p className="text-xs md:text-sm font-bold text-blue-400">{me.nickname}</p>
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => {
                      fetchState();
                      const btn = document.getElementById('sync-btn');
                      if (btn) btn.classList.add('animate-spin');
                      setTimeout(() => btn?.classList.remove('animate-spin'), 1000);
                    }}
                    className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 text-blue-400 transition-all flex items-center justify-center"
                    title="Sincronizar Dados"
                  >
                    <TrendingUp id="sync-btn" className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => {
                      if (selectedRoomId) decrementPlayerCount(selectedRoomId);
                      setScreen('LOBBY');
                      setSelectedRoomId(null);
                      setMyId(null);
                    }}
                    className="p-3 md:px-5 md:py-3 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 hover:border-red-500 text-red-400 hover:text-red-300 transition-all flex items-center gap-2 shrink-0"
                    title="Sair da Sala"
                  >
                    <Home className="w-5 h-5" />
                    <span className="hidden md:inline font-black tracking-widest uppercase text-xs">Sair</span>
                  </button>
              </div>
            </header>

            {error && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold uppercase text-xs tracking-widest">{error}</span>
              </motion.div>
            )}

            {!myId ? (
              <div className="max-w-2xl mx-auto bento-card text-center py-10 bg-slate-900/50 border-blue-600/30">
                <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Quem está <span className="text-blue-500">jogando?</span></h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                  {baseProfiles.map(profile => (
                    <motion.button 
                      key={profile.id} 
                      whileHover={{ scale: 1.05, borderColor: '#2563eb' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSetupComplete(profile.nickname, profile.avatar)} 
                      className="bg-slate-950 border border-slate-800 hover:bg-blue-600/10 p-6 rounded-3xl font-black transition-all flex flex-col items-center gap-3 group"
                    >
                      <span className="text-4xl group-hover:scale-110 transition-transform">{getAvatarEmoji(profile.avatar)}</span>
                      <span className="uppercase text-xs tracking-widest text-slate-300 group-hover:text-blue-400">{profile.nickname}</span>
                    </motion.button>
                  ))}

                  <button 
                    onClick={() => setIsFamilyModalOpen(true)}
                    className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/5 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Plus className="w-4 h-4 text-slate-500 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Novo Perfil</span>
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-800/50">
                  <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Selecione seu perfil para carregar seu saldo</p>
                </div>
              </div>
            ) : (
              <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 grid gap-6">
                  <div className="bento-card bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 border-blue-500/30 overflow-hidden relative">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Tesouro Disponível</p>
                        <h2 className="text-6xl font-black text-white tracking-tighter">
                          R$ <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-500">{me ? me.saldo.toLocaleString() : '---'}</span>
                        </h2>
                      </div>
                      <div className="bg-blue-600/20 p-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        <TrendingUp className="text-blue-400 w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex gap-4 relative z-10">
                      <button onClick={() => setIsTransferModalOpen(true)} className="flex-1 btn-primary py-5 text-lg flex items-center justify-center gap-3">
                        <ArrowRightLeft className="w-6 h-6" />
                        TRANSFERIR CRÉDITOS
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gameState.players.filter(p => p.id !== myId).map(p => (
                      <div key={p.id} className="bento-card flex justify-between items-center group bg-slate-900/40 border-slate-800/50 hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                            {getAvatarEmoji(p.avatar)}
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{p.nickname}</p>
                            <p className="text-xl font-black text-white tracking-tighter">R$ {p.saldo.toLocaleString()}</p>
                          </div>
                        </div>
                        <button onClick={() => { setSelectedRecipientId(p.id); setIsTransferModalOpen(true); }} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
                          <ArrowRightLeft className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Painel de Ações do Banco */}
                  <div className="bento-card bg-slate-900/60 border-slate-800/50 mt-2">
                    <h3 className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Ações do Sistema (Banco)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button onClick={() => handleBankAction(2000, 'Salário (Início)')} className="bg-slate-950 border border-green-900/40 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-green-500 hover:bg-green-900/20 hover:border-green-500/50 transition-all">
                        + SALÁRIO
                      </button>
                      <button onClick={() => { setBankActionType('RECEIVE'); setIsBankModalOpen(true); }} className="bg-slate-950 border border-blue-900/40 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-900/20 hover:border-blue-500/50 transition-all">
                        + RECEBER
                      </button>
                      <button onClick={() => { setBankActionType('PAY'); setIsBankModalOpen(true); }} className="bg-slate-950 border border-red-900/40 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-900/20 hover:border-red-500/50 transition-all">
                        - PAGAR
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bento-card bg-slate-900/40 border-slate-800/50 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-2 mb-6 text-blue-500 relative z-10">
                    <History className="w-5 h-5" />
                    <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">Registro de Ações</h3>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar relative z-10" style={{ maxHeight: '500px' }}>
                    <AnimatePresence initial={false}>
                      {gameState.logs.map((log) => {
                        const isCredit = log.mensagem.includes('(+');
                        const isDebit = log.mensagem.includes('(-');
                        const isTransfer = !isCredit && !isDebit;
                        
                        const colorStyle = isCredit 
                          ? 'border-l-green-500/70 bg-gradient-to-r from-green-500/10 to-transparent text-green-300' 
                          : isDebit 
                            ? 'border-l-red-500/70 bg-gradient-to-r from-red-500/10 to-transparent text-red-300'
                            : 'border-l-blue-500/70 bg-gradient-to-r from-blue-500/10 to-transparent text-blue-300';
                            
                        const dotColor = isCredit ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : isDebit ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]';

                        return (
                          <motion.div 
                            key={log.id} 
                            layout
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`border-l-4 p-4 rounded-r-2xl border-y border-r border-y-slate-800/30 border-r-slate-800/30 backdrop-blur-sm shadow-sm ${colorStyle}`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] text-slate-500 font-black tracking-widest">{new Date(log.criada_em).toLocaleTimeString()}</span>
                              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColor}`} />
                            </div>
                            <p className="text-xs font-bold leading-relaxed tracking-tight">{log.mensagem}</p>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </main>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTransferModalOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bento-card bg-slate-900 border-blue-500/50 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">Enviar <span className="text-blue-500">Saldo</span></h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Destinatário</label>
                  <select value={selectedRecipientId || ''} onChange={(e) => setSelectedRecipientId(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-800 p-4 rounded-xl text-white font-bold outline-none focus:border-blue-600 transition-all">
                    <option value="">Selecione um herói</option>
                    {gameState.players.filter(p => p.id !== myId).map(p => (
                      <option key={p.id} value={p.id}>{p.nickname}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Quantidade de Créditos</label>
                  <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0,00" className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-3xl font-black text-white outline-none focus:border-blue-600 transition-all text-center" />
                </div>
                <button onClick={() => { const val = Number(transferAmount); if (val > 0) handleTransfer(val); }} className="w-full btn-primary py-5 text-lg font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(37,99,235,0.3)]">
                  EFETUAR TRANSFERÊNCIA
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBankModalOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className={`relative w-full max-w-sm bento-card bg-slate-900 border shadow-[0_0_50px_rgba(0,0,0,0.5)] ${bankActionType === 'PAY' ? 'border-red-500/50' : 'border-blue-500/50'}`}>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">
                {bankActionType === 'PAY' ? 'Pagar ao Banco' : 'Receber do Banco'}
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor da Transação</label>
                  <input type="number" value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} placeholder="0,00" className={`w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-3xl font-black outline-none transition-all text-center ${bankActionType === 'PAY' ? 'text-red-400 focus:border-red-600' : 'text-blue-400 focus:border-blue-600'}`} />
                </div>
                <button onClick={() => { 
                  const val = Number(bankAmount); 
                  if (val > 0) {
                    if (bankActionType === 'PAY') handleBankAction(-val, 'Pagamento ao Banco');
                    else handleBankAction(val, 'Recebimento do Banco');
                  }
                }} className={`w-full py-5 rounded-xl text-lg font-black uppercase tracking-widest text-white transition-all ${bankActionType === 'PAY' ? 'bg-red-600 hover:bg-red-500 shadow-[0_10px_20px_rgba(220,38,38,0.3)]' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_10px_20px_rgba(37,99,235,0.3)]'}`}>
                  CONFIRMAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Criar Sala */}
      <AnimatePresence>
        {isCreateRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreateRoomModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-md rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-8 shadow-[0_0_80px_rgba(37,99,235,0.15)]"
            >
              {/* Glow de fundo decorativo */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter text-white">Nova Sala</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Configure sua partida</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Nome da Sala</label>
                  <input
                    autoFocus
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmCreateRoom()}
                    placeholder="Ex: Familia Silva, Turma do Rolê..."
                    className="w-full bg-slate-950/80 border-2 border-slate-700 focus:border-blue-500 p-4 rounded-2xl text-lg font-bold text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsCreateRoomModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl border-2 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-black uppercase tracking-widest transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmCreateRoom}
                    disabled={!newRoomName.trim()}
                    className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest transition-all text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  >
                    Criar Sala 🚀
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirmar Exclusão */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-sm rounded-3xl border border-red-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/30 p-8 shadow-[0_0_80px_rgba(220,38,38,0.1)]"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter text-white">Encerrar Sala?</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Esta ação é irreversível</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-8 relative z-10 leading-relaxed">
                Todos os jogadores serão desconectados e o histórico da partida será <span className="text-red-400 font-bold">permanentemente apagado</span>.
              </p>

              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-black uppercase tracking-widest transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteRoom}
                  className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                >
                  Deletar 🗑️
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal: Gerenciar Família */}
      <AnimatePresence>
        {isFamilyModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFamilyModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bento-card bg-slate-900 border-blue-500/30 p-8 overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Jogadores da <span className="text-blue-500">Família</span></h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Perfis salvos para acesso rápido</p>
                </div>
                <button onClick={() => setIsFamilyModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <AlertCircle className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Formulário Novo Perfil */}
                <div className="space-y-6 bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">Adicionar Novo Herói</h4>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold uppercase mb-2">Nickname</label>
                    <input 
                      type="text" 
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Nome do jogador..."
                      className="w-full bg-slate-900 border-2 border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold uppercase mb-2">Avatar / Emoji</label>
                    <div className="grid grid-cols-6 gap-2">
                      {['1','2','3','4','5','6'].map(id => (
                        <button 
                          key={id}
                          onClick={() => setSelectedAvatar(id)}
                          className={`text-xl p-2 rounded-lg border-2 transition-all ${selectedAvatar === id ? 'border-blue-600 bg-blue-600/20' : 'border-slate-800 bg-slate-900'}`}
                        >
                          {getAvatarEmoji(id)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={handleAddProfile}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
                  >
                    Salvar Perfil
                  </button>
                </div>

                {/* Lista de Perfis */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Perfis Cadastrados ({baseProfiles.length})</h4>
                  {baseProfiles.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-4 rounded-2xl group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getAvatarEmoji(profile.avatar)}</span>
                        <span className="font-bold text-slate-200">{profile.nickname}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {baseProfiles.length === 0 && (
                    <p className="text-center text-slate-600 text-xs py-10 italic">Nenhum herói cadastrado ainda.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
