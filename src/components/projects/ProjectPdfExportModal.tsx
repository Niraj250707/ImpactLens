import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  SlidersHorizontal, 
  Layers, 
  FileText,
  Award,
  Download,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Project, MediaAsset, BeforeAfterPair, EvidenceScoreBreakdown } from '../../types';
import { calculateEvidenceScore } from '../../services/evidenceScore';
import { downloadProjectPdf, exportElementToPdfWithHtml2Canvas } from '../../services/pdfExportService';

interface ProjectPdfExportModalProps {
  project: Project;
  assets: MediaAsset[];
  pairs: BeforeAfterPair[];
  onClose: () => void;
}

export const ProjectPdfExportModal: React.FC<ProjectPdfExportModalProps> = ({
  project,
  assets,
  pairs,
  onClose,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement>(null);

  const projectAssets = assets.filter((a) => a.projectId === project.id);
  const projectPairs = pairs.filter((p) => p.projectId === project.id);
  const scoreBreakdown = calculateEvidenceScore(project, assets, pairs);
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const handlePrint = () => {
    window.print();
  };

  const handleExportHtml2CanvasPdf = async () => {
    if (!reportContainerRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await exportElementToPdfWithHtml2Canvas(
        reportContainerRef.current,
        `impactlens-${slug}-visual-report.pdf`,
        { project, assets, pairs }
      );
    } catch (err) {
      console.error('Failed to export PDF with html2canvas', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadVectorPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadProjectPdf(project, assets, pairs);
    } catch (err) {
      console.error('Failed to export vector PDF', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const progressPct = Math.min(
    100,
    Math.round((project.targetMetric.current / project.targetMetric.target) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl my-auto max-h-[92vh] flex flex-col print:p-0 print:border-none print:bg-white print:max-h-none print:shadow-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                Project Evidence Dossier (PDF Export Preview)
              </h2>
              <p className="text-[11px] text-neutral-400">
                Official institutional summary for donors, M&E auditors, and government bodies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportHtml2CanvasPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-neutral-950 font-semibold text-xs transition-colors shadow-sm"
              title="Download high-quality branded visual impact PDF via html2canvas & jsPDF"
            >
              {isGeneratingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Export to PDF (html2canvas)'}</span>
            </button>

            <button
              onClick={handleDownloadVectorPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-emerald-500/50 hover:bg-neutral-800 text-emerald-300 font-semibold text-xs transition-colors shadow-sm"
              title="Download vector PDF dossier directly via jsPDF"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>Vector PDF (jsPDF)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-medium text-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Preview</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={reportContainerRef} className="mt-4 flex-1 overflow-y-auto space-y-6 pr-1 print:overflow-visible print:pr-0 print:text-black">
          
          {/* Header Banner */}
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 print:border-neutral-300 print:bg-neutral-50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 print:border-emerald-700 print:text-emerald-800">
                  {project.category} · Verified Dossier
                </span>
                <span className="text-[11px] font-mono text-neutral-400 print:text-neutral-600">
                  ID: {project.id.toUpperCase()}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-neutral-100 print:text-neutral-900">
                {project.title}
              </h1>

              <p className="text-xs text-neutral-300 print:text-neutral-700 leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 print:text-neutral-600 font-mono pt-1">
                <span className="flex items-center gap-1 text-emerald-400 print:text-emerald-800">
                  <MapPin className="h-3 w-3" />
                  {project.location.name}, {project.location.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Initiated: {project.startDate}
                </span>
                <span>
                  Grant: {project.donorOrGrant}
                </span>
              </div>
            </div>

            {/* Score Badge */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/40 print:border-neutral-300 print:bg-white text-center sm:text-right shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 print:text-neutral-600 block">
                Evidence Strength Score
              </span>
              <div className="font-mono text-3xl font-bold text-emerald-400 print:text-emerald-800 tabular-nums">
                {scoreBreakdown.totalScore}
                <span className="text-xs text-neutral-500 font-normal">/100</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-300 print:text-emerald-700 block mt-0.5">
                {scoreBreakdown.rating}
              </span>
            </div>
          </div>

          {/* Evidence Strength Score Breakdown (5 Factors) */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-emerald-400 print:text-emerald-800 tracking-wider">
              01. Evidence Strength Quality Matrix
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/40 print:border-neutral-300 print:bg-neutral-50">
                <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">Media Volume</span>
                <span className="font-mono text-sm font-bold text-neutral-100 print:text-neutral-900">
                  {scoreBreakdown.factors.mediaVolume.score} / {scoreBreakdown.factors.mediaVolume.max}
                </span>
                <p className="text-[9px] text-neutral-500 mt-1 line-clamp-2">{scoreBreakdown.factors.mediaVolume.description}</p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/40 print:border-neutral-300 print:bg-neutral-50">
                <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">Before/After Proof</span>
                <span className="font-mono text-sm font-bold text-neutral-100 print:text-neutral-900">
                  {scoreBreakdown.factors.beforeAfterProof.score} / {scoreBreakdown.factors.beforeAfterProof.max}
                </span>
                <p className="text-[9px] text-neutral-500 mt-1 line-clamp-2">{scoreBreakdown.factors.beforeAfterProof.description}</p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/40 print:border-neutral-300 print:bg-neutral-50">
                <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">Tag Diversity</span>
                <span className="font-mono text-sm font-bold text-neutral-100 print:text-neutral-900">
                  {scoreBreakdown.factors.activityDiversity.score} / {scoreBreakdown.factors.activityDiversity.max}
                </span>
                <p className="text-[9px] text-neutral-500 mt-1 line-clamp-2">{scoreBreakdown.factors.activityDiversity.description}</p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/40 print:border-neutral-300 print:bg-neutral-50">
                <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">Timeline Span</span>
                <span className="font-mono text-sm font-bold text-neutral-100 print:text-neutral-900">
                  {scoreBreakdown.factors.temporalCoverage.score} / {scoreBreakdown.factors.temporalCoverage.max}
                </span>
                <p className="text-[9px] text-neutral-500 mt-1 line-clamp-2">{scoreBreakdown.factors.temporalCoverage.description}</p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/40 print:border-neutral-300 print:bg-neutral-50">
                <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">Trust Integrity</span>
                <span className="font-mono text-sm font-bold text-neutral-100 print:text-neutral-900">
                  {scoreBreakdown.factors.trustIntegrity.score} / {scoreBreakdown.factors.trustIntegrity.max}
                </span>
                <p className="text-[9px] text-neutral-500 mt-1 line-clamp-2">{scoreBreakdown.factors.trustIntegrity.description}</p>
              </div>
            </div>
          </div>

          {/* Metric Progress */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 print:border-neutral-300 print:bg-neutral-50">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-neutral-300 print:text-neutral-800 font-semibold">{project.targetMetric.label}</span>
              <span className="text-emerald-400 print:text-emerald-800 font-bold">
                {project.targetMetric.current.toLocaleString()} / {project.targetMetric.target.toLocaleString()} {project.targetMetric.unit} ({progressPct}% Goal Achieved)
              </span>
            </div>
            <div className="h-2 w-full bg-neutral-950 print:bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 print:bg-emerald-700 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Key Before-and-After Verified Assets */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase text-emerald-400 print:text-emerald-800 tracking-wider">
              02. Key Before-and-After Photographic Proof ({projectPairs.length} Verified Pairs)
            </h3>

            {projectPairs.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No Before-and-After pairs currently linked to this initiative.</p>
            ) : (
              <div className="space-y-4">
                {projectPairs.map((pair) => {
                  const bAsset = assetMap.get(pair.beforeAssetId);
                  const aAsset = assetMap.get(pair.afterAssetId);

                  if (!bAsset || !aAsset) return null;

                  return (
                    <div
                      key={pair.id}
                      className="rounded-xl border border-neutral-800 print:border-neutral-300 bg-neutral-950 overflow-hidden"
                    >
                      <div className="p-3 bg-neutral-900/70 print:bg-neutral-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-neutral-100 print:text-neutral-900">{pair.title}</span>
                          <span className="text-neutral-400 print:text-neutral-600 ml-2 font-mono text-[11px]">
                            ({pair.timelineDays} days span)
                          </span>
                        </div>
                        <span className="font-mono text-emerald-400 print:text-emerald-800 font-bold text-xs">
                          {pair.metricDelta}
                        </span>
                      </div>

                      {/* Side by side images */}
                      <div className="grid grid-cols-2 h-48 sm:h-56">
                        <div className="relative border-r border-neutral-800 print:border-neutral-300 h-full">
                          <img
                            src={bAsset.url}
                            alt="Before Baseline"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-amber-300">
                            BEFORE ({new Date(bAsset.capturedAt).toLocaleDateString()})
                          </span>
                        </div>

                        <div className="relative h-full">
                          <img
                            src={aAsset.url}
                            alt="After Verified"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-emerald-300">
                            AFTER ({new Date(aAsset.capturedAt).toLocaleDateString()})
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-neutral-900/40 print:bg-neutral-50 flex items-center justify-between text-[10px] font-mono text-neutral-400 print:text-neutral-600">
                        <span className="truncate max-w-sm">
                          SHA-256 Digest: {bAsset.trustPassport?.sha256Hash?.substring(0, 14)}... ➔ {aAsset.trustPassport?.sha256Hash?.substring(0, 14)}...
                        </span>
                        <span className="text-emerald-400 print:text-emerald-800 font-semibold">
                          Cloudinary AI Verified
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Provenance & Sign-off Seal */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 print:border-neutral-300 print:bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-neutral-400 print:text-neutral-600">
            <div>
              <p className="text-neutral-200 print:text-neutral-900 font-semibold">
                Lead Coordinator: {project.leadCoordinator}
              </p>
              <p className="text-[10px] text-neutral-500">
                ImpactLens Cryptographic Evidence Protocol · Problem Statement 02
              </p>
            </div>

            <div className="text-right">
              <span className="text-emerald-400 print:text-emerald-800 font-bold block">
                SEAL: VERIFIED-IMPACT-{project.id.toUpperCase()}-CLD
              </span>
              <span className="text-[9px] text-neutral-500">
                100% Traceability & Tamper-Proof Audit
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
