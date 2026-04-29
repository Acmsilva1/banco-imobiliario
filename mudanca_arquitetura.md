# Mudança de arquitetura — pastas por *features* + camadas na API

Este documento define o **alvo de organização** alinhado ao padrão usado em projetos como *command-center-web*: **feature slices** no frontend e na API, com **rotas → controllers → services → repositories** dentro de cada feature, e código partilhado em `shared` / `core`.

## Referência de pastas (alvo)

```
<raiz-do-repo>/
  web/
    features/<nome-da-feature>/
      components/
      hooks/          # opcional
      lib/            # opcional — lógica só desta feature
      index.ts        # barrel / rotas internas, se fizer sentido
    shared/
      components/
      lib/
  api/
    features/<nome-da-feature>/
      <nome>Routes.js|ts
      controllers/
      services/
      repositories/
      index.js|ts     # registo de rotas da feature
    core/             # migrations, db, middleware global — sem regra de negócio de feature
    config/
```

**Regras:**

- Uma pasta em `features/<x>/` corresponde a um **recorte de produto** (ex.: `lobby`, `bank`, `match`).
- **Proibido** (idealmente): `features/a` importar `features/b` por caminhos internos profundos; preferir `shared` ou contratos explícitos.
- API: HTTP/validação no **controller**, orquestração e regras no **service**, SQL/acesso a dados no **repository**.

## Situação atual neste repositório

Já existem `web/src/features/...` e `api/src/features/bank/...`. O cliente Supabase partilhado foi alinhado ao nome **`web/src/shared/`** (antes `core/`). O trabalho restante é **consolidar** qualquer código solto e, na API, introduzir camadas `controllers/repositories` na feature `bank` se fizer sentido.

## Etapas do processo (checklist)

1. **Inventário** — Listar módulos de negócio e mapear ficheiros atuais → feature alvo (`shared` vs `features/<x>`).
2. **Contratos entre features** — Definir o que é público (exports de `index`) e o que fica interno à pasta da feature.
3. **API primeiro ou em paralelo** — Criar/ajustar `api/features/<x>/` com `routes` → `controllers` → `services` → `repositories`; montar rotas no servidor a partir de cada `features/<x>/index`.
4. **Web** — Mover componentes e hooks para `web/src/features/<x>/`; extrair UI genérica para `web/src/shared`.
5. **Imports e aliases** — Atualizar paths (`@/features/...`, `@/shared/...`) e corrigir ciclos.
6. **Testes e CI** — Correr testes e build; ajustar paths em configs (Vitest, TS, ESLint).
7. **Documentação** — Atualizar README ou doc interna com o mapa de features.

**Ordem sugerida:** uma feature de cada vez (vertical slice), do fluxo mais estável ao mais volátil, para reduzir conflitos em git.

## Critério de conclusão

- Toda a UI de negócio vive sob `web/.../features/<nome>` ou `shared`.
- Toda a API de negócio vive sob `api/features/<nome>` com camadas explícitas.
- Não há dependências cruzadas não documentadas entre features.

## Ambiente local (dev)

| Alvo | Comando típico | Porta |
|--------|----------------|--------|
| Web (Vite) | `cd web && npm run dev` | **5181** (`strictPort`) |
| API (Fastify + Socket) | `cd api && npm run dev` | **3000** (variável `PORT`) |
