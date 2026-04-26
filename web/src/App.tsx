import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerSelection } from './features/lobby/components/ServerSelection';
import { PlayerSetup } from './features/lobby/components/PlayerSetup';
import { useSocket } from './features/bank/hooks/useSocket';
import { supabase } from './core/supabase';
import { Wallet, ArrowRightLeft, History, TrendingUp, AlertCircle, Home } from 'lucide-react';

type Screen = 'LOBBY' | 'SETUP' | 'GAME';

export default function App() {
  const [screen, setScreen] = useState<Screen>('LOBBY');
  const [rooms, setRooms] = useState<any[]>([]);
  const [myRooms, setMyRooms] = useState<string[]>(JSON.parse(localStorage.getItem('my_rooms') || '[]'));
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankActionType, setBankActionType] = useState<'PAY' | 'RECEIVE'>('PAY');
  const [bankAmount, setBankAmount] = useState<string>('');

  const { gameState, isConnected, error, transfer, adjustBalance } = useSocket(selectedRoomId || '');

  useEffect(() => {
    fetchRooms();
    const subscription = supabase
      .channel('public:partidas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, fetchRooms)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRooms = async () => {
    const { data } = await supabase.from('partidas').select('*').eq('status', 'LOBBY');
    if (data) setRooms(data);
  };

  const handleCreateRoom = async () => {
    const nome = prompt('Nome da Sala:');
    if (!nome) return;
    const { data } = await supabase.from('partidas').insert({ 
      nome, 
      codigo_sala: Math.random().toString(36).substring(7).toUpperCase() 
    }).select().single();
    
    if (data) {
      const newMyRooms = [...myRooms, data.id];
      setMyRooms(newMyRooms);
      localStorage.setItem('my_rooms', JSON.stringify(newMyRooms));
      setSelectedRoomId(data.id);
      setScreen('SETUP');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Tem certeza que deseja encerrar e deletar esta sala?')) {
      await supabase.from('partidas').delete().eq('id', roomId);
      setMyRooms(myRooms.filter(id => id !== roomId));
      localStorage.setItem('my_rooms', JSON.stringify(myRooms.filter(id => id !== roomId)));
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    setSelectedRoomId(roomId);
    const savedId = localStorage.getItem('session_' + roomId);
    if (savedId) {
      setMyId(savedId);
      setScreen('GAME');
      await incrementPlayerCount(roomId);
    } else {
      setScreen('SETUP');
    }
  };

  const incrementPlayerCount = async (roomId: string) => {
    const { data: partida } = await supabase.from('partidas').select('players_count').eq('id', roomId).single();
    if (partida) {
      await supabase.from('partidas').update({ players_count: (partida.players_count || 0) + 1 }).eq('id', roomId);
    }
  };

  const decrementPlayerCount = async (roomId: string) => {
    const { data: partida } = await supabase.from('partidas').select('players_count').eq('id', roomId).single();
    if (partida && partida.players_count && partida.players_count > 0) {
      await supabase.from('partidas').update({ players_count: partida.players_count - 1 }).eq('id', roomId);
    }
  };

  const handleSetupComplete = async (nickname: string, avatarId: string) => {
    if (!selectedRoomId) return;
    
    const { data: partida } = await supabase.from('partidas').select('capital_inicial').eq('id', selectedRoomId).single();
    const capital = partida?.capital_inicial || 25000;

    const { data, error } = await supabase.from('jogadores').insert({
      partida_id: selectedRoomId,
      nickname,
      avatar: avatarId,
      saldo: capital
    }).select().single();
    
    if (data) {
      localStorage.setItem('session_' + selectedRoomId, data.id);
      setMyId(data.id);
      setScreen('GAME');
      await incrementPlayerCount(selectedRoomId);
    } else {
      console.error('Erro ao criar jogador:', error);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedRoomId && screen === 'GAME') {
        // Usa beacon para garantir envio no fechamento da aba
        navigator.sendBeacon(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/decrement_players_count`, JSON.stringify({ room_id: selectedRoomId }));
        // Fallback frontend caso não haja RPC
        decrementPlayerCount(selectedRoomId);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedRoomId, screen]);

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
              myRooms={myRooms}
              onCreateRoom={handleCreateRoom} 
              onJoinRoom={handleJoinRoom} 
              onDeleteRoom={handleDeleteRoom}
            />
          </motion.div>
        )}

        {screen === 'SETUP' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PlayerSetup onComplete={handleSetupComplete} onBack={() => setScreen('LOBBY')} />
          </motion.div>
        )}

        {screen === 'GAME' && (
          <motion.div 
            key="game" 
            initial={{ opacity: 0, scale: 1.1 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 md:p-10"
          >
            <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                  <span className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]"><Wallet className="w-6 h-6" /></span>
                  BANCO <span className="text-blue-500 italic">DIGITAL</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black mt-1 uppercase tracking-[0.3em]">
                  {isConnected ? '● CONEXÃO ESTÁVEL' : '○ RECONECTANDO...'}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {me && (
                  <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-2xl shadow-[0_0_10px_rgba(37,99,235,0.3)] border border-slate-700">
                      {getAvatarEmoji(me.avatar)}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">HERÓI</p>
                      <p className="text-sm font-bold text-blue-400">{me.nickname}</p>
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => {
                    if (selectedRoomId) decrementPlayerCount(selectedRoomId);
                    setScreen('LOBBY');
                    setSelectedRoomId(null);
                    setMyId(null);
                  }}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-blue-600/20 hover:border-blue-500 text-slate-500 hover:text-blue-400 transition-all"
                  title="Voltar ao Lobby"
                >
                  <Home className="w-5 h-5" />
                </button>
              </div>
            </header>

            {error && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold uppercase text-xs tracking-widest">{error}</span>
              </motion.div>
            )}

            {!myId && gameState.players.length > 0 ? (
              <div className="max-w-md mx-auto bento-card text-center py-10 bg-slate-900/50 border-blue-600/30">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Escolha seu <span className="text-blue-500">Slot</span></h2>
                <div className="grid gap-3">
                  {gameState.players.map(p => (
                    <button key={p.id} onClick={() => setMyId(p.id)} className="bg-slate-950 border border-slate-800 hover:border-blue-600 hover:bg-blue-600/10 p-5 rounded-2xl font-black transition-all flex justify-between items-center group">
                      <span className="group-hover:text-blue-400">{p.nickname}</span>
                      <span className="text-[10px] text-slate-600 font-mono">ID: {p.id.slice(0,4)}</span>
                    </button>
                  ))}
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
                          R$ <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-500">{me?.saldo.toLocaleString() || '0'}</span>
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
                    <div className="grid grid-cols-3 gap-3">
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

                <div className="bento-card bg-slate-950/50 border-slate-800/50 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-6 text-blue-500">
                    <History className="w-5 h-5" />
                    <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">LOG DE TRANSAÇÕES</h3>
                  </div>
                  <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    {gameState.logs.map((log, i) => (
                      <div key={i} className="bg-slate-900/50 border-l-2 border-blue-600/50 p-4 rounded-r-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-600 font-mono">{new Date(log.criada_em).toLocaleTimeString()}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed uppercase tracking-tight">{log.mensagem}</p>
                      </div>
                    ))}
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
    </div>
  );
}
