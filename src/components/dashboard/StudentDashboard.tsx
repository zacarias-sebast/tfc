'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/shared/Badge';
import { PlagiarismBadge } from '@/components/shared/PlagiarismModal';
import {
  UploadCloud,
  FileCheck2,
  Calendar,
  MessageSquare,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenSubmitModal: () => void;
}

export function StudentDashboard({ onNavigate, onOpenSubmitModal }: StudentDashboardProps) {
  const {
    currentUser,
    submissions,
    deadlines,
    juries,
    isSubmissionAllowed
  } = useApp();

  if (!currentUser) return null;

  // Student's submissions
  const mySubmissions = submissions.filter(
    (s) => s.studentId === currentUser.id || (currentUser.groupId && s.groupId === currentUser.groupId)
  );

  const latestSubmission = mySubmissions[0]; // ordered newest first in context

  // Check current stage status
  const currentStage = latestSubmission?.stage || 'anteprojecto';
  const stagePermission = isSubmissionAllowed(currentStage, currentUser.courseId);

  // Jury defense if scheduled
  const myJury = juries.find(
    (j) => mySubmissions.some((s) => s.id === j.submissionId)
  );

  const stages = [
    {
      id: 'anteprojecto',
      label: 'Fase 1: Anteprojecto',
      desc: 'Proposta temática e delimitação',
      active: currentStage === 'anteprojecto'
    },
    {
      id: 'relatorio_progresso',
      label: 'Fase 2: Relatório Progresso',
      desc: 'Desenvolvimento e revisão parcial',
      active: currentStage === 'relatorio_progresso'
    },
    {
      id: 'tfc_final',
      label: 'Fase 3: Monografia Final',
      desc: 'Entrega final, anti-plágio e defesa',
      active: currentStage === 'tfc_final'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>Portal do Estudante Finalista</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Olá, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.courseName || 'Curso de Engenharia'} • {currentUser.academicLevel || '13º Classe'} • Nº {currentUser.studentNumber || '2026-PAP'}
          </p>
        </div>

        {/* Advisor card */}
        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/70 flex items-center justify-between gap-4 w-full md:w-auto">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Orientador Designado:
            </span>
            <div className="font-bold text-slate-800 text-xs mt-0.5">
              {currentUser.assignedAdvisorName || 'Prof. Orientador'}
            </div>
          </div>
          <button
            onClick={() => onNavigate('chat')}
            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* TFC Timeline / Progression */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
          Etapas do Trabalho de Fim de Curso (PAP)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stages.map((st, idx) => {
            const isPassed =
              (st.id === 'anteprojecto' && (currentStage === 'relatorio_progresso' || currentStage === 'tfc_final')) ||
              (st.id === 'relatorio_progresso' && currentStage === 'tfc_final');
            const isCurrent = currentStage === st.id;

            return (
              <div
                key={st.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                    : isPassed
                    ? 'bg-emerald-50/50 border-emerald-100'
                    : 'bg-slate-50/50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Etapa 0{idx + 1}
                  </span>
                  {isPassed ? (
                    <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluída</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="text-blue-700 font-bold text-[10px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Fase Atual</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Aguardando</span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{st.label}</h4>
                <p className="text-xs text-slate-500 mt-1">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission CTA & Deadlines Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <UploadCloud className="w-4 h-4" />
            <span>Envio de Documento / Relatório da PAP</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight">
            Pronto para submeter a próxima versão do seu PAP?
          </h3>
          <p className="text-xs text-blue-100/80 max-w-xl">
            Suporta ficheiros PDF e Word (.docx) até 15MB. Todas as entregas são auditadas pelo motor anti-plágio institucional.
          </p>

          {!stagePermission.allowed && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>{stagePermission.reason || 'Submissões temporariamente bloqueadas para este prazo.'}</span>
            </div>
          )}
        </div>

        <button
          onClick={onOpenSubmitModal}
          disabled={!stagePermission.allowed}
          className={`w-full sm:w-auto justify-center px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            stagePermission.allowed
              ? 'bg-white text-blue-950 hover:bg-blue-50 shadow-md hover:scale-102'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span>Submeter Trabalho</span>
        </button>
      </div>

      {/* Defense / Jury Scheduled Card */}
      {myJury && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Banca Examinadora Agendada!</span>
            </div>
            <StatusBadge status={myJury.status} />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900">{myJury.tfcTitle}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="text-slate-400 block font-semibold">Data da Defesa:</span>
              <span className="font-extrabold text-slate-800 text-sm">
                {new Date(myJury.defenseDate).toLocaleString('pt-PT')}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="text-slate-400 block font-semibold">Local ou Link:</span>
              <span className="font-extrabold text-slate-800 text-sm">{myJury.roomOrLink}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="text-slate-400 block font-semibold">Nota Final:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {myJury.finalScore !== undefined ? `${myJury.finalScore} / 20 Valores` : 'A aguardar defesa'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submissions History */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Histórico de Submissões & Pareceres</h3>
            <p className="text-xs text-slate-500">Documentos entregues, índice de plágio e feedback docente</p>
          </div>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">Nenhum documento submetido ainda.</p>
            <p className="text-xs mt-0.5">Clique em "Submeter Trabalho" para entregar a proposta inicial.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mySubmissions.map((sub) => (
              <div key={sub.id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {sub.stage}
                      </span>
                      <StatusBadge status={sub.status} />
                      <PlagiarismBadge report={sub.plagiarismReport} size="sm" />
                    </div>
                    <span className="text-xs text-slate-400">
                      Entregue em {new Date(sub.submittedAt).toLocaleDateString('pt-PT')} às{' '}
                      {new Date(sub.submittedAt).toLocaleTimeString('pt-PT')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">{sub.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{sub.abstract}</p>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Tema: <strong>{sub.theme}</strong></span>
                    <span>Ficheiro: <strong>{sub.fileName}</strong> ({(sub.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
                    <span>Versão: {sub.version}</span>
                  </div>

                  {/* Advisor Feedback */}
                  {sub.advisorFeedback && (
                    <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs text-blue-900">
                      <span className="font-bold block mb-1">
                        Parecer do Orientador ({sub.advisorName || 'Docente'}):
                      </span>
                      <p>{sub.advisorFeedback}</p>
                    </div>
                  )}

                  {/* Coordinator Feedback */}
                  {sub.coordinatorFeedback && (
                    <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
                      <span className="font-bold block mb-1">Parecer da Coordenação do Curso:</span>
                      <p>{sub.coordinatorFeedback}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
