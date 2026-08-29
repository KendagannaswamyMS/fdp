import { CourseFileItem } from '../types';

export const COURSE_FILE_ITEMS: CourseFileItem[] = [
  {
    id: 1,
    itemNo: 1,
    title: 'Cover Page',
    description: 'Course Code, Course Title, Semester, Branch, Academic Year, Faculty Name, Designation, and Department.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Institutional standard cover template'
  },
  {
    id: 2,
    itemNo: 2,
    title: 'Contents Index with Page Numbers',
    description: 'Neatly organized table of contents referencing exact page numbers for every section in the binder/digital dossier.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Table of Contents'
  },
  {
    id: 3,
    itemNo: 3,
    title: 'Vision & Mission Statements',
    description: 'Approved Institutional Vision/Mission and Department Vision/Mission statements.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Approved institutional copy'
  },
  {
    id: 4,
    itemNo: 4,
    title: 'Programme Outcomes (POs) & PSOs',
    description: 'NBA 12/10 Graduate Attributes (POs) and Program Specific Outcomes (PSOs) defined by the department.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'DTE / NBA curriculum document'
  },
  {
    id: 5,
    itemNo: 5,
    title: 'Course Outcomes (COs) with Bloom Taxonomy Levels',
    description: '5–6 measurable Course Outcomes using Bloom\'s action verbs (Understand, Apply, Analyze, Design).',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Board-approved syllabus extract'
  },
  {
    id: 6,
    itemNo: 6,
    title: 'CO–PO / PSO Mapping Matrix WITH JUSTIFICATION',
    description: 'Matrix showing correlation levels (1: Slight, 2: Moderate, 3: Substantial) along with a written justification sentence for each cell marked >0.',
    isCriticalAuditFailure: true,
    auditFailureReason: 'CRITICAL AUDIT TRAP: Faculty routinely fill 1, 2, 3 in the grid but omit the justification column. Assessors reject unjustified mapping numbers!',
    mandatoryAnnexures: 'Justification Table with specific syllabus topic citations'
  },
  {
    id: 7,
    itemNo: 7,
    title: 'Approved Syllabus Copy',
    description: 'Official Board of Technical Examinations (BTE) / University approved curriculum document with credit breakdown.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'BTE Scheme & Syllabus'
  },
  {
    id: 8,
    itemNo: 8,
    title: 'Session-Wise Lecture / Lesson Plan',
    description: 'Planned delivery schedule detailing session number, specific topic, mapped CO, teaching aid/pedagogy, and reference text.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Lesson plan endorsed by HoD before term commencement'
  },
  {
    id: 9,
    itemNo: 9,
    title: 'Actual Delivery Log & Deviation Record',
    description: 'Date-wise record of actual classes conducted against the planned dates, with documented reasons for deviations or compensatory classes.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Teacher\'s work diary / ERP delivery report'
  },
  {
    id: 10,
    itemNo: 10,
    title: 'Teaching–Learning Material (TLM)',
    description: 'Curated lecture notes, presentation slides, active learning worksheets, video lecture links, and recommended open educational resources.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Sample PPTs, handouts, LMS course page printout'
  },
  {
    id: 11,
    itemNo: 11,
    title: 'Assignment & Tutorial Sheets with Rubrics',
    description: 'Graded assignments mapped to higher Bloom levels with explicit evaluation rubrics shared with students in advance.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Question sheets, answer keys, scoring rubrics'
  },
  {
    id: 12,
    itemNo: 12,
    title: 'CIE Question Papers WITH CO & BLOOM TAGGING',
    description: 'All Continuous Internal Evaluation (CIE) test question papers featuring explicit CO and Bloom level tags on every single sub-question, accompanied by Scheme of Evaluation.',
    isCriticalAuditFailure: true,
    auditFailureReason: 'CRITICAL AUDIT TRAP: Tests missing CO tags on individual questions or lacking an approved Scheme of Valuation cannot be used for direct CO attainment calculation!',
    mandatoryAnnexures: 'Approved question papers, Bloom matrix, Scheme of Evaluation with step marks'
  },
  {
    id: 13,
    itemNo: 13,
    title: 'Sample Evaluated Answer Scripts (Best, Average, Weak)',
    description: 'Three representative evaluated answer scripts from each CIE test (1 highest scorer, 1 average scorer, 1 threshold/weak student) with rubric markings.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Original scripts with student signatures and moderation marks'
  },
  {
    id: 14,
    itemNo: 14,
    title: 'Consolidated CIE & SEE Marks Ledger',
    description: 'Tabulated marks of all students for all internal tests, assignments, practical continuous evaluation, and final Semester End Examination (SEE) results.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'ERP verified mark sheets'
  },
  {
    id: 15,
    itemNo: 15,
    title: 'Attendance Ledger with Consolidations',
    description: 'Class-wise student attendance register with periodic consolidations (at 30, 60, 90 working days) and student shortage notices.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'ERP attendance report signed by Faculty and HoD'
  },
  {
    id: 16,
    itemNo: 16,
    title: 'Direct & Indirect CO Attainment Calculation',
    description: 'Mathematical calculation of CO attainment against pre-set target levels (e.g. 60% students scoring ≥60% marks in internal and external exams), weighted 80% Direct + 20% Indirect (Course End Survey).',
    isCriticalAuditFailure: true,
    auditFailureReason: 'CRITICAL AUDIT TRAP: Arbitrary attainment calculations without defined threshold benchmarks or formula breakdowns are immediately disqualified by NBA evaluation teams.',
    mandatoryAnnexures: 'Spreadsheet formula sheet, attainment summary table'
  },
  {
    id: 17,
    itemNo: 17,
    title: 'CO–PO Gap Analysis & Corrective Action Plan',
    description: 'Identification of Course Outcomes that failed to attain targets, root cause analysis (curriculum gap / pedagogical bottleneck), and specific corrective actions scheduled for the next academic cycle.',
    isCriticalAuditFailure: true,
    auditFailureReason: 'CRITICAL AUDIT TRAP: If attainment falls short and no gap analysis or corrective action is documented, the continuous improvement cycle (NBA Criterion 3 & 7) is marked non-compliant.',
    mandatoryAnnexures: 'Action Taken Report endorsed by Department Academic Committee (DAC)'
  },
  {
    id: 18,
    itemNo: 18,
    title: 'Course-End Feedback Survey & Analysis',
    description: 'Anonymous student feedback on course outcome delivery, analyzed statistically with response percentage and mean rating.',
    isCriticalAuditFailure: false,
    mandatoryAnnexures: 'Feedback questionnaire, Google Forms / ERP analysis charts'
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
