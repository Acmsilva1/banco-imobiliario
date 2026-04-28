import { motion, useReducedMotion } from 'framer-motion';
import { Users, Plus, Globe, Zap, Trash2 } from 'lucide-react';
import type { Room } from '../lobby.types';

const glassPanel =
  'rounded-2xl border border-amber-900/30 bg-slate-950/[0.18] shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-md backdrop-saturate-125 ring-1 ring-amber-950/20';

function MobileRoomSlide({
  room,
  i,
  onJoinRoom,
  onDeleteRoom,
  isOnlyRoom
}: {
  room: Room;
  i: number;
  onJoinRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  isOnlyRoom?: boolean;
}) {
  const widthClass = isOnlyRoom
    ? 'w-full min-w-[calc(100%-0.25rem)] max-w-full'
    : 'w-[min(82vw,22rem)] max-w-[calc(100vw-2.5rem)] shrink-0';

  return (
    <motion.li
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(i * 0.05, 0.25) }}
      className={`group/row rounded-xl border border-white/[0.08] bg-black/30 shadow-inner backdrop-blur-sm ${widthClass}`}
    >
      <div className="flex flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sala</p>
            <p className="text-base font-black leading-tight text-white drop-shadow-md sm:text-lg">
              {room.nome || `Sala #${room.id.slice(0, 4)}`}
            </p>
            <p className="mt-0.5 text-[9px] text-slate-500 sm:mt-1 sm:text-[10px]">
              <span className="font-bold uppercase tracking-wide text-slate-500">Código da sala</span>
              <span className="mx-1 text-slate-600">·</span>
              <span className="font-mono text-slate-300">{room.codigo_sala}</span>
            </p>
          </div>
          <span className="shrink-0 rounded border border-emerald-500/35 bg-emerald-950/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-200">
            Online
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase text-slate-500 sm:text-[9px]">Líder</p>
            <p className="truncate font-medium text-slate-200">{room.lider_nickname?.trim() || '—'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase text-slate-500 sm:text-[9px]">Jogadores</p>
            <p className="font-mono text-sm text-amber-200/90 tabular-nums sm:text-base">{room.players_count || 0}/6</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onDeleteRoom(room.id)}
            className="rounded-lg border border-white/10 bg-slate-950/40 p-2.5 text-slate-400 transition-colors hover:border-red-500/40 hover:text-red-300 sm:p-3"
            title="Remover sala"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onJoinRoom(room.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-600/70 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-blue-600 sm:py-3 sm:text-[11px] sm:tracking-widest"
          >
            <Zap className="h-4 w-4" />
            Entrar
          </button>
        </div>
      </div>
    </motion.li>
  );
}

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
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden md:min-h-screen">
      <div className="absolute inset-0 bg-[#020617]" aria-hidden />

      {/* Mobile: céu azul suave no topo (evita “buraco” preto) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[min(30dvh,200px)] bg-gradient-to-b from-sky-400/35 via-sky-900/20 to-transparent md:hidden"
        aria-hidden
      />

      {/* Desktop / tablet: leve ~104% largura para cortar menos nas laterais dos personagens */}
      <div
        className="absolute inset-0 hidden bg-[length:104%_auto] bg-[position:center_22%] bg-no-repeat md:block"
        style={{ backgroundImage: "url('/lobby-bg.png')" }}
        aria-hidden
      />

      {/* Mobile: faixa inferior — imagem um pouco mais larga que o ecrã, centrada, para não cortar tanto nas bordas */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(42dvh,320px)] max-h-[45%] min-h-[140px] overflow-hidden md:hidden"
        aria-hidden
      >
        <img
          src="/lobby-bg.png"
          alt=""
          draggable={false}
          className="absolute bottom-0 left-1/2 h-full w-[108%] max-w-none -translate-x-1/2 object-cover object-bottom opacity-[0.88]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-slate-950/10 to-slate-950/65" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-slate-950/40 to-transparent md:from-slate-950/35 md:via-slate-950/12 md:to-slate-950/50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_22%,transparent_0%,rgba(2,6,23,0.22)_72%)] md:block"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col justify-center gap-3 overflow-y-auto overscroll-contain px-3 pb-[min(50dvh,300px)] pt-6 sm:gap-4 sm:px-4 sm:pb-[min(46dvh,280px)] md:mx-auto md:max-w-3xl md:flex-none md:justify-start md:gap-0 md:overflow-visible md:px-5 md:py-6 lg:max-w-4xl lg:px-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 w-full text-center md:mb-5"
      >
        <div className="mx-auto rounded-2xl border border-white/10 bg-slate-950/[0.22] px-4 py-4 shadow-xl backdrop-blur-md sm:rounded-3xl sm:px-5 sm:py-5 md:px-5 md:py-5 lg:px-6 lg:py-6">
          <h1 className="mb-1.5 bg-gradient-to-r from-amber-100 via-white to-blue-200 bg-clip-text text-2xl font-black tracking-tighter text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-3xl md:mb-1.5 md:text-3xl lg:text-4xl">
            BANCO IMOBILIÁRIO
          </h1>
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] sm:text-[10px] sm:tracking-[0.25em] md:mb-3 md:text-xs">
            Seja bem vindo ao mundo imobiliário
          </p>
          <button
            onClick={onOpenFamilyManager}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-100 shadow-md backdrop-blur-sm transition-all hover:border-amber-400/35 hover:bg-white/12 hover:text-white sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-xs md:px-4 md:py-2"
          >
            <Users className="h-4 w-4 md:h-3.5 md:w-3.5" />
            Criar ou modificar perfis
          </button>
        </div>
      </motion.div>

      {/* Painel estilo lista de servidor MMO */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`w-full overflow-hidden ${glassPanel}`}
      >
        <div className="h-1 bg-gradient-to-r from-amber-900 via-amber-500/90 to-amber-900" aria-hidden />

        <div className="flex flex-col gap-2.5 border-b border-white/10 bg-black/25 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-4 md:px-4 md:py-3 lg:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-600/40 bg-amber-950/40 shadow-inner sm:h-11 sm:w-11 md:h-9 md:w-9 lg:h-10 lg:w-10">
              <Globe className="h-4 w-4 text-amber-300 sm:h-5 sm:w-5 md:h-4 md:w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/95 drop-shadow-sm sm:text-xs md:text-[11px] md:tracking-[0.18em] lg:text-xs">
                Canais de partida
              </h2>
              <p className="text-[9px] text-slate-400 sm:text-[10px] md:text-[10px]">Escolha uma sala na lista abaixo</p>
            </div>
            <span className="ml-auto rounded border border-amber-700/50 bg-black/40 px-2.5 py-1 font-mono text-xs tabular-nums text-amber-200 sm:ml-0">
              {rooms.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onCreateRoom}
            className="group flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-100 shadow-md backdrop-blur-sm transition-all hover:border-blue-400/60 hover:bg-blue-900/50 hover:text-white sm:w-auto sm:px-4 sm:py-2.5 sm:text-[11px] md:px-3 md:py-2"
          >
            <motion.span
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/35 bg-blue-600/30 sm:h-9 sm:w-9 md:h-8 md:w-8"
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
        <div className="hidden border-b border-white/5 bg-slate-950/40 px-4 py-2 text-[9px] font-black uppercase tracking-wider text-slate-500 md:grid md:grid-cols-12 md:gap-x-3 md:gap-y-0 md:px-4 lg:px-5">
          <div className="col-span-4">Sala</div>
          <div className="col-span-2 min-w-0 truncate lg:col-span-2">Líder (empresário)</div>
          <div className="col-span-2 text-center">Jogadores</div>
          <div className="col-span-2 text-center">Estado</div>
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
          <>
            {/* Mobile: uma sala visível + “peek” da seguinte; deslizar dedo (←) para trocar */}
            <div className="relative md:hidden">
              {rooms.length > 1 && (
                <>
                  <div
                    className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-14 bg-gradient-to-l from-slate-950 via-slate-950/75 to-transparent"
                    aria-hidden
                  />
                  <p className="pointer-events-none absolute bottom-1 left-0 right-0 z-[1] px-2 text-center text-[8px] font-black uppercase leading-tight tracking-widest text-slate-400">
                    Deslize o dedo à esquerda · mais salas
                  </p>
                </>
              )}
              <ul
                className="lobby-mobile-rooms-strip flex max-h-[min(42dvh,340px)] flex-nowrap gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain px-3 pb-8 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {rooms.map((room, i) => (
                  <MobileRoomSlide
                    key={room.id}
                    room={room}
                    i={i}
                    isOnlyRoom={rooms.length === 1}
                    onJoinRoom={onJoinRoom}
                    onDeleteRoom={onDeleteRoom}
                  />
                ))}
              </ul>
            </div>

            <ul className="custom-scrollbar hidden max-h-[calc(5*3.5rem)] divide-y divide-white/[0.06] overflow-y-auto overscroll-contain md:block lg:max-h-[calc(5*3.85rem)]">
            {rooms.map((room, i) => (
              <motion.li
                key={room.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.35) }}
                className="group/row bg-transparent transition-colors hover:bg-white/[0.04]"
              >
                {/* Desktop: linha tipo MMO */}
                <div className="hidden items-center gap-x-3 gap-y-1 px-4 py-2.5 md:grid md:grid-cols-12 lg:px-5 lg:py-3">
                  <div className="col-span-4 min-w-0">
                    <p className="truncate text-sm font-black text-white drop-shadow-md group-hover/row:text-blue-100 lg:text-base">
                      {room.nome || `Sala #${room.id.slice(0, 4)}`}
                    </p>
                    <p className="mt-0.5 truncate text-[9px] text-slate-500 lg:mt-1 lg:text-[10px]">
                      <span className="font-bold uppercase tracking-wide text-slate-500">Código da sala</span>
                      <span className="mx-1.5 text-slate-600">·</span>
                      <span className="font-mono text-slate-400">{room.codigo_sala}</span>
                    </p>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="truncate text-xs font-medium text-slate-200 lg:text-sm">{room.lider_nickname?.trim() || '—'}</p>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className="inline-block rounded border border-amber-800/50 bg-black/35 px-2 py-0.5 font-mono text-xs tabular-nums text-amber-200 lg:px-3 lg:py-1 lg:text-sm">
                      {room.players_count || 0}/6
                    </span>
                  </div>
                  <div className="col-span-2 flex min-w-0 justify-center px-1">
                    <span className="shrink-0 whitespace-nowrap rounded border border-emerald-500/35 bg-emerald-950/25 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-200 lg:px-2.5 lg:py-1 lg:text-[9px]">
                      Online
                    </span>
                  </div>
                  <div className="col-span-2 flex min-w-0 shrink-0 items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteRoom(room.id)}
                      className="shrink-0 rounded-lg border border-white/10 bg-slate-950/30 p-1.5 text-slate-400 transition-colors hover:border-red-500/40 hover:text-red-300 lg:p-2"
                      title="Remover sala"
                    >
                      <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onJoinRoom(room.id)}
                      className="flex min-w-0 shrink-0 items-center justify-center gap-1 rounded-lg border border-blue-400/40 bg-blue-600/75 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-md transition-all hover:border-blue-300/60 hover:bg-blue-600 lg:min-w-[108px] lg:gap-1.5 lg:px-3.5 lg:py-2 lg:text-xs"
                    >
                      <Zap className="h-3 w-3 shrink-0 lg:h-3.5 lg:w-3.5" />
                      Entrar
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
            </ul>
          </>
        )}

        <div className="border-t border-white/5 bg-black/20 px-4 py-1.5 text-center text-[9px] text-slate-500 md:text-left md:px-4 lg:px-5 lg:text-[10px]">
          Partidas em lobby · máximo 6 empresários por sala
        </div>
      </motion.div>
      </div>
    </div>
  );
};
