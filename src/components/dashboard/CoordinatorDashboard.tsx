'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/shared/Badge';
import { PlagiarismBadge } from '@/components/shared/PlagiarismModal';
import { Modal } from '@/components/shared/Modal';
import { Submission, SubmissionStage, Deadline } from '@/types/database';
import {
  ShieldCheck,
  CalendarClock,
  BookMarked,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Lock,
  Unlock,
  AlertTriangle,
  FileCheck2,
  ChevronRight,
  ArrowRight,
  Trash2
} from 'lucide-react';

interface CoordinatorDashboardProps {
  onNavigateToJuries?: () => void;
}

export function CoordinatorDashboard({ onNavigateToJuries }: CoordinatorDashboardProps) {
  const {
    currentUser,
    users,
    courses,
    submissions,
    deadlines,
    approveStudent,
    rejectStudent,
    deactivateUser,
    addDeadline,
    deleteDeadline,
    toggleDeadlineBlocked,
    evaluateSubmission,
    reassignAdvisor
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending_accounts' | 'tfcs' | 'deadlines'>('pending_accounts');

  // Modal Avaliação
  const [selectedSubForCoord, setSelectedSubForCoord] = useState<Submission | null>(null);
  const [coordDecision, setCoordDecision] = useState<'aprovado_coordenador' | 'alteracoes_solicitadas' | 'reprovado'>('aprovado_coordenador');
  const [coordFeedback, setCoordFeedback] = useState('');

  // Modal Novo Prazo
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [deadlineStage, setDeadlineStage] = useState<SubmissionStage>('anteprojecto');
  const [deadlineStartDate, setDeadlineStartDate] = useState('');
  const [deadlineDueDate, setDeadlineDueDate] = useState('');
  const [deadlineDesc, setDeadlineDesc] = useState('');

  // Modal Confirmação Eliminar Prazo
  const [deletingDeadline, setDeletingDeadline] = useState<Deadline | null>(null);

  if (!currentUser) return null;

  // Filter students and advisors
  const pendingAccounts = users.filter((u) => u.status === 'pendente');
  const courseSubmissions = submissions.filter(
    (s) => !currentUser.courseId || s.courseId === currentUser.courseId
  );
  const availableAdvisors = users.filter((u) => u.role === 'orientador' && u.status === 'ativo');

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadlineTitle.trim() || !deadlineStartDate || !deadlineDueDate) return;

    addDeadline({
      title: deadlineTitle.trim(),
      courseId: currentUser.courseId || 'course-1',
      courseName: currentUser.courseName || 'Engenharia Informática',
      stage: deadlineStage,
      startDate: new Date(deadlineStartDate).toISOString(),
      dueDate: new Date(deadlineDueDate).toISOString(),
      description: deadlineDesc.trim(),
      isBlocked: false,
      advisorId: currentUser.id,
      advisorName: currentUser.name
    });

    setDeadlineTitle('');
    setDeadlineDesc('');
    setIsDeadlineModalOpen(false);
  };

  const handleSaveCoordEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForCoord) return;

    evaluateSubmission({
      submissionId: selectedSubForCoord.id,
      evaluatorRole: 'coordenador',
      status: coordDecision,
      feedback: coordFeedback
    });

    setSelectedSubForCoord(null);
    setCoordFeedback('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
            <BookMarked className="w-4 h-4" />
            <span>Coordenação de Curso • {currentUser.courseName || 'Departamento Académico'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Painel da Coordenação Pedagógica
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Validação de matrículas, supervisão de relatórios de PAP, controlo de prazos e bancas de defesa.
          </p>
        </div>

        {onNavigateToJuries && (
          <button
            onClick={onNavigateToJuries}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer w-full sm:w-auto shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>Gestão de Bancas & Júris</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contas a Validar
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-3">{pendingAccounts.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Estudantes e orientadores pendentes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              TFCs do Curso
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">{courseSubmissions.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Documentos e anteprojectos registados</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Prazos Ativos
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">{deadlines.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Prazos de submissão calendarizados</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('pending_accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'pending_accounts'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Validação de Contas</span>
          {pendingAccounts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
              {pendingAccounts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('tfcs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'tfcs'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Gestão de PAP & Pareceres
        </button>
        <button
          onClick={() => setActiveTab('deadlines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'deadlines'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Controlo de Prazos
        </button>
      </div>

      {/* TAB 1: Validação de Contas */}
      {activeTab === 'pending_accounts' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Contas de Estudantes e Orientadores em Espera de Homologação
            </h3>
            <p className="text-xs text-slate-500">
              Conforme o regulamento, contas com e-mails externos não institucionais não devem ser validadas.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingAccounts.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-bold text-slate-700">Todas as contas foram revistas e validadas!</p>
                <p className="text-xs mt-0.5">Nenhuma inscrição pendente no momento.</p>
              </div>
            ) : (
              pendingAccounts.map((u) => (
                <div key={u.id} className="p-5 hover:bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                      <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                      {u.isNonInstitutionalEmail && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>E-mail Não Institucional</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Email: <strong>{u.email}</strong></span>
                      {u.studentNumber && <span>Nº Estudante: {u.studentNumber}</span>}
                      {u.academicLevel && <span>Nível: {u.academicLevel}</span>}
                      {u.courseName && <span>Curso: {u.courseName}</span>}
                      {u.teacherId && <span>Matrícula Docente: {u.teacherId}</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => approveStudent(u.id)}
                      className="flex-1 sm:flex-initial justify-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Homologar Conta</span>
                    </button>
                    <button
                      onClick={() => rejectStudent(u.id, 'Inscrição recusada pelo Coordenador.')}
                      className="flex-1 sm:flex-initial justify-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Recusar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Gestão de TFCs & Pareceres */}
      {activeTab === 'tfcs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Processos e Submissões da PAP do Curso
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhamento de relatórios, atribuição de orientadores e validação pré-júri
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {courseSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="font-bold text-slate-700">Ainda não há submissões registadas para este curso.</p>
              </div>
            ) : (
              courseSubmissions.map((sub) => (
                <div key={sub.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {sub.stage}
                        </span>
                        <StatusBadge status={sub.status} />
                        <PlagiarismBadge report={sub.plagiarismReport} size="sm" />
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{sub.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{sub.abstract}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="font-semibold text-slate-800">Autor: {sub.studentName}</span>
                        <span>
                          Orientador:{' '}
                          <strong className="text-slate-800">
                            {sub.advisorName || 'Não atribuído'}
                          </strong>
                        </span>
                        <span>Ficheiro: {sub.fileName}</span>
                      </div>

                      {/* Reatribuir orientador */}
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs text-slate-500 font-semibold">Alterar Orientador:</span>
                        <select
                          value={sub.advisorId || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              reassignAdvisor(sub.groupId, e.target.value);
                            }
                          }}
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                        >
                          <option value="">Selecione orientador...</option>
                          {availableAdvisors.map((adv) => (
                            <option key={adv.id} value={adv.id}>
                              {adv.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedSubForCoord(sub);
                          setCoordFeedback(sub.coordinatorFeedback || '');
                        }}
                        className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Validar Coordenação</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Controlo de Prazos */}
      {activeTab === 'deadlines' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsDeadlineModalOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Prazo Oficial</span>
            </button>
          </div>

          {deadlines.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-xs">
              <CalendarClock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700">Nenhum prazo calendarizado no momento.</p>
              <p className="text-xs mt-0.5">Clique em "Criar Novo Prazo Oficial" para definir datas para os estudantes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deadlines.map((d) => (
                <div
                  key={d.id}
                  className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {d.stage}
                      </span>
                      <button
                        onClick={() => toggleDeadlineBlocked(d.id)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          d.isBlocked
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {d.isBlocked ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Bloqueado</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Aberto</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1">{d.title}</h4>
                    <p className="text-xs text-slate-500 mb-4">{d.description}</p>

                    <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Início:</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(d.startDate).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Limite:</span>
                        <span className="font-bold text-rose-700">
                          {new Date(d.dueDate).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="truncate max-w-[130px]" title={d.courseName}>{d.courseName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDeadlineBlocked(d.id)}
                        className="text-blue-700 hover:text-blue-900 font-bold cursor-pointer"
                      >
                        {d.isBlocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                      <span className="text-slate-200">|</span>
                      <button
                        onClick={() => setDeletingDeadline(d)}
                        className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer flex items-center gap-1 hover:bg-rose-50 px-2 py-0.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Criar Prazo */}
      <Modal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        title="Calendarizar Prazo de Submissão de PAP"
        subtitle="Define início e fim com controlo automático de bloqueio no sistema"
      >
        <form onSubmit={handleCreateDeadline} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Título do Prazo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Fase 1: Entrega de Anteprojecto 2026"
              value={deadlineTitle}
              onChange={(e) => setDeadlineTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Fase/Etapa *</label>
            <select
              value={deadlineStage}
              onChange={(e) => setDeadlineStage(e.target.value as SubmissionStage)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="anteprojecto">Fase 1: Anteprojecto da PAP</option>
              <option value="relatorio_progresso">Fase 2: Relatório de Progresso da PAP</option>
              <option value="tfc_final">Fase 3: Versão Final da PAP</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data de Início *</label>
              <input
                type="date"
                required
                value={deadlineStartDate}
                onChange={(e) => setDeadlineStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data Limite *</label>
              <input
                type="date"
                required
                value={deadlineDueDate}
                onChange={(e) => setDeadlineDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Instruções para os Estudantes</label>
            <textarea
              rows={3}
              placeholder="Critérios regimentais, normas ABNT/IEEE ou directrizes específicas..."
              value={deadlineDesc}
              onChange={(e) => setDeadlineDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeadlineModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Publicar Prazo
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Parecer Coordenação */}
      <Modal
        isOpen={!!selectedSubForCoord}
        onClose={() => setSelectedSubForCoord(null)}
        title="Validação & Parecer da Coordenação do Curso"
        subtitle={selectedSubForCoord ? `${selectedSubForCoord.title} • Estudante: ${selectedSubForCoord.studentName}` : ''}
      >
        <form onSubmit={handleSaveCoordEvaluation} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Decisão da Coordenação *</label>
            <select
              value={coordDecision}
              onChange={(e) =>
                setCoordDecision(
                  e.target.value as 'aprovado_coordenador' | 'alteracoes_solicitadas' | 'reprovado'
                )
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="aprovado_coordenador">Aprovar Trabalho (Habilitar para Banca de Júri)</option>
              <option value="alteracoes_solicitadas">Solicitar Revisões Metodológicas</option>
              <option value="reprovado">Reprovar Proposta</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Parecer Institucional *</label>
            <textarea
              required
              rows={4}
              placeholder="Descreva as orientações pedagógicas, deferimento para defesa pública ou apontamentos..."
              value={coordFeedback}
              onChange={(e) => setCoordFeedback(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedSubForCoord(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Confirmar Decisão
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmação de Eliminação de Prazo */}
      <Modal
        isOpen={!!deletingDeadline}
        onClose={() => setDeletingDeadline(null)}
        title="Eliminar Prazo Oficial"
        subtitle="Confirmação de remoção de prazo do calendário"
        maxWidth="max-w-md"
      >
        {deletingDeadline && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <h4 className="font-extrabold text-sm text-rose-950">
                    Tem a certeza que deseja eliminar este prazo?
                  </h4>
                  <p className="text-rose-700 text-[11px] mt-0.5 leading-relaxed">
                    Esta ação removerá o prazo do calendário oficial e atualizará as permissões de submissão dos estudantes.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-200/80 space-y-1.5 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {deletingDeadline.stage}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {deletingDeadline.courseName}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs pt-0.5">
                    "{deletingDeadline.title}"
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 flex justify-between border-t border-slate-100">
                    <span>Limite: <strong className="text-rose-700">{new Date(deletingDeadline.dueDate).toLocaleDateString('pt-PT')}</strong></span>
                    <span>Início: {new Date(deletingDeadline.startDate).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingDeadline(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-center transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingDeadline) {
                    deleteDeadline(deletingDeadline.id);
                    setDeletingDeadline(null);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Eliminar Prazo</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
