'use client';
// Shared state for all steps. Saved in sessionStorage so a refresh keeps your work.
import { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { CertificateRecipient, DesignPlan, EventInfo, Person, Signatory } from '@/types';
import { DEFAULT_SIGNATORIES, SAMPLE_CERTIFICATE_RECIPIENTS, SAMPLE_PEOPLE } from '@/lib/constants';

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
  setPreviewPhoto: (url: string) => void;
  // Certificate specific
  certPlans: DesignPlan[]; certPlan: DesignPlan | undefined; updateCertPlan: (p: DesignPlan) => void;
  certSel: number; setCertSel: (v: number) => void;
  certRecipients: CertificateRecipient[]; isCertSample: boolean; loadCertRecipients: (r: CertificateRecipient[]) => void;
  certPi: number; setCertPi: (v: number) => void; certRecipient: CertificateRecipient;
  generateCertificates: (customPrompt?: string) => Promise<void>; refineCert: (instruction: string) => Promise<string>;
  setSignatories: (s: Signatory[]) => void;
}
const C = createContext<Ctx | null>(null);
export const useStudio = () => {
  const c = useContext(C);
  if (!c) throw new Error('useStudio must be used inside StudioProvider');
  return c;
};

export function StudioProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState('');
  const [info, setInfo] = useState<EventInfo>({ signatories: DEFAULT_SIGNATORIES });
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [plans, setPlans] = useState<DesignPlan[]>([]);
  const [sel, setSel] = useState(0);
  const [people, setPeople] = useState<Person[]>(SAMPLE_PEOPLE);
  const [isSample, setIsSample] = useState(true);
  const [pi, setPi] = useState(0);

  // Certificate state
  const [certPlans, setCertPlans] = useState<DesignPlan[]>([]);
  const [certSel, setCertSel] = useState(0);
  const [certRecipients, setCertRecipients] = useState<CertificateRecipient[]>(SAMPLE_CERTIFICATE_RECIPIENTS);
  const [isCertSample, setIsCertSample] = useState(true);
  const [certPi, setCertPi] = useState(0);

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
      if (s.certPlans?.length) setCertPlans(s.certPlans);
      if (s.certSel != null) setCertSel(s.certSel);
      if (s.certRecipients?.length) { setCertRecipients(s.certRecipients); setIsCertSample(!!s.isCertSample); }
      if (s.certPi != null) setCertPi(s.certPi);
    } catch { }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const base = {
      prompt,
      info,
      msgs,
      plans,
      sel,
      pi,
      isSample,
      certPlans,
      certSel,
      certPi,
      isCertSample,
      certRecipients,
    };
    try {
      sessionStorage.setItem('studio2', JSON.stringify({ ...base, people }));
    } catch {
      try {
        sessionStorage.setItem('studio2', JSON.stringify({ ...base, people: people.map((p) => ({ ...p, photo: null })) }));
      } catch { }
    }
  }, [ready, prompt, info, msgs, plans, sel, pi, people, isSample, certPlans, certSel, certPi, isCertSample, certRecipients]);

  const loadPeople = (p: Person[]) => { setPeople(p); setIsSample(false); setPi(0); };
  const loadCertRecipients = (r: CertificateRecipient[]) => { setCertRecipients(r); setIsCertSample(false); setCertPi(0); };

  const setPreviewPhoto = (url: string) => {
    setPeople((prev) => prev.map((p) => ({ ...p, photo: url })));
  };

  const setSignatories = (s: Signatory[]) => {
    setInfo((prev) => ({ ...prev, signatories: s }));
  };

  const generate = async () => {
    setLoading(true); setNotice('');
    const r = await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, info }) });
    const d = await r.json();
    setPlans(d.plans); setNotice(d.notice ?? '');
    setSel(0); setLoading(false);
  };

  const generateCertificates = async (customPrompt?: string) => {
    setLoading(true); setNotice('');
    const queryPrompt = customPrompt || prompt || 'Formal academic certificate';
    const r = await fetch('/api/recipes/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: queryPrompt, info }),
    });
    const d = await r.json();
    setCertPlans(d.plans);
    setNotice(d.notice ?? '');
    setCertSel(0);
    setLoading(false);
  };

  const updatePlan = (np: DesignPlan) => setPlans((ps) => ps.map((p, i) => (i === sel ? np : p)));
  const updateCertPlan = (np: DesignPlan) => setCertPlans((ps) => ps.map((p, i) => (i === certSel ? np : p)));

  const refine = async (instruction: string) => {
    const targetIndex = sel;
    const plan = plans[targetIndex];
    if (!plan) return 'No draft selected.';
    try {
      const r = await fetch('/api/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, instruction }) });
      const d = await r.json();
      if (!r.ok) return d.message ?? 'Could not apply that change.';
      setPlans((ps) => ps.map((p, i) => (i === targetIndex ? d.plan : p)));
      return '';
    } catch { return 'Could not reach the design service.'; }
  };

  const refineCert = async (instruction: string) => {
    const plan = certPlans[certSel];
    if (!plan) return 'No draft selected.';
    try {
      const r = await fetch('/api/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, instruction }) });
      const d = await r.json();
      if (!r.ok) return d.message ?? 'Could not apply that change.';
      updateCertPlan(d.plan);
      return '';
    } catch { return 'Could not reach the design service.'; }
  };

  const person = people[pi] ?? people[0];
  const certRecipient = certRecipients[certPi] ?? certRecipients[0];

  return (
    <C.Provider value={{
      prompt, setPrompt, info, setInfo, event: info.name ?? '', setEvent: (v) => setInfo({ ...info, name: v }),
      msgs, setMsgs, plans, plan: plans[sel], updatePlan, generate, refine, loading, notice,
      sel, setSel, people, isSample, loadPeople, pi, setPi, person, setPreviewPhoto,
      certPlans, certPlan: certPlans[certSel], updateCertPlan, certSel, setCertSel,
      certRecipients, isCertSample, loadCertRecipients, certPi, setCertPi, certRecipient,
      generateCertificates, refineCert, setSignatories,
    }}>
      {children}
    </C.Provider>
  );
}