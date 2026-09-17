import React, { useEffect, useMemo, useState } from 'react';
import {
  CLAIM_SECTIONS,
  ClaimSectionKey,
  PbasInput,
  buildPbasDossier,
  emptyPbasInput,
  pbasTrainingSpecimen
} from '../utils/pbasEngine';
import {
  copyToClipboard,
  exportToWordFile,
  formatInstitutionalDocumentToHtml,
  getStoredBanners,
  printInstitutionalDocument
} from '../utils/exportHelper';
import { soundFx } from '../utils/audioHelper';
import { Check, ClipboardCopy, FileText, FlaskConical, Printer, RotateCcw } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'jsspm_pbas_dossier_draft';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function loadDraft(): PbasInput {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw) {
      const base = emptyPbasInput();
      const saved = JSON.parse(raw) as Partial<PbasInput>;
      return { ...base, ...saved, sections: { ...base.sections, ...saved.sections } };
    }
  } catch {
    // Fall through to an empty draft.
  }
  return emptyPbasInput();
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

export const PbasDossierBuilder: React.FC = () => {
  const [input, setInput] = useState<PbasInput>(loadDraft);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(input));
    } catch {
      // Draft persistence is a convenience only.
    }
  }, [input]);

  const result = useMemo(() => buildPbasDossier(input), [input]);
  const html = useMemo(() => formatInstitutionalDocumentToHtml(escapeHtml(result.markdown)), [result.markdown]);
  const set = <K extends keyof PbasInput>(key: K, value: PbasInput[K]) => setInput(prev => ({ ...prev, [key]: value }));
  const setSection = (key: ClaimSectionKey, value: string) => setInput(prev => ({ ...prev, sections: { ...prev.sections, [key]: value } }));
  const { headerImage, footerImage } = getStoredBanners();
  const fileBase = `PBAS_Dossier_${(input.name || 'Draft').replace(/[^A-Za-z0-9]+/g, '_')}`;
  const isSpecimen = /TRAINING SPECIMEN/i.test(`${input.name} ${input.institution}`);
  const scoreTone = result.minimum === null ? 'bg-slate-800/60 text-slate-200 border-slate-700'
    : result.grandTotal >= result.minimum ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-100 text-xs sm:text-sm leading-relaxed">
        <strong className="font-bold text-sky-300">PBAS / CAS Dossier Builder.</strong> List each claim with its date, points and evidence.
        The builder numbers every annexure (B-1, E-2…) and works out page ranges from your page counts. It applies the section maximums from
        your scheme and flags claims that won't survive verification: no evidence, a date outside the assessment period, a governance role
        without an Office Order, or research without indexing details. Scores are self-assessed; no scheme is assumed.
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => { setInput(pbasTrainingSpecimen()); soundFx.playSuccess(); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30">
          <FlaskConical className="w-3.5 h-3.5" /><span>Load training specimen</span>
        </button>
        <button onClick={() => { if (confirm('Clear every field in this dossier draft?')) setInput(emptyPbasInput()); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white">
          <RotateCcw className="w-3.5 h-3.5" /><span>Clear</span>
        </button>
        <span className="text-[11px] text-slate-500">The draft is saved automatically in this browser.</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 space-y-3 min-w-0">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Section A · Particulars</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Faculty name"><input value={input.name} onChange={e => set('name', e.target.value)} className={inputCls} /></Field>
              <Field label="Designation"><input value={input.designation} onChange={e => set('designation', e.target.value)} className={inputCls} /></Field>
              <Field label="Department"><input value={input.department} onChange={e => set('department', e.target.value)} className={inputCls} /></Field>
              <Field label="Institution"><input value={input.institution} onChange={e => set('institution', e.target.value)} className={inputCls} /></Field>
              <Field label="Date of joining"><input value={input.joiningDate} onChange={e => set('joiningDate', e.target.value)} placeholder="dd-mm-yyyy" className={inputCls} /></Field>
              <Field label="Present pay level"><input value={input.payLevel} onChange={e => set('payLevel', e.target.value)} className={inputCls} /></Field>
              <Field label="Applying for"><input value={input.applyingFor} onChange={e => set('applyingFor', e.target.value)} placeholder="Stage / designation" className={inputCls} /></Field>
              <Field label="Scheme / regulation"><input value={input.scheme} onChange={e => set('scheme', e.target.value)} placeholder="Title and version of the approved scheme" className={inputCls} /></Field>
              <Field label="Assessment period from"><input value={input.periodFrom} onChange={e => set('periodFrom', e.target.value)} placeholder="dd-mm-yyyy" className={inputCls} /></Field>
              <Field label="Assessment period to"><input value={input.periodTo} onChange={e => set('periodTo', e.target.value)} placeholder="dd-mm-yyyy" className={inputCls} /></Field>
            </div>
            <Field label="Appointment & pay documents" hint="document | pages, one per line">
              <textarea rows={2} value={input.appointment} onChange={e => set('appointment', e.target.value)} className={areaCls} />
            </Field>
            <Field label="Promotion history">
              <textarea rows={2} value={input.promotionHistory} onChange={e => set('promotionHistory', e.target.value)} className={areaCls} />
            </Field>
          </div>

          {CLAIM_SECTIONS.map(sec => {
            const t = result.totals.find(x => x.key === sec.key)!;
            return (
              <div key={sec.key} className={`p-4 rounded-xl border space-y-2 ${sec.key === 'E' ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">Section {sec.key} · {sec.title}</h3>
                  <span className="shrink-0 text-[10px] font-mono text-slate-400">
                    {t.claims} claim(s) · {t.counted}{t.cap !== null ? `/${t.cap}` : ''} pts{t.flags ? ` · ${t.flags} flag(s)` : ''}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">{sec.focus}. Evidence: {sec.evidenceHint}.</p>
                <textarea rows={3} value={input.sections[sec.key]} onChange={e => setSection(sec.key, e.target.value)}
                  placeholder="date | activity | details | points | evidence document | pages" className={areaCls} />
              </div>
            );
          })}

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Section G · Scheme & pagination</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Section maximums" hint="From your scheme, e.g. B = 50, C = 40"><input value={input.caps} onChange={e => set('caps', e.target.value)} className={inputCls} /></Field>
              <Field label="Minimum score required"><input value={input.minimumScore} onChange={e => set('minimumScore', e.target.value)} className={inputCls} /></Field>
              <Field label="Front-matter pages" hint="Cover, index, forms"><input value={input.frontMatterPages} onChange={e => set('frontMatterPages', e.target.value)} className={inputCls} /></Field>
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 min-w-0">
          <div className="xl:sticky xl:top-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className={`p-2.5 rounded-lg border ${scoreTone}`}>
                <div className="text-xl font-bold font-mono">{result.grandTotal}{result.minimum !== null ? ` / ${result.minimum}` : ''}</div>
                <div className="text-[10px] font-semibold leading-tight">Counted score{result.minimum !== null ? ' / minimum' : ''}</div>
              </div>
              <div className="p-2.5 rounded-lg border bg-slate-800/60 text-slate-200 border-slate-700">
                <div className="text-xl font-bold font-mono">{result.totals.reduce((s, t) => s + t.claims, 0)}</div>
                <div className="text-[10px] font-semibold leading-tight">Claims</div>
              </div>
              <div className={`p-2.5 rounded-lg border ${result.flagCount ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
                <div className="text-xl font-bold font-mono">{result.flagCount}</div>
                <div className="text-[10px] font-semibold leading-tight">Verification flags</div>
              </div>
              <div className={`p-2.5 rounded-lg border ${result.missingCount ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
                <div className="text-xl font-bold font-mono">{result.missingCount}</div>
                <div className="text-[10px] font-semibold leading-tight">Missing particulars</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { copyToClipboard(result.markdown); setCopied(true); soundFx.playSuccess(); setTimeout(() => setCopied(false), 2000); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-sky-500 text-slate-950 hover:bg-sky-400">
                {copied ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}<span>Copy dossier</span>
              </button>
              <button onClick={() => exportToWordFile(fileBase, escapeHtml(result.markdown), 'PBAS / CAS Dossier', headerImage, footerImage)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:text-white">
                <FileText className="w-3.5 h-3.5" /><span>Word (.doc)</span>
              </button>
              <button onClick={() => printInstitutionalDocument(escapeHtml(result.markdown), 'PBAS / CAS Dossier', headerImage, footerImage)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:text-white">
                <Printer className="w-3.5 h-3.5" /><span>Print / PDF</span>
              </button>
            </div>

            {isSpecimen && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px]">
                Training specimen loaded. The person, orders, papers and scores are invented for practice.
              </div>
            )}

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-white text-slate-900 p-5 sm:p-7 max-h-[78vh] overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
