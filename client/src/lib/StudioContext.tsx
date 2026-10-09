'use client';
// Shared state for all 4 steps. Saved in sessionStorage so a page refresh keeps your work.
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DesignPlan, Person } from '@/types';
import { SAMPLE_PEOPLE } from '@/lib/constants';
import { makePlans } from '@/core/ai/mock';

interface Ctx {
  prompt: string; setPrompt: (v: string) => void;
  event: string; setEvent: (v: string) => void;
  plans: DesignPlan[]; generate: () => void;
  sel: number; setSel: (v: number) => void;
  pi: number; setPi: (v: number) => void;
  name: string; setName: (v: string) => void;
  people: Person[]; person: Person; plan: DesignPlan | undefined;
}
const C = createContext<Ctx | null>(null);
export const useStudio = () => {
  const c = useContext(C);
  if (!c) throw new Error('useStudio must be used inside StudioProvider');
  return c;
};

export function StudioProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState('');
  const [event, setEvent] = useState('');
  const [plans, setPlans] = useState<DesignPlan[]>([]);
  const [sel, setSel] = useState(0);
  const [pi, setPiRaw] = useState(0);
  const [name, setName] = useState(SAMPLE_PEOPLE[0].name);
  const [ready, setReady] = useState(false);
  const people = SAMPLE_PEOPLE;

  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem('studio') ?? '{}');
      if (s.prompt) setPrompt(s.prompt);
      if (s.event) setEvent(s.event);
      if (s.plans) setPlans(s.plans);
      if (s.sel != null) setSel(s.sel);
      if (s.pi != null) { setPiRaw(s.pi); setName(s.name ?? people[s.pi].name); }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) sessionStorage.setItem('studio', JSON.stringify({ prompt, event, plans, sel, pi, name }));
  }, [ready, prompt, event, plans, sel, pi, name]);

  const setPi = (i: number) => { setPiRaw(i); setName(people[i].name); };
  const generate = () => { setPlans(makePlans(prompt)); setSel(0); };
  const person: Person = { ...people[pi], name: name.trim() || people[pi].name };

  return (
    <C.Provider value={{ prompt, setPrompt, event, setEvent, plans, generate, sel, setSel, pi, setPi, name, setName, people, person, plan: plans[sel] }}>
      {children}
    </C.Provider>
  );
}
