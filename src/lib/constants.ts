import { Person, Role } from '@/types';

export const CARD_SIZE = { w: 54, h: 86 }; // mm

export const ROLE_COLORS: Record<Role, string> = {
  participant: '#00b4d8',
  organizer: '#ff6b35',
  mentor: '#7bd389',
  volunteer: '#c77dff',
};

// Sample people for testing. Replace with CSV rows later.
export const SAMPLE_PEOPLE: Person[] = [
  { name: 'Aarav Mehta', role: 'participant', id: 'HK-001' },
  { name: 'Diya Khatri', role: 'organizer', id: 'OR-014' },
  { name: 'Dr. Priyanka Venkataraghavan', role: 'mentor', id: 'MN-007' },
  { name: 'Rohan Shah', role: 'volunteer', id: 'VL-022' },
];

// Keywords in the request pick a theme (mock AI). Gemini will replace this later.
export const THEMES = [
  { k: ['horro', 'spooky', 'scary', 'halloween', 'haunt', 'dark'], bg: ['#0a0a0a', '#5c0000'], ink: '#f2f2f2', line: '#ff1a1a', font: 'Georgia, serif' },
  { k: ['retro', '80', 'arcade', 'neon', 'cyber', 'gaming', 'game'], bg: ['#1a0033', '#ff00aa'], ink: '#ffffff', line: '#00fff2', font: 'Courier New, monospace' },
  { k: ['minimal', 'clean', 'simple', 'white'], bg: ['#ffffff', '#ecebe5'], ink: '#111111', line: '#111111', font: 'Helvetica, Arial, sans-serif' },
  { k: ['nature', 'green', 'eco', 'forest'], bg: ['#0f3d2e', '#2f7d5b'], ink: '#ffffff', line: '#d9f99d', font: 'Georgia, serif' },
  { k: ['festive', 'warm', 'diwali', 'orange'], bg: ['#7a1f00', '#ff8a00'], ink: '#fff7e0', line: '#ffe08a', font: 'Georgia, serif' },
  { k: ['corporate', 'professional', 'formal', 'blue'], bg: ['#0b1d3a', '#1d4e89'], ink: '#ffffff', line: '#f5b700', font: 'Helvetica, Arial, sans-serif' },
];
