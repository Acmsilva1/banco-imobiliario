-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Partidas (Rooms)
CREATE TABLE IF NOT EXISTS partidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL DEFAULT 'Nova Sala',
    codigo_sala TEXT UNIQUE NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    capital_inicial INTEGER DEFAULT 25000,
    status TEXT DEFAULT 'LOBBY',
    players_count INTEGER DEFAULT 0
);

-- 2. Tabela de Jogadores
CREATE TABLE IF NOT EXISTS jogadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partida_id UUID REFERENCES partidas(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    avatar TEXT DEFAULT '1',
    saldo INTEGER NOT NULL,
    token_acesso UUID DEFAULT uuid_generate_v4(),
    is_admin BOOLEAN DEFAULT false
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'jogadores_partida_id_nickname_key'
  ) THEN
    ALTER TABLE jogadores
      ADD CONSTRAINT jogadores_partida_id_nickname_key UNIQUE (partida_id, nickname);
  END IF;
END $$;

-- 3. Histórico (Audit Log)
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partida_id UUID REFERENCES partidas(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    criada_em TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar Realtime (Replicação) para o Frontend funcionar via WebSocket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'partidas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE partidas;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'jogadores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE jogadores;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'transacoes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE transacoes;
  END IF;
END $$;

-- Inserir dados de teste para o protótipo
INSERT INTO partidas (id, codigo_sala, capital_inicial, status, nome)
VALUES ('c06426d0-221c-4223-a6c1-03586b1d556d', 'SALA-PROTOTIPO', 25000, 'EM_CURSO', 'Sala Protótipo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jogadores (partida_id, nickname, saldo) 
VALUES ('c06426d0-221c-4223-a6c1-03586b1d556d', 'André Silva', 25000),
       ('c06426d0-221c-4223-a6c1-03586b1d556d', 'Jogador 2', 25000)
ON CONFLICT (partida_id, nickname) DO NOTHING;
