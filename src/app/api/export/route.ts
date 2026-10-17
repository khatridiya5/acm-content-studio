import puppeteer from 'puppeteer';
import { buildSheetHtml, Layout } from '@/core/exporter/sheet';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const b = await req.json();
  const svgs: string[] = Array.isArray(b.svgs) ? b.svgs.filter((s: unknown): s is string => typeof s === 'string' && s.startsWith('<svg')) : [];
  if (!svgs.length || svgs.length > 500) return Response.json({ message: 'Send 1 to 500 cards.' }, { status: 400 });
  const layout: Layout = ['single', 'A4', 'A3'].includes(b.layout) ? b.layout : 'single';
  const cw = Number(b.size?.w) || 54, ch = Number(b.size?.h) || 86;
  const { html, pageW, pageH } = buildSheetHtml(svgs, layout, cw, ch, !!b.marks);
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ width: `${pageW}mm`, height: `${pageH}mm`, printBackground: true, preferCSSPageSize: true });
    return new Response(pdf as unknown as BodyInit, { headers: { 'Content-Type': 'application/pdf' } });
  } catch (e) {
    return Response.json({ message: e instanceof Error ? e.message : 'PDF failed' }, { status: 500 });
  } finally {
    await browser?.close();
  }
}