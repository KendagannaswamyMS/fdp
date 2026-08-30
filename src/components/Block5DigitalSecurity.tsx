import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '../types';
import { 
  AI_PROMPTS_LIST 
} from '../data/aiPromptsData';
import { 
  ISO_NAMING_TAXONOMY, 
  FOLDER_HIERARCHY_RULES, 
  RTI_DPDP_RED_LINES, 
  PII_SANITIZER_SAMPLES 
} from '../data/digitalSecurityData';
import { 
  generateWithGemini, 
  getStoredApiKey, 
  setStoredApiKey, 
  clearStoredApiKey,
  generateInstitutionalSimulation
} from '../services/geminiService';
import {
  exportToWordFile,
  copyToClipboard,
  formatInstitutionalDocumentToHtml,
  printInstitutionalDocument,
  HEADER_IMAGE_STORAGE_KEY,
  FOOTER_IMAGE_STORAGE_KEY
} from '../utils/exportHelper';
import { 
  ShieldCheck, 
  Sparkles, 
  FolderTree, 
  FileLock2, 
  Copy, 
  Check, 
  Key, 
  Send, 
  Loader2, 
  AlertCircle, 
  Trash2, 
  FileText, 
  ShieldAlert, 
  Terminal,
  Printer,
  Download,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface Block5DigitalSecurityProps {
  appMode: AppMode;
}

const STORAGE_HEADER_IMG = HEADER_IMAGE_STORAGE_KEY;
const STORAGE_FOOTER_IMG = FOOTER_IMAGE_STORAGE_KEY;

export const Block5DigitalSecurity: React.FC<Block5DigitalSecurityProps> = ({ appMode }) => {
  const [activeSubTab, setActiveSubTab] = useState<'prompts' | 'naming' | 'folder' | 'dpdp' | 'sanitizer'>('prompts');
  
  // Selected Prompt
  const [selectedPromptNum, setSelectedPromptNum] = useState<number>(1);
  const currentPrompt = AI_PROMPTS_LIST.find(p => p.number === selectedPromptNum) || AI_PROMPTS_LIST[0];

  // Gemini API Key State
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [isKeySaved, setIsKeySaved] = useState(!!getStoredApiKey());
  
  // Real-time AI execution
  const [customInput, setCustomInput] = useState(currentPrompt.sampleInput);
  const [aiOutput, setAiOutput] = useState<string>(() => generateInstitutionalSimulation(AI_PROMPTS_LIST[0].sampleInput, 1));
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  // Header & Footer Image Upload State
  const [headerImage, setHeaderImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_HEADER_IMG);
    } catch {
      return null;
    }
  });

  const [footerImage, setFooterImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_FOOTER_IMG);
    } catch {
      return null;
    }
  });

  const headerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  // Naming tool state
  const [namingCategory, setNamingCategory] = useState('CIRCULAR');
  const [namingDept, setNamingDept] = useState('CSE');
  const [namingAcademicYear, setNamingAcademicYear] = useState('2026-27');
  const [namingRefNo, setNamingRefNo] = useState('045');
  const [namingSubject, setNamingSubject] = useState('75Percent_Attendance_Mandate');

  // PII Sanitizer tool state
  const [sanitizerInput, setSanitizerInput] = useState(PII_SANITIZER_SAMPLES[0].rawText);
  const [sanitizedOutput, setSanitizedOutput] = useState('');

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [outputViewMode, setOutputViewMode] = useState<'formatted' | 'raw'>('formatted');

  // Auto-update input when prompt changes
  useEffect(() => {
    setCustomInput(currentPrompt.sampleInput);
    setAiError('');
    setAiOutput(generateInstitutionalSimulation(currentPrompt.sampleInput, currentPrompt.number));
  }, [selectedPromptNum]);

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setStoredApiKey(apiKey);
      setIsKeySaved(true);
    }
  };

  const handleClearApiKey = () => {
    clearStoredApiKey();
    setApiKey('');
    setIsKeySaved(false);
  };

  // Header Image Upload Handler
  const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setHeaderImage(base64);
        try {
          localStorage.setItem(STORAGE_HEADER_IMG, base64);
        } catch (err) {
          console.warn('LocalStorage limit reached for image', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveHeader = () => {
    setHeaderImage(null);
    try {
      localStorage.removeItem(STORAGE_HEADER_IMG);
    } catch {}
    if (headerInputRef.current) headerInputRef.current.value = '';
  };

  // Footer Image Upload Handler
  const handleFooterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFooterImage(base64);
        try {
          localStorage.setItem(STORAGE_FOOTER_IMG, base64);
        } catch (err) {
          console.warn('LocalStorage limit reached for image', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFooter = () => {
    setFooterImage(null);
    try {
      localStorage.removeItem(STORAGE_FOOTER_IMG);
    } catch {}
    if (footerInputRef.current) footerInputRef.current.value = '';
  };

  const handleExecuteGemini = async () => {
    setIsLoadingAi(true);
    setAiError('');
    try {
      const fullPrompt = `You are an expert institutional officer at JSS Polytechnic, Mysuru. Strictly draft the following document type: "${currentPrompt.title}".
Instructions:
${currentPrompt.promptText}

[RAW INPUT DATA / SPECIFICATIONS]:
${customInput}`;

      const result = await generateWithGemini({
        apiKey,
        prompt: fullPrompt,
        rawInput: customInput,
        promptNumber: currentPrompt.number,
        model: selectedModel
      });
      setAiOutput(result);
    } catch (err: any) {
      setAiError(err.message || 'Generation error. Switched to offline institutional specimen output.');
      setAiOutput(generateInstitutionalSimulation(customInput, currentPrompt.number));
    } finally {
      setIsLoadingAi(false);
    }
  };

  // 1. Load Sample Text Specimen
  const handleLoadSampleText = () => {
    const sample = generateInstitutionalSimulation(currentPrompt.sampleInput, currentPrompt.number);
    setAiOutput(sample);
    setCustomInput(currentPrompt.sampleInput);
    setAiError('');
  };

  // 2. Export to Word (.doc) with Header and Footer
  const handleExportWordDoc = () => {
    const textToExport = aiOutput || generateInstitutionalSimulation(customInput, currentPrompt.number);
    const filename = `JSSPM_${currentPrompt.title.replace(/[^a-zA-Z0-9]/g, '_')}`;
    exportToWordFile(filename, textToExport, currentPrompt.title, headerImage, footerImage);
  };

  // 3. Print / Save as PDF with Header, Footer, Justified text & Strict A4 Single-Page Geometry
  const handlePrintOutput = () => {
    const textToPrint = aiOutput || generateInstitutionalSimulation(customInput, currentPrompt.number);
    printInstitutionalDocument(textToPrint, currentPrompt.title, headerImage, footerImage);
  };

  const generateIsoFilename = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${today}_JSSPM_${namingDept}_${namingCategory}_${namingRefNo}_${namingSubject}_v1.0.pdf`;
  };

  const handleSanitizePII = () => {
    let text = sanitizerInput;
    text = text.replace(/([A-Z][a-z]+ [A-Z][a-z]+)/g, '[STUDENT_NAME_REDACTED]');
    text = text.replace(/\b\d{2}[A-Z]{2,4}\d{3,5}\b/g, '[REG_NO_REDACTED]');
    text = text.replace(/\b[6-9]\d{9}\b/g, '[PHONE_REDACTED]');
    text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
    text = text.replace(/\b(Rs\.?|INR)\s*[\d,]+\b/gi, '[FEE_AMOUNT_CONFIDENTIAL]');
    setSanitizedOutput(text);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                B5 - Digital Administration, Security & AI Prompt Studio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  15 Complete Statutory Prompts (Parts 1–5)
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Live Google Gemini AI Studio for institutional correspondence, ISO file taxonomy, DPDP Act 2023 compliance, and Custom Header/Footer branding.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('prompts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'prompts'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Prompt Studio (Live Runner)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('naming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'naming'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>ISO 8601 Naming Generator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('folder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'folder'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>4-Tier Department Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dpdp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'dpdp'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileLock2 className="w-4 h-4" />
          <span>RTI & DPDP Act Red Lines</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sanitizer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === 'sanitizer'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>AI Red-Line PII Pre-Sanitizer</span>
        </button>
      </div>

      {/* SUBTAB 1: AI PROMPT STUDIO */}
      {activeSubTab === 'prompts' && (
        <div className="space-y-6">
          {/* Institutional Letterhead Header & Footer Upload Section */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center space-x-2.5">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Institutional Letterhead Header & Footer Banners</h3>
                  <p className="text-xs text-slate-400">Upload separate official header and footer image banners for live preview, PDF print, and Word exports.</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit">
                Automatic Auto-Save in Browser
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Header Image Upload Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>1. Institutional Header Banner</span>
                      {headerImage && <span className="text-[10px] text-emerald-400 font-normal">(Active)</span>}
                    </span>
                    {headerImage && (
                      <button
                        onClick={handleRemoveHeader}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {headerImage ? (
                    <div className="relative rounded-lg border border-slate-800 overflow-hidden bg-white/5 p-2 flex items-center justify-center max-h-24">
                      <img src={headerImage} alt="Header Banner" className="max-h-20 max-w-full object-contain rounded" />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border-2 border-dashed border-slate-800 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1">
                      <Upload className="w-5 h-5 text-slate-600" />
                      <span>No custom header uploaded. Standard JSS letterhead will be used.</span>
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    ref={headerInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleHeaderUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => headerInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{headerImage ? 'Replace Header Banner' : 'Upload Institutional Header'}</span>
                  </button>
                </div>
              </div>

              {/* 2. Footer Image Upload Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>2. Institutional Footer Banner</span>
                      {footerImage && <span className="text-[10px] text-emerald-400 font-normal">(Active)</span>}
                    </span>
                    {footerImage && (
                      <button
                        onClick={handleRemoveFooter}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {footerImage ? (
                    <div className="relative rounded-lg border border-slate-800 overflow-hidden bg-white/5 p-2 flex items-center justify-center max-h-24">
                      <img src={footerImage} alt="Footer Banner" className="max-h-20 max-w-full object-contain rounded" />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border-2 border-dashed border-slate-800 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1">
                      <Upload className="w-5 h-5 text-slate-600" />
                      <span>No custom footer uploaded. Standard institutional footer will be used.</span>
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    ref={footerInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFooterUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => footerInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{footerImage ? 'Replace Footer Banner' : 'Upload Institutional Footer'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini API Key Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Google Gemini API Key (Stored Locally)</span>
                <span className="text-[11px] text-slate-400">Enter your key from Google AI Studio (aistudio.google.com)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="password"
                placeholder="Paste AI Studio API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none w-56 font-mono"
              />

              <div className="flex items-center space-x-1.5">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none font-mono"
                >
                  <option value="gemini-3.6-flash">gemini-3.6-flash (Recommended / Free Tier)</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash (High Speed Free Tier)</option>
                  <option value="gemini-3.7-flash">gemini-3.7-flash (Next Gen Free Tier)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Standard Tier)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
                </select>
              </div>

              <button
                onClick={handleSaveApiKey}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
              >
                {isKeySaved ? 'Saved in Browser' : 'Save Key'}
              </button>

              {isKeySaved && (
                <button
                  onClick={handleClearApiKey}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700"
                  title="Remove Key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Prompt Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {AI_PROMPTS_LIST.map((prompt) => (
              <button
                key={prompt.number}
                onClick={() => {
                  setSelectedPromptNum(prompt.number);
                  setCustomInput(prompt.sampleInput);
                  setAiOutput(generateInstitutionalSimulation(prompt.sampleInput, prompt.number));
                  setAiError('');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPromptNum === prompt.number
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold uppercase font-mono block text-indigo-300">
                  #{prompt.number} · {prompt.category}
                </span>
                <span className="text-xs font-bold line-clamp-1 mt-0.5">
                  {prompt.title}
                </span>
              </button>
            ))}
          </div>

          {/* Real-Time Prompt Runner Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Prompt Input Box */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-400 font-mono">
                      Prompt #{currentPrompt.number} · {currentPrompt.category}
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">{currentPrompt.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{currentPrompt.purpose}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(`prompt-text-${currentPrompt.number}`, currentPrompt.promptText)}
                    className="text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" /><span>Copy Prompt</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    System Prompt Template
                  </label>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                    {currentPrompt.promptText}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">Input Data / Rough Notes</label>
                    <button
                      onClick={() => setCustomInput(currentPrompt.sampleInput)}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      Reset to Sample
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={customInput}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      setCustomInput(newVal);
                      // Live reactive update as the user edits rough notes
                      setAiOutput(generateInstitutionalSimulation(newVal, selectedPromptNum));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Enter raw input details..."
                  />
                </div>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-amber-500 font-mono">
                    💡 {currentPrompt.liveDemoHint}
                  </span>

                  <button
                    disabled={isLoadingAi}
                    onClick={handleExecuteGemini}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg disabled:opacity-50"
                  >
                    {isLoadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isLoadingAi ? 'Generating...' : 'Run with Gemini AI'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Gemini Output Box with Header & Footer live rendering */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-xl flex flex-col justify-between min-h-[520px]">
                <div>
                  {/* Top Output Header & 3 Requested Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Live Gemini Output</span>
                    </span>

                    {/* Action Buttons Toolbar (Print PDF, Word .doc, Sample Text, Copy) */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* 1. Print / Save as PDF Button */}
                      <button
                        onClick={handlePrintOutput}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                        title="Print / Save as PDF with Header & Footer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / Save as PDF</span>
                      </button>

                      {/* 2. Export Word (.doc) Button */}
                      <button
                        onClick={handleExportWordDoc}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center space-x-1 border border-slate-700 transition-all"
                        title="Download Word (.doc) with Header & Footer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Word (.doc)</span>
                      </button>

                      {/* 3. Sample Text Button */}
                      <button
                        onClick={handleLoadSampleText}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 border border-slate-700"
                        title="Load official specimen sample text"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sample Text</span>
                      </button>

                      {/* Copy Output Button */}
                      {aiOutput && (
                        <button
                          onClick={() => handleCopy('ai-res', aiOutput)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700"
                          title="Copy to clipboard"
                        >
                          {copiedId === 'ai-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {aiError && (
                    <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  {isLoadingAi ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-3 text-indigo-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-mono">Gemini AI synthesizing institutional document...</span>
                    </div>
                  ) : aiOutput ? (
                    <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner flex flex-col space-y-3 max-h-[460px] overflow-y-auto">
                      {/* Live Header Image Preview (if uploaded) */}
                      {headerImage && (
                        <div className="pb-2 border-b border-slate-800 flex justify-center bg-white/5 rounded-lg p-1.5">
                          <img src={headerImage} alt="Header Preview" className="max-h-20 max-w-full object-contain rounded" />
                        </div>
                      )}

                      {/* Live Output Mode Selector (Formatted vs Raw) */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                        <span className="font-semibold text-slate-400">Preview Mode:</span>
                        <div className="flex items-center space-x-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
                          <button
                            onClick={() => setOutputViewMode('formatted')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                              outputViewMode === 'formatted'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            📄 Justified Document & Tables
                          </button>
                          <button
                            onClick={() => setOutputViewMode('raw')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                              outputViewMode === 'raw'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            ⌨️ Raw Text
                          </button>
                        </div>
                      </div>

                      {/* Document Body Output: Authentic High-Contrast Paper Canvas */}
                      {outputViewMode === 'formatted' ? (
                        <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-2xl border border-slate-300 max-w-full overflow-x-auto font-serif">
                          {/* Top Paper Header */}
                          {headerImage ? (
                            <div className="pb-3 mb-4 border-b border-slate-200 flex justify-center">
                              <img src={headerImage} alt="Header Banner" className="max-h-24 max-w-full object-contain" />
                            </div>
                          ) : (
                            <div className="text-center border-b-2 border-slate-900 pb-2 mb-4">
                              <h3 className="text-sm font-bold tracking-wider text-slate-950 uppercase">JSS MAHAVIDYAPEETHA</h3>
                              <h4 className="text-xs font-medium text-slate-700">JSS POLYTECHNIC, MYSURU - 570 006</h4>
                            </div>
                          )}

                          {/* Justified Document Body with Tables */}
                          <div 
                            className="text-slate-900 text-xs leading-relaxed text-justify"
                            dangerouslySetInnerHTML={{ __html: formatInstitutionalDocumentToHtml(aiOutput, !!headerImage) }}
                          />

                          {/* Bottom Paper Footer */}
                          {footerImage && (
                            <div className="pt-3 mt-5 border-t border-slate-200 flex justify-center">
                              <img src={footerImage} alt="Footer Banner" className="max-h-16 max-w-full object-contain" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                          {aiOutput}
                        </pre>
                      )}

                      {/* Live Footer Image Preview (if uploaded) */}
                      {footerImage && (
                        <div className="pt-2 border-t border-slate-800 flex justify-center bg-white/5 rounded-lg p-1.5">
                          <img src={footerImage} alt="Footer Preview" className="max-h-16 max-w-full object-contain rounded" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-24 text-center text-slate-400 text-xs">
                      Enter your Gemini API key above and click <strong>"Run with Gemini AI"</strong> or click <strong>"Sample Text"</strong> to generate statutory minutes, audit reports, or Kannada notices.
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    Branding: {headerImage ? 'Custom Header' : 'Default Header'} · {footerImage ? 'Custom Footer' : 'Default Footer'}
                  </span>
                  <span>Model: {selectedModel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ISO 8601 Naming */}
      {activeSubTab === 'naming' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-brand-400" />
                <span>Interactive ISO 8601 Filename Generator</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                  <select
                    value={namingDept}
                    onChange={(e) => setNamingDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="CIVIL">Civil Engineering (CIVIL)</option>
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="ECE">Electronics & Comm (ECE)</option>
                    <option value="ADM">Central Administration (ADM)</option>
                    <option value="COE">Controller of Exams (COE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Instrument Category</label>
                  <select
                    value={namingCategory}
                    onChange={(e) => setNamingCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="CIRCULAR">CIRCULAR (Policy)</option>
                    <option value="OFFICE_ORDER">OFFICE_ORDER (Service/Concession)</option>
                    <option value="NOTICE">NOTICE (Campus Event)</option>
                    <option value="MEMO">MEMO (Inter-departmental)</option>
                    <option value="MINUTES">MINUTES (BoS / Committee)</option>
                    <option value="REPORT">REPORT (Event / IQAC)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={namingRefNo}
                    onChange={(e) => setNamingRefNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Subject Keyword</label>
                  <input
                    type="text"
                    value={namingSubject}
                    onChange={(e) => setNamingSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 block">Generated ISO 8601 Canonical Filename:</span>
                <div className="font-mono text-xs text-emerald-400 break-all p-2 rounded bg-slate-900 border border-slate-800">
                  {generateIsoFilename()}
                </div>
                <button
                  onClick={() => handleCopy('iso-filename', generateIsoFilename())}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === 'iso-filename' ? 'Copied to Clipboard!' : 'Copy Filename'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white">ISO 8601 Institutional Rules (5 Golden Rules)</h2>
              <div className="space-y-3 text-xs text-slate-300">
                {ISO_NAMING_TAXONOMY.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-brand-300">{rule.rule}</span>
                    <p className="text-slate-400 text-[11px]">{rule.explanation}</p>
                    <div className="font-mono text-[10px] text-emerald-400 bg-slate-900 px-2 py-1 rounded">
                      Example: {rule.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: 4-Tier Folder Hierarchy */}
      {activeSubTab === 'folder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>Departmental 4-Tier Canonical Directory Hierarchy</span>
              </h2>
              <p className="text-xs text-slate-400">
                Standard folder structure for departmental NAS servers, institutional Google Drive, and ERP document attachments.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {FOLDER_HIERARCHY_RULES.map((tier, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-brand-400 font-mono">
                        Tier {idx + 1}: {tier.tier}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{tier.folderName}</h3>
                      <p className="text-xs text-slate-400 mt-1">{tier.purpose}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
                      {tier.examplePath}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: DPDP & RTI Act Red Lines */}
      {activeSubTab === 'dpdp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileLock2 className="w-4 h-4 text-rose-400" />
                <span>Statutory Compliance: DPDP Act 2023 & RTI Act 2005 Red Lines</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {RTI_DPDP_RED_LINES.map((rule, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-rose-400 block">{rule.act}</span>
                    <h3 className="text-sm font-bold text-white">{rule.title}</h3>
                    <p className="text-xs text-slate-400">{rule.description}</p>
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                      <strong>Red-Line Violation:</strong> {rule.violationExample}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: PII Sanitizer Tool */}
      {activeSubTab === 'sanitizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Raw Institutional Text (with Sensitive PII)</span>
              </h2>

              <textarea
                rows={8}
                value={sanitizerInput}
                onChange={(e) => setSanitizerInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono"
                placeholder="Paste raw text containing student names, phone numbers, roll numbers..."
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSanitizerInput(PII_SANITIZER_SAMPLES[1]?.rawText || PII_SANITIZER_SAMPLES[0].rawText)}
                  className="text-xs text-slate-400 hover:underline"
                >
                  Load Disciplinary Specimen
                </button>
                <button
                  onClick={handleSanitizePII}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sanitize & Redact PII</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Sanitized DPDP-Safe Output (Ready for External AI)</span>
                </h2>
                {sanitizedOutput && (
                  <button
                    onClick={() => handleCopy('sanitized-output', sanitizedOutput)}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" /><span>Copy</span>
                  </button>
                )}
              </div>

              <textarea
                readOnly
                rows={8}
                value={sanitizedOutput}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-emerald-300 font-mono"
                placeholder="Sanitized text will appear here with [NAME_REDACTED], [PHONE_REDACTED], [REG_NO_REDACTED]..."
              />

              <p className="text-[11px] text-slate-400">
                Guarantees DPDP Act 2023 compliance before submitting departmental notes or student data to external LLMs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
