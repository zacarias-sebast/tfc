import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: BadgeProps) {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  switch (status) {
    case 'ativo':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Ativo';
      break;
    case 'pendente':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Pendente';
      break;
    case 'rejeitado':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Rejeitado';
      break;
    case 'desativado':
      bg = 'bg-gray-100 text-gray-500 border-gray-200';
      label = 'Desativado';
      break;
    case 'submetido':
      bg = 'bg-sky-50 text-sky-700 border-sky-200';
      label = 'Submetido';
      break;
    case 'em_revisao':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      label = 'Em Revisão';
      break;
    case 'alteracoes_solicitadas':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Correções Solicitadas';
      break;
    case 'aprovado_orientador':
      bg = 'bg-teal-50 text-teal-700 border-teal-200';
      label = 'Aprovado pelo Orientador';
      break;
    case 'aprovado_coordenador':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Aprovado pela Coordenação';
      break;
    case 'reprovado':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Reprovado';
      break;
    case 'defendido':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Defendido em Júri';
      break;
    case 'homologado':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      label = 'Homologado & Publicado 🏆';
      break;
    case 'agendada':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Banca Agendada';
      break;
    case 'realizada':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Banca Realizada';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      {label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  let color = 'bg-slate-100 text-slate-800 border-slate-300';
  let label = role;

  switch (role) {
    case 'admin':
      color = 'bg-purple-100 text-purple-900 border-purple-300';
      label = 'Administrador-Geral';
      break;
    case 'coordenador':
      color = 'bg-blue-100 text-blue-900 border-blue-300';
      label = 'Coordenador do Curso';
      break;
    case 'orientador':
      color = 'bg-teal-100 text-teal-900 border-teal-300';
      label = 'Orientador (Professor)';
      break;
    case 'estudante':
      color = 'bg-indigo-100 text-indigo-900 border-indigo-300';
      label = 'Estudante (Finalista)';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}
