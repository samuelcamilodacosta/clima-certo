# Clima Certo — Gerador de Documentos

Gerador de **Orçamentos** e **Termos de Dispensa de Licitação** para a Clima Certo, com exportação em PDF.

## Stack

- TypeScript
- Vite
- jsPDF + jspdf-autotable

## Desenvolvimento local

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

A pasta `dist/` conterá os arquivos prontos para publicação.

## Publicar no GitHub Pages (GitHub Actions)

Site: **https://samuelcamilodacosta.github.io/clima-certo/**

### Configuração (uma vez)

1. **Settings → Pages → Build and deployment**
2. **Source:** **GitHub Actions** (não “Deploy from a branch”)
3. **Settings → Environments → clima-certo** → secret `VITE_APP_PASSWORD`

### Deploy automático

A cada push na `main`, o workflow `.github/workflows/deploy.yml`:

1. **build** — instala dependências, roda `npm run build` (environment `clima-certo`)
2. **deploy** — publica o `dist/` no GitHub Pages (environment `github-pages`)

Para publicar manualmente: **Actions → Deploy GitHub Pages → Run workflow**

## Estrutura

```
src/
  main.ts          # entrada da aplicação
  config.ts        # dados da empresa
  orcamento.ts     # formulário e prévia de orçamento
  termo.ts         # formulário e prévia do termo
  pdf-export.ts    # geração de PDF (1 página)
  assets/logo.png
  styles/style.css
```

## Funcionalidades

- Configurações da empresa salvas no navegador (localStorage)
- Orçamento com itens dinâmicos, desconto e assinaturas (prestador + cliente)
- Termo de dispensa de licitação
- PDF sempre em **uma única página A4**

## Projeto

- Este é apenas um projeto auxiliar de uso prático para auxiliar a criação de orçamentos para a Clima Certo