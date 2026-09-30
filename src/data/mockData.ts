import { Project, MediaAsset, BeforeAfterPair, UserProfile, ImpactReport } from '../types';

import plantationImg from '../assets/images/plantation_sapling_field_1790778848898.jpg';
import riverImg from '../assets/images/river_cleanup_field_1790778860766.jpg';
import classroomImg from '../assets/images/school_stem_classroom_1790778873806.jpg';
import solarImg from '../assets/images/solar_microgrid_village_1790778887930.jpg';

export const CURRENT_USER: UserProfile = {
  id: 'usr-902',
  name: 'Ananya Deshmukh',
  email: 'ananya.deshmukh@earthforward.org',
  role: 'NGO Director',
  organization: 'EarthForward Foundation & Partners',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    title: 'Western Ghats Bio-Corridor Reforestation',
    category: 'Afforestation',
    description: 'Restoration of degraded monoculture land into high-biodiversity indigenous rainforest corridors connecting Wayanad and Nilgiri reserves.',
    location: {
      name: 'Wayanad High Ranges',
      state: 'Kerala',
      country: 'India',
      lat: 11.6854,
      lng: 76.1320,
    },
    status: 'active',
    startDate: '2024-04-10',
    targetMetric: {
      label: 'Native Saplings Established',
      target: 50000,
      current: 42350,
      unit: 'trees',
    },
    donorOrGrant: 'Global Rainforest Alliance Grant #RA-2024-91',
    coverImageUrl: plantationImg,
    leadCoordinator: 'Rajan Pillai (Field Botanist)',
    evidenceScore: 92,
    tags: ['reforestation', 'biodiversity', 'native species', 'canopy cover', 'field survey'],
  },
  {
    id: 'proj-002',
    title: 'Brahmaputra River Basin Debris Mitigation',
    category: 'River & Water',
    description: 'Community-led plastic interception, riverbank bioremediation, and water quality restoration across vulnerable riparian channels.',
    location: {
      name: 'Guwahati Outskirts & Barpeta Buffer',
      state: 'Assam',
      country: 'India',
      lat: 26.1445,
      lng: 91.7362,
    },
    status: 'active',
    startDate: '2024-06-15',
    targetMetric: {
      label: 'Plastic Waste Neutralized',
      target: 50,
      current: 38.6,
      unit: 'tons',
    },
    donorOrGrant: 'Clean Rivers Collective CSR Fund',
    coverImageUrl: riverImg,
    leadCoordinator: 'Hemanta Deka (Hydrology Lead)',
    evidenceScore: 88,
    tags: ['river cleanup', 'water quality', 'plastic interceptor', 'turbidity reduction', 'community action'],
  },
  {
    id: 'proj-003',
    title: 'Rajasthan Rural Girls STEM Lab & Solar Classrooms',
    category: 'Education & School',
    description: 'Transforming deteriorating village schools into climate-resilient, solar-powered learning sanctuaries with modern science and computing kits.',
    location: {
      name: 'Barmer District Rural Block',
      state: 'Rajasthan',
      country: 'India',
      lat: 25.7532,
      lng: 71.3967,
    },
    status: 'completed',
    startDate: '2024-01-20',
    endDate: '2024-08-30',
    targetMetric: {
      label: 'Classrooms Modernized',
      target: 14,
      current: 14,
      unit: 'labs',
    },
    donorOrGrant: 'Vidyasagar Educational Trust',
    coverImageUrl: classroomImg,
    leadCoordinator: 'Sunita Meena (Infrastructure Lead)',
    evidenceScore: 95,
    tags: ['school renovation', 'stem education', 'solar power', 'girl child literacy', 'infrastructure'],
  },
  {
    id: 'proj-004',
    title: 'Sundarbans Mangrove Microgrid Resilience',
    category: 'Renewable Energy',
    description: 'Decentralized solar microgrid deployment providing 24/7 cyclone-resistant clean energy to isolated tidal mangrove settlements.',
    location: {
      name: 'Satjelia Island',
      state: 'West Bengal',
      country: 'India',
      lat: 22.1472,
      lng: 88.8521,
    },
    status: 'monitoring',
    startDate: '2024-08-01',
    targetMetric: {
      label: 'Households Powered',
      target: 400,
      current: 385,
      unit: 'homes',
    },
    donorOrGrant: 'Coastal Climate Adaptation Fund',
    coverImageUrl: solarImg,
    leadCoordinator: 'Arunav Roy (Energy Systems)',
    evidenceScore: 84,
    tags: ['solar microgrid', 'coastal resilience', 'clean energy', 'cyclone shelter', 'sundarbans'],
  },
];

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  // PROJECT 1: Wayanad Reforestation
  {
    id: 'media-001-before',
    projectId: 'proj-001',
    title: 'Sector 3A Barren Slope Pre-Planting Baseline',
    description: 'Eroded hillside with severely degraded topsoil following uncontrolled logging and invasive weed infestation.',
    cloudinaryPublicId: 'impactlens/proj-001/sector_3a_baseline_before_raw',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
    resourceType: 'image',
    stage: 'before',
    location: {
      name: 'Sector 3A Western Ridge',
      state: 'Kerala',
      country: 'India',
      lat: 11.6872,
      lng: 76.1345,
    },
    capturedAt: '2024-04-12T08:30:00Z',
    uploadedAt: '2024-04-12T11:45:10Z',
    tags: ['degraded soil', 'barren slope', 'baseline', 'erosion risk'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'Arid Soil / Erosion Trench', confidence: 0.94, category: 'flora' },
        { name: 'Invasive Shrubs (Lantana)', confidence: 0.89, category: 'flora' },
        { name: 'Deforested Ridge', confidence: 0.96, category: 'flora' },
      ],
      scenes: ['open barren field', 'clear sky', 'degraded hill landscape'],
      visualSignals: ['zero canopy cover', 'high topsoil exposure', 'no sapling clusters'],
      confidenceScore: 0.95,
      environmentalImpactScore: 18,
    },
    trustPassport: {
      sha256Hash: '9e7b23f81e3a47b8563c62a870d01f2e15bc32d849a62f883cb0a552579df6a1',
      originalFileName: 'IMG_4821_WAYANAD_SECTOR3A_BASE.CR3',
      fileSizeBytes: 24915000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-04-12T08:30:00Z',
      uploadedAt: '2024-04-12T11:45:10Z',
      cameraModel: 'Canon EOS R5 / RF 24-70mm f/2.8L',
      focalLength: '35mm',
      isoSpeed: 100,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-04-12T11:45:10Z', action: 'Direct Field Ingestion', actor: 'Rajan Pillai', hashProof: 'sha256:9e7b...f6a1' },
        { timestamp: '2024-04-12T11:45:14Z', action: 'Cloudinary AI Auto-Tagging & Signal Extraction', actor: 'ImpactLens Cloudinary AI Engine', hashProof: 'cld:v2-verified' }
      ]
    },
    transformations: {
      enhancedUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
      autoCroppedUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&h=300&fit=crop',
      clarityUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=90',
    }
  },
  {
    id: 'media-001-after',
    projectId: 'proj-001',
    title: 'Sector 3A Canopy Emergence & 12,000 Native Saplings',
    description: 'Vigorous native tree growth including Hopea parviflora and Artocarpus hirsutus with complete ground cover and thriving root systems.',
    cloudinaryPublicId: 'impactlens/proj-001/sector_3a_reforested_after',
    url: plantationImg,
    resourceType: 'image',
    stage: 'after',
    location: {
      name: 'Sector 3A Western Ridge',
      state: 'Kerala',
      country: 'India',
      lat: 11.6874,
      lng: 76.1348,
    },
    capturedAt: '2024-09-18T10:15:00Z',
    uploadedAt: '2024-09-18T13:20:00Z',
    tags: ['reforested', 'healthy saplings', 'canopy recovery', 'soil stabilization', 'volunteers'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'Native Saplings (Hopea)', confidence: 0.98, category: 'flora' },
        { name: 'Community Volunteers', confidence: 0.92, category: 'human_activity' },
        { name: 'Mulch / Biomass Cover', confidence: 0.88, category: 'flora' },
        { name: 'Canopy Foliage', confidence: 0.95, category: 'flora' }
      ],
      scenes: ['dense agroforestry', 'sunlit green slope', 'active environmental restoration'],
      visualSignals: ['lush chlorophyll index', 'dense vegetative ground cover', 'visible bamboo stakes'],
      confidenceScore: 0.98,
      environmentalImpactScore: 94,
    },
    trustPassport: {
      sha256Hash: '4a1c5d9e83f2187642bb390145cbeaf9012354789012bcadfe7891234567890a',
      originalFileName: 'DSC_9012_SECTOR3A_VERIFIED_AFTER.NEF',
      fileSizeBytes: 31200000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-09-18T10:15:00Z',
      uploadedAt: '2024-09-18T13:20:00Z',
      cameraModel: 'Nikon Z8 / Nikkor Z 24-120mm f/4 S',
      focalLength: '45mm',
      isoSpeed: 160,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-09-18T13:20:00Z', action: 'Direct Field Ingestion', actor: 'Rajan Pillai', hashProof: 'sha256:4a1c...890a' },
        { timestamp: '2024-09-18T13:20:05Z', action: 'Cloudinary AI Auto-Tagging & Face Obfuscation Check', actor: 'ImpactLens Cloudinary AI Engine', hashProof: 'cld:v2-verified' },
        { timestamp: '2024-09-19T09:00:00Z', action: 'M&E Auditor Verification', actor: 'Suresh Menon (Auditor)', hashProof: 'audit:verified-geo' }
      ]
    },
    transformations: {
      enhancedUrl: plantationImg,
      autoCroppedUrl: plantationImg,
      thumbnailUrl: plantationImg,
      clarityUrl: plantationImg,
    },
    verifiedIntegrity: true,
    verifiedAt: '2024-09-19T09:00:00Z',
  },
  {
    id: 'media-001-during',
    projectId: 'proj-001',
    title: 'Seedling Nursery & Community Pitting Drive',
    description: 'Tribal women cooperative members preparing nursery beds with organic bio-fertilizer and micro-irrigation lines.',
    cloudinaryPublicId: 'impactlens/proj-001/seedling_pitting_drive',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    resourceType: 'image',
    stage: 'during',
    location: {
      name: 'Wayanad Central Nursery',
      state: 'Kerala',
      country: 'India',
      lat: 11.6840,
      lng: 76.1305,
    },
    capturedAt: '2024-06-05T09:00:00Z',
    uploadedAt: '2024-06-05T14:30:00Z',
    tags: ['nursery', 'seedlings', 'field workers', 'community participation', 'irrigation'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'Nursery Sapling Bags', confidence: 0.97, category: 'flora' },
        { name: 'Field Volunteers', confidence: 0.91, category: 'human_activity' },
        { name: 'Irrigation Piping', confidence: 0.86, category: 'infrastructure' }
      ],
      scenes: ['tree nursery', 'outdoor agricultural workshop'],
      visualSignals: ['orderly seedling rows', 'active potting workflow'],
      confidenceScore: 0.93,
      environmentalImpactScore: 82,
    },
    trustPassport: {
      sha256Hash: '7c8b91a23d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcd',
      originalFileName: 'NURSERY_BATCH_MAY24.JPG',
      fileSizeBytes: 18400000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-06-05T09:00:00Z',
      uploadedAt: '2024-06-05T14:30:00Z',
      cameraModel: 'Sony A7 IV / FE 24-70mm GM',
      focalLength: '50mm',
      isoSpeed: 200,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-06-05T14:30:00Z', action: 'Direct Field Ingestion', actor: 'Priya Nambiar', hashProof: 'sha256:7c8b...abcd' }
      ]
    },
    transformations: {
      enhancedUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
      autoCroppedUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=300&fit=crop',
      clarityUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=90',
    }
  },

  // PROJECT 2: Brahmaputra River Cleanup
  {
    id: 'media-002-before',
    projectId: 'proj-002',
    title: 'Pandu Ghat Channel Plastic Inundation Baseline',
    description: 'Heavy macro-plastic and domestic waste accumulation along riparian bank obstructing natural tributary inlet.',
    cloudinaryPublicId: 'impactlens/proj-002/pandu_ghat_plastic_before_raw',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200&auto=format&fit=crop&q=80',
    resourceType: 'image',
    stage: 'before',
    location: {
      name: 'Pandu Ghat Outfall',
      state: 'Assam',
      country: 'India',
      lat: 26.1550,
      lng: 91.7010,
    },
    capturedAt: '2024-06-18T07:15:00Z',
    uploadedAt: '2024-06-18T10:00:00Z',
    tags: ['plastic waste', 'polluted riverbank', 'water pollution', 'baseline debris', 'bottles'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'PET Bottles & Plastic Sacks', confidence: 0.99, category: 'waste' },
        { name: 'Stagnant Mud Bank', confidence: 0.91, category: 'water_body' },
        { name: 'Floating Debris Mat', confidence: 0.95, category: 'waste' }
      ],
      scenes: ['polluted shoreline', 'river embankment', 'waste hazard'],
      visualSignals: ['high turbidity', 'waste density > 80%', 'toxic residue sheen'],
      confidenceScore: 0.97,
      environmentalImpactScore: 12,
    },
    trustPassport: {
      sha256Hash: '5e4d3c2b1a0f9e8d7c6b5a43210fedcba9876543210abcdef987654321fedcba',
      originalFileName: 'IMG_PANDU_POLLUTION_0618.JPG',
      fileSizeBytes: 19800000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-06-18T07:15:00Z',
      uploadedAt: '2024-06-18T10:00:00Z',
      cameraModel: 'Fujifilm X-T5 / XF 16-55mm f/2.8',
      focalLength: '24mm',
      isoSpeed: 400,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-06-18T10:00:00Z', action: 'Direct Field Ingestion', actor: 'Hemanta Deka', hashProof: 'sha256:5e4d...dcba' }
      ]
    },
    transformations: {
      enhancedUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200&auto=format&fit=crop&q=80',
      autoCroppedUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&h=600&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=300&h=300&fit=crop',
      clarityUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200&auto=format&fit=crop&q=90',
    },
    verifiedIntegrity: false,
    verificationFailureReason: 'Cloudinary registry checksum mismatch: file byte signature altered during remote field satellite sync. Verification pending reconciliation.',
  },
  {
    id: 'media-002-after',
    projectId: 'proj-002',
    title: 'Restored Riparian Bank & Turbidity Index 14 NTU',
    description: 'Post-cleanup channel with 18.2 tons of plastic extracted, native vetiver grass planted for slope stabilization, clear natural flow.',
    cloudinaryPublicId: 'impactlens/proj-002/pandu_ghat_cleaned_restored_after',
    url: riverImg,
    resourceType: 'image',
    stage: 'after',
    location: {
      name: 'Pandu Ghat Outfall',
      state: 'Assam',
      country: 'India',
      lat: 26.1552,
      lng: 91.7012,
    },
    capturedAt: '2024-09-22T08:45:00Z',
    uploadedAt: '2024-09-22T12:00:00Z',
    tags: ['river restoration', 'clean water', 'debris free', 'water conservation', 'clean stream'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'Flowing Clear River', confidence: 0.98, category: 'water_body' },
        { name: 'Stabilized Riverbank', confidence: 0.94, category: 'flora' },
        { name: 'Riparian Vegetation', confidence: 0.91, category: 'flora' }
      ],
      scenes: ['clean river landscape', 'sunny waterway', 'restored aquatic habitat'],
      visualSignals: ['visible river bed', 'zero surface plastic', 'natural water ripple'],
      confidenceScore: 0.98,
      environmentalImpactScore: 92,
    },
    trustPassport: {
      sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      originalFileName: 'RIVER_CLEAN_VERIFIED_SEP24.RAW',
      fileSizeBytes: 27500000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-09-22T08:45:00Z',
      uploadedAt: '2024-09-22T12:00:00Z',
      cameraModel: 'Fujifilm X-T5 / XF 16-55mm f/2.8',
      focalLength: '30mm',
      isoSpeed: 125,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-09-22T12:00:00Z', action: 'Direct Field Ingestion', actor: 'Hemanta Deka', hashProof: 'sha256:1a2b...1a2b' },
        { timestamp: '2024-09-22T12:00:04Z', action: 'Cloudinary AI Auto-Tagging & Clarity Score', actor: 'ImpactLens Cloudinary AI Engine', hashProof: 'cld:v2-verified' }
      ]
    },
    transformations: {
      enhancedUrl: riverImg,
      autoCroppedUrl: riverImg,
      thumbnailUrl: riverImg,
      clarityUrl: riverImg,
    },
    verifiedIntegrity: true,
    verifiedAt: '2024-09-22T14:00:00Z',
  },

  // PROJECT 3: Rajasthan Rural Classrooms
  {
    id: 'media-003-before',
    projectId: 'proj-003',
    title: 'Block 2 Classroom Dilapidated Structure Baseline',
    description: 'Cracked plaster, leaking roof, absence of desks and electrical supply, resulting in irregular attendance.',
    cloudinaryPublicId: 'impactlens/proj-003/classroom_before_renovation_raw',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
    resourceType: 'image',
    stage: 'before',
    location: {
      name: 'Barmer Govt High School, Block 2',
      state: 'Rajasthan',
      country: 'India',
      lat: 25.7535,
      lng: 71.3970,
    },
    capturedAt: '2024-01-24T10:00:00Z',
    uploadedAt: '2024-01-24T15:00:00Z',
    tags: ['dilapidated school', 'classroom baseline', 'cracked walls', 'no electricity'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'Damaged Wall Surface', confidence: 0.95, category: 'infrastructure' },
        { name: 'Broken Flooring', confidence: 0.92, category: 'infrastructure' },
        { name: 'Empty Classroom Room', confidence: 0.94, category: 'infrastructure' }
      ],
      scenes: ['deteriorated classroom', 'dim indoor light'],
      visualSignals: ['wall fissures', 'lack of instructional aids', 'poor ventilation'],
      confidenceScore: 0.96,
      environmentalImpactScore: 22,
    },
    trustPassport: {
      sha256Hash: '3f4e5d6c7b8a90123456789abcdef0123456789abcdef0123456789abcdef012',
      originalFileName: 'BARMER_BLDG2_PRE_WORK.JPG',
      fileSizeBytes: 14200000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-01-24T10:00:00Z',
      uploadedAt: '2024-01-24T15:00:00Z',
      cameraModel: 'Sony A6600',
      focalLength: '20mm',
      isoSpeed: 800,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-01-24T15:00:00Z', action: 'Direct Field Ingestion', actor: 'Sunita Meena', hashProof: 'sha256:3f4e...f012' }
      ]
    },
    transformations: {
      enhancedUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
      autoCroppedUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&h=300&fit=crop',
      clarityUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=90',
    }
  },
  {
    id: 'media-003-after',
    projectId: 'proj-003',
    title: 'Completed Solar STEM Lab with 40 Workstations',
    description: 'Fully insulated, solar-powered laboratory with robotics kits, high-speed LED lighting, ergonomic student furniture, and interactive displays.',
    cloudinaryPublicId: 'impactlens/proj-003/classroom_renovated_solar_stem_lab_after',
    url: classroomImg,
    resourceType: 'image',
    stage: 'after',
    location: {
      name: 'Barmer Govt High School, Block 2',
      state: 'Rajasthan',
      country: 'India',
      lat: 25.7536,
      lng: 71.3972,
    },
    capturedAt: '2024-08-28T11:30:00Z',
    uploadedAt: '2024-08-28T14:10:00Z',
    tags: ['renovated classroom', 'stem lab', 'solar powered school', 'student workstations', 'modern education'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'Student Wooden Desks', confidence: 0.98, category: 'infrastructure' },
        { name: 'STEM Science Kits', confidence: 0.93, category: 'infrastructure' },
        { name: 'Students & Teacher', confidence: 0.96, category: 'human_activity' },
        { name: 'LED Solar Luminaire', confidence: 0.91, category: 'energy' }
      ],
      scenes: ['modern active classroom', 'bright natural lighting', 'educational facility'],
      visualSignals: ['clean plaster paint', 'organized laboratory tools', '100% seating occupancy'],
      confidenceScore: 0.99,
      environmentalImpactScore: 96,
    },
    trustPassport: {
      sha256Hash: '8b7c6d5e4f3a2b10987654321abcdef0123456789abcdef0123456789abcdef0',
      originalFileName: 'BARMER_LAB_FINAL_INSPECTION.RAW',
      fileSizeBytes: 29800000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-08-28T11:30:00Z',
      uploadedAt: '2024-08-28T14:10:00Z',
      cameraModel: 'Sony A7 IV / FE 16-35mm GM',
      focalLength: '24mm',
      isoSpeed: 100,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-08-28T14:10:00Z', action: 'Direct Field Ingestion', actor: 'Sunita Meena', hashProof: 'sha256:8b7c...def0' },
        { timestamp: '2024-08-29T10:00:00Z', action: 'Donor Joint Audit Completed', actor: 'Vidyasagar Trust Officer', hashProof: 'grant:final-disbursement' }
      ]
    },
    transformations: {
      enhancedUrl: classroomImg,
      autoCroppedUrl: classroomImg,
      thumbnailUrl: classroomImg,
      clarityUrl: classroomImg,
    },
    verifiedIntegrity: true,
    verifiedAt: '2024-08-29T10:00:00Z',
  },

  // PROJECT 4: Sundarbans Solar Microgrid
  {
    id: 'media-004-before',
    projectId: 'proj-004',
    title: 'Kerosene Lantern Usage & Diesel Generator Emissions',
    description: 'Baseline evening darkness with harmful kerosene fumes providing inadequate light for children study and community clinic.',
    cloudinaryPublicId: 'impactlens/proj-004/kerosene_baseline_before_raw',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    resourceType: 'image',
    stage: 'before',
    location: {
      name: 'Satjelia Health Post & Cluster',
      state: 'West Bengal',
      country: 'India',
      lat: 22.1465,
      lng: 88.8515,
    },
    capturedAt: '2024-08-03T19:30:00Z',
    uploadedAt: '2024-08-04T09:00:00Z',
    tags: ['energy poverty', 'kerosene lamp', 'dark village', 'fossil fuel baseline'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'Kerosene Lantern Flame', confidence: 0.94, category: 'energy' },
        { name: 'Dim Thatched Hut', confidence: 0.91, category: 'infrastructure' }
      ],
      scenes: ['low-light night interior', 'energy impoverished home'],
      visualSignals: ['soot emission signatures', 'lux level < 5', 'fire hazard proximity'],
      confidenceScore: 0.94,
      environmentalImpactScore: 20,
    },
    trustPassport: {
      sha256Hash: '9a8b7c6d5e4f3a2b109876543210fedcba9876543210fedcba9876543210fedc',
      originalFileName: 'SATJELIA_KEROSENE_STUDY.JPG',
      fileSizeBytes: 12500000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-08-03T19:30:00Z',
      uploadedAt: '2024-08-04T09:00:00Z',
      cameraModel: 'Canon EOS R6',
      focalLength: '50mm',
      isoSpeed: 3200,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-08-04T09:00:00Z', action: 'Direct Field Ingestion', actor: 'Arunav Roy', hashProof: 'sha256:9a8b...fedc' }
      ]
    },
    transformations: {
      enhancedUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      autoCroppedUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
      clarityUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=90',
    },
    verifiedIntegrity: false,
    verificationFailureReason: 'EXIF provenance flag unconfirmed: Local mobile compression detached hardware camera key signature.',
  },
  {
    id: 'media-004-after',
    projectId: 'proj-004',
    title: '120kW Cyclone-Anchored Microgrid & Battery Bank',
    description: 'Active rooftop solar array with LiFePO4 storage bank supplying 385 families and emergency cold-chain vaccine refrigeration.',
    cloudinaryPublicId: 'impactlens/proj-004/solar_microgrid_island_after',
    url: solarImg,
    resourceType: 'image',
    stage: 'after',
    location: {
      name: 'Satjelia Health Post & Cluster',
      state: 'West Bengal',
      country: 'India',
      lat: 22.1475,
      lng: 88.8523,
    },
    capturedAt: '2024-09-12T16:00:00Z',
    uploadedAt: '2024-09-12T18:40:00Z',
    tags: ['solar microgrid', 'renewable energy', 'clean power', 'climate resilience', 'island power'],
    aiAnalysis: {
      detectedObjects: [
        { name: 'Monocrystalline Solar Panels', confidence: 0.99, category: 'energy' },
        { name: 'Inverter Enclosure Box', confidence: 0.95, category: 'energy' },
        { name: 'Community Center Roof', confidence: 0.92, category: 'infrastructure' }
      ],
      scenes: ['clean energy installation', 'village rooftop', 'open sunny sky'],
      visualSignals: ['optimal azimuth angle', 'cyclone tie-down cables', 'zero carbon footprint'],
      confidenceScore: 0.98,
      environmentalImpactScore: 95,
    },
    trustPassport: {
      sha256Hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
      originalFileName: 'SOLAR_COMMISSIONING_120KW.JPG',
      fileSizeBytes: 22100000,
      mimeType: 'image/jpeg',
      capturedAt: '2024-09-12T16:00:00Z',
      uploadedAt: '2024-09-12T18:40:00Z',
      cameraModel: 'Sony A7 IV / FE 24-105mm G',
      focalLength: '32mm',
      isoSpeed: 100,
      tamperProofStatus: 'verified',
      auditChain: [
        { timestamp: '2024-09-12T18:40:00Z', action: 'Direct Field Ingestion', actor: 'Arunav Roy', hashProof: 'sha256:2b3c...2b3c' },
        { timestamp: '2024-09-12T18:40:06Z', action: 'Cloudinary AI Auto-Tagging & Signal Extraction', actor: 'ImpactLens Cloudinary AI Engine', hashProof: 'cld:v2-verified' }
      ]
    },
    transformations: {
      enhancedUrl: solarImg,
      autoCroppedUrl: solarImg,
      thumbnailUrl: solarImg,
      clarityUrl: solarImg,
    },
    verifiedIntegrity: true,
    verifiedAt: '2024-09-13T10:00:00Z',
  }
];

export const INITIAL_BEFORE_AFTER_PAIRS: BeforeAfterPair[] = [
  {
    id: 'pair-001',
    projectId: 'proj-001',
    title: 'Wayanad Sector 3A: From Barren Soil to 12,000 Tree Canopy',
    beforeAssetId: 'media-001-before',
    afterAssetId: 'media-001-after',
    metricLabel: 'Canopy Density Index',
    metricDelta: '+340% Vegetative Recovery',
    timelineDays: 159,
    pairingScore: 98,
    storyExcerpt: 'Over 159 days of dedicated agroforestry and community stewardship, what was once an eroded wasteland subject to mudslides transformed into a thriving native bio-corridor.',
    locationVerified: true,
  },
  {
    id: 'pair-002',
    projectId: 'proj-002',
    title: 'Pandu Ghat Channel: 18.2 Tons Plastic Extracted & Stream Restored',
    beforeAssetId: 'media-002-before',
    afterAssetId: 'media-002-after',
    metricLabel: 'Water Turbidity Reduction',
    metricDelta: '-82% NTU (From 78 NTU to 14 NTU)',
    timelineDays: 96,
    pairingScore: 96,
    storyExcerpt: 'Interception booms combined with manual shoreline segregation prevented over 18 tons of packaging debris from reaching downstream endangered dolphin habitats.',
    locationVerified: true,
  },
  {
    id: 'pair-003',
    projectId: 'proj-003',
    title: 'Barmer Govt School: Dilapidated Block to 40-Student STEM Lab',
    beforeAssetId: 'media-003-before',
    afterAssetId: 'media-003-after',
    metricLabel: 'Weekly STEM Engagement Hours',
    metricDelta: '+450% Student Lab Hours',
    timelineDays: 217,
    pairingScore: 99,
    storyExcerpt: 'Replacing broken floors and zero electricity with climate-adapted insulation, solar arrays, and modern robotics kits increased female student enrollment by 38%.',
    locationVerified: true,
  },
  {
    id: 'pair-004',
    projectId: 'proj-004',
    title: 'Satjelia Island: Kerosene Fumes Replaced by 120kW Solar Microgrid',
    beforeAssetId: 'media-004-before',
    afterAssetId: 'media-004-after',
    metricLabel: 'Clean Energy Access',
    metricDelta: '385 Households Energized 24/7',
    timelineDays: 40,
    pairingScore: 95,
    storyExcerpt: 'Eliminated hazardous kerosene lamps across 385 families while powering continuous refrigeration for vaccines at the local health outpost.',
    locationVerified: true,
  },
];

export const INITIAL_REPORTS: ImpactReport[] = [
  {
    id: 'rep-001',
    projectId: 'proj-001',
    title: 'Quarterly Evidence Audit: Western Ghats Bio-Corridor',
    subtitle: 'Comprehensive Visual & Metric Proof for Global Rainforest Alliance',
    generatedAt: '2024-09-25T14:30:00Z',
    generatedBy: 'Ananya Deshmukh (NGO Director)',
    executiveSummary: 'This impact report establishes verified photographic proof and cryptographic traceability for 42,350 indigenous saplings planted across Wayanad High Ranges. Utilizing Cloudinary AI object detection and geocoded before-and-after timelines, every milestone demonstrates verified ecological recovery.',
    primaryMetric: {
      label: 'Native Saplings Established',
      value: '42,350 / 50,000',
      growth: '84.7% of Goal Achieved',
    },
    secondaryMetrics: [
      { label: 'Evidence Strength Score', value: '92 / 100 (Verified High Impact)' },
      { label: 'Canopy Density Delta', value: '+340% Vegetative Recovery' },
      { label: 'Cryptographic SHA-256 Passports', value: '100% Tamper-Proof Audit' }
    ],
    featuredPairs: [INITIAL_BEFORE_AFTER_PAIRS[0]],
    supportingAssetIds: ['media-001-before', 'media-001-during', 'media-001-after'],
    evidenceScore: 92,
    trustSealHash: 'SEAL-2024-IMPACT-LENS-89104-VERIFIED',
  }
];
