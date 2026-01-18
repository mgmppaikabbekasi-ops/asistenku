
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../../types';
import { chatWithMentor } from '../../services/gemini';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Send, User, Heart, Trash2, Smile, Coffee } from 'lucide-react';

export const CurhatBareng: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'Halo, Rekan Guru. 🤗\n\nSaya di sini untuk mendengarkan. Menjadi guru itu tugas mulia yang berat. Ada yang sedang mengganjal di hati? Ceritakan saja, entah soal murid, atasan, atau lelahnya administrasi. Kita cari solusinya pelan-pelan atau sekadar melegakan perasaan.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyTexts = messages.map(m => m.text); 
      const responseText = await chatWithMentor(userMsg.text, historyTexts);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Maaf, saya sedang sulit terhubung. Tarik napas sejenak dan coba lagi nanti ya.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: 'Obrolan kita sudah saya simpan sebagai kenangan. Ada hal lain yang ingin diceritakan? Saya siap mendengarkan.',
        timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-rose-50/50 rounded-xl shadow-sm border border-rose-100 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-rose-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-500 rounded-full">
                    <Heart size={20} fill="currentColor" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800">CurhatBareng</h2>
                    <p className="text-xs text-slate-500">Ruang aman untuk berkeluh kesah.</p>
                </div>
            </div>
            <button 
                onClick={clearChat}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                title="Mulai Sesi Baru"
            >
                <Trash2 size={18}/>
            </button>
        </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-rose-50/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white
              ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-rose-400'}
            `}>
              {msg.role === 'user' ? <User size={18} className="text-white" /> : <Smile size={20} className="text-white" />}
            </div>
            
            <div className={`
              max-w-[85%] rounded-2xl p-5 shadow-sm
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-rose-100 rounded-tl-none'}
            `}>
                {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                    <div className="prose prose-sm prose-rose max-w-none">
                        <MarkdownRenderer content={msg.text} />
                    </div>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0 border-2 border-white">
                    <Coffee size={18} className="text-white" />
                 </div>
                 <div className="bg-white px-4 py-4 rounded-2xl rounded-tl-none border border-rose-100 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-rose-100">
        <form onSubmit={handleSend} className="relative flex gap-2">
          <input
            type="text"
            className="flex-1 border border-rose-200 bg-rose-50/30 rounded-full pl-6 pr-4 py-3.5 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none transition text-slate-700 placeholder:text-rose-300"
            placeholder="Ceritakan apa yang sedang dirasakan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white p-3.5 rounded-full transition-colors flex items-center justify-center shadow-lg shadow-rose-200"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};