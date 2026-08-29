import React, { useState } from 'react';
import { 
  AppMode, 
  TabType 
} from '../types';
import { 
  RUN_SHEET_SCHEDULE, 
  TRIAGE_MATRIX, 
  FACILITATOR_CHECKLISTS 
} from '../data/runSheetData';
import { 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight, 
  BookmarkCheck, 
  HelpCircle,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';

interface SessionNavigatorProps {
  appMode: AppMode;
  setCurrentTab: (tab: TabType) => void;
  onOpenPoll: () => void;
}

export const SessionNavigator: React.FC<SessionNavigatorProps> = ({
  appMode,
  setCurrentTab,
  onOpenPoll
}) => {
  const [checklist, setChecklist] = useState(FACILITATOR_CHECKLISTS);

  const toggleCheck = (category: 'oneWeekBefore' | 'oneDayBefore' | 'onTheDay', id: string) => {
    setChecklist(prev => ({
      ...prev,
      [category]: prev[category].map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    }));
  };

  const getBlockTabMapping = (blockId: string): TabType => {
    switch (blockId) {
      case 'block-1': return 'block1';
      case 'block-2': return 'block2';
      case 'block-3': return 'block3';
      case 'block-4': return 'block4';
      case 'block-5': return 'block5';
      default: return 'overview';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with clean High Contrast in both Light & Dark modes */}
      <div className="hero-banner relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Institutional Governance & Administration Curriculum
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              JSS Polytechnic, Mysuru
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Institutional Correspondence, Governance, Reporting & Digital Administration
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
            Master official administrative correspondence, statutory Board of Studies minutes with ATR rigor, accreditation metric triples, and privacy-compliant AI prompt engineering for polytechnic excellence.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('block1')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
            >
              <span>Start Block 1: Correspondence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenPoll}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Launch 3-Question Diagnostic Poll</span>
            </button>
            <button
              onClick={() => setCurrentTab('templates')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all flex items-center space-x-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Drafting Kit & Templates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Governance Through-Line Box */}
      <div className="rounded-xl border-l-4 border-amber-500 p-5 bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-start space-x-3">
          <BookmarkCheck className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-500 font-bold text-sm sm:text-base mb-1">
              The Master Governance Through-Line:
            </h3>
            <blockquote className="text-slate-300 italic text-sm sm:text-base font-serif leading-relaxed">
              "The <span className="text-amber-500 font-semibold not-italic">Office Order</span> you draft today is the evidence in someone's promotion dossier in 2031; the <span className="text-amber-500 font-semibold not-italic">minute</span> is the defence in an audit in 2028; and the <span className="text-amber-500 font-semibold not-italic">event report</span> is a criterion score in the next accreditation cycle. Nothing in this program is about paperwork."
            </blockquote>
          </div>
        </div>
      </div>

      {/* 0. The Triage Decision */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>0. The Triage Decision (Read First)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Structured delivery matrix organizing teaching units, interactive hands-on labs, and take-home drafting templates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRIAGE_MATRIX.map((item, idx) => (
            <div 
              key={idx} 
              className="rounded-xl bg-slate-900 border border-slate-800 p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                    item.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                  }`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.verdict}</h3>
                <p className="text-xs text-slate-300 font-medium mb-3 leading-relaxed">
                  <strong className="text-slate-100">Topics:</strong> {item.topics}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Format:</span> {item.sessionTreatment}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Governance Curriculum Matrix (No time stamps) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>1. Institutional Governance Curriculum Matrix</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Click any block to jump directly to its teaching notes, lab workspace, or live prompt studio.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Module</th>
                  <th className="py-3.5 px-4 font-semibold">Title & Description</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Participant Action</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {RUN_SHEET_SCHEDULE.map((block) => {
                  const isBreak = block.category === 'break';
                  return (
                    <tr 
                      key={block.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${isBreak ? 'bg-amber-500/5' : ''}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-300 whitespace-nowrap">
                        {block.clock}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="font-bold text-white">{block.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{block.description}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          block.type === 'lab' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          block.type === 'teach' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          block.type === 'demo' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                          block.type === 'break' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {block.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 hidden md:table-cell">
                        {block.participantAction}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {block.id.startsWith('block-') && block.id !== 'block-0' && block.id !== 'block-break' && block.id !== 'block-close' && (
                          <button
                            onClick={() => setCurrentTab(getBlockTabMapping(block.id))}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                          >
                            Open →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Facilitator Prep Checklist */}
      {appMode === 'facilitator' && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Facilitator Preparation Checklists</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Live checklist for facilitator readiness across preparatory stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wider flex items-center space-x-1.5">
                <span>Phase 1: Pre-Workshop Setup</span>
              </h3>
              <div className="space-y-2.5">
                {checklist.oneWeekBefore.map((item) => (
                  <label key={item.id} className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => toggleCheck('oneWeekBefore', item.id)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <span className={item.checked ? 'line-through text-slate-500' : ''}>{item.task}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-500 mb-3 uppercase tracking-wider flex items-center space-x-1.5">
                <span>Phase 2: Technical Readiness</span>
              </h3>
              <div className="space-y-2.5">
                {checklist.oneDayBefore.map((item) => (
                  <label key={item.id} className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => toggleCheck('oneDayBefore', item.id)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 mt-0.5"
                    />
                    <span className={item.checked ? 'line-through text-slate-500' : ''}>{item.task}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-emerald-500 mb-3 uppercase tracking-wider flex items-center space-x-1.5">
                <span>Phase 3: Live Session Execution</span>
              </h3>
              <div className="space-y-2.5">
                {checklist.onTheDay.map((item) => (
                  <label key={item.id} className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => toggleCheck('onTheDay', item.id)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                    />
                    <span className={item.checked ? 'line-through text-slate-500' : ''}>{item.task}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
