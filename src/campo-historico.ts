import { attachAutocomplete } from './autocomplete';
import { clearHistorico, setHistorico } from './autocomplete-store';
import { getFuncionario } from './company';
import { input, textarea } from './dom';
import type { HistoricoExportacao, OrcamentoData } from './types';
import {
  buildHistoricoExportacao,
  fetchHistoricoExportacoes,
  insertHistoricoExportacao,
  isHistoricoVazio,
} from './supabase/historico-exportacoes-repo';
import { isSupabaseConfigured } from './supabase/client';

export const CAMPOS = {
  funcionario: 'funcionario',
  numero: 'orc-numero',
  titulo: 'orc-titulo',
  cliente: 'orc-cliente',
  clienteDoc: 'orc-cliente-doc',
  clienteContato: 'orc-cliente-contato',
  clienteEndereco: 'orc-cliente-endereco',
  clienteAssinatura: 'orc-cliente-assinatura',
  clienteCargo: 'orc-cliente-cargo',
  itemDescricao: 'item-descricao',
  itemUnidade: 'item-unidade',
  prazo: 'orc-prazo',
  garantia: 'orc-garantia',
  condicoes: 'orc-condicoes',
  obs: 'orc-obs',
} as const;

function bindField(id: string, campo: string, useTextarea = false): void {
  const el = useTextarea ? textarea(id) : input(id);
  attachAutocomplete(el, campo);
}

export function bindItemRowAutocomplete(row: Element): void {
  const desc = row.querySelector('.item-desc') as HTMLInputElement | null;
  const unid = row.querySelector('.item-unid') as HTMLInputElement | null;
  if (desc) attachAutocomplete(desc, CAMPOS.itemDescricao);
  if (unid) attachAutocomplete(unid, CAMPOS.itemUnidade);
}

function addValorUnico(map: Map<string, string[]>, campo: string, valor: string): void {
  const trimmed = valor.trim();
  if (!trimmed) return;
  const list = map.get(campo) ?? [];
  if (!list.includes(trimmed)) list.push(trimmed);
  map.set(campo, list);
}

function applyHistoricoToStore(rows: HistoricoExportacao[]): void {
  const grouped = new Map<string, string[]>();

  for (const row of rows) {
    addValorUnico(grouped, CAMPOS.funcionario, row.funcionario);
    addValorUnico(grouped, CAMPOS.numero, row.numero);
    addValorUnico(grouped, CAMPOS.titulo, row.titulo);
    addValorUnico(grouped, CAMPOS.cliente, row.cliente);
    addValorUnico(grouped, CAMPOS.clienteDoc, row.cliente_doc);
    addValorUnico(grouped, CAMPOS.clienteContato, row.cliente_contato);
    addValorUnico(grouped, CAMPOS.clienteEndereco, row.cliente_endereco);
    addValorUnico(grouped, CAMPOS.clienteAssinatura, row.cliente_assinatura);
    addValorUnico(grouped, CAMPOS.clienteCargo, row.cliente_cargo);
    addValorUnico(grouped, CAMPOS.prazo, row.prazo);
    addValorUnico(grouped, CAMPOS.garantia, row.garantia);
    addValorUnico(grouped, CAMPOS.condicoes, row.condicoes);
    addValorUnico(grouped, CAMPOS.obs, row.obs);

    for (const item of row.itens) {
      addValorUnico(grouped, CAMPOS.itemDescricao, item.descricao);
      addValorUnico(grouped, CAMPOS.itemUnidade, item.unidade);
    }
  }

  clearHistorico();
  for (const [campo, valores] of grouped) {
    setHistorico(campo, valores);
  }
}

export async function registrarCamposUsados(data: OrcamentoData): Promise<void> {
  const record = buildHistoricoExportacao(data, getFuncionario());
  if (isHistoricoVazio(record) || !isSupabaseConfigured()) return;

  try {
    await insertHistoricoExportacao(record);
    applyHistoricoToStore(await fetchHistoricoExportacoes());
  } catch {
    // Falha na nuvem não bloqueia a exportação.
  }
}

export async function initCampoHistorico(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      applyHistoricoToStore(await fetchHistoricoExportacoes());
    } catch {
      clearHistorico();
    }
  }

  bindField('funcionario', CAMPOS.funcionario);
  bindField('orc-numero', CAMPOS.numero);
  bindField('orc-titulo', CAMPOS.titulo);
  bindField('orc-cliente', CAMPOS.cliente);
  bindField('orc-cliente-doc', CAMPOS.clienteDoc);
  bindField('orc-cliente-contato', CAMPOS.clienteContato);
  bindField('orc-cliente-endereco', CAMPOS.clienteEndereco);
  bindField('orc-cliente-assinatura', CAMPOS.clienteAssinatura);
  bindField('orc-cliente-cargo', CAMPOS.clienteCargo);
  bindField('orc-prazo', CAMPOS.prazo);
  bindField('orc-garantia', CAMPOS.garantia);
  bindField('orc-condicoes', CAMPOS.condicoes, true);
  bindField('orc-obs', CAMPOS.obs, true);

  document.querySelectorAll('#orc-itens .orc-item-row').forEach(bindItemRowAutocomplete);
}
