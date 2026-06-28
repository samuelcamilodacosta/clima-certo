import { getCompanyConfig, getFuncionario, loadFuncionarioField, saveFuncionario } from './company';

export { getCompanyConfig as getConfigData, loadFuncionarioField as loadConfig };

export function bindFuncionarioField(onChange?: () => void): void {
  const el = document.getElementById('funcionario') as HTMLInputElement | null;
  if (!el) return;

  el.addEventListener('input', () => {
    saveFuncionario(el.value);
    onChange?.();
  });
}

export function getFuncionarioNome(): string {
  return getFuncionario();
}
