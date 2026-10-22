'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Submission, JuryDefense, JuryMember } from '@/types/database';
import { StatusBadge } from '@/components/shared/Badge';
import { Modal } from '@/components/shared/Modal';
import {
  Award,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  FileText,
} from 'lucide-react';

export function JuryManagement() {
  const {
    currentUser,
    submissions,
    juries,
    users,
    getJuryRecommendation,
    scheduleJury,
    recordDefenseMinute
  } = useApp();

  const isCoordinator = currentUser?.role === 'coordenador' || currentUser?.role === 'admin';

  // TFCs approved by advisor that are ready for jury defense scheduling
  const approvedTfcs = submissions.filter(
    (s) => s.stage === 'tfc_final' && (s.status === 'aprovado_orientador' || s.status === 'aprovado_coordenador' || s.status === 'defendido' || s.status === 'homologado')
  );

  // Scheduling Modal State
  const [selectedSubForJury, setSelectedSubForJury] = useState<Submission | null>(null);
  const [recommendation, setRecommendation] = useState<{
    suggestedMembers: JuryMember[];
    explanation: string;
  } | null>(null);
  const [defenseDate, setDefenseDate] = useState('');
  const [roomOrLink, setRoomOrLink] = useState('Auditório Central & Sessão Híbrida');
  const [members, setMembers] = useState<JuryMember[]>([]);

  // Ata de Defesa Modal State (RN04)
  const [selectedJuryForAta, setSelectedJuryForAta] = useState<JuryDefense | null>(null);
  const [defenseGrade, setDefenseGrade] = useState<number>(18.0);
  const [ataNotes, setAtaNotes] = useState('');
  const [confirmHomologation, setConfirmHomologation] = useState(true);

  // Trigger Automatic Jury Recommendation (RF10)
  const handleOpenScheduleModal = (sub: Submission) => {
    setSelectedSubForJury(sub);
    const rec = getJuryRecommendation(sub.id);
    setRecommendation(rec);
    setMembers(rec.suggestedMembers);
    setDefenseDate('');
  };

  const handleConfirmSchedule = () => {
    if (!selectedSubForJury || !defenseDate) {
      alert('Por favor, informe a data e hora da defesa.');
      return;
    }

    scheduleJury({
      submissionId: selectedSubForJury.id,
      groupId: selectedSubForJury.groupId,
      groupName: selectedSubForJury.groupName,
      tfcTitle: selectedSubForJury.title,
      courseId: selectedSubForJury.courseId,
      courseName: selectedSubForJury.courseName,
      advisorId: selectedSubForJury.advisorId || currentUser?.id || 'advisor-1',
      advisorName: selectedSubForJury.advisorName || 'Docente Orientador',
      defenseDate: new Date(defenseDate).toISOString(),
      roomOrLink,
      status: 'agendada',
      members,
      suggestedScore: 18
    });

    setSelectedSubForJury(null);
  };

  const handleOpenAtaModal = (jury: JuryDefense) => {
    setSelectedJuryForAta(jury);
    setDefenseGrade(jury.finalScore || 18.0);
    setAtaNotes(
      jury.ataNotes ||
      'O candidato realizou a apresentação pública do Trabalho de Fim de Curso perante a mesa de júri. Respondeu com segurança e domínio às arguições do 1º e 2º vogais. Trabalho aprovado com distinção.'
    );
    setConfirmHomologation(true);
  };

  const handleSaveAta = () => {
    if (!selectedJuryForAta) return;

    recordDefenseMinute({
      juryId: selectedJuryForAta.id,
      finalScore: defenseGrade,
      ataNotes,
      homologate: confirmHomologation
    });

    setSelectedJuryForAta(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Bancas Examinadoras de Júri
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            Composição de Júris, Defesas & Ata de Homologação
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sugestão de membros por especialidade e publicação automática na Biblioteca Virtual após homologação.
          </p>
        </div>
      </div>

      {/* List of Scheduled and Concluded Juries */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Bancas Agendadas & Realizadas
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhamento de datas, salas de defesa e registo de atas
            </p>
          </div>
        </div>

        {juries.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Nenhuma banca agendada</p>
            <p className="text-xs text-slate-400 mt-1">
              Os trabalhos aprovados pelo orientador podem ser agendados abaixo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {juries.map((jury) => {
              const defDate = new Date(jury.defenseDate);
              return (
                <div key={jury.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {jury.groupName}
                        </span>
                        <StatusBadge status={jury.status} />
                        {jury.finalScore && (
                          <span className="text-xs font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                            Nota Final: {jury.finalScore.toFixed(1)} Valores
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-800">{jury.tfcTitle}</h4>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 text-blue-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {defDate.toLocaleDateString('pt-PT')} às {defDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {jury.roomOrLink}
                        </span>
                        <span>
                          <strong>Orientador:</strong> {jury.advisorName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCoordinator && jury.status !== 'homologada' && (
                        <button
                          onClick={() => handleOpenAtaModal(jury)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lançar Ata de Defesa & Homologar</span>
                        </button>
                      )}

                      {jury.status === 'homologada' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Homologado e Enviado à Biblioteca Virtual</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mesa de Júri Sugerida/Definida */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Membros Constituintes da Mesa de Júri:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {jury.members.map((m, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-blue-900 block capitalize">
                            {m.role.replace('_', ' ')}:
                          </span>
                          <span className="text-slate-800 font-semibold">{m.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{m.specialization}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Eligible Submissions for Scheduling (for Coordinator) */}
      {isCoordinator && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Trabalhos Prontos para Defesa (Aguardando Banca)
              </h3>
              <p className="text-xs text-slate-500">
                Use a sugestão automática do sistema baseada na especialização dos docentes
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {approvedTfcs.map((sub) => {
              const alreadyScheduled = juries.some((j) => j.submissionId === sub.id);
              if (alreadyScheduled) return null;

              return (
                <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {sub.groupName}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{sub.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tema: <strong className="text-slate-700">{sub.theme}</strong> • Orientador: {sub.advisorName}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenScheduleModal(sub)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Compor Júri & Agendar</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Sugestão e Agendamento de Júri (RF10) */}
      <Modal
        isOpen={Boolean(selectedSubForJury)}
        onClose={() => setSelectedSubForJury(null)}
        title="Sugestão Automática de Banca de Júri"
        subtitle={`Trabalho: ${selectedSubForJury?.title}`}
        maxWidth="max-w-2xl"
      >
        {selectedSubForJury && recommendation && (
          <div className="space-y-4">
            {/* Sugestão de Banca */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
              <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Composição Recomendada da Banca</strong>
                <p className="text-blue-800 mt-0.5 leading-relaxed">{recommendation.explanation}</p>
              </div>
            </div>

            {/* Membros Sugeridos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Composição Sugerida para a Mesa:
              </label>
              <div className="space-y-2">
                {members.map((m, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-indigo-700 capitalize">
                        {m.role.replace('_', ' ')}:
                      </span>{' '}
                      <span className="font-bold text-slate-800">{m.name}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Especialidade: {m.specialization}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Afinidade Alta
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data e Hora da Defesa:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={defenseDate}
                  onChange={(e) => setDefenseDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Local / Sala / Link Virtual:
                </label>
                <input
                  type="text"
                  required
                  value={roomOrLink}
                  onChange={(e) => setRoomOrLink(e.target.value)}
                  placeholder="Auditório Nobre ou Link Zoom"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSubForJury(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Homologar Banca & Notificar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Lançamento da Ata de Defesa & Homologação Final (RN04) */}
      <Modal
        isOpen={Boolean(selectedJuryForAta)}
        onClose={() => setSelectedJuryForAta(null)}
        title="Lançamento da Ata de Defesa e Homologação Final"
        subtitle={selectedJuryForAta?.tfcTitle}
        maxWidth="max-w-2xl"
      >
        {selectedJuryForAta && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 leading-relaxed">
              <strong>Conclusão de Ciclo:</strong> A conta do estudante ou grupo só poderá ser migrada para o estado &ldquo;Concluído&rdquo; e o trabalho enviado para a Biblioteca Virtual após a ata de defesa ser lançada e homologada pelo Coordenador.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nota Final Atribuída pelo Júri (0 a 20 Valores):
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={defenseGrade}
                onChange={(e) => setDefenseGrade(parseFloat(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resumo da Ata de Defesa & Parecer dos Vogais:
              </label>
              <textarea
                rows={4}
                value={ataNotes}
                onChange={(e) => setAtaNotes(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-purple-500"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <input
                type="checkbox"
                id="homologarCheckbox"
                checked={confirmHomologation}
                onChange={(e) => setConfirmHomologation(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="homologarCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                Homologar imediatamente e transferir automaticamente para a Biblioteca Virtual
              </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedJuryForAta(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveAta}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
              >
                Guardar Ata & Concluir Ciclo
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
