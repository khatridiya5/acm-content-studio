import { makeCertificatePlans } from '@/core/ai/certificate';

export async function POST(req: Request) {
  const { prompt, info } = await req.json();
  const safePrompt = typeof prompt === 'string' && prompt.trim() ? prompt.slice(0, 2000) : 'Default';

  console.log('[POST /api/recipes/certificate] Serving pre-feeded theme templates directly. Selected theme/prompt:', safePrompt.slice(0, 120));
  const plans = makeCertificatePlans(safePrompt, info ?? {});
  console.log('[POST /api/recipes/certificate] Returned variants count:', plans.length);

  return Response.json({
    plans,
    source: 'pre-feeded',
    notice: '',
  });
}

