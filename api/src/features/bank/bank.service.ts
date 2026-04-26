import { supabase } from '../../core/supabase.js';
import type { Player, TransferPayload } from './bank.types.js';

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
    if (fromPlayer.saldo < payload.amount) throw new Error('Saldo insuficiente');

    await supabase
      .from('jogadores')
      .update({ saldo: fromPlayer.saldo - payload.amount })
      .eq('id', payload.fromId);

    await supabase
      .from('jogadores')
      .update({ saldo: toPlayer.saldo + payload.amount })
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

    await supabase
      .from('jogadores')
      .update({ saldo: player.saldo + amount })
      .eq('id', playerId);

    const mensagem = `${label}: ${player.nickname} (${amount > 0 ? '+' : ''}${amount})`;
    await supabase
      .from('transacoes')
      .insert({ partida_id: partidaId, mensagem });

    return this.getGameState(partidaId);
  }

  async incrementPlayerCount(partidaId: string) {
    const { data: partida } = await supabase.from('partidas').select('players_count').eq('id', partidaId).single();
    if (partida) {
      await supabase.from('partidas').update({ players_count: (partida.players_count || 0) + 1 }).eq('id', partidaId);
    }
  }

  async decrementPlayerCount(partidaId: string) {
    const { data: partida } = await supabase.from('partidas').select('players_count').eq('id', partidaId).single();
    if (partida && partida.players_count && partida.players_count > 0) {
      await supabase.from('partidas').update({ players_count: partida.players_count - 1 }).eq('id', partidaId);
    }
  }
}
