import { extractIntake } from '@/core/ai/gemini';
import { mergeInfo } from '@/core/ai/intake';

export async function POST(req: Request) {
  const { text, info } = await req.json();
  const userText = String(text ?? '').slice(0, 2000);
  let next = info ?? {};
  let found: string[] = [];
  let ai = true;
  try {
    const m = mergeInfo(next, await extractIntake(userText), userText);
    next = m.info; found = m.found;
  } catch { ai = false; } // AI down: nothing extracted, the chat just asks everything
  return Response.json({ info: next, found, ai });
}