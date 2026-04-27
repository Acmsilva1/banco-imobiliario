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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bento-card border-blue-500/30 bg-slate-900/50 backdrop-blur-xl p-10 relative"
      >
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-10 mt-4">
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
            Quem esta <span className="text-blue-500">Jogando?</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Selecione um perfil já cadastrado</p>
        </div>

        <div className="space-y-8">
          {baseProfiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {baseProfiles.map((profile) => (
                <motion.button
                  key={profile.id}
                  whileHover={{ scale: 1.05, borderColor: '#2563eb' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onComplete(profile.nickname, profile.avatar)}
                  className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:bg-blue-600/10 flex flex-col items-center gap-3 transition-all"
                >
                  <span className="text-4xl avatar-emoji">{getAvatarEmoji(profile.avatar)}</span>
                  <span className="font-black text-slate-100 uppercase text-xs tracking-widest">{profile.nickname}</span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-700 rounded-2xl bg-slate-950/40">
              <p className="text-slate-400 font-bold text-sm mb-2">Nenhum perfil cadastrado.</p>
              <p className="text-slate-600 text-xs uppercase tracking-widest">
                Volte ao lobby e use "Criar ou modificar perfis".
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
