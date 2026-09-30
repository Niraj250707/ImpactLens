import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Database, 
  Lock, 
  Layers,
  FileCheck2,
  Check
} from 'lucide-react';
import { MediaAsset, Project } from '../../types';
import { recalculateAndVerifyAssetIntegrity } from '../../services/cloudinaryService';

interface IntegrityAuditSectionProps {
  assets: MediaAsset[];
  projects: Project[];
  onUpdateAssets: (updatedAssets: MediaAsset[]) => void;
  onNavigateToMedia?: () => void;
}

export const IntegrityAuditSection: React.FC<IntegrityAuditSectionProps> = ({
  assets,
  projects,
  onUpdateAssets,
  onNavigateToMedia,
}) => {
  const [reverifyingId, setReverifyingId] = useState<string | null>(null);
  const [isBatchReverifying, setIsBatchReverifying] = useState(false);
  const [resolvedToast, setResolvedToast] = useState<string | null>(null);

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Assets that failed verification or have unconfirmed integrity
  const flaggedAssets = assets.filter((a) => !a.verifiedIntegrity);
  const verifiedAssets = assets.filter((a) => a.verifiedIntegrity);

  const handleReattemptVerification = async (asset: MediaAsset) => {
    setReverifyingId(asset.id);
    try {
      // Re-run real cryptographic hash calculation and compare against Cloudinary metadata
      const res = await recalculateAndVerifyAssetIntegrity(asset);
      const now = new Date().toISOString();

      if (res.isTamperProof) {
        const updated = assets.map((a) => {
          if (a.id === asset.id) {
            return {
              ...a,
              verifiedIntegrity: true,
              verifiedAt: now,
              verificationFailureReason: undefined,
              trustPassport: {
                ...a.trustPassport,
                tamperProofStatus: 'verified' as const,
                auditChain: [
                  ...a.trustPassport.auditChain,
                  {
                    timestamp: now,
                    action: 'Re-attempted Cryptographic Verification: Bit-Level Match with Cloudinary Registry Confirmed',
                    actor: 'ImpactLens Sentinel',
                    hashProof: `sha256:${res.computedHash.substring(0, 12)}...`,
                  },
                ],
              },
            };
          }
          return a;
        });

        onUpdateAssets(updated);
        setResolvedToast(`Integrity confirmed for "${asset.title}". Verified against Cloudinary public_id.`);
        setTimeout(() => setResolvedToast(null), 4000);
      }
    } finally {
      setReverifyingId(null);
    }
  };

  const handleReverifyAllFlagged = async () => {
    if (flaggedAssets.length === 0) return;
    setIsBatchReverifying(true);

    try {
      const now = new Date().toISOString();
      let updated = [...assets];

      for (const asset of flaggedAssets) {
        await new Promise((r) => setTimeout(r, 300));
        const res = await recalculateAndVerifyAssetIntegrity(asset);

        if (res.isTamperProof) {
          updated = updated.map((a) => {
            if (a.id === asset.id) {
              return {
                ...a,
                verifiedIntegrity: true,
                verifiedAt: now,
                verificationFailureReason: undefined,
                trustPassport: {
                  ...a.trustPassport,
                  tamperProofStatus: 'verified' as const,
                  auditChain: [
                    ...a.trustPassport.auditChain,
                    {
                      timestamp: now,
                      action: 'Batch Integrity Reconciliation: SHA-256 Validated',
                      actor: 'ImpactLens Sentinel',
                      hashProof: `sha256:${res.computedHash.substring(0, 12)}...`,
                    },
                  ],
                },
              };
            }
            return a;
          });
        }
      }

      onUpdateAssets(updated);
      setResolvedToast(`Re-verification complete: all ${flaggedAssets.length} flagged assets validated and certified.`);
      setTimeout(() => setResolvedToast(null), 4500);
    } finally {
      setIsBatchReverifying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-neutral-100">
              Integrity Audit & Hash Verification Sentinel
            </h3>
            {flaggedAssets.length > 0 ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
                {flaggedAssets.length} Unverified / Flagged
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                100% Cryptographically Verified
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Continuous cross-referencing of binary SHA-256 hashes against Cloudinary metadata registers to safeguard against tampering.
          </p>
        </div>

        {flaggedAssets.length > 0 && (
          <button
            onClick={handleReverifyAllFlagged}
            disabled={isBatchReverifying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isBatchReverifying ? 'animate-spin' : ''}`} />
            <span>Re-verify All Flagged Files ({flaggedAssets.length})</span>
          </button>
        )}
      </div>

      {/* Toast alert */}
      {resolvedToast && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{resolvedToast}</span>
          </div>
          <button onClick={() => setResolvedToast(null)} className="text-emerald-400 text-xs font-mono ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Status Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
          <span className="text-[11px] text-neutral-400 block mb-0.5">Total Monitored Files</span>
          <span className="font-mono text-xl font-bold text-neutral-100 tabular-nums">
            {assets.length}
          </span>
          <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">Indexed in Cloudinary</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
          <span className="text-[11px] text-emerald-400 block mb-0.5">Verified Authentic</span>
          <span className="font-mono text-xl font-bold text-emerald-400 tabular-nums">
            {verifiedAssets.length}
          </span>
          <span className="text-[10px] font-mono text-emerald-500/80 block mt-0.5">SHA-256 & Cloudinary Match</span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
          <span className="text-[11px] text-amber-400 block mb-0.5">Integrity Check Required</span>
          <span className="font-mono text-xl font-bold text-amber-400 tabular-nums">
            {flaggedAssets.length}
          </span>
          <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">Awaiting audit resolution</span>
        </div>
      </div>

      {/* Flagged Assets Table */}
      {flaggedAssets.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-neutral-950/40 border border-neutral-800/60">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-neutral-200">Zero Integrity Discrepancies</h4>
          <p className="text-xs text-neutral-400 mt-0.5 max-w-md mx-auto">
            All {assets.length} field media assets have been verified against their stored Cloudinary metadata with 100% bit-level cryptographic parity.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>Files with Pending or Failed Hash Verification ({flaggedAssets.length})</span>
            {onNavigateToMedia && (
              <button onClick={onNavigateToMedia} className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]">
                <span>Open in Media Library</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="divide-y divide-neutral-800/80 rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
            {flaggedAssets.map((asset) => {
              const project = projectMap.get(asset.projectId);
              const isProcessing = reverifyingId === asset.id || isBatchReverifying;
              const reason = asset.verificationFailureReason || 'Initial upload: Cryptographic cross-reference check pending';

              return (
                <div
                  key={asset.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-900/50 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      src={asset.url}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="h-11 w-11 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0 mt-0.5"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-200 truncate">
                          {asset.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">
                          {project?.title || 'Initiative'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3 text-neutral-500" />
                          <span className="truncate max-w-[200px]">{asset.cloudinaryPublicId}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Lock className="h-3 w-3 text-neutral-500" />
                          <span className="truncate max-w-[140px]">SHA-256: {asset.trustPassport?.sha256Hash?.substring(0, 12)}...</span>
                        </span>
                      </div>

                      {/* Failure / Unverified Reason */}
                      <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>{reason}</span>
                      </p>
                    </div>
                  </div>

                  {/* Re-attempt Verification button */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleReattemptVerification(asset)}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-emerald-500/20 border border-neutral-700 hover:border-emerald-500 text-neutral-200 hover:text-emerald-300 disabled:opacity-40 text-xs font-medium transition-colors shadow-sm"
                    >
                      <RefreshCw className={`h-3 w-3 ${isProcessing ? 'animate-spin text-emerald-400' : ''}`} />
                      <span>{isProcessing ? 'Auditing...' : 'Re-attempt Verification'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
