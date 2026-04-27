export interface Room {
  id: string;
  nome: string | null;
  codigo_sala: string;
  status: 'LOBBY' | 'EM_CURSO' | 'FINALIZADA';
  capital_inicial: number;
  players_count: number;
  /** Nome do perfil (empresário) que criou a sala */
  lider_nickname: string | null;
}

export interface BaseProfile {
  id: string;
  nickname: string;
  avatar: string;
}
