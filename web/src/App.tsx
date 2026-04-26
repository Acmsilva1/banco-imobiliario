import React, { useState } from 'react';
import { useSocket } from './features/bank/hooks/useSocket';
import { Wallet, ArrowRightLeft, History, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [partidaId] = useState('SALA-PROTOTIPO');
  const { gameState, isConnected, error, transfer } = useSocket(partidaId);
  const [myId, setMyId] = useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);

  const me = gameState.players.find(p => p.id === myId);

  const handleTransfer = (amount: number) => {
    if (!myId || !selectedRecipientId) return;
    transfer({ fromId: myId, toId: selectedRecipientId, amount, partidaId });
    setIsTransferModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg"><Wallet className="w-6 h-6" /></span>
            BANCO <span className="text-blue-500 italic">DIGITAL</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">
            {isConnected ? '● Sistema Operacional' : '○ Reconectando...'}
          </p>
        </div>
        {me && (
          <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              {me.nickname[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Jogador</p>
              <p className="text-sm font-bold">{me.nickname}</p>
            </div>
          </div>
        )}
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-400"
        >
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </motion.div>
      )}

      {!myId ? (
        <div className="max-w-md mx-auto bento-card text-center py-10">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Identifique-se</h2>
          <p className="text-slate-400 mb-8">Escolha seu personagem para entrar na partida.</p>
          <div className="grid gap-3">
            {gameState.players.map(p => (
              <button 
                key={p.id}
                onClick={() => setMyId(p.id)}
                className="bg-slate-800 hover:bg-blue-600 p-4 rounded-xl font-bold transition-all"
              >
                {p.nickname}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid gap-6">
            <div className="bento-card bg-gradient-to-br from-blue-600/20 to-transparent border-blue-500/30">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Saldo Disponível</p>
                  <h2 className="text-5xl font-black text-white">
                    R$ <span className="text-blue-500">{me?.saldo.toLocaleString()}</span>
                  </h2>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-2xl">
                  <TrendingUp className="text-blue-400 w-6 h-6" />
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  Transferir
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gameState.players.filter(p => p.id !== myId).map(p => (
                <div key={p.id} className="bento-card flex justify-between items-center group">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">{p.nickname}</p>
                    <p className="text-xl font-bold text-slate-200">R$ {p.saldo.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedRecipientId(p.id);
                      setIsTransferModalOpen(true);
                    }}
                    className="p-3 bg-slate-800 rounded-xl group-hover:bg-blue-600 transition-colors"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-slate-400">
              <History className="w-5 h-5" />
              <h3 className="font-bold uppercase text-xs tracking-widest">Auditoria em Tempo Real</h3>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {gameState.logs.map((log, i) => (
                <div key={i} className="border-l-2 border-slate-800 pl-4 py-1">
                  <p className="text-[10px] text-slate-600 font-mono mb-1">
                    {new Date(log.criada_em).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">{log.mensagem}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bento-card bg-slate-900"
            >
              <h3 className="text-xl font-bold mb-4">Enviar Dinheiro</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Para quem?</label>
                  <select 
                    value={selectedRecipientId || ''} 
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="">Selecione um jogador</option>
                    {gameState.players.filter(p => p.id !== myId).map(p => (
                      <option key={p.id} value={p.id}>{p.nickname}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor</label>
                  <input 
                    type="number" 
                    placeholder="R$ 0,00"
                    className="w-full input-field text-2xl font-bold"
                  />
                </div>
                <button 
                  onClick={() => {
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                    const val = Number(input.value);
                    if (val > 0) handleTransfer(val);
                  }}
                  className="w-full btn-primary"
                >
                  Confirmar Envio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
