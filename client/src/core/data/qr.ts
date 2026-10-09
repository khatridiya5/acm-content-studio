// Real QR codes (SVG string) for check-in. Use inside the engine instead of the placeholder.
import QRCode from 'qrcode';
export const qrSvg = (value: string) => QRCode.toString(value, { type: 'svg', margin: 0 });
