import React, { useRef, useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MediaAsset } from '../../types';

interface ProjectInteractiveTimelineProps {
  assets: MediaAsset[];
  projectTitle: string;
  onSelectAsset?: (asset: MediaAsset) => void;
}

export const ProjectInteractiveTimeline: React.FC<ProjectInteractiveTimelineProps> = ({
  assets,
  projectTitle,
  onSelectAsset,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<'all' | 'before' | 'during' | 'after'>('all');

  // Sort assets chronologically
  const sortedAssets = [...assets].sort((a, b) => {
    return new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime();
  });

  const filteredAssets = stageFilter === 'all' 
    ? sortedAssets 
    : sortedAssets.filter(a => a.stage === stageFilter);

  // Calculate timeline range
  const startDate = sortedAssets.length > 0 ? new Date(sortedAssets[0].capturedAt) : null;
  const endDate = sortedAssets.length > 0 ? new Date(sortedAssets[sortedAssets.length - 1].capturedAt) : null;
  const totalDays = startDate && endDate 
    ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'before':
        return {
          pill: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
          dot: 'bg-amber-400 shadow-amber-400/40',
          ring: 'border-amber-500/40',
          bg: 'bg-amber-500/10',
          label: 'Baseline Phase',
        };
      case 'during':
        return {
          pill: 'bg-sky-950/80 text-sky-400 border-sky-800/80',
          dot: 'bg-sky-400 shadow-sky-400/40',
          ring: 'border-sky-500/40',
          bg: 'bg-sky-500/10',
          label: 'Intervention In-Progress',
        };
      case 'after':
        return {
          pill: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
          dot: 'bg-emerald-400 shadow-emerald-400/40',
          ring: 'border-emerald-500/40',
          bg: 'bg-emerald-500/10',
          label: 'Impact Verified',
        };
      default:
        return {
          pill: 'bg-neutral-800 text-neutral-300 border-neutral-700',
          dot: 'bg-neutral-400 shadow-neutral-400/40',
          ring: 'border-neutral-600',
          bg: 'bg-neutral-800/20',
          label: 'Milestone',
        };
    }
  };

  const selectedAsset = sortedAssets.find((a) => a.id === selectedAssetId);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm space-y-4">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-100">
                Chronological Media Journey & Milestones
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                {sortedAssets.length} Captures · {totalDays} Days Span
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Interactive timeline mapping media assets by their original capture date and Cloudinary AI stage classification.
            </p>
          </div>
        </div>

        {/* Stage Filter Buttons & Navigation Arrows */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Stage Filters */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setStageFilter('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                stageFilter === 'all'
                  ? 'bg-neutral-800 text-neutral-100 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStageFilter('before')}
              className={`px-2 py-1 rounded-md transition-colors ${
                stageFilter === 'before'
                  ? 'bg-amber-950/80 text-amber-400 font-medium border border-amber-800/60'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Before
            </button>
            <button
              onClick={() => setStageFilter('during')}
              className={`px-2 py-1 rounded-md transition-colors ${
                stageFilter === 'during'
                  ? 'bg-sky-950/80 text-sky-400 font-medium border border-sky-800/60'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              During
            </button>
            <button
              onClick={() => setStageFilter('after')}
              className={`px-2 py-1 rounded-md transition-colors ${
                stageFilter === 'after'
                  ? 'bg-emerald-950/80 text-emerald-400 font-medium border border-emerald-800/60'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              After
            </button>
          </div>

          {/* Left / Right Nav Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-colors"
              title="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-colors"
              title="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline Track */}
      <div className="relative pt-6 pb-2">
        {/* Continuous Progress Guideline */}
        <div className="absolute top-10 left-6 right-6 h-0.5 bg-gradient-to-r from-amber-500/40 via-sky-500/40 to-emerald-500/40 pointer-events-none" />

        <div
          ref={scrollContainerRef}
          className="flex items-start gap-4 overflow-x-auto pb-4 pt-1 px-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-neutral-950 scroll-smooth"
        >
          {filteredAssets.map((asset, index) => {
            const colors = getStageColor(asset.stage);
            const isSelected = selectedAssetId === asset.id;
            const captureDate = new Date(asset.capturedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={asset.id}
                onClick={() => {
                  setSelectedAssetId(isSelected ? null : asset.id);
                  if (onSelectAsset) onSelectAsset(asset);
                }}
                className={`relative flex-shrink-0 w-64 rounded-xl border p-3.5 transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-emerald-500 bg-neutral-900/90 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/20 -translate-y-1'
                    : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                {/* Milestone Node on Guide Line */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full border-2 border-neutral-950 shadow-md ${colors.dot} group-hover:scale-125 transition-transform`}
                  />
                  <span className="text-[9px] font-mono text-neutral-500 mt-0.5">
                    #{index + 1}
                  </span>
                </div>

                {/* Top Card Info: Stage Pill and Date */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${colors.pill}`}
                  >
                    {asset.stage}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-neutral-500" />
                    {captureDate}
                  </span>
                </div>

                {/* Thumbnail Preview */}
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-neutral-900 mb-2.5 border border-neutral-800 group-hover:border-neutral-700">
                  <img
                    src={asset.transformations?.thumbnailUrl || asset.url}
                    alt={asset.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {asset.verifiedIntegrity && (
                    <span
                      title="SHA-256 Verified Tamper-Proof"
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-neutral-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40"
                    >
                      <ShieldCheck className="h-3 w-3" />
                    </span>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono text-neutral-300">
                    {asset.resourceType.toUpperCase()}
                  </span>
                </div>

                {/* Title & Description */}
                <h4 className="text-xs font-semibold text-neutral-100 group-hover:text-emerald-300 transition-colors line-clamp-1 mb-1">
                  {asset.title}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mb-2">
                  {asset.description}
                </p>

                {/* Metadata Footer: Location & AI Tags */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1 truncate font-mono">
                    <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{asset.location.name}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 2).map((t, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-[9px]"
                      >
                        #{t}
                      </span>
                    ))}
                    {asset.tags.length > 2 && (
                      <span className="text-[9px] text-neutral-500">
                        +{asset.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Asset Quick-Inspector Preview (when an asset node is clicked) */}
      {selectedAsset && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={selectedAsset.transformations?.thumbnailUrl || selectedAsset.url}
              alt={selectedAsset.title}
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-lg object-cover border border-emerald-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-300">{selectedAsset.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 uppercase">
                  {selectedAsset.stage}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Captured {new Date(selectedAsset.capturedAt).toLocaleDateString()} at {selectedAsset.location.name} · SHA-256: {selectedAsset.trustPassport.sha256Hash.substring(0, 16)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {onSelectAsset && (
              <button
                onClick={() => onSelectAsset(selectedAsset)}
                className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <span>View Full Evidence</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={() => setSelectedAssetId(null)}
              className="text-neutral-400 hover:text-neutral-200 text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
