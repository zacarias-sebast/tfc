'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/shared/Badge';
import { PlagiarismBadge } from '@/components/shared/PlagiarismModal';
import { Modal } from '@/components/shared/Modal';
import { Submission, SubmissionStatus } from '@/types/database';
import {
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download
} from 'lucide-react';

interface AdvisorDashboardProps {
  onOpenChat: (groupId: string) => void;
}

export function AdvisorDashboard({ onOpenChat }: AdvisorDashboardProps) {
  const {
    currentUser,
    users,
    submissions,
    deadlines,
    evaluateSubmission
  } = useApp();

  const [selectedSubForEval, setSelectedSubForEval] = useState<Submission | null>(null);
  const [evalStatus, setEvalStatus] = useState<
    'aprovado_orientador' | 'alteracoes_solicitadas' | 'reprovado'
  >('aprovado_orientador');
  const [evalFeedback, setEvalFeedback] = useState('');

  if (!currentUser) return null;

  // Advisees
  const advisees = users.filter(
    (u) =>
      u.role === 'estudante' &&
      (u.assignedAdvisorId === currentUser.id || u.preferredAdvisorId === currentUser.id)
  );

  // Advisee Submissions
  const adviseeSubmissions = submissions.filter(
    (s) =>
      s.advisorId === currentUser.id ||
      advisees.some((a) => a.id === s.studentId)
  );

  const pendingReviews = adviseeSubmissions.filter(
    (s) => s.status === 'submetido' || s.status === 'em_revisao'
  );

  const maxQuota = currentUser.maxGroupsQuota || 5;
  const currentCount = advisees.length;

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForEval) return;

    evaluateSubmission({
      submissionId: selectedSubForEval.id,
      evaluatorRole: 'orientador',
      status: evalStatus,
      feedback: evalFeedback
    });

    setSelectedSubForEval(null);
    setEvalFeedback('');
  };

  return (
    <div className="space-y-6">
      {/* Advisor Profile & Quota Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Painel Docente de Orientação da PAP</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Bem-vindo, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.department || 'Departamento Académico'} • Especialidade:{' '}
            {currentUser.specialization?.join(', ') || 'Metodologia e Tecnologias'}
          </p>
        </div>

        {/* Quota Progress */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Quota de Orientandos</span>
            <span>
              {currentCount} / {maxQuota} Grupos
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                currentCount >= maxQuota ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, (currentCount / maxQuota) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            {maxQuota - currentCount > 0
              ? `Disponibilidade para mais ${maxQuota - currentCount} estudante(s)`
              : 'Capacidade máxima atingida'}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estudantes Orientandos
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">{advisees.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Alunos associados ao seu perfil</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Submissões Pendentes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-3">{pendingReviews.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Aguardam a sua revisão & parecer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Aprovados para Banca
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-3">
            {
              adviseeSubmissions.filter(
                (s) => s.status === 'aprovado_orientador' || s.status === 'aprovado_coordenador'
              ).length
            }
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Prontos para júri examinador</p>
        </div>
      </div>

      {/* Main Review Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Submissões de Anteprojectos e Monografias dos Orientandos
            </h3>
            <p className="text-xs text-slate-500">
              Validação metodológica, verificação anti-plágio e emissão de parecer
            </p>
          </div>
        </div>

        {adviseeSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Nenhuma submissão recebida ainda</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Os documentos submetidos pelos seus estudantes orientandos aparecerão aqui com os relatórios de originalidade.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {adviseeSubmissions.map((sub) => (
              <div key={sub.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {sub.stage === 'anteprojecto'
                          ? 'Fase 1: Anteprojecto'
                          : sub.stage === 'relatorio_progresso'
                          ? 'Fase 2: Relatório Progresso'
                          : 'Fase 3: PAP Final'}
                      </span>
                      <StatusBadge status={sub.status} />
                      <PlagiarismBadge report={sub.plagiarismReport} size="sm" />
                      <span className="text-xs text-slate-400">
                        Versão {sub.version} • {new Date(sub.submittedAt).toLocaleDateString('pt-PT')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{sub.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{sub.abstract}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700">Estudante: {sub.studentName}</span>
                      <span>Curso: {sub.courseName}</span>
                      <span>Ficheiro: {sub.fileName} ({(sub.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>

                    {sub.advisorFeedback && (
                      <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                        <span className="font-bold block mb-0.5">Seu Parecer Registado:</span>
                        <p>{sub.advisorFeedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedSubForEval(sub);
                        setEvalFeedback(sub.advisorFeedback || '');
                      }}
                      className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Avaliar / Parecer</span>
                    </button>

                    <button
                      onClick={() => onOpenChat(sub.groupId || 'group-1')}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orientandos List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Lista de Estudantes sob sua Orientação</h3>
          <p className="text-xs text-slate-500">Contactos e detalhes académicos</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Nome do Estudante</th>
                <th className="px-6 py-3.5">Nº Estudante</th>
                <th className="px-6 py-3.5">Curso</th>
                <th className="px-6 py-3.5">Email / Telefone</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Canal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {advisees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Ainda não possui estudantes atribuídos para este ano lectivo.
                  </td>
                </tr>
              ) : (
                advisees.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{a.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{a.studentNumber || '—'}</td>
                    <td className="px-6 py-4">{a.courseName || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">
                      <div>{a.email}</div>
                      {a.phone && <div className="text-[11px]">{a.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onOpenChat(a.groupId || 'group-1')}
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Conversar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Emitir Avaliação / Parecer */}
      <Modal
        isOpen={!!selectedSubForEval}
        onClose={() => setSelectedSubForEval(null)}
        title="Avaliação & Parecer do Docente Orientador"
        subtitle={selectedSubForEval ? `${selectedSubForEval.title} • Autor: ${selectedSubForEval.studentName}` : ''}
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Decisão do Orientador *</label>
            <select
              value={evalStatus}
              onChange={(e) =>
                setEvalStatus(
                  e.target.value as 'aprovado_orientador' | 'alteracoes_solicitadas' | 'reprovado'
                )
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="aprovado_orientador">
                Aprovar Trabalho (Avança para Coordenação / Banca)
              </option>
              <option value="alteracoes_solicitadas">
                Solicitar Correções e Alterações Metodológicas
              </option>
              <option value="reprovado">
                Reprovar Trabalho
              </option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Parecer Circunstanciado & Recomendações *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Descreva as correções necessárias, sugestões de capítulos, normas bibliográficas ou pontos fortes do documento..."
              value={evalFeedback}
              onChange={(e) => setEvalFeedback(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedSubForEval(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Registar Parecer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
