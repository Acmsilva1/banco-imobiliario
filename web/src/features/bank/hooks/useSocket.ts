import { useEffect, useState } from 'react';
import { supabase } from '../../core/supabase';
import type { GameState, TransferPayload } from '../bank.types';

export const useSocket = (partidaId: string) => {
  const [gameState, setGameState] = useState<GameState>({ players: [], logs: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchState = async () => {
    if (!partidaId) return;
    
    const { data: players } = await supabase.from('jogadores').select('*').eq('partida_id', partidaId).order('nickname');
    const { data: logs } = await supabase.from('transacoes').select('*').eq('partida_id', partidaId).order('criada_em', { ascending: false }).limit(50);
    
    setGameState({
      players: players || [],
      logs: logs || []
    });
  };

  useEffect(() => {
    if (!partidaId) {
      setIsConnected(false);
      return;
    }

    fetchState();
    setIsConnected(true);

    const subscription = supabase
      .channel(`game_${partidaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jogadores', filter: `partida_id=eq.${partidaId}` }, fetchState)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes', filter: `partida_id=eq.${partidaId}` }, fetchState)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setIsConnected(true);
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setIsConnected(false);
      });

    return () => {
      supabase.removeChannel(subscription);
      setIsConnected(false);
    };
  }, [partidaId]);

  const transfer = async (payload: TransferPayload) => {
    try {
      const { data: fromPlayer } = await supabase.from('jogadores').select('saldo, nickname').eq('id', payload.fromId).single();
      const { data: toPlayer } = await supabase.from('jogadores').select('saldo, nickname').eq('id', payload.toId).single();

      if (!fromPlayer || !toPlayer) throw new Error('Jogadores não encontrados');
      if (fromPlayer.saldo < payload.amount) throw new Error('Saldo insuficiente');

      await supabase.from('jogadores').update({ saldo: fromPlayer.saldo - payload.amount }).eq('id', payload.fromId);
      await supabase.from('jogadores').update({ saldo: toPlayer.saldo + payload.amount }).eq('id', payload.toId);

      const mensagem = `${fromPlayer.nickname} ➔ ${toPlayer.nickname}: R$ ${payload.amount.toLocaleString()}`;
      await supabase.from('transacoes').insert({ partida_id: payload.partidaId, mensagem });
      
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const adjustBalance = async (playerId: string, amount: number, label: string) => {
    try {
      const { data: player } = await supabase.from('jogadores').select('saldo, nickname').eq('id', playerId).single();
      if (!player) throw new Error('Jogador não encontrado');

      await supabase.from('jogadores').update({ saldo: player.saldo + amount }).eq('id', playerId);

      const mensagem = `${label}: ${player.nickname} (${amount > 0 ? '+' : ''}${amount.toLocaleString()})`;
      await supabase.from('transacoes').insert({ partida_id: partidaId, mensagem });
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  return { gameState, isConnected, error, transfer, adjustBalance };
};
