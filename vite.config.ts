import { defineConfig } from 'vite';

const repoBase = '/clima-certo/';

export default defineConfig({
  base:
    process.env.VITE_BASE_PATH ??
    (process.env.GITHUB_ACTIONS === 'true' ? repoBase : '/'),
});
