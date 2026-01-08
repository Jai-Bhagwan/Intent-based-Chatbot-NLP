import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Bot, User, Cpu } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  input, 
  setInput, 
  onSend, 
  isLoading 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-100">NeuroChat</h1>
            <p className="text-xs text-slate-400">Transformer-based Intent Detection</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 opacity-50">
            <Bot size={64} />
            <p className="text-sm">Start typing to initialize the NLP pipeline...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`
              px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-slate-800 text-slate-100 rounded-tr-none' 
                : 'bg-indigo-900/30 text-slate-200 border border-indigo-500/20 rounded-tl-none'}
            `}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-4 mr-auto max-w-3xl">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={14} />
             </div>
             <div className="flex space-x-1 items-center h-10 px-4 bg-indigo-900/20 rounded-2xl rounded-tl-none border border-indigo-500/10">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="relative max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message (e.g. 'Book a flight to Paris for tomorrow')..."
            disabled={isLoading}
            className="w-full bg-slate-800 border-2 border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-0 disabled:translate-x-2"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-600">Simulating BERT/DistilBERT pipeline via Gemini Flash 2.0</p>
        </div>
      </div>
    </div>
  );
};