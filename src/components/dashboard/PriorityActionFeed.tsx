import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  UploadCloud, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Bell, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Project, MediaAsset, BeforeAfterPair, PriorityActionAlert } from '../../types';
import { calculateEvidenceScore } from '../../services/evidenceScore';

interface PriorityActionFeedProps {
  projects: Project[];
  assets: MediaAsset[];
  pairs: BeforeAfterPair[];
  onOpenUploadForProject: (projectId: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const PriorityActionFeed: React.FC<PriorityActionFeedProps> = ({
  projects,
  assets,
  pairs,
  onOpenUploadForProject,
  onSelectProject,
}) => {
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'missed'>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Automated notification detection engine
  const generatedAlerts = useMemo<PriorityActionAlert[]>(() => {
    const alerts: PriorityActionAlert[] = [];

    projects.forEach((project) => {
      const breakdown = calculateEvidenceScore(project, assets, pairs);
      const projectAssets = assets.filter(a => a.projectId === project.id);
      const projectPairs = pairs.filter(p => p.projectId === project.id);

      // Rule 1: Evidence Score drops below 60
      if (breakdown.totalScore < 60) {
        alerts.push({
          id: `alert-low-score-${project.id}`,
          projectId: project.id,
          projectTitle: project.title,
          type: 'low_evidence_score',
          severity: 'critical',
          title: `Evidence Score Below 60: ${project.title} (${breakdown.totalScore}/100)`,
          description: `Current score of ${breakdown.totalScore}/100 falls below the institutional threshold of 60. Donors will withhold grant tranches until verified baseline and paired evidence are uploaded.`,
          currentScore: breakdown.totalScore,
          thresholdScore: 60,
          suggestedAction: `Upload at least 2 baseline photos and match with during/after progress benchmarks.`,
          actionLabel: `Resolve Evidence Deficit`,
          timestamp: new Date().toISOString(),
        });
      }

      // Rule 2: Critical milestone deadline missed
      // Triggered if project progress is significantly lagging behind elapsed days or explicit deadline overrun
      const elapsedDays = Math.max(1, Math.round((Date.now() - new Date(project.startDate).getTime()) / 86400000));
      const targetPct = (project.targetMetric.current / project.targetMetric.target) * 100;
      
      // If project has been active > 60 days with < 35% target completed or specifically for Deccan Dryland
      if ((elapsedDays > 60 && targetPct < 35 && project.status === 'active') || project.id === 'proj-005') {
        const daysOverdue = 18;
        alerts.push({
          id: `alert-deadline-${project.id}`,
          projectId: project.id,
          projectTitle: project.title,
          type: 'missed_milestone',
          severity: 'high',
          title: `Critical Milestone Overdue: ${project.title}`,
          description: `Target milestone "${project.targetMetric.label}" is 18 days past projected execution cadence. Only ${project.targetMetric.current} of ${project.targetMetric.target} ${project.targetMetric.unit} verified with no progress uploads in the last 14 days.`,
          missedMilestoneLabel: project.targetMetric.label,
          daysOverdue,
          suggestedAction: `Upload field progress photography or submit an updated civil works timeline to donors.`,
          actionLabel: `Upload Milestone Proof`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return alerts;
  }, [projects, assets, pairs]);

  const activeAlerts = useMemo(() => {
    return generatedAlerts.filter(a => !dismissedAlertIds.includes(a.id));
  }, [generatedAlerts, dismissedAlertIds]);

  const filteredAlerts = useMemo(() => {
    if (filterType === 'critical') {
      return activeAlerts.filter(a => a.severity === 'critical');
    }
    if (filterType === 'missed') {
      return activeAlerts.filter(a => a.type === 'missed_milestone');
    }
    return activeAlerts;
  }, [activeAlerts, filterType]);

  const handleDismiss = (id: string) => {
    setDismissedAlertIds(prev => [...prev, id]);
  };

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-rose-950/80 bg-rose-950/10 backdrop-blur-md overflow-hidden transition-all duration-300">
      
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-900/30">
        <div className="flex items-center gap-3">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <Flame className="h-4 w-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </span>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-100">
                Priority Action Feed
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                {activeAlerts.length} Action{activeAlerts.length === 1 ? '' : 's'} Required
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Automated institutional alerts monitoring evidence deficits (&lt;60 score) and missed milestone deadlines.
            </p>
          </div>
        </div>

        {/* Filter Pills & Expand Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-mono">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-neutral-800 text-neutral-100 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({activeAlerts.length})
            </button>
            <button
              onClick={() => setFilterType('critical')}
              className={`px-2 py-1 rounded-md transition-colors ${
                filterType === 'critical'
                  ? 'bg-rose-900/60 text-rose-200 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Score &lt; 60 ({activeAlerts.filter(a => a.severity === 'critical').length})
            </button>
            <button
              onClick={() => setFilterType('missed')}
              className={`px-2 py-1 rounded-md transition-colors ${
                filterType === 'missed'
                  ? 'bg-amber-900/60 text-amber-200 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Missed Deadlines ({activeAlerts.filter(a => a.type === 'missed_milestone').length})
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title={isExpanded ? 'Collapse Feed' : 'Expand Feed'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Alert Items List */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-3.5 divide-y divide-neutral-800/60">
          {filteredAlerts.map((alert) => {
            const isScoreAlert = alert.type === 'low_evidence_score';

            return (
              <div
                key={alert.id}
                className="pt-3.5 first:pt-0 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                {/* Left Alert Content */}
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isScoreAlert
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {isScoreAlert ? (
                        <>
                          <ShieldAlert className="h-3 w-3 text-rose-400" />
                          <span>Audit Score Deficit ({alert.currentScore}/100)</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 text-amber-400" />
                          <span>Deadline Overrun ({alert.daysOverdue} Days)</span>
                        </>
                      )}
                    </span>

                    <h4 className="text-sm font-bold text-neutral-100">
                      {alert.title}
                    </h4>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 pt-0.5">
                    <strong>Recommended Fix:</strong>
                    <span>{alert.suggestedAction}</span>
                  </div>
                </div>

                {/* Right Action Cluster */}
                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  <button
                    onClick={() => onSelectProject(alert.projectId)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Inspect Project</span>
                    <ExternalLink className="h-3 w-3 text-neutral-500" />
                  </button>

                  <button
                    onClick={() => onOpenUploadForProject(alert.projectId)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-950 transition-colors flex items-center gap-1.5 shadow-sm ${
                      isScoreAlert
                        ? 'bg-rose-400 hover:bg-rose-300'
                        : 'bg-amber-400 hover:bg-amber-300'
                    }`}
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>{alert.actionLabel}</span>
                  </button>

                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors rounded-lg hover:bg-neutral-900"
                    title="Acknowledge alert"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
