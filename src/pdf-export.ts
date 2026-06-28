import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { getLogoDataUriSync } from './logo';
import type { CompanyConfig, OrcamentoData, PdfScale } from './types';
import { formatDateBR, formatDateLong, formatMoney } from './utils';

const BLUE: [number, number, number] = [0, 71, 149];
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = 210 - MARGIN * 2;
const SIGN_Y = 262;

const ORC_COL = { num: 8, desc: 74, unid: 34, qtd: 14, unit: 26, total: 26 } as const;
const TITLE_BAR_H = 8;
const TITLE_META_GAP = 5;
const SEM_GARANTIA = 'Sem garantia';

function hasPrazo(prazo: string): boolean {
  return !!prazo.trim();
}

function hasGarantia(garantia: string): boolean {
  return !!garantia.trim() && garantia !== SEM_GARANTIA;
}

function hasDesconto(descontoValor: number): boolean {
  return descontoValor > 0;
}

type Doc = jsPDF & { lastAutoTable: { finalY: number } };

function newDoc(): Doc {
  return new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' }) as Doc;
}

function splitText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text || '', maxWidth);
}

function truncateText(doc: jsPDF, text: string, maxWidth: number, maxLines: number): string[] {
  const lines = splitText(doc, text, maxWidth);
  if (lines.length <= maxLines) return lines;
  const cut = lines.slice(0, maxLines);
  cut[maxLines - 1] = cut[maxLines - 1].replace(/\s+\S*$/, '') + '…';
  return cut;
}

function drawTextBlock(
  doc: jsPDF, text: string, x: number, y: number,
  maxWidth: number, lineH: number, maxLines: number
): number {
  const lines = truncateText(doc, text, maxWidth, maxLines);
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

function fitCellText(
  doc: jsPDF, text: string, colWidth: number, fontSize: number, maxLines: number
): string {
  doc.setFontSize(fontSize);
  return truncateText(doc, text, colWidth - 3, maxLines).join('\n');
}

function drawLabeledValue(
  doc: jsPDF, x: number, y: number, label: string, value: string,
  labelColor: [number, number, number] = [60, 60, 60],
  valueColor: [number, number, number] = [60, 60, 60]
): number {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...labelColor);
  doc.text(label, x, y);
  const labelW = doc.getTextWidth(label);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...valueColor);
  doc.text(value, x + labelW, y);
  return x + labelW + doc.getTextWidth(value);
}

function drawMetaField(
  doc: jsPDF, x: number, y: number, colW: number,
  label: string, value: string
): void {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text(label, x, y);
  const labelW = doc.getTextWidth(label);
  doc.setFont('helvetica', 'normal');
  const val = truncateText(doc, value, Math.max(colW - labelW - 1, 8), 1)[0];
  doc.text(val, x + labelW, y);
}

function drawMetaColumns(
  doc: jsPDF, y: number, sc: PdfScale,
  fields: { label: string; value: string }[]
): number {
  doc.setFontSize(sc.fsSm);
  const colW = CONTENT_W / fields.length;

  fields.forEach((field, i) => {
    drawMetaField(doc, MARGIN + i * colW, y, colW - 2, field.label, field.value);
  });

  return y + sc.lh + 2;
}

function drawTitleBar(doc: jsPDF, y: number, numero: string, sc: PdfScale): number {
  doc.setFillColor(...BLUE);
  doc.rect(MARGIN, y, CONTENT_W, TITLE_BAR_H, 'F');
  doc.setFontSize(sc.fs);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const textY = y + TITLE_BAR_H / 2 + sc.fs * 0.12;
  doc.text('ORÇAMENTO', MARGIN + 4, textY);
  doc.text(`Nº ${numero || '—'}`, MARGIN + CONTENT_W - 4, textY, { align: 'right' });
  return y + TITLE_BAR_H + TITLE_META_GAP;
}

function drawSection(
  doc: jsPDF, title: string, content: string, y: number,
  sc: PdfScale, maxLines: number, maxY: number
): number {
  if (!content || y >= maxY) return y;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE);
  doc.setFontSize(sc.fsTiny);
  doc.text(title, MARGIN, y);
  y += sc.lh - 0.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  const linesLeft = Math.max(1, Math.floor((maxY - y) / (sc.lh - 0.4)));
  y = drawTextBlock(doc, content, MARGIN, y, CONTENT_W, sc.lh - 0.4, Math.min(maxLines, linesLeft));
  return y + 1;
}

function drawClientBox(doc: jsPDF, data: OrcamentoData, y: number, sc: PdfScale): number {
  const colW = CONTENT_W / 2 - 2;
  const left: string[] = [];
  const right: string[] = [];

  if (data.cliente) left.push(`Nome: ${data.cliente}`);
  if (data.clienteContato) left.push(`Telefone: ${data.clienteContato}`);
  if (data.clienteEndereco) left.push(`Endereço: ${data.clienteEndereco}`);
  if (data.clienteDoc) right.push(`CPF/CNPJ: ${data.clienteDoc}`);

  const maxRows = Math.max(left.length, right.length, 1);
  const boxH = 5 + maxRows * sc.lh;

  doc.setFillColor(232, 240, 250);
  doc.rect(MARGIN, y, CONTENT_W, boxH, 'F');
  doc.setFontSize(sc.fsTiny);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE);
  doc.text('Dados do Cliente', MARGIN + 4, y + sc.lh);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  let rowY = y + sc.lh + 2;
  for (let i = 0; i < maxRows; i++) {
    if (left[i]) {
      doc.text(truncateText(doc, left[i], colW, 2), MARGIN + 4, rowY);
    }
    if (right[i]) {
      doc.text(truncateText(doc, right[i], colW, 2), MARGIN + CONTENT_W / 2 + 2, rowY);
    }
    rowY += sc.lh;
  }

  return y + boxH + 2;
}

function estimateOrcFooterHeight(data: OrcamentoData, sc: PdfScale): number {
  let h = 11;
  if (hasDesconto(data.descontoValor)) h += sc.lh * 2;
  if (hasPrazo(data.prazo)) h += sc.lh * 2;
  if (hasGarantia(data.garantia)) h += sc.lh * 2;
  if (data.condicoes) h += sc.lh * 2.5;
  if (data.obs) h += sc.lh * 2;
  if (data.pagamento) h += sc.lh * 1.8;
  h += sc.lh * 1.5;
  return h + 6;
}

function buildOrcamentoTableBody(
  doc: jsPDF, items: OrcamentoData['items'], sc: PdfScale
): string[][] {
  const maxDescLines = sc.fsTiny <= 6 ? 2 : 3;
  return items.map((item, i) => [
    String(i + 1),
    fitCellText(doc, item.descricao, ORC_COL.desc, sc.fsTiny, maxDescLines),
    fitCellText(doc, item.unidade, ORC_COL.unid, sc.fsTiny, 2),
    String(item.qtd),
    formatMoney(item.valorUnit),
    formatMoney(item.total)
  ]);
}

function addHeader(doc: jsPDF, cfg: CompanyConfig, sc: PdfScale): number {
  let y = 10;
  try {
    doc.addImage(getLogoDataUriSync(), 'PNG', MARGIN, y, sc.logo, sc.logo);
  } catch { /* logo opcional */ }

  doc.setFontSize(sc.fsHead);
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.text(cfg.razao, 196, y + 3, { align: 'right' });

  doc.setFontSize(sc.fsSm);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  const info = [`CNPJ: ${cfg.cnpj}`, `PIX: ${cfg.pix}`];

  let infoY = y + 7;
  info.forEach(line => {
    doc.text(truncateText(doc, line, 90, 1)[0], 196, infoY, { align: 'right' });
    infoY += sc.lh;
  });

  y = Math.max(y + sc.logo + 2, infoY + 1);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, 196, y);
  return y + 4;
}

function drawSignaturesOrcamento(doc: jsPDF, cfg: CompanyConfig, data: OrcamentoData, sc: PdfScale): void {
  const y = SIGN_Y;
  doc.setDrawColor(80, 80, 80);
  doc.line(22, y, 88, y);
  doc.line(122, y, 188, y);
  doc.setFontSize(sc.fsSm);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(truncateText(doc, cfg.responsavel || '—', 60, 1)[0], 55, y + 4, { align: 'center' });
  doc.text(
    truncateText(doc, data.clienteAssinatura || data.cliente || 'Cliente', 60, 1)[0],
    155, y + 4, { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(sc.fsTiny);
  doc.setTextColor(80, 80, 80);
  doc.text(truncateText(doc, cfg.razao, 60, 1)[0], 55, y + 8, { align: 'center' });
  doc.text(truncateText(doc, data.clienteCargo || 'Contratante', 60, 1)[0], 155, y + 8, { align: 'center' });
  doc.setTextColor(...BLUE);
  doc.setFontSize(sc.fsTiny - 0.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Orçamento feito por', 55, y + 12, { align: 'center' });
  doc.text('Assinatura do Cliente', 155, y + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(sc.fsTiny);
  doc.text(truncateText(doc, formatDateLong(data.data), 120, 1)[0], 105, y + 17, { align: 'center' });
  doc.setFontSize(sc.fsTiny - 1);
  doc.setTextColor(170, 170, 170);
  doc.text(
    truncateText(doc, `Orçamento feito por ${cfg.responsavel || '—'} — ${cfg.razao}`, CONTENT_W, 1)[0],
    105, PAGE_H - 8, { align: 'center' }
  );
}

function drawOrcamentoContent(doc: Doc, cfg: CompanyConfig, data: OrcamentoData, sc: PdfScale): number {
  let y = addHeader(doc, cfg, sc);

  y = drawTitleBar(doc, y, data.numero, sc);

  y = drawMetaColumns(doc, y, sc, [
    { label: 'Emitido: ', value: formatDateBR(data.data) },
    { label: 'Válido até: ', value: formatDateBR(data.validade) },
    { label: 'Itens: ', value: String(data.items.length) }
  ]);

  doc.setFontSize(sc.fsSm);
  drawLabeledValue(
    doc, MARGIN, y,
    'Orçamento feito por: ',
    cfg.responsavel || '—',
    BLUE,
    [40, 40, 40]
  );
  y += sc.lh + 1;

  if (data.titulo) {
    doc.setFontSize(sc.fsSm);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE);
    doc.text('Objeto da proposta:', MARGIN, y);
    y += sc.lh;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    y = drawTextBlock(doc, data.titulo, MARGIN, y, CONTENT_W, sc.lh, 2);
    y += 1;
  }

  y = drawClientBox(doc, data, y, sc);

  doc.setFillColor(237, 247, 229);
  doc.rect(MARGIN, y, CONTENT_W, 6, 'F');
  doc.setFontSize(sc.fsSm);
  doc.setTextColor(40, 80, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Proposta válida até ${formatDateBR(data.validade)}`, MARGIN + CONTENT_W / 2, y + 4, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE);
  doc.setFontSize(sc.fsSm);
  doc.text('Serviços / Produtos', MARGIN, y);
  y += sc.lh;

  const tableBottom = SIGN_Y - estimateOrcFooterHeight(data, sc);
  const body = buildOrcamentoTableBody(doc, data.items, sc);

  autoTable(doc, {
    startY: y,
    tableWidth: CONTENT_W,
    head: [['#', 'Descrição', 'Unid.', 'Qtd.', 'Val. Unit.', 'Valor']],
    body: body.length ? body : [['—', '—', '—', '—', '—', '—']],
    margin: { left: MARGIN, right: MARGIN, bottom: PAGE_H - tableBottom },
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    theme: 'grid',
    styles: {
      fontSize: sc.fsTiny,
      cellPadding: sc.pad,
      overflow: 'linebreak',
      lineColor: [210, 210, 210],
      lineWidth: 0.1,
      valign: 'middle'
    },
    headStyles: {
      fillColor: BLUE,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: sc.fsTiny,
      halign: 'center'
    },
    bodyStyles: { valign: 'middle' },
    columnStyles: {
      0: { cellWidth: ORC_COL.num, halign: 'center' },
      1: { cellWidth: ORC_COL.desc, halign: 'left' },
      2: { cellWidth: ORC_COL.unid, halign: 'left' },
      3: { cellWidth: ORC_COL.qtd, halign: 'center' },
      4: { cellWidth: ORC_COL.unit, halign: 'right' },
      5: { cellWidth: ORC_COL.total, halign: 'right', fontStyle: 'bold' }
    }
  });

  y = Math.min(doc.lastAutoTable.finalY + 3, tableBottom - 2);

  if (hasDesconto(data.descontoValor)) {
    doc.setFontSize(sc.fsSm);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: ${formatMoney(data.subtotal)}`, MARGIN + CONTENT_W, y, { align: 'right' });
    y += sc.lh;
    doc.setTextColor(180, 40, 40);
    doc.text(`Desconto: - ${formatMoney(data.descontoValor)}`, MARGIN + CONTENT_W, y, { align: 'right' });
    y += sc.lh;
  }

  doc.setFillColor(237, 247, 229);
  doc.rect(MARGIN + CONTENT_W - 80, y, 80, 7, 'F');
  doc.setFontSize(sc.fs);
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Geral: ${formatMoney(data.total)}`, MARGIN + CONTENT_W - 4, y + 4.8, { align: 'right' });
  y += 9;

  const maxY = SIGN_Y - 2;
  if (hasPrazo(data.prazo)) {
    y = drawSection(doc, 'Prazo de execução', data.prazo, y, sc, 2, maxY);
  }
  if (hasGarantia(data.garantia)) {
    y = drawSection(doc, 'Garantia', data.garantia, y, sc, 2, maxY);
  }
  y = drawSection(doc, 'Condições comerciais', data.condicoes, y, sc, 3, maxY);
  y = drawSection(doc, 'Observações', data.obs, y, sc, 2, maxY);

  if (data.pagamento && y < maxY) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE);
    doc.setFontSize(sc.fsTiny);
    doc.text('Formas de pagamento:', MARGIN, y);
    y += sc.lh - 0.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    y = drawTextBlock(doc, data.pagamento, MARGIN, y, CONTENT_W, sc.lh - 0.4, 2);
    y += 1;
  }

  if (y < maxY) {
    doc.setFontSize(sc.fsTiny);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`PIX: ${cfg.pix}`, MARGIN, y);
  }

  drawSignaturesOrcamento(doc, cfg, data, sc);
  return y;
}

export function buildOrcamentoDoc(cfg: CompanyConfig, data: OrcamentoData): Doc {
  const scales: PdfScale[] = [
    { fs: 10, fsHead: 10, fsSm: 7.5, fsTiny: 7, pad: 1.5, logo: 28, lh: 3.5 },
    { fs: 9, fsHead: 9.5, fsSm: 7, fsTiny: 6.5, pad: 1.2, logo: 26, lh: 3.2 },
    { fs: 8.5, fsHead: 9, fsSm: 6.5, fsTiny: 6, pad: 1, logo: 24, lh: 3 },
    { fs: 8, fsHead: 8.5, fsSm: 6, fsTiny: 5.5, pad: 0.8, logo: 22, lh: 2.8 },
    { fs: 7.5, fsHead: 8, fsSm: 5.5, fsTiny: 5, pad: 0.6, logo: 20, lh: 2.6 }
  ];

  let doc = newDoc();
  for (const sc of scales) {
    doc = newDoc();
    drawOrcamentoContent(doc, cfg, data, sc);
    if (doc.getNumberOfPages() === 1) break;
  }

  return doc;
}

function orcamentoFilename(data: OrcamentoData, ext: 'pdf' | 'png'): string {
  const base = (data.numero || 'orcamento').replace(/\//g, '-');
  return `Orcamento_${base}.${ext}`;
}

export function exportOrcamento(cfg: CompanyConfig, data: OrcamentoData): void {
  buildOrcamentoDoc(cfg, data).save(orcamentoFilename(data, 'pdf'));
}

export async function exportOrcamentoPng(cfg: CompanyConfig, data: OrcamentoData): Promise<void> {
  const doc = buildOrcamentoDoc(cfg, data);
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;

  const buffer = doc.output('arraybuffer');
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);
  const scale = 2;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível gerar a imagem.');

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Falha ao criar PNG'))), 'image/png');
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = orcamentoFilename(data, 'png');
  link.click();
  URL.revokeObjectURL(url);
}
