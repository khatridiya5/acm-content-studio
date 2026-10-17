// PNG export at chosen DPI (300 for print). Runs in the browser.
import { DesignPlan } from '@/types';
import { downloadBlob } from './svg';

export function exportPng(svg: string, plan: DesignPlan, dpi = 300, name = 'id-card') {
  return new Promise<void>((resolve) => {
    const k = dpi / 25.4; // pixels per mm
    const W = Math.round(plan.size.w * k), H = Math.round(plan.size.h * k);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      c.getContext('2d')!.drawImage(img, 0, 0, W, H);
      c.toBlob((b) => { if (b) downloadBlob(`${name}.png`, b); resolve(); }, 'image/png');
    };
    img.onerror = () => resolve();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}