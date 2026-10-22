'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { VirtualLibraryItem } from '@/types/database';
import { Modal } from '@/components/shared/Modal';
import {
  BookOpen,
  Search,
  Download,
  Filter,
  GraduationCap,
  Calendar,
  User,
  Award,
  Sparkles,
  FileText,
  CheckCircle,
  Eye
} from 'lucide-react';

export function VirtualLibrary() {
  const { virtualLibrary, incrementLibraryDownloads, courses } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('todos');
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [previewItem, setPreviewItem] = useState<VirtualLibraryItem | null>(null);

  const availableYears = Array.from(new Set(virtualLibrary.map((item) => item.year))).sort((a, b) => b - a);

  const filteredItems = virtualLibrary.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.authors.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.advisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCourse =
      selectedCourse === 'todos' || item.courseName === selectedCourse;

    const matchesYear =
      selectedYear === 'todos' || item.year.toString() === selectedYear;

    return matchesSearch && matchesCourse && matchesYear;
  });

  const handleDownload = (item: VirtualLibraryItem) => {
    incrementLibraryDownloads(item.id);
    // Simula download
    const link = document.createElement('a');
    link.href = item.fileUrl;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-blue-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Repositório Institucional de PAP Homologados </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Biblioteca Virtual Académica
          </h2>
          <p className="text-blue-200 text-xs sm:text-sm leading-relaxed mb-6">
            Acesso público e centralizado às monografias e trabalhos de fim de curso defendidos e aprovados perante bancas examinadoras.
          </p>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquise por título, autor, tema, orientador ou palavras-chave..."
              className="w-full pl-12 pr-4 py-3 bg-white text-slate-800 rounded-2xl text-xs sm:text-sm font-medium shadow-lg focus:outline-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <BookOpen className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4" />
            <span>Filtros:</span>
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-blue-500"
          >
            <option value="todos">Todos os Cursos</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-blue-500"
          >
            <option value="todos">Todos os Anos</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr.toString()}>
                Ano {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500">
          {filteredItems.length} trabalhos homologados indexados
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Nenhum trabalho encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Experimente ajustar os filtros ou termo de pesquisa.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {item.courseName}
                  </span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {item.finalScore.toFixed(1)} Val.
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mb-1.5 hover:text-blue-700 transition-colors cursor-pointer" onClick={() => setPreviewItem(item)}>
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                  {item.abstract}
                </p>

                <div className="text-xs text-slate-600 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span><strong>Autores:</strong> {item.authors.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span><strong>Orientador:</strong> {item.advisorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Ano de Homologação: {item.year}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Resumo</span>
                </button>

                <button
                  onClick={() => handleDownload(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ({item.downloadsCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Visualização de Detalhes do TFC */}
      <Modal
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        title="Ficha Catalográfica da PAP (Biblioteca Virtual)"
        subtitle={previewItem?.title}
        maxWidth="max-w-2xl"
      >
        {previewItem && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Curso:</span>
                <span className="font-bold text-slate-800">{previewItem.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Autores:</span>
                <span className="font-bold text-slate-800">{previewItem.authors.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Orientador Oficial:</span>
                <span className="font-bold text-slate-800">{previewItem.advisorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Nota da Defesa perante Júri:</span>
                <span className="font-extrabold text-purple-700">{previewItem.finalScore.toFixed(1)} Valores (Homologado)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Ano Académico:</span>
                <span className="font-bold text-slate-800">{previewItem.year}</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Resumo Científico / Abstract:
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 border border-slate-200 rounded-xl">
                {previewItem.abstract}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {previewItem.keywords.map((kw, i) => (
                <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  #{kw}
                </span>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleDownload(previewItem);
                  setPreviewItem(null);
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar Monografia Completa (.pdf)</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
