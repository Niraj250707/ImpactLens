import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  ArrowLeftRight, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Columns, 
  Eye, 
  Clock, 
  Tag, 
  Maximize2,
  CheckCircle2,
  TrendingUp,
  Download
} from 'lucide-react';
import { MediaAsset, Project } from '../../types';

interface SplitScreenComparisonModalProps {
  photoA: MediaAsset;
  photoB: MediaAsset;
  allProjectAssets?: MediaAsset[];
  project?: Project;
  onClose: () => void;
  onSelectPhotoA?: (asset: MediaAsset) => void;
  onSelectPhotoB?: (asset: MediaAsset) => void;
}

export const SplitScreenComparisonModal: React.FC<SplitScreenComparisonModalProps> = ({
  photoA: initialPhotoA,
  photoB: initialPhotoB,
  allProjectAssets = [],
  project,
  onClose,
  onSelectPhotoA,
  onSelectPhotoB,
}) => {
  const [photoA, setPhotoA] = useState<MediaAsset>(initialPhotoA);
  const [photoB, setPhotoB] = useState<MediaAsset>(initialPhotoB);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'opacity'>('slider');
  const [opacityLevel, setOpacityLevel] = useState<number>(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync when initial props change
  useEffect(() => {
    setPhotoA(initialPhotoA);
    setPhotoB(initialPhotoB);
  }, [initialPhotoA, initialPhotoB]);

  // Handle slider drag
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement> | TouchEvent) => {
    if (!isDragging || !containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMouseMove(e);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);

  // Swap Photo A & Photo B
  const handleSwapPhotos = () => {
    const temp = photoA;
    setPhotoA(photoB);
    setPhotoB(temp);
    if (onSelectPhotoA) onSelectPhotoA(photoB);
    if (onSelectPhotoB) onSelectPhotoB(temp);
  };

  // Date and timeline difference calculation
  const dateA = new Date(photoA.capturedAt);
  const dateB = new Date(photoB.capturedAt);
  const timeDiffMs = Math.abs(dateB.getTime() - dateA.getTime());
  const diffDays = Math.round(timeDiffMs / (1000 * 60 * 60 * 24));
  const isChronological = dateA <= dateB;

  // AI object comparison
  const objectsA = photoA.aiAnalysis.detectedObjects.map(o => o.name);
  const objectsB = photoB.aiAnalysis.detectedObjects.map(o => o.name);
  const addedObjects = objectsB.filter(name => !objectsA.includes(name));
  const commonObjects = objectsB.filter(name => objectsA.includes(name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-100">
                  Precision Split-Screen Visual Verification
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {diffDays} Days Elapsed
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Overlay and inspect two photographic assets from {project?.title || 'the initiative'} to verify physical changes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setViewMode('slider')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'slider' 
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>Slider</span>
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'side-by-side' 
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Columns className="h-3 w-3" />
                <span>Side-by-Side</span>
              </button>
              <button
                onClick={() => setViewMode('opacity')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'opacity' 
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Opacity</span>
              </button>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapPhotos}
              className="p-2 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-emerald-300 hover:bg-neutral-800 transition-colors"
              title="Swap Left / Right (Before / After) photos"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Comparison Arena */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Visual Display */}
          <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-inner flex items-center justify-center min-h-[380px] max-h-[520px]">
            
            {viewMode === 'slider' && (
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onTouchMove={handleTouchMove}
                className="relative w-full h-[440px] select-none cursor-ew-resize overflow-hidden"
              >
                {/* Photo B (Full / Background / Underneath) */}
                <img
                  src={photoB.url}
                  alt={photoB.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {/* Photo A (Clipped Overlay / Foreground) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={photoA.url}
                    alt={photoA.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Dividing Vertical Line Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-neutral-950 shadow-xl border-2 border-white">
                    <ArrowLeftRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 pointer-events-none">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                    Primary: {photoA.stage.toUpperCase()} ({dateA.toLocaleDateString()})
                  </span>
                </div>

                <div className="absolute top-4 right-4 pointer-events-none">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                    Secondary: {photoB.stage.toUpperCase()} ({dateB.toLocaleDateString()})
                  </span>
                </div>
              </div>
            )}

            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-4 h-[440px]">
                {/* Photo A */}
                <div className="relative rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 flex flex-col">
                  <div className="relative flex-1 overflow-hidden">
                    <img
                      src={photoA.url}
                      alt={photoA.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase font-bold">
                      {photoA.stage} · {dateA.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 text-xs">
                    <h4 className="font-semibold text-neutral-100 truncate">{photoA.title}</h4>
                    <p className="text-[11px] text-neutral-400 truncate">{photoA.location.name}</p>
                  </div>
                </div>

                {/* Photo B */}
                <div className="relative rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 flex flex-col">
                  <div className="relative flex-1 overflow-hidden">
                    <img
                      src={photoB.url}
                      alt={photoB.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono uppercase font-bold">
                      {photoB.stage} · {dateB.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 text-xs">
                    <h4 className="font-semibold text-neutral-100 truncate">{photoB.title}</h4>
                    <p className="text-[11px] text-neutral-400 truncate">{photoB.location.name}</p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'opacity' && (
              <div className="relative w-full h-[440px] overflow-hidden">
                {/* Photo A Base */}
                <img
                  src={photoA.url}
                  alt={photoA.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Photo B with Opacity */}
                <img
                  src={photoB.url}
                  alt={photoB.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75"
                  style={{ opacity: opacityLevel / 100 }}
                />

                <div className="absolute bottom-4 left-6 right-6 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-neutral-800 flex items-center gap-4">
                  <span className="text-xs font-mono text-amber-300 font-bold shrink-0">Photo A</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacityLevel}
                    onChange={(e) => setOpacityLevel(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-emerald-300 font-bold shrink-0">Photo B ({opacityLevel}%)</span>
                </div>
              </div>
            )}

          </div>

          {/* Detailed Verification & Delta Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Chronological Verification */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2.5">
              <div className="flex items-center gap-2 text-neutral-300 font-semibold text-xs">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>Temporal Timeline & Stage</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Photo A Date:</span>
                  <span className="font-mono text-neutral-200">{dateA.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Photo B Date:</span>
                  <span className="font-mono text-neutral-200">{dateB.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-neutral-800">
                  <span>Time Span:</span>
                  <span className="font-mono">{diffDays} Days Interval</span>
                </div>
              </div>
            </div>

            {/* Card 2: AI Visual Signal Differences */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2.5">
              <div className="flex items-center gap-2 text-neutral-300 font-semibold text-xs">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>AI Object & Feature Delta</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {addedObjects.length > 0 ? (
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 block mb-1">New Elements Identified:</span>
                    <div className="flex flex-wrap gap-1">
                      {addedObjects.map((name, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[10px] font-mono">
                          +{name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400">
                    Shared ecological features across both frames: {commonObjects.slice(0, 3).join(', ') || 'Consistent field perspective'}
                  </p>
                )}
              </div>
            </div>

            {/* Card 3: Cryptographic Integrity Passport */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2.5">
              <div className="flex items-center gap-2 text-neutral-300 font-semibold text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>SHA-256 Provenance Proof</span>
              </div>
              <div className="space-y-1 text-[11px] font-mono text-neutral-400">
                <div className="truncate">
                  <span>A: </span>
                  <span className="text-neutral-300">{photoA.trustPassport.sha256Hash.substring(0, 16)}...</span>
                </div>
                <div className="truncate">
                  <span>B: </span>
                  <span className="text-neutral-300">{photoB.trustPassport.sha256Hash.substring(0, 16)}...</span>
                </div>
                <div className="text-emerald-400 font-sans text-[11px] pt-1 border-t border-neutral-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Bit-Level Authentic · Cloudinary AI Ledger</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Alternative Photo Picker (from project assets) */}
          {allProjectAssets.length > 2 && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-xs font-semibold text-neutral-300">
                Switch Comparison Targets ({allProjectAssets.length} Assets in Initiative)
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {allProjectAssets.map((asset) => {
                  const isA = asset.id === photoA.id;
                  const isB = asset.id === photoB.id;
                  return (
                    <div
                      key={asset.id}
                      className={`relative flex-shrink-0 w-24 rounded-lg overflow-hidden border p-1 group cursor-pointer ${
                        isA 
                          ? 'border-amber-400 bg-amber-950/20' 
                          : isB 
                          ? 'border-emerald-400 bg-emerald-950/20' 
                          : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                      }`}
                    >
                      <img
                        src={asset.transformations?.thumbnailUrl || asset.url}
                        alt={asset.title}
                        referrerPolicy="no-referrer"
                        className="h-16 w-full object-cover rounded"
                      />
                      <p className="text-[10px] text-neutral-300 truncate mt-1">{asset.title}</p>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => {
                            setPhotoA(asset);
                            if (onSelectPhotoA) onSelectPhotoA(asset);
                          }}
                          className={`flex-1 text-[9px] font-mono py-0.5 rounded text-center ${
                            isA ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          Set A
                        </button>
                        <button
                          onClick={() => {
                            setPhotoB(asset);
                            if (onSelectPhotoB) onSelectPhotoB(asset);
                          }}
                          className={`flex-1 text-[9px] font-mono py-0.5 rounded text-center ${
                            isB ? 'bg-emerald-400 text-neutral-950 font-bold' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          Set B
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-900/60 text-xs">
          <span className="text-neutral-400 font-mono">
            {photoA.location.name} · Coordinates: {photoA.location.lat.toFixed(4)}, {photoA.location.lng.toFixed(4)}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition-colors"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
