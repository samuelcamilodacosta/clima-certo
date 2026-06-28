import { getConfigData } from './config';
import { $, esc, input, queryInput, select, textarea } from './dom';
import { bindInputMask, maskCpfCnpj, maskPhone } from './masks';
import { exportOrcamento, exportOrcamentoPng } from './pdf-export';
import type { OrcamentoData, OrcamentoItem } from './types';
import {
  addDaysFromISO, formatMoney, generateOrcNumero, todayISO
} from './utils';

const VALIDADE_DIAS = 7;

function syncValidadeFromData(): void {
  const data = input('orc-data').value;
  input('orc-validade').value = data ? addDaysFromISO(data, VALIDADE_DIAS) : '';
}

interface ItemDefaults {
  descricao?: string;
  unidade?: string;
  qtd?: number;
  valorUnit?: number;
}

const SERVICOS = [
  'Higienização de ar condicionado de 9.000 a 24.000 BTUs',
  'Higienização de ar condicionado split 30.000 a 48.000 BTUs',
  'Higienização de ar condicionado de 36.000 BTUs',
  'Manutenção corretiva ar condicionado split',
  'Conserto de ar condicionado',
  'Instalação de ar condicionado split',
  'Recarga de gás R410A',
] as const;

const OUTRO_VALUE = '__outro__';

const GARANTIAS = [
  { value: 'Sem garantia', label: 'Sem garantia' },
  { value: '30 dias de garantia para reparos e serviços executados', label: '30 dias' },
  { value: '60 dias de garantia para reparos e serviços executados', label: '60 dias' },
  { value: '90 dias de garantia para reparos e serviços executados', label: '90 dias' },
] as const;

function buildGarantiaOptions(selected = GARANTIAS[3].value): string {
  return GARANTIAS.map(g =>
    `<option value="${esc(g.value)}"${g.value === selected ? ' selected' : ''}>${esc(g.label)}</option>`
  ).join('');
}

const PAGAMENTOS = [
  'Dinheiro',
  'PIX',
  'Transferência bancária',
  'Cartão de crédito/débito',
  'Boleto',
] as const;

function buildPagamentoOptions(): string {
  return PAGAMENTOS.map(p =>
    `<label class="pagamento-card">
      <input type="checkbox" class="pagamento-check" value="${esc(p)}" checked>
      <span class="pagamento-card-body">
        <span class="pagamento-card-text">${esc(p)}</span>
        <span class="pagamento-card-mark" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
        </span>
      </span>
    </label>`
  ).join('');
}

function getPagamentosSelecionados(): string {
  return [...document.querySelectorAll<HTMLInputElement>('#orc-pagamento .pagamento-check:checked')]
    .map(el => el.value)
    .join(', ');
}

function buildDescOptions(selected = ''): string {
  const isKnown = SERVICOS.includes(selected as typeof SERVICOS[number]);
  const opts = SERVICOS.map(s =>
    `<option value="${esc(s)}"${s === selected ? ' selected' : ''}>${esc(s)}</option>`
  ).join('');
  const outroSelected = selected && !isKnown ? ' selected' : '';
  return `${opts}<option value="${OUTRO_VALUE}"${outroSelected}>Outro (personalizado)</option>`;
}

function getDescricao(row: Element): string {
  const select = row.querySelector('.item-desc-select') as HTMLSelectElement;
  const custom = row.querySelector('.item-desc-custom') as HTMLInputElement;
  if (select.value === OUTRO_VALUE) return custom.value.trim();
  return select.value.trim();
}

function toggleDescCustom(row: Element): void {
  const select = row.querySelector('.item-desc-select') as HTMLSelectElement;
  const custom = row.querySelector('.item-desc-custom') as HTMLInputElement;
  const isOutro = select.value === OUTRO_VALUE;
  custom.classList.toggle('hidden', !isOutro);
  if (!isOutro) custom.value = '';
}

const DEFAULT_ITEMS: ItemDefaults[] = [
  { descricao: SERVICOS[0], unidade: 'Serviço + Material', qtd: 1, valorUnit: 300 },
  { descricao: SERVICOS[1], unidade: 'Serviço + Material', qtd: 1, valorUnit: 480 },
  { descricao: SERVICOS[3], unidade: 'Serviço + Material', qtd: 1, valorUnit: 280 }
];

function getItems(): OrcamentoItem[] {
  return [...document.querySelectorAll('#orc-itens .orc-item-row')].map(row => {
    const qtd = parseFloat(queryInput(row, '.item-qtd').value) || 0;
    const valorUnit = parseFloat(queryInput(row, '.item-valor').value) || 0;
    return {
      descricao: getDescricao(row),
      unidade: queryInput(row, '.item-unid').value.trim(),
      qtd,
      valorUnit,
      total: qtd * valorUnit
    };
  }).filter(i => i.descricao);
}

function getTotals(items: OrcamentoItem[], desconto: string) {
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const descontoValor = parseFloat(desconto) || 0;
  return { subtotal, descontoValor, total: Math.max(subtotal - descontoValor, 0) };
}

export function getFormData(): OrcamentoData {
  const items = getItems();
  const desconto = input('orc-desconto').value;
  const totals = getTotals(items, desconto);

  return {
    numero: input('orc-numero').value.trim(),
    data: input('orc-data').value,
    validade: input('orc-validade').value,
    titulo: input('orc-titulo').value.trim(),
    cliente: input('orc-cliente').value.trim(),
    clienteDoc: input('orc-cliente-doc').value.trim(),
    clienteContato: input('orc-cliente-contato').value.trim(),
    clienteEndereco: input('orc-cliente-endereco').value.trim(),
    clienteAssinatura: input('orc-cliente-assinatura').value.trim(),
    clienteCargo: input('orc-cliente-cargo').value.trim(),
    prazo: input('orc-prazo').value.trim(),
    garantia: select('orc-garantia').value,
    condicoes: textarea('orc-condicoes').value.trim(),
    obs: textarea('orc-obs').value.trim(),
    pagamento: getPagamentosSelecionados(),
    desconto,
    items,
    ...totals
  };
}

function updateRowTotal(row: Element): void {  const qtd = parseFloat((row.querySelector('.item-qtd') as HTMLInputElement).value) || 0;
  const valor = parseFloat((row.querySelector('.item-valor') as HTMLInputElement).value) || 0;
  const totalEl = row.querySelector('.item-total');
  if (totalEl) totalEl.textContent = formatMoney(qtd * valor);
}

function renumberOrcItems(): void {
  document.querySelectorAll('#orc-itens .orc-item-row').forEach((row, i) => {
    const num = row.querySelector('.item-num');
    if (num) num.textContent = String(i + 1);
  });
}

function bindRowEvents(row: Element): void {
  const update = () => updateRowTotal(row);

  row.querySelector('.item-desc-select')?.addEventListener('change', () => {
    toggleDescCustom(row);
    update();
  });
  row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', update));
  row.querySelector('.btn-remove')?.addEventListener('click', () => {
    row.remove();
    renumberOrcItems();
  });
}

function addItemRow(item: ItemDefaults = {}): void {
  const container = $('orc-itens');
  const desc = item.descricao || '';
  const isKnown = SERVICOS.includes(desc as typeof SERVICOS[number]);
  const customDesc = desc && !isKnown ? desc : '';
  const qtd = item.qtd || 1;
  const valorUnit = item.valorUnit || 0;
  const rowIndex = container.querySelectorAll('.orc-item-row').length + 1;

  const row = document.createElement('div');
  row.className = 'orc-item-row';
  row.innerHTML = `
    <div class="item-num">${rowIndex}</div>
    <div class="field field-desc">
      <select class="item-desc-select">${buildDescOptions(desc)}</select>
      <input type="text" class="item-desc-custom${customDesc ? '' : ' hidden'}" value="${esc(customDesc)}" placeholder="Descreva o serviço">
    </div>
    <div class="field field-unid">
      <input type="text" class="item-unid" value="${esc(item.unidade || 'Serviço + Material')}" placeholder="Ex: Serviço + Material">
    </div>
    <div class="field field-qtd">
      <input type="number" class="item-qtd" value="${qtd}" min="1" step="1">
    </div>
    <div class="field field-valor">
      <input type="number" class="item-valor" value="${valorUnit}" min="0" step="0.01" placeholder="0,00">
    </div>
    <div class="item-total">${formatMoney(qtd * valorUnit)}</div>
    <button type="button" class="btn-remove" title="Remover item" aria-label="Remover item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  `;

  bindRowEvents(row);
  container.appendChild(row);
}

export function exportPDF(): void {
  exportOrcamento(getConfigData(), getFormData());
}

export async function exportPNG(): Promise<void> {
  await exportOrcamentoPng(getConfigData(), getFormData());
}

export function initOrcamento(): void {
  input('orc-data').value = todayISO();
  syncValidadeFromData();
  input('orc-numero').value = generateOrcNumero();
  select('orc-garantia').innerHTML = buildGarantiaOptions();
  $('orc-pagamento').innerHTML = buildPagamentoOptions();

  input('orc-data').addEventListener('change', syncValidadeFromData);

  DEFAULT_ITEMS.forEach(item => addItemRow(item));

  bindInputMask(input('orc-cliente-doc'), maskCpfCnpj);
  bindInputMask(input('orc-cliente-contato'), maskPhone);

  $('btn-add-item').addEventListener('click', () => {
    addItemRow({ descricao: SERVICOS[0], unidade: 'Serviço + Material', qtd: 1, valorUnit: 0 });
  });
  $('btn-pdf-orc').addEventListener('click', () => exportPDF());
  $('btn-png-orc').addEventListener('click', () => {
    const btn = $('btn-png-orc') as HTMLButtonElement;
    btn.disabled = true;
    exportPNG()
      .catch(err => alert(err instanceof Error ? err.message : 'Erro ao exportar PNG.'))
      .finally(() => { btn.disabled = false; });
  });
}
