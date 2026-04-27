-- Executar no Supabase (SQL Editor) se ainda não tiver a coluna do criador da sala
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS lider_nickname TEXT;
