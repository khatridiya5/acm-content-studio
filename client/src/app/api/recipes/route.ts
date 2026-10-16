import { generatePlans } from '@/core/ai/gemini';
import { makePlans } from '@/core/ai/mock';

export async function POST(req: Request) {
  const { prompt, info } = await req.json();
  if (!prompt || typeof prompt !== 'string') return Response.json({ message: 'Describe the cards first.' }, { status: 400 });
  try {
    return Response.json(await generatePlans(prompt.slice(0, 2000), info ?? {}));
  } catch (e) {
    return Response.json({
      plans: makePlans(prompt, info ?? {}),
      source: 'fallback',
      notice: `Gemini was not available (${e instanceof Error ? e.message.slice(0, 120) : 'error'}). Showing basic templates.`,
    });
  }
}