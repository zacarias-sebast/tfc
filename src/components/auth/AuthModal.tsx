'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/shared/Modal';
import { UserRole, AcademicLevel } from '@/types/database';
import {
  LogIn,
  UserPlus,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Lock,
  Mail,
  User,
  BookOpen
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  initialEmail?: string;
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login', initialEmail = '' }: AuthModalProps) {
  const { users, courses, login, registerUser } = useApp();

  const [authTab, setAuthTab] = useState<'login' | 'register'>(defaultTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState(initialEmail || '');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regRole, setRegRole] = useState<'estudante' | 'orientador'>('estudante');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  // Student fields (RN01, Restrição de Nível)
  const [regCourseId, setRegCourseId] = useState('');
  const [regAcademicLevel, setRegAcademicLevel] = useState<AcademicLevel>('13º Nível (Terminal)');
  const [regPreferredAdvisorId, setRegPreferredAdvisorId] = useState('');
  // Advisor fields (RN02)
  const [regTeacherId, setRegTeacherId] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('');

  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');
  const [registerErrorMsg, setRegisterErrorMsg] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const resetLoginForm = () => {
    setLoginEmail(initialEmail || '');
    setLoginPass('');
    setLoginError('');
    setLoginLoading(false);
  };

  const resetRegisterForm = () => {
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegPhone('');
    setRegCourseId('');
    setRegAcademicLevel('13º Nível (Terminal)');
    setRegPreferredAdvisorId('');
    setRegTeacherId('');
    setRegSpecialization('');
    setRegisterErrorMsg('');
    setRegisterSuccessMsg('');
    setRegisterLoading(false);
  };

  // Limpa os formulários sempre que o modal abre ou fecha
  React.useEffect(() => {
    if (isOpen) {
      setAuthTab(defaultTab);
      resetLoginForm();
      resetRegisterForm();
    }
  }, [isOpen, defaultTab, initialEmail]);

  const activeAdvisors = users.filter((u) => u.role === 'orientador' && u.status === 'ativo');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await login(loginEmail, loginPass);
      if (res.success) {
        resetLoginForm();
        onClose();
      } else {
        setLoginError(res.error || 'Credenciais inválidas. Verifique o seu email institucional e palavra-passe.');
      }
    } catch (err: unknown) {
      setLoginError('Ocorreu um erro ao autenticar. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterErrorMsg('');
    setRegisterSuccessMsg('');
    setRegisterLoading(true);

    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone,
        courseId: regCourseId,
        academicLevel: regRole === 'estudante' ? regAcademicLevel : undefined,
        preferredAdvisorId: regRole === 'estudante' ? regPreferredAdvisorId : undefined,
        teacherId: roleToRegisterTeacher(),
        specialization: regRole === 'orientador'
          ? regSpecialization.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      });

      if (!res.success) {
        setRegisterErrorMsg(res.error || 'Erro ao realizar o registo.');
      } else {
        const savedRole = regRole;
        resetRegisterForm();
        setRegisterSuccessMsg(
          savedRole === 'estudante'
            ? 'Registo efetuado com sucesso! A sua conta foi registada no Supabase e enviada para moderação da Coordenação.'
            : 'Registo de docente realizado com sucesso! A sua conta foi enviada e aguarda validação pela Coordenação de Curso.'
        );
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: unknown) {
      setRegisterErrorMsg('Ocorreu um erro ao registar a conta.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const roleToRegisterTeacher = () => (regRole === 'orientador' ? regTeacherId : undefined);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetLoginForm();
        resetRegisterForm();
        onClose();
      }}
      title="Acesso ao Sistema de Gestão de TFC"
      subtitle="Autenticação segura e registo com validação de regras de negócio"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Toggle Login vs Register */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setAuthTab('login');
              resetLoginForm();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${authTab === 'login'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Entrar no Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('register');
              resetRegisterForm();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${authTab === 'register'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* TAB 1: LOGIN */}
        {authTab === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Institucional:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ipuorientacao@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Palavra-passe de Acesso:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loginLoading ? 'A validar credenciais...' : 'Autenticar no Portal'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: REGISTER */}
        {authTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {registerErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{registerErrorMsg}</span>
              </div>
            )}

            {registerSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{registerSuccessMsg}</span>
              </div>
            )}


            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Perfil:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('estudante')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${regRole === 'estudante'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  Estudante (Finalista)
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('orientador')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${regRole === 'orientador'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  Orientador (Professor)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nome e Apelido"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mail Institucional:
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ipuorientacao@gmail.com"
                  className={`w-full p-2 bg-white border rounded-xl text-xs focus:outline-blue-500 ${
                    regEmail && regEmail.trim().toLowerCase() !== 'ipuorientacao@gmail.com'
                      ? 'border-amber-400 bg-amber-50/30'
                      : 'border-slate-200'
                  }`}
                />
                {regEmail && regEmail.trim().toLowerCase() !== 'ipuorientacao@gmail.com' ? (
                  <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                    ⚠️ Não institucional: conta ficará pendente indefinidamente.
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Obrigatório: ipuorientacao@gmail.com
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone:</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+244 9..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha:</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>
            </div>

            {/* ESTUDANTE ESPECÍFICO (RN01, Restrição de Nível) */}
            {regRole === 'estudante' && (
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2.5">
                <span className="text-[11px] font-bold text-blue-900 block">
                  Regras de Inscrição Académica:
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Curso de Matrícula:
                  </label>
                  <select
                    required
                    value={regCourseId}
                    onChange={(e) => setRegCourseId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                  >
                    <option value="">Selecione o seu curso...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Nível Académico Atual:
                    </label>
                    <select
                      value={regAcademicLevel}
                      onChange={(e) => setRegAcademicLevel(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                    >
                      <option value="13º Nível">
                        13º Classe (conclusão)
                      </option>

                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Orientador Preferencial:
                    </label>
                    <select
                      required
                      value={regPreferredAdvisorId}
                      onChange={(e) => setRegPreferredAdvisorId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                    >
                      <option value="">Indicar professor...</option>
                      {activeAdvisors.length === 0 && (
                        <option value="pendente_coordenacao">
                          Aguardar Atribuição pela Coordenação
                        </option>
                      )}
                      {activeAdvisors.map((adv) => (
                        <option key={adv.id} value={adv.id}>
                          {adv.name} ({adv.specialization?.join(', ') || 'Docente'})
                        </option>
                      ))}
                      {activeAdvisors.length > 0 && (
                        <option value="pendente_coordenacao">
                          Sem preferência (Atribuição direta pela Coordenação)
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500">
                  <strong>Atenção:</strong> De acordo com as Premissas do Escopo, apenas estudantes matriculados no ano terminal (13º Classe) podem aceder ao fluxo de TFC. A conta ficará em estado <em>Pendente</em> até aprovação do Coordenador.
                </p>
              </div>
            )}


            {regRole === 'orientador' && (
              <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-2xl space-y-2.5">
                <span className="text-[11px] font-bold text-teal-900 block">
                  Perfil e Afiliação Docente:
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Curso de Atuação / Afiliação:*
                  </label>
                  <select
                    required
                    value={regCourseId}
                    onChange={(e) => setRegCourseId(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                  >
                    <option value="">Selecione o seu curso...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Nº de Identificação Docente:*
                  </label>
                  <input
                    type="text"
                    required
                    value={regTeacherId}
                    onChange={(e) => setRegTeacherId(e.target.value)}
                    placeholder="Ex: DOC-2026-99"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Áreas de Especialização (separadas por vírgula):
                  </label>
                  <input
                    type="text"
                    required
                    value={regSpecialization}
                    onChange={(e) => setRegSpecialization(e.target.value)}
                    placeholder="Ex:Engenharia de Software"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {registerLoading ? 'A registar conta no Supabase...' : 'Concluir Registo'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
