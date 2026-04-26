export interface Player {
  id: string;
  partida_id: string;
  nickname: string;
  saldo: number;
  token_acesso: string;
  is_admin: boolean;
}

export interface Room {
  id: string;
  codigo_sala: string;
  capital_inicial: number;
  status: 'LOBBY' | 'EM_CURSO' | 'FINALIZADA';
}

export interface Transaction {
  id: string;
  partida_id: string;
  mensagem: string;
  criada_em: string;
}

export interface TransferPayload {
  fromId: string;
  toId: string;
  amount: number;
  partidaId: string;
}
