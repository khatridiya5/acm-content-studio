export type Role = 'participant' | 'organizer' | 'mentor' | 'volunteer' | 'executive';
export type FieldKey = 'name' | 'role' | 'roll' | 'department' | 'year' | 'photo' | 'qr' | 'team';

export interface Person {
  name: string;
  role: Role;
  id: string; // roll number (the ID number is the same thing)
  department?: string;
  year?: string;
  photo?: string | null; // data URL; missing -> initials circle
  team?: string;
}

export interface Signatory {
  name: string;
  title: string;
  signatureImage?: string | null;
}

export interface CertificateRecipient {
  name: string;
  certificateRole: string; // Exact title (e.g. "1st Place", "Runner Up", "Participant", "Organizer")
  team?: string;
  roll_no?: string;
  department?: string;
}

// Only what the user told us. Anything undefined is still unknown and must be asked.
export interface EventInfo {
  name?: string;
  date?: string;
  venue?: string;
  tagline?: string | null; // null = user chose to skip
  fields?: FieldKey[];
  hasPhotos?: boolean;
  customPreviewPhoto?: boolean;
  previewPhoto?: string | null;
  signatories?: Signatory[];
}

export type TextSlot = 'name' | 'role' | 'id' | 'event' | 'department' | 'year' | 'date' | 'venue' | 'tagline' | 'team';
export type ImageSlot = 'photo' | 'logo_acm' | 'logo_svnit';

export type Element =
  | { type: 'rect'; x: number; y: number; w: number; h: number; rx?: number; fill: string; opacity?: number; stroke?: string; sw?: number }
  | { type: 'circle'; cx: number; cy: number; r: number; fill: string; opacity?: number; stroke?: string; sw?: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string }
  | { type: 'poly'; points: number[]; fill: string; opacity?: number }
  | { type: 'pattern'; kind: 'dots' | 'grid' | 'stripes' | 'diag'; x: number; y: number; w: number; h: number; color: string; gap?: number; opacity?: number }
  | { type: 'text'; slot: TextSlot; x: number; y: number; size: number; maxW?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; fill: string }
  | { type: 'image'; slot: ImageSlot; x: number; y: number; w: number; h: number; shape?: 'circle' | 'rounded' }
  | { type: 'qr'; x: number; y: number; w: number; h: number; fill: string };

export interface DesignPlan {
  style: string;
  font: string;
  size: { w: number; h: number }; // mm
  elements: Element[];
  svg?: string;
  docType?: 'badge' | 'certificate';
}

