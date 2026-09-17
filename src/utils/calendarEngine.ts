/**
 * Academic calendar backwards engine.
 *
 * Walks every real date of the term, removes weekly offs, declared holidays
 * and immovable blocks, then places CIE tests, the emergency buffer and
 * institutional events on the remaining working days. Prescribed minimums
 * and buffer sizes come only from the user; nothing is assumed.
 */

export type WeeklyOff = 'sunday' | 'sunday-2-4-sat' | 'sunday-all-sat';

export interface CalendarInput {
  institution: string;
  programme: string;
  academicYear: string;
  version: string;
  refNo: string;
  authority: string;
  termStart: string;
  termEnd: string;
  weeklyOff: WeeklyOff;
  /** date | name, one per line */
  holidays: string;
  /** from | to | label, one per line (board exams, inspections, university windows) */
  immovables: string;
  boardExamStart: string;
  blackoutDays: string;
  minInstructionalDays: string;
  bufferDays: string;
  cieCount: string;
  cieDaysEach: string;
  /** optional fixed start dates, one per line: CIE-1 = 2026-09-07 */
  cieDates: string;
  resultGapDays: string;
  /** label | days | preferred date (optional) */
  events: string;
  /** version | date | change | approved by */
  amendments: string;
}

export type DayKind = 'instruction' | 'weekly-off' | 'holiday' | 'immovable' | 'cie' | 'buffer' | 'event' | 'blackout';

export interface CalendarDay {
  iso: string;
  date: Date;
  kind: DayKind;
  label: string;
  /** 1-based working-day number, when the day is a working day */
  workingDay: number | null;
}

export interface CalendarResult {
  markdown: string;
  days: CalendarDay[];
  ok: boolean;
  summary: { label: string; value: string; tone: 'good' | 'bad' | 'neutral' }[];
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Accepts 2026-08-03, 03-08-2026, 03/08/2026, 3 Aug 2026, 03-Aug-2026. */
export function parseDate(raw: string): Date | null {
  const t = (raw || '').trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return make(+m[1], +m[2], +m[3]);
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return make(+m[3], +m[2], +m[1]);
  m = t.match(/^(\d{1,2})[-\s/]([A-Za-z]{3,9})[-\s/,]+(\d{4})$/);
  if (m) {
    const mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
    if (mi >= 0) return make(+m[3], mi + 1, +m[1]);
  }
  return null;
}

function make(y: number, mo: number, d: number): Date | null {
  const dt = new Date(y, mo - 1, d, 12);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : null;
}

export function isoOf(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fmt(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} (${WEEKDAYS[d.getDay()]})`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}

function isWeeklyOff(d: Date, rule: WeeklyOff): boolean {
  if (d.getDay() === 0) return true;
  if (d.getDay() !== 6) return false;
  if (rule === 'sunday-all-sat') return true;
  if (rule === 'sunday-2-4-sat') {
    const nth = Math.ceil(d.getDate() / 7);
    return nth === 2 || nth === 4;
  }
  return false;
}

function rows(text: string): string[][] {
  return (text || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('|').map(c => c.trim()));
}

function num(s: string): number | null {
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

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export function buildAcademicCalendar(input: CalendarInput): CalendarResult {
  const issues: string[] = [];
  const missing: string[] = [];
  const notes: string[] = [];

  const start = parseDate(input.termStart);
  const end = parseDate(input.termEnd);
  if (!start) missing.push('Term start date');
  if (!end) missing.push('Term end date');
  if (start && end && end <= start) issues.push('Term end date is not after the term start date.');

  const minDays = num(input.minInstructionalDays);
  const buffer = num(input.bufferDays);
  const cieCount = num(input.cieCount);
  const cieEach = num(input.cieDaysEach);
  const blackout = num(input.blackoutDays);
  const resultGap = num(input.resultGapDays);
  const board = input.boardExamStart.trim() ? parseDate(input.boardExamStart) : null;
  if (minDays === null) missing.push('Prescribed minimum instructional days (from your regulator/university)');
  if (buffer === null) missing.push('Emergency buffer days to reserve');
  if (cieCount === null) missing.push('Number of CIE tests');
  if (cieEach === null) missing.push('Working days per CIE test');
  if (!input.boardExamStart.trim()) missing.push('Board/semester-end examination start date');
  else if (!board) issues.push(`Board examination date “${input.boardExamStart}” could not be read.`);
  if (board && blackout === null) missing.push('No-test window before the board examination (calendar days)');
  if (resultGap === null && (cieCount ?? 0) > 1) missing.push('Minimum working days between tests (for publishing results before the next test)');

  const valid = !!(start && end && end > start);
  const days: CalendarDay[] = [];

  // Holidays and immovables
  const holidayMap = new Map<string, string>();
  const holidayRows: (string | number)[][] = [];
  for (const [d = '', name = ''] of rows(input.holidays)) {
    const dt = parseDate(d);
    if (!dt) { issues.push(`Holiday date “${d}” could not be read.`); continue; }
    let effect = 'Working day lost';
    if (valid && (dt < start! || dt > end!)) effect = 'Outside the term — no effect';
    else if (isWeeklyOff(dt, input.weeklyOff)) effect = 'Falls on a weekly off — no extra day lost';
    if (holidayMap.has(isoOf(dt))) effect = 'Duplicate date — counted once';
    holidayMap.set(isoOf(dt), name || 'Declared holiday');
    holidayRows.push([fmt(dt), name || 'Not named', effect]);
  }
  if (!holidayRows.length) notes.push('No declared holidays were entered; confirm the government/university holiday list before release.');

  const immovableMap = new Map<string, string>();
  const immovableRows: (string | number)[][] = [];
  for (const [f = '', t = '', label = ''] of rows(input.immovables)) {
    const from = parseDate(f);
    const to = t ? parseDate(t) : from;
    if (!from || !to || to < from) { issues.push(`Immovable block “${f} | ${t}” has unreadable or reversed dates.`); continue; }
    for (let d = from; d <= to; d = addDays(d, 1)) immovableMap.set(isoOf(d), label || 'Immovable');
    immovableRows.push([fmt(from), fmt(to), label || 'Not named']);
  }

  const blackoutStart = board && blackout !== null ? addDays(board, -blackout) : null;
  if (board && valid && board <= end!) {
    issues.push(`Board examination (${fmt(board)}) starts on or before the term end date (${fmt(end!)}); teaching days after it cannot be used.`);
  }

  // Classify days
  if (valid) {
    let wd = 0;
    for (let d = start!; d <= end! && days.length < 800; d = addDays(d, 1)) {
      const iso = isoOf(d);
      let kind: DayKind = 'instruction';
      let label = '';
      if (isWeeklyOff(d, input.weeklyOff)) { kind = 'weekly-off'; label = 'Weekly off'; }
      else if (holidayMap.has(iso)) { kind = 'holiday'; label = holidayMap.get(iso)!; }
      else if (immovableMap.has(iso)) { kind = 'immovable'; label = immovableMap.get(iso)!; }
      else if (board && d >= board) { kind = 'immovable'; label = 'Board examination period'; }
      const isWorking = kind === 'instruction';
      if (isWorking) wd++;
      days.push({ iso, date: d, kind, label, workingDay: isWorking ? wd : null });
    }
  }
  const working = days.filter(d => d.workingDay !== null);
  const W = working.length;

  // Buffer: the last working days of the term (absorbs closures without moving tests).
  const bufferN = Math.max(0, Math.min(buffer ?? 0, W));
  const bufferDaysList = working.slice(W - bufferN);
  bufferDaysList.forEach(d => { d.kind = 'buffer'; d.label = 'Emergency buffer (reserved)'; });

  // Blackout window days (no tests)
  if (blackoutStart) {
    for (const d of working) if (d.date >= blackoutStart && d.kind === 'instruction') { d.kind = 'blackout'; d.label = 'No-test window before board exam'; }
  }

  // Events
  const eventRows: (string | number)[][] = [];
  let eventDays = 0;
  const undated: { label: string; n: number }[] = [];
  for (const [label = 'Event', n = '', pref = ''] of rows(input.events)) {
    const count = num(n) ?? 0;
    if (count <= 0) { issues.push(`Event “${label}” has no day count.`); continue; }
    eventDays += count;
    if (pref) {
      const dt = parseDate(pref);
      const idx = dt ? days.findIndex(d => d.iso === isoOf(dt)) : -1;
      if (!dt) { issues.push(`Event “${label}” date “${pref}” could not be read.`); continue; }
      if (idx < 0) { issues.push(`Event “${label}” (${fmt(dt)}) is outside the term.`); continue; }
      const placed: string[] = [];
      let i = idx;
      while (placed.length < count && i < days.length) {
        const d = days[i];
        if (d.workingDay !== null) {
          if (d.kind === 'buffer') notes.push(`${label} on ${fmt(d.date)} uses a reserved buffer day.`);
          d.kind = 'event';
          d.label = label;
          placed.push(fmt(d.date));
        } else if (i === idx) {
          issues.push(`Event “${label}” preferred date ${fmt(d.date)} is not a working day (${d.label}).`);
        }
        i++;
      }
      eventRows.push([label, count, placed.join(', ') || 'Not placed', 'Preferred date supplied']);
    } else {
      undated.push({ label, n: count });
    }
  }

  // CIE placement
  const cieRows: (string | number)[][] = [];
  const nTests = Math.max(0, cieCount ?? 0);
  const perTest = Math.max(0, cieEach ?? 0);
  const fixed = new Map<number, Date>();
  for (const line of (input.cieDates || '').split(/\r?\n/)) {
    const m = line.match(/(\d+)\s*[:=|]\s*(.+)$/);
    if (!m) continue;
    const dt = parseDate(m[2]);
    if (dt) fixed.set(+m[1], dt);
    else issues.push(`CIE date “${line.trim()}” could not be read.`);
  }
  const testable = working.filter(d => d.kind === 'instruction');
  let previousEndWd = 0;
  if (valid && nTests > 0 && perTest > 0) {
    for (let k = 1; k <= nTests; k++) {
      let startIdx: number;
      let how: string;
      if (fixed.has(k)) {
        const want = isoOf(fixed.get(k)!);
        startIdx = testable.findIndex(d => d.iso >= want);
        how = 'Date supplied';
        const exact = days.find(d => d.iso === want);
        if (exact && exact.kind !== 'instruction') {
          issues.push(`CIE-${k} requested on ${fmt(exact.date)}, which is ${exact.label || exact.kind}; moved to the next available working day.`);
          how = 'Supplied date unavailable — moved forward';
        }
      } else {
        // Evenly spaced: test k ends at fraction k/n of the testable span.
        startIdx = Math.round((k / nTests) * testable.length) - perTest;
        how = 'Evenly spaced by the engine (proposed)';
      }
      startIdx = Math.max(0, Math.min(startIdx, testable.length - perTest));
      const slot = testable.slice(startIdx, startIdx + perTest).filter(d => d.kind === 'instruction');
      if (slot.length < perTest) {
        issues.push(`CIE-${k}: not enough free working days to schedule ${perTest} day(s).`);
        cieRows.push([`CIE-${k}`, '—', '—', '—', 'Not placed']);
        continue;
      }
      const startWd = slot[0].workingDay!;
      if (k > 1 && resultGap !== null && startWd - previousEndWd - 1 < resultGap) {
        issues.push(`CIE-${k} starts ${startWd - previousEndWd - 1} working day(s) after CIE-${k - 1}; at least ${resultGap} are needed to publish results first.`);
      }
      previousEndWd = slot[slot.length - 1].workingDay!;
      slot.forEach(d => { d.kind = 'cie'; d.label = `CIE-${k}`; });
      cieRows.push([`CIE-${k}`, fmt(slot[0].date), fmt(slot[slot.length - 1].date), `WD ${startWd}–${previousEndWd} of ${W}`, how]);
    }
  }
  if (valid && board && blackoutStart && working.some(d => d.kind === 'cie' && d.date >= blackoutStart)) {
    issues.push('A CIE test falls inside the no-test window before the board examination.');
  }

  // Undated events: take the latest free instruction days before the buffer, never the buffer itself.
  for (const ev of undated) {
    const free = working.filter(d => d.kind === 'instruction' || d.kind === 'blackout');
    const chosen = free.slice(Math.max(0, free.length - ev.n));
    chosen.forEach(d => { d.kind = 'event'; d.label = ev.label; });
    eventRows.push([ev.label, ev.n, chosen.map(d => fmt(d.date)).join(', ') || 'Not placed', 'No date supplied — proposed slot, confirm']);
  }

  // Arithmetic
  const count = (k: DayKind) => days.filter(d => d.kind === k).length;
  const weeklyOffs = count('weekly-off');
  const holidaysLost = count('holiday');
  const immovable = count('immovable');
  const cieDays = count('cie');
  const bufferLeft = count('buffer');
  const eventsPlaced = count('event');
  const instruction = count('instruction') + count('blackout');

  if (minDays !== null && valid && instruction < minDays) {
    issues.push(`Net instructional days (${instruction}) are ${minDays - instruction} short of the prescribed minimum (${minDays}).`);
  }
  if (buffer !== null && bufferLeft < buffer) {
    issues.push(`Only ${bufferLeft} of the ${buffer} reserved buffer days remain free after events and tests.`);
  }
  if (eventDays > (buffer ?? 0) && buffer !== null) {
    notes.push(`Events need ${eventDays} day(s) but the buffer is ${buffer}; ${eventDays - buffer} event day(s) come out of instructional time.`);
  }

  const ok = valid && !issues.length && !missing.length;

  // Month-wise summary
  const monthRows: (string | number)[][] = [];
  const byMonth = new Map<string, CalendarDay[]>();
  for (const d of days) {
    const key = `${MONTH_NAMES[d.date.getMonth()]} ${d.date.getFullYear()}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(d);
  }
  for (const [month, list] of byMonth) {
    const c = (k: DayKind) => list.filter(d => d.kind === k).length;
    monthRows.push([month, list.length, c('weekly-off'), c('holiday'), c('immovable'), list.filter(d => d.workingDay !== null).length,
      c('instruction') + c('blackout'), c('cie'), c('event'), c('buffer')]);
  }

  // Report
  const out: string[] = [];
  const title = `ACADEMIC CALENDAR ${input.academicYear || ''}`.trim();
  out.push(`# ${title}`);
  out.push(`DRAFT FOR REVIEW — Version ${input.version || 'v01'}. Dates are computed from the supplied term dates, weekly-off rule and holiday list; verify against the official notifications before release.`);
  out.push(table(['Field', 'Value'], [
    ['Institution / department', input.institution || 'Not supplied'],
    ['Programme / semester', input.programme || 'Not supplied'],
    ['Academic year', input.academicYear || 'Not supplied'],
    ['Term', valid ? `${fmt(start!)} to ${fmt(end!)}` : 'Not supplied'],
    ['Weekly off', input.weeklyOff === 'sunday' ? 'Sundays' : input.weeklyOff === 'sunday-2-4-sat' ? 'Sundays and 2nd/4th Saturdays' : 'Sundays and all Saturdays'],
    ['Board/semester-end examination', board ? fmt(board) : 'Not supplied'],
    ['Version', input.version || 'v01']
  ]));

  out.push('## 1. Immovables Fixed First');
  out.push(holidayRows.length ? table(['Date', 'Declared holiday', 'Effect'], holidayRows) : 'No declared holidays entered.');
  if (immovableRows.length) out.push(table(['From', 'To', 'Immovable block'], immovableRows));
  if (board) out.push(`No CIE test is scheduled ${blackout !== null ? `in the ${blackout} calendar days` : 'in the window'} before the board examination${blackoutStart ? ` (from ${fmt(blackoutStart)})` : ''}.`);

  out.push('## 2. Working-Day Arithmetic');
  out.push(valid ? table(['Line', 'Days'], [
    ['Calendar days in term', days.length],
    ['Less: weekly offs', weeklyOffs],
    ['Less: declared holidays on working days', holidaysLost],
    ['Less: immovable blocks / board exam days', immovable],
    ['= Gross working days', W],
    ['Less: CIE test days', cieDays],
    ['Less: events', eventsPlaced],
    ['Less: emergency buffer still reserved', bufferLeft],
    ['= Net instructional days', instruction],
    ['Prescribed minimum', minDays ?? 'Not supplied'],
    ['Margin', minDays !== null ? instruction - minDays : '—']
  ]) : 'Term dates are needed before the arithmetic can be computed.');
  if (monthRows.length) {
    out.push(table(['Month', 'Calendar', 'Weekly off', 'Holidays', 'Immovable', 'Working', 'Instruction', 'CIE', 'Events', 'Buffer'], monthRows));
  }

  out.push('## 3. CIE Schedule');
  out.push(cieRows.length ? table(['Test', 'From', 'To', 'Working days', 'Placement'], cieRows) : 'CIE count and days per test are needed to place tests.');
  if (resultGap !== null) out.push(`Rule applied: at least ${resultGap} working day(s) between tests so results are published before the next test.`);

  out.push('## 4. Emergency Buffer');
  out.push(bufferDaysList.length
    ? `${bufferN} working day(s) reserved at the end of the term: ${bufferDaysList.map(d => fmt(d.date)).join(', ')}. ${bufferLeft} remain free. Use these only for recovery after unforeseen closures, and record every use in the amendment log.`
    : 'No buffer reserved.');

  out.push('## 5. Institutional Events');
  out.push(eventRows.length ? table(['Event', 'Days', 'Scheduled on', 'Basis'], eventRows) : 'No events entered.');

  out.push('## 6. Version Control and Amendment Log');
  const amendments = rows(input.amendments);
  out.push(table(['Version', 'Date', 'Change', 'Approved by'],
    amendments.length ? amendments.map(([v = '', d = '', c = '', a = '']) => [v, d, c, a || 'To be confirmed']) : [[input.version || 'v01', 'On approval', 'Initial release', input.authority || 'To be confirmed']]));
  out.push('Amendments are issued as a new version with this log; the earlier version is never replaced silently.');

  out.push('## Compliance Check');
  if (ok) out.push('No conflicts found against the supplied rules. This is not a statement of regulatory approval.');
  for (const i of issues) out.push(`- CONFLICT: ${i}`);
  for (const m of missing) out.push(`- MISSING INPUT: ${m}`);
  for (const n of notes) out.push(`- NOTE: ${n}`);

  out.push('## Draft Circular');
  out.push('CIRCULAR');
  out.push(`Ref: ${input.refNo || '[Reference number to be assigned]'}  Date: [Date of issue]`);
  out.push(`Sub: Academic Calendar ${input.academicYear || ''} (${input.programme || 'programme'}) — Version ${input.version || 'v01'}`);
  out.push(`All concerned are informed that the term will commence on ${start ? fmt(start) : '[term start]'} and conclude on ${end ? fmt(end) : '[term end]'}. The key dates are listed below. Any change will be notified as a new version with an amendment log.`);
  const keyDates: (string | number)[][] = [
    ['Commencement of classes', start ? fmt(start) : '—'],
    ...cieRows.filter(r => r[1] !== '—').map(r => [`${r[0]}`, r[1] === r[2] ? r[1] : `${r[1]} to ${r[2]}`]),
    ...eventRows.map(r => [String(r[0]), String(r[2])]),
    ['Last instructional day', working.filter(d => d.kind === 'instruction' || d.kind === 'blackout').slice(-1)[0] ? fmt(working.filter(d => d.kind === 'instruction' || d.kind === 'blackout').slice(-1)[0].date) : '—'],
    ['Term ends', end ? fmt(end) : '—'],
    ['Board/semester-end examination', board ? fmt(board) : '—']
  ];
  out.push(table(['Activity', 'Date(s)'], keyDates));
  out.push(input.authority || '[Approving authority]');
  out.push('Copy to: All Heads of Departments; Examination Section; Notice Boards; Institutional website.');

  const summary: CalendarResult['summary'] = [
    { label: 'Gross working days', value: valid ? String(W) : '—', tone: 'neutral' },
    { label: 'Net instructional', value: valid ? String(instruction) : '—', tone: minDays === null || !valid ? 'neutral' : instruction >= minDays ? 'good' : 'bad' },
    { label: 'Buffer free', value: buffer === null ? '—' : `${bufferLeft} / ${buffer}`, tone: buffer === null ? 'neutral' : bufferLeft >= buffer ? 'good' : 'bad' },
    { label: 'Conflicts', value: String(issues.length + missing.length), tone: issues.length + missing.length ? 'bad' : 'good' }
  ];

  return { markdown: out.join('\n\n'), days, ok, summary };
}

export function emptyCalendarInput(): CalendarInput {
  return {
    institution: '', programme: '', academicYear: '', version: 'v01', refNo: '', authority: '',
    termStart: '', termEnd: '', weeklyOff: 'sunday', holidays: '', immovables: '', boardExamStart: '',
    blackoutDays: '', minInstructionalDays: '', bufferDays: '', cieCount: '', cieDaysEach: '', cieDates: '',
    resultGapDays: '', events: '', amendments: ''
  };
}

/** Training specimen: every date and rule below is for practice only. */
export function calendarTrainingSpecimen(): CalendarInput {
  return {
    institution: 'TRAINING SPECIMEN — Dept. of Electronics (not an official calendar)',
    programme: 'Diploma, Semester 3 (odd term)',
    academicYear: '2026-27',
    version: 'v01',
    refNo: 'DEMO/ACAD/CAL/2026-27/01',
    authority: 'Principal (demo)',
    termStart: '2026-08-03',
    termEnd: '2026-11-28',
    weeklyOff: 'sunday-2-4-sat',
    holidays: [
      '15-08-2026 | Independence Day',
      '14-09-2026 | Ganesha Chaturthi (demo date — verify)',
      '02-10-2026 | Gandhi Jayanti',
      '20-10-2026 | Vijayadashami (demo date — verify)',
      '01-11-2026 | Kannada Rajyotsava',
      '09-11-2026 | Deepavali (demo date — verify)'
    ].join('\n'),
    immovables: '26-10-2026 | 27-10-2026 | Accreditation visit (demo)',
    boardExamStart: '2026-12-07',
    blackoutDays: '7',
    minInstructionalDays: '80',
    bufferDays: '6',
    cieCount: '3',
    cieDaysEach: '2',
    cieDates: '',
    resultGapDays: '5',
    events: 'Technical symposium | 1 | 16-10-2026\nSports day | 1 |',
    amendments: ''
  };
}
