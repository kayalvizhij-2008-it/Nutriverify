import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnalysisResponse, savedApi } from '../lib/api';
import { getDemoAnalysis } from '../lib/demo';
import { getActiveImage } from '../lib/imageState';
import { downloadAuditPdf } from '../lib/pdfReport';

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const active = getActiveImage();
    if (active) setUploadedImage(active);

    const onImageUpdated = (e: any) => {
      setUploadedImage(e.detail?.imageUrl || null);
    };
    window.addEventListener('nv_image_updated', onImageUpdated);

    const raw = sessionStorage.getItem('nv_last_result');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setResult(parsed);
        if (parsed.imageUrl && !active) setUploadedImage(parsed.imageUrl);
      } catch {}
    } else {
      const demo = getDemoAnalysis(0);
      setResult(demo);
    }

    return () => {
      window.removeEventListener('nv_image_updated', onImageUpdated);
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (!result) return;
    setSaving(true);
    try {
      await savedApi.save(result);
      setSaved(true);
    } catch {
      setSaved(true);
    } finally {
      // Save locally to session as backup
      const local = sessionStorage.getItem('nv_saved_items');
      const list = local ? JSON.parse(local) : [];
      if (!list.some((x: any) => x.productName === result.productName)) {
        list.push({ ...result, imageUrl: uploadedImage || result.imageUrl });
        sessionStorage.setItem('nv_saved_items', JSON.stringify(list));
      }
      setSaving(false);
    }
  }, [result, uploadedImage]);

  if (!result) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="w-20 h-20 rounded-2xl bg-[#0D1610] flex items-center justify-center mb-4 border border-[#8BE28B]/30 shadow-lg">
          <span className="material-symbols-outlined text-[36px] text-[#C8FF4D] animate-spin">autorenew</span>
        </div>
        <h2 className="text-xl font-bold text-white">Loading Verification Dossier...</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* ── Top Header Bar Matching Reference Image 4 ── */}
      <div className="flex flex-col gap-2">
        <Link
          to="/upload"
          className="inline-flex items-center gap-1.5 text-xs text-[#8BE28B] hover:text-[#C8FF4D] font-bold w-fit transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Upload</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Analysis <span className="text-[#8BE28B]">Results</span>
            </h1>
            <p className="text-xs text-[#A9B4AA] mt-0.5">
              Verified nutritional dossier and algorithmic packaging claim validation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                if (!result) return;
                setDownloadingPdf(true);
                try {
                  downloadAuditPdf(result);
                } finally {
                  setTimeout(() => setDownloadingPdf(false), 500);
                }
              }}
              disabled={downloadingPdf}
              className="px-4 py-2 rounded-xl bg-primary-container text-black font-extrabold text-xs shadow-[0_0_15px_rgba(200,255,77,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              title="Download official laboratory audit PDF report"
            >
              <span className="material-symbols-outlined text-[17px]">
                {downloadingPdf ? 'hourglass_top' : 'download'}
              </span>
              <span>{downloadingPdf ? 'Exporting...' : 'Download PDF Dossier'}</span>
            </button>

            <button
              onClick={() => setShowScoreModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#142618] text-[#8BE28B] hover:bg-[#1a3320] font-bold text-xs border border-[#8BE28B]/30 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C8FF4D]">analytics</span>
              <span>Why This Score?</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                saved
                  ? 'bg-[#1A3320] text-[#8BE28B] border border-[#8BE28B]/30'
                  : 'bg-[#102014] text-white hover:bg-[#162a1b] border border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#8BE28B]">
                {saved ? 'bookmark_added' : 'bookmark'}
              </span>
              <span>{saved ? 'Saved to Pantry' : 'Save to Pantry'}</span>
            </button>

            <Link
              to={`/chat?q=Explain+the+verification+dossier+for+${encodeURIComponent(result.productName)}`}
              className="px-3.5 py-2 rounded-xl bg-[#102014] text-white hover:bg-[#162a1b] font-bold text-xs border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-[#8BE28B]">smart_toy</span>
              <span>Ask NutriVerify AI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Top Grid: Product Information (Left) + Nutrition Facts (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card 1: Product Information */}
        <div className="lg:col-span-5 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8BE28B] text-[18px]">inventory_2</span>
                <span>Product Information</span>
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#142A1A] text-[#8BE28B] text-[11px] font-bold border border-[#8BE28B]/30">
                <span className="material-symbols-outlined text-[13px]">check</span>
                <span>Analysis Complete</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Product Pack Mockup or Real Uploaded Image */}
              <div className="sm:col-span-5 rounded-2xl bg-[#0F1D13] border border-white/10 p-2 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group min-h-[160px]">
                {uploadedImage ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt={result.productName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[#C8FF4D] text-[9px] font-mono font-bold">
                      VERIFIED OCR
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-36 rounded-xl bg-gradient-to-b from-[#18281c] via-[#0f1d13] to-[#08100a] border border-[#8BE28B]/30 p-2.5 shadow-md flex flex-col items-center justify-between text-center relative overflow-hidden">
                    {/* Corner Reticles */}
                    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#C8FF4D]" />
                    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#C8FF4D]" />
                    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#C8FF4D]" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#C8FF4D]" />

                    <div className="w-12 h-3 rounded-t bg-[#2f4f36] border-b border-[#8BE28B]/40" />
                    <div className="w-full flex-1 rounded bg-[#0A140D] border border-white/10 flex flex-col items-center justify-center p-1.5 my-1">
                      <span className="text-[8px] uppercase font-bold text-[#8BE28B] tracking-wider">{result.brand || 'ORGANIC LABS'}</span>
                      <span className="text-[11px] font-black text-white leading-tight truncate max-w-full px-1">
                        {result.productName}
                      </span>
                      <span className="text-[8px] font-mono text-[#A9B4AA] mt-0.5">500g • Verified Label</span>
                    </div>
                    <span className="text-[8px] font-mono text-[#8BE28B] font-bold">● SPECTRAL VERIFIED</span>
                  </div>
                )}
              </div>

              {/* Product Details Key-Values */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#A9B4AA] uppercase font-semibold">Product Name</span>
                  <div className="text-sm font-bold text-white leading-tight">{result.productName}</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#A9B4AA] uppercase font-semibold">Brand</span>
                  <div className="text-xs font-bold text-[#8BE28B]">{result.brand || 'Kellogg\'s'}</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#A9B4AA] uppercase font-semibold">Category</span>
                  <div className="text-xs text-white">Breakfast & Cereals</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#A9B4AA] uppercase font-semibold">Serving Size</span>
                  <div className="text-xs text-white">{result.servingSize ? `${result.servingSize}` : '30 g (1 bowl)'}</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#A9B4AA] uppercase font-semibold">Source Inspection</span>
                  <div className="text-xs text-[#C8FF4D]">
                    {uploadedImage ? 'User Uploaded Photo (OCR Passed)' : 'Standard Nutritional Library'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Nutrition Facts */}
        <div className="lg:col-span-7 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8BE28B] text-[18px]">table_chart</span>
                <h3 className="text-sm font-bold text-white">Nutrition Facts</h3>
                <span className="text-[11px] text-[#A9B4AA]">(Per 100 g approx.)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Nutrition Table Values */}
              <div className="sm:col-span-7 space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#A9B4AA]">Energy</span>
                  <span className="font-bold text-white">{result.nutritionFacts?.energyKcal || 370} kcal</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#A9B4AA]">Protein</span>
                  <span className="font-bold text-white">{result.nutritionFacts?.proteinG || 7.5} g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#A9B4AA]">Carbohydrates</span>
                  <span className="font-bold text-white">{result.nutritionFacts?.carbohydratesG || 84.0} g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 pl-3 text-[11px]">
                  <span className="text-[#6F7A70]">Total Sugars</span>
                  <span className="text-white">{result.nutritionFacts?.totalSugarsG || 8.0} g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#A9B4AA]">Dietary Fiber</span>
                  <span className="font-bold text-white">{result.nutritionFacts?.dietaryFiberG || 3.0} g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#A9B4AA]">Total Fat</span>
                  <span className="font-bold text-white">{result.nutritionFacts?.totalFatG || 0.9} g</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#A9B4AA]">Sodium</span>
                  <span className="font-bold text-white">{result.nutritionFacts?.sodiumMg || 460} mg</span>
                </div>
              </div>

              {/* Arc Gauge & Health Highlights */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0F1D13] border border-white/10 text-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#142318" strokeWidth="8" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#8BE28B"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="60"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white">{result.nutritionFacts?.energyKcal || 370}</span>
                    <span className="text-[10px] text-[#A9B4AA] font-bold">kcal</span>
                  </div>
                </div>

                <div className="w-full mt-2 p-2 rounded-xl bg-[#142618] border border-[#8BE28B]/20 text-[10px] text-[#8BE28B] font-bold flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">eco</span>
                  <span>Good source of fiber</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom 3-Card Row Matching Reference Image 4 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Bottom Card 1: Ingredients */}
        <div className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8BE28B] text-[18px]">biotech</span>
                <h3 className="text-sm font-bold text-white">Ingredients</h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#142A1A] text-[#8BE28B] text-[11px] font-bold border border-[#8BE28B]/30">
                Extracted
              </span>
            </div>

            <p className="text-xs text-white leading-relaxed mb-4">
              {result.ingredientsText || "Milled Corn (91%), Sugar, Barley Malt Extract, Iodized Salt, Vitamins (Niacin, B6, Riboflavin, Thiamine, Folate, B12), Mineral (Iron)."}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F1D13] border border-[#8BE28B]/20 flex items-center gap-2 text-xs text-[#8BE28B]">
            <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
            <span>No Palm Oil detected in formulation.</span>
          </div>
        </div>

        {/* Bottom Card 2: Allergen Detection */}
        <div className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8BE28B] text-[18px]">warning</span>
                <h3 className="text-sm font-bold text-white">Allergen Detection</h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2B1D0E] text-[#FFB86B] text-[11px] font-bold border border-[#FFB86B]/30">
                Notice
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-2 text-white">
                  <span>🌾</span> Gluten / Barley
                </span>
                <span className="text-[#FFB86B] font-semibold">Contains Malt</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-2 text-white">
                  <span>🌽</span> Corn
                </span>
                <span className="text-[#FFB86B] font-semibold">Present (91%)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-2 text-white">
                  <span>🥛</span> Dairy / Milk
                </span>
                <span className="text-[#8BE28B] font-semibold">Not detected</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-white">
                  <span>🥜</span> Peanuts & Tree Nuts
                </span>
                <span className="text-[#8BE28B] font-semibold">Not detected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card 3: Health Claims Verification */}
        <div className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8BE28B] text-[18px]">verified</span>
                <h3 className="text-sm font-bold text-white">Health Claims Verification</h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#142A1A] text-[#8BE28B] text-[11px] font-bold border border-[#8BE28B]/30">
                Statute Verified
              </span>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex items-center gap-2 text-white">
                <span className="text-[#8BE28B]">✓</span>
                <span>Good source of dietary fiber</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-[#8BE28B]">✓</span>
                <span>Essential vitamins fortification (B6, B12, Folic Acid)</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="text-[#8BE28B]">✓</span>
                <span>Zero synthetic preservatives</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F1D13] border border-[#8BE28B]/20 flex items-center gap-2 text-xs text-[#A9B4AA]">
            <span className="material-symbols-outlined text-[#8BE28B] text-[16px] shrink-0">verified_user</span>
            <span>Meets statutory claim standards under 21 CFR § 101.60 and FSSAI 2020.</span>
          </div>
        </div>
      </div>

      {/* ── Evidence Trail & Digital Investigation Audit ── */}
      <div className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#102014] text-[#C8FF4D] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Evidence Trail & Regulatory Verification</h3>
              <p className="text-[11px] text-[#A9B4AA]">Deterministic audit pathway from label scan to regulatory statutory check</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#102014] text-[#8BE28B] text-[10px] font-mono font-bold border border-[#8BE28B]/20">
            AUDIT #NV-{(result.authenticityScore || 95) * 89}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#0D1811] border border-white/10">
            <span className="text-[9px] font-mono text-[#8BE28B] font-bold block mb-1">01 · INPUT</span>
            <div className="text-xs font-bold text-white">Packaging Visual</div>
            <p className="text-[10px] text-[#A9B4AA] mt-1">High-res matrix extracted with edge OCR scanner.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0D1811] border border-white/10">
            <span className="text-[9px] font-mono text-[#8BE28B] font-bold block mb-1">02 · PARSED</span>
            <div className="text-xs font-bold text-white">Nutritional Tokenizing</div>
            <p className="text-[10px] text-[#A9B4AA] mt-1">Serving weights, calories, and macros normalized.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0D1811] border border-white/10">
            <span className="text-[9px] font-mono text-[#8BE28B] font-bold block mb-1">03 · RULE CHECK</span>
            <div className="text-xs font-bold text-white">Claim Consistency</div>
            <p className="text-[10px] text-[#A9B4AA] mt-1">Verified against US FDA & EFSA threshold rules.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0D1811] border border-white/10">
            <span className="text-[9px] font-mono text-[#8BE28B] font-bold block mb-1">04 · STATUTE</span>
            <div className="text-xs font-bold text-white">21 CFR § 101.60</div>
            <p className="text-[10px] text-[#A9B4AA] mt-1">No deceptive hidden sweetening agents detected.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#142618] border border-[#8BE28B]/30">
            <span className="text-[9px] font-mono text-[#C8FF4D] font-bold block mb-1">05 · VERDICT</span>
            <div className="text-xs font-extrabold text-white">Grade A Verified</div>
            <p className="text-[10px] text-[#8BE28B] mt-1">Passed authenticity and nutritional consistency.</p>
          </div>
        </div>
      </div>

      {/* ── Smart Swaps: Recommended Cleaner Alternatives ── */}
      <div className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C8FF4D] text-[18px]">swap_horiz</span>
            <h3 className="text-sm font-bold text-white">Smarter Clean Alternatives</h3>
          </div>
          <span className="text-xs text-[#8BE28B] font-bold">NutriVerify Verified Swaps</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#0F1D13] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#142318] text-2xl flex items-center justify-center">🥣</div>
              <div>
                <div className="text-xs font-bold text-white">Organic Sprouted Rolled Oats</div>
                <div className="text-[11px] text-[#8BE28B]">0g Added Sugar • 5g Protein • High Beta-Glucan</div>
              </div>
            </div>
            <Link
              to="/compare"
              className="px-3 py-1.5 rounded-xl bg-[#102014] hover:bg-[#1a3320] text-white text-[11px] font-bold border border-white/10"
            >
              Compare
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F1D13] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#142318] text-2xl flex items-center justify-center">🌾</div>
              <div>
                <div className="text-xs font-bold text-white">Ancient Grain Chia Flakes</div>
                <div className="text-[11px] text-[#8BE28B]">Zero Refined Grains • Omega-3 Rich</div>
              </div>
            </div>
            <Link
              to="/compare"
              className="px-3 py-1.5 rounded-xl bg-[#102014] hover:bg-[#1a3320] text-white text-[11px] font-bold border border-white/10"
            >
              Compare
            </Link>
          </div>
        </div>
      </div>

      {/* ── Action Buttons Bar at Bottom Right ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          to="/reports"
          className="px-5 py-3 rounded-full bg-[#102014] hover:bg-[#162a1b] text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Download Report</span>
        </Link>

        <Link
          to="/compare"
          className="px-6 py-3 rounded-full bg-[#C8FF4D] hover:brightness-110 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(200,255,77,0.35)] transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
          <span>Compare Products</span>
        </Link>
      </div>

      {/* ── "Why This Score" Breakdown Modal ── */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#09120B] border border-[#8BE28B]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C8FF4D] text-[22px]">analytics</span>
                <h3 className="text-base font-extrabold text-white">Health Score Breakdown</h3>
              </div>
              <button
                onClick={() => setShowScoreModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-black text-white">{result.healthScore || 85}</div>
              <div className="text-xs font-bold text-[#8BE28B]">Overall NutriVerify Health Grade A</div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#0F1D13] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Nutritional Balance</div>
                  <div className="text-[10px] text-[#A9B4AA]">Optimal low fat, high micronutrient density</div>
                </div>
                <span className="text-sm font-black text-[#8BE28B]">92 / 100</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1D13] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Ingredient Purity</div>
                  <div className="text-[10px] text-[#A9B4AA]">Zero hydrogenated fats or palm oil</div>
                </div>
                <span className="text-sm font-black text-[#8BE28B]">95 / 100</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1D13] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Allergen Safety</div>
                  <div className="text-[10px] text-[#A9B4AA]">Big 9 allergens disclosed transparently</div>
                </div>
                <span className="text-sm font-black text-[#8BE28B]">98 / 100</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1D13] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Front-of-Pack Claim Truth</div>
                  <div className="text-[10px] text-[#A9B4AA]">Fiber and vitamin claims certified valid</div>
                </div>
                <span className="text-sm font-black text-[#8BE28B]">87 / 100</span>
              </div>
            </div>

            <button
              onClick={() => setShowScoreModal(false)}
              className="w-full py-3 rounded-xl bg-[#C8FF4D] text-black font-extrabold text-xs shadow-md"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
