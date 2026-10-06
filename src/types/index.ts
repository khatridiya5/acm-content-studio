export type Role = 'participant' | 'organizer' | 'mentor' | 'volunteer';

export interface Person {
  name: string;
  role: Role;
  id: string;
  photo?: string | null; // photo URL; missing -> initials circle
}

export type TextSlot = 'name' | 'role' | 'id' | 'event';
export type ImageSlot = 'photo' | 'logo_acm' | 'logo_svnit';

export type Element =
  | { type: 'rect'; x: number; y: number; w: number; h: number; rx?: number; fill: string }
  | { type: 'circle'; cx: number; cy: number; r: number; fill: string; opacity?: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string }
  | { type: 'text'; slot: TextSlot; x: number; y: number; size: number; maxW?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; fill: string }
  | { type: 'image'; slot: ImageSlot; x: number; y: number; w: number; h: number; shape?: 'circle' | 'rounded' }
  | { type: 'qr'; x: number; y: number; w: number; h: number; fill: string };

// The "design plan": what the AI writes and the engine draws. Sizes in mm.
export interface DesignPlan {
  style: string;
  font: string;
  size: { w: number; h: number };
  elements: Element[];
}
