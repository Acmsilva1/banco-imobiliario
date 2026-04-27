import { motion, useReducedMotion } from 'framer-motion';
import { Users, Plus, Globe, Zap, Trash2 } from 'lucide-react';
import type { Room } from '../lobby.types';

const glassPanel =
  'rounded-2xl border border-amber-900/30 bg-slate-950/[0.18] shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-md backdrop-saturate-125 ring-1 ring-amber-950/20';

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
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-8 md:px-6 md:py-10">
      <div className="absolute inset-0 bg-[#020617]" aria-hidden />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-[position:center_25%]"
        style={{ backgroundImage: "url('/lobby-bg.png')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/20 to-slate-950/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,transparent_0%,rgba(2,6,23,0.38)_72%)]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6 w-full max-w-5xl text-center md:mb-8"
      >
        <div className="mx-auto rounded-3xl border border-white/10 bg-slate-950/[0.18] px-5 py-6 shadow-xl backdrop-blur-md md:px-8 md:py-8">
          <h1 className="mb-2 bg-gradient-to-r from-amber-100 via-white to-blue-200 bg-clip-text text-3xl font-black tracking-tighter text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] md:text-5xl">
            BANCO IMOBILIÁRIO
          </h1>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] md:mb-5 md:text-sm">
            Seja bem vindo ao mundo imobiliário
          </p>
          <button
            onClick={onOpenFamilyManager}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 font-black uppercase tracking-widest text-blue-100 shadow-md backdrop-blur-sm transition-all hover:border-amber-400/35 hover:bg-white/12 hover:text-white md:px-6 md:py-3"
          >
            <Users className="h-4 w-4" />
            Criar ou modificar perfis
          </button>
        </div>
      </motion.div>

      {/* Painel estilo lista de servidor MMO */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`relative z-10 w-full max-w-5xl overflow-hidden ${glassPanel}`}
      >
        <div className="h-1 bg-gradient-to-r from-amber-900 via-amber-500/90 to-amber-900" aria-hidden />

        <div className="flex flex-col gap-3 border-b border-white/10 bg-black/25 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-600/40 bg-amber-950/40 shadow-inner">
              <Globe className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-100/95 drop-shadow-sm md:text-sm">
                Canais de partida
              </h2>
              <p className="text-[10px] text-slate-400 md:text-xs">Escolha uma sala na lista abaixo</p>
            </div>
            <span className="ml-auto rounded border border-amber-700/50 bg-black/40 px-2.5 py-1 font-mono text-xs tabular-nums text-amber-200 sm:ml-0">
              {rooms.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onCreateRoom}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/40 px-4 py-2.5 font-black uppercase tracking-widest text-blue-100 shadow-md backdrop-blur-sm transition-all hover:border-blue-400/60 hover:bg-blue-900/50 hover:text-white md:px-5"
          >
            <motion.span
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/35 bg-blue-600/30"
              animate={
                reduceMotion
                  ? { scale: 1, boxShadow: '0 0 12px rgba(59, 130, 246, 0.35)' }
                  : {
                      scale: [1, 1.08, 1],
                      boxShadow: [
                        '0 0 10px rgba(59, 130, 246, 0.3)',
                        '0 0 22px rgba(59, 130, 246, 0.55)',
                        '0 0 10px rgba(59, 130, 246, 0.3)',
                      ],
                    }
              }
              transition={reduceMotion ? { duration: 0 } : { duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Plus className="h-5 w-5 text-white drop-shadow" />
            </motion.span>
            <span className="text-[11px] md:text-xs">Nova sala</span>
          </button>
        </div>

        {/* Cabeçalho de colunas — desktop */}
        <div className="hidden border-b border-white/5 bg-slate-950/40 px-6 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 md:grid md:grid-cols-12 md:gap-3 md:px-6">
          <div className="col-span-4">Sala</div>
          <div className="col-span-3">Líder (empresário)</div>
          <div className="col-span-2 text-center">Jogadores</div>
          <div className="col-span-1 text-center">Estado</div>
          <div className="col-span-2 text-right">Ação</div>
        </div>

        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-t border-dashed border-white/10 px-6 py-16 text-center">
            <Globe className="mb-4 h-14 w-14 text-slate-500" />
            <h3 className="mb-2 text-lg font-black uppercase tracking-wide text-slate-200 drop-shadow-md">
              Sem salas até o momento
            </h3>
            <p className="max-w-md text-sm text-slate-400">
              Nenhum canal aberto. Use «Nova sala» acima para abrir a primeira partida.
            </p>
          </div>
        ) : (
          <ul className="max-h-[min(52vh,520px)] divide-y divide-white/[0.06] overflow-y-auto overscroll-contain">
            {rooms.map((room, i) => (
              <motion.li
                key={room.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.35) }}
                className="group/row bg-transparent transition-colors hover:bg-white/[0.04]"
              >
                {/* Mobile: bloco empilhado */}
                <div className="flex flex-col gap-3 p-4 md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sala</p>
                      <p className="text-lg font-black text-white drop-shadow-md">{room.nome || `Sala #${room.id.slice(0, 4)}`}</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        <span className="font-bold uppercase tracking-wide text-slate-500">Código da sala</span>
                        <span className="mx-1 text-slate-600">·</span>
                        <span className="font-mono text-slate-300">{room.codigo_sala}</span>
                      </p>
                    </div>
                    <span className="shrink-0 rounded border border-emerald-500/35 bg-emerald-950/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-200">
                      Online
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500">Líder</p>
                      <p className="truncate font-medium text-slate-200">{room.lider_nickname?.trim() || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500">Jogadores</p>
                      <p className="font-mono text-amber-200/90">
                        {room.players_count || 0}/6
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteRoom(room.id)}
                      className="rounded-lg border border-white/10 bg-slate-950/40 p-3 text-slate-400 transition-colors hover:border-red-500/40 hover:text-red-300"
                      title="Remover sala"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onJoinRoom(room.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-600/70 py-3 font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-blue-600"
                    >
                      <Zap className="h-4 w-4" />
                      Entrar
                    </button>
                  </div>
                </div>

                {/* Desktop: linha tipo MMO */}
                <div className="hidden items-center gap-3 px-6 py-3.5 md:grid md:grid-cols-12">
                  <div className="col-span-4 min-w-0">
                    <p className="truncate text-base font-black text-white drop-shadow-md group-hover/row:text-blue-100">
                      {room.nome || `Sala #${room.id.slice(0, 4)}`}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      <span className="font-bold uppercase tracking-wide text-slate-500">Código da sala</span>
                      <span className="mx-1.5 text-slate-600">·</span>
                      <span className="font-mono text-slate-400">{room.codigo_sala}</span>
                    </p>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{room.lider_nickname?.trim() || '—'}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="inline-block rounded border border-amber-800/50 bg-black/35 px-3 py-1 font-mono text-sm tabular-nums text-amber-200">
                      {room.players_count || 0}/6
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className="rounded border border-emerald-500/35 bg-emerald-950/25 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-200">
                      Online
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteRoom(room.id)}
                      className="rounded-lg border border-white/10 bg-slate-950/30 p-2 text-slate-400 transition-colors hover:border-red-500/40 hover:text-red-300"
                      title="Remover sala"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onJoinRoom(room.id)}
                      className="flex min-w-[120px] items-center justify-center gap-1.5 rounded-lg border border-blue-400/40 bg-blue-600/75 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:border-blue-300/60 hover:bg-blue-600"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Entrar
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}

        <div className="border-t border-white/5 bg-black/20 px-4 py-2 text-center text-[10px] text-slate-500 md:text-left md:px-6">
          Partidas em lobby · máximo 6 empresários por sala
        </div>
      </motion.div>
    </div>
  );
};
