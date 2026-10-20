import { CertificateRecipient, FieldKey, Person, Role, Signatory } from '@/types';

export const CARD_SIZE = { w: 54, h: 86 }; // mm (CR80 portrait)
export const CERTIFICATE_SIZE = { w: 297, h: 210 }; // mm (A4 landscape)
export const FONTS = ['Helvetica, Arial, sans-serif', 'Georgia, serif', 'Courier New, monospace'] as const;
// Dummy link until the real ACM attendance page exists.
export const QR_BASE = process.env.NEXT_PUBLIC_ATTENDANCE_URL ?? 'https://example.com/attendance';

export const ROLE_COLORS: Record<Role, string> = {
  participant: '#00b4d8',
  organizer: '#ff6b35',
  mentor: '#7bd389',
  volunteer: '#c77dff',
  executive: '#f59e0b',
};

export const FIELD_OPTIONS: { key: FieldKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'roll', label: 'Roll no' },
  { key: 'department', label: 'Department' },
  { key: 'year', label: 'Year' },
  { key: 'team', label: 'Team Name (Participants only)' },
  { key: 'photo', label: 'Photo' },
  { key: 'qr', label: 'QR code' },
];

export const DEFAULT_SIGNATORIES: Signatory[] = [
  { name: 'Dr. Faculty Advisor', title: 'Faculty Sponsor, ACM SVNIT', signatureImage: null },
  { name: 'Chapter Chairperson', title: 'Chairperson, ACM SVNIT', signatureImage: null },
];

export const CERTIFICATE_THEMES = [
  { id: 'default', name: 'Default / Academic', keywords: ['default', 'academic', 'classic', 'formal', 'prestige'] },
  { id: 'ai', name: 'AI / ML', keywords: ['ai', 'ml', 'machine learning', 'neural', 'deep learning', 'vision', 'llm'] },
  { id: 'cyber', name: 'Cybersecurity', keywords: ['cyber', 'security', 'ctf', 'infosec', 'crypto', 'cryptography', 'hack'] },
  { id: 'web', name: 'Web Dev', keywords: ['web', 'frontend', 'backend', 'fullstack', 'html', 'css', 'javascript', 'react'] },
  { id: 'data', name: 'Data Science', keywords: ['data', 'analytics', 'statistics', 'bi', 'big data', 'pandas'] },
  { id: 'cloud', name: 'Cloud / DevOps', keywords: ['cloud', 'devops', 'aws', 'docker', 'kubernetes', 'infra', 'azure', 'gcp'] },
  { id: 'opensource', name: 'Open Source', keywords: ['open source', 'git', 'github', 'foss', 'community', 'contribution'] },
  { id: 'minimal', name: 'Minimal (Black & White)', keywords: ['minimal', 'clean', 'simple', 'white', 'black', 'bw', 'monochrome', 'black & white'] },
];

export const SAMPLE_CERTIFICATE_RECIPIENTS: CertificateRecipient[] = [
  { name: 'Alex Johnson', certificateRole: '1st Place Winner', team: 'Binary Beasts', roll_no: 'U23CS001', department: 'Computer Science' },
  { name: 'Priya Sharma', certificateRole: 'Runner Up', team: 'AlgoRhythms', roll_no: 'U23EC014', department: 'Electronics' },
  { name: 'Rahul Verma', certificateRole: 'Participant', team: 'CodeCrafters', roll_no: 'U23AI022', department: 'Artificial Intelligence' },
  { name: 'Sneha Patel', certificateRole: 'Organizing Lead', roll_no: 'U22CS050', department: 'Computer Science' },
];

// TEST DATA ONLY. Shown until a real CSV is uploaded.
export const SAMPLE_PEOPLE: Person[] = [
  { name: 'Sample Participant', role: 'participant', id: 'U00XX001', department: 'Computer Science', year: '2', photo: '/people/img_3.jpg', team: 'Binary Beasts' },
  { name: 'Sample Organizer', role: 'organizer', id: 'U00XX002', department: 'Electronics', year: '3', photo: '/people/img_3.jpg' },
  { name: 'Dr. Sample Mentor With A Very Long Name', role: 'mentor', id: 'U00XX003', department: 'Artificial Intelligence', year: '-', photo: '/people/img_3.jpg' },
  { name: 'Sample Volunteer', role: 'volunteer', id: 'U00XX004', department: 'Mechanical', year: '1', photo: '/people/img_3.jpg' },
];

export interface Theme {
  id: string;
  name: string;
  k: string[];
  bg: [string, string];
  ink: string;
  line: string;
  font: string;
}

export const THEMES: Theme[] = [
  { id: 'default', name: 'Default / Academic', k: ['default', 'academic', 'classic', 'formal', 'prestige', 'corporate', 'blue'], bg: ['#0b1d3a', '#1d4e89'], ink: '#ffffff', line: '#f5b700', font: 'Helvetica, Arial, sans-serif' },
  { id: 'ai', name: 'AI / ML', k: ['ai', 'ml', 'machine learning', 'neural', 'deep learning', 'vision', 'llm', 'intelligence', 'brain'], bg: ['#0f0c29', '#302b63'], ink: '#ffffff', line: '#818cf8', font: 'Helvetica, Arial, sans-serif' },
  { id: 'cyber', name: 'Cybersecurity', k: ['cyber', 'security', 'cybersecurity', 'cyberpunk', 'neon', 'ctf', 'infosec', 'crypto', 'hack'], bg: ['#0d0221', '#19002e'], ink: '#ffffff', line: '#00f0ff', font: 'Courier New, monospace' },
  { id: 'web', name: 'Web Dev', k: ['web', 'web dev', 'frontend', 'backend', 'fullstack', 'html', 'css', 'javascript', 'react', 'code', 'editor', 'dev', 'vscode'], bg: ['#1e1e1e', '#252526'], ink: '#d4d4d4', line: '#007acc', font: 'Courier New, monospace' },
  { id: 'data', name: 'Data Science', k: ['data', 'data science', 'analytics', 'statistics', 'bi', 'big data', 'pandas', 'insights', 'kaggle'], bg: ['#08202b', '#1e4a5c'], ink: '#ffffff', line: '#22d3ee', font: 'Georgia, serif' },
  { id: 'cloud', name: 'Cloud / DevOps', k: ['cloud', 'devops', 'aws', 'docker', 'kubernetes', 'infra', 'azure', 'gcp', 'serverless', 'ci/cd', 'deploy'], bg: ['#08192b', '#1f3a5f'], ink: '#ffffff', line: '#38bdf8', font: 'Helvetica, Arial, sans-serif' },
  { id: 'opensource', name: 'Open Source', k: ['open source', 'opensource', 'git', 'github', 'foss', 'community', 'contribution', 'terminal', 'cli', 'bash', 'shell'], bg: ['#0d1117', '#161b22'], ink: '#3fb950', line: '#2ea043', font: 'Courier New, monospace' },
  { id: 'minimal', name: 'Minimal & clean', k: ['minimal', 'clean', 'simple', 'white'], bg: ['#ffffff', '#ecebe5'], ink: '#111111', line: '#111111', font: 'Helvetica, Arial, sans-serif' },
];