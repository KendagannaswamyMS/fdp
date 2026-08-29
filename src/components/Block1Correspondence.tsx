import React, { useState } from 'react';
import { AppMode } from '../types';
import { 
  INSTRUMENT_DEFINITIONS, 
  TEN_COMMON_DRAFTING_ERRORS 
} from '../data/instrumentData';
import { 
  LAB1_ORIGINAL_NOTE, 
  LAB1_SPLIT_ITEMS, 
  LAB1_TRAPS 
} from '../data/lab1Data';
import { copyToClipboard } from '../utils/exportHelper';
import { soundFx } from '../utils/audioHelper';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  Split, 
  Search,
  BookOpen
} from 'lucide-react';

export const Block1Correspondence: React.FC<{ appMode: AppMode }> = ({ appMode }) => {
  const [activeTab, setActiveTab] = useState<'teach' | 'matrix' | 'lab1' | 'errors'>('lab1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFacilitatorKey, setShowFacilitatorKey] = useState(appMode === 'facilitator');
  React.useEffect(() => { setShowFacilitatorKey(appMode === 'facilitator'); }, [appMode]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [userDrafts, setUserDrafts] = useState<Record<string, { refNo: string; instrumentType: string; signatory: string; openingPara: string }>>({
    'split-1': { refNo: '', instrumentType: 'Notice', signatory: 'Controller of Examinations', openingPara: '' },
    'split-2': { refNo: '', instrumentType: 'Circular', signatory: 'Principal', openingPara: '' },
    'split-3': { refNo: '', instrumentType: 'Office Order', signatory: 'Principal', openingPara: '' },
    'split-4': { refNo: '', instrumentType: 'Office Memorandum', signatory: 'Administrative Officer', openingPara: '' },
  });

  const handleCopy = (id: string, text: string) => {
    copyToClipboard(text);
    setCopiedId(id);
    soundFx.playSuccess();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInstruments = INSTRUMENT_DEFINITIONS.filter(inst => 
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.verb.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.rule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Block 1 · 25 Minutes (0:07 – 0:32)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Teach 13m · Lab 1 10m · Debrief 2m
            </span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Institutional Correspondence & Instrument Selection
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Order commands. Circular instructs. Notice informs. OM asks. Letter represents. Master authority-to-scope alignment and split ambiguous notes into auditable statutory documents.
        </p>

        <div className="flex items-center space-x-2 mt-5 border-t border-slate-800/80 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('lab1')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'lab1'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Lab 1: Notice vs Circular Splitter (10m)</span>
          </button>
          <button
            onClick={() => setActiveTab('teach')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'teach'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Teach: 3 Core Slides (13m)</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'matrix'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Instrument Matrix (6 Types)</span>
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'errors'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>10 Common Errors</span>
          </button>
        </div>
      </div>

      {activeTab === 'teach' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                  Slide 1 · The Golden Decision Rule
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-4">Five Verbs of Governance</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-400">Office Order (OO)</span>
                      <span className="block text-[10px] text-slate-400">ಆದೇಶ · Service & Rights</span>
                    </div>
                    <span className="text-slate-300 font-serif italic text-right">Commands (Rights, Duties, Service)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-400">Circular (CIR)</span>
                      <span className="block text-[10px] text-slate-400">ಸುತ್ತೋಲೆ · General Policy</span>
                    </div>
                    <span className="text-slate-300 font-serif italic text-right">Instructs (Institution-wide policy)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sky-400">Notice (NOT)</span>
                      <span className="block text-[10px] text-slate-400">ಪ್ರಕಟಣೆ · Event Display</span>
                    </div>
                    <span className="text-slate-300 font-serif italic text-right">Informs (Time-bound event / display)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-400">Office Memorandum (OM)</span>
                      <span className="block text-[10px] text-slate-400">ಕಾರ್ಯಾಲಯ ಜ್ಞಾಪನ · Internal Call</span>
                    </div>
                    <span className="text-slate-300 font-serif italic text-right">Asks / Conveys (Internal request & data call)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-400">Official Letter (LTR)</span>
                      <span className="block text-[10px] text-slate-400">ಅಧಿಕೃತ ಪತ್ರ · External DTE/AICTE</span>
                    </div>
                    <span className="text-slate-300 font-serif italic text-right">Represents (External body / DTE / AICTE)</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                Rule: "Never instruct when you must command; never represent without statutory competence."
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  Slide 2 · The 80% Error Trap
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-3">Person, Salutation & Subscription</h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <strong className="text-amber-300">Internal Orders/Circulars:</strong> Third person ("It is hereby ordered..."). <strong className="text-rose-400">NO salutation</strong>, <strong className="text-rose-400">NO subscription</strong>.
                  </p>
                  <p className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <strong className="text-indigo-300">Official External Letters:</strong> First person ("I am directed to convey..."). Requires <strong className="text-emerald-400">"Sir / Madam"</strong> and <strong className="text-emerald-400">"Yours faithfully"</strong>.
                  </p>
                  <p className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <strong className="text-sky-300">Authority vs Scope:</strong> HoD can only sign for their department. Whole-college circulars must be signed by the Principal.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                80% of institutional audit rejections occur due to mismatched signatory authority.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                  Slide 3 · The Laugh & The Law
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-3">Banning "Please Do the Needful"</h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20">
                    <span className="font-bold text-rose-300">Why it fails:</span> Passes ambiguity down the line. If something goes wrong, no officer has defined accountability.
                  </div>
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-bold text-emerald-300">Auditable Replacement:</span> Name the officer, state the exact deliverable, and set a hard ISO calendar date.
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                    <span className="font-bold text-slate-200">The 4-Register Rule:</span> One note ≠ One document. 4 topics require 4 file numbers and 4 separate register entries.
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                Show one anonymised noting sheet on screen for 60s and point to the kit.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lab1' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 border-2 border-rose-500/30 p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Lab 1 Handout · "The Ambiguous Note"
                </span>
                <span className="text-xs text-slate-400">10 Min Table Exercise (Tables of 4)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy('lab1-orig', LAB1_ORIGINAL_NOTE)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700"
                >
                  {copiedId === 'lab1-orig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Note</span>
                </button>
                <button
                  onClick={() => setShowFacilitatorKey(!showFacilitatorKey)}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5"
                >
                  {showFacilitatorKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showFacilitatorKey ? 'Hide Facilitator Key' : 'Reveal Facilitator Key & Traps'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-sans text-sm sm:text-base leading-relaxed italic">
              "{LAB1_ORIGINAL_NOTE}"
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="text-rose-400 font-semibold">
                Challenge: Split this single messy paragraph into 4 distinct, legally sound institutional instruments.
              </span>
              <span>Deliverable: Headers (Ref, Addressee, Signatory) + Opening Paragraph</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Split className="w-5 h-5 text-brand-400" />
              <span>Interactive Split Studio (4 Instruments)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {LAB1_SPLIT_ITEMS.map((splitItem) => {
                const userState = userDrafts[splitItem.id];
                return (
                  <div 
                    key={splitItem.id}
                    className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {splitItem.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          splitItem.correctInstrument === 'Notice' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                          splitItem.correctInstrument === 'Circular' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          splitItem.correctInstrument === 'Office Order' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {splitItem.correctInstrument}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 italic mb-4">
                        "{splitItem.contentSnippet}"
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-medium mb-1">Generated Reference Number</label>
                          <input
                            type="text"
                            placeholder={splitItem.modelRefNo}
                            value={userState.refNo}
                            onChange={(e) => setUserDrafts(prev => ({
                              ...prev,
                              [splitItem.id]: { ...prev[splitItem.id], refNo: e.target.value }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-400 font-medium mb-1">Instrument Type</label>
                            <select
                              value={userState.instrumentType}
                              onChange={(e) => setUserDrafts(prev => ({
                                ...prev,
                                [splitItem.id]: { ...prev[splitItem.id], instrumentType: e.target.value }
                              }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            >
                              <option value="Notice">Notice</option>
                              <option value="Circular">Circular</option>
                              <option value="Office Order">Office Order</option>
                              <option value="Office Memorandum">Office Memorandum</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-400 font-medium mb-1">Competent Signatory</label>
                            <input
                              type="text"
                              value={userState.signatory}
                              onChange={(e) => setUserDrafts(prev => ({
                                ...prev,
                                [splitItem.id]: { ...prev[splitItem.id], signatory: e.target.value }
                              }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-medium mb-1">Opening Paragraph & Subject</label>
                          <textarea
                            rows={3}
                            placeholder={`Subject: ${splitItem.modelSubject}\n\n${splitItem.modelOpening}`}
                            value={userState.openingPara}
                            onChange={(e) => setUserDrafts(prev => ({
                              ...prev,
                              [splitItem.id]: { ...prev[splitItem.id], openingPara: e.target.value }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {showFacilitatorKey && (
                      <div className="pt-3 border-t border-slate-800 space-y-2 bg-slate-950/60 p-3 rounded-lg border border-amber-500/20">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-amber-400">⚡ Facilitator Gold Standard Key:</span>
                          <button
                            onClick={() => handleCopy(`key-${splitItem.id}`, `${splitItem.modelRefNo}\nSubject: ${splitItem.modelSubject}\n\n${splitItem.modelOpening}`)}
                            className="text-slate-400 hover:text-amber-300 flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                        <div className="text-xs text-slate-300 font-mono space-y-1">
                          <p><span className="text-slate-500">Ref:</span> {splitItem.modelRefNo}</p>
                          <p><span className="text-slate-500">Signatory:</span> <strong className="text-emerald-400">{splitItem.signatory}</strong></p>
                          <p><span className="text-slate-500">Subject:</span> {splitItem.modelSubject}</p>
                          <p className="text-slate-200 font-sans text-[11px] leading-snug pt-1">
                            {splitItem.modelOpening}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {showFacilitatorKey && (
            <div className="rounded-xl bg-slate-900 border border-amber-500/30 p-5 space-y-4">
              <h3 className="text-base font-bold text-amber-300 flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Facilitator Debrief - 4 Traps to Call Out Live</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LAB1_TRAPS.map((trap, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{trap.trap}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                        {trap.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {trap.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search instrument rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredInstruments.length} institutional instruments
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Instrument & Verb</th>
                    <th className="py-3 px-4 font-semibold">Governance Rule & Purpose</th>
                    <th className="py-3 px-3 font-semibold">Person / Salutation / Subscription</th>
                    <th className="py-3 px-3 font-semibold">Signatory & Scope</th>
                    <th className="py-3 px-3 font-semibold">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredInstruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        <div className="font-bold text-brand-400 text-sm">{inst.name}</div>
                        <div className="text-xs text-amber-300 font-serif italic">"{inst.verb}"</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{inst.exampleRef}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="leading-snug">{inst.rule}</p>
                        <p className="text-[11px] text-rose-300 mt-1">
                          <strong className="text-slate-400">Trap:</strong> {inst.commonMistake}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <p><strong className="text-slate-400">Person:</strong> {inst.person}</p>
                          <p><strong className="text-slate-400">Salutation:</strong> {inst.salutation}</p>
                          <p><strong className="text-slate-400">Sub:</strong> {inst.subscription}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-emerald-300">{inst.signatory}</p>
                          <p className="text-slate-400 text-[11px]">{inst.scope}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
                          {inst.retentionCategory}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'errors' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm">
            <strong className="font-bold">Facilitator Tip:</strong> Read these fast in minute 10 of Block 1. Ask for a show of hands on <em>"please do the needful"</em> - the collective laugh buys you goodwill and attention for the entire program!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEN_COMMON_DRAFTING_ERRORS.map((err) => (
              <div 
                key={err.id}
                className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center font-mono">
                    {err.id}
                  </span>
                  <h3 className="font-bold text-rose-300 text-sm">{err.phrase}</h3>
                </div>
                <div className="pl-8 space-y-1 text-xs">
                  <p className="text-emerald-300 font-medium">
                    <strong className="text-slate-300">Auditable Fix:</strong> {err.correction}
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    <strong className="text-slate-500">Legal/Audit Risk:</strong> {err.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
