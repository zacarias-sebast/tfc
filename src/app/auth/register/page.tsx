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
  EyeOff
} from 'lucide-react';

const SYMBOLS = "!@#$%&*?-_+=";

const passwordRules = (pw: string) => ({
  length: pw.length >= 8,
  lower: /[a-z]/.test(pw),
  upper: /[A-Z]/.test(pw),
  number: /\d/.test(pw),
  symbol: /[^A-Za-z0-9]/.test(pw),
});

const isStrongPassword = (pw: string) =>
  Object.values(passwordRules(pw)).every(Boolean);

function generateStrongPassword(length = 14) {
  const sets = [
    "abcdefghijkmnopqrstuvwxyz",
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "23456789",
    SYMBOLS,
  ];
  const all = sets.join("");
  const rand = (max: number) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  };

  const chars = sets.map((s) => s[rand(s.length)]);
  while (chars.length < length) chars.push(all[rand(all.length)]);

  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export default function RegisterPage() {
  const router = useRouter();
  const { currentUser, users, courses, registerUser, logout } = useApp();

  const [role, setRole] = useState<'estudante' | 'orientador'>('estudante');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const rules = passwordRules(password);

  const handleSuggest = () => {
    setPassword(generateStrongPassword());
    setShowPassword(true);
  };

  // Student fields
  const [courseId, setCourseId] = useState('');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('13º Classe (Terminal)');
  const [preferredAdvisorId, setPreferredAdvisorId] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  // Advisor fields 
  const [teacherId, setTeacherId] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    setGroupMembers((prev) => [...prev, newMemberName.trim()]);
    setNewMemberName('');
  };

  const handleRemoveMember = (idx: number) => {
    setGroupMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAllFields = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShowPassword(false);
    setCourseId('');
    setAcademicLevel('13º Classe (Terminal)');
    setPreferredAdvisorId('');
    setGroupMembers([]);
    setNewMemberName('');
    setTeacherId('');
    setSpecialization('');
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(false);
  };

  useEffect(() => {
    clearAllFields();
  }, []);

  const handleRoleChange = (newRole: 'estudante' | 'orientador') => {
    setRole(newRole);
    setCourseId('');
    setPreferredAdvisorId('');
    setGroupMembers([]);
    setNewMemberName('');
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

      const res = await registerUser({
        name,
        email: cleanEmail,
        password,
        role,
        phone,
        courseId: courseId,
        academicLevel: role === 'estudante' ? academicLevel : undefined,
        preferredAdvisorId: role === 'estudante' ? preferredAdvisorId : undefined,
        groupMembers: role === 'estudante' ? groupMembers : undefined,
        teacherId: role === 'orientador' ? teacherId : undefined,
        specialization: role === 'orientador'
          ? specialization.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao realizar o registo.');
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setShowPassword(false);
        setCourseId('');
        setPreferredAdvisorId('');
        setGroupMembers([]);
        setNewMemberName('');
        setTeacherId('');
        setSpecialization('');

        setSuccessMessage(
          'Registo submetido com sucesso! A sua conta foi enviada para a Coordenação de Curso para validação dos dados académicos.'
        );
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
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block leading-tight truncate">
              PORTAL ACADÉMICO DA PAP
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
              Inscrição e Registo Académico
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer px-2.5 sm:px-3.5 py-2 rounded-xl border border-slate-200 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Voltar ao Início</span><span className="sm:hidden">Voltar</span></span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl shadow-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-900" />

            <div className="text-center space-y-1.5 sm:space-y-2 mb-5 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
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
                  <span className="text-slate-600 block">Sessão ativa:</span>
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
                  <span>Aluno</span>
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
                  <span>Orientador</span>
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
                      placeholder="Primeiro e último nome"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone de Contacto:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={9}
                      pattern="9[0-9]{8}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      placeholder="+244 943 ... ..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Use E-mail: ipuorientacao@gmail.com*
                    </label>
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
              
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Senha:</label>
                    <button
                      type="button"
                      onClick={handleSuggest}
                      className="text-[11px] font-semibold text-blue-900 hover:underline"
                    >
                      Sugerir senha forte
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                    {[
                      { ok: rules.length, label: "Mínimo 8 caracteres" },
                      { ok: rules.lower, label: "Letra minúscula" },
                      { ok: rules.upper, label: "Letra maiúscula" },
                      { ok: rules.number, label: "Número" },
                      { ok: rules.symbol, label: "Símbolo (!@#$%...)" },
                    ].map(({ ok, label }) => (
                      <li key={label} className={ok ? "text-green-600" : "text-slate-400"}>
                        {ok ? "✓" : "○"} {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Campos de Estudante */}
              {role === 'estudante' && (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                    <span>Requisitos de Matrícula</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Curso a frequentar:
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
                        <option value="13ª Classe (Conclusão)">13ª Classe (Conclusão)</option>
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

                  {/* Opção de Adicionar Elementos do Grupo */}
                  <div className="pt-3 border-t border-blue-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Elementos do Grupo (Colegas de Equipa):
                      </label>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Opcional
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                      Se o seu TFC for em grupo, adicione os nomes dos seus colegas. Apenas você terá acesso ao sistema com estas credenciais; os nomes dos seus colegas ficam devidamente registados no sistema para o trabalho.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMember();
                          }
                        }}
                        placeholder="Nome completo do colega de grupo..."
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="px-3.5 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
                      >
                        + Adicionar
                      </button>
                    </div>

                    {groupMembers.length > 0 && (
                      <div className="mt-2.5 bg-white/90 p-2.5 rounded-xl border border-blue-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Colegas adicionados ({groupMembers.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {groupMembers.map((member, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                            >
                              <span>{member}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(idx)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer text-xs font-bold leading-none ml-0.5"
                                title="Remover"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Campos de Orientador */}
              {role === 'orientador' && (
                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                    <Users className="w-3.5 h-3.5 text-teal-700" />
                    <span>Afiliação de Curso</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Curso de Atuação:*
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
                      placeholder="Ex: DC-2024-0326"
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
                      placeholder="Ex: Engenharia de Software, Redes e Comunicações, Sistemas Distribuídos"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-teal-700"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={clearAllFields}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center"
                >
                  Limpar Campos
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
                >
                  <span>{loading ? 'A registar e a autenticar...' : 'Concluir Cadastro & Entrar no Portal'}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
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

      <footer className="border-t border-slate-200/80 bg-slate-50 py-6 px-4 text-center space-y-1">
        <p className="text-xs sm:text-sm font-medium text-slate-600">
          © 2026 Sistema de Gestão da PAP. Uige
        </p>
        <p className="text-[11px] sm:text-xs text-slate-400">
          Sistema Digital Ativa - Uíge, Angola
        </p>
      </footer>
    </div>
  );
}
