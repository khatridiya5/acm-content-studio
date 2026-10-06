// PNG export at chosen DPI (300 for print). Runs in the browser.
import { DesignPlan } from '@/types';
import { downloadBlob } from './svg';

export function exportPng(svg: string, plan: DesignPlan, dpi = 300) {
  const k = dpi / 25.4; // pixels per mm
  const W = Math.round(plan.size.w * k), H = Math.round(plan.size.h * k);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    c.getContext('2d')!.drawImage(img, 0, 0, W, H);
    c.toBlob((b) => b && downloadBlob('id-card.png', b), 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
