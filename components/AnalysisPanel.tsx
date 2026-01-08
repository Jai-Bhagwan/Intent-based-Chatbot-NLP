import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NlpAnalysis } from '../types';
import { BrainCircuit, Tag, Activity, Clock } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: NlpAnalysis | null;
  isLoading: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 animate-pulse">
        <BrainCircuit size={48} className="animate-spin duration-[3000ms]" />
        <p>Analyzing linguistic patterns...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 p-8 text-center">
        <BrainCircuit size={48} />
        <h3 className="text-xl font-medium text-slate-300">Neural Engine Ready</h3>
        <p className="max-w-xs">Send a message to see real-time Intent Classification and Named Entity Recognition (NER) analysis.</p>
      </div>
    );
  }

  const chartData = analysis.detectedIntents.map(intent => ({
    name: intent.label,
    score: (intent.score * 100).toFixed(1),
    rawScore: intent.score
  }));

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Header Stats */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-700 pb-4">
        <div className="flex items-center space-x-2">
          <Activity size={14} />
          <span>STATUS: ONLINE</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={14} />
          <span>LATENCY: {analysis.processingTimeMs}ms</span>
        </div>
      </div>

      {/* Intent Classification Section */}
      <section>
        <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BrainCircuit size={16} />
          Intent Classification
        </h3>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                width={100}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                formatter={(value: string) => [`${value}%`, 'Confidence']}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#38bdf8' : '#475569'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-mono text-right">
          Top Intent: <span className="text-sky-400 font-bold">{analysis.detectedIntents[0]?.label || 'None'}</span>
        </div>
      </section>

      {/* Entity Extraction Section */}
      <section>
        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Tag size={16} />
          Extracted Entities (NER)
        </h3>
        
        {analysis.extractedEntities.length === 0 ? (
          <div className="text-sm text-slate-500 italic p-4 border border-dashed border-slate-700 rounded-lg text-center">
            No named entities detected.
          </div>
        ) : (
          <div className="grid gap-3">
            {analysis.extractedEntities.map((entity, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-start justify-between hover:border-emerald-500/50 transition-colors">
                <div>
                  <div className="text-emerald-300 font-medium">{entity.value}</div>
                  {entity.description && (
                    <div className="text-xs text-slate-500 mt-1">{entity.description}</div>
                  )}
                </div>
                <div className="px-2 py-1 bg-emerald-950 text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-900">
                  {entity.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Raw JSON Debug View (Optional but cool for engineers) */}
      <section>
         <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Raw Payload</h3>
         <pre className="text-[10px] bg-black/30 p-3 rounded text-slate-400 overflow-x-auto font-mono">
           {JSON.stringify({ intents: analysis.detectedIntents, entities: analysis.extractedEntities }, null, 2)}
         </pre>
      </section>
    </div>
  );
};