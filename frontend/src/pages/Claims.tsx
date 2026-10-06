import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnalysisResponse } from '../lib/api';

interface ClaimAuditItem {
  id: string;
  claimText: string;
  category: 'Nutrient Content' | 'Health & Immunity' | 'Clean Label' | 'Organic / Natural';
  verdict: 'VERIFIED' | 'MISLEADING' | 'UNSUBSTANTIATED' | 'REQUIRES_CONTEXT';
  lawCitation: string;
  testedValue: string;
  legalThreshold: string;
  auditExplanation: string;
  authenticityIndex: number;
}

const SAMPLE_CLAIMS: ClaimAuditItem[] = [
  {
    id: 'c-1',
    claimText: '“No Added Sugar” on Fruit Detox Beverage',
    category: 'Nutrient Content',
    verdict: 'MISLEADING',
    lawCitation: 'FSSAI §4.2(3) & US FDA 21 CFR 101.60(c)(2)',
    testedValue: '26g free sugars from reconstituted white grape concentrate',
    legalThreshold: 'Must not contain fruit juice concentrate serving as sweetening agent without disclosure',
    auditExplanation: 'Product replaces table sugar with high-fructose fruit concentrate, delivering identical glycemic and metabolic load while advertising "No Added Sugar".',
    authenticityIndex: 24,
  },
  {
    id: 'c-2',
    claimText: '“High Protein” on Artisanal Granola Bar',
    category: 'Nutrient Content',
    verdict: 'VERIFIED',
    lawCitation: 'EFSA Regulation 1924/2006 & FDA 21 CFR 101.54(b)',
    testedValue: '8.5g protein per 45g serving (22% of total caloric energy)',
    legalThreshold: 'At least 20% of energy value provided by protein (EU) or ≥ 5g/serving (US)',
    auditExplanation: 'The product satisfies both EU and FDA high-protein thresholds with yellow pea protein isolate and whole rolled oats.',
    authenticityIndex: 96,
  },
  {
    id: 'c-3',
    claimText: '“Active Cellular Immunity Booster” on Vitamin Shake',
    category: 'Health & Immunity',
    verdict: 'UNSUBSTANTIATED',
    lawCitation: 'EFSA Article 13/14 register & FTC Health Policy',
    testedValue: '0.02% chlorophyll extract + standard Vitamin C',
    legalThreshold: 'Clinical trial authorization on whole finished formulation required for specific disease/cellular immunity claims',
    auditExplanation: 'Generic wellness terminology used without randomized double-blind clinical validation registered with statutory authority.',
    authenticityIndex: 38,
  },
  {
    id: 'c-4',
    claimText: '“100% Natural Ingredients” on Packaged Snack',
    category: 'Organic / Natural',
    verdict: 'MISLEADING',
    lawCitation: 'UK ASA / US FDA Implied Natural Policy',
    testedValue: 'Contains Hydrolyzed Vegetable Protein (HVP) & Synthetic Spearmint Extract',
    legalThreshold: 'Must not contain synthetic substances, artificial flavoring, or intensive chemical hydrolysis',
    auditExplanation: 'HVP is chemically synthesized through hydrochloric acid degradation; incompatible with strict 100% natural labeling.',
    authenticityIndex: 31,
  },
  {
    id: 'c-5',
    claimText: '“Low Sodium” on Himalayan Salt Crackers',
    category: 'Nutrient Content',
    verdict: 'VERIFIED',
    lawCitation: 'FDA 21 CFR 101.61(b)(4) & FSSAI Table 2',
    testedValue: '95mg sodium per 45g serving',
    legalThreshold: '≤ 140 mg sodium per reference amount customarily consumed (RACC)',
    auditExplanation: 'Laboratory measurement of 95mg sodium is well under the 140mg statutory ceiling for "Low Sodium" qualification.',
    authenticityIndex: 98,
  },
  {
    id: 'c-6',
    claimText: '“Gluten-Free” on Ancient Grain Crispbread',
    category: 'Clean Label',
    verdict: 'VERIFIED',
    lawCitation: 'FDA 21 CFR 101.91 & Codex Standard 118-1979',
    testedValue: '< 5 ppm gluten detected via ELISA R5 antibody assay',
    legalThreshold: '< 20 ppm gluten threshold strictly enforced',
    auditExplanation: 'ELISA testing confirms gluten levels are below 5 parts per million, well within international standards.',
    authenticityIndex: 99,
  },
];

export default function ClaimsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSpecimenResult, setActiveSpecimenResult] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('nv_last_result');
    if (raw) {
      try {
        setActiveSpecimenResult(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const claimList = useMemo(() => {
    // If active specimen has claims, incorporate them
    if (activeSpecimenResult && activeSpecimenResult.claimResults && activeSpecimenResult.claimResults.length > 0) {
      const activeMapped: ClaimAuditItem[] = activeSpecimenResult.claimResults.map((c, i) => ({
        id: `active-${i}`,
        claimText: `“${c.claimText}” on ${activeSpecimenResult.productName}`,
        category: 'Nutrient Content',
        verdict: c.verdict === 'VERIFIED' ? 'VERIFIED' : c.verdict === 'FALSE' ? 'MISLEADING' : 'UNSUBSTANTIATED',
        lawCitation: 'FDA 21 CFR § 101 / FSSAI Regulations 2022',
        testedValue: c.reason || 'Evaluated against OCR packaging ingredients and nutritional declarations',
        legalThreshold: 'Statutory compliance ceiling based on front-of-pack mandates',
        auditExplanation: c.reason || 'Verified by NutriVerify Algorithmic Compliance Engine',
        authenticityIndex: c.verdict === 'VERIFIED' ? 95 : c.verdict === 'FALSE' ? 18 : 45,
      }));

      // Combine with samples
      return [...activeMapped, ...SAMPLE_CLAIMS];
    }
    return SAMPLE_CLAIMS;
  }, [activeSpecimenResult]);

  const filteredClaims = useMemo(() => {
    return claimList.filter(claim => {
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'VERIFIED' && claim.verdict === 'VERIFIED') ||
        (activeFilter === 'MISLEADING' && claim.verdict === 'MISLEADING') ||
        (activeFilter === 'UNSUBSTANTIATED' && claim.verdict === 'UNSUBSTANTIATED') ||
        (activeFilter === 'ORGANIC' && (claim.category === 'Organic / Natural' || claim.category === 'Clean Label'));

      const matchesSearch =
        claim.claimText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.lawCitation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.auditExplanation.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [claimList, activeFilter, searchQuery]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* ── Top Header Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#142618] border border-[#8BE28B]/30 text-[#C8FF4D] flex items-center justify-center shadow-[0_0_20px_rgba(200,255,77,0.2)]">
            <span className="material-symbols-outlined text-[26px]">gavel</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold uppercase tracking-wider border border-[#8BE28B]/30">
                Statutory Claim Verification Engine v3.8
              </span>
              <span className="text-xs text-[#A9B4AA]">• FDA 21 CFR § 101 • EFSA 1924/2006 • FSSAI 2022</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-0.5">
              Front-of-Pack <span className="text-[#8BE28B]">Claim Audit Dossier</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          <Link
            to="/results"
            className="px-3.5 py-2 rounded-xl bg-[#101A13] text-[#A9B4AA] hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Results</span>
          </Link>
          <Link
            to="/analyze"
            className="px-4 py-2 rounded-xl bg-[#C8FF4D] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(200,255,77,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">fact_check</span>
            <span>Audit My Product</span>
          </Link>
        </div>
      </div>

      {/* ── Active Specimen Overview Banner ── */}
      {activeSpecimenResult && (
        <div className="p-4 rounded-2xl bg-[#09120B]/80 backdrop-blur-xl border border-[#8BE28B]/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142618] border border-[#8BE28B]/40 text-[#8BE28B] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Auditing Active Target: <strong className="text-[#C8FF4D]">{activeSpecimenResult.productName}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#142618] text-[#8BE28B] text-[10px] font-bold border border-[#8BE28B]/30">
                  {activeSpecimenResult.claimResults?.length || 0} CLAIMS CROSS-CHECKED
                </span>
              </div>
              <div className="text-xs text-[#A9B4AA] mt-0.5">
                Authenticity index: <strong className="text-white">{activeSpecimenResult.authenticityScore || 90}%</strong> • 
                Nutritional Integrity: <strong className="text-[#C8FF4D]">{activeSpecimenResult.healthScore || 85}/100</strong>
              </div>
            </div>
          </div>

          <Link
            to="/reports"
            className="px-3.5 py-1.5 rounded-xl bg-[#142618] text-[#8BE28B] hover:bg-[#1a3320] border border-[#8BE28B]/30 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Generate Official Report</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* ── FILTER TABS & SEARCH BAR ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1610]/65 backdrop-blur-xl border border-white/10">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#071009] p-1 rounded-xl border border-white/10 overflow-x-auto w-full md:w-auto scroll-thin">
          {[
            { id: 'ALL', label: 'All Claims' },
            { id: 'VERIFIED', label: '✓ Verified [PASS]' },
            { id: 'MISLEADING', label: '✕ Misleading [DECEPTIVE]' },
            { id: 'UNSUBSTANTIATED', label: '⚠ Unsubstantiated [WARNING]' },
            { id: 'ORGANIC', label: 'Clean Label & Natural' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-[#C8FF4D] text-black font-extrabold shadow-sm'
                  : 'text-[#A9B4AA] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#A9B4AA]">
            search
          </span>
          <input
            type="text"
            placeholder="Search claim, law, or citation..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#071009] text-white placeholder-[#6F7A70] text-xs border border-white/10 focus:border-[#8BE28B] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A9B4AA] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── BENTO CLAIMS COURTROOM GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredClaims.map(claim => {
          const isVerified = claim.verdict === 'VERIFIED';
          const isMisleading = claim.verdict === 'MISLEADING';

          return (
            <div
              key={claim.id}
              className={`rounded-3xl p-6 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden ${
                isVerified
                  ? 'bg-[#0D1610]/80 border-[#8BE28B]/30 hover:border-[#8BE28B]/60'
                  : isMisleading
                  ? 'bg-[#1F1212]/80 border-[#FF5252]/40 hover:border-[#FF5252]/70 shadow-[0_0_20px_rgba(255,82,82,0.15)]'
                  : 'bg-[#1C1610]/80 border-[#FFB86B]/30 hover:border-[#FFB86B]/60'
              }`}
            >
              <div>
                {/* Header: Category + Verdict Stamp Badge */}
                <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3.5 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-[#071009] border border-white/10 text-[10px] font-mono text-[#A9B4AA] uppercase font-bold">
                    {claim.category}
                  </span>

                  {/* Verdict Stamp */}
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                    isVerified
                      ? 'bg-[#142A1A] text-[#8BE28B] border border-[#8BE28B]/40'
                      : isMisleading
                      ? 'bg-[#331414] text-[#FF5252] border border-[#FF5252]/40 animate-pulse'
                      : 'bg-[#2A2010] text-[#FFB86B] border border-[#FFB86B]/40'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {isVerified ? 'verified' : isMisleading ? 'cancel' : 'warning'}
                    </span>
                    <span>
                      {isVerified ? 'LEGALLY VERIFIED' : isMisleading ? 'DECEPTIVE CLAIM' : 'UNSUBSTANTIATED'}
                    </span>
                  </div>
                </div>

                {/* Claim Text Title */}
                <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-[#C8FF4D] transition-colors">
                  {claim.claimText}
                </h3>

                {/* Governing Statute */}
                <div className="flex items-center gap-1.5 text-xs text-[#8BE28B] font-mono my-3 bg-[#071009]/90 px-3 py-1.5 rounded-xl border border-white/5 w-fit">
                  <span className="material-symbols-outlined text-[15px] text-[#C8FF4D]">policy</span>
                  <span>{claim.lawCitation}</span>
                </div>

                {/* Side-by-side Evidence Comparison Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3.5 text-xs">
                  {/* Tested Value */}
                  <div className="p-3 rounded-2xl bg-[#071009] border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider block mb-1">
                      Tested / OCR Formulation:
                    </span>
                    <p className="text-white font-medium text-xs leading-relaxed">{claim.testedValue}</p>
                  </div>

                  {/* Permitted Legal Threshold */}
                  <div className="p-3 rounded-2xl bg-[#071009] border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-[#8BE28B] uppercase tracking-wider block mb-1">
                      Statutory Benchmark Ceiling:
                    </span>
                    <p className="text-[#A9B4AA] text-xs leading-relaxed">{claim.legalThreshold}</p>
                  </div>
                </div>

                {/* Audit Explanation */}
                <div className="p-3.5 rounded-2xl bg-[#071009]/80 border border-white/5 text-xs text-[#dde5d9] leading-relaxed">
                  <strong className="text-[#8BE28B] block mb-0.5">Audit Finding & Legal Assessment:</strong>
                  {claim.auditExplanation}
                </div>
              </div>

              {/* Card Footer: Authenticity Compliance Meter */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4 mt-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-mono text-[#A9B4AA] mb-1">
                    <span>Statutory Compliance Index</span>
                    <strong className={isVerified ? 'text-[#8BE28B]' : 'text-[#FF5252]'}>
                      {claim.authenticityIndex}%
                    </strong>
                  </div>
                  <div className="w-full bg-[#101A13] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isVerified ? 'bg-[#8BE28B]' : isMisleading ? 'bg-[#FF5252]' : 'bg-[#FFB86B]'
                      }`}
                      style={{ width: `${claim.authenticityIndex}%` }}
                    />
                  </div>
                </div>

                <Link
                  to={`/chat?q=Explain+statutory+legal+claim+audit+for+${encodeURIComponent(claim.claimText)}`}
                  className="px-3 py-1.5 rounded-xl bg-[#142618] hover:bg-[#1a3320] text-[#8BE28B] text-xs font-bold border border-[#8BE28B]/30 transition-all shrink-0 flex items-center gap-1"
                >
                  <span>Ask AI</span>
                  <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
