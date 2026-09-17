/**
 * Lab 4 course-file engine.
 *
 * Turns the supplied course records into the six outputs (A–F) of the Lab 4
 * course-file prompt. Everything is deterministic and runs in the browser.
 * The engine never assumes a mapping scale, threshold, weight or rounding
 * rule: when an input the approved method needs is missing, it lists the
 * gap and emits a template instead of a number.
 */

export type ReportingStage = 'Before teaching' | 'Mid-semester' | 'Semester-end';
export type CourseFileTask =
  | 'Prepare an initial course file'
  | 'Review an existing file'
  | 'Update a semester-end file';

export type ItemStatus =
  | 'Available and checked'
  | 'Available but incomplete'
  | 'Not supplied'
  | 'Not yet due'
  | 'Not applicable';

export type ItemStatusChoice = 'auto' | ItemStatus;

export interface ItemEntry {
  /** One evidence record per line: title | date/version | page/sheet/section */
  evidence: string;
  status: ItemStatusChoice;
  /** Specific gap, or the supported reason when marked not applicable. */
  note: string;
}

export interface CourseDetails {
  institution: string;
  programme: string;
  academicYear: string;
  course: string;
  faculty: string;
  credits: string;
  syllabusVersion: string;
  stage: ReportingStage;
  policies: string;
  attainmentMethod: string;
  reviewer: string;
}

export interface CourseFileInput {
  task: CourseFileTask;
  details: CourseDetails;
  items: Record<number, ItemEntry>;
  /** CO | statement | Bloom level */
  cos: string;
  /** PO1 | statement */
  pos: string;
  /** level = meaning, one per line */
  mappingScale: string;
  /** CO | PO/PSO | level | justification | activity/assessment | approval status */
  mapping: string;
  /** Question ID | component | max marks | CO(s) | Bloom | optional (Y/N) | question text */
  questions: string;
  /** test = declared total marks, one per line (test = text before the first '-') */
  testTotals: string;
  optionalRule: '' | 'attempted-only' | 'all';
  /** CSV/TSV: first column student ref, remaining columns question IDs */
  marks: string;
  /** % of a CO's marks a student must reach */
  threshold: string;
  /** level >= % of students, one per line (optional) */
  levels: string;
  /** a global value, or CO = value lines */
  target: string;
  /** component = weight, e.g. CIE = 40 */
  componentWeights: string;
  absenceRule: '' | 'exclude' | 'not-met';
  /** CO | survey item | result on the same scale as direct | responses/denominator */
  indirect: string;
  directWeight: string;
  indirectWeight: string;
  rounding: string;
  /** CO | cause | confirmed/hypothesis | action | owner | deadline | follow-up | closure evidence */
  gapActions: string;
  plannedHours: string;
  deliveredHours: string;
  ledgerStudents: string;
  feedbackResponses: string;
  feedbackEnrolled: string;
}

export interface ItemDefinition {
  no: number;
  title: string;
  evidenceNeeded: string;
  /** Stage from which the record is normally expected to exist. */
  dueFrom: ReportingStage;
}

export const COURSE_FILE_STRUCTURE: ItemDefinition[] = [
  { no: 1, title: 'Cover page', evidenceNeeded: 'Completed cover page in the institutional format', dueFrom: 'Before teaching' },
  { no: 2, title: 'Contents index with page numbers', evidenceNeeded: 'Contents index generated after final pagination', dueFrom: 'Before teaching' },
  { no: 3, title: 'Vision and mission statements', evidenceNeeded: 'Approved institute and department vision/mission copy', dueFrom: 'Before teaching' },
  { no: 4, title: 'Programme Outcomes (POs) and Programme Specific Outcomes (PSOs)', evidenceNeeded: 'Approved PO/PSO statements', dueFrom: 'Before teaching' },
  { no: 5, title: 'Course Outcomes (COs) with Bloom’s taxonomy levels', evidenceNeeded: 'Approved CO statements with Bloom levels', dueFrom: 'Before teaching' },
  { no: 6, title: 'CO–PO/PSO mapping WITH justification', evidenceNeeded: 'Mapping table with scale definitions, justification and approval record', dueFrom: 'Before teaching' },
  { no: 7, title: 'Approved syllabus copy', evidenceNeeded: 'Syllabus copy matching the stated regulation version', dueFrom: 'Before teaching' },
  { no: 8, title: 'Session-wise lesson plan', evidenceNeeded: 'Lesson plan with sessions, topics, COs and hours', dueFrom: 'Before teaching' },
  { no: 9, title: 'Actual delivery log and deviation record', evidenceNeeded: 'Dated delivery log with deviations and recovery actions', dueFrom: 'Mid-semester' },
  { no: 10, title: 'Teaching–learning material (TLM)', evidenceNeeded: 'TLM list or copies referenced to sessions', dueFrom: 'Before teaching' },
  { no: 11, title: 'Assignment and tutorial sheets with rubrics', evidenceNeeded: 'Assignment/tutorial sheets with rubrics', dueFrom: 'Before teaching' },
  { no: 12, title: 'Continuous Internal Evaluation (CIE) papers WITH CO and Bloom’s taxonomy tagging', evidenceNeeded: 'CIE papers with per-question CO and Bloom tags and scheme of evaluation', dueFrom: 'Mid-semester' },
  { no: 13, title: 'Sample evaluated scripts representing high, middle and low performance, according to the institution’s selection method', evidenceNeeded: 'Anonymised sample scripts and the selection method used', dueFrom: 'Mid-semester' },
  { no: 14, title: 'Consolidated CIE and Semester-End Examination (SEE) marks ledger', evidenceNeeded: 'Verified CIE and SEE marks ledger', dueFrom: 'Semester-end' },
  { no: 15, title: 'Attendance ledger with consolidations', evidenceNeeded: 'Attendance ledger with sessions and denominators stated', dueFrom: 'Mid-semester' },
  { no: 16, title: 'Direct and indirect CO attainment calculation', evidenceNeeded: 'Question-level marks, approved method, targets and weights', dueFrom: 'Semester-end' },
  { no: 17, title: 'CO–PO gap analysis and corrective action', evidenceNeeded: 'Gap analysis against verified attainment, with actions and owners', dueFrom: 'Semester-end' },
  { no: 18, title: 'Course-end feedback survey and analysis', evidenceNeeded: 'Survey instrument, response count, denominator and analysis', dueFrom: 'Semester-end' }
];

const STAGE_ORDER: ReportingStage[] = ['Before teaching', 'Mid-semester', 'Semester-end'];

export function isDue(item: ItemDefinition, stage: ReportingStage): boolean {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(item.dueFrom);
}

export const PENDING_PAGE = 'To be generated after final assembly';

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function lines(text: string): string[] {
  return (text || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

function pipeRows(text: string): string[][] {
  return lines(text).map(l => l.split('|').map(c => c.trim()));
}

/** Makes a value safe to place inside a markdown table cell. */
function cell(value: string | number | undefined | null): string {
  const s = value === undefined || value === null ? '' : String(value);
  return s.replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ').trim() || '—';
}

function row(values: (string | number | undefined | null)[]): string {
  return `| ${values.map(cell).join(' | ')} |`;
}

function table(headers: string[], rows: (string | number | undefined | null)[][]): string {
  return [row(headers), `|${headers.map(() => '---').join('|')}|`, ...rows.map(row)].join('\n');
}

function normId(id: string): string {
  return id.replace(/\s+/g, '').toUpperCase();
}

function toNumber(s: string | undefined): number | null {
  if (s === undefined) return null;
  const t = s.trim().replace(/%$/, '');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function keyValues(text: string): { key: string; value: string }[] {
  return lines(text)
    .flatMap(l => l.split(/[,;](?![^()]*\))/))
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const m = part.match(/^(.+?)\s*(?:=|:|>=|≥)\s*(.+)$/);
      return m ? { key: m[1].trim(), value: m[2].trim() } : { key: '', value: part };
    });
}

export const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];

/** Returns 1–6 for "L3", "3", "Apply", "Applying", "Analyze"; null otherwise. */
export function bloomRank(tag: string): number | null {
  const t = (tag || '').trim().toLowerCase();
  if (!t) return null;
  const num = t.match(/^(?:l|k|bl)?\s*([1-6])\b/);
  if (num) return Number(num[1]);
  const stems = ['remember', 'understand', 'appl', 'analy', 'evaluat', 'creat'];
  const idx = stems.findIndex(s => t.includes(s));
  return idx >= 0 ? idx + 1 : null;
}

function bloomName(rank: number | null): string {
  return rank ? `L${rank} ${BLOOM_LEVELS[rank - 1]}` : 'Not tagged';
}

/** Opening verbs commonly associated with each level. Used only to prompt a human check. */
const OPENING_VERBS: Record<number, string[]> = {
  1: ['define', 'list', 'state', 'name', 'recall', 'identify', 'label', 'what'],
  2: ['explain', 'describe', 'discuss', 'summarise', 'summarize', 'classify', 'distinguish', 'illustrate'],
  3: ['apply', 'calculate', 'compute', 'solve', 'determine', 'find', 'implement', 'use', 'demonstrate', 'draw', 'write'],
  4: ['analyse', 'analyze', 'compare', 'examine', 'differentiate', 'debug', 'trace', 'infer'],
  5: ['evaluate', 'justify', 'assess', 'critique', 'recommend', 'select', 'defend'],
  6: ['design', 'develop', 'construct', 'formulate', 'propose', 'create', 'plan', 'compose']
};

function openingVerbRank(text: string): { verb: string; rank: number } | null {
  const first = (text || '').trim().toLowerCase().match(/^[a-z]+/);
  if (!first) return null;
  for (const [rank, verbs] of Object.entries(OPENING_VERBS)) {
    if (verbs.includes(first[0])) return { verb: first[0], rank: Number(rank) };
  }
  return null;
}

const GENERIC_JUSTIFICATION = /^(strongly|highly|moderately|slightly|partly|partially|directly)?\s*(related|relevant|mapped|linked|connected|correlated|applicable)\.?$/i;

function fmt(n: number, decimals: number | null): string {
  return decimals === null ? String(Math.round(n * 100) / 100) : n.toFixed(decimals);
}

function round(n: number, decimals: number | null): number {
  if (decimals === null) return n;
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

// ---------------------------------------------------------------------------
// Parsed model
// ---------------------------------------------------------------------------

interface CourseOutcome { id: string; statement: string; bloom: string; }
interface Outcome { id: string; statement: string; }
interface MappingRow { co: string; po: string; level: string; justification: string; activity: string; approval: string; }
interface Question { id: string; test: string; component: string; max: number | null; cos: string[]; bloom: string; optional: boolean; text: string; }

function parseCos(text: string): CourseOutcome[] {
  return pipeRows(text).map(([id, statement = '', bloom = '']) => ({ id: normId(id), statement, bloom }));
}

function parseOutcomes(text: string): Outcome[] {
  return pipeRows(text).map(([id, statement = '']) => ({ id: normId(id), statement }));
}

function parseMapping(text: string): MappingRow[] {
  return pipeRows(text).map(([co = '', po = '', level = '', justification = '', activity = '', approval = '']) => ({
    co: normId(co), po: normId(po), level, justification, activity, approval
  }));
}

function parseQuestions(text: string): Question[] {
  return pipeRows(text).map(([id = '', component = '', max = '', cos = '', bloom = '', optional = '', ...rest]) => ({
    id: id.trim(),
    test: id.includes('-') ? id.split('-')[0].trim() : id.trim(),
    component: component.trim().toUpperCase(),
    max: toNumber(max),
    cos: cos.split(/[,/\s]+/).map(normId).filter(Boolean),
    bloom,
    optional: /^(y|yes|opt|optional)$/i.test(optional.trim()),
    text: rest.join(' | ').trim()
  }));
}

interface MarksTable { questionIds: string[]; students: string[]; values: string[][]; }

function parseMarks(text: string): MarksTable | null {
  const rows = (text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (rows.length < 2) return null;
  const split = (l: string) => l.split(l.includes('\t') ? '\t' : ',').map(c => c.trim());
  const header = split(rows[0]);
  return {
    questionIds: header.slice(1),
    students: rows.slice(1).map(r => split(r)[0] || ''),
    values: rows.slice(1).map(r => split(r).slice(1))
  };
}

// ---------------------------------------------------------------------------
// Item 6 — CO–PO/PSO mapping review
// ---------------------------------------------------------------------------

interface Finding { text: string; }

function reviewMapping(input: CourseFileInput, cos: CourseOutcome[], pos: Outcome[]) {
  const findings: Finding[] = [];
  const rows = parseMapping(input.mapping);
  const scaleKeys = keyValues(input.mappingScale).map(kv => kv.key.toLowerCase()).filter(Boolean);
  const coIds = new Set(cos.map(c => c.id));
  const poIds = new Set(pos.map(p => p.id));

  if (!input.mappingScale.trim()) findings.push({ text: 'Mapping scale and level definitions not supplied; no mapping level can be verified.' });
  if (!rows.length) findings.push({ text: 'CO–PO/PSO mapping not supplied. A proposed mapping will be prepared only on request and labelled “For academic review and approval”.' });

  const tableRows = rows.map(r => {
    const issues: string[] = [];
    if (coIds.size && !coIds.has(r.co)) issues.push(`${r.co} is not in the supplied CO list`);
    if (poIds.size && !poIds.has(r.po)) issues.push(`${r.po} is not in the supplied PO/PSO list`);
    if (!r.level) issues.push('mapping level missing');
    else if (scaleKeys.length && !scaleKeys.includes(r.level.toLowerCase())) issues.push(`level “${r.level}” is not defined in the supplied scale`);
    if (!r.justification) issues.push('justification missing');
    else if (GENERIC_JUSTIFICATION.test(r.justification) || r.justification.split(/\s+/).length < 6) {
      issues.push('justification is generic; state how the CO and its assessment build the outcome');
    }
    if (!r.activity) issues.push('no supporting learning activity or assessment cited');
    if (issues.length) findings.push({ text: `${r.co}–${r.po}: ${issues.join('; ')}.` });
    return [r.co, r.po, r.level || 'Not supplied', r.justification || 'Not supplied', r.activity || 'Not supplied',
      r.approval || 'Approval status not stated', issues.length ? issues.join('; ') : 'No automated issue found; academic review still required'];
  });

  const unmapped = cos.filter(c => !rows.some(r => r.co === c.id)).map(c => c.id);
  if (rows.length && unmapped.length) findings.push({ text: `No mapping rows for ${unmapped.join(', ')}.` });

  return { findings, tableRows, rowCount: rows.length };
}

// ---------------------------------------------------------------------------
// Item 12 — CIE paper tagging review
// ---------------------------------------------------------------------------

function reviewCie(input: CourseFileInput, cos: CourseOutcome[]) {
  const findings: Finding[] = [];
  const all = parseQuestions(input.questions);
  const cie = all.filter(q => q.component.startsWith('CIE'));
  const coMap = new Map(cos.map(c => [c.id, c]));

  if (!cie.length) findings.push({ text: 'No CIE question list supplied; CO and Bloom tagging cannot be reviewed.' });

  const tableRows = cie.map(q => {
    const notes: string[] = [];
    const rank = bloomRank(q.bloom);
    let reason = q.bloom ? `Official tag preserved: ${bloomName(rank)}.` : 'No official Bloom tag supplied.';

    if (q.max === null) notes.push('marks not stated');
    if (!q.cos.length) notes.push('CO tag missing');
    for (const co of q.cos) if (coMap.size && !coMap.has(co)) notes.push(`${co} is not a supplied CO`);
    if (!q.bloom) notes.push('Bloom tag missing');
    else if (!rank) notes.push(`Bloom tag “${q.bloom}” not recognised`);

    if (rank) {
      for (const co of q.cos) {
        const coRank = bloomRank(coMap.get(co)?.bloom || '');
        if (coRank && rank > coRank) notes.push(`tagged demand (${bloomName(rank)}) exceeds ${co}’s stated level (${bloomName(coRank)})`);
      }
      const verb = openingVerbRank(q.text);
      if (verb && Math.abs(verb.rank - rank) >= 2) {
        reason += ` Opening verb “${verb.verb}” is usually associated with ${bloomName(verb.rank)}; reviewer to judge from the task students actually perform.`;
        notes.push('tag questionable — confirm against the task demand');
      } else if (q.text) {
        reason += ' Classification to be confirmed from the task students perform.';
      } else {
        reason += ' Question text not supplied, so cognitive demand cannot be checked.';
      }
    }
    if (notes.length) findings.push({ text: `${q.id}: ${notes.join('; ')}.` });
    return [q.id, q.max ?? 'Not stated', q.cos.join(', ') || 'Not tagged', q.bloom || 'Not tagged', reason,
      notes.length ? notes.join('; ') : 'No automated issue found'];
  });

  // Totals per test
  const declared = new Map(keyValues(input.testTotals).filter(kv => kv.key).map(kv => [kv.key.toUpperCase(), toNumber(kv.value)]));
  const tests = [...new Set(cie.map(q => q.test))];
  const totals = tests.map(test => {
    const qs = cie.filter(q => q.test === test);
    const sum = qs.reduce((s, q) => s + (q.max ?? 0), 0);
    const optional = qs.filter(q => q.optional);
    const optionalSum = optional.reduce((s, q) => s + (q.max ?? 0), 0);
    const compulsorySum = sum - optionalSum;
    const stated = declared.get(test.toUpperCase());
    let finding: string;
    let reconciles = false;
    if (stated === undefined || stated === null) finding = 'Declared total not supplied';
    else if (optionalSum > 0) {
      // Equal-mark optional questions reconcile when compulsory marks plus k of them equal the declared total.
      const each = optional[0].max ?? 0;
      const k = each > 0 ? (stated - compulsorySum) / each : NaN;
      if (optional.every(q => q.max === each) && Number.isInteger(k) && k >= 1 && k < optional.length) {
        reconciles = true;
        finding = `Reconciles if students answer ${k} of the ${optional.length} optional questions (${compulsorySum} compulsory + ${k} × ${each} = ${stated}); confirm this choice rule on the paper`;
      } else {
        finding = `Question marks sum to ${sum} including ${optionalSum} optional; cannot reconcile with the declared ${stated} — state the choice rule`;
      }
    } else if (sum !== stated) finding = `Mismatch: questions sum to ${sum}, declared total is ${stated}`;
    else {
      reconciles = true;
      finding = 'Question marks reconcile with the declared total';
    }
    if (!reconciles) findings.push({ text: `${test}: ${finding}.` });
    return [test, qs.length, sum, optionalSum || '—', stated ?? 'Not supplied', finding];
  });

  if (cie.some(q => q.optional) && !input.optionalRule) findings.push({ text: 'Optional questions are present but the rule for handling them is not supplied.' });

  const covered = new Set(cie.flatMap(q => q.cos));
  const uncovered = cos.filter(c => !covered.has(c.id)).map(c => c.id);
  if (cie.length && uncovered.length) {
    findings.push({ text: `No CIE question assesses ${uncovered.join(', ')}; confirm whether the approved scheme assesses these elsewhere.` });
  }

  return { findings, tableRows, totals, count: cie.length };
}

// ---------------------------------------------------------------------------
// Item 16 — CO attainment
// ---------------------------------------------------------------------------

export interface AttainmentResult {
  co: string;
  final: number | null;
  target: number | null;
  gap: number | null;
}

function computeAttainment(input: CourseFileInput, cos: CourseOutcome[]) {
  const missing: string[] = [];
  const questions = parseQuestions(input.questions);
  const marks = parseMarks(input.marks);
  const threshold = toNumber(input.threshold);
  const decimals = toNumber(input.rounding);
  const levels = keyValues(input.levels)
    .map(kv => ({ level: toNumber(kv.key), cutoff: toNumber(kv.value) }))
    .filter((l): l is { level: number; cutoff: number } => l.level !== null && l.cutoff !== null)
    .sort((a, b) => b.cutoff - a.cutoff);
  const unit = levels.length ? 'level' : '% of students';

  if (!cos.length) missing.push('Course Outcome list (item 5)');
  if (!questions.length) missing.push('CO-to-question mapping with maximum marks');
  if (questions.some(q => q.max === null)) missing.push('Maximum marks for every question');
  if (questions.some(q => !q.cos.length)) missing.push('CO tag for every question used in the calculation');
  if (!marks) missing.push('Question-level student marks (CSV/TSV with a header row)');
  if (threshold === null) missing.push('Student-level threshold (% of a CO’s marks)');
  if (questions.some(q => q.optional) && !input.optionalRule) missing.push('Rule for optional questions');
  if (!input.absenceRule) missing.push('Rule for absences (AB) and excluded students');
  if (decimals === null) missing.push('Rounding rule (number of decimal places)');

  const targetKv = keyValues(input.target);
  const globalTarget = targetKv.find(kv => !kv.key);
  const targetFor = (co: string): number | null => {
    const own = targetKv.find(kv => normId(kv.key) === co);
    return toNumber(own?.value ?? globalTarget?.value);
  };
  if (!input.target.trim()) missing.push('CO attainment targets');

  const components = [...new Set(questions.map(q => q.component).filter(Boolean))];
  if (questions.some(q => !q.component)) missing.push('Assessment component (e.g. CIE, SEE) for every question');
  const weightKv = keyValues(input.componentWeights);
  const rawWeights = new Map(weightKv.filter(kv => kv.key).map(kv => [kv.key.toUpperCase(), toNumber(kv.value)]));
  let weights: Map<string, number> | null = null;
  if (components.length > 1 || rawWeights.size) {
    const absent = components.filter(c => rawWeights.get(c) === undefined || rawWeights.get(c) === null);
    if (absent.length) missing.push(`Assessment component weights for ${absent.join(', ')}`);
    else {
      const sum = components.reduce((s, c) => s + (rawWeights.get(c) as number), 0);
      if (Math.abs(sum - 1) < 1e-9 || Math.abs(sum - 100) < 1e-9) {
        weights = new Map(components.map(c => [c, (rawWeights.get(c) as number) / sum]));
      } else {
        missing.push(`Component weights must total 1 or 100 (supplied total: ${sum})`);
      }
    }
  } else if (components.length === 1) {
    weights = new Map([[components[0], 1]]);
  }

  const wd = toNumber(input.directWeight);
  const wi = toNumber(input.indirectWeight);
  const indirectRows = pipeRows(input.indirect).map(([co = '', item = '', value = '', responses = '']) => ({
    co: normId(co), item, value: toNumber(value), responses
  }));
  if (!indirectRows.length) missing.push('Indirect assessment: survey items aligned to COs, scoring method and results');
  if (wd === null || wi === null) missing.push('Direct/indirect combination weights (if the approved method combines them)');
  else if (Math.abs(wd + wi - 1) > 1e-9 && Math.abs(wd + wi - 100) > 1e-9) missing.push(`Direct/indirect weights must total 1 or 100 (supplied: ${wd + wi})`);

  // Validate marks against the question table.
  const qById = new Map(questions.map(q => [q.id.toUpperCase(), q]));
  let dataProblems: string[] = [];
  if (marks) {
    const unknown = marks.questionIds.filter(id => !qById.has(id.toUpperCase()));
    if (unknown.length) dataProblems.push(`Marks columns without a question definition: ${unknown.join(', ')}`);
    const absentCols = questions.filter(q => !marks.questionIds.some(id => id.toUpperCase() === q.id.toUpperCase()));
    if (absentCols.length) dataProblems.push(`Questions without a marks column: ${absentCols.map(q => q.id).join(', ')}`);
    marks.values.forEach((vals, r) => {
      marks.questionIds.forEach((qid, c) => {
        const v = (vals[c] ?? '').trim();
        const q = qById.get(qid.toUpperCase());
        if (!q) return;
        if (/^ab$/i.test(v)) return;
        if (v === '') {
          if (!q.optional) dataProblems.push(`Blank mark for a compulsory question (student row ${r + 1}, ${qid})`);
          return;
        }
        const n = toNumber(v);
        if (n === null) dataProblems.push(`Non-numeric mark “${v}” (student row ${r + 1}, ${qid})`);
        else if (q.max !== null && (n < 0 || n > q.max)) dataProblems.push(`Mark ${n} outside 0–${q.max} (student row ${r + 1}, ${qid})`);
      });
    });
  }
  if (dataProblems.length > 8) dataProblems = [...dataProblems.slice(0, 8), `…and ${dataProblems.length - 8} more data problems`];

  const canCompute = missing.filter(m => !m.startsWith('Indirect') && !m.startsWith('Direct/indirect')).length === 0 && !dataProblems.length;

  const tableRows: (string | number)[][] = [];
  const results: AttainmentResult[] = [];
  const levelOf = (pct: number) => (levels.find(l => pct >= l.cutoff)?.level ?? 0);
  const levelText = levels.length ? `; level from supplied scale (${levels.map(l => `${l.level} ≥ ${l.cutoff}%`).join(', ')})` : '';

  if (canCompute && marks && threshold !== null && weights) {
    for (const co of cos) {
      const perComponent: { comp: string; value: number }[] = [];
      let blocked = '';
      for (const comp of components) {
        const qs = questions.filter(q => q.component === comp && q.cos.includes(co.id));
        if (!qs.length) {
          blocked = `${co.id} is not assessed in ${comp}; the approved method must state how to treat this`;
          continue;
        }
        let met = 0;
        let denom = 0;
        let excluded = 0;
        marks.values.forEach(vals => {
          let got = 0;
          let max = 0;
          let absentCount = 0;
          for (const q of qs) {
            const idx = marks.questionIds.findIndex(id => id.toUpperCase() === q.id.toUpperCase());
            const v = (vals[idx] ?? '').trim();
            if (/^ab$/i.test(v)) { absentCount++; continue; }
            if (v === '' && q.optional && input.optionalRule === 'attempted-only') continue;
            got += toNumber(v) ?? 0;
            max += q.max ?? 0;
          }
          if (absentCount === qs.length) {
            if (input.absenceRule === 'exclude') { excluded++; return; }
            denom++;
            return;
          }
          if (absentCount > 0) {
            // Partly absent: absent questions count as zero against their maximum.
            for (const q of qs) {
              const idx = marks.questionIds.findIndex(id => id.toUpperCase() === q.id.toUpperCase());
              if (/^ab$/i.test((vals[idx] ?? '').trim())) max += q.max ?? 0;
            }
          }
          denom++;
          if (max > 0 && (got / max) * 100 >= threshold) met++;
        });
        if (!denom) { blocked = `No eligible students for ${co.id} in ${comp}`; continue; }
        const pct = round((met / denom) * 100, decimals);
        const value = levels.length ? levelOf(pct) : pct;
        perComponent.push({ comp, value });
        tableRows.push([co.id, `${comp}: ${qs.map(q => q.id).join(', ')}`,
          `Students scoring ≥ ${threshold}% of ${co.id} marks ÷ eligible students${levelText}${excluded ? `; ${excluded} absent student(s) excluded` : ''}`,
          `${met} / ${denom}`, `${fmt(pct, decimals)}%${levels.length ? ` → level ${value}` : ''}`, '—', '—']);
      }

      let direct: number | null = null;
      if (!blocked) {
        direct = round(perComponent.reduce((s, p) => s + p.value * (weights!.get(p.comp) ?? 0), 0), decimals);
        if (components.length > 1) {
          tableRows.push([co.id, 'Direct (combined)', components.map(c => `${fmt(weights!.get(c)! * 100, 0)}% ${c}`).join(' + '),
            '—', `${fmt(direct, decimals)} (${unit})`, '—', '—']);
        }
      } else {
        tableRows.push([co.id, 'Direct', blocked, '—', 'Not calculated', '—', '—']);
      }

      const ind = indirectRows.find(r => r.co === co.id);
      let final: number | null = null;
      let finalLabel = 'Direct only';
      if (ind && ind.value !== null) {
        tableRows.push([co.id, `Indirect: ${ind.item || 'survey item not named'}`, 'Result as supplied on the approved scale',
          ind.responses ? `Responses ${ind.responses}` : 'Responses/denominator not stated', `${fmt(ind.value, decimals)} (${unit})`, '—', '—']);
      }
      if (direct !== null) {
        const weightsValid = wd !== null && wi !== null && (Math.abs(wd + wi - 1) < 1e-9 || Math.abs(wd + wi - 100) < 1e-9);
        if (weightsValid && ind && ind.value !== null) {
          const tot = wd! + wi!;
          final = round((wd! * direct + wi! * ind.value) / tot, decimals);
          finalLabel = `${fmt((wd! / tot) * 100, 0)}% direct + ${fmt((wi! / tot) * 100, 0)}% indirect`;
        } else if (wd === null && wi === null) {
          final = direct;
          finalLabel = 'Direct only (no combination weights supplied)';
        } else {
          finalLabel = 'Final not calculated: indirect result or weights incomplete';
        }
      }
      const target = targetFor(co.id);
      const gap = final !== null && target !== null ? round(target - final, decimals) : null;
      tableRows.push([co.id, 'Final attainment', finalLabel, '—',
        final !== null ? `${fmt(final, decimals)} (${unit})` : 'Not calculated',
        target ?? 'Not supplied',
        gap === null ? '—' : gap > 0 ? `Shortfall ${fmt(gap, decimals)}` : 'Target met']);
      results.push({ co: co.id, final, target, gap });
    }
  }

  const notes = questions
    .filter(q => q.cos.length > 1)
    .map(q => `${q.id} (${q.max ?? '?'} marks) is mapped as a whole to ${q.cos.join(', ')}, so each of these COs receives the same ${q.component} result. Confirm the approved method allows this, or supply part-wise marks per CO.`);

  return { missing, dataProblems, notes, canCompute: canCompute && !!weights, tableRows, results, unit, studentCount: marks?.students.length ?? 0 };
}

// ---------------------------------------------------------------------------
// Item 17 — gap analysis
// ---------------------------------------------------------------------------

function buildGapAnalysis(input: CourseFileInput, attainment: ReturnType<typeof computeAttainment>) {
  const actions = pipeRows(input.gapActions).map(([co = '', cause = '', basis = '', action = '', owner = '', deadline = '', follow = '', closure = '']) => ({
    co: normId(co), cause, basis, action, owner, deadline, follow, closure
  }));
  const findings: Finding[] = [];
  const rows: (string | number)[][] = [];

  if (!attainment.canCompute) {
    findings.push({ text: 'Attainment is not verified, so no gap can be established yet. Actions below are recorded but not linked to a verified shortfall.' });
  }

  for (const r of attainment.results) {
    if (r.gap === null || r.gap <= 0) continue;
    const a = actions.find(x => x.co === r.co);
    if (!a) findings.push({ text: `${r.co} falls short of target but has no corrective action recorded.` });
    const basis = a?.basis ? (/confirm/i.test(a.basis) ? 'Confirmed cause' : 'Hypothesis') : 'Not stated';
    rows.push([r.co, r.target ?? '—', r.final ?? '—', r.gap,
      a?.cause ? `${basis}: ${a.cause}` : 'Cause not yet analysed',
      a?.action || 'To be supplied', a?.owner || 'To be confirmed', a?.deadline || 'To be confirmed',
      a?.follow || 'To be defined', a?.closure || 'Pending — no follow-up evidence yet']);
  }

  for (const a of actions) {
    if (rows.some(r => r[0] === a.co)) continue;
    const verified = attainment.results.find(r => r.co === a.co);
    const note = verified && verified.gap !== null && verified.gap <= 0 ? 'Target met in verified data — action recorded voluntarily' : 'No verified shortfall';
    rows.push([a.co, verified?.target ?? '—', verified?.final ?? 'Not verified', note,
      a.cause ? `${/confirm/i.test(a.basis) ? 'Confirmed cause' : 'Hypothesis'}: ${a.cause}` : '—',
      a.action || '—', a.owner || 'To be confirmed', a.deadline || 'To be confirmed', a.follow || 'To be defined',
      a.closure || 'Pending — no follow-up evidence yet']);
  }

  for (const a of actions) {
    if (a.cause && !a.basis) findings.push({ text: `${a.co}: cause not marked as confirmed or hypothesis — treated as a hypothesis.` });
    if (/improv|increas|rais/i.test(a.closure) && !/evidence|report|result|data|sheet/i.test(a.closure)) {
      findings.push({ text: `${a.co}: closure claims improvement without citing follow-up evidence.` });
    }
  }
  return { rows, findings };
}

// ---------------------------------------------------------------------------
// Report assembly
// ---------------------------------------------------------------------------

export interface CourseFileReport {
  markdown: string;
  statuses: { no: number; status: ItemStatus; auto: boolean }[];
  missingCount: number;
  flaggedCount: number;
}

export function buildCourseFileReport(input: CourseFileInput): CourseFileReport {
  const d = input.details;
  const cos = parseCos(input.cos);
  const pos = parseOutcomes(input.pos);
  const mapping = reviewMapping(input, cos, pos);
  const cie = reviewCie(input, cos);
  const attainment = computeAttainment(input, cos);
  const gaps = buildGapAnalysis(input, attainment);
  const questions: string[] = [];
  const followUps: string[][] = [];

  // Automated check results that stop an item from being "Available and checked".
  const automatedIssues: Record<number, string[]> = {
    2: ['Page numbers can only be inserted after final pagination'],
    5: cos.length ? cos.filter(c => !bloomRank(c.bloom)).map(c => `${c.id} has no recognisable Bloom level`) : [],
    6: mapping.findings.map(f => f.text),
    12: cie.findings.map(f => f.text),
    16: [...attainment.missing.map(m => `Missing: ${m}`), ...attainment.dataProblems],
    17: gaps.findings.map(f => f.text)
  };

  // Items whose content was entered directly in the builder.
  const builderData: Record<number, boolean> = {
    4: pos.length > 0,
    5: cos.length > 0,
    6: mapping.rowCount > 0,
    12: cie.count > 0,
    16: attainment.canCompute,
    17: gaps.rows.length > 0
  };

  const evidenceIndex: string[][] = [];
  const statuses: CourseFileReport['statuses'] = [];

  const matrixRows = COURSE_FILE_STRUCTURE.map(def => {
    const entry = input.items[def.no] || { evidence: '', status: 'auto', note: '' };
    const evidenceLines = pipeRows(entry.evidence);
    const ids = evidenceLines.map(([title = '', version = '', page = '']) => {
      const id = `E${String(evidenceIndex.length + 1).padStart(2, '0')}`;
      evidenceIndex.push([id, title || 'Untitled record', version || 'Not stated', `${def.no}`, page || PENDING_PAGE]);
      return `${id} ${title}`;
    });
    const due = isDue(def, d.stage);
    const issues = automatedIssues[def.no] || [];
    let status: ItemStatus;
    let auto = entry.status === 'auto';
    const notes: string[] = [];

    if (entry.status === 'Not applicable') {
      status = 'Not applicable';
      if (!entry.note.trim()) {
        status = evidenceLines.length ? 'Available but incomplete' : due ? 'Not supplied' : 'Not yet due';
        notes.push('Marked not applicable without a supporting reason; status not accepted');
        auto = true;
      }
    } else if (entry.status !== 'auto') {
      status = entry.status;
    } else if (!evidenceLines.length && builderData[def.no]) {
      status = 'Available but incomplete';
      notes.push('Data entered in the builder; list the source document it came from');
    } else if (!evidenceLines.length) {
      status = due ? 'Not supplied' : 'Not yet due';
    } else {
      status = 'Available but incomplete';
      notes.push('Evidence listed but not yet marked as checked by the reviewer');
    }

    if (status === 'Available and checked' && issues.length) {
      status = 'Available but incomplete';
      notes.push(`Reviewer marked checked, but automated checks found ${issues.length} issue(s)`);
    }
    if (status === 'Available and checked' && !evidenceLines.length) {
      status = 'Not supplied';
      notes.push('Marked checked but no evidence record was listed');
    }
    if (status !== 'Not yet due' && status !== 'Not applicable' && issues.length) notes.push(...issues.slice(0, 3));
    if (entry.note.trim()) notes.unshift(entry.note.trim());

    statuses.push({ no: def.no, status, auto });

    let next = '—';
    if (status === 'Not supplied') next = `Supply: ${def.evidenceNeeded}`;
    else if (status === 'Available but incomplete') next = 'Resolve the listed gaps and re-check';
    else if (status === 'Not yet due') next = `Prepare by ${def.dueFrom.toLowerCase()} stage`;
    if (status === 'Not supplied' || status === 'Available but incomplete') {
      followUps.push([`Item ${def.no}: ${def.title}`, 'Course faculty (Proposed)', 'To be confirmed', def.evidenceNeeded, status]);
    }

    return [def.no, def.title, ids.join('; ') || 'None listed', status,
      notes.join('; ') || (status === 'Available and checked' ? 'None found against the supplied requirements' : '—'), next];
  });

  const count = (s: ItemStatus) => statuses.filter(x => x.status === s).length;
  const statusOf = (no: number) => statuses.find(s => s.no === no)!.status;

  // Clarification questions
  const missingDetails = ([
    ['institution', 'Institution and department'], ['programme', 'Programme and semester'], ['academicYear', 'Academic year'],
    ['course', 'Course title and code'], ['faculty', 'Faculty name and designation'], ['credits', 'Credits and contact hours'],
    ['syllabusVersion', 'Syllabus/regulation version'], ['policies', 'Institutional format and assessment policies'],
    ['attainmentMethod', 'Approved attainment method and targets document'], ['reviewer', 'Reviewing authority and submission date']
  ] as [keyof CourseDetails, string][]).filter(([k]) => !String(d[k] || '').trim()).map(([, label]) => label);
  if (missingDetails.length) questions.push(`Please supply the missing course details: ${missingDetails.join(', ')}.`);
  if (!input.mappingScale.trim()) questions.push('What mapping scale and level definitions has the institution approved for CO–PO/PSO mapping?');
  if (!mapping.rowCount) questions.push('Is an approved CO–PO/PSO mapping available? Should a proposed mapping be prepared for academic review?');
  if (!input.pos.trim()) questions.push('Please supply the approved PO and PSO statements.');
  if (!cos.length) questions.push('Please supply the approved CO statements with their Bloom levels.');
  for (const m of attainment.missing) questions.push(`Item 16 input needed — ${m}.`);
  if (attainment.dataProblems.length) questions.push('The marks data has entries that need correcting or explaining (see item 16). Can the verified ledger be supplied?');
  if (d.stage === 'Semester-end' && !input.feedbackResponses.trim()) questions.push('How many students responded to the course-end survey, out of how many eligible?');
  if (!input.plannedHours.trim()) questions.push('What are the total planned hours in the lesson plan?');
  for (const def of COURSE_FILE_STRUCTURE) {
    const note = input.items[def.no]?.note.trim();
    if (note && input.items[def.no].status !== 'Not applicable') questions.push(`Item ${def.no} (${def.title}): ${note} — when will this be supplied?`);
  }
  for (const r of parseMapping(input.mapping)) {
    const f = mapping.findings.find(x => x.text.startsWith(`${r.co}–${r.po}:`));
    if (f) questions.push(`Item 6, ${r.co}–${r.po}: ${f.text.slice(r.co.length + r.po.length + 3)} Can the course team revise this row for approval?`);
  }
  for (const f of cie.findings) {
    if (f.text.includes('questionable')) questions.push(`Item 12, ${f.text.split(':')[0]}: does the task students perform match the official Bloom tag, or should a revised tag be proposed?`);
  }
  for (const n of attainment.notes) questions.push(`Item 16: ${n}`);
  for (const r of attainment.results) {
    const hasAction = pipeRows(input.gapActions).some(([co]) => normId(co || '') === r.co);
    if (r.gap !== null && r.gap > 0 && !hasAction) questions.push(`Item 17: ${r.co} is ${fmt(r.gap, toNumber(input.rounding))} below target. What is the evidence-supported cause, and who will own the corrective action and by when?`);
  }

  // Consistency checks (Task 4)
  const consistency: string[][] = [];
  const contact = (d.credits.match(/(\d+(?:\.\d+)?)\s*(?:contact\s*)?(?:hours|hrs|h)\b/i) || [])[1];
  const planned = toNumber(input.plannedHours);
  const delivered = toNumber(input.deliveredHours);
  consistency.push(['Course identifiers and syllabus versions agree', 'Manual check',
    d.course && d.syllabusVersion ? `Confirm “${d.course}” and “${d.syllabusVersion}” appear unchanged on items 1, 7, 8 and 12` : 'Course code or syllabus version not supplied']);
  const coIdsElsewhere = new Set([...parseMapping(input.mapping).map(r => r.co), ...parseQuestions(input.questions).flatMap(q => q.cos)]);
  const strayCos = [...coIdsElsewhere].filter(id => cos.length && !cos.some(c => c.id === id));
  consistency.push(['CO wording and numbering match across sections', cos.length ? (strayCos.length ? 'Inconsistent' : 'Numbering consistent') : 'Not checkable',
    strayCos.length ? `CO IDs used but not defined in item 5: ${strayCos.join(', ')}` : cos.length ? 'CO IDs in mapping and question papers match item 5; wording to be compared manually' : 'CO list not supplied']);
  consistency.push(['Planned hours match the syllabus', planned !== null && contact ? (Number(contact) === planned ? 'Consistent' : 'Inconsistent') : 'Not checkable',
    planned !== null && contact ? `Lesson plan ${planned} h; syllabus/contact hours ${contact} h` : 'Planned hours or syllabus contact hours not supplied']);
  consistency.push(['Actual delivery distinguished from lesson plan', delivered !== null ? 'Data supplied' : 'Not checkable',
    delivered !== null && planned !== null ? `Delivered ${delivered} h against ${planned} h planned${delivered < planned ? ` — deviation of ${planned - delivered} h must be recorded with recovery action in item 9` : ''}` : 'Delivered hours not supplied']);
  const ledger = toNumber(input.ledgerStudents);
  consistency.push(['Assessment marks reconcile with the marks ledger', ledger !== null && attainment.studentCount ? (ledger === attainment.studentCount ? 'Consistent' : 'Inconsistent') : 'Not checkable',
    ledger !== null && attainment.studentCount ? `Ledger lists ${ledger} students; question-level data has ${attainment.studentCount} rows` : 'Ledger count or question-level data not supplied']);
  consistency.push(['Attendance totals use the correct sessions and denominator', 'Manual check', 'Confirm the ledger states sessions conducted and the enrolment denominator used']);
  consistency.push(['Evaluated samples correspond to the relevant assessments', 'Manual check', 'Confirm each sample script names the CIE it belongs to (item 13 vs item 12)']);
  consistency.push(['Attainment results agree with source data', attainment.canCompute ? 'Calculated from supplied data' : 'Not checkable',
    attainment.canCompute ? 'Figures in item 16 are recomputed here from the supplied question-level marks' : 'Attainment inputs incomplete']);
  const fr = toNumber(input.feedbackResponses);
  const fe = toNumber(input.feedbackEnrolled);
  consistency.push(['Feedback analysis states response counts and denominators', fr !== null && fe !== null ? (fr <= fe ? 'Stated' : 'Inconsistent') : 'Not checkable',
    fr !== null && fe !== null ? `${fr} responses of ${fe} eligible (${fmt((fr / fe) * 100, 1)}%)` : 'Response count or denominator not supplied']);
  const unactioned = gaps.findings.filter(f => f.text.includes('no corrective action')).map(f => f.text.split(' ')[0]);
  consistency.push(['Corrective actions address the identified gaps', unactioned.length ? 'Inconsistent' : attainment.canCompute ? 'Consistent' : 'Not checkable',
    unactioned.length ? `Shortfall without a corrective action: ${unactioned.join(', ')}` : attainment.canCompute ? 'Every verified shortfall has an action recorded' : 'No verified gaps to compare']);

  const highlighted = [6, 12, 16, 17].map(no => {
    const s = statusOf(no);
    const n = (automatedIssues[no] || []).length;
    return `- Item ${no} (${COURSE_FILE_STRUCTURE[no - 1].title}): ${s}${n ? ` — ${n} issue(s) flagged` : ''}.`;
  });

  const flaggedCount = mapping.findings.length + cie.findings.length + attainment.dataProblems.length + gaps.findings.length;
  const missingCount = count('Not supplied');

  const out: string[] = [];
  out.push('# Course File Readiness Review');
  out.push('DRAFT FOR REVIEW — prepared from supplied records only. This draft does not certify compliance or inspection readiness.');
  out.push(table(['Field', 'Value'], [
    ['Task', input.task],
    ['Institution and department', d.institution || 'Not supplied'],
    ['Programme and semester', d.programme || 'Not supplied'],
    ['Academic year', d.academicYear || 'Not supplied'],
    ['Course title and code', d.course || 'Not supplied'],
    ['Faculty name and designation', d.faculty || 'Not supplied'],
    ['Credits and contact hours', d.credits || 'Not supplied'],
    ['Syllabus/regulation version', d.syllabusVersion || 'Not supplied'],
    ['Reporting stage', d.stage],
    ['Institutional format and assessment policies', d.policies || 'Not supplied'],
    ['Approved attainment method and targets', d.attainmentMethod || 'Not supplied'],
    ['Reviewing authority and submission date', d.reviewer || 'Not supplied']
  ]));

  out.push('## A. Readiness Summary');
  out.push(`At the ${d.stage.toLowerCase()} stage, ${count('Available and checked')} of 18 items are available and checked against the supplied requirements, ${count('Available but incomplete')} are available but incomplete, ${missingCount} are not supplied, ${count('Not yet due')} are not yet due and ${count('Not applicable')} are marked not applicable with a reason. Automated checks raised ${flaggedCount} issue(s). “Available and checked” does not imply institutional approval.`);
  out.push(highlighted.join('\n'));

  out.push('## B. Eighteen-Item Completeness Matrix');
  out.push(table(['Item', 'Required component', 'Supplied evidence', 'Status', 'Specific gap', 'Next action'], matrixRows));

  out.push('## C. Section-Wise Review Findings');
  out.push('### Item 1 — Cover page');
  out.push(d.course && d.faculty
    ? `Cover details supplied: ${d.course}; ${d.programme || 'programme not stated'}; ${d.academicYear || 'year not stated'}; ${d.faculty}. Confirm the cover uses the institutional format.`
    : 'Cover page cannot be completed until the course and faculty details are supplied.');
  out.push('### Item 2 — Contents index');
  out.push(table(['Item', 'Section', 'Page'], COURSE_FILE_STRUCTURE.map(def => [def.no, def.title, PENDING_PAGE])));
  out.push('### Item 4 — POs and PSOs (as supplied)');
  out.push(pos.length ? table(['ID', 'Statement (preserved as supplied)'], pos.map(p => [p.id, p.statement])) : 'Not supplied. Approved PO/PSO statements must be attached.');
  out.push('### Item 5 — Course Outcomes (as supplied)');
  out.push(cos.length ? table(['CO', 'Statement (preserved as supplied)', 'Bloom level'], cos.map(c => [c.id, c.statement, c.bloom ? `${c.bloom}${bloomRank(c.bloom) ? '' : ' (not recognised)'}` : 'Not stated'])) : 'Not supplied. Approved COs with Bloom levels must be attached.');
  out.push('### Task 4 — Consistency Across the File');
  out.push(table(['Check', 'Result', 'Detail'], consistency));
  out.push('Inconsistencies are flagged only; no source record has been changed.');

  out.push('## D. Detailed Review of Items 6, 12, 16 and 17');
  out.push('### Item 6 — CO–PO/PSO Mapping with Justification');
  out.push(input.mappingScale.trim() ? `Supplied mapping scale: ${lines(input.mappingScale).join('; ')}.` : 'Mapping scale not supplied — no level has been assumed.');
  out.push(mapping.tableRows.length
    ? table(['CO', 'PO/PSO', 'Mapping level', 'Academic justification', 'Supporting learning activity/assessment', 'Approval status', 'Review finding'], mapping.tableRows)
    : 'Template (blank, Draft for review):\n' + table(['CO', 'PO/PSO', 'Mapping level', 'Academic justification', 'Supporting learning activity/assessment', 'Approval status'], [['', '', '', '', '', '']]));
  out.push('### Item 12 — CIE Papers with CO and Bloom Tagging');
  if (cie.tableRows.length) {
    out.push(table(['Question ID', 'Marks', 'CO assessed', 'Bloom level', 'Reason for classification', 'Review finding'], cie.tableRows));
    out.push(table(['Test', 'Questions', 'Sum of marks', 'Optional marks', 'Declared total', 'Finding'], cie.totals));
    out.push(`Optional-question rule: ${input.optionalRule === 'attempted-only' ? 'maximum counted only for attempted optional questions' : input.optionalRule === 'all' ? 'all optional questions counted (unattempted scored zero)' : 'not supplied'}. Official tags are preserved; any re-tagging is a proposal for the reviewer.`);
  } else {
    out.push('Template (blank, Draft for review):\n' + table(['Question ID', 'Marks', 'CO assessed', 'Bloom level', 'Reason for classification', 'Review finding'], [['', '', '', '', '', '']]));
  }
  out.push('### Item 16 — Direct and Indirect CO Attainment');
  out.push(table(['Required input', 'Supplied?'], [
    ['CO-to-question mapping', parseQuestions(input.questions).length ? 'Yes' : 'No'],
    ['Question-level student performance data', attainment.studentCount ? `Yes (${attainment.studentCount} anonymised rows)` : 'No'],
    ['Maximum marks and optional-question treatment', parseQuestions(input.questions).every(q => q.max !== null) && parseQuestions(input.questions).length ? (parseQuestions(input.questions).some(q => q.optional) ? (input.optionalRule ? 'Yes' : 'Optional rule missing') : 'Yes') : 'No'],
    ['Threshold, attainment levels and CO targets', `${input.threshold.trim() ? `Threshold ${input.threshold.trim()}%` : 'Threshold missing'}; ${input.levels.trim() ? 'levels supplied' : 'no levels (results stay in %)'}; ${input.target.trim() ? 'targets supplied' : 'targets missing'}`],
    ['Assessment component weights', input.componentWeights.trim() || 'Not supplied'],
    ['Rules for absences, missing marks and exclusions', input.absenceRule === 'exclude' ? 'Fully absent students excluded from the denominator' : input.absenceRule === 'not-met' ? 'Fully absent students counted as not meeting the threshold' : 'Not supplied'],
    ['Indirect survey items, CO alignment and scoring', pipeRows(input.indirect).length ? 'Supplied per CO' : 'Not supplied'],
    ['Direct/indirect combination weights', input.directWeight.trim() && input.indirectWeight.trim() ? `${input.directWeight} / ${input.indirectWeight}` : 'Not supplied'],
    ['Rounding rule', input.rounding.trim() ? `${input.rounding} decimal place(s)` : 'Not supplied']
  ]));
  if (attainment.canCompute) {
    out.push(table(['CO', 'Data source', 'Formula/method', 'Numerator / denominator', 'Calculated result', 'Target', 'Gap'], attainment.tableRows));
    for (const n of attainment.notes) out.push(`Note: ${n}`);
    out.push('Calculated only with the supplied method inputs. Pass percentage and total marks were not used as a proxy. Indirect results are used only as supplied against CO-aligned survey items.');
    if (attainment.missing.length) out.push(`Still missing: ${attainment.missing.join('; ')}.`);
  } else {
    out.push('No numerical attainment has been produced because the data are insufficient.');
    if (attainment.missing.length) out.push(`Missing inputs: ${attainment.missing.join('; ')}.`);
    if (attainment.dataProblems.length) out.push(`Data problems: ${attainment.dataProblems.join('; ')}.`);
    out.push('Calculation template (Draft for review):\n' + table(['CO', 'Data source', 'Formula/method', 'Numerator / denominator', 'Calculated result', 'Target', 'Gap'],
      (cos.length ? cos.map(c => c.id) : ['CO1']).map(id => [id, 'Question IDs mapped to this CO', 'Per approved method', '[met] / [eligible]', '[to be calculated]', '[approved target]', '[target − result]'])));
  }
  out.push('### Item 17 — CO–PO Gap Analysis and Corrective Action');
  for (const f of gaps.findings) out.push(`- ${f.text}`);
  out.push(gaps.rows.length
    ? table(['CO/PO concerned', 'Target', 'Actual result', 'Gap', 'Evidence-supported cause or hypothesis', 'Corrective action', 'Owner', 'Deadline', 'Follow-up measure', 'Closure evidence'], gaps.rows)
    : attainment.canCompute ? 'No verified shortfall against the supplied targets.' : 'Template (blank, Draft for review):\n' + table(['CO/PO concerned', 'Target', 'Actual result', 'Gap', 'Evidence-supported cause or hypothesis', 'Corrective action', 'Owner', 'Deadline', 'Follow-up measure', 'Closure evidence'], [['', '', '', '', '', '', '', '', '', '']]));
  out.push('No action is reported as having improved attainment without follow-up evidence. Programme-level PO attainment is not derived from this single course.');

  out.push('## E. Evidence Index and Follow-Up Actions');
  out.push(evidenceIndex.length
    ? table(['Evidence ID', 'Actual filename/document title', 'Date/version', 'Relevant course-file item', 'Page/sheet/section'], evidenceIndex)
    : 'No evidence records listed.');
  for (const r of attainment.results) {
    if (r.gap !== null && r.gap > 0 && !pipeRows(input.gapActions).some(([co]) => normId(co || '') === r.co)) {
      followUps.push([`Corrective action for ${r.co} shortfall`, 'Course faculty (Proposed)', 'To be confirmed', 'Action plan with owner, deadline and follow-up measure', 'Open']);
    }
  }
  out.push(followUps.length
    ? table(['Missing item/action', 'Responsible person', 'Due date', 'Evidence needed for completion', 'Status'], followUps)
    : 'No open follow-up actions.');

  out.push('## F. Clarification Questions');
  out.push('These questions sit outside the formal course file.');
  out.push(questions.length ? questions.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'None.');

  return { markdown: out.join('\n\n'), statuses, missingCount, flaggedCount };
}

export function emptyCourseFileInput(): CourseFileInput {
  return {
    task: 'Review an existing file',
    details: {
      institution: '', programme: '', academicYear: '', course: '', faculty: '', credits: '',
      syllabusVersion: '', stage: 'Semester-end', policies: '', attainmentMethod: '', reviewer: ''
    },
    items: Object.fromEntries(COURSE_FILE_STRUCTURE.map(def => [def.no, { evidence: '', status: 'auto', note: '' }])),
    cos: '', pos: '', mappingScale: '', mapping: '', questions: '', testTotals: '', optionalRule: '', marks: '',
    threshold: '', levels: '', target: '', componentWeights: '', absenceRule: '', indirect: '',
    directWeight: '', indirectWeight: '', rounding: '', gapActions: '',
    plannedHours: '', deliveredHours: '', ledgerStudents: '', feedbackResponses: '', feedbackEnrolled: ''
  };
}

/** Builds the Lab 4 prompt with the supplied details filled in, for use in any AI assistant. */
export function buildFilledPrompt(template: string, input: CourseFileInput): string {
  const d = input.details;
  const pairs: [string, string][] = [
    ['[Select: Prepare an initial course file / Review an existing file / Update a semester-end file]', input.task],
    ['Institution and department: [Insert]', `Institution and department: ${d.institution || '[Insert]'}`],
    ['Programme and semester: [Insert]', `Programme and semester: ${d.programme || '[Insert]'}`],
    ['Academic year: [Insert]', `Academic year: ${d.academicYear || '[Insert]'}`],
    ['Course title and code: [Insert]', `Course title and code: ${d.course || '[Insert]'}`],
    ['Faculty name and designation: [Insert]', `Faculty name and designation: ${d.faculty || '[Insert]'}`],
    ['Credits and contact hours: [Insert]', `Credits and contact hours: ${d.credits || '[Insert]'}`],
    ['Syllabus/regulation version: [Insert]', `Syllabus/regulation version: ${d.syllabusVersion || '[Insert]'}`],
    ['Reporting stage: [Before teaching / Mid-semester / Semester-end]', `Reporting stage: ${d.stage}`],
    ['Institutional format and assessment policies: [Attach]', `Institutional format and assessment policies: ${d.policies || '[Attach]'}`],
    ['Approved attainment method and targets: [Attach]', `Approved attainment method and targets: ${d.attainmentMethod || '[Attach]'}`],
    ['Reviewing authority and submission date: [Insert]', `Reviewing authority and submission date: ${d.reviewer || '[Insert]'}`]
  ];
  let out = template;
  for (const [from, to] of pairs) out = out.replace(from, to);

  const sources: string[] = [];
  const add = (label: string, value: string) => { if (value.trim()) sources.push(`--- ${label} ---\n${value.trim()}`); };
  add('Evidence list by item', COURSE_FILE_STRUCTURE.map(def => {
    const e = input.items[def.no];
    return e && e.evidence.trim() ? `Item ${def.no}:\n${e.evidence.trim()}${e.note.trim() ? `\nNote: ${e.note.trim()}` : ''}` : '';
  }).filter(Boolean).join('\n'));
  add('Course Outcomes (CO | statement | Bloom)', input.cos);
  add('POs and PSOs', input.pos);
  add('Mapping scale', input.mappingScale);
  add('CO–PO/PSO mapping (CO | PO | level | justification | activity | approval)', input.mapping);
  add('CIE/SEE questions (ID | component | max | COs | Bloom | optional | text)', input.questions);
  add('Declared test totals', input.testTotals);
  add('Question-level marks (anonymised)', input.marks);
  add('Attainment method inputs', [
    input.threshold && `Threshold: ${input.threshold}%`, input.levels && `Levels:\n${input.levels}`,
    input.target && `Targets: ${input.target}`, input.componentWeights && `Component weights: ${input.componentWeights}`,
    input.absenceRule && `Absence rule: ${input.absenceRule}`, input.optionalRule && `Optional rule: ${input.optionalRule}`,
    input.directWeight && `Direct weight: ${input.directWeight}`, input.indirectWeight && `Indirect weight: ${input.indirectWeight}`,
    input.rounding && `Rounding: ${input.rounding} decimals`
  ].filter(Boolean).join('\n'));
  add('Indirect assessment (CO | survey item | result | responses)', input.indirect);
  add('Gap actions', input.gapActions);

  if (sources.length) {
    out = out.replace('[Attach or paste available records. Identify each file clearly.]', sources.join('\n\n'));
  }
  return out;
}
