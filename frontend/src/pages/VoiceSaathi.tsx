import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

export default function VoiceSaathi() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => { if (synthRef.current) synthRef.current.cancel(); };
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synthRef.current.speak(utter);
  }, []);

  const processVoiceInput = useCallback((text: string) => {
    const lower = text.toLowerCase();
    let response = '';

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      response = 'Hello! I am NutriSaathi, your voice nutrition assistant. How can I help you today?';
    } else if (lower.includes('what can you do')) {
      response = 'I can help you understand food labels, explain nutrition data, and answer questions about ingredients and health.';
    } else if (lower.includes('sugar')) {
      response = 'When checking sugar, look for added sugars like high fructose corn syrup, dextrose, and sucrose. Natural sugars in fruit are generally fine.';
    } else if (lower.includes('protein')) {
      response = 'Good protein sources include lean meats, eggs, legumes, and dairy. Aim for protein-rich foods that are also low in sodium and added sugars.';
    } else if (lower.includes('sodium') || lower.includes('salt')) {
      response = 'The recommended daily sodium intake is under 2300mg. High sodium is above 600mg per serving. Look for low-sodium alternatives.';
    } else if (lower.includes('organic')) {
      response = 'Organic means ingredients are grown without synthetic pesticides. However, organic does not automatically mean healthier — sugar is still sugar whether organic or not.';
    } else {
      response = 'I understand you are asking about: ' + text + '. For detailed analysis, please analyze a specific food label through the Food Analyzer, and I can provide context-aware answers.';
    }

    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    speak(response);
  }, [speak]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition is not supported in this browser.'); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      setTranscript(current[0].transcript);
      if (current.isFinal) {
        setMessages(prev => [...prev, { role: 'user', text: current[0].transcript }]);
        processVoiceInput(current[0].transcript);
        setTranscript('');
      }
    };

    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = () => { setIsListening(false); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const toggleSpeaking = () => {
    if (speaking) { synthRef.current?.cancel(); setSpeaking(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-nv-outline-variant/15 bg-nv-surface">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-nv-primary-container/15 border border-nv-primary/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-nv-primary">mic</span>
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text">Voice Saathi</h1>
            <p className="text-[11px] font-[family-name:var(--font-mono)] text-nv-tertiary">Voice-Powered Nutrition Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-nv-primary-container/10 border border-nv-primary/15 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px] text-nv-primary">mic</span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-nv-text mb-1">Speak to NutriSaathi</h2>
            <p className="text-[13px] text-nv-text-dim max-w-xs">Tap the microphone and ask about nutrition, ingredients, or food labels.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
              m.role === 'user'
                ? 'bg-nv-primary-container/15 border border-nv-primary/15 rounded-br-md'
                : 'bg-nv-surface-container-high/60 border border-nv-outline-variant/10 rounded-bl-md'
            }`}>
              <p className="text-[14px] text-nv-text leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Voice controls */}
      <div className="px-6 py-6 border-t border-nv-outline-variant/15 bg-nv-surface">
        <div className="flex flex-col items-center gap-3">
          {transcript && (
            <div className="text-[14px] text-nv-primary italic px-4">"{transcript}"</div>
          )}
          <div className="flex items-center gap-4">
            <button onClick={toggleSpeaking} disabled={!speaking} className="w-10 h-10 flex items-center justify-center rounded-xl bg-nv-surface-container border border-nv-outline-variant/15 text-nv-text-dim hover:text-nv-text transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined text-[18px]">{speaking ? 'volume_off' : 'volume_up'}</span>
            </button>
            <button onClick={isListening ? stopListening : startListening}
              className={`w-16 h-16 flex items-center justify-center rounded-full transition-all ${isListening ? 'bg-nv-error/20 border-2 border-nv-error animate-pulse' : 'bg-nv-primary-container hover:bg-nv-primary border-2 border-nv-primary/30'}`}>
              <span className={`material-symbols-outlined text-[28px] ${isListening ? 'text-nv-error' : 'text-nv-on-primary-container'}`}>{isListening ? 'mic_off' : 'mic'}</span>
            </button>
            <div className="w-10 h-10" />
          </div>
          <p className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim">
            {isListening ? 'LISTENING...' : 'TAP TO SPEAK'}
          </p>
        </div>
      </div>
    </div>
  );
}
