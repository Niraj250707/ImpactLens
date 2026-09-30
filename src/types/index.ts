export type ProjectCategory = 
  | 'Afforestation'
  | 'River & Water'
  | 'Education & School'
  | 'Renewable Energy'
  | 'Waste Management'
  | 'Community Health';

export type ProjectStatus = 'active' | 'completed' | 'monitoring';

export type MediaStage = 'before' | 'during' | 'after' | 'monitoring';

export type UserRole = 
  | 'NGO Director' 
  | 'Field Coordinator' 
  | 'M&E Auditor' 
  | 'CSR / Donor Partner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl: string;
}

export interface DetectedObject {
  name: string;
  confidence: number; // 0 to 1
  category: 'flora' | 'infrastructure' | 'human_activity' | 'water_body' | 'waste' | 'energy';
}

export interface QualityMetrics {
  resolution: string;
  lightingScore: number; // 0-100
  clarityScore: number;  // 0-100
  exifComplete: boolean;
}

export interface TrustPassport {
  sha256Hash: string;
  originalFileName: string;
  fileSizeBytes: number;
  mimeType: string;
  capturedAt: string;
  uploadedAt: string;
  cameraModel: string;
  focalLength: string;
  isoSpeed: number;
  tamperProofStatus: 'verified' | 'unaltered' | 'flagged';
  auditChain: {
    timestamp: string;
    action: string;
    actor: string;
    hashProof: string;
  }[];
}

export interface MediaAsset {
  id: string;
  projectId: string;
  title: string;
  description: string;
  cloudinaryPublicId: string;
  url: string;
  resourceType: 'image' | 'video';
  stage: MediaStage;
  location: {
    name: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
  };
  capturedAt: string;
  uploadedAt: string;
  tags: string[];
  aiAnalysis: {
    detectedObjects: DetectedObject[];
    scenes: string[];
    visualSignals: string[];
    confidenceScore: number;
    environmentalImpactScore: number; // 0-100
  };
  trustPassport: TrustPassport;
  transformations: {
    enhancedUrl: string;
    autoCroppedUrl: string;
    thumbnailUrl: string;
    clarityUrl: string;
  };
  verifiedIntegrity?: boolean;
  verifiedAt?: string;
  verificationFailureReason?: string;
  lastVerificationAttemptAt?: string;
  geminiMatchScore?: number;
  geminiReasoning?: string;
}

export interface BeforeAfterPair {
  id: string;
  projectId: string;
  title: string;
  beforeAssetId: string;
  afterAssetId: string;
  metricLabel: string;
  metricDelta: string;
  timelineDays: number;
  pairingScore: number; // 0-100 compatibility
  storyExcerpt: string;
  locationVerified: boolean;
}

export interface EvidenceScoreBreakdown {
  totalScore: number; // 0-100
  rating: 'Verified High Impact' | 'Adequate Documentation' | 'Needs Documentation';
  factors: {
    mediaVolume: { score: number; max: 25; description: string };
    beforeAfterProof: { score: number; max: 30; description: string };
    activityDiversity: { score: number; max: 20; description: string };
    temporalCoverage: { score: number; max: 15; description: string };
    trustIntegrity: { score: number; max: 10; description: string };
  };
  recommendations: string[];
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  location: {
    name: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
  };
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  targetMetric: {
    label: string;
    target: number;
    current: number;
    unit: string;
  };
  donorOrGrant: string;
  coverImageUrl: string;
  leadCoordinator: string;
  evidenceScore: number; // 0-100
  tags: string[];
}

export interface ImpactReport {
  id: string;
  projectId: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  generatedBy: string;
  executiveSummary: string;
  primaryMetric: {
    label: string;
    value: string;
    growth: string;
  };
  secondaryMetrics: {
    label: string;
    value: string;
  }[];
  featuredPairs: BeforeAfterPair[];
  supportingAssetIds: string[];
  evidenceScore: number;
  trustSealHash: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  isCustomConfigured: boolean;
}
