'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Submission } from '@/types/database';
import { StatusBadge } from '@/components/shared/Badge';
import { PlagiarismBadge } from '@/components/shared/PlagiarismModal';
import { Modal } from '@/components/shared/Modal';
import {
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  BookOpen,
  Award,
  Sparkles,
  Search
} from 'lucide-react';

interface AdvisorDashboardProps {
  onOpenChat: (groupId: string) => void;
}

export function AdvisorDashboard({ onOpenChat }: AdvisorDashboardProps) {
  const { currentUser, submissions, groups, evaluateSubmission, courses } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubForEval, setSelectedSubForEval] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [evalStatus, setEvalStatus] = useState<
    'aprovado_orientador' | 'alteracoes_solicitadas' | 'reprovado'
  >('aprovado_orientador');

  if (!currentUser) return null;

  // Groups and submissions where this advisor is assigned
  const mySubmissions = submissions.filter(
    (s) => s.advisorId === currentUser.id
  );

  const filteredSubs = mySubmissions.filter((s) =>
    s.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEvalModal = (sub: Submission) => {
    setSelectedSubForEval(sub);
    setFeedbackText(sub.advisorFeedback || '');
    setEvalStatus('aprovado_orientador');
  };

  const handleSaveEvaluation = () => {
    if (!selectedSubForEval) return;
    if (!feedbackText.trim()) {
      alert('Por favor, redija um parecer ou observação para os alunos.');
      return;
    }

    evaluateSubmission({
      submissionId: selectedSubForEval.id,
      evaluatorRole: 'orientador',
      status: evalStatus,
      feedback: feedbackText
    });

    setSelectedSubForEval(null);
    setFeedbackText('');
  };

  return (
    <div className="space-y-6">
      {/* Advisor Info Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Docente Orientador • ID: {currentUser.teacherId || 'DOC-2025'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Vínculo Multi-Curso (Premissa do Escopo)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Áreas de Especialização: <strong className="text-slate-700">{currentUser.specialization?.join(', ')}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
            <span className="text-xs text-slate-500 block">Capacidade / Quota</span>
            <span className="text-lg font-black text-slate-800">
              {mySubmissions.length} / {currentUser.maxGroupsQuota || 5} Grupos
            </span>
          </div>
        </div>
      </div>

      {/* Submissions List (Meus Orientandos) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Trabalhos & Grupos Sob Minha Orientação
            </h3>
            <p className="text-xs text-slate-500">
              Avalie submissões, verifique relatórios de plágio e comunique-se via chat
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por grupo ou título..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
            />
          </div>
        </div>

        {filteredSubs.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Nenhuma submissão atribuída no momento</p>
            <p className="text-xs text-slate-400 mt-1">
              Novas orientações atribuídas pela coordenação serão listadas aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSubs.map((sub) => (
              <div key={sub.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {sub.groupName}
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {sub.stage === 'anteprojecto' ? 'Anteprojecto' : 'TFC Final'} (v{sub.version})
                      </span>
                      <StatusBadge status={sub.status} />
                      {sub.plagiarismReport && (
                        <PlagiarismBadge report={sub.plagiarismReport} size="sm" />
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800">{sub.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      <strong className="text-slate-600">Tema:</strong> {sub.theme}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submetido em: {new Date(sub.submittedAt).toLocaleString('pt-PT')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={sub.fileUrl}
                      download={sub.fileName}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                      title="Descarregar ficheiro original (.pdf/.docx)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{sub.fileName}</span>
                    </a>

                    <button
                      onClick={() => onOpenChat(sub.groupId)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat do Grupo</span>
                    </button>

                    <button
                      onClick={() => handleOpenEvalModal(sub)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Avaliar / Parecer</span>
                    </button>
                  </div>
                </div>

                {sub.advisorFeedback && (
                  <div className="mt-3 p-3 bg-teal-50/50 rounded-xl border border-teal-200/60 text-xs">
                    <span className="font-bold text-teal-900 block mb-0.5">
                      Seu Último Parecer Registado:
                    </span>
                    <p className="text-slate-700 leading-relaxed italic">
                      &ldquo;{sub.advisorFeedback}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Avaliação do Orientador (RF04) */}
      <Modal
        isOpen={Boolean(selectedSubForEval)}
        onClose={() => setSelectedSubForEval(null)}
        title="Avaliação & Parecer do Orientador (RF04)"
        subtitle={selectedSubForEval?.title}
        maxWidth="max-w-2xl"
      >
        {selectedSubForEval && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>
                <strong className="text-slate-700">Grupo:</strong> {selectedSubForEval.groupName} ({selectedSubForEval.studentName})
              </div>
              <div>
                <strong className="text-slate-700">Fase:</strong> {selectedSubForEval.stage === 'anteprojecto' ? 'Anteprojecto' : 'TFC Final'}
              </div>
              {selectedSubForEval.plagiarismReport && (
                <div>
                  <strong className="text-slate-700">Índice de Plágio:</strong> {selectedSubForEval.plagiarismReport.score}% ({selectedSubForEval.plagiarismReport.status.toUpperCase()})
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Decisão da Orientação:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEvalStatus('aprovado_orientador')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${evalStatus === 'aprovado_orientador'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Aprovar Trabalho</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEvalStatus('alteracoes_solicitadas')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${evalStatus === 'alteracoes_solicitadas'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Pedir Correções</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEvalStatus('reprovado')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${evalStatus === 'reprovado'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reprovar</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Parecer Técnico e Recomendações aos Alunos:
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Insira aqui as observações sobre a metodologia, correção dos capítulos, normas bibliográficas ou autorização para apresentação perante o júri..."
                rows={4}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSubForEval(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveEvaluation}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Gravar & Notificar Estudantes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
