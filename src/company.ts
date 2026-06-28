export const EMPRESA = {
  razao: 'CLIMA CERTO AR CONDICIONADO',
  cnpj: '66.217.313/0001-04',
  pix: '66.217.313/0001-04',
} as const;

const FUNCIONARIO_KEY = 'climacerto_funcionario';

export function getFuncionario(): string {
  return localStorage.getItem(FUNCIONARIO_KEY) || '';
}

export function saveFuncionario(nome: string): void {
  localStorage.setItem(FUNCIONARIO_KEY, nome.trim());
}

export function loadFuncionarioField(): void {
  const el = document.getElementById('funcionario') as HTMLInputElement | null;
  if (el) el.value = getFuncionario();
}

export function getCompanyConfig() {
  return {
    ...EMPRESA,
    responsavel: getFuncionario(),
  };
}
