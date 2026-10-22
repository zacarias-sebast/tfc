'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase/client';
import { Modal } from '@/components/shared/Modal';
import { AcademicLevel } from '@/types/database';
import { RoleBadge, StatusBadge } from '@/components/shared/Badge';
import {
  User,
  Mail,
  Phone,
  Lock,
  BookOpen,
  GraduationCap,
  Building,
  Award,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  ShieldCheck
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { currentUser, courses, updateUserProfile } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student specific
  const [courseId, setCourseId] = useState('');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('13º Classe (Terminal)');
  const [studentNumber, setStudentNumber] = useState('');

  // Advisor specific
  const [teacherId, setTeacherId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');
  const [maxGroupsQuota, setMaxGroupsQuota] = useState(5);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setPassword(currentUser.password || '');
      setConfirmPassword(currentUser.password || '');
      setCourseId(currentUser.courseId || '');
      setAcademicLevel(currentUser.academicLevel || '13º Nível (Terminal)');
      setStudentNumber(currentUser.studentNumber || '');
      setTeacherId(currentUser.teacherId || '');
      setSpecialization(currentUser.specialization ? currentUser.specialization.join(', ') : '');
      setDepartment(currentUser.department || '');
      setMaxGroupsQuota(currentUser.maxGroupsQuota || 5);
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [currentUser, isOpen]);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('O nome completo é obrigatório.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const selectedCourse = courses.find((c) => c.id === courseId);
      const updatedData = {
        ...currentUser,
        name: name.trim(),
        phone: phone.trim(),
        password: password ? password : currentUser.password,
        courseId: currentUser.role === 'estudante' ? courseId : currentUser.courseId,
        courseName: currentUser.role === 'estudante' ? selectedCourse?.name || currentUser.courseName : currentUser.courseName,
        academicLevel: currentUser.role === 'estudante' ? academicLevel : currentUser.academicLevel,
        studentNumber: currentUser.role === 'estudante' ? studentNumber.trim() : currentUser.studentNumber,
        teacherId: currentUser.role === 'orientador' ? teacherId.trim() : currentUser.teacherId,
        specialization: currentUser.role === 'orientador'
          ? specialization.split(',').map((s) => s.trim()).filter(Boolean)
          : currentUser.specialization,
        department: department.trim() || currentUser.department,
        maxGroupsQuota: currentUser.role === 'orientador' ? Number(maxGroupsQuota) : currentUser.maxGroupsQuota,
      };

      await updateUserProfile(updatedData);

      if (password && supabase) {
        try {
          await supabase.auth.updateUser({ password });
        } catch (pwErr) {
          console.warn('Erro ao atualizar senha:', pwErr);
        }
      }

      setSuccessMessage('Perfil atualizado com sucesso!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar perfil.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="O Meu Perfil de Utilizador"
      subtitle="Consulte e edite os seus dados cadastrais, informações académicas e credenciais de acesso"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header de Identificação do Utilizador */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={currentUser.role} />
            <StatusBadge status={currentUser.status} />
          </div>
        </div>

        {/* Alertas */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Secção 1: Dados Pessoais */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Informações Pessoais</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome oficial"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço de E-mail (Credencial Principal):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Identificador único</span>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento Institucional:
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ciências da Computação"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Secção 2: Dados Específicos por Perfil */}
        {currentUser.role === 'estudante' && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Dados Académicos do Estudante</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Curso de Matrícula:
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                >
                  <option value="">Selecione o curso...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nível Académico Atual:
                </label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                >
                  <option value="13º Nível (Terminal)">13º Classe (Classe)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nº de Estudante / Matrícula:
                </label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="EST-2026-1042"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'orientador' && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Dados Profissionais do Orientador</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Docente:
                </label>
                <input
                  type="text"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="DOC-2025-01"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Áreas de Especialização (separadas por vírgula):
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Ex: Redes de Computadores, Engenharia de Software, Cibersegurança"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Capacidade Máxima (Grupos):
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxGroupsQuota}
                  onChange={(e) => setMaxGroupsQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Secção 3: Credenciais e Palavra-passe */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Segurança</span>
            </h4>
            <span className="text-[10px] text-slate-400">Credencial de acesso ao Portal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Palavra-passe:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Palavra-passe:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'A guardar no Supabase...' : 'Guardar Alterações'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
