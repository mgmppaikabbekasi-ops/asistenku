
import React, { useState, useEffect } from 'react';
import { RPPFormData, MeetingDetail, CURRICULUM_OPTIONS, JENJANG_OPTIONS, GRADE_MAP, SEMESTER_OPTIONS, SUBJECT_OPTIONS } from '../../types';
import { generateRPP, regenerateRPPSection } from '../../services/gemini';
import { LoadingSpinner } from '../LoadingSpinner';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Save, Copy, Check, Settings, Download, Filter, CheckSquare, Plus, X, HelpCircle, PenTool, Layers, FileText, Calendar, School, User, BookOpen, RefreshCw, Info, Star, ChevronDown, Upload } from 'lucide-react';
import { asBlob } from 'html-docx-js-typescript';
import saveAs from 'file-saver';

declare var html2pdf: any;

export const RPPGenerator: React.FC = () => {
  const [formData, setFormData] = useState<RPPFormData>({
    title: '',
    schoolName: '',
    teacherName: '',
    teacherNIP: '',
    principalName: '',
    principalNIP: '',
    place: '',
    date: '',
    semester: 'Ganjil',
    subject: '',
    topic: '',
    grade: '',
    duration: '',
    meetingCount: 1,
    meetings: [{ id: 1, method: '', activity: '' }],
    specificTP: '',
    includeRubric: false,
    coreActivityModel: 'tar', 
    customAssessments: [],
    studentData: '',
    curriculum: 'Kurikulum Merdeka'
  });

  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', message: '', type: 'success' });
  const [dateError, setDateError] = useState('');
  const [topicError, setTopicError] = useState(''); // New Validation State
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Track which section is regenerating
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  const [activeMeetingFilter, setActiveMeetingFilter] = useState<number>(0);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [sectionsToPrint, setSectionsToPrint] = useState({
    title: true,
    identity: true,
    identification: true,
    design: true,
    experience: true,
    assessment: true,
    reflection: true,
    footer: true
  });
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

  useEffect(() => {
    const savedFavs = localStorage.getItem('rpp_favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
  }, []);

  useEffect(() => {
    setFormData(prev => {
      const currentCount = prev.meetings.length;
      const targetCount = prev.meetingCount;
      if (currentCount === targetCount) return prev;
      let newMeetings = [...prev.meetings];
      if (targetCount > currentCount) {
        for (let i = currentCount; i < targetCount; i++) {
            const defaultMethod = i > 0 ? newMeetings[i-1].method : '';
            newMeetings.push({ id: i + 1, method: defaultMethod, activity: '' });
        }
      } else {
        newMeetings = newMeetings.slice(0, targetCount);
      }
      return { ...prev, meetings: newMeetings };
    });
  }, [formData.meetingCount]);

  useEffect(() => {
    if (showToast) {
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [showToast]);

  const validateDate = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, date: val });
    if (!val) {
        setDateError('Tanggal wajib diisi');
    } else {
        setDateError('');
    }
  };

  const handleMeetingChange = (index: number, field: keyof MeetingDetail, value: string) => {
    const newMeetings = [...formData.meetings];
    newMeetings[index] = { ...newMeetings[index], [field]: value };
    setFormData({ ...formData, meetings: newMeetings });
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
    localStorage.setItem('rpp_favorites', JSON.stringify(updatedFavs));
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
    localStorage.setItem('rpp_favorites', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    let hasError = false;

    if (!formData.topic || formData.topic.trim() === '') {
        setTopicError('Topik Materi wajib diisi.');
        hasError = true;
    } else {
        setTopicError('');
    }

    if (!formData.date) {
        setDateError('Silakan pilih tanggal yang valid');
        // Open signature section if closed
        const el = document.getElementById('signature-section');
        if(el && el.classList.contains('hidden')) el.classList.remove('hidden');
        hasError = true;
    }

    if (hasError) {
        setToastMessage({ title: 'Validasi Gagal', message: 'Mohon lengkapi data yang wajib diisi.', type: 'error' });
        setShowToast(true);
        return;
    }

    setToastMessage({ title: 'Memulai Proses', message: 'Sedang menyusun Modul Ajar...', type: 'info' });
    setShowToast(true);
    
    setIsLoading(true);
    setResult(null);
    setShowPrintOptions(false);
    setActiveMeetingFilter(0);

    try {
      const response = await generateRPP(formData);
      setResult(response);
      setToastMessage({ title: 'Berhasil!', message: 'Dokumen RPP telah selesai dibuat.', type: 'success' });
      setShowToast(true);
    } catch (error) {
      console.error(error);
      setResult("Terjadi kesalahan saat membuat RPP. Silakan coba lagi.");
      setToastMessage({ title: 'Gagal', message: 'Terjadi kesalahan sistem.', type: 'error' });
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSection = async (sectionTitle: string, fullHeader: string) => {
    if (!result) return;
    setRegeneratingSection(sectionTitle);
    
    try {
        const newSectionContent = await regenerateRPPSection(formData, sectionTitle);
        
        // Replace the old section with the new one using Regex
        // We look for the header (e.g. ### 1. IDENTITAS) and match until the next ### or end of file
        const regex = new RegExp(`(${fullHeader})([\\s\\S]*?)(?=### \\d\\.|Mengetahui,|$)`, 'i');
        
        if (regex.test(result)) {
            const newResult = result.replace(regex, `$1\n\n${newSectionContent.replace(fullHeader, '').trim()}\n\n`);
            setResult(newResult);
            setToastMessage({ title: 'Sukses', message: `Bagian ${sectionTitle} diperbarui.`, type: 'success' });
            setShowToast(true);
        } else {
            console.error("Could not find section to replace");
        }

    } catch (error) {
        console.error("Regenerate Error", error);
        setToastMessage({ title: 'Gagal', message: 'Gagal memperbarui bagian.', type: 'error' });
        setShowToast(true);
    } finally {
        setRegeneratingSection(null);
    }
  };

  const handleSelectAll = () => {
    setSectionsToPrint({
        title: true,
        identity: true,
        identification: true,
        design: true,
        experience: true,
        assessment: true,
        reflection: true,
        footer: true
    });
  };

  const handleCopy = () => {
    const element = document.getElementById('rpp-content');
    if (element) {
        // Try to copy HTML for better formatting in Word/Docs, fallback to text
        const html = element.innerHTML;
        const blob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([element.innerText], { type: 'text/plain' });
        
        try {
            // This API requires secure context (HTTPS)
            const data = [new ClipboardItem({ 
                'text/html': blob, 
                'text/plain': textBlob 
            })];
            
            navigator.clipboard.write(data).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        } catch (err) {
            // Fallback for older browsers or insecure contexts
            navigator.clipboard.writeText(element.innerText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('rpp-content');
    if (!element) return;
    const opt = {
      margin: [15, 20, 15, 20],
      filename: `${formData.title || 'Modul_Ajar'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleExportDocx = async () => {
    const element = document.getElementById('rpp-content');
    if (!element) return;
    const contentHtml = element.innerHTML;
    const htmlString = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"><title>${formData.title}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; }
          h1 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 1em; text-transform: uppercase; }
          h2 { font-size: 12pt; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; border-bottom: 1px solid #000; padding-bottom: 2px; }
          h3 { font-size: 11pt; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
          p { margin-bottom: 0.5em; text-align: justify; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
          th, td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; text-align: left; font-size: 11pt; }
          th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
          .bg-slate-50, .bg-blue-50 { background-color: transparent; }
          /* Hide regenerate buttons in Docx/Print */
          .regenerate-btn { display: none; }
        </style>
      </head>
      <body>${contentHtml}</body></html>`;
    try {
      const blob = await asBlob(htmlString, { orientation: 'portrait', margins: { top: 720, right: 720, bottom: 720, left: 720 } });
      saveAs(blob, `${formData.title || 'Modul_Ajar'}.docx`);
    } catch (error) { console.error("Export Error", error); }
  };

  const renderSectionWithRegenerate = (content: string, sectionKey: string, sectionTitle: string, fullHeader: string) => {
    if (!content) return null;
    const isRegenerating = regeneratingSection === sectionTitle;

    return (
        <div className="mb-6 group relative">
            <div className="flex justify-end absolute top-0 right-0 z-10 no-print">
                 <button 
                    onClick={() => handleRegenerateSection(sectionTitle, fullHeader)}
                    disabled={!!regeneratingSection}
                    className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded-bl-lg rounded-tr-lg text-[10px] font-bold border border-indigo-200 transition-all regenerate-btn shadow-sm"
                    title="Buat ulang bagian ini saja"
                 >
                    <RefreshCw size={10} className={isRegenerating ? "animate-spin" : ""} />
                    {isRegenerating ? "Proses..." : "Regenerate"}
                 </button>
            </div>
            <MarkdownRenderer content={content} />
        </div>
    );
  };

  const renderSelectiveContent = () => {
    if (!result) return null;
    const parts = result.split(/(?=### \d\.)/);
    const findPart = (keyword: string) => parts.find(p => p.toLowerCase().includes(keyword.toLowerCase())) || "";

    const headerPart = parts[0].includes("### 1.") ? "" : parts[0]; 
    const identityPart = findPart("1. IDENTITAS");
    const identificationPart = findPart("2. IDENTIFIKASI");
    const designPart = findPart("3. DESAIN");
    let experiencePart = findPart("4. PENGALAMAN");
    const assessmentPart = findPart("5. ASESMEN");
    const reflectionPart = findPart("6. REFLEKSI");

    if (activeMeetingFilter > 0 && experiencePart) {
        const meetingRegex = /(?=\*\*PERTEMUAN \d+\*\*|PERTEMUAN \d+)/i;
        const meetingSplits = experiencePart.split(meetingRegex);
        const sectionHeader = meetingSplits[0];
        const targetRegex = new RegExp(`PERTEMUAN ${activeMeetingFilter}`, 'i');
        const foundBlock = meetingSplits.find(block => targetRegex.test(block));
        experiencePart = foundBlock ? sectionHeader + "\n" + foundBlock : sectionHeader + `\n\n> *Data untuk Pertemuan ${activeMeetingFilter} tidak ditemukan.*`;
    }

    let cleanReflectionPart = reflectionPart;
    let footerPart = "";
    if (result.includes("Mengetahui,")) {
        const splitByFooter = result.split("Mengetahui,");
        footerPart = "Mengetahui," + splitByFooter[splitByFooter.length - 1];
        if (cleanReflectionPart.includes("Mengetahui,")) {
             cleanReflectionPart = cleanReflectionPart.split("Mengetahui,")[0].replace(/---\s*$/, '');
        }
    }

    return (
        <div id="rpp-content" className="bg-white text-slate-900 shadow-2xl shadow-slate-200/50 p-[2.5cm] min-h-[29.7cm] mx-auto rounded-sm print:shadow-none print:p-0 w-full max-w-[21cm]">
            {sectionsToPrint.title && <div className="mb-4"><MarkdownRenderer content={headerPart} /></div>}
            
            {sectionsToPrint.identity && renderSectionWithRegenerate(identityPart, 'identity', '1. IDENTITAS', '### 1. IDENTITAS')}
            
            {sectionsToPrint.identification && renderSectionWithRegenerate(identificationPart, 'identification', '2. IDENTIFIKASI', '### 2. IDENTIFIKASI')}
            
            {sectionsToPrint.design && renderSectionWithRegenerate(designPart, 'design', '3. DESAIN PEMBELAJARAN', '### 3. DESAIN')}
            
            {sectionsToPrint.experience && renderSectionWithRegenerate(experiencePart, 'experience', '4. PENGALAMAN BELAJAR', '### 4. PENGALAMAN')}
            
            {sectionsToPrint.assessment && renderSectionWithRegenerate(assessmentPart, 'assessment', '5. ASESMEN PEMBELAJARAN', '### 5. ASESMEN')}
            
            {sectionsToPrint.reflection && renderSectionWithRegenerate(cleanReflectionPart, 'reflection', '6. REFLEKSI GURU', '### 6. REFLEKSI')}
            
            {sectionsToPrint.footer && footerPart && <div className="mt-8 break-inside-avoid"><MarkdownRenderer content={footerPart} /></div>}
        </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Toast */}
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

      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
            <Settings size={28} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Generator Rencana Pembelajaran (RPM)</h1>
            <p className="text-slate-500">Susun dokumen perencanaan pembelajaran profesional secara instan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <PenTool size={16} /> Data Pembelajaran
                    </h2>
                    <div className="relative">
                        <button 
                            onClick={() => setShowFavorites(!showFavorites)}
                            className="text-xs font-bold flex items-center gap-1 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
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
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Judul Dokumen</label>
                            <input 
                            type="text" 
                            autoFocus
                            className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Default: Rencana Pembelajaran Mendalam (RPM)"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Identitas Sekolah</label>
                                <div className="relative">
                                    <School size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <input 
                                    type="text" 
                                    className="w-full pl-10 rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Nama Sekolah"
                                    value={formData.schoolName}
                                    onChange={e => setFormData({...formData, schoolName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Guru</label>
                                    <input type="text" className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Nama Guru" value={formData.teacherName} onChange={e => setFormData({...formData, teacherName: e.target.value})} />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">NIP Guru</label>
                                    <input type="text" className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="19XXXXXXXX..." value={formData.teacherNIP} onChange={e => setFormData({...formData, teacherNIP: e.target.value})} />
                                </div>
                            </div>

                            {/* DROPDOWN SECTION */}
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kurikulum</label>
                                    <select 
                                        className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        value={formData.curriculum}
                                        onChange={e => setFormData({...formData, curriculum: e.target.value})}
                                    >
                                        {CURRICULUM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Semester</label>
                                    <select 
                                        className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        value={formData.semester}
                                        onChange={e => setFormData({...formData, semester: e.target.value})}
                                    >
                                        {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jenjang</label>
                                    <select 
                                        className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
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
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kelas</label>
                                    <select 
                                        className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        value={selectedKelas}
                                        onChange={e => setSelectedKelas(e.target.value)}
                                    >
                                        {GRADE_MAP[selectedJenjang].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mata Pelajaran</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                >
                                    <option value="">Pilih Mata Pelajaran...</option>
                                    {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Alokasi Waktu Harian</label>
                                <input type="text" required className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Misal: 2 JP x 40 Menit" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Topik Materi <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 outline-none ${topicError ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-300 bg-slate-50 focus:ring-indigo-500/20'}`}
                                    placeholder="Wajib Diisi (Topik Utama)" 
                                    value={formData.topic} 
                                    onChange={e => {
                                        setFormData({...formData, topic: e.target.value});
                                        if (e.target.value) setTopicError('');
                                    }} 
                                />
                                {topicError && <p className="text-[10px] text-red-500 mt-1">{topicError}</p>}
                            </div>
                        </div>

                        <div>
                             <div className="flex items-center gap-2 mb-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Model Kegiatan Inti</label>
                                <div className="relative group">
                                    <HelpCircle size={14} className="text-slate-400 cursor-help" />
                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                        <p className="mb-2"><strong>Auto:</strong> AI menyusun langkah standar dengan poin-poin.</p>
                                        <p><strong>TAR:</strong> Menggunakan alur 3 langkah khas: Telaah (Konsep), Aplikasi (Praktek), Refleksi (Evaluasi).</p>
                                    </div>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <label className={`cursor-pointer rounded-lg border px-3 py-2 text-sm text-center transition-all ${formData.coreActivityModel === 'tar' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    <input type="radio" className="hidden" name="coreActivity" value="tar" checked={formData.coreActivityModel === 'tar'} onChange={() => setFormData({...formData, coreActivityModel: 'tar'})} />
                                    Model TAR
                                </label>
                                <label className={`cursor-pointer rounded-lg border px-3 py-2 text-sm text-center transition-all ${formData.coreActivityModel === 'auto' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    <input type="radio" className="hidden" name="coreActivity" value="auto" checked={formData.coreActivityModel === 'auto'} onChange={() => setFormData({...formData, coreActivityModel: 'auto'})} />
                                    Model Auto
                                </label>
                             </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Data Siswa (Opsional)</label>
                            <textarea 
                                rows={2} 
                                className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none" 
                                placeholder="Cth: Siswa cenderung aktif kinestetik, ada 2 siswa inklusi..." 
                                value={formData.studentData || ''} 
                                onChange={e => setFormData({...formData, studentData: e.target.value})} 
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Isi untuk personalisasi strategi pembelajaran.</p>
                        </div>

                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tujuan Pembelajaran (Opsional)</label>
                            <textarea rows={2} className="w-full rounded-lg border-slate-300 bg-slate-50 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none" placeholder="Kosongkan untuk auto-generate" value={formData.specificTP} onChange={e => setFormData({...formData, specificTP: e.target.value})} />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-700">Konfigurasi Pertemuan</h3>
                            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1">
                                <span className="text-xs font-semibold text-slate-500">Jml:</span>
                                <input type="number" min={1} max={10} className="w-10 bg-transparent text-center font-bold text-sm outline-none" value={formData.meetingCount} onChange={e => setFormData({...formData, meetingCount: parseInt(e.target.value)})} />
                            </div>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                             {formData.meetings.map((meeting, index) => (
                                <div key={meeting.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-xs font-bold text-slate-400 mb-2">Pertemuan {meeting.id}</div>
                                    <select 
                                        className="w-full rounded border-slate-300 border px-2 py-1.5 text-sm mb-2 bg-white focus:ring-indigo-500/20"
                                        value={meeting.method}
                                        onChange={e => handleMeetingChange(index, 'method', e.target.value)}
                                    >
                                        <option value="">Pilih Metode...</option>
                                        <option value="Inkuiri-Discovery Learning">Inkuiri-Discovery</option>
                                        <option value="Problem Based Learning (PBL)">PBL</option>
                                        <option value="Project Based Learning (PjBL)">PjBL</option>
                                        <option value="Kooperatif (Jigsaw/STAD)">Kooperatif</option>
                                        <option value="Diferensiasi">Diferensiasi</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        className="w-full rounded border-slate-300 border px-2 py-1.5 text-sm bg-white focus:ring-indigo-500/20"
                                        placeholder="Fokus Kegiatan (Opsional)"
                                        value={meeting.activity}
                                        onChange={e => handleMeetingChange(index, 'activity', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                         <div className="flex items-center justify-between cursor-pointer" onClick={() => {
                             const el = document.getElementById('signature-section');
                             if(el) el.classList.toggle('hidden');
                         }}>
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">Identitas TTD & Tanggal <span className="text-xs font-normal text-slate-400">(Wajib Diisi)</span></h3>
                         </div>
                         <div id="signature-section" className="mt-3 space-y-3">
                             <div className="grid grid-cols-2 gap-3">
                                <input type="text" className="w-full rounded border-slate-300 text-sm px-3 py-2" placeholder="Kota" value={formData.place} onChange={e => setFormData({...formData, place: e.target.value})} />
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        className={`w-full rounded border text-sm px-3 py-2 ${dateError ? 'border-red-500 bg-red-50' : 'border-slate-300'}`} 
                                        value={formData.date} 
                                        onChange={handleDateChange} 
                                        required
                                    />
                                    {dateError && <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">{dateError}</span>}
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <input type="text" className="w-full rounded border-slate-300 text-sm px-3 py-2" placeholder="Kepala Sekolah" value={formData.principalName} onChange={e => setFormData({...formData, principalName: e.target.value})} />
                                <input type="text" className="w-full rounded border-slate-300 text-sm px-3 py-2" placeholder="NIP Kepsek" value={formData.principalNIP} onChange={e => setFormData({...formData, principalNIP: e.target.value})} />
                             </div>
                         </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                        <button 
                        type="button" 
                        onClick={saveToFavorites}
                        className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all"
                        title="Simpan Konfigurasi"
                        >
                            <Star size={18} />
                        </button>
                        <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                        {isLoading ? (
                            <>Menyusun Modul...</>
                        ) : (
                            <><Save size={18} /> Buat Modul Ajar</>
                        )}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div className="lg:col-span-7">
            {isLoading && <LoadingSpinner />}
            
             {!result && !isLoading && (
                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 h-[600px] flex flex-col items-center justify-center text-slate-400 p-8 text-center sticky top-24">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <BookOpen size={40} className="opacity-50 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600 mb-2">Area Preview Dokumen</h3>
                    <p className="max-w-xs text-sm">Dokumen Modul Ajar/RPP yang dihasilkan akan muncul di sini dengan format siap cetak.</p>
                </div>
            )}

            {result && !isLoading && (
                 <div className="space-y-6 animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-20">
                           <div className="flex items-center gap-2 pl-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Filter size={14} /> Filter:
                                    <select 
                                        value={activeMeetingFilter}
                                        onChange={(e) => setActiveMeetingFilter(parseInt(e.target.value))}
                                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value={0}>Semua Pertemuan</option>
                                        {Array.from({length: formData.meetingCount}, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>Pertemuan {num}</option>
                                        ))}
                                    </select>
                                </div>
                           </div>
                           <div className="flex gap-2">
                                <button 
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                                title="Salin ke Clipboard"
                                >
                                    {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>}
                                    {copied ? 'Disalin' : 'Salin'}
                                </button>
                                <button 
                                onClick={() => setShowPrintOptions(!showPrintOptions)}
                                className={`p-2 rounded-lg transition ${showPrintOptions ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                                title="Opsi Cetak"
                                >
                                    <Settings size={18} />
                                </button>
                                <button 
                                onClick={handleExportDocx}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                                >
                                    <FileText size={14} /> Word
                                </button>
                                <button 
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition shadow-sm"
                                >
                                    <Download size={14} /> PDF
                                </button>
                           </div>
                      </div>

                       {showPrintOptions && (
                          <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 animate-in slide-in-from-top-2">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bagian Dokumen</h4>
                                <button onClick={handleSelectAll} className="text-xs text-indigo-600 font-bold hover:underline">Pilih Semua</button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {Object.keys(sectionsToPrint).map((key) => (
                                      <label key={key} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer bg-slate-50 p-2 rounded hover:bg-slate-100">
                                          <input type="checkbox" checked={(sectionsToPrint as any)[key]} onChange={(e) => setSectionsToPrint({...sectionsToPrint, [key]: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                                          {key.charAt(0).toUpperCase() + key.slice(1)}
                                      </label>
                                  ))}
                              </div>
                          </div>
                      )}

                      <div className="relative">
                           {renderSelectiveContent()}
                           <div className="absolute inset-0 pointer-events-none rounded-sm ring-1 ring-black/5"></div>
                      </div>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};
