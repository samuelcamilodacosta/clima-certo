import { getSugestoes } from './autocomplete-store';

function ensureWrap(el: HTMLElement): HTMLElement {
  const parent = el.parentElement;
  if (parent?.classList.contains('autocomplete-wrap')) return parent;

  const wrap = document.createElement('div');
  wrap.className = 'autocomplete-wrap';
  el.parentNode?.insertBefore(wrap, el);
  wrap.appendChild(el);
  return wrap;
}

function createList(wrap: HTMLElement): HTMLUListElement {
  let list = wrap.querySelector('.autocomplete-list') as HTMLUListElement | null;
  if (!list) {
    list = document.createElement('ul');
    list.className = 'autocomplete-list hidden';
    list.setAttribute('role', 'listbox');
    wrap.appendChild(list);
  }
  return list;
}

function resetListPosition(list: HTMLUListElement, wrap: HTMLElement): void {
  if (list.parentElement !== wrap) {
    wrap.appendChild(list);
  }
  list.classList.remove('autocomplete-list-fixed');
  list.style.position = '';
  list.style.left = '';
  list.style.top = '';
  list.style.bottom = '';
  list.style.width = '';
  list.style.maxHeight = '';
  list.style.zIndex = '';
}

function positionList(
  el: HTMLInputElement | HTMLTextAreaElement,
  list: HTMLUListElement,
  wrap: HTMLElement
): void {
  resetListPosition(list, wrap);

  if (!el.closest('.orc-item-row')) return;

  document.body.appendChild(list);
  list.classList.add('autocomplete-list-fixed');

  const rect = el.getBoundingClientRect();
  const maxHeight = Math.min(220, Math.max(120, window.innerHeight - rect.bottom - 12));

  list.style.left = `${rect.left}px`;
  list.style.width = `${rect.width}px`;
  list.style.top = `${rect.bottom + 4}px`;
  list.style.maxHeight = `${maxHeight}px`;
}

export function attachAutocomplete(
  el: HTMLInputElement | HTMLTextAreaElement,
  campo: string
): void {
  const wrap = ensureWrap(el);
  const list = createList(wrap);
  let activeIndex = -1;

  const hide = (): void => {
    list.classList.add('hidden');
    list.innerHTML = '';
    activeIndex = -1;
    resetListPosition(list, wrap);
  };

  const render = (): void => {
    const options = getSugestoes(campo, el.value);
    if (!options.length) {
      hide();
      return;
    }

    list.innerHTML = options.map((opt, i) =>
      `<li class="autocomplete-option${i === activeIndex ? ' is-active' : ''}" role="option" data-value="${escapeAttr(opt)}">${escapeHtml(opt)}</li>`
    ).join('');
    list.classList.remove('hidden');
    positionList(el, list, wrap);
  };

  const pick = (value: string): void => {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    hide();
  };

  el.addEventListener('focus', render);
  el.addEventListener('input', render);

  el.addEventListener('keydown', e => {
    const keyEvent = e as KeyboardEvent;
    const items = [...list.querySelectorAll<HTMLLIElement>('.autocomplete-option')];
    if (!items.length) return;

    if (keyEvent.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      render();
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (keyEvent.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (keyEvent.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pick(items[activeIndex].dataset.value ?? '');
    } else if (keyEvent.key === 'Escape') {
      hide();
    }
  });

  list.addEventListener('mousedown', e => {
    e.preventDefault();
    const option = (e.target as HTMLElement).closest('.autocomplete-option') as HTMLLIElement | null;
    if (option?.dataset.value) pick(option.dataset.value);
  });

  el.addEventListener('blur', () => {
    window.setTimeout(hide, 150);
  });

  window.addEventListener('scroll', () => {
    if (!list.classList.contains('hidden')) render();
  }, true);

  window.addEventListener('resize', () => {
    if (!list.classList.contains('hidden')) render();
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
