const AUTH_KEY = 'clima-certo-auth';
const PW_KEY = 'clima-certo-app-password';

export function setSession(password: string): void {
  sessionStorage.setItem(AUTH_KEY, '1');
  sessionStorage.setItem(PW_KEY, password);
}

export function clearSession(): void {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(PW_KEY);
}

export function isSessionActive(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1' && Boolean(getAppPassword());
}

export function getAppPassword(): string {
  return sessionStorage.getItem(PW_KEY) ?? '';
}
