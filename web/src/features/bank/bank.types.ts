export interface Player {
  id: string;
  partida_id: string;
  nickname: string;
  avatar: string;
  saldo: number;
  token_acesso: string;
  is_admin: boolean;
}

export interface GameState {
  players: Player[];
  logs: TransactionLog[];
}

export interface TransferPayload {
  fromId: string;
  toId: string;
  amount: number;
  partidaId: string;
}

export interface TransactionLog {
  id: string;
  partida_id: string;
  mensagem: string;
  criada_em: string;
}
