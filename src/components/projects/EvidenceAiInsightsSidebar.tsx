import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Upload, 
  ShieldAlert, 
  Clock, 
  Award, 
  Info,
  ChevronRight,
  TrendingUp,
  X,
  Camera
} from 'lucide-react';
import { Project, MediaAsset, BeforeAfterPair, EvidenceScoreBreakdown } from '../../types';
import { EvidenceAiInsights, fetchEvidenceAiInsights } from '../../services/aiInsightsService';

interface EvidenceAiInsightsSidebarProps {
  project: Project;
  scoreBreakdown: EvidenceScoreBreakdown;
  assets: MediaAsset[];
  pairs: BeforeAfterPair[];
  onOpenUpload: (projectId: string, suggestedStage?: string) => void;
  onOpenBeforeAfter: (pairId?: string) => void;
  onClose?: () => void;
}

export const EvidenceAiInsightsSidebar: React.FC<EvidenceAiInsightsSidebarProps> = ({
  project,
  scoreBreakdown,
  assets,
  pairs,
  onOpenUpload,
  onOpenBeforeAfter,
  onClose,
}) => {
  const [insights, setInsights] = useState<EvidenceAiInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEvidenceAiInsights(project, scoreBreakdown, assets, pairs);
      setInsights(data);
    } catch (err) {
      console.error('Error fetching evidence insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [project.id, scoreBreakdown.totalScore, assets.length, pairs.length]);

  const totalPotentialGain = insights?.documentationGaps.reduce((acc, g) => acc + g.potentialScoreGain, 0) || 0;

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          label: 'High Priority Gap',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          label: 'Medium Priority',
        };
      case 'low':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          label: 'Optimization',
        };
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl flex flex-col space-y-5 h-full">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-neutral-100">
                Gemini AI Evidence Auditor
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Real-time gap detection & data collection guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadInsights}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
            title="Refresh AI Audit Analysis"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Close Sidebar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isLoading && !insights ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            Evaluating evidence coverage across {assets.length} assets...
          </p>
        </div>
      ) : insights ? (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          
          {/* Executive Evidence Summary Card */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Audit Health Status
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                insights.overallHealthStatus === 'Optimal Audit Health'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
              }`}>
                {insights.overallHealthStatus}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {insights.projectSummaryReview}
            </p>

            {totalPotentialGain > 0 && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-emerald-400 font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+{totalPotentialGain} score points unlockable by fixing identified gaps</span>
              </div>
            )}
          </div>

          {/* Core Feature: Specific Documentation Gaps */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Identified Documentation Gaps ({insights.documentationGaps.length})</span>
              </h4>
              <span className="text-[10px] font-mono text-neutral-500">
                Action to Improve Score
              </span>
            </div>

            <div className="space-y-2.5">
              {insights.documentationGaps.map((gap) => {
                const badge = getSeverityBadge(gap.severity);
                return (
                  <div
                    key={gap.id}
                    className="p-3.5 rounded-xl border border-neutral-800/90 bg-neutral-900/40 hover:border-neutral-700 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {gap.timeframeOrMilestone}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-neutral-100 pt-0.5">
                          {gap.title}
                        </h5>
                      </div>

                      <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                        +{gap.potentialScoreGain} pts
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {gap.description}
                    </p>

                    {/* Field Team Action Callout */}
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-start gap-2 text-[11px]">
                      <Info className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-neutral-300">
                        <span className="text-emerald-400 font-medium">Field Guidance: </span>
                        {gap.suggestedAction}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onOpenUpload(project.id, gap.title.toLowerCase().includes('before') ? 'before' : undefined)}
                      className="w-full py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Upload className="h-3 w-3 text-emerald-400" />
                      <span>Upload Evidence for this Gap</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Next Upload Prompt for Field Operatives */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Camera className="h-3.5 w-3.5 text-emerald-400" />
              <span>Next Field Shoot Directive</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              {insights.priorityNextUploadPrompt}
            </p>
          </div>

          {/* Key Evidence Strengths */}
          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
              Verified Evidence Strengths
            </span>
            <div className="space-y-1.5">
              {insights.keyStrengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Donor Readiness Verdict */}
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              <span>Donor & Auditor Verdict</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              {insights.donorReadinessVerdict}
            </p>
          </div>

        </div>
      ) : null}

    </div>
  );
};
