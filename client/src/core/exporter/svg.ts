// Browser-side download helpers + SVG export.
export function downloadBlob(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export const exportSvg = (svg: string, name = 'id-card') => downloadBlob(`${name}.svg`, new Blob([svg], { type: 'image/svg+xml' }));