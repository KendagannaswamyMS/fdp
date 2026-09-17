import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDay,
  CalendarInput,
  DayKind,
  WeeklyOff,
  buildAcademicCalendar,
  calendarTrainingSpecimen,
  emptyCalendarInput
} from '../utils/calendarEngine';
import {
  copyToClipboard,
  exportToWordFile,
  formatInstitutionalDocumentToHtml,
  getStoredBanners,
  printInstitutionalDocument
} from '../utils/exportHelper';
import { soundFx } from '../utils/audioHelper';
import { Check, ClipboardCopy, FileText, FlaskConical, Printer, RotateCcw } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'jsspm_calendar_builder_draft';

const KIND_STYLES: Record<DayKind, { cls: string; label: string }> = {
  instruction: { cls: 'bg-slate-800 text-slate-200', label: 'Instruction' },
  blackout: { cls: 'bg-slate-800 text-slate-200 ring-1 ring-inset ring-amber-500/60', label: 'Instruction (no-test window)' },
  'weekly-off': { cls: 'bg-slate-950 text-slate-600', label: 'Weekly off' },
  holiday: { cls: 'bg-rose-500/30 text-rose-200', label: 'Holiday' },
  immovable: { cls: 'bg-violet-500/30 text-violet-200', label: 'Immovable / board exam' },
  cie: { cls: 'bg-sky-500/40 text-sky-100 font-bold', label: 'CIE test' },
  event: { cls: 'bg-amber-500/35 text-amber-100', label: 'Event' },
  buffer: { cls: 'bg-emerald-500/30 text-emerald-200', label: 'Emergency buffer' }
};

const TONES = {
  good: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  bad: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  neutral: 'bg-slate-800/60 text-slate-200 border-slate-700'
};

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function loadDraft(): CalendarInput {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw) return { ...emptyCalendarInput(), ...(JSON.parse(raw) as Partial<CalendarInput>) };
  } catch {
    // Fall through to an empty draft.
  }
  return emptyCalendarInput();
}

const inputCls = 'w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500';
const areaCls = `${inputCls} font-mono leading-relaxed`;

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block space-y-1">
    <span className="block text-[11px] font-semibold text-slate-300">{label}</span>
    {children}
    {hint && <span className="block text-[10px] text-slate-500 leading-snug">{hint}</span>}
  </label>
);

const MonthGrid: React.FC<{ days: CalendarDay[] }> = ({ days }) => {
  const months = useMemo(() => {
    const map = new Map<string, CalendarDay[]>();
    for (const d of days) {
      const key = d.date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }
    return [...map.entries()];
  }, [days]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {months.map(([name, list]) => (
        <div key={name} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs font-bold text-white mb-2">{name}</div>
          <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, i) => <div key={i} className="text-slate-500 font-semibold">{w}</div>)}
            {Array.from({ length: list[0].date.getDay() }).map((_, i) => <div key={`pad${i}`} />)}
            {list.map(d => (
              <div key={d.iso} title={`${d.iso}${d.label ? ` — ${d.label}` : ''}${d.workingDay ? ` (WD ${d.workingDay})` : ''}`}
                className={`rounded py-1 ${KIND_STYLES[d.kind].cls}`}>
                {d.date.getDate()}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const CalendarBuilder: React.FC = () => {
  const [input, setInput] = useState<CalendarInput>(loadDraft);
  const [view, setView] = useState<'grid' | 'document'>('grid');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(input));
    } catch {
      // Draft persistence is a convenience only.
    }
  }, [input]);

  const result = useMemo(() => buildAcademicCalendar(input), [input]);
  const html = useMemo(() => formatInstitutionalDocumentToHtml(escapeHtml(result.markdown)), [result.markdown]);
  const set = <K extends keyof CalendarInput>(key: K, value: CalendarInput[K]) => setInput(prev => ({ ...prev, [key]: value }));
  const { headerImage, footerImage } = getStoredBanners();
  const fileBase = `Academic_Calendar_${(input.academicYear || 'Draft').replace(/[^A-Za-z0-9]+/g, '_')}_${input.version || 'v01'}`;
  const isSpecimen = /TRAINING SPECIMEN/i.test(input.institution);
  const conflictLines = result.markdown.split('\n').filter(l => /^- (CONFLICT|MISSING INPUT|NOTE):/.test(l));

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-100 text-xs sm:text-sm leading-relaxed">
        <strong className="font-bold text-sky-300">Calendar Builder.</strong> Enter the term dates, weekly-off rule, holidays and your
        institution’s rules. The engine walks every real date of the term. It removes weekly offs, holidays and immovable blocks, spaces the CIE tests
        and reserves the buffer at the end of the term. It then checks the net instructional days against the minimum you enter and drafts a versioned circular.
        Minimums and buffer sizes are never assumed.
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => { setInput(calendarTrainingSpecimen()); soundFx.playSuccess(); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30">
          <FlaskConical className="w-3.5 h-3.5" /><span>Load training specimen</span>
        </button>
        <button onClick={() => { if (confirm('Clear every field in this calendar draft?')) setInput(emptyCalendarInput()); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white">
          <RotateCcw className="w-3.5 h-3.5" /><span>Clear</span>
        </button>
        <span className="text-[11px] text-slate-500">The draft is saved automatically in this browser.</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 space-y-3 min-w-0">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Header & version</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Institution / department"><input value={input.institution} onChange={e => set('institution', e.target.value)} className={inputCls} /></Field>
              <Field label="Programme / semester"><input value={input.programme} onChange={e => set('programme', e.target.value)} className={inputCls} /></Field>
              <Field label="Academic year"><input value={input.academicYear} onChange={e => set('academicYear', e.target.value)} placeholder="2026-27" className={inputCls} /></Field>
              <Field label="Version"><input value={input.version} onChange={e => set('version', e.target.value)} className={inputCls} /></Field>
              <Field label="Circular reference no."><input value={input.refNo} onChange={e => set('refNo', e.target.value)} className={inputCls} /></Field>
              <Field label="Approving authority"><input value={input.authority} onChange={e => set('authority', e.target.value)} className={inputCls} /></Field>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Step 1 · Immovables</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Term start"><input type="date" value={input.termStart} onChange={e => set('termStart', e.target.value)} className={inputCls} /></Field>
              <Field label="Term end"><input type="date" value={input.termEnd} onChange={e => set('termEnd', e.target.value)} className={inputCls} /></Field>
              <Field label="Weekly off">
                <select value={input.weeklyOff} onChange={e => set('weeklyOff', e.target.value as WeeklyOff)} className={inputCls}>
                  <option value="sunday">Sundays only</option>
                  <option value="sunday-2-4-sat">Sundays + 2nd & 4th Saturdays</option>
                  <option value="sunday-all-sat">Sundays + all Saturdays</option>
                </select>
              </Field>
              <Field label="Board / semester-end exam starts"><input type="date" value={input.boardExamStart} onChange={e => set('boardExamStart', e.target.value)} className={inputCls} /></Field>
            </div>
            <Field label="Declared holidays" hint="date | name, one per line (dd-mm-yyyy or yyyy-mm-dd). Copy from the official notification.">
              <textarea rows={5} value={input.holidays} onChange={e => set('holidays', e.target.value)} placeholder="15-08-2026 | Independence Day" className={areaCls} />
            </Field>
            <Field label="Other immovable blocks (optional)" hint="from | to | label, e.g. inspections, university exam windows">
              <textarea rows={2} value={input.immovables} onChange={e => set('immovables', e.target.value)} className={areaCls} />
            </Field>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Steps 2–4 · Rules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Minimum instructional days" hint="As prescribed for your programme"><input value={input.minInstructionalDays} onChange={e => set('minInstructionalDays', e.target.value)} className={inputCls} /></Field>
              <Field label="Buffer days to reserve" hint="FDP guidance: 5–7"><input value={input.bufferDays} onChange={e => set('bufferDays', e.target.value)} className={inputCls} /></Field>
              <Field label="No-test window (days)" hint="Calendar days before board exam"><input value={input.blackoutDays} onChange={e => set('blackoutDays', e.target.value)} className={inputCls} /></Field>
              <Field label="Number of CIE tests"><input value={input.cieCount} onChange={e => set('cieCount', e.target.value)} className={inputCls} /></Field>
              <Field label="Working days per test"><input value={input.cieDaysEach} onChange={e => set('cieDaysEach', e.target.value)} className={inputCls} /></Field>
              <Field label="Min. days between tests" hint="To publish results first"><input value={input.resultGapDays} onChange={e => set('resultGapDays', e.target.value)} className={inputCls} /></Field>
            </div>
            <Field label="Fixed CIE start dates (optional)" hint="CIE-1 = 07-09-2026, one per line. Tests without a date are spaced evenly.">
              <textarea rows={2} value={input.cieDates} onChange={e => set('cieDates', e.target.value)} className={areaCls} />
            </Field>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Steps 5–6 · Events & amendments</h3>
            <Field label="Institutional events" hint="label | days | preferred date (optional). Undated events get a proposed slot outside the buffer.">
              <textarea rows={3} value={input.events} onChange={e => set('events', e.target.value)} className={areaCls} />
            </Field>
            <Field label="Amendment log" hint="version | date | change | approved by">
              <textarea rows={2} value={input.amendments} onChange={e => set('amendments', e.target.value)} className={areaCls} />
            </Field>
          </div>
        </div>

        <div className="xl:col-span-7 min-w-0">
          <div className="xl:sticky xl:top-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {result.summary.map(s => (
                <div key={s.label} className={`p-2.5 rounded-lg border ${TONES[s.tone]}`}>
                  <div className="text-xl font-bold font-mono">{s.value}</div>
                  <div className="text-[10px] font-semibold leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            {conflictLines.length > 0 && (
              <ul className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                {conflictLines.map(l => (
                  <li key={l} className={l.startsWith('- CONFLICT') ? 'text-rose-300' : l.startsWith('- MISSING') ? 'text-amber-300' : 'text-slate-400'}>{l.slice(2)}</li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { copyToClipboard(result.markdown); setCopied(true); soundFx.playSuccess(); setTimeout(() => setCopied(false), 2000); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-sky-500 text-slate-950 hover:bg-sky-400">
                {copied ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}<span>Copy calendar</span>
              </button>
              <button onClick={() => exportToWordFile(fileBase, escapeHtml(result.markdown), 'Academic Calendar', headerImage, footerImage)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:text-white">
                <FileText className="w-3.5 h-3.5" /><span>Word (.doc)</span>
              </button>
              <button onClick={() => printInstitutionalDocument(escapeHtml(result.markdown), 'Academic Calendar', headerImage, footerImage)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:text-white">
                <Printer className="w-3.5 h-3.5" /><span>Print / PDF</span>
              </button>
              <div className="ml-auto flex rounded-lg border border-slate-700 overflow-hidden text-[11px]">
                {(['grid', 'document'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} className={`px-2.5 py-1 font-semibold capitalize ${view === v ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>{v === 'grid' ? 'Month view' : 'Document'}</button>
                ))}
              </div>
            </div>

            {isSpecimen && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px]">
                Training specimen loaded. Holiday dates and rules are for practice only; verify against official notifications.
              </div>
            )}

            {view === 'grid' ? (
              result.days.length ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {(Object.keys(KIND_STYLES) as DayKind[]).map(k => (
                      <span key={k} className={`px-2 py-0.5 rounded ${KIND_STYLES[k].cls}`}>{KIND_STYLES[k].label}</span>
                    ))}
                  </div>
                  <div className="max-h-[70vh] overflow-auto pr-1">
                    <MonthGrid days={result.days} />
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">Enter the term start and end dates to see the month view.</div>
              )
            ) : (
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-white text-slate-900 p-5 sm:p-7 max-h-[75vh] overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
