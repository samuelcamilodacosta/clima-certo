const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function getSupabaseConfigError(): string | null {
  if (!url && !anonKey) {
    return 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.';
  }
  if (!url) return 'Defina VITE_SUPABASE_URL no ambiente.';
  if (!anonKey) return 'Defina VITE_SUPABASE_ANON_KEY no ambiente (Settings → API no Supabase).';
  return null;
}
