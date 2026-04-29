import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/supabase';
import { throwIfSupabaseError } from '../../../shared/supabase-safe';
import type { GameState, TransferPayload } from '../bank.types';

export const useSocket = (partidaId: string) => {
  const [gameState, setGameState] = useState<GameState>({ players: [], logs: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchState = async () => {
    if (!partidaId) return;

    try {
      const { data: players, error: playersError } = await supabase
        .from('jogadores')
        .select('*')
        .eq('partida_id', partidaId)
        .order('nickname');
      throwIfSupabaseError(playersError, 'Falha ao carregar jogadores');

      const { data: logs, error: logsError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('partida_id', partidaId)
        .order('criada_em', { ascending: false })
        .limit(50);
      throwIfSupabaseError(logsError, 'Falha ao carregar transações');

      setGameState({
        players: players || [],
        logs: logs || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na sincronização inicial');
    }
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jogadores', filter: `partida_id=eq.${partidaId}` }, (payload) => {
        const row = (payload.eventType === 'DELETE' ? payload.old : payload.new) as { id?: string; partida_id?: string; nickname?: string } | null;
        if (!row || row.partida_id !== partidaId || !row.id) return;

        setGameState((prev) => {
          if (payload.eventType === 'DELETE') {
            return {
              ...prev,
              players: prev.players.filter((player) => player.id !== row.id)
            };
          }

          const nextPlayer = payload.new as GameState['players'][number];
          const exists = prev.players.some((player) => player.id === nextPlayer.id);
          const players = exists
            ? prev.players.map((player) => (player.id === nextPlayer.id ? nextPlayer : player))
            : [...prev.players, nextPlayer];

          return {
            ...prev,
            players: players.sort((a, b) => a.nickname.localeCompare(b.nickname))
          };
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transacoes', filter: `partida_id=eq.${partidaId}` }, (payload) => {
        const row = (payload.eventType === 'DELETE' ? payload.old : payload.new) as { id?: string; partida_id?: string; criada_em?: string } | null;
        if (!row || row.partida_id !== partidaId || !row.id) return;

        setGameState((prev) => {
          if (payload.eventType === 'DELETE') {
            return {
              ...prev,
              logs: prev.logs.filter((log) => log.id !== row.id)
            };
          }

          const nextLog = payload.new as GameState['logs'][number];
          const withoutLog = prev.logs.filter((log) => log.id !== nextLog.id);
          const logs = [nextLog, ...withoutLog]
            .sort((a, b) => new Date(b.criada_em).getTime() - new Date(a.criada_em).getTime())
            .slice(0, 50);

          return {
            ...prev,
            logs
          };
        });
      })
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
    // Atualização Otimista (Instantânea na UI)
    const originalState = { ...gameState };
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === payload.fromId) return { ...p, saldo: p.saldo - payload.amount };
        if (p.id === payload.toId) return { ...p, saldo: p.saldo + payload.amount };
        return p;
      })
    }));

    try {
      const { error } = await supabase.rpc('transferir_saldo', {
        from_player_id: payload.fromId,
        to_player_id: payload.toId,
        amount_val: payload.amount,
        room_id: payload.partidaId
      });

      throwIfSupabaseError(error, 'Falha ao transferir saldo');
    } catch (err) {
      setGameState(originalState); // Rollback se der erro
      setError(err instanceof Error ? err.message : 'Falha ao transferir saldo');
      setTimeout(() => setError(null), 3000);
    }
  };

  const adjustBalance = async (playerId: string, amount: number, label: string) => {
    try {
      const { data: player, error: playerError } = await supabase
        .from('jogadores')
        .select('saldo, nickname')
        .eq('id', playerId)
        .single();
      throwIfSupabaseError(playerError, 'Falha ao carregar jogador');
      if (!player) throw new Error('Jogador não encontrado');

      const { error: updateError } = await supabase
        .from('jogadores')
        .update({ saldo: player.saldo + amount })
        .eq('id', playerId);
      throwIfSupabaseError(updateError, 'Falha ao atualizar saldo');

      const mensagem = `${label}: ${player.nickname} (${amount > 0 ? '+' : ''}${amount.toLocaleString()})`;
      const { error: logError } = await supabase
        .from('transacoes')
        .insert({ partida_id: partidaId, mensagem });
      throwIfSupabaseError(logError, 'Falha ao registrar transação');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao ajustar saldo');
      setTimeout(() => setError(null), 3000);
    }
  };

  return { gameState, isConnected, error, transfer, adjustBalance, fetchState };
};
