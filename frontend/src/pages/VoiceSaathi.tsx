import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  ts: string;
}

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

// ─── Waveform bars component ────────────────────────────────────────────────
function Waveform({ active, color }: { active: boolean; color: string }) {
  const bars = [3, 6, 10, 7, 12, 9, 5, 11, 8, 4, 10, 6, 3];
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: '3px',
            backgroundColor: color,
            height: active ? `${h * 3}px` : '4px',
            opacity: active ? 0.85 : 0.25,
            animation: active ? `waveBar ${0.4 + (i % 5) * 0.12}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── State pill ─────────────────────────────────────────────────────────────
const STATE_META: Record<VoiceState, { label: string; dot: string }> = {
  idle:       { label: 'IDLE',       dot: '#A9B4AA' },
  listening:  { label: 'LISTENING',  dot: '#C8FF4D' },
  processing: { label: 'PROCESSING', dot: '#8BE28B' },
  speaking:   { label: 'SPEAKING',   dot: '#4DB8FF' },
};

function StatePill({ state }: { state: VoiceState }) {
  const { label, dot } = STATE_META[state];
  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold tracking-widest"
      style={{
        borderColor: `${dot}40`,
        backgroundColor: `${dot}10`,
        color: dot,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: dot,
          boxShadow: state !== 'idle' ? `0 0 6px ${dot}` : 'none',
          animation: state !== 'idle' ? 'pulseDot 1.2s ease-in-out infinite' : 'none',
        }}
      />
      {label}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function VoiceSaathi() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // ── Inject keyframes once ──────────────────────────────────────────────────
  useEffect(() => {
    const id = 'nv-voice-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes waveBar {
        0%   { transform: scaleY(0.4); }
        100% { transform: scaleY(1.1); }
      }
      @keyframes pulseDot {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.3; }
      }
      @keyframes pulseRing {
        0%   { transform: scale(1);   opacity: 0.6; }
        100% { transform: scale(1.9); opacity: 0;   }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // ── Browser API setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) setIsSpeechSupported(false);
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── TTS ────────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onstart = () => setVoiceState('speaking');
    utter.onend   = () => setVoiceState('idle');
    utter.onerror = () => setVoiceState('idle');
    synthRef.current.speak(utter);
  }, []);

  // ── NLP response logic (unchanged) ────────────────────────────────────────
  const processVoiceInput = useCallback((text: string) => {
    setVoiceState('processing');
    const lower = text.toLowerCase();
    let response = '';

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('namaste')) {
      response = 'Hello! I am the NutriVerify Voice Assistant. How can I help you understand food labels today?';
    } else if (lower.includes('what can you do') || lower.includes('help')) {
      response = 'I can help you understand food labels, explain nutrition data, answer questions about ingredients and health scores, and guide you through the NutriVerify platform.';
    } else if (lower.includes('safe') || lower.includes('is this product')) {
      response = 'To evaluate product safety, NutriVerify analyzes ingredients for known allergens, harmful additives, and excessive nutrient levels. Scan a product label to get a detailed safety report.';
    } else if (lower.includes('sugar')) {
      response = 'When checking sugar, look for added sugars like high fructose corn syrup, dextrose, and sucrose. Natural sugars in whole fruit are generally accompanied by fiber. The recommended daily sugar limit is 25 to 36 grams.';
    } else if (lower.includes('protein')) {
      response = 'Good protein sources include lean meats, eggs, legumes, and dairy. Aim for protein-rich foods that are also low in sodium and added sugars. Adults generally need 50 to 60 grams of protein per day.';
    } else if (lower.includes('sodium') || lower.includes('salt')) {
      response = 'The recommended daily sodium intake is under 2300 milligrams. High sodium is considered above 600 milligrams per serving. Look for low-sodium alternatives when possible.';
    } else if (lower.includes('organic')) {
      response = 'Organic means ingredients are grown without synthetic pesticides. However, organic does not automatically mean healthier — sugar is still sugar whether organic or not.';
    } else if (lower.includes('fiber')) {
      response = 'Dietary fiber supports digestive health and helps regulate blood sugar. Adults need 25 to 30 grams of fiber per day. Foods high in fiber include whole grains, legumes, fruits, and vegetables.';
    } else if (lower.includes('allergen') || lower.includes('allergy') || lower.includes('allergens')) {
      response = 'The major food allergens include milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, and soybeans. NutriVerify screens for these automatically during ingredient analysis.';
    } else if (lower.includes('health score') || lower.includes('score') || lower.includes('explain')) {
      response = 'The NutriVerify health score ranges from 0 to 100. It is calculated based on sugar content, sodium levels, saturated fat, protein, and fiber. Higher scores indicate better nutritional quality.';
    } else if (lower.includes('alternative') || lower.includes('compare')) {
      response = 'NutriVerify can suggest healthier alternatives based on the current product\'s nutritional profile. Scan the product first, then tap "Find Alternatives" on the results page.';
    } else {
      response = `I understand you are asking about: "${text}". For detailed analysis, please analyze a specific food label through NutriVerify, and I can provide context-aware answers about that product.`;
    }

    setTimeout(() => {
      const now = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'assistant', text: response, ts: now }]);
      speak(response);
    }, 600);
  }, [speak]);

  // ── Voice controls ─────────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      setTranscript(current[0].transcript);
      if (current.isFinal) {
        const finalText = current[0].transcript;
        const now = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { role: 'user', text: finalText, ts: now }]);
        setTranscript('');
        processVoiceInput(finalText);
      }
    };

    recognition.onend = () => {
      if (voiceState === 'listening') setVoiceState('processing');
    };
    recognition.onerror = () => setVoiceState('idle');

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceState('listening');
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setVoiceState('idle');
    setTranscript('');
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setVoiceState('idle');
  };

  const clearChat = () => {
    setMessages([]);
    setTranscript('');
  };

  const handleMicClick = () => {
    if (voiceState === 'idle')      return startListening();
    if (voiceState === 'listening') return stopListening();
    if (voiceState === 'speaking')  return stopSpeaking();
  };

  // ── Quick prompts ──────────────────────────────────────────────────────────
  const quickPrompts = [
    { icon: '🛡️', label: 'Is this product safe?' },
    { icon: '📊', label: 'Explain health score' },
    { icon: '⚠️', label: 'Are there allergens?' },
    { icon: '🔄', label: 'Compare alternatives' },
  ];

  const fireQuickPrompt = (text: string) => {
    const now = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text, ts: now }]);
    processVoiceInput(text);
  };

  // ── Mic button colors per state ───────────────────────────────────────────
  const micMeta: Record<VoiceState, { ring: string; bg: string; icon: string; iconColor: string }> = {
    idle:       { ring: 'rgba(200,255,77,0.15)',  bg: '#0D1A0F', icon: 'mic',           iconColor: '#A9B4AA' },
    listening:  { ring: 'rgba(200,255,77,0.35)',  bg: '#172B14', icon: 'mic',           iconColor: '#C8FF4D' },
    processing: { ring: 'rgba(139,226,139,0.25)', bg: '#112314', icon: 'hourglass_empty', iconColor: '#8BE28B' },
    speaking:   { ring: 'rgba(77,184,255,0.25)',  bg: '#0E1F2B', icon: 'volume_up',     iconColor: '#4DB8FF' },
  };
  const mm = micMeta[voiceState];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#071009' }}
    >
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6" style={{ animation: 'fadeSlideUp 0.4s ease both' }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {/* Badges */}
            <div className="flex items-center flex-wrap gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                style={{ backgroundColor: '#C8FF4D20', color: '#C8FF4D', border: '1px solid #C8FF4D40' }}
              >
                ACCESSIBILITY FEATURE
              </span>
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                style={{ backgroundColor: '#8BE28B15', color: '#8BE28B', border: '1px solid #8BE28B40' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8BE28B' }} />
                Powered by Browser Web Speech API
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#F4F7F2' }}>
              NutriVerify Voice Assistant
            </h1>
            <p className="text-sm" style={{ color: '#A9B4AA' }}>
              Hands-free nutrition intelligence. Speak naturally in English.
            </p>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 mt-1"
              style={{
                backgroundColor: '#111C14',
                color: '#A9B4AA',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#A9B4AA'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete_sweep</span>
              Clear
            </button>
          )}
        </div>

        {/* ── Info banner ─────────────────────────────────────────────────── */}
        <div
          className="flex items-start gap-3 p-3.5 rounded-xl text-xs"
          style={{ backgroundColor: '#0C1710', border: '1px solid rgba(255,255,255,0.07)', color: '#A9B4AA' }}
        >
          <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: '18px', color: '#C8FF4D' }}>info</span>
          <span>
            Uses the <strong style={{ color: '#F4F7F2' }}>browser's native Web Speech API</strong> — no cloud provider or credentials required.
            Speech quality depends on your browser and microphone hardware.
          </span>
        </div>

        {/* ── Not supported warning ────────────────────────────────────────── */}
        {!isSpeechSupported && (
          <div
            className="flex items-center gap-2 p-4 rounded-xl text-sm"
            style={{ backgroundColor: '#2B0A0A', border: '1px solid #FF4D4D40', color: '#FF7070' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            Speech recognition is not supported in this browser. Try Chrome or Edge for full functionality.
          </div>
        )}

        {/* ── Central mic + state + waveform ──────────────────────────────── */}
        <div
          className="flex flex-col items-center gap-5 py-10 rounded-2xl"
          style={{ backgroundColor: '#080F0A', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* State pill */}
          <StatePill state={voiceState} />

          {/* Mic button with pulse rings */}
          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
            {/* Pulse rings */}
            {(voiceState === 'listening' || voiceState === 'speaking') && (
              <>
                <span
                  className="absolute rounded-full"
                  style={{
                    width: 120, height: 120,
                    border: `2px solid ${mm.ring}`,
                    animation: 'pulseRing 1.4s ease-out infinite',
                  }}
                />
                <span
                  className="absolute rounded-full"
                  style={{
                    width: 120, height: 120,
                    border: `2px solid ${mm.ring}`,
                    animation: 'pulseRing 1.4s ease-out infinite',
                    animationDelay: '0.5s',
                  }}
                />
              </>
            )}

            {/* Mic button */}
            <button
              onClick={handleMicClick}
              disabled={voiceState === 'processing' || !isSpeechSupported}
              className="relative flex items-center justify-center rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                width: 88, height: 88,
                backgroundColor: mm.bg,
                border: `2px solid ${mm.ring}`,
                boxShadow: voiceState !== 'idle' ? `0 0 28px ${mm.ring}` : 'none',
                transform: voiceState === 'listening' ? 'scale(1.08)' : 'scale(1)',
              }}
              aria-label={voiceState === 'idle' ? 'Start listening' : 'Stop'}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '40px',
                  color: mm.iconColor,
                  fontVariationSettings: "'FILL' 1",
                  transition: 'color 0.3s',
                }}
              >
                {mm.icon}
              </span>
            </button>
          </div>

          {/* Sub-label */}
          <p className="text-xs" style={{ color: '#A9B4AA' }}>
            {voiceState === 'idle'       && 'Tap the microphone to begin speaking'}
            {voiceState === 'listening'  && 'Listening — tap again to stop'}
            {voiceState === 'processing' && 'Analyzing your question…'}
            {voiceState === 'speaking'   && 'Tap to stop playback'}
          </p>

          {/* Waveform */}
          <Waveform
            active={voiceState === 'listening' || voiceState === 'speaking'}
            color={voiceState === 'listening' ? '#C8FF4D' : voiceState === 'speaking' ? '#4DB8FF' : '#A9B4AA'}
          />

          {/* Live transcript */}
          {transcript && (
            <div
              className="px-4 py-2.5 rounded-xl text-sm italic max-w-sm text-center"
              style={{
                backgroundColor: '#0F1D12',
                border: '1px solid #C8FF4D25',
                color: '#F4F7F2',
                animation: 'fadeSlideUp 0.2s ease both',
              }}
            >
              "{transcript}"
            </div>
          )}
        </div>

        {/* ── Quick prompt buttons ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#A9B4AA' }}>
            Quick Prompts
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => fireQuickPrompt(p.label)}
                disabled={voiceState === 'processing' || voiceState === 'listening'}
                className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#0D1710',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#A9B4AA',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.backgroundColor = '#142418';
                  b.style.borderColor = '#C8FF4D40';
                  b.style.color = '#C8FF4D';
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.backgroundColor = '#0D1710';
                  b.style.borderColor = 'rgba(255,255,255,0.08)';
                  b.style.color = '#A9B4AA';
                }}
              >
                <span style={{ fontSize: '20px' }}>{p.icon}</span>
                <span className="text-center leading-tight">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Conversation bubbles ─────────────────────────────────────────── */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-1">
            <div
              className="text-xs font-bold tracking-widest uppercase pb-2 mb-1"
              style={{ color: '#A9B4AA', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              Conversation
            </div>

            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animation: 'fadeSlideUp 0.25s ease both' }}
                >
                  {/* Assistant avatar */}
                  {msg.role === 'assistant' && (
                    <div
                      className="flex items-center justify-center rounded-full shrink-0 mt-1"
                      style={{ width: 34, height: 34, backgroundColor: '#C8FF4D18', border: '1px solid #C8FF4D35' }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '16px', color: '#C8FF4D', fontVariationSettings: "'FILL' 1" }}
                      >
                        smart_toy
                      </span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className="flex flex-col gap-1 max-w-[78%]"
                    style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                  >
                    {/* Role label */}
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase px-1"
                      style={{ color: msg.role === 'user' ? '#C8FF4D' : '#8BE28B' }}
                    >
                      {msg.role === 'user' ? 'You' : 'NutriVerify AI'}
                    </span>

                    <div
                      className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={
                        msg.role === 'user'
                          ? {
                              backgroundColor: '#C8FF4D',
                              color: '#000',
                              fontWeight: 500,
                              borderTopRightRadius: '4px',
                            }
                          : {
                              backgroundColor: '#0F1D12',
                              color: '#E8F0E9',
                              border: '1px solid rgba(255,255,255,0.09)',
                              borderTopLeftRadius: '4px',
                            }
                      }
                    >
                      {msg.text}
                    </div>

                    {/* Timestamp */}
                    <span
                      className="text-[10px] px-1"
                      style={{ color: '#4E5C4F' }}
                    >
                      {msg.ts}
                    </span>
                  </div>

                  {/* User avatar */}
                  {msg.role === 'user' && (
                    <div
                      className="flex items-center justify-center rounded-full shrink-0 mt-1"
                      style={{ width: 34, height: 34, backgroundColor: '#142217', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#A9B4AA' }}>
                        person
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>
          </div>
        )}

        {/* ── Suggested topics (empty state) ──────────────────────────────── */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#A9B4AA' }}>
              Try asking about
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                '🍚 What is the ideal daily sugar limit?',
                '🧂 How much sodium is too much?',
                '💪 How do I find high-protein foods?',
                '⚠️ What are common food allergens?',
                '🌿 What does organic really mean?',
                '📊 How is the health score calculated?',
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const text = q.replace(/^[^\s]+\s/, '');
                    const now = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                    setMessages(prev => [...prev, { role: 'user', text, ts: now }]);
                    processVoiceInput(text);
                  }}
                  className="px-3 py-2 rounded-xl text-xs transition-all text-left"
                  style={{
                    backgroundColor: '#0D1710',
                    color: '#A9B4AA',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.backgroundColor = '#142418';
                    b.style.borderColor = '#C8FF4D35';
                    b.style.color = '#E8F0E9';
                  }}
                  onMouseLeave={e => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.backgroundColor = '#0D1710';
                    b.style.borderColor = 'rgba(255,255,255,0.08)';
                    b.style.color = '#A9B4AA';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
