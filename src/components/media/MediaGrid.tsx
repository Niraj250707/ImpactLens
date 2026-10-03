import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Layers, 
  Eye, 
  CheckSquare, 
  Square, 
  FileCheck, 
  Loader2, 
  X, 
  BadgeCheck, 
  CheckCircle2,
  SlidersHorizontal,
  ArrowLeftRight
} from 'lucide-react';
import { MediaAsset, Project } from '../../types';
import { filterMediaAssets, parseNaturalLanguageQuery, queryGeminiSemanticSearch, SemanticSearchResult } from '../../services/searchService';
import { recalculateAndVerifyAssetIntegrity } from '../../services/cloudinaryService';
import { MediaDetailModal } from './MediaDetailModal';
import { BulkVerificationModal } from './BulkVerificationModal';
import { SplitScreenComparisonModal } from './SplitScreenComparisonModal';

interface MediaGridProps {
  assets: MediaAsset[];
  projects: Project[];
  selectedProjectId?: string;
  onCompareWithThis?: (assetId: string) => void;
  onUpdateAssets?: (updatedAssets: MediaAsset[]) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  assets,
  projects,
  selectedProjectId,
  onCompareWithThis,
  onUpdateAssets,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>(selectedProjectId || 'all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedAssetForModal, setSelectedAssetForModal] = useState<MediaAsset | null>(null);

  // Split-Screen Arbitrary Photo Comparison State
  const [comparisonAssets, setComparisonAssets] = useState<MediaAsset[]>([]);
  const [showSplitComparisonModal, setShowSplitComparisonModal] = useState(false);

  // Gemini Semantic Search State
  const [isGeminiSearching, setIsGeminiSearching] = useState(false);
  const [geminiResult, setGeminiResult] = useState<SemanticSearchResult | null>(null);

  // Bulk Verification State
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [showBulkVerificationModal, setShowBulkVerificationModal] = useState(false);

  // Quick preset queries for AI semantic discovery
  const sampleQueries = [
    'river cleaning projects from last quarter',
    'find river cleaning projects near mountain areas from last quarter',
    'native tree saplings in degraded high ranges',
    'school renovation with STEM robotics kits',
    'solar microgrid powering island households',
  ];

  const handleRunGeminiSemanticSearch = async (queryToRun: string) => {
    const q = queryToRun.trim();
    if (!q) return;

    setSearchInput(q);
    setIsGeminiSearching(true);
    try {
      const res = await queryGeminiSemanticSearch(q, assets, projects);
      setGeminiResult(res);
    } catch (err) {
      console.error('Failed to run Gemini semantic search', err);
    } finally {
      setIsGeminiSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setGeminiResult(null);
  };

  // Base structured filtering
  const parsedNL = useMemo(() => {
    return parseNaturalLanguageQuery(searchInput);
  }, [searchInput]);

  const baseFilteredAssets = useMemo(() => {
    return filterMediaAssets(assets, projects, {
      searchTerm: geminiResult ? '' : (parsedNL.searchTerm || searchInput),
      projectId: selectedProject !== 'all' ? selectedProject : parsedNL.projectId,
      stage: selectedStage !== 'all' ? selectedStage : parsedNL.stage,
      category: parsedNL.category,
      startDate: parsedNL.startDate,
      endDate: parsedNL.endDate,
    });
  }, [assets, projects, searchInput, selectedProject, selectedStage, parsedNL, geminiResult]);

  // If Gemini search has returned ranked results, order by relevance score and attach reasoning
  const displayedAssets = useMemo(() => {
    if (!geminiResult || geminiResult.matches.length === 0) {
      return baseFilteredAssets;
    }

    const scoreMap = new Map(geminiResult.matches.map((m) => [m.assetId, m]));
    const matched: MediaAsset[] = [];
    const unmatched: MediaAsset[] = [];

    baseFilteredAssets.forEach((asset) => {
      const match = scoreMap.get(asset.id);
      if (match) {
        matched.push({
          ...asset,
          geminiMatchScore: match.relevanceScore,
          geminiReasoning: match.reasoning,
        });
      } else {
        unmatched.push(asset);
      }
    });

    matched.sort((a, b) => (b.geminiMatchScore || 0) - (a.geminiMatchScore || 0));
    return [...matched, ...unmatched];
  }, [baseFilteredAssets, geminiResult]);

  // Arbitrary Split-Screen Selection Handlers
  const handleToggleCompareSelection = (asset: MediaAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (comparisonAssets.some((a) => a.id === asset.id)) {
      setComparisonAssets(comparisonAssets.filter((a) => a.id !== asset.id));
    } else if (comparisonAssets.length === 0) {
      setComparisonAssets([asset]);
    } else {
      setComparisonAssets([comparisonAssets[0], asset]);
      setShowSplitComparisonModal(true);
    }
  };

  const handleOpenQuickSplitCompare = () => {
    const pool = displayedAssets.length >= 2 ? displayedAssets : assets;
    if (pool.length >= 2) {
      setComparisonAssets([pool[0], pool[1]]);
      setShowSplitComparisonModal(true);
    }
  };

  // Bulk Selection Handlers
  const toggleSelectAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedAssetIds(new Set(displayedAssets.map((a) => a.id)));
  };

  const [verificationToast, setVerificationToast] = useState<string | null>(null);
  const [isVerifyingSingleId, setIsVerifyingSingleId] = useState<string | null>(null);

  const handleDeselectAll = () => {
    setSelectedAssetIds(new Set());
  };

  const handleSelectUnverified = () => {
    const unverified = displayedAssets.filter((a) => !a.verifiedIntegrity).map((a) => a.id);
    setSelectedAssetIds(new Set(unverified));
  };

  const handleVerifyAllUnverified = () => {
    const unverified = displayedAssets.filter((a) => !a.verifiedIntegrity).map((a) => a.id);
    if (unverified.length > 0) {
      setSelectedAssetIds(new Set(unverified));
      setShowBulkVerificationModal(true);
    }
  };

  const handleVerifySingleAsset = async (asset: MediaAsset) => {
    setIsVerifyingSingleId(asset.id);
    try {
      const result = await recalculateAndVerifyAssetIntegrity(asset);
      if (result.isTamperProof) {
        handleVerificationComplete([asset.id]);
        setVerificationToast(`Calculated SHA-256 matched Cloudinary metadata for "${asset.title}". Applied 'Verified Integrity' badge.`);
      }
    } finally {
      setIsVerifyingSingleId(null);
    }
  };

  const handleVerificationComplete = (verifiedIds: string[]) => {
    const verifiedSet = new Set(verifiedIds);
    const now = new Date().toISOString();

    const updated = assets.map((a) => {
      if (verifiedSet.has(a.id)) {
        return {
          ...a,
          verifiedIntegrity: true,
          verifiedAt: now,
          trustPassport: {
            ...a.trustPassport,
            tamperProofStatus: 'verified' as const,
            auditChain: [
              ...a.trustPassport.auditChain,
              {
                timestamp: now,
                action: 'Cryptographic SHA-256 Recalculation & Cloudinary Metadata Cross-Reference: Verified Authentic',
                actor: 'ImpactLens M&E Verifier',
                hashProof: `sha256:${a.trustPassport.sha256Hash.substring(0, 12)}...`,
              },
            ],
          },
        };
      }
      return a;
    });

    if (onUpdateAssets) {
      onUpdateAssets(updated);
    }

    setVerificationToast(`Applied 'Verified Integrity' badge to ${verifiedIds.length} assets following SHA-256 Cloudinary verification.`);
    setSelectedAssetIds(new Set());
    setTimeout(() => {
      setVerificationToast(null);
    }, 4500);
  };

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'before': return 'text-amber-400 bg-amber-950/80 border-amber-800/80';
      case 'after': return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
      case 'during': return 'text-sky-400 bg-sky-950/80 border-sky-800/80';
      default: return 'text-neutral-400 bg-neutral-900 border-neutral-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Search & Filter Bar */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm space-y-3">
        
        {/* Search Row */}
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Natural Language Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunGeminiSemanticSearch(searchInput);
            }}
            className="relative flex-1"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search with Gemini AI (e.g. 'river cleaning projects from last quarter')..."
              className="w-full pl-10 pr-24 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />

            {/* Clear or Action button inside input */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-200"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isGeminiSearching || !searchInput.trim()}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded flex items-center gap-1 transition-colors"
              >
                {isGeminiSearching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>AI Search</span>
              </button>
            </div>
          </form>

          {/* Project Filter Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            {/* Stage filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
              <button
                onClick={() => setSelectedStage('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedStage === 'all'
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStage('before')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedStage === 'before'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setSelectedStage('during')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedStage === 'during'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                During
              </button>
              <button
                onClick={() => setSelectedStage('after')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedStage === 'after'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                After
              </button>
            </div>
          </div>
        </div>

        {/* Gemini Preset Query Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Try AI Queries:</span>
          </span>
          {sampleQueries.map((queryText, idx) => (
            <button
              key={idx}
              onClick={() => handleRunGeminiSemanticSearch(queryText)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-neutral-300 hover:text-emerald-300 transition-colors truncate max-w-[280px]"
            >
              "{queryText}"
            </button>
          ))}
        </div>

        {/* Gemini Interpretation Banner */}
        {geminiResult && (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-neutral-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-300">Gemini AI Semantic Analysis: </span>
                <span className="text-neutral-300">{geminiResult.interpretation}</span>
              </div>
            </div>

            <button
              onClick={handleClearSearch}
              className="text-neutral-400 hover:text-neutral-200 text-xs font-mono ml-3 shrink-0 underline"
            >
              Reset AI Search
            </button>
          </div>
        )}
      </div>

      {/* Verification Toast Alert */}
      {verificationToast && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-200 shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{verificationToast}</span>
          </div>
          <button
            onClick={() => setVerificationToast(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-mono ml-2 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Operations Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-900/40">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <button
            onClick={selectedAssetIds.size === displayedAssets.length ? handleDeselectAll : handleSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-neutral-100 transition-colors"
          >
            {selectedAssetIds.size === displayedAssets.length ? (
              <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Square className="h-3.5 w-3.5 text-neutral-500" />
            )}
            <span>Select All ({displayedAssets.length})</span>
          </button>

          <button
            onClick={handleSelectUnverified}
            className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Select Unverified ({displayedAssets.filter((a) => !a.verifiedIntegrity).length})
          </button>

          {selectedAssetIds.size > 0 && (
            <span className="font-mono text-emerald-400 pl-2">
              {selectedAssetIds.size} selected
            </span>
          )}
        </div>

        {/* Action Controls: Split-Screen Comparison & Bulk Verify */}
        <div className="flex items-center gap-2">
          {/* Quick Launch Split Screen Comparison */}
          <button
            onClick={handleOpenQuickSplitCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-800/80 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-semibold transition-colors shadow-sm"
            title="Select two photos from this collection and compare physical changes with a slider"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Split-Screen Comparison</span>
          </button>

          {/* Bulk Verify Button */}
          {selectedAssetIds.size > 0 && (
            <button
              onClick={() => setShowBulkVerificationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-neutral-950 text-xs font-semibold transition-colors shadow-sm"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Verify Integrity ({selectedAssetIds.size})</span>
            </button>
          )}

          {selectedAssetIds.size === 0 && displayedAssets.some((a) => !a.verifiedIntegrity) && (
            <button
              onClick={handleVerifyAllUnverified}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verify All Flagged</span>
            </button>
          )}
        </div>
      </div>

      {/* Media Grid Cards */}
      {displayedAssets.length === 0 ? (
        <div className="p-12 text-center border border-neutral-800 rounded-2xl bg-neutral-900/20 space-y-3">
          <Layers className="h-8 w-8 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-300">No media matches this filter</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting search terms, selecting a different project, or switching between before/during/after stages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedAssets.map((asset) => {
            const isSelected = selectedAssetIds.has(asset.id);
            const isVerified = asset.verifiedIntegrity;
            const project = projectMap.get(asset.projectId);
            const isComparisonSelected = comparisonAssets.some((a) => a.id === asset.id);

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAssetForModal(asset)}
                className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 bg-neutral-900/40 hover:bg-neutral-900/70 hover:shadow-xl ${
                  isComparisonSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                    : isSelected
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={asset.transformations?.thumbnailUrl || asset.url}
                    alt={asset.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Multi-Select Checkbox */}
                  <div
                    onClick={(e) => toggleSelectAsset(asset.id, e)}
                    className="absolute top-2.5 left-2.5 p-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>

                  {/* Stage Pill */}
                  <div className="absolute top-2.5 left-10">
                    <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border backdrop-blur-md ${getStageBadge(asset.stage)}`}>
                      {asset.stage}
                    </span>
                  </div>

                  {/* Verified Integrity Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {isVerified ? (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/95 border border-emerald-400 text-emerald-300 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                        title="Verified Integrity: SHA-256 hash match confirmed against stored Cloudinary metadata"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[10px] font-mono font-bold tracking-tight">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-950/80 border border-neutral-700/80 text-neutral-400 backdrop-blur-md text-[10px] font-mono">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 shrink-0" />
                          <span>Unverified</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifySingleAsset(asset);
                          }}
                          disabled={isVerifyingSingleId === asset.id}
                          title="Recalculate SHA-256 and compare against Cloudinary metadata"
                          className="p-1 rounded bg-neutral-900/90 hover:bg-emerald-500/20 border border-neutral-700 hover:border-emerald-500 text-neutral-400 hover:text-emerald-400 transition-colors"
                        >
                          {isVerifyingSingleId === asset.id ? (
                            <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                          ) : (
                            <ShieldCheck className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gemini Relevance Score pill */}
                  {asset.geminiMatchScore && (
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] backdrop-blur-md">
                        <Sparkles className="h-3 w-3 text-emerald-400" />
                        <span>{asset.geminiMatchScore}% Match</span>
                      </span>
                    </div>
                  )}

                  {/* Split Comparison Quick Action Chip */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <button
                      onClick={(e) => handleToggleCompareSelection(asset, e)}
                      className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold flex items-center gap-1 backdrop-blur-md transition-colors ${
                        isComparisonSelected
                          ? 'bg-emerald-400 text-neutral-950 border border-emerald-300 shadow-md'
                          : 'bg-black/75 hover:bg-emerald-950/90 text-neutral-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40'
                      }`}
                      title={isComparisonSelected ? 'Selected for comparison' : 'Select for Split-Screen comparison'}
                    >
                      <SlidersHorizontal className="h-3 w-3" />
                      <span>{isComparisonSelected ? 'Selected (1/2)' : 'Compare'}</span>
                    </button>
                  </div>
                </div>

                {/* Metadata Content */}
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="truncate max-w-[160px] text-neutral-300 font-medium">
                      {project ? project.title : 'Field Project'}
                    </span>
                    <span className="font-mono text-neutral-500">
                      {new Date(asset.capturedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {asset.title}
                  </h4>

                  {/* Gemini Reasoning */}
                  {asset.geminiReasoning ? (
                    <p className="text-[11px] text-emerald-300/90 leading-tight bg-emerald-950/30 p-1.5 rounded border border-emerald-900/60 line-clamp-2">
                      {asset.geminiReasoning}
                    </p>
                  ) : (
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-snug">
                      {asset.description}
                    </p>
                  )}

                  {/* Cloudinary AI detected objects snippet */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {asset.aiAnalysis.detectedObjects.slice(0, 2).map((obj, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-neutral-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800"
                      >
                        {obj.name}
                      </span>
                    ))}
                    {asset.aiAnalysis.detectedObjects.length > 2 && (
                      <span className="text-[10px] text-neutral-500 font-mono">
                        +{asset.aiAnalysis.detectedObjects.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer bar with location and SHA-256 fingerprint */}
                <div className="px-3.5 py-2 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1 truncate max-w-[160px]">
                    <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{asset.location.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[110px]" title={asset.trustPassport?.sha256Hash}>
                    {asset.trustPassport?.sha256Hash?.substring(0, 8)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Comparison Bar (when 1 photo is selected) */}
      {comparisonAssets.length === 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 p-3 sm:px-5 rounded-2xl bg-neutral-900/95 border border-emerald-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold font-mono">
              1/2
            </span>
            <span className="text-neutral-200">
              Selected <strong>"{comparisonAssets[0].title}"</strong>. Click <em>Compare</em> on any second photo to launch Split-Screen!
            </span>
          </div>

          <button
            onClick={() => setComparisonAssets([])}
            className="text-neutral-400 hover:text-neutral-200 px-2 py-1 underline font-mono text-[11px]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Split-Screen Arbitrary Comparison Modal */}
      {showSplitComparisonModal && comparisonAssets.length === 2 && (
        <SplitScreenComparisonModal
          photoA={comparisonAssets[0]}
          photoB={comparisonAssets[1]}
          allProjectAssets={displayedAssets}
          project={projectMap.get(comparisonAssets[0].projectId)}
          onClose={() => {
            setShowSplitComparisonModal(false);
            setComparisonAssets([]);
          }}
          onSelectPhotoA={(a) => setComparisonAssets([a, comparisonAssets[1]])}
          onSelectPhotoB={(b) => setComparisonAssets([comparisonAssets[0], b])}
        />
      )}

      {/* Media Detail & Trust Passport Modal */}
      {selectedAssetForModal && (
        <MediaDetailModal
          asset={selectedAssetForModal}
          project={projectMap.get(selectedAssetForModal.projectId)}
          onClose={() => setSelectedAssetForModal(null)}
          onCompareWithThis={onCompareWithThis}
        />
      )}

      {/* Bulk Integrity Verification Modal */}
      {showBulkVerificationModal && (
        <BulkVerificationModal
          selectedAssets={displayedAssets.filter((a) => selectedAssetIds.has(a.id))}
          onClose={() => setShowBulkVerificationModal(false)}
          onVerificationComplete={handleVerificationComplete}
        />
      )}

    </div>
  );
};
