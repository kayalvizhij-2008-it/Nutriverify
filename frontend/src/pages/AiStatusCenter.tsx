import { useEffect, useState } from 'react';
import { aiApi, AiStatusDto } from '../lib/api';

export default function AiStatusCenter() {
  const [status, setStatus] = useState<AiStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aiApi.getStatus()
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch AI subsystem status.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code text-xs text-primary-container uppercase font-bold tracking-wider">
              NUTRIVERIFY SUBSYSTEMS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#142217] text-[#8BE28B] border border-primary-container/30 font-label-code text-[11px] font-bold">
              LIVE MONITOR
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI &amp; Verification Status Center
          </h1>
          <p className="text-sm text-[#A9B4AA] mt-1">
            Real-time status of NutriVerify AI Assistant, OCR extraction pipeline, and Voice engine.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            aiApi.getStatus().then(setStatus).finally(() => setLoading(false));
          }}
          className="px-4 py-2 rounded-xl bg-[#142217] hover:bg-[#1c3021] text-white border border-white/10 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span>Refresh Status</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-[#0D1610] border border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
          <span className="font-label-code text-xs text-[#A9B4AA]">Querying subsystem status...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      ) : status ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Assistant Router */}
          <div className="p-6 rounded-3xl bg-[#0D1610] border border-white/10 shadow-xl flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center border border-primary-container/20">
                  <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-label-code ${
                  status.aiAvailable
                    ? 'bg-secondary-container/40 text-secondary border border-secondary/30'
                    : 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                }`}>
                  {status.aiAvailable ? 'READY • EXTERNAL AI' : 'AVAILABLE • VERIFIED FALLBACK'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">NutriVerify AI Assistant</h3>
                <p className="text-xs text-[#A9B4AA] mt-1 leading-relaxed">
                  Hybrid router supplying product-aware nutritional reasoning and claim explanations.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A9B4AA]">Configured Provider:</span>
                  <span className="text-white font-mono uppercase">{status.provider || 'openai'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9B4AA]">Routing Mode:</span>
                  <span className="text-primary-container font-semibold uppercase">{status.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9B4AA]">Active Badge:</span>
                  <span className="text-white font-semibold">{status.statusLabel}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#142217] text-[11px] text-[#A9B4AA] leading-relaxed">
              {status.aiAvailable
                ? 'External LLM provider active with strict prompt injection pre-screening.'
                : 'Deterministic NutriVerify domain engine active as authoritative fallback.'}
            </div>
          </div>

          {/* Card 2: OCR Extraction Engine */}
          <div className="p-6 rounded-3xl bg-[#0D1610] border border-white/10 shadow-xl flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center border border-primary-container/20">
                  <span className="material-symbols-outlined text-[22px]">document_scanner</span>
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-label-code ${
                  status.ocrConfigured
                    ? 'bg-secondary-container/40 text-secondary border border-secondary/30'
                    : 'bg-surface-container-high text-[#A9B4AA] border border-white/10'
                }`}>
                  {status.ocrConfigured ? 'EXTERNAL VISION ACTIVE' : 'MANUAL VERIFICATION'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">OCR Extraction Subsystem</h3>
                <p className="text-xs text-[#A9B4AA] mt-1 leading-relaxed">
                  Food label image OCR and nutrition facts table parameter extraction.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A9B4AA]">Vision API Status:</span>
                  <span className={status.ocrConfigured ? 'text-secondary font-bold' : 'text-amber-400 font-bold'}>
                    {status.ocrConfigured ? 'Configured' : 'Unconfigured'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9B4AA]">Fallback Behavior:</span>
                  <span className="text-white">Interactive Manual Verification</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#142217] text-[11px] text-[#A9B4AA] leading-relaxed">
              {status.ocrConfigured
                ? 'Automatic vision OCR active. High-confidence fields auto-filled.'
                : 'Automatic OCR is unconfigured. Manual entry & label field verification active.'}
            </div>
          </div>

          {/* Card 3: Voice Subsystem */}
          <div className="p-6 rounded-3xl bg-[#0D1610] border border-white/10 shadow-xl flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center border border-primary-container/20">
                  <span className="material-symbols-outlined text-[22px]">mic</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold font-label-code bg-secondary-container/40 text-secondary border border-secondary/30">
                  BROWSER WEB SPEECH
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">NutriVerify Voice Assistant</h3>
                <p className="text-xs text-[#A9B4AA] mt-1 leading-relaxed">
                  Speech-to-text and voice synthesis for accessible hands-free navigation.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A9B4AA]">Speech Recognition:</span>
                  <span className="text-secondary font-bold">Browser Native API</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9B4AA]">Text-To-Speech:</span>
                  <span className="text-secondary font-bold">Browser Native SpeechSynthesis</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#142217] text-[11px] text-[#A9B4AA] leading-relaxed">
              Operating via standard HTML5 Web Speech APIs. No external cloud voice credentials required.
            </div>
          </div>
        </div>
      ) : null}

      {/* Security & Secrets Audit Card */}
      <div className="p-6 rounded-3xl bg-[#0D1610] border border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">shield</span>
          <h2 className="text-base font-bold text-white">Security &amp; Secret Isolation Policy</h2>
        </div>
        <p className="text-xs text-[#A9B4AA] leading-relaxed">
          NutriVerify strictly isolates API credentials within server environment variables. Secrets are never transmitted to browser clients, embedded in client-side Vite bundles, stored in local storage, or logged to console outputs.
        </p>
      </div>
    </div>
  );
}
