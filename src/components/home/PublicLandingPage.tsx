'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { VirtualLibrary } from '@/components/library/VirtualLibrary';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  ShieldCheck,
  Users,
  FileText,
  Award,
  ArrowRight,
  LogIn,
  UserPlus,
  Clock,
  CheckCircle,
  Building2,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface PublicLandingPageProps {
  onOpenAuth: (tab: 'login' | 'register', email?: string) => void;
}

export function PublicLandingPage({ onOpenAuth }: PublicLandingPageProps) {
  const { courses, deadlines, virtualLibrary } = useApp();
  const [activeView, setActiveView] = useState<'inicio' | 'biblioteca' | 'regulamento'>('inicio');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Banner Institucional */}


      {/* Header de Navegação Principal */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div
            onClick={() => setActiveView('inicio')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-tight">
                PORTAL ACADÉMICO DA PAP
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Sistema de Gestão de Workflow de PAP
              </span>
            </div>
          </div>

          {/* Links e Botões de Entrada */}
          <nav className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setActiveView('inicio')}
              className={`text-xs font-bold transition-colors cursor-pointer ${activeView === 'inicio' ? 'text-blue-900 border-b-2 border-blue-900 pb-1' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Início
            </button>
            <button
              onClick={() => setActiveView('biblioteca')}
              className={`text-xs font-bold transition-colors cursor-pointer ${activeView === 'biblioteca' ? 'text-blue-900 border-b-2 border-blue-900 pb-1' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Biblioteca Virtual
            </button>
            <button
              onClick={() => setActiveView('regulamento')}
              className={`text-xs font-bold transition-colors cursor-pointer ${activeView === 'regulamento' ? 'text-blue-900 border-b-2 border-blue-900 pb-1' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Regulamento & Prazos
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar no Portal</span>
              </Link>

              <Link
                href="/auth/register"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Conteúdo Dinâmico Público */}
      <main className="flex-1">
        {activeView === 'inicio' && (
          <div>
            {/* Hero Section Institucional */}
            <section className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-8 border-b border-slate-800">
              <div className="max-w-5xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Plataforma Oficial de Gestão e Homologação de PAP</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
                  Desmaterialização e Controlo Integral dos Trabalhos de Fim de Curso (PAP)
                </h1>

                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  Sistema centralizado para gestão de candidaturas, acompanhamento de orientações,
                  submissão de PAP, auditoria de originalidade e publicação no repositório institucional.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <span>Registar Nova Candidatura (Estudante/Docente)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setActiveView('biblioteca')}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Consultar Biblioteca da PAP</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Três Áreas Funcionais (Estudante, Docente, Coordenação) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">
                  Fluxos Académicos Regulamentares
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Acesso por Perfil Institucional
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Procedimentos desmaterializados para cada membro da comunidade académica
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Alunos */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      Estudantes Finalistas (13º Classe)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Registo individual ou em grupo, indicação de orientador preferencial, submissão de anteprojectos e monografias em formato .pdf ou .docx (máx. 15MB).
                    </p>
                    <ul className="text-xs text-slate-600 space-y-2 mb-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Verificação de similaridade e plágio integrada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Canal de chat direto com o Orientador</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Notificações de pareceres e bancas de júri</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    href="/auth/login"
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center block"
                  >
                    Aceder à Área do Estudante
                  </Link>
                </div>

                {/* 2. Orientadores */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      Corpo Docente (Orientadores)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Supervisão pedagógica de grupos atribuídos, emissão de pareceres regimentais, validação de relatórios e interação contínua.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-2 mb-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Vínculo multi-curso simultâneo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Emissão de despachos e rubrica de avaliação</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Participação em comissões examinadoras</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    href="/auth/login"
                    className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center block"
                  >
                    Aceder à Área do Orientador
                  </Link>
                </div>

                {/* 3. Coordenação */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      Coordenação de Curso & Direção
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Moderação de inscrições de estudantes, fixação e bloqueio de prazos de entrega, sugestão de júris por especialização e homologação de atas.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-2 mb-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Moderação prévia de contas de estudantes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Motor algorítmico de recomendação de júris</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Homologação final e envio para Biblioteca</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    href="/auth/login"
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center block"
                  >
                    Aceder à Gestão da Coordenação
                  </Link>
                </div>
              </div>
            </section>

            {/* Calendário e Prazos Oficiais (RF05) */}
            <section className="bg-slate-100/70 border-t border-b border-slate-200 py-16 px-4 sm:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Calendário Académico & Prazos de Submissão
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Cronograma oficial fixado pela Coordenação Académica
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {deadlines.map((dl) => {
                    const due = new Date(dl.dueDate);
                    return (
                      <div key={dl.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                              {dl.stage === 'anteprojecto' ? 'Fase 1' : dl.stage === 'relatorio_progresso' ? 'Fase 2' : 'Fase 3'}
                            </span>
                            <span className="text-sm font-bold text-slate-800">{dl.title}</span>
                          </div>
                          <p className="text-xs text-slate-600">{dl.description}</p>
                          <span className="text-xs text-slate-400 block">
                            Curso: <strong className="text-slate-600">{dl.courseName}</strong>
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-500 block">Data Limite:</span>
                          <span className="text-sm font-black text-slate-900">
                            {due.toLocaleDateString('pt-PT')} às {due.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Visualização Aberta da Biblioteca Virtual */}
        {activeView === 'biblioteca' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <VirtualLibrary />
          </div>
        )}

        {/* Visualização de Regulamento e Normas */}
        {activeView === 'regulamento' && (
          <section className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-2xl font-black text-slate-900 border-b border-slate-200 pb-4">
                Regulamento dos Trabalhos de Fim de Curso (PAP)
              </h2>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">1. Elegibilidade e Matrícula </h3>
                <p>
                  O acesso ao fluxo de submissão da PAP é exclusivo para estudantes regularmente matriculados no ano terminal do curso (13ª Classe). O estudante deve informar obrigatoriamente o seu curso e indicar um orientador docente no momento do registo.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">2. Formato e Dimensões dos Arquivos </h3>
                <p>
                  Todos os anteprojectos, relatórios parciais e monografias definitivas devem ser submetidos estritamente nos formatos <strong>.pdf</strong> ou <strong>.docx</strong>, com limite máximo inegociável de <strong>15 MB por arquivo</strong>.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">3. Integridade Científica e Prevenção do Plágio</h3>
                <p>
                  Todas as submissões são automaticamente submetidas a auditoria algorítmica de similaridade textual. Trabalhos que excedam os índices regulamentares serão devolvidos para correção ou reprovados pela comissão técnica.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">4. Conclusão de Ciclo e Depósito Legal </h3>
                <p>
                  A conta do estudante ou grupo apenas transita para o estado &ldquo;Concluído&rdquo; após o lançamento da nota e homologação formal da Ata de Defesa pelo Coordenador de Curso. O documento final é automaticamente incorporado à Biblioteca Virtual Institucional.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer inline-block"
                >
                  Registar Inscrição da PAP
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center space-y-1 text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-300">
            © 2026 Sistema de Gestão da PAP. Uige
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Sistema Digital Ativa - Uíge, Angola
          </p>
        </div>
      </footer>
    </div>
  );
}
