import React, { useState } from 'react';
import { AppMode } from '../types';
import { 
  LAB3_FLAWED_SPECIMEN, 
  LAB3_FIFTEEN_GAPS, 
  LAB3_MODEL_REWRITE, 
  NINE_PART_EVENT_REPORT_STRUCTURE 
} from '../data/lab3Data';
import { copyToClipboard } from '../utils/exportHelper';
import { soundFx } from '../utils/audioHelper';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Search,
  Lock,
  Camera,
  Layers
} from 'lucide-react';

export const Block3ReportingCompliance: React.FC<{ appMode: AppMode }> = ({ appMode }) => {
  const [activeTab, setActiveTab] = useState<'lab3' | 'triple_rule' | 'nine_parts' | 'confidential'>('lab3');
  const [showFacilitatorKey, setShowFacilitatorKey] = useState(appMode === 'facilitator');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [checkedGaps, setCheckedGaps] = useState<Record<number, boolean>>({});
  const [userExecutiveSummary, setUserExecutiveSummary] = useState('');

  const [metricInput, setMetricInput] = useState('signed 4 MoUs and placed 37 of 52 eligible students (71.2%) in AY 2025-26');
  const [locatorInput, setLocatorInput] = useState('Annexure 4.2, pp. 11–19; MoU copies at Annexure 4.3');

  const handleCopy = (id: string, text: string) => {
    copyToClipboard(text);
    setCopiedId(id);
    soundFx.playSuccess();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const detectedGapsCount = Object.values(checkedGaps).filter(Boolean).length;
  const combinedTripleSentence = `The department ${metricInput} (${locatorInput}).`;

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Block 3 · 25 Minutes (1:07 – 1:32)
          </span>
          <span className="text-xs text-slate-400 font-mono">Teach 12m · Lab 3 Audit 11m · Debrief 2m</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Academic Reporting, Accreditation & Confidential Governance
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Accreditation writing is not descriptive writing - every claim is a triple: <strong>Claim → Metric → Evidence Locator</strong>. Master the 9-part event report architecture, geo-tagging rules, and natural justice in show-cause notices.
        </p>

        <div className="flex items-center space-x-2 mt-5 border-t border-slate-800/80 pt-4 overflow-x-auto">
          <button onClick={() => setActiveTab('lab3')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${activeTab === 'lab3' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
            <BarChart3 className="w-3.5 h-3.5" /><span>Lab 3: Report Deconstruction & 15-Gap Scanner (11m)</span>
          </button>
          <button onClick={() => setActiveTab('triple_rule')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${activeTab === 'triple_rule' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
            <Sparkles className="w-3.5 h-3.5" /><span>The Accreditation Triple Rule</span>
          </button>
          <button onClick={() => setActiveTab('nine_parts')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${activeTab === 'nine_parts' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
            <Layers className="w-3.5 h-3.5" /><span>9-Part Event Architecture</span>
          </button>
          <button onClick={() => setActiveTab('confidential')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${activeTab === 'confidential' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
            <Lock className="w-3.5 h-3.5" /><span>Confidential & Show-Cause Rules</span>
          </button>
        </div>
      </div>

      {activeTab === 'lab3' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 border-2 border-rose-500/40 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Lab 3 Handout · "The Specimen Report"
                </span>
                <span className="text-xs text-slate-400">11 Min Table Exercise (Tables of 4)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy('lab3-specimen', LAB3_FLAWED_SPECIMEN)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700"
                >
                  {copiedId === 'lab3-specimen' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Report</span>
                </button>
                <button
                  onClick={() => setShowFacilitatorKey(!showFacilitatorKey)}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5"
                >
                  {showFacilitatorKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showFacilitatorKey ? 'Hide Gold Rewrite' : 'Reveal 15-Gap Key & Gold Rewrite'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-sans text-sm leading-relaxed whitespace-pre-line">
              {LAB3_FLAWED_SPECIMEN}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-rose-400 font-semibold">
              <span>Goal: Identify all 15 compliance gaps and draft an auditable Executive Summary with numbers.</span>
              <span className="text-slate-400 font-normal">Every adjective removed should be replaced by a number!</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Search className="w-4 h-4 text-brand-400" />
                  <span>Interactive 15-Point Gap Scanner</span>
                </h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  detectedGapsCount === 15 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {detectedGapsCount} / 15 Gaps Tagged
                </span>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {LAB3_FIFTEEN_GAPS.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedGaps[item.id]}
                      onChange={(e) => setCheckedGaps(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="mt-0.5 rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-rose-500"
                    />
                    <div className="space-y-0.5">
                      <span className={`font-semibold ${checkedGaps[item.id] ? 'text-rose-300' : 'text-slate-300'}`}>
                        {item.id}. {item.gap}
                      </span>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {item.why}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">
                    Participant Rewrite: Auditable Executive Summary (≤150 words)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Include Metrics & POs</span>
                </div>
                <textarea
                  rows={6}
                  placeholder="A two-day workshop on {{topic}} was organized on {{dates}} with {{resource person}}... Against target 60, 74 attended (68 students, 6 faculty)... Feedback 4.68/5... Mapped to NBA Criterion 4.2..."
                  value={userExecutiveSummary}
                  onChange={(e) => setUserExecutiveSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {showFacilitatorKey && (
                <div className="rounded-xl bg-slate-900 border border-amber-500/30 p-4 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Model Executive Summary (Accreditation Ready)</span>
                    </span>
                    <button
                      onClick={() => handleCopy('model-rewrite', LAB3_MODEL_REWRITE)}
                      className="text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                    >
                      {copiedId === 'model-rewrite' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Model</span>
                    </button>
                  </div>
                  <p className="text-slate-200 text-xs font-serif leading-relaxed p-3 rounded-lg bg-slate-950 border border-slate-800">
                    {LAB3_MODEL_REWRITE}
                  </p>
                  <p className="text-[11px] text-amber-300/90 italic font-mono pt-1">
                    Debrief: "Every adjective removed from a report should be replaced by a number. If it cannot be replaced by a number, it did not belong there."
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'triple_rule' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm">
            <strong className="font-bold">The Core Accreditation Principle:</strong> Evaluators from NBA and NAAC reject narrative prose. Every single claim must be formulated as a verifiable Triple: <strong>Claim → Metric → Evidence Locator</strong>.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">1. Descriptive Claim (Worthless)</span>
              <p className="text-xs text-slate-300 italic p-3 rounded bg-slate-950 border border-slate-800">
                "The department strengthened industry interface and organized highly fruitful student training."
              </p>
              <p className="text-[11px] text-rose-400">Zero auditable value. Gives 0 marks in SSR evaluation.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">2. Metric Added (Better)</span>
              <p className="text-xs text-slate-300 italic p-3 rounded bg-slate-950 border border-slate-800">
                "The department signed 4 MoUs and placed 37 of 52 eligible students (71.2%) in AY 2025-26."
              </p>
              <p className="text-[11px] text-amber-400">Has numbers, but assessor cannot verify without page reference.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">3. Complete Triple (Accreditation Gold)</span>
              <p className="text-xs text-slate-200 italic p-3 rounded bg-slate-950 border border-slate-800">
                "The department signed 4 MoUs and placed 37 of 52 eligible students (71.2%) in AY 2025-26 <strong>(Annexure 4.2, pp. 11–19; MoU copies at 4.3)</strong>."
              </p>
              <p className="text-[11px] text-emerald-400">Instantly verified. Scores full compliance points!</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Interactive Triple Sentence Generator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Quantitative Metric Statement</label>
                <input
                  type="text"
                  value={metricInput}
                  onChange={(e) => setMetricInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Evidence Locator (Annexure & Page Numbers)</label>
                <input
                  type="text"
                  value={locatorInput}
                  onChange={(e) => setLocatorInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
              <div className="text-xs font-serif text-emerald-300">
                <strong>Generated Accreditation Triple:</strong> "{combinedTripleSentence}"
              </div>
              <button
                onClick={() => handleCopy('triple-gen', combinedTripleSentence)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nine_parts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NINE_PART_EVENT_REPORT_STRUCTURE.map((part) => (
              <div key={part.part} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-brand-400 font-mono">Part {part.part}</span>
                <h3 className="text-sm font-bold text-white">{part.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {part.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-brand-500/30 space-y-2">
            <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Geo-Tagging & Photographic Evidence Discipline (60 Seconds)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Photographs must carry visible date, time, and location GPS coordinates captured <strong>at the event</strong> via a camera stamping app. Post-hoc editing is detected and disqualified. Minimum 4 mandatory angles: (1) Inauguration wide shot, (2) Audience wide shot showing headcount, (3) Hands-on lab in progress, (4) Valedictory / certificate distribution.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'confidential' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">Principle 1</span>
              <h3 className="text-sm font-bold text-white">Audi Alteram Partem (Natural Justice)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No adverse finding or penalty without a specific charge communicated in writing and a reasonable opportunity to submit an explanation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">Principle 2</span>
              <h3 className="text-sm font-bold text-white">Zero Pre-Judgment in Language</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A show-cause notice states: <em>"You are hereby called upon to explain why action should not be taken..."</em>, NEVER <em>"You have committed gross misconduct..."</em>. Pre-judgment vitiates the entire inquiry in court.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">Principle 3</span>
              <h3 className="text-sm font-bold text-white">Separation of Roles</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The complainant, the inquiry officer, and the disciplinary authority cannot be the same person. Combining roles violates procedural fairness.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">Principle 4</span>
              <h3 className="text-sm font-bold text-white">Fact-Finding ≠ Inquiry</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A preliminary fact-finding committee only establishes whether a prima facie case exists; it has zero authority to award penalties. Formal inquiry requires formal charge-sheet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
