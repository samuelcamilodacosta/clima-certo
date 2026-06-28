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

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `ClimaCerto`)
2. Envie o código:

```bash
git init
git add .
git commit -m "feat: gerador de documentos Clima Certo"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ClimaCerto.git
git push -u origin main
```

3. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**
4. O workflow `.github/workflows/deploy.yml` publica automaticamente a cada push na branch `main`

> Se o repositório tiver outro nome, altere o `base` em `vite.config.ts` para `'/NomeDoRepo/'`.

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
