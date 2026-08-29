import React from 'react';
import { 
  AppMode, 
  TabType 
} from '../types';
import { 
  BookOpen, 
  Layers, 
  FileText, 
  Users, 
  BarChart3, 
  Calendar, 
  Sparkles, 
  FileCode, 
  Search, 
  GraduationCap,
  Sparkle,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenSearch: () => void;
  onOpenPoll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  appMode,
  setAppMode,
  theme,
  setTheme,
  onOpenSearch,
  onOpenPoll,
}) => {
  const tabs = [
    { id: 'overview' as TabType, label: 'Curriculum & Triage', icon: Layers, badge: 'Overview' },
    { id: 'block1' as TabType, label: 'B1: Correspondence', icon: FileText, badge: 'Lab 1' },
    { id: 'block2' as TabType, label: 'B2: Meetings & MoM', icon: Users, badge: 'Lab 2' },
    { id: 'block3' as TabType, label: 'B3: Reporting & Compliance', icon: BarChart3, badge: 'Lab 3' },
    { id: 'block4' as TabType, label: 'B4: Planning & Course Files', icon: Calendar, badge: 'Audit' },
    { id: 'block5' as TabType, label: 'B5: Digital, Security & AI', icon: Sparkles, badge: 'Prompts' },
    { id: 'faculty-profile' as TabType, label: 'Faculty Profile', icon: UserCheck, badge: 'A4 Studio' },
    { id: 'templates' as TabType, label: 'Drafting Kit & Templates', icon: FileCode, badge: 'Templates' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl transition-colors duration-150">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-brand-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 ring-1 ring-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                  Institutional Governance & Correspondence Suite
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  JSS Polytechnic, Mysuru
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Facilitator Master Cockpit & Faculty Institutional Workbench
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all shadow-inner hover:scale-105"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors shadow-inner"
              title="Search all instruments, prompts, templates, rules, and labs (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline">Search...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 rounded border border-slate-700">
                Ctrl+K
              </kbd>
            </button>

            {/* Diagnostic Poll Button */}
            <button
              onClick={onOpenPoll}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
            >
              <Sparkle className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostic Poll</span>
            </button>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                onClick={() => setAppMode('facilitator')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  appMode === 'facilitator'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Facilitator</span>
              </button>
              <button
                onClick={() => setAppMode('practitioner')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  appMode === 'practitioner'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Workbench</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800/60 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
