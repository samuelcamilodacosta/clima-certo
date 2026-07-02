const cache = new Map<string, string[]>();

export function clearHistorico(): void {
  cache.clear();
}

export function setHistorico(campo: string, valores: string[]): void {
  cache.set(campo, valores);
}

export function getSugestoes(campo: string, query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase();
  const valores = cache.get(campo) ?? [];

  const filtered = q
    ? valores.filter(v => v.toLowerCase().includes(q))
    : valores;

  return filtered.slice(0, limit);
}
