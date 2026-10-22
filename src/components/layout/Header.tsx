'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { RoleBadge } from '@/components/shared/Badge';
import { 
  Bell, 
  RotateCcw, 
  ChevronDown, 
  LogOut,
  User
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
}

export function Header({ 
  title = 'Painel de Controlo', 
  subtitle = 'Gestão Integrada de Trabalhos de Fim de Curso',
  onOpenAuthModal,
  onOpenProfileModal
}: HeaderProps) {
  const { 
    currentUser, 
    notifications, 
    logout,
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    resetToDemoData 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userNotifications = currentUser ? notifications.filter((n) => n.userId === currentUser.id) : [];
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
      {/* Title & Path */}
      <div className="min-w-0 flex-1 mr-2">
        <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
          {title}
        </h1>
        <p className="text-xs text-slate-500 font-medium truncate">
          {subtitle} {currentUser?.courseName ? `• ${currentUser.courseName}` : ''}
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {currentUser ? (
          <>
            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Notificações em tempo real "
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">Notificações</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                          {unreadCount} novas
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Marcar todas lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {userNotifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        Nenhuma notificação no momento.
                      </p>
                    ) : (
                      userNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.isRead
                              ? 'bg-slate-50/50 border-slate-100 text-slate-600 opacity-75'
                              : 'bg-blue-50/40 border-blue-100 text-slate-800 font-medium shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-800">{n.title}</span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(n.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-xs bg-white"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>

                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    {currentUser.status === 'pendente' && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                        Pendente
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {currentUser.role === 'admin'
                      ? 'Administrador Geral'
                      : currentUser.role === 'coordenador'
                      ? 'Coordenação'
                      : currentUser.role === 'orientador'
                      ? 'Orientador'
                      : 'Estudante'}
                  </div>
                </div>

                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                  <div className="p-3 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    <div className="mt-1.5">
                      <RoleBadge role={currentUser.role} />
                    </div>
                  </div>

                  {onOpenProfileModal && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfileModal();
                      }}
                      className="w-full flex items-center gap-2 p-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-900 rounded-xl font-semibold transition-colors cursor-pointer mb-1"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>O Meu Perfil / Atualizar</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 p-2.5 text-xs text-rose-700 hover:bg-rose-50 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminar Sessão</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Iniciar Sessão
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
