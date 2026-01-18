
import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileQuestion, 
  MessageSquare, 
  LogOut,
  GraduationCap,
  ClipboardList,
  FileText,
  Library,
  ChevronRight,
  Infinity,
  MonitorPlay,
  Dices,
  Heart
} from 'lucide-react';
import { ToolType } from '../types';

interface SidebarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTool, onSelectTool, isMobileOpen, setIsMobileOpen, onLogout }) => {
  
  const menuItems = [
    { id: ToolType.DASHBOARD, label: 'Beranda', icon: LayoutDashboard },
    { id: ToolType.RPP_GENERATOR, label: 'Modul Ajar / RPP', icon: BookOpen },
    { id: ToolType.QUIZ_MAKER, label: 'Pembuat Soal', icon: FileQuestion },
    { id: ToolType.LKPD_GENERATOR, label: 'Generator LKPD', icon: FileText },
    { id: ToolType.RUBRIC_MAKER, label: 'Rubrik Penilaian', icon: ClipboardList },
    { id: ToolType.MATERIAL_GENERATOR, label: 'Bahan Ajar', icon: Library },
    { id: ToolType.PRESENTATION, label: 'Kerangka Presentasi', icon: MonitorPlay },
    { id: ToolType.ICE_BREAKING, label: 'Ice Breaking', icon: Dices },
    { id: ToolType.CURHAT, label: 'CurhatBareng', icon: Heart },
    { id: ToolType.CHAT, label: 'Asisten Chat', icon: MessageSquare },
  ];

  const handleSelect = (id: ToolType) => {
    onSelectTool(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden print:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-[#0f172a] text-white transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static flex flex-col shadow-2xl border-r border-slate-800 print:hidden
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 pb-6 flex flex-col items-start gap-4 bg-[#0f172a]">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <GraduationCap size={28} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">Asisten Guru <br/>Asep Saefullah</h1>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1.5 block">AI Professional</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-2">Main Menu</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTool === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    group w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight size={16} className="opacity-70" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800/50 bg-[#0f172a]">
            <div className="bg-slate-800/50 rounded-xl p-4 mb-3 border border-slate-700/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Infinity size={48} className="text-emerald-400" />
              </div>
              
              <div className="relative z-10">
                <p className="text-xs text-slate-400 mb-1">Status Paket:</p>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-white font-bold text-lg leading-none">Unlimited</span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Aktif</span>
                </div>
                
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1.5 rounded-full w-full"></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <CheckCircleIcon /> Bebas akses semua fitur
                </p>
              </div>
            </div>
            <button 
              onClick={() => onLogout && onLogout()}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/30 cursor-pointer transition-all rounded-xl"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Keluar Aplikasi</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);
