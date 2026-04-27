import { supabase } from '../../core/supabase.js';
import type { Player, TransferPayload } from './bank.types.js';
import { computeAdjustedBalance, computeTransferBalances, reconcilePlayersCount } from './bank.rules.js';

export class BankService {
  async getGameState(partidaId: string) {
    const { data: players, error: pError } = await supabase
      .from('jogadores')
      .select('*')
      .eq('partida_id', partidaId);

    const { data: logs, error: lError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('partida_id', partidaId)
      .order('criada_em', { ascending: false })
      .limit(50);

    if (pError || lError) throw new Error('Erro ao buscar estado da partida');

    return { players, logs };
  }

  async transfer(payload: TransferPayload) {
    const { data: fromPlayer } = await supabase
      .from('jogadores')
      .select('saldo, nickname')
      .eq('id', payload.fromId)
      .single();

    const { data: toPlayer } = await supabase
      .from('jogadores')
      .select('saldo, nickname')
      .eq('id', payload.toId)
      .single();

    if (!fromPlayer || !toPlayer) throw new Error('Jogadores não encontrados');
    const balances = computeTransferBalances({
      fromBalance: fromPlayer.saldo,
      toBalance: toPlayer.saldo,
      amount: payload.amount
    });

    await supabase
      .from('jogadores')
      .update({ saldo: balances.fromBalance })
      .eq('id', payload.fromId);

    await supabase
      .from('jogadores')
      .update({ saldo: balances.toBalance })
      .eq('id', payload.toId);

    const mensagem = `${fromPlayer.nickname} ➔ ${toPlayer.nickname}: R$ ${payload.amount.toLocaleString()}`;
    await supabase
      .from('transacoes')
      .insert({ partida_id: payload.partidaId, mensagem });

    return this.getGameState(payload.partidaId);
  }

  async adjustBalance(playerId: string, amount: number, label: string, partidaId: string) {
    const { data: player } = await supabase
      .from('jogadores')
      .select('saldo, nickname')
      .eq('id', playerId)
      .single();

    if (!player) throw new Error('Jogador não encontrado');

    const nextBalance = computeAdjustedBalance(player.saldo, amount);
    await supabase.from('jogadores').update({ saldo: nextBalance }).eq('id', playerId);

    const mensagem = `${label}: ${player.nickname} (${amount > 0 ? '+' : ''}${amount})`;
    await supabase
      .from('transacoes')
      .insert({ partida_id: partidaId, mensagem });

    return this.getGameState(partidaId);
  }

  async incrementPlayerCount(partidaId: string) {
    const { data: partida } = await supabase.from('partidas').select('players_count').eq('id', partidaId).single();
    const { count } = await supabase.from('jogadores').select('*', { count: 'exact', head: true }).eq('partida_id', partidaId);

    if (partida) {
      const nextCount = reconcilePlayersCount((partida.players_count || 0) + 1, count || 0);
      await supabase.from('partidas').update({ players_count: nextCount }).eq('id', partidaId);
    }
  }

  async decrementPlayerCount(partidaId: string) {
    const { data: partida } = await supabase.from('partidas').select('players_count').eq('id', partidaId).single();
    const { count } = await supabase.from('jogadores').select('*', { count: 'exact', head: true }).eq('partida_id', partidaId);

    if (partida && partida.players_count && partida.players_count > 0) {
      const nextCount = reconcilePlayersCount(partida.players_count - 1, count || 0);
      await supabase.from('partidas').update({ players_count: nextCount }).eq('id', partidaId);
    }
  }
}
