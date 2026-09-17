import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  COURSE_FILE_STRUCTURE,
  CourseFileInput,
  CourseFileTask,
  ItemStatusChoice,
  ReportingStage,
  buildCourseFileReport,
  buildFilledPrompt,
  emptyCourseFileInput,
  isDue
} from '../utils/courseFileEngine';
import { LAB4_COURSE_FILE_PROMPT, lab4TrainingSpecimen } from '../data/lab4CourseFileData';
import {
  copyToClipboard,
  exportToJsonFile,
  exportToWordFile,
  formatInstitutionalDocumentToHtml,
  getStoredBanners,
  printInstitutionalDocument
} from '../utils/exportHelper';
import { soundFx } from '../utils/audioHelper';
import {
  Check,
  ClipboardCopy,
  Download,
  FileText,
  FlaskConical,
  Printer,
  RotateCcw,
  Sparkles,
  Upload
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'jsspm_lab4_course_file_draft';

const TASKS: CourseFileTask[] = ['Prepare an initial course file', 'Review an existing file', 'Update a semester-end file'];
const STAGES: ReportingStage[] = ['Before teaching', 'Mid-semester', 'Semester-end'];
const STATUS_CHOICES: { value: ItemStatusChoice; label: string }[] = [
  { value: 'auto', label: 'Auto (from evidence)' },
  { value: 'Available and checked', label: 'Available and checked' },
  { value: 'Available but incomplete', label: 'Available but incomplete' },
  { value: 'Not supplied', label: 'Not supplied' },
  { value: 'Not yet due', label: 'Not yet due' },
  { value: 'Not applicable', label: 'Not applicable (give reason)' }
];

const STATUS_STYLES: Record<string, string> = {
  'Available and checked': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Available but incomplete': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Not supplied': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'Not yet due': 'bg-slate-700/40 text-slate-300 border-slate-600',
  'Not applicable': 'bg-sky-500/15 text-sky-300 border-sky-500/30'
};

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function loadDraft(): CourseFileInput {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw) {
      const base = emptyCourseFileInput();
      const saved = JSON.parse(raw) as Partial<CourseFileInput>;
      return { ...base, ...saved, details: { ...base.details, ...saved.details }, items: { ...base.items, ...saved.items } };
    }
  } catch {
    // Fall through to an empty draft.
  }
  return emptyCourseFileInput();
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

const Section: React.FC<{ title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, badge, defaultOpen, children }) => (
  <details open={defaultOpen} className="group rounded-xl bg-slate-900 border border-slate-800 open:border-slate-700">
    <summary className="cursor-pointer select-none list-none px-4 py-3 flex items-center justify-between gap-2">
      <span className="text-sm font-bold text-white">{title}</span>
      <span className="flex items-center gap-2">
        {badge && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">{badge}</span>}
        <span className="text-slate-500 text-xs group-open:rotate-90 transition-transform">▶</span>
      </span>
    </summary>
    <div className="px-4 pb-4 space-y-3">{children}</div>
  </details>
);

export const CourseFileBuilder: React.FC = () => {
  const [input, setInput] = useState<CourseFileInput>(loadDraft);
  const [copied, setCopied] = useState<string | null>(null);
  const [view, setView] = useState<'preview' | 'markdown'>('preview');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(input));
    } catch {
      // Draft persistence is a convenience only.
    }
  }, [input]);

  const report = useMemo(() => buildCourseFileReport(input), [input]);
  const previewHtml = useMemo(() => formatInstitutionalDocumentToHtml(escapeHtml(report.markdown)), [report.markdown]);
  const isSpecimen = /TRAINING SPECIMEN/i.test(input.details.institution);

  const set = <K extends keyof CourseFileInput>(key: K, value: CourseFileInput[K]) => setInput(prev => ({ ...prev, [key]: value }));
  const setDetail = <K extends keyof CourseFileInput['details']>(key: K, value: CourseFileInput['details'][K]) =>
    setInput(prev => ({ ...prev, details: { ...prev.details, [key]: value } }));
  const setItem = (no: number, patch: Partial<CourseFileInput['items'][number]>) =>
    setInput(prev => ({ ...prev, items: { ...prev.items, [no]: { ...prev.items[no], ...patch } } }));

  const flash = (id: string) => {
    setCopied(id);
    soundFx.playSuccess();
    setTimeout(() => setCopied(null), 2000);
  };

  const fileBase = `Course_File_Review_${(input.details.course || 'Draft').replace(/[^A-Za-z0-9]+/g, '_')}`;
  const { headerImage, footerImage } = getStoredBanners();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(text => {
      try {
        const base = emptyCourseFileInput();
        const data = JSON.parse(text) as Partial<CourseFileInput>;
        setInput({ ...base, ...data, details: { ...base.details, ...data.details }, items: { ...base.items, ...data.items } });
      } catch {
        alert('That file is not a valid course-file JSON export.');
      }
    });
    e.target.value = '';
  };

  const statusOf = (no: number) => report.statuses.find(s => s.no === no)?.status || 'Not supplied';
  const tally = (s: string) => report.statuses.filter(x => x.status === s).length;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-100 text-xs sm:text-sm leading-relaxed">
        <strong className="font-bold text-sky-300">Lab 4 · Course File Builder.</strong> Enter the course details and whatever records you have.
        The builder produces outputs A–F of the Lab 4 prompt as you type: readiness summary, 18-item matrix, section findings, a detailed
        review of items 6, 12, 16 and 17, the evidence index with follow-ups, and clarification questions. It never assumes a mapping scale,
        threshold or weight. When an input is missing it gives you a template and a question instead of a number. Everything stays in this browser.
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => { setInput(lab4TrainingSpecimen()); soundFx.playSuccess(); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30">
          <FlaskConical className="w-3.5 h-3.5" /><span>Load training specimen</span>
        </button>
        <button onClick={() => { if (confirm('Clear every field in this course file draft?')) setInput(emptyCourseFileInput()); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white">
          <RotateCcw className="w-3.5 h-3.5" /><span>Clear</span>
        </button>
        <button onClick={() => exportToJsonFile(`${fileBase}_inputs`, input)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white">
          <Download className="w-3.5 h-3.5" /><span>Save inputs (JSON)</span>
        </button>
        <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white">
          <Upload className="w-3.5 h-3.5" /><span>Open inputs</span>
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
        <span className="text-[11px] text-slate-500">The draft is saved automatically in this browser.</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* ------------------------------------------------------------ inputs */}
        <div className="xl:col-span-5 space-y-3 min-w-0">
          <Section title="1 · Task & course details" defaultOpen>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Task required">
                <select value={input.task} onChange={e => set('task', e.target.value as CourseFileTask)} className={inputCls}>
                  {TASKS.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Reporting stage" hint="Decides whether a missing record is “Not supplied” or “Not yet due”.">
                <select value={input.details.stage} onChange={e => setDetail('stage', e.target.value as ReportingStage)} className={inputCls}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              {([
                ['institution', 'Institution and department'],
                ['programme', 'Programme and semester'],
                ['academicYear', 'Academic year'],
                ['course', 'Course title and code'],
                ['faculty', 'Faculty name and designation'],
                ['credits', 'Credits and contact hours', 'e.g. 4 credits, 52 contact hours'],
                ['syllabusVersion', 'Syllabus/regulation version'],
                ['reviewer', 'Reviewing authority and submission date'],
                ['policies', 'Institutional format and assessment policies', 'Document title/version you are following'],
                ['attainmentMethod', 'Approved attainment method and targets', 'Document title/version']
              ] as [keyof CourseFileInput['details'], string, string?][]).map(([key, label, placeholder]) => (
                <Field key={key} label={label}>
                  <input value={String(input.details[key])} placeholder={placeholder || ''} onChange={e => setDetail(key, e.target.value as never)} className={inputCls} />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="2 · Evidence for the 18 items">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              One record per line: <code className="text-sky-300">document title | date/version | page/sheet/section</code>.
              Leave the status on Auto unless you have checked the record yourself. “Not applicable” needs a reason in the note.
            </p>
            <div className="space-y-2">
              {COURSE_FILE_STRUCTURE.map(def => {
                const entry = input.items[def.no];
                const status = statusOf(def.no);
                const critical = [6, 12, 16, 17].includes(def.no);
                return (
                  <div key={def.no} className={`p-3 rounded-lg border space-y-2 ${critical ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-950/60 border-slate-800'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white leading-snug">{def.no}. {def.title}</span>
                      <span className={`shrink-0 px-2 py-0.5 rounded border text-[10px] font-semibold ${STATUS_STYLES[status]}`}>{status}</span>
                    </div>
                    <textarea rows={entry.evidence.includes('\n') ? 3 : 1} value={entry.evidence} onChange={e => setItem(def.no, { evidence: e.target.value })}
                      placeholder={`${def.evidenceNeeded} | version | pages`} className={areaCls} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select value={entry.status} onChange={e => setItem(def.no, { status: e.target.value as ItemStatusChoice })} className={inputCls}>
                        {STATUS_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <input value={entry.note} onChange={e => setItem(def.no, { note: e.target.value })}
                        placeholder={isDue(def, input.details.stage) ? 'Specific gap / N.A. reason' : `Normally due from ${def.dueFrom.toLowerCase()}`} className={inputCls} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="3 · Outcomes & CO–PO mapping (items 4–6)" badge="Item 6">
            <Field label="Course Outcomes" hint="CO | statement | Bloom level (L1–L6 or name). Preserved exactly as entered.">
              <textarea rows={4} value={input.cos} onChange={e => set('cos', e.target.value)} placeholder="CO1 | Explain ... | L2 Understand" className={areaCls} />
            </Field>
            <Field label="POs and PSOs" hint="ID | approved statement">
              <textarea rows={3} value={input.pos} onChange={e => set('pos', e.target.value)} placeholder="PO1 | ..." className={areaCls} />
            </Field>
            <Field label="Institution’s mapping scale" hint="Required. One level per line, e.g. “3 = Substantial”. Levels not defined here are flagged.">
              <textarea rows={3} value={input.mappingScale} onChange={e => set('mappingScale', e.target.value)} className={areaCls} />
            </Field>
            <Field label="CO–PO/PSO mapping" hint="CO | PO/PSO | level | academic justification | supporting activity/assessment | approval status">
              <textarea rows={5} value={input.mapping} onChange={e => set('mapping', e.target.value)} className={areaCls} />
            </Field>
          </Section>

          <Section title="4 · CIE & SEE questions (item 12)" badge="Item 12">
            <Field label="Question list" hint="Question ID | component (CIE/SEE) | max marks | CO(s) | Bloom | optional Y/N | question text. Test = text before the first “-” (T1-Q2 → T1).">
              <textarea rows={7} value={input.questions} onChange={e => set('questions', e.target.value)} placeholder="T1-Q1a | CIE | 5 | CO1 | L2 | N | Explain ..." className={areaCls} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Declared test totals" hint="T1 = 30, one per line">
                <textarea rows={2} value={input.testTotals} onChange={e => set('testTotals', e.target.value)} className={areaCls} />
              </Field>
              <Field label="Optional-question rule">
                <select value={input.optionalRule} onChange={e => set('optionalRule', e.target.value as CourseFileInput['optionalRule'])} className={inputCls}>
                  <option value="">Not supplied</option>
                  <option value="attempted-only">Count max marks only for attempted optional questions</option>
                  <option value="all">Count all optional questions (unattempted = 0)</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="5 · Marks & attainment method (item 16)" badge="Item 16">
            <Field label="Question-level marks (CSV or pasted from a spreadsheet)" hint="Header: Student, then question IDs. Use anonymised refs (S01…). AB = absent; blank = not attempted (optional questions only).">
              <textarea rows={6} value={input.marks} onChange={e => set('marks', e.target.value)} placeholder={'Student,T1-Q1a,T1-Q1b,SEE\nS01,4,3,72'} className={areaCls} />
            </Field>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Student threshold (%)" hint="% of a CO’s marks">
                <input value={input.threshold} onChange={e => set('threshold', e.target.value)} className={inputCls} />
              </Field>
              <Field label="CO target" hint="Global value, or CO2 = 1.8">
                <input value={input.target} onChange={e => set('target', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Rounding (decimals)">
                <input value={input.rounding} onChange={e => set('rounding', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Component weights" hint="CIE = 40, SEE = 60">
                <input value={input.componentWeights} onChange={e => set('componentWeights', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Direct weight">
                <input value={input.directWeight} onChange={e => set('directWeight', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Indirect weight">
                <input value={input.indirectWeight} onChange={e => set('indirectWeight', e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Attainment levels (optional)" hint="3 >= 70 means level 3 when ≥70% of students meet the threshold. Leave blank to report percentages.">
                <textarea rows={3} value={input.levels} onChange={e => set('levels', e.target.value)} className={areaCls} />
              </Field>
              <Field label="Absence rule" hint="Applies to students absent for every question of a CO in a component.">
                <select value={input.absenceRule} onChange={e => set('absenceRule', e.target.value as CourseFileInput['absenceRule'])} className={inputCls}>
                  <option value="">Not supplied</option>
                  <option value="exclude">Exclude from the denominator</option>
                  <option value="not-met">Count as not meeting the threshold</option>
                </select>
              </Field>
            </div>
            <Field label="Indirect assessment (CO-aligned survey results)" hint="CO | survey item | result on the same scale as direct | responses/eligible. General satisfaction ratings do not belong here.">
              <textarea rows={3} value={input.indirect} onChange={e => set('indirect', e.target.value)} className={areaCls} />
            </Field>
          </Section>

          <Section title="6 · Gap actions (item 17)" badge="Item 17">
            <Field label="Corrective actions" hint="CO | cause | confirmed / hypothesis | action | owner | deadline | follow-up measure | closure evidence">
              <textarea rows={4} value={input.gapActions} onChange={e => set('gapActions', e.target.value)} className={areaCls} />
            </Field>
          </Section>

          <Section title="7 · Consistency figures">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Planned hours (lesson plan)"><input value={input.plannedHours} onChange={e => set('plannedHours', e.target.value)} className={inputCls} /></Field>
              <Field label="Delivered hours (log)"><input value={input.deliveredHours} onChange={e => set('deliveredHours', e.target.value)} className={inputCls} /></Field>
              <Field label="Students in marks ledger"><input value={input.ledgerStudents} onChange={e => set('ledgerStudents', e.target.value)} className={inputCls} /></Field>
              <Field label="Survey responses"><input value={input.feedbackResponses} onChange={e => set('feedbackResponses', e.target.value)} className={inputCls} /></Field>
              <Field label="Students eligible for survey"><input value={input.feedbackEnrolled} onChange={e => set('feedbackEnrolled', e.target.value)} className={inputCls} /></Field>
            </div>
          </Section>
        </div>

        {/* ------------------------------------------------------------ output */}
        <div className="xl:col-span-7 min-w-0">
          <div className="xl:sticky xl:top-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Available and checked', 'Available but incomplete', 'Not supplied', 'Not yet due'] as const).map(s => (
                <div key={s} className={`p-2.5 rounded-lg border ${STATUS_STYLES[s]}`}>
                  <div className="text-xl font-bold font-mono">{tally(s)}</div>
                  <div className="text-[10px] font-semibold leading-tight">{s}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { copyToClipboard(report.markdown); flash('report'); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-sky-500 text-slate-950 hover:bg-sky-400">
                {copied === 'report' ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}<span>Copy report</span>
              </button>
              <button onClick={() => exportToWordFile(fileBase, escapeHtml(report.markdown), 'Course File Readiness Review', headerImage, footerImage)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:text-white">
                <FileText className="w-3.5 h-3.5" /><span>Word (.doc)</span>
              </button>
              <button onClick={() => printInstitutionalDocument(escapeHtml(report.markdown), 'Course File Readiness Review', headerImage, footerImage)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:text-white">
                <Printer className="w-3.5 h-3.5" /><span>Print / PDF</span>
              </button>
              <button onClick={() => { copyToClipboard(buildFilledPrompt(LAB4_COURSE_FILE_PROMPT, input)); flash('prompt'); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30"
                title="The full Lab 4 prompt with your details and records filled in, for use in any AI assistant">
                {copied === 'prompt' ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}<span>Copy filled AI prompt</span>
              </button>
              <div className="ml-auto flex rounded-lg border border-slate-700 overflow-hidden text-[11px]">
                {(['preview', 'markdown'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} className={`px-2.5 py-1 font-semibold capitalize ${view === v ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>{v}</button>
                ))}
              </div>
            </div>

            {isSpecimen && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px]">
                Training specimen loaded. Every name, mark and survey figure is invented for practice and is not an institutional record.
              </div>
            )}

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              {view === 'preview' ? (
                <div className="bg-white text-slate-900 p-5 sm:p-7 max-h-[78vh] overflow-auto course-file-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              ) : (
                <pre className="bg-slate-950 text-slate-300 p-4 text-[11px] leading-relaxed max-h-[78vh] overflow-auto whitespace-pre-wrap">{report.markdown}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
