# Clima Certo — Gerador de Orçamentos

Gerador de orçamentos para a Clima Certo, com exportação em PDF/PNG e autocomplete baseado em histórico salvo no Supabase.

## Stack

- TypeScript + Vite
- jsPDF + jspdf-autotable
- Supabase (Edge Functions + PostgreSQL)

## Desenvolvimento local

Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-ou-publishable
```

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Build de produção

```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages (GitHub Actions)

Site: **https://samuelcamilodacosta.github.io/clima-certo/**

### Configuração (uma vez)

1. **Settings → Pages → Build and deployment** → **Source:** GitHub Actions
2. **Settings → Environments → clima-certo** → secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

A senha de acesso da equipe fica no Supabase (**Edge Functions → Secrets → `APP_PASSWORD`**), não no GitHub.

### Deploy automático

A cada push na `main`, o workflow `.github/workflows/deploy.yml` faz build e publica o `dist/`.

## Estrutura

```
src/
  main.ts              # entrada da aplicação
  auth-gate.ts         # tela de senha
  orcamento.ts         # formulário de orçamento
  campo-historico.ts   # autocomplete e registro na exportação
  pdf-export.ts        # geração de PDF/PNG
  supabase/            # cliente e chamadas às Edge Functions
supabase/
  schema.sql           # SQL da tabela historico_exportacoes
  functions/           # Edge Functions (verify-password, get-historico, save-historico)
```

## Funcionalidades

- Senha de acesso validada no servidor (Edge Function)
- Autocomplete de campos com base em exportações anteriores
- Orçamento com itens dinâmicos, desconto e assinaturas
- Exportação PDF e PNG em uma única página A4
- Nome do funcionário salvo localmente no navegador

## Projeto

Ferramenta interna para auxiliar a criação de orçamentos da Clima Certo.
