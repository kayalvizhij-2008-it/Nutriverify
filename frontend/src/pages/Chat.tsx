import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { chatApi, AnalysisResponse, ChatResponseDto } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
  providerType?: string;
  statusLabel?: string;
  fallback?: boolean;
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeContext, setActiveContext] = useState<AnalysisResponse | null>(null);
  const [lastResponseMeta, setLastResponseMeta] = useState<{ providerType?: string; statusLabel?: string; fallback?: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  useEffect(() => {
    // Check active analysis context from sessionStorage
    const raw = sessionStorage.getItem('nv_last_result');
    if (raw) {
      try {
        setActiveContext(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle URL query ?q=...
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !initialSent.current) {
      initialSent.current = true;
      send(q);
    }
  }, [searchParams]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsgId = 'u-' + Date.now();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: msg, timestamp: new Date().toLocaleTimeString() }]);
    setLoading(true);

    try {
      const res: ChatResponseDto = await chatApi.send(msg, activeContext?.historyId);
      const meta = {
        providerType: res.providerType || 'DETERMINISTIC_FALLBACK',
        statusLabel: res.statusLabel || (res.fallback ? 'Verified fallback' : 'AI-powered'),
        fallback: res.fallback,
      };
      setLastResponseMeta(meta);

      setMessages(prev => [
        ...prev,
        {
          id: 'a-' + Date.now(),
          role: 'assistant',
          text: res.response,
          timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          providerType: meta.providerType,
          statusLabel: meta.statusLabel,
          fallback: meta.fallback,
        },
      ]);
    } catch (err: any) {
      // Graceful fallback if network or endpoint fails completely
      const fallbackMsg = "NutriVerify's generative AI service is temporarily unavailable. Here is a verified label-based answer:\n\n"
        + (activeContext
          ? `For ${activeContext.productName} (${activeContext.brand || 'Specimen'}), Health Score is ${activeContext.healthScore}/100 and Risk Level is ${activeContext.riskLevel}. Calories: ${activeContext.calories} kcal, Sugar: ${activeContext.sugar}g, Sodium: ${activeContext.sodium}mg, Protein: ${activeContext.protein}g.`
          : "I'm the NutriVerify AI Assistant. Ask me anything about food labels, nutrition facts, or front-of-pack claims.");

      setLastResponseMeta({ providerType: 'DETERMINISTIC_FALLBACK', statusLabel: 'Verified fallback', fallback: true });

      setMessages(prev => [
        ...prev,
        {
          id: 'a-' + Date.now(),
          role: 'assistant',
          text: fallbackMsg,
          timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          providerType: 'DETERMINISTIC_FALLBACK',
          statusLabel: 'Verified fallback',
          fallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const clearActiveContext = () => {
    setActiveContext(null);
  };

  const smartPrompts = activeContext
    ? [
        `Why did ${activeContext.productName} receive this score?`,
        'Is this product high in sugar?',
        'What ingredients should I watch out for?',
        'Are any of the claims questionable?',
        'Give me a short summary',
      ]
    : [
        'Why did this product receive a low score?',
        'What is the recommended daily limit for sodium?',
        'How does NutriVerify verify health claims?',
        'What are the most common food allergens?',
        'Explain E-numbers and chemical additives',
      ];

  const currentStatusLabel = lastResponseMeta.statusLabel || 'Hybrid AI Agent';
  const isAIPowered = lastResponseMeta.providerType === 'AI_PROVIDER' && !lastResponseMeta.fallback;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto w-full px-4 py-2 animate-fade-in-up">
      {/* Top Bar Header */}
      <div className="px-6 py-4 rounded-2xl border border-white/10 bg-[#0D1610] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#142217] text-primary-container flex items-center justify-center border border-primary-container/30 shadow-[0_0_15px_rgba(200,255,77,0.2)]">
            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">NutriVerify AI Intelligence</h1>

              {/* AI Trust Indicator Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full font-label-code text-[10px] font-bold border flex items-center gap-1 ${
                  isAIPowered
                    ? 'bg-[#1A3320] text-[#8BE28B] border-[#8BE28B]/30'
                    : 'bg-[#2B2313] text-[#FFB86B] border-[#FFB86B]/30'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {isAIPowered ? 'auto_awesome' : 'verified_user'}
                </span>
                <span>{isAIPowered ? 'NUTRIVERIFY AI • AI-powered' : 'NUTRIVERIFY AI • Verified fallback'}</span>
              </span>
            </div>
            <p className="text-xs text-[#A9B4AA]">
              Food-label intelligence assistant grounded in clinical verification facts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeContext && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#142217] border border-white/10 text-xs text-white">
              <span className="material-symbols-outlined text-[16px] text-primary-container">inventory_2</span>
              <span className="truncate max-w-[140px] font-bold">{activeContext.productName}</span>
              <button
                onClick={clearActiveContext}
                className="text-[#A9B4AA] hover:text-white ml-1"
                title="Clear Product Context"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-xl bg-[#18261C] hover:bg-[#223627] text-[#A9B4AA] hover:text-white transition-colors"
              title="Clear Conversation"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Product Context Banner */}
      {activeContext && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-[#142217] border border-primary-container/20 flex items-center justify-between text-xs text-[#A9B4AA]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[18px]">insights</span>
            <span>
              Discussing: <strong className="text-white">{activeContext.productName}</strong> ({activeContext.brand || 'Specimen'}) • Health Score: <strong className="text-primary-container">{activeContext.healthScore}/100</strong>
            </span>
          </div>
          <Link to="/results" className="text-primary-container hover:underline font-bold flex items-center gap-1">
            <span>View Dossier</span>
            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 rounded-2xl bg-[#0D1610]/80 border border-white/10 scroll-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-[#142217] border border-primary-container/30 flex items-center justify-center mb-4 text-primary-container shadow-[0_0_20px_rgba(200,255,77,0.15)]">
              <span className="material-symbols-outlined text-[32px]">psychology</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Ask NutriVerify AI
            </h2>
            <p className="text-xs text-[#A9B4AA] max-w-md mb-6 leading-relaxed">
              {activeContext
                ? `Currently grounded in analysis context for ${activeContext.productName}. Ask about nutrition breakdown, ingredients, claim truthfulness, or health score.`
                : 'Ask questions about food label facts, Front-of-Pack claim verification, allergen safety, or nutrition standards.'}
            </p>

            <div className="flex flex-wrap gap-2 justify-center max-w-xl">
              {smartPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="text-xs px-3.5 py-2 bg-[#142217] hover:bg-[#1f3323] border border-white/10 hover:border-primary-container/40 rounded-xl text-white font-medium transition-all text-left shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary-container">chat_bubble_outline</span>
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}>
            <div
              className={`max-w-[85%] px-4 py-3.5 rounded-2xl ${
                m.role === 'user'
                  ? 'bg-primary-container text-black font-semibold rounded-br-none shadow-md'
                  : 'bg-[#142217] border border-white/10 text-white rounded-bl-none shadow-sm space-y-2'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary-container">smart_toy</span>
                    <span className="font-label-code text-[11px] text-primary-container uppercase font-bold tracking-wider">
                      NutriVerify AI
                    </span>

                    {/* Per-message AI provider status badge */}
                    <span
                      className={`px-2 py-0.2 rounded-full font-label-code text-[9px] font-bold ${
                        m.providerType === 'AI_PROVIDER' && !m.fallback
                          ? 'bg-[#1A3320] text-[#8BE28B] border border-[#8BE28B]/30'
                          : 'bg-[#2B2313] text-[#FFB86B] border border-[#FFB86B]/30'
                      }`}
                    >
                      {m.statusLabel || (m.fallback ? 'Verified fallback' : 'AI-powered')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.timestamp && (
                      <span className="font-label-code text-[10px] text-[#A9B4AA]">{m.timestamp}</span>
                    )}
                    <button
                      onClick={() => copyMessage(m.id, m.text)}
                      className="p-1 rounded hover:bg-white/10 text-[#A9B4AA] hover:text-white transition-colors"
                      title="Copy Answer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedId === m.id ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-body">
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-message-in">
            <div className="bg-[#142217] border border-white/10 px-4 py-3.5 rounded-2xl rounded-bl-none flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-primary-container">smart_toy</span>
              <span className="font-label-code text-[11px] text-primary-container uppercase font-bold tracking-wider">
                NutriVerify AI
              </span>
              <div className="flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-typing-dot-1" />
                <span className="w-2 h-2 rounded-full bg-primary-container animate-typing-dot-2" />
                <span className="w-2 h-2 rounded-full bg-primary-container animate-typing-dot-3" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input Bar */}
      <div className="pt-3">
        <div className="flex items-center gap-2 bg-[#0D1610] p-2 rounded-2xl border border-white/10 shadow-xl">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 bg-[#142217] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#A9B4AA]/60 focus:outline-none focus:border-primary-container"
            placeholder={
              activeContext
                ? `Ask about ${activeContext.productName} (nutrition, ingredients, claims)...`
                : 'Ask about food label facts, claims, or ingredients...'
            }
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 flex items-center justify-center bg-primary-container hover:brightness-110 text-black rounded-xl transition-all disabled:opacity-40 font-bold shadow-md active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
