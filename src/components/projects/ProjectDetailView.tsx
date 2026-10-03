import React, { useState, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  SlidersHorizontal, 
  FileText, 
  UploadCloud, 
  Layers,
  Sparkles,
  Award,
  Printer,
  Download,
  Loader2,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Project, MediaAsset, BeforeAfterPair, UserProfile } from '../../types';
import { calculateEvidenceScore } from '../../services/evidenceScore';
import { downloadProjectPdf, exportElementToPdfWithHtml2Canvas } from '../../services/pdfExportService';
import { EvidenceScoreRadar } from '../dashboard/EvidenceScoreRadar';
import { MediaGrid } from '../media/MediaGrid';
import { ProjectPdfExportModal } from './ProjectPdfExportModal';
import { ProjectInteractiveTimeline } from './ProjectInteractiveTimeline';
import { EvidenceAiInsightsSidebar } from './EvidenceAiInsightsSidebar';
import { ProjectTrustStampAuditLog } from './ProjectTrustStampAuditLog';
import { ProjectMilestoneRoadmap } from './ProjectMilestoneRoadmap';

interface ProjectDetailViewProps {
  project: Project;
  assets: MediaAsset[];
  pairs: BeforeAfterPair[];
  currentUser?: UserProfile;
  onBack: () => void;
  onOpenUpload: (projectId: string, suggestedStage?: string) => void;
  onOpenBeforeAfter: (pairId?: string) => void;
  onGenerateReport: (projectId: string) => void;
  onOpenStakeholderView?: (projectId: string) => void;
  onUpdateAssets?: (updatedAssets: MediaAsset[]) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  assets,
  pairs,
  currentUser,
  onBack,
  onOpenUpload,
  onOpenBeforeAfter,
  onGenerateReport,
  onOpenStakeholderView,
  onUpdateAssets,
}) => {
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [activeSection, setActiveSection] = useState<'catalog' | 'audit'>('catalog');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string | undefined>(undefined);
  const reportCaptureRef = useRef<HTMLDivElement>(null);

  const projectAssets = assets.filter((a) => a.projectId === project.id);
  const projectPairs = pairs.filter((p) => p.projectId === project.id);
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const displayedProjectAssets = useMemo(() => {
    if (!selectedStageFilter) return projectAssets;
    return projectAssets.filter((a) => a.stage === selectedStageFilter);
  }, [projectAssets, selectedStageFilter]);

  const projectAuditCount = projectAssets.reduce(
    (acc, a) => acc + (a.trustPassport?.auditChain?.length || 1), 
    0
  );

  const scoreBreakdown = calculateEvidenceScore(project, assets, pairs);

  const progressPct = Math.min(
    100,
    Math.round((project.targetMetric.current / project.targetMetric.target) * 100)
  );

  const handleDownloadPdfReport = async () => {
    setIsExportingPdf(true);
    try {
      const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (reportCaptureRef.current) {
        await exportElementToPdfWithHtml2Canvas(
          reportCaptureRef.current,
          `impactlens-${slug}-impact-report.pdf`,
          { project, assets, pairs }
        );
      } else {
        await downloadProjectPdf(project, assets, pairs);
      }
    } catch (err) {
      console.warn('html2canvas capture had issues, utilizing vector jsPDF fallback:', err);
      await downloadProjectPdf(project, assets, pairs);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects Overview</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trust-Stamp Audit Log Toggle Button */}
          <button
            onClick={() => setActiveSection(activeSection === 'audit' ? 'catalog' : 'audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border shadow-sm ${
              activeSection === 'audit'
                ? 'bg-purple-950/80 text-purple-300 border-purple-600/80 shadow-purple-950/40'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
            title="Inspect trust-stamp verification history and compliance log"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>Trust Audit Log ({projectAuditCount})</span>
          </button>

          {/* AI Evidence Insights Toggle Button */}
          <button
            onClick={() => setShowAiInsights(!showAiInsights)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border shadow-sm ${
              showAiInsights
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 shadow-emerald-950/40'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
            title="Toggle Gemini AI Evidence Auditor sidebar"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{showAiInsights ? 'AI Insights Active' : 'AI Evidence Insights'}</span>
          </button>

          {/* Download PDF Report Button (Integrated jspdf + html2canvas) */}
          <button
            onClick={handleDownloadPdfReport}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm shadow-emerald-950/40"
            title="Generate and download a branded impact report using jspdf and html2canvas"
          >
            {isExportingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          <button
            onClick={() => setShowPdfExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800 hover:bg-emerald-900/60 rounded-lg transition-colors shadow-sm"
            title="Preview branded dossier and export"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-400" />
            <span>Dossier Preview</span>
          </button>

          <button
            onClick={() => onOpenBeforeAfter(projectPairs[0]?.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Before-After Proof ({projectPairs.length})</span>
          </button>

          <button
            onClick={() => onGenerateReport(project.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span>Impact Story Dossier</span>
          </button>

          {onOpenStakeholderView && (
            <button
              onClick={() => onOpenStakeholderView(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/60 rounded-lg transition-colors shadow-sm"
              title="Open simplified visual milestone view designed for donors and external stakeholders"
            >
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Stakeholder View</span>
            </button>
          )}

          <button
            onClick={() => onOpenUpload(project.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Project Banner & Hero */}
      <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-xl">
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={project.coverImageUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/20" />

          {/* Overlaid Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded bg-neutral-900/90 text-neutral-200 border border-neutral-700 backdrop-blur-md">
              {project.category}
            </span>
            <span className="text-xs font-mono font-medium text-emerald-300 bg-emerald-950/90 border border-emerald-700/80 px-2.5 py-1 rounded backdrop-blur-md">
              {project.status === 'completed' ? 'Completed & Audited' : 'Active Field Operations'}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
                {project.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2">
                {project.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.location.name}, {project.location.state}, {project.location.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                  Started {project.startDate}
                </span>
                <span className="text-neutral-500">
                  Grant: {project.donorOrGrant}
                </span>
              </div>
            </div>

            {/* Target Metric Box */}
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md min-w-[220px]">
              <span className="text-[11px] text-neutral-400 block mb-1">
                {project.targetMetric.label}
              </span>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="font-mono text-lg font-bold text-neutral-100 tabular-nums">
                  {project.targetMetric.current.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-neutral-500">
                  / {project.targetMetric.target.toLocaleString()} {project.targetMetric.unit}
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Strength Radar, Interactive Timeline, and AI Insights Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Stream */}
        <div className={showAiInsights ? 'lg:col-span-7 xl:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
          {/* Evidence Strength Radar for this Project */}
          <EvidenceScoreRadar
            scoreData={scoreBreakdown}
            projectTitle={project.title}
            onTakeAction={() => onOpenUpload(project.id)}
          />

          {/* Lifecycle Milestone Roadmap (Start, Execution, Completion) */}
          <ProjectMilestoneRoadmap
            project={project}
            assets={projectAssets}
            selectedStage={selectedStageFilter}
            onSelectStage={(stage) => setSelectedStageFilter(prev => prev === stage ? undefined : stage)}
          />

          {/* Interactive Horizontal Scrollable Timeline */}
          <ProjectInteractiveTimeline
            assets={projectAssets}
            projectTitle={project.title}
            onSelectAsset={(asset) => {
              // scroll or highlight in media grid
            }}
          />
        </div>

        {/* Right AI Insights Sidebar */}
        {showAiInsights && (
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
            <EvidenceAiInsightsSidebar
              project={project}
              scoreBreakdown={scoreBreakdown}
              assets={assets}
              pairs={pairs}
              onOpenUpload={(projId, suggestedStage) => onOpenUpload(projId, suggestedStage)}
              onOpenBeforeAfter={onOpenBeforeAfter}
              onClose={() => setShowAiInsights(false)}
            />
          </div>
        )}
      </div>

      {/* Project Media Evidence Gallery & Trust-Stamp Compliance Audit View */}
      <div className="space-y-4 pt-4 border-t border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeSection === 'catalog'
                  ? 'bg-emerald-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-neutral-800/80'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Evidence Catalog ({projectAssets.length} Assets)</span>
            </button>

            <button
              onClick={() => setActiveSection('audit')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeSection === 'audit'
                  ? 'bg-purple-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-neutral-800/80'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Trust-Stamp Audit Log ({projectAuditCount} Events)</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline-block">
            {activeSection === 'catalog' 
              ? 'Viewing visual evidence catalog & Cloudinary AI tags'
              : 'Viewing immutable verification chain & signer identities'}
          </span>
        </div>

        {selectedStageFilter && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-xs">
            <span className="text-emerald-300 font-mono">
              Roadmap Stage Active: <strong>{selectedStageFilter.toUpperCase()}</strong> ({displayedProjectAssets.length} Assets)
            </span>
            <button
              onClick={() => setSelectedStageFilter(undefined)}
              className="text-neutral-400 hover:text-neutral-200 underline font-mono text-[11px]"
            >
              Show All Lifecycle Phases
            </button>
          </div>
        )}

        {activeSection === 'catalog' ? (
          <MediaGrid
            assets={displayedProjectAssets}
            projects={[project]}
            selectedProjectId={project.id}
            onUpdateAssets={onUpdateAssets}
            onCompareWithThis={() => onOpenBeforeAfter(projectPairs[0]?.id)}
          />
        ) : (
          <ProjectTrustStampAuditLog
            project={project}
            assets={assets}
            currentUser={currentUser}
            onSelectAsset={(asset) => {
              setActiveSection('catalog');
            }}
          />
        )}
      </div>

      {/* PDF Export Modal */}
      {showPdfExportModal && (
        <ProjectPdfExportModal
          project={project}
          assets={assets}
          pairs={pairs}
          onClose={() => setShowPdfExportModal(false)}
        />
      )}

      {/* Hidden/Off-Screen Branded Report Container for html2canvas capture */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: '0', 
          width: '820px', 
          zIndex: -100 
        }} 
        aria-hidden="true"
      >
        <div
          ref={reportCaptureRef}
          style={{ width: '820px', minHeight: '1100px', backgroundColor: '#09090b', color: '#f4f4f5' }}
          className="p-8 space-y-6 font-sans border border-neutral-800"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">ImpactLens</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  AI Media Intelligence Platform
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                National Sustainability & Impact Verification Protocol · Official Institutional Dossier
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-neutral-400 block">Report Generated</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Project Title and Summary Banner */}
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/80 flex items-start justify-between gap-4">
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {project.category}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  ID: {project.id.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {project.title}
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {project.description}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-neutral-400 font-mono pt-1">
                <span>Location: {project.location.name}, {project.location.state}</span>
                <span>Lead: {project.leadCoordinator}</span>
                <span>Grant: {project.donorOrGrant}</span>
              </div>
            </div>

            {/* Evidence Score Pill */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/40 text-center shrink-0 min-w-[140px]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                Evidence Score
              </span>
              <div className="font-mono text-3xl font-bold text-emerald-400">
                {scoreBreakdown.totalScore}
                <span className="text-xs text-neutral-500 font-normal">/100</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-300 block mt-1">
                {scoreBreakdown.rating}
              </span>
            </div>
          </div>

          {/* 5-Factor Audit Breakdown Grid */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'Media Volume', score: scoreBreakdown.factors.mediaVolume.score, max: scoreBreakdown.factors.mediaVolume.max },
              { label: 'Before/After Proof', score: scoreBreakdown.factors.beforeAfterProof.score, max: scoreBreakdown.factors.beforeAfterProof.max },
              { label: 'AI Detection Scope', score: scoreBreakdown.factors.activityDiversity.score, max: scoreBreakdown.factors.activityDiversity.max },
              { label: 'Temporal Coverage', score: scoreBreakdown.factors.temporalCoverage.score, max: scoreBreakdown.factors.temporalCoverage.max },
              { label: 'Cryptographic Trust', score: scoreBreakdown.factors.trustIntegrity.score, max: scoreBreakdown.factors.trustIntegrity.max },
            ].map((factor, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/60 text-center">
                <span className="text-[9px] text-neutral-400 block uppercase font-mono truncate">
                  {factor.label}
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 block mt-0.5">
                  {factor.score}/{factor.max}
                </span>
              </div>
            ))}
          </div>

          {/* Before-and-After Media Gallery Layout */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
              <h3 className="text-xs font-semibold text-neutral-200 uppercase font-mono">
                Key Before-and-After Media Pairs ({projectPairs.length} Verified Benchmarks)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">
                Cloudinary AI Cross-Referenced
              </span>
            </div>

            <div className="space-y-4">
              {projectPairs.slice(0, 3).map((pair, idx) => {
                const beforeAsset = assetMap.get(pair.beforeAssetId);
                const afterAsset = assetMap.get(pair.afterAssetId);

                return (
                  <div key={pair.id} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-100">
                        #{idx + 1}: {pair.title}
                      </span>
                      <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                        Impact Delta: {pair.metricDelta} · {pair.timelineDays} Days Elapsed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Before Asset Box */}
                      <div className="rounded-lg border border-amber-900/40 bg-neutral-950 p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-amber-400 font-bold uppercase">Before Baseline</span>
                          <span className="text-neutral-500">
                            {beforeAsset ? new Date(beforeAsset.capturedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="h-32 w-full rounded overflow-hidden bg-neutral-900">
                          <img
                            src={beforeAsset?.transformations?.thumbnailUrl || beforeAsset?.url}
                            alt="Before"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] text-neutral-300 line-clamp-1">{beforeAsset?.title}</p>
                        <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500">
                          <span>SHA: {beforeAsset?.trustPassport.sha256Hash.substring(0, 12)}...</span>
                          <span className="text-emerald-400">Tamper-Proof</span>
                        </div>
                      </div>

                      {/* After Asset Box */}
                      <div className="rounded-lg border border-emerald-900/40 bg-neutral-950 p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-emerald-400 font-bold uppercase">After Completion</span>
                          <span className="text-neutral-500">
                            {afterAsset ? new Date(afterAsset.capturedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="h-32 w-full rounded overflow-hidden bg-neutral-900">
                          <img
                            src={afterAsset?.transformations?.thumbnailUrl || afterAsset?.url}
                            alt="After"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] text-neutral-300 line-clamp-1">{afterAsset?.title}</p>
                        <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500">
                          <span>SHA: {afterAsset?.trustPassport.sha256Hash.substring(0, 12)}...</span>
                          <span className="text-emerald-400">Tamper-Proof</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 italic">
                      "{pair.storyExcerpt}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Trust Seal */}
          <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>SEAL: CLD-VERIFIED-{project.id.toUpperCase()}-AUTONOMOUS-AUDIT</span>
            <span className="text-emerald-400">VERIFIED AUTHENTIC · CLOUDINARY AI TRUST PASSPORT</span>
          </div>
        </div>
      </div>

    </div>
  );
};
