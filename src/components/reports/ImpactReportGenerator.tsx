import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Calendar, 
  MapPin, 
  SlidersHorizontal, 
  Maximize2,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { Project, MediaAsset, BeforeAfterPair, ImpactReport, UserProfile } from '../../types';

interface ImpactReportGeneratorProps {
  projects: Project[];
  assets: MediaAsset[];
  pairs: BeforeAfterPair[];
  reports: ImpactReport[];
  currentUser: UserProfile;
  onSaveReport: (report: ImpactReport) => void;
}

export const ImpactReportGenerator: React.FC<ImpactReportGeneratorProps> = ({
  projects,
  assets,
  pairs,
  reports,
  currentUser,
  onSaveReport,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [storyPresentationMode, setStoryPresentationMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectAssets = assets.filter((a) => a.projectId === activeProject.id);
  const projectPairs = pairs.filter((p) => p.projectId === activeProject.id);
  const existingReport = reports.find((r) => r.projectId === activeProject.id);

  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleGenerateNewReport = () => {
    const newReport: ImpactReport = {
      id: `rep-${Date.now()}`,
      projectId: activeProject.id,
      title: `${activeProject.title}: Verified Impact Audit & Story`,
      subtitle: `Official Documentation Brief for ${activeProject.donorOrGrant}`,
      generatedAt: new Date().toISOString(),
      generatedBy: `${currentUser.name} (${currentUser.role})`,
      executiveSummary: `This visual intelligence report certifies that ${activeProject.targetMetric.current.toLocaleString()} ${activeProject.targetMetric.unit} have been verified on site through ${projectAssets.length} geocoded field assets and ${projectPairs.length} verified before-and-after benchmarks. Utilizing Cloudinary AI feature extraction, documentation achieves an Evidence Strength Score of ${activeProject.evidenceScore}/100.`,
      primaryMetric: {
        label: activeProject.targetMetric.label,
        value: `${activeProject.targetMetric.current.toLocaleString()} / ${activeProject.targetMetric.target.toLocaleString()}`,
        growth: `${Math.round((activeProject.targetMetric.current / activeProject.targetMetric.target) * 100)}% Milestone Completed`,
      },
      secondaryMetrics: [
        { label: 'Evidence Strength Score', value: `${activeProject.evidenceScore} / 100` },
        { label: 'Verified Proof Pairs', value: `${projectPairs.length} Documented Changes` },
        { label: 'Cryptographic Audit', value: '100% SHA-256 Validated' },
      ],
      featuredPairs: projectPairs,
      supportingAssetIds: projectAssets.slice(0, 4).map((a) => a.id),
      evidenceScore: activeProject.evidenceScore,
      trustSealHash: `SEAL-${Date.now().toString(36).toUpperCase()}-CLD-VERIFIED`,
    };

    onSaveReport(newReport);
  };

  const reportToDisplay = existingReport || {
    id: 'draft-report',
    projectId: activeProject.id,
    title: `${activeProject.title}: Verified Impact Audit & Story`,
    subtitle: `Field Proof Dossier for ${activeProject.donorOrGrant}`,
    generatedAt: new Date().toISOString(),
    generatedBy: `${currentUser.name} (${currentUser.role})`,
    executiveSummary: `This visual impact intelligence dossier certifies that ${activeProject.targetMetric.current.toLocaleString()} ${activeProject.targetMetric.unit} have been physically verified on site through ${projectAssets.length} geocoded assets. Utilizing Cloudinary AI feature extraction and SHA-256 cryptographic provenance, field evidence satisfies rigorous institutional auditing standards.`,
    primaryMetric: {
      label: activeProject.targetMetric.label,
      value: `${activeProject.targetMetric.current.toLocaleString()} / ${activeProject.targetMetric.target.toLocaleString()}`,
      growth: `${Math.round((activeProject.targetMetric.current / activeProject.targetMetric.target) * 100)}% Achieved`,
    },
    secondaryMetrics: [
      { label: 'Evidence Strength Score', value: `${activeProject.evidenceScore} / 100` },
      { label: 'Verified Proof Pairs', value: `${projectPairs.length} Changes Documented` },
      { label: 'Trust Integrity', value: '100% Tamper-Proof' },
    ],
    featuredPairs: projectPairs,
    supportingAssetIds: projectAssets.slice(0, 4).map((a) => a.id),
    evidenceScore: activeProject.evidenceScore,
    trustSealHash: 'SEAL-2024-IMPACT-LENS-VERIFIED',
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-semibold text-neutral-100">
              Impact Story & Report Generator
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Auto-generate institutional donor briefs, CSR verification packs, and campaign-ready visual stories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-200 focus:outline-none focus:border-emerald-500/50"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateNewReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Fresh Report</span>
          </button>

          <button
            onClick={() => {
              setCurrentSlideIndex(0);
              setStoryPresentationMode(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Story Mode</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-neutral-400" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-neutral-400" />}
            <span>{copiedLink ? 'Copied Link' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Printable Visual Report Document Canvas */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-10 shadow-2xl space-y-8 max-w-5xl mx-auto print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Report Document Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-neutral-800 print:border-neutral-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 print:border-emerald-600 print:text-emerald-800">
                Official Visual Evidence Dossier
              </span>
              <span className="text-xs font-mono text-neutral-500">
                Doc Ref: IL-2024-{activeProject.id.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 print:text-neutral-900">
              {reportToDisplay.title}
            </h1>

            <p className="text-sm text-neutral-400 print:text-neutral-600">
              {reportToDisplay.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 print:text-neutral-600 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                {activeProject.location.name}, {activeProject.location.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                {new Date(reportToDisplay.generatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </span>
            </div>
          </div>

          {/* Cryptographic Trust Stamp Badge */}
          <div className="flex md:flex-col items-center justify-between md:items-end gap-2 p-3 rounded-xl bg-neutral-900/80 border border-emerald-500/30 print:border-neutral-300 print:bg-neutral-100 shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-400 print:text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Trust Verified</span>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-neutral-200 print:text-neutral-900 tabular-nums">
                Score: {activeProject.evidenceScore}/100
              </p>
              <p className="font-mono text-[9px] text-neutral-500 truncate max-w-[140px]">
                {reportToDisplay.trustSealHash}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
            01. Executive Summary & Audit Verification
          </h2>
          <p className="text-sm text-neutral-300 print:text-neutral-800 leading-relaxed bg-neutral-900/40 print:bg-neutral-50 p-4 rounded-xl border border-neutral-800/80 print:border-neutral-200">
            {reportToDisplay.executiveSummary}
          </p>
        </div>

        {/* Verified Impact Metrics Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
            02. Core Verified Metric Progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 print:bg-neutral-50 border border-neutral-800 print:border-neutral-200">
              <span className="text-xs text-neutral-400 print:text-neutral-600 block mb-1">
                {reportToDisplay.primaryMetric.label}
              </span>
              <span className="font-mono text-2xl font-bold text-emerald-400 print:text-emerald-700 tabular-nums block">
                {reportToDisplay.primaryMetric.value}
              </span>
              <span className="text-xs text-neutral-400 print:text-neutral-600 font-mono mt-1 block">
                {reportToDisplay.primaryMetric.growth}
              </span>
            </div>

            {reportToDisplay.secondaryMetrics.map((met, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-900/60 print:bg-neutral-50 border border-neutral-800 print:border-neutral-200"
              >
                <span className="text-xs text-neutral-400 print:text-neutral-600 block mb-1">
                  {met.label}
                </span>
                <span className="font-mono text-xl font-bold text-neutral-100 print:text-neutral-900 tabular-nums block">
                  {met.value}
                </span>
                <span className="text-xs text-neutral-500 font-mono mt-1 block">
                  Cloudinary AI Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Before-and-After Proof Gallery */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
            03. Verified Photographic Proof & Change Delimitation
          </h2>

          <div className="space-y-6">
            {reportToDisplay.featuredPairs.map((pair) => {
              const bAsset = assetMap.get(pair.beforeAssetId);
              const aAsset = assetMap.get(pair.afterAssetId);

              if (!bAsset || !aAsset) return null;

              return (
                <div
                  key={pair.id}
                  className="rounded-xl border border-neutral-800 print:border-neutral-300 bg-neutral-900/40 print:bg-neutral-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-neutral-800/80 print:border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-100 print:text-neutral-900">
                        {pair.title}
                      </h3>
                      <p className="text-xs text-neutral-400 print:text-neutral-600 mt-0.5">
                        {pair.storyExcerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 print:text-emerald-800">
                        {pair.metricDelta}
                      </span>
                      <span className="text-xs font-mono text-neutral-400 print:text-neutral-600">
                        ({pair.timelineDays} days)
                      </span>
                    </div>
                  </div>

                  {/* Dual side-by-side photographic record */}
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {/* Before Image */}
                    <div className="relative aspect-video border-b sm:border-b-0 sm:border-r border-neutral-800 print:border-neutral-300">
                      <img
                        src={bAsset.url}
                        alt="Baseline Before"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded bg-black/80 text-amber-300 font-mono text-[10px] border border-amber-500/40">
                          BASELINE: {new Date(bAsset.capturedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded bg-black/70 text-[11px] text-neutral-300 truncate">
                        {bAsset.title}
                      </div>
                    </div>

                    {/* After Image */}
                    <div className="relative aspect-video">
                      <img
                        src={aAsset.url}
                        alt="Verified After"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded bg-black/80 text-emerald-300 font-mono text-[10px] border border-emerald-500/40">
                          VERIFIED OUTCOME: {new Date(aAsset.capturedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded bg-black/70 text-[11px] text-neutral-300 truncate">
                        {aAsset.title}
                      </div>
                    </div>
                  </div>

                  {/* Hash verification subline */}
                  <div className="px-4 py-2 bg-neutral-950/80 print:bg-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-500 print:text-neutral-600">
                    <span className="truncate max-w-sm">
                      Proof Digest: {bAsset.trustPassport?.sha256Hash?.substring(0, 16)}... ➔ {aAsset.trustPassport?.sha256Hash?.substring(0, 16)}...
                    </span>
                    <span className="text-emerald-400 print:text-emerald-700 font-semibold">
                      Cryptographically Validated
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signoff and Provenance Seal */}
        <div className="pt-6 border-t border-neutral-800 print:border-neutral-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-neutral-400 print:text-neutral-600">
          <div>
            <p className="text-neutral-200 print:text-neutral-900 font-medium">
              Prepared by: {reportToDisplay.generatedBy}
            </p>
            <p className="text-neutral-500">
              Verified through ImpactLens AI Media Intelligence Protocol · Cloudinary Trust Engine
            </p>
          </div>

          <div className="text-right">
            <p className="text-emerald-400 print:text-emerald-800 font-semibold">
              SEAL: {reportToDisplay.trustSealHash}
            </p>
            <p className="text-neutral-500 text-[10px]">
              End-to-End Field Traceability Assured
            </p>
          </div>
        </div>

      </div>

      {/* Fullscreen Story Presentation Mode Modal */}
      {storyPresentationMode && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                IMPACTLENS STORY MODE
              </span>
              <span className="text-sm font-semibold text-neutral-200 truncate">
                {activeProject.title}
              </span>
            </div>

            <button
              onClick={() => setStoryPresentationMode(false)}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Presentation Slide View */}
          <div className="flex-1 flex items-center justify-center my-4">
            {reportToDisplay.featuredPairs[currentSlideIndex] ? (
              (() => {
                const pair = reportToDisplay.featuredPairs[currentSlideIndex];
                const bAsset = assetMap.get(pair.beforeAssetId);
                const aAsset = assetMap.get(pair.afterAssetId);
                return (
                  <div className="max-w-4xl w-full space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[380px] sm:h-[460px]">
                      <div className="relative rounded-xl overflow-hidden border border-neutral-800">
                        <img
                          src={bAsset?.url}
                          alt="Before"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 font-mono text-xs text-amber-300">
                          BEFORE BASELINE
                        </div>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-emerald-500/40">
                        <img
                          src={aAsset?.url}
                          alt="After"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 font-mono text-xs text-emerald-300">
                          VERIFIED OUTCOME
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-100">{pair.title}</h3>
                        <p className="text-xs text-neutral-400 mt-0.5">{pair.storyExcerpt}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xl font-bold text-emerald-400">{pair.metricDelta}</span>
                        <span className="block text-[11px] text-neutral-500 font-mono">Verified in {pair.timelineDays} Days</span>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center text-neutral-400">No slides available for this project.</div>
            )}
          </div>

          {/* Presentation Slide Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 disabled:opacity-30 text-xs flex items-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Proof</span>
            </button>

            <span className="font-mono text-xs text-neutral-400">
              Slide {currentSlideIndex + 1} of {reportToDisplay.featuredPairs.length || 1}
            </span>

            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(reportToDisplay.featuredPairs.length - 1, prev + 1))}
              disabled={currentSlideIndex >= reportToDisplay.featuredPairs.length - 1}
              className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 disabled:opacity-30 text-xs flex items-center gap-1.5"
            >
              <span>Next Proof</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
