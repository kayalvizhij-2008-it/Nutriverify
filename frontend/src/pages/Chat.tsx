import { useState, useRef, useEffect } from 'react';
import { chatApi } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg, timestamp: new Date().toISOString() }]);
    setLoading(true);
    try {
      const res = await chatApi.send(msg);
      setMessages(prev => [...prev, { role: 'assistant', text: res.response, timestamp: res.timestamp }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'I apologize — the AI assistant is currently unavailable. Please try again later.', timestamp: new Date().toISOString() }]);
    } finally { setLoading(false); }
  };

  const quickPrompts = [
    'Why did this product get a low score?',
    'What ingredients should I worry about?',
    'Is this good for my dietary goals?',
    'Explain this label simply.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-nv-outline-variant/15 bg-nv-surface">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-nv-primary-container/15 border border-nv-primary/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-nv-primary">smart_toy</span>
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text">NutriSaathi</h1>
            <p className="text-[11px] font-[family-name:var(--font-mono)] text-nv-tertiary">AI Nutrition Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-nv-primary-container/10 border border-nv-primary/15 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px] text-nv-primary">smart_toy</span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-nv-text mb-1">Ask NutriSaathi</h2>
            <p className="text-[13px] text-nv-text-dim max-w-xs mb-6">Ask anything about nutrition, food labels, or your analyzed products.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {quickPrompts.map((q, i) => (
                <button key={i} onClick={() => send(q)} className="text-[12px] px-3 py-2 bg-nv-surface-container border border-nv-outline-variant/15 rounded-xl text-nv-text-dim hover:text-nv-text hover:border-nv-primary/20 transition-all">{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
              m.role === 'user'
                ? 'bg-nv-primary-container/15 border border-nv-primary/15 rounded-br-md'
                : 'bg-nv-surface-container-high/60 border border-nv-outline-variant/10 rounded-bl-md'
            }`}>
              {m.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[14px] text-nv-primary">smart_toy</span>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-wider">NutriSaathi</span>
                </div>
              )}
              <p className="text-[14px] text-nv-text leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-nv-surface-container-high/60 border border-nv-outline-variant/10 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-nv-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-nv-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-nv-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-nv-outline-variant/15 bg-nv-surface">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 bg-nv-surface-container border border-nv-outline-variant/20 rounded-xl px-4 py-3 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors"
            placeholder="Ask about nutrition, ingredients, or your analysis..." disabled={loading} />
          <button onClick={() => send()} disabled={loading || !input.trim()} className="w-10 h-10 flex items-center justify-center bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container rounded-xl transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
