import QRCode from 'qrcode';

export const qrSvg = (value: string) => QRCode.toString(value, { type: 'svg', margin: 0 });

// Synchronous QR grid, used by the card drawer.
export function qrMatrix(value: string) {
  const q = QRCode.create(value, { errorCorrectionLevel: 'M' }) as unknown as {
    modules: { size: number; get(r: number, c: number): number };
  };
  return { size: q.modules.size, dark: (r: number, c: number) => !!q.modules.get(r, c) };
}