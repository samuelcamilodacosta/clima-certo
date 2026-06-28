import { mountAuthGate } from './auth-gate';
import { bindFuncionarioField, loadConfig } from './config';
import { getLogoUrl, getLogoDataUri } from './logo';
import { initOrcamento } from './orcamento';
import './styles/style.css';

async function initApp(): Promise<void> {
  const headerLogo = document.getElementById('header-logo') as HTMLImageElement | null;
  if (headerLogo) headerLogo.src = getLogoUrl();

  await getLogoDataUri();

  loadConfig();
  bindFuncionarioField();

  initOrcamento();
}

mountAuthGate(() => { void initApp(); });