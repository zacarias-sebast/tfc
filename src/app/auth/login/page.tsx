'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, login, logout } = useApp();
  const [imgError, setImgError] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Limpa os campos 
  useEffect(() => {
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        setEmail('');
        setPassword('');
        router.push('/');
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas. Verifique o seu endereço institucional e senha.');
      }
    } catch (err: unknown) {
      setErrorMessage('Erro ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-900 selection:text-white">
      
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
              Sistema de Gestão de Workflow de Trabalhos da PAP
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
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* Card Principal de Autenticação */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-900" />

            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 mb-2 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Acesso ao Portal
              </h1>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Autentique-se com o seu e-mail institucional e palavra-passe registada
              </p>
            </div>

            {/* Alerta de Erro */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 mb-5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Aviso de Sessão Ativa Existente com opção de Sair */}
            {currentUser && (
              <div className="mb-5 p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs flex items-center justify-between gap-2">
                <span className="text-slate-700">
                  Sessão ativa: <strong className="text-blue-900">{currentUser.name}</strong> ({currentUser.role})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setEmail('');
                    setPassword('');
                    setErrorMessage('');
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer shrink-0"
                >
                  Terminar Sessão
                </button>
              </div>
            )}


            {/* Formulário de Login */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Endereço de E-mail Institucional:
                  </label>
                  <span className="text-[10px] text-blue-900 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    ipuorientacao@gmail.com
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ipuorientacao@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Palavra-passe:
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">

                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setPassword('');
                    setErrorMessage('');
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'A autenticar...' : 'Entrar no Portal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Alternar para Registo */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Ainda não possui conta registada?{' '}
                <Link
                  href="/auth/register"
                  className="font-bold text-blue-900 hover:text-blue-700 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Criar Nova Conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
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
