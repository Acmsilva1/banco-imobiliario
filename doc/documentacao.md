## 0. Identificação do artefato [T]

| Campo | Valor |
|-------|-------|
| **DOC-ID** | CC-WEB-BANK-TEC-R01 |
| **Módulo** | Banco Imobiliário Digital |
| **Repositório** | Acmsilva1/banco-imobiliario |
| **Plano** | [PLANO_IMPLEMENTACAO.md](file:///C:/Users/andre.silva/.gemini/antigravity/brain/c06426d0-221c-4223-a6c1-03586b1d556d/implementation_plan.md) |
| **Status** | Protótipo Funcional |

## 1. Resumo funcional e utilizadores impactados [T]

O módulo serve como o coração financeiro de uma partida de Banco Imobiliário. Ele descentraliza a responsabilidade do "banqueiro", permitindo que cada jogador gerencie seu saldo, realize transferências diretas para outros jogadores (aluguéis, taxas) e visualize o estado financeiro global da partida em tempo real. O André Silva (Mestre) utiliza este sistema para auditar transações e evitar fraudes durante o jogo.

## 2. Superfícies, rotas e estrutura de navegação [F]

| ID interno | Rota SPA | Componente raiz | Nota |
|------------|----------|-----------------|------|
| DASHBOARD_MAIN | `/` | `front/src/App.tsx` | Painel principal de controle e visão de saldos. |

## 3. Interface (frontend) [F]

O frontend utiliza **React 18** com **Vite**. A interface é baseada em **Bento UI** com modo escuro nativo (Slate 950).
- **Estado Global**: Gerenciado via hook customizado em `front/src/features/bank/hooks/useSocket.ts`.
- **Componentes**: Utiliza `lucide-react` para ícones e `framer-motion` para transições suaves de modal e atualizações de saldo.
- **Real-time**: Conexão persistente via `socket.io-client` que sincroniza o `GameState` com o servidor sempre que ocorre uma transação.

## 4. Backend, API e processamento [B]

O backend é construído em **Fastify** com **TypeScript**.
- **WebSocket**: Implementado com `fastify-socket.io`.
- **Eventos**:
  - `join_room`: Inscreve o cliente em uma sala específica (partida).
  - `exec_transfer`: Processa a lógica de transferência entre IDs de jogadores.
  - `sync_state`: Broadcast do estado atualizado para todos na sala.
- **Inventário de API**:
| ID da superfície | Método e caminho | Observação |
|------------------|------------------|------------|
| DASHBOARD_MAIN | WebSocket | Canal bidirecional para eventos financeiros. |

## 5. Persistência, dados e consultas [B]

Utiliza **Supabase (PostgreSQL)** para persistência de longo prazo.
- **Tabelas**:
  - `jogadores`: `id`, `partida_id`, `nickname`, `saldo`.
  - `transacoes`: `id`, `partida_id`, `mensagem`, `criada_em`.
- **Mapeamento de Dados**:
| Área da UI | Entrada | Ficheiro | Objeto BD |
|------------|---------|----------|-----------|
| Saldo | Update Balance | `bank.service.ts` | Tabela `jogadores` |
| Histórico | Insert Log | `bank.service.ts` | Tabela `transacoes` |

## 6. Segurança e conformidade (LGPD) [T]

- **Privacidade**: O sistema utiliza apenas `nicknames` para identificação de jogadores, evitando PII (Personally Identifiable Information).
- **Integridade**: A lógica de transferência é centralizada no `BankService` no backend, validando saldo insuficiente antes de qualquer operação.
- **Acesso**: O `token_acesso` será utilizado futuramente para garantir que um jogador só possa enviar dinheiro do seu próprio ID.

## 7. Infraestrutura, ambiente e operações [B]

- **Deploy**: Vercel (Frontend e API).
- **Container**: Dockerfile disponível em `back/` para ambientes escaláveis.
- **Variáveis de Ambiente**:
  - `SUPABASE_URL`, `SUPABASE_KEY` (Backend).
  - `VITE_API_URL` (Frontend).

## 8. Mobile & PWA [F]

O sistema está configurado como uma **PWA (Progressive Web App)**:
- **Instalação**: Pode ser instalado na tela inicial do Android/iOS.
- **Offline**: Cache básico via `sw.js` para carregamento instantâneo.
- **Manifest**: Ícone oficial e cores de tema configurados em `manifest.json`.
- **Auto-Update**: O Service Worker detecta novas versões e recarrega a página automaticamente para garantir que todos usem a mesma lógica de banco.

## 9. Observações técnicas e registo de revisão [T]

- **Dívida Técnica**: Implementar `Postgres Functions (RPC)` para garantir atomicidade nas transferências (evitar Race Conditions).
- **Melhoria**: Adicionar suporte a QR Code para transferências rápidas.
- **Revisão**: Documento revisado em 25/04/2026 — `CC-WEB-BANK-TEC-R01`.
