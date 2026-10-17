import { FieldKey, Person, Role } from '@/types';

export const CARD_SIZE = { w: 54, h: 86 }; // mm
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
  { key: 'photo', label: 'Photo' },
  { key: 'qr', label: 'QR code' },
];

// TEST DATA ONLY. Shown until a real CSV is uploaded.
export const SAMPLE_PEOPLE: Person[] = [
  { name: 'Sample Participant', role: 'participant', id: 'U00XX001', department: 'Computer Science', year: '2', photo: '/people/img_3.jpg' },
  { name: 'Sample Organizer', role: 'organizer', id: 'U00XX002', department: 'Electronics', year: '3', photo: '/people/img_3.jpg' },
  { name: 'Dr. Sample Mentor With A Very Long Name', role: 'mentor', id: 'U00XX003', department: 'Artificial Intelligence', year: '-', photo: '/people/img_3.jpg' },
  { name: 'Sample Volunteer', role: 'volunteer', id: 'U00XX004', department: 'Mechanical', year: '1', photo: '/people/img_3.jpg' },
];

export const THEMES = [
  { k: ['horro', 'horror', 'spooky', 'scary', 'halloween', 'haunt', 'dark'], bg: ['#0a0a0a', '#5c0000'], ink: '#f2f2f2', line: '#ff1a1a', font: 'Georgia, serif' },
  { k: ['retro', '80', 'arcade', 'neon', 'cyber', 'gaming', 'game'], bg: ['#1a0033', '#ff00aa'], ink: '#ffffff', line: '#00fff2', font: 'Courier New, monospace' },
  { k: ['minimal', 'clean', 'simple', 'white'], bg: ['#ffffff', '#ecebe5'], ink: '#111111', line: '#111111', font: 'Helvetica, Arial, sans-serif' },
  { k: ['nature', 'green', 'eco', 'forest'], bg: ['#0f3d2e', '#2f7d5b'], ink: '#ffffff', line: '#d9f99d', font: 'Georgia, serif' },
  { k: ['festive', 'warm', 'diwali', 'orange'], bg: ['#7a1f00', '#ff8a00'], ink: '#fff7e0', line: '#ffe08a', font: 'Georgia, serif' },
  { k: ['corporate', 'professional', 'formal', 'blue'], bg: ['#0b1d3a', '#1d4e89'], ink: '#ffffff', line: '#f5b700', font: 'Helvetica, Arial, sans-serif' },
];