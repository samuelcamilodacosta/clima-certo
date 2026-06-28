import { defineConfig } from 'vite';

// Altere o base para o nome do seu repositório no GitHub Pages
// Ex.: repositório "ClimaCerto" → base: '/ClimaCerto/'
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
});
