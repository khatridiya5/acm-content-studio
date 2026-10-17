import { generatePlans } from '@/core/ai/gemini';

export async function POST(req: Request) {
  const { prompt, info } = await req.json();
  if (!prompt || typeof prompt !== 'string') {
    return Response.json({ message: 'Describe the cards first.' }, { status: 400 });
  }

  console.log('[POST /api/recipes] Request received. Prompt:', prompt.slice(0, 120), '| Info:', info);
  const result = await generatePlans(prompt.slice(0, 2000), info ?? {});
  console.log('[POST /api/recipes] Generated plans source:', result.source, '| Plan count:', result.plans?.length, '| Notice:', result.notice || 'none');

  return Response.json(result);
}

