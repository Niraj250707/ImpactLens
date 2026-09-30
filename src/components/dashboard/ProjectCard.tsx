import React from 'react';
import { MapPin, ArrowRight, ShieldCheck, Layers, Calendar } from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  assetCount: number;
  pairCount: number;
  onSelectProject: (projectId: string) => void;
  onViewBeforeAfter: (projectId: string) => void;
  onGenerateReport: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  assetCount,
  pairCount,
  onSelectProject,
  onViewBeforeAfter,
  onGenerateReport,
}) => {
  const progressPct = Math.min(
    100,
    Math.round((project.targetMetric.current / project.targetMetric.target) * 100)
  );

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="group rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Cover image with subtle overlay */}
        <div className="relative h-44 w-full overflow-hidden bg-neutral-950">
          <img
            src={project.coverImageUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

          {/* Category & Status */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-neutral-900/90 text-neutral-300 border border-neutral-700 backdrop-blur-sm">
              {project.category}
            </span>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
              {project.status === 'completed' ? 'Completed' : 'Active Field Work'}
            </span>
          </div>

          {/* Evidence Strength Score badge */}
          <div className="absolute top-3 right-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border backdrop-blur-md ${getScoreBadge(
                project.evidenceScore
              )}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="font-mono text-xs font-bold tabular-nums">
                {project.evidenceScore}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">/100</span>
            </div>
          </div>

          {/* Location line over bottom of image */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center text-xs text-neutral-300 gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{project.location.name}, {project.location.state}</span>
          </div>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5">
          <h3
            onClick={() => onSelectProject(project.id)}
            className="text-base font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1"
          >
            {project.title}
          </h3>

          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Metrics progress bar */}
          <div className="mt-4 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-400 truncate max-w-[180px]">
                {project.targetMetric.label}
              </span>
              <span className="font-mono text-neutral-200 tabular-nums">
                {project.targetMetric.current.toLocaleString()}{' '}
                <span className="text-neutral-500 font-normal">/ {project.targetMetric.target.toLocaleString()} {project.targetMetric.unit}</span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Evidence telemetry stats */}
          <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 font-mono pt-2 border-t border-neutral-800/50">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-neutral-500" />
              <span>{assetCount} field assets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{pairCount}</span>
              <span>verified pairs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 bg-neutral-950/70 border-t border-neutral-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewBeforeAfter(project.id)}
          className="text-xs font-medium text-neutral-300 hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-neutral-900"
        >
          Compare Before-After
        </button>

        <button
          onClick={() => onSelectProject(project.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-2.5 py-1 rounded-md hover:bg-emerald-500/10"
        >
          <span>Open Evidence Hub</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
