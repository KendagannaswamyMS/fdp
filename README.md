# Institutional Correspondence, Governance & Administration Suite

Faculty Development Programme (FDP) companion app for **JSS Polytechnic, Mysuru** — a live
facilitator cockpit for institutional drafting, meeting governance, accreditation reporting and
statutory AI prompting.

Built with React 19 + TypeScript + Vite + Tailwind. Entirely client-side: there is no backend and
no server-side data storage.

## What is inside

| Block | Contents |
|---|---|
| B1 | Official correspondence — circulars, notices, office orders |
| B2 | Meeting governance — rough notes to MoM, ATR registers |
| B3 | Reporting & compliance — 9-part event reports, NBA/NAAC criteria mapping |
| B4 | Planning & portfolios — term calendars, working-day arithmetic, PBAS/CAS |
| B5 | Digital administration, security & the **15-prompt AI Studio** |
| — | Faculty Profile Generator, Drafting Kit & Statutory Templates |

### The 15-prompt AI Studio

Every prompt renders a complete institutional document from the data you type. With a Google Gemini
API key the draft comes from Gemini; without one (or if the API is unreachable) the app falls back to
a built-in generator that parses the same input, so the studio always produces a usable document —
useful when the FDP hall has no internet.

The offline generator is genuinely input-driven: the calendar prompts (#7, #14) traverse real dates
and count actual Sundays and declared holidays; the audit prompts (#11, #15) run detectors over the
submitted text and report only the gaps actually present; the transcript prompt (#10) records
resolutions and flags hearsay and informal exchanges separately.

### API key handling

The Gemini API key is entered by each user in the browser and stored only in that browser's
`localStorage`. It is never committed, never sent anywhere except Google's Generative Language API,
and never leaves the user's machine otherwise. Do not hard-code a key into this repository.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes
`dist/` to GitHub Pages. The Vite `base` is `./` (relative), so the same build works at a repository
sub-path, at a domain root, or on any other static host.

## Letterhead branding

Header and footer letterhead banners uploaded in **B5 → AI Prompt Studio** are stored in
`localStorage` and applied consistently across the AI Studio and the Drafting Kit for both A4
print/PDF output and Word (`.doc`) export.
