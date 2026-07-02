import { getConfigData } from './config';
import { bindItemRowAutocomplete, registrarCamposUsados } from './campo-historico';
import { $, esc, input, queryInput, textarea } from './dom';
import { bindInputMask, maskCpfCnpj, maskPhone } from './masks';
import { exportOrcamento, exportOrcamentoPng } from './pdf-export';
import type { OrcamentoData, OrcamentoItem } from './types';
import {
  addDaysFromISO, formatMoney, todayISO
} from './utils';

const VALIDADE_DIAS = 7;
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

function getItems(): OrcamentoItem[] {
  return [...document.querySelectorAll('#orc-itens .orc-item-row')].map(row => {
    const qtd = parseFloat(queryInput(row, '.item-qtd').value) || 0;
    const valorUnit = parseFloat(queryInput(row, '.item-valor').value) || 0;
    return {
      descricao: queryInput(row, '.item-desc').value.trim(),
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
    garantia: input('orc-garantia').value.trim(),
    condicoes: textarea('orc-condicoes').value.trim(),
    obs: textarea('orc-obs').value.trim(),
    pagamento: getPagamentosSelecionados(),
    desconto,
    items,
    ...totals
  };
}

function updateRowTotal(row: Element): void {
  const qtd = parseFloat((row.querySelector('.item-qtd') as HTMLInputElement).value) || 0;
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

  row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', update));
  row.querySelector('.btn-remove')?.addEventListener('click', () => {
    row.remove();
    renumberOrcItems();
  });
}

function addItemRow(item: ItemDefaults = {}): void {
  const container = $('orc-itens');
  const desc = item.descricao || '';
  const unidade = item.unidade || '';
  const qtd = item.qtd ?? '';
  const valorUnit = item.valorUnit ?? '';
  const qtdNum = parseFloat(String(qtd)) || 0;
  const valorNum = parseFloat(String(valorUnit)) || 0;
  const rowIndex = container.querySelectorAll('.orc-item-row').length + 1;

  const row = document.createElement('div');
  row.className = 'orc-item-row';
  row.innerHTML = `
    <div class="item-num">${rowIndex}</div>
    <div class="field field-desc">
      <input type="text" class="item-desc" value="${esc(desc)}" placeholder="Descrição do serviço">
    </div>
    <div class="field field-unid">
      <input type="text" class="item-unid" value="${esc(unidade)}" placeholder="Ex: Serviço + Material">
    </div>
    <div class="field field-qtd">
      <input type="number" class="item-qtd" value="${qtd}" min="1" step="1" placeholder="1">
    </div>
    <div class="field field-valor">
      <input type="number" class="item-valor" value="${valorUnit}" min="0" step="0.01" placeholder="0,00">
    </div>
    <div class="item-total">${formatMoney(qtdNum * valorNum)}</div>
    <button type="button" class="btn-remove" title="Remover item" aria-label="Remover item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  `;

  bindRowEvents(row);
  bindItemRowAutocomplete(row);
  container.appendChild(row);
}


export function exportPDF(): void {
  const data = getFormData();
  exportOrcamento(getConfigData(), data);
  void registrarCamposUsados(data);
}

export async function exportPNG(): Promise<void> {
  const data = getFormData();
  await exportOrcamentoPng(getConfigData(), data);
  await registrarCamposUsados(data);
}

export function initOrcamento(): void {
  input('orc-data').value = todayISO();
  syncValidadeFromData();
  $('orc-pagamento').innerHTML = buildPagamentoOptions();

  input('orc-data').addEventListener('change', syncValidadeFromData);

  addItemRow();

  bindInputMask(input('orc-cliente-doc'), maskCpfCnpj);
  bindInputMask(input('orc-cliente-contato'), maskPhone);

  $('btn-add-item').addEventListener('click', () => {
    addItemRow();
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
