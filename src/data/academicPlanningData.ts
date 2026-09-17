import { CourseFileItem } from '../types';

export const COURSE_FILE_ITEMS: CourseFileItem[] = [
  {
    id: 1,
    itemNo: 1,
    title: 'Cover Page',
    description: 'Course title and code, programme and semester, academic year, faculty name and designation, and department, in the institutional format.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Cover page in the institutional format'
  },
  {
    id: 2,
    itemNo: 2,
    title: 'Contents Index with Page Numbers',
    description: 'Index of every section. Insert page numbers only after the file is finally assembled; until then write “To be generated after final assembly”.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Contents index generated after final pagination'
  },
  {
    id: 3,
    itemNo: 3,
    title: 'Vision & Mission Statements',
    description: 'Approved institute and department vision and mission statements, reproduced exactly as approved.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Approved copy of the statements'
  },
  {
    id: 4,
    itemNo: 4,
    title: 'Programme Outcomes (POs) & PSOs',
    description: 'The Programme Outcomes and Programme Specific Outcomes approved for your programme, preserved word for word.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Approved PO/PSO document'
  },
  {
    id: 5,
    itemNo: 5,
    title: 'Course Outcomes (COs) with Bloom’s Levels',
    description: 'The approved Course Outcomes, each with its Bloom’s taxonomy level, numbered consistently across the whole file.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Approved syllabus or CO statement'
  },
  {
    id: 6,
    itemNo: 6,
    title: 'CO–PO / PSO Mapping WITH JUSTIFICATION',
    description: 'Mapping of each CO to POs/PSOs using the institution’s own mapping scale and definitions, with an academic justification and the supporting learning activity or assessment for every mapped cell.',
    isCriticalAuditFailure: true,
    auditFailureReason: 'Common gap: levels filled in without a justification, justifications as generic as “strongly related”, or no stated scale and approval. Don’t assume a numeric scale; use the approved one.',
    mandatoryAnnexures: 'Mapping table with scale definitions, justification and approval record'
  },
  {
    id: 7,
    itemNo: 7,
    title: 'Approved Syllabus Copy',
    description: 'The approved syllabus for the stated regulation/scheme version, with credits and contact hours.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Syllabus copy matching the stated regulation version'
  },
  {
    id: 8,
    itemNo: 8,
    title: 'Session-Wise Lesson Plan',
    description: 'Planned sessions with topic, mapped CO, teaching method and reference, with planned hours that match the syllabus.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Lesson plan approved as per institutional practice'
  },
  {
    id: 9,
    itemNo: 9,
    title: 'Actual Delivery Log & Deviation Record',
    description: 'Dated record of classes actually conducted, kept separate from the lesson plan, with each deviation and its recovery action.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Work diary or ERP delivery report'
  },
  {
    id: 10,
    itemNo: 10,
    title: 'Teaching–Learning Material (TLM)',
    description: 'Notes, slides, worksheets, video links and open resources used, referenced to the sessions they support.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'TLM list or sample copies'
  },
  {
    id: 11,
    itemNo: 11,
    title: 'Assignment & Tutorial Sheets with Rubrics',
    description: 'Assignment and tutorial sheets with their evaluation rubrics, tagged to the COs they assess.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Question sheets and rubrics'
  },
  {
    id: 12,
    itemNo: 12,
    title: 'CIE Papers WITH CO & BLOOM TAGGING',
    description: 'Every CIE paper with a CO and Bloom’s level on each question or sub-question, marks that reconcile with the declared total, and a clear rule for optional questions.',
    isCriticalAuditFailure: true,
    auditFailureReason: 'Common gap: questions without CO tags, Bloom’s levels judged from the opening verb rather than the task, totals that don’t reconcile, or COs no question assesses. Untagged papers can’t support a CO attainment calculation.',
    mandatoryAnnexures: 'Tagged question papers and scheme of evaluation'
  },
  {
    id: 13,
    itemNo: 13,
    title: 'Sample Evaluated Scripts (High, Middle, Low)',
    description: 'Evaluated scripts representing high, middle and low performance, chosen by the institution’s selection method and linked to the assessment they belong to.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Sample scripts (anonymised in summaries) and the selection method'
  },
  {
    id: 14,
    itemNo: 14,
    title: 'Consolidated CIE & SEE Marks Ledger',
    description: 'Verified marks for all CIE components and the Semester-End Examination, reconciling with the individual assessments.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Verified marks ledger'
  },
  {
    id: 15,
    itemNo: 15,
    title: 'Attendance Ledger with Consolidations',
    description: 'Attendance register with consolidations at the points your institution prescribes, stating the sessions conducted and the denominator used.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Attendance report as per institutional format'
  },
  {
    id: 16,
    itemNo: 16,
    title: 'Direct & Indirect CO Attainment Calculation',
    description: 'CO attainment calculated with the approved method: question-level data, stated thresholds, targets, component weights, absence and rounding rules, and CO-aligned survey items for indirect assessment.',
    isCriticalAuditFailure: true,
    auditFailureReason: 'Common gap: attainment inferred from pass percentage, or thresholds and weights that aren’t written down. Use only the approved method; if data are missing, list the missing inputs instead of a number.',
    mandatoryAnnexures: 'Calculation sheet showing formula, numerator and denominator'
  },
  {
    id: 17,
    itemNo: 17,
    title: 'CO–PO Gap Analysis & Corrective Action',
    description: 'Verified attainment compared with approved targets, with evidence-supported causes (or clearly labelled hypotheses), corrective actions, owners, deadlines and follow-up measures.',
    isCriticalAuditFailure: true,
    auditFailureReason: 'Common gap: shortfalls with no action, causes stated as fact without evidence, or improvement claimed before follow-up data exist. Don’t derive programme-level PO attainment from one course.',
    mandatoryAnnexures: 'Gap analysis and action record as per institutional practice'
  },
  {
    id: 18,
    itemNo: 18,
    title: 'Course-End Feedback Survey & Analysis',
    description: 'Survey instrument and analysis stating the response count and the number of eligible students. General satisfaction ratings are not CO attainment unless the approved method says so.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Questionnaire and analysis with response count'
  }
];

export const CALENDAR_BACKWARDS_STEPS = [
  { step: 1, name: 'Fix Immovables First', detail: 'Lock Board of Technical Examinations (BTE) examination windows, declared government holidays, and university term notifications.' },
  { step: 2, name: 'Count Working Days', detail: 'Compute raw available instructional days per semester against the statutory requirement (minimum 80–90 instructional days).' },
  { step: 3, name: 'Position CIE Tests', detail: 'Space 3 Continuous Internal Evaluation tests evenly across the semester. Rule: No test in the week immediately preceding board exams; results published before next test.' },
  { step: 4, name: 'Inject 5–7 Day Unforeseen Buffer', detail: 'Reserve 5 to 7 working days for unexpected closures (weather events, elections, local bandhs, inspections). Calendars lacking buffer fail by week 6.' },
  { step: 5, name: 'Slot Institutional Events', detail: 'Technical symposiums, sports days, cultural fests occupy what remains of buffer time, never displacing core instructional days.' },
  { step: 6, name: 'Version Control & Circular Release', detail: 'Publish as official Circular with a version number (v01, v02) and amendment log. Never replace silently.' }
];

export const PBAS_DOSSIER_SECTIONS = [
  { section: 'Section A', title: 'Personal & Appointment Particulars', focus: 'Official designation, initial appointment order, scale of pay, promotion history.' },
  { section: 'Section B', title: 'Teaching & Pedagogical Innovations', focus: 'Courses handled, pass percentage, average student feedback scores, digital TLM created.' },
  { section: 'Section C', title: 'Research & Intellectual Output', focus: 'UGC-CARE / Scopus indexed journal papers, funded research grants, patents granted/published, consultancies.' },
  { section: 'Section D', title: 'Professional Development & Certifications', focus: 'FDPs/NPTEL certifications attended and delivered as resource person, professional memberships.' },
  { section: 'Section E', title: 'Institutional Governance & Contribution', focus: 'NBA/NAAC coordination, HoD/Convener roles, committee duties (EACH PROVED BY BLOCK 1 OFFICE ORDERS!).' },
  { section: 'Section F', title: 'Extension & Industry Outreach', focus: 'NSS/NCC, community development, student club mentorship, industry MoUs facilitated.' },
  { section: 'Section G', title: 'Self-Appraisal Score & Annexure Index', focus: 'Consolidated claimed API/CAS score with cross-referenced page numbers for every single annexure.' }
];
