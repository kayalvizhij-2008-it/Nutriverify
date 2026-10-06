import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDemoAnalysis } from '../lib/demo';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 10;

const ANALYSIS_STAGES = [
  '01 · Reading packaging image & edge OCR...',
  '02 · Extracting nutrition facts & serving size...',
  '03 · Checking chemical & botanical ingredients...',
  '04 · Validating front-of-pack claims against statutes...',
  '05 · Checking allergen risk matrix (Big 9 & EU 14)...',
  '06 · Calculating NutriVerify health score...',
  '07 · Preparing verified dossier & audit trail...'
];

export default function UploadAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const captured = sessionStorage.getItem('nv_captured_image');
    if (captured) {
      setPreview(captured);
      fetch(captured)
        .then(r => r.blob())
        .then(blob => {
          const f = new File([blob], 'captured-label.jpg', { type: 'image/jpeg' });
          setFile(f);
        })
        .catch(() => {});
      sessionStorage.removeItem('nv_captured_image');
    }
  }, []);

  const handleFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Unsupported file format. Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds maximum ${MAX_SIZE_MB}MB limit.`);
      return;
    }
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const removeFile = () => {
    setPreview(null);
    setFile(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const startAnalysis = async () => {
    setError('');
    setLoading(true);
    setStageIdx(0);

    for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
      setStageIdx(i);
      await new Promise(r => setTimeout(r, 450));
    }

    const specimen = getDemoAnalysis(0);
    if (preview) {
      specimen.imageUrl = preview;
      sessionStorage.setItem('nv_uploaded_image', preview);
    } else {
      sessionStorage.removeItem('nv_uploaded_image');
    }
    sessionStorage.setItem('nv_last_result', JSON.stringify(specimen));
    await new Promise(r => setTimeout(r, 300));
    navigate('/results');
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="w-full bg-[#0D1610] rounded-3xl p-8 border border-[#8BE28B]/30 shadow-2xl text-center backdrop-blur-xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#142318] border border-[#8BE28B]/30 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[36px] text-[#C8FF4D] animate-spin">
              autorenew
            </span>
          </div>

          <span className="font-label-code text-xs text-[#8BE28B] uppercase font-bold tracking-widest">
            STAGE {stageIdx + 1} OF {ANALYSIS_STAGES.length}
          </span>
          <h2 className="text-xl font-bold text-white mt-1 mb-6 animate-fade-in-scale">
            {ANALYSIS_STAGES[stageIdx]}
          </h2>

          <div className="space-y-2.5 text-left max-w-md mx-auto">
            {ANALYSIS_STAGES.map((st, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  i <= stageIdx ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i < stageIdx
                      ? 'bg-[#1A3320] text-[#8BE28B]'
                      : i === stageIdx
                      ? 'bg-[#C8FF4D] text-black shadow-[0_0_10px_rgba(200,255,77,0.5)]'
                      : 'bg-[#142217] text-[#6F7A70]'
                  }`}
                >
                  {i < stageIdx ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-label-code ${i <= stageIdx ? 'text-white font-semibold' : 'text-[#6F7A70]'}`}>
                  {st}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* ── Top Header Section Matching Reference Image 3 ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#102014] border border-[#8BE28B]/30 text-[#8BE28B] flex items-center justify-center shadow-[0_0_15px_rgba(139,226,139,0.15)]">
            <span className="material-symbols-outlined text-[26px]">description</span>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Upload <span className="text-[#8BE28B]">Food Label</span>
            </h1>
            <p className="text-xs text-[#A9B4AA] mt-0.5 max-w-2xl leading-relaxed">
              Upload a clear image of a food product label to get instant AI-powered analysis of ingredients, nutrition facts, allergens, and health claims.
            </p>
          </div>
        </div>

        {/* Handwritten Accent */}
        <div className="font-['Caveat',cursive] text-2xl text-[#8BE28B] self-end md:self-auto shrink-0">
          Better Food. Healthier Tomorrow.
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-error-container/20 border border-error/30 rounded-xl flex items-center gap-2 text-xs text-error">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Main 2-Column Upload & Preview Grid Matching Image 3 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Container: Upload & Image Dropzone */}
        <div className="lg:col-span-6 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* Step & Status Badges */}
            <div className="flex items-center justify-between mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102014] text-[#8BE28B] text-xs font-bold border border-[#8BE28B]/30">
                <span className="w-4 h-4 rounded-full bg-[#C8FF4D] text-black flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Upload Label</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8BE28B]">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Ready to Analyze</span>
              </span>
            </div>

            {/* Inner Side-by-Side Container (Preview + Dropzone) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Left Label Specimen Graphic */}
              <div className="sm:col-span-6 rounded-2xl bg-[#0F1D13] border border-white/10 p-3 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group min-h-[220px]">
                {preview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden">
                    <img src={preview} alt="Uploaded Label" className="w-full h-full object-cover" />
                    <button
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-error text-white text-xs transition-colors"
                      title="Remove image"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-2">
                    <div className="w-full bg-[#FDFBF7] text-black rounded-lg p-2.5 shadow-md flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">Nature's Best</span>
                      <span className="text-xs font-black text-black leading-tight">WHOLE GRAIN<br />CORN FLAKES</span>
                      <div className="w-16 h-12 my-1 rounded bg-[#E5E7EB] flex items-center justify-center text-xs">
                        🥣
                      </div>
                      <span className="text-[9px] text-gray-600">Good Source of Fiber</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Dropzone Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`sm:col-span-6 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-all min-h-[220px] ${
                  dragOver
                    ? 'bg-[#C8FF4D]/10 border-[#C8FF4D]'
                    : 'bg-[#0D1811] border-white/15 hover:border-[#8BE28B]/40'
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-xl bg-[#142318] text-[#8BE28B] flex items-center justify-center mb-2 shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                </div>

                <p className="text-xs font-bold text-white mb-1">
                  Drag &amp; drop your label here
                </p>
                <span className="text-[10px] text-[#A9B4AA] mb-3">or</span>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[#102014] hover:bg-[#162a1b] text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#8BE28B]">folder_open</span>
                  <span>Browse Image</span>
                </button>

                <span className="text-[9px] text-[#6F7A70] mt-3">
                  Supported formats: JPG, PNG (Max 5MB)
                </span>
              </div>
            </div>
          </div>

          {/* Full Width Neon CTA Button */}
          <button
            onClick={startAnalysis}
            className="w-full mt-6 py-3.5 rounded-full bg-[#C8FF4D] hover:brightness-110 text-black font-extrabold text-sm shadow-[0_0_24px_rgba(200,255,77,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Analyze Label ➔</span>
          </button>
        </div>

        {/* Right Container: Analysis Preview Glass Panel Matching Image 3 */}
        <div className="lg:col-span-6 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-3.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#102014] text-[#8BE28B] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">manage_search</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Analysis Preview</h3>
                <p className="text-[11px] text-[#A9B4AA]">Preview of extracted information from your food label</p>
              </div>
            </div>

            {/* Extracted Key-Value Rows */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">label</span>
                  <span className="text-[#A9B4AA]">Product Name</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Nature's Best Corn Flakes</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold">Detected ✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">biotech</span>
                  <span className="text-[#A9B4AA]">Ingredients</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white truncate max-w-[200px]">Whole grain corn, sugar, salt, natural flavor.</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold shrink-0">Detected ✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">local_fire_department</span>
                  <span className="text-[#A9B4AA]">Calories</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">140 kcal (per 1 cup / 36g)</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold">Detected ✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">fitness_center</span>
                  <span className="text-[#A9B4AA]">Protein</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">3 g</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold">Detected ✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">opacity</span>
                  <span className="text-[#A9B4AA]">Total Fat</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">1 g</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold">Detected ✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">grain</span>
                  <span className="text-[#A9B4AA]">Carbohydrates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">32 g</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold">Detected ✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">water_drop</span>
                  <span className="text-[#A9B4AA]">Sodium</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">180 mg</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold">Detected ✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#FFB86B] text-[16px]">warning</span>
                  <span className="text-[#A9B4AA]">Allergens</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white">May contain traces of wheat</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#2B1D0E] text-[#FFB86B] text-[10px] font-bold">Check ⚠</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1D13] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">verified</span>
                  <span className="text-[#A9B4AA]">Health Claims</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white">Good source of fiber</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold">Detected ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaf Callout Tip Card at Bottom */}
          <div className="mt-4 p-3 rounded-2xl bg-[#0F1D13] border border-[#8BE28B]/20 flex items-center gap-2.5 text-xs text-[#A9B4AA]">
            <span className="material-symbols-outlined text-[#8BE28B] text-[20px] shrink-0">eco</span>
            <span>Analysis will provide detailed breakdown of ingredients, allergens, health claims and personalized nutrition insights.</span>
          </div>
        </div>
      </div>

      {/* ── Bottom 5 Feature Badges Bar Matching Image 3 ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-[#09120B] border border-white/10 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#8BE28B] text-[22px] shrink-0">verified_user</span>
          <div>
            <div className="text-xs font-bold text-white">AI-Powered Analysis</div>
            <div className="text-[10px] text-[#A9B4AA]">Advanced machine learning</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#09120B] border border-white/10 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#8BE28B] text-[22px] shrink-0">eco</span>
          <div>
            <div className="text-xs font-bold text-white">Allergen Detection</div>
            <div className="text-[10px] text-[#A9B4AA]">Identify potential allergens</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#09120B] border border-white/10 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#8BE28B] text-[22px] shrink-0">verified</span>
          <div>
            <div className="text-xs font-bold text-white">Health Claim Audit</div>
            <div className="text-[10px] text-[#A9B4AA]">Check manufacturer claims</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#09120B] border border-white/10 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#8BE28B] text-[22px] shrink-0">bar_chart</span>
          <div>
            <div className="text-xs font-bold text-white">Nutrition Insights</div>
            <div className="text-[10px] text-[#A9B4AA]">Make informed choices</div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 p-3.5 rounded-2xl bg-[#09120B] border border-white/10 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#8BE28B] text-[22px] shrink-0">spa</span>
          <div>
            <div className="text-xs font-bold text-white">Safer. Healthier. You.</div>
            <div className="text-[10px] text-[#A9B4AA]">With NutriVerify</div>
          </div>
        </div>
      </div>
    </div>
  );
}
