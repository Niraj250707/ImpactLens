import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Award, 
  Download, 
  Printer, 
  ExternalLink, 
  SlidersHorizontal, 
  FileText, 
  Sparkles, 
  Building2, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Eye,
  Lock,
  ChevronRight,
  Check
} from 'lucide-react';
import { Project, MediaAsset, BeforeAfterPair } from '../../types';
import { calculateEvidenceScore } from '../../services/evidenceScore';
import { downloadProjectPdf } from '../../services/pdfExportService';
import { StakeholderCommentsSection } from './StakeholderCommentsSection';

interface StakeholderViewProps {
  projects: Project[];
  assets: MediaAsset[];
  pairs: BeforeAfterPair[];
  selectedProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  onExitStakeholderView?: () => void;
  onOpenBeforeAfterDetail?: (pairId?: string) => void;
}

export const StakeholderView: React.FC<StakeholderViewProps> = ({
  projects,
  assets,
  pairs,
  selectedProjectId,
  onSelectProject,
  onExitStakeholderView,
  onOpenBeforeAfterDetail,
}) => {
  const [activeProjectId, setActiveProjectId] = useState<string>(
    selectedProjectId || projects[0]?.id || ''
  );
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sliderPositions, setSliderPositions] = useState<{ [pairId: string]: number }>({});

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const projectAssets = assets.filter((a) => a.projectId === activeProject?.id);
  const projectPairs = pairs.filter((p) => p.projectId === activeProject?.id);
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const scoreData = activeProject ? calculateEvidenceScore(activeProject, assets, pairs) : null;

  const progressPercent = activeProject 
    ? Math.min(100, Math.round((activeProject.targetMetric.current / activeProject.targetMetric.target) * 100))
    : 0;

  const handleSliderMove = (pairId: string, percent: number) => {
    setSliderPositions(prev => ({ ...prev, [pairId]: percent }));
  };

  const handleExportPdf = async () => {
    if (!activeProject) return;
    setIsExporting(true);
    try {
      await downloadProjectPdf(activeProject, assets, pairs);
    } catch (err) {
      console.error('Failed to export PDF briefing:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!activeProject) {
    return (
      <div className="p-12 text-center text-neutral-400">
        No projects available for stakeholder review.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Top Stakeholder Notice & Initiative Selector Bar */}
      <div className="p-4 rounded-2xl border border-emerald-800/60 bg-emerald-950/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Institutional Donor & Stakeholder Portal
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                Verified Read-Only View
              </span>
            </div>
            <p className="text-xs text-neutral-300">
              High-level impact verification, certified visual milestones, and grant compliance metrics.
            </p>
          </div>
        </div>

        {/* Action cluster: Switch Project & Return to Internal Team View */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Initiative Dropdown */}
          <select
            value={activeProjectId}
            onChange={(e) => {
              setActiveProjectId(e.target.value);
              if (onSelectProject) onSelectProject(e.target.value);
            }}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-medium transition-colors"
            title="Copy shareable link"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <ExternalLink className="h-3.5 w-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Portal'}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-neutral-950 text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Generating...' : 'Download Official Briefing'}</span>
          </button>

          {onExitStakeholderView && (
            <button
              onClick={onExitStakeholderView}
              className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
            >
              Exit Stakeholder View
            </button>
          )}
        </div>
      </div>

      {/* Executive Hero Banner */}
      <div className="relative rounded-3xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
        <div className="relative h-72 sm:h-80 w-full overflow-hidden">
          <img
            src={activeProject.coverImageUrl}
            alt={activeProject.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/30" />

          {/* Badges */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase px-3 py-1 rounded-full bg-neutral-900/90 text-neutral-200 border border-neutral-700 backdrop-blur-md">
              {activeProject.category}
            </span>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 backdrop-blur-md flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{activeProject.status === 'completed' ? 'Grant Milestones Completed' : 'Active Field Phase'}</span>
            </span>
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight leading-tight">
                {activeProject.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {activeProject.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 pt-2">
                <span className="flex items-center gap-1 text-emerald-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {activeProject.location.name}, {activeProject.location.state}, {activeProject.location.country}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                  Grant Partner: <strong className="text-neutral-200">{activeProject.donorOrGrant}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                  Initiated: {activeProject.startDate}
                </span>
              </div>
            </div>

            {/* Evidence & Milestone Seal Box */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md text-center min-w-[200px] shrink-0 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                Evidence Confidence Score
              </span>
              <div className="font-mono text-3xl font-extrabold text-emerald-400">
                {scoreData?.totalScore || activeProject.evidenceScore}
                <span className="text-xs font-normal text-neutral-500">/100</span>
              </div>
              <span className="text-xs font-semibold text-emerald-300 block">
                {scoreData?.rating || 'Verified High Quality'}
              </span>
              <span className="text-[10px] font-mono text-neutral-500 block pt-1 border-t border-neutral-800">
                Cryptographically Audited
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Metric Achievement Progress */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold block">
              Core Impact Milestone Metric
            </span>
            <h3 className="text-base font-bold text-neutral-100">
              {activeProject.targetMetric.label}
            </h3>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-extrabold text-neutral-100">
              {activeProject.targetMetric.current.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400">
              of {activeProject.targetMetric.target.toLocaleString()} {activeProject.targetMetric.unit}
            </span>
            <span className="text-sm font-bold text-emerald-400 ml-2">
              ({progressPercent}%)
            </span>
          </div>
        </div>

        <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <span className="text-neutral-400 block text-[11px]">Lead Project Coordinator</span>
            <span className="font-semibold text-neutral-200 mt-0.5 block truncate">{activeProject.leadCoordinator}</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <span className="text-neutral-400 block text-[11px]">Documented Field Assets</span>
            <span className="font-semibold text-neutral-200 mt-0.5 block">{projectAssets.length} Verified Media Files</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <span className="text-neutral-400 block text-[11px]">Before-After Benchmarks</span>
            <span className="font-semibold text-emerald-400 mt-0.5 block">{projectPairs.length} Substantiated Pairs</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <span className="text-neutral-400 block text-[11px]">Independent Audit Status</span>
            <span className="font-semibold text-emerald-400 mt-0.5 block flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Certified Tamper-Proof</span>
            </span>
          </div>
        </div>
      </div>

      {/* Curated Visual Milestones (Before-and-After Transformations) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-bold text-neutral-100">
                Verified Visual Milestones & Physical Change Proof
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Interactive photographic evidence comparing pre-intervention baseline against verified physical outcomes.
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800">
            {projectPairs.length} Documented Milestones
          </span>
        </div>

        {projectPairs.length === 0 ? (
          <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-950 text-center text-neutral-400 text-xs">
            Baseline documentation is currently undergoing active field verification.
          </div>
        ) : (
          <div className="space-y-8">
            {projectPairs.map((pair, idx) => {
              const beforeAsset = assetMap.get(pair.beforeAssetId);
              const afterAsset = assetMap.get(pair.afterAssetId);
              const sliderPos = sliderPositions[pair.id] ?? 50;

              if (!beforeAsset || !afterAsset) return null;

              return (
                <div
                  key={pair.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 sm:p-6 backdrop-blur-sm space-y-4"
                >
                  {/* Pair Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                        Milestone Proof #{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-neutral-100 mt-0.5">
                        {pair.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono text-xs font-bold">
                        Delta: {pair.metricDelta}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800 font-mono text-xs">
                        {pair.timelineDays} Days Interval
                      </span>
                    </div>
                  </div>

                  {/* Interactive Slider Container */}
                  <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden border border-neutral-800 select-none bg-neutral-950">
                    {/* After Image (Background) */}
                    <img
                      src={afterAsset.url}
                      alt="After Milestone"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Before Image (Overlay clipped) */}
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                    >
                      <img
                        src={beforeAsset.url}
                        alt="Before Baseline"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>

                    {/* Draggable Divider Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-neutral-950 shadow-xl border-2 border-white">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    {/* Range input for touch/mouse */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => handleSliderMove(pair.id, Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase">
                        Before: {new Date(beforeAsset.capturedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
                        After: {new Date(afterAsset.capturedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Story Excerpt & Cryptographic Guarantee */}
                  <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-2">
                    <p className="text-xs text-neutral-300 leading-relaxed italic">
                      "{pair.storyExcerpt}"
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-900 text-[11px] font-mono text-neutral-500">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Signatures: {beforeAsset.trustPassport.sha256Hash.substring(0, 10)}... ➔ {afterAsset.trustPassport.sha256Hash.substring(0, 10)}...</span>
                      </span>
                      <span className="text-emerald-400 font-sans font-medium">
                        Verified by Suresh Menon (Auditor)
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audited Stakeholder Comments & Non-Repudiable Donor Notes */}
      <StakeholderCommentsSection
        project={activeProject}
        pairs={projectPairs}
      />

      {/* Institutional Assurance & Compliance Stamp */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100">
              National Impact Assurance & Traceability Certificate
            </h3>
            <p className="text-xs text-neutral-400">
              Verified through ImpactLens AI Media Intelligence Protocol
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Verification Standard</span>
            <span className="font-semibold text-neutral-200 block">Tier-1 Cryptographic Field Proof</span>
            <p className="text-[11px] text-neutral-400">Every photo is anchored to SHA-256 bit-level hashes upon camera upload.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Auditor Sign-off</span>
            <span className="font-semibold text-neutral-200 block">M&E Certified & Signed</span>
            <p className="text-[11px] text-neutral-400">Independent auditor review conducted on all photographic benchmarks.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Disbursement Recommendation</span>
            <span className="font-semibold text-emerald-400 block">Approved for Tranche Release</span>
            <p className="text-[11px] text-neutral-400">Physical progress metrics satisfy institutional reporting benchmarks.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
