import { getSupabaseConfigError, isSupabaseConfigured } from './client';
import { getAppPassword } from './session';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export async function verifyAppPassword(password: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseConfigError() ?? 'Supabase não configurado.');
  }

  const res = await fetch(`${url}/functions/v1/verify-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
      'X-App-Password': password,
    },
    body: JSON.stringify({ password }),
  });

  if (res.status === 401) return false;
  if (!res.ok) {
    const payload = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error ?? 'Não foi possível validar a senha.');
  }

  const data = await res.json() as { ok?: boolean };
  return data.ok === true;
}

export async function callEdgeFunction<T>(
  name: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error(getSupabaseConfigError() ?? 'Supabase não configurado.');
  }

  const appPassword = getAppPassword();
  if (!appPassword) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const res = await fetch(`${url}/functions/v1/${name}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
      'X-App-Password': appPassword,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    throw new Error('Senha inválida ou sessão expirada.');
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}
