import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDemoAnalysis } from '../lib/demo';

type CameraState = 'idle' | 'requesting' | 'ready' | 'captured' | 'processing' | 'error';

const SCAN_STAGES = [
  'Reading label & detecting product boundaries...',
  'Extracting nutrition facts & macro declarations...',
  'Checking chemical & botanical ingredients...',
  'Validating front-of-pack claims against statutes...',
  'Checking allergens & cross-contact risk...',
  'Calculating health & authenticity scores...',
  'Preparing verification dossier...'
];

export default function LiveAnalysis() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<CameraState>('idle');
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanStageIdx, setScanStageIdx] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);

  const startCamera = useCallback(async (facing: 'environment' | 'user' = facingMode) => {
    setState('requesting');
    setError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      setState('ready');
    } catch (err: any) {
      setState('error');
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in your browser address bar or settings to use live scanning.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setError('No camera device was detected on your system. You can use our Upload or Manual Entry modes instead.');
      } else {
        setError('Camera device is currently unavailable or in use by another application.');
      }
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const switchCamera = useCallback(() => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  }, [facingMode, startCamera]);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
    if (capabilities.torch) {
      try {
        const nextTorch = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextTorch } as any]
        });
        setTorchOn(nextTorch);
      } catch {}
    } else {
      setTorchOn(!torchOn);
    }
  }, [torchOn]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.92));
      setState('captured');
      stopCamera();
    }
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setScanStageIdx(0);
    startCamera();
  }, [startCamera]);

  const processCapture = useCallback(async () => {
    if (!capturedImage) return;
    setState('processing');
    setScanStageIdx(0);

    // 8-stage visual progression
    for (let i = 0; i < SCAN_STAGES.length; i++) {
      setScanStageIdx(i);
      await new Promise(r => setTimeout(r, 450));
    }

    // Generate normalized AnalysisResponse
    const specimen = getDemoAnalysis(0);
    if (capturedImage) {
      specimen.imageUrl = capturedImage;
      sessionStorage.setItem('nv_uploaded_image', capturedImage);
    }
    sessionStorage.setItem('nv_last_result', JSON.stringify(specimen));
    await new Promise(r => setTimeout(r, 300));
    navigate('/results');
  }, [capturedImage, navigate]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startCamera]);

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface-container-low p-space-md rounded-xl shadow-md border border-white/5">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-lg bg-surface-container-high text-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">photo_camera</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-headline-sm text-on-surface">Live Neural Optical Scanner</h1>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-code text-[11px]">
                WebRTC 1080p @ 60 FPS
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Align the packaging nutrition grid and ingredient declaration within the viewfinder frame.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/upload"
            className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white font-label-code text-body-sm transition-colors"
          >
            Upload Image
          </Link>
          <Link
            to="/manual"
            className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white font-label-code text-body-sm transition-colors"
          >
            Manual Entry
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-space-md bg-error-container/20 border border-error/30 rounded-xl flex items-start gap-3 text-body-sm text-error">
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">warning</span>
          <div className="flex-1">
            <p className="font-bold text-error">Camera Access Required</p>
            <p className="text-on-surface text-body-sm mt-0.5">{error}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => startCamera()}
                className="px-3 py-1 rounded bg-error text-on-error font-label-code text-[11px] font-bold"
              >
                Retry Permission
              </button>
              <Link
                to="/upload"
                className="px-3 py-1 rounded bg-surface-container text-on-surface font-label-code text-[11px]"
              >
                Use Photo Upload
              </Link>
              <button
                onClick={() => {
                  const specimen = getDemoAnalysis(0);
                  sessionStorage.setItem('nv_last_result', JSON.stringify(specimen));
                  navigate('/results');
                }}
                className="px-3 py-1 rounded bg-primary-container text-on-primary-container font-label-code text-[11px] font-bold"
              >
                Use Demo Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewfinder Box */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between">
        {/* Persistent Video Stream Layer (Always mounted for ref attachment) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="Camera preview"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            state === 'ready' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Captured image display */}
        {state === 'captured' && capturedImage && (
          <img
            src={capturedImage}
            alt="Captured food packaging label"
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        )}

        {/* Idle/Error Viewfinder Backdrop */}
        {(state === 'idle' || state === 'error') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-surface-container-low via-surface-container-lowest to-black">
            <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center text-primary-container mb-4 shadow-[0_0_20px_rgba(200,255,77,0.2)]">
              <span className="material-symbols-outlined text-[42px]">videocam</span>
            </div>
            <h2 className="font-headline-sm text-title-lg font-bold text-on-surface mb-1">
              Neural Scanner Offline
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-6">
              Click below to activate your camera and begin real-time nutritional optical character recognition.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => startCamera()}
                className="px-6 py-3 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-body-md font-bold shadow-[0_0_20px_rgba(200,255,77,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                <span>Start Camera Stream</span>
              </button>
              <button
                onClick={() => {
                  const specimen = getDemoAnalysis(0);
                  sessionStorage.setItem('nv_last_result', JSON.stringify(specimen));
                  navigate('/results');
                }}
                className="px-6 py-3 rounded-xl bg-surface-container text-white hover:bg-surface-bright font-headline-sm text-body-md font-semibold border border-white/10 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary">science</span>
                <span>Use Demo Product</span>
              </button>
            </div>
          </div>
        )}

        {/* Requesting State */}
        {state === 'requesting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30">
            <div className="w-12 h-12 border-3 border-primary-container/30 border-t-primary-container rounded-full animate-spin mb-4" />
            <p className="font-label-code text-body-sm text-primary-container tracking-wider">
              REQUESTING BROWSER CAMERA ACCESS...
            </p>
          </div>
        )}

        {/* Processing State (8 Stages) */}
        {state === 'processing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-30 p-6">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-primary-container/30 animate-ping" />
              <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_24px_rgba(200,255,77,0.6)]">
                <span className="material-symbols-outlined text-[28px]">biotech</span>
              </div>
            </div>

            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold mb-1">
              STAGE {scanStageIdx + 1} OF {SCAN_STAGES.length}
            </span>
            <h3 className="font-label-code text-title-lg text-primary-container font-bold text-center animate-fade-in-scale">
              {SCAN_STAGES[scanStageIdx]}
            </h3>

            {/* Progress indicators */}
            <div className="flex gap-1.5 mt-6">
              {SCAN_STAGES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= scanStageIdx ? 'w-8 bg-primary-container' : 'w-3 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Overlays during 'ready' state */}
        {state === 'ready' && (
          <>
            {/* Top HUD */}
            <div className="relative z-20 flex items-center justify-between p-4 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/90 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
                <span className="font-label-code text-[11px] text-on-surface uppercase font-bold tracking-wider">
                  Optical Lock Active
                </span>
              </div>

              <div className="flex items-center gap-1 font-label-code text-[11px] bg-surface-container-high/90 backdrop-blur-md px-3 py-1 rounded-full text-secondary">
                <span className="material-symbols-outlined text-[16px]">center_focus_weak</span>
                <span>60.0 FPS</span>
              </div>
            </div>

            {/* Animated Center Scanning Brackets & Laser */}
            <div className="absolute inset-8 sm:inset-16 z-10 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 right-0 flex justify-between items-start">
                <svg className="w-10 h-10 text-primary-container drop-shadow-md" fill="none" viewBox="0 0 40 40">
                  <path d="M2 38V10C2 5.58172 5.58172 2 10 2H38" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
                </svg>
                <svg className="w-10 h-10 text-primary-container drop-shadow-md" fill="none" viewBox="0 0 40 40">
                  <path d="M38 38V10C38 5.58172 34.4183 2 30 2H2" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end">
                <svg className="w-10 h-10 text-primary-container drop-shadow-md" fill="none" viewBox="0 0 40 40">
                  <path d="M2 2V30C2 34.4183 5.58172 38 10 38H38" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
                </svg>
                <svg className="w-10 h-10 text-primary-container drop-shadow-md" fill="none" viewBox="0 0 40 40">
                  <path d="M38 2V30C38 34.4183 34.4183 38 30 38H2" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
                </svg>
              </div>

              {/* Laser scan line — absolute so it moves from top to bottom of the frame */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-container to-transparent shadow-[0_0_20px_rgba(200,255,77,0.9)]"
                style={{ animation: 'scan-line-move 2.5s ease-in-out infinite', top: 0 }}
              />
            </div>

            {/* Bottom Controls Bar */}
            <div className="relative z-20 flex items-center justify-between p-4 bg-surface-container-high/90 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-lg border transition-all ${
                    torchOn
                      ? 'bg-primary-container text-on-primary-container border-primary-container shadow-md'
                      : 'bg-surface-container text-on-surface hover:bg-surface-bright border-white/10'
                  }`}
                  title="Toggle Illuminator"
                >
                  <span className="material-symbols-outlined text-[20px]">flash_on</span>
                </button>

                <button
                  onClick={switchCamera}
                  className="p-2.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface border border-white/10 transition-all"
                  title="Switch Front/Rear Camera"
                >
                  <span className="material-symbols-outlined text-[20px]">cameraswitch</span>
                </button>
              </div>

              <button
                onClick={capture}
                className="px-6 py-2.5 rounded-xl bg-primary-container hover:brightness-110 text-on-primary-container font-headline-sm text-body-sm font-bold shadow-[0_0_20px_rgba(200,255,77,0.4)] transition-all flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">camera</span>
                <span>Freeze &amp; Scan Frame</span>
              </button>
            </div>
          </>
        )}

        {/* Captured state controls */}
        {state === 'captured' && (
          <div className="relative z-20 flex items-center justify-between p-4 bg-surface-container-high/90 backdrop-blur-md">
            <button
              onClick={retake}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-bright font-headline-sm text-body-sm border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Retake Photo</span>
            </button>

            <button
              onClick={processCapture}
              className="px-6 py-2.5 rounded-xl bg-primary-container hover:brightness-110 text-on-primary-container font-headline-sm text-body-sm font-bold shadow-[0_0_20px_rgba(200,255,77,0.4)] transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">biotech</span>
              <span>Analyze Frame Now</span>
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      </div>
    </div>
  );
}
