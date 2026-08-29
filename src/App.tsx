import React, { useState, useEffect } from 'react';
import { AppMode, TabType } from './types';
import { Navbar } from './components/Navbar';
import { SessionNavigator } from './components/SessionNavigator';
import { Block1Correspondence } from './components/Block1Correspondence';
import { Block2MeetingGovernance } from './components/Block2MeetingGovernance';
import { Block3ReportingCompliance } from './components/Block3ReportingCompliance';
import { Block4PlanningPortfolios } from './components/Block4PlanningPortfolios';
import { Block5DigitalSecurity } from './components/Block5DigitalSecurity';
import { TemplateHub } from './components/TemplateHub';
import { FacultyProfileGenerator } from './components/FacultyProfileGenerator';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { DiagnosticPollModal } from './components/DiagnosticPollModal';
import { 
  Building2, 
  Shield, 
  FileText
} from 'lucide-react';

const THEME_STORAGE_KEY = 'jsspm_app_theme';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [appMode, setAppMode] = useState<AppMode>('facilitator');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);

  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme in localStorage', e);
    }

    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
      theme === 'light' ? 'theme-light bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white' : 'bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white'
    }`}>
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        appMode={appMode}
        setAppMode={setAppMode}
        theme={theme}
        setTheme={setTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPoll={() => setIsPollOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5">
        {currentTab === 'overview' && (
          <SessionNavigator 
            appMode={appMode}
            setCurrentTab={(tab: TabType) => setCurrentTab(tab)} 
            onOpenPoll={() => setIsPollOpen(true)}
          />
        )}
        
        {currentTab === 'block1' && <Block1Correspondence appMode={appMode} />}
        {currentTab === 'block2' && <Block2MeetingGovernance appMode={appMode} />}
        {currentTab === 'block3' && <Block3ReportingCompliance appMode={appMode} />}
        {currentTab === 'block4' && <Block4PlanningPortfolios appMode={appMode} />}
        {currentTab === 'block5' && <Block5DigitalSecurity appMode={appMode} />}
        {currentTab === 'faculty-profile' && <FacultyProfileGenerator />}
        {currentTab === 'templates' && <TemplateHub />}
      </main>

      {/* Global Modals */}
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectTab={(tab: TabType) => {
          setCurrentTab(tab);
          setIsSearchOpen(false);
        }} 
      />

      <DiagnosticPollModal 
        isOpen={isPollOpen} 
        onClose={() => setIsPollOpen(false)} 
      />

      {/* Institutional Footer (without timestamps) */}
      <footer className="bg-slate-900/90 border-t border-slate-800 py-8 mt-auto transition-colors duration-150">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
            <div>
              <div className="flex items-center space-x-2 text-slate-200 font-bold mb-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>JSS Polytechnic, Mysuru</span>
              </div>
              <p className="leading-relaxed">
                JSS Technical Institutions Campus, Mysuru – 570 006, Karnataka, India.
                Recognized by AICTE New Delhi & Affiliated to Directorate of Technical Education (DTE), Karnataka.
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 text-slate-200 font-bold mb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Governance & Statutory Compliance</span>
              </div>
              <p className="leading-relaxed">
                Conforms strictly to Central Secretariat Manual of Office Procedure (CSMOP),
                RTI Act 2005, DPDP Act 2023, NBA (Tier-II Diploma Guidelines), and NAAC Institutional Reporting Standards.
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 text-slate-200 font-bold mb-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Faculty Development Programme (FDP)</span>
              </div>
              <p className="leading-relaxed">
                <strong>Subject:</strong> Institutional Correspondence, Governance, Reporting & Digital Administration.
                <br />
                <strong>Suite:</strong> Live Facilitator Cockpit & Faculty Drafting Workbench Suite.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <p>© 2026 JSS Polytechnic, Mysuru. All Rights Reserved.</p>
            <p className="mt-2 sm:mt-0 font-medium">Google Gemini AI Integrated</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
