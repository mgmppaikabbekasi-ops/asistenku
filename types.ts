
export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  RPP_GENERATOR = 'RPP_GENERATOR',
  QUIZ_MAKER = 'QUIZ_MAKER',
  RUBRIC_MAKER = 'RUBRIC_MAKER',
  LKPD_GENERATOR = 'LKPD_GENERATOR',
  MATERIAL_GENERATOR = 'MATERIAL_GENERATOR',
  PRESENTATION = 'PRESENTATION',
  ICE_BREAKING = 'ICE_BREAKING',
  CURHAT = 'CURHAT',
  CHAT = 'CHAT'
}

export interface ToolConfig {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
}

export interface MeetingDetail {
  id: number;
  method: string;
  activity: string;
}

export interface RPPFormData {
  title: string;          
  schoolName: string;
  teacherName: string;
  teacherNIP: string;      
  principalName: string;   
  principalNIP: string;    
  place: string;           
  date: string;            
  semester: string;
  subject: string;
  topic: string;
  grade: string;
  duration: string;
  meetingCount: number;
  meetings: MeetingDetail[]; 
  specificTP: string;     
  includeRubric: boolean; 
  coreActivityModel: 'auto' | 'tar'; 
  customAssessments: string[];
  studentData?: string;
  curriculum?: string;
}

export interface QuizSection {
  id: number;
  questionCount: number;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  type: 'Pilihan Ganda' | 'Pilihan Ganda Kompleks' | 'Menjodohkan' | 'Benar Salah' | 'Setuju / Tidak Setuju' | 'Jawaban Singkat' | 'Uraian / Essay' | 'Isian Singkat';
}

export interface QuizFormData {
  subject: string;
  topic: string;
  grade: string;
  curriculum?: string;
  semester?: string;
  sections: QuizSection[];
  syllabus?: string;
}

// --- NEW INTERFACES FOR DYNAMIC INPUTS ---

export interface RubricDetail {
  id: number;
  taskType: string;
}

export interface RubricFormData {
  subject: string;
  topic: string;
  grade: string;
  criteriaCount: number; 
  rubricCount: number; 
  rubricItems: RubricDetail[]; // Changed from single taskType to array
  curriculum?: string;
  semester?: string;
}

export interface ActivityDetail {
  id: number;
  type: string;
}

export interface LKPDFormData {
  subject: string;
  topic: string;
  grade: string;
  activityCount: number;
  activities: ActivityDetail[]; // Changed from single activityType to array
  curriculum?: string; 
  semester?: string;
}

export interface MaterialDetail {
  id: number;
  style: string;
}

export interface MaterialFormData {
  subject: string;
  topic: string;
  grade: string;
  materialCount: number;
  materialItems: MaterialDetail[]; // Changed from single style to array
  curriculum?: string;
  semester?: string;
}

export interface PresentationFormData {
  topic: string;
  audience: string;
  objective: string;
  slideCount: number;
}

export interface IceBreakingFormData {
  grade: string;
  situation: string;
  duration: string;
}

// --- CONSTANTS FOR DROPDOWNS ---
export const SUBJECT_OPTIONS = [
  "Pendidikan Agama Islam", "Baca Tulis al-Quran", "Pendidikan Pancasila / PPKn", "Bahasa Indonesia", 
  "Matematika", "Ilmu Pengetahuan Alam (IPA)", "Ilmu Pengetahuan Sosial (IPS)", 
  "IPAS (SD)", "Bahasa Inggris", "Seni Budaya", "PJOK", "Informatika", 
  "Sejarah", "Geografi", "Ekonomi", "Sosiologi", "Biologi", "Kimia", "Fisika", 
  "Prakarya", "Bimbingan Konseling", "Bahasa Daerah", "Lainnya"
];

export const JENJANG_OPTIONS = ["PAUD/TK", "SD/MI", "SMP/MTS", "SMA/MA/SMK", "SLB"];

export const GRADE_MAP: Record<string, string[]> = {
  "PAUD/TK": ["TK A", "TK B", "Kelompok Bermain"],
  "SD/MI": ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
  "SMP/MTS": ["Kelas 7", "Kelas 8", "Kelas 9"],
  "SMA/MA/SMK": ["Kelas 10", "Kelas 11", "Kelas 12"],
  "SLB": ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6", "Kelas 7", "Kelas 8", "Kelas 9", "Kelas 10", "Kelas 11", "Kelas 12"]
};

export const SEMESTER_OPTIONS = ["Ganjil", "Genap"];

export const CURRICULUM_OPTIONS = ["Kurikulum Merdeka", "Kurikulum 2013", "Kurikulum Darurat"];
