import { RunSheetBlock } from '../types';

export const RUN_SHEET_SCHEDULE: RunSheetBlock[] = [
  {
    id: 'block-0',
    clock: 'Module 0',
    duration: 1,
    title: 'Opening & Triage Statement',
    blockCode: 'OPENING',
    category: 'opening',
    description: 'Welcome, deliberate triage declaration, and 3-question diagnostic poll.',
    type: 'admin',
    facilitatorNotes: 'Say the triage aloud: "Hands move on 3 practical labs; others demo or in your take-home kit." Launch diagnostic poll.',
    participantAction: 'Complete diagnostic poll on mobile/laptop; review session governance ground rules.'
  },
  {
    id: 'block-1',
    clock: 'Module 1',
    duration: 1,
    title: 'B1 - Institutional Correspondence',
    blockCode: 'BLOCK 1',
    category: 'correspondence',
    description: 'Instrument Selection (Order, Circular, Notice, OM, Letter), Matrix & Lab 1 Note Splitter.',
    type: 'lab',
    facilitatorNotes: 'Teach 3 core principles: Decision rule, Matrix, 10 errors. Lab 1: Split ambiguous note into 4 instruments. Match authority to scope.',
    participantAction: 'Lab 1: Split HoD ambiguous note into 4 distinct headers + opening paragraphs. Match authority to scope.'
  },
  {
    id: 'block-2',
    clock: 'Module 2',
    duration: 1,
    title: 'B2 - Meeting Governance & Minute-Taking',
    blockCode: 'BLOCK 2',
    category: 'meetings',
    description: '6-stage Lifecycle, Agenda Architecture, Quorum, Resolution drafting & Lab 2 BoS.',
    type: 'lab',
    facilitatorNotes: 'Teach: Quorum validity, past-tense 3rd person, RESOLVED THAT, dissent protection, ATR table. Lab 2: BoS script & ATR drafting.',
    participantAction: 'Lab 2: Listen to Mock BoS audio/script, draft resolutions, record dissent, build ATR table, avoid hearsay/canteen traps.'
  },
  {
    id: 'block-break',
    clock: 'Intermission',
    duration: 1,
    title: 'Intermission & Professional Networking',
    blockCode: 'INTERMISSION',
    category: 'break',
    description: 'Faculty networking, discussion, and practical Q&A review.',
    type: 'break',
    facilitatorNotes: 'Conduct peer review and informal participant check-in.',
    participantAction: 'Review draft instruments with peer colleagues.'
  },
  {
    id: 'block-3',
    clock: 'Module 3',
    duration: 1,
    title: 'B3 - Academic Reporting & Compliance',
    blockCode: 'BLOCK 3',
    category: 'reporting',
    description: 'Accreditation Triple Rule (Claim → Metric → Locator), 9-Part Event Architecture & Lab 3.',
    type: 'lab',
    facilitatorNotes: 'Teach: Claim-Metric-Locator triple, 15 document gaps, financial ledger reconciliation, geo-tagging rules.',
    participantAction: 'Lab 3: Scan 15-defect flawed event specimen, detect audit traps, rewrite executive summary.'
  },
  {
    id: 'block-4',
    clock: 'Module 4',
    duration: 1,
    title: 'B4 - Planning, Portfolios & Course Files',
    blockCode: 'BLOCK 4',
    category: 'planning',
    description: 'Backwards Academic Calendar Engine, 18-Item Course File Matrix & CAS Promotion Dossier.',
    type: 'demo',
    facilitatorNotes: 'Demo: 18-item course file inspection, red-line audit failure items (6, 12, 16, 17), PBAS self-appraisal linking.',
    participantAction: 'Audit individual course files against 18-item matrix; compute instructional working days.'
  },
  {
    id: 'block-5',
    clock: 'Module 5',
    duration: 1,
    title: 'B5 - Digital Administration, Security & AI',
    blockCode: 'BLOCK 5',
    category: 'digital',
    description: 'ISO 8601 Naming Taxonomy, 4-Tier Department Hierarchy, DPDP / RTI Act Rules & Live Gemini AI Studio.',
    type: 'teach',
    facilitatorNotes: 'Teach: ISO naming, institutional retention, RTI Act 2005 & DPDP Act 2023 compliance, run live prompts 1–15 and 23–28.',
    participantAction: 'Generate standard ISO filename, run automated PII pre-sanitizer, test Gemini AI prompts.'
  },
  {
    id: 'block-close',
    clock: 'Module 6',
    duration: 1,
    title: 'Institutional Synthesis & Valedictory',
    blockCode: 'SYNTHESIS',
    category: 'close',
    description: 'Take-home Kit Handover, 5 Golden Rules Synthesis & Institutional Feedback.',
    type: 'admin',
    facilitatorNotes: 'Distribute companion drafting kit, summarize 5 golden rules, collect participant feedback.',
    participantAction: 'Export drafting templates and profile deliverables.'
  }
];

export const TRIAGE_MATRIX = [
  {
    verdict: 'TEACH LIVE - Hands Must Move',
    topics: 'Instrument Selection; MoM & Resolution Drafting; Accreditation Report Architecture; Data Hygiene & DPDP Red Lines',
    sessionTreatment: 'Full Interactive Teach + Live Hands-on Labs (Labs 1, 2, 3)',
    badge: 'High Priority (Labs)',
    color: 'emerald'
  },
  {
    verdict: 'DEMO ONLY - Walkthrough Artifacts',
    topics: 'Routing Hierarchy & Noting/DFA; External Compliance Letter; Academic Calendar Backwards Engine; Course File Check',
    sessionTreatment: 'Live walkthrough of real institutional specimens',
    badge: 'Medium Priority (Demos)',
    color: 'amber'
  },
  {
    verdict: 'HAND OVER - Reference Kit',
    topics: 'Retention Schedules; D.O. Letters; CAS/PBAS Promotion Dossier; NIRF Data; Confidential Inquiry Procedures',
    sessionTreatment: 'Self-paced reference library in Drafting Kit & Templates Hub',
    badge: 'Reference / Take-Home',
    color: 'sky'
  }
];

export const FACILITATOR_CHECKLISTS = {
  oneWeekBefore: [
    { id: '1', task: 'Confirm venue audio system and wireless lapel microphone', checked: true },
    { id: '2', task: 'Pre-load offline web suite on workshop projection console', checked: true },
    { id: '3', task: 'Verify local campus Wi-Fi network connectivity', checked: true },
    { id: '4', task: 'Review institutional case studies for CSE/Civil/Mech/ECE departments', checked: true }
  ],
  oneDayBefore: [
    { id: '5', task: 'Verify Google Gemini API Key in AI Prompt Studio', checked: true },
    { id: '6', task: 'Test Web Audio tone synthesizer for session transitions', checked: true },
    { id: '7', task: 'Check print stylesheet and Word export functionality', checked: true },
    { id: '8', task: 'Prepare diagnostic poll questions', checked: true }
  ],
  onTheDay: [
    { id: '9', task: 'Launch Workshop Web Application Cockpit on main display', checked: false },
    { id: '10', task: 'Announce ground rules and open the 3-question diagnostic poll', checked: false },
    { id: '11', task: 'Execute Lab 1 (Ambiguous Note Splitter)', checked: false },
    { id: '12', task: 'Execute Lab 2 (Board of Studies Minutes & ATR)', checked: false },
    { id: '13', task: 'Execute Lab 3 (Accreditation 15-Gap Report Audit)', checked: false },
    { id: '14', task: 'Demonstrate Faculty Profile Generator and A4 Export', checked: false }
  ]
};

export const DIAGNOSTIC_POLL = [
  {
    id: 'q1',
    question: "When a Department Coordinator is appointed with an official workload reduction, which statutory instrument must be issued?",
    options: [
      { text: "Circular over Principal's signature", correct: false },
      { text: "Office Order over Competent Authority signature (with concession terms)", correct: true },
      { text: "Campus Notice on Notice Board", correct: false },
      { text: "Office Memorandum (OM) between HoDs", correct: false }
    ],
    explanation: "An Office Order conveys internal administrative decisions affecting service conditions, duties, appointments, and workload concessions with financial/service rights."
  },
  {
    id: 'q2',
    question: "In statutory Board of Studies (BoS) or Committee minutes, how must formal decisions be recorded?",
    options: [
      { text: "Narrative summary describing the discussion in present tense", correct: false },
      { text: "RESOLVED THAT clause in third-person past tense with specific responsibility and target date", correct: true },
      { text: "Verbatim transcript of all corridor queries and member chatter", correct: false },
      { text: "Informal bullet points without recorded responsibility", correct: false }
    ],
    explanation: "CSMOP standards require formal resolutions to be drafted as \"RESOLVED THAT\" in third-person past tense, recording decisions only while rejecting hearsay."
  },
  {
    id: 'q3',
    question: "What is the mandatory \"Triple Rule\" for evidence verification in DTE, AICTE & NBA accreditation reports?",
    options: [
      { text: "Claim → Metric → Evidence Locator", correct: true },
      { text: "Adjective → Summary → Photographs", correct: false },
      { text: "Introduction → Overview → Conclusion", correct: false },
      { text: "Title → Coordinator → Signatures", correct: false }
    ],
    explanation: "Accreditation peer teams mandate the Triple Rule: Every qualitative Claim must have a quantifiable Metric and an exact physical/digital Evidence Locator."
  }
];

export const DIAGNOSTIC_POLL_QUESTIONS = DIAGNOSTIC_POLL;

