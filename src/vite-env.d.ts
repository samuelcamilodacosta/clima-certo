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
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
