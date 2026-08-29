import { AIPromptItem } from '../types';

export const AI_PROMPTS_LIST: AIPromptItem[] = [
  // PART 1: Official Correspondence
  {
    number: 1,
    title: 'Institutional Circular Generator',
    category: 'Part 1: Correspondence',
    purpose: 'Drafts formal institutional policy circulars following CSMOP conventions over the Principal / Competent Authority signature.',
    promptText: `Draft a formal circular for [institution/department] announcing [subject].
Issuing authority: [role]  |  Circular No. format: [e.g., JSSPM/ADM/CIR/2026-27/xx]
Audience: [group]  |  Key facts: [dates, venue, duties, deadlines]
Tone: formal, third-person ("It is hereby notified/instructed...")
End with signatory block + standard Copy to: distribution list.

Details:
{{INPUT}}`,
    liveDemoHint: 'Enforces proper third-person grammar, no salutation/subscription, and authority matching institutional scope.',
    sampleInput: `Institution: JSS Polytechnic, Mysuru
Department: All Departments
Subject: Strict enforcement of 75% minimum attendance for Continuous Internal Evaluation (CIE)
Authority: Dr. Bhaktavatsala. K.S., Principal
Audience: All teaching faculty, staff, and students
Key facts: Applicable from 01-10-2026 pursuant to Academic Committee decision on 22-08-2026. Faculty must update ERP attendance every Saturday by 4:00 PM.`
  },
  {
    number: 2,
    title: 'Bilingual Notice (English / Kannada)',
    category: 'Part 1: Correspondence',
    purpose: 'Generates an administrative notice in English followed by an authentic, formal Kannada administrative translation with matching dates and proper nouns.',
    promptText: `Draft a formal notice in English about [subject], then provide a formal, grammatically accurate Kannada administrative translation (ಕನ್ನಡ ಆಡಳಿತಾತ್ಮಕ ಭಾಷಾಂತರ) below it. Keep facts, proper nouns, dates and numerals identical in both. Format: English Notice, horizontal rule (---), Kannada Notice (ಸೂಚನೆ).

Notice Details:
{{INPUT}}`,
    liveDemoHint: 'Perfect for Karnataka DTE institutions where bilingual campus notice boards are mandatory.',
    sampleInput: `Institution: JSS Polytechnic, Mysuru
Subject: Rescheduling of III Semester Practical Examination in Computer Science Laboratory
Original Date: 14-09-2026
Rescheduled Date: 18-09-2026 (due to institutional holiday)
Reporting Time: 09:00 AM sharp with College ID Card and Hall Ticket
Signatory: Controller of Examinations`
  },

  // PART 2: Meeting Governance
  {
    number: 3,
    title: 'Rough Notes → Formal MoM',
    category: 'Part 2: Meetings',
    purpose: 'Converts unstructured meeting bullet points or rough scribbles into formal statutory Minutes of Meeting (MoM).',
    promptText: `Convert these rough notes into a formal MoM for [meeting/committee], [date/venue], chaired by [name].
Structure:
1) Attendance & Quorum verification
2) Item 1: Confirmation of previous minutes
3) Substantive Agenda items with brief discussion summary & formal "RESOLVED THAT" clauses
4) Action items table [S.No | Action | Responsibility | Target Date]

Rough Notes:
{{INPUT}}`,
    liveDemoHint: 'Transforms messy meeting notes into auditable past-tense, third-person governance documentation.',
    sampleInput: `Meeting: Departmental Advisory Board (DAB) in CSE
Date: 20-08-2026 at Seminar Hall 2, chaired by Dr. Bhaktavatsala. K.S., Principal / HoD.
Present: 8 of 10 members present, including Industry Expert Prakash from Infosys.
Notes:
- Confirmed minutes of March meeting.
- Discussed updating Web Dev lab to include Node.js and React. Prakash said industry wants full-stack. Approved starting this odd semester.
- Dr. Suma to prepare lab manual by 10th September.
- Prof. Venkatesh asked about budget for software licenses. HoD said open-source tools will be used, zero budget impact.
- Next meeting scheduled in December.`
  },
  {
    number: 4,
    title: 'Minutes → Action Taken Report (ATR)',
    category: 'Part 2: Meetings',
    purpose: 'Extracts decisions from previous meeting minutes and builds a statutory 6-column ATR table with strict status classification.',
    promptText: `From this MoM, build an Action Taken Report (ATR) table:
Columns: S.No | Previous Item Ref | Action Item / Decision | Responsibility | Target Date | Status (Completed / In progress / Deferred / Dropped) | Remarks & Reasons for Delay.
Any decision without an identifiable owner or date must be listed separately under "Defective Decisions".

MoM:
{{INPUT}}`,
    liveDemoHint: 'Eliminates vague "Ongoing" statuses and flags defective floating decisions for audit compliance.',
    sampleInput: `MINUTES EXCERPTS:
1. Item 2: Resolved that 30 new high-end Core-i7 computers be procured for CAD/CAM Lab. Responsibility: Purchase Committee through Prof. Nagaraj. Target Date: 30-09-2026.
2. Item 3: Resolved that department shall sign MoUs with 3 local automation industries for student internships before November 2026. Responsibility: Training & Placement Officer.
3. Item 4: Resolved that Wi-Fi coverage across academic block be audited. Responsibility: System Admin. Target Date: immediate.`
  },

  // PART 3: Reporting & Compliance
  {
    number: 5,
    title: 'Post-Event / IQAC Summary Report',
    category: 'Part 3: Reporting',
    purpose: 'Generates a 9-part accreditation-grade post-event report mapping Claim → Metric → Evidence Locator.',
    promptText: `Generate a 9-part institutional post-event report conforming to NBA/NAAC criteria:
1. Header & Event Number (e.g., JSSPM/CSE/EVT/2026-27/012)
2. Executive Summary (with Claim → Metric → Locator triple)
3. Resource Person Profile & Organization
4. Participant Metrics Table (Faculty/Students/External)
5. Session Outcomes Mapped to Programme Outcomes (POs/PSOs)
6. Financial Statement (Sanctioned vs Utilised)
7. Participant Feedback Analysis (% satisfaction & response rate)
8. Geo-tagged Photograph Index
9. Signatory & Verification Block (Coordinator, HoD, Principal).

Event Inputs:
{{INPUT}}`,
    liveDemoHint: 'Constructs auditable event files that withstand NBA Tier-II diploma peer team scrutiny.',
    sampleInput: `Event: 3-Day Hands-on Workshop on 'Full-Stack Web Development with React & Node.js'
Dates: 18-08-2026 to 20-08-2026
Department: Computer Science & Engineering
Resource Person: Mr. Anand Murthy, Lead Architect, ThoughtFocus, Bengaluru
Participants: 64 Final Year Diploma Students (34 Male, 30 Female)
Budget: Sanctioned Rs. 25,000/- | Utilised Rs. 23,850/- (Under Management Budget Head)
Feedback: 94.2% overall satisfaction score across 62 respondents
POs Mapped: PO1 (Engineering Knowledge), PO3 (Design/Development), PO5 (Modern Tool Usage)`
  },
  {
    number: 6,
    title: 'DTE / AICTE / NBA Criteria-Mapped Summary',
    category: 'Part 3: Reporting',
    purpose: 'Structures department achievements into specific statutory accreditation criterion narratives (Criterion 3, 4, 5).',
    promptText: `Map these department activities into an NBA Criterion {{CRITERION_NO}} descriptive narrative.
Structure:
- Qualitative Claim
- Quantitative Metric (Counts, Percentages, Trends over 3 AYs: CAY, CAYm1, CAYm2)
- Physical Evidence Locator (File / Register Reference)
- Continuous Improvement / Action Taken Loop.

Raw Activities:
{{INPUT}}`,
    liveDemoHint: 'Converts raw departmental work into formal Self-Assessment Report (SAR) tables.',
    sampleInput: `Criterion: NBA Criterion 5 (Faculty Information & Contributions)
Department: CSE, AY: 2025-26
Activities:
- 100% faculty attended minimum one 5-day FDP/STTP in the academic year.
- 4 faculty certified in NPTEL MOOC courses with Elite/Gold grades.
- 2 Indian Patents published by faculty team on IoT smart agriculture.
- Faculty Cadre Ratio: 1 Professor : 3 Assoc Prof : 12 Asst Prof (Cadre Ratio Score: Max).`
  },

  // PART 4: Planning, Portfolios & Student Affairs
  {
    number: 7,
    title: 'Term Calendar with Working-Day Arithmetic',
    category: 'Part 4: Planning',
    purpose: 'Calculates net instructional working days from declared holidays, placing 3 CIE assessments and buffer days mathematically.',
    promptText: `Create an institutional term calendar from these semester parameters:
Events to place: [3 CIE internals, Tech Fest, Project reviews, Remedial classes].
Output:
1) Working-day arithmetic table (Total days - Holidays - CIE = Net instructional days vs 80 min requirement)
2) Chronological calendar schedule
3) Emergency buffer analysis (min 5-7 days)
4) List of potential schedule conflicts flagged separately.

Calendar Inputs:
{{INPUT}}`,
    liveDemoHint: 'Prevents semester collapse by mathematically validating buffer days before publishing.',
    sampleInput: `Term Start: 01-08-2026, Term End: 30-11-2026 (Total 122 calendar days)
Sundays: 17 days
Declared Holidays: 8 days (15-Aug, 07-Sep, 02-Oct, 12-Oct, 24-Oct, 01-Nov, 05-Nov, 14-Nov)
BTE Board Practical Exams: 25-11-2026 onwards
Need to schedule: CIE 1 (after 30 working days), CIE 2 (after 55 working days), CIE 3 / Lab Internals (after 75 working days), Annual Tech Fest (1 day).`
  },
  {
    number: 8,
    title: 'Appraisal Self-Evaluation (PBAS / CAS)',
    category: 'Part 4: Portfolios',
    purpose: 'Drafts faculty appraisal self-evaluations structured by Teaching, Research, FDPs, and Admin responsibilities, citing Block 1 Office Orders.',
    promptText: `Draft my faculty appraisal self-evaluation using sections:
- Section A: Teaching & Course Outcomes (Courses handled, results %, feedback)
- Section B: Research, Publications & Patents
- Section C: FDPs, Certifications & Professional Development
- Section D: Institutional & Administrative Responsibilities (Cite Office Orders)
- Section E: Student Mentoring & Project Guidance
Use only activities provided - do not invent achievements. Tone: concise, factual, first-person. Include an Evidence Index column with Annexure citations.

Faculty Activity List:
{{INPUT}}`,
    liveDemoHint: 'Connects institutional Office Orders directly to personal CAS career advancement increments.',
    sampleInput: `Name: Dr. Ramesh N., Assistant Professor, Dept of CSE
AY: 2025-26
Teaching: Handled 'Data Structures' (Pass 94.2%, Feedback 4.7/5) and 'Cloud Computing' (Pass 91.5%, Feedback 4.6/5).
Admin Duties: Appointed Department NBA Coordinator vide Office Order No. JSSPM/EST/OO/2025-26/049; Member of College Time Table Committee.
FDPs: Attended 5-day AICTE ATAL FDP on Deep Learning at NITK Surathkal; 1 NPTEL course certified.
Mentoring: Mentored 22 diploma students; guided 2 student projects that won state-level polytechnic project exhibition.`
  },
  {
    number: 9,
    title: 'Concise Student Advisory / Reminder Notice',
    category: 'Part 4: Student Affairs',
    purpose: 'Drafts a high-impact, actionable student notice (under 150 words) suitable for notice boards, email, and ERP portals.',
    promptText: `Draft a [reminder / instruction / advisory] to [student group] about [subject].
Key points: [list]. Tone: [firm / informative / encouraging].
Requirements:
- Strictly under 150 words
- Action items formatted as a numbered list
- Clear deadline with date and time
- Consequence of non-compliance stated clearly.

Input:
{{INPUT}}`,
    liveDemoHint: 'Eliminates vague prose and creates crystal-clear, student-friendly instructions.',
    sampleInput: `Audience: All V Semester Diploma Students (All Branches)
Subject: Submission of Board Examination Application Forms & Fee Payment
Fee: Rs. 850/- to be paid via ERP online portal
Deadline: 15-09-2026 by 4:00 PM without fine; 20-09-2026 with Rs. 200 late fine
Action: Submit downloaded fee receipt along with 2 passport photos to Department Office.`
  },

  // PART 5: Master Statutory AI Prompts (Renumbered 10–15 for unbroken sequence)
  {
    number: 10,
    title: 'Transcript to Statutory Minutes & ATR (FDP #23)',
    category: 'Part 5: Statutory AI',
    purpose: 'Converts raw meeting transcripts into formal third-person minutes, RESOLVED THAT clauses, and an ATR table while discarding informal chatter and hearsay.',
    promptText: `Convert this meeting transcript into formal minutes. Record decisions only, not discussion. Past tense, third person. Output: (a) attendance and quorum note, (b) item-wise resolutions using "RESOLVED THAT", (c) an ATR table, (d) an Action | Responsibility | Deadline table. Flag separately any statement that cannot be recorded because it is hearsay, informal, or lacks an owner. Do not invent names, dates or item numbers - use {{PLACEHOLDER}}.

Transcript:
{{INPUT}}`,
    liveDemoHint: 'Run on Lab 2 Mock BoS script: discards canteen chat, flags hearsay, and catches floating dates.',
    sampleInput: `CHAIRPERSON: We have quorum. 7 of 9 present including university nominee. Item 1 minutes confirmed. Item 2 oscilloscope procurement: Prof Nagaraj says quotations exceeded sanctioned amount, in progress with purchase committee. Chair says target end of current semester. Item 3 Data Analytics elective replacing Multimedia: Dr Suma drafted 4 units 32 hours. Industry expert Prakash says add Excel in unit 4. Prof Venkatesh dissents due to workload and no prior consultation. Chair notes workload is administrative, referred to Principal. BoS approves with unit 4 revision and pre-circulation. Item 4 internship credits deferred pending BTE circular. Prof Nagaraj says office boy told him circular comes next month; Chair says no hearsay. Prakash asks if canteen is open after 4pm.`
  },
  {
    number: 11,
    title: 'Accreditation Documentation Audit (FDP #24)',
    category: 'Part 5: Statutory AI',
    purpose: 'Audits any submitted departmental event report against 15 NBA/NAAC criteria and returns a strict gap list without hallucinated rewrites.',
    promptText: `Audit this event report against accreditation documentation requirements. Give me a gap list only, no rewrite. Check for: report number, dates, venue, resource person credentials, stated objectives, participation numbers with disaggregation, outcomes mapped to objectives, feedback with response rate, budget sanctioned vs utilised, geo-tagged evidence, annexures, signature block, criterion mapping.

Report Text:
{{INPUT}}`,
    liveDemoHint: 'Paste the Lab 3 flawed specimen report to extract all 15 compliance failures.',
    sampleInput: `REPORT ON WORKSHOP
A workshop was conducted by the Department of Computer Science recently. The programme was inaugurated by the Principal. The resource person delivered an excellent and highly informative session on the latest technologies. The students participated enthusiastically and the session was very interactive. Many students asked questions. The workshop was a grand success and was highly appreciated by all. The programme concluded with a vote of thanks.
[Two photographs attached: one blurred group photo, one photograph of a banner. No captions.]`
  },
  {
    number: 12,
    title: 'Accreditation Metric & Adjective Purger (FDP #25)',
    category: 'Part 5: Statutory AI',
    purpose: 'Rewrites subjective narrative by replacing vague adjectives ("grand success", "informative") with auditable metric placeholders {{METRIC}}.',
    promptText: `Rewrite this paragraph for an accreditation submission. Replace every adjective with a number or delete it. Where a number is required but I have not supplied one, insert {{METRIC}} and list at the end everything I must fill in.

Text:
{{INPUT}}`,
    liveDemoHint: 'Enforces the golden rule: "Every adjective removed should be replaced by a number."',
    sampleInput: `Our department made remarkable progress in enhancing student placement through excellent industry collaborations. We conducted numerous highly beneficial training workshops with top industry experts. Students showed immense interest and secured great packages in reputed companies.`
  },
  {
    number: 13,
    title: 'ATR Table Generator & Defect Flagging (FDP #26)',
    category: 'Part 5: Statutory AI',
    purpose: 'Extracts ATR items from previous minutes and enforces the 4 strict statuses (Completed, In progress, Deferred, Dropped), highlighting defective floating decisions.',
    promptText: `Draft an Action Taken Report table from these minutes. Columns: previous item number, decision, responsibility, target date, status, remarks. Status must be exactly one of: Completed / In progress / Deferred / Dropped. Any decision without an identifiable owner or date must be listed separately under "Defective decisions requiring clarification".

Minutes:
{{INPUT}}`,
    liveDemoHint: 'Eliminates the vague "Ongoing" status and forces reason + revised date for in-progress items.',
    sampleInput: `1. Resolved that 10 new computers be purchased for CAD lab by Prof. Suresh before 15-08-2026. (Status: Vendor delivered 10 machines on 10-08-2026, installation completed).
2. Resolved that Wi-Fi access points in 2nd floor be upgraded. (Status: Indent submitted, waiting for quotation approvals).
3. Resolved that student industrial visit to ISRO be organized. (Status: ISRO permission denied for current semester due to launch schedule).`
  },
  {
    number: 14,
    title: 'Academic Calendar Working-Day Engine (FDP #27)',
    category: 'Part 5: Statutory AI',
    purpose: 'Computes net instructional working days from declared holidays and exam windows, placing 3 CIE assessments with mandatory 5–7 buffer days.',
    promptText: `Here is our board examination calendar and declared holiday list. Compute the available working days per semester, then propose an academic calendar placing three internal assessments with at least {{BUFFER_DAYS}} buffer days, without any assessment in the week preceding a board examination. Show the working-day arithmetic so I can verify it.

Calendar inputs:
{{INPUT}}`,
    liveDemoHint: 'Prevents semester collapse by mathematically enforcing unforeseen emergency buffers.',
    sampleInput: `Term Start: 01-08-2026, Term End: 30-11-2026
Sundays: 17 days
Declared Govt / Festival Holidays: 8 days (15-Aug, 07-Sep, 02-Oct, 12-Oct, 24-Oct, 01-Nov, 05-Nov, 14-Nov)
BTE Board Practical Exams Begin: 25-11-2026
Prescribed Minimum Instructional Days: 80 days
Buffer required: 6 days`
  },
  {
    number: 15,
    title: 'Show-Cause Procedural Defect Reviewer (FDP #28)',
    category: 'Part 5: Statutory AI',
    purpose: 'Audits disciplinary show-cause notices for violations of natural justice (Audi alteram partem, pre-judgment language, competent authority, reply window).',
    promptText: `Review this show-cause notice for procedural defects only. Check: is a specific charge stated with dates; is the language free of pre-judgment; is a reply period given; is the authority competent; is the recipient told the consequence of not replying; is any finding asserted before the reply. Do not rewrite.

Notice draft:
{{INPUT}}`,
    liveDemoHint: 'Ensures the institution does not lose a disciplinary case in court on technical grounds of biased wording.',
    sampleInput: `MEMORANDUM
It has been proved that you committed gross misconduct and negligence by remaining absent from examination invigilation duty on 10th August. You are a habitual offender. You are hereby directed to explain your irresponsible behavior immediately, failing which severe penalty will be imposed.`
  }
];
