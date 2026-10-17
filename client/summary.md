# ACM Content Studio - Comprehensive Architecture & Blueprint

## 1. Project Overview
**ACM Content Studio** is a Next.js (App Router, React 19, Tailwind CSS v4) application built for the **ACM SVNIT Student Chapter**.
It is an automated event badge and ID card creation studio:
- Organizers describe events in natural language or choose preset themes.
- AI (Gemini 2.5 Flash via `@google/generative-ai` with structured JSON output, backed by procedural mock fallbacks) generates vector-based design specifications (`DesignPlan`).
- Organizers upload participant CSVs and photo batches (matched by roll number), with automatic QR code generation.
- Organizers can preview, refine with text prompts, or interactively tweak cards on a live drag-and-drop canvas.
- Badges export to vector SVG, high-DPI PNGs (150/300/600), or print-ready multi-card PDF sheets (A4/A3 with crop marks via Puppeteer).

---

## 2. Directory Structure & Key Files

```
acm-content-studio/client/
├── docs/
│   └── design-plan-format.md      # Design plan format specifications
├── public/brand/                  # Official ACM and SVNIT logos
├── scripts/
│   └── make-logos.mjs             # Converts logos to base64 data URIs in src/core/brand/logos.ts
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── studio/
│   │   │   ├── layout.tsx         # Studio layout with StudioProvider & Stepper
│   │   │   ├── page.tsx           # Step 1: Describe event (chat intake & missing questions)
│   │   │   ├── drafts/page.tsx    # Step 2: Pick draft, prompt refiner & CardEditor
│   │   │   ├── people/page.tsx    # Step 3: Attendees (CSV & photo upload)
│   │   │   └── export/page.tsx    # Step 4: Validate design & export panel
│   │   └── api/
│   │       ├── intake/route.ts    # Extracts event details via Gemini / regex heuristics
│   │       ├── recipes/route.ts   # Generates 3 card design recipes (Gemini or mock fallback)
│   │       ├── refine/route.ts    # Applies prompt instructions to update an existing plan
│   │       ├── export/route.ts    # Headless Puppeteer server endpoint for multi-page vector PDF
│   │       └── upload/route.ts    # Placeholder endpoint for file upload handlers
│   ├── components/
│   │   ├── Stepper.tsx            # 4-stage wizard breadcrumb navigation
│   │   ├── CardEditor.tsx         # Interactive canvas editor (drag, scale, align, undo)
│   │   ├── CardPreview.tsx        # DangerouslySetInnerHTML SVG card renderer wrapper
│   │   ├── CsvUpload.tsx          # CSV reader & photo matcher (PapaParse + canvas compression)
│   │   ├── DraftPicker.tsx        # 3-column selectable draft gallery
│   │   ├── ExportPanel.tsx        # Basic SVG / PNG download buttons
│   │   ├── PersonList.tsx         # Contains export dropdowns & batch export trigger
│   │   ├── PromptBox.tsx          # Alternative prompt & event input form
│   │   └── QuestionForm.tsx       # Placeholder TODO for intake question rendering
│   ├── core/
│   │   ├── ai/
│   │   │   ├── gemini.ts          # Google Generative AI integration (models, structured output)
│   │   │   ├── intake.ts          # Rule-based interview question engine (missing(), mergeInfo())
│   │   │   ├── mock.ts            # Thematic procedural badge generator (6 themes × 3 layouts)
│   │   │   └── prompts.ts         # System prompts, JSON schema definitions & design constraints
│   │   ├── brand/
│   │   │   └── logos.ts           # Auto-generated base64 PNG data-URIs for ACM & SVNIT logos
│   │   ├── data/
│   │   │   ├── csv.ts             # CSV parser, column alias normalizer, data validator
│   │   │   └── qr.ts              # QR code matrix calculator for synchronous SVG generation
│   │   ├── engine/
│   │   │   ├── elements.ts        # Element definitions
│   │   │   ├── fit.ts             # Dynamic text shrinkage and truncation calculation
│   │   │   └── render.ts          # Core vector SVG string renderer for badges
│   │   ├── exporter/
│   │   │   ├── pdf.ts             # Client fetch wrapper to /api/export
│   │   │   ├── png.ts             # Canvas rasterizer for 150/300/600 DPI PNG downloads
│   │   │   ├── sheet.ts           # HTML imposition builder for A4/A3 sheets with crop marks
│   │   │   └── svg.ts             # Client-side blob download utility
│   │   └── validator/
│   │       ├── bounds.ts          # Card boundary & overlap collision detector
│   │       ├── check.ts           # Aggregated validator (bounds + contrast)
│   │       ├── contrast.ts        # WCAG luminance & color contrast validator
│   │       └── schema.ts          # Zod schema definitions for DesignPlan and Element
│   ├── lib/
│   │   ├── constants.ts           # Dimensions (54×86mm), role colors, sample people, themes
│   │   └── StudioContext.tsx      # React Context holding global studio state with sessionStorage
│   └── types/
│       └── index.ts               # Core TypeScript definitions (Role, Person, EventInfo, Element, DesignPlan)
```

---

## 3. Site Map & Studio Workflow

```mermaid
graph TD
    A["/ (Home Page)"] -->|Open studio| B["/studio (Step 1: Describe)"]
    B -->|Generate drafts| C["/studio/drafts (Step 2: Pick a draft)"]
    C -->|Continue| D["/studio/people (Step 3: Attendees)"]
    D -->|Continue to export| E["/studio/export (Step 4: Export)"]
```

1. **Step 1 (`/studio`)**: User interacts with chat intake. Questions fill missing info (`name`, `date`, `venue`, `tagline`, `fields`, `hasPhotos`). Triggers `/api/recipes`.
2. **Step 2 (`/studio/drafts`)**: Visualizes 3 generated design plans. User can edit with natural language (`/api/refine`) or directly drag/scale/realign on the card canvas (`CardEditor`).
3. **Step 3 (`/studio/people`)**: Organizers upload CSV with attendee details and photo files named by roll number. Falls back to `SAMPLE_PEOPLE`.
4. **Step 4 (`/studio/export`)**: Validates card bounds and WCAG contrast. Exports single cards or batches to PDF (A4/A3 sheets with crop marks via Puppeteer), PNG, or SVG.

---

## 4. Key Implementation Rules & Data Contracts
- **Card Size**: Standard CR80 badge format: `54mm × 86mm`. All coordinates in millimeters with origin at top-left.
- **Strict Data Integrity**: Badge engine never invents names, numbers, or details. Text comes exclusively from data slots.
- **State Persistence**: `StudioContext` persists working drafts and attendee lists into `sessionStorage` (`studio2`).
- **Known Quirks**:
  - `src/components/PersonList.tsx` currently contains the full export selector interface, while `src/components/ExportPanel.tsx` is a smaller component.
  - `src/core/engine/elements.ts` and `docs/design-plan-format.md` are empty files.

---

## 5. Project Changelog & Recent Updates
- **[SVG-Native CardEditor Type Safety & Mask Synchronization]**: Refactored [src/components/CardEditor.tsx](file:///e:/Incursion/acm-content-studio/client/src/components/CardEditor.tsx) to ensure 100% type safety with `DesignPlan` state updates via `updatePlanWithSvg`. Implemented synchronized clip-path movement and scaling so masked elements (like attendee photos with circle or rect `clip-path`) maintain alignment with their clipping boundaries when dragged, resized, or aligned. Added `onPointerCancel` and `onLostPointerCapture` handlers to ensure reliable gesture handling.
- **[Public Brand Logos Integration (ACM & SVNIT)]**: Configured the SVG prompt and fallback templates in `src/core/ai/gemini.ts` to include both official brand assets from `public/brand/` (`/brand/acm_logo.png` and `/brand/svnit_logo.jpg`), ensuring both square logos appear cleanly without overlap and render directly in the browser SVG draft previews.
- **[Raw SVG Generation & Dynamic Field Placeholders]**: Upgraded `src/core/ai/gemini.ts` to generate single, self-contained raw SVG badges directly using the CairoSVG-compatible SVG prompt template (54×86mm portrait, clipPaths, Arial/Helvetica fonts, and prominent `__LOGO__` diamond placement). Placeholders are generated dynamically from active user-selected fields (`info.fields`, including `{{name}}`, `{{position}}`, `{{roll_no}}`, `{{department}}`, `{{year}}`, `{{photo}}`, `{{qr}}`). Drafts are generated in parallel with 3 style variations and default fallback templates, integrated into `DraftPicker`, `CardPreview`, and `CardEditor` without requiring a hydration layer.
- **[Inlined Prompt Construction in Gemini Service]**: Embedded prompt creation logic directly inside local `prompt` variables within `src/core/ai/gemini.ts` (`generatePlans`, `refinePlan`, and `extractIntake`), eliminating the dependency on `src/core/ai/prompts.ts`. The `generatePlans` function compiles event details, slots, design rules, and styles into a unified prompt variable, validating outputs and returning 3 preview drafts with automated fallback to default mock templates.
- **[Centralized Gemini Fallback, Recipes Route Delegation & Structured Logging]**: Refactored `generatePlans` in `src/core/ai/gemini.ts` to directly handle falling back to default mock templates (`makePlans`) with detailed server console warnings when Gemini fails or returns 0 valid designs. Simplified `POST /api/recipes` (`src/app/api/recipes/route.ts`) to call `generatePlans` directly, adding structured server console logs for request intake, generation status, plan counts, and fallback notices.
- **[API Generation Cycle with Default Templates]**: Configured the end-to-end draft creation cycle. Clicking "Generate drafts" sends `{ prompt, info }` to `POST /api/recipes`, which returns the 3 default draft plans (`makePlans`), populates `StudioContext`, and navigates to the `/studio/drafts` page with loading feedback on the button.
- **[Workflow Reordering: Steps 2 & 3 Swapped]**: Reordered the studio flow so clicking "Generate drafts" navigates directly to `/studio/drafts` (Step 2), followed by `/studio/people` (Step 3), and finally `/studio/export` (Step 4). Updated Stepper labels, router navigation buttons, and step indicators.
- **[Documentation & Ground Rules Initialized]**: Established strict agent operating rules, comprehensive architecture blueprint, directory mapping, and workflow specification.

