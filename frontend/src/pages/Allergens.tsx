import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnalysisResponse } from '../lib/api';

interface AllergenItem {
  id: string;
  name: string;
  icon: string;
  category: 'Major (Big 9)' | 'EU Mandatory 14' | 'Emerging Sensitivity';
  severity: 'CRITICAL_ANAPHYLAXIS' | 'HIGH_SENSITIVITY' | 'MODERATE_INTOLERANCE';
  commonAliases: string[];
  crossContactRisk: string;
  prevalence: string;
  symptoms: string[];
  regulatoryMandate: string;
  commonProducts: string[];
}

const ALLERGEN_CATALOG: AllergenItem[] = [
  {
    id: 'milk',
    name: 'Milk & Dairy Derivatives',
    icon: 'egg_alt',
    category: 'Major (Big 9)',
    severity: 'CRITICAL_ANAPHYLAXIS',
    commonAliases: ['Casein', 'Caseinate', 'Whey', 'Lactalbumin', 'Milk Solids', 'Butterfat', 'Ghee'],
    crossContactRisk: 'High in shared chocolate, bakery, and dairy dessert facilities.',
    prevalence: '2.5% of pediatric and 1.8% of adult populations globally.',
    symptoms: ['Hives', 'Digestive Distress', 'Bronchospasm', 'Severe Anaphylaxis'],
    regulatoryMandate: 'US FALCPA §203 • EU 1169 Annex II • FSSAI Schedule II',
    commonProducts: ['Chocolates', 'Baked Goods', 'Protein Shakes', 'Sauces'],
  },
  {
    id: 'peanuts',
    name: 'Peanuts & Groundnuts',
    icon: 'grain',
    category: 'Major (Big 9)',
    severity: 'CRITICAL_ANAPHYLAXIS',
    commonAliases: ['Arachis Oil', 'Groundnut', 'Beer Nuts', 'Monkey Nuts', 'Cold-Pressed Peanut Extract'],
    crossContactRisk: 'Extremely high in snack extrusion, trail mixes, and confectionery lines.',
    prevalence: 'Approx. 2.0% in western countries; leading cause of fatal food-induced anaphylaxis.',
    symptoms: ['Acute Airway Constriction', 'Facial Angioedema', 'Hypotension', 'Anaphylactic Shock'],
    regulatoryMandate: 'Mandatory zero-threshold declaration worldwide',
    commonProducts: ['Nut Butters', 'Granola', 'Asian Sauces', 'Baked Snacks'],
  },
  {
    id: 'tree-nuts',
    name: 'Tree Nuts (Almonds, Walnuts, Cashews)',
    icon: 'nutrition',
    category: 'Major (Big 9)',
    severity: 'CRITICAL_ANAPHYLAXIS',
    commonAliases: ['Almond Flour', 'Cashew Butter', 'Pistachio', 'Macadamia', 'Pecan', 'Hazelnut Paste', 'Prunus Dulcis'],
    crossContactRisk: 'Common in artisanal granola, plant milks, and breakfast cereal processing.',
    prevalence: '1.2% worldwide; high persistence rate through adulthood.',
    symptoms: ['Oral Allergy Syndrome', 'Gastrointestinal Cramping', 'Dyspnea', 'Anaphylaxis'],
    regulatoryMandate: 'Mandatory specific species declaration (FDA / EFSA / FSSAI)',
    commonProducts: ['Marzipan', 'Pesto', 'Granola Bars', 'Plant-Based Cheeses'],
  },
  {
    id: 'wheat-gluten',
    name: 'Wheat & Gluten Grains',
    icon: 'grass',
    category: 'Major (Big 9)',
    severity: 'HIGH_SENSITIVITY',
    commonAliases: ['Maida', 'Semolina', 'Durum', 'Spelt', 'Emmer', 'Farina', 'Hydrolyzed Wheat Protein'],
    crossContactRisk: 'Ubiquitous airborne flour contamination in commercial bakeries and grain silos.',
    prevalence: '1% Celiac Disease; 6-8% Non-Celiac Gluten Sensitivity (NCGS).',
    symptoms: ['Intestinal Villous Atrophy', 'Chronic Fatigue', 'Dermatitis Herpetiformis', 'Bloating'],
    regulatoryMandate: '< 20 ppm threshold required for "Gluten-Free" claim verification',
    commonProducts: ['Noodles', 'Pasta', 'Bread', 'Soy Sauce', 'Gravies'],
  },
  {
    id: 'soybeans',
    name: 'Soy & Soy Lecithin',
    icon: 'eco',
    category: 'Major (Big 9)',
    severity: 'HIGH_SENSITIVITY',
    commonAliases: ['Soy Lecithin (E322)', 'Edamame', 'Hydrolyzed Soy Protein', 'Textured Vegetable Protein (TVP)', 'Miso'],
    crossContactRisk: 'Found as emulsifier across 60%+ of packaged ultra-processed foods.',
    prevalence: '0.4% in children, frequently outgrown by age 10.',
    symptoms: ['Atopic Dermatitis', 'Rhinoconjunctivitis', 'Nausea', 'Bronchial Spasms'],
    regulatoryMandate: 'FDA FASTER Act 2021 mandatory labeling required',
    commonProducts: ['Processed Meats', 'Chocolate Emulsifiers', 'Margarine', 'Snack Bars'],
  },
  {
    id: 'eggs',
    name: 'Egg Albumin & Yolk',
    icon: 'egg',
    category: 'Major (Big 9)',
    severity: 'CRITICAL_ANAPHYLAXIS',
    commonAliases: ['Albumin', 'Ovalbumin', 'Lysozyme (E1105)', 'Globulin', 'Ovomucoid', 'Mayonnaise'],
    crossContactRisk: 'Frequent in bakery equipment, glazed goods, and emulsion dressing lines.',
    prevalence: '1.5% in pediatric populations; high allergic potency in raw proteins.',
    symptoms: ['Generalized Urticaria', 'Periorbital Edema', 'Vomiting', 'Severe Wheezing'],
    regulatoryMandate: 'Zero-threshold statutory disclosure under US FALCPA',
    commonProducts: ['Mayonnaise', 'Baked Goods', 'Pasta', 'Marshmallows', 'Wine Clarifiers'],
  },
  {
    id: 'fish-shellfish',
    name: 'Crustaceans, Fish & Molluscs',
    icon: 'phishing',
    category: 'Major (Big 9)',
    severity: 'CRITICAL_ANAPHYLAXIS',
    commonAliases: ['Surimi', 'Fish Collagen', 'Glucosamine', 'Oyster Sauce', 'Anchovy Extract', 'Worcestershire'],
    crossContactRisk: 'Steam aeration during cooking can trigger airborne allergic responses in sensitive individuals.',
    prevalence: '2.3% of global population; lifelong persistence in 90% of cases.',
    symptoms: ['Immediate Laryngeal Edema', 'Vascular Collapse', 'Intense Itching', 'Systemic Anaphylaxis'],
    regulatoryMandate: 'Distinct Crustacean vs Finfish declarations mandatory in US & EU',
    commonProducts: ['Caesar Dressing', 'Asian Broths', 'Omega-3 Supplements', 'Gelatin Desserts'],
  },
  {
    id: 'sesame',
    name: 'Sesame Seeds & Tahini',
    icon: 'scatter_plot',
    category: 'Major (Big 9)',
    severity: 'CRITICAL_ANAPHYLAXIS',
    commonAliases: ['Tahini', 'Gingelly Oil', 'Til', 'Benne', 'Sesamum Indicum', 'Sim Sim'],
    crossContactRisk: 'Significant airborne dust in commercial bagel and flatbread bakeries.',
    prevalence: '0.23% in US; officially declared 9th Major US Allergen under FASTER Act 2023.',
    symptoms: ['Acute Oropharyngeal Swelling', 'Generalized Flushing', 'Dyspnea', 'Circulatory Collapse'],
    regulatoryMandate: 'US FASTER Act (Jan 2023) • EU Annex II item 10',
    commonProducts: ['Hummus', 'Bagels', 'Halva', 'Asian Stir-Fry Oils'],
  },
  {
    id: 'sulfites',
    name: 'Sulfites & Sulfur Dioxide (E220 - E228)',
    icon: 'science',
    category: 'EU Mandatory 14',
    severity: 'HIGH_SENSITIVITY',
    commonAliases: ['Sodium Metabisulfite', 'Potassium Bisulfite', 'E220', 'E221', 'E222', 'E223', 'E224', 'E228'],
    crossContactRisk: 'Ubiquitous preservative in dried fruits, wine, vinegar, and potato crisps.',
    prevalence: '1% in general population; up to 10% in severe asthmatic patients.',
    symptoms: ['Acute Bronchoconstriction', 'Steroid-Resistant Asthma Attack', 'Flushing', 'Hypotension'],
    regulatoryMandate: 'Mandatory declaration if concentration exceeds 10 mg/kg or 10 mg/L (10 ppm)',
    commonProducts: ['Dried Apricots & Raisins', 'Wine & Cider', 'Potato Flakes', 'Pickles'],
  },
  {
    id: 'mustard-celery',
    name: 'Mustard, Celery & Celeriac Extracts',
    icon: 'local_florist',
    category: 'EU Mandatory 14',
    severity: 'HIGH_SENSITIVITY',
    commonAliases: ['Mustard Flour', 'Brassica', 'Celery Root', 'Apium Graveolens', 'Mustard Bran', 'Celery Salt'],
    crossContactRisk: 'Common in commercial spice grinding mills and processed meat marinades.',
    prevalence: 'High in Central Europe (1.1%); potent masked allergen in savory snack seasonings.',
    symptoms: ['Severe Oral Angioedema', 'Skin Blistering', 'Gastric Spasms', 'Anaphylaxis'],
    regulatoryMandate: 'Mandatory declaration in EU No 1169/2011 Annex II items 9 & 11',
    commonProducts: ['Curry Powders', 'Salad Dressings', 'Spice Rubs', 'Sausages', 'Instant Soups'],
  },
];

export default function AllergensPage() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [myTriggers, setMyTriggers] = useState<string[]>(['milk', 'peanuts', 'wheat-gluten']);
  const [selectedAllergen, setSelectedAllergen] = useState<AllergenItem | null>(null);
  const [activeSpecimenResult, setActiveSpecimenResult] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('nv_last_result');
    if (raw) {
      try {
        setActiveSpecimenResult(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const toggleTrigger = (id: string) => {
    setMyTriggers(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const filteredCatalog = useMemo(() => {
    return ALLERGEN_CATALOG.filter(item => {
      const matchesCategory =
        activeCategory === 'ALL' ||
        (activeCategory === 'BIG_9' && item.category === 'Major (Big 9)') ||
        (activeCategory === 'EU_14' && (item.category === 'Major (Big 9)' || item.category === 'EU Mandatory 14')) ||
        (activeCategory === 'MY_TRIGGERS' && myTriggers.includes(item.id));

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.commonAliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.regulatoryMandate.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, myTriggers]);

  // Detected allergens in active specimen
  const activeDetectedAllergens = useMemo(() => {
    if (!activeSpecimenResult || !activeSpecimenResult.allergenFindings) return [];
    return activeSpecimenResult.allergenFindings;
  }, [activeSpecimenResult]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* ── Top Header Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#2E1212] border border-[#FF5252]/40 text-[#FF5252] flex items-center justify-center shadow-[0_0_20px_rgba(255,82,82,0.2)]">
            <span className="material-symbols-outlined text-[26px]">shield_with_heart</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#331414] text-[#FFB4AB] text-[10px] font-bold uppercase tracking-wider border border-[#FF5252]/30">
                Clinical Grade Allergen Radar
              </span>
              <span className="text-xs text-[#A9B4AA]">• Cross-checked against US FDA FASTER Act & EU 1169</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-0.5">
              Allergen Risk & <span className="text-[#8BE28B]">Contamination Matrix</span>
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
            to="/camera-scan"
            className="px-4 py-2 rounded-xl bg-[#C8FF4D] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(200,255,77,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">qr_code_scanner</span>
            <span>Check a Product</span>
          </Link>
        </div>
      </div>

      {/* ── Active Specimen Real-Time Cross-Check Banner ── */}
      {activeSpecimenResult && (
        <div className="p-4 rounded-2xl bg-[#09120B]/80 backdrop-blur-xl border border-[#8BE28B]/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              activeDetectedAllergens.length > 0
                ? 'bg-[#2E1212] border border-[#FF5252]/40 text-[#FF5252]'
                : 'bg-[#142618] border border-[#8BE28B]/40 text-[#8BE28B]'
            }`}>
              <span className="material-symbols-outlined text-[22px]">
                {activeDetectedAllergens.length > 0 ? 'warning' : 'verified_user'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Specimen: <strong className="text-[#C8FF4D]">{activeSpecimenResult.productName}</strong>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeDetectedAllergens.length > 0
                    ? 'bg-[#2E1212] text-[#FF5252]'
                    : 'bg-[#142618] text-[#8BE28B]'
                }`}>
                  {activeDetectedAllergens.length > 0 ? `${activeDetectedAllergens.length} ALLERGEN DETECTED` : 'CLEAN SPECIMEN'}
                </span>
              </div>
              <div className="text-xs text-[#A9B4AA] mt-0.5">
                {activeDetectedAllergens.length > 0
                  ? `Identified matches in ingredients list: ${activeDetectedAllergens.map(a => a.allergenName).join(', ')}`
                  : 'Zero undeclared or high-risk allergen cross-contact traces detected in current formulation.'}
              </div>
            </div>
          </div>

          <Link
            to="/reports"
            className="px-3.5 py-1.5 rounded-xl bg-[#142618] text-[#8BE28B] hover:bg-[#1a3320] border border-[#8BE28B]/30 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>View Full Dossier</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* ── Active Personal Allergen Profile Bar ── */}
      <div className="p-5 rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 shadow-xl flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C8FF4D] text-[20px]">tune</span>
            <h2 className="text-sm font-bold text-white">Your Personal Allergen Trigger Filters</h2>
          </div>
          <span className="text-xs font-mono text-[#8BE28B]">
            {myTriggers.length} Active Triggers • Real-time OCR cross-check active
          </span>
        </div>

        {/* Trigger Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {ALLERGEN_CATALOG.map(al => {
            const isTrigger = myTriggers.includes(al.id);
            return (
              <button
                key={al.id}
                onClick={() => toggleTrigger(al.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isTrigger
                    ? 'bg-[#2E1212] text-[#FFB4AB] border border-[#FF5252]/50 shadow-[0_0_10px_rgba(255,82,82,0.25)]'
                    : 'bg-[#071009] text-[#A9B4AA] hover:text-white border border-white/5 hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isTrigger ? 'check_circle' : 'add_circle'}
                </span>
                <span>{al.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEARCH & FILTER TABS BAR ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1610]/65 backdrop-blur-xl border border-white/10">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-[#071009] p-1 rounded-xl border border-white/10 overflow-x-auto w-full md:w-auto scroll-thin">
          {[
            { id: 'ALL', label: 'All Hazards (10)' },
            { id: 'BIG_9', label: 'US Big 9 Mandatory' },
            { id: 'EU_14', label: 'EU 14 Regulations' },
            { id: 'MY_TRIGGERS', label: `My Triggers (${myTriggers.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-[#C8FF4D] text-black font-extrabold shadow-sm'
                  : 'text-[#A9B4AA] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Real-time Alias & Substance Search */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#A9B4AA]">
            search
          </span>
          <input
            type="text"
            placeholder="Search allergen, alias, or E-number..."
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

      {/* ── BENTO MATRIX: Clinical Allergen Hazard Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCatalog.map(item => {
          const isTrigger = myTriggers.includes(item.id);
          const isDetectedInActive = activeDetectedAllergens.some(
            a => a.allergenName?.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
          );

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-5 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden ${
                isDetectedInActive
                  ? 'bg-[#2E1212]/80 border-[#FF5252]/60 shadow-[0_0_25px_rgba(255,82,82,0.2)]'
                  : isTrigger
                  ? 'bg-[#1C1610]/80 border-[#FFB86B]/40 hover:border-[#FFB86B]/70'
                  : 'bg-[#0D1610]/75 border-[#8BE28B]/25 hover:border-[#8BE28B]/50 hover:-translate-y-1'
              }`}
            >
              <div>
                {/* Card Header: Icon + Category + Severity */}
                <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.severity === 'CRITICAL_ANAPHYLAXIS'
                        ? 'bg-[#2E1212] text-[#FF5252] border border-[#FF5252]/30'
                        : 'bg-[#142618] text-[#8BE28B] border border-[#8BE28B]/30'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#C8FF4D] transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[10px] font-mono text-[#A9B4AA]">{item.category}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-1">
                    {isDetectedInActive && (
                      <span className="px-2 py-0.5 rounded bg-[#FF5252] text-white font-extrabold text-[9px] uppercase tracking-wider animate-pulse">
                        FLAGGED IN SCAN
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      item.severity === 'CRITICAL_ANAPHYLAXIS'
                        ? 'bg-[#331414] text-[#FFB4AB] border border-[#FF5252]/30'
                        : 'bg-[#142618] text-[#8BE28B] border border-[#8BE28B]/30'
                    }`}>
                      {item.severity.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Molecular Aliases Chips */}
                <div className="my-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider block">
                    Common Molecular Aliases & Hidden Sources:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.commonAliases.map((alias, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-[#071009] border border-white/10 text-[#C8FF4D] text-[11px] font-mono font-medium"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cross Contact & Clinical Presentation */}
                <div className="space-y-2 text-xs py-2 border-t border-white/5">
                  <div className="flex items-start gap-1.5 text-[#A9B4AA]">
                    <span className="material-symbols-outlined text-[15px] text-[#FFB86B] shrink-0 mt-0.5">
                      factory
                    </span>
                    <span className="text-[11px] leading-tight">
                      <strong className="text-white">Facility Risk:</strong> {item.crossContactRisk}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-[#A9B4AA]">
                    <span className="material-symbols-outlined text-[15px] text-[#FF5252] shrink-0 mt-0.5">
                      medical_services
                    </span>
                    <span className="text-[11px] leading-tight">
                      <strong className="text-white">Clinical Symptoms:</strong> {item.symptoms.join(' • ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Regulatory Citation & Inspect Action */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                <span className="text-[9px] font-mono text-[#6F7A70] truncate max-w-[170px]" title={item.regulatoryMandate}>
                  {item.regulatoryMandate}
                </span>

                <button
                  onClick={() => setSelectedAllergen(item)}
                  className="px-3 py-1 rounded-xl bg-[#142618] hover:bg-[#1a3320] text-[#8BE28B] text-xs font-bold border border-[#8BE28B]/30 transition-all flex items-center gap-1"
                >
                  <span>Details</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedAllergen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-[#0D1610] border border-[#8BE28B]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#142618] text-[#C8FF4D] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">{selectedAllergen.icon}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedAllergen.name}</h3>
                  <span className="text-xs text-[#8BE28B] font-mono">{selectedAllergen.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAllergen(null)}
                className="w-8 h-8 rounded-full bg-[#101A13] text-[#A9B4AA] hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#A9B4AA] uppercase text-[10px] block mb-1">Global Prevalence:</span>
                <p className="text-white bg-[#071009] p-2.5 rounded-xl border border-white/5">{selectedAllergen.prevalence}</p>
              </div>

              <div>
                <span className="font-bold text-[#A9B4AA] uppercase text-[10px] block mb-1">Common Masked Food Carriers:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAllergen.commonProducts.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#142618] text-[#8BE28B] font-semibold text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-[#A9B4AA] uppercase text-[10px] block mb-1">Statutory Mandatory Directive:</span>
                <p className="text-[#C8FF4D] bg-[#071009] p-2.5 rounded-xl border border-white/5 font-mono text-[11px]">
                  {selectedAllergen.regulatoryMandate}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedAllergen(null)}
              className="w-full py-2.5 rounded-xl bg-[#C8FF4D] text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition-all"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
