import { motion, useReducedMotion } from 'framer-motion';
import { Users, Plus, Globe, Zap, Trash2 } from 'lucide-react';
import type { Room } from '../lobby.types';

const glassCard =
  'rounded-3xl border border-white/15 bg-slate-950/30 shadow-xl backdrop-blur-xl backdrop-saturate-150 ring-1 ring-white/[0.06]';

interface ServerSelectionProps {
  rooms: Room[];
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onOpenFamilyManager: () => void;
}

export const ServerSelection = ({ rooms, onCreateRoom, onJoinRoom, onDeleteRoom, onOpenFamilyManager }: ServerSelectionProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 md:p-6">
      {/* Fundo: imagem + leitura (parte inferior da arte é mais carregada) */}
      <div className="absolute inset-0 bg-[#020617]" aria-hidden />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-[position:center_25%]"
        style={{ backgroundImage: "url('/lobby-bg.png')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/35 to-slate-950/90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,transparent_0%,rgba(2,6,23,0.55)_70%)]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-10 w-full max-w-3xl text-center md:mb-12"
      >
        <div className="mx-auto rounded-3xl border border-white/16 bg-slate-950/35 px-6 py-8 shadow-2xl backdrop-blur-xl md:px-10 md:py-10">
          <h1 className="mb-3 bg-gradient-to-r from-amber-100 via-white to-blue-200 bg-clip-text text-4xl font-black tracking-tighter text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] md:mb-4 md:text-6xl">
            BANCO IMOBILIÁRIO
          </h1>
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] md:mb-6 md:text-sm">
            Seja bem vindo ao mundo imobiliário
          </p>
          <button
            onClick={onOpenFamilyManager}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-4 py-3 font-black uppercase tracking-widest text-blue-100 shadow-lg backdrop-blur-md transition-all hover:border-amber-400/40 hover:bg-white/16 hover:text-white md:px-6"
          >
            <Users className="h-4 w-4" />
            Criar ou modificar perfis
          </button>
        </div>
      </motion.div>

      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={onCreateRoom}
          className={`group relative flex h-64 flex-col items-center justify-center gap-4 overflow-hidden border-2 border-dashed border-white/22 transition-colors hover:border-white/35 ${glassCard}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <motion.div
            className="relative flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/35 bg-blue-600/25 backdrop-blur-md shadow-[0_0_18px_rgba(37,99,235,0.35)] transition-colors group-hover:border-blue-300/50 group-hover:bg-blue-600/40"
            animate={
              reduceMotion
                ? { scale: 1, boxShadow: '0 0 18px rgba(59, 130, 246, 0.4)' }
                : {
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 14px rgba(59, 130, 246, 0.35)',
                      '0 0 28px rgba(59, 130, 246, 0.65)',
                      '0 0 14px rgba(59, 130, 246, 0.35)',
                    ],
                  }
            }
            transition={
              reduceMotion ? { duration: 0 } : { duration: 2.1, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <Plus className="h-8 w-8 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform" />
          </motion.div>
          <span className="relative text-xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] group-hover:text-white">
            CRIAR NOVA SALA
          </span>
          <p className="relative text-sm text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">Torne-se o líder da partida</p>
        </motion.button>

        {rooms.length === 0 ? (
          <div
            className={`col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-white/20 p-10 md:col-span-2 lg:col-span-2 ${glassCard}`}
          >
            <Globe className="mb-4 h-12 w-12 text-slate-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
            <h3 className="mb-2 text-xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">Nenhum Servidor Ativo</h3>
            <p className="text-center text-sm text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
              Seja o primeiro a criar uma sala e convide seus amigos para jogar.
            </p>
          </div>
        ) : (
          rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bento-card group relative flex flex-col justify-between overflow-hidden border-white/15 !bg-slate-950/32 !backdrop-blur-xl !backdrop-saturate-150`}
            >
              <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Globe className="h-20 w-20 text-blue-300" />
              </div>

              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded border border-emerald-400/40 bg-emerald-950/35 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-100 backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    ONLINE
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRoom(room.id);
                      }}
                      className="rounded-lg border border-white/15 bg-slate-950/40 p-1.5 text-slate-200 backdrop-blur-md transition-colors hover:border-red-400/40 hover:text-red-300"
                      title="Deletar Sala"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-slate-950/40 px-2 py-1 text-slate-100 backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-bold">{room.players_count || 0}/6</span>
                    </div>
                  </div>
                </div>
                <h3 className="mb-1 text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.92)] transition-colors group-hover:text-blue-200">
                  {room.nome || `SALA #${room.id.slice(0, 4)}`}
                </h3>
                <p className="text-xs font-medium italic text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                  Líder: {room.lider_id ? 'Jogador' : 'Desconhecido'}
                </p>
              </div>

              <button
                onClick={() => onJoinRoom(room.id)}
                type="button"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-blue-600/80 py-4 font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md transition-all hover:bg-blue-600"
              >
                <Zap className="h-4 w-4" />
                ENTRAR NO SERVIDOR
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
