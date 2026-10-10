'use client';

import React, { useState } from 'react';
import { PlagiarismReport } from '@/types/database';
import { Modal } from './Modal';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileText, ExternalLink, CheckCircle } from 'lucide-react';

interface PlagiarismBadgeProps {
  report?: PlagiarismReport;
  size?: 'sm' | 'md';
}

export function PlagiarismBadge({ report, size = 'md' }: PlagiarismBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!report) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
        Não verificado
      </span>
    );
  }

  const { score, status } = report;

  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
  let Icon = ShieldCheck;

  if (status === 'critico') {
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
    Icon = ShieldAlert;
  } else if (status === 'atencao') {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    Icon = AlertTriangle;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Clique para ver o relatório detalhado de originalidade e plágio"
        className={`inline-flex items-center gap-1.5 font-semibold border rounded-lg transition-all cursor-pointer shadow-xs ${badgeColor} ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
        }`}
      >
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>Plágio: {score.toFixed(1)}%</span>
      </button>

      {/* Relatório Detalhado (RF09) */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Relatório de Verificação de Plágio & Originalidade (RF09)"
        subtitle={`Auditoria algorítmica realizada em ${new Date(report.checkedAt).toLocaleString('pt-PT')}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          {/* Header Score Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
              status === 'critico'
                ? 'bg-rose-50/70 border-rose-200'
                : status === 'atencao'
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner ${
                  status === 'critico'
                    ? 'bg-rose-500 text-white'
                    : status === 'atencao'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {report.score.toFixed(1)}%
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {status === 'critico'
                    ? 'Alto Risco de Plágio Detectado'
                    : status === 'atencao'
                    ? 'Similaridade Moderada - Requer Revisão'
                    : 'Excelente Originalidade - Trabalho Aprovado'}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Palavras analisadas: <strong className="text-slate-800">{report.scannedWordsCount.toLocaleString()}</strong> | Bases consultadas: Repositório TFCs, IEEE, Scopus & Web
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  status === 'critico'
                    ? 'bg-rose-100 text-rose-800'
                    : status === 'atencao'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Veredicto do Motor */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Parecer Automático de Autenticidade
            </h5>
            <p className="text-sm text-slate-700 leading-relaxed">{report.verdict}</p>
          </div>

          {/* Fontes Identificadas */}
          <div>
            <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Fontes com Coincidência Textual Identificadas ({report.matches.length})
            </h5>

            <div className="space-y-3">
              {report.matches.map((match, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-blue-900 line-clamp-1">
                      {match.sourceTitle}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {match.similarityPercentage.toFixed(1)}% similar
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-2 italic">
                    Origem: {match.sourceType === 'repositorio_interno' ? 'Repositório Académico Institucional' : match.sourceType === 'artigo_cientifico' ? 'Base Científica / Publicação' : 'Portal Web Especializado'}
                  </p>

                  <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60 text-xs text-slate-700 font-mono">
                    <span className="font-bold text-amber-800 mr-1">[Trecho Coincidente]:</span>
                    &ldquo;{match.matchedExcerpt}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Fechar Relatório
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
