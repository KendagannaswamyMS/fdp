import { DocumentTemplate } from '../types';

export const INSTITUTIONAL_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl-circular',
    title: 'Institutional Administrative Circular',
    category: 'Correspondence',
    authority: 'Principal / Head of Institution',
    description: 'Used for uniform institutional policy, academic regulations, code of conduct, and administrative directives across all departments.',
    fields: [
      { key: 'refNo', label: 'Reference Number', defaultValue: 'JSSPM/ADM/CIR/2026-27/045', type: 'text' },
      { key: 'date', label: 'Date', defaultValue: '2026-08-29', type: 'date' },
      { key: 'subject', label: 'Subject', defaultValue: 'Mandatory Minimum 75% Attendance Requirement for Continuous Internal Evaluation (CIE)', type: 'text' },
      { key: 'refResolution', label: 'Reference (Committee / Govt Notification)', defaultValue: 'Academic Committee Resolution dated 22-08-2026', type: 'text' },
      { key: 'policyText', label: 'Policy Directive', defaultValue: 'Pursuant to the decisions taken in the Academic Committee meeting, it is hereby instructed that a minimum of 75% attendance in each course is compulsory to be eligible for appearing in CIE tests across all departments.', type: 'textarea' },
      { key: 'actionDeadline', label: 'Action & Reporting Deadline', defaultValue: 'Faculty shall update attendance on the ERP portal every Saturday by 4:00 PM.', type: 'text' },
      { key: 'signatoryName', label: 'Signatory Name', defaultValue: 'Dr. Bhaktavatsala. K.S.', type: 'text' },
      { key: 'signatoryDesig', label: 'Signatory Designation', defaultValue: 'Principal', type: 'text' }
    ],
    templateGenerator: (d) => `JSS MAHAVIDYAPEETHA
JSS POLYTECHNIC, MYSURU - 570 006

Ref: ${d.refNo || ''}                                                  Date: ${d.date || ''}

CIRCULAR

Sub: ${d.subject || ''}
Ref: ${d.refResolution || ''}

${d.policyText || ''}

All Heads of Departments are requested to bring the contents of this circular to the notice of all faculty members and students of their respective departments for strict compliance.

${d.actionDeadline || ''}


                                                                Sd/-
                                                       (${d.signatoryName || ''})
                                                            ${d.signatoryDesig || ''}

Copy to:
1. All Heads of Departments (for strict compliance and student display)
2. Controller of Examinations
3. Administrative Officer & Establishment Section
4. Notice Boards / Institutional ERP Portal
5. Office Master File`
  },
  {
    id: 'tpl-bilingual-notice',
    title: 'Bilingual Campus Notice (English / ಕನ್ನಡ)',
    category: 'Correspondence',
    authority: 'Controller of Examinations / HoD',
    description: 'Mandatory dual-language format (English and formal administrative Kannada) for student notifications, exam dates, and campus events.',
    fields: [
      { key: 'refNo', label: 'Reference Number', defaultValue: 'JSSPM/COE/NOT/2026-27/084', type: 'text' },
      { key: 'date', label: 'Date', defaultValue: '2026-08-29', type: 'date' },
      { key: 'subjectEn', label: 'Subject (English)', defaultValue: 'Rescheduling of III Semester Practical Examination - CS Laboratory', type: 'text' },
      { key: 'bodyEn', label: 'Notice Body (English)', defaultValue: 'It is hereby notified for the information of all III Semester Diploma students that the Practical Examination originally scheduled on 14-09-2026 has been rescheduled to 18-09-2026 due to declared institutional holiday. Candidates shall report to the Computer Science Laboratory at 09:00 AM sharp with valid ID Card and Hall Ticket.', type: 'textarea' },
      { key: 'subjectKn', label: 'Subject (Kannada / ವಿಷಯ)', defaultValue: '೩ ನೇ ಸೆಮಿಸ್ಟರ್ ಪ್ರಾಯೋಗಿಕ ಪರೀಕ್ಷೆಯ ಮರು ನಿಗದಿ - ಸಿ.ಎಸ್. ಪ್ರಯೋಗಾಲಯ', type: 'text' },
      { key: 'bodyKn', label: 'Notice Body (Kannada / ವಿವರ)', defaultValue: 'ಎಲ್ಲಾ ೩ ನೇ ಸೆಮಿಸ್ಟರ್ ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಈ ಮೂಲಕ ತಿಳಿಸುವುದೇನೆಂದರೆ, ದಿನಾಂಕ ೧೪-೦೯-೨೦೨೬ ರಂದು ನಿಗದಿಯಾಗಿದ್ದ ಪ್ರಾಯೋಗಿಕ ಪರೀಕ್ಷೆಯನ್ನು ಸಂಸ್ಥೆಯ ರಜೆಯ ಕಾರಣದಿಂದ ದಿನಾಂಕ ೧೮-೦೯-೨೦೨೬ ಕ್ಕೆ ಮರು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ. ವಿದ್ಯಾರ್ಥಿಗಳು ನಿಗದಿತ ದಿನದಂದು ಬೆಳಿಗ್ಗೆ ೦೯:೦೦ ಗಂಟೆಗೆ ಸರಿಯಾಗಿ ಪ್ರವೇಶ ಪತ್ರ ಹಾಗೂ ಕಾಲೇಜು ಗುರುತಿನ ಚೀಟಿಯೊಂದಿಗೆ ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಪ್ರಯೋಗಾಲಯಕ್ಕೆ ಹಾಜರಾಗತಕ್ಕದ್ದು.', type: 'textarea' },
      { key: 'signatory', label: 'Signatory Designation', defaultValue: 'Controller of Examinations / ಪರೀಕ್ಷಾ ನಿಯಂತ್ರಕರು', type: 'text' }
    ],
    templateGenerator: (d) => `JSS MAHAVIDYAPEETHA
JSS POLYTECHNIC, MYSURU - 570 006

Ref: ${d.refNo || ''}                                                  Date: ${d.date || ''}

                                    NOTICE / ಸೂಚನೆ

[ENGLISH VERSION]
Sub: ${d.subjectEn || ''}

${d.bodyEn || ''}

-----------------------------------------------------------------------------------------

[ಕನ್ನಡ ಆವೃತ್ತಿ / KANNADA VERSION]
ವಿಷಯ: ${d.subjectKn || ''}

${d.bodyKn || ''}


                                                                Sd/-
                                                  ${d.signatory || 'Controller of Examinations'}

Copy to:
1. Principal - for kind information
2. All Notice Boards (Department, Examination, Main Entrance)
3. Website & Student ERP Portal`
  },
  {
    id: 'tpl-office-order',
    title: 'Office Order (Duty / Workload / Assignment)',
    category: 'Personnel & Establishment',
    authority: 'Principal / Appointing Authority',
    description: 'Creates rights, assigns coordination roles, alters teaching workload, sanctions duty leave, or forms statutory committees.',
    fields: [
      { key: 'refNo', label: 'Reference Number', defaultValue: 'JSSPM/EST/OO/2026-27/052', type: 'text' },
      { key: 'date', label: 'Date', defaultValue: '2026-08-29', type: 'date' },
      { key: 'subject', label: 'Subject', defaultValue: 'Appointment of Department NBA Coordinator and Workload Adjustment', type: 'text' },
      { key: 'appointee', label: 'Faculty Name & Designation', defaultValue: 'Prof. Ramesh N., Assistant Professor, Dept. of CSE', type: 'text' },
      { key: 'responsibilities', label: 'Assigned Duties', defaultValue: 'Preparation of Self-Assessment Report (SAR), Criterion-wise evidence compilation, and coordination with Central IQAC.', type: 'textarea' },
      { key: 'workloadConcession', label: 'Workload Adjustment / Duty Terms', defaultValue: 'A concession of one (1) teaching contact hour per week is hereby sanctioned with immediate effect until further orders.', type: 'text' },
      { key: 'signatoryName', label: 'Signatory Name', defaultValue: 'Dr. Bhaktavatsala. K.S.', type: 'text' },
      { key: 'signatoryDesig', label: 'Signatory Designation', defaultValue: 'Principal', type: 'text' }
    ],
    templateGenerator: (d) => `JSS MAHAVIDYAPEETHA
JSS POLYTECHNIC, MYSURU - 570 006

Ref: ${d.refNo || ''}                                                  Date: ${d.date || ''}

OFFICE ORDER

Sub: ${d.subject || ''}

${d.appointee || ''} is hereby appointed as the Department NBA Coordinator with immediate effect until further orders.

The responsibilities include:
${d.responsibilities || ''}

${d.workloadConcession || ''}

The faculty member shall report directly to the Head of the Department for all accreditation-related deliverables.


                                                                Sd/-
                                                       (${d.signatoryName || ''})
                                                            ${d.signatoryDesig || ''}

To:
${d.appointee || ''}

Copy to:
1. Head of the Department of Computer Science & Engineering
2. Coordinator, Internal Quality Assurance Cell (IQAC)
3. Establishment Section (for entry in Personal File & Service Book)
4. Office Master Copy`
  },
  {
    id: 'tpl-mom-bos',
    title: 'Statutory Board of Studies (BoS) Minutes & ATR',
    category: 'Governance & Meetings',
    authority: 'Member Secretary / Chairperson BoS',
    description: 'Standard third-person statutory meeting minutes with quorum recording, RESOLVED THAT clauses, named dissent, and an ATR table.',
    fields: [
      { key: 'dept', label: 'Department Name', defaultValue: 'Computer Science & Engineering', type: 'text' },
      { key: 'meetingNo', label: 'Meeting Number', defaultValue: 'XXIV', type: 'text' },
      { key: 'date', label: 'Meeting Date', defaultValue: '2026-09-15', type: 'date' },
      { key: 'quorumDetails', label: 'Quorum & Attendance', defaultValue: 'Seven (7) out of nine (9) members were present. The University Nominee and Industry Expert were present.', type: 'textarea' },
      { key: 'item1', label: 'Item 1: Previous Minutes Confirmation', defaultValue: 'The minutes of the previous meeting held on 12-03-2026 were confirmed without amendment.', type: 'textarea' },
      { key: 'item3Resolution', label: 'Item 3: Substantive Resolution (RESOLVED THAT)', defaultValue: 'RESOLVED THAT the Board approves the introduction of "Data Analytics" (4 units, 32 hours) as a professional elective in place of "Multimedia Systems" with effect from AY 2026-27, subject to revision of Unit IV to include a hands-on tool component and pre-circulation to members prior to Academic Council.', type: 'textarea' },
      { key: 'dissentRecord', label: 'Recorded Dissent (if any)', defaultValue: 'Prof. Venkatesh recorded his dissent on the ground that the discontinuation was proposed without prior consultation of the faculty concerned and without addressing the workload implication. The Chair directed that the administrative workload matter be referred separately to the Principal.', type: 'textarea' }
    ],
    templateGenerator: (d) => `JSS POLYTECHNIC, MYSURU
DEPARTMENT OF ${(d.dept || '').toUpperCase()}
MINUTES OF THE ${d.meetingNo || ''} MEETING OF THE BOARD OF STUDIES (BoS)

Date: ${d.date || ''}                                                  Time: 10:30 AM
Venue: Board Room, Admin Block

MEMBERS PRESENT:
1. Chairperson (HoD)
2. University Nominee
3. Industry Expert
4. Internal Faculty Members (4)

PROCEEDINGS:
The Chairperson welcomed the members. ${d.quorumDetails || ''}

Item 1: Confirmation of Previous Minutes
${d.item1 || ''}

Item 2: Action Taken Report (ATR)
The Action Taken Report on the decisions of the previous meeting was reviewed and recorded (Annexure A).

Item 3: Curriculum Revisions
The proposal for curriculum restructuring was taken up for deliberation. After consideration of suggestions, it was:

${d.item3Resolution || ''}

${d.dissentRecord || ''}

Item 4: Other Substantive Matters / Deferrals
The proposal regarding internship credits was deferred pending formal Board of Technical Examinations circular.

The meeting concluded at 1:00 PM with a vote of thanks to the Chair.


     Sd/-                                                              Sd/-
Member Secretary                                                  Chairperson, BoS`
  },
  {
    id: 'tpl-event-report',
    title: '9-Part Auditable Event Report (Accreditation Ready)',
    category: 'Reporting & Compliance',
    authority: 'Event Coordinator & HoD',
    description: 'Compliant with NBA Criteria 4 & 5 and NAAC criteria with objective-outcome mapping, metrics, and photo verification.',
    fields: [
      { key: 'reportNo', label: 'Report Ref Number', defaultValue: 'JSSPM/CSE/EVT/2026-27/012', type: 'text' },
      { key: 'eventTitle', label: 'Event Title', defaultValue: 'Two-Day Workshop on Full-Stack Web Development & REST APIs', type: 'text' },
      { key: 'dates', label: 'Dates of Event', defaultValue: '18-09-2026 & 19-09-2026', type: 'text' },
      { key: 'venue', label: 'Venue & Mode', defaultValue: 'CSE Advanced Computing Lab, Offline', type: 'text' },
      { key: 'resourcePerson', label: 'Resource Person & Credentials', defaultValue: 'Mr. Anand Kumar, Principal Architect, CloudTech Solutions, Bengaluru', type: 'text' },
      { key: 'participantStats', label: 'Participation Metrics', defaultValue: 'Target: 60 | Attended: 74 (68 IV & VI Sem Students, 6 Faculty) | Response Rate: 87.8%', type: 'text' },
      { key: 'budgetDetails', label: 'Budget (Sanctioned vs Utilised)', defaultValue: 'Sanctioned: Rs. 25,000/- | Actual Utilised: Rs. 23,450/- (Balance Rs. 1,550/- surrendered)', type: 'text' },
      { key: 'criterionMapping', label: 'Accreditation Mapping', defaultValue: 'NBA Criterion 4.2 & 5.3; PO1, PO3, PO5; PSO2', type: 'text' }
    ],
    templateGenerator: (d) => `JSS MAHAVIDYAPEETHA
JSS POLYTECHNIC, MYSURU
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING

EVENT REPORT
Ref No: ${d.reportNo || ''}

1. BASIC DETAILS:
   - Event Title: ${d.eventTitle || ''}
   - Dates & Duration: ${d.dates || ''} (16 Hours)
   - Venue & Mode: ${d.venue || ''}
   - Resource Person: ${d.resourcePerson || ''}

2. EXECUTIVE SUMMARY:
   A comprehensive hands-on workshop on ${d.eventTitle || ''} was successfully conducted. A total of ${d.participantStats || ''}. 
   All three benchmarked objectives were attained with a verified participant satisfaction index of 4.68/5.00.

3. FINANCIAL STATEMENT:
   - ${d.budgetDetails || ''}

4. ACCREDITATION & CURRICULUM MAPPING:
   - Mapped to: ${d.criterionMapping || ''}

5. CHECKLIST OF ENCLOSED AUDIT EVIDENCE:
   [X] Copy of approved sanction letter and brochure
   [X] Participant registration & attendance sheets with physical signatures
   [X] Four (4) Geo-tagged, time-stamped photographs (Inauguration, Audience Count, Hands-on Lab, Valedictory)
   [X] Tabulated feedback analysis report
   [X] Sample issued certificates (3 levels)


      Sd/-                             Sd/-                             Sd/-
Event Coordinator                      HoD                            Principal`
  },
  {
    id: 'tpl-faculty-appraisal',
    title: 'Faculty PBAS / CAS Self-Appraisal Summary',
    category: 'Portfolios & CAS',
    authority: 'Individual Faculty Member & HoD',
    description: 'Standard 7-section appraisal format tying teaching metrics, research, and institutional Office Orders directly to promotion credit.',
    fields: [
      { key: 'facultyName', label: 'Faculty Name & Designation', defaultValue: 'Dr. Ramesh N., Assistant Professor', type: 'text' },
      { key: 'dept', label: 'Department', defaultValue: 'Computer Science & Engineering', type: 'text' },
      { key: 'ay', label: 'Academic Year', defaultValue: '2025-26', type: 'text' },
      { key: 'teachingSummary', label: 'Teaching & Result Attainment', defaultValue: 'Data Structures (Pass 94.2%, Feedback 4.7/5); Cloud Computing (Pass 91.5%, Feedback 4.6/5).', type: 'textarea' },
      { key: 'adminOrders', label: 'Administrative Office Orders Cited', defaultValue: 'Dept NBA Coordinator vide Order JSSPM/EST/OO/2025-26/049; Member, Institutional Time Table Committee.', type: 'textarea' },
      { key: 'fdpDetails', label: 'FDPs & Professional Training', defaultValue: '5-Day AICTE ATAL FDP on Deep Learning; 12-week NPTEL Elite Certification in Cloud Infrastructure.', type: 'textarea' }
    ],
    templateGenerator: (d) => `JSS MAHAVIDYAPEETHA
JSS POLYTECHNIC, MYSURU
ANNUAL FACULTY PERFORMANCE APPRAISAL (PBAS / CAS DOSSIER)

Academic Year: ${d.ay || ''}
Faculty Name: ${d.facultyName || ''}
Department: ${d.dept || ''}

1. TEACHING-LEARNING & EVALUATION:
   ${d.teachingSummary || ''}

2. INSTITUTIONAL GOVERNANCE & RESPONSIBILITIES (OFFICE ORDERS):
   ${d.adminOrders || ''}

3. PROFESSIONAL DEVELOPMENT & FDPS ATTENDED:
   ${d.fdpDetails || ''}

4. EVIDENCE INDEX & VERIFICATION:
   All claims above are supported by physical sanction orders and certificates attached at Annexures A-D with verified page numbers.


                                                                Signature of Faculty: ______________________
                                                                Date: ______________________________________

Remarks & Verification by Head of the Department:
                                                                Signature of HoD: __________________________`
  }
];
