'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ChatMessage } from '@/types/database';
import { RoleBadge } from '@/components/shared/Badge';
import {
  MessageSquare,
  Send,
  Paperclip,
  FileText,
  Download,
  Users,
  Smile,
  X,
  Clock,
  Sparkles
} from 'lucide-react';

interface ChatModuleProps {
  initialGroupId?: string;
}

export function ChatModule({ initialGroupId }: ChatModuleProps) {
  const { currentUser, groups, chatMessages, sendMessage } = useApp();

  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find relevant groups for the user
  const availableGroups = groups.filter(
    (g) =>
      currentUser?.role === 'admin' ||
      currentUser?.role === 'coordenador' ||
      g.advisorId === currentUser?.id ||
      g.leaderId === currentUser?.id ||
      (currentUser?.id ? g.memberIds.includes(currentUser.id) : false)
  );

  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId || (availableGroups[0]?.id || 'group-1')
  );

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || availableGroups[0];
  const groupMessages = chatMessages.filter((m) => m.groupId === selectedGroupId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [groupMessages.length, selectedGroupId]);

  if (!currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    let fileAttachment: ChatMessage['fileAttachment'];
    if (attachedFile) {
      fileAttachment = {
        name: attachedFile.name,
        url: URL.createObjectURL(attachedFile),
        size: attachedFile.size,
        type: attachedFile.type
      };
    }

    sendMessage(selectedGroupId, inputText.trim() || 'Ficheiro em anexo:', fileAttachment);
    setInputText('');
    setAttachedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row h-[750px] max-h-[80vh]">
      {/* Sidebar: Grupos de Orientação */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200/80 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Canais de Comunicação (RF07)
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Comunicação direta em tempo real entre estudantes e orientadores
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {availableGroups.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Nenhum canal ativo no momento
            </div>
          ) : (
            availableGroups.map((group) => {
              const isSelected = group.id === selectedGroupId;
              const lastMsg = chatMessages
                .filter((m) => m.groupId === group.id)
                .slice(-1)[0];

              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate">{group.name}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {lastMsg
                        ? new Date(lastMsg.createdAt).toLocaleTimeString('pt-PT', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : ''}
                    </span>
                  </div>

                  <p
                    className={`text-[11px] truncate ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {lastMsg ? lastMsg.content : 'Inicie a conversa...'}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isSelected
                          ? 'bg-blue-700/60 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {group.advisorName || 'Orientador a atribuir'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header do Chat */}
        {activeGroup ? (
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/80">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>{activeGroup.name}</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {activeGroup.courseName}
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Orientador: <strong className="text-slate-700">{activeGroup.advisorName}</strong> • Membros:{' '}
                {activeGroup.memberNames?.join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Ativo</span>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-slate-200 text-xs text-slate-400">
            Selecione uma conversa
          </div>
        )}

        {/* Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
          {groupMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">Nenhuma mensagem trocada ainda</p>
              <p className="text-xs">
                Utilize este espaço para alinhar dúvidas, correções de capítulos e orientações de TFC.
              </p>
            </div>
          ) : (
            groupMessages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-700">{msg.senderName}</span>
                    <RoleBadge role={msg.senderRole} />
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <p>{msg.content}</p>

                    {/* Ficheiro em anexo (RF07) */}
                    {msg.fileAttachment && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isMine
                            ? 'bg-blue-700/60 border-blue-500 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="font-bold truncate">{msg.fileAttachment.name}</span>
                        </div>

                        <a
                          href={msg.fileAttachment.url}
                          download={msg.fileAttachment.name}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isMine
                              ? 'hover:bg-blue-800 text-white'
                              : 'hover:bg-slate-200 text-blue-600'
                          }`}
                          title="Descarregar anexo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white">
          {attachedFile && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold truncate">{attachedFile.name}</span>
                <span className="text-[10px] text-slate-500">
                  ({(attachedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Anexar ficheiro (.pdf, .docx, imagens)"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escreva a sua mensagem para o orientador/grupo..."
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-blue-500 text-slate-800"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !attachedFile}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
