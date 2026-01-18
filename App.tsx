
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RPPGenerator } from './components/Tools/RPPGenerator';
import { QuizMaker } from './components/Tools/QuizMaker';
import { LKPDGenerator } from './components/Tools/LKPDGenerator';
import { RubricGenerator } from './components/Tools/RubricGenerator';
import { MaterialGenerator } from './components/Tools/MaterialGenerator';
import { PresentationGenerator } from './components/Tools/PresentationGenerator';
import { IceBreakingGenerator } from './components/Tools/IceBreakingGenerator';
import { CurhatBareng } from './components/Tools/CurhatBareng';
import { ChatAssistant } from './components/Tools/ChatAssistant';
import { ToolType } from './types';
import { Menu, Lock, ArrowRight, ShieldCheck, GraduationCap, Sparkles, Zap, Shield, Heart, Star, Quote, CheckCircle, Phone, MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const DEFAULT_PIN = 'AsepSaefullahGPAI3CITI';
  const PROFILE_IMAGE = 'https://attachment.notion.static.pub/299c8577-c335-430b-930f-b4c489c4458d/Screenshot_2025-02-13_at_16.03.22.png?id=1991e483-e028-80f0-8c22-e19c3666b356&table=block&spaceId=f7480a87-175f-4a0b-801b-9993335e2671&expirationTimestamp=1739520000000&signature=Wq_8zE_oWbW6nB1eW6nB1eW6nB1eW6nB1eW6nB1eW6n';

  useEffect(() => {
    const authStatus = localStorage.getItem('asisten_guru_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === DEFAULT_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('asisten_guru_auth', 'true');
      setError('');
    } else {
      setError('Kode akses tidak valid.');
      setPin('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(false);
    localStorage.removeItem('asisten_guru_auth');
    setPin('');
    setCurrentTool(ToolType.DASHBOARD);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    switch (currentTool) {
      case ToolType.DASHBOARD: return <Dashboard onSelectTool={setCurrentTool} />;
      case ToolType.RPP_GENERATOR: return <RPPGenerator />;
      case ToolType.QUIZ_MAKER: return <QuizMaker />;
      case ToolType.LKPD_GENERATOR: return <LKPDGenerator />;
      case ToolType.RUBRIC_MAKER: return <RubricGenerator />;
      case ToolType.MATERIAL_GENERATOR: return <MaterialGenerator />;
      case ToolType.PRESENTATION: return <PresentationGenerator />;
      case ToolType.ICE_BREAKING: return <IceBreakingGenerator />;
      case ToolType.CURHAT: return <CurhatBareng />;
      case ToolType.CHAT: return <ChatAssistant />;
      default: return <Dashboard onSelectTool={setCurrentTool} />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentTool) {
      case ToolType.DASHBOARD: return 'Beranda';
      case ToolType.RPP_GENERATOR: return 'Generator Modul Ajar / RPP';
      case ToolType.QUIZ_MAKER: return 'Pembuat Soal & Kuis';
      case ToolType.LKPD_GENERATOR: return 'Generator LKPD';
      case ToolType.RUBRIC_MAKER: return 'Pembuat Rubrik Penilaian';
      case ToolType.MATERIAL_GENERATOR: return 'Generator Bahan Ajar';
      case ToolType.PRESENTATION: return 'Kerangka Presentasi';
      case ToolType.ICE_BREAKING: return 'Ice Breaking Generator';
      case ToolType.CURHAT: return 'CurhatBareng';
      case ToolType.CHAT: return 'Asisten Chat';
      default: return 'Asisten Guru Asep Saefullah';
    }
  };

  // --- LANDING PAGE VIEW ---
  if (!isAuthenticated && !showLogin) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <GraduationCap size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">Asisten Guru Asep Saefullah</span>
              <span className="font-bold text-xl tracking-tight sm:hidden">Asisten Guru</span>
            </div>
            <div className="flex items-center gap-4">
               <a href="#manfaat" onClick={(e) => scrollToSection(e, 'manfaat')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition hidden md:block">Manfaat</a>
               <a href="#testimoni" onClick={(e) => scrollToSection(e, 'testimoni')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition hidden md:block">Testimoni</a>
               <button 
                onClick={() => setShowLogin(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-indigo-200 text-sm"
              >
                Mulai Sekarang
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 md:pt-48 pb-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold">
                <Sparkles size={16} /> Transformasi Pendidikan dengan AI
              </div>
              <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Urus Admin Guru <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Jauh Lebih Cepat.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Asisten cerdas berbasis AI untuk membantu Bapak/Ibu Guru menyusun Modul Ajar, Soal Kuis, hingga Rubrik Penilaian dalam hitungan detik. Sesuai Kurikulum Merdeka!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button 
                  onClick={() => setShowLogin(true)}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-10 py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                >
                  Masuk Aplikasi <ArrowRight size={22} />
                </button>
                <a 
                  href="https://wa.me/6287703081979" 
                  target="_blank"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-indigo-700 font-bold px-8 py-4 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition"
                >
                  <MessageCircle size={20} /> Hubungi Admin
                </a>
              </div>
            </div>

            <div className="flex-1 relative animate-fade-in-up">
              <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.squarespace-cdn.com/content/v1/5f480a87175f4a0b801b9993/63765106-2b2b-477a-9e73-b3c69c656914/Screenshot+2025-02-13+at+16.03.22.png" 
                  alt="Asep Saefullah" 
                  className="w-full h-auto object-cover scale-110"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x400?text=Asisten+Guru+Asep+Saefullah"; }}
                />
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <p className="font-bold text-xl">Asep Saefullah, S.Pd.I</p>
                  <p className="text-sm opacity-80 italic">Player of The Match in Education</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-600 rounded-3xl -z-10 animate-pulse opacity-20"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-violet-600 rounded-full -z-10 opacity-10"></div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="manfaat" className="py-28 bg-slate-50 relative scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Mengapa Memilih Kami?</h2>
              <p className="text-slate-500 text-lg">Hadir sebagai rekan cerdas untuk meringankan beban administrasi Bapak/Ibu Guru.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BenefitCard 
                icon={Zap}
                title="Super Efisien"
                desc="RPP dan Soal yang biasanya berjam-jam, kini tuntas dalam hitungan detik. Hemat waktu untuk keluarga dan istirahat."
                color="blue"
              />
              <BenefitCard 
                icon={Shield}
                title="Sesuai Kurikulum"
                desc="Output AI dirancang khusus mengikuti struktur Capaian Pembelajaran (CP) dan TP terbaru Kurikulum Merdeka."
                color="emerald"
              />
              <BenefitCard 
                icon={Heart}
                title="Support Mental"
                desc="Ada fitur CurhatBareng sebagai rekan empatik untuk mendengarkan keluh kesah dan tantangan Bapak/Ibu di sekolah."
                color="rose"
              />
            </div>
          </div>
        </section>

        {/* Testimonials Grid (10 Guru) */}
        <section id="testimoni" className="py-28 bg-white relative scroll-mt-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Inspirasi Dari Rekan Guru</h2>
              <p className="text-slate-500 text-lg">Kisah nyata dari para pendidik hebat yang telah bertransformasi.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard 
                name="Bapak Rizky Ramadhan" 
                role="Guru SMK - Jawa Barat"
                text="Luar biasa! Fitur Pembuat Soal sangat membantu untuk menyusun kuis harian yang variatif. Siswa jadi lebih semangat belajar."
                avatar="RR"
              />
              <TestimonialCard 
                name="Ibu Siti Maryam" 
                role="Guru SD - Jakarta"
                text="Dulu bikin Modul Ajar selalu pusing cari TP yang pas. Sekarang tinggal masukkan topik, semuanya sudah tersusun rapi!"
                avatar="SM"
              />
              <TestimonialCard 
                name="Ibu Linda Wati" 
                role="Guru PAI - Medan"
                text="CurhatBareng-nya beneran kerasa empatik. Pas lagi stres urus akreditasi, fitur ini jadi teman ngobrol yang menenangkan."
                avatar="LW"
              />
              <TestimonialCard 
                name="Bapak Ahmad Subarjo" 
                role="Guru IPA SMP - Surabaya"
                text="RPP yang dihasilkan sangat detail. Bagian kegiatan intinya sangat aplikatif untuk metode Project Based Learning."
                avatar="AS"
              />
              <TestimonialCard 
                name="Ibu Ningsih" 
                role="Guru Bahasa Indonesia - Bali"
                text="Generator LKPD-nya sangat membantu membuat lembar kerja yang interaktif. Siswa jadi tidak bosan di kelas."
                avatar="NS"
              />
              <TestimonialCard 
                name="Bapak Dedi Kurniawan" 
                role="Kepala Sekolah - Bandung"
                text="Aplikasi ini wajib dimiliki setiap guru di sekolah saya. Administrasi rapi, kualitas pengajaran pun meningkat."
                avatar="DK"
              />
              <TestimonialCard 
                name="Ibu Rahayu" 
                role="Guru Matematika - Yogyakarta"
                text="Soal HOTS yang dihasilkan benar-benar berkualitas. Sangat membantu siswa dalam persiapan ujian akhir."
                avatar="RY"
              />
              <TestimonialCard 
                name="Bapak Faris" 
                role="Guru Penjas - Makassar"
                text="Siapa bilang AI cuma buat pelajaran teori? Ide ice breaking-nya seru-seru banget buat dipraktekkan di lapangan!"
                avatar="FR"
              />
              <TestimonialCard 
                name="Ibu Kartika" 
                role="Guru Kesenian - Solo"
                text="Bahan ajar yang dibuat AI sangat kreatif dan mudah dipahami oleh anak-anak. Desain alurnya sangat sistematis."
                avatar="KT"
              />
              <TestimonialCard 
                name="Ibu Elok" 
                role="Guru TK - Malang"
                text="Bahkan untuk anak usia dini, ide-ide kegiatannya sangat inspiratif. Terima kasih Asisten Guru!"
                avatar="EL"
              />
            </div>
          </div>
        </section>

        {/* Access Contact Section */}
        <section className="py-24 px-6 text-center bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Sparkles className="absolute top-10 left-10 w-20 h-20" />
            <GraduationCap className="absolute bottom-10 right-10 w-40 h-40" />
          </div>
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold">Siap Menghadapi Era Digital?</h2>
            <p className="text-xl text-indigo-100 leading-relaxed">Jangan biarkan administrasi menghambat potensi Bapak/Ibu dalam mencetak generasi emas bangsa.</p>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <p className="text-lg font-bold mb-4">Butuh Kode Akses Aplikasi?</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <a 
                      href="https://wa.me/6287703081979" 
                      target="_blank" 
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold px-10 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-3"
                    >
                      <Phone size={24} /> 087703081979
                    </a>
                    <button 
                      onClick={() => setShowLogin(true)}
                      className="bg-white text-indigo-600 text-xl font-bold px-12 py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transition-all"
                    >
                      Masuk Aplikasi
                    </button>
                </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <GraduationCap size={20} />
                </div>
                <span className="font-bold text-xl text-slate-800 tracking-tight">Asisten Guru</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">Solusi AI Professional untuk meningkatkan kualitas pendidikan Indonesia melalui efisiensi administrasi guru.</p>
            </div>
            
            <div className="space-y-4">
               <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Akses & Bantuan</h4>
               <ul className="text-slate-600 space-y-2 text-sm">
                  <li><a href="https://wa.me/6287703081979" className="hover:text-indigo-600 transition">Hubungi Admin</a></li>
                  <li><a href="https://ai.google.dev/gemini-api/docs/billing" className="hover:text-indigo-600 transition">Info Billing Google</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition">Panduan Pengguna</a></li>
               </ul>
            </div>

            <div className="space-y-4">
               <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Official Contact</h4>
               <p className="text-slate-600 text-sm font-bold flex items-center justify-center md:justify-start gap-2">
                 <Phone size={16} className="text-indigo-600" /> 087703081979
               </p>
               <p className="text-slate-400 text-[10px] leading-relaxed italic">"Mencerdaskan Bangsa Melalui Teknologi yang Berempati"</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-200 text-center text-slate-400 text-xs">
             &copy; 2025 Asisten Guru Asep Saefullah. All Rights Reserved.
          </div>
        </footer>
      </div>
    );
  }

  // --- LOGIN VIEW ---
  if (!isAuthenticated && showLogin) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-slate-900">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-center relative">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-6 left-6 text-white/50 hover:text-white transition flex items-center gap-1 text-sm font-bold"
            >
              Kembali
            </button>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck size={140} className="text-white" />
            </div>
            <div className="inline-flex p-5 bg-white/10 rounded-3xl mb-4 backdrop-blur-md">
              <GraduationCap size={44} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Akses Asisten Guru Asep Saefullah</h1>
            <p className="text-indigo-100 text-sm mt-2 opacity-80">Masukkan Kode Keamanan</p>
          </div>
          
          <div className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">Kode Akses</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    autoFocus
                    className="w-full pl-12 pr-4 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-center font-bold tracking-widest"
                    placeholder="••••••••"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (error) setError('');
                    }}
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-semibold mt-3 flex items-center justify-center gap-1.5 text-center">
                   {error}
                </p>}
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                Buka Akses <ArrowRight size={20} />
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-xs">Belum punya kode akses? <br/>Hubungi Admin via WhatsApp:</p>
              <a href="https://wa.me/6287703081979" target="_blank" className="text-indigo-600 font-bold text-sm hover:underline">087703081979</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP VIEW ---
  return (
    <div className="flex min-h-screen bg-slate-50 text-[rgb(20,20,20)] font-sans">
      <Sidebar 
        currentTool={currentTool} 
        onSelectTool={setCurrentTool} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 lg:hidden px-4 py-3 flex items-center justify-between shadow-sm print:hidden">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsMobileOpen(true)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
             >
                <Menu size={24} />
             </button>
             <span className="font-bold text-slate-800 text-lg line-clamp-1">{getHeaderTitle()}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full print:p-0">
           {renderContent()}
        </main>

        <footer className="p-6 text-center border-t border-slate-200 bg-white print:hidden">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Asisten Guru Asep Saefullah. Dikembangkan untuk Pendidikan Indonesia Cerdas.
            </p>
        </footer>
      </div>
    </div>
  );
};

// --- Landing Page Components ---

const BenefitCard = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600"
  };
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 group">
      <div className={`w-16 h-16 ${colors[color]} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-bold mb-4 text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-lg">{desc}</p>
    </div>
  );
};

const TestimonialCard = ({ name, role, text, avatar }: { name: string, role: string, text: string, avatar: string }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
    <div className="space-y-4">
      <div className="flex text-amber-400 gap-0.5">
        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
      </div>
      <p className="text-slate-600 italic leading-relaxed">"{text}"</p>
    </div>
    <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-50">
      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0">
        {avatar}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 leading-none">{name}</h4>
        <p className="text-xs text-slate-500 font-medium mt-1">{role}</p>
      </div>
    </div>
  </div>
);

export default App;
