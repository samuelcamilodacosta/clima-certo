import { getLogoUrl } from './logo';
import { isSupabaseConfigured, getSupabaseConfigError } from './supabase/client';
import { verifyAppPassword } from './supabase/edge-api';
import { isSessionActive, setSession } from './supabase/session';

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
  const submit = document.getElementById('auth-submit') as HTMLButtonElement | null;
  const logo = document.getElementById('auth-logo') as HTMLImageElement | null;

  if (!gate || !app || !form || !input) return;

  if (logo) logo.src = getLogoUrl();

  if (isSessionActive()) {
    showApp(onSuccess);
    return;
  }

  if (!isSupabaseConfigured()) {
    error?.classList.remove('hidden');
    if (error) {
      error.textContent = getSupabaseConfigError() ?? 'Supabase não configurado.';
    }
    input.disabled = true;
    submit?.setAttribute('disabled', 'true');
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    void (async () => {
      if (submit) submit.disabled = true;
      error?.classList.add('hidden');

      try {
        const valid = await verifyAppPassword(input.value);
        if (valid) {
          setSession(input.value);
          showApp(onSuccess);
          return;
        }

        error?.classList.remove('hidden');
        if (error) error.textContent = 'Senha incorreta.';
        input.value = '';
        input.focus();
      } catch (err) {
        error?.classList.remove('hidden');
        if (error) {
          error.textContent = err instanceof Error
            ? err.message
            : 'Não foi possível validar a senha.';
        }
      } finally {
        if (submit) submit.disabled = false;
      }
    })();
  });
}
