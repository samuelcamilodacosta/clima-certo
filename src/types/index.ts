export interface CompanyConfig {
  razao: string;
  cnpj: string;
  pix: string;
  responsavel: string;
}

export interface OrcamentoItem {
  descricao: string;
  unidade: string;
  qtd: number;
  valorUnit: number;
  total: number;
}

export interface HistoricoItem {
  descricao: string;
  unidade: string;
}

export interface HistoricoExportacao {
  id: string;
  exported_at: string;
  funcionario: string;
  numero: string;
  titulo: string;
  cliente: string;
  cliente_doc: string;
  cliente_contato: string;
  cliente_endereco: string;
  cliente_assinatura: string;
  cliente_cargo: string;
  prazo: string;
  garantia: string;
  condicoes: string;
  obs: string;
  itens: HistoricoItem[];
}

export type HistoricoExportacaoInsert = Omit<HistoricoExportacao, 'id' | 'exported_at'>;

export interface OrcamentoData {
  numero: string;
  data: string;
  validade: string;
  titulo: string;
  cliente: string;
  clienteDoc: string;
  clienteContato: string;
  clienteEndereco: string;
  clienteAssinatura: string;
  clienteCargo: string;
  prazo: string;
  garantia: string;
  condicoes: string;
  obs: string;
  pagamento: string;
  desconto: string;
  descontoValor: number;
  items: OrcamentoItem[];
  subtotal: number;
  total: number;
}

export interface PdfScale {
  fs: number;
  fsHead: number;
  fsSm: number;
  fsTiny: number;
  pad: number;
  logo: number;
  lh: number;
}
