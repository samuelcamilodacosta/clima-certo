import logoUrl from './assets/logo.png';

let cachedDataUri: string | null = null;

export function getLogoUrl(): string {
  return logoUrl;
}

export async function getLogoDataUri(): Promise<string> {
  if (cachedDataUri) return cachedDataUri;
  const response = await fetch(logoUrl);
  const blob = await response.blob();
  cachedDataUri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return cachedDataUri;
}

export function getLogoDataUriSync(): string {
  if (!cachedDataUri) throw new Error('Logo ainda não carregada');
  return cachedDataUri;
}
