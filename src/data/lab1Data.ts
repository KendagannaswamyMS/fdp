import { Lab1SplitItem } from '../types';

export const LAB1_ORIGINAL_NOTE = `From the HoD's desk - pls circulate

Dear all, few things. The III sem practical exam which was on the 14th is now shifted to the 18th because of the holiday, students should report by 9 am to the CS lab, kindly inform your sections. Also from next month onwards we are strictly implementing the 75% attendance rule, anybody below that will not be allowed for the internals, this is applicable to all departments as decided in the last academic committee meeting, so please inform students and also faculty should update attendance in the portal weekly without fail. And Prof. Ramesh will be handling the NBA coordination work for our department from this month, he will report to me directly and will need one hour reduction in workload. Kindly cooperate. Also the AICTE data submission is pending, whoever has not given their qualification details pls give it to the office by Friday.`;

export const LAB1_SPLIT_ITEMS: Lab1SplitItem[] = [
  {
    id: 'split-1',
    title: 'Item 1: Practical Exam Date Change & Reporting Time',
    contentSnippet: 'The III sem practical exam which was on the 14th is now shifted to the 18th because of the holiday, students should report by 9 am to the CS lab...',
    correctInstrument: 'Notice',
    why: 'Time-bound, event-specific, meant for student/faculty display, expires once the practical exam concludes.',
    signatory: 'Controller of Examinations / HoD',
    authorityRule: 'Exam notices require examination section authorization and specific venue/date/reporting schedule.',
    modelRefNo: 'JSSPM/COE/NOT/2026-27/084',
    modelSubject: 'Rescheduling of III Semester Practical Examination - CS Laboratory',
    modelOpening: 'It is hereby notified for the information of all III Semester Diploma students that the Practical Examination originally scheduled on 14-09-2026 has been rescheduled to 18-09-2026 due to declared institutional holiday. Candidates shall report to the Computer Science Laboratory at 09:00 AM sharp with ID cards.'
  },
  {
    id: 'split-2',
    title: 'Item 2: 75% Mandatory Attendance Rule & Weekly Portal Updates',
    contentSnippet: 'Also from next month onwards we are strictly implementing the 75% attendance rule, anybody below that will not be allowed for the internals, this is applicable to all departments as decided in the last academic committee meeting...',
    correctInstrument: 'Circular',
    why: 'Uniform institutional policy, affects all departments, continuing applicability, traces directly to Academic Committee resolution.',
    signatory: 'Principal (NOT HoD - Institution-wide scope!)',
    authorityRule: 'Crucial Trap: Authority must match scope. An HoD cannot issue an institution-wide regulation across departments.',
    modelRefNo: 'JSSPM/ADM/CIR/2026-27/031',
    modelSubject: 'Mandatory Minimum 75% Attendance Requirement for Continuous Internal Evaluation (CIE)',
    modelOpening: 'Pursuant to the resolution adopted in the Academic Committee meeting held on 22-08-2026, it is hereby instructed that a minimum attendance of 75% shall be mandatory for students to be eligible for Continuous Internal Evaluation (CIE) across all diploma programmes with effect from 01-10-2026. All faculty members shall update student attendance on the institutional portal every Saturday by 4:00 PM.'
  },
  {
    id: 'split-3',
    title: 'Item 3: Prof. Ramesh as Department NBA Coordinator & Workload Reduction',
    contentSnippet: 'And Prof. Ramesh will be handling the NBA coordination work for our department from this month, he will report to me directly and will need one hour reduction in workload...',
    correctInstrument: 'Office Order',
    why: 'Creates an official institutional duty, alters assigned teaching workload, impacts service records and CAS/PBAS documentation.',
    signatory: 'Principal (Competent Authority for Service & Workload)',
    authorityRule: 'Crucial Trap: Anything touching workload, charge, official duty, or emoluments is an Order and requires Principal sanction.',
    modelRefNo: 'JSSPM/EST/OO/2026-27/049',
    modelSubject: 'Assignment of NBA Coordination Duties and Workload Adjustment - Prof. Ramesh, Dept. of CSE',
    modelOpening: 'Prof. Ramesh, Assistant Professor, Department of Computer Science & Engineering, is hereby appointed as the Department NBA Coordinator with immediate effect until further orders. Consequent upon this administrative assignment, a workload reduction of one (1) teaching contact hour per week is sanctioned. Copy to Service Book and Establishment Section.'
  },
  {
    id: 'split-4',
    title: 'Item 4: Faculty Qualification Details for AICTE Data Return',
    contentSnippet: 'Also the AICTE data submission is pending, whoever has not given their qualification details pls give it to the office by Friday.',
    correctInstrument: 'Office Memorandum',
    why: 'Specific internal administrative request addressed to a defined group of faculty, time-bound data collection, non-statutory.',
    signatory: 'Administrative Officer / HoD',
    authorityRule: 'Internal inter-office memorandum specifying the exact data template, submission custodian, and hard deadline date.',
    modelRefNo: 'JSSPM/ADM/OM/2026-27/072',
    modelSubject: 'Submission of Faculty Qualification Certificates for AICTE Approval Process 2026-27',
    modelOpening: 'The undersigned is directed to request all faculty members of the Department of Computer Science & Engineering who have not yet submitted their updated qualification and doctoral degree certificates to furnish attested copies to the Administrative Section on or before Friday, 04-09-2026, 4:00 PM for onward transmission to the AICTE portal.'
  }
];

export const LAB1_TRAPS = [
  {
    trap: 'Attendance rule signed by HoD',
    severity: 'High Statutory Defect',
    explanation: 'The attendance rule is institution-wide ("applicable to all departments") and traces to Academic Committee. An HoD lacks legal competence to bind other departments. It must be issued over the Principal\'s signature.'
  },
  {
    trap: 'Prof. Ramesh workload reduction issued as a Circular or informal note',
    severity: 'Service Record Defect',
    explanation: 'Altering teaching workload and assigning formal accreditation charge creates a legal/service status change. If not issued as an Office Order, the faculty member loses CAS/PBAS appraisal credit, and audit will question workload deficiency.'
  },
  {
    trap: '"Kindly cooperate", "without fail", "pls give by Friday"',
    severity: 'Drafting Defect',
    explanation: 'Administrative instruments require explicit calendar dates (e.g. "by 04-09-2026, 4:00 PM") and clear procedural consequences. Emotional appeals ("kindly cooperate") carry zero legal or compliance weight.'
  },
  {
    trap: 'Treating 1 ambiguous note as 1 output document',
    severity: 'Filing & Registry Defect',
    explanation: 'Four distinct matters belong to four different registers (Notice board file, Administrative circular file, Establishment/Service book file, and AICTE compliance file). One note ≠ one document.'
  }
];
