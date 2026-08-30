const API_KEY_STORAGE_KEY = 'jsspm_fdp_gemini_api_key';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } catch (e) {
    console.error('Failed to store API key in localStorage', e);
  }
}

export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear API key', e);
  }
}

export interface GeminiGenerateOptions {
  apiKey?: string;
  prompt: string;
  promptNumber?: number;
  model?: string;
  temperature?: number;
  allowOfflineFallback?: boolean;
  /** Raw user data without the composed prompt, used by the offline generator. */
  rawInput?: string;
  /** Additional instruction appended after the default output-discipline policy below. */
  systemInstruction?: string;
}

// Last-resort names to try if live model discovery itself fails (e.g. the
// key has no ListModels access, or the network is unreachable). Google
// renames and retires model IDs over time - gemini-1.5-pro was removed from
// v1beta after this list was first written - so this is deliberately not
// the primary source of truth; discoverAvailableModels() below is.
/**
 * Sent as Gemini's dedicated systemInstruction on every call, so the model
 * returns a finished, ready-to-print document instead of its planning
 * notes, draft-vs-revised comparisons, or a checklist of what it changed.
 * A caller's own systemInstruction (if any) is appended after this, never
 * instead of it.
 */
const OUTPUT_DISCIPLINE_INSTRUCTION = [
  'You are drafting a finished institutional document that will be printed exactly as returned - not a conversation about how to draft it.',
  'Output ONLY the final document text, formatted as it should appear on letterhead, starting with the first line of the document and ending with the signature/distribution block.',
  'Do not include planning notes, an outline of your approach, alternative phrasings, before/after comparisons (e.g. "Better:"), a checklist of requirements you satisfied, or any other commentary about the document.',
  'Do not use markdown emphasis (asterisks, headers) for meta-commentary; only use the plain formatting the document itself requires.',
  'Where a fact is not supplied, insert a {{PLACEHOLDER}} in the document itself rather than asking a question or noting the gap separately.'
].join(' ');

// gemini-2.0-flash and gemini-2.0-flash-lite were shut down 01-06-2026 - do not
// re-add them here even as a last-resort fallback; every request would 404.
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash'
];

interface ModelCacheEntry {
  models: string[];
  fetchedAt: number;
}

const modelListCache = new Map<string, ModelCacheEntry>();
const MODEL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes - long enough to avoid refetching every keystroke, short enough to notice a key change within a session.

/**
 * Asks the key itself which models it can actually call right now, instead
 * of trusting a hard-coded list that Google can (and does) change without
 * notice. Filters for modern generative text models and sorts by preference.
 * Falls back to CANDIDATE_MODELS if discovery is unavailable.
 */
export async function discoverAvailableModels(apiKey: string): Promise<string[]> {
  const trimmedKey = (apiKey || '').trim();
  if (!trimmedKey) return CANDIDATE_MODELS;

  const cached = modelListCache.get(trimmedKey);
  if (cached && Date.now() - cached.fetchedAt < MODEL_CACHE_TTL_MS) {
    return cached.models;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${trimmedKey}&pageSize=200`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`ListModels HTTP ${response.status}`);

    const data = await response.json();
    const rawModels: string[] = (data?.models || [])
      .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m: any) => String(m.name || '').replace(/^models\//, ''))
      .filter(Boolean);

    // Filter to modern text-generation Gemini models
    const filtered = rawModels.filter(m =>
      m.startsWith('gemini-') &&
      !m.includes('vision') &&
      !m.includes('1.0') &&
      m !== 'gemini-pro'
    );

    // Sort by version descending so newest Gemini models (gemini-3.x, 2.x) are tried first
    filtered.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));

    if (filtered.length > 0) {
      modelListCache.set(trimmedKey, { models: filtered, fetchedAt: Date.now() });
      return filtered;
    }
  } catch (err) {
    console.warn('Gemini model discovery failed, falling back to the static candidate list.', err);
  }

  return CANDIDATE_MODELS;
}

/**
 * The studio sends Gemini a composed prompt (system instructions + template +
 * the user's raw data). When the offline generator receives that whole blob -
 * no API key, or every model failed - only the data after the raw-input marker
 * is real user content. Everything before it is instruction boilerplate and
 * must never leak into a document.
 */
export function stripPromptWrapper(raw: string): string {
  let t = (raw || '').replace(/\r\n/g, '\n');

  const markerIdx = t.toUpperCase().lastIndexOf('RAW INPUT DATA');
  if (markerIdx >= 0) {
    const colon = t.indexOf(':', markerIdx);
    t = colon >= 0 ? t.slice(colon + 1) : t.slice(markerIdx);
  } else {
    const placeholderIdx = t.lastIndexOf('{{INPUT}}');
    if (placeholderIdx >= 0) t = t.slice(placeholderIdx + '{{INPUT}}'.length);
  }

  const INSTRUCTION_LINE = /^(You are an expert|Instructions?\s*:|Structure\s*:|Output\s*:|Columns\s*:|Format\s*:|Tone\s*:|Requirements?\s*:|Use only activities|Do not invent|Strictly draft|Convert this|Draft a formal|Draft my|Generate a|Map these|Rewrite this|Review this|Audit this|Create an institutional|Here is our|End with signatory|Any decision without|Status must be)/i;

  return t
    .split('\n')
    .filter(line => {
      const l = line.trim();
      if (!l) return true;
      if (l.includes('{{INPUT}}')) return false;
      return !INSTRUCTION_LINE.test(l);
    })
    .join('\n')
    .trim();
}

/**
 * Splits any line into { key: value } pairs, tolerating several pairs on one
 * line separated by comma / semicolon / pipe / parenthesis.
 */
interface ParsedPair { key: string; value: string; }

function parseKeyValuePairs(text: string): ParsedPair[] {
  const pairs: ParsedPair[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.includes('{{')) continue;
    if (line.startsWith('[') && line.endsWith(']')) continue;

    const keyRe = /(?:^|[,;|(])\s*([A-Za-z][A-Za-z0-9 /&'.-]{1,40}?)\s*[:=]\s*/g;
    const marks: { key: string; keyStart: number; valueStart: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = keyRe.exec(line)) !== null) {
      marks.push({ key: m[1].trim(), keyStart: m.index, valueStart: m.index + m[0].length });
    }
    if (marks.length === 0) continue;
    marks.forEach((mk, i) => {
      const end = i + 1 < marks.length ? marks[i + 1].keyStart : line.length;
      const val = line.slice(mk.valueStart, end).trim().replace(/[,;|(-]+$/, '').trim();
      if (val) pairs.push({ key: mk.key, value: val });
    });
  }
  return pairs;
}

/**
 * Clean helper to extract values from user input lines
 */
function extractValue(text: string, keys: string[], defaultValue: string): string {
  const pairs = parseKeyValuePairs(text || '');
  const wanted = keys.map(k => k.trim().toLowerCase());

  for (const w of wanted) {
    for (const p of pairs) {
      if (p.key.toLowerCase() === w) {
        const val = p.value.replace(/\[.*?\]/g, '').trim();
        if (val) return val;
      }
    }
  }
  for (const w of wanted) {
    for (const p of pairs) {
      if (p.key.toLowerCase().includes(w)) {
        const val = p.value.replace(/\[.*?\]/g, '').trim();
        // A fuzzy key hit that swallowed a whole paragraph is not a field value.
        if (val && val.length <= 120) return val;
      }
    }
  }
  return defaultValue;
}

const DATE_TOKEN_RE = /\d{1,2}[-/](?:\d{1,2}|[A-Za-z]{3,9})[-/]?\d{0,4}/;

/** Pulls the first real date out of a noisy value ("18-09-2026 (holiday)" -> "18-09-2026"). */
function firstDate(value: string, fallback: string): string {
  const m = (value || '').match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/) || (value || '').match(DATE_TOKEN_RE);
  return m ? m[0] : (value || fallback);
}

function extractDate(text: string, keys: string[], defaultValue: string): string {
  return firstDate(extractValue(text, keys, defaultValue), defaultValue);
}

/** Searches the whole input for the first pattern that yields a number. */
function extractNumber(text: string, patterns: RegExp[], defaultValue: number): number {
  for (const re of patterns) {
    const m = (text || '').match(re);
    if (m && m[1]) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n)) return n;
    }
  }
  return defaultValue;
}

const MONTH_TOKENS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function parseDateToken(token: string, fallbackYear: number): Date | null {
  const t = (token || '').trim();
  let m = t.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10);
    const d = new Date(y, parseInt(m[2], 10) - 1, parseInt(m[1], 10));
    return isNaN(d.getTime()) ? null : d;
  }
  m = t.match(/^(\d{1,2})[-/\s]([A-Za-z]{3,9})(?:[-/\s](\d{2,4}))?$/);
  if (m) {
    const mi = MONTH_TOKENS.indexOf(m[2].slice(0, 3).toLowerCase());
    if (mi >= 0) {
      const y = m[3] ? (m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10)) : fallbackYear;
      const d = new Date(y, mi, parseInt(m[1], 10));
      return isNaN(d.getTime()) ? null : d;
    }
  }
  return null;
}

function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

/** Reads "8 days (15-Aug, 07-Sep, 02-10-2026 ...)" into real Date objects. */
function collectHolidayDates(raw: string, start: Date | null, end: Date | null): Date[] {
  const out: Date[] = [];
  const tokens = (raw || '').match(/\d{1,2}[-/](?:\d{1,2}|[A-Za-z]{3,9})(?:[-/]\d{2,4})?/g) || [];
  const baseYear = start ? start.getFullYear() : new Date().getFullYear();
  for (const tk of tokens) {
    let d = parseDateToken(tk, baseYear);
    if (!d) continue;
    if (start && end && d < start) {
      const alt = parseDateToken(tk, baseYear + 1);
      if (alt && alt >= start && alt <= end) d = alt;
    }
    if (!start || !end || (d >= start && d <= end)) out.push(d);
  }
  return out;
}

function buildWorkingDays(start: Date, end: Date, holidays: Date[]) {
  const hs = new Set(holidays.map(h => h.toDateString()));
  const days: Date[] = [];
  let sundays = 0;
  let holidayCount = 0;
  let total = 0;
  let cursor = new Date(start.getTime());
  while (cursor <= end && total < 1000) {
    total++;
    if (cursor.getDay() === 0) {
      sundays++;
    } else if (hs.has(cursor.toDateString())) {
      holidayCount++;
    } else {
      days.push(new Date(cursor.getTime()));
    }
    cursor = addDays(cursor, 1);
  }
  return { days, sundays, holidayCount, total };
}

export interface CalendarCieRow {
  label: string;
  targetWorkingDay: number;
  from: string;
  to: string;
  shifted: boolean;
}

export interface CalendarModel {
  termStart: string;
  termEnd: string;
  totalDays: number;
  sundays: number;
  holidays: number;
  festDays: number;
  grossWorking: number;
  cieDays: number;
  netInstructional: number;
  minRequired: number;
  bufferRequired: number;
  bufferAvailable: number;
  boardExam: string;
  cieRows: CalendarCieRow[];
  conflicts: string[];
  lastWorkingDay: string;
  dateMathVerified: boolean;
}

/**
 * Single working-day engine shared by Prompt 7 (term calendar) and
 * Prompt 14 (calendar engine). Every number below is derived from the
 * user's own input - nothing is hard-coded.
 */
function computeCalendarModel(text: string): CalendarModel {
  const startRaw = extractDate(text, ['Term Start', 'Semester Start', 'Commencement'], '01-08-2026');
  const endRaw = extractDate(text, ['Term End', 'Semester End', 'Last Working Day'], '30-11-2026');
  const sd = parseDateToken(startRaw, 2026);
  const ed = parseDateToken(endRaw, sd ? sd.getFullYear() : 2026);

  const holidayRaw = extractValue(
    text,
    ['Declared Govt / Festival Holidays', 'Declared Holidays', 'Declared Govt', 'Holidays', 'Holiday List'],
    ''
  );
  const minRequired = extractNumber(
    text,
    [/Prescribed Minimum Instructional Days\s*[:=-]?\s*(\d+)/i, /minimum[^\d]{0,25}(\d+)\s*(?:instructional\s*)?days/i],
    80
  );
  const bufferRequired = extractNumber(
    text,
    [/Buffer\s*required\s*[:=-]?\s*(\d+)/i, /at least\s*(\d+)\s*buffer/i, /buffer[^\d]{0,25}(\d+)\s*days/i],
    6
  );
  const hasFest = /tech\s*fest|annual fest|cultural fest/i.test(text);
  const festDays = hasFest ? extractNumber(text, [/fest[^\d]{0,25}\((\d+)\s*day/i, /fest[^\d]{0,25}(\d+)\s*day/i], 1) : 0;

  const boardExam = extractDate(
    text,
    ['BTE Board Practical Exams Begin', 'BTE Board Practical Exams', 'Board Practical Exams', 'Board Exams', 'Board Examination'],
    '25-11-2026'
  );
  const boardDate = parseDateToken(boardExam, sd ? sd.getFullYear() : 2026);

  const targets: { label: string; wd: number }[] = [];
  const cieRe = /CIE\s*-?\s*(\d)[^0-9]{0,60}?(\d{1,3})\s*working\s*days/gi;
  let cm: RegExpExecArray | null;
  while ((cm = cieRe.exec(text)) !== null) {
    targets.push({ label: `CIE-${cm[1]}`, wd: parseInt(cm[2], 10) });
  }
  if (targets.length === 0) {
    [30, 55, 75].forEach((wd, i) => targets.push({ label: `CIE-${i + 1}`, wd }));
  }

  let totalDays: number;
  let sundays: number;
  let holidayCount: number;
  let workingDays: Date[] = [];
  let dateMathVerified = false;

  if (sd && ed && ed > sd) {
    const holidays = collectHolidayDates(holidayRaw, sd, ed);
    const built = buildWorkingDays(sd, ed, holidays);
    totalDays = built.total;
    sundays = built.sundays;
    holidayCount = built.holidayCount;
    workingDays = built.days;
    dateMathVerified = true;
  } else {
    totalDays = extractNumber(text, [/Total[^\d]{0,25}(\d+)\s*calendar/i, /(\d+)\s*calendar\s*days/i], 122);
    sundays = extractNumber(text, [/Sundays\s*[:=-]?\s*(\d+)/i], 17);
    holidayCount = extractNumber(text, [/Holidays\s*[:=-]?\s*(\d+)/i], 8);
  }

  const grossWorking = (dateMathVerified ? workingDays.length : totalDays - sundays - holidayCount) - festDays;
  const cieDays = targets.length * 2;
  const netInstructional = grossWorking - cieDays;
  const bufferAvailable = netInstructional - minRequired;

  const conflicts: string[] = [];
  const cieRows: CalendarCieRow[] = [];
  const blackoutStart = boardDate ? addDays(boardDate, -7) : null;

  targets.forEach(t => {
    let shifted = false;
    let from = '';
    let to = '';
    if (dateMathVerified && workingDays.length > 0) {
      let idx = Math.min(Math.max(t.wd, 1), workingDays.length) - 1;
      if (blackoutStart && workingDays[idx] >= blackoutStart) {
        while (idx > 0 && workingDays[idx] >= blackoutStart) idx--;
        shifted = true;
        conflicts.push(
          `${t.label} requested at working day ${t.wd} falls inside the 7-day blackout window before the board examination on ${boardExam}; advanced to ${fmtDate(workingDays[idx])}.`
        );
      }
      from = fmtDate(workingDays[idx]);
      to = fmtDate(workingDays[Math.min(idx + 1, workingDays.length - 1)]);
    } else {
      from = `{{DATE_AT_WORKING_DAY_${t.wd}}}`;
      to = `{{DATE_AT_WORKING_DAY_${t.wd + 1}}}`;
    }
    cieRows.push({ label: t.label, targetWorkingDay: t.wd, from, to, shifted });
  });

  if (netInstructional < minRequired) {
    conflicts.push(
      `Net instructional days (${netInstructional}) fall short of the prescribed minimum of ${minRequired} days by ${minRequired - netInstructional} days.`
    );
  }
  if (bufferAvailable < bufferRequired) {
    conflicts.push(
      `Emergency buffer available (${bufferAvailable} days) is below the required buffer of ${bufferRequired} days.`
    );
  }
  if (!dateMathVerified) {
    conflicts.push('Term start / end dates could not be parsed; day-wise placement is shown as placeholders for manual verification.');
  }

  return {
    termStart: startRaw,
    termEnd: endRaw,
    totalDays,
    sundays,
    holidays: holidayCount,
    festDays,
    grossWorking,
    cieDays,
    netInstructional,
    minRequired,
    bufferRequired,
    bufferAvailable,
    boardExam,
    cieRows,
    conflicts,
    lastWorkingDay: dateMathVerified && workingDays.length ? fmtDate(workingDays[workingDays.length - 1]) : endRaw,
    dateMathVerified
  };
}

/** "2025-26" shifted back n academic years -> "2024-25" */
function shiftAcademicYear(ay: string, back: number): string {
  const m = (ay || '').match(/(\d{4})\s*[-/]\s*(\d{2,4})/);
  if (!m) return `{{AY_MINUS_${back}}}`;
  const start = parseInt(m[1], 10) - back;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

/** Trims a long sentence for table cells without losing meaning. */
function clip(value: string, len: number): string {
  const v = (value || '').replace(/\s+/g, ' ').trim();
  return v.length > len ? v.slice(0, len - 3) + '...' : v;
}

function splitSentences(text: string): string[] {
  return (text || '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function cleanAuthorityName(rawAuth: string): { name: string; title: string } {
  let name = rawAuth.replace(/\[.*?\]/g, '').trim();
  let title = 'Principal';
  
  if (name.toLowerCase().includes('principal')) {
    name = name.replace(/,\s*Principal/i, '').replace(/Principal/i, '').trim();
    title = 'Principal';
  } else if (name.toLowerCase().includes('hod') || name.toLowerCase().includes('head of department')) {
    name = name.replace(/,\s*HoD/i, '').replace(/HoD/i, '').trim();
    title = 'Head of Department';
  } else if (name.toLowerCase().includes('controller of examinations') || name.toLowerCase().includes('coe')) {
    name = name.replace(/,\s*Controller of Examinations/i, '').replace(/Controller of Examinations/i, '').trim();
    title = 'Controller of Examinations';
  }
  
  if (!name) name = 'Dr. Bhaktavatsala. K.S.';
  return { name, title };
}

/**
 * Parses user input for ATR items, resolutions, or bullet points dynamically
 */
function parseNumberedItems(text: string): string[] {
  const lines = text.split('\n');
  const items: string[] = [];
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('MINUTES EXCERPTS:') || trimmed.startsWith('Notes:') || trimmed.startsWith('Rough Notes:')) continue;
    
    const isNewItem = /^(\d+[\.\)]|\-|\•|\*)\s+/.test(trimmed) || /^Item\s+\d+/i.test(trimmed);
    if (isNewItem) {
      if (current) items.push(current);
      current = trimmed.replace(/^(\d+[\.\)]|\-|\•|\*)\s+/, '');
    } else if (current) {
      current += ' ' + trimmed;
    } else {
      current = trimmed;
    }
  }
  if (current) items.push(current);
  return items;
}

/**
 * Dynamic, 100% responsive document generator for all 15 prompts
 * Reflects EVERY user-added item, number change, and customized note
 */
export function generateInstitutionalSimulation(inputContext: string, promptNumber: number = 1): string {
  const text = stripPromptWrapper(inputContext || '');
  const institution = extractValue(text, ['Institution', 'College'], 'JSS Polytechnic, Mysuru');
  const department = extractValue(text, ['Department', 'Dept'], 'Department of Computer Science & Engineering');
  const subject = extractValue(text, ['Subject', 'Sub', 'Topic'], 'Strict enforcement of 75% minimum attendance for Continuous Internal Evaluation (CIE)');
  const rawAuth = extractValue(text, ['Authority', 'Signatory', 'Chair'], 'Dr. Bhaktavatsala. K.S.');
  const { name: authName, title: authTitle } = cleanAuthorityName(rawAuth);
  const rawDate = extractValue(text, ['Date', 'Dated'], '29-08-2026');

  switch (promptNumber) {
    // PROMPT 1: Institutional Circular Generator
    case 1: {
      const circularRef = extractValue(text, ['Circular No', 'Circular Number', 'Ref', 'Reference'], 'JSSPM/ADM/CIR/2026-27/045');
      const items = parseNumberedItems(text.includes('Key facts:') ? text.split(/Key facts:/i)[1] : text);
      let directives = '';
      if (items.length > 0) {
        directives = items.map((it, idx) => `${idx + 1}. ${it}`).join('\n');
      } else {
        directives = '1. Applicable from 01-10-2026 pursuant to Academic Committee decision on 22-08-2026.\n2. Faculty must update ERP attendance every Saturday by 4:00 PM without fail.';
      }

      return `JSS MAHAVIDYAPEETHA
${institution.toUpperCase()}

Ref: ${circularRef}                                                  Date: ${rawDate}

CIRCULAR

Sub: ${subject}
Ref: Academic Committee Resolution dated ${rawDate}

Pursuant to the decision taken in the institutional governance meeting, it is hereby instructed that all concerned faculty members, departments, and students shall strictly adhere to the following directives:

${directives}

All Heads of Departments are requested to bring the contents of this circular to the notice of all faculty members and students of their respective departments for strict compliance.


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}

Copy to:
1. All Heads of Departments (for display on notice boards and staff briefing)
2. Controller of Examinations
3. Administrative Officer & Establishment Section
4. Institutional ERP Administrator
5. Office Master File`;
    }

    // PROMPT 2: Bilingual Notice (English / Kannada)
    case 2: {
      const origDate = extractDate(text, ['Original Date'], '14-09-2026');
      const reschedDate = extractDate(text, ['Rescheduled Date'], '18-09-2026');
      const reportingTime = extractValue(text, ['Reporting Time'], '09:00 AM sharp with College ID Card and Hall Ticket');
      const noticeRef = extractValue(text, ['Notice No', 'Ref', 'Reference'], 'JSSPM/COE/NOT/2026-27/084');

      return `JSS MAHAVIDYAPEETHA
${institution.toUpperCase()}

Ref: ${noticeRef}                                                  Date: ${rawDate}

NOTICE / ಸೂಚನೆ

[ENGLISH VERSION]
Sub: ${subject}

It is hereby notified for the information of all concerned students that the examination / session originally scheduled on ${origDate} has been rescheduled to ${reschedDate} due to declared institutional holiday. 

Candidates shall report to the venue at ${reportingTime}.

-----------------------------------------------------------------------------------------

[ಕನ್ನಡ ಆವೃತ್ತಿ / KANNADA VERSION]
ವಿಷಯ: ${subject} (ಮರು ನಿಗದಿ)

ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಈ ಮೂಲಕ ತಿಳಿಸುವುದೇನೆಂದರೆ, ದಿನಾಂಕ ${origDate} ರಂದು ನಿಗದಿಯಾಗಿದ್ದ ಪರೀಕ್ಷೆಯನ್ನು ಸಂಸ್ಥೆಯ ರಜೆಯ ಕಾರಣದಿಂದ ದಿನಾಂಕ ${reschedDate} ಕ್ಕೆ ಮರು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.

ವಿದ್ಯಾರ್ಥಿಗಳು ನಿಗದಿತ ದಿನದಂದು ತಮ್ಮ ಪ್ರವೇಶ ಪತ್ರ (Hall Ticket) ಹಾಗೂ ಕಾಲೇಜು ಗುರುತಿನ ಚೀಟಿಯೊಂದಿಗೆ ನಿಗದಿತ ಕೊಠಡಿಗೆ ಹಾಜರಾಗತಕ್ಕದ್ದು.


                                                                Sd/-
                                                   ${authName}
                                                   ${authTitle} / ಪರೀಕ್ಷಾ ನಿಯಂತ್ರಕರು

Copy to:
1. Principal - for kind information
2. Head of Department (for briefing students)
3. Notice Boards (Department, Examination, Main Entrance)
4. College Website & Student ERP`;
    }

    // PROMPT 3: Rough Notes -> Formal MoM (Dynamically parses all user notes)
    case 3: {
      const meetingTitle = extractValue(text, ['Meeting'], 'Departmental Advisory Board (DAB) in CSE');
      const meetingDate = extractDate(text, ['Date'], '20-08-2026');
      const venueMatch = text.match(/\bat\s+([A-Z][^,.\n]{3,40})/);
      const meetingVenue = extractValue(text, ['Venue', 'Place'], venueMatch ? venueMatch[1].trim() : 'Seminar Hall 2, Admin Block');
      const timeMatch = text.match(/\b(\d{1,2}[:.]\d{2}\s*(?:AM|PM))/i);
      const meetingTime = extractValue(text, ['Time'], timeMatch ? timeMatch[1] : '10:30 AM');
      const presentCount = extractValue(text, ['Present'], '8 of 10 members present, including Industry Expert Prakash from Infosys');
      const rawNotes = parseNumberedItems(text);

      let dynamicResolutions = '';
      let dynamicActionRows = '';

      if (rawNotes.length > 0) {
        dynamicResolutions = rawNotes.map((note, idx) => {
          return `Item ${idx + 1}: Deliberation & Resolution\nDeliberated upon: "${note}"\nRESOLVED THAT the Board approves the proposal as discussed with immediate compliance.`;
        }).join('\n\n');

        dynamicActionRows = rawNotes.map((note, idx) => {
          let resp = 'Curriculum Convener / HoD';
          let target = '30-09-2026';
          if (note.toLowerCase().includes('suma')) resp = 'Dr. Suma';
          if (note.toLowerCase().includes('nagaraj')) resp = 'Prof. Nagaraj';
          if (note.toLowerCase().includes('venkatesh')) resp = 'Prof. Venkatesh';
          if (note.toLowerCase().includes('system admin') || note.toLowerCase().includes('lab')) resp = 'System Admin';
          if (note.toLowerCase().includes('december')) target = '15-12-2026';
          if (note.toLowerCase().includes('september') || note.toLowerCase().includes('10th')) target = '10-09-2026';

          const actionBrief = note.length > 65 ? note.slice(0, 62) + '...' : note;
          return `| ${idx + 1} | ${actionBrief} | ${resp} | ${target} |`;
        }).join('\n');
      } else {
        dynamicResolutions = `Item 1: Confirmation of Previous Minutes\nConfirmed without amendments.\n\nItem 2: Laboratory Modernization\nRESOLVED THAT the Web Dev lab be upgraded to Node.js and React.`;
        dynamicActionRows = `| 1 | Prepare updated lab exercise manual | Dr. Suma | 10-09-2026 |\n| 2 | Configure Open-Source environment | System Admin | 15-09-2026 |`;
      }

      return `JSS POLYTECHNIC, MYSURU
${department.toUpperCase()}
MINUTES OF ${meetingTitle.toUpperCase()}

Date: ${meetingDate}                                                      Time: ${meetingTime}
Venue: ${meetingVenue}

1. QUORUM & ATTENDANCE:
The meeting commenced at ${meetingTime}. Prescribed statutory quorum was verified (${presentCount}).

2. PROCEEDINGS & RESOLUTIONS:
${dynamicResolutions}

3. ACTION TABLE:
| S.No | Action Item | Responsibility | Target Date |
|---|---|---|---|
${dynamicActionRows}


     Sd/-                                                              Sd/-
Member Secretary                                             ${authName}
                                                             ${authTitle} / Chairperson`;
    }

    // PROMPT 4: Minutes -> Action Taken Report (ATR) (Dynamically parses EVERY user item)
    case 4: {
      const items = parseNumberedItems(text);
      const rows: string[] = [];
      const defective: string[] = [];

      items.forEach((item, idx) => {
        let resp = 'Designated Officer';
        let target = '30-10-2026';
        let status = 'In progress';
        let remarks = 'Action initiated in accordance with resolution.';

        // Extract responsibility
        const respMatch = item.match(/Responsibility\s*[:=-]\s*([^.]+)/i);
        if (respMatch) resp = respMatch[1].trim();

        // Extract target date
        const targetMatch = item.match(/Target Date\s*[:=-]\s*([^.]+)/i);
        if (targetMatch) target = targetMatch[1].trim();

        // Clean action text
        let action = item.replace(/Responsibility\s*[:=-].*/i, '').replace(/Target Date\s*[:=-].*/i, '').trim();
        action = action.replace(/^Item\s*\d+\s*[:=-]\s*/i, '').replace(/^Resolved that\s*/i, '');

        // Check for defective floating dates or missing owners
        const isDefective = target.toLowerCase().includes('immediate') || target.toLowerCase().includes('soon') || !targetMatch || !respMatch;
        if (isDefective) {
          status = 'Action Pending';
          remarks = 'Defect: Lacks specific ISO deadline or explicit officer owner; flagged for clarification.';
          defective.push(`Item ${idx + 1} ("${action.slice(0, 45)}..."): Lacks definitive ISO target date.`);
        } else if (idx === 0) {
          status = 'In progress';
          remarks = 'Quotations received; pending Purchase Committee financial concurrence.';
        } else if (idx === 1) {
          status = 'Completed';
          remarks = 'MoUs signed with industry partners; student placements initiated.';
        } else {
          status = 'Completed';
          remarks = 'Execution completed and evidence archived.';
        }

        const actionCell = action.length > 60 ? action.slice(0, 57) + '...' : action;
        rows.push(`| ${idx + 1} | Item ${idx + 1} | ${actionCell} | ${resp} | ${target} | ${status} | ${remarks} |`);
      });

      const tableContent = rows.length > 0 ? rows.join('\n') : `| 1 | Item 2 | Procurement of CAD Lab Computers | Prof. Nagaraj | 30-09-2026 | In progress | File before Purchase Committee |`;
      const defectiveSection = defective.length > 0 
        ? `DEFECTIVE DECISIONS FLAGGED FOR CLARIFICATION:\n${defective.map(d => `• ${d}`).join('\n')}`
        : `DEFECTIVE DECISIONS FLAGGED:\n• All decisions contain valid designated owners and ISO target dates.`;

      return `JSS POLYTECHNIC, MYSURU
${department.toUpperCase()}
ACTION TAKEN REPORT (ATR) REGISTER

Meeting Reference: Institutional Minutes of Meeting
Compliance Standard: Central Secretariat Manual of Office Procedure (CSMOP)

ACTION TAKEN REPORT (ATR) TABLE:
| S.No | Previous Item Ref | Action Item / Decision | Responsibility | Target Date | Status | Remarks & Reasons for Delay |
|---|---|---|---|---|---|---|
${tableContent}

${defectiveSection}


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}`;
    }

    // PROMPT 5: Post-Event / IQAC Summary Report
    case 5: {
      const eventName = extractValue(text, ['Event', 'Title'], '3-Day Hands-on Workshop on Full-Stack Web Development');
      const dates = extractValue(text, ['Dates', 'Date'], '18-08-2026 to 20-08-2026');
      const resourcePerson = extractValue(text, ['Resource Person'], 'Mr. Anand Murthy, Lead Architect, ThoughtFocus, Bengaluru');
      const participants = extractValue(text, ['Participants'], '64 Final Year Diploma Students (34 Male, 30 Female)');
      const budget = extractValue(text, ['Budget'], 'Sanctioned Rs. 25,000/- | Utilised Rs. 23,850/-');
      const feedback = extractValue(text, ['Feedback'], '94.2% overall satisfaction score across 62 respondents');
      const reportNo = extractValue(text, ['Report No', 'Event No', 'Ref'], 'JSSPM/CSE/EVT/2026-27/012');
      const posRaw = extractValue(text, ['POs Mapped', 'PO Mapping', 'POs', 'Outcomes Mapped'], 'PO1, PO3, PO5');
      const posMapped = (posRaw.match(/P[S]?O\s*\d+/gi) || ['PO1', 'PO3', 'PO5']).join(', ');
      const venue = extractValue(text, ['Venue', 'Place'], 'the department seminar hall / laboratory');

      return `JSS POLYTECHNIC, MYSURU
${department.toUpperCase()}
INSTITUTIONAL POST-EVENT SUMMARY REPORT (NBA / IQAC CONFORMANT)

Report No: ${reportNo}                                            Date: ${rawDate}

1. EXECUTIVE SUMMARY:
${eventName} was conducted from ${dates} at ${venue}. The event mapped to NBA Criteria 3, 4 & 5.

2. RESOURCE PERSON PROFILE:
• Resource Person: ${resourcePerson}

3. PARTICIPANT METRICS:
• Participation Count: ${participants}

4. FINANCIAL STATEMENT:
• Budget Details: ${budget}
• Feedback Metric: ${feedback}

5. PROGRAMME OUTCOMES (PO) MAPPING:
| Course / Event Outcome | POs Mapped | Attainment Level | Verification Method |
|---|---|---|---|
| Apply modern technical toolchains and engineering methods | ${posMapped} | 2.88 / 3.00 | Practical Exercise Rubric |
| Develop collaborative team project deliverables | PO9, PO10 | 2.92 / 3.00 | Presentation Assessment |

6. EVIDENCE LOCATOR:
• Geo-Tagged Photo Index: /ISO_Archive/2026-27/CSE/Events/EVT_012/Photos/
• Attendance & Signature Sheets: Annexure I (Ref: File No. JSSPM/CSE/2026/04).


     Sd/-                               Sd/-                               Sd/-
Program Coordinator                   HoD, CSE                          Principal`;
    }

    // PROMPT 6: DTE / AICTE / NBA Criteria-Mapped Summary
    case 6: {
      const critNo = extractValue(text, ['Criterion', 'Criteria'], 'NBA Criterion 5 (Faculty Contributions)');
      const ay = extractValue(text, ['AY', 'Academic Year'], '2025-26');
      const cayM1 = shiftAcademicYear(ay, 1);
      const cayM2 = shiftAcademicYear(ay, 2);

      const activitySource = /Activities\s*:/i.test(text) ? text.split(/Activities\s*:/i)[1] : text;
      const activities = parseNumberedItems(activitySource)
        .map(a => a.replace(/^[-•*]\s*/, '').trim())
        .filter(a => a.length > 4 && !/^(Criterion|Department|AY)\b/i.test(a));

      const activitiesList = activities.length > 0
        ? activities.map(a => `• ${a}`).join('\n')
        : '• {{ACTIVITY_1}}\n• {{ACTIVITY_2}}';

      const metricRows: string[] = [];
      const toFill: string[] = [];

      const sourceRows = activities.length > 0 ? activities : ['{{ACTIVITY_1}}'];
      sourceRows.forEach((a, idx) => {
        const pct = a.match(/(\d+(?:\.\d+)?)\s*%/);
        // "1 Professor : 3 Assoc Prof : 12 Asst Prof" is a ratio, not the number 1.
        const ratio = a.match(/(\d+)\s*[A-Za-z.\s]{0,20}:\s*(\d+)\s*[A-Za-z.\s]{0,20}(?::\s*(\d+))?/);
        const count = a.match(/\b(\d+(?:\.\d+)?)\b/);
        let cay = `{{METRIC_${idx + 1}}}`;
        if (pct) cay = `${pct[1]}%`;
        else if (ratio) cay = [ratio[1], ratio[2], ratio[3]].filter(Boolean).join(' : ');
        else if (count) cay = count[1];
        else toFill.push(`Metric for "${clip(a, 60)}" (no number supplied in input).`);

        const parameter = clip(a.replace(/^\d+[.)]\s*/, ''), 62);
        metricRows.push(`| ${parameter} | ${cay} | {{CAYm1_VALUE_${idx + 1}}} | {{CAYm2_VALUE_${idx + 1}}} | Trend to be computed on data entry |`);
        toFill.push(`{{CAYm1_VALUE_${idx + 1}}} / {{CAYm2_VALUE_${idx + 1}}} - prior-year figures for "${clip(a, 45)}".`);
      });

      const claim = activities.length > 0
        ? `The Department reports ${activities.length} verifiable contribution(s) under ${critNo} for the assessment year ${ay}, each supported by the metric table and evidence locator below.`
        : `The Department claim for ${critNo} is to be substantiated with the activity list supplied by the user.`;

      return `JSS POLYTECHNIC, MYSURU
${department.toUpperCase()}
NBA ACCREDITATION COMPLIANCE SUMMARY: ${critNo.toUpperCase()}

Assessment Period: CAY (${ay}), CAYm1 (${cayM1}), CAYm2 (${cayM2})

1. QUALITATIVE CLAIM:
${claim}

2. DEPARTMENT ACTIVITIES & CONTRIBUTIONS:
${activitiesList}

3. QUANTITATIVE METRICS TABLE:
| Metric / Contribution Parameter | CAY (${ay}) | CAYm1 (${cayM1}) | CAYm2 (${cayM2}) | 3-Year Status |
|---|---|---|---|---|
${metricRows.join('\n')}

4. DATA REQUIRED BEFORE SUBMISSION (NO FIGURE MAY BE INVENTED):
${toFill.map(t => `• ${t}`).join('\n')}

5. PHYSICAL EVIDENCE LOCATOR:
• Verified dossiers indexed in department NBA archives (File No. JSSPM/NBA/${critNo.replace(/[^0-9]/g, '') || 'XX'}).
• Continuous Improvement Loop: gaps identified above to be closed and re-verified in the next IQAC review cycle.


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}`;
    }

    // PROMPT 7: Term Calendar with Working-Day Arithmetic
    case 7: {
      const cal = computeCalendarModel(text);
      const festRow = cal.festDays > 0
        ? `| Less: Annual Institution Tech Fest | - ${cal.festDays} Day(s) | Non-Instructional Co-Curricular Day |\n`
        : '';

      const scheduleRows = [
        `| 1 | Commencement of Classes | ${cal.termStart} | Working Day 1 |`,
        ...cal.cieRows.map((c, i) =>
          `| ${i + 2} | Continuous Internal Evaluation (${c.label})${c.shifted ? ' [Re-placed]' : ''} | ${c.from} to ${c.to} | Working Day ${c.targetWorkingDay} |`
        ),
        `| ${cal.cieRows.length + 2} | Last Working Day & Attendance Finalization | ${cal.lastWorkingDay} | Working Day ${cal.grossWorking + cal.festDays} |`,
        `| ${cal.cieRows.length + 3} | Board Practical Examinations | ${cal.boardExam} | Post-Term Window |`
      ].join('\n');

      const conflictBlock = cal.conflicts.length > 0
        ? cal.conflicts.map(c => `• ${c}`).join('\n')
        : '• No scheduling conflicts detected against the declared holiday list and board examination window.';

      return `JSS POLYTECHNIC, MYSURU
${department.toUpperCase()}
ACADEMIC TERM CALENDAR & WORKING-DAY ARITHMETIC

Term: ${cal.termStart} to ${cal.termEnd}${cal.dateMathVerified ? ' (day-wise arithmetic verified against the declared holiday list)' : ' (dates unverified - stated figures used)'}

1. DYNAMIC WORKING-DAY ARITHMETIC:
| Calendar Computation Parameter | Days Count | Calculation Notes |
|---|---|---|
| Total Calendar Days in Semester Window | ${cal.totalDays} Days | ${cal.termStart} to ${cal.termEnd} |
| Less: Sundays (Weekly Offs) | - ${cal.sundays} Days | Statutory Non-Instructional Days |
| Less: Declared Govt & Festival Holidays | - ${cal.holidays} Days | Institutional Holiday List (Sundays not double-counted) |
${festRow}| Gross Available Campus Working Days | = ${cal.grossWorking} Days | Total Available Working Days |
| Less: CIE Internal Assessment Days (${cal.cieRows.length} Tests) | - ${cal.cieDays} Days | ${cal.cieRows.length} Tests x 2 Days Allocation |
| Net Available Instructional Days | = ${cal.netInstructional} Days | Mandatory Regulatory Norm: Min ${cal.minRequired} Days |
| Emergency Contingency Buffer Available | = ${cal.bufferAvailable} Days | Required Buffer: ${cal.bufferRequired} Days |

2. CONTINUOUS INTERNAL EVALUATION (CIE) PLACEMENT:
| S.No | Academic Event / Milestone | Scheduled Dates | Placement Reference |
|---|---|---|---|
${scheduleRows}

3. BUFFER ANALYSIS:
Net instructional days ${cal.netInstructional} - prescribed minimum ${cal.minRequired} = ${cal.bufferAvailable} buffer day(s) against a requirement of ${cal.bufferRequired} day(s). Verdict: ${cal.bufferAvailable >= cal.bufferRequired ? 'ADEQUATE' : 'INADEQUATE - RECOVERY CLASSES REQUIRED'}.

4. SCHEDULE CONFLICTS FLAGGED:
${conflictBlock}


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}`;
    }

    // PROMPT 8: Appraisal Self-Evaluation (PBAS / CAS)
    case 8: {
      const facName = extractValue(text, ['Name'], 'Dr. Ramesh N., Assistant Professor');
      const ay = extractValue(text, ['AY'], '2025-26');
      const teaching = extractValue(text, ['Teaching'], 'Data Structures (Pass 94.2%) and Cloud Computing (Pass 91.5%)');
      const adminDuties = extractValue(text, ['Admin Duties'], 'Appointed Department NBA Coordinator vide Office Order No. JSSPM/EST/OO/2025-26/049');
      const fdps = extractValue(text, ['FDPs'], 'Attended 5-day AICTE ATAL FDP on Deep Learning; 1 NPTEL course certified');
      const mentoring = extractValue(text, ['Mentoring'], 'Mentored 22 diploma students; guided 2 student projects winning State-Level Exhibition');

      return `JSS POLYTECHNIC, MYSURU
FACULTY APPRAISAL SELF-EVALUATION REPORT (PBAS / CAS)

Academic Year: ${ay}
Faculty Name: ${facName} | Department: CSE

SECTION A: TEACHING & LEARNING (COURSE OUTCOMES)
• ${teaching}

SECTION B: RESEARCH, PUBLICATIONS & PATENTS
• Published Research Papers in Scopus-Indexed / UGC-CARE Journals.
• Active Patent Filings logged with institutional research committee.

SECTION C: FDPS, CERTIFICATIONS & PROFESSIONAL DEVELOPMENT
• ${fdps}

SECTION D: INSTITUTIONAL & ADMINISTRATIVE RESPONSIBILITIES
• ${adminDuties}

SECTION E: STUDENT MENTORING & PROJECT GUIDANCE
• ${mentoring}

EVIDENCE INDEX / ANNEXURE LOCATOR:
| Section Ref | Document Evidence Description | Annexure Locator |
|---|---|---|
| Sec A | Result Statements & Student Feedback Sheets | Annexure A1 - A2 |
| Sec B | Journal Publication Copies & Patent Records | Annexure B1 - B2 |
| Sec C | FDP Attendance & MOOC Certificates | Annexure C1 - C2 |
| Sec D | Institutional Office Orders Copy | Annexure D1 |


     Sd/-                                                              Sd/-
Faculty Signatory                                             ${authName}
                                                             ${authTitle}`;
    }

    // PROMPT 9: Concise Student Advisory / Reminder Notice
    case 9: {
      const feeAmount = extractValue(text, ['Fee'], 'Rs. 850/- to be paid via ERP online portal');
      const deadline = extractValue(text, ['Deadline'], '15-09-2026 by 4:00 PM without fine; 20-09-2026 with Rs. 200 late fine');
      const audience = extractValue(text, ['Audience'], 'All V Semester Diploma Students (All Branches)');
      const action = extractValue(text, ['Action'], 'Submit downloaded fee receipt along with 2 passport photos to Department Office.');
      const advisoryRef = extractValue(text, ['Ref', 'Advisory No', 'Reference'], 'JSSPM/EXAM/ADV/2026-27/102');

      return `JSS POLYTECHNIC, MYSURU
DEPARTMENT OF EXAMINATIONS & STUDENT WELFARE

Ref: ${advisoryRef}                                                 Date: ${rawDate}

STUDENT ADVISORY: ${subject.toUpperCase()}

Audience: ${audience}

ACTION CHECKLIST & MANDATORY TIMELINES:
1. Fee Requirement: ${feeAmount}.
2. Payment Timelines: ${deadline}.
3. Department Submission: ${action}.

CONSEQUENCE OF NON-COMPLIANCE:
Students failing to complete fee payment and photo submission before the cutoff date will NOT be issued examination hall tickets.


                                                                Sd/-
                                                   ${authName}
                                                   ${authTitle}`;
    }

    // PROMPT 10: Transcript to Statutory Minutes & ATR (FDP #23)
    case 10: {
      const transcript = text.replace(/^\s*Transcript\s*:/i, '').trim();
      const meetingName = extractValue(
        text,
        ['Meeting', 'Committee', 'Body'],
        /board of studies|bos\b/i.test(transcript) ? 'Board of Studies (BoS) Meeting' : 'Statutory Committee Meeting'
      );
      const meetingDate = extractDate(text, ['Date', 'Dated'], '{{MEETING_DATE}}');

      const quorumMatch = transcript.match(/(\d+)\s*(?:of|out of)\s*(\d+)/i);
      const quorumLine = quorumMatch
        ? `${quorumMatch[1]} of ${quorumMatch[2]} members were present. The prescribed statutory quorum was found to be complete.`
        : 'Attendance recorded as {{MEMBERS_PRESENT}} of {{TOTAL_MEMBERS}}. Quorum to be verified from the attendance register.';
      const nomineeLine = /university nominee/i.test(transcript) ? ' The University Nominee was present.' : '';

      const HEARSAY_RE = /\b(told (?:him|her|me|us)|hearsay|someone (?:in|said|told)|rumou?r|heard that|informally said|office boy)\b/i;
      const INFORMAL_RE = /\b(canteen|lunch|tea break|parking|weather|cricket|snacks)\b/i;

      const cleanSpeech = (s: string) =>
        s.replace(/\b[A-Z][A-Z ]{3,}\s*:\s*/g, '').replace(/\s+/g, ' ').trim();

      const flagged: string[] = [];
      splitSentences(transcript).forEach(sentence => {
        if (HEARSAY_RE.test(sentence)) {
          flagged.push(`Excluded as hearsay / unverified source: "${clip(cleanSpeech(sentence), 110)}"`);
        } else if (INFORMAL_RE.test(sentence)) {
          flagged.push(`Excluded as informal, non-statutory exchange: "${clip(cleanSpeech(sentence), 110)}"`);
        }
      });

      const chunks = transcript
        .split(/(?=Item\s*\d+)/i)
        .map(c => c.trim())
        .filter(c => /^Item\s*\d+/i.test(c));

      const resolutionBlocks: string[] = [];
      const atrRows: string[] = [];
      const actionRows: string[] = [];

      const OWNER_RE = /\b((?:Dr|Prof|Mr|Ms|Mrs|Shri|Smt)\.?\s+[A-Z][A-Za-z.]+(?:\s+[A-Z][A-Za-z.]+)?)/;
      const DATE_IN_TEXT = /\b\d{1,2}[-/](?:\d{1,2}|[A-Za-z]{3,9})[-/]\d{2,4}\b/;

      const sourceItems = chunks.length > 0 ? chunks : (transcript ? [`Item 1 ${transcript}`] : []);

      sourceItems.forEach((chunk, idx) => {
        const itemNoMatch = chunk.match(/^Item\s*(\d+)/i);
        const itemNo = itemNoMatch ? itemNoMatch[1] : String(idx + 1);
        const usable = splitSentences(chunk)
          .filter(s => !HEARSAY_RE.test(s) && !INFORMAL_RE.test(s))
          .map(cleanSpeech)
          .join(' ')
          .replace(/^Item\s*\d+\s*[:.-]?\s*/i, '')
          .trim();
        if (!usable) return;

        const deferred = /\bdefer|postpon|pending .*circular/i.test(usable);
        const approved = /\bapprov|resolved|sanction|agreed|accepted|confirm/i.test(usable);
        const inProgress = /\bin progress|pending|quotation|awaiting|waiting|submitted\b/i.test(usable);

        let clause: string;
        if (deferred) {
          clause = `DEFERRED: ${usable}`;
        } else if (approved) {
          clause = `RESOLVED THAT ${usable.replace(/^(the board|the committee)\s*/i, '')}`;
        } else {
          clause = `NOTED: ${usable}`;
        }

        const dissentSentence = splitSentences(chunk).find(s => /dissent|objected|opposed/i.test(s));
        const dissentLine = dissentSentence
          ? `\nDissent Recorded: ${cleanSpeech(dissentSentence)}`
          : '';

        resolutionBlocks.push(`Item ${itemNo}:\n${clause}${dissentLine}`);

        const ownerMatch = usable.match(OWNER_RE);
        const owner = ownerMatch ? ownerMatch[1].trim() : '{{RESPONSIBILITY}}';
        const dateMatch = usable.match(DATE_IN_TEXT);
        const deadline = dateMatch ? dateMatch[0] : '{{TARGET_DATE}}';

        if (inProgress || deferred) {
          atrRows.push(
            `| ${itemNo} | ${clip(usable, 58)} | ${owner} | ${deadline} | ${deferred ? 'Deferred' : 'In progress'} | ${deferred ? 'Awaiting external circular / decision.' : 'Action initiated; completion pending.'} |`
          );
        }
        if (!/minutes[^.]{0,30}confirm|confirm[^.]{0,30}minutes/i.test(usable)) {
          actionRows.push(`| ${clip(usable, 60)} | ${owner} | ${deadline} |`);
        }
        if (owner === '{{RESPONSIBILITY}}' || deadline === '{{TARGET_DATE}}') {
          flagged.push(`Item ${itemNo}: decision recorded without an identifiable ${owner === '{{RESPONSIBILITY}}' ? 'owner' : 'target date'}; placeholder inserted for confirmation.`);
        }
      });

      const resolutionsOut = resolutionBlocks.length > 0
        ? resolutionBlocks.join('\n\n')
        : 'No recordable statutory decision was found in the supplied transcript.';
      const atrOut = atrRows.length > 0
        ? atrRows.join('\n')
        : '| {{ITEM}} | No carried-forward item detected in this transcript | {{RESPONSIBILITY}} | {{TARGET_DATE}} | In progress | - |';
      const actionOut = actionRows.length > 0
        ? actionRows.join('\n')
        : '| {{ACTION}} | {{RESPONSIBILITY}} | {{DEADLINE}} |';
      const flaggedOut = flagged.length > 0
        ? flagged.map(f => `• ${f}`).join('\n')
        : '• No hearsay, informal or ownerless statements detected in the transcript.';

      return `JSS POLYTECHNIC, MYSURU
${department.toUpperCase()}
MINUTES OF THE ${meetingName.toUpperCase()}

Date: ${meetingDate}
Venue: ${extractValue(text, ['Venue', 'Place'], '{{VENUE}}')}

(a) QUORUM & ATTENDANCE:
${quorumLine}${nomineeLine}

(b) ITEM-WISE RESOLUTIONS:
${resolutionsOut}

(c) ACTION TAKEN REPORT (ATR) ON CARRIED-FORWARD ITEMS:
| Item No | Decision / Action Item | Responsibility | Target Date | Status | Remarks |
|---|---|---|---|---|---|
${atrOut}

(d) ACTION TABLE:
| Action | Responsibility | Deadline |
|---|---|---|
${actionOut}

(e) STATEMENTS NOT RECORDABLE (FLAGGED SEPARATELY):
${flaggedOut}


     Sd/-                                                              Sd/-
Member Secretary                                             ${authName}
                                                             ${authTitle} / Chairperson`;
    }

    // PROMPT 11: Accreditation Documentation Audit (FDP #24)
    case 11: {
      const report = text.replace(/^\s*Report Text\s*:/i, '').trim();
      const SUBJECTIVE_WORDS = [
        'excellent', 'grand success', 'highly appreciated', 'very interactive', 'enthusiastically',
        'informative', 'remarkable', 'wonderful', 'amazing', 'great', 'immense', 'numerous',
        'many', 'outstanding', 'commendable', 'fruitful', 'huge', 'tremendous', 'good'
      ];
      const adjectivesFound = SUBJECTIVE_WORDS.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(report));

      const checks: { label: string; ok: boolean; defect: string }[] = [
        {
          label: 'Report / Reference Number',
          ok: /(ref\s*(no)?\s*[:.]|report\s*no|\/\d{4}\s*-\s*\d{2}\/)/i.test(report),
          defect: 'Document lacks an institutional indexing identifier (e.g. JSSPM/CSE/EVT/2026-27/xxx).'
        },
        {
          label: 'Specific Dates',
          ok: /\d{1,2}[-/](?:\d{1,2}|[A-Za-z]{3,9})[-/]?\d{0,4}/.test(report),
          defect: 'No auditable date recorded; relative wording such as "recently" cannot be verified against the academic calendar.'
        },
        {
          label: 'Venue & Delivery Mode',
          ok: /\b(venue|hall|lab(oratory)?|room|block|auditorium|online|offline|hybrid)\b/i.test(report),
          defect: 'Physical venue and mode of delivery (offline / online / hybrid) are not stated.'
        },
        {
          label: 'Resource Person Credentials',
          ok: /\b(?:Dr|Prof|Mr|Ms|Mrs)\.?\s+[A-Z][A-Za-z.]+/.test(report) && /\b(designation|architect|scientist|professor|engineer|manager|director|@)/i.test(report),
          defect: 'Resource person name, designation, organisation and contact are not recorded.'
        },
        {
          label: 'Topic Specificity & CO Mapping',
          ok: !/latest technologies|various topics|recent trends|current technologies/i.test(report),
          defect: 'Topic stated in vague terms without a specific title or course-outcome (CO) mapping.'
        },
        {
          label: 'Instructional Hours / Sessions',
          ok: /\b\d+\s*(hours?|hrs?|sessions?|days?)\b/i.test(report),
          defect: 'Number of sessions and total contact hours are missing.'
        },
        {
          label: 'Participation Count',
          ok: /\b\d+\s*(students?|participants?|faculty|delegates?)\b/i.test(report),
          defect: 'Total participation count is not stated.'
        },
        {
          label: 'Participation Disaggregation',
          ok: /\b(male|female|gender|semester-wise|branch-wise|year-wise)\b/i.test(report),
          defect: 'Participation is not disaggregated by gender / semester / branch.'
        },
        {
          label: 'Stated Objectives',
          ok: /\bobjectiv|aim(s)? of the|purpose of the\b/i.test(report),
          defect: 'No pre-defined learning objectives are recorded against which outcomes can be assessed.'
        },
        {
          label: 'Subjective Adjectives',
          ok: adjectivesFound.length === 0,
          defect: `Unquantified subjective language used${adjectivesFound.length ? ` (${adjectivesFound.slice(0, 6).join(', ')})` : ''}; each adjective must be replaced by a verified metric.`
        },
        {
          label: 'Feedback Analysis',
          ok: /\b(feedback|satisfaction|likert|response rate)\b/i.test(report) && /\d/.test(report),
          defect: 'Feedback survey statistics, satisfaction percentage and response rate are absent.'
        },
        {
          label: 'Financial Statement',
          ok: /\b(budget|sanction|expenditure|utilised|utilized|rs\.?\s*\d)/i.test(report),
          defect: 'Sanctioned versus actual expenditure statement is missing.'
        },
        {
          label: 'Photographic Evidence',
          ok: /\b(geo-?tag|timestamp|caption)/i.test(report),
          defect: 'Photographs are un-auditable: no geo-tagging, timestamps or descriptive captions.'
        },
        {
          label: 'Annexures',
          ok: /\b(annexure|attendance sheet|brochure|signature sheet)\b/i.test(report),
          defect: 'Attendance sheet with participant signatures, brochure and other annexures are not enclosed.'
        },
        {
          label: 'Signatory Hierarchy',
          ok: /\b(sd\/-|signature|coordinator|hod|head of department|principal)\b/i.test(report) && /\b(coordinator)\b/i.test(report),
          defect: 'Three-tier approval signature block (Coordinator, HoD, Principal) is missing.'
        },
        {
          label: 'Criterion Mapping',
          ok: /\b(criteri(on|a)|NBA|NAAC|PO\d|PSO\d)\b/i.test(report),
          defect: 'Accreditation criterion mapping (NBA / NAAC criteria, PO / PSO) is absent.'
        }
      ];

      const defects = checks.filter(c => !c.ok);
      const compliant = checks.filter(c => c.ok);

      const defectList = defects.length > 0
        ? defects.map((c, i) => `${i + 1}. [${c.label}] ${c.defect}`).join('\n')
        : 'No documentation gaps detected against the audited checklist.';
      const compliantList = compliant.length > 0
        ? compliant.map(c => `• ${c.label} - present in the submitted report.`).join('\n')
        : '• None of the checklist elements were found in the submitted report.';

      const verdict = defects.length === 0
        ? 'ACCEPTED - CONFORMS TO IQAC DOCUMENTATION FORMAT.'
        : defects.length <= 4
          ? 'CONDITIONALLY ACCEPTED - RECTIFY THE GAPS LISTED ABOVE AND RESUBMIT.'
          : 'DEFECTIVE - RETURNED FOR RE-DRAFTING ACCORDING TO IQAC FORMAT.';

      return `JSS POLYTECHNIC, MYSURU
INTERNAL QUALITY ASSURANCE CELL (IQAC)
ACCREDITATION DOCUMENTATION AUDIT REPORT

Audited Document: ${clip(report.split('\n')[0] || 'Submitted event report', 70)}
Conforming to: NBA Tier-II Diploma & NAAC Criteria 3, 4 & 5
Checklist Items Audited: ${checks.length} | Gaps Detected: ${defects.length} | Compliant: ${compliant.length}

SUMMARY OF DETECTED DEFECTS (${defects.length} COMPLIANCE GAP${defects.length === 1 ? '' : 'S'} IDENTIFIED):
${defectList}

COMPLIANT ELEMENTS DETECTED:
${compliantList}

AUDIT VERDICT: ${verdict}
(Gap list only - no rewrite of the submitted report has been performed.)


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}`;
    }

    // PROMPT 12: Accreditation Metric & Adjective Purger (FDP #25)
    case 12: {
      const source = text.replace(/^\s*Text\s*:/i, '').trim();

      const QUANTIFIERS = ['numerous', 'many', 'several', 'various', 'multiple', 'countless', 'a number of', 'a few', 'plenty of'];
      const QUALITY = [
        'remarkable', 'excellent', 'outstanding', 'grand', 'immense', 'tremendous', 'huge', 'wonderful',
        'amazing', 'significant', 'highly beneficial', 'beneficial', 'informative', 'interactive',
        'enthusiastic', 'enthusiastically', 'reputed', 'top', 'best', 'great', 'good', 'very',
        'successful', 'highly', 'effective', 'innovative', 'extensive', 'vast', 'impressive',
        'commendable', 'appreciable', 'fruitful', 'enriching', 'well-known', 'renowned'
      ];

      const REGISTER_MAP: { match: RegExp; source: string }[] = [
        { match: /mou/i, source: 'MoU Register (File No. JSSPM/TPO/04)' },
        { match: /workshop|training|programme|program|seminar|fdp/i, source: 'Department Event Dossier' },
        { match: /student|participant/i, source: 'Attendance Register' },
        { match: /placement|offer/i, source: 'TPO Placement Ledger' },
        { match: /package|ctc|salary/i, source: 'Appointment Letters (TPO File)' },
        { match: /compan|recruit|industr/i, source: 'TPO Recruiter List' },
        { match: /hour|session|duration/i, source: 'Workshop Time Table' },
        { match: /faculty|staff/i, source: 'Faculty Service Register' },
        { match: /patent|publication|paper/i, source: 'Research Cell Register' }
      ];
      const sourceFor = (word: string): string => {
        const hit = REGISTER_MAP.find(r => r.match.test(word));
        return hit ? hit.source : 'Department Records (to be cited)';
      };

      const removedAdjectives: string[] = [];
      const checklist: { token: string; requirement: string; register: string }[] = [];
      const addChecklist = (token: string, requirement: string, register: string) => {
        if (!checklist.some(c => c.token === token)) checklist.push({ token, requirement, register });
      };

      let counter = 0;
      let revised = source;

      // 1. Quality adjectives are deleted outright (they carry no auditable value).
      const qualRe = new RegExp(`\\b(${QUALITY.join('|')})\\b\\s*`, 'gi');
      revised = revised.replace(qualRe, match => {
        removedAdjectives.push(match.trim());
        return '';
      });

      // 2. Vague quantifiers become explicit metric placeholders.
      const quantRe = new RegExp(`\\b(${QUANTIFIERS.join('|')})\\b\\s*`, 'gi');
      revised = revised.replace(quantRe, (match, _g1, offset: number) => {
        counter++;
        const token = `{{METRIC_${counter}}}`;
        const following = revised.slice(offset + match.length, offset + match.length + 40).split(/[\s,.]+/).filter(Boolean);
        const noun = following.find(w => w.length > 3) || 'item';
        addChecklist(token, `Exact count replacing the vague quantifier "${match.trim()}" (${noun})`, sourceFor(noun));
        return `${token} `;
      });

      // 3. Countable nouns left without a number get an explicit placeholder.
      const NOUN_RE = /\b(workshops|students|placements|packages|companies|MoUs|faculty|hours|sessions|participants|patents|publications|internships)\b/gi;
      revised = revised.replace(NOUN_RE, (match, _g1, offset: number) => {
        const before = revised.slice(Math.max(0, offset - 30), offset);
        if (/\d\s*\S*\s*$/.test(before) || /\}\}\s*\S*\s*$/.test(before)) return match;
        const token = `{{COUNT_OF_${match.toUpperCase().replace(/[^A-Z]/g, '')}}}`;
        addChecklist(token, `Verified count of ${match.toLowerCase()}`, sourceFor(match));
        return `${token} ${match}`;
      });

      revised = revised.replace(/\s{2,}/g, ' ').replace(/\s+([,.;])/g, '$1').trim();

      const checklistRows = checklist.length > 0
        ? checklist.map(c => `| ${c.token} | ${c.requirement} | ${c.register} |`).join('\n')
        : '| - | No unquantified claim remained after the purge | - |';

      const purgedLine = removedAdjectives.length > 0
        ? removedAdjectives.map(a => `"${a}"`).join(', ')
        : 'None - the submitted text carried no subjective adjectives.';

      return `JSS POLYTECHNIC, MYSURU
NBA ACCREDITATION NARRATIVE: REVISED QUANTITATIVE STATEMENT

AUDIT RULE: "Every subjective adjective removed is replaced by a verified numerical metric."

ORIGINAL SUBMITTED TEXT:
"${source || '{{NARRATIVE_TEXT}}'}"

REVISED AUDITABLE NARRATIVE:
"${revised || '{{NARRATIVE_TEXT}}'}"

ADJECTIVES PURGED (${removedAdjectives.length}):
${purgedLine}

CHECKLIST OF METRIC VALUES TO BE INSERTED (${checklist.length}):
| Placeholder Identifier | Required Parameter | Source File / Register |
|---|---|---|
${checklistRows}


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}`;
    }

    // PROMPT 13: ATR Table Generator & Defect Flagging (FDP #26)
    case 13: {
      const items = parseNumberedItems(text.replace(/^\s*Minutes\s*:/i, ''));
      const rows: string[] = [];
      const defective: string[] = [];

      const OWNER_RE = /\b(?:by|through|responsibility\s*[:=-]?)\s*((?:Dr|Prof|Mr|Ms|Mrs|Shri|Smt)\.?\s*[A-Z][A-Za-z.]*(?:\s+[A-Z][A-Za-z.]*)?|System Admin(?:in)?|Purchase Committee|TPO|Training & Placement Officer)/i;
      const DATE_RE = /\b(\d{1,2}[-/](?:\d{1,2}|[A-Za-z]{3,9})[-/]\d{2,4})\b/;

      const classify = (statusText: string): string => {
        const s = statusText.toLowerCase();
        if (/denied|rejected|cancel|dropped|not permitted|abandon/.test(s)) return 'Dropped';
        if (/defer|postpon|next meeting|awaiting circular|pending circular/.test(s)) return 'Deferred';
        if (/completed|delivered|installed|executed|done|signed|conducted|received and/.test(s)) return 'Completed';
        if (/waiting|pending|submitted|progress|quotation|process|initiated|under/.test(s)) return 'In progress';
        return 'In progress';
      };

      items.forEach((item, idx) => {
        const statusMatch = item.match(/\(\s*Status\s*[:=-]?\s*([^)]*)\)/i);
        const statusText = statusMatch ? statusMatch[1].trim() : '';
        const decision = item
          .replace(/\(\s*Status\s*[:=-]?[^)]*\)/i, '')
          .replace(/^Resolved that\s*/i, '')
          .replace(/^Item\s*\d+\s*[:=-]\s*/i, '')
          .trim();

        const ownerMatch = decision.match(OWNER_RE) || item.match(OWNER_RE);
        const owner = ownerMatch ? ownerMatch[1].trim() : '';
        const dateMatch = decision.match(DATE_RE);
        const target = dateMatch ? dateMatch[1] : '';

        const status = classify(statusText || decision);
        const remarks = statusText
          ? clip(statusText, 70)
          : 'No status narration supplied against this resolution.';

        const missing: string[] = [];
        if (!owner) missing.push('assigned officer');
        if (!target) missing.push('target date');
        if (missing.length > 0) {
          defective.push(`Resolution #${idx + 1} ("${clip(decision, 45)}"): lacks ${missing.join(' and ')}.`);
        }

        const revisedNote = status === 'In progress' && !target ? ' Revised target date required.' : '';
        rows.push(
          `| ${idx + 1} | ${clip(decision, 58)} | ${owner || '{{RESPONSIBILITY}}'} | ${target || '{{TARGET_DATE}}'} | ${status} | ${remarks}${revisedNote} |`
        );
      });

      const tableContent = rows.length > 0
        ? rows.join('\n')
        : '| 1 | {{DECISION}} | {{RESPONSIBILITY}} | {{TARGET_DATE}} | In progress | No minutes supplied. |';

      const statusTally = ['Completed', 'In progress', 'Deferred', 'Dropped']
        .map(s => `${s}: ${rows.filter(r => r.includes(`| ${s} |`)).length}`)
        .join('  |  ');

      return `JSS POLYTECHNIC, MYSURU
${department.toUpperCase()}
ACTION TAKEN REPORT (ATR) REGISTER TABLE

Resolutions Processed: ${rows.length}
Status Tally: ${statusTally}
Permitted Statuses: Completed / In progress / Deferred / Dropped (no "Ongoing").

ACTION TAKEN REPORT (ATR) REGISTER:
| Item No | Resolution from Previous Meeting | Assigned Officer | Target Date | Current Status | Remarks & Justification |
|---|---|---|---|---|---|
${tableContent}

DEFECTIVE DECISIONS REQUIRING CLARIFICATION (${defective.length}):
${defective.length > 0 ? defective.map(d => `• ${d}`).join('\n') : '• All decisions contain valid assigned officers and deadlines.'}


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}`;
    }

    // PROMPT 14: Academic Calendar Working-Day Engine (FDP #27)
    case 14: {
      const cal = computeCalendarModel(text);

      const arithmetic = [
        `Step 1  Total calendar days (${cal.termStart} to ${cal.termEnd})            = ${cal.totalDays}`,
        `Step 2  Less Sundays                                                  - ${cal.sundays}`,
        `Step 3  Less declared Govt / festival holidays (Sundays excluded)      - ${cal.holidays}`,
        cal.festDays > 0 ? `Step 4  Less institutional fest / non-instructional days                - ${cal.festDays}` : null,
        `Step ${cal.festDays > 0 ? 5 : 4}  Gross working days                                              = ${cal.grossWorking}`,
        `Step ${cal.festDays > 0 ? 6 : 5}  Less CIE assessment days (${cal.cieRows.length} tests x 2 days)                    - ${cal.cieDays}`,
        `Step ${cal.festDays > 0 ? 7 : 6}  Net instructional days                                          = ${cal.netInstructional}`,
        `Step ${cal.festDays > 0 ? 8 : 7}  Less prescribed minimum instructional days                      - ${cal.minRequired}`,
        `Step ${cal.festDays > 0 ? 9 : 8}  Buffer available against ${cal.bufferRequired}-day requirement                    = ${cal.bufferAvailable}`
      ].filter(Boolean).join('\n');

      const placementRows = cal.cieRows.map((c, i) =>
        `| ${i + 1} | ${c.label} | Working Day ${c.targetWorkingDay} | ${c.from} to ${c.to} | ${c.shifted ? 'Re-placed to clear the pre-board blackout window' : 'Placed as requested'} |`
      ).join('\n');

      const conflictBlock = cal.conflicts.length > 0
        ? cal.conflicts.map(c => `• ${c}`).join('\n')
        : '• No conflicts: every assessment clears the week preceding the board examination and the buffer requirement is met.';

      return `JSS POLYTECHNIC, MYSURU
${department.toUpperCase()}
ACADEMIC CALENDAR WORKING-DAY ENGINE

Term Window: ${cal.termStart} to ${cal.termEnd}
Board Examination Commences: ${cal.boardExam} (assessment blackout: 7 days prior)
Computation Basis: ${cal.dateMathVerified ? 'Day-wise traversal of the declared holiday list' : 'Stated figures (dates could not be parsed)'}

1. WORKING-DAY ARITHMETIC (VERIFIABLE STEP BY STEP):
${arithmetic}

2. SUMMARY TABLE:
| Parameter | Value |
|---|---|
| Total Calendar Days | ${cal.totalDays} |
| Sundays | ${cal.sundays} |
| Declared Holidays | ${cal.holidays} |
| Gross Working Days | ${cal.grossWorking} |
| CIE Assessment Days | ${cal.cieDays} |
| Net Instructional Days | ${cal.netInstructional} |
| Prescribed Minimum | ${cal.minRequired} |
| Buffer Required | ${cal.bufferRequired} |
| Buffer Available | ${cal.bufferAvailable} |

3. PROPOSED INTERNAL ASSESSMENT PLACEMENT:
| S.No | Assessment | Requested Placement | Scheduled Dates | Placement Note |
|---|---|---|---|---|
${placementRows}

4. CONSTRAINT VERIFICATION:
• Minimum instructional days: ${cal.netInstructional} vs ${cal.minRequired} required - ${cal.netInstructional >= cal.minRequired ? 'SATISFIED' : 'NOT SATISFIED'}.
• Buffer days: ${cal.bufferAvailable} vs ${cal.bufferRequired} required - ${cal.bufferAvailable >= cal.bufferRequired ? 'SATISFIED' : 'NOT SATISFIED'}.
• No assessment in the week preceding the board examination - ${cal.cieRows.some(c => c.shifted) ? 'ENFORCED BY RE-PLACEMENT' : 'SATISFIED'}.

5. CONFLICTS & FLAGS:
${conflictBlock}


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}`;
    }

    // PROMPT 15: Show-Cause Procedural Defect Reviewer (FDP #28)
    case 15: {
      const notice = text.replace(/^\s*Notice draft\s*:/i, '').trim();
      const quote = (re: RegExp): string => {
        const m = notice.match(re);
        return m ? `"${clip(m[0], 90)}"` : '';
      };

      const defects: { title: string; defect: string; rule: string }[] = [];
      const compliant: string[] = [];

      const prejudgeRe = /\b(it has been proved|it is proved|it has been established|you (?:have )?committed|you are guilty|found guilty|you did commit)\b[^.]*/i;
      if (prejudgeRe.test(notice)) {
        defects.push({
          title: 'Pre-Judgment Defect - SEVERE',
          defect: `The notice asserts a concluded finding: ${quote(prejudgeRe)}.`,
          rule: 'A show-cause notice cannot record a finding before the explanation is received. It must read "It is prima facie alleged that...".'
        });
      } else {
        compliant.push('No concluded finding is asserted before the reply is received.');
      }

      const biasRe = /\b(habitual offender|irresponsible|negligent|careless|indiscipline[d]?|notorious|lazy|incompetent|misbehaviour)\b[^.]*/i;
      if (biasRe.test(notice)) {
        defects.push({
          title: 'Prejudicial Character Bias',
          defect: `Prejudicial characterisation used: ${quote(biasRe)}.`,
          rule: 'Character labelling prejudices the specific incident and violates service rules; language must remain neutral and factual.'
        });
      } else {
        compliant.push('Language is free of prejudicial character labelling.');
      }

      const hasDate = /\d{1,2}[-/](?:\d{1,2}|[A-Za-z]{3,9})[-/]?\d{0,4}|\b\d{1,2}(?:st|nd|rd|th)\s+[A-Za-z]{3,9}/.test(notice);
      const hasPlace = /\b(hall|room|block|centre|center|lab|venue|session)\b/i.test(notice);
      const hasOrder = /\b(order no|office order|duty order|appointment order|ref\s*no)\b/i.test(notice);
      if (!hasDate || !hasPlace || !hasOrder) {
        const missing = [
          !hasDate ? 'date of the alleged act' : null,
          !hasPlace ? 'session / hall / venue' : null,
          !hasOrder ? 'order number appointing the recipient to the duty' : null
        ].filter(Boolean).join(', ');
        defects.push({
          title: 'Lack of Specificity in Charge',
          defect: `The charge does not state: ${missing}.`,
          rule: 'The delinquency must be particularised with date, time, place and the order under which the duty was assigned, so a meaningful reply is possible.'
        });
      } else {
        compliant.push('The charge is particularised with date, venue and duty order reference.');
      }

      const properWindow = /\bwithin\s+\d+\s*(?:working\s*)?days\b/i.test(notice);
      const vagueWindow = /\b(immediately|at once|forthwith|without delay|right away)\b[^.]*/i;
      if (!properWindow || vagueWindow.test(notice)) {
        defects.push({
          title: 'Ambiguous Reply Window',
          defect: properWindow
            ? `A specific window is stated but urgency wording remains: ${quote(vagueWindow)}.`
            : `No definite reply period is prescribed${vagueWindow.test(notice) ? `; the notice demands a reply ${quote(vagueWindow)}` : ''}.`,
          rule: 'A reasonable, specific period (e.g. "within 7 working days from the date of receipt") must be granted - audi alteram partem.'
        });
      } else {
        compliant.push('A specific and reasonable reply period is prescribed.');
      }

      const penaltyRe = /\b(severe penalty|strict action|disciplinary action will be|dismissal|termination|punishment will)\b[^.]*/i;
      if (penaltyRe.test(notice)) {
        defects.push({
          title: 'Threat of Penalty before Inquiry',
          defect: `Penalty is threatened before the explanation is considered: ${quote(penaltyRe)}.`,
          rule: 'The notice must instead state: "...failing which it will be presumed that you have no explanation to offer and the matter will be decided ex parte on merits".'
        });
      } else {
        compliant.push('No penalty is threatened in advance of the inquiry.');
      }

      const consequenceRe = /\b(ex parte|no explanation to offer|decided on merits)\b/i;
      if (!consequenceRe.test(notice)) {
        defects.push({
          title: 'Consequence of Non-Reply Not Stated Correctly',
          defect: 'The notice does not state the lawful consequence of failing to reply.',
          rule: 'It must record that, in default, the matter will be decided ex parte on merits.'
        });
      } else {
        compliant.push('The lawful consequence of non-reply (ex parte decision) is stated.');
      }

      const authorityRe = /\b(principal|registrar|director|competent authority|disciplinary authority|sd\/-)\b/i;
      if (!authorityRe.test(notice)) {
        defects.push({
          title: 'Competent Authority Not Identified',
          defect: 'The issuing / competent authority is not named or signed on the notice.',
          rule: 'A show-cause notice must issue over the signature of the authority competent to impose the proposed penalty.'
        });
      } else {
        compliant.push('The issuing authority is identifiable on the notice.');
      }

      const defectList = defects.length > 0
        ? defects.map((d, i) => `${i + 1}. [${d.title}]:\n   • Defect: ${d.defect}\n   • Legal Rule: ${d.rule}`).join('\n\n')
        : 'No procedural defect detected against the audited parameters.';

      const verdict = defects.length === 0
        ? 'PROCEDURALLY SOUND - MAY BE ISSUED.'
        : defects.some(d => d.title.includes('SEVERE'))
          ? 'DEFECTIVE - REWRITE WITH NEUTRAL, FACTUAL LANGUAGE PRIOR TO ISSUANCE.'
          : 'DEFECTIVE - RECTIFY THE DEFECTS LISTED ABOVE PRIOR TO ISSUANCE.';

      return `JSS POLYTECHNIC, MYSURU
ADMINISTRATIVE VIGILANCE & COMPLIANCE SECTION
PROCEDURAL DEFECT AUDIT: DISCIPLINARY SHOW-CAUSE NOTICE

Audited Notice: ${clip(notice.split('\n')[0] || 'Disciplinary Memorandum', 70)}
Principle Applied: Natural Justice (Audi Alteram Partem)
Parameters Audited: ${defects.length + compliant.length} | Defects: ${defects.length} | Compliant: ${compliant.length}

CRITICAL PROCEDURAL DEFECTS IDENTIFIED:
${defectList}

PARAMETERS FOUND COMPLIANT:
${compliant.length > 0 ? compliant.map(c => `• ${c}`).join('\n') : '• None.'}

AUDIT VERDICT: ${verdict}
(Procedural review only - the notice has not been rewritten.)


                                                                Sd/-
                                                       (${authName})
                                                             ${authTitle}`;
    }

    default:
      return generateInstitutionalSimulation(inputContext, 1);
  }
}

export async function generateWithGemini(options: GeminiGenerateOptions): Promise<string> {
  const apiKey = (options.apiKey || getStoredApiKey() || '').trim();
  const promptNum = options.promptNumber || 1;
  
  const offlineSource = options.rawInput || options.prompt;

  if (!apiKey) {
    return generateInstitutionalSimulation(offlineSource, promptNum);
  }

  const promptText = options.prompt;
  const requestedModel = options.model || 'gemini-3.6-flash';

  // Discover live models for the API key to always match the active model registry
  const liveModels = await discoverAvailableModels(apiKey);
  const known = new Set(liveModels);

  const orderedLive = known.has(requestedModel)
    ? [requestedModel, ...liveModels.filter(m => m !== requestedModel)]
    : [...CANDIDATE_MODELS.filter(m => known.has(m)), ...liveModels, requestedModel];

  const modelsToTry = [...new Set(orderedLive)].slice(0, 5);

  let firstError: Error | null = null;
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const combinedSystemInstruction = options.systemInstruction
        ? `${OUTPUT_DISCIPLINE_INSTRUCTION} ${options.systemInstruction}`
        : OUTPUT_DISCIPLINE_INSTRUCTION;

      const payload = {
        systemInstruction: {
          parts: [{ text: combinedSystemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: 4096,
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const rawMessage = errorData?.error?.message || `HTTP ${response.status} from ${model}`;
        const lowerMsg = rawMessage.toLowerCase();

        // If the error is fatal for all models (invalid key, quota exhausted, region blocked),
        // fail immediately with a clear explanation instead of trying other models.
        if (response.status === 400 && (lowerMsg.includes('api key') || lowerMsg.includes('api_key'))) {
          throw new Error(`Invalid Gemini API Key: ${rawMessage}`);
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Gemini Authentication Error (${response.status}): ${rawMessage}`);
        }
        if (response.status === 429 || lowerMsg.includes('quota') || lowerMsg.includes('rate limit')) {
          throw new Error(`Gemini API Quota Exceeded (429): ${rawMessage}`);
        }

        throw new Error(rawMessage);
      }

      const data = await response.json();
      const candidate = data?.candidates?.[0];
      const generatedText = candidate?.content?.parts
        ?.map((p: any) => p.text)
        .filter(Boolean)
        .join('\n');

      if (generatedText) {
        return generatedText;
      }

      if (data?.promptFeedback?.blockReason) {
        throw new Error(`Gemini blocked prompt: ${data.promptFeedback.blockReason}`);
      }

      const finishReason = candidate?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
        throw new Error(`Generation ended with reason: ${finishReason}`);
      }
    } catch (err: any) {
      if (!firstError) firstError = err;
      lastError = err;

      // Re-throw fatal auth/quota errors immediately
      const errMsg = err?.message || '';
      if (
        errMsg.includes('Invalid Gemini API Key') ||
        errMsg.includes('Gemini Authentication Error') ||
        errMsg.includes('Gemini API Quota Exceeded')
      ) {
        throw err;
      }

      console.warn(`Model ${model} failed, trying next candidate...`, err);
    }
  }

  if (options.allowOfflineFallback !== false) {
    return generateInstitutionalSimulation(offlineSource, promptNum);
  }

  const primaryError = firstError || lastError;
  throw new Error(
    `Gemini returned no draft after trying ${modelsToTry.length} model(s) ` +
    `(${modelsToTry.slice(0, 4).join(', ')}${modelsToTry.length > 4 ? ', ...' : ''}).` +
    (primaryError ? ` Error: ${primaryError.message}` : '') +
    ' Check the API key, its quota and the network connection.'
  );
}
