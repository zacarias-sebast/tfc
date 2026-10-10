'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AcademicLevel } from '@/types/database';
import {
  GraduationCap,
  Users,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { currentUser, users, courses, registerUser, logout } = useApp();

  const [role, setRole] = useState<'estudante' | 'orientador'>('estudante');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student fields (RN01)
  const [courseId, setCourseId] = useState('');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('13º Nível (Terminal)');
  const [preferredAdvisorId, setPreferredAdvisorId] = useState('');

  // Advisor fields (RN02)
  const [teacherId, setTeacherId] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const clearAllFields = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShowPassword(false);
    setCourseId('');
    setAcademicLevel('13º Nível (Terminal)');
    setPreferredAdvisorId('');
    setTeacherId('');
    setSpecialization('');
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(false);
  };

  // Garante que todos os campos começam 100% limpos ao entrar na página
  useEffect(() => {
    clearAllFields();
  }, []);

  const handleRoleChange = (newRole: 'estudante' | 'orientador') => {
    setRole(newRole);
    setCourseId('');
    setPreferredAdvisorId('');
    setTeacherId('');
    setSpecialization('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const activeAdvisors = users.filter((u) => u.role === 'orientador' && u.status === 'ativo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const isInstitutional = cleanEmail === 'ipuorientacao@gmail.com';

      const res = await registerUser({
        name,
        email: cleanEmail,
        password,
        role,
        phone,
        courseId: courseId, // Obrigatório para Estudante e Orientador
        academicLevel: role === 'estudante' ? academicLevel : undefined,
        preferredAdvisorId: role === 'estudante' ? preferredAdvisorId : undefined,
        teacherId: role === 'orientador' ? teacherId : undefined,
        specialization: role === 'orientador'
          ? specialization.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao realizar o registo.');
      } else {
        // Limpa os campos após submissão com sucesso
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setShowPassword(false);
        setCourseId('');
        setPreferredAdvisorId('');
        setTeacherId('');
        setSpecialization('');

        if (!isInstitutional) {
          setSuccessMessage(
            'Inscrição submetida com e-mail não institucional. Nota: Por norma do sistema, esta conta não é aceite automaticamente e ficará pendente por tempo indeterminado.'
          );
        } else {
          setSuccessMessage(
            'Conta registada com sucesso com o e-mail institucional! A aguardar validação e homologação pela Coordenação de Curso...'
          );
        }
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: unknown) {
      setErrorMessage('Erro inesperado ao registar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-900 selection:text-white">
      {/* Top Header Institucional */}
      <header className="border-b border-slate-200 bg-white shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <Link
          href="/"
          className="flex items-center gap-3 text-slate-900 group cursor-pointer select-none"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight block leading-tight">
              PORTAL ACADÉMICO DE TFC
            </span>
            <span className="text-[11px] text-slate-500 font-medium block">
              Inscrição e Registo Académico
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer px-3.5 py-2 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Início</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-900" />

            <div className="text-center space-y-2 mb-6">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Criar Nova Conta no Portal
              </h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Selecione o seu perfil e preencha os dados institucionais para aceder ao fluxo
              </p>
            </div>

            {/* Alertas */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 mb-5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5 mb-5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Aviso de Sessão Ativa */}
            {currentUser && (
              <div className="mb-5 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs flex items-center justify-between gap-3">
                <div>
                  <span className="text-slate-600 block">Sessão atualmente ativa:</span>
                  <strong className="text-blue-900 font-bold">{currentUser.name}</strong> ({currentUser.role})
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/"
                    className="px-3 py-1.5 bg-blue-900 text-white text-[11px] font-bold rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Ir ao Portal
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      clearAllFields();
                    }}
                    className="px-3 py-1.5 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg hover:bg-rose-200 transition-colors cursor-pointer"
                  >
                    Terminar Sessão
                  </button>
                </div>
              </div>
            )}

            {/* Toggle Tipo de Perfil */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tipo de Perfil Académico:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRoleChange('estudante')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    role === 'estudante'
                      ? 'bg-blue-900 border-blue-900 text-white shadow-md shadow-blue-900/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Estudante (Finalista)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('orientador')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    role === 'orientador'
                      ? 'bg-blue-900 border-blue-900 text-white shadow-md shadow-blue-900/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Orientador (Docente)</span>
                </button>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome e Apelido"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      E-mail Institucional:*
                    </label>
                    <span className="text-[10px] text-blue-900 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Obrigatório: ipuorientacao@gmail.com
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ipuorientacao@gmail.com"
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden transition-colors ${
                        email && email.trim().toLowerCase() !== 'ipuorientacao@gmail.com'
                          ? 'border-amber-400 focus:border-amber-500 bg-amber-50/20'
                          : 'border-slate-200 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                      }`}
                    />
                  </div>
                  {email && email.trim().toLowerCase() !== 'ipuorientacao@gmail.com' ? (
                    <p className="text-[11px] text-amber-700 mt-1.5 flex items-start gap-1 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <span>⚠️ <strong>Atenção:</strong> Usou um e-mail diferente de <code className="bg-amber-100 px-1 rounded font-bold">ipuorientacao@gmail.com</code>. A conta não será aceite e ficará pendente indefinidamente.</span>
                    </p>
                  ) : email && email.trim().toLowerCase() === 'ipuorientacao@gmail.com' ? (
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                      <span>✓ E-mail institucional único reconhecido.</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Utilize o endereço institucional único da instituição para validar o cadastro.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone de Contacto:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+244 9..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Palavra-passe:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Campos de Estudante */}
              {role === 'estudante' && (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    <span>Requisitos de Matrícula Terminal</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Curso de Matrícula:
                    </label>
                    <select
                      required
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900"
                    >
                      <option value="">Selecione o seu curso...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nível Académico:
                      </label>
                      <select
                        value={academicLevel}
                        onChange={(e) => setAcademicLevel(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900"
                      >
                        <option value="13º Nível (Terminal)">13º Nível / 13ª Classe (Terminal)</option>
                        <option value="12º Nível">12º Nível (Não Terminal)</option>
                        <option value="11º Nível">11º Nível (Não Terminal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Orientador Docente Preferencial:
                      </label>
                      <select
                        required
                        value={preferredAdvisorId}
                        onChange={(e) => setPreferredAdvisorId(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900"
                      >
                        <option value="">Indicar docente...</option>
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
                </div>
              )}

              {/* Campos de Orientador */}
              {role === 'orientador' && (
                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                    <Users className="w-3.5 h-3.5 text-teal-700" />
                    <span>Identificação Docente e Afiliação de Curso</span>
                  </div>

                  {/* Seleção Obrigatória de Curso para o Orientador */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Curso de Atuação / Afiliação Académica:*
                    </label>
                    <select
                      required
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-teal-700"
                    >
                      <option value="">Selecione o curso de atuação do docente...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code}) - {c.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nº de Identificação Docente:*
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      placeholder="Ex: DOC-2026-99"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Áreas de Especialização (separadas por vírgula):*
                    </label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Ex: Engenharia de Software, Inteligência Artificial, Redes"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-teal-700"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={clearAllFields}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  Limpar Campos
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'A registar e a autenticar...' : 'Concluir Cadastro & Entrar no Portal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Já possui conta institucional?{' '}
                <Link
                  href="/auth/login"
                  className="font-bold text-blue-900 hover:text-blue-700 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Entrar no Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-[11px] text-slate-500">
        © 2026 Portal Académico de TFC • Sistema de Gestão de Workflow de Trabalhos de Fim de Curso
      </footer>
    </div>
  );
}
