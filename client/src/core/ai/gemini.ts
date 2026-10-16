// Server-only. Keep GEMINI_API_KEY in client/.env.local.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DesignPlan, EventInfo } from '@/types';
import { CARD_SIZE, FONTS } from '@/lib/constants';
import { planSchema } from '@/core/validator/schema';
import { checkPlan } from '@/core/validator/check';
import { intakePrompt, plansPrompt, refinePrompt } from './prompts';
import { makePlans } from './mock';

async function askJson(prompt: string): Promise<Record<string, unknown>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: process.env.MODEL || 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
  });
  const res = await model.generateContent(prompt);
  const text = res.response.text().replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  return JSON.parse(text);
}

function normalize(p: unknown) {
  if (!p || typeof p !== 'object') return p;
  const o = { ...(p as Record<string, unknown>) };
  o.size = CARD_SIZE;
  if (!FONTS.includes(o.font as (typeof FONTS)[number])) o.font = FONTS[0];
  return o;
}

export async function extractIntake(text: string) {
  return askJson(intakePrompt(text));
}

export async function generatePlans(prompt: string, info: EventInfo) {
  const good: DesignPlan[] = [];
  const notes: string[] = [];
  for (let attempt = 0; attempt < 3 && good.length < 3; attempt++) {
    try {
      const raw = await askJson(plansPrompt(prompt, info, attempt ? notes.slice(-6) : []));
      const list = Array.isArray(raw.plans) ? raw.plans : [];
      for (const p of list) {
        const parsed = planSchema.safeParse(normalize(p));
        if (!parsed.success) { notes.push('Schema: ' + (parsed.error.issues[0]?.message ?? 'invalid')); continue; }
        const issues = checkPlan(parsed.data);
        if (issues.length) { notes.push(...issues.slice(0, 3)); continue; }
        if (good.length < 3) good.push(parsed.data as DesignPlan);
      }
    } catch (e) {
      notes.push(String(e));
      if (!process.env.GEMINI_API_KEY) break;
    }
  }
  if (good.length === 0) throw new Error(notes.slice(-2).join(' ') || 'Gemini gave no valid design');
  let notice = '';
  if (good.length < 3) {
    const fb = makePlans(prompt, info);
    while (good.length < 3) good.push(fb[good.length]);
    notice = 'Gemini gave fewer than 3 valid designs, so basic templates filled the rest.';
  }
  return { plans: good, source: notice ? 'mixed' : 'gemini', notice };
}

export async function refinePlan(plan: DesignPlan, instruction: string): Promise<DesignPlan> {
  const problems: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await askJson(refinePrompt(plan, instruction + (problems.length ? ' (fix: ' + problems.join(' | ') + ')' : '')));
    const parsed = planSchema.safeParse(normalize(raw.plan));
    if (!parsed.success) { problems.push('invalid format'); continue; }
    const issues = checkPlan(parsed.data);
    if (issues.length) { problems.push(...issues.slice(0, 3)); continue; }
    return parsed.data as DesignPlan;
  }
  throw new Error('Could not apply that safely: ' + problems.join('; '));
}