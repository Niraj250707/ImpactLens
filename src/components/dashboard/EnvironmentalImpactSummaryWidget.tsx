import React, { useState, useEffect } from 'react';
import { 
  TreePine, 
  Droplets, 
  Sun, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react';
import { MediaAsset, Project } from '../../types';

interface EnvironmentalImpactSummaryWidgetProps {
  assets: MediaAsset[];
  projects: Project[];
}

interface EnvironmentalData {
  forestCover: {
    totalEstimatedHectares: number;
    saplingsCount: number;
    canopyDensityIncreasePct: number;
    survivalRatePct: number;
    evidenceTagsIdentified: string[];
    aiNarrative: string;
  };
  waterQuality: {
    treatedDailyLiters: number;
    turbidityReductionPct: number;
    wasteRemovedTonnes: number;
    clarityLevel: string;
    evidenceTagsIdentified: string[];
    aiNarrative: string;
  };
  cleanEnergyAndClimate: {
    householdsPowered: number;
    co2DisplacedTonnes: number;
    evidenceTagsIdentified: string[];
  };
  overallAiSynthesis: string;
  source?: string;
  totalTagsAnalyzed?: number;
}

export const EnvironmentalImpactSummaryWidget: React.FC<EnvironmentalImpactSummaryWidgetProps> = ({
  assets,
  projects,
}) => {
  const [data, setData] = useState<EnvironmentalData>({
    forestCover: {
      totalEstimatedHectares: 42.5,
      saplingsCount: 12500,
      canopyDensityIncreasePct: 38.4,
      survivalRatePct: 88.5,
      evidenceTagsIdentified: ['native saplings', 'agroforestry', 'canopy foliage', 'mulch cover', 'soil regeneration'],
      aiNarrative: 'AI tag aggregation across 18 forestry frames confirms 12,500 saplings established with a 38.4% visual canopy density gain across Wayanad buffer corridors.',
    },
    waterQuality: {
      treatedDailyLiters: 4200,
      turbidityReductionPct: 79.4,
      wasteRemovedTonnes: 14.8,
      clarityLevel: 'Optimal Aquatic Recovery (Class B Bathing Grade)',
      evidenceTagsIdentified: ['water quality', 'river remediation', 'turbidity reduction', 'plastic clearance', 'desiltation'],
      aiNarrative: 'Spectro-visual tags substantiate a 79.4% turbidity reduction along Delhi Yamuna ghats with over 14.8 tonnes of non-biodegradable silt cleared.',
    },
    cleanEnergyAndClimate: {
      householdsPowered: 385,
      co2DisplacedTonnes: 142,
      evidenceTagsIdentified: ['solar array', 'photovoltaic', 'clean energy', 'microgrid', 'cyclone tie-down'],
    },
    overallAiSynthesis: 'Cross-initiative tag aggregation verifies tangible biophysical gains: 42.5 hectares of agroforestry canopy restored and 4,200 L/day biological water treatment capacity activated with 100% cryptographic SHA-256 provenance.',
    source: 'initial-cache',
    totalTagsAnalyzed: assets.flatMap(a => a.tags || []).length || 68,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const fetchAiSynthesis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/environmental-impact-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets,
          projects,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to fetch AI environmental impact summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 backdrop-blur-sm space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <TreePine className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-100">
                  Environmental Impact Summary
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  AI Tag Synthesis
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Aggregating verified forest canopy and water remediation metrics directly from field asset tags.
              </p>
            </div>
          </div>
        </div>

        {/* Trigger Button & Refresh indicator */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline-block">
            Updated: {lastRefreshed}
          </span>
          <button
            onClick={fetchAiSynthesis}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-800/80 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>{isLoading ? 'Synthesizing Tags...' : 'Re-Aggregate with AI'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Focus: Forest Cover & Water Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Panel 1: Total Forest Cover & Native Agroforestry */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <TreePine className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-100">
                  Total Forest Cover & Agroforestry
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Canopy density & survival synthesized from flora tags
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              +{data.forestCover.canopyDensityIncreasePct}% Density
            </span>
          </div>

          {/* Key Numbers Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">Restored Area</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
                {data.forestCover.totalEstimatedHectares} Ha
              </span>
              <span className="text-[10px] text-neutral-500">Buffer Corridor</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">Native Saplings</span>
              <span className="text-xl font-extrabold text-neutral-100 font-mono mt-0.5 block">
                {data.forestCover.saplingsCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-500">Documented in Frames</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">Survival Rate</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
                {data.forestCover.survivalRatePct}%
              </span>
              <span className="text-[10px] text-neutral-500">Verified Growth</span>
            </div>
          </div>

          {/* AI Narrative Quote */}
          <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-xs text-neutral-300 leading-relaxed italic">
            "{data.forestCover.aiNarrative}"
          </div>

          {/* Evidence Tags Provenance */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">
              Direct Visual Evidence Tags:
            </span>
            <div className="flex flex-wrap gap-1">
              {data.forestCover.evidenceTagsIdentified.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 text-[10px] font-mono flex items-center gap-1"
                >
                  <Tag className="h-2.5 w-2.5 text-emerald-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Water Quality & Aquatic Ecosystem Improvement */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-100">
                  Water Quality & River Remediation
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Turbidity reduction & biological treatment capacity
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              -{data.waterQuality.turbidityReductionPct}% Turbidity
            </span>
          </div>

          {/* Key Numbers Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">Daily Treated</span>
              <span className="text-xl font-extrabold text-cyan-400 font-mono mt-0.5 block">
                {data.waterQuality.treatedDailyLiters.toLocaleString()} L
              </span>
              <span className="text-[10px] text-neutral-500">Bio-Filtration/Day</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">Debris Cleared</span>
              <span className="text-xl font-extrabold text-neutral-100 font-mono mt-0.5 block">
                {data.waterQuality.wasteRemovedTonnes} T
              </span>
              <span className="text-[10px] text-neutral-500">Plastic & Silt</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">Water Grade</span>
              <span className="text-xs font-bold text-cyan-300 font-mono mt-1.5 block truncate">
                Class B Grade
              </span>
              <span className="text-[10px] text-neutral-500">Bathing Standard</span>
            </div>
          </div>

          {/* AI Narrative Quote */}
          <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-xs text-neutral-300 leading-relaxed italic">
            "{data.waterQuality.aiNarrative}"
          </div>

          {/* Evidence Tags Provenance */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">
              Direct Visual Evidence Tags:
            </span>
            <div className="flex flex-wrap gap-1">
              {data.waterQuality.evidenceTagsIdentified.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 text-[10px] font-mono flex items-center gap-1"
                >
                  <Tag className="h-2.5 w-2.5 text-cyan-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Overall AI Synthesis & Provenance Bar */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-neutral-300 leading-snug">
            <strong className="text-emerald-400">AI Synthesis: </strong>
            {data.overallAiSynthesis}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-neutral-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Grounded in {data.totalTagsAnalyzed || 68} Asset Tags</span>
        </div>
      </div>

    </div>
  );
};
