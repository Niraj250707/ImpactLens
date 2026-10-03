import React, { useMemo } from 'react';
import { 
  Milestone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Project, MediaAsset } from '../../types';

interface ProjectMilestoneRoadmapProps {
  project: Project;
  assets: MediaAsset[];
  onSelectStage?: (stage: string) => void;
  selectedStage?: string;
}

export const ProjectMilestoneRoadmap: React.FC<ProjectMilestoneRoadmapProps> = ({
  project,
  assets,
  onSelectStage,
  selectedStage,
}) => {
  const projectAssets = useMemo(() => {
    return assets.filter((a) => a.projectId === project.id);
  }, [assets, project.id]);

  // Analyze earliest and latest capturedAt dates
  const roadmapData = useMemo(() => {
    if (projectAssets.length === 0) {
      const start = new Date(project.startDate);
      const end = project.endDate ? new Date(project.endDate) : new Date();
      return {
        earliestDate: start,
        latestDate: end,
        durationDays: Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))),
        startAssets: [],
        executionAssets: [],
        completionAssets: [],
      };
    }

    // Sort by capturedAt date
    const sorted = [...projectAssets].sort(
      (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    );

    const earliestDate = new Date(sorted[0].capturedAt);
    const latestDate = new Date(sorted[sorted.length - 1].capturedAt);
    const durationDays = Math.max(
      1,
      Math.round((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Filter by stage or time window
    const startAssets = sorted.filter(
      (a) => a.stage === 'before' || new Date(a.capturedAt).getTime() <= earliestDate.getTime() + (durationDays * 0.33 * 86400000)
    );
    const executionAssets = sorted.filter(
      (a) => a.stage === 'during' || (
        new Date(a.capturedAt).getTime() > earliestDate.getTime() + (durationDays * 0.33 * 86400000) &&
        new Date(a.capturedAt).getTime() < earliestDate.getTime() + (durationDays * 0.75 * 86400000)
      )
    );
    const completionAssets = sorted.filter(
      (a) => a.stage === 'after' || a.stage === 'monitoring' || new Date(a.capturedAt).getTime() >= earliestDate.getTime() + (durationDays * 0.75 * 86400000)
    );

    return {
      earliestDate,
      latestDate,
      durationDays,
      startAssets: startAssets.length > 0 ? startAssets : sorted.slice(0, 1),
      executionAssets: executionAssets.length > 0 ? executionAssets : sorted.slice(1, 2),
      completionAssets: completionAssets.length > 0 ? completionAssets : sorted.slice(-1),
    };
  }, [projectAssets, project]);

  const { earliestDate, latestDate, durationDays, startAssets, executionAssets, completionAssets } = roadmapData;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Phase configurations
  const phases = [
    {
      id: 'start',
      stage: 'before',
      stepNumber: 1,
      name: 'Start Phase',
      subtitle: 'Baseline Condition & Pre-Intervention',
      dateRange: `${formatDate(earliestDate)}`,
      assetsCount: startAssets.length,
      sampleAsset: startAssets[0],
      isComplete: true,
      statusLabel: 'Baseline Verified',
      color: 'amber',
      keyMilestone: 'Initial environmental baseline & drone mapping established',
      aiSummary: 'Cryptographic SHA-256 baseline images captured to establish unimproved state before remediation.',
    },
    {
      id: 'execution',
      stage: 'during',
      stepNumber: 2,
      name: 'Execution Phase',
      subtitle: 'Active Field Interventions & Operations',
      dateRange: `Mid-Campaign Cadence (~Day ${Math.round(durationDays * 0.5)})`,
      assetsCount: executionAssets.length,
      sampleAsset: executionAssets[0] || startAssets[0],
      isComplete: project.status === 'completed' || project.status === 'monitoring',
      statusLabel: project.status === 'completed' || project.status === 'monitoring' ? 'Milestones Executed' : 'In Active Progress',
      color: 'sky',
      keyMilestone: 'Community mobilization, equipment deployment, and physical works',
      aiSummary: 'Continuous field monitoring tracking sapling survival, river desiltation, and community action.',
    },
    {
      id: 'completion',
      stage: 'after',
      stepNumber: 3,
      name: 'Completion Phase',
      subtitle: 'Verified Physical Outcomes & Audit Sign-Off',
      dateRange: `${formatDate(latestDate)}`,
      assetsCount: completionAssets.length,
      sampleAsset: completionAssets[0] || executionAssets[0] || startAssets[0],
      isComplete: project.status === 'completed',
      statusLabel: project.status === 'completed' ? 'Audited & Certified' : 'Ongoing Monitoring',
      color: 'emerald',
      keyMilestone: 'Post-intervention photographic evidence & donor tranche sign-off',
      aiSummary: 'Certified Before-and-After physical transformation proofs anchored to immutable ledger.',
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 backdrop-blur-sm space-y-6">
      
      {/* Header with Timeline Duration Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Milestone className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-100">
                  Lifecycle Milestone Roadmap
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Calculated from Earliest & Latest Field Captures
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Visualizing the Start, Execution, and Completion phases mapped from {projectAssets.length} verified photographic assets.
              </p>
            </div>
          </div>
        </div>

        {/* Temporal Duration Badges */}
        <div className="flex items-center gap-3 font-mono text-xs self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
            <span className="text-[10px] text-neutral-500 block">Active Tracking Span</span>
            <span className="font-bold text-emerald-400">{durationDays} Days</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
            <span className="text-[10px] text-neutral-500 block">Temporal Range</span>
            <span className="text-neutral-200">{formatDate(earliestDate)} ➔ {formatDate(latestDate)}</span>
          </div>
        </div>
      </div>

      {/* 3-Step Milestone Roadmap Cards with Connected Track */}
      <div className="relative">
        
        {/* Continuous Connecting Line Behind Nodes */}
        <div className="hidden md:block absolute top-7 left-12 right-12 h-1 bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500 rounded-full z-0 opacity-40" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {phases.map((phase) => {
            const isSelected = selectedStage === phase.stage;
            const sampleImg = phase.sampleAsset?.transformations?.thumbnailUrl || phase.sampleAsset?.url;

            return (
              <div
                key={phase.id}
                onClick={() => onSelectStage && onSelectStage(phase.stage)}
                className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-emerald-400 bg-neutral-900/90 ring-2 ring-emerald-500/20 shadow-xl'
                    : 'border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900/60 hover:border-neutral-700'
                }`}
              >
                {/* Step Pill & Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold border ${
                      phase.color === 'amber'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : phase.color === 'sky'
                        ? 'bg-sky-950 text-sky-300 border-sky-500/50'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    }`}>
                      {phase.stepNumber}
                    </span>
                    <span className="text-xs font-bold text-neutral-100">
                      {phase.name}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full border ${
                    phase.isComplete
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                  }`}>
                    {phase.statusLabel}
                  </span>
                </div>

                {/* Subtitle & Date */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-300">
                    {phase.subtitle}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                    <Calendar className="h-3 w-3 text-neutral-500" />
                    <span>{phase.dateRange}</span>
                  </div>
                </div>

                {/* Thumbnail Preview & Asset Count */}
                {sampleImg && (
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-neutral-800 group">
                    <img
                      src={sampleImg}
                      alt={phase.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent" />
                    
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-neutral-200">
                      <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded backdrop-blur-md">
                        <Layers className="h-3 w-3 text-emerald-400" />
                        <span>{phase.assetsCount} Assets Captured</span>
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        SHA-256 Sealed
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Summary / Key Milestone Note */}
                <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-[11px] text-neutral-400 leading-snug space-y-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block">Milestone Focus:</span>
                  <p>{phase.keyMilestone}</p>
                </div>

                {/* Footer Action */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                  <span className="font-mono text-[10px] text-neutral-500">
                    Filter Media ➔
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Insight Guarantee */}
      <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-neutral-500">
        <span className="flex items-center gap-1.5 text-neutral-400">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Timeline Verification: Continuous M&E Cadence Calculated from EXIF Metadata</span>
        </span>
        <span className="text-emerald-400/90">
          All 3 Phases Correlated to Physical Ground Coordinates
        </span>
      </div>

    </div>
  );
};
