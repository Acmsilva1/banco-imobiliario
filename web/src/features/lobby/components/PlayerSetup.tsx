import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { BaseProfile } from '../lobby.types';

interface PlayerSetupProps {
  baseProfiles: BaseProfile[];
  onComplete: (nickname: string, avatarId: string) => void;
  onBack: () => void;
}

const getAvatarEmoji = (avatarId: string) => {
  const avatars: Record<string, string> = {
    '1': '🦊',
    '2': '🦁',
    '3': '🤖',
    '4': '🐼',
    '5': '🐙',
    '6': '🐯',
    '7': '🧙',
    '8': '👩‍🚀',
    '9': '🧑‍💼',
    '10': '🕵️'
  };
  return avatars[avatarId] || '👤';
};

export const PlayerSetup = ({ baseProfiles, onComplete, onBack }: PlayerSetupProps) => {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#020617] p-3 sm:p-6 md:min-h-screen">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bento-card relative w-full max-w-lg border-blue-500/30 bg-slate-900/50 p-5 backdrop-blur-xl sm:p-8 md:max-w-md md:p-7 lg:max-w-lg lg:p-10"
      >
        <button 
          onClick={onBack}
          className="absolute left-4 top-4 rounded-full bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mb-8 mt-10 text-center sm:mb-10 sm:mt-4">
          <h2 className="mb-1.5 text-2xl font-black uppercase tracking-tighter text-white sm:mb-2 sm:text-3xl">
            Quem esta <span className="text-blue-500">Jogando?</span>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:text-xs">Selecione um perfil já cadastrado</p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {baseProfiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {baseProfiles.map((profile) => (
                <motion.button
                  key={profile.id}
                  whileHover={{ scale: 1.03, borderColor: '#2563eb' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onComplete(profile.nickname, profile.avatar)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-3 transition-all hover:bg-blue-600/10 sm:gap-3 sm:rounded-3xl sm:p-5"
                >
                  <span className="text-3xl avatar-emoji sm:text-4xl">{getAvatarEmoji(profile.avatar)}</span>
                  <span className="max-w-full truncate text-center text-[10px] font-black uppercase tracking-wider text-slate-100 sm:text-xs sm:tracking-widest">{profile.nickname}</span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 py-6 text-center sm:py-8">
              <p className="mb-2 text-sm font-bold text-slate-400">Nenhum perfil cadastrado.</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 sm:text-xs">
                Volte ao lobby e use "Criar ou modificar perfis".
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
