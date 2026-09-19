import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi, type AnalyzeRequest } from '../lib/api';
import { DEMO_PRODUCTS, getDemoAnalysis } from '../lib/demo';

type Mode = 'manual' | 'upload' | 'camera';

const DEFAULT_FORM: AnalyzeRequest = {
  productName: '', brand: '', servingSize: '',
  calories: 0, fat: 0, sugar: 0, sodium: 0, protein: 0, carbs: 0, fiber: 0,
  ingredients: [], claims: [],
};

export default function Analyze() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('manual');
  const [form, setForm] = useState<AnalyzeRequest>(DEFAULT_FORM);
  const [ingredientText, setIngredientText] = useState('');
  const [claimTexts, setClaimTexts] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const ANALYZE_STEPS = [
    'Reading label...', 'Analyzing ingredients...', 'Checking claims...',
    'Validating nutrition...', 'Calculating scores...', 'Generating report...'
  ];

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return; }
    setUploadFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraStream(stream);
      setCameraActive(true);
    } catch { setError('Camera access denied or unavailable'); }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    setUploadPreview(canvas.toDataURL('image/jpeg'));
    stopCamera();
    setMode('upload');
  };

  const runAnalysis = async () => {
    if (!form.productName.trim()) { setError('Product name is required'); return; }
    setError('');
    setAnalyzing(true);
    setAnalyzeStep(0);

    const ingredients = ingredientText.split('\n').filter(Boolean).map(line => {
      const parts = line.split('(');
      return { name: parts[0].trim(), category: 'MODERATE_CONCERN', note: parts[1]?.replace(')', '').trim() };
    });
    const claims = claimTexts.split('\n').filter(Boolean).map(c => ({ type: 'CUSTOM', displayText: c.trim() }));

    try {
      // Simulate analysis steps
      for (let i = 0; i < ANALYZE_STEPS.length - 1; i++) {
        setAnalyzeStep(i + 1);
        await new Promise(r => setTimeout(r, 400));
      }
      const result = await analysisApi.analyze({ ...form, ingredients, claims });
      sessionStorage.setItem('nv_last_result', JSON.stringify(result));
      navigate('/results');
    } catch (err: any) {
      setAnalyzing(false);
      setError(err?.message || 'Analysis failed');
    }
  };

  const loadDemo = (index: number) => {
    const result = getDemoAnalysis(index);
    sessionStorage.setItem('nv_last_result', JSON.stringify(result));
    navigate('/results');
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Food Label Analyzer</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Capture or enter label information for verification.</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        {([
          { key: 'manual' as Mode, icon: 'edit', label: 'Manual Entry' },
          { key: 'upload' as Mode, icon: 'cloud_upload', label: 'Image Upload' },
          { key: 'camera' as Mode, icon: 'photo_camera', label: 'Camera' },
        ]).map(m => (
          <button key={m.key} onClick={() => { setMode(m.key); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all border ${
              mode === m.key
                ? 'bg-nv-primary-container/15 text-nv-primary border-nv-primary/25'
                : 'bg-nv-surface-container text-nv-text-muted border-nv-outline-variant/15 hover:border-nv-outline-variant/30 hover:text-nv-text'
            }`}>
            <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-nv-error/10 border border-nv-error/20 rounded-xl text-[13px] text-nv-error">{error}</div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div className="bg-nv-surface-container rounded-2xl p-8 border border-nv-outline-variant/15 mb-6">
          {uploadPreview ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-nv-surface">
                <img src={uploadPreview} alt="Uploaded label" className="max-h-64 mx-auto object-contain" />
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setUploadPreview(null); setUploadFile(null); }} className="px-4 py-2 text-[13px] text-nv-text-muted bg-nv-surface-container-high rounded-xl hover:bg-nv-surface-container-highest transition-colors">Remove</button>
              </div>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-nv-outline-variant/25 rounded-xl p-10 text-center cursor-pointer hover:border-nv-primary/30 hover:bg-nv-primary/5 transition-all">
              <span className="material-symbols-outlined text-[40px] text-nv-text-dim block mb-3">cloud_upload</span>
              <p className="text-[14px] text-nv-text-muted mb-1">Drop a food label image here or click to browse</p>
              <p className="text-[12px] text-nv-text-dim">JPG, PNG, WebP — Max 10MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
      )}

      {/* Camera mode */}
      {mode === 'camera' && (
        <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 mb-6">
          {cameraActive ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video ref={videoRef} className="w-full max-h-80 object-contain" playsInline muted />
                <div className="absolute inset-0 border-2 border-nv-primary/40 rounded-xl m-4 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-nv-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-nv-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-nv-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-nv-primary rounded-br-lg" />
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={capturePhoto} className="px-5 py-2.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all">Capture</button>
                <button onClick={stopCamera} className="px-5 py-2.5 bg-nv-surface-container-high text-nv-text-muted text-[13px] rounded-xl hover:bg-nv-surface-container-highest transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[40px] text-nv-text-dim block mb-3">photo_camera</span>
              <p className="text-[14px] text-nv-text-muted mb-4">Capture a food label with your camera</p>
              <button onClick={startCamera} className="px-5 py-2.5 bg-nv-primary-container/15 hover:bg-nv-primary-container/25 text-nv-primary text-[13px] font-medium rounded-xl border border-nv-primary/20 transition-all">Open Camera</button>
            </div>
          )}
        </div>
      )}

      {/* Manual entry form */}
      {mode === 'manual' && (
        <div className="space-y-6">
          {/* Basic info */}
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
            <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-1.5">Product Name *</label>
                <input value={form.productName} onChange={e => update('productName', e.target.value)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors" placeholder="e.g. Organic Almond Milk" />
              </div>
              <div>
                <label className="block text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-1.5">Brand</label>
                <input value={form.brand || ''} onChange={e => update('brand', e.target.value)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors" placeholder="e.g. PureNutri" />
              </div>
              <div>
                <label className="block text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-1.5">Serving Size</label>
                <input value={form.servingSize || ''} onChange={e => update('servingSize', e.target.value)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors" placeholder="e.g. 240ml" />
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
            <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Nutrition (per serving)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { field: 'calories', label: 'Calories (kcal)', step: 1 },
                { field: 'totalFat', label: 'Fat (g)', step: 0.1 },
                { field: 'saturatedFat', label: 'Sat. Fat (g)', step: 0.1 },
                { field: 'transFat', label: 'Trans Fat (g)', step: 0.1 },
                { field: 'sugar', label: 'Sugar (g)', step: 0.1 },
                { field: 'addedSugar', label: 'Added Sugar (g)', step: 0.1 },
                { field: 'sodium', label: 'Sodium (mg)', step: 1 },
                { field: 'cholesterol', label: 'Cholesterol (mg)', step: 1 },
                { field: 'carbs', label: 'Carbs (g)', step: 0.1 },
                { field: 'fiber', label: 'Fiber (g)', step: 0.1 },
                { field: 'protein', label: 'Protein (g)', step: 0.1 },
              ].map(n => (
                <div key={n.field}>
                  <label className="block text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-1.5">{n.label}</label>
                  <input type="number" min="0" step={n.step} value={(form as any)[n.field] || 0} onChange={e => update(n.field, parseFloat(e.target.value) || 0)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-3 py-2 text-[14px] text-nv-text focus:outline-none focus:border-nv-primary/40 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients & Claims */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
              <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Ingredients</h3>
              <textarea value={ingredientText} onChange={e => setIngredientText(e.target.value)} rows={6} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-3 text-[13px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors resize-none" placeholder="One per line, e.g.:\nAlmonds (natural)\nWater\nSea Salt" />
              <p className="text-[11px] text-nv-text-dim mt-2">One ingredient per line. Add category in parentheses if known.</p>
            </div>
            <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
              <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Claims to Verify</h3>
              <textarea value={claimTexts} onChange={e => setClaimTexts(e.target.value)} rows={6} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-3 text-[13px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors resize-none" placeholder="One per line, e.g.:\nOrganic\nNo Added Sugar\nHigh Protein" />
              <p className="text-[11px] text-nv-text-dim mt-2">Enter marketing claims printed on the product label.</p>
            </div>
          </div>
        </div>
      )}

      {/* Analyze button */}
      {!analyzing && (
        <button onClick={runAnalysis} disabled={loading} className="w-full py-3.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container font-[family-name:var(--font-display)] text-[15px] font-semibold rounded-xl transition-all disabled:opacity-50 mt-6">
          Analyze This Product
        </button>
      )}

      {/* Analysis progress */}
      {analyzing && (
        <div className="bg-nv-surface-container rounded-2xl p-8 border border-nv-outline-variant/15 mt-6">
          <div className="space-y-4">
            {ANALYZE_STEPS.map((step, i) => (
              <div key={i} className={`flex items-center gap-3 transition-opacity ${i <= analyzeStep ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i < analyzeStep ? 'bg-nv-tertiary/20' : i === analyzeStep ? 'bg-nv-primary/20 animate-pulse' : 'bg-nv-surface-container-high'}`}>
                  {i < analyzeStep ? (
                    <span className="material-symbols-outlined text-[14px] text-nv-tertiary">check</span>
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${i === analyzeStep ? 'bg-nv-primary' : 'bg-nv-outline-variant'}`}></span>
                  )}
                </div>
                <span className={`text-[13px] ${i <= analyzeStep ? 'text-nv-text' : 'text-nv-text-dim'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo products */}
      <div className="mt-8">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Or try a demo</h3>
        <div className="flex flex-wrap gap-2">
          {DEMO_PRODUCTS.map((p, i) => (
            <button key={i} onClick={() => loadDemo(i)} className="px-4 py-2 bg-nv-surface-container border border-nv-outline-variant/15 rounded-xl text-[13px] text-nv-text-muted hover:border-nv-primary/25 hover:text-nv-primary hover:bg-nv-primary/5 transition-all">
              {p.productName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
