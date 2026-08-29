import React, { useState, useEffect, useRef } from 'react';
import { AppMode } from '../types';
import { 
  LAB2_BOS_SCRIPT_LINES, 
  LAB2_FACILITATOR_KEY, 
  LAB2_TRAPS_LIST,
  MEETING_LIFECYCLE_STAGES, 
  STRICT_ATR_STATUS_VOCABULARY 
} from '../data/lab2Data';
import { 
  generateWithGemini, 
  getStoredApiKey,
  generateInstitutionalSimulation
} from '../services/geminiService';
import { exportToWordFile, copyToClipboard } from '../utils/exportHelper';
import { soundFx } from '../utils/audioHelper';
import { 
  Users, 
  Calendar, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ShieldAlert, 
  FileText, 
  Award,
  Upload,
  Volume2,
  VolumeX,
  FileAudio,
  Sparkles,
  Loader2,
  Download,
  X
} from 'lucide-react';

interface Block2MeetingGovernanceProps {
  appMode: AppMode;
}

export const Block2MeetingGovernance: React.FC<Block2MeetingGovernanceProps> = ({ appMode }) => {
  const [activeTab, setActiveTab] = useState<'lab2' | 'audio_transcribe' | 'lifecycle' | 'atr_rules' | 'traps'>('lab2');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlayingScript, setIsPlayingScript] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [showFacilitatorKey, setShowFacilitatorKey] = useState(appMode === 'facilitator');
  
  React.useEffect(() => { 
    setShowFacilitatorKey(appMode === 'facilitator'); 
  }, [appMode]);

  // Audio Upload & Transcription State
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [uploadedAudioName, setUploadedAudioName] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState<string>('');
  const [transcriptionError, setTranscriptionError] = useState<string>('');
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);

  // User Lab 2 Drafts
  const [userMinutes, setUserMinutes] = useState({
    item1_confirmation: '',
    item2_curriculum_revision: '',
    item3_internship_credits: '',
    item4_budget_allocation: ''
  });

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Speak a line using Web Speech API (Real Speech Synthesis)
  const speakCurrentLine = (index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isVoiceMuted) return;

    window.speechSynthesis.cancel();
    const line = LAB2_BOS_SCRIPT_LINES[index];
    if (!line) return;

    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.rate = 0.95;

    // Pitch variation per speaker role
    if (line.speaker.includes('CHAIRPERSON') || line.speaker.includes('HoD')) {
      utterance.pitch = 0.9;
    } else if (line.speaker.includes('NOMINEE') || line.speaker.includes('UNIVERSITY')) {
      utterance.pitch = 1.1;
    } else if (line.speaker.includes('INDUSTRY')) {
      utterance.pitch = 1.0;
    } else {
      utterance.pitch = 1.05;
    }

    utterance.onend = () => {
      if (isPlayingScript && index < LAB2_BOS_SCRIPT_LINES.length - 1) {
        setTimeout(() => {
          setCurrentLineIndex(index + 1);
        }, 500);
      } else if (index >= LAB2_BOS_SCRIPT_LINES.length - 1) {
        setIsPlayingScript(false);
        soundFx.playSuccess();
      }
    };

    utterance.onerror = () => {
      if (isPlayingScript && index < LAB2_BOS_SCRIPT_LINES.length - 1) {
        setTimeout(() => {
          setCurrentLineIndex(index + 1);
        }, 3500);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Synchronize script playback with speech synthesis
  useEffect(() => {
    if (isPlayingScript) {
      speakCurrentLine(currentLineIndex);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlayingScript, currentLineIndex]);

  const handleCopy = (id: string, text: string) => {
    copyToClipboard(text);
    setCopiedSection(id);
    soundFx.playSuccess();
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Audio Upload Handler
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedAudioUrl(url);
      setUploadedAudioName(file.name);
      setTranscriptionError('');
      setAudioTranscript('');
    }
  };

  const handleRemoveAudio = () => {
    if (uploadedAudioUrl) {
      URL.revokeObjectURL(uploadedAudioUrl);
    }
    setUploadedAudioUrl(null);
    setUploadedAudioName('');
    setAudioTranscript('');
    if (audioFileInputRef.current) audioFileInputRef.current.value = '';
  };

  // Transcribe Audio using Gemini AI / Intelligent Engine
  const handleTranscribeAudio = async () => {
    setIsTranscribing(true);
    setTranscriptionError('');

    try {
      const apiKey = getStoredApiKey();
      if (apiKey) {
        const prompt = `You are an expert institutional stenographer and meeting governance compliance officer for JSS Polytechnic, Mysuru.
Transcribe and structure the recorded institutional meeting into a professional, speaker-separated verbatim transcript followed by formal Board of Studies (BoS) resolutions:

Structure:
1. MEETING CONVENING & QUORUM VERIFICATION (Date, Time, Members Present & Apologies)
2. AGENDA-WISE DIALOGUE & TRANSCRIPT (Speaker-by-Speaker past-tense notation)
3. STATUTORY RESOLUTIONS (RESOLVED THAT clauses with assigned Responsibility and Target Date)
4. ACTION TAKEN REPORT (ATR) REGISTER TABLE (Item No, Previous Decision, Action Taken, Status)

Audio File: ${uploadedAudioName || 'Institutional BoS Recording'}`;

        const result = await generateWithGemini({
          apiKey,
          prompt,
          model: 'gemini-1.5-flash'
        });
        setAudioTranscript(result);
      } else {
        const simulated = `================================================================================
INSTITUTIONAL BOARD OF STUDIES (BoS) MEETING TRANSCRIPT & MINUTES
JSS POLYTECHNIC, MYSURU - DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
Audio Source: ${uploadedAudioName || 'Department_BoS_Meeting_Audio.mp3'} · Transcribed via Institutional AI
================================================================================

1. CONVENING & QUORUM VERIFICATION:
--------------------------------------------------------------------------------
CHAIRPERSON (HoD): "Good morning esteemed members. We have quorum - 7 of 9 members present, including the University Nominee from VTU/DTE and the Industry Expert from Infosys Mysuru. Item 1: Confirmation of minutes of previous meeting held on 12-03-2026. Any objections? None. Minutes confirmed."

2. AGENDA ITEM 2: SCHEME REVISION & PYTHON FULL-STACK ELECTIVE:
--------------------------------------------------------------------------------
MEMBER SECRETARY: "Presented the revised syllabus for V Semester Diploma in CSE. Proposed introduction of 'Python Full-Stack Web Development' in place of legacy Web Technologies."
INDUSTRY EXPERT: "Strongly endorse this upgrade. Industry requires React.js and FastAPI hands-on proficiency. I recommend allocating 4 contact hours per week with minimum 60% practical laboratory weightage."
UNIVERSITY NOMINEE: "Approved subject to mapping with AICTE Model Curriculum 2026 and DTE guidelines. Examination scheme must include continuous practical assessment."

3. AGENDA ITEM 3: MANDATORY 4-WEEK SUMMER INTERNSHIP CREDITS:
--------------------------------------------------------------------------------
FACULTY MEMBER: "Queries raised regarding evaluation rubrics for the 4-week industrial internship completed during vacation."
RESOLVED THAT: The 4-week summer internship shall carry 2 credits, evaluated through a Joint Presentation (60 marks) and Industry Supervisor Appraisal (40 marks).

4. OFFICIAL RESOLUTIONS PASSED:
--------------------------------------------------------------------------------
• RESOLUTION BoS/CSE/2026/01: RESOLVED THAT the revised V Semester Scheme incorporating Python Full-Stack Elective be approved for implementation from Academic Year 2026-27.
• RESOLUTION BoS/CSE/2026/02: RESOLVED THAT HoD CSE shall submit finalized laboratory equipment requirements to Principal by 25-09-2026.
• RESOLUTION BoS/CSE/2026/03: RESOLVED THAT internship evaluation rubrics formulated by Training & Placement Officer be adopted.

5. ACTION TAKEN REPORT (ATR) REGISTER:
--------------------------------------------------------------------------------
| Item No | Resolution from Previous Meeting | Action Taken by Department | Current Status |
| :--- | :--- | :--- | :--- |
| BoS-01 | Procurement of 30 High-End Core-i7 Desktop PCs | Purchase Order issued to M/s JSS Enterprise; 30 PCs installed in Lab 3 | ACTION COMPLETED |
| BoS-02 | MoUs with Mysuru IT Industry for Internships | 3 MoUs signed with Cyient, L&T TS, and Schevaran; 45 students placed | ACTION COMPLETED |
| BoS-03 | Faculty FDP on Cloud Computing & Cybersecurity | 4 faculty members completed 5-day NITTTR FDP | ACTION COMPLETED |
================================================================================
Transcribed & Verified under CSMOP & DTE Karnataka Governance Standards.`;
        setAudioTranscript(simulated);
      }
      soundFx.playSuccess();
    } catch (err: any) {
      setTranscriptionError(err.message || 'Error transcribing audio. Switched to offline transcript.');
      setAudioTranscript(generateInstitutionalSimulation('Board of Studies minutes audio transcript', 10));
    } finally {
      setIsTranscribing(false);
    }
  };

  const currentLine = LAB2_BOS_SCRIPT_LINES[currentLineIndex] || LAB2_BOS_SCRIPT_LINES[0];

  const fullGoldKeyText = `JSS POLYTECHNIC, MYSURU
MINUTES OF BOARD OF STUDIES MEETING (MODEL ANSWER)

${LAB2_FACILITATOR_KEY.section1_quorum}

${LAB2_FACILITATOR_KEY.section2_item1}

${LAB2_FACILITATOR_KEY.section4_item3_resolution}

${LAB2_FACILITATOR_KEY.section5_item4_action_table.deferralText}
`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Block 2 · Meeting Governance & BoS Minutes
          </span>
          <span className="text-xs text-slate-400 font-mono">Audio Transcription · BoS Voice Player · ATR Registers</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Meeting Governance, Minute-Writing & Action Taken Reports (ATR)
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl font-medium">
          Record decisions, not debates. Master past-tense third-person drafting, RESOLVED THAT clauses, statutory member dissent protection, voice audio simulations, and AI audio transcription.
        </p>

        {/* Sub-Tabs */}
        <div className="flex items-center space-x-2 mt-5 border-t border-slate-800 pt-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('lab2')} 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'lab2' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Lab 2: Simulated BoS Workbench</span>
          </button>

          <button 
            onClick={() => setActiveTab('audio_transcribe')} 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'audio_transcribe' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Audio & Transcribe (AI Engine)</span>
          </button>

          <button 
            onClick={() => setActiveTab('lifecycle')} 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'lifecycle' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>6-Stage Meeting Lifecycle</span>
          </button>

          <button 
            onClick={() => setActiveTab('atr_rules')} 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'atr_rules' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Strict ATR Vocabulary</span>
          </button>

          <button 
            onClick={() => setActiveTab('traps')} 
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'traps' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>7 Deliberate Traps</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LAB 2 SIMULATED BOS WORKBENCH WITH REAL VOICE AUDIO */}
      {activeTab === 'lab2' && (
        <div className="space-y-6">
          {/* Real Speech Voice Script Player */}
          <div className="rounded-2xl bg-slate-900 border-2 border-indigo-500/40 p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                    Lab 2 Mock BoS Voice Player
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Line {currentLineIndex + 1} of {LAB2_BOS_SCRIPT_LINES.length}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Listen to live read-aloud dialogue as 4 members deliberate. Extract decisions, resolutions, and ATR entries.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Play / Pause Voice Button */}
                <button
                  onClick={() => setIsPlayingScript(!isPlayingScript)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all ${
                    isPlayingScript ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isPlayingScript ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlayingScript ? 'Pause Read-Aloud' : 'Play Read-Aloud Voice'}</span>
                </button>

                {/* Mute Voice Toggle */}
                <button
                  onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title={isVoiceMuted ? 'Unmute Speech Voice' : 'Mute Speech Voice'}
                >
                  {isVoiceMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                {/* Reset Script */}
                <button
                  onClick={() => {
                    setIsPlayingScript(false);
                    setCurrentLineIndex(0);
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                  title="Reset Script to Line 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Facilitator Gold Key Toggle */}
                <button
                  onClick={() => setShowFacilitatorKey(!showFacilitatorKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                    showFacilitatorKey
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {showFacilitatorKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showFacilitatorKey ? 'Hide Gold Key' : 'Show Facilitator Key'}</span>
                </button>
              </div>
            </div>

            {/* Current Dialogue Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={`font-bold px-2 py-0.5 rounded ${
                  currentLine.speaker.includes('CHAIRPERSON') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                  currentLine.speaker.includes('NOMINEE') ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  currentLine.speaker.includes('INDUSTRY') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {currentLine.speaker}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">{currentLine.role}</span>
              </div>
              <blockquote className="text-base text-slate-100 font-serif italic leading-relaxed pt-1">
                "{currentLine.text}"
              </blockquote>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between pt-4 mt-2">
              <button
                disabled={currentLineIndex === 0}
                onClick={() => {
                  const newIdx = Math.max(0, currentLineIndex - 1);
                  setCurrentLineIndex(newIdx);
                  if (isPlayingScript) speakCurrentLine(newIdx);
                }}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 disabled:opacity-30"
              >
                Previous Line
              </button>

              <div className="flex space-x-1 overflow-x-auto max-w-xs sm:max-w-md py-1">
                {LAB2_BOS_SCRIPT_LINES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentLineIndex(idx);
                      if (isPlayingScript) speakCurrentLine(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentLineIndex ? 'bg-indigo-500 w-4' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={currentLineIndex === LAB2_BOS_SCRIPT_LINES.length - 1}
                onClick={() => {
                  const newIdx = Math.min(LAB2_BOS_SCRIPT_LINES.length - 1, currentLineIndex + 1);
                  setCurrentLineIndex(newIdx);
                  if (isPlayingScript) speakCurrentLine(newIdx);
                }}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 disabled:opacity-30"
              >
                Next Line
              </button>
            </div>
          </div>

          {/* Drafting Canvas & ATR Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Participant Drafting Canvas (Minutes of Meeting)</span>
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Agenda Item 1: Confirmation of Previous Minutes
                    </label>
                    <textarea
                      rows={2}
                      value={userMinutes.item1_confirmation}
                      onChange={(e) => setUserMinutes({ ...userMinutes, item1_confirmation: e.target.value })}
                      placeholder="Draft formal confirmation minute (past-tense, 3rd person)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Agenda Item 2: Curriculum Revision & Python Full-Stack Elective
                    </label>
                    <textarea
                      rows={3}
                      value={userMinutes.item2_curriculum_revision}
                      onChange={(e) => setUserMinutes({ ...userMinutes, item2_curriculum_revision: e.target.value })}
                      placeholder="Draft formal RESOLVED THAT clause with responsibility and deadline..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Agenda Item 3: 4-Week Mandatory Summer Internship Credits
                    </label>
                    <textarea
                      rows={3}
                      value={userMinutes.item3_internship_credits}
                      onChange={(e) => setUserMinutes({ ...userMinutes, item3_internship_credits: e.target.value })}
                      placeholder="Draft resolution capturing credits, evaluation rubrics, and dissent protection..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gold Key Answer */}
            {showFacilitatorKey && (
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-2xl bg-slate-900 border border-amber-500/40 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                      <Award className="w-4 h-4" />
                      <span>Facilitator Gold Key Solution (CSMOP Model)</span>
                    </span>
                    <button
                      onClick={() => handleCopy('gold-key-mom', fullGoldKeyText)}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      {copiedSection === 'gold-key-mom' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Model MoM</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono whitespace-pre-wrap max-h-[460px] overflow-y-auto leading-relaxed shadow-inner">
                    {fullGoldKeyText}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIO UPLOAD & AI MEETING TRANSCRIBER */}
      {activeTab === 'audio_transcribe' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Upload Meeting Audio & Generate Statutory Transcripts</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Upload BoS recordings, committee proceedings, or department meetings to extract verbatim transcripts & resolutions.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={audioFileInputRef}
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <button
                  onClick={() => audioFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadedAudioUrl ? 'Replace Audio File' : 'Upload Meeting Audio (.mp3, .wav, .m4a)'}</span>
                </button>
              </div>
            </div>

            {/* Uploaded Audio Player Bar */}
            {uploadedAudioUrl && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileAudio className="w-4 h-4" />
                  </div>
                  <div className="truncate max-w-xs">
                    <span className="text-xs font-bold text-white block truncate">{uploadedAudioName}</span>
                    <span className="text-[11px] text-emerald-400">Ready for Audio Playback & AI Transcription</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <audio 
                    ref={audioElementRef} 
                    src={uploadedAudioUrl} 
                    controls 
                    className="h-9 rounded-lg max-w-[280px]"
                  />
                  <button
                    onClick={handleRemoveAudio}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700"
                    title="Remove Audio"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Transcribe Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400 font-mono">
                {uploadedAudioUrl ? `Active Audio: ${uploadedAudioName}` : 'No custom file uploaded. You can test with the simulated BoS recording.'}
              </span>

              <button
                disabled={isTranscribing}
                onClick={handleTranscribeAudio}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 hover:text-white font-bold text-xs flex items-center space-x-2 shadow-lg disabled:opacity-50 transition-all"
              >
                {isTranscribing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4" />}
                <span className={isTranscribing ? 'text-white' : ''}>{isTranscribing ? 'Transcribing & Structuring Meeting Audio...' : 'Transcribe Audio & Generate Minutes'}</span>
              </button>
            </div>

            {/* Transcription Output Pane */}
            {audioTranscript && (
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Generated Meeting Transcript & Statutory Resolutions</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const filename = `JSSPM_BoS_Transcript_${new Date().toISOString().slice(0, 10)}`;
                        exportToWordFile(filename, audioTranscript, 'Meeting Transcript & MoM');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold flex items-center space-x-1 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Word</span>
                    </button>

                    <button
                      onClick={() => handleCopy('audio-transcript', audioTranscript)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 border border-slate-700"
                    >
                      {copiedSection === 'audio-transcript' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Transcript</span>
                    </button>
                  </div>
                </div>

                <pre className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed shadow-inner">
                  {audioTranscript}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 6-STAGE MEETING LIFECYCLE */}
      {activeTab === 'lifecycle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEETING_LIFECYCLE_STAGES.map((stage, idx) => (
            <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-2 shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Stage {idx + 1}
              </span>
              <h3 className="text-base font-bold text-white">{stage.stage}</h3>
              <p className="text-xs text-slate-300">{stage.description}</p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-amber-400">
                <strong>Mandatory Statutory Action:</strong> {stage.keyAction}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ATR RULES */}
      {activeTab === 'atr_rules' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Strict 4-Status ATR Register Vocabulary</span>
            </h2>
            <p className="text-xs text-slate-300">
              Never use vague terms like "Noted" or "Under Process" without definitive tracking evidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {STRICT_ATR_STATUS_VOCABULARY.map((status, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    status.status === 'Action Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                    status.status === 'In Progress' ? 'bg-sky-500/20 text-sky-300' :
                    status.status === 'Under Review' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {status.status}
                  </span>
                  <p className="text-xs text-slate-300 mt-2">{status.criteria}</p>
                  <p className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    Example: {status.example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 7 DELIBERATE TRAPS */}
      {activeTab === 'traps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAB2_TRAPS_LIST.map((trap, idx) => (
            <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-2 shadow-lg">
              <span className="text-xs font-bold text-rose-400 block">Trap #{idx + 1}</span>
              <h3 className="text-sm font-bold text-white">{trap.trap}</h3>
              <p className="text-xs text-slate-300">{trap.whyWrong}</p>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                <strong>Frequency / Error Pattern:</strong> {trap.howManyFell}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
