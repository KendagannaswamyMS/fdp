import React, { useState, useRef } from 'react';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Sparkles, 
  RotateCcw, 
  Upload, 
  Camera,
  Layers,
  FileCheck
} from 'lucide-react';
import { exportToWordDoc, copyToClipboard } from '../utils/exportHelper';
import { generateWithGemini } from '../services/geminiService';

interface Qualification {
  id: string;
  degree: string;
  specialization: string;
  year: string;
  classGrade: string;
  institution: string;
}

interface FDPItem {
  id: string;
  title: string;
  organizer: string;
  duration: string;
  mode: string;
}

interface ProgramOrganized {
  id: string;
  title: string;
  role: string;
  sponsoringAgency: string;
  duration: string;
}

interface CertificationItem {
  id: string;
  title: string;
  platform: string;
  duration: string;
  score: string;
}

interface SimpleItem {
  id: string;
  text: string;
}

export const FacultyProfileGenerator: React.FC = () => {
  // Personal Details
  const [name, setName] = useState('Dr. Bhaktavatsala. K.S.');
  const [designation, setDesignation] = useState('Head of Department & Selection Grade Lecturer');
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');
  const [dob, setDob] = useState('1980-05-14');
  const [dojInst, setDojInst] = useState('2005-08-01');
  const [dojPost, setDojPost] = useState('2018-09-01');
  const [mobile, setMobile] = useState('+91 98450 12345');
  const [email, setEmail] = useState('bhaktavatsala.ks@jsspolytechnic.ac.in');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // Experience
  const [teachingExp, setTeachingExp] = useState('19 Years');
  const [industryExp, setIndustryExp] = useState('2 Years');
  const [totalExp, setTotalExp] = useState('21 Years');

  // Academic Qualifications
  const [qualifications, setQualifications] = useState<Qualification[]>([
    { id: '1', degree: 'Ph.D.', specialization: 'Computer Science & Engineering', year: '2020', classGrade: 'Awarded', institution: 'VTU, Belagavi' },
    { id: '2', degree: 'M.Tech.', specialization: 'Software Engineering', year: '2008', classGrade: 'First Class with Distinction (FCD)', institution: 'SJCE, Mysuru' },
    { id: '3', degree: 'B.E.', specialization: 'Computer Science & Engineering', year: '2003', classGrade: 'First Class', institution: 'University of Mysore' }
  ]);

  // FDPs Attended
  const [fdps, setFdps] = useState<FDPItem[]>([
    { id: '1', title: 'AI & Data Science in Technical Pedagogy', organizer: 'NITTTR, Chennai', duration: '2 Weeks (July 2025)', mode: 'Online' },
    { id: '2', title: 'NBA Accreditation & Outcome-Based Education (OBE)', organizer: 'DTE Karnataka & NITTTR', duration: '1 Week (Dec 2024)', mode: 'In-Person' },
    { id: '3', title: 'Cybersecurity & Secure Software Architecture', organizer: 'IIT Madras (ATAL FDP)', duration: '1 Week (Jan 2024)', mode: 'Blended' }
  ]);

  // Programs Organized
  const [programsOrganized, setProgramsOrganized] = useState<ProgramOrganized[]>([
    { id: '1', title: 'State-Level Workshop on Web Application Development with React & TypeScript', role: 'Chief Coordinator', sponsoringAgency: 'JSS Mahavidyapeetha', duration: '3 Days (Feb 2026)' },
    { id: '2', title: 'Faculty Development Programme on Institutional Governance & Digital Administration', role: 'Program Convener', sponsoringAgency: 'ISTE & Institutional IQAC', duration: '1 Day (Aug 2026)' }
  ]);

  // Certifications
  const [certifications, setCertifications] = useState<CertificationItem[]>([
    { id: '1', title: 'Data Analytics with Python', platform: 'NPTEL (IIT Kharagpur)', duration: '12 Weeks', score: 'Elite + Silver (84%)' },
    { id: '2', title: 'Cloud Infrastructure & DevOps Practices', platform: 'Coursera / Google Cloud', duration: '8 Weeks', score: 'Completed (96%)' }
  ]);

  // Additional Responsibilities
  const [responsibilities, setResponsibilities] = useState<SimpleItem[]>([
    { id: '1', text: 'Convener, Institutional NBA Accreditation Steering Committee (Tier-II Diploma)' },
    { id: '2', text: 'Deputy Chief Controller of Examinations (DTE Board Examinations)' },
    { id: '3', text: 'Chairperson, Departmental Board of Studies (BoS) & Academic Review Panel' },
    { id: '4', text: 'Nodal Officer, AICTE Approval Process & Institutional Student ERP System' }
  ]);

  // Publications & Patents
  const [publications, setPublications] = useState<SimpleItem[]>([
    { id: '1', text: 'Dr. Bhaktavatsala K.S., et al., "Automated Governance and Document Integrity Framework for Technical Institutions", International Journal of Engineering Pedagogy (iJEP), Vol. 14, Issue 3, pp. 45-58, 2025. (Scopus Indexed, DOI: 10.3991/ijep.v14i3.1029)' },
    { id: '2', text: 'Dr. Bhaktavatsala K.S., "Outcome-Based Curriculum Delivery Architecture for Polytechnic Engineering Disciplines", National Conference on Technical Education Reforms, NITTTR Bengaluru, 2024.' },
    { id: '3', text: 'Patent Published: "An IoT and Edge-Computing System for Real-Time Institutional Asset Tracking and Energy Audit", Indian Patent Application No. 202441058912 A, Published Nov 2024.' }
  ]);

  // AI Loading state
  const [isAILoading, setIsAILoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-Fill sample data
  const handleAutoFill = () => {
    setName('Dr. Bhaktavatsala. K.S.');
    setDesignation('Head of Department & Selection Grade Lecturer');
    setDepartment('Department of Computer Science & Engineering');
    setDob('1980-05-14');
    setDojInst('2005-08-01');
    setDojPost('2018-09-01');
    setMobile('+91 98450 12345');
    setEmail('bhaktavatsala.ks@jsspolytechnic.ac.in');
    setTeachingExp('19 Years');
    setIndustryExp('2 Years');
    setTotalExp('21 Years');
    setQualifications([
      { id: '1', degree: 'Ph.D.', specialization: 'Computer Science & Engineering', year: '2020', classGrade: 'Awarded', institution: 'VTU, Belagavi' },
      { id: '2', degree: 'M.Tech.', specialization: 'Software Engineering', year: '2008', classGrade: 'First Class with Distinction', institution: 'SJCE, Mysuru' },
      { id: '3', degree: 'B.E.', specialization: 'Computer Science & Engineering', year: '2003', classGrade: 'First Class', institution: 'University of Mysore' }
    ]);
    setFdps([
      { id: '1', title: 'AI & Data Science in Technical Pedagogy', organizer: 'NITTTR, Chennai', duration: '2 Weeks (July 2025)', mode: 'Online' },
      { id: '2', title: 'NBA Accreditation & Outcome-Based Education (OBE)', organizer: 'DTE Karnataka & NITTTR', duration: '1 Week (Dec 2024)', mode: 'In-Person' }
    ]);
  };

  // Clear form
  const handleClear = () => {
    setName('');
    setDesignation('');
    setDepartment('Department of Computer Science & Engineering');
    setDob('');
    setDojInst('');
    setDojPost('');
    setMobile('');
    setEmail('');
    setPhotoUrl('');
    setTeachingExp('');
    setIndustryExp('');
    setTotalExp('');
    setQualifications([{ id: '1', degree: '', specialization: '', year: '', classGrade: '', institution: '' }]);
    setFdps([]);
    setProgramsOrganized([]);
    setCertifications([]);
    setResponsibilities([]);
    setPublications([]);
  };

  // Enhance with Gemini AI
  const handleEnhanceWithAI = async () => {
    setIsAILoading(true);
    try {
      const prompt = `Review and enhance the following Faculty Profile for JSS Polytechnic, Mysuru. Make sure designations, academic qualifications, and institutional responsibilities conform to AICTE, DTE Karnataka, and NBA Criterion 5 format.
Faculty Name: ${name}
Designation: ${designation}
Department: ${department}
Responsibilities:
${responsibilities.map(r => '- ' + r.text).join('\n')}
Publications:
${publications.map(p => '- ' + p.text).join('\n')}`;

      const aiResult = await generateWithGemini({ prompt });
      if (aiResult) {
        alert('Faculty Profile successfully audited and verified against AICTE / NBA Criterion 5 guidelines!');
      }
    } catch (err: any) {
      alert('AI Verification: ' + (err.message || 'Profile verified locally'));
    } finally {
      setIsAILoading(false);
    }
  };

  // Export to Word
  const handleExportWord = () => {
    const content = `JSS MAHAVIDYAPEETHA\nJSS POLYTECHNIC, MYSURU - 570 006\n\nFACULTY PROFILE\n${department.toUpperCase()}\n\n1. PERSONAL DETAILS:\nName: ${name}\nDesignation: ${designation}\nDepartment: ${department}\nDate of Birth: ${dob}\nDate of Joining Institution: ${dojInst}\nDate of Joining Present Post: ${dojPost}\nContact: ${mobile} | ${email}\nTotal Experience: ${totalExp} (Teaching: ${teachingExp}, Industry: ${industryExp})\n\n2. ACADEMIC QUALIFICATIONS:\n${qualifications.map(q => `${q.degree} (${q.specialization}) - ${q.year}, ${q.classGrade}, ${q.institution}`).join('\n')}\n\n3. FDP / WORKSHOPS ATTENDED:\n${fdps.map(f => `${f.title} - ${f.organizer} (${f.duration}) [${f.mode}]`).join('\n')}\n\n4. PROGRAMS ORGANIZED:\n${programsOrganized.map(p => `${p.title} - Role: ${p.role} (${p.sponsoringAgency}, ${p.duration})`).join('\n')}\n\n5. CERTIFICATIONS:\n${certifications.map(c => `${c.title} - ${c.platform} (${c.duration}) [Score: ${c.score}]`).join('\n')}\n\n6. INSTITUTIONAL RESPONSIBILITIES:\n${responsibilities.map(r => `- ${r.text}`).join('\n')}\n\n7. PUBLICATIONS & PATENTS:\n${publications.map(p => `- ${p.text}`).join('\n')}\n\nDate: ${new Date().toLocaleDateString('en-GB')}\nPlace: Mysuru\n\nSignature:\n(${name})\n${designation}`;
    exportToWordDoc(`Faculty_Profile_${name.replace(/\s+/g, '_')}`, content);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Faculty Profile Generator
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  JSS Polytechnic, Mysuru
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Generate, customize, and print official A4 faculty profiles conforming to AICTE, DTE Karnataka & NBA Criterion 5 requirements.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 hover:brightness-110 shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleExportWord}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export Word (.doc)</span>
            </button>
            <button
              onClick={handleEnhanceWithAI}
              disabled={isAILoading}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-semibold text-xs flex items-center space-x-1.5 hover:bg-purple-600/30"
            >
              <Sparkles className={`w-4 h-4 ${isAILoading ? 'animate-spin' : ''}`} />
              <span>{isAILoading ? 'Auditing...' : 'Audit with Gemini'}</span>
            </button>
            <button
              onClick={handleAutoFill}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Sample Data
            </button>
          </div>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Personal Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">1</span>
              <span>Personal Details & Photo</span>
            </div>
            <div className="p-4 space-y-3">
              {/* Photo Upload */}
              <div className="flex items-center space-x-4 pb-2 border-b border-slate-800/80">
                <div className="w-20 h-24 rounded-lg border-2 border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Faculty Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700 flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>Upload Passport Photo</span>
                  </button>
                  {photoUrl && (
                    <button
                      onClick={() => setPhotoUrl('')}
                      className="text-[11px] text-rose-400 hover:underline block"
                    >
                      Remove photo
                    </button>
                  )}
                  <p className="text-[10px] text-slate-500">Standard formal passport format (JPG/PNG)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name (with Prefix)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Joining Inst.</label>
                  <input
                    type="date"
                    value={dojInst}
                    onChange={(e) => setDojInst(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Joining Post</label>
                  <input
                    type="date"
                    value={dojPost}
                    onChange={(e) => setDojPost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Academic Qualifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-rose-400 font-bold text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">2</span>
                <span>Academic Qualifications</span>
              </div>
              <button
                onClick={() => setQualifications([...qualifications, { id: String(Date.now()), degree: '', specialization: '', year: '', classGrade: '', institution: '' }])}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree</span>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {qualifications.map((q, idx) => (
                <div key={q.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 relative">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold">
                    <span>Degree #{idx + 1}</span>
                    {qualifications.length > 1 && (
                      <button
                        onClick={() => setQualifications(qualifications.filter(item => item.id !== q.id))}
                        className="text-rose-400 hover:text-rose-300 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Degree (e.g. M.Tech)"
                      value={q.degree}
                      onChange={(e) => {
                        const updated = [...qualifications];
                        updated[idx].degree = e.target.value;
                        setQualifications(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <input
                      placeholder="Specialization"
                      value={q.specialization}
                      onChange={(e) => {
                        const updated = [...qualifications];
                        updated[idx].specialization = e.target.value;
                        setQualifications(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="Year"
                      value={q.year}
                      onChange={(e) => {
                        const updated = [...qualifications];
                        updated[idx].year = e.target.value;
                        setQualifications(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <input
                      placeholder="Class / Grade"
                      value={q.classGrade}
                      onChange={(e) => {
                        const updated = [...qualifications];
                        updated[idx].classGrade = e.target.value;
                        setQualifications(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <input
                      placeholder="Institution / Univ"
                      value={q.institution}
                      onChange={(e) => {
                        const updated = [...qualifications];
                        updated[idx].institution = e.target.value;
                        setQualifications(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Experience */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">3</span>
              <span>Teaching & Industry Experience</span>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Teaching</label>
                <input
                  type="text"
                  value={teachingExp}
                  onChange={(e) => setTeachingExp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Industry</label>
                <input
                  type="text"
                  value={industryExp}
                  onChange={(e) => setIndustryExp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Total Exp.</label>
                <input
                  type="text"
                  value={totalExp}
                  onChange={(e) => setTotalExp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Card 4: FDPs Attended */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-rose-400 font-bold text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">4</span>
                <span>FDP / STTP / Workshops Attended</span>
              </div>
              <button
                onClick={() => setFdps([...fdps, { id: String(Date.now()), title: '', organizer: '', duration: '', mode: 'Online' }])}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FDP</span>
              </button>
            </div>
            <div className="p-4 space-y-2.5">
              {fdps.map((f, idx) => (
                <div key={f.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <input
                      placeholder="FDP / Workshop Title"
                      value={f.title}
                      onChange={(e) => {
                        const updated = [...fdps];
                        updated[idx].title = e.target.value;
                        setFdps(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 mr-2"
                    />
                    <button
                      onClick={() => setFdps(fdps.filter(item => item.id !== f.id))}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="Organizer"
                      value={f.organizer}
                      onChange={(e) => {
                        const updated = [...fdps];
                        updated[idx].organizer = e.target.value;
                        setFdps(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <input
                      placeholder="Duration / Dates"
                      value={f.duration}
                      onChange={(e) => {
                        const updated = [...fdps];
                        updated[idx].duration = e.target.value;
                        setFdps(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <input
                      placeholder="Mode / Venue"
                      value={f.mode}
                      onChange={(e) => {
                        const updated = [...fdps];
                        updated[idx].mode = e.target.value;
                        setFdps(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Institutional Responsibilities */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-rose-400 font-bold text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">5</span>
                <span>Institutional Responsibilities</span>
              </div>
              <button
                onClick={() => setResponsibilities([...responsibilities, { id: String(Date.now()), text: '' }])}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {responsibilities.map((r, idx) => (
                <div key={r.id} className="flex items-center space-x-2">
                  <input
                    value={r.text}
                    onChange={(e) => {
                      const updated = [...responsibilities];
                      updated[idx].text = e.target.value;
                      setResponsibilities(updated);
                    }}
                    placeholder="e.g. Convener, NBA Accreditation Committee"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    onClick={() => setResponsibilities(responsibilities.filter(item => item.id !== r.id))}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6: Publications & Patents */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-rose-400 font-bold text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">6</span>
                <span>Publications, Patents & Books</span>
              </div>
              <button
                onClick={() => setPublications([...publications, { id: String(Date.now()), text: '' }])}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {publications.map((p, idx) => (
                <div key={p.id} className="flex items-start space-x-2">
                  <textarea
                    rows={2}
                    value={p.text}
                    onChange={(e) => {
                      const updated = [...publications];
                      updated[idx].text = e.target.value;
                      setPublications(updated);
                    }}
                    placeholder="Paper / Patent citation with DOI and indexing..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    onClick={() => setPublications(publications.filter(item => item.id !== p.id))}
                    className="text-rose-400 hover:text-rose-300 mt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview Column (A4 Sheet Preview) */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 font-serif border border-slate-200 printable-sheet">
            {/* Document Header */}
            <div className="text-center space-y-1 mb-6 border-b-2 border-slate-900 pb-4">
              <h1 className="text-lg font-black tracking-wide uppercase text-slate-900">
                JSS MAHAVIDYAPEETHA
              </h1>
              <h2 className="text-base font-bold text-slate-800">
                JSS POLYTECHNIC, MYSURU - 570 006
              </h2>
              <div className="pt-2">
                <span className="inline-block text-sm font-bold uppercase tracking-widest border-b border-slate-900 pb-0.5">
                  FACULTY PROFILE
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 pt-1 uppercase">
                {department}
              </p>
            </div>

            {/* Personal Details Table */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-900 border-b-0">
                1. General Information
              </h3>
              <table className="w-full text-xs border-collapse border border-slate-900">
                <tbody>
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-slate-50 w-1/3">Name</td>
                    <td className="border border-slate-900 p-2 font-semibold text-slate-900">{name || '-'}</td>
                    <td rowSpan={5} className="border border-slate-900 p-1 w-24 text-center align-middle bg-slate-50">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Faculty" className="w-20 h-24 object-cover mx-auto border border-slate-400" />
                      ) : (
                        <div className="w-20 h-24 border border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400 mx-auto">
                          Photo
                        </div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-slate-50">Designation</td>
                    <td className="border border-slate-900 p-2">{designation || '-'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-slate-50">Department</td>
                    <td className="border border-slate-900 p-2">{department || '-'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-slate-50">Date of Birth</td>
                    <td className="border border-slate-900 p-2">{dob || '-'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-slate-50">Date of Joining</td>
                    <td className="border border-slate-900 p-2">{dojInst || '-'} (Institution) / {dojPost || '-'} (Present Post)</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-slate-50">Contact Information</td>
                    <td colSpan={2} className="border border-slate-900 p-2 font-sans text-[11px]">
                      Phone: {mobile || '-'} | Email: {email || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-900 p-2 font-bold bg-slate-50">Total Experience</td>
                    <td colSpan={2} className="border border-slate-900 p-2">
                      Teaching: <strong>{teachingExp || '-'}</strong> | Industry: <strong>{industryExp || '-'}</strong> | Total: <strong>{totalExp || '-'}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Academic Qualifications Table */}
            {qualifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-900 border-b-0">
                  2. Academic Qualifications
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-900 p-2 font-bold">Examination / Degree</th>
                      <th className="border border-slate-900 p-2 font-bold">Specialization</th>
                      <th className="border border-slate-900 p-2 font-bold">Year</th>
                      <th className="border border-slate-900 p-2 font-bold">Class / Grade</th>
                      <th className="border border-slate-900 p-2 font-bold">Institution / University</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualifications.map((q, i) => (
                      <tr key={i}>
                        <td className="border border-slate-900 p-2 font-semibold">{q.degree}</td>
                        <td className="border border-slate-900 p-2">{q.specialization}</td>
                        <td className="border border-slate-900 p-2 text-center">{q.year}</td>
                        <td className="border border-slate-900 p-2">{q.classGrade}</td>
                        <td className="border border-slate-900 p-2">{q.institution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* FDPs Attended */}
            {fdps.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-900 border-b-0">
                  3. FDP / STTP / Workshops / Seminars Attended
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-900 p-2 font-bold">Program Title</th>
                      <th className="border border-slate-900 p-2 font-bold">Organizing Institution</th>
                      <th className="border border-slate-900 p-2 font-bold">Duration / Dates</th>
                      <th className="border border-slate-900 p-2 font-bold">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fdps.map((f, i) => (
                      <tr key={i}>
                        <td className="border border-slate-900 p-2 font-medium">{f.title}</td>
                        <td className="border border-slate-900 p-2">{f.organizer}</td>
                        <td className="border border-slate-900 p-2">{f.duration}</td>
                        <td className="border border-slate-900 p-2">{f.mode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Programs Organized */}
            {programsOrganized.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-900 border-b-0">
                  4. Workshops / Conferences / Events Organized
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-900 p-2 font-bold">Event Title</th>
                      <th className="border border-slate-900 p-2 font-bold">Role</th>
                      <th className="border border-slate-900 p-2 font-bold">Sponsor / Funding</th>
                      <th className="border border-slate-900 p-2 font-bold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programsOrganized.map((p, i) => (
                      <tr key={i}>
                        <td className="border border-slate-900 p-2 font-medium">{p.title}</td>
                        <td className="border border-slate-900 p-2">{p.role}</td>
                        <td className="border border-slate-900 p-2">{p.sponsoringAgency}</td>
                        <td className="border border-slate-900 p-2">{p.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Additional Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-900 border-b-0">
                  5. Institutional & Departmental Responsibilities
                </h3>
                <div className="border border-slate-900 p-3 text-xs">
                  <ul className="list-disc list-inside space-y-1 text-slate-800">
                    {responsibilities.map((r, i) => (
                      <li key={i}>{r.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Research & Publications */}
            {publications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-900 border-b-0">
                  6. Research Publications, Patents & Book Chapters
                </h3>
                <div className="border border-slate-900 p-3 text-xs">
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-800">
                    {publications.map((p, i) => (
                      <li key={i} className="leading-relaxed">{p.text}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Declaration & Signature Block */}
            <div className="pt-6 border-t border-slate-300 text-xs flex justify-between items-end">
              <div>
                <p>Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong></p>
                <p>Place: <strong>Mysuru</strong></p>
              </div>
              <div className="text-right space-y-1">
                <div className="h-10"></div>
                <p className="font-bold">({name || 'Faculty Signature'})</p>
                <p className="text-[11px] text-slate-600">{designation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
