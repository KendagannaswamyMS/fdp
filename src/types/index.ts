export type AppMode = 'facilitator' | 'practitioner';
export type TabType = 
  | 'overview' 
  | 'block1' 
  | 'block2' 
  | 'block3' 
  | 'block4' 
  | 'block5' 
  | 'faculty-profile'
  | 'templates';

export interface RunSheetBlock {
  id: string;
  clock: string;
  duration: number; // minutes
  title: string;
  blockCode: string;
  category: 'opening' | 'correspondence' | 'meetings' | 'break' | 'reporting' | 'planning' | 'digital' | 'close';
  description: string;
  type: 'teach' | 'lab' | 'demo' | 'break' | 'admin';
  facilitatorNotes: string;
  participantAction: string;
}

export interface InstrumentDefinition {
  id: string;
  name: string;
  verb: string;
  rule: string;
  person: string;
  salutation: string;
  subscription: string;
  signatory: string;
  scope: string;
  legalEffect: string;
  retentionCategory: string;
  exampleRef: string;
  commonMistake: string;
}

export interface Lab1SplitItem {
  id: string;
  title: string;
  contentSnippet: string;
  correctInstrument: string;
  why: string;
  signatory: string;
  authorityRule: string;
  modelRefNo: string;
  modelSubject: string;
  modelOpening: string;
}

export interface BoSSpeakerLine {
  id: number;
  speaker: string;
  role: string;
  text: string;
  trapType?: 'canteen' | 'hearsay' | 'dissent' | 'workload' | 'floating_date' | 'condition' | 'none';
  trapExplanation?: string;
}

export interface ATRItem {
  id: string;
  prevItemNo: string;
  decision: string;
  responsibility: string;
  targetDate: string;
  status: 'Completed' | 'In progress' | 'Deferred' | 'Dropped';
  remarks: string;
}

export interface CourseFileItem {
  id: number;
  itemNo: number;
  title: string;
  description: string;
  isCriticalAuditFailure: boolean;
  auditFailureReason?: string;
  mandatoryAnnexures: string;
}

export interface AIPromptItem {
  number: number;
  title: string;
  category: string;
  purpose: string;
  promptText: string;
  liveDemoHint: string;
  sampleInput: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  authority: string;
  description: string;
  fields: { key: string; label: string; defaultValue: string; type?: 'text' | 'textarea' | 'date' }[];
  templateGenerator: (data: Record<string, string>) => string;
}
