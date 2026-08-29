import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { INSTRUMENT_DEFINITIONS, TEN_COMMON_DRAFTING_ERRORS } from '../data/instrumentData';
import { AI_PROMPTS_LIST } from '../data/aiPromptsData';
import { INSTITUTIONAL_TEMPLATES } from '../data/templatesData';
import { LAB2_TRAPS_LIST } from '../data/lab2Data';
import { Search, X, ArrowRight, Sparkles, FileText, ShieldAlert, AlertTriangle } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : undefined;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredInstruments = INSTRUMENT_DEFINITIONS.filter(i => 
    i.name.toLowerCase().includes(query.toLowerCase()) || 
    i.rule.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPrompts = AI_PROMPTS_LIST.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.purpose.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTemplates = INSTITUTIONAL_TEMPLATES.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredErrors = TEN_COMMON_DRAFTING_ERRORS.filter(e => 
    e.phrase.toLowerCase().includes(query.toLowerCase()) || 
    e.correction.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-brand-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search instruments, AI prompts, templates, errors, and statutory rules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 text-xs divide-y divide-slate-800/60">
          {filteredPrompts.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase text-indigo-400 font-mono block">
                AI Prompts (23–28)
              </span>
              {filteredPrompts.map(p => (
                <div
                  key={p.number}
                  onClick={() => { onSelectTab('block5'); onClose(); }}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-indigo-500/60 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <span className="font-bold text-white">Prompt #{p.number}: {p.title}</span>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{p.purpose}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}

          {filteredInstruments.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase text-brand-400 font-mono block">
                Official Instruments & Rules
              </span>
              {filteredInstruments.map(i => (
                <div
                  key={i.id}
                  onClick={() => { onSelectTab('block1'); onClose(); }}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-brand-500/60 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <span className="font-bold text-white">{i.name} - <em className="text-amber-300 italic">"{i.verb}"</em></span>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{i.rule}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}

          {filteredTemplates.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono block">
                Institutional Drafting Templates
              </span>
              {filteredTemplates.map(t => (
                <div
                  key={t.id}
                  onClick={() => { onSelectTab('templates'); onClose(); }}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-emerald-500/60 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <span className="font-bold text-white">{t.title}</span>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{t.description}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}

          {filteredErrors.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase text-rose-400 font-mono block">
                10 Common Drafting Errors
              </span>
              {filteredErrors.map(e => (
                <div
                  key={e.id}
                  onClick={() => { onSelectTab('block1'); onClose(); }}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-rose-500/60 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <span className="font-bold text-rose-300">{e.phrase}</span>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{e.correction}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
