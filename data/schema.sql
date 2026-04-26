-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Partidas (Rooms)
CREATE TABLE partidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL DEFAULT 'Nova Sala',
    codigo_sala TEXT UNIQUE NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    capital_inicial INTEGER DEFAULT 25000,
    status TEXT DEFAULT 'LOBBY'
);

-- 2. Tabela de Jogadores
CREATE TABLE jogadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partida_id UUID REFERENCES partidas(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    avatar TEXT DEFAULT '1',
    saldo INTEGER NOT NULL,
    token_acesso UUID DEFAULT uuid_generate_v4(),
    is_admin BOOLEAN DEFAULT false
);

-- 3. Histórico (Audit Log)
CREATE TABLE transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partida_id UUID REFERENCES partidas(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    criada_em TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir dados de teste para o protótipo
INSERT INTO partidas (id, codigo_sala, capital_inicial, status) 
VALUES ('c06426d0-221c-4223-a6c1-03586b1d556d', 'SALA-PROTOTIPO', 25000, 'EM_CURSO');

INSERT INTO jogadores (partida_id, nickname, saldo) 
VALUES ('c06426d0-221c-4223-a6c1-03586b1d556d', 'André Silva', 25000),
       ('c06426d0-221c-4223-a6c1-03586b1d556d', 'Jogador 2', 25000);
