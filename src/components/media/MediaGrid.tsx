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
  CheckCircle2
} from 'lucide-react';
import { MediaAsset, Project } from '../../types';
import { filterMediaAssets, parseNaturalLanguageQuery, queryGeminiSemanticSearch, SemanticSearchResult } from '../../services/searchService';
import { recalculateAndVerifyAssetIntegrity } from '../../services/cloudinaryService';
import { MediaDetailModal } from './MediaDetailModal';
import { BulkVerificationModal } from './BulkVerificationModal';

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

  // Gemini Semantic Search State
  const [isGeminiSearching, setIsGeminiSearching] = useState(false);
  const [geminiResult, setGeminiResult] = useState<SemanticSearchResult | null>(null);

  // Bulk Verification State
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [showBulkVerificationModal, setShowBulkVerificationModal] = useState(false);

  // Quick preset queries for hackathon demo
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

        {/* Preset Query Chips for Quick Inspection */}
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

      {/* Bulk Operations Toolbar */}
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

        {/* Bulk verification buttons */}
        <div className="flex items-center gap-2">
          {displayedAssets.some((a) => !a.verifiedIntegrity) && (
            <button
              onClick={handleVerifyAllUnverified}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 rounded-lg transition-colors"
            >
              <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verify All Unverified ({displayedAssets.filter((a) => !a.verifiedIntegrity).length})</span>
            </button>
          )}

          <button
            onClick={() => setShowBulkVerificationModal(true)}
            disabled={selectedAssetIds.size === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors shadow-sm"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Calculate SHA-256 & Verify Integrity ({selectedAssetIds.size})</span>
          </button>
        </div>
      </div>

      {/* Media Items Grid */}
      {displayedAssets.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-neutral-800 bg-neutral-900/30">
          <Layers className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-200">No media assets match your query</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing stage filters, or uploading new field documentation.
          </p>
          <button
            onClick={handleClearSearch}
            className="mt-4 px-3 py-1.5 text-xs text-emerald-400 hover:underline font-medium"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedAssets.map((asset) => {
            const project = projectMap.get(asset.projectId);
            const isSelected = selectedAssetIds.has(asset.id);
            const isVerified = asset.verifiedIntegrity === true;

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAssetForModal(asset)}
                className={`group relative rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Thumbnail container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                    <img
                      src={asset.url}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60" />

                    {/* Selection checkbox button */}
                    <div
                      onClick={(e) => toggleSelectAsset(asset.id, e)}
                      className="absolute top-2.5 left-2.5 z-10 p-1 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-700 hover:border-emerald-500 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Square className="h-4 w-4 text-neutral-400" />
                      )}
                    </div>

                    {/* Stage indicator badge */}
                    <div className="absolute top-2.5 left-10">
                      <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border backdrop-blur-md ${getStageBadge(asset.stage)}`}>
                        {asset.stage}
                      </span>
                    </div>

                    {/* Verified Integrity Badge (User Request) */}
                    <div className="absolute top-2.5 right-2.5">
                      {isVerified ? (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/95 border border-emerald-400 text-emerald-300 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                          title="Verified Integrity: SHA-256 hash match confirmed against stored Cloudinary metadata"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[10px] font-mono font-bold tracking-tight">Verified Integrity</span>
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

                    {/* Gemini Relevance Score pill (if matching query) */}
                    {asset.geminiMatchScore && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] backdrop-blur-md">
                          <Sparkles className="h-3 w-3 text-emerald-400" />
                          <span>{asset.geminiMatchScore}% Match</span>
                        </span>
                      </div>
                    )}
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

                    {/* Gemini Reasoning (if available) */}
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
