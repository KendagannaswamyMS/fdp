import React, { useState } from 'react';
import { DIAGNOSTIC_POLL } from '../data/runSheetData';
import { soundFx } from '../utils/audioHelper';
import { X, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

export const DiagnosticPollModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    let score = 0;
    DIAGNOSTIC_POLL.forEach(q => {
      const selected = selectedAnswers[q.id];
      if (selected !== undefined && q.options[selected].correct) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    setShowResults(true);
    soundFx.playSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Session Diagnostic Poll (3 Questions)</h2>
              <p className="text-xs text-slate-400">Launch in Minute 3 of the FDP Opening</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {DIAGNOSTIC_POLL.map((q, qIndex) => (
            <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-white flex items-start space-x-2">
                <span className="text-brand-400 font-mono">{qIndex + 1}.</span>
                <span>{q.question}</span>
              </h3>

              <div className="space-y-2">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedAnswers[q.id] === optIndex;
                  return (
                    <label
                      key={optIndex}
                      onClick={() => handleSelect(q.id, optIndex)}
                      className={`flex items-start space-x-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                        showResults && opt.correct
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                          : showResults && isSelected && !opt.correct
                          ? 'bg-rose-950/40 border-rose-500/80 text-rose-200'
                          : isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 text-indigo-500"
                      />
                      <div className="space-y-1">
                        <span>{opt.text}</span>
                        {showResults && opt.correct && (
                          <p className="text-[11px] font-mono text-emerald-400">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {showResults ? (
            <div className="text-xs font-bold text-emerald-400">
              Score: {calculateScore()} / 3 Correct!
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Select one option per question
            </div>
          )}

          <div className="flex items-center space-x-2">
            {!showResults ? (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                Submit Answers
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close Poll
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
