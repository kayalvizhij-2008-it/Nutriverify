import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi } from '../lib/api';

export default function UploadAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return; }
    if (!f.type.startsWith('image/')) { setError('Only image files are supported'); return; }
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

  const analyze = async () => {
    if (!file) { setError('Please upload an image first'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await analysisApi.upload(file);
      sessionStorage.setItem('nv_last_result', JSON.stringify(result));
      navigate('/results');
    } catch (err: any) {
      setError(err?.message || 'Upload failed. The OCR service may not be configured — try Manual Entry instead.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Upload Food Label</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Upload a clear photo of a food label for analysis.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-nv-error/10 border border-nv-error/20 rounded-xl text-[13px] text-nv-error">{error}</div>}

      {preview ? (
        <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
          <div className="relative rounded-xl overflow-hidden bg-nv-surface mb-4">
            <img src={preview} alt="Uploaded label" className="max-h-80 mx-auto object-contain" />
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setPreview(null); setFile(null); }} className="px-4 py-2 text-[13px] text-nv-text-muted bg-nv-surface-container-high rounded-xl hover:bg-nv-surface-container-highest transition-colors">
              Remove
            </button>
            <button onClick={() => fileRef.current?.click()} className="px-4 py-2 text-[13px] text-nv-text-muted bg-nv-surface-container-high rounded-xl hover:bg-nv-surface-container-highest transition-colors">
              Replace
            </button>
            <button onClick={analyze} disabled={loading} className="px-5 py-2 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all disabled:opacity-50">
              {loading ? 'Analyzing...' : 'Analyze Label'}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            dragOver ? 'border-nv-primary/50 bg-nv-primary/5' : 'border-nv-outline-variant/25 hover:border-nv-outline-variant/40 hover:bg-nv-surface-container/30'
          }`}
        >
          <span className="material-symbols-outlined text-[48px] text-nv-text-dim block mb-4">cloud_upload</span>
          <p className="text-[15px] text-nv-text mb-1">Drop a food label image here</p>
          <p className="text-[13px] text-nv-text-dim">or click to browse — JPG, PNG, WebP · Max 10MB</p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {!preview && (
        <div className="mt-6 p-4 bg-nv-surface-container rounded-xl border border-nv-outline-variant/10">
          <p className="text-[12px] text-nv-text-dim leading-relaxed">
            <strong className="text-nv-text-muted">Note:</strong> OCR extraction requires an external vision service. If not configured, the upload will prompt you to review extracted fields or switch to Manual Entry.
          </p>
        </div>
      )}
    </div>
  );
}
