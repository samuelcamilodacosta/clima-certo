export function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado`);
  return el;
}

export function input(id: string): HTMLInputElement {
  return $(id) as HTMLInputElement;
}

export function select(id: string): HTMLSelectElement {
  return $(id) as HTMLSelectElement;
}

export function textarea(id: string): HTMLTextAreaElement {
  return $(id) as HTMLTextAreaElement;
}

export function esc(str: string): string {
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function queryInput(row: Element, selector: string): HTMLInputElement {
  const el = row.querySelector(selector);
  if (!(el instanceof HTMLInputElement)) throw new Error(`Input ${selector} não encontrado`);
  return el;
}
