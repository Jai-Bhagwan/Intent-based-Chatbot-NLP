import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatInterface } from './components/ChatInterface';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Message, NlpAnalysis } from './types';
import { analyzeText } from './services/geminiService';
import { PanelsTopLeft } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<NlpAnalysis | null>(null);
  const [showAnalysisMobile, setShowAnalysisMobile] = useState(false);

  // Initial greeting
  useEffect(() => {
    const initialMsg: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "Hello! I'm NeuroChat. I can understand your intent and extract entities from your messages. I'm also aware of the current date and time. Try saying 'Book a flight for today' or asking 'What is today's date?'.",
      timestamp: new Date()
    };
    setMessages([initialMsg]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Get conversation history (both user and assistant for better context)
    const history = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Call NLP Service
    const analysis = await analyzeText(userText, history);

    // Add assistant response
    const aiMsg: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: analysis.response,
      timestamp: new Date(),
      analysis: analysis
    };

    setMessages(prev => [...prev, aiMsg]);
    setCurrentAnalysis(analysis);
    setIsLoading(false);
    
    // Auto-open mobile analysis if valid
    if (window.innerWidth < 1024) {
        // Optional: toast or slight indication, but avoiding intrusive popups
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Mobile Toggle for Analysis */}
      <button 
        onClick={() => setShowAnalysisMobile(!showAnalysisMobile)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg text-slate-300"
      >
        <PanelsTopLeft size={20} />
      </button>

      {/* Main Layout Grid */}
      <div className="flex w-full h-full max-w-[1920px] mx-auto shadow-2xl overflow-hidden">
        
        {/* Left: Chat Area */}
        <div className="flex-1 h-full min-w-0 border-r border-slate-800">
          <ChatInterface 
            messages={messages}
            input={inputValue}
            setInput={setInputValue}
            onSend={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Analysis Panel (Hidden on mobile unless toggled) */}
        <div className={`
          fixed inset-0 z-40 bg-slate-900 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-[400px] xl:w-[450px] lg:block lg:inset-auto border-l border-slate-800
          ${showAnalysisMobile ? 'translate-x-0' : 'translate-x-full'}
        `}>
           <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-sm">
             <div className="lg:hidden p-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="font-bold text-slate-200">Analysis</h2>
                <button onClick={() => setShowAnalysisMobile(false)} className="text-slate-400">Close</button>
             </div>
             <AnalysisPanel analysis={currentAnalysis} isLoading={isLoading} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;