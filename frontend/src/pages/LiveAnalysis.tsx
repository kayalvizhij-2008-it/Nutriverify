import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type CameraState = 'idle' | 'requesting' | 'ready' | 'captured' | 'error';

export default function LiveAnalysis() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<CameraState>('idle');
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setState('requesting');
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      setState('ready');
    } catch {
      setState('error');
      setError('Camera access denied. Please enable camera permissions in your browser settings.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
      setState('captured');
      stopCamera();
    }
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const sendForAnalysis = () => {
    if (capturedImage) {
      sessionStorage.setItem('nv_captured_image', capturedImage);
      navigate('/analyze/upload');
    }
  };

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Live Camera Scan</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Point your camera at a food label to scan it.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-nv-error/10 border border-nv-error/20 rounded-xl text-[13px] text-nv-error">{error}</div>}

      <div className="bg-nv-surface-container rounded-2xl overflow-hidden border border-nv-outline-variant/15">
        {/* Camera view */}
        <div className="relative bg-black aspect-[4/3]">
          {(state === 'ready') && (
            <>
              <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[80%] h-[60%] border-2 border-nv-primary/30 rounded-xl">
                  <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-nv-primary rounded-tl-xl" />
                  <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-nv-primary rounded-tr-xl" />
                  <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-nv-primary rounded-bl-xl" />
                  <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-nv-primary rounded-br-xl" />
                  <div className="absolute left-2 right-2 h-px bg-gradient-to-r from-transparent via-nv-primary/60 to-transparent" style={{ animation: 'scan-line 2.5s ease-in-out infinite' }} />
                </div>
              </div>
            </>
          )}
          {state === 'captured' && capturedImage && (
            <img src={capturedImage} alt="Captured label" className="w-full h-full object-contain" />
          )}
          {(state === 'idle' || state === 'error') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[56px] text-nv-text-dim mb-4">photo_camera</span>
              <p className="text-[14px] text-nv-text-dim">Camera preview will appear here</p>
            </div>
          )}
          {state === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-nv-primary/30 border-t-nv-primary rounded-full animate-spin mb-4" />
              <p className="text-[14px] text-nv-text-dim">Requesting camera access...</p>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Status bar */}
        <div className="px-5 py-3 bg-nv-surface-container-low border-t border-nv-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${state === 'ready' ? 'bg-nv-tertiary animate-pulse' : state === 'captured' ? 'bg-nv-primary' : 'bg-nv-text-dim'}`} />
            <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider">
              {state === 'idle' && 'CAMERA OFF'}
              {state === 'requesting' && 'REQUESTING ACCESS'}
              {state === 'ready' && 'CAMERA READY'}
              {state === 'captured' && 'LABEL CAPTURED'}
              {state === 'error' && 'CAMERA UNAVAILABLE'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 py-4 flex items-center justify-center gap-3">
          {(state === 'idle' || state === 'error') && (
            <button onClick={startCamera} className="px-6 py-2.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all">
              {state === 'error' ? 'Retry' : 'Start Camera'}
            </button>
          )}
          {state === 'ready' && (
            <button onClick={capture} className="px-6 py-2.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all">
              <span className="material-symbols-outlined text-[16px] mr-1">camera</span>Capture
            </button>
          )}
          {state === 'captured' && (
            <>
              <button onClick={retake} className="px-5 py-2.5 text-[13px] text-nv-text-muted bg-nv-surface-container-high rounded-xl hover:bg-nv-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-[16px] mr-1">refresh</span>Retake
              </button>
              <button onClick={sendForAnalysis} className="px-6 py-2.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all">
                <span className="material-symbols-outlined text-[16px] mr-1">biotech</span>Analyze
              </button>
              <button onClick={() => navigate('/analyze/manual')} className="px-5 py-2.5 text-[13px] text-nv-text-muted bg-nv-surface-container-high rounded-xl hover:bg-nv-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-[16px] mr-1">edit_note</span>Enter Manually
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-nv-surface-container rounded-xl p-4 border border-nv-outline-variant/10">
        <h4 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-2">Tips for best results</h4>
        <ul className="space-y-1.5">
          {[
            'Hold the camera steady and close to the label',
            'Ensure good lighting for clear text',
            'Focus on the Nutrition Facts panel',
            'Include the ingredient list in the frame',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-nv-text-dim">
              <span className="material-symbols-outlined text-[14px] text-nv-primary mt-0.5">lightbulb</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
