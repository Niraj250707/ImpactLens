import React from 'react';
import { ShieldCheck, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { EvidenceScoreBreakdown } from '../../types';

interface EvidenceScoreRadarProps {
  scoreData: EvidenceScoreBreakdown;
  projectTitle?: string;
  onTakeAction?: () => void;
}

export const EvidenceScoreRadar: React.FC<EvidenceScoreRadarProps> = ({
  scoreData,
  projectTitle,
  onTakeAction,
}) => {
  const { totalScore, rating, factors, recommendations } = scoreData;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getBarColor = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.8) return 'bg-emerald-400';
    if (pct >= 0.5) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-neutral-100">Evidence Strength Score</h3>
          </div>
          {projectTitle && (
            <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-sm">
              Auditing: <span className="text-neutral-200">{projectTitle}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-mono text-2xl font-bold tabular-nums text-neutral-100">
              {totalScore}
            </span>
            <span className="text-xs text-neutral-500 font-mono">/100</span>
          </div>

          <div
            className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getScoreColor(
              totalScore
            )}`}
          >
            {rating}
          </div>
        </div>
      </div>

      {/* 5 Core Factors Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Factor 1: Media Volume */}
        <div className="p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400">Media Volume</span>
            <span className="font-mono font-medium text-neutral-200 tabular-nums">
              {factors.mediaVolume.score}/{factors.mediaVolume.max}
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                factors.mediaVolume.score,
                factors.mediaVolume.max
              )}`}
              style={{ width: `${(factors.mediaVolume.score / factors.mediaVolume.max) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug line-clamp-2">
            {factors.mediaVolume.description}
          </p>
        </div>

        {/* Factor 2: Before-After Proof */}
        <div className="p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400">Before-After Proof</span>
            <span className="font-mono font-medium text-neutral-200 tabular-nums">
              {factors.beforeAfterProof.score}/{factors.beforeAfterProof.max}
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                factors.beforeAfterProof.score,
                factors.beforeAfterProof.max
              )}`}
              style={{
                width: `${(factors.beforeAfterProof.score / factors.beforeAfterProof.max) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug line-clamp-2">
            {factors.beforeAfterProof.description}
          </p>
        </div>

        {/* Factor 3: Activity Diversity */}
        <div className="p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400">Tag Diversity</span>
            <span className="font-mono font-medium text-neutral-200 tabular-nums">
              {factors.activityDiversity.score}/{factors.activityDiversity.max}
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                factors.activityDiversity.score,
                factors.activityDiversity.max
              )}`}
              style={{
                width: `${(factors.activityDiversity.score / factors.activityDiversity.max) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug line-clamp-2">
            {factors.activityDiversity.description}
          </p>
        </div>

        {/* Factor 4: Temporal Coverage */}
        <div className="p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400">Timeline Span</span>
            <span className="font-mono font-medium text-neutral-200 tabular-nums">
              {factors.temporalCoverage.score}/{factors.temporalCoverage.max}
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                factors.temporalCoverage.score,
                factors.temporalCoverage.max
              )}`}
              style={{
                width: `${(factors.temporalCoverage.score / factors.temporalCoverage.max) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug line-clamp-2">
            {factors.temporalCoverage.description}
          </p>
        </div>

        {/* Factor 5: Trust Integrity */}
        <div className="p-3 rounded-lg border border-neutral-800/60 bg-neutral-950/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-400">Trust Integrity</span>
            <span className="font-mono font-medium text-neutral-200 tabular-nums">
              {factors.trustIntegrity.score}/{factors.trustIntegrity.max}
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                factors.trustIntegrity.score,
                factors.trustIntegrity.max
              )}`}
              style={{
                width: `${(factors.trustIntegrity.score / factors.trustIntegrity.max) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug line-clamp-2">
            {factors.trustIntegrity.description}
          </p>
        </div>
      </div>

      {/* Actionable recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="font-medium text-neutral-200">Recommended Action:</span>
            <span className="text-neutral-400">{recommendations[0]}</span>
          </div>

          {onTakeAction && (
            <button
              onClick={onTakeAction}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Address Gap</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
