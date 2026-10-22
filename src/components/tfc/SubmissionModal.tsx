'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/shared/Modal';
import { SubmissionStage } from '@/types/database';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  X
} from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmissionModal({ isOpen, onClose }: SubmissionModalProps) {
  const { currentUser, submitDocument, isSubmissionAllowed } = useApp();

  const [stage, setStage] = useState<SubmissionStage>('anteprojecto');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;

  const stagePermission = isSubmissionAllowed(stage, currentUser.courseId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx') && !selectedFile.name.endsWith('.pdf')) {
        setErrorMsg('Formato de ficheiro inválido. Apenas são aceites documentos em formato PDF ou Word (.docx).');
        return;
      }

      // Max 15MB
      if (selectedFile.size > 15 * 1024 * 1024) {
        setErrorMsg('O ficheiro excede o limite máximo permitido de 15MB.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!stagePermission.allowed) {
      setErrorMsg(stagePermission.reason || 'Submissões temporariamente bloqueadas.');
      return;
    }

    if (!file) {
      setErrorMsg('Por favor selecione o ficheiro da monografia ou anteprojecto (.pdf ou .docx).');
      return;
    }

    setLoading(true);

    try {
      const result = await submitDocument({
        stage,
        title: title.trim(),
        theme: theme.trim(),
        abstract: abstractText.trim(),
        file
      });

      if (result.success) {
        setSuccessMsg('Trabalho submetido com sucesso! O relatório anti-plágio foi gerado e o documento enviado para o orientador.');
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
          setTitle('');
          setTheme('');
          setAbstractText('');
          setFile(null);
        }, 1800);
      } else {
        setErrorMsg(result.error || 'Erro ao submeter documento.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado durante a submissão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submissão Oficial de Trabalho de Fim de Curso"
      subtitle="Envio de Anteprojecto, Relatório de Progresso ou Monografia Final (RF03, RF09)"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stage selection */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Etapa de Submissão *</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as SubmissionStage)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="anteprojecto">Fase 1: Anteprojecto de TFC (Proposta Metodológica)</option>
            <option value="relatorio_progresso">Fase 2: Relatório de Progresso & Resultados Parciais</option>
            <option value="tfc_final">Fase 3: Versão Final da Monografia de TFC</option>
          </select>

          {!stagePermission.allowed && (
            <div className="mt-2 text-rose-600 flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>{stagePermission.reason}</span>
            </div>
          )}
        </div>

        {/* Theme & Title */}
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Área Temática / Linha de Pesquisa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Engenharia de Software e Sistemas Distribuídos"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Título Definitivo do Trabalho *</label>
            <input
              type="text"
              required
              placeholder="Ex: Sistema Integrado de Gestão Hospitalar e Atendimento Clínico"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>
        </div>

        {/* Abstract */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Resumo Executivo (Abstract) *</label>
          <textarea
            required
            rows={4}
            placeholder="Apresente brevemente o problema, os objectivos gerais, a metodologia adotada e as conclusões esperadas..."
            value={abstractText}
            onChange={(e) => setAbstractText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 leading-relaxed"
          />
        </div>

        {/* File Dropzone */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Ficheiro da Monografia (.pdf ou .docx, max 15MB) *</label>
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer relative">
            <input
              type="file"
              required={!file}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-blue-700" />
                <div className="text-left">
                  <div className="font-bold text-slate-800 text-xs">{file.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ficheiro Pronto
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">
                  Arraste o ficheiro para aqui ou <span className="text-blue-700">procure no seu dispositivo</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Formatos suportados: PDF ou DOCX (Tamanho limite: 15MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Plagiarism Notice */}
        <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-blue-900 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p>
            <strong>Auditoria de Integridade Académica (RF09):</strong> Ao submeter, o seu documento será submetido à verificação de plágio e similaridade textual contra a base de dados interna de monografias e publicações científicas.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !stagePermission.allowed}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>A processar & auditando plágio...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Submeter Documento Oficial</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
