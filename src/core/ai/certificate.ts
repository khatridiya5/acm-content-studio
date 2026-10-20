// Procedural fallback certificate templates based on Certificate tech themes.
import { DesignPlan, EventInfo } from '@/types';
import { CERTIFICATE_SIZE } from '@/lib/constants';

export interface ThemeDefinition {
  id: string;
  name: string;
  font: string;
  keywords: string[];
  L: [string, string, string, string, string]; // [bg, ink, a, b, ln]
  D: [string, string, string, string, string]; // [bg, ink, a, b, ln]
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    name: 'Default / Academic',
    font: 'Georgia, serif',
    keywords: ['default', 'academic', 'classic', 'formal', 'prestige', 'honor', 'award', 'general'],
    L: ['#fbfaf6', '#111827', '#1e3a8a', '#4a76a8', '#cbd5e1'],
    D: ['#0b1220', '#e5e7eb', '#7dd3fc', '#38bdf8', '#334155'],
  },
  {
    id: 'ai',
    name: 'AI / ML',
    font: 'Helvetica, Arial, sans-serif',
    keywords: ['ai', 'ml', 'machine learning', 'neural', 'deep learning', 'vision', 'llm', 'intelligence', 'bot'],
    L: ['#f7f6ff', '#1b1633', '#6d28d9', '#a78bfa', '#ddd6fe'],
    D: ['#120d2b', '#ede9fe', '#c4b5fd', '#8b5cf6', '#3b2f73'],
  },
  {
    id: 'cyber',
    name: 'Cybersecurity',
    font: 'Helvetica, Arial, sans-serif',
    keywords: ['cyber', 'security', 'ctf', 'infosec', 'crypto', 'cryptography', 'hack', 'defense', 'soc', 'network'],
    L: ['#f3f6f4', '#0f1a14', '#0b7a43', '#34d399', '#c5d8cd'],
    D: ['#050d09', '#d1fae5', '#22c55e', '#16a34a', '#14532d'],
  },
  {
    id: 'web',
    name: 'Web Dev',
    font: 'Helvetica, Arial, sans-serif',
    keywords: ['web', 'frontend', 'backend', 'fullstack', 'html', 'css', 'javascript', 'react', 'node', 'app', 'coding'],
    L: ['#fffaf7', '#1a1423', '#c2380f', '#264de4', '#ecd9d0'],
    D: ['#14101f', '#f5efe9', '#ff7a45', '#6b8cff', '#3a2f55'],
  },
  {
    id: 'data',
    name: 'Data Science',
    font: 'Georgia, serif',
    keywords: ['data', 'analytics', 'statistics', 'bi', 'big data', 'pandas', 'insights', 'analysis', 'kaggle'],
    L: ['#f4f8fb', '#0b2239', '#0e7490', '#f59e0b', '#cfe0ea'],
    D: ['#08202b', '#e0f2fe', '#22d3ee', '#fbbf24', '#1e4a5c'],
  },
  {
    id: 'cloud',
    name: 'Cloud / DevOps',
    font: 'Helvetica, Arial, sans-serif',
    keywords: ['cloud', 'devops', 'aws', 'docker', 'kubernetes', 'infra', 'azure', 'gcp', 'serverless', 'ci/cd', 'deploy'],
    L: ['#f4f9fd', '#10243a', '#0369a1', '#f97316', '#cfe0f2'],
    D: ['#08192b', '#e6f1ff', '#38bdf8', '#fb923c', '#1f3a5f'],
  },
  {
    id: 'opensource',
    name: 'Open Source',
    font: 'Courier New, monospace',
    keywords: ['open source', 'git', 'github', 'foss', 'community', 'contribution', 'repo', 'prs', 'hacktober'],
    L: ['#f6f6f3', '#1c1c1a', '#1a7f37', '#8250df', '#d0d7de'],
    D: ['#0d1117', '#e6edf3', '#3fb950', '#a371f7', '#30363d'],
  },
  {
    id: 'minimal',
    name: 'Minimal (Black & White)',
    font: 'Helvetica, Arial, sans-serif',
    keywords: ['minimal', 'clean', 'simple', 'white', 'black', 'bw', 'monochrome', 'black & white'],
    L: ['#ffffff', '#000000', '#111111', '#444444', '#e5e7eb'],
    D: ['#09090b', '#ffffff', '#f4f4f5', '#a1a1aa', '#27272a'],
  },
];

const R = (i: number) => Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;

function renderDecor(themeId: string, p: { a: string; b: string; ln: string; bg: string; ink: string }): string {
  if (themeId === 'ai') {
    const pts = [
      [30,40],[110,70],[60,130],[150,150],[20,200],[110,230],[1040,30],[1090,90],[980,60],
      [1000,560],[1080,600],[1040,660],[960,640],[1090,720],[990,730],[30,600],[110,640],[60,720],[150,700]
    ];
    let lines = '';
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
        if (dx * dx + dy * dy < 22500) {
          lines += `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}" stroke="${p.a}" stroke-width="1"/>`;
        }
      }
    }
    const circles = pts.map(pt => `<circle cx="${pt[0]}" cy="${pt[1]}" r="5" fill="${p.a}"/>`).join('');
    return `<g opacity="0.32">${lines}${circles}</g>`;
  }

  if (themeId === 'cyber') {
    let binL = '', binR = '';
    for (let row = 0; row < 48; row++) {
      const y = 35 + row * 15.5;
      const bitsL = Array.from({ length: 6 }, (_, col) => (R(row * 10 + col) > 0.5 ? '1' : '0')).join('');
      const bitsR = Array.from({ length: 6 }, (_, col) => (R(row * 10 + col + 500) > 0.5 ? '1' : '0')).join('');
      binL += `<text x="24" y="${y}" font-family="Courier New, monospace" font-size="11" fill="${p.a}">${bitsL}</text>`;
      binR += `<text x="1055" y="${y}" font-family="Courier New, monospace" font-size="11" fill="${p.a}">${bitsR}</text>`;
    }
    return `<g opacity="0.16">${binL}${binR}</g>`;
  }

  if (themeId === 'web') {
    return `<text x="1040" y="140" font-family="Courier New, monospace" font-size="200" font-weight="700" fill="${p.a}" opacity="0.07" text-anchor="middle">&lt;/&gt;</text>
    <text x="80" y="730" font-family="Courier New, monospace" font-size="200" font-weight="700" fill="${p.b}" opacity="0.08" text-anchor="middle">{ }</text>`;
  }

  if (themeId === 'data') {
    const bars = Array.from({ length: 38 }, (_, i) => {
      const h = Math.round(30 + R(i) * 110);
      const x = Math.round(20 + i * 29);
      const color = i % 3 ? p.a : p.b;
      return `<rect x="${x}" y="${794 - h}" width="14" height="${h}" fill="${color}"/>`;
    }).join('');
    return `<g opacity="0.13">${bars}</g>`;
  }

  if (themeId === 'cloud') {
    return `<g opacity="0.09">
      <g transform="translate(800, 30)">
        <rect x="0" y="80" width="260" height="60" rx="30" fill="${p.a}"/>
        <circle cx="85" cy="85" r="45" fill="${p.a}"/>
        <circle cx="160" cy="75" r="60" fill="${p.a}"/>
      </g>
      <g transform="translate(80, 560) scale(0.7)">
        <rect x="0" y="80" width="260" height="60" rx="30" fill="${p.b}"/>
        <circle cx="85" cy="85" r="45" fill="${p.b}"/>
        <circle cx="160" cy="75" r="60" fill="${p.b}"/>
      </g>
    </g>`;
  }

  if (themeId === 'opensource') {
    const commits = [120, 260, 420, 560, 690].map(
      y => `<circle cx="28" cy="${y}" r="6" fill="${p.bg}" stroke="${p.a}" stroke-width="2.5"/>`
    ).join('');
    return `<g opacity="0.45">
      <path d="M28 0 V794" stroke="${p.a}" stroke-width="3" fill="none"/>
      <path d="M28 260 C28 290 64 280 64 310 V370 C64 400 28 390 28 420" stroke="${p.b}" stroke-width="3" fill="none"/>
      ${commits}
      <circle cx="64" cy="340" r="6" fill="${p.bg}" stroke="${p.b}" stroke-width="2.5"/>
    </g>`;
  }

  if (themeId === 'minimal') {
    return `<g opacity="0.14">
      <circle cx="561.5" cy="397" r="320" fill="none" stroke="${p.a}" stroke-width="0.8" stroke-dasharray="6,6"/>
      <circle cx="561.5" cy="397" r="340" fill="none" stroke="${p.b}" stroke-width="0.5"/>
      <circle cx="561.5" cy="397" r="180" fill="none" stroke="${p.a}" stroke-width="0.4" stroke-dasharray="2,8"/>
    </g>`;
  }

  return '';
}

/**
 * Detect matching theme from prompt and event details.
 */
function resolveTheme(userPrompt: string, info: EventInfo): ThemeDefinition {
  const text = `${userPrompt} ${info.name || ''} ${info.tagline || ''}`.toLowerCase();
  for (const t of THEMES) {
    if (t.id === 'default') continue;
    if (t.keywords.some(k => text.includes(k))) {
      return t;
    }
  }
  return THEMES[0]; // Default / Academic
}

/**
 * Procedural A4 Landscape Certificate Generator.
 * Creates 5 distinct print-ready vector SVG certificate variations based on Certificate tech themes:
 * 1. Classic Ivory (Light, formal double border, centered layout, dual signatories + center QR)
 * 2. Editorial White (Light, modern left vertical accent bar, stacked logos, bottom-left signatories, bottom-right QR)
 * 3. Night Slate (Dark, top & bottom accent borders, horizontal dividing lines, clean wide layout)
 * 4. Geometric Blue (Light, sharp angled corner polygon accents, diamond dividers, top-right QR)
 * 5. Blueprint (Dark, technical 40px grid background, circular certified seal, tech dividers, bottom signatories)
 */
export function makeCertificatePlans(userPrompt: string = '', info: EventInfo = {}): DesignPlan[] {
  const theme = resolveTheme(userPrompt, info);

  // Palettes
  const pL = { bg: theme.L[0], ink: theme.L[1], a: theme.L[2], b: theme.L[3], ln: theme.L[4] };
  const pD = { bg: theme.D[0], ink: theme.D[1], a: theme.D[2], b: theme.D[3], ln: theme.D[4] };

  // Common SVG Header Wrapper
  const wrapSvg = (bg: string, inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="297mm" height="210mm" viewBox="0 0 1123 794">
  <rect width="1123" height="794" fill="${bg}"/>
  ${inner}
</svg>`;

  // 1. Classic Ivory (Light)
  const inner1 = `${renderDecor(theme.id, pL)}
  <rect x="38" y="38" width="1047" height="718" fill="none" stroke="${pL.a}" stroke-width="2"/>
  <rect x="49" y="49" width="1025" height="696" fill="none" stroke="${pL.a}" stroke-width="1" opacity="0.55"/>
  <image x="90" y="76" width="76" height="76" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
  <image x="957" y="76" width="76" height="76" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
  <text x="561.5" y="112" font-family="'IBM Plex Mono', monospace" font-size="22" font-weight="600" text-anchor="middle" fill="${pL.a}">&lt;/&gt;</text>
  <text x="561.5" y="138" font-family="${theme.font}" font-size="14" font-weight="700" letter-spacing="3" text-anchor="middle" fill="${pL.ink}" opacity="0.85">ACM STUDENT CHAPTER • SVNIT SURAT</text>
  <!-- Two-line certificate heading hierarchy -->
  <text x="561.5" y="198" font-family="${theme.font}" font-size="44" font-weight="700" letter-spacing="5" text-anchor="middle" fill="${pL.ink}">{{certificate_heading}}</text>
  <text x="561.5" y="226" font-family="${theme.font}" font-size="18" font-weight="700" letter-spacing="4" text-anchor="middle" fill="${pL.a}">{{certificate_subheading}}</text>
  <text x="561.5" y="260" font-family="${theme.font}" font-size="14" font-style="italic" text-anchor="middle" fill="${pL.ink}" opacity="0.8">{{presentation_text}}</text>
  <!-- Recipient name with reduced, refined font size -->
  <text x="561.5" y="328" font-family="${theme.font}" font-size="50" font-weight="700" text-anchor="middle" fill="${pL.ink}" data-maxw="850">{{name}}</text>
  <line x1="448" y1="352" x2="674" y2="352" stroke="${pL.a}" stroke-width="2"/>
  <text x="561.5" y="398" font-family="${theme.font}" font-size="16" text-anchor="middle" fill="${pL.ink}" opacity="0.9" data-maxw="820">{{citation}}</text>
  <text x="561.5" y="432" font-family="${theme.font}" font-size="13" text-anchor="middle" fill="${pL.ink}" opacity="0.75">Issued on: {{date}}</text>
  <!-- Left Signatory (Centered) -->
  <image x="215" y="598" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_1}}"/>
  <line x1="159" y1="660" x2="371" y2="660" stroke="${pL.ink}" stroke-width="1.2" opacity="0.6"/>
  <text x="265" y="682" font-family="${theme.font}" font-size="16" font-weight="700" text-anchor="middle" fill="${pL.ink}">{{signatory_1}}</text>
  <text x="265" y="702" font-family="${theme.font}" font-size="13" text-anchor="middle" fill="${pL.ink}" opacity="0.75">{{signatory_1_title}}</text>
  <!-- Center QR -->
  <image x="531" y="618" width="60" height="60" preserveAspectRatio="xMidYMid meet" xlink:href="{{qr}}"/>
  <text x="561.5" y="702" font-family="'IBM Plex Mono', monospace" font-size="10" text-anchor="middle" fill="${pL.ink}" opacity="0.75">SECURELY VERIFIED</text>
  <!-- Right Signatory (Centered) -->
  <image x="808" y="598" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_2}}"/>
  <line x1="752" y1="660" x2="964" y2="660" stroke="${pL.ink}" stroke-width="1.2" opacity="0.6"/>
  <text x="858" y="682" font-family="${theme.font}" font-size="16" font-weight="700" text-anchor="middle" fill="${pL.ink}">{{signatory_2}}</text>
  <text x="858" y="702" font-family="${theme.font}" font-size="13" text-anchor="middle" fill="${pL.ink}" opacity="0.75">{{signatory_2_title}}</text>`;

  // 2. Editorial White (Light)
  const inner2 = `${renderDecor(theme.id, pL)}
  <rect x="0" y="0" width="30" height="794" fill="${pL.a}"/>
  <image x="113" y="64" width="68" height="68" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
  <image x="200" y="64" width="68" height="68" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
  <text x="1020" y="80" font-family="'IBM Plex Mono', monospace" font-size="12" text-anchor="end" fill="${pL.ink}" opacity="0.7">ACM OFFICIAL CREDENTIAL</text>
  <text x="113" y="180" font-family="${theme.font}" font-size="14" font-weight="700" letter-spacing="2" fill="${pL.a}">ACM STUDENT CHAPTER • SVNIT</text>
  <!-- Two-line certificate heading hierarchy -->
  <text x="113" y="235" font-family="${theme.font}" font-size="46" font-weight="700" letter-spacing="4" fill="${pL.ink}">{{certificate_heading}}</text>
  <text x="113" y="265" font-family="${theme.font}" font-size="18" font-weight="700" letter-spacing="3" fill="${pL.a}">{{certificate_subheading}}</text>
  <text x="113" y="300" font-family="${theme.font}" font-size="14" font-weight="600" fill="${pL.ink}" opacity="0.8">{{presentation_text}}</text>
  <!-- Recipient name with reduced, refined font size -->
  <text x="113" y="365" font-family="${theme.font}" font-size="52" font-weight="700" fill="${pL.ink}" data-maxw="850">{{name}}</text>
  <rect x="113" y="388" width="226" height="3" fill="${pL.a}"/>
  <text x="113" y="430" font-family="${theme.font}" font-size="16" fill="${pL.ink}" opacity="0.92" data-maxw="850">{{citation}}</text>
  <text x="113" y="462" font-family="${theme.font}" font-size="13" fill="${pL.ink}" opacity="0.75">Issue Date: {{date}}</text>
  <!-- Signatories: Signatures strictly centered over their respective lines -->
  <image x="169" y="598" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_1}}"/>
  <line x1="113" y1="662" x2="325" y2="662" stroke="${pL.ink}" stroke-width="1.2" opacity="0.6"/>
  <text x="219" y="684" text-anchor="middle" font-family="${theme.font}" font-size="16" font-weight="700" fill="${pL.ink}">{{signatory_1}}</text>
  <text x="219" y="704" text-anchor="middle" font-family="${theme.font}" font-size="13" fill="${pL.ink}" opacity="0.75">{{signatory_1_title}}</text>
  <image x="452" y="598" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_2}}"/>
  <line x1="396" y1="662" x2="608" y2="662" stroke="${pL.ink}" stroke-width="1.2" opacity="0.6"/>
  <text x="502" y="684" text-anchor="middle" font-family="${theme.font}" font-size="16" font-weight="700" fill="${pL.ink}">{{signatory_2}}</text>
  <text x="502" y="704" text-anchor="middle" font-family="${theme.font}" font-size="13" fill="${pL.ink}" opacity="0.75">{{signatory_2_title}}</text>
  <!-- Right QR -->
  <image x="930" y="620" width="84" height="84" preserveAspectRatio="xMidYMid meet" xlink:href="{{qr}}"/>
  <text x="972" y="722" font-family="'IBM Plex Mono', monospace" font-size="10" text-anchor="middle" fill="${pL.ink}" opacity="0.75">Scan to verify</text>`;

  // 3. Night Slate (Dark)
  const inner3 = `${renderDecor(theme.id, pD)}
  <rect x="0" y="0" width="1123" height="6" fill="${pD.a}"/>
  <rect x="0" y="788" width="1123" height="6" fill="${pD.a}"/>
  <image x="90" y="56" width="72" height="72" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
  <image x="965" y="56" width="72" height="72" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
  <text x="561.5" y="98" font-family="${theme.font}" font-size="14" font-weight="700" letter-spacing="3" text-anchor="middle" fill="${pD.a}">ACM NIT SURAT STUDENT CHAPTER</text>
  <line x1="90" y1="156" x2="1033" y2="156" stroke="${pD.ln}" stroke-width="1"/>
  <!-- Two-line certificate heading hierarchy -->
  <text x="561.5" y="225" font-family="${theme.font}" font-size="44" font-weight="700" letter-spacing="5" text-anchor="middle" fill="${pD.ink}">{{certificate_heading}}</text>
  <text x="561.5" y="254" font-family="'IBM Plex Mono', monospace" font-size="18" font-weight="700" letter-spacing="3" text-anchor="middle" fill="${pD.a}">{{certificate_subheading}}</text>
  <text x="561.5" y="288" font-family="${theme.font}" font-size="14" font-weight="600" letter-spacing="2" text-anchor="middle" fill="${pD.ink}" opacity="0.8">{{presentation_text}}</text>
  <!-- Recipient name with reduced, refined font size -->
  <text x="561.5" y="355" font-family="${theme.font}" font-size="52" font-weight="700" text-anchor="middle" fill="${pD.ink}" data-maxw="850">{{name}}</text>
  <text x="561.5" y="410" font-family="${theme.font}" font-size="16" text-anchor="middle" fill="${pD.ink}" opacity="0.9" data-maxw="820">{{citation}}</text>
  <text x="561.5" y="448" font-family="'IBM Plex Mono', monospace" font-size="13" text-anchor="middle" fill="${pD.a}">&gt;&gt; ISSUED: {{date}} &lt;&lt;</text>
  <line x1="90" y1="590" x2="1033" y2="590" stroke="${pD.ln}" stroke-width="1"/>
  <!-- Left Signatory (Centered) -->
  <image x="215" y="602" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_1}}"/>
  <line x1="159" y1="665" x2="371" y2="665" stroke="${pD.ln}" stroke-width="1.2"/>
  <text x="265" y="688" font-family="${theme.font}" font-size="16" font-weight="700" text-anchor="middle" fill="${pD.ink}">{{signatory_1}}</text>
  <text x="265" y="708" font-family="${theme.font}" font-size="13" text-anchor="middle" fill="${pD.ink}" opacity="0.75">{{signatory_1_title}}</text>
  <!-- Center QR -->
  <image x="531" y="618" width="60" height="60" preserveAspectRatio="xMidYMid meet" xlink:href="{{qr}}"/>
  <text x="561.5" y="698" font-family="'IBM Plex Mono', monospace" font-size="10" text-anchor="middle" fill="${pD.a}">DIGITALLY VERIFIED</text>
  <!-- Right Signatory (Centered) -->
  <image x="808" y="602" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_2}}"/>
  <line x1="752" y1="665" x2="964" y2="665" stroke="${pD.ln}" stroke-width="1.2"/>
  <text x="858" y="688" font-family="${theme.font}" font-size="16" font-weight="700" text-anchor="middle" fill="${pD.ink}">{{signatory_2}}</text>
  <text x="858" y="708" font-family="${theme.font}" font-size="13" text-anchor="middle" fill="${pD.ink}" opacity="0.75">{{signatory_2_title}}</text>`;

  // 4. Geometric Blue (Light)
  const inner4 = `${renderDecor(theme.id, pL)}
  <!-- 4 Corner Geometrics -->
  <polygon points="0,0 190,0 0,190" fill="${pL.b}"/>
  <polygon points="0,0 125,0 0,125" fill="${pL.a}"/>
  <polygon points="1123,0 933,0 1123,190" fill="${pL.b}"/>
  <polygon points="1123,0 998,0 1123,125" fill="${pL.a}"/>
  <polygon points="0,794 0,604 190,794" fill="${pL.b}"/>
  <polygon points="0,794 0,669 125,794" fill="${pL.a}"/>
  <polygon points="1123,794 1123,604 933,794" fill="${pL.b}"/>
  <polygon points="1123,794 1123,669 998,794" fill="${pL.a}"/>
  <!-- Centered Logos with Divider -->
  <image x="470" y="36" width="76" height="76" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
  <line x1="561.5" y1="36" x2="561.5" y2="112" stroke="${pL.a}" stroke-width="2"/>
  <image x="577" y="36" width="76" height="76" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
  <!-- Two-line certificate heading hierarchy -->
  <text x="561.5" y="195" font-family="${theme.font}" font-size="50" font-weight="800" letter-spacing="4" text-anchor="middle" fill="${pL.a}">{{certificate_heading}}</text>
  <text x="561.5" y="226" font-family="${theme.font}" font-size="20" font-weight="700" letter-spacing="3" text-anchor="middle" fill="${pL.ink}">{{certificate_subheading}}</text>
  <text x="561.5" y="260" font-family="${theme.font}" font-size="15" text-anchor="middle" fill="${pL.ink}" opacity="0.8">{{presentation_text}}</text>
  <!-- Recipient name with reduced, refined font size -->
  <text x="561.5" y="328" font-family="${theme.font}" font-size="50" font-weight="700" text-anchor="middle" fill="${pL.a}" data-maxw="850">{{name}}</text>
  <!-- Diamond Divider -->
  <rect x="556.5" y="350" width="10" height="10" transform="rotate(45 561.5 355)" fill="${pL.a}"/>
  <line x1="261" y1="355" x2="546" y2="355" stroke="${pL.a}" stroke-width="1.5"/>
  <line x1="577" y1="355" x2="862" y2="355" stroke="${pL.a}" stroke-width="1.5"/>
  <text x="561.5" y="394" font-family="${theme.font}" font-size="16" text-anchor="middle" fill="${pL.ink}" data-maxw="820">{{citation}}</text>
  <text x="561.5" y="428" font-family="${theme.font}" font-size="13" text-anchor="middle" fill="${pL.ink}" opacity="0.75">Presented on: {{date}}</text>
  <!-- Top Right QR -->
  <image x="975" y="210" width="84" height="84" preserveAspectRatio="xMidYMid meet" xlink:href="{{qr}}"/>
  <!-- Bottom Signatories (Centered) -->
  <image x="215" y="602" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_1}}"/>
  <line x1="160" y1="665" x2="370" y2="665" stroke="${pL.ink}" stroke-width="1.2"/>
  <text x="265" y="688" font-family="${theme.font}" font-size="16" font-weight="700" text-anchor="middle" fill="${pL.ink}">{{signatory_1}}</text>
  <text x="265" y="708" font-family="${theme.font}" font-size="13" text-anchor="middle" fill="${pL.ink}" opacity="0.75">{{signatory_1_title}}</text>
  <image x="808" y="602" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_2}}"/>
  <line x1="753" y1="665" x2="963" y2="665" stroke="${pL.ink}" stroke-width="1.2"/>
  <text x="858" y="688" font-family="${theme.font}" font-size="16" font-weight="700" text-anchor="middle" fill="${pL.ink}">{{signatory_2}}</text>
  <text x="858" y="708" font-family="${theme.font}" font-size="13" text-anchor="middle" fill="${pL.ink}" opacity="0.75">{{signatory_2_title}}</text>`;

  // 5. Blueprint (Dark)
  const inner5 = `
  <defs>
    <pattern id="bpGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${pD.ln}" stroke-width="1" opacity="0.35"/>
    </pattern>
  </defs>
  <rect width="1123" height="794" fill="url(#bpGrid)"/>
  ${renderDecor(theme.id, pD)}
  <rect x="34" y="34" width="1055" height="726" fill="none" stroke="${pD.a}" stroke-width="1" opacity="0.45"/>
  <image x="90" y="70" width="68" height="68" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/acm_logo.png"/>
  <image x="175" y="70" width="68" height="68" preserveAspectRatio="xMidYMid meet" xlink:href="/brand/svnit_logo.jpg"/>
  <!-- Certified Crest -->
  <circle cx="980" cy="110" r="54" fill="none" stroke="${pD.a}" stroke-width="1.2"/>
  <circle cx="980" cy="110" r="44" fill="none" stroke="${pD.a}" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="980" y="108" font-family="'IBM Plex Mono', monospace" font-size="18" font-weight="700" text-anchor="middle" fill="${pD.a}">&lt;/&gt;</text>
  <text x="980" y="126" font-family="'IBM Plex Mono', monospace" font-size="8" font-weight="700" letter-spacing="1.5" text-anchor="middle" fill="${pD.a}">CERTIFIED</text>
  <text x="90" y="195" font-family="${theme.font}" font-size="14" font-weight="700" letter-spacing="2" fill="${pD.a}">ACM NIT SURAT STUDENT CHAPTER</text>
  <!-- Two-line certificate heading hierarchy -->
  <text x="90" y="240" font-family="${theme.font}" font-size="46" font-weight="700" letter-spacing="3" fill="${pD.ink}">{{certificate_heading}}</text>
  <text x="90" y="270" font-family="'IBM Plex Mono', monospace" font-size="18" font-weight="700" letter-spacing="2" fill="${pD.a}">{{certificate_subheading}}</text>
  <text x="90" y="305" font-family="${theme.font}" font-size="14" font-weight="600" fill="${pD.ink}" opacity="0.8">{{presentation_text}}</text>
  <!-- Recipient name with reduced, refined font size -->
  <text x="90" y="370" font-family="${theme.font}" font-size="52" font-weight="700" fill="${pD.ink}" data-maxw="850">{{name}}</text>
  <rect x="90" y="390" width="8" height="8" fill="${pD.a}"/>
  <line x1="98" y1="394" x2="850" y2="394" stroke="${pD.a}" stroke-width="1.5" opacity="0.6"/>
  <text x="90" y="435" font-family="${theme.font}" font-size="16" fill="${pD.ink}" opacity="0.92" data-maxw="850">{{citation}}</text>
  <text x="90" y="470" font-family="${theme.font}" font-size="13" fill="${pD.ink}" opacity="0.75">Event Date: {{date}}</text>
  <!-- Signatories: Signatures strictly centered over their respective lines -->
  <image x="146" y="598" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_1}}"/>
  <line x1="90" y1="662" x2="302" y2="662" stroke="${pD.ink}" stroke-width="1.2" opacity="0.6"/>
  <text x="196" y="684" text-anchor="middle" font-family="${theme.font}" font-size="16" font-weight="700" fill="${pD.ink}">{{signatory_1}}</text>
  <text x="196" y="704" text-anchor="middle" font-family="${theme.font}" font-size="13" fill="${pD.ink}" opacity="0.75">{{signatory_1_title}}</text>
  <image x="426" y="598" width="100" height="54" preserveAspectRatio="xMidYMid meet" xlink:href="{{signature_2}}"/>
  <line x1="370" y1="662" x2="582" y2="662" stroke="${pD.ink}" stroke-width="1.2" opacity="0.6"/>
  <text x="476" y="684" text-anchor="middle" font-family="${theme.font}" font-size="16" font-weight="700" fill="${pD.ink}">{{signatory_2}}</text>
  <text x="476" y="704" text-anchor="middle" font-family="${theme.font}" font-size="13" fill="${pD.ink}" opacity="0.75">{{signatory_2_title}}</text>
  <image x="955" y="618" width="80" height="80" preserveAspectRatio="xMidYMid meet" xlink:href="{{qr}}"/>
  <text x="995" y="718" font-family="'IBM Plex Mono', monospace" font-size="10" text-anchor="middle" fill="${pD.ink}" opacity="0.75">SCAN TO VERIFY</text>`;

  const designs = [
    { style: `Classic Ivory (${theme.name})`, font: theme.font, svg: wrapSvg(pL.bg, inner1) },
    { style: `Editorial White (${theme.name})`, font: theme.font, svg: wrapSvg(pL.bg, inner2) },
    { style: `Night Slate (${theme.name})`, font: theme.font, svg: wrapSvg(pD.bg, inner3) },
    { style: `Geometric Blue (${theme.name})`, font: theme.font, svg: wrapSvg(pL.bg, inner4) },
    { style: `Blueprint (${theme.name})`, font: theme.font, svg: wrapSvg(pD.bg, inner5) },
  ];

  return designs.map((d) => ({
    style: d.style,
    font: d.font,
    size: CERTIFICATE_SIZE,
    elements: [],
    svg: d.svg,
    docType: 'certificate',
  }));
}
