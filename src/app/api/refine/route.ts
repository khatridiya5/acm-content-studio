import { refinePlan } from '@/core/ai/gemini';
import { planSchema } from '@/core/validator/schema';

export async function POST(req: Request) {
  const { plan, instruction } = await req.json();
  if (!plan || typeof instruction !== 'string' || !instruction.trim()) {
    return Response.json({ message: 'Nothing to change.' }, { status: 400 });
  }

  console.log(`[POST /api/refine] Instruction: "${instruction.trim()}"`);

  // Handle SVG-based plans (raw string or DesignPlan object with svg)
  if (typeof plan === 'string' || (typeof plan === 'object' && typeof plan.svg === 'string' && plan.svg.trim())) {
    try {
      const updated = await refinePlan(plan, instruction.slice(0, 500));
      return Response.json({ plan: updated });
    } catch (e) {
      console.error('[POST /api/refine] Refine error:', e);
      return Response.json({ message: e instanceof Error ? e.message : 'Could not change the design.' }, { status: 422 });
    }
  }

  // Fallback for legacy element-based plans
  const ok = planSchema.safeParse(plan);
  if (!ok.success) {
    return Response.json({ message: 'Invalid plan format.' }, { status: 400 });
  }

  try {
    const updated = await refinePlan(ok.data as never, instruction.slice(0, 500));
    return Response.json({ plan: updated });
  } catch (e) {
    console.error('[POST /api/refine] Refine error:', e);
    return Response.json({ message: e instanceof Error ? e.message : 'Could not change the design.' }, { status: 422 });
  }
}