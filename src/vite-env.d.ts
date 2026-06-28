/// <reference types="vite/client" />

declare module 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_APP_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
