import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { BaseProfile } from '../lobby.types';

const AVATARS = [
  { id: '1', emoji: '🦊', label: 'Raposa Tatica' },
  { id: '2', emoji: '🦁', label: 'Leao Magnata' },
  { id: '3', emoji: '🤖', label: 'Bot Investidor' },
  { id: '4', emoji: '🐼', label: 'Panda Capital' },
  { id: '5', emoji: '🐙', label: 'Polvo Trader' },
  { id: '6', emoji: '🚀', label: 'Foguete Alpha' },
];

interface PlayerSetupProps {
  baseProfiles: BaseProfile[];
  onComplete: (nickname: string, avatarId: string) => void;
  onBack: () => void;
}

const getAvatarEmoji = (avatarId: string) => {
  const avatar = AVATARS.find((item) => item.id === avatarId);
  return avatar?.emoji || '👤';
};

export const PlayerSetup = ({ baseProfiles, onComplete, onBack }: PlayerSetupProps) => {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);

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
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Selecione seu perfil ou crie um novo</p>
        </div>

        <div className="space-y-8">
          {baseProfiles.length > 0 && (
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
          )}

          <div className="relative flex items-center justify-center py-2">
            <div className="w-full border-t border-slate-800"></div>
            <span className="absolute bg-[#020617] px-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">OU CRIE UM NOVO</span>
          </div>
          <div>
            <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Nickname do Heroi</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: ElonMusk da Shopee"
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border-2 border-slate-800 rounded-2xl text-white font-bold placeholder:text-slate-700 focus:border-blue-600 focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Selecione seu Avatar</label>
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedAvatar === avatar.id 
                      ? 'border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'border-slate-800 bg-slate-950 hover:border-slate-600'
                  }`}
                >
                  <span className="text-4xl avatar-emoji">{avatar.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{avatar.label}</span>
                  {selectedAvatar === avatar.id && (
                    <motion.div 
                      layoutId="check"
                      className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1 border-4 border-[#020617]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <button 
            disabled={!nickname}
            onClick={() => onComplete(nickname, selectedAvatar)}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 disabled:shadow-none"
          >
            INICIAR JORNADA
          </button>
        </div>
      </motion.div>
    </div>
  );
};
