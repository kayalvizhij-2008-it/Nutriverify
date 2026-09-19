import { useState } from 'react';

const FAQS = [
  { q: 'How does NutriVerify analyze food labels?', a: 'NutriVerify uses seven specialized engines: IngredientAnalyzer for risk assessment, ClaimValidator for claim verification, AuthenticityEngine for authenticity scoring, NutritionConsistencyChecker for cross-referencing nutrition data, HealthScoreEngine for health quality ratings, ComparisonEngine for product comparisons, and RecommendationEngine for personalized advice.' },
  { q: 'What is the Authenticity Score?', a: 'The Authenticity Score (0-100) measures how well a product\'s claims are supported by its actual ingredient and nutrition data. Higher scores indicate that the label accurately represents the product. A score above 80 is considered Trusted.' },
  { q: 'What is the Health Quality Score?', a: 'The Health Quality Score rates the overall nutritional quality of a product, considering calories, sugar, fat, protein, fiber, sodium, and ingredient safety. Higher scores indicate more nutritious options.' },
  { q: 'Is NutriVerify a medical device?', a: 'No. NutriVerify is an educational tool that helps consumers understand food labels. It does not provide medical advice, diagnose conditions, or replace professional nutritional guidance.' },
  { q: 'How accurate are the analyses?', a: 'NutriVerify uses rule-based analysis engines validated against nutritional science. Results are based on the information provided on the label. Accuracy depends on the completeness of the input data.' },
  { q: 'Can I compare products?', a: 'Yes. Use the Comparison feature to select two previously analyzed products and receive a detailed side-by-side comparison with recommendations.' },
  { q: 'Is my data secure?', a: 'Your data is stored locally on the server with JWT authentication. Only you can access your analyses. No data is shared with third parties.' },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Help & FAQ</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Frequently asked questions about NutriVerify.</p>
      </div>

      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-nv-surface-container rounded-xl border border-nv-outline-variant/15 overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
              <span className="text-[14px] font-medium text-nv-text pr-4">{faq.q}</span>
              <span className={`material-symbols-outlined text-[18px] text-nv-text-dim transition-transform flex-shrink-0 ${open === i ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {open === i && (
              <div className="px-5 pb-5">
                <p className="text-[13px] text-nv-text-muted leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
