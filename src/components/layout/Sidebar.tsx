'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  Users,
  ShieldCheck,
  CalendarClock,
  Award,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Settings2,
  UserPlus,
  BookMarked,
  LogOut,
  User
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
}

export function Sidebar({ currentTab, onTabChange, onOpenAuthModal, onOpenProfileModal }: SidebarProps) {
  const { currentUser, users, submissions, logout } = useApp();

  if (!currentUser) return null;

  const pendingUsersCount = users.filter((u) => u.role === 'estudante' && u.status === 'pendente').length;
  const submissionsPendingCount = submissions.filter((s) => s.status === 'submetido' || s.status === 'em_revisao').length;

  const role = currentUser.role;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      icon: LayoutDashboard,
      roles: ['admin', 'coordenador', 'orientador', 'estudante'],
    },
    {
      id: 'submeter',
      label: 'Submissão de TFC',
      icon: UploadCloud,
      roles: ['estudante'],
      badge: currentUser.status === 'pendente' ? 'Requer Validação' : undefined,
    },
    {
      id: 'minhas_submissoes',
      label: 'Meu Trabalho de Fim de Curso',
      icon: FileCheck2,
      roles: ['estudante'],
    },
    {
      id: 'orientandos',
      label: 'Meus Orientandos',
      icon: Users,
      roles: ['orientador'],
      badge: submissionsPendingCount > 0 ? `${submissionsPendingCount} novos` : undefined,
    },
    {
      id: 'gestao_tfcs',
      label: 'Gestão de TFCs',
      icon: BookMarked,
      roles: ['coordenador'],
    },
    {
      id: 'validar_contas',
      label: 'Validação de Contas',
      icon: ShieldCheck,
      roles: ['coordenador', 'admin'],
      badge: pendingUsersCount > 0 ? `${pendingUsersCount} pendentes` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'prazos',
      label: 'Controlo de Prazos',
      icon: CalendarClock,
      roles: ['coordenador', 'admin'],
    },
    {
      id: 'bancas',
      label: 'Bancas de Júri & Defesas',
      icon: Award,
      roles: ['coordenador', 'estudante', 'admin'],
    },
    {
      id: 'chat',
      label: 'Canal de Comunicação',
      icon: MessageSquare,
      roles: ['estudante', 'orientador'],
    },
    {
      id: 'biblioteca',
      label: 'Biblioteca Virtual',
      icon: BookOpen,
      roles: ['admin', 'coordenador', 'orientador', 'estudante'],
    },
    {
      id: 'admin_cursos',
      label: 'Cursos & Perfis',
      icon: Settings2,
      roles: ['admin'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 sidebar-navy text-slate-100 flex flex-col shrink-0 min-h-screen border-r border-slate-800 shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-white block">
            Portal TFC
          </span>
          <span className="text-[10px] text-blue-300 font-medium block">
            Workflow Académico Integrado
          </span>
        </div>
      </div>

      {/* Role Pill Banner */}
      <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Perfil:
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          {role.toUpperCase()}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs ${
                    item.badgeColor || 'bg-blue-800 text-blue-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info / Logout Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/40 text-blue-300 font-bold flex items-center justify-center border border-blue-500/30">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
          </div>
        </div>

        {onOpenProfileModal && (
          <button
            onClick={onOpenProfileModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700/60"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>O Meu Perfil</span>
          </button>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-rose-800/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Terminar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
