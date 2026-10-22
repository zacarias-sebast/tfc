'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Send,
  Paperclip,
  Users,
  GraduationCap,
  User,
  CheckCheck,
  FileText
} from 'lucide-react';

interface ChatModuleProps {
  initialGroupId?: string;
}

export function ChatModule({ initialGroupId }: ChatModuleProps) {
  const { currentUser, chatMessages, sendMessage, users, groups } = useApp();

  const defaultGroupId =
    initialGroupId ||
    currentUser?.groupId ||
    (groups.length > 0 ? groups[0].id : 'group-1');

  const [activeGroupId, setActiveGroupId] = useState<string>(defaultGroupId);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialGroupId) {
      setActiveGroupId(initialGroupId);
    }
  }, [initialGroupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeGroupId]);

  if (!currentUser) return null;

  // Filter messages for current group
  const currentMessages = chatMessages.filter((m) => m.groupId === activeGroupId);

  // Group list
  const availableGroups =
    currentUser.role === 'orientador'
      ? users
          .filter((u) => u.assignedAdvisorId === currentUser.id && u.role === 'estudante')
          .map((u) => ({
            id: u.groupId || `group-${u.id}`,
            name: `${u.name} (TFC)`,
            course: u.courseName
          }))
      : [
          {
            id: activeGroupId,
            name: currentUser.role === 'estudante'
              ? `Orientação com ${currentUser.assignedAdvisorName || 'Prof. Orientador'}`
              : 'Canal Oficial de TFC',
            course: currentUser.courseName
          }
        ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(activeGroupId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[750px]">
      {/* Top Bar */}
      <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">
              Canal Oficial de Orientação & Comunicação (RF07)
            </h3>
            <p className="text-xs text-slate-500">
              {currentUser.role === 'estudante'
                ? `Contacto com o orientador: ${currentUser.assignedAdvisorName || 'Corpo Docente'}`
                : 'Diálogo direto com os grupos de Trabalho de Fim de Curso'}
            </p>
          </div>
        </div>

        {availableGroups.length > 1 && (
          <select
            value={activeGroupId}
            onChange={(e) => setActiveGroupId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
          >
            {availableGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {currentMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
              <MessageSquare className="w-6 h-6 text-slate-300" />
            </div>
            <p className="font-bold text-slate-700 text-sm">Nenhuma mensagem neste canal ainda</p>
            <p className="text-xs text-slate-400 max-w-xs text-center mt-1">
              Envie uma mensagem ou dúvida sobre metodologia, referências ou cronograma.
            </p>
          </div>
        ) : (
          currentMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                    msg.senderRole === 'orientador'
                      ? 'bg-blue-900 text-white'
                      : isMe
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {msg.senderRole === 'orientador' ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                <div className={`space-y-1 ${isMe ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-bold text-slate-800">{msg.senderName}</span>
                    <span className="uppercase text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {msg.senderRole}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-blue-900 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.fileAttachment && (
                      <div
                        className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-xs ${
                          isMe ? 'bg-blue-800/80 text-blue-100' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">{msg.fileAttachment.name}</span>
                        <span className="text-[10px] opacity-75">
                          {(msg.fileAttachment.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/80 bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder="Escreva a sua mensagem para o orientador / grupo..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
        />

        <button
          type="submit"
          className="p-3 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
