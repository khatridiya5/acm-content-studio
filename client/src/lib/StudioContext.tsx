'use client';
// Shared state for all steps. Saved in sessionStorage so a refresh keeps your work.
import { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { DesignPlan, EventInfo, Person } from '@/types';
import { SAMPLE_PEOPLE } from '@/lib/constants';
import { makePlans } from '@/core/ai/mock';

export interface Msg { from: 'user' | 'bot'; text: string }

interface Ctx {
  prompt: string; setPrompt: (v: string) => void;
  info: EventInfo; setInfo: (v: EventInfo) => void;
  event: string; setEvent: (v: string) => void;
  msgs: Msg[]; setMsgs: Dispatch<SetStateAction<Msg[]>>;
  plans: DesignPlan[]; plan: DesignPlan | undefined; updatePlan: (p: DesignPlan) => void;
  generate: () => Promise<void>; refine: (instruction: string) => Promise<string>;
  loading: boolean; notice: string;
  sel: number; setSel: (v: number) => void;
  people: Person[]; isSample: boolean; loadPeople: (p: Person[]) => void;
  pi: number; setPi: (v: number) => void; person: Person;
}
const C = createContext<Ctx | null>(null);
export const useStudio = () => {
  const c = useContext(C);
  if (!c) throw new Error('useStudio must be used inside StudioProvider');
  return c;
};

export function StudioProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState('');
  const [info, setInfo] = useState<EventInfo>({});
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [plans, setPlans] = useState<DesignPlan[]>([]);
  const [sel, setSel] = useState(0);
  const [people, setPeople] = useState<Person[]>(SAMPLE_PEOPLE);
  const [isSample, setIsSample] = useState(true);
  const [pi, setPi] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem('studio2') ?? '{}');
      if (s.prompt) setPrompt(s.prompt);
      if (s.info) setInfo(s.info);
      if (s.msgs) setMsgs(s.msgs);
      if (s.plans) setPlans(s.plans);
      if (s.sel != null) setSel(s.sel);
      if (s.people?.length) { setPeople(s.people); setIsSample(!!s.isSample); }
      if (s.pi != null) setPi(s.pi);
    } catch { }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const base = { prompt, info, msgs, plans, sel, pi, isSample };
    try { sessionStorage.setItem('studio2', JSON.stringify({ ...base, people })); }
    catch { try { sessionStorage.setItem('studio2', JSON.stringify({ ...base, people: people.map((p) => ({ ...p, photo: null })) })); } catch { } }
  }, [ready, prompt, info, msgs, plans, sel, pi, people, isSample]);

  const loadPeople = (p: Person[]) => { setPeople(p); setIsSample(false); setPi(0); };

  const generate = async () => {
    setLoading(true); setNotice('');
    const r = await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, info }) });
    const d = await r.json();
    setPlans(d.plans); setNotice(d.notice ?? '');
    setSel(0); setLoading(false);
  };

  const updatePlan = (np: DesignPlan) => setPlans((ps) => ps.map((p, i) => (i === sel ? np : p)));

  const refine = async (instruction: string) => {
    const plan = plans[sel];
    if (!plan) return 'No draft selected.';
    try {
      const r = await fetch('/api/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, instruction }) });
      const d = await r.json();
      if (!r.ok) return d.message ?? 'Could not apply that change.';
      updatePlan(d.plan);
      return '';
    } catch { return 'Could not reach the design service.'; }
  };

  const person = people[pi] ?? people[0];
  return (
    <C.Provider value={{
      prompt, setPrompt, info, setInfo, event: info.name ?? '', setEvent: (v) => setInfo({ ...info, name: v }),
      msgs, setMsgs, plans, plan: plans[sel], updatePlan, generate, refine, loading, notice,
      sel, setSel, people, isSample, loadPeople, pi, setPi, person,
    }}>
      {children}
    </C.Provider>
  );
}