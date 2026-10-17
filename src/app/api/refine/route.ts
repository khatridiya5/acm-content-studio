import { refinePlan } from '@/core/ai/gemini';
import { planSchema } from '@/core/validator/schema';

export async function POST(req: Request) {
  const { plan, instruction } = await req.json();
  if (!plan || typeof instruction !== 'string' || !instruction.trim()) {
    return Response.json({ message: 'Nothing to change.' }, { status: 400 });
  }

  if (typeof plan === 'string') {
    try {
      const updated = await refinePlan(plan, instruction.slice(0, 500));
      return Response.json({ plan: updated });
    } catch (e) {
      return Response.json({ message: e instanceof Error ? e.message : 'Could not change the design.' }, { status: 422 });
    }
  }

  const ok = planSchema.safeParse(plan);
  if (!ok.success) {
    return Response.json({ message: 'Invalid plan format.' }, { status: 400 });
  }

  try {
    return Response.json({ plan: await refinePlan(ok.data as never, instruction.slice(0, 300)) });
  } catch (e) {
    return Response.json({ message: e instanceof Error ? e.message : 'Could not change the design.' }, { status: 422 });
  }
}