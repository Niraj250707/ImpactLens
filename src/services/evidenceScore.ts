import { Project, MediaAsset, BeforeAfterPair, EvidenceScoreBreakdown } from '../types';

/**
 * Calculates the Evidence Strength Score (0-100)
 * Evaluates documentation rigor across 5 core dimensions:
 * 1. Volume & Baseline Density (max 25)
 * 2. Before-After Visual Proof (max 30)
 * 3. Activity & Tag Diversity (max 20)
 * 4. Temporal Coverage / Timeline (max 15)
 * 5. Trust Passport & Integrity (max 10)
 */
export function calculateEvidenceScore(
  project: Project,
  assets: MediaAsset[],
  pairs: BeforeAfterPair[]
): EvidenceScoreBreakdown {
  const projectAssets = assets.filter((a) => a.projectId === project.id);
  const projectPairs = pairs.filter((p) => p.projectId === project.id);

  // 1. Volume & Density (0 - 25 pts)
  // At least 3 assets for minimum baseline; 8+ assets for full marks
  const assetCount = projectAssets.length;
  let volumeScore = 0;
  if (assetCount >= 8) volumeScore = 25;
  else if (assetCount >= 5) volumeScore = 20;
  else if (assetCount >= 3) volumeScore = 15;
  else if (assetCount >= 1) volumeScore = 8;

  // 2. Before-After Proof (0 - 30 pts)
  // Essential for NGOs to prove real change over time
  const hasBefore = projectAssets.some((a) => a.stage === 'before');
  const hasAfter = projectAssets.some((a) => a.stage === 'after');
  const verifiedPairsCount = projectPairs.length;

  let beforeAfterScore = 0;
  if (verifiedPairsCount >= 2) beforeAfterScore = 30;
  else if (verifiedPairsCount === 1) beforeAfterScore = 24;
  else if (hasBefore && hasAfter) beforeAfterScore = 15;
  else if (hasBefore || hasAfter) beforeAfterScore = 8;

  // 3. Activity & Tag Diversity (0 - 20 pts)
  // Ensures documentation captures multiple facets (e.g. baseline, workers, equipment, outcomes)
  const allTags = new Set(projectAssets.flatMap((a) => a.tags));
  const tagCount = allTags.size;
  let diversityScore = 0;
  if (tagCount >= 10) diversityScore = 20;
  else if (tagCount >= 6) diversityScore = 16;
  else if (tagCount >= 3) diversityScore = 11;
  else if (tagCount >= 1) diversityScore = 6;

  // 4. Temporal Coverage (0 - 15 pts)
  // Measures whether media spans different weeks/months rather than a single day photo-dump
  let temporalScore = 0;
  if (projectAssets.length >= 2) {
    const timestamps = projectAssets.map((a) => new Date(a.capturedAt).getTime()).sort((a, b) => a - b);
    const daySpan = (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24);
    if (daySpan >= 60) temporalScore = 15;
    else if (daySpan >= 21) temporalScore = 12;
    else if (daySpan >= 7) temporalScore = 8;
    else temporalScore = 4;
  } else if (projectAssets.length === 1) {
    temporalScore = 3;
  }

  // 5. Trust & Traceability Integrity (0 - 10 pts)
  // Verifies SHA-256 presence and intact audit chains
  const verifiedAssets = projectAssets.filter(
    (a) => a.trustPassport && a.trustPassport.tamperProofStatus === 'verified' && a.trustPassport.sha256Hash
  );
  const trustRatio = projectAssets.length > 0 ? verifiedAssets.length / projectAssets.length : 0;
  const trustScore = Math.round(trustRatio * 10);

  const totalScore = Math.min(100, Math.max(0, volumeScore + beforeAfterScore + diversityScore + temporalScore + trustScore));

  let rating: EvidenceScoreBreakdown['rating'] = 'Needs Documentation';
  if (totalScore >= 80) rating = 'Verified High Impact';
  else if (totalScore >= 55) rating = 'Adequate Documentation';

  // Actionable recommendations
  const recommendations: string[] = [];
  if (verifiedPairsCount === 0) {
    recommendations.push('Link at least one Before-and-After pair to provide verified visual proof of progress.');
  } else if (verifiedPairsCount === 1) {
    recommendations.push('Add a second Before-and-After comparison pair covering an additional sector or intervention zone.');
  }

  if (!hasBefore) {
    recommendations.push('Upload initial baseline (Before) images to record pre-intervention status.');
  }
  if (!hasAfter) {
    recommendations.push('Upload post-completion (After) photos to substantiate reported metrics.');
  }

  if (assetCount < 5) {
    recommendations.push(`Upload ${5 - assetCount} more field media assets to reach robust sampling density.`);
  }

  if (diversityScore < 16) {
    recommendations.push('Capture wider operational diversity: community meetings, technical monitoring, and material receipts.');
  }

  if (temporalScore < 12) {
    recommendations.push('Continue multi-week longitudinal monitoring to show lasting durability.');
  }

  return {
    totalScore,
    rating,
    factors: {
      mediaVolume: {
        score: volumeScore,
        max: 25,
        description: `${assetCount} assets uploaded across project milestones.`,
      },
      beforeAfterProof: {
        score: beforeAfterScore,
        max: 30,
        description: `${verifiedPairsCount} verified before-and-after pair${verifiedPairsCount === 1 ? '' : 's'} established.`,
      },
      activityDiversity: {
        score: diversityScore,
        max: 20,
        description: `${tagCount} unique visual and activity tags detected by Cloudinary AI.`,
      },
      temporalCoverage: {
        score: temporalScore,
        max: 15,
        description: 'Chronological timeline span across intervention stages.',
      },
      trustIntegrity: {
        score: trustScore,
        max: 10,
        description: `${Math.round(trustRatio * 100)}% assets with cryptographic SHA-256 audit proof.`,
      },
    },
    recommendations,
  };
}
