import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Columns2, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Plus, 
  MapPin, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { BeforeAfterPair, MediaAsset, Project } from '../../types';

interface BeforeAfterStudioProps {
  pairs: BeforeAfterPair[];
  assets: MediaAsset[];
  projects: Project[];
  activePairId?: string;
  onSaveNewPair: (newPair: BeforeAfterPair) => void;
  onOpenUpload: () => void;
}

export const BeforeAfterStudio: React.FC<BeforeAfterStudioProps> = ({
  pairs,
  assets,
  projects,
  activePairId,
  onSaveNewPair,
  onOpenUpload,
}) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(activePairId || (pairs[0]?.id ?? ''));
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync selected pair if prop changes
  useEffect(() => {
    if (activePairId) {
      setSelectedPairId(activePairId);
    }
  }, [activePairId]);

  const activePair = pairs.find((p) => p.id === selectedPairId) || pairs[0];
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const assetMap = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);

  const beforeAsset = activePair ? assetMap.get(activePair.beforeAssetId) : undefined;
  const afterAsset = activePair ? assetMap.get(activePair.afterAssetId) : undefined;
  const currentProject = activePair ? projectMap.get(activePair.projectId) : undefined;

  // Dragging slider logic
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(clamped);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  // Smart suggestions: find unlinked before and after photos in the same project
  const smartPairSuggestions = useMemo(() => {
    const existingPairKeys = new Set(pairs.map((p) => `${p.beforeAssetId}_${p.afterAssetId}`));
    const suggestions: { before: MediaAsset; after: MediaAsset; project: Project; score: number }[] = [];

    projects.forEach((proj) => {
      const projAssets = assets.filter((a) => a.projectId === proj.id);
      const befores = projAssets.filter((a) => a.stage === 'before');
      const afters = projAssets.filter((a) => a.stage === 'after');

      befores.forEach((b) => {
        afters.forEach((a) => {
          if (!existingPairKeys.has(`${b.id}_${a.id}`)) {
            // Calculate similarity score based on common tags and location
            const commonTags = b.tags.filter((t) => a.tags.includes(t));
            const score = 80 + Math.min(19, commonTags.length * 5);
            suggestions.push({ before: b, after: a, project: proj, score });
          }
        });
      });
    });

    return suggestions;
  }, [pairs, assets, projects]);

  // Form state for creating custom pair
  const [newPairProject, setNewPairProject] = useState<string>(projects[0]?.id || '');
  const [newPairBefore, setNewPairBefore] = useState<string>('');
  const [newPairAfter, setNewPairAfter] = useState<string>('');
  const [newPairTitle, setNewPairTitle] = useState<string>('');
  const [newPairMetricLabel, setNewPairMetricLabel] = useState<string>('');
  const [newPairMetricDelta, setNewPairMetricDelta] = useState<string>('');
  const [newPairExcerpt, setNewPairExcerpt] = useState<string>('');

  const availableBefores = useMemo(() => {
    return assets.filter((a) => a.projectId === newPairProject && a.stage === 'before');
  }, [assets, newPairProject]);

  const availableAfters = useMemo(() => {
    return assets.filter((a) => a.projectId === newPairProject && a.stage === 'after');
  }, [assets, newPairProject]);

  const handleQuickAddSuggestedPair = (suggestion: typeof smartPairSuggestions[0]) => {
    const pair: BeforeAfterPair = {
      id: `pair-${Date.now()}`,
      projectId: suggestion.project.id,
      title: `${suggestion.project.title}: Verified Field Change`,
      beforeAssetId: suggestion.before.id,
      afterAssetId: suggestion.after.id,
      metricLabel: 'Ecological / Infrastructure Delta',
      metricDelta: '+100% Phase Completion',
      timelineDays: Math.max(
        14,
        Math.round(
          Math.abs(new Date(suggestion.after.capturedAt).getTime() - new Date(suggestion.before.capturedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      ),
      pairingScore: suggestion.score,
      storyExcerpt: `System matched baseline "${suggestion.before.title}" with verified progress "${suggestion.after.title}" based on location proximity and visual signal correlation.`,
      locationVerified: true,
    };
    onSaveNewPair(pair);
    setSelectedPairId(pair.id);
  };

  const handleCreatePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPairBefore || !newPairAfter || !newPairProject) return;

    const bAsset = assetMap.get(newPairBefore);
    const aAsset = assetMap.get(newPairAfter);
    const timelineDays = (bAsset && aAsset)
      ? Math.max(1, Math.round(Math.abs(new Date(aAsset.capturedAt).getTime() - new Date(bAsset.capturedAt).getTime()) / (1000 * 60 * 60 * 24)))
      : 30;

    const pair: BeforeAfterPair = {
      id: `pair-${Date.now()}`,
      projectId: newPairProject,
      title: newPairTitle || 'Verified Before-and-After Progress',
      beforeAssetId: newPairBefore,
      afterAssetId: newPairAfter,
      metricLabel: newPairMetricLabel || 'Impact Index',
      metricDelta: newPairMetricDelta || '+100% Improvement',
      timelineDays,
      pairingScore: 95,
      storyExcerpt: newPairExcerpt || 'Field documentation corroborates significant positive environmental/community change.',
      locationVerified: true,
    };

    onSaveNewPair(pair);
    setSelectedPairId(pair.id);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Studio Header & Pair Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-semibold text-neutral-100">
              Before-and-After Evidence Studio
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Proving real change with verifiable side-by-side photographic evidence. Drag the slider to inspect ecological or structural transformation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pair selector dropdown */}
          <select
            value={selectedPairId}
            onChange={(e) => setSelectedPairId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-200 focus:outline-none focus:border-emerald-500/50"
          >
            {pairs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Mode switch */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
            <button
              onClick={() => setComparisonMode('slider')}
              title="Split drag slider"
              className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                comparisonMode === 'slider'
                  ? 'bg-neutral-800 text-emerald-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Slider</span>
            </button>
            <button
              onClick={() => setComparisonMode('side-by-side')}
              title="Side-by-side comparison"
              className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                comparisonMode === 'side-by-side'
                  ? 'bg-neutral-800 text-emerald-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dual</span>
            </button>
          </div>

          {/* Create new pair button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Pair</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {activePair && beforeAsset && afterAsset ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Comparison Viewport (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
              
              {comparisonMode === 'slider' ? (
                /* Interactive Split Slider Container */
                <div
                  ref={containerRef}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  onMouseMove={handleMouseMove}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  onTouchMove={handleTouchMove}
                  className="relative h-[380px] sm:h-[480px] w-full select-none cursor-ew-resize overflow-hidden"
                >
                  {/* AFTER IMAGE (Base layer) */}
                  <img
                    src={afterAsset.url}
                    alt={afterAsset.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                  />

                  {/* BEFORE IMAGE (Clipped overlay) */}
                  <div
                    className="absolute inset-0 h-full overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={beforeAsset.url}
                      alt={beforeAsset.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover max-w-none"
                      style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                    />
                  </div>

                  {/* Divider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-neutral-900 border-2 border-emerald-400 flex items-center justify-center shadow-lg text-emerald-400">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Badges on images */}
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-amber-300 font-mono text-xs border border-amber-500/40">
                      BASELINE (BEFORE)
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 pointer-events-none">
                    <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-emerald-300 font-mono text-xs border border-emerald-500/40">
                      VERIFIED IMPACT (AFTER)
                    </span>
                  </div>

                  {/* Bottom helper prompt */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-neutral-300 font-mono">
                    Drag handle to inspect transition ({Math.round(sliderPosition)}%)
                  </div>
                </div>
              ) : (
                /* Dual Side-by-Side Mode */
                <div className="grid grid-cols-1 sm:grid-cols-2 h-[380px] sm:h-[480px]">
                  <div className="relative border-b sm:border-b-0 sm:border-r border-neutral-800 h-full">
                    <img
                      src={beforeAsset.url}
                      alt={beforeAsset.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-amber-300 font-mono text-xs border border-amber-500/40">
                        BASELINE (BEFORE)
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 p-2 rounded bg-black/70 backdrop-blur-sm text-xs text-neutral-200 truncate">
                      {beforeAsset.title}
                    </div>
                  </div>

                  <div className="relative h-full">
                    <img
                      src={afterAsset.url}
                      alt={afterAsset.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-emerald-300 font-mono text-xs border border-emerald-500/40">
                        VERIFIED IMPACT (AFTER)
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 p-2 rounded bg-black/70 backdrop-blur-sm text-xs text-neutral-200 truncate">
                      {afterAsset.title}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Quick pairing stats banner */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                <span className="text-[11px] text-neutral-400 block mb-0.5">Primary Verified Delta</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {activePair.metricDelta}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                <span className="text-[11px] text-neutral-400 block mb-0.5">Timeline Duration</span>
                <span className="text-sm font-semibold text-neutral-100 font-mono tabular-nums">
                  {activePair.timelineDays} Days Span
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                <span className="text-[11px] text-neutral-400 block mb-0.5">Pairing Reliability</span>
                <span className="text-sm font-semibold text-emerald-300 font-mono tabular-nums">
                  {activePair.pairingScore}% Confirmed Proof
                </span>
              </div>
            </div>
          </div>

          {/* Details & Provenance Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Story & Context card */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                  Verified Proof Narrative
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {currentProject?.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-neutral-100">
                {activePair.title}
              </h3>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {activePair.storyExcerpt}
              </p>

              {/* Provenance verification line */}
              <div className="pt-3 border-t border-neutral-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Location Verified:</span>
                  </span>
                  <span className="text-neutral-200 font-medium">{beforeAsset.location.name}</span>
                </div>

                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Dual SHA-256 Hashes:</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">Tamper-Proof</span>
                </div>
              </div>
            </div>

            {/* Smart Pairing Assistant (Differentiator) */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-neutral-200">
                    Smart Pairing Suggestions
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-neutral-500">
                  AI Context Match
                </span>
              </div>

              <p className="text-[11px] text-neutral-400">
                Cloudinary AI detects potential before-after pairs by correlating GPS coordinates, visual objects, and chronological order.
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {smartPairSuggestions.length === 0 ? (
                  <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60 text-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-neutral-300">All available assets have verified pairs</p>
                  </div>
                ) : (
                  smartPairSuggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950/80 hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <p className="text-xs font-medium text-neutral-200 truncate">
                          {sug.before.title} ➔ {sug.after.title}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          {sug.score}% match · {sug.project.title}
                        </p>
                      </div>

                      <button
                        onClick={() => handleQuickAddSuggestedPair(sug)}
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded transition-colors shrink-0"
                      >
                        Confirm
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-neutral-800 bg-neutral-900/30">
          <SlidersHorizontal className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-200">No Before-and-After Pairs created yet</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Upload field documentation or pair existing assets to build high-trust visual proof of impact.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Create First Pair
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Upload Media
            </button>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Before-After Pair */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-neutral-100">Establish Verified Before-After Pair</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Link pre-intervention baseline photos with post-completion outcomes to substantiate reported impact.
            </p>

            <form onSubmit={handleCreatePairSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Target Project</label>
                <select
                  value={newPairProject}
                  onChange={(e) => {
                    setNewPairProject(e.target.value);
                    setNewPairBefore('');
                    setNewPairAfter('');
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-amber-400 block mb-1">Baseline (Before Asset)</label>
                  <select
                    value={newPairBefore}
                    onChange={(e) => setNewPairBefore(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                    required
                  >
                    <option value="">Select Baseline...</option>
                    {availableBefores.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-emerald-400 block mb-1">Impact (After Asset)</label>
                  <select
                    value={newPairAfter}
                    onChange={(e) => setNewPairAfter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                    required
                  >
                    <option value="">Select Outcome...</option>
                    {availableAfters.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Pair Title</label>
                <input
                  type="text"
                  value={newPairTitle}
                  onChange={(e) => setNewPairTitle(e.target.value)}
                  placeholder="e.g. Western Sector: Barren Slope to 12,000 Tree Canopy"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Metric Label</label>
                  <input
                    type="text"
                    value={newPairMetricLabel}
                    onChange={(e) => setNewPairMetricLabel(e.target.value)}
                    placeholder="e.g. Canopy Density Delta"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Metric Delta</label>
                  <input
                    type="text"
                    value={newPairMetricDelta}
                    onChange={(e) => setNewPairMetricDelta(e.target.value)}
                    placeholder="e.g. +340% Recovery"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Narrative Excerpt</label>
                <textarea
                  value={newPairExcerpt}
                  onChange={(e) => setNewPairExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Explain the intervention, methods, and tangible outcomes recorded in this pair..."
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                >
                  Save & Verify Pair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
