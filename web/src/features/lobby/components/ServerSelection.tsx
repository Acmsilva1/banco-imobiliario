import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Globe, Zap, Trash2 } from 'lucide-react';
import type { Room } from '../lobby.types';

interface ServerSelectionProps {
  rooms: Room[];
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onOpenFamilyManager: () => void;
}

export const ServerSelection = ({ rooms, onCreateRoom, onJoinRoom, onDeleteRoom, onOpenFamilyManager }: ServerSelectionProps) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);

  const updateSpotlight = (x: number, y: number) => {
    const node = sceneRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--pointer-x', `${x - rect.left}px`);
    node.style.setProperty('--pointer-y', `${y - rect.top}px`);
  };

  return (
    <div
      ref={sceneRef}
      onPointerMove={(event) => updateSpotlight(event.clientX, event.clientY)}
      onTouchMove={(event) => {
        const touch = event.touches[0];
        if (touch) updateSpotlight(touch.clientX, touch.clientY);
      }}
      onPointerLeave={() => {
        const node = sceneRef.current;
        if (!node) return;
        node.style.setProperty('--pointer-x', '50%');
        node.style.setProperty('--pointer-y', '30%');
      }}
      className="lobby-scene min-h-screen p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="lobby-scene-bg" aria-hidden="true">
        <div className="lobby-spotlight" />
        <div className="lobby-grid-lines" />
        <span className="lobby-float lobby-float-a">🏦</span>
        <span className="lobby-float lobby-float-b">🪙</span>
        <span className="lobby-float lobby-float-c">💳</span>
        <span className="lobby-float lobby-float-d">🏙️</span>
        <span className="lobby-float lobby-float-e">💸</span>
        <span className="lobby-float lobby-float-f">🎲</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 md:mb-12 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-purple-600 mb-3 md:mb-4 filter drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          BANCO IMOBILIÁRIO
        </h1>
        <p className="text-blue-300 font-bold uppercase tracking-[0.25em] text-[10px] md:text-sm animate-pulse mb-5 md:mb-6">
          Seja bem vindo ao mundo imobiliário
        </p>
        <button
          onClick={onOpenFamilyManager}
          className="inline-flex items-center gap-2 px-4 md:px-6 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-blue-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-600/10 transition-all font-black uppercase text-[10px] tracking-widest"
        >
          <Users className="w-4 h-4" />
          Criar ou modificar perfis
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-6xl relative z-10">
        <motion.button 
          whileHover={{ scale: 1.02, borderColor: '#2563eb' }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateRoom}
          className="group relative h-64 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-4 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
          <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all">
            <Plus className="w-8 h-8 text-blue-400 group-hover:text-white" />
          </div>
          <span className="text-xl font-bold text-slate-300 group-hover:text-white">CRIAR NOVA SALA</span>
          <p className="text-slate-500 text-sm">Torne-se o líder da partida</p>
        </motion.button>

        {rooms.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <Globe className="w-12 h-12 text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">Nenhum Servidor Ativo</h3>
            <p className="text-slate-600 text-sm text-center">Seja o primeiro a criar uma sala e convide seus amigos para jogar.</p>
          </div>
        ) : (
          rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bento-card border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Globe className="w-20 h-20 text-blue-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                    ONLINE
                  </div>
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteRoom(room.id); }}
                        className="text-slate-500 hover:text-red-500 transition-colors bg-slate-950 p-1.5 rounded-lg border border-slate-800 hover:border-red-500/50"
                        title="Deletar Sala"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    <div className="flex items-center gap-1 text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-bold">{room.players_count || 0}/6</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors">
                  {room.nome || `SALA #${room.id.slice(0,4)}`}
                </h3>
                <p className="text-slate-500 text-xs font-medium italic">Líder: {room.lider_id ? 'Jogador' : 'Desconhecido'}</p>
              </div>

              <button 
                onClick={() => onJoinRoom(room.id)}
                className="mt-8 w-full py-4 rounded-xl bg-slate-800 group-hover:bg-blue-600 text-white font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                ENTRAR NO SERVIDOR
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
