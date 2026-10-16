// Browser side: asks the server (Puppeteer) for a print-ready vector PDF.
import { downloadBlob } from './svg';
import type { Layout } from './sheet';

export async function exportPdf(svgs: string[], layout: Layout, size: { w: number; h: number }, marks: boolean, name = 'id-cards') {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ svgs, layout, size, marks }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'PDF export failed');
  downloadBlob(`${name}.pdf`, await res.blob());
}