'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserProfile, Submission } from '@/types/database';
import { StatusBadge } from '@/components/shared/Badge';
import { PlagiarismBadge } from '@/components/shared/PlagiarismModal';
import { Modal } from '@/components/shared/Modal';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  UserCheck,
  CalendarClock,
  Award,
  BookOpen,
  Search,
  Filter,
  AlertTriangle,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CoordinatorDashboardProps {
  onNavigateToJuries: () => void;
}

export function CoordinatorDashboard({ onNavigateToJuries }: CoordinatorDashboardProps) {
  const {
    currentUser,
    users,
    submissions,
    deadlines,
    groups,
    approveStudent,
    rejectStudent,
    reassignAdvisor,
    toggleDeadlineBlocked,
    addDeadline,
    evaluateSubmission
  } = useApp();

  const [activeTab, setActiveTab] = useState<'contas' | 'tfcs' | 'prazos'>('contas');
  const [searchTerm, setSearchTerm] = useState('');

  // Reassign Advisor state
  const [selectedGroupForReassign, setSelectedGroupForReassign] = useState<string | null>(null);
  const [newAdvisorId, setNewAdvisorId] = useState('');

  // Reject modal state
  const [rejectModalUser, setRejectModalUser] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // New Deadline modal state
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [deadlineStage, setDeadlineStage] = useState<'anteprojecto' | 'relatorio_progresso' | 'tfc_final'>('tfc_final');
  const [deadlineDueDate, setDeadlineDueDate] = useState('');
  const [deadlineDesc, setDeadlineDesc] = useState('');

  // Store client time to avoid SSR/prerender mismatch
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  React.useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  if (!currentUser) return null;

  // Filter students and advisors pending moderation (RF02)
  const pendingStudents = users.filter(
    (u) => (u.role === 'estudante' || u.role === 'orientador') && u.status === 'pendente'
  );

  const activeAdvisors = users.filter(
    (u) => u.role === 'orientador' && u.status === 'ativo'
  );

  const handleReassignSubmit = () => {
    if (!selectedGroupForReassign || !newAdvisorId) return;
    reassignAdvisor(selectedGroupForReassign, newAdvisorId);
    setSelectedGroupForReassign(null);
    setNewAdvisorId('');
  };

  const handleConfirmReject = () => {
    if (!rejectModalUser) return;
    rejectStudent(rejectModalUser.id, rejectReason || 'Inscrição rejeitada por não conformidade dos requisitos.');
    setRejectModalUser(null);
    setRejectReason('');
  };

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadlineTitle || !deadlineDueDate) return;

    addDeadline({
      title: deadlineTitle,
      stage: deadlineStage,
      courseId: currentUser.courseId || 'course-1',
      courseName: currentUser.courseName || 'Engenharia Informática',
      startDate: new Date().toISOString(),
      dueDate: new Date(deadlineDueDate).toISOString(),
      description: deadlineDesc,
      isBlocked: false
    });

    setIsAddDeadlineOpen(false);
    setDeadlineTitle('');
    setDeadlineDueDate('');
    setDeadlineDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Coordinator Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Coordenação de Curso • {currentUser.courseName || 'Engenharia Informática'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {currentUser.name}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Painel da Coordenação Académica
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisão e homologação do fluxo de TFCs, moderação de estudantes e cumprimento de prazos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToJuries}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Gestão de Bancas & Homologação </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('contas')}
          className={`pb-3 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === 'contas'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Validação de Contas </span>
          {pendingStudents.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {pendingStudents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tfcs')}
          className={`pb-3 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === 'tfcs'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Gestão Global de TFCs</span>
        </button>

        <button
          onClick={() => setActiveTab('prazos')}
          className={`pb-3 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === 'prazos'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Controlo de Prazos </span>
        </button>
      </div>

      {/* TAB 1: VALIDAÇÃO DE CONTAS (RF02) - Screenshot "Tela do Coordenador - Validar Contas" */}
      {activeTab === 'contas' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Moderação de Inscrições Académicas
              </h3>
              <p className="text-xs text-slate-500">
                Aprovação prévia obrigatória para Estudantes (RN01) e Docentes Orientadores (RN02)
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              {pendingStudents.length} pendentes para decisão
            </span>
          </div>

          {pendingStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Todas as contas foram validadas!</p>
              <p className="text-xs text-slate-400 mt-1">
                Não existem inscrições de estudantes ou orientadores aguardando moderação no momento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingStudents.map((stud) => (
                <div key={stud.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{stud.name}</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pendente
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        stud.role === 'orientador'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {stud.role === 'orientador' ? 'Docente Orientador' : 'Estudante'}
                      </span>
                      {stud.studentNumber && (
                        <span className="text-xs font-semibold text-slate-500">
                          {stud.studentNumber}
                        </span>
                      )}
                      {stud.isNonInstitutionalEmail || stud.email.toLowerCase() !== 'ipuorientacao@gmail.com' ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-300">
                          ⚠️ E-mail Não Institucional (Não aceite - Pendente Permanente)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                          ✓ E-mail Institucional Válido
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      {stud.role === 'estudante' ? (
                        <>
                          <span><strong>Curso:</strong> {stud.courseName || 'Engenharia Informática'}</span>
                          <span><strong>Nível Académico:</strong> <span className="text-blue-700 font-semibold">{stud.academicLevel || '13º Classe'}</span></span>
                        </>
                      ) : (
                        <>
                          <span><strong>Curso de Afiliação:</strong> {stud.courseName || 'Ciências e Tecnologias'}</span>
                          <span><strong>Identificação Docente:</strong> {stud.teacherId || 'N/A'}</span>
                          <span><strong>Especializações:</strong> {stud.specialization?.join(', ') || 'N/A'}</span>
                          <span><strong>Departamento:</strong> {stud.department || 'Tecnologias'}</span>
                        </>
                      )}
                      <span><strong>Email:</strong> {stud.email}</span>
                      <span><strong>Telefone:</strong> {stud.phone || 'N/A'}</span>
                    </div>

                    {stud.role === 'estudante' && (
                      <div className="text-xs text-slate-500">
                        <strong>Orientador Preferencial Solicitado:</strong>{' '}
                        {stud.assignedAdvisorName || 'Aguardando indicação'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setRejectModalUser(stud)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Rejeitar</span>
                    </button>

                    <button
                      onClick={() => approveStudent(stud.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aprovar Conta </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GESTÃO DE TFCS & REATRIBUIÇÃO (RF04, RF06) */}
      {activeTab === 'tfcs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Acompanhamento e Atribuição de Orientadores
              </h3>
              <p className="text-xs text-slate-500">
                Consulte as propostas, reatribua professores e aprove trabalhos
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar trabalhos..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {sub.groupName}
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {sub.stage === 'anteprojecto' ? 'Anteprojecto' : 'TFC Final'}
                      </span>
                      <StatusBadge status={sub.status} />
                      {sub.plagiarismReport && (
                        <PlagiarismBadge report={sub.plagiarismReport} size="sm" />
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800">{sub.title}</h4>
                    <p className="text-xs text-slate-600">
                      <strong>Orientador Atual:</strong>{' '}
                      <span className="text-indigo-700 font-semibold">{sub.advisorName || 'Não atribuído'}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Submetido em: {new Date(sub.submittedAt).toLocaleString('pt-PT')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Botão de Reatribuição (RF06) */}
                    <button
                      onClick={() => setSelectedGroupForReassign(sub.groupId)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reatribuir Orientador</span>
                    </button>

                    {/* Botão Homologar Coordenação */}
                    {sub.status === 'aprovado_orientador' && (
                      <button
                        onClick={() =>
                          evaluateSubmission({
                            submissionId: sub.id,
                            evaluatorRole: 'coordenador',
                            status: 'aprovado_coordenador',
                            feedback: 'Trabalho homologado pela coordenação para constituição de júri.'
                          })
                        }
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Homologar para Júri</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTROLO DE PRAZOS (RF05) */}
      {activeTab === 'prazos' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Prazos Limite & Bloqueio de Envios em Atraso (RF05)
              </h3>
              <p className="text-xs text-slate-500">
                Controle datas limites para impedir submissões fora do calendário académico
              </p>
            </div>

            <button
              onClick={() => setIsAddDeadlineOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Prazo</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {deadlines.map((dl) => {
              const due = new Date(dl.dueDate);
              const isPast = currentTime ? currentTime > due.getTime() : false;
              return (
                <div key={dl.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{dl.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${dl.isBlocked
                          ? 'bg-rose-100 text-rose-800'
                          : isPast
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                        {dl.isBlocked ? 'BLOQUEADO' : isPast ? 'EXPIRADO' : 'EM ABERTO'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{dl.description}</p>
                    <p className="text-xs text-slate-400">
                      Data Limite: <strong className="text-slate-700">{due.toLocaleDateString('pt-PT')} às {due.toLocaleTimeString('pt-PT')}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleDeadlineBlocked(dl.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${dl.isBlocked
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                    >
                      {dl.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{dl.isBlocked ? 'Desbloquear Envios' : 'Bloquear Envios (RF05)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Reatribuição de Orientador (RF06) */}
      <Modal
        isOpen={Boolean(selectedGroupForReassign)}
        onClose={() => setSelectedGroupForReassign(null)}
        title="Atribuir ou Reatribuir Orientador (RF06)"
        subtitle="O orientador anterior e os estudantes serão notificados automaticamente."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Selecione o Novo Orientador:
            </label>
            <select
              value={newAdvisorId}
              onChange={(e) => setNewAdvisorId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            >
              <option value="">Selecione um docente ativo...</option>
              {activeAdvisors.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.name} — ({adv.specialization?.join(', ') || 'Docente'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedGroupForReassign(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleReassignSubmit}
              disabled={!newAdvisorId}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Confirmar Reatribuição (RF06)
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Rejeição de Cadastro (RF02) */}
      <Modal
        isOpen={Boolean(rejectModalUser)}
        onClose={() => setRejectModalUser(null)}
        title="Rejeitar Cadastro de Estudante (RF02)"
        subtitle={`Estudante: ${rejectModalUser?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Motivo da Rejeição (será enviado ao aluno):
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: O estudante não comprovou a matrícula no 13º nível (ano terminal) ou documentação ilegível..."
              rows={3}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setRejectModalUser(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Confirmar Rejeição
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Criar Novo Prazo (RF05) */}
      <Modal
        isOpen={isAddDeadlineOpen}
        onClose={() => setIsAddDeadlineOpen(false)}
        title="Definir Novo Prazo de Submissão (RF05)"
      >
        <form onSubmit={handleCreateDeadline} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Título do Prazo:</label>
            <input
              type="text"
              required
              value={deadlineTitle}
              onChange={(e) => setDeadlineTitle(e.target.value)}
              placeholder="Ex: Entrega da Versão Final do TFC"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Etapa:</label>
              <select
                value={deadlineStage}
                onChange={(e) => setDeadlineStage(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
              >
                <option value="anteprojecto">Anteprojecto</option>
                <option value="relatorio_progresso">Relatório de Progresso</option>
                <option value="tfc_final">TFC Final (Monografia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data e Hora Limite:</label>
              <input
                type="datetime-local"
                required
                value={deadlineDueDate}
                onChange={(e) => setDeadlineDueDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Descrição / Instruções:</label>
            <textarea
              value={deadlineDesc}
              onChange={(e) => setDeadlineDesc(e.target.value)}
              rows={2}
              placeholder="Observações regimentais sobre o encerramento do prazo..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddDeadlineOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Salvar Prazo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
