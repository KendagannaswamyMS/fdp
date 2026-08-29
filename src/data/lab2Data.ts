import { BoSSpeakerLine, ATRItem } from '../types';

export const LAB2_BOS_SCRIPT_LINES: BoSSpeakerLine[] = [
  {
    id: 1,
    speaker: 'CHAIRPERSON (HoD)',
    role: 'Chairperson',
    text: 'Good morning. We have quorum - seven of nine members present, the university nominee and the industry expert are both here. Let us begin. Item one, confirmation of the minutes of the meeting held on the twelfth of March. Any corrections? None. Minutes confirmed.',
    trapType: 'none',
    trapExplanation: 'Records Quorum completion and confirmation of previous minutes.'
  },
  {
    id: 2,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'Item two, Action Taken Report. Last meeting we decided to procure the six oscilloscopes for the electronics lab. Prof. Nagaraj, status?',
    trapType: 'none'
  },
  {
    id: 3,
    speaker: 'PROF. NAGARAJ',
    role: 'Member / Lab In-Charge',
    text: 'Sir, the indent was raised in April, but the quotations came above the sanctioned amount. It is pending with the Purchase Committee. I would say it is in progress, not completed.',
    trapType: 'none',
    trapExplanation: 'Valid ATR status: In progress with reason (quotations exceeded sanctioned amount).'
  },
  {
    id: 4,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'Then it carries forward with a revised target. Let us say end of the current semester. Purchase Committee, through Prof. Nagaraj.',
    trapType: 'floating_date',
    trapExplanation: 'TRAP: "End of the current semester" is a floating date. In formal minutes, it must be drafted as an exact date (e.g. 30-11-2026).'
  },
  {
    id: 5,
    speaker: 'PROF. NAGARAJ',
    role: 'Member',
    text: 'Noted, sir.',
    trapType: 'none'
  },
  {
    id: 6,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'Item three. The main item. The proposal to replace the elective "Multimedia Systems" with a new elective "Data Analytics" from the academic year 2026-27. Dr. Suma has circulated the syllabus. Dr. Suma, briefly.',
    trapType: 'none'
  },
  {
    id: 7,
    speaker: 'DR. SUMA',
    role: 'Member / Curriculum Convener',
    text: 'Sir, the Multimedia paper has not been revised in nine years. Industry feedback in our last two placement cycles has repeatedly asked for analytics. I have drafted the syllabus with four units, thirty-two hours, and mapped it to the programme outcomes. The industry expert has seen the draft.',
    trapType: 'none'
  },
  {
    id: 8,
    speaker: 'INDUSTRY EXPERT (Mr. Prakash)',
    role: 'External Industry Nominee',
    text: 'I support it. I would only suggest the last unit include a tool component - Excel and one open-source tool - otherwise the students learn theory and cannot demonstrate anything at interview.',
    trapType: 'condition',
    trapExplanation: 'Approval condition: Unit IV must be revised to include a hands-on tool component.'
  },
  {
    id: 9,
    speaker: 'DR. SUMA',
    role: 'Member',
    text: 'That is acceptable. I will revise unit four.',
    trapType: 'none'
  },
  {
    id: 10,
    speaker: 'PROF. VENKATESH',
    role: 'Member',
    text: 'Sir, I want to place on record my objection. Multimedia is being dropped without consulting the faculty who have been handling it for years. Two of our staff have specialisation in that area. What happens to their workload? I am not against analytics, I am against dropping Multimedia in the same motion. Kindly record my dissent.',
    trapType: 'dissent',
    trapExplanation: 'CRITICAL STATUTORY POINT: Member dissent must be recorded verbatim with named identity and exact ground.'
  },
  {
    id: 11,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'It is recorded, Prof. Venkatesh. Your ground is the workload implication and the absence of prior consultation. Is that a fair statement of it?',
    trapType: 'none'
  },
  {
    id: 12,
    speaker: 'PROF. VENKATESH',
    role: 'Member',
    text: 'Yes sir, that is correct.',
    trapType: 'none'
  },
  {
    id: 13,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'The workload matter is administrative and does not fall within the Board\'s competence, but it will be referred to the Principal separately. On the academic question - members, is the Board agreeable to the introduction of Data Analytics with the revision to unit four?',
    trapType: 'workload',
    trapExplanation: 'TRAP: Workload is administrative (outside BoS competence). It must be recorded as an administrative referral to the Principal, not a BoS resolution.'
  },
  {
    id: 14,
    speaker: 'UNIVERSITY NOMINEE',
    role: 'External University Nominee',
    text: 'Agreed, subject to the revised syllabus being circulated before it goes to the Academic Council.',
    trapType: 'condition',
    trapExplanation: 'Second condition: revised syllabus must be pre-circulated to members before Academic Council.'
  },
  {
    id: 15,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'Agreed. Dr. Suma will submit the revised syllabus. Shall we say within fifteen days - the thirtieth of this month?',
    trapType: 'none'
  },
  {
    id: 16,
    speaker: 'DR. SUMA',
    role: 'Member',
    text: 'Yes sir.',
    trapType: 'none'
  },
  {
    id: 17,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'Item four. Internship credits. There was a proposal to make the six-week internship a credited component.',
    trapType: 'none'
  },
  {
    id: 18,
    speaker: 'DR. SUMA',
    role: 'Member',
    text: 'Sir, the difficulty is that the Board of Technical Examinations has not yet issued the credit framework circular. If we fix credits now we may have to revise.',
    trapType: 'none'
  },
  {
    id: 19,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'Then we defer it. Item four is deferred pending the BTE circular, to be taken up in the next meeting. Prof. Nagaraj, you will track the circular.',
    trapType: 'none'
  },
  {
    id: 20,
    speaker: 'PROF. NAGARAJ',
    role: 'Member',
    text: 'Sir, someone in the office said it may come next month.',
    trapType: 'hearsay',
    trapExplanation: 'CRITICAL TRAP: Hearsay ("someone in the office said"). The Chair explicitly rejects it; minutes must NEVER record hearsay.'
  },
  {
    id: 21,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'We will not record hearsay. Track it and report.',
    trapType: 'none'
  },
  {
    id: 22,
    speaker: 'MR. PRAKASH',
    role: 'External Industry Nominee',
    text: 'Sir, small point - is the canteen still serving after four? My return train is at six.',
    trapType: 'canteen',
    trapExplanation: 'TRAP: Informal chatter / canteen remark. Completely omit from statutory minutes!'
  },
  {
    id: 23,
    speaker: 'CHAIRPERSON',
    role: 'Chairperson',
    text: 'It is, please go across after we finish. Any other item with the permission of the Chair? None. The meeting is concluded with thanks to the Chair. Thank you all.',
    trapType: 'none'
  }
];

export const LAB2_FACILITATOR_KEY = {
  section1_quorum: `The meeting of the Board of Studies (BoS) in Computer Science & Engineering commenced at 10:30 AM on 15-09-2026 in the Board Room. Seven (7) out of nine (9) members being present, the quorum as prescribed under the Academic Regulations was found to be complete. The University Nominee and the Industry Expert were present in person.`,
  
  section2_item1: `Item 1: Confirmation of Previous Minutes
The minutes of the previous Board of Studies meeting held on 12-03-2026 were placed before the Board and were confirmed without amendment.`,
  
  section3_atr_table: [
    {
      id: 'atr-1',
      prevItemNo: 'Item 4 (BoS 12-03-2026)',
      decision: 'Procurement of six (6) digital oscilloscopes for the Electronics / Microcontroller Laboratory',
      responsibility: 'Prof. Nagaraj / Purchase Committee',
      targetDate: '30-11-2026 (Revised)',
      status: 'In progress',
      remarks: 'Quotations received exceeded sanctioned budget; file pending before Purchase Committee for revised financial concurrence.'
    }
  ] as ATRItem[],
  
  section4_item3_resolution: `Item 3: Introduction of Elective "Data Analytics" in place of "Multimedia Systems"
The Board considered the curriculum proposal to introduce "Data Analytics" as a professional elective in place of "Multimedia Systems" with effect from Academic Year 2026-27. After deliberation, and taking note of the industry expert's recommendation to include a hands-on tool component in Unit IV, it was:

RESOLVED THAT the Board of Studies approves the introduction of "Data Analytics" (4 units, 32 hours) as a professional elective in place of "Multimedia Systems" with effect from AY 2026-27, subject to:
  (a) Revision of Unit IV by Dr. Suma to incorporate a hands-on tool component (Excel and open-source data analytics tool); and
  (b) The revised syllabus being circulated to members by 30-09-2026 prior to submission to the Academic Council.

Prof. Venkatesh recorded his dissent on the ground that the discontinuation of "Multimedia Systems" was proposed without prior consultation of the faculty handling the subject and without addressing the consequent workload implications.
The Chairperson observed that faculty workload allocation falls outside the competence of the Board of Studies and directed that the administrative workload matter be referred separately to the Principal for resolution.`,
  
  section5_item4_action_table: {
    deferralText: `Item 4: Credit Allocation for Six-Week Internship
The proposal to accord credit status to the mandatory six-week student internship was DEFERRED pending the issuance of the formal credit framework circular by the Board of Technical Examinations (BTE), to be placed before the next meeting.`,
    actionItems: [
      { id: 1, action: 'Submit revised syllabus of Data Analytics with amended Unit IV tool component', responsibility: 'Dr. Suma', deadline: '30-09-2026' },
      { id: 2, action: 'Refer faculty workload implication of Multimedia Systems discontinuation to the Principal', responsibility: 'Member Secretary / HoD', deadline: '20-09-2026' },
      { id: 3, action: 'Track and report issuance of BTE credit framework circular for internship', responsibility: 'Prof. Nagaraj', deadline: 'Next BoS Meeting' },
      { id: 4, action: 'Follow up oscilloscope procurement indent with the Purchase Committee', responsibility: 'Prof. Nagaraj', deadline: '30-11-2026' }
    ]
  }
};

export const LAB2_TRAPS_LIST = [
  {
    trap: 'Canteen / Train query included in minutes',
    howManyFell: 'Common mistake',
    whyWrong: 'Informal logistical chatter is not a formal statutory proceeding. Must be completely excluded.'
  },
  {
    trap: 'Recording "someone in the office said it may come next month"',
    howManyFell: 'High error rate',
    whyWrong: 'The Chair explicitly ruled out hearsay. Minutes must record facts and decisions, never corridor gossip.'
  },
  {
    trap: 'Softening Prof. Venkatesh\'s dissent to "some members had concerns"',
    howManyFell: 'Severe governance failure',
    whyWrong: 'Statutory member dissent must be recorded under their exact name with the specific ground stated.'
  },
  {
    trap: 'Recording workload adjustment as a BoS decision',
    howManyFell: 'Jurisdiction error',
    whyWrong: 'Workload is administrative (Principal\'s domain). BoS cannot alter service load; it is a referral, not a resolution.'
  },
  {
    trap: 'Writing "Ongoing" for ATR status without reason or date',
    howManyFell: 'Standard bad habit',
    whyWrong: '"Ongoing" allows tasks to vanish. Only 4 statuses permitted: Completed, In progress (with reason & date), Deferred, Dropped.'
  },
  {
    trap: 'Leaving target date as "End of the current semester"',
    howManyFell: 'Auditing defect',
    whyWrong: 'Floating terms are unenforceable. Formal minutes require exact ISO dates (e.g. 30-11-2026).'
  },
  {
    trap: 'Recording unconditional approval for Data Analytics',
    howManyFell: 'Falsification defect',
    whyWrong: 'Approval was strictly subject to 2 conditions (Unit IV tool revision + pre-circulation). Recording unconditional approval falsifies the record.'
  }
];

export const MEETING_LIFECYCLE_STAGES = [
  { stage: 'Stage 1: Convening Notice & Agenda', description: 'Issue notice with statutory lead time (minimum 7–14 days). Agenda items must be structured with explanatory notes.', keyAction: 'Circulate draft agenda and working papers with numbered annexures.' },
  { stage: 'Stage 2: Quorum & Roll Call', description: 'Quorum must be strictly determined at start. In statutory bodies, presence of external university nominee is mandatory.', keyAction: 'Record exact member count (e.g., 7 of 9 present) and formal apologies.' },
  { stage: 'Stage 3: Confirmation of Minutes & ATR', description: 'Review previous minutes and review 4-status Action Taken Report (ATR) table before new business.', keyAction: 'Record "Confirmed without amendments" or specific amendments approved.' },
  { stage: 'Stage 4: Deliberation & Dissent Protection', description: 'Record substantive deliberations in past tense, third person. A dissenting member has a legal right to have their exact dissent recorded.', keyAction: 'Draft exact RESOLVED THAT clause with specific designated officer and timeline.' },
  { stage: 'Stage 5: Chair Summary & Referral', description: 'Matters outside BoS competence (e.g. workload reduction, financial sanction) must be formally referred to Principal.', keyAction: 'Draft referral note: "Chairperson directed the matter be referred to the Principal".' },
  { stage: 'Stage 6: Circulation & Signed Archive', description: 'Draft minutes circulated within 48–72 hours. Signed copy archived in ISO folder /02_Meetings/03_Approved.', keyAction: 'Signatures of Member Secretary and Chairperson with official seal.' }
];

export const STRICT_ATR_STATUS_VOCABULARY = [
  { status: 'Action Completed', criteria: 'Action fully executed, documented, and evidence archived in designated file.', example: '30 Desktop PCs procured and installed in CSE Lab 3. (Ref: PO No. 045)' },
  { status: 'In Progress', criteria: 'Action initiated but awaiting defined milestone; must specify revised deadline.', example: 'Quotations received; pending Purchase Committee financial concurrence by 30-11-2026.' },
  { status: 'Under Review', criteria: 'External regulatory or policy clarification awaited before execution.', example: 'Credit structure deferred pending BTE Karnataka formal notification.' },
  { status: 'Dropped / Withdrawn', criteria: 'Decision formally rescinded with recorded administrative justification.', example: 'Proposal dropped due to syllabus obsolescence as approved in subsequent meeting.' }
];
