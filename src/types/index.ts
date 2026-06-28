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
