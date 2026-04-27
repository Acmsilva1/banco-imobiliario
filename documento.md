# Registro de Mudancas Necessarias (Pausa)

Data: 2026-04-27  
Status: processo pausado a pedido do usuario

## Objetivo
Aplicar melhorias de robustez, manutencao e confiabilidade no app Banco Imobiliario, mantendo o modelo atual (Supabase direto no frontend em ambiente controlado) e sem depender de Socket.IO em producao Vercel.

## Mudancas Ja Iniciadas

1. Tipagem do dominio financeiro ampliada:
- Arquivo: `web/src/features/bank/bank.types.ts`
- Acao: adicao de `TransactionLog` e uso em `GameState.logs`.

2. Padronizacao de erro Supabase no frontend:
- Arquivo: `web/src/core/supabase-safe.ts`
- Acao: criados helpers `getSupabaseErrorMessage` e `throwIfSupabaseError`.

3. Tipos do lobby separados:
- Arquivo: `web/src/features/lobby/lobby.types.ts`
- Acao: criados tipos `Room` e `BaseProfile`.

4. Camada de dados do lobby extraida para hook:
- Arquivo: `web/src/features/lobby/hooks/useLobbyData.ts`
- Acao: centralizacao de `fetchRooms`, `fetchBaseProfiles`, CRUD de salas/perfis e erro padronizado.
- Observacao: contagem de jogadores por sala usando `count` em `jogadores` (sem confiar em `players_count` da tabela `partidas`).

5. Componentes de lobby com tipagem melhorada:
- Arquivo: `web/src/features/lobby/components/ServerSelection.tsx`
  - `rooms` tipado com `Room[]`
  - removida prop `myRooms` (nao utilizada)
- Arquivo: `web/src/features/lobby/components/PlayerSetup.tsx`
  - `baseProfiles` tipado com `BaseProfile[]`

## Mudancas Pendentes (Necessarias)

### A. Fluxo de telas
1. Tornar fluxo consistente em `App.tsx`:
- `LOBBY -> SETUP -> GAME` sempre ao entrar em sala.
- Remover caminho paralelo de setup dentro da tela `GAME` (bloco `!myId`).

### B. Desacoplamento do App principal
1. Conectar `App.tsx` ao novo hook `useLobbyData`.
2. Remover operacoes de Supabase espalhadas no `App`.
3. Deixar `App.tsx` como orquestrador de estado de tela e modais.

### C. Erros consistentes
1. Substituir blocos com `console.error`/silenciosos por tratamento padronizado.
2. Aplicar `throwIfSupabaseError` em:
- criar/remover sala
- criar/remover perfil
- setup de jogador
- demais updates/inserts sensiveis.

### D. Realtime incremental no estado da partida
1. Refatorar `web/src/features/bank/hooks/useSocket.ts`:
- parar de fazer `fetchState` completo para cada evento realtime;
- aplicar patch incremental em `players` e `logs` por `INSERT/UPDATE/DELETE`;
- manter `fetchState` para sincronizacao inicial/manual.

### E. Integridade de dados no SQL
1. Atualizar `data/schema.sql`:
- adicionar `UNIQUE(partida_id, nickname)` em `jogadores`;
- manter scripts seguros para reaplicacao.

### F. Operacao / DX
1. Adicionar script `doctor` no `package.json` raiz para diagnostico rapido de workspace/dependencias.
2. Confirmar build de `web` e `api` apos ajustes.

### G. Testes
1. Criar testes unitarios de regras criticas:
- transferencia valida
- transferencia com saldo insuficiente
- ajuste de saldo (credito/debito)
- regra de reconcilacao de contagem (se aplicavel em util puro)
2. Rodar testes e registrar resultado.

### H. Padrao de encoding
1. Adicionar `.editorconfig` e `.gitattributes` com UTF-8 e LF para reduzir risco de texto corrompido.

## Criticos de Aceite para Retomada

1. `npm run build` sem erro.
2. Fluxo de tela unico funcionando (`LOBBY -> SETUP -> GAME`).
3. Nenhum `any` nos pontos alterados de lobby.
4. Realtime da partida sem recarga completa a cada evento.
5. Testes unitarios passando para regras financeiras.

## Observacao de Retomada
Ao retomar, continuar pela refatoracao de `useSocket.ts` e integracao final no `App.tsx`, depois executar build/testes e emitir relatorio de eficacia.
