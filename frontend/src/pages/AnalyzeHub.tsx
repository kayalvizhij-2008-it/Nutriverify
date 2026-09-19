import { Link } from 'react-router-dom';

const METHODS = [
  {
    icon: 'edit_note',
    title: 'Manual Entry',
    desc: 'Enter the nutrition and ingredient information yourself.',
    cta: 'Enter Label Data',
    to: '/analyze/manual',
    accent: 'group-hover:text-nv-primary group-hover:border-nv-primary/30',
    iconBg: 'group-hover:bg-nv-primary-container/15',
  },
  {
    icon: 'cloud_upload',
    title: 'Upload Image',
    desc: 'Upload a clear photo of a food label for analysis.',
    cta: 'Upload Label',
    to: '/analyze/upload',
    accent: 'group-hover:text-nv-tertiary group-hover:border-nv-tertiary/30',
    iconBg: 'group-hover:bg-nv-tertiary/10',
  },
  {
    icon: 'photo_camera',
    title: 'Live Camera',
    desc: 'Use your camera to scan a food label in real time.',
    cta: 'Start Live Scan',
    to: '/analyze/live',
    accent: 'group-hover:text-nv-secondary group-hover:border-nv-secondary/30',
    iconBg: 'group-hover:bg-nv-secondary/10',
  },
];

export default function AnalyzeHub() {
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">
          How do you want to verify?
        </h1>
        <p className="text-[14px] text-nv-text-muted mt-2">
          Choose a method to provide food label information for analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {METHODS.map((m) => (
          <Link
            key={m.title}
            to={m.to}
            className={`group relative bg-nv-surface-container rounded-2xl p-7 border border-nv-outline-variant/15 hover:border-nv-outline-variant/30 transition-all duration-200 hover:shadow-lg`}
          >
            <div className={`w-12 h-12 rounded-xl bg-nv-surface-container-high ${m.iconBg} border border-nv-outline-variant/15 flex items-center justify-center mb-5 transition-colors`}>
              <span className={`material-symbols-outlined text-[24px] text-nv-text-muted ${m.accent} transition-colors`}>{m.icon}</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-[17px] font-semibold text-nv-text mb-2">{m.title}</h3>
            <p className="text-[13px] text-nv-text-muted leading-relaxed mb-5">{m.desc}</p>
            <span className="text-[13px] font-medium text-nv-text-dim group-hover:text-nv-primary transition-colors flex items-center gap-1.5">
              {m.cta}
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
