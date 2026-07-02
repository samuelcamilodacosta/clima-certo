import { mountAuthGate } from './auth-gate';
import { bindFuncionarioField, loadConfig } from './config';
import { initCampoHistorico } from './campo-historico';
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
  await initCampoHistorico();
}

mountAuthGate(() => { void initApp(); });