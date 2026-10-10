'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/shared/Modal';
import { SubmissionStage } from '@/types/database';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  ShieldCheck,
  Loader2,
  X
} from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStage?: SubmissionStage;
}

export function SubmissionModal({
  isOpen,
  onClose,
  defaultStage = 'anteprojecto'
}: SubmissionModalProps) {
  const { currentUser, submitDocument, isSubmissionAllowed } = useApp();

  const [stage, setStage] = useState<SubmissionStage>(defaultStage);
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [abstract, setAbstract] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check deadline for selected stage inside useEffect (RF05)
  const [deadlineCheck, setDeadlineCheck] = useState<{ allowed: boolean; reason?: string }>({ allowed: true });

  React.useEffect(() => {
    setDeadlineCheck(isSubmissionAllowed(stage, currentUser?.courseId));
  }, [stage, currentUser?.courseId, isSubmissionAllowed]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['.pdf', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!isValidExt) {
      setErrorMessage('Formato inválido (RN03). Aceitam-se estritamente ficheiros .pdf ou .docx.');
      setSelectedFile(null);
      return;
    }

    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE) {
      setErrorMessage(`Arquivo excede o limite (RN03). Tamanho: ${(file.size / (1024 * 1024)).toFixed(1)} MB (Máximo 15 MB).`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Por favor, anexe o documento do trabalho.');
      return;
    }

    if (!deadlineCheck.allowed) {
      setErrorMessage(deadlineCheck.reason || 'Envio bloqueado por prazo excedido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await submitDocument({
      stage,
      title,
      theme,
      abstract,
      file: selectedFile
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Erro ao submeter o documento.');
    } else {
      // Limpa os campos e fecha
      setTitle('');
      setTheme('');
      setAbstract('');
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submissão de Documento Académico (RF03)"
      subtitle="Anteprojectos e Trabalhos de Fim de Curso (.pdf ou .docx até 15MB)"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Deadline Warning (RF05) */}
        {!deadlineCheck.allowed && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">Submissões Bloqueadas (RF05)</strong>
              {deadlineCheck.reason}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Stage selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tipo de Submissão:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStage('anteprojecto')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                stage === 'anteprojecto'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Anteprojecto de TFC</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('tfc_final')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                stage === 'tfc_final'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>2. TFC Final (Monografia)</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Título Completo do Trabalho:
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Plataforma Distribuída de Reconhecimento Facial para Acesso Académico..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Área Temática / Domínio Científico:
          </label>
          <input
            type="text"
            required
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Visão Computacional, Inteligência Artificial e Redes Neuronais..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
          />
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Resumo / Sinopse do Documento:
          </label>
          <textarea
            required
            rows={3}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Síntese dos objetivos, metodologia aplicada e resultados alcançados..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
          />
        </div>

        {/* File Upload Zone (RN03: .docx or .pdf <= 15MB) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Arquivo do Trabalho (Estritamente .pdf ou .docx, Máx. 15MB):
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
            >
              <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                Clique para selecionar ou arraste o ficheiro aqui
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Formatos permitidos: <strong>.docx</strong> ou <strong>.pdf</strong> (limite máximo de 15 MB - RN03)
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {selectedFile.name.endsWith('.pdf') ? 'PDF' : 'DOCX'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Verificado para auditoria anti-plágio
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-blue-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Informative notice on automated plagiarism check (RF09) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Ao submeter, o documento será auditado automaticamente pela rotina de verificação de similaridade e plágio (RF09).
          </span>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !selectedFile || !deadlineCheck.allowed}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analisando Plágio & Salvando...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Confirmar Submissão</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
