
import React from 'react';
import { ToolType } from '../types';
import { BookOpen, FileQuestion, MessageSquare, ArrowRight, ClipboardList, FileText, Library, Sparkles, MonitorPlay, Dices, Heart } from 'lucide-react';

interface DashboardProps {
  onSelectTool: (tool: ToolType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1e1b4b] shadow-2xl shadow-indigo-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-90"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-fuchsia-500 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles size={12} /> AI For Education V2.0
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                    Asisten Guru <br/> Asep Saefullah <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white text-2xl md:text-4xl block mt-2">Administrasi Tuntas.</span>
                </h1>
                <p className="text-indigo-100 text-lg leading-relaxed max-w-lg">
                    Platform all-in-one untuk menyusun Modul Ajar, Soal HOTS, dan Rubrik Penilaian sesuai Kurikulum Merdeka dalam hitungan detik.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                    <button 
                        onClick={() => onSelectTool(ToolType.RPP_GENERATOR)}
                        className="bg-white text-indigo-700 font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-black/10 hover:shadow-xl hover:bg-indigo-50 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        <BookOpen size={20}/> Mulai Buat Modul
                    </button>
                    <button 
                        onClick={() => onSelectTool(ToolType.CHAT)}
                        className="bg-indigo-700/50 backdrop-blur-md border border-white/20 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-indigo-600/50 transition flex items-center gap-2"
                    >
                        <MessageSquare size={20}/> Tanya AI
                    </button>
                </div>
            </div>
            {/* Illustration Placeholder or Abstract Shape */}
            <div className="hidden md:block relative">
                 <div className="w-64 h-64 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl border border-white/10 backdrop-blur-sm rotate-6 transform translate-y-4"></div>
                 <div className="w-64 h-64 bg-gradient-to-bl from-indigo-500/40 to-transparent rounded-2xl border border-white/10 backdrop-blur-md -rotate-6 transform -translate-y-4 absolute inset-0"></div>
            </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
            Menu Layanan Utama
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard 
                icon={BookOpen} 
                title="Modul Ajar & RPP" 
                desc="Susun rencana pembelajaran lengkap dengan tujuan, langkah kegiatan, dan asesmen."
                color="blue"
                onClick={() => onSelectTool(ToolType.RPP_GENERATOR)}
            />
            <DashboardCard 
                icon={FileQuestion} 
                title="Pembuat Soal (Kuis)" 
                desc="Hasilkan soal pilihan ganda atau esai HOTS beserta kunci jawabannya otomatis."
                color="pink"
                onClick={() => onSelectTool(ToolType.QUIZ_MAKER)}
            />
             <DashboardCard 
                icon={MonitorPlay} 
                title="Kerangka Presentasi" 
                desc="Buat outline slide presentasi yang terstruktur dan menarik untuk materi ajar."
                color="orange"
                onClick={() => onSelectTool(ToolType.PRESENTATION)}
            />
             <DashboardCard 
                icon={Dices} 
                title="Ice Breaking Seru" 
                desc="Ide permainan dan aktivitas penyegar suasana kelas agar siswa tidak bosan."
                color="cyan"
                onClick={() => onSelectTool(ToolType.ICE_BREAKING)}
            />
             <DashboardCard 
                icon={Heart} 
                title="CurhatBareng" 
                desc="Teman cerita empatik untuk keluh kesah guru dan dukungan mental positif."
                color="rose"
                onClick={() => onSelectTool(ToolType.CURHAT)}
            />
            <DashboardCard 
                icon={FileText} 
                title="Generator LKPD" 
                desc="Buat Lembar Kerja Peserta Didik yang interaktif dan menarik untuk aktivitas kelas."
                color="indigo"
                onClick={() => onSelectTool(ToolType.LKPD_GENERATOR)}
            />
            <DashboardCard 
                icon={ClipboardList} 
                title="Rubrik Penilaian" 
                desc="Otomatisasi pembuatan tabel kriteria penilaian untuk berbagai jenis tugas siswa."
                color="purple"
                onClick={() => onSelectTool(ToolType.RUBRIC_MAKER)}
            />
            <DashboardCard 
                icon={Library} 
                title="Bahan Ajar" 
                desc="Kembangkan materi bacaan, ringkasan, atau studi kasus kontekstual untuk siswa."
                color="teal"
                onClick={() => onSelectTool(ToolType.MATERIAL_GENERATOR)}
            />
            <DashboardCard 
                icon={MessageSquare} 
                title="Konsultasi Pedagogik" 
                desc="Diskusi bebas dengan AI mengenai metode, psikologi siswa, atau masalah kelas."
                color="emerald"
                onClick={() => onSelectTool(ToolType.CHAT)}
            />
        </div>
      </div>
    </div>
  );
};

// Reusable Professional Card Component
const DashboardCard = ({ icon: Icon, title, desc, color, onClick }: any) => {
    const colorClasses: any = {
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        pink: "bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
        orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
        purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
        teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
        rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
    };

    return (
        <div 
            onClick={onClick}
            className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300 cursor-pointer relative overflow-hidden"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${colorClasses[color] || colorClasses.blue} shadow-sm`}>
                <Icon size={26} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{desc}</p>
            
            <div className="flex items-center text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Buka Alat <ArrowRight size={16} className="ml-1" />
            </div>
        </div>
    );
};