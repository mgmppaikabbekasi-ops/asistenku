
import React, { useState, useEffect } from 'react';
import { RubricFormData, CURRICULUM_OPTIONS, JENJANG_OPTIONS, GRADE_MAP, SEMESTER_OPTIONS, SUBJECT_OPTIONS } from '../../types';
import { generateRubric } from '../../services/gemini';
import { LoadingSpinner } from '../LoadingSpinner';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { ClipboardList, RefreshCw, Copy, Check, Download, X, Star } from 'lucide-react';
import { asBlob } from 'html-docx-js-typescript';
import saveAs from 'file-saver';

export const RubricGenerator: React.FC = () => {
  const [formData, setFormData] = useState<RubricFormData>({
    subject: '',
    topic: '',
    grade: '',
    criteriaCount: 4,
    rubricCount: 1, // Default 1
    rubricItems: [{ id: 1, taskType: '' }],
    curriculum: 'Kurikulum Merdeka',
    semester: 'Ganjil'
  });
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', message: '', type: 'success' });
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Local state for cascading dropdowns
  const [selectedJenjang, setSelectedJenjang] = useState(JENJANG_OPTIONS[2]); // Default SMP
  const [selectedKelas, setSelectedKelas] = useState(GRADE_MAP[JENJANG_OPTIONS[2]][0]);

  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        grade: `${selectedKelas} (${selectedJenjang})`
    }));
  }, [selectedJenjang, selectedKelas]);

  // Sync rubricItems with rubricCount
  useEffect(() => {
    setFormData(prev => {
      const currentCount = prev.rubricItems.length;
      const targetCount = Math.max(1, Math.min(10, prev.rubricCount));
      
      if (currentCount === targetCount) return prev;
      
      let newItems = [...prev.rubricItems];
      if (targetCount > currentCount) {
        for (let i = currentCount; i < targetCount; i++) {
            const defaultType = i > 0 ? newItems[i-1].taskType : '';
            newItems.push({ id: i + 1, taskType: defaultType });
        }
      } else {
        newItems = newItems.slice(0, targetCount);
      }
      return { ...prev, rubricItems: newItems };
    });
  }, [formData.rubricCount]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('rubric_favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
  }, []);

  useEffect(() => {
    if (showToast) {
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleRubricTypeChange = (index: number, value: string) => {
    const newItems = [...formData.rubricItems];
    newItems[index] = { ...newItems[index], taskType: value };
    setFormData({ ...formData, rubricItems: newItems });
  };

  const saveToFavorites = () => {
    if (!formData.topic) {
        setToastMessage({ title: 'Gagal', message: 'Isi Topik Materi terlebih dahulu.', type: 'error' });
        setShowToast(true);
        return;
    }
    const newFav = {
        id: Date.now(),
        name: `${formData.subject} - ${formData.topic}`,
        date: new Date().toLocaleDateString(),
        data: formData
    };
    const updatedFavs = [newFav, ...favorites];
    setFavorites(updatedFavs);
    localStorage.setItem('rubric_favorites', JSON.stringify(updatedFavs));
    setToastMessage({ title: 'Tersimpan', message: 'Konfigurasi disimpan ke Favorit.', type: 'success' });
    setShowToast(true);
  };

  const loadFavorite = (fav: any) => {
    setFormData(fav.data);
    setShowFavorites(false);
    setToastMessage({ title: 'Dimuat', message: 'Konfigurasi berhasil dimuat.', type: 'success' });
    setShowToast(true);
  };

  const removeFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('rubric_favorites', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage({ title: 'Memulai Proses', message: `Menyusun ${formData.rubricCount} variasi rubrik...`, type: 'info' });
    setShowToast(true);
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateRubric(formData);
      setResult(response);
      setToastMessage({ title: 'Berhasil!', message: 'Rubrik telah selesai dibuat.', type: 'success' });
      setShowToast(true);
    } catch (error) {
      console.error(error);
      setResult("Terjadi kesalahan saat membuat Rubrik.");
      setToastMessage({ title: 'Gagal', message: 'Terjadi kesalahan sistem.', type: 'error' });
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportDocx = async () => {
    const element = document.getElementById('rubric-result');
    if (!element) return;
    const contentHtml = element.innerHTML;
    const htmlString = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"><title>Rubrik - ${formData.topic}</title>
        <style>
          @page { size: A4; margin: 3cm; } /* 3cm margin */
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
          h1, h2, h3, h4, h5, h6 { font-family: 'Times New Roman', serif; color: #000; }
          h1 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 1em; text-transform: uppercase; }
          h2 { font-size: 12pt; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
          h3 { font-size: 12pt; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
          p, li, div, span { margin-bottom: 0.5em; text-align: justify; font-size: 12pt; font-family: 'Times New Roman', serif; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1em; font-family: 'Times New Roman', serif; }
          th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; text-align: left; font-size: 12pt; font-family: 'Times New Roman', serif; }
          th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>${contentHtml}</body></html>`;
    try {
      const blob = await asBlob(htmlString, { orientation: 'portrait', margins: { top: 1701, right: 1701, bottom: 1701, left: 1701 } });
      saveAs(blob, `Rubrik_${formData.topic.replace(/\s+/g, '_')}.docx`);
    } catch (error) { console.error("Export Error", error); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       {showToast && (
            <div className="fixed top-6 right-6 z-50 animate-fade-in-down no-print">
                <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border ${toastMessage.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-blue-600 border-blue-500'} text-white`}>
                    <div className="bg-white/20 p-2 rounded-full">
                        {toastMessage.type === 'success' ? <Check size={20} /> : <RefreshCw size={20} className={toastMessage.type === 'info' ? 'animate-spin' : ''} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">{toastMessage.title}</h4>
                        <p className="text-xs text-white/90 mt-0.5">{toastMessage.message}</p>
                    </div>
                    <button onClick={() => setShowToast(false)} className="ml-2 hover:text-white/80"><X size={18}/></button>
                </div>
            </div>
        )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <ClipboardList size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Generator Rubrik Penilaian</h2>
                <p className="text-sm text-slate-500">Buat tabel kriteria penilaian asesmen secara instan. Jika data belum lengkap, AI akan membuatkan contoh.</p>
            </div>
          </div>
          <div className="relative">
            <button 
                onClick={() => setShowFavorites(!showFavorites)}
                className="text-xs font-bold flex items-center gap-1 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded"
            >
                <Star size={12} fill={favorites.length > 0 ? "currentColor" : "none"} /> Favorit
            </button>
            {showFavorites && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in slide-in-from-top-2 p-2 max-h-60 overflow-y-auto">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 px-2 uppercase">Disimpan</h4>
                    {favorites.length === 0 ? (
                        <p className="text-xs text-slate-400 px-2 py-1">Belum ada favorit.</p>
                    ) : (
                        favorites.map((fav: any) => (
                            <div key={fav.id} onClick={() => loadFavorite(fav)} className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer group flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-700 line-clamp-1">{fav.name}</p>
                                    <p className="text-[10px] text-slate-400">{fav.date}</p>
                                </div>
                                <button onClick={(e) => removeFavorite(fav.id, e)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                            </div>
                        ))
                    )}
                </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Kurikulum</label>
            <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                value={formData.curriculum}
                onChange={e => setFormData({...formData, curriculum: e.target.value})}
            >
                {CURRICULUM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
             <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                value={formData.semester}
                onChange={e => setFormData({...formData, semester: e.target.value})}
            >
                {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Jenjang</label>
            <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                value={selectedJenjang}
                onChange={e => {
                    const newJenjang = e.target.value;
                    setSelectedJenjang(newJenjang);
                    setSelectedKelas(GRADE_MAP[newJenjang][0]);
                }}
            >
                {JENJANG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
             <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                value={selectedKelas}
                onChange={e => setSelectedKelas(e.target.value)}
            >
                {GRADE_MAP[selectedJenjang].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Mata Pelajaran</label>
            <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
            >
                 <option value="">Pilih Mata Pelajaran...</option>
                {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Topik / Judul Tugas</label>
            <input 
              type="text" 
              className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Contoh: Pidato Persuasif (Kosong = Contoh Acak)"
              value={formData.topic}
              onChange={e => setFormData({...formData, topic: e.target.value})}
            />
          </div>

          {/* DYNAMIC RUBRIC CONFIGURATION */}
          <div className="col-span-2 border-t border-slate-100 pt-4">
             <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-700">Konfigurasi Variasi Rubrik</label>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1">
                    <span className="text-xs font-semibold text-slate-500">Jumlah:</span>
                    <input 
                        type="number" 
                        min={1} 
                        max={10} 
                        className="w-10 bg-transparent text-center font-bold text-sm outline-none" 
                        value={formData.rubricCount} 
                        onChange={e => setFormData({...formData, rubricCount: parseInt(e.target.value) || 1})} 
                    />
                </div>
             </div>

             <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {formData.rubricItems.map((item, index) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs font-bold text-slate-400 mb-2">Rubrik {item.id}</div>
                        <select 
                            className="w-full rounded-lg border-slate-300 border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={item.taskType}
                            onChange={e => handleRubricTypeChange(index, e.target.value)}
                        >
                            <option value="">Pilih Jenis Tugas...</option>
                            <option value="Presentasi / Lisan">Presentasi / Lisan</option>
                            <option value="Proyek / Produk">Proyek / Produk</option>
                            <option value="Karangan / Esai">Karangan / Esai</option>
                            <option value="Praktik / Unjuk Kerja">Praktik / Unjuk Kerja</option>
                            <option value="Sikap / Observasi">Sikap / Observasi</option>
                            <option value="Portofolio">Portofolio</option>
                        </select>
                    </div>
                ))}
             </div>
          </div>

           <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Kriteria per Tabel</label>
            <input 
              type="number" 
              min="2"
              max="10"
              className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.criteriaCount}
              onChange={e => setFormData({...formData, criteriaCount: parseInt(e.target.value)})}
            />
          </div>

          <div className="col-span-2 mt-2 flex gap-2">
            <button 
                type="button" 
                onClick={saveToFavorites}
                className="bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-slate-50 font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all"
                title="Simpan Konfigurasi"
            >
                <Star size={18} />
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? 'Sedang Membuat Rubrik...' : 'Buat Rubrik Penilaian'}
            </button>
          </div>
        </form>
      </div>

      {isLoading && <LoadingSpinner />}

      {result && !isLoading && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Hasil Rubrik:</h3>
            <div className="flex gap-2">
                <button 
                onClick={handleExportDocx}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                <Download size={16} /> Word
                </button>
                <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                {copied ? <Check size={16} className="text-green-600"/> : <Copy size={16}/>}
                {copied ? 'Tersalin' : 'Salin Tabel'}
                </button>
                <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                >
                <RefreshCw size={16} />
                Regenerate
                </button>
            </div>
          </div>
          <div id="rubric-result">
            <MarkdownRenderer content={result} />
          </div>
        </div>
      )}
    </div>
  );
};
