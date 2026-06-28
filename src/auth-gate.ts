import { getLogoUrl } from './logo';

const AUTH_KEY = 'clima-certo-auth';
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? '';

function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

function showApp(onSuccess: () => void): void {
  document.getElementById('auth-gate')?.classList.add('hidden');
  document.getElementById('app-root')?.classList.remove('hidden');
  onSuccess();
}

export function mountAuthGate(onSuccess: () => void): void {
  const gate = document.getElementById('auth-gate');
  const app = document.getElementById('app-root');
  const form = document.getElementById('auth-form') as HTMLFormElement | null;
  const input = document.getElementById('auth-password') as HTMLInputElement | null;
  const error = document.getElementById('auth-error');
  const logo = document.getElementById('auth-logo') as HTMLImageElement | null;

  if (!gate || !app || !form || !input) return;

  if (logo) logo.src = getLogoUrl();

  if (isAuthenticated()) {
    showApp(onSuccess);
    return;
  }

  if (!APP_PASSWORD) {
    error?.classList.remove('hidden');
    if (error) error.textContent = 'Acesso não configurado. Defina VITE_APP_PASSWORD no ambiente.';
    input.disabled = true;
    (document.getElementById('auth-submit') as HTMLButtonElement | null)?.setAttribute('disabled', 'true');
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (input.value === APP_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      error?.classList.add('hidden');
      showApp(onSuccess);
      return;
    }

    error?.classList.remove('hidden');
    if (error) error.textContent = 'Senha incorreta.';
    input.value = '';
    input.focus();
  });
}
