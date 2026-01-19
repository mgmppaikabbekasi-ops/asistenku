
import React, { useState, useEffect } from 'react';
import { IceBreakingFormData } from '../../types';
import { generateIceBreaking } from '../../services/gemini';
import { LoadingSpinner } from '../LoadingSpinner';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Dices, RefreshCw, Copy, Check, Download, Settings2, X, Star } from 'lucide-react';
import { asBlob } from 'html-docx-js-typescript';
import saveAs from 'file-saver';

export const IceBreakingGenerator: React.FC = () => {
  const [formData, setFormData] = useState<IceBreakingFormData>({
    grade: '',
    situation: '',
    duration: '5-10 menit'
  });
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', message: '', type: 'success' });
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const savedFavs = localStorage.getItem('icebreaking_favorites');
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

  const saveToFavorites = () => {
    if (!formData.situation) {
        setToastMessage({ title: 'Gagal', message: 'Isi Situasi terlebih dahulu.', type: 'error' });
        setShowToast(true);
        return;
    }
    const newFav = {
        id: Date.now(),
        name: `${formData.grade} - ${formData.situation}`,
        date: new Date().toLocaleDateString(),
        data: formData
    };
    const updatedFavs = [newFav, ...favorites];
    setFavorites(updatedFavs);
    localStorage.setItem('icebreaking_favorites', JSON.stringify(updatedFavs));
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
    localStorage.setItem('icebreaking_favorites', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage({ title: 'Memulai Proses', message: 'Mencari ide seru...', type: 'info' });
    setShowToast(true);
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateIceBreaking(formData);
      setResult(response);
      setToastMessage({ title: 'Berhasil!', message: 'Ide Ice Breaking siap!', type: 'success' });
      setShowToast(true);
    } catch (error) {
      console.error(error);
      setResult("Terjadi kesalahan saat mencari ide Ice Breaking.");
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
    const element = document.getElementById('icebreaking-result');
    if (!element) return;
    const contentHtml = element.innerHTML;
    const htmlString = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"><title>Ice Breaking</title>
        <style>
          @page { size: A4; margin: 3cm; } /* 3cm Margin */
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
          h1, h2, h3, h4, h5, h6 { font-family: 'Times New Roman', serif; color: #000; }
          h1 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 1em; text-transform: uppercase; }
          h2 { font-size: 12pt; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
          h3 { font-size: 12pt; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
          p, li, div, span { margin-bottom: 0.5em; text-align: justify; font-size: 12pt; font-family: 'Times New Roman', serif; }
          ul, ol { margin-bottom: 0.5em; padding-left: 24px; font-size: 12pt; font-family: 'Times New Roman', serif; }
          li { margin-bottom: 4px; font-size: 12pt; }
        </style>
      </head>
      <body>${contentHtml}</body></html>`;
    try {
      const blob = await asBlob(htmlString, { orientation: 'portrait', margins: { top: 1701, right: 1701, bottom: 1701, left: 1701 } });
      saveAs(blob, `IceBreaking.docx`);
    } catch (error) { console.error("Export Error", error); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
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

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-cyan-100 text-cyan-600 rounded-xl shadow-sm">
            <Dices size={28} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Generator Ice Breaking</h1>
            <p className="text-slate-500">Cari ide permainan seru untuk menghidupkan suasana kelas yang bosan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* FORM SIDE */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 sticky top-24">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><Settings2 size={16} /> Konfigurasi</span>
                <div className="relative">
                    <button 
                        onClick={() => setShowFavorites(!showFavorites)}
                        className="text-xs font-bold flex items-center gap-1 text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded"
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
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kelas / Usia Siswa</label>
                    <input 
                    type="text" 
                    required
                    autoFocus
                    className="w-full rounded-lg border-slate-300 border bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Contoh: SMA Kelas 10"
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Situasi / Kondisi</label>
                    <input 
                    type="text" 
                    required
                    className="w-full rounded-lg border-slate-300 border bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                    placeholder="Contoh: Mengantuk setelah makan siang, Awal Semester"
                    value={formData.situation}
                    onChange={e => setFormData({...formData, situation: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Durasi Waktu</label>
                    <select 
                    className="w-full rounded-lg border-slate-300 border bg-slate-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    >
                        <option value="Singkat (< 5 menit)">Singkat (&lt; 5 menit)</option>
                        <option value="Sedang (5-10 menit)">Sedang (5-10 menit)</option>
                        <option value="Panjang (> 15 menit)">Panjang (&gt; 15 menit)</option>
                    </select>
                </div>

                <div className="pt-2 flex gap-2">
                    <button 
                        type="button" 
                        onClick={saveToFavorites}
                        className="bg-white border border-slate-200 text-slate-600 hover:text-cyan-600 hover:bg-slate-50 font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all"
                        title="Simpan Konfigurasi"
                    >
                        <Star size={18} />
                    </button>
                    <button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                    {isLoading ? (
                        <>Mencari Ide...</>
                    ) : (
                        <><Dices size={18} /> Cari Ice Breaking</>
                    )}
                    </button>
                </div>
            </form>
        </div>

        {/* RESULT SIDE */}
        <div className="lg:col-span-2">
            {isLoading && <LoadingSpinner />}

            {!result && !isLoading && (
                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 h-96 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Dices size={32} className="opacity-50" />
                    </div>
                    <p className="font-medium">Belum ada ide.</p>
                    <p className="text-sm mt-1">Isi formulir untuk mendapatkan rekomendasi permainan seru.</p>
                </div>
            )}

            {result && !isLoading && (
                <div className="animate-fade-in space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 pl-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-sm font-semibold text-slate-700">Ide Ditemukan</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                            >
                            {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>}
                            {copied ? 'Disalin' : 'Salin'}
                            </button>

                            <button 
                            onClick={handleExportDocx}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                            >
                            <Download size={14} /> Word
                            </button>

                            <button 
                            onClick={handleSubmit}
                            className="p-2 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                            title="Cari Lagi"
                            >
                            <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>
                
                    <div id="icebreaking-result" className="relative">
                        <div className="bg-white text-slate-900 shadow-2xl shadow-slate-200/50 p-[2.5cm] min-h-[29.7cm] mx-auto rounded-sm print:shadow-none print:p-0 w-full max-w-[21cm]">
                             <MarkdownRenderer content={result} />
                        </div>
                        <div className="absolute inset-0 pointer-events-none rounded-sm ring-1 ring-black/5"></div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
