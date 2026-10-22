export type UserRole = 'admin' | 'coordenador' | 'orientador' | 'estudante';

export type UserStatus = 'pendente' | 'ativo' | 'rejeitado' | 'desativado';

export type AcademicLevel =
  | '12º Classe'
  | '13º Classe (Terminal)'
  | '12ª Classe'
  | '13ª Classe (Terminal)'
  | '10º Nível'
  | '11º Nível'
  | '12º Nível'
  | '13º Nível (Terminal)'
  | 'Ano Terminal (Licenciatura)'
  | 'Ano Terminal (Mestrado)';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  // Student specific
  courseId?: string;
  courseName?: string;
  academicLevel?: AcademicLevel;
  studentNumber?: string;
  groupId?: string;
  groupName?: string;
  isLeader?: boolean;
  preferredAdvisorId?: string;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  groupMembers?: string[]; // Colleague names in the group
  // Advisor specific
  teacherId?: string;
  specialization?: string[];
  associatedCourses?: string[];
  department?: string;
  maxGroupsQuota?: number;
  currentGroupsCount?: number;
  // Institutional email validation
  isNonInstitutionalEmail?: boolean;
  emailType?: 'institucional' | 'externo_nao_aceite';
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  coordinatorId?: string;
  coordinatorName?: string;
  terminalLevel: string; // e.g. "13º Nível"
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface StudentGroup {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  leaderId: string;
  leaderName: string;
  memberIds: string[];
  memberNames: string[];
  advisorId?: string;
  advisorName?: string;
  preferredAdvisorId?: string;
  theme?: string;
  academicYear?: string;
  createdAt: string;
}

export type SubmissionStage = 'anteprojecto' | 'relatorio_progresso' | 'tfc_final';

export type SubmissionStatus =
  | 'submetido'
  | 'em_revisao'
  | 'alteracoes_solicitadas'
  | 'aprovado_orientador'
  | 'aprovado_coordenador'
  | 'reprovado'
  | 'defendido'
  | 'homologado';

export interface PlagiarismMatch {
  sourceTitle: string;
  sourceType: 'repositorio_interno' | 'artigo_cientifico' | 'web';
  similarityPercentage: number;
  matchedExcerpt: string;
}

export interface PlagiarismReport {
  score: number; // e.g., 8.5%
  status: 'aprovado' | 'atencao' | 'critico';
  checkedAt: string;
  scannedWordsCount: number;
  matches: PlagiarismMatch[];
  verdict: string;
}

export interface Submission {
  id: string;
  groupId: string;
  groupName: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  advisorId?: string;
  advisorName?: string;
  stage: SubmissionStage;
  targetRecipient?: 'coordenacao' | 'orientador'; // whether sent to coordinator or advisor
  title: string;
  theme: string;
  abstract: string;
  fileName: string;
  fileSize: number; // In bytes (max 15MB = 15728640)
  fileType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  fileUrl: string;
  status: SubmissionStatus;
  version: number;
  plagiarismReport?: PlagiarismReport;
  submittedAt: string;
  updatedAt: string;
  deadlineId?: string;
  advisorFeedback?: string;
  advisorEvaluationDate?: string;
  coordinatorFeedback?: string;
  coordinatorEvaluationDate?: string;
}

export interface Deadline {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  stage: SubmissionStage;
  startDate: string;
  dueDate: string;
  description: string;
  isBlocked: boolean; // if true, submissions are blocked
  advisorId?: string; // advisor who created the deadline
  advisorName?: string;
  targetScope?: 'coordenacao' | 'orientador'; // whether it applies to all course students or only the advisor's advisees
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  content: string;
  fileAttachment?: {
    name: string;
    url: string;
    size: number;
    type: string;
  };
  createdAt: string;
}

export interface JuryMember {
  professorId: string;
  name: string;
  role: 'presidente' | 'primeiro_vogal' | 'segundo_vogal';
  specialization: string;
}

export interface JuryDefense {
  id: string;
  submissionId: string;
  groupId: string;
  groupName: string;
  tfcTitle: string;
  courseId: string;
  courseName: string;
  advisorId: string;
  advisorName: string;
  defenseDate: string; // ISO string
  roomOrLink: string;
  status: 'agendada' | 'realizada' | 'homologada' | 'cancelada';
  members: JuryMember[];
  suggestedScore?: number;
  finalScore?: number; // 0 to 20
  ataNotes?: string;
  ataDocumentUrl?: string;
  homologatedBy?: string;
  homologatedAt?: string;
  createdAt: string;
}

export interface VirtualLibraryItem {
  id: string;
  submissionId: string;
  title: string;
  theme: string;
  abstract: string;
  authors: string[];
  advisorName: string;
  courseName: string;
  year: number;
  finalScore: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  publishedAt: string;
  downloadsCount: number;
  keywords: string[];
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
  isRead: boolean;
  createdAt: string;
}
