'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Course, UserProfile } from '@/types/database';
import { RoleBadge, StatusBadge } from '@/components/shared/Badge';
import { Modal } from '@/components/shared/Modal';
import {
  Settings,
  Plus,
  BookOpen,
  Users,
  ShieldAlert,
  UserCheck,
  Building,
  GraduationCap,
  Layers,
  Search,
  CheckCircle,
  XCircle,
  Database,
  AlertTriangle
} from 'lucide-react';

export function AdminDashboard() {
  const {
    currentUser,
    courses,
    users,
    submissions,
    virtualLibrary,
    addCourse,
    assignCourseCoordinator,
    registerCoordinator,
    deactivateUser,
    approveStudent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cursos' | 'usuarios' | 'estatisticas'>('cursos');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // Add course modal state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDept, setCourseDept] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseTerminalLevel, setCourseTerminalLevel] = useState('13º Nível (Terminal)');

  // Assign coordinator state
  const [selectedCourseForCoord, setSelectedCourseForCoord] = useState<Course | null>(null);
  const [selectedCoordId, setSelectedCoordId] = useState('');

  // Register coordinator modal state
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);
  const [coordName, setCoordName] = useState('');
  const [coordCourseId, setCoordCourseId] = useState('');
  const [coordPassword, setCoordPassword] = useState('coord123');
  const [coordTeacherId, setCoordTeacherId] = useState('');
  const [coordPhone, setCoordPhone] = useState('');
  const [coordSubmitting, setCoordSubmitting] = useState(false);
  const [coordError, setCoordError] = useState('');
  const [createdCoordSuccess, setCreatedCoordSuccess] = useState<{
    name: string;
    email: string;
    password: string;
    courseName?: string;
  } | null>(null);

  if (!currentUser) return null;

  const eligibleCoordinators = users.filter((u) => u.role === 'coordenador');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.studentNumber && u.studentNumber.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.teacherId && u.teacherId.toLowerCase().includes(userSearch.toLowerCase()));

    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName || !courseDept) return;

    addCourse({
      code: courseCode,
      name: courseName,
      department: courseDept,
      description: courseDesc,
      terminalLevel: courseTerminalLevel,
      isActive: true
    });

    setIsCourseModalOpen(false);
    setCourseCode('');
    setCourseName('');
    setCourseDept('');
    setCourseDesc('');
  };

  const handleAssignCoordinator = () => {
    if (!selectedCourseForCoord || !selectedCoordId) return;
    assignCourseCoordinator(selectedCourseForCoord.id, selectedCoordId);
    setSelectedCourseForCoord(null);
    setSelectedCoordId('');
  };

  const handleCreateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordName.trim()) {
      setCoordError('Indique o nome completo do docente.');
      return;
    }
    if (!coordCourseId) {
      setCoordError('Selecione o curso que o docente irá coordenar.');
      return;
    }

    setCoordSubmitting(true);
    setCoordError('');

    try {
      const res = await registerCoordinator({
        name: coordName.trim(),
        courseId: coordCourseId,
        password: coordPassword?.trim() || 'coord123',
        teacherId: coordTeacherId,
        phone: coordPhone
      });

      if (res.success && res.user) {
        setCreatedCoordSuccess({
          name: res.user.name,
          email: res.user.email,
          password: coordPassword?.trim() || 'coord123',
          courseName: res.user.courseName
        });
        setCoordName('');
        setCoordCourseId('');
        setCoordTeacherId('');
        setCoordPhone('');
        setCoordPassword('coord123');
      } else {
        setCoordError(res.error || 'Erro ao cadastrar coordenador.');
      }
    } catch (err: unknown) {
      setCoordError('Erro inesperado ao cadastrar coordenador.');
    } finally {
      setCoordSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Administração-Geral do Sistema (Admin)
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {currentUser.name}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Gestão de Cursos, Perfis & Parâmetros do Sistema
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuração autónoma de cursos, atribuição de coordenadores e controlo global de utilizadores (RF01).
          </p>
        </div>

        <button
          onClick={() => setIsCourseModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Curso</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('cursos')}
          className={`pb-3 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === 'cursos'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cursos & Coordenação</span>
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`pb-3 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === 'usuarios'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestão de Perfis & Contas</span>
        </button>

        <button
          onClick={() => setActiveTab('estatisticas')}
          className={`pb-3 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === 'estatisticas'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Database className="w-4 h-4" />
          <span>Métricas Globais do Sistema</span>
        </button>
      </div>

      {/* TAB 1: CURSOS */}
      {activeTab === 'cursos' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Cursos Registados</h3>
              <p className="text-xs text-slate-500">
                Atribua coordenadores e configure o nível terminal obrigatório
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <div key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {course.code}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{course.name}</span>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      {course.terminalLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{course.description}</p>
                  <p className="text-xs text-slate-500">
                    Departamento: <strong className="text-slate-700">{course.department}</strong> • Coordenador:{' '}
                    <span className="text-blue-700 font-bold">
                      {course.coordinatorName || 'Pendente de atribuição'}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCourseForCoord(course)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Atribuir Coordenador</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GESTÃO DE UTILIZADORES (RF01) */}
      {activeTab === 'usuarios' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Diretório de Utilizadores (RF01)
              </h3>
              <p className="text-xs text-slate-500">
                Ativação, edição e desativação de estudantes, orientadores e coordenadores
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setCoordError('');
                  setCreatedCoordSuccess(null);
                  setIsCoordModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>Cadastrar Coordenador</span>
              </button>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-blue-500"
              >
                <option value="todos">Todos os Perfis</option>
                <option value="estudante">Estudantes</option>
                <option value="orientador">Orientadores</option>
                <option value="coordenador">Coordenadores</option>
                <option value="admin">Administradores</option>
              </select>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Pesquisar por nome..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{user.name}</span>
                      <RoleBadge role={user.role} />
                      <StatusBadge status={user.status} />
                      {user.isNonInstitutionalEmail && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          E-mail Não Institucional (Pendente)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{user.email} • {user.courseName || user.department}</p>
                    {user.specialization && (
                      <p className="text-[10px] text-slate-400">
                        Especializações: {user.specialization.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {user.status === 'ativo' ? (
                    <button
                      onClick={() => deactivateUser(user.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Desativar
                    </button>
                  ) : user.status === 'pendente' ? (
                    <button
                      onClick={() => approveStudent(user.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Aprovar
                    </button>
                  ) : (
                    <button
                      onClick={() => approveStudent(user.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reativar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ESTATÍSTICAS GLOBAIS */}
      {activeTab === 'estatisticas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Total de Utilizadores
            </span>
            <span className="text-3xl font-black text-slate-800">{users.length}</span>
            <p className="text-xs text-slate-400 mt-2">
              {users.filter(u => u.role === 'estudante').length} Estudantes, {users.filter(u => u.role === 'orientador').length} Professores
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Submissões Ativas
            </span>
            <span className="text-3xl font-black text-blue-600">{submissions.length}</span>
            <p className="text-xs text-slate-400 mt-2">
              Processos em fluxo de auditoria e revisão
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Biblioteca Virtual (TFCs)
            </span>
            <span className="text-3xl font-black text-purple-600">{virtualLibrary.length}</span>
            <p className="text-xs text-slate-400 mt-2">
              Trabalhos homologados com ata final
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Cursos Matriculados
            </span>
            <span className="text-3xl font-black text-teal-600">{courses.length}</span>
            <p className="text-xs text-slate-400 mt-2">
              Departamentos com workflow ativo
            </p>
          </div>
        </div>
      )}

      {/* Modal Criar Novo Curso */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Cadastrar Novo Curso (Admin)"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código do Curso:</label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="Ex: LEI-2026"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nível Terminal (RN01):</label>
              <input
                type="text"
                required
                value={courseTerminalLevel}
                onChange={(e) => setCourseTerminalLevel(e.target.value)}
                placeholder="13º Nível (Terminal)"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Curso:</label>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Ex: Engenharia Informática e Telecomunicações"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Departamento:</label>
            <input
              type="text"
              required
              value={courseDept}
              onChange={(e) => setCourseDept(e.target.value)}
              placeholder="Ex: Departamento de Ciências da Computação"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Curso:</label>
            <textarea
              rows={2}
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
              placeholder="Ementa e objetivos gerais da formação..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Salvar Curso
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Atribuir Coordenador ao Curso */}
      <Modal
        isOpen={Boolean(selectedCourseForCoord)}
        onClose={() => setSelectedCourseForCoord(null)}
        title="Atribuir Coordenador de Curso"
        subtitle={`Curso: ${selectedCourseForCoord?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Selecione o Coordenador:
            </label>
            <select
              value={selectedCoordId}
              onChange={(e) => setSelectedCoordId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            >
              <option value="">Selecione um docente com perfil de coordenação...</option>
              {eligibleCoordinators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedCourseForCoord(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedCoordId}
              onClick={handleAssignCoordinator}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Confirmar Atribuição
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Cadastrar Coordenador de Curso (RF01) */}
      <Modal
        isOpen={isCoordModalOpen}
        onClose={() => {
          setIsCoordModalOpen(false);
          setCreatedCoordSuccess(null);
          setCoordError('');
        }}
        title="Cadastrar Novo Coordenador de Curso"
        subtitle="Atribuição oficial de credenciais com e-mail institucional (ipuorientacao@gmail.com)"
      >
        {createdCoordSuccess ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Coordenador Cadastrado e Credenciais Atribuídas!</span>
              </div>
              <p className="text-xs text-slate-600">
                O coordenador foi criado no sistema com sucesso. As credenciais de acesso para a tela de login são:
              </p>
              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Nome do Coordenador:</span>
                  <span className="font-bold text-slate-800">{createdCoordSuccess.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Curso Coordenado:</span>
                  <span className="font-bold text-slate-800">{createdCoordSuccess.courseName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-medium">E-mail Institucional de Login:</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {createdCoordSuccess.email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Palavra-passe Atribuída:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {createdCoordSuccess.password}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                O coordenador pode agora aceder à tela de Login com este e-mail e palavra-passe para validar inscrições e gerir os TFCs.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCoordModalOpen(false);
                  setCreatedCoordSuccess(null);
                }}
                className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCoordinator} className="space-y-4">
            {coordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{coordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome Completo do Docente:*
              </label>
              <input
                type="text"
                required
                value={coordName}
                onChange={(e) => setCoordName(e.target.value)}
                placeholder="Ex: Prof. Dr. Armando Ferreira"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Curso que irá Coordenar:*
              </label>
              <select
                required
                value={coordCourseId}
                onChange={(e) => setCoordCourseId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
              >
                <option value="">Selecione o curso...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - {c.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mail Institucional:
                </label>
                <input
                  type="email"
                  disabled
                  value="ipuorientacao@gmail.com"
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  E-mail institucional único fixo
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Palavra-passe de Acesso:*
                </label>
                <input
                  type="text"
                  required
                  value={coordPassword}
                  onChange={(e) => setCoordPassword(e.target.value)}
                  placeholder="coord123"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Credencial fornecida pelo administrador
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nº de Identificação Docente:
                </label>
                <input
                  type="text"
                  value={coordTeacherId}
                  onChange={(e) => setCoordTeacherId(e.target.value)}
                  placeholder="Ex: DOC-COORD-2026"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telefone de Contacto:
                </label>
                <input
                  type="tel"
                  value={coordPhone}
                  onChange={(e) => setCoordPhone(e.target.value)}
                  placeholder="+244 9..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCoordModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={coordSubmitting}
                className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {coordSubmitting ? 'A registar...' : 'Atribuir Credenciais & Cadastrar'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
