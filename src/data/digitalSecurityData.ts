export const ISO_NAMING_RULES = {
  pattern: 'YYYY-MM-DD_DEPT_DOCTYPE_SUBJECT_vNN_INITIALS.ext',
  example1: '2026-08-14_CSE_MOM_BoS-Meeting_v03_KS.pdf',
  example2: '2026-08-14_ADM_CIR_Attendance-Rule_v01_AO.docx',
  rules: [
    { rule: 'ISO Date Format (YYYY-MM-DD)', why: 'Ensures documents sort chronologically by default in any operating system or cloud storage.' },
    { rule: 'No Spaces - Use Underscores & Hyphens', why: 'Prevents URL encoding corruption (%20) and script failure in automated archiving workflows.' },
    { rule: 'Two-Digit Sequential Versioning (v01, v02)', why: 'Maintains uniform sort order and prevents version collisions.' },
    { rule: 'Strict Ban on FINAL, FINAL2, FINAL_revised', why: 'The version number IS the finality marker. The approved copy is moved to /03_Approved folder, never renamed in place.' },
    { rule: 'Department & Document Type Acronyms', why: 'Enables rapid programmatic searching and filtering (e.g. CSE_MOM, ADM_CIR, EST_OO).' }
  ],
  departments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'ADM', 'EST', 'COE', 'IQAC', 'TPO'],
  doctypes: ['MOM', 'CIR', 'OO', 'OM', 'NOT', 'LTR', 'REP', 'CAL', 'CF']
};

export const ISO_NAMING_TAXONOMY = [
  { rule: '1. Leading ISO 8601 Date (YYYYMMDD)', explanation: 'Guarantees perfect chronological sorting across Windows, Linux, and Cloud storage without timezone shifts.', example: '20260829_JSSPM_CSE_CIR_045_Attendance.pdf' },
  { rule: '2. Institution & Department Acronyms', explanation: 'Prevents cross-departmental file collisions on centralized institutional servers.', example: 'JSSPM_CSE (Computer Science), JSSPM_CIVIL (Civil Engineering)' },
  { rule: '3. Standardized Instrument Category Codes', explanation: 'Enables instant batch filtering across document types (CIR, OO, MOM, NOT, OM, REP).', example: 'CIR (Circular), OO (Office Order), MOM (Minutes of Meeting)' },
  { rule: '4. Reference Number & CamelCase Subject', explanation: 'Allows exact correlation with physical inward/outward registers and audit files.', example: '045_75Percent_Attendance_Mandate' },
  { rule: '5. Two-Digit Versioning (v1.0, v2.0)', explanation: 'Strictly bans ambiguous filenames like final_final2_revised.v3.', example: 'v1.0 (Draft), v1.1 (Revised), v2.0 (Signed & Sealed)' }
];

export const FOLDER_HIERARCHY_TREE = [
  {
    folder: '/01_Correspondence',
    access: 'Read: All Dept Staff | Edit: Office Admin / HoD',
    subfolders: ['/Circulars', '/Office_Orders', '/Office_Memoranda', '/Official_Letters', '/03_Approved']
  },
  {
    folder: '/02_Meetings',
    access: 'Read: Department Faculty | Edit: Member Secretary / Convener',
    subfolders: ['/Agendas', '/Draft_Minutes', '/Signed_MoM_Archive', '/ATR_Registers']
  },
  {
    folder: '/03_Reports',
    access: 'Read: Institutional | Edit: Event Coordinators & IQAC',
    subfolders: ['/Event_Reports_AY_2026-27', '/Annual_Department_Reports', '/Accreditation_NBA_NAAC', '/GeoTagged_Photos']
  },
  {
    folder: '/04_Academics',
    access: 'Read: Students & Staff | Edit: Faculty Course In-Charges',
    subfolders: ['/Academic_Calendars', '/Course_Files_AY_2026-27', '/Timetables', '/CIE_Question_Banks']
  },
  {
    folder: '/05_Confidential',
    access: 'Restricted: Principal & Named Enquiry Officer Only (Sealed Drive)',
    subfolders: ['/Internal_Enquiry_Files', '/Show_Cause_Notices', '/Confidential_Reports', '/RTI_Appeals']
  }
];

export const FOLDER_HIERARCHY_RULES = [
  { tier: 'Tier 1: Department Root', folderName: '01_CSE_DEPT_ROOT', purpose: 'Root directory for department documents', examplePath: '/JSSPM_SERVER/01_CSE_DEPT/' },
  { tier: 'Tier 2: Governance & Academic Years', folderName: 'AY_2026-27', purpose: 'Separates active and archived academic year records', examplePath: '/01_CSE_DEPT/AY_2026-27/' },
  { tier: 'Tier 3: Functional Categories', folderName: '02_MEETINGS_AND_BOS', purpose: 'Functional buckets (Meetings, Correspondence, NBA, Events)', examplePath: '/AY_2026-27/02_MEETINGS_AND_BOS/' },
  { tier: 'Tier 4: Approved & Signed Archive', folderName: '03_APPROVED_SIGNED_PDF', purpose: 'Read-only archive of verified and sealed documents', examplePath: '/02_MEETINGS_AND_BOS/03_APPROVED/' }
];

export const STATUTORY_PRIVACY_RULES = {
  rti: [
    { timeline: '30 Days', trigger: 'Standard RTI Request', action: 'Furnish certified information or issue formal reasoned rejection citing specific section 8 exemptions.' },
    { timeline: '48 Hours', trigger: 'Life or Liberty of a Person', action: 'Mandatory emergency response within 48 hours of receipt.' },
    { timeline: '5 Days', trigger: 'Transfer to another Public Authority', action: 'Transfer application under Section 6(3) and notify applicant immediately.' }
  ],
  dpdp: [
    { title: 'Purpose Limitation', rule: 'Personal data collected for academic admission or payroll cannot be repurposed for external promotion or third-party databases.' },
    { title: 'WhatsApp Marks Disclosure Ban', rule: 'Publishing student internal marks lists with registration numbers or contact details on open WhatsApp groups is a direct violation of DPDP Act 2023.' },
    { title: 'Retention & Signed Weeding Certificate', rule: 'Student records and expired notices must be weeded per statutory schedule with a signed Weeding Certificate. Destroying without a certificate appears as evidence destruction.' }
  ],
  aiRedLines: [
    'Student / Faculty Personally Identifiable Information (Names, Phone Numbers, Aadhaar/PAN, Caste/Income certificates)',
    'Confidential Disciplinary inquiry proceedings or Show-Cause notices',
    'Unpublished examination question papers or schemes of valuation',
    'Commercial tender bids, financial quotes, or vendor pricing terms',
    'Scanned institutional letterheads with digital signatures'
  ]
};

export const RTI_DPDP_RED_LINES = [
  { act: 'DPDP Act 2023 (Section 6)', title: 'Notice Board Student Mobile & Marks Leakage', description: 'Publishing student CIE marks alongside un-masked registration numbers, phone numbers, or caste categories on public notice boards or WhatsApp.', violationExample: 'Displaying "Student Fee Defaulters List" with mobile numbers on student notice boards.' },
  { act: 'RTI Act 2005 (Section 8(1)(j))', title: 'Third-Party Faculty Personal Appraisal Disclosure', description: 'Disclosing personal performance appraisals, medical leave records, or PAN/Aadhaar numbers of faculty to unrelated external applicants without public interest justification.', violationExample: 'Furnishing confidential internal promotion scores without following Section 11 procedure.' },
  { act: 'CSMOP & DPDP Act 2023', title: 'Weeding Documents Without a Statutory Certificate', description: 'Discarding or deleting examination answer sheets or student grievance logs without a formal, countersigned Weeding Certificate.', violationExample: 'Shredding old internal test booklets without documenting resolution and date of destruction.' }
];

export const PII_SANITIZER_SAMPLES = [
  {
    id: '1',
    title: 'Attendance Defaulters Notice (Unsanitized)',
    rawText: `The following students of V Sem CSE are hereby warned for attendance below 75%:
1. Rahul Sharma, Reg No: 324CS22045, Mobile: 9845012345, Email: rahul.sharma@gmail.com, Total Fee Balance: Rs. 18,500.
2. Priya Nair, Reg No: 324CS22089, Mobile: 9980054321, Email: priya.nair@yahoo.com, Total Fee Balance: Rs. 12,000.
Contact HoD immediately to avoid examination debarment.`
  },
  {
    id: '2',
    title: 'Internal Disciplinary Memo (Unsanitized)',
    rawText: `Internal inquiry regarding examination malpractice against candidate Sneha Patil (Reg No: 324EC23012, Mobile: 9448098765) residing at Mysuru. Father Mr. Suresh Patil (Mobile: 9886011223) summoned for inquiry committee meeting on 15-09-2026.`
  }
];
