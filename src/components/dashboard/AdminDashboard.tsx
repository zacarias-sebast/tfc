'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/shared/Badge';
import { Modal } from '@/components/shared/Modal';
import {
  ShieldCheck,
  BookOpen,
  Users,
  GraduationCap,
  Award,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export function AdminDashboard() {
  const {
    currentUser,
    users,
    courses,
    submissions,
    juries,
    addCourse,
    assignCourseCoordinator,
    registerCoordinator,
    approveStudent,
    rejectStudent,
    deactivateUser,
    resetToDemoData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'users' | 'coordinators'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('Departamento de Ciências da Computação e Tecnologias');
  const [newCourseLevel, setNewCourseLevel] = useState('13º Nível (Terminal)');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Coordinator Modal
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);
  const [coordName, setCoordName] = useState('');
  const [coordCourseId, setCoordCourseId] = useState('');
  const [coordPhone, setCoordPhone] = useState('');
  const [coordTeacherId, setCoordTeacherId] = useState('');
  const [coordPassword, setCoordPassword] = useState('coord123');
  const [coordMsg, setCoordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pendingUsers = users.filter((u) => u.status === 'pendente');
  const activeUsers = users.filter((u) => u.status === 'ativo');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.studentNumber && u.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseCode.trim()) return;

    addCourse({
      name: newCourseName.trim(),
      code: newCourseCode.trim().toUpperCase(),
      department: newCourseDept,
      terminalLevel: newCourseLevel,
      description: newCourseDesc,
      isActive: true
    });

    setNewCourseName('');
    setNewCourseCode('');
    setNewCourseDesc('');
    setIsCourseModalOpen(false);
  };

  const handleRegisterCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordName.trim() || !coordCourseId) return;

    setCoordMsg(null);
    const res = await registerCoordinator({
      name: coordName.trim(),
      courseId: coordCourseId,
      phone: coordPhone.trim(),
      teacherId: coordTeacherId.trim() || `DOC-COORD-${Date.now().toString().slice(-4)}`,
      password: coordPassword
    });

    if (res.success) {
      setCoordMsg({ type: 'success', text: 'Coordenador registado e associado com sucesso ao curso!' });
      setCoordName('');
      setCoordPhone('');
      setCoordTeacherId('');
      setTimeout(() => {
        setIsCoordModalOpen(false);
        setCoordMsg(null);
      }, 1200);
    } else {
      setCoordMsg({ type: 'error', text: res.error || 'Erro ao registar coordenador.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administração Geral & Governança do Sistema</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Painel Central do Administrador
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestão curricular, aprovação de contas de utilizadores e supervisão dos fluxos da PAP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Curso</span>
          </button>
          <button
            onClick={() => setIsCoordModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Coordenador</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Tem a certeza que deseja restaurar todos os dados para o padrão de demonstração?')) {
                resetToDemoData();
              }
            }}
            title="Repor dados de demonstração"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cursos Ativos</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">{courses.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Programas académicos com PAP</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Utilizadores</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">{users.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeUsers.length} ativos • {pendingUsers.length} pendentes
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submissões TFC</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">{submissions.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {submissions.filter((s) => s.status === 'homologado').length} homologados
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bancas de Júri</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">{juries.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Defesas agendadas ou realizadas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Visão Geral & Cursos
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Utilizadores & Moderação</span>
          {pendingUsers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('coordinators')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'coordinators'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Corpo de Coordenação
        </button>
      </div>

      {/* TAB CONTENT: Cursos & Visão Geral */}
      {(activeTab === 'overview' || activeTab === 'courses') && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cursos Registados no Sistema</h3>
                <p className="text-xs text-slate-500">Programas de ensino e respetivos coordenadores</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Código & Nome</th>
                    <th className="px-6 py-3.5">Departamento</th>
                    <th className="px-6 py-3.5">Nível Terminal</th>
                    <th className="px-6 py-3.5">Coordenador Designado</th>
                    <th className="px-6 py-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-blue-900 block">{c.code}</span>
                        <span className="font-semibold text-slate-800 text-sm">{c.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.department}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md bg-slate-100 font-medium text-slate-700">
                          {c.terminalLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.coordinatorName ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>{c.coordinatorName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sem coordenador</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.isActive ? 'ativo' : 'desativado'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Utilizadores & Moderação */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por nome, email ou nº..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="all">Todos os Papéis</option>
                <option value="estudante">Estudantes</option>
                <option value="orientador">Orientadores</option>
                <option value="coordenador">Coordenadores</option>
                <option value="admin">Administradores</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="all">Todos os Estados</option>
                <option value="pendente">Pendentes</option>
                <option value="ativo">Ativos</option>
                <option value="rejeitado">Rejeitados</option>
                <option value="desativado">Desativados</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Nome / Email</th>
                    <th className="px-6 py-3.5">Papel</th>
                    <th className="px-6 py-3.5">Curso / Depto</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5 text-right">Ações de Moderação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Nenhum utilizador encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-sm">{u.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{u.email}</span>
                            {u.isNonInstitutionalEmail && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                                Não Institucional
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {u.courseName || u.department || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5">
                          {u.status === 'pendente' && (
                            <>
                              <button
                                onClick={() => approveStudent(u.id)}
                                title="Aprovar conta"
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovar</span>
                              </button>
                              <button
                                onClick={() => rejectStudent(u.id, 'Critérios de validação não cumpridos.')}
                                title="Rejeitar conta"
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejeitar</span>
                              </button>
                            </>
                          )}
                          {u.status === 'ativo' && u.role !== 'admin' && (
                            <button
                              onClick={() => deactivateUser(u.id)}
                              title="Desativar conta"
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Desativar</span>
                            </button>
                          )}
                          {u.status === 'desativado' && (
                            <button
                              onClick={() => approveStudent(u.id)}
                              title="Reativar conta"
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Reativar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Corpo de Coordenação */}
      {activeTab === 'coordinators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const coord = users.find((u) => u.id === course.coordinatorId);
            return (
              <div
                key={course.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
                      {course.code}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{course.terminalLevel}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1">{course.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">{course.department}</p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Coordenador Atribuído:
                    </span>
                    {coord ? (
                      <div>
                        <div className="font-bold text-slate-800">{coord.name}</div>
                        <div className="text-slate-500 text-[11px]">{coord.email}</div>
                        {coord.phone && <div className="text-slate-500 text-[11px]">{coord.phone}</div>}
                      </div>
                    ) : (
                      <div className="text-amber-600 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Nenhum coordenador associado</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setCoordCourseId(course.id);
                      setIsCoordModalOpen(true);
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    {coord ? 'Alterar / Associar Outro' : '+ Designar Coordenador'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar Novo Curso */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Criar Novo Programa Curricular (Curso)"
        subtitle="Adiciona um novo curso com workflow de Trabalho de Fim de Curso"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome do Curso</label>
            <input
              type="text"
              required
              placeholder="Ex: Engenharia Mecatrónica"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Código do Curso </label>
              <input
                type="text"
                required
                placeholder="Ex: LEM-2026"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Classe de Conclusão</label>
              <select
                value={newCourseLevel}
                onChange={(e) => setNewCourseLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="13º Classe (Conclusão)">13º Classe (Conclusão)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Departamento</label>
            <input
              type="text"
              value={newCourseDept}
              onChange={(e) => setNewCourseDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição</label>
            <textarea
              rows={3}
              placeholder="Breve descrição dos objetivos pedagógicos e metodologias de TFC..."
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Criar Curso
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Registar Coordenador */}
      <Modal
        isOpen={isCoordModalOpen}
        onClose={() => setIsCoordModalOpen(false)}
        title="Registar / Designar Coordenador de Curso"
        subtitle="Regista a conta institucional oficial com e-mail ipuorientacao@gmail.com"
      >
        <form onSubmit={handleRegisterCoordinator} className="space-y-4 text-xs">
          {coordMsg && (
            <div
              className={`p-3 rounded-xl ${
                coordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {coordMsg.text}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo do Docente *</label>
            <input
              type="text"
              required
              placeholder="Ex: Prof. Dr. Armando Sebastião"
              value={coordName}
              onChange={(e) => setCoordName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Curso a Coordenar *</label>
            <select
              required
              value={coordCourseId}
              onChange={(e) => setCoordCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Selecione o Curso...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ID / Matrícula Docente</label>
              <input
                type="text"
                placeholder="Ex: DOC-COORD-03"
                value={coordTeacherId}
                onChange={(e) => setCoordTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone</label>
              <input
                type="text"
                placeholder="+244 9..."
                value={coordPhone}
                onChange={(e) => setCoordPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-900 text-[11px]">
            <strong>Nota Institucional:</strong> A conta de coordenação será criada com o e-mail oficial{' '}
            <code>ipuorientacao@gmail.com</code> e senha padrão <code>{coordPassword}</code>.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCoordModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Registar Coordenador
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
