export const LAB3_FLAWED_SPECIMEN = `REPORT ON WORKSHOP

A workshop was conducted by the Department of Computer Science recently. The programme was inaugurated by the Principal. The resource person delivered an excellent and highly informative session on the latest technologies. The students participated enthusiastically and the session was very interactive. Many students asked questions. The workshop was a grand success and was highly appreciated by all. The programme concluded with a vote of thanks.

[Two photographs attached: one blurred group photo, one photograph of a banner. No captions.]`;

export const LAB3_FIFTEEN_GAPS = [
  { id: 1, gap: 'No report reference number', why: 'Cannot be indexed, retrieved, filed, or cited in NBA/NAAC SSR documentation.' },
  { id: 2, gap: 'No specific date(s) of the event ("recently")', why: '"Recently" is un-auditable; prevents verification against academic calendar or timetable.' },
  { id: 3, gap: 'No venue or delivery mode stated', why: 'Required for infrastructure log correlation and audit validation.' },
  { id: 4, gap: 'Resource person not named; no designation, organisation, or credentials', why: 'Quality of academic input and external expertise cannot be evaluated.' },
  { id: 5, gap: 'Topic not specified ("latest technologies")', why: 'Vague buzzwords cannot be mapped to any syllabus gap, course outcome (CO), or PO.' },
  { id: 6, gap: 'No duration / number of sessions or contact hours', why: 'Blocks student certificate validation and faculty development contact-hour credit.' },
  { id: 7, gap: 'No participation numbers; zero disaggregation', why: 'Single most common adverse finding in NBA/NAAC validation (must show invited, registered, attended, male/female, external).' },
  { id: 8, gap: 'No stated objectives defined before outcomes', why: 'Without benchmarked objectives, outcomes cannot be measured or attained.' },
  { id: 9, gap: 'No measurable outcomes; adjectives substituted for data ("grand success")', why: 'Adjectives like "grand success", "informative" are unverifiable red flags for accreditation assessors.' },
  { id: 10, gap: 'No feedback collection, analysis, or response rate', why: 'Mandatory standard in all accreditation frameworks (e.g. Likert scale, mean score, % response rate).' },
  { id: 11, gap: 'No budget statement: sanctioned vs. utilised', why: 'Financial audit gap; impossible to correlate with institutional accounts ledger.' },
  { id: 12, gap: 'Photographs not geo-tagged, time-stamped, or captioned', why: 'Un-stamped or blurred photos are rejected as unverifiable evidence during document verification.' },
  { id: 13, gap: 'No mandatory annexures (notice, brochure, attendance sheets, sample certificate)', why: 'Complete absence of documentary evidence trail.' },
  { id: 14, gap: 'No signature block, dates, or hierarchical approval route', why: 'Document lacks administrative authorship, accountability, and institutional validity.' },
  { id: 15, gap: 'Not mapped to any accreditation criterion or Programme Outcome (PO/PSO)', why: 'Cannot be claimed in NBA Criteria 4, 5, 8 or NAAC Criteria 1, 2, 3.' }
];

export const LAB3_MODEL_REWRITE = `A two-day hands-on workshop on "Full-Stack Web Development & REST APIs" was organized by the Department of Computer Science & Engineering on 18-09-2026 and 19-09-2026 at the CSE Advanced Computing Lab, with Mr. Anand Kumar, Principal Architect, CloudTech Solutions, Bengaluru, as the resource person. Against a planned target of 60, a total of 74 participants attended (68 diploma students of IV and VI semesters, 6 faculty members), representing 88.3% of the eligible cohort. Of the three stated workshop objectives, all three were attained: 71 participants (95.9%) successfully deployed a containerized REST API during the capstone lab, and 68 secured completion certificates. Quantitative feedback was received from 65 participants (87.8% response rate) with a mean satisfaction index of 4.68 / 5.00. The sanctioned budget was Rs. 25,000/-; actual expenditure incurred was Rs. 23,450/- (Annexure 5). This activity directly maps to NBA Criterion 4.2 (Technical Skill Enhancements), Criterion 5.3 (Faculty Development), and Programme Outcomes PO1, PO3, PO5, and PSO2.`;

export const NINE_PART_EVENT_REPORT_STRUCTURE = [
  { part: 1, title: 'Header & Identification Block', description: 'Institutional letterhead, formal report reference number, event title, dates, venue, organizing department/cell, coordinator name.' },
  { part: 2, title: 'Executive Summary (≤150 words)', description: 'Dense, metric-rich summary stating resource person, participation count, outcome achievement, and criterion mapping.' },
  { part: 3, title: 'Objectives (Defined Pre-Event)', description: 'Numbered SMART objectives (Specific, Measurable, Attainable, Relevant, Time-bound) formulated prior to event conduct.' },
  { part: 4, title: 'Disaggregated Participation Data', description: 'Table breakdown: Target vs. Registered vs. Attended (Students by semester/gender, Faculty internal/external).' },
  { part: 5, title: 'Session-Wise Proceedings', description: 'Brief session log with resource person credentials, topics covered, and pedagogy employed.' },
  { part: 6, title: 'Outcomes Mapped to Objectives & POs/PSOs', description: 'Direct correlation table proving whether stated objectives were met with quantitative metrics and threshold attainment.' },
  { part: 7, title: 'Feedback Analysis & Action Plan', description: 'Survey response rate, mean Likert score (out of 5), graphical summary, and identified scope for future improvement.' },
  { part: 8, title: 'Financial Statement / Budget Utilization', description: 'Sanctioned amount, head-wise expenditure, balance returned, voucher/receipt ledger cross-reference.' },
  { part: 9, title: 'Mandatory Annexures & Approval Signatures', description: 'Geo-tagged & time-stamped photographs (4 angles), brochure, attendance sheets with student signatures, sample certificate, and 3-tier signatures (Coordinator → HoD → Principal).' }
];
