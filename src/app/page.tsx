'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PublicLandingPage } from '@/components/home/PublicLandingPage';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { AdvisorDashboard } from '@/components/dashboard/AdvisorDashboard';
import { CoordinatorDashboard } from '@/components/dashboard/CoordinatorDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { JuryManagement } from '@/components/tfc/JuryManagement';
import { ChatModule } from '@/components/chat/ChatModule';
import { VirtualLibrary } from '@/components/library/VirtualLibrary';
import { SubmissionModal } from '@/components/tfc/SubmissionModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { Menu, X, Clock, GraduationCap, LogOut, AlertTriangle } from 'lucide-react';

export default function Home() {
  const { currentUser, logout } = useApp();

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authInitialEmail, setAuthInitialEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatGroupId, setChatGroupId] = useState<string | undefined>(undefined);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300">Carregando Portal TFC...</p>
      </div>
    );
  }

  // 1. VISITANTE NÃO AUTENTICADO: Apresenta Página Inicial Institucional Pública
  if (!currentUser) {
    return (
      <>
        <PublicLandingPage
          onOpenAuth={(tab, email) => {
            setAuthModalTab(tab);
            setAuthInitialEmail(email || '');
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab={authModalTab}
          initialEmail={authInitialEmail}
        />
      </>
    );
  }

  // 2. UTILIZADOR COM CONTA EM ANÁLISE / PENDENTE (RF02)
  // Estudantes e Orientadores não entram no portal (Sidebar/Menus) até validação da Coordenação
  if (currentUser.status === 'pendente') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        {/* Topbar Institucional Limpa */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Portal TFC</h1>
              <p className="text-xs text-slate-500">
                Workflow Académico Integrado • {currentUser.role === 'orientador' ? (currentUser.department || 'Corpo Docente') : (currentUser.courseName || 'Ensino Superior')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-800">{currentUser.name}</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Pendente de Validação
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminar Sessão</span>
            </button>
          </div>
        </header>

        {/* Mensagem oficial de espera */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl">
            {currentUser.role === 'estudante' ? (
              /* Cartão do Estudante preservado 100% intacto */
              <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-8 text-center shadow-sm">
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
                {currentUser.isNonInstitutionalEmail || currentUser.email.toLowerCase() !== 'ipuorientacao@gmail.com' ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 text-left mt-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Aviso Regulamentar:</strong> A sua conta foi registada com um e-mail individual externo (<code>{currentUser.email}</code>). De acordo com os regulamentos de TFC, contas com e-mails não institucionais não são aceites e permanecerão sempre pendentes até regularização institucional (<code>ipuorientacao@gmail.com</code>).
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 mt-4 font-medium">
                    Assim que a sua conta for validada, receberá uma notificação no sistema para iniciar a submissão do Anteprojecto.
                  </p>
                )}
              </div>
            ) : (
              /* Cartão do Docente Orientador em harmonia */
              <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Conta de Orientador em Análise pela Coordenação (RF02)
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Olá, <strong className="text-slate-800">{currentUser.name}</strong>! O seu registo como Docente Orientador foi submetido com sucesso e está a aguardar validação e homologação pela Coordenação de Curso.
                </p>
                <div className="bg-white p-4 rounded-2xl border border-amber-200 text-left text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Curso de Afiliação:</span>
                    <span className="font-bold text-slate-800">{currentUser.courseName || 'Tecnologias'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Identificação Docente:</span>
                    <span className="font-bold text-slate-800">{currentUser.teacherId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Especializações Declaradas:</span>
                    <span className="font-bold text-slate-800">{currentUser.specialization?.join(', ') || 'Geral'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Departamento:</span>
                    <span className="font-bold text-slate-800">{currentUser.department || 'Tecnologias'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Capacidade / Quota:</span>
                    <span className="font-bold text-slate-800">{currentUser.maxGroupsQuota || 5} Grupos Máximos</span>
                  </div>
                </div>
                {currentUser.isNonInstitutionalEmail || currentUser.email.toLowerCase() !== 'ipuorientacao@gmail.com' ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 text-left mt-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Aviso Regulamentar:</strong> A sua conta de docente foi registada com um e-mail externo (<code>{currentUser.email}</code>). Conforme as normas, a conta não será aceite e permanecerá em estado pendente por tempo indeterminado.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 mt-4 font-medium">
                    Assim que a sua conta for validada pela Coordenação, terá acesso imediato ao painel de acompanhamento e orientação dos grupos de TFC.
                  </p>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          © 2026 Portal de Trabalhos de Fim de Curso • Regulamento Académico
        </footer>
      </div>
    );
  }

  // 3. UTILIZADOR HOMOLOGADO / ATIVO: Acesso Completo ao Portal com Barra Lateral
  const handleOpenChatForGroup = (groupId: string) => {
    setChatGroupId(groupId);
    setCurrentTab('chat');
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return currentUser.role === 'admin'
          ? 'Painel da Administração Geral'
          : currentUser.role === 'coordenador'
          ? 'Coordenação do Curso'
          : currentUser.role === 'orientador'
          ? 'Painel do Orientador'
          : 'Painel do Estudante';
      case 'submeter':
      case 'minhas_submissoes':
        return 'Trabalho de Fim de Curso';
      case 'orientandos':
        return 'Meus Grupos & Orientandos';
      case 'gestao_tfcs':
      case 'validar_contas':
      case 'prazos':
        return 'Coordenação de Curso';
      case 'bancas':
        return 'Bancas de Júri & Defesas';
      case 'chat':
        return 'Canal de Comunicação (Chat)';
      case 'biblioteca':
        return 'Biblioteca Virtual';
      case 'admin_cursos':
        return 'Administração do Sistema';
      default:
        return 'Portal TFC';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header Toggle */}
      <div className="md:hidden bg-[#0b132b] text-white p-4 flex items-center justify-between border-b border-slate-800">
        <span className="font-extrabold text-sm tracking-tight">Portal TFC</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block shrink-0 z-40`}>
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          onOpenAuthModal={() => {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={getPageTitle()}
          subtitle="Sistema de Gestão de Workflow Académico para Trabalhos de Fim de Curso"
          onOpenAuthModal={() => {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* DASHBOARD GERAL */}
          {currentTab === 'dashboard' && (
            <>
              {currentUser.role === 'estudante' && (
                <StudentDashboard
                  onNavigate={setCurrentTab}
                  onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
                />
              )}
              {currentUser.role === 'orientador' && (
                <AdvisorDashboard onOpenChat={handleOpenChatForGroup} />
              )}
              {currentUser.role === 'coordenador' && (
                <CoordinatorDashboard onNavigateToJuries={() => setCurrentTab('bancas')} />
              )}
              {currentUser.role === 'admin' && <AdminDashboard />}
            </>
          )}

          {/* ESTUDANTE: SUBMISSÃO OU DETALHES */}
          {(currentTab === 'submeter' || currentTab === 'minhas_submissoes') && (
            <StudentDashboard
              onNavigate={setCurrentTab}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            />
          )}

          {/* ORIENTADOR: MEUS ORIENTANDOS */}
          {currentTab === 'orientandos' && (
            <AdvisorDashboard onOpenChat={handleOpenChatForGroup} />
          )}

          {/* COORDENADOR: GESTÃO TFCS, CONTAS, PRAZOS */}
          {(currentTab === 'gestao_tfcs' || currentTab === 'validar_contas' || currentTab === 'prazos') && (
            <CoordinatorDashboard onNavigateToJuries={() => setCurrentTab('bancas')} />
          )}

          {/* BANCAS DE JÚRI (RF10, RN04) */}
          {currentTab === 'bancas' && <JuryManagement />}

          {/* CHAT EM TEMPO REAL (RF07) */}
          {currentTab === 'chat' && <ChatModule initialGroupId={chatGroupId} />}

          {/* BIBLIOTECA VIRTUAL (RF11) */}
          {currentTab === 'biblioteca' && <VirtualLibrary />}

          {/* ADMIN: CURSOS */}
          {currentTab === 'admin_cursos' && <AdminDashboard />}
        </main>
      </div>

      {/* Modais Globais */}
      <SubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}
