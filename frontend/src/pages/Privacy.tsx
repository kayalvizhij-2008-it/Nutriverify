import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-[13px] text-nv-text-dim hover:text-nv-text mb-6 transition-colors">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back
      </button>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Privacy Policy</h1>
        <p className="text-[13px] text-nv-text-dim mt-1">Last updated: September 2025</p>
      </div>

      <div className="space-y-6">
        {[
          { title: 'Data Collection', text: 'NutriVerify collects only the information you provide during account registration and food label analysis. This includes your username, password (encrypted), dietary preferences, and analysis data.' },
          { title: 'Data Usage', text: 'Your data is used solely to provide the NutriVerify service. Analysis data, saved products, and dietary preferences are stored to power your dashboard, history, and personalized recommendations.' },
          { title: 'Data Storage', text: 'All data is stored on our servers with industry-standard security. Passwords are hashed using bcrypt. Authentication is managed through JWT tokens.' },
          { title: 'Data Sharing', text: 'NutriVerify does not sell, trade, or share your personal data with third parties. Your analysis data remains private to your account.' },
          { title: 'Your Rights', text: 'You can access, export, or delete your data at any time through the Settings page. Account deletion removes all associated data permanently.' },
          { title: 'Contact', text: 'For privacy-related inquiries, contact the development team at Chennai Institute of Technology, Department of Computer Science & Health Informatics.' },
        ].map(section => (
          <div key={section.title}>
            <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text mb-2">{section.title}</h3>
            <p className="text-[14px] text-nv-text-muted leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
