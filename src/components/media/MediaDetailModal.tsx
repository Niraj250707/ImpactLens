import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, Sparkles, Sliders, MapPin, Calendar, Camera, FileText } from 'lucide-react';
import { MediaAsset, Project } from '../../types';

interface MediaDetailModalProps {
  asset: MediaAsset | null;
  project?: Project;
  onClose: () => void;
  onCompareWithThis?: (assetId: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  asset,
  project,
  onClose,
  onCompareWithThis,
}) => {
  if (!asset) return null;

  const [activeTransformation, setActiveTransformation] = useState<'original' | 'enhance' | 'crop' | 'clarity' | 'grayscale'>('original');
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    if (asset.trustPassport?.sha256Hash) {
      navigator.clipboard.writeText(asset.trustPassport.sha256Hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'before': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'after': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'during': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      default: return 'text-neutral-400 bg-neutral-800 border-neutral-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded border ${getStageColor(asset.stage)}`}>
              Stage: {asset.stage.toUpperCase()}
            </span>
            <h2 className="text-base font-semibold text-neutral-100 truncate max-w-md sm:max-w-lg">
              {asset.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Split into Visual/Transformation Area & Intelligence/Trust Area */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Image & Cloudinary Transformation Controls (7 cols) */}
          <div className="lg:col-span-7 p-5 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-950">
            {/* Visual Canvas */}
            <div className="relative flex-1 min-h-[320px] max-h-[460px] rounded-xl overflow-hidden bg-neutral-900/80 border border-neutral-800 flex items-center justify-center">
              <img
                src={
                  activeTransformation === 'enhance'
                    ? asset.transformations.enhancedUrl
                    : activeTransformation === 'crop'
                    ? asset.transformations.autoCroppedUrl
                    : activeTransformation === 'clarity'
                    ? asset.transformations.clarityUrl
                    : asset.url
                }
                alt={asset.title}
                referrerPolicy="no-referrer"
                className={`max-h-full max-w-full object-contain transition-all duration-300 ${
                  activeTransformation === 'grayscale' ? 'grayscale contrast-125' : ''
                }`}
              />

              {/* Transformation Badge overlay */}
              <div className="absolute top-3 left-3">
                <span className="text-[11px] font-mono px-2 py-1 rounded bg-neutral-950/80 border border-neutral-700 text-emerald-300 backdrop-blur-md">
                  Cloudinary Mode: {activeTransformation.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Cloudinary Transformation Controls bar */}
            <div className="mt-4 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-neutral-200">Cloudinary AI Transformation Tester</span>
                </div>
                <span className="font-mono text-[10px] text-neutral-500">Live API Transformations</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                <button
                  onClick={() => setActiveTransformation('original')}
                  className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    activeTransformation === 'original'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  Original File
                </button>
                <button
                  onClick={() => setActiveTransformation('enhance')}
                  className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    activeTransformation === 'enhance'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  AI Auto-Enhance
                </button>
                <button
                  onClick={() => setActiveTransformation('crop')}
                  className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    activeTransformation === 'crop'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  Smart Crop (g_auto)
                </button>
                <button
                  onClick={() => setActiveTransformation('clarity')}
                  className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    activeTransformation === 'clarity'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  Auto Quality (f/q_auto)
                </button>
                <button
                  onClick={() => setActiveTransformation('grayscale')}
                  className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    activeTransformation === 'grayscale'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  Edge Grayscale
                </button>
              </div>
            </div>

            {/* Quick action: use for Before-After comparison */}
            {onCompareWithThis && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => onCompareWithThis(asset.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  Pair in Before-and-After Studio
                </button>
              </div>
            )}
          </div>

          {/* Right Column: AI Understanding & Trust Passport (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto bg-neutral-950/70">
            
            {/* Section 1: Overview & Location */}
            <div className="space-y-2">
              <p className="text-xs text-neutral-300 leading-relaxed">
                {asset.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {asset.location.name}, {asset.location.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                  {new Date(asset.capturedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            </div>

            {/* Section 2: AI Media Understanding (Cloudinary AI) */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-neutral-200">Cloudinary AI Content Analysis</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-400">
                  {Math.round(asset.aiAnalysis.confidenceScore * 100)}% Confidence
                </span>
              </div>

              {/* Detected Objects with confidence bars */}
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Detected Objects & Classification
                </p>
                {asset.aiAnalysis.detectedObjects.map((obj, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-200">{obj.name}</span>
                      <span className="font-mono text-neutral-400 text-[11px]">
                        {Math.round(obj.confidence * 100)}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400/80 rounded-full"
                        style={{ width: `${obj.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Signals / Keywords */}
              <div className="mt-3 pt-3 border-t border-neutral-800/80">
                <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                  Visual Signals & Keywords
                </p>
                <div className="flex flex-wrap gap-1">
                  {asset.aiAnalysis.visualSignals.map((sig, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-neutral-300 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Trust Passport & Cryptographic Traceability */}
            <div className="rounded-xl border border-emerald-950/80 bg-neutral-900/60 p-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-neutral-200">Trust Passport™ Traceability</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {asset.verifiedIntegrity && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      Verified Integrity
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {asset.trustPassport.tamperProofStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* SHA-256 Hash box with 1-click copy */}
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-400">Cryptographic SHA-256 Digest:</span>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300">
                  <span className="truncate">{asset.trustPassport.sha256Hash}</span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1 text-neutral-400 hover:text-emerald-400 transition-colors shrink-0"
                    title="Copy full cryptographic hash"
                  >
                    {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Metadata specs */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400">
                <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-500 block">Original Filename:</span>
                  <span className="text-neutral-200 truncate block">{asset.trustPassport.originalFileName}</span>
                </div>
                <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-500 block">File Size:</span>
                  <span className="text-neutral-200 block">
                    {(asset.trustPassport.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-500 block">Camera Hardware:</span>
                  <span className="text-neutral-200 truncate block">{asset.trustPassport.cameraModel}</span>
                </div>
                <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-neutral-500 block">Cloudinary Public ID:</span>
                  <span className="text-neutral-200 truncate block">{asset.cloudinaryPublicId}</span>
                </div>
              </div>

              {/* Audit Chain */}
              <div className="mt-3 pt-2 border-t border-neutral-800/80">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-1">
                  Immutable Audit Chain
                </span>
                <div className="space-y-1.5">
                  {asset.trustPassport.auditChain.map((entry, idx) => (
                    <div key={idx} className="text-[11px] leading-tight flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono">▸</span>
                      <div>
                        <span className="text-neutral-300 font-medium">{entry.action}</span>
                        <span className="text-neutral-500 ml-1">by {entry.actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
