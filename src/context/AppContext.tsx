'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  UserStatus,
  AcademicLevel,
  Course,
  StudentGroup,
  Submission,
  Deadline,
  ChatMessage,
  JuryDefense,
  VirtualLibraryItem,
  SystemNotification,
  SubmissionStage,
  SubmissionStatus
} from '@/types/database';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_GROUPS,
  INITIAL_DEADLINES,
  INITIAL_SUBMISSIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_JURIES,
  INITIAL_LIBRARY_ITEMS,
  INITIAL_NOTIFICATIONS
} from '@/lib/mockData';
import { analyzeDocumentPlagiarism } from '@/lib/plagiarism';
import { recommendJuryPanel } from '@/lib/juryRecommender';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  courses: Course[];
  groups: StudentGroup[];
  deadlines: Deadline[];
  submissions: Submission[];
  chatMessages: ChatMessage[];
  juries: JuryDefense[];
  virtualLibrary: VirtualLibraryItem[];
  notifications: SystemNotification[];
  // Auth & Roles
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  registerUser: (data: Partial<UserProfile> & { password?: string }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  updateUserProfile: (user: UserProfile) => Promise<void>;
  // User Moderation & Deletion (Admin/Coordenação)
  approveStudent: (userId: string) => void;
  rejectStudent: (userId: string, reason?: string) => void;
  deactivateUser: (userId: string) => void;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  // Courses (Admin)
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  assignCourseCoordinator: (courseId: string, coordinatorId: string) => void;
  registerCoordinator: (data: {
    name: string;
    courseId: string;
    phone?: string;
    teacherId?: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  // Deadlines
  addDeadline: (deadline: Omit<Deadline, 'id'>) => void;
  deleteDeadline: (deadlineId: string) => void;
  toggleDeadlineBlocked: (deadlineId: string) => void;
  isSubmissionAllowed: (
    stage: SubmissionStage,
    courseId?: string,
    targetRecipient?: 'coordenacao' | 'orientador'
  ) => { allowed: boolean; reason?: string };
  hasActiveCoordinationDeadline: (stage: SubmissionStage, courseId?: string) => boolean;
  // Submissions
  submitDocument: (params: {
    stage: SubmissionStage;
    title: string;
    theme: string;
    abstract: string;
    file: File;
    targetRecipient?: 'coordenacao' | 'orientador';
  }) => Promise<{ success: boolean; error?: string }>;
  evaluateSubmission: (params: {
    submissionId: string;
    evaluatorRole: 'orientador' | 'coordenador';
    status: 'aprovado_orientador' | 'aprovado_coordenador' | 'alteracoes_solicitadas' | 'reprovado';
    feedback: string;
  }) => void;
  // Advisor Assignment
  reassignAdvisor: (groupId: string, newAdvisorId: string) => void;
  // Chat
  sendMessage: (groupId: string, content: string, fileAttachment?: ChatMessage['fileAttachment']) => void;
  // Jury & Defense
  getJuryRecommendation: (submissionId: string) => ReturnType<typeof recommendJuryPanel>;
  scheduleJury: (data: Omit<JuryDefense, 'id' | 'createdAt'>) => void;
  recordDefenseMinute: (params: {
    juryId: string;
    finalScore: number;
    ataNotes: string;
    homologate: boolean;
  }) => void;
  // Virtual Library
  incrementLibraryDownloads: (itemId: string) => void;
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  // Reset demo
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface DbProfileRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  phone?: string;
  course_id?: string;
  academic_level?: AcademicLevel;
  student_number?: string;
  is_leader?: boolean;
  preferred_advisor_id?: string;
  assigned_advisor_id?: string;
  teacher_id?: string;
  specializations?: string[];
  department?: string;
  max_groups_quota?: number;
  created_at?: string;
}

function mapDbProfileToUserProfile(p: DbProfileRow): UserProfile {
  return {
    id: p.id,
    name: p.name || 'Utilizador',
    email: p.email || '',
    role: p.role || 'estudante',
    status: p.status || 'pendente',
    avatarUrl: p.avatar_url,
    phone: p.phone,
    courseId: p.course_id,
    academicLevel: p.academic_level,
    studentNumber: p.student_number,
    isLeader: p.is_leader,
    preferredAdvisorId: p.preferred_advisor_id,
    assignedAdvisorId: p.assigned_advisor_id,
    teacherId: p.teacher_id,
    specialization: p.specializations || [],
    department: p.department,
    maxGroupsQuota: p.max_groups_quota,
    createdAt: p.created_at || new Date().toISOString()
  };
}

const STORAGE_KEY_PREFIX = 'academictfc_v3_clean_';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null); // Padrão: Desautenticado (Landing page pública)
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [groups, setGroups] = useState<StudentGroup[]>(INITIAL_GROUPS);
  const [deadlines, setDeadlines] = useState<Deadline[]>(INITIAL_DEADLINES);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [juries, setJuries] = useState<JuryDefense[]>(INITIAL_JURIES);
  const [virtualLibrary, setVirtualLibrary] = useState<VirtualLibraryItem[]>(INITIAL_LIBRARY_ITEMS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Sincronização em Tempo Real com Supabase Auth e Tabela profiles
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    // 1. Carregar perfis remotos do Supabase
    const fetchRemoteProfiles = async () => {
      try {
        const { data: dbProfiles, error } = await client.from('profiles').select('*');
        if (!error && dbProfiles && dbProfiles.length > 0) {
          const mapped = (dbProfiles as DbProfileRow[]).map(mapDbProfileToUserProfile);
          setUsers((prev) => {
            const map = new Map<string, UserProfile>();
            prev.forEach((u) => map.set(u.id, u));
            mapped.forEach((u) => map.set(u.id, u));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar perfis do Supabase:', err);
      }
    };

    fetchRemoteProfiles();

    // 2. Carregar cursos reais do Supabase
    const fetchRemoteCourses = async () => {
      try {
        const { data: dbCourses, error } = await client.from('courses').select('*');
        if (!error && dbCourses && dbCourses.length > 0) {
          const mappedCourses: Course[] = dbCourses.map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            department: c.department,
            terminalLevel: c.terminal_level || '13º  Classe (Conclusão)',
            description: c.description || '',
            isActive: c.is_active ?? true,
            createdAt: c.created_at || new Date().toISOString()
          }));
          setCourses(mappedCourses);
        }
      } catch (err) {
        console.warn('Erro ao carregar cursos do Supabase:', err);
      }
    };

    fetchRemoteCourses();

    // 3. Verificar sessão ativa do Supabase Auth
    client.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const mappedUser = mapDbProfileToUserProfile(profile as DbProfileRow);
            setCurrentUser(mappedUser);
          }
        } catch (e) {
          console.warn('Erro ao restaurar sessão ativa do Supabase:', e);
        }
      }
    });

    // 4. Ouvinte de estado de autenticação (Login, Logout, Token renovado)
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const mappedUser = mapDbProfileToUserProfile(profile as DbProfileRow);
            setCurrentUser(mappedUser);
          }
        } catch (e) {
          console.warn('Erro ao sincronizar perfil após login:', e);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers) as UserProfile[];
        const userMap = new Map<string, UserProfile>();
        INITIAL_USERS.forEach((u) => userMap.set(u.id, u));
        parsedUsers.forEach((u) => {
          if (!userMap.has(u.id)) {
            userMap.set(u.id, u);
          }
        });
        const sanitized = Array.from(userMap.values()).map((u) => {
          if (u.role === 'orientador' && (u.email.toLowerCase() === 'zzacariassebastiao000@gmail.com' || u.name.toLowerCase().includes('eugenio'))) {
            return { ...u, status: 'pendente' as const };
          }
          return u;
        });
        setUsers(sanitized);
      } else {
        setUsers(INITIAL_USERS);
      }

      const storedCurrentUserId = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
      if (storedCurrentUserId && storedUsers) {
        const parsedUsers = JSON.parse(storedUsers) as UserProfile[];
        const found = parsedUsers.find((u) => u.id === storedCurrentUserId);
        if (found) {
          if (found.role === 'orientador' && (found.email.toLowerCase() === 'zzacariassebastiao000@gmail.com' || found.name.toLowerCase().includes('eugenio'))) {
            setCurrentUser({ ...found, status: 'pendente' });
          } else {
            setCurrentUser(found);
          }
        }
      }

      const storedCourses = localStorage.getItem(`${STORAGE_KEY_PREFIX}courses`);
      if (storedCourses) {
        const parsedCourses = JSON.parse(storedCourses) as Course[];
        if (parsedCourses.some((c) => c.id.startsWith('course-'))) {
          setCourses(INITIAL_COURSES);
        } else {
          setCourses(parsedCourses);
        }
      }

      const storedGroups = localStorage.getItem(`${STORAGE_KEY_PREFIX}groups`);
      if (storedGroups) setGroups(JSON.parse(storedGroups));

      const storedDeadlines = localStorage.getItem(`${STORAGE_KEY_PREFIX}deadlines`);
      if (storedDeadlines) setDeadlines(JSON.parse(storedDeadlines));

      const storedSubmissions = localStorage.getItem(`${STORAGE_KEY_PREFIX}submissions`);
      if (storedSubmissions) setSubmissions(JSON.parse(storedSubmissions));

      const storedChat = localStorage.getItem(`${STORAGE_KEY_PREFIX}chat`);
      if (storedChat) setChatMessages(JSON.parse(storedChat));

      const storedJuries = localStorage.getItem(`${STORAGE_KEY_PREFIX}juries`);
      if (storedJuries) setJuries(JSON.parse(storedJuries));

      const storedLibrary = localStorage.getItem(`${STORAGE_KEY_PREFIX}library`);
      if (storedLibrary) setVirtualLibrary(JSON.parse(storedLibrary));

      const storedNotifications = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    } catch (e) {
      console.warn('Erro ao carregar dados locais:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
      if (currentUser) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user_id`, currentUser.id);
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);
      }
      localStorage.setItem(`${STORAGE_KEY_PREFIX}courses`, JSON.stringify(courses));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}groups`, JSON.stringify(groups));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}deadlines`, JSON.stringify(deadlines));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}submissions`, JSON.stringify(submissions));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}chat`, JSON.stringify(chatMessages));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}juries`, JSON.stringify(juries));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}library`, JSON.stringify(virtualLibrary));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Erro ao salvar no armazenamento local:', e);
    }
  }, [isLoaded, users, currentUser, courses, groups, deadlines, submissions, chatMessages, juries, virtualLibrary, notifications]);

  // Auth & Session Management
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Procura primeiro na base local/sincronizada
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && (password ? u.password === password : true)
    );

    if (matchedUser) {
      if (matchedUser.status === 'desativado') {
        return { success: false, error: 'Esta conta encontra-se desativada pela coordenação/administração.' };
      }
      setCurrentUser(matchedUser);
      return { success: true };
    }

    // 2. Autenticação Real com Supabase Auth
    if (supabase && password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!authError && authData?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileData) {
            const userProfile = mapDbProfileToUserProfile(profileData as DbProfileRow);
            if (userProfile.status === 'desativado') {
              await supabase.auth.signOut();
              return { success: false, error: 'Esta conta encontra-se desativada pela coordenação/administração.' };
            }
            setCurrentUser(userProfile);
            setUsers((prev) => {
              const exists = prev.some((u) => u.id === userProfile.id);
              return exists ? prev.map((u) => (u.id === userProfile.id ? userProfile : u)) : [userProfile, ...prev];
            });
            return { success: true };
          }
        }
      } catch (err) {
        console.warn('Erro ao autenticar com Supabase Auth:', err);
      }
    }

    const emailMatches = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailMatches) {
      return { success: false, error: 'Palavra-passe incorreta para a conta institucional indicada.' };
    }

    return { success: false, error: 'Utilizador não encontrado com este e-mail institucional.' };
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const registerUser = async (data: Partial<UserProfile> & { password?: string }): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    if (!data.name || !data.email || !data.role) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }

    if (data.role === 'estudante') {
      if (!data.courseId) {
        return { success: false, error: 'É obrigatório selecionar o curso de matrícula.' };
      }
      if (!data.academicLevel?.includes('Terminal') && !data.academicLevel?.includes('13º Classe')) {
        return { 
          success: false, 
          error: 'Restrição de Nível: O acesso ao fluxo de submissão do TFC é exclusivo para estudantes matriculados no ano terminal (13º nível).' 
        };
      }
      if (!data.preferredAdvisorId) {
        return { success: false, error: 'É obrigatório indicar um orientador preferencial ou a opção de atribuição pela Coordenação.' };
      }
    }

    if (data.role === 'orientador') {
      if (!data.courseId) {
        return { success: false, error: 'É obrigatório selecionar o curso de atuação do docente orientador.' };
      }
      if (!data.teacherId) {
        return { success: false, error: 'O orientador deve obrigatoriamente fornecer o seu número de identificação docente.' };
      }
      if (!data.specialization || data.specialization.length === 0) {
        return { success: false, error: 'O orientador deve obrigatoriamente indicar sua área de especialização.' };
      }
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const isInstitutionalEmail = cleanEmail === 'ipuorientacao@gmail.com';
    const isNonInstitutional = !isInstitutionalEmail;

    const courseObj = courses.find((c) => c.id === data.courseId);
    const advisorObj = data.preferredAdvisorId && data.preferredAdvisorId !== 'pendente_coordenacao'
      ? users.find((u) => u.id === data.preferredAdvisorId)
      : undefined;

    const isUuid = (val?: string) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    let validCourseId: string | null = null;
    if (isUuid(data.courseId)) {
      validCourseId = data.courseId!;
    } else {
      const foundMatch = courses.find((c) => isUuid(c.id));
      if (foundMatch) validCourseId = foundMatch.id;
    }

    const validAdvisorId: string | null = isUuid(data.preferredAdvisorId) ? data.preferredAdvisorId! : null;
    let createdUserId = `usr-${Date.now()}`;

    if (supabase && data.password) {
      try {
        const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Supabase network timeout') }), 2000)
        );

        const signUpPromise = supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              name: data.name,
              role: data.role,
              phone: data.phone || null,
              course_id: validCourseId,
              academic_level: data.academicLevel || null,
              student_number: data.studentNumber || `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
              preferred_advisor_id: validAdvisorId,
              teacher_id: data.teacherId || null,
              department: data.department || courseObj?.department || 'Tecnologias',
              specializations: data.specialization || [],
              max_groups_quota: data.role === 'orientador' ? 5 : null,
              is_leader: data.isLeader || false
            }
          }
        });

        const { data: authData, error: authError } = await Promise.race([signUpPromise, timeoutPromise]);
        if (authError) {
          console.warn('Supabase auth signUp status:', authError.message);
        }

        if (authData?.user?.id) {
          createdUserId = authData.user.id;
          try {
            await Promise.race([
              supabase.from('profiles').upsert({
                id: createdUserId,
                email: cleanEmail,
                name: data.name,
                role: data.role,
                status: (data.role === 'estudante' || data.role === 'orientador') ? 'pendente' : 'ativo',
                phone: data.phone || null,
                course_id: validCourseId,
                academic_level: data.academicLevel || null,
                student_number: data.studentNumber || `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                is_leader: data.isLeader || false,
                preferred_advisor_id: validAdvisorId,
                teacher_id: data.teacherId || null,
                department: data.department || courseObj?.department || 'Tecnologias',
                specializations: data.specialization || [],
                max_groups_quota: data.role === 'orientador' ? 5 : null
              }),
              new Promise((resolve) => setTimeout(resolve, 2000))
            ]);
          } catch (e) {
            console.warn('Erro profiles upsert:', e);
          }
        }
      } catch (err: unknown) {
        console.warn('Erro ao registar no Supabase:', err);
      }
    }

    const newUser: UserProfile = {
      id: createdUserId,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      status: (data.role === 'estudante' || data.role === 'orientador') ? 'pendente' : 'ativo',
      phone: data.phone || '',
      courseId: data.courseId,
      courseName: courseObj?.name,
      academicLevel: data.academicLevel,
      studentNumber: data.role === 'estudante' ? (data.studentNumber || `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      preferredAdvisorId: data.preferredAdvisorId,
      assignedAdvisorId: advisorObj?.id,
      assignedAdvisorName: advisorObj ? advisorObj.name : 'Aguardando Atribuição pela Coordenação',
      groupMembers: data.groupMembers,
      teacherId: data.teacherId,
      specialization: data.specialization,
      department: data.department || courseObj?.department || 'Tecnologias',
      maxGroupsQuota: data.role === 'orientador' ? 5 : undefined,
      currentGroupsCount: data.role === 'orientador' ? 0 : undefined,
      isNonInstitutionalEmail: isNonInstitutional,
      emailType: isNonInstitutional ? 'externo_nao_aceite' : 'institucional',
      createdAt: new Date().toISOString()
    };

    if (newUser.role === 'estudante') {
      const newGroup: StudentGroup = {
        id: `group-${Date.now()}`,
        name: `Grupo - ${data.name.split(' ')[0]}`,
        courseId: data.courseId || 'e1a84f3e-2b10-4f9e-8c34-9c5938bf0001',
        courseName: courseObj?.name || 'Curso',
        leaderId: createdUserId,
        leaderName: data.name.trim(),
        memberIds: [createdUserId],
        memberNames: [data.name.trim(), ...(data.groupMembers || [])],
        advisorId: advisorObj?.id,
        advisorName: advisorObj?.name,
        academicYear: '2025/2026',
        createdAt: new Date().toISOString()
      };
      newUser.groupId = newGroup.id;
      newUser.groupName = newGroup.name;
      setGroups((prev) => [newGroup, ...prev]);
    }

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user_id`, newUser.id);
    } catch (e) {
      // ignore
    }

    // Notifica a coordenação se for estudante ou orientador
    if (newUser.role === 'estudante' || newUser.role === 'orientador') {
      const coords = users.filter((u) => u.role === 'coordenador' || u.role === 'admin');
      coords.forEach((coord) => {
        addNotification({
          userId: coord.id,
          title: newUser.role === 'estudante' ? 'Novo Cadastro de Estudante para Moderação' : 'Novo Registo de Orientador para Moderação',
          message: `${newUser.name} solicitou cadastro no sistema como ${newUser.role}. Requer homologação da Coordenação.`,
          type: 'warning',
          link: '/coordenador/contas'
        });
      });
    }

    return { success: true, user: newUser };
  };

  const updateUserProfile = async (updated: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (currentUser?.id === updated.id) {
      setCurrentUser(updated);
    }

    if (supabase && updated.id) {
      try {
        await supabase.from('profiles').update({
          name: updated.name,
          phone: updated.phone || null,
          course_id: updated.courseId || null,
          academic_level: updated.academicLevel || null,
          student_number: updated.studentNumber || null,
          teacher_id: updated.teacherId || null,
          specializations: updated.specialization || [],
          department: updated.department || null,
          max_groups_quota: updated.maxGroupsQuota || null,
        }).eq('id', updated.id);
      } catch (e) {
        console.warn('Erro ao atualizar no Supabase:', e);
      }
    }
  };

  const approveStudent = async (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'ativo' as const } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: 'ativo' } : null));
    }
    if (supabase) {
      try {
        await supabase.from('profiles').update({ status: 'ativo' }).eq('id', userId);
      } catch (e) {
        console.warn('Erro ao aprovar no Supabase:', e);
      }
    }
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      addNotification({
        userId: targetUser.id,
        title: 'Conta Aprovada pela Coordenação! 🎉',
        message: 'O seu cadastro foi homologado com sucesso. Já pode aceder ao fluxo de submissão do Anteprojecto e TFC.',
        type: 'success',
        link: '/tfc/submeter'
      });
    }
  };

  const rejectStudent = async (userId: string, reason?: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'rejeitado' as const } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: 'rejeitado' } : null));
    }
    if (supabase) {
      try {
        await supabase.from('profiles').update({ status: 'rejeitado' }).eq('id', userId);
      } catch (e) {
        console.warn('Erro ao rejeitar no Supabase:', e);
      }
    }
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      addNotification({
        userId: targetUser.id,
        title: 'Registo Não Homologado',
        message: reason || 'A sua inscrição não preencheu os requisitos de matrícula.',
        type: 'alert'
      });
    }
  };

  const deactivateUser = async (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'desativado' as const } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: 'desativado' } : null));
    }
    if (supabase) {
      try {
        await supabase.from('profiles').update({ status: 'desativado' }).eq('id', userId);
      } catch (e) {
        console.warn('Erro ao desativar no Supabase:', e);
      }
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', userId);
      } catch (e) {
        console.warn('Erro ao eliminar no Supabase:', e);
      }
    }

    return { success: true };
  };

  // Admin: Cursos
  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const assignCourseCoordinator = (courseId: string, coordinatorId: string) => {
    const coordUser = users.find((u) => u.id === coordinatorId);
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, coordinatorId, coordinatorName: coordUser?.name }
          : c
      )
    );
    if (coordUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === coordinatorId ? { ...u, courseId } : u))
      );
    }
  };

  const registerCoordinator = async (data: {
    name: string;
    courseId: string;
    phone?: string;
    teacherId?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    if (!data.name?.trim() || !data.courseId) {
      return { success: false, error: 'Preencha o nome completo do coordenador e selecione o respetivo curso.' };
    }

    const courseObj = courses.find((c) => c.id === data.courseId);
    const newId = `usr-coord-${Date.now()}`;
    const coordPassword = data.password?.trim() || 'coord123';
    const institutionalEmail = 'ipuorientacao@gmail.com';

    const newCoordinator: UserProfile = {
      id: newId,
      name: data.name.trim(),
      email: institutionalEmail,
      password: coordPassword,
      role: 'coordenador',
      status: 'ativo',
      phone: data.phone || '',
      courseId: data.courseId,
      courseName: courseObj?.name,
      department: courseObj?.department || 'Ciências e Tecnologias',
      teacherId: data.teacherId?.trim() || `COORD-${Date.now().toString().slice(-4)}`,
      isNonInstitutionalEmail: false,
      emailType: 'institucional',
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: newId,
          email: institutionalEmail,
          name: newCoordinator.name,
          role: 'coordenador',
          status: 'ativo',
          phone: newCoordinator.phone || null,
          course_id: data.courseId,
          department: newCoordinator.department,
          teacher_id: newCoordinator.teacherId
        });
      } catch (e) {
        console.warn('Erro ao salvar coordenador no Supabase:', e);
      }
    }

    setUsers((prev) => [newCoordinator, ...prev]);
    assignCourseCoordinator(data.courseId, newId);

    addNotification({
      userId: 'usr-admin-1',
      title: 'Coordenador Registado com Sucesso',
      message: `${newCoordinator.name} foi registado(a) como Coordenador(a) de ${courseObj?.name || 'Curso'} com o e-mail institucional ${institutionalEmail}.`,
      type: 'success',
      link: '/admin/usuarios'
    });

    return { success: true, user: newCoordinator };
  };

  // Controlo de Prazos
  const addDeadline = (data: Omit<Deadline, 'id'>) => {
    const newDeadline: Deadline = {
      ...data,
      id: `dead-${Date.now()}`
    };
    setDeadlines((prev) => [...prev, newDeadline]);
  };

  const deleteDeadline = (deadlineId: string) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== deadlineId));
  };

  const toggleDeadlineBlocked = (deadlineId: string) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === deadlineId ? { ...d, isBlocked: !d.isBlocked } : d))
    );
  };

  const hasActiveCoordinationDeadline = (stage: SubmissionStage, courseId?: string) => {
    const now = new Date();
    return deadlines.some((d) => {
      const matchStage = d.stage === stage;
      const matchCourse = !courseId || d.courseId === courseId;
      const isCoord = !d.targetScope || d.targetScope === 'coordenacao';
      const notBlocked = !d.isBlocked;
      const notExpired = now <= new Date(d.dueDate);
      return matchStage && matchCourse && isCoord && notBlocked && notExpired;
    });
  };

  const isSubmissionAllowed = (
    stage: SubmissionStage,
    courseId?: string,
    targetRecipient?: 'coordenacao' | 'orientador'
  ) => {
    // Submissão ao orientador: SEMPRE aberta
    if (targetRecipient === 'orientador') {
      return { allowed: true };
    }

    const now = new Date();
    const coordDeadlines = deadlines.filter(
      (d) =>
        d.stage === stage &&
        (!courseId || d.courseId === courseId) &&
        (!d.targetScope || d.targetScope === 'coordenacao')
    );

    if (coordDeadlines.length === 0) {
      return {
        allowed: false,
        reason: 'A Coordenação de Curso ainda não estipulou prazo oficial para esta entrega.'
      };
    }

    const activeDeadline = coordDeadlines.find((d) => !d.isBlocked && now <= new Date(d.dueDate));
    if (!activeDeadline) {
      const blocked = coordDeadlines.find((d) => d.isBlocked);
      if (blocked) {
        return { allowed: false, reason: `Submissão bloqueada pela coordenação: ${blocked.title}` };
      }
      return {
        allowed: false,
        reason: 'Prazo da coordenação encerrado para este período.'
      };
    }

    return { allowed: true };
  };

  // Submissão e Verificação de Plágio
  const submitDocument = async (params: {
    stage: SubmissionStage;
    title: string;
    theme: string;
    abstract: string;
    file: File;
    targetRecipient?: 'coordenacao' | 'orientador';
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Sessão necessária. Por favor, inicie sessão para submeter.' };
    }

    const recipient = params.targetRecipient || 'orientador';
    const deadlineCheck = isSubmissionAllowed(params.stage, currentUser.courseId, recipient);
    if (!deadlineCheck.allowed) {
      return {
        success: false,
        error: deadlineCheck.reason
      };
    }

    const validExtensions = ['.pdf', '.docx'];
    const fileNameLower = params.file.name.toLowerCase();
    const isValidFormat = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!isValidFormat) {
      return {
        success: false,
        error: 'Formato inválido. São aceitos estritamente ficheiros com extensão .pdf ou .docx.'
      };
    }

    const MAX_SIZE_BYTES = 15 * 1024 * 1024;
    if (params.file.size > MAX_SIZE_BYTES) {
      return {
        success: false,
        error: `Tamanho excede o limite. O arquivo possui ${(params.file.size / (1024 * 1024)).toFixed(1)} MB, limite máximo é de 15 MB.`
      };
    }

    const plagiarismReport = analyzeDocumentPlagiarism(
      params.file.name,
      params.title,
      params.theme,
      params.abstract
    );

    const userGroup = groups.find((g) => g.id === currentUser.groupId) || {
      id: currentUser.groupId || `group-${currentUser.id}`,
      name: currentUser.groupName || `${currentUser.name} (Individual)`,
      courseId: currentUser.courseId || 'e1a84f3e-2b10-4f9e-8c34-9c5938bf0001',
      courseName: currentUser.courseName || 'Engenharia Informática',
      leaderId: currentUser.id,
      leaderName: currentUser.name,
      memberIds: [currentUser.id],
      memberNames: currentUser.groupMembers && currentUser.groupMembers.length > 0
        ? [currentUser.name, ...currentUser.groupMembers]
        : [currentUser.name],
      advisorId: currentUser.assignedAdvisorId || currentUser.preferredAdvisorId,
      advisorName: currentUser.assignedAdvisorName,
      academicYear: '2025/2026',
      createdAt: new Date().toISOString()
    };

    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      groupId: userGroup.id,
      groupName: userGroup.name,
      studentId: currentUser.id,
      studentName: currentUser.name,
      courseId: currentUser.courseId || 'e1a84f3e-2b10-4f9e-8c34-9c5938bf0001',
      courseName: currentUser.courseName || 'Engenharia Informática',
      advisorId: userGroup.advisorId,
      advisorName: userGroup.advisorName,
      stage: params.stage,
      targetRecipient: recipient,
      title: params.title,
      theme: params.theme,
      abstract: params.abstract,
      fileName: params.file.name,
      fileSize: params.file.size,
      fileType: fileNameLower.endsWith('.pdf')
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileUrl: URL.createObjectURL(params.file),
      status: 'submetido',
      version: 1,
      plagiarismReport,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    // Notificações
    if (recipient === 'orientador' && userGroup.advisorId) {
      addNotification({
        userId: userGroup.advisorId,
        title: 'Nova Versão para Revisão Contínua',
        message: `O ${userGroup.name} submeteu o ${params.stage === 'anteprojecto' ? 'Anteprojecto' : 'TFC'} ("${params.title}") para sua revisão e parecer.`,
        type: 'info',
        link: '/orientador/orientandos'
      });
    } else if (recipient === 'coordenacao') {
      const coords = users.filter(
        (u) => u.role === 'coordenador' && (!currentUser.courseId || u.courseId === currentUser.courseId)
      );
      coords.forEach((c) => {
        addNotification({
          userId: c.id,
          title: 'Nova Submissão Oficial à Coordenação',
          message: `O ${userGroup.name} submeteu oficialmente o ${params.stage === 'anteprojecto' ? 'Anteprojecto' : 'TFC Final'} para homologação.`,
          type: 'info',
          link: '/coordenador/tfcs'
        });
      });
    }

    return { success: true };
  };

  const evaluateSubmission = (params: {
    submissionId: string;
    evaluatorRole: 'orientador' | 'coordenador';
    status: 'aprovado_orientador' | 'aprovado_coordenador' | 'alteracoes_solicitadas' | 'reprovado';
    feedback: string;
  }) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== params.submissionId) return sub;

        const updated: Submission = {
          ...sub,
          status: params.status,
          updatedAt: new Date().toISOString()
        };

        if (params.evaluatorRole === 'orientador') {
          updated.advisorFeedback = params.feedback;
          updated.advisorEvaluationDate = new Date().toISOString();
        } else {
          updated.coordinatorFeedback = params.feedback;
          updated.coordinatorEvaluationDate = new Date().toISOString();
        }

        addNotification({
          userId: sub.studentId,
          title: `Trabalho Avaliado (${params.evaluatorRole === 'orientador' ? 'Orientador' : 'Coordenação'})`,
          message: `O seu ${sub.stage} recebeu o estado "${params.status.replace('_', ' ').toUpperCase()}". Parecer: "${params.feedback.slice(0, 100)}..."`,
          type: params.status.includes('aprovado') ? 'success' : 'warning',
          link: '/tfc/submissoes'
        });

        return updated;
      })
    );
  };

  const reassignAdvisor = (groupId: string, newAdvisorId: string) => {
    const newAdvisor = users.find((u) => u.id === newAdvisorId);
    if (!newAdvisor) return;

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, advisorId: newAdvisor.id, advisorName: newAdvisor.name }
          : g
      )
    );

    setSubmissions((prev) =>
      prev.map((s) =>
        s.groupId === groupId
          ? { ...s, advisorId: newAdvisor.id, advisorName: newAdvisor.name }
          : s
      )
    );

    const group = groups.find((g) => g.id === groupId);
    if (group) {
      addNotification({
        userId: newAdvisor.id,
        title: 'Nova Atribuição de Orientação (Coordenação)',
        message: `Foi-lhe atribuído o ${group.name} para orientação de TFC.`,
        type: 'info',
        link: '/orientador/orientandos'
      });

      addNotification({
        userId: group.leaderId,
        title: 'Orientador Atribuído / Reatribuído',
        message: `O seu grupo foi atribuído ao docente ${newAdvisor.name} pela Coordenação de Curso.`,
        type: 'info',
        link: '/tfc/orientador'
      });
    }
  };

  const sendMessage = (
    groupId: string,
    content: string,
    fileAttachment?: ChatMessage['fileAttachment']
  ) => {
    if (!currentUser) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatarUrl,
      content,
      fileAttachment,
      createdAt: new Date().toISOString()
    };

    setChatMessages((prev) => [...prev, newMessage]);

    if (currentUser.role === 'estudante') {
      const group = groups.find((g) => g.id === groupId);
      if (group?.advisorId) {
        setTimeout(() => {
          const autoReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            groupId,
            senderId: group.advisorId!,
            senderName: group.advisorName || 'Orientador',
            senderRole: 'orientador',
            content: 'Mensagem recebida com sucesso. Vou analisar as observações e dar feedback brevemente.',
            createdAt: new Date().toISOString()
          };
          setChatMessages((prev) => [...prev, autoReply]);
        }, 1500);
      }
    }
  };

  const getJuryRecommendation = (submissionId: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    return recommendJuryPanel(
      sub?.theme || 'Sistemas e Tecnologias',
      sub?.title || 'Trabalho de Fim de Curso',
      sub?.advisorId || '',
      users
    );
  };

  const scheduleJury = (data: Omit<JuryDefense, 'id' | 'createdAt'>) => {
    const newJury: JuryDefense = {
      ...data,
      id: `jury-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setJuries((prev) => [...prev, newJury]);

    const sub = submissions.find((s) => s.id === data.submissionId);
    if (sub) {
      addNotification({
        userId: sub.studentId,
        title: 'Banca Examinadora Agendada! 🎓',
        message: `Sua defesa foi marcada para ${new Date(data.defenseDate).toLocaleDateString('pt-PT')} às ${new Date(data.defenseDate).toLocaleTimeString('pt-PT')}. Local: ${data.roomOrLink}`,
        type: 'info',
        link: '/tfc/bancas'
      });
    }
  };

  const recordDefenseMinute = (params: {
    juryId: string;
    finalScore: number;
    ataNotes: string;
    homologate: boolean;
  }) => {
    const jury = juries.find((j) => j.id === params.juryId);
    if (!jury) return;

    const submission = submissions.find((s) => s.id === jury.submissionId);
    if (!submission) return;

    setJuries((prev) =>
      prev.map((j) =>
        j.id === params.juryId
          ? {
              ...j,
              finalScore: params.finalScore,
              ataNotes: params.ataNotes,
              status: params.homologate ? 'homologada' : 'realizada',
              homologatedBy: params.homologate && currentUser ? currentUser.id : undefined,
              homologatedAt: params.homologate ? new Date().toISOString() : undefined
            }
          : j
      )
    );

    if (params.homologate) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id
            ? { ...s, status: 'homologado' as const, updatedAt: new Date().toISOString() }
            : s
        )
      );

      const libraryItem: VirtualLibraryItem = {
        id: `lib-${Date.now()}`,
        submissionId: submission.id,
        title: submission.title,
        theme: submission.theme,
        abstract: submission.abstract,
        authors: [submission.studentName],
        advisorName: submission.advisorName || 'Corpo Docente',
        courseName: submission.courseName,
        year: new Date().getFullYear(),
        finalScore: params.finalScore,
        fileUrl: submission.fileUrl,
        fileName: submission.fileName,
        fileSize: submission.fileSize,
        publishedAt: new Date().toISOString(),
        downloadsCount: 0,
        keywords: [submission.theme, submission.courseName, 'TFC Homologado']
      };

      setVirtualLibrary((prev) => [libraryItem, ...prev]);

      addNotification({
        userId: submission.studentId,
        title: 'TFC Homologado e Publicado na Biblioteca Virtual! 🏆',
        message: `Parabéns! A ata de defesa foi homologada com nota final de ${params.finalScore.toFixed(1)} valores. O seu trabalho já se encontra no repositório institucional.`,
        type: 'success',
        link: '/biblioteca'
      });

      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // no-op
      }
    }
  };

  const incrementLibraryDownloads = (itemId: string) => {
    setVirtualLibrary((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, downloadsCount: item.downloadsCount + 1 }
          : item
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
    setCourses(INITIAL_COURSES);
    setGroups(INITIAL_GROUPS);
    setDeadlines(INITIAL_DEADLINES);
    setSubmissions(INITIAL_SUBMISSIONS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setJuries(INITIAL_JURIES);
    setVirtualLibrary(INITIAL_LIBRARY_ITEMS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        courses,
        groups,
        deadlines,
        submissions,
        chatMessages,
        juries,
        virtualLibrary,
        notifications,
        login,
        logout,
        switchUser,
        registerUser,
        updateUserProfile,
        approveStudent,
        rejectStudent,
        deactivateUser,
        deleteUser,
        addCourse,
        assignCourseCoordinator,
        registerCoordinator,
        addDeadline,
        deleteDeadline,
        toggleDeadlineBlocked,
        isSubmissionAllowed,
        hasActiveCoordinationDeadline,
        submitDocument,
        evaluateSubmission,
        reassignAdvisor,
        sendMessage,
        getJuryRecommendation,
        scheduleJury,
        recordDefenseMinute,
        incrementLibraryDownloads,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
}
