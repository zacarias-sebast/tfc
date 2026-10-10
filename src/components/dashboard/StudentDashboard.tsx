'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/shared/Badge';
import { PlagiarismBadge } from '@/components/shared/PlagiarismModal';
import {
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  MessageSquare,
  Award,
  Download,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenSubmitModal: () => void;
}

export function StudentDashboard({ onNavigate, onOpenSubmitModal }: StudentDashboardProps) {
  const { currentUser, submissions, deadlines, juries, virtualLibrary } = useApp();

  const activeDeadline = deadlines.find((d) => d.stage === 'tfc_final');

  // Calculate days left inside state/useEffect to avoid SSR/prerender time mismatch
  const [daysRemainingText, setDaysRemainingText] = React.useState('Sem prazo definido');
  const [isExpired, setIsExpired] = React.useState(false);

  React.useEffect(() => {
    if (activeDeadline) {
      const due = new Date(activeDeadline.dueDate);
      const now = new Date();
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setDaysRemainingText(`${diffDays} dias restantes`);
        setIsExpired(false);
      } else {
        setDaysRemainingText('Prazo expirado');
        setIsExpired(true);
      }
    }
  }, [activeDeadline]);

  if (!currentUser) return null;

  const userSubmissions = submissions.filter((s) => s.studentId === currentUser.id);
  const anteprojectoSub = userSubmissions.find((s) => s.stage === 'anteprojecto');
  const tfcFinalSub = userSubmissions.find((s) => s.stage === 'tfc_final');
  const userJury = juries.find((j) => j.groupId === currentUser.groupId);
  const publishedWork = virtualLibrary.find((v) => v.submissionId === tfcFinalSub?.id);

  // Account Pending Warning (RF02)
  if (currentUser.status === 'pendente') {
    return (
      <div className="space-y-6">
        <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Conta em Análise pela Coordenação (RF02)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Olá, <strong className="text-slate-800">{currentUser.name}</strong>! O seu registo no curso de{' '}
            <strong className="text-slate-800">{currentUser.courseName}</strong> foi submetido com sucesso e está a aguardar validação pelo Coordenador de Curso.
          </p>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 text-left text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Nível Declarado:</span>
              <span className="font-bold text-slate-800">{currentUser.academicLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Nº de Estudante:</span>
              <span className="font-bold text-slate-800">{currentUser.studentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Orientador Preferencial:</span>
              <span className="font-bold text-slate-800">{currentUser.assignedAdvisorName || 'Aguardando Atribuição'}</span>
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-4 font-medium">
            Assim que a sua conta for validada, receberá uma notificação no sistema para iniciar a submissão do Anteprojecto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ano Terminal • {currentUser.academicLevel || '13º Nível'}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Bem-vindo(a), {currentUser.name}!
          </h2>
          <p className="text-blue-200 text-xs sm:text-sm leading-relaxed mb-4">
            Acompanhe em tempo real o ciclo de desenvolvimento do seu Trabalho de Fim de Curso, pareceres do orientador, verificação de plágio e agendamento de banca.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/30 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Submeter Documento (.pdf / .docx)</span>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Canal com Orientador</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Award className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Anteprojecto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Anteprojecto
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mb-2">
            <StatusBadge status={anteprojectoSub ? anteprojectoSub.status : 'pendente'} />
          </div>
          <p className="text-xs text-slate-500">
            {anteprojectoSub
              ? `Entregue em ${new Date(anteprojectoSub.submittedAt).toLocaleDateString('pt-PT')}`
              : 'Pendente de submissão'}
          </p>
        </div>

        {/* Card 2: TFC Final Monografia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. TFC Final (Monografia)
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mb-2">
            <StatusBadge status={tfcFinalSub ? tfcFinalSub.status : 'pendente'} />
          </div>
          {tfcFinalSub?.plagiarismReport && (
            <div className="mt-2">
              <PlagiarismBadge report={tfcFinalSub.plagiarismReport} size="sm" />
            </div>
          )}
        </div>

        {/* Card 3: Prazo Atual (RF05) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Prazo de Entrega
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isExpired ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-base font-extrabold ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
            {daysRemainingText}
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {activeDeadline?.title || 'Fase Final do TFC'}
          </p>
        </div>

        {/* Card 4: Orientador Oficial */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              4. Orientador
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-800 truncate">
            {currentUser.assignedAdvisorName || 'Prof. Dr. Manuel Afonso'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {currentUser.courseName}
          </p>
        </div>
      </div>

      {/* Workflow Progress Stepper */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>Fluxo Académico do TFC</span>
          <span className="text-xs font-normal text-slate-500">(Progresso do Estudante)</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: 1, label: 'Registo & Moderação', done: true },
            { step: 2, label: 'Homologação de Orientador', done: Boolean(currentUser.assignedAdvisorId) },
            { step: 3, label: 'Anteprojecto Aprovado', done: anteprojectoSub?.status.includes('aprovado') },
            { step: 4, label: 'Monografia TFC Avaliada', done: tfcFinalSub?.status.includes('aprovado') },
            { step: 5, label: 'Defesa em Júri', done: Boolean(userJury?.status === 'realizada' || userJury?.status === 'homologada') },
            { step: 6, label: 'Publicado na Biblioteca', done: Boolean(publishedWork || tfcFinalSub?.status === 'homologado') }
          ].map((item) => (
            <div
              key={item.step}
              className={`p-3 rounded-2xl border text-center transition-all ${
                item.done
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1.5 ${
                  item.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {item.done ? '✓' : item.step}
              </div>
              <p className="text-[11px] font-semibold leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions List & Evaluation Feedback History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Documentos Submetidos & Pareceres
            </h3>
            <p className="text-xs text-slate-500">
              Histórico de versões, relatórios de plágio e observações de avaliação
            </p>
          </div>

          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Nova Submissão</span>
          </button>
        </div>

        {userSubmissions.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Nenhum documento submetido ainda</p>
            <p className="text-xs text-slate-400 mt-1">
              Faça o upload do seu anteprojecto no formato .pdf ou .docx (máx. 15MB).
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userSubmissions.map((sub) => (
              <div key={sub.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {sub.stage === 'anteprojecto' ? 'Anteprojecto' : 'TFC Final'}
                      </span>
                      <StatusBadge status={sub.status} />
                      {sub.plagiarismReport && (
                        <PlagiarismBadge report={sub.plagiarismReport} size="sm" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{sub.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tema: <span className="text-slate-700 font-medium">{sub.theme}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={sub.fileUrl}
                      download={sub.fileName}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{sub.fileName} ({(sub.fileSize / (1024 * 1024)).toFixed(1)} MB)</span>
                    </a>
                  </div>
                </div>

                {/* Feedbacks */}
                {(sub.advisorFeedback || sub.coordinatorFeedback) && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    {sub.advisorFeedback && (
                      <div>
                        <span className="font-bold text-blue-900 block mb-0.5">
                          💬 Parecer do Orientador ({sub.advisorName}):
                        </span>
                        <p className="text-slate-700 leading-relaxed italic">
                          &ldquo;{sub.advisorFeedback}&rdquo;
                        </p>
                      </div>
                    )}
                    {sub.coordinatorFeedback && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="font-bold text-emerald-900 block mb-0.5">
                          🏛️ Despacho da Coordenação de Curso:
                        </span>
                        <p className="text-slate-700 leading-relaxed italic">
                          &ldquo;{sub.coordinatorFeedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
