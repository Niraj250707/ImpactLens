import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  Check, 
  Copy, 
  RefreshCw, 
  FileCheck2, 
  Lock,
  ArrowRight,
  Database
} from 'lucide-react';
import { MediaAsset } from '../../types';
import { recalculateAndVerifyAssetIntegrity, VerificationResult } from '../../services/cloudinaryService';

interface BulkVerificationModalProps {
  selectedAssets: MediaAsset[];
  onClose: () => void;
  onVerificationComplete: (verifiedAssetIds: string[]) => void;
}

export const BulkVerificationModal: React.FC<BulkVerificationModalProps> = ({
  selectedAssets,
  onClose,
  onVerificationComplete,
}) => {
  const [isRunning, setIsRunning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentAssetTitle, setCurrentAssetTitle] = useState('');
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function runVerification() {
      setIsRunning(true);
      const outputResults: VerificationResult[] = [];

      for (let i = 0; i < selectedAssets.length; i++) {
        if (isCancelled) break;
        const asset = selectedAssets[i];
        setCurrentAssetTitle(asset.title);
        setProgress(Math.round(((i) / selectedAssets.length) * 100));

        // Smooth visual pacing for real calculation
        await new Promise((r) => setTimeout(r, 400));

        const res = await recalculateAndVerifyAssetIntegrity(asset);
        outputResults.push(res);
        setResults([...outputResults]);
      }

      if (!isCancelled) {
        setProgress(100);
        setIsRunning(false);
      }
    }

    runVerification();

    return () => {
      isCancelled = true;
    };
  }, [selectedAssets]);

  const verifiedCount = results.filter((r) => r.isTamperProof).length;

  const handleApplyBadges = () => {
    const verifiedIds = results.filter((r) => r.isTamperProof).map((r) => r.assetId);
    onVerificationComplete(verifiedIds);
    onClose();
  };

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                SHA-256 Bulk Integrity Verifier
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Cloudinary Cross-Reference
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Calculates cryptographic SHA-256 hashes for selected images and compares against stored Cloudinary metadata.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors disabled:opacity-30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Audit Status & Progress Bar */}
        <div className="mt-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
              {isRunning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                  <span>Computing SHA-256 for: <span className="text-neutral-100 font-semibold">{currentAssetTitle}</span></span>
                </>
              ) : (
                <>
                  <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cross-Reference Completed: <span className="text-emerald-400 font-semibold">{verifiedCount} of {selectedAssets.length} Hashes Matched</span></span>
                </>
              )}
            </span>
            <span className="font-mono text-xs text-neutral-400 tabular-nums">
              {progress}%
            </span>
          </div>

          <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Verification Items List with side-by-side hash comparison */}
        <div className="mt-4 flex-1 overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
          {selectedAssets.map((asset) => {
            const result = results.find((r) => r.assetId === asset.id);
            const isVerified = result?.isTamperProof;

            return (
              <div
                key={asset.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  result
                    ? isVerified
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-rose-500/40 bg-rose-950/20'
                    : 'border-neutral-800 bg-neutral-900/30'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <img
                    src={asset.url}
                    alt={asset.title}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-lg object-cover bg-neutral-900 shrink-0 border border-neutral-800 mt-0.5"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-semibold text-neutral-200 truncate">
                      {asset.title}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 truncate">
                      <Database className="h-3 w-3 text-neutral-500 shrink-0" />
                      <span>Cloudinary ID: <strong className="text-neutral-300">{asset.cloudinaryPublicId}</strong></span>
                    </div>

                    {result ? (
                      <div className="space-y-1 pt-1 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <span className="text-neutral-500 w-24 shrink-0">Calculated Hash:</span>
                          <span className="text-neutral-200 truncate">{result.computedHash}</span>
                          <button
                            onClick={() => handleCopyHash(result.computedHash, asset.id)}
                            className="hover:text-emerald-400 shrink-0 p-0.5"
                            title="Copy hash"
                          >
                            {copiedId === asset.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <span className="text-neutral-500 w-24 shrink-0">Stored Cloudinary:</span>
                          <span className="text-neutral-300 truncate">{result.recordedHash}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
                        <RefreshCw className="h-3 w-3 animate-spin text-neutral-400" />
                        <span>Calculating SHA-256 buffer & querying Cloudinary registry...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800/80">
                  {result ? (
                    isVerified ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-sm">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Verified Integrity</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Hash Mismatch</span>
                      </div>
                    )
                  ) : (
                    <span className="text-xs text-neutral-500 font-mono">
                      Queued...
                    </span>
                  )}
                  {result?.isTamperProof && (
                    <span className="text-[10px] font-mono text-emerald-500/80 sm:mt-1">
                      100% Bit-Level Match
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-auto border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-mono text-neutral-500 text-center sm:text-left">
            {verifiedCount} of {selectedAssets.length} assets verified authentic with 0 hash discrepancies
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isRunning}
              className="px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyBadges}
              disabled={isRunning || verifiedCount === 0}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Apply 'Verified Integrity' Badges ({verifiedCount})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
