import { 
  UserProfile, 
  Course, 
  StudentGroup, 
  Submission, 
  Deadline, 
  ChatMessage, 
  JuryDefense, 
  VirtualLibraryItem, 
  SystemNotification 
} from '@/types/database';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'e1a84f3e-2b10-4f9e-8c34-9c5938bf0001',
    code: 'LEI-2026',
    name: 'Engenharia Informática',
    department: 'Departamento de Ciências da Computação e Tecnologias',
    coordinatorId: 'usr-coord-1',
    coordinatorName: 'Prof.ª Dra. Teresa Bento',
    terminalLevel: '13º Nível (Terminal)',
    description: 'Curso com foco em Engenharia de Software, Redes e Sistemas Distribuídos.',
    isActive: true,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'e1a84f3e-2b10-4f9e-8c34-9c5938bf0002',
    code: 'LTR-2026',
    name: 'Telecomunicações e Redes',
    department: 'Departamento de Eletrónica e Telecomunicações',
    coordinatorId: 'usr-coord-2',
    coordinatorName: 'Prof. Dr. Mateus Domingos',
    terminalLevel: '13º Nível (Terminal)',
    description: 'Especialização em Infraestrutura de Redes, Telecomunicações Ópticas, Satélites e IoT.',
    isActive: true,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'e1a84f3e-2b10-4f9e-8c34-9c5938bf0003',
    code: 'LGSI-2026',
    name: 'Gestão de Sistemas de Informação',
    department: 'Departamento de Ciências da Computação e Tecnologias',
    coordinatorId: 'usr-coord-1',
    coordinatorName: 'Prof.ª Dra. Teresa Bento',
    terminalLevel: '13º Nível (Terminal)',
    description: 'Gestão estratégica de TI, Governança e Auditoria de Sistemas.',
    isActive: true,
    createdAt: '2025-01-15T08:00:00Z',
  }
];

// Contas institucionais oficiais com e-mail institucional: ipuorientacao@gmail.com
export const INITIAL_USERS: UserProfile[] = [
  // 1. Administrador 1
  {
    id: 'usr-admin-1',
    name: 'Administrador 1 (Gestão Geral)',
    email: 'ipuorientacao@gmail.com',
    password: 'admin123',
    role: 'admin',
    status: 'ativo',
    phone: '+244 923 000 001',
    department: 'Direção Geral de Tecnologias de Informação',
    isNonInstitutionalEmail: false,
    emailType: 'institucional',
    createdAt: '2025-01-01T08:00:00Z',
  },
  // 2. Administrador 2
  {
    id: 'usr-admin-2',
    name: 'Administrador 2 (Supervisão TFC)',
    email: 'ipuorientacao@gmail.com',
    password: 'admin456',
    role: 'admin',
    status: 'ativo',
    phone: '+244 923 000 002',
    department: 'Gabinete de Supervisão e Auditoria de TFC',
    isNonInstitutionalEmail: false,
    emailType: 'institucional',
    createdAt: '2025-01-01T08:00:00Z',
  },
  // 3. Coordenadora de Curso Inicial
  {
    id: 'usr-coord-1',
    name: 'Prof.ª Dra. Teresa Bento (Coordenação LEI)',
    email: 'ipuorientacao@gmail.com',
    password: 'coord123',
    role: 'coordenador',
    status: 'ativo',
    phone: '+244 912 000 002',
    courseId: 'e1a84f3e-2b10-4f9e-8c34-9c5938bf0001',
    courseName: 'Engenharia Informática',
    department: 'Departamento de Ciências da Computação e Tecnologias',
    teacherId: 'DOC-COORD-01',
    specialization: ['Engenharia de Software', 'Metodologias de Investigação'],
    isNonInstitutionalEmail: false,
    emailType: 'institucional',
    createdAt: '2025-01-05T09:00:00Z',
  }
];

// Prazos Regimentais Oficiais do Calendário Académico
export const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'dead-1',
    title: 'Fase 1: Submissão de Anteprojecto de TFC',
    courseId: 'course-1',
    courseName: 'Engenharia Informática',
    stage: 'anteprojecto',
    startDate: '2026-03-01T00:00:00Z',
    dueDate: '2026-06-30T23:59:59Z',
    description: 'Submissão formal da proposta metodológica, delimitação do tema e cronograma de trabalho.',
    isBlocked: false,
  },
  {
    id: 'dead-2',
    title: 'Fase 2: Relatório de Progresso e Validação Parcial',
    courseId: 'course-1',
    courseName: 'Engenharia Informática',
    stage: 'relatorio_progresso',
    startDate: '2026-07-01T00:00:00Z',
    dueDate: '2026-09-15T23:59:59Z',
    description: 'Apresentação do desenvolvimento prático e primeiros protótipos funcionais com revisão do orientador.',
    isBlocked: false,
  },
  {
    id: 'dead-3',
    title: 'Fase 3: Submissão da Versão Final da Monografia de TFC',
    courseId: 'course-1',
    courseName: 'Engenharia Informática',
    stage: 'tfc_final',
    startDate: '2026-10-01T00:00:00Z',
    dueDate: '2026-12-15T23:59:59Z',
    description: 'Entrega obrigatória da monografia (.docx ou .pdf, max 15MB) para auditoria anti-plágio, avaliação e júri.',
    isBlocked: false,
  }
];

// Dados limpos para testes reais
export const INITIAL_GROUPS: StudentGroup[] = [];
export const INITIAL_SUBMISSIONS: Submission[] = [];
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
export const INITIAL_JURIES: JuryDefense[] = [];
export const INITIAL_LIBRARY_ITEMS: VirtualLibraryItem[] = [];
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];
