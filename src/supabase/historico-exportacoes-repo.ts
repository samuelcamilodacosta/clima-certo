import type { HistoricoExportacao, HistoricoExportacaoInsert, OrcamentoData } from '../types';
import { callEdgeFunction } from './edge-api';

export function buildHistoricoExportacao(
  data: OrcamentoData,
  funcionario: string
): HistoricoExportacaoInsert {
  return {
    funcionario: funcionario.trim(),
    numero: data.numero.trim(),
    titulo: data.titulo.trim(),
    cliente: data.cliente.trim(),
    cliente_doc: data.clienteDoc.trim(),
    cliente_contato: data.clienteContato.trim(),
    cliente_endereco: data.clienteEndereco.trim(),
    cliente_assinatura: data.clienteAssinatura.trim(),
    cliente_cargo: data.clienteCargo.trim(),
    prazo: data.prazo.trim(),
    garantia: data.garantia.trim(),
    condicoes: data.condicoes.trim(),
    obs: data.obs.trim(),
    itens: data.items
      .filter(item => item.descricao.trim())
      .map(item => ({
        descricao: item.descricao.trim(),
        unidade: item.unidade.trim(),
      })),
  };
}

export function isHistoricoVazio(record: HistoricoExportacaoInsert): boolean {
  const temCampo = [
    record.funcionario, record.numero, record.titulo, record.cliente,
    record.cliente_doc, record.cliente_contato, record.cliente_endereco,
    record.cliente_assinatura, record.cliente_cargo, record.prazo,
    record.garantia, record.condicoes, record.obs,
  ].some(v => v.length > 0);

  return !temCampo && record.itens.length === 0;
}

export async function fetchHistoricoExportacoes(): Promise<HistoricoExportacao[]> {
  return callEdgeFunction<HistoricoExportacao[]>('get-historico');
}

export async function insertHistoricoExportacao(
  record: HistoricoExportacaoInsert
): Promise<HistoricoExportacao> {
  return callEdgeFunction<HistoricoExportacao>('save-historico', {
    method: 'POST',
    body: record,
  });
}
