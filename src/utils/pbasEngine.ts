/**
 * PBAS / CAS dossier engine.
 *
 * Organises a faculty member's claims into Sections A–G, numbers every
 * annexure, paginates from the supplied page counts and totals the claimed
 * self-appraisal score. Scoring caps and the qualifying minimum come only
 * from the institution's scheme as entered; no scheme is assumed.
 */

import { parseDate } from './calendarEngine';

export type ClaimSectionKey = 'B' | 'C' | 'D' | 'E' | 'F';

export interface PbasInput {
  name: string;
  designation: string;
  department: string;
  institution: string;
  joiningDate: string;
  payLevel: string;
  applyingFor: string;
  periodFrom: string;
  periodTo: string;
  scheme: string;
  /** Section A evidence: document | pages, one per line */
  appointment: string;
  promotionHistory: string;
  /** date | activity | details | claimed points | evidence document | pages */
  sections: Record<ClaimSectionKey, string>;
  /** B = 100, C = 120 ... from the approved scheme (optional) */
  caps: string;
  minimumScore: string;
  frontMatterPages: string;
}

export const CLAIM_SECTIONS: { key: ClaimSectionKey; title: string; focus: string; evidenceHint: string }[] = [
  { key: 'B', title: 'Teaching & Pedagogical Innovations', focus: 'Courses handled, results, student feedback, digital TLM created', evidenceHint: 'Timetable / result sheet / feedback analysis / TLM link' },
  { key: 'C', title: 'Research & Intellectual Output', focus: 'Journal papers, funded projects, patents, consultancy', evidenceHint: 'First page of paper with ISSN/DOI and indexing proof; sanction letter; patent certificate' },
  { key: 'D', title: 'Professional Development & Certifications', focus: 'FDPs/NPTEL attended or delivered, memberships', evidenceHint: 'Certificate / invitation letter / membership card' },
  { key: 'E', title: 'Institutional Governance & Contribution', focus: 'NBA/NAAC coordination, convener and committee roles — each backed by an Office Order', evidenceHint: 'Signed Office Order (Block 1) with reference number' },
  { key: 'F', title: 'Extension & Industry Outreach', focus: 'NSS/NCC, community work, club mentoring, industry MoUs', evidenceHint: 'Office Order / event report / MoU copy' }
];

interface Claim {
  section: ClaimSectionKey;
  date: string;
  activity: string;
  details: string;
  points: number | null;
  evidence: string;
  pages: number | null;
  annexure: string;
  flags: string[];
}

export interface PbasResult {
  markdown: string;
  totals: { key: string; title: string; claims: number; claimed: number; cap: number | null; counted: number; flags: number }[];
  grandTotal: number;
  minimum: number | null;
  flagCount: number;
  missingCount: number;
}

function rows(text: string): string[][] {
  return (text || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('|').map(c => c.trim()));
}

function num(s: string | undefined): number | null {
  const t = (s || '').trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function cell(v: string | number): string {
  return String(v).replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ').trim() || '—';
}

function table(headers: string[], body: (string | number)[][]): string {
  const line = (r: (string | number)[]) => `| ${r.map(cell).join(' | ')} |`;
  return [line(headers), `|${headers.map(() => '---').join('|')}|`, ...body.map(line)].join('\n');
}

/** First date found in a free-text date field, e.g. "12-08-2026 to 16-08-2026". */
function firstDate(raw: string): Date | null {
  const m = (raw || '').match(/\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{1,2}[-\s][A-Za-z]{3,9}[-\s,]+\d{4}/);
  return m ? parseDate(m[0]) : null;
}

const OFFICE_ORDER_RE = /(office\s*order|\bo\.\s*o\.|\border\s*no|\bref(?:erence)?\.?\s*no)/i;
const INDEXING_RE = /\b(issn|isbn|doi|scopus|ugc[-\s]?care|web of science|wos|sci|indexed)\b/i;

export function buildPbasDossier(input: PbasInput): PbasResult {
  const missing: string[] = [];
  const questions: string[] = [];
  const from = parseDate(input.periodFrom);
  const to = parseDate(input.periodTo);

  ([
    ['name', 'Faculty name'], ['designation', 'Current designation'], ['department', 'Department'],
    ['applyingFor', 'Promotion / stage applied for'], ['scheme', 'Applicable PBAS/CAS scheme or regulation reference']
  ] as [keyof PbasInput, string][]).forEach(([k, label]) => { if (!String(input[k] || '').trim()) missing.push(label); });
  if (!from || !to) missing.push('Assessment period (from and to dates)');
  else if (to <= from) missing.push('Assessment period end must be after its start');

  const caps = new Map<string, number>();
  for (const part of (input.caps || '').split(/[\n,;]+/)) {
    const m = part.match(/^\s*([A-G])\s*[=:]\s*(\d+(?:\.\d+)?)\s*$/i);
    if (m) caps.set(m[1].toUpperCase(), Number(m[2]));
  }
  const minimum = num(input.minimumScore);
  if (!caps.size) questions.push('What are the section-wise maximum scores in the applicable scheme? Without them the claimed totals are shown uncapped.');
  if (minimum === null) questions.push('What minimum score does the scheme require for the stage applied for?');

  // Section A evidence
  const annexures: { id: string; title: string; section: string; pages: number | null }[] = [];
  const sectionA = rows(input.appointment).map(([doc = '', pages = ''], i) => {
    const id = `A-${i + 1}`;
    annexures.push({ id, title: doc, section: 'A', pages: num(pages) });
    return [id, doc, pages || 'Not stated'];
  });
  if (!sectionA.length) missing.push('Section A evidence: appointment order and pay-fixation documents');

  // Claims
  const claims: Claim[] = [];
  const seen = new Map<string, string>();
  for (const sec of CLAIM_SECTIONS) {
    rows(input.sections[sec.key]).forEach(([date = '', activity = '', details = '', pts = '', evidence = '', pages = ''], i) => {
      const annexure = `${sec.key}-${i + 1}`;
      const flags: string[] = [];
      const d = firstDate(date);
      const points = num(pts);
      const ay = date.match(/(\d{4})\s*[-/]\s*(\d{2})\b/g);
      if (!date) flags.push('date missing');
      else if (d) {
        if (from && to && (d < from || d > to)) flags.push('outside the assessment period');
      } else if (ay) {
        // Academic years (2024-25): outside only when no year of the span touches the period.
        const years = ay.map(t => Number(t.slice(0, 4)));
        const first = Math.min(...years);
        const last = Math.max(...years) + 1;
        if (from && to && (last < from.getFullYear() || first > to.getFullYear())) flags.push('outside the assessment period');
      } else flags.push('date not readable');
      if (!activity) flags.push('activity missing');
      if (pts && points === null) flags.push('claimed points not a number');
      if (!pts) flags.push('no points claimed');
      if (!evidence) flags.push('no evidence document');
      if (!pages) flags.push('page count missing');
      if (sec.key === 'E' && !(OFFICE_ORDER_RE.test(evidence) && /\d/.test(evidence))) flags.push('governance role needs a signed Office Order with reference number');
      if (sec.key === 'C' && !INDEXING_RE.test(`${details} ${evidence}`)) flags.push('state ISSN/DOI and indexing (e.g. UGC-CARE/Scopus) for verification');
      const key = `${activity.toLowerCase()}|${details.toLowerCase()}`;
      if (activity && seen.has(key)) flags.push(`possible duplicate of ${seen.get(key)}`);
      else if (activity) seen.set(key, annexure);
      claims.push({ section: sec.key, date, activity, details, points, evidence, pages: num(pages), annexure, flags });
      annexures.push({ id: annexure, title: evidence || `[Evidence for ${activity || 'claim'}]`, section: sec.key, pages: num(pages) });
    });
  }

  // Totals
  const totals = CLAIM_SECTIONS.map(sec => {
    const list = claims.filter(c => c.section === sec.key);
    const eligible = list.filter(c => !c.flags.some(f => f.startsWith('outside')) && c.points !== null);
    const claimed = eligible.reduce((s, c) => s + (c.points ?? 0), 0);
    const cap = caps.get(sec.key) ?? null;
    return {
      key: sec.key, title: sec.title, claims: list.length, claimed,
      cap, counted: cap !== null ? Math.min(claimed, cap) : claimed,
      flags: list.reduce((s, c) => s + c.flags.length, 0)
    };
  });
  const grandTotal = totals.reduce((s, t) => s + t.counted, 0);
  const flagCount = totals.reduce((s, t) => s + t.flags, 0);

  // Pagination
  const front = num(input.frontMatterPages);
  const canPaginate = front !== null && annexures.every(a => a.pages !== null && a.pages > 0);
  let cursor = (front ?? 0) + 1;
  const annexureRows = annexures.map(a => {
    let range = 'To be generated after final assembly';
    if (canPaginate) {
      range = a.pages === 1 ? `p. ${cursor}` : `pp. ${cursor}–${cursor + a.pages! - 1}`;
      cursor += a.pages!;
    }
    return [a.id, a.title || 'Untitled', a.section, a.pages ?? 'Not stated', range];
  });
  if (!canPaginate) questions.push(front === null
    ? 'How many pages does the front matter (cover, index, forms) occupy? Page ranges are computed after this and every annexure page count are supplied.'
    : 'Some annexures have no page count, so page ranges cannot be computed yet.');

  const outside = claims.filter(c => c.flags.includes('outside the assessment period'));
  if (outside.length) questions.push(`${outside.map(c => c.annexure).join(', ')} ${outside.length === 1 ? 'falls' : 'fall'} outside the assessment period and ${outside.length === 1 ? 'is' : 'are'} excluded from the total. Should ${outside.length === 1 ? 'it' : 'they'} be removed or re-dated from the evidence?`);
  const noOrder = claims.filter(c => c.flags.some(f => f.startsWith('governance role')));
  if (noOrder.length) questions.push(`${noOrder.map(c => c.annexure).join(', ')}: can the signed Office Order (reference number and date) be obtained for each role?`);

  // Report
  const out: string[] = [];
  out.push('# PBAS / CAS SELF-APPRAISAL DOSSIER');
  out.push('DRAFT FOR REVIEW — claimed scores are self-assessed and subject to verification by the screening/selection committee. This draft does not certify eligibility.');
  out.push(table(['Field', 'Value'], [
    ['Name', input.name || 'Not supplied'],
    ['Designation / department', `${input.designation || 'Not supplied'} / ${input.department || 'Not supplied'}`],
    ['Institution', input.institution || 'Not supplied'],
    ['Date of joining', input.joiningDate ? (parseDate(input.joiningDate) ? input.joiningDate : `${input.joiningDate} (not a readable date)`) : 'Not supplied'],
    ['Present pay level', input.payLevel || 'Not supplied'],
    ['Applying for', input.applyingFor || 'Not supplied'],
    ['Assessment period', from && to ? `${input.periodFrom} to ${input.periodTo}` : 'Not supplied'],
    ['Scheme / regulation', input.scheme || 'Not supplied']
  ]));

  out.push('## Section A — Personal & Appointment Particulars');
  out.push(sectionA.length ? table(['Annexure', 'Document', 'Pages'], sectionA) : 'No appointment documents listed.');
  out.push(input.promotionHistory.trim() ? `Promotion history (as supplied): ${input.promotionHistory.trim().replace(/\n+/g, '; ')}.` : 'Promotion history not supplied.');

  for (const sec of CLAIM_SECTIONS) {
    const list = claims.filter(c => c.section === sec.key);
    out.push(`## Section ${sec.key} — ${sec.title}`);
    out.push(`Scope: ${sec.focus}. Evidence expected: ${sec.evidenceHint}.`);
    out.push(list.length
      ? table(['Annexure', 'Date', 'Activity', 'Details', 'Claimed', 'Evidence', 'Verification flag'],
        list.map(c => [c.annexure, c.date || '—', c.activity || '—', c.details || '—', c.points ?? '—', c.evidence || 'Not supplied', c.flags.join('; ') || 'None']))
      : 'No claims entered for this section.');
  }

  out.push('## Section G — Self-Appraisal Score & Annexure Index');
  out.push(table(['Section', 'Claims', 'Claimed (in period)', 'Scheme maximum', 'Counted', 'Flags'], [
    ...totals.map(t => [`${t.key}. ${t.title}`, t.claims, t.claimed, t.cap ?? 'Not supplied', t.counted, t.flags]),
    ['Total', claims.length, totals.reduce((s, t) => s + t.claimed, 0), caps.size ? [...caps.values()].reduce((a, b) => a + b, 0) : '—', grandTotal, flagCount]
  ]));
  if (minimum !== null) {
    out.push(grandTotal >= minimum
      ? `Counted self-appraisal score ${grandTotal} meets the stated minimum of ${minimum}, subject to verification of every flagged claim.`
      : `Counted self-appraisal score ${grandTotal} is ${minimum - grandTotal} below the stated minimum of ${minimum}.`);
  }
  if (!caps.size) out.push('Section maximums were not supplied, so claimed points are counted without caps.');
  out.push(table(['Annexure', 'Document', 'Section', 'Pages', 'Page range'], annexureRows));

  out.push('## Verification Checklist');
  out.push([
    '- Every claim has a dated, signed evidence document in the annexure it cites.',
    '- Every governance and extension role is backed by a numbered Office Order (Block 1).',
    '- Research entries show ISSN/ISBN/DOI and the indexing claimed.',
    '- No claim falls outside the assessment period or appears twice.',
    '- Page ranges are regenerated after any annexure is added or removed.'
  ].join('\n'));

  out.push('## Clarification Questions');
  out.push('These questions sit outside the formal dossier.');
  const all = [...(missing.length ? [`Please supply: ${missing.join('; ')}.`] : []), ...questions];
  out.push(all.length ? all.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'None.');

  return { markdown: out.join('\n\n'), totals, grandTotal, minimum, flagCount, missingCount: missing.length };
}

export function emptyPbasInput(): PbasInput {
  return {
    name: '', designation: '', department: '', institution: '', joiningDate: '', payLevel: '', applyingFor: '',
    periodFrom: '', periodTo: '', scheme: '', appointment: '', promotionHistory: '',
    sections: { B: '', C: '', D: '', E: '', F: '' }, caps: '', minimumScore: '', frontMatterPages: ''
  };
}

/** Training specimen: every person, order and score below is invented for practice. */
export function pbasTrainingSpecimen(): PbasInput {
  return {
    name: 'Demo Faculty (TRAINING SPECIMEN)',
    designation: 'Lecturer',
    department: 'Electronics & Communication',
    institution: 'TRAINING SPECIMEN — not an institutional record',
    joiningDate: '01-07-2021',
    payLevel: 'Level 10 (demo)',
    applyingFor: 'Senior Scale (demo)',
    periodFrom: '01-07-2021',
    periodTo: '30-06-2026',
    scheme: 'DEMO CAS scheme note v1 (training values)',
    appointment: 'DEMO Appointment order No. DEMO/EST/21/14 dated 25-06-2021 | 2\nDEMO Pay fixation statement | 1',
    promotionHistory: 'Appointed as Lecturer on 01-07-2021 (demo)',
    sections: {
      B: [
        '2021-22 to 2025-26 | Courses handled | Analog Electronics, Digital Electronics; average pass 86% (demo) | 40 | DEMO Timetables and result sheets | 6',
        '2025-26 | Student feedback | Mean 4.3/5 from 58 of 64 students (demo) | 10 | DEMO Feedback analysis 2025-26 | 2',
        '15-01-2024 | Digital TLM | 12 video lectures on the LMS (demo) | 10 | DEMO LMS course page printout | 3'
      ].join('\n'),
      C: [
        '10-03-2025 | Journal paper | "Low-power amplifier design" in Demo Journal, ISSN 0000-0000, UGC-CARE (demo) | 15 | DEMO Paper first page and indexing proof | 3',
        '05-09-2024 | Conference paper | Demo National Conference proceedings (demo) | 5 | DEMO Proceedings certificate | 1'
      ].join('\n'),
      D: [
        '12-08-2023 to 16-08-2023 | FDP attended | One-week FDP on outcome-based education (demo) | 5 | DEMO FDP certificate | 1',
        '20-11-2020 | NPTEL certification | Analog circuits, Elite (demo) | 5 | DEMO NPTEL certificate | 1'
      ].join('\n'),
      E: [
        '03-07-2023 | NBA criterion coordinator | Criterion 3 coordinator (demo) | 10 | DEMO Office Order No. DEMO/OO/23/41 dated 03-07-2023 | 1',
        '14-02-2024 | Exam committee member | Internal examination cell (demo) | 5 | Principal letter | 1'
      ].join('\n'),
      F: '22-09-2025 | Industry MoU facilitated | MoU with Demo Electronics Pvt Ltd (demo) | 5 | DEMO MoU copy | 4'
    },
    caps: 'B = 50, C = 40, D = 15, E = 20, F = 10',
    minimumScore: '100',
    frontMatterPages: '6'
  };
}
