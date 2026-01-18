
import React, { useState, useEffect } from 'react';
import { LKPDFormData, ActivityDetail, CURRICULUM_OPTIONS, JENJANG_OPTIONS, GRADE_MAP, SEMESTER_OPTIONS, SUBJECT_OPTIONS } from '../../types';
import { generateLKPD } from '../../services/gemini';
import { LoadingSpinner } from '../LoadingSpinner';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { FileText, RefreshCw, Copy, Check, Printer, Download, X, Star } from 'lucide-react';
import { asBlob } from 'html-docx-js-typescript';
import saveAs from 'file-saver';

export const LKPDGenerator: React.FC = () => {
  const [formData, setFormData] = useState<LKPDFormData>({
    subject: '',
    topic: '',
    grade: '',
    activityCount: 1, // Default 1
    activities: [{ id: 1, type: '' }],
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

  // Sync activities array with activityCount
  useEffect(() => {
    setFormData(prev => {
      const currentCount = prev.activities.length;
      const targetCount = Math.max(1, Math.min(10, prev.activityCount));
      
      if (currentCount === targetCount) return prev;
      
      let newActivities = [...prev.activities];
      if (targetCount > currentCount) {
        for (let i = currentCount; i < targetCount; i++) {
            // Inherit previous type or default
            const defaultType = i > 0 ? newActivities[i-1].type : '';
            newActivities.push({ id: i + 1, type: defaultType });
        }
      } else {
        newActivities = newActivities.slice(0, targetCount);
      }
      return { ...prev, activities: newActivities };
    });
  }, [formData.activityCount]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('lkpd_favorites');
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

  const handleActivityChange = (index: number, value: string) => {
    const newActivities = [...formData.activities];
    newActivities[index] = { ...newActivities[index], type: value };
    setFormData({ ...formData, activities: newActivities });
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
    localStorage.setItem('lkpd_favorites', JSON.stringify(updatedFavs));
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
    localStorage.setItem('lkpd_favorites', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage({ title: 'Memulai Proses', message: `Menyusun ${formData.activityCount} aktivitas LKPD...`, type: 'info' });
    setShowToast(true);
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateLKPD(formData);
      setResult(response);
      setToastMessage({ title: 'Berhasil!', message: 'LKPD telah selesai dibuat.', type: 'success' });
      setShowToast(true);
    } catch (error) {
      console.error(error);
      setResult("Terjadi kesalahan saat membuat LKPD.");
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
    const element = document.getElementById('lkpd-result');
    if (!element) return;
    const contentHtml = element.innerHTML;
    const htmlString = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"><title>LKPD - ${formData.topic}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; }
          h1 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 1em; text-transform: uppercase; }
          h2, h3 { font-size: 12pt; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
          p { margin-bottom: 0.5em; text-align: justify; }
          ul, ol { margin-bottom: 0.5em; padding-left: 24px; }
          li { margin-bottom: 4px; }
        </style>
      </head>
      <body>${contentHtml}</body></html>`;
    try {
      const blob = await asBlob(htmlString, { orientation: 'portrait', margins: { top: 720, right: 720, bottom: 720, left: 720 } });
      saveAs(blob, `LKPD_${formData.topic.replace(/\s+/g, '_')}.docx`);
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
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <FileText size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Generator LKPD</h2>
                <p className="text-sm text-slate-500">Buat Lembar Kerja Peserta Didik yang menarik dan interaktif.</p>
            </div>
          </div>
          <div className="relative">
            <button 
                onClick={() => setShowFavorites(!showFavorites)}
                className="text-xs font-bold flex items-center gap-1 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Topik / Materi</label>
            <input 
              type="text" 
              required
              className="w-full rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Contoh: Perubahan Wujud Zat, Persamaan Linear"
              value={formData.topic}
              onChange={e => setFormData({...formData, topic: e.target.value})}
            />
          </div>

          {/* DYNAMIC ACTIVITY CONFIGURATION */}
          <div className="col-span-2 border-t border-slate-100 pt-4">
             <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-700">Konfigurasi Aktivitas</label>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1">
                    <span className="text-xs font-semibold text-slate-500">Jumlah:</span>
                    <input 
                        type="number" 
                        min={1} 
                        max={10} 
                        className="w-10 bg-transparent text-center font-bold text-sm outline-none" 
                        value={formData.activityCount} 
                        onChange={e => setFormData({...formData, activityCount: parseInt(e.target.value) || 1})} 
                    />
                </div>
             </div>

             <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {formData.activities.map((act, index) => (
                    <div key={act.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs font-bold text-slate-400 mb-2">Aktivitas {act.id}</div>
                        <select 
                            className="w-full rounded-lg border-slate-300 border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={act.type}
                            onChange={e => handleActivityChange(index, e.target.value)}
                        >
                            <option value="">Pilih Jenis Aktivitas...</option>
                            <option value="Eksperimen / Praktikum">Eksperimen / Praktikum</option>
                            <option value="Diskusi Kelompok">Diskusi Kelompok</option>
                            <option value="Studi Kasus">Studi Kasus</option>
                            <option value="Pengamatan Lingkungan">Pengamatan Lingkungan</option>
                            <option value="Teka-teki Silang / Games">Teka-teki Silang / Games</option>
                            <option value="Literasi Membaca">Literasi Membaca</option>
                            <option value="Proyek Kreatif">Proyek Kreatif</option>
                        </select>
                    </div>
                ))}
             </div>
          </div>

          <div className="col-span-2 mt-2 flex gap-2">
            <button 
                type="button" 
                onClick={saveToFavorites}
                className="bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-slate-50 font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all"
                title="Simpan Konfigurasi"
            >
                <Star size={18} />
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? 'Sedang Membuat LKPD...' : 'Buat LKPD Sekarang'}
            </button>
          </div>
        </form>
      </div>

      {isLoading && <LoadingSpinner />}

      {result && !isLoading && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Hasil LKPD:</h3>
            <div className="flex gap-2">
                <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                <Printer size={16} /> Print
                </button>
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
                {copied ? 'Tersalin' : 'Salin'}
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
          <div id="lkpd-result" className="print:block print:p-0 print:shadow-none bg-white p-6 rounded-lg shadow-sm border border-slate-200">
             <MarkdownRenderer content={result} />
          </div>
        </div>
      )}
    </div>
  );
};
