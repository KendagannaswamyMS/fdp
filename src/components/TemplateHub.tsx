import React, { useState } from 'react';
import { INSTITUTIONAL_TEMPLATES } from '../data/templatesData';
import {
  exportToWordFile,
  copyToClipboard,
  printInstitutionalDocument,
  getStoredBanners
} from '../utils/exportHelper';
import { soundFx } from '../utils/audioHelper';
import { generateWithGemini, getStoredApiKey } from '../services/geminiService';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Send,
  AlertCircle
} from 'lucide-react';

export const TemplateHub: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(INSTITUTIONAL_TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const [templateInputs, setTemplateInputs] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    INSTITUTIONAL_TEMPLATES.forEach(t => {
      init[t.id] = {};
      t.fields.forEach(f => {
        init[t.id][f.key] = f.defaultValue;
      });
    });
    return init;
  });

  const activeTemplate = INSTITUTIONAL_TEMPLATES.find(t => t.id === selectedTemplateId) || INSTITUTIONAL_TEMPLATES[0];
  const activeFieldValues = templateInputs[activeTemplate.id] || {};
  const [customDraft, setCustomDraft] = useState<string | null>(null);

  const generatedText = customDraft !== null ? customDraft : activeTemplate.templateGenerator(activeFieldValues);

  const handleInputChange = (key: string, value: string) => {
    setCustomDraft(null);
    setTemplateInputs(prev => ({
      ...prev,
      [activeTemplate.id]: {
        ...prev[activeTemplate.id],
        [key]: value
      }
    }));
  };

  const handleCopy = () => {
    copyToClipboard(generatedText);
    setCopied(true);
    soundFx.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = () => {
    // Same institutional letterhead banners as the AI Prompt Studio.
    const { headerImage, footerImage } = getStoredBanners();
    exportToWordFile(
      `${activeTemplate.title.replace(/\s+/g, '_')}.doc`,
      generatedText,
      activeTemplate.title,
      headerImage,
      footerImage
    );
    soundFx.playSuccess();
  };

  const handlePrint = () => {
    const { headerImage, footerImage } = getStoredBanners();
    printInstitutionalDocument(generatedText, activeTemplate.title, headerImage, footerImage);
    soundFx.playSuccess();
  };

  const handleGeminiEnhance = async () => {
    setIsEnhancing(true);
    setEnhanceError(null);

    try {
      const apiKey = getStoredApiKey();
      if (!apiKey) {
        throw new Error('Please set your Gemini API Key in the "AI Prompt Studio" tab first.');
      }

      const prompt = `Review and enhance this institutional draft for JSS Polytechnic, Mysuru. Ensure strict compliance with CSMOP, DTE Karnataka standards, formal third-person syntax, and zero grammatical/statutory ambiguities:

Document Type: ${activeTemplate.title}
Authority: ${activeTemplate.authority}

Draft Text:
${generatedText}`;

      const enhanced = await generateWithGemini({
        apiKey,
        prompt,
        // Never fall back to the offline document generator here: this action
        // refines an existing draft, and a synthesised circular would duplicate
        // the draft inside itself.
        allowOfflineFallback: false
      });

      setCustomDraft(enhanced);
      soundFx.playSuccess();
    } catch (err: any) {
      setEnhanceError(
        `${err.message || 'Failed to enhance template with Gemini AI.'} Your draft is unchanged.`
      );
      soundFx.playLabAlert();
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Take-Home Companion Drafting Kit
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Institutional Drafting Kit & Statutory Templates
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Standardized Central Secretariat (CSMOP) formats adapted for technical polytechnics & engineering colleges. Fill placeholders live, enhance with Gemini AI, and export directly to Word (.doc) or clean print format.
        </p>

        <div className="flex items-center space-x-2 mt-5 border-t border-slate-800/80 pt-4 overflow-x-auto">
          {INSTITUTIONAL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTemplateId(t.id);
                setCustomDraft(null);
                setEnhanceError(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTemplateId === t.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                {activeTemplate.category} · {activeTemplate.authority}
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">{activeTemplate.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{activeTemplate.description}</p>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 text-xs">
              {activeTemplate.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-slate-300 font-medium mb-1">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={activeFieldValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-1 focus:ring-brand-500 focus:outline-none font-sans"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={activeFieldValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-1 focus:ring-brand-500 focus:outline-none font-sans"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCustomDraft(null)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <button
                disabled={isEnhancing}
                onClick={handleGeminiEnhance}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md disabled:opacity-50"
              >
                {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isEnhancing ? 'Enhancing...' : 'Enhance with Gemini AI'}</span>
              </button>
            </div>

            {enhanceError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{enhanceError}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between min-h-[600px]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <FileCode className="w-4 h-4 text-brand-400" />
                  <span>Live Formatted Preview</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={handleDownloadWord}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.doc)</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <pre className="mt-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto shadow-inner max-h-[520px]">
                {generatedText}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Standard CSMOP & DTE Karnataka Institutional Format</span>
              <span>Audit Ready · ISO 8601 Dates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
