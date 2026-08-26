import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Sparkles, Copy, Check, Download, History, 
  Target, Shield, HelpCircle, AlertCircle, RefreshCw, 
  TrendingUp, Award, Layers, Compass, ExternalLink, 
  BookOpen, Eye, Lightbulb, UserCheck, MessageSquare, Clipboard
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const API_BASE_URL = 'http://localhost:5002/api';

function App() {
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [researchData, setResearchData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [copiedText, setCopiedText] = useState('');
  
  // History of searched brands
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('pitchpal_research_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadingSteps = [
    "Scraping search engines for brand positioning...",
    "Retrieving product catalog & price points...",
    "Analyzing competitor gaps & target audience psychographics...",
    "Synthesizing messaging pillars & creator opportunities...",
    "Generating hook banks & visual storyboard directions..."
  ];

  // Rotate loading steps every 2 seconds during fetch
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('pitchpal_research_history', JSON.stringify(history));
  }, [history]);

  const handleResearch = async (e) => {
    if (e) e.preventDefault();
    if (!brandName.trim()) return;

    setLoading(true);
    setLoadingStep(0);
    setResearchData(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/research`, {
        brandName: brandName.trim()
      });

      const newData = response.data;
      setResearchData(newData);
      
      // Update history (avoid duplicates, keep limit of 10)
      setHistory(prev => {
        const filtered = prev.filter(item => item.brand.toLowerCase() !== brandName.trim().toLowerCase());
        return [{ brand: brandName.trim(), timestamp: new Date().toLocaleDateString(), data: newData }, ...filtered].slice(0, 10);
      });

    } catch (error) {
      console.error("Research failed:", error);
      alert(error.response?.data?.error || "Failed to research brand. Make sure the backend server is running on port 5002.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setResearchData(item.data);
    setBrandName(item.brand);
  };

  const copyToClipboard = (text, identifier) => {
    navigator.clipboard.writeText(text);
    setCopiedText(identifier);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const exportPDF = () => {
    if (!researchData) return;
    const doc = new jsPDF();
    const brand = brandName.toUpperCase();
    
    // Page Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`PITCHPAL BRAND RESEARCH REPORT: ${brand}`, 20, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Powered by PitchPal AI`, 20, 26);
    doc.line(20, 29, 190, 29);
    
    let y = 36;
    const addSectionHeader = (title) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229); // Indigo color
      doc.text(title, 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
    };

    const addKeyValue = (key, value) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(key + ":", 20, y);
      
      const splitValue = doc.splitTextToSize(String(value), 125);
      doc.setFont("helvetica", "normal");
      doc.text(splitValue, 65, y);
      y += (splitValue.length * 5) + 3;
    };

    // 1. Profile
    addSectionHeader("1. BRAND PROFILE");
    addKeyValue("Purpose", researchData.researchPurpose);
    addKeyValue("Category", researchData.category);
    addKeyValue("Market Scope", researchData.market);
    addKeyValue("standsFor", researchData.brandSnapshot?.standsFor);
    addKeyValue("Personality", researchData.brandSnapshot?.personality);
    addKeyValue("Tone of Voice", researchData.brandSnapshot?.toneOfVoice);
    addKeyValue("Promise", researchData.brandSnapshot?.brandPromise);

    // 2. Audience
    addSectionHeader("2. TARGET AUDIENCE & NEEDS");
    addKeyValue("Primary TG", researchData.targetAudience?.primaryTG);
    addKeyValue("Secondary TG", researchData.targetAudience?.secondaryTG);
    addKeyValue("Psychographics", researchData.targetAudience?.psychographics);
    addKeyValue("Functional Need", researchData.audienceNeed?.functionalNeed);
    addKeyValue("Emotional Need", researchData.audienceNeed?.emotionalNeed);
    addKeyValue("Lifestyle Need", researchData.audienceNeed?.lifestyleNeed);
    addKeyValue("JTBD", researchData.audienceNeed?.jtbd);

    // 3. Products
    addSectionHeader("3. PRODUCT & PRICING CONTEXT");
    addKeyValue("Sells", researchData.productCategory?.currentlySells);
    addKeyValue("Price Context", researchData.productCategory?.priceContext);
    addKeyValue("Hero Example", researchData.productFeatures?.heroExample);
    addKeyValue("Hero Cues", researchData.productFeatures?.commonHeroCues);

    // 4. Marketing Strategy
    addSectionHeader("4. COMPETITIVE STRATEGY");
    addKeyValue("Competitors", researchData.competitiveContext);
    addKeyValue("Content Gaps", researchData.brandContentGap);
    addKeyValue("One Thing", researchData.oneThingToRemember);
    addKeyValue("Primary Objective", researchData.contentObjective?.primary);
    addKeyValue("Secondary Objective", researchData.contentObjective?.secondary);
    addKeyValue("KPIs", researchData.contentObjective?.possibleKpi);

    // 5. Creator Assets
    addSectionHeader("5. CREATOR HOOKS & UGC ANGLES");
    addKeyValue("Opportunity", researchData.creatorOpportunity);
    addKeyValue("Visual Direction", researchData.visualStoryboardDirection);
    
    if (researchData.previousHookBank) {
      addKeyValue("Hook Bank", researchData.previousHookBank.map((h, i) => `\n${i+1}. "${h}"`).join(""));
    }
    if (researchData.previousReelUgcAngles) {
      addKeyValue("UGC Angles", researchData.previousReelUgcAngles.map((a, i) => `\n${i+1}. ${a}`).join(""));
    }
    if (researchData.previousCta) {
      addKeyValue("CTA Bank", researchData.previousCta.map((c, i) => `\n${i+1}. ${c}`).join(""));
    }

    doc.save(`PitchPal_Research_${brandName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            PP
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              PitchPal <span className="text-indigo-400 font-semibold text-sm px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Brand Researcher</span>
            </h1>
            <p className="text-xs text-slate-400">Deep brand intelligence derived in seconds</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {researchData && (
            <button 
              onClick={exportPDF}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg shadow-indigo-500/20"
            >
              <Download size={16} />
              Export Report PDF
            </button>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for Search History */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/30 p-5 flex flex-col gap-4 hidden lg:flex">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
            <History size={16} className="text-indigo-400" />
            <span>Search History</span>
          </div>
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 gap-2 border border-dashed border-slate-800 rounded-xl p-4">
              <History size={28} className="stroke-1 opacity-60" />
              <p className="text-xs">No brand research generated yet. Search for a brand to begin.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
                >
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 text-sm truncate">{item.brand}</p>
                    <p className="text-[10px] text-slate-500">{item.timestamp} | {item.data.category}</p>
                  </div>
                  <TrendingUp size={14} className="text-slate-600 group-hover:text-indigo-400 transition" />
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-8">
          {/* Brand Search Input Banner */}
          <section className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 lg:p-8 shadow-xl">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="text-indigo-400 animate-pulse" size={24} />
                Automated Creator Research Assistant
              </h2>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Enter any brand name (e.g. Rare Beauty, Boat Lifestyle, Mamaearth, Dyson). The AI will query the web for real, current data, analyze its target audience, price matrix, USP features, and synthesize a complete PitchPal strategy report.
              </p>
              
              <form onSubmit={handleResearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter brand name (e.g., Rare Beauty, The Ordinary, Boat)..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !brandName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 active:scale-98 transition px-6 rounded-xl font-semibold text-sm flex items-center gap-2 text-white shadow-lg shadow-indigo-600/10"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Researching...
                    </>
                  ) : (
                    <>
                      <span>Go</span>
                      <Sparkles size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Loading Animation */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-5 border border-slate-800/80 bg-slate-900/10 rounded-2xl">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <Sparkles className="absolute text-indigo-400 animate-bounce" size={24} />
              </div>
              <div className="text-center space-y-1 max-w-sm px-4">
                <p className="font-semibold text-slate-200 text-sm animate-pulse">{loadingSteps[loadingStep]}</p>
                <p className="text-xs text-slate-500">This takes about 5 to 10 seconds to scrape Google index and formulate strategy pillars...</p>
              </div>
            </div>
          )}

          {/* Research Results Dashboard */}
          {!loading && researchData && (
            <div className="flex-1 flex flex-col gap-6">
              {/* Brand Summary Row */}
              <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{brandName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span>{researchData.category}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span>Market: {researchData.market}</span>
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-300 bg-slate-950 px-4 py-2 border border-slate-800/80 rounded-lg max-w-md italic font-light">
                  &ldquo;{researchData.researchPurpose}&rdquo;
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="border-b border-slate-800 flex overflow-x-auto gap-2 scrollbar-none">
                {[
                  { id: 'profile', label: 'Brand Snapshot', icon: Compass },
                  { id: 'audience', label: 'Audience & Need', icon: UserCheck },
                  { id: 'products', label: 'Products & Benefits', icon: Layers },
                  { id: 'strategy', label: 'Marketing Strategy', icon: BookOpen }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                        activeTab === tab.id 
                          ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                          : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/30'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-6 lg:p-8">
                {/* 1. Brand Snapshot */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">What the Brand Stands For</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.brandSnapshot?.standsFor}</p>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Brand Promise</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.brandSnapshot?.brandPromise}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Brand Personality</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.brandSnapshot?.personality}</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Tone of Voice</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.brandSnapshot?.toneOfVoice}</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Visual Personality</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.brandSnapshot?.visualPersonality}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Audience & Need */}
                {activeTab === 'audience' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Target Groups</h4>
                        <div className="space-y-2 text-sm text-slate-300">
                          <p><strong className="text-slate-200 font-medium">Primary Audience:</strong> {researchData.targetAudience?.primaryTG}</p>
                          <p><strong className="text-slate-200 font-medium">Secondary Audience:</strong> {researchData.targetAudience?.secondaryTG}</p>
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Audience Psychographics</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.targetAudience?.psychographics}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                        <h5 className="font-semibold text-indigo-300 text-xs uppercase tracking-wider">Functional Need</h5>
                        <p className="text-slate-300 text-xs leading-relaxed">{researchData.audienceNeed?.functionalNeed}</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                        <h5 className="font-semibold text-indigo-300 text-xs uppercase tracking-wider">Emotional Need</h5>
                        <p className="text-slate-300 text-xs leading-relaxed">{researchData.audienceNeed?.emotionalNeed}</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                        <h5 className="font-semibold text-indigo-300 text-xs uppercase tracking-wider">Lifestyle Need</h5>
                        <p className="text-slate-300 text-xs leading-relaxed">{researchData.audienceNeed?.lifestyleNeed}</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                        <h5 className="font-semibold text-indigo-300 text-xs uppercase tracking-wider">Job To Be Done (JTBD)</h5>
                        <p className="text-slate-300 text-xs leading-relaxed font-light italic">&ldquo;{researchData.audienceNeed?.jtbd}&rdquo;</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Audience Behaviour</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.audienceBehaviour?.typicalBehaviours}</p>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Content Behavior</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.audienceBehaviour?.contentBehaviour}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Products & Benefits */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Product Portfolio</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.productCategory?.currentlySells}</p>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Price Matrix Context</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.productCategory?.priceContext}</p>
                      </div>
                    </div>

                    {/* Hero Product Highlight */}
                    <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-xl p-5 flex flex-col md:flex-row gap-5">
                      <div className="md:w-1/3 flex flex-col justify-center">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Hero Showcase Product</span>
                        <h4 className="text-lg font-bold text-white mb-2">{researchData.productFeatures?.heroExample?.split(':')[0] || 'Key Hero Product'}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {researchData.productFeatures?.heroExample?.split(':').slice(1).join(':').trim() || researchData.productFeatures?.heroExample}
                        </p>
                      </div>
                      <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 flex flex-col justify-center">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2">Common Hero Functional Cues</span>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.productFeatures?.commonHeroCues}</p>
                      </div>
                    </div>

                    {/* Features to Benefits Table */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
                      <div className="bg-slate-850 px-5 py-3.5 border-b border-slate-800 flex justify-between">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Features &rarr; Customer Benefits</h4>
                      </div>
                      <div className="divide-y divide-slate-850">
                        {researchData.featuresToBenefits?.map((item, idx) => (
                          <div key={idx} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm hover:bg-slate-900/20 transition">
                            <div>
                              <span className="text-xs text-slate-500 font-mono mr-2">F{idx+1}</span>
                              <strong className="font-semibold text-slate-200">{item.feature}</strong>
                            </div>
                            <div className="text-slate-300 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                              <span className="text-indigo-400 font-semibold md:hidden">Benefit: </span>
                              {item.benefit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Marketing Strategy */}
                {activeTab === 'strategy' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Competitive Context</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.competitiveContext}</p>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Brand Content Gap</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.brandContentGap}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-950/20 to-purple-950/20 border border-slate-800/80 rounded-xl p-5">
                      <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400 mb-3">Audience Mental Objective</h4>
                      <p className="text-slate-200 font-medium text-base text-center py-2 italic font-serif leading-relaxed">
                        &ldquo;{researchData.oneThingToRemember}&rdquo;
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Primary Objective</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.contentObjective?.primary}</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Secondary Objective</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.contentObjective?.secondary}</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl space-y-2">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Possible KPIs</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{researchData.contentObjective?.possibleKpi}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Pain Points</h4>
                        <div className="space-y-2 text-sm text-slate-300">
                          <p><strong className="text-slate-200 font-medium">Product Pains:</strong> {researchData.painPoints?.productPainPoints}</p>
                          <p><strong className="text-slate-200 font-medium">Buying Pains:</strong> {researchData.painPoints?.buyingPainPoints}</p>
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl space-y-3">
                        <h4 className="font-semibold text-slate-200 text-sm uppercase tracking-wider text-indigo-400">Purchase Motivation</h4>
                        <div className="space-y-2 text-sm text-slate-300">
                          <p><strong className="text-slate-200 font-medium">Primary Motivation:</strong> {researchData.purchaseMotivation?.primary}</p>
                          <p><strong className="text-slate-200 font-medium">Psychological Trigger:</strong> {researchData.purchaseMotivation?.keyTrigger}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


              </div>
            </div>
          )}

          {/* Quick Start Hints */}
          {!loading && !researchData && (
            <section className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 max-w-2xl mx-auto text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Search size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 text-base">Begin Brand Intelligence Research</h3>
                <p className="text-sm">
                  Write the name of any active business or consumer product above. We support global conglomerates (e.g. Nike, Sephora) as well as localized startups (e.g. Boat Lifestyle, Lenskart).
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-500">Try searching:</span>
                {["Rare Beauty", "Mamaearth", "Boat Lifestyle", "The Ordinary", "Dyson"].map(example => (
                  <button
                    key={example}
                    onClick={() => {
                      setBrandName(example);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {example} &rarr;
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
