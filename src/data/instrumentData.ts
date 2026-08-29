import { InstrumentDefinition } from '../types';

export const INSTRUMENT_DEFINITIONS: InstrumentDefinition[] = [
  {
    id: 'office_order',
    name: 'Office Order (OO)',
    verb: 'Commands',
    rule: 'Creates rights, duties, alters workload, assigns charges, sanctioning leave/funds, disciplinary steps.',
    person: 'Third person, formal, imperative',
    salutation: 'Nil (No salutation)',
    subscription: 'Nil (Signed by Competent Authority / Principal / Registrar)',
    signatory: 'Head of Institution / Appointing Authority',
    scope: 'Individual employee(s) or specified post',
    legalEffect: 'Service record consequence; legally binding command',
    retentionCategory: 'Category A / B (Permanent or 10–25 years in personal file)',
    exampleRef: 'JSSPM/EST/OO/2026-27/042',
    commonMistake: 'Issued as Circular or informal WhatsApp note without service file copy.'
  },
  {
    id: 'circular',
    name: 'Circular',
    verb: 'Instructs',
    rule: 'Disseminates uniform policy, rules, or general instructions of continuing applicability across the organization.',
    person: 'Third person / Impersonal',
    salutation: 'Nil',
    subscription: 'Nil (Signature with designation)',
    signatory: 'Principal / Head of Institution / Director',
    scope: 'All departments, all faculty/staff/students',
    legalEffect: 'Institutional administrative regulation',
    retentionCategory: 'Category C (3–5 years or until superseded)',
    exampleRef: 'JSSPM/ADM/CIR/2026-27/018',
    commonMistake: 'Signed by HoD for institution-wide rules (authority must match scope!).'
  },
  {
    id: 'notice',
    name: 'Notice',
    verb: 'Informs',
    rule: 'Public or general notification regarding a time-bound, event-specific matter (exams, holidays, meetings).',
    person: 'Third person / Direct informative',
    salutation: 'Nil',
    subscription: 'Nil (Signatory at bottom right)',
    signatory: 'Controller of Examinations / HoD / Convener',
    scope: 'Students, specific batch, or general campus notice board',
    legalEffect: 'Informational display; expires after event completion',
    retentionCategory: 'Category C (1 year after event/exam cycle)',
    exampleRef: 'JSSPM/COE/NOT/2026-27/105',
    commonMistake: 'Using notice for permanent policy changes or personnel workload changes.'
  },
  {
    id: 'office_memorandum',
    name: 'Office Memorandum (OM)',
    verb: 'Asks / Conveys',
    rule: 'Internal inter-departmental communication, calling for data/nominations, conveying non-statutory information.',
    person: 'Third person (The undersigned is directed to...)',
    salutation: 'Nil',
    subscription: 'Nil (Signed at bottom right, addressee at bottom left)',
    signatory: 'Administrative Officer / HoD / Registrar',
    scope: 'Specific department, section, or defined faculty group',
    legalEffect: 'Internal administrative compliance request',
    retentionCategory: 'Category C (1–3 years)',
    exampleRef: 'JSSPM/ADM/OM/2026-27/064',
    commonMistake: 'Confusing with a Circular; addressing individuals informally without tracking.'
  },
  {
    id: 'official_letter',
    name: 'Official Letter',
    verb: 'Represents',
    rule: 'External formal correspondence with government, DTE, AICTE, university, industries, vendors, or parents.',
    person: 'First person (I am directed to convey...)',
    salutation: 'Sir / Madam',
    subscription: 'Yours faithfully',
    signatory: 'Principal / Head of Institution (Authorized official)',
    scope: 'External statutory or external entity',
    legalEffect: 'Institutional external representation and legal liability',
    retentionCategory: 'Category B / C (5–10 years depending on subject)',
    exampleRef: 'JSSPM/OFF/LTR/2026-27/219',
    commonMistake: 'Missing statutory reference number, improper salutation/subscription pairing.'
  },
  {
    id: 'do_letter',
    name: 'Demi-Official (D.O.) Letter',
    verb: 'Appeals / Personal Liaison',
    rule: 'Officer-to-officer correspondence for urgent personal attention, high-level coordination, or sensitive matters.',
    person: 'First person, personal tone',
    salutation: 'Dear Dr. {{Name}} / Dear Shri {{Name}}',
    subscription: 'Yours sincerely / With warm regards',
    signatory: 'Principal / Secretary / Chairman personally',
    scope: 'Specific equivalent or senior official',
    legalEffect: 'High-priority administrative liaison',
    retentionCategory: 'Category C (3 years)',
    exampleRef: 'JSSPM/DO/2026-27/008',
    commonMistake: 'Using for routine administrative orders or routine circulars.'
  }
];

export const TEN_COMMON_DRAFTING_ERRORS = [
  {
    id: 1,
    phrase: 'Please do the needful',
    correction: 'Specify the EXACT action required, the responsible officer, and the deadline.',
    why: 'Ambiguous; passes ambiguity down the hierarchy with zero legal accountability.'
  },
  {
    id: 2,
    phrase: 'Without fail / Kindly cooperate',
    correction: 'State the hard calendar deadline and the regulatory consequence of non-compliance.',
    why: 'Emotional appeals are not deadlines. Auditors and courts look for explicit dates.'
  },
  {
    id: 3,
    phrase: 'HoD signing institution-wide policy',
    correction: 'Authority must match scope - only the Principal/Registrar signs institution-wide circulars.',
    why: 'Ultra vires; decisions signed without statutory competence are legally void.'
  },
  {
    id: 4,
    phrase: 'End of the current semester / soon',
    correction: 'Always quote an exact ISO calendar date (e.g., by 30th September 2026).',
    why: 'Floating references make ATRs and compliance registers impossible to audit.'
  },
  {
    id: 5,
    phrase: 'One note dumped with 4 different topics',
    correction: 'Split: One instrument = One subject = One file number = One register entry.',
    why: 'Cross-filing failure: exam notices, staff orders, and policy cannot sit in one file.'
  },
  {
    id: 6,
    phrase: 'Informal WhatsApp / email broadcast for workload assignment',
    correction: 'Issue a formal numbered Office Order copied to Service Book & Est. Section.',
    why: 'Lost promotion points in CAS/PBAS! No Office Order = no institutional service proof.'
  },
  {
    id: 7,
    phrase: 'Sanitising or omitting a recorded dissent in minutes',
    correction: 'Record by member name with the exact ground confirmed by the member on record.',
    why: 'Violates statutory rights and deprives both member and committee of audit defence.'
  },
  {
    id: 8,
    phrase: 'Substituting adjectives for accreditation metrics (grand success)',
    correction: 'Apply the Triple Rule: Claim → Metric → Evidence Locator (Annexure page).',
    why: 'Assessors reject narrative adjectives without verifiable attendance/feedback data.'
  },
  {
    id: 9,
    phrase: 'Missing quorum record in minutes',
    correction: 'Always record exact counts and category of external statutory members present.',
    why: 'A decision taken without recorded quorum is ab initio void.'
  },
  {
    id: 10,
    phrase: 'File named CIRCULAR_FINAL_v2_FINAL_KS.docx',
    correction: 'Use ISO syntax: YYYY-MM-DD_DEPT_DOCTYPE_SUBJECT_vNN_INITIALS.ext.',
    why: 'Version chaos destroys audit readiness and legal discovery.'
  }
];
