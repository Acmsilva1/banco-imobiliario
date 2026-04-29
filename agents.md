# Agentes (Cursor / automação) — Banco imobiliário (monorepo)

## Contexto do repositório

Monorepo **npm workspaces** com `web/` (Vite + React + TS) e `api/` (Fastify + Socket + TS). Regras de jogo e Supabase concentram-se na feature **bank**; lobby em **lobby**. Código partilhado do cliente em **`web/src/shared/`** (antes `core/`). API de domínio em **`api/src/features/bank/`** + **`api/src/core/`** (cliente Supabase servidor).

## Árvore de pastas (obrigatório respeitar)

| Área | Caminho |
|------|---------|
| UI por feature | `web/src/features/bank/`, `web/src/features/lobby/` |
| UI / SDK partilhado | `web/src/shared/` |
| API feature | `api/src/features/bank/*.ts` |
| Infra API | `api/src/core/` |

**Não fazer:** importar `web/src/features/bank` a partir de `lobby` com caminhos profundos; preferir `shared` ou contratos explícitos.

## Comandos úteis

- `cd web && npm run dev` — Vite na porta **5181** (`strictPort`).
- `cd api && npm run dev` — API (porta `PORT`, default **3000**).
- `cd web && npm run build` — build para `public/`.

## Convenções de código

- Manter TypeScript estrito onde já existe; seguir padrão de ficheiros existente em `features/bank`.
- Socket + REST: alterações simultâneas no `api` e no cliente quando mudar protocolo de eventos.

## Checkpoint

- [ ] Novas rotas ou eventos Socket refletidos no `api` **e** no cliente que os consome (`useSocket`, lobby, etc.).
- [ ] Nenhum import novo de `features/<x>` → `features/<y>` sem passar por `shared` ou API.
- [ ] `npm run build` em `web` concluído sem erros.
- [ ] Porta de dev **≠ 5173** (usar **5181** no web conforme configuração atual).
