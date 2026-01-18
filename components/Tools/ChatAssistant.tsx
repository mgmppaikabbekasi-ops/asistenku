
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../../types';
import { chatWithTeacher } from '../../services/gemini';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { Send, User, Bot, Trash2 } from 'lucide-react';

export const ChatAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'Halo! Saya Asisten Guru Asep Saefullah. Ada yang bisa saya bantu terkait tugas mengajar, administrasi, atau ide pembelajaran hari ini?',
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
      // In a real app we'd pass the whole history formatted correctly
      const historyTexts = messages.map(m => m.text); 
      const responseText = await chatWithTeacher(userMsg.text, historyTexts);
      
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
        text: 'Maaf, terjadi kesalahan saat memproses pesan Anda.',
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
        text: 'Chat telah dibersihkan. Apa yang ingin kita bahas sekarang?',
        timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
            <div>
                <h2 className="font-bold text-slate-800">Asisten Chat</h2>
                <p className="text-xs text-slate-500">Tanyakan apapun tentang pendidikan</p>
            </div>
            <button 
                onClick={clearChat}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Bersihkan Chat"
            >
                <Trash2 size={18}/>
            </button>
        </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-500'}
            `}>
              {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            
            <div className={`
              max-w-[85%] rounded-2xl p-4 shadow-sm
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-800 border border-slate-200'}
            `}>
                {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                    // Render markdown for bot messages (except for simple text, handled by component)
                    <div className="prose prose-sm prose-slate max-w-none">
                        <MarkdownRenderer content={msg.text} />
                    </div>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                 </div>
                 <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex gap-2">
          <input
            type="text"
            className="flex-1 border border-slate-300 rounded-lg pl-4 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Ketik pesan Anda di sini..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
