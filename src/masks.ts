export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskCpfCnpj(value: string): string {
  const d = digitsOnly(value).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function maskPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (!d.length) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return d.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function caretAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) seen++;
    if (seen >= digitCount) return i + 1;
  }
  return formatted.length;
}

export function bindInputMask(el: HTMLInputElement, maskFn: (value: string) => string): void {
  el.addEventListener('input', () => {
    const pos = el.selectionStart ?? el.value.length;
    const digitsBefore = digitsOnly(el.value.slice(0, pos)).length;
    el.value = maskFn(el.value);
    const newPos = caretAfterDigits(el.value, digitsBefore);
    el.setSelectionRange(newPos, newPos);
  });
}
