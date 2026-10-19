import { generateCertificatePlans } from '@/core/ai/gemini';

export async function POST(req: Request) {
  const { prompt, info } = await req.json();
  const safePrompt = typeof prompt === 'string' && prompt.trim() ? prompt.slice(0, 2000) : 'Formal certificate';

  console.log('[POST /api/recipes/certificate] Request received. Prompt:', safePrompt.slice(0, 120), '| Info:', info);
  const result = await generateCertificatePlans(safePrompt, info ?? {});
  console.log('[POST /api/recipes/certificate] Generated plans source:', result.source, '| Plan count:', result.plans?.length, '| Notice:', result.notice || 'none');

  return Response.json(result);
}
