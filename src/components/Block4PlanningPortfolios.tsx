import React, { useState } from 'react';
import { AppMode } from '../types';
import { 
  COURSE_FILE_ITEMS, 
  CALENDAR_BACKWARDS_STEPS, 
  PBAS_DOSSIER_SECTIONS 
} from '../data/academicPlanningData';
import { 
  Calendar, 
  CheckSquare, 
  AlertTriangle, 
  FileSpreadsheet, 
  GraduationCap, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  Search,
  CheckCircle2
} from 'lucide-react';

export const Block4PlanningPortfolios: React.FC<{ appMode: AppMode }> = ({ appMode }) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'course_file' | 'pbas'>('course_file');
  const [courseFileChecks, setCourseFileChecks] = useState<Record<number, boolean>>({});

  const [totalCalendarDays, setTotalCalendarDays] = useState(122);
  const [sundaysAndHolidays, setSundaysAndHolidays] = useState(25);
  const [bufferDays, setBufferDays] = useState(6);
  const [cieDays, setCieDays] = useState(6);

  const availableInstructionalDays = totalCalendarDays - sundaysAndHolidays - bufferDays - cieDays;
  const isCalendarCompliant = availableInstructionalDays >= 80;

  const completedCourseFileItems = Object.values(courseFileChecks).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-sky-950 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Block 4 · 18 Minutes (1:32 – 1:50)
          </span>
          <span className="text-xs text-slate-400 font-mono">Calendar 6m · Course Files 7m · Faculty Dossier 5m · Demo Only</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Institutional Planning, Course Files & Performance Portfolios
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Build academic calendars backwards with buffer protection. Audit the 18-item course file matrix with focus on items 6, 12, 16, and 17 where audits actually fail. Connect faculty PBAS promotion dossiers directly to Block 1 Office Orders.
        </p>

        <div className="flex items-center space-x-2 mt-5 border-t border-slate-800/80 pt-4 overflow-x-auto">
          <button onClick={() => setActiveTab('course_file')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${activeTab === 'course_file' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
            <CheckSquare className="w-3.5 h-3.5" /><span>18-Item Course File Matrix (Audit Critical)</span>
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${activeTab === 'calendar' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
            <Calendar className="w-3.5 h-3.5" /><span>Academic Calendar Backwards Engine</span>
          </button>
          <button onClick={() => setActiveTab('pbas')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${activeTab === 'pbas' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
            <GraduationCap className="w-3.5 h-3.5" /><span>Faculty PBAS / CAS Dossier Structure</span>
          </button>
        </div>
      </div>

      {activeTab === 'course_file' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm">
            <strong className="font-bold text-amber-300">Auditor Insight:</strong> In 90% of NBA and NAAC peer team visits, items 1–5 and 7–11 are present. <strong>Audits fail almost exclusively on items 6, 12, 16, and 17</strong> (CO-PO justification, question paper CO tagging, mathematical CO attainment, and DAC gap analysis).
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-brand-400" />
              <span>Standard 18-Item Course File Checklist</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Completed: {completedCourseFileItems} / 18
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COURSE_FILE_ITEMS.map((item) => (
              <div 
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  item.isCriticalAuditFailure
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!courseFileChecks[item.id]}
                        onChange={(e) => setCourseFileChecks(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                      />
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {item.itemNo}. {item.title}
                      </span>
                    </div>
                    {item.isCriticalAuditFailure && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider whitespace-nowrap">
                        Audit Red Line
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">
                    {item.description}
                  </p>
                </div>

                {item.auditFailureReason && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 font-mono">
                    ⚠️ {item.auditFailureReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CALENDAR_BACKWARDS_STEPS.map((s) => (
              <div key={s.step} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-brand-400 font-mono">Step {s.step}</span>
                <h3 className="text-sm font-bold text-white">{s.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-400" />
              <span>Interactive Working-Day Arithmetic & Buffer Validator</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Total Calendar Span (Days)</label>
                <input
                  type="number"
                  value={totalCalendarDays}
                  onChange={(e) => setTotalCalendarDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Sundays & Declared Holidays</label>
                <input
                  type="number"
                  value={sundaysAndHolidays}
                  onChange={(e) => setSundaysAndHolidays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">CIE Assessment Days</label>
                <input
                  type="number"
                  value={cieDays}
                  onChange={(e) => setCieDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Emergency Buffer (Min 5-7)</label>
                <input
                  type="number"
                  value={bufferDays}
                  onChange={(e) => setBufferDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-400">Calculated Net Instructional Days:</div>
                <div className="text-2xl font-bold font-mono text-white">
                  {availableInstructionalDays} Days
                  <span className="text-xs text-slate-500 font-normal ml-2">(Statutory Min: 80–90 Days)</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                isCalendarCompliant && bufferDays >= 5
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {isCalendarCompliant && bufferDays >= 5 ? '✓ Audit Compliant Calendar' : '⚠️ Non-Compliant / Insufficient Buffer'}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pbas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs sm:text-sm">
            <strong className="font-bold">The Promotion Linkage:</strong> Your PBAS/CAS promotion dossier in 2031 is only as strong as the Office Orders issued today. Committee coordination, NBA roles, and special duties require official signed Office Orders with page-numbered annexures!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PBAS_DOSSIER_SECTIONS.map((sec) => (
              <div key={sec.section} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-brand-400 font-mono">{sec.section}</span>
                <h3 className="text-sm font-bold text-white">{sec.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {sec.focus}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
