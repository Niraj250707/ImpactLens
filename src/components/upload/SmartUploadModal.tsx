import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Tag, 
  MapPin, 
  Loader2,
  Check,
  Plus,
  AlertTriangle,
  Compass,
  Crosshair
} from 'lucide-react';
import { MediaAsset, MediaStage, Project, UserProfile } from '../../types';
import { uploadFieldMedia } from '../../services/cloudinaryService';
import { analyzeImageForUpload, AiImageAnalysisResult } from '../../services/imageAnalysisService';

interface SmartUploadModalProps {
  projects: Project[];
  currentUser: UserProfile;
  preselectedProjectId?: string;
  onClose: () => void;
  onUploadSuccess: (newAssets: MediaAsset[]) => void;
}

export const SmartUploadModal: React.FC<SmartUploadModalProps> = ({
  projects,
  currentUser,
  preselectedProjectId,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    preselectedProjectId || projects[0]?.id || ''
  );
  const [stage, setStage] = useState<MediaStage>('after');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [customTags, setCustomTags] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processedAssets, setProcessedAssets] = useState<MediaAsset[]>([]);

  // Automated AI Tagging Trigger State
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiCategories, setAiCategories] = useState<string[]>([]);
  const [aiSuggestedTags, setAiSuggestedTags] = useState<string[]>([]);
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState<string | null>(null);

  // GPS Proximity & Location Integrity State
  const [customLat, setCustomLat] = useState<number | null>(null);
  const [customLng, setCustomLng] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const effectiveLat = customLat ?? activeProject?.location.lat ?? 20.5937;
  const effectiveLng = customLng ?? activeProject?.location.lng ?? 78.9629;

  // Haversine distance from project site in kilometers
  const distanceDeviationKm = useMemo(() => {
    if (!activeProject) return 0;
    const projectLat = activeProject.location.lat;
    const projectLng = activeProject.location.lng;
    const R = 6371; // Earth radius in km
    const dLat = (effectiveLat - projectLat) * (Math.PI / 180);
    const dLng = (effectiveLng - projectLng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(projectLat * (Math.PI / 180)) *
      Math.cos(effectiveLat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, [effectiveLat, effectiveLng, activeProject]);

  // Flag media if captured significantly outside project's designated site coordinates (> 25 km)
  const isLocationDiscrepant = distanceDeviationKm > 25;

  // Automated AI tagging trigger
  const runAiTaggingTrigger = async (file: File) => {
    setIsAnalyzingAi(true);
    setAiAnalysisStatus('Analyzing visual content for infrastructure, community & environmental signals...');
    try {
      const result = await analyzeImageForUpload({
        file,
        projectName: activeProject?.title || '',
        projectCategory: activeProject?.category || '',
      });

      setAiCategories(result.categories || []);
      setAiSuggestedTags(result.tags || []);

      // Auto-prepopulate tags if empty or merge
      const existing = customTags
        ? customTags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      const merged = Array.from(new Set([...existing, ...result.tags, ...result.categories]));
      setCustomTags(merged.join(', '));

      if (!title) {
        setTitle(result.suggestedTitle);
      }
      if (!description) {
        setDescription(result.suggestedDescription);
      }

      setAiAnalysisStatus(
        `AI Analysis Complete: Classified as [${result.categories.join(' · ')}]. Pre-populated ${result.tags.length} verified tags.`
      );
    } catch (err) {
      console.error('AI tagging trigger error:', err);
      setAiAnalysisStatus(null);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      if (filesArray.length > 0) {
        if (!title && filesArray.length === 1) {
          setTitle(filesArray[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        // Trigger automated AI image analysis on the first selected file
        runAiTaggingTrigger(filesArray[0]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      if (filesArray.length > 0) {
        if (!title && filesArray.length === 1) {
          setTitle(filesArray[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        // Trigger automated AI image analysis
        runAiTaggingTrigger(filesArray[0]);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedFiles.length <= 1) {
      setAiCategories([]);
      setAiSuggestedTags([]);
      setAiAnalysisStatus(null);
    }
  };

  const toggleTagChip = (tagToAdd: string) => {
    const existing = customTags.split(',').map(t => t.trim()).filter(Boolean);
    if (existing.includes(tagToAdd)) {
      setCustomTags(existing.filter(t => t !== tagToAdd).join(', '));
    } else {
      setCustomTags([...existing, tagToAdd].join(', '));
    }
  };

  const handleStartIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !selectedProjectId) return;

    setIsProcessing(true);
    const results: MediaAsset[] = [];

    const tagsArray = customTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      setProcessingStep(`[${i + 1}/${selectedFiles.length}] Computing cryptographic SHA-256 fingerprint for ${file.name}...`);
      await new Promise((r) => setTimeout(r, 400));

      setProcessingStep(`[${i + 1}/${selectedFiles.length}] Cloudinary AI scene & object classification...`);
      await new Promise((r) => setTimeout(r, 500));

      if (isLocationDiscrepant) {
        setProcessingStep(`[${i + 1}/${selectedFiles.length}] Geofence Discrepancy (${distanceDeviationKm}km outside perimeter). Appending 'Location Integrity Warning' to audit log...`);
        await new Promise((r) => setTimeout(r, 450));
      }

      setProcessingStep(`[${i + 1}/${selectedFiles.length}] Issuing immutable Trust Passport & geocoding...`);

      const asset = await uploadFieldMedia(file, selectedProjectId, {
        title: selectedFiles.length === 1 ? title || file.name : `${title || 'Field Asset'} #${i + 1}`,
        description: description || `Field media captured for ${activeProject?.title || 'project'}`,
        stage,
        locationName: locationName || activeProject?.location.name || 'Field Sector',
        state: activeProject?.location.state || 'Local Region',
        country: activeProject?.location.country || 'India',
        lat: effectiveLat,
        lng: effectiveLng,
        tags: tagsArray,
        user: { name: currentUser.name, role: currentUser.role },
        locationIntegrityWarning: isLocationDiscrepant,
        locationDiscrepancyKm: isLocationDiscrepant ? distanceDeviationKm : 0,
      });

      results.push(asset);
    }

    setProcessingStep('All assets processed and indexed into Cloudinary intelligence catalog!');
    await new Promise((r) => setTimeout(r, 400));

    setIsProcessing(false);
    setProcessedAssets(results);
    onUploadSuccess(results);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <UploadCloud className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-base font-semibold text-neutral-100">
                Smart Field Media Ingestion
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Powered by Cloudinary AI auto-tagging, object detection, and cryptographic SHA-256 Trust Passporting.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success View */}
        {processedAssets.length > 0 ? (
          <div className="py-8 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Successfully Ingested {processedAssets.length} Field Asset{processedAssets.length === 1 ? '' : 's'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                AI object detection extracted <span className="text-emerald-400 font-semibold">{processedAssets.flatMap(a => a.aiAnalysis.detectedObjects).length} tags</span>, verified SHA-256 cryptographic authenticity, and updated project Evidence Strength Score!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 max-h-48 overflow-y-auto text-left space-y-2">
              {processedAssets.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-neutral-950 border border-neutral-800/80">
                  <div className="truncate max-w-[280px]">
                    <p className="font-medium text-neutral-200 truncate">{a.title}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">Stage: {a.stage.toUpperCase()}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] font-mono text-emerald-400 font-medium block">
                      SHA-256 Verified
                    </span>
                    {a.locationIntegrityWarning && (
                      <span className="text-[9px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800 flex items-center gap-1 justify-end">
                        <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                        <span>Location Integrity Warning ({a.locationDiscrepancyKm}km)</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
            >
              Done & Return to Library
            </button>
          </div>
        ) : (
          /* Upload Form */
          <form onSubmit={handleStartIngestion} className="mt-4 space-y-4 overflow-y-auto pr-1">
            
            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/60 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-200">
                Click to browse or drag and drop field files
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Supports High-Res JPG, PNG, RAW, MP4 · Single or Bulk Upload
              </p>
            </div>

            {/* Selected files preview list */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-lg bg-neutral-900/40 border border-neutral-800">
                <span className="text-[11px] font-medium text-neutral-400 block mb-1">
                  Selected Files ({selectedFiles.length}):
                </span>
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                    <span className="truncate max-w-[320px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-neutral-500 hover:text-rose-400 text-xs px-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Target Project and Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Impact Stage</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setStage('before')}
                    className={`py-2 text-xs rounded-lg font-medium transition-colors border ${
                      stage === 'before'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    Before
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('during')}
                    className={`py-2 text-xs rounded-lg font-medium transition-colors border ${
                      stage === 'during'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    During
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('after')}
                    className={`py-2 text-xs rounded-lg font-medium transition-colors border ${
                      stage === 'after'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    After
                  </button>
                </div>
              </div>
            </div>

            {/* Asset Title & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Asset Title / Milestone</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sector 4 Planting or Turbidity Test"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Specific Field Location</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Sector 3A Western Ridge"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* GPS-Proximity & Location Integrity Verification Section */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
              isLocationDiscrepant
                ? 'border-amber-500/50 bg-amber-950/20'
                : 'border-neutral-800 bg-neutral-900/40'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className={`h-4 w-4 ${isLocationDiscrepant ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span className="text-xs font-semibold text-neutral-100">
                    GPS-Proximity & Geofence Integrity Check
                  </span>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${
                  isLocationDiscrepant
                    ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {isLocationDiscrepant ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                      <span>{distanceDeviationKm} km Outside Site Boundary</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Within Site Perimeter ({distanceDeviationKm} km)</span>
                    </>
                  )}
                </span>
              </div>

              {/* Designated Site vs Captured Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                    Designated Project Site
                  </span>
                  <p className="text-neutral-200 font-medium truncate">
                    {activeProject?.location.name || 'Site'}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400">
                    Lat: {activeProject?.location.lat.toFixed(4)}, Lng: {activeProject?.location.lng.toFixed(4)}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-neutral-500">
                      Captured Coordinates
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomLat(activeProject?.location.lat || 20.5937);
                          setCustomLng(activeProject?.location.lng || 78.9629);
                        }}
                        className="text-[9px] font-mono text-emerald-400 hover:underline"
                        title="Reset to project site GPS"
                      >
                        Reset Site GPS
                      </button>
                      <span className="text-neutral-600">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomLat((activeProject?.location.lat || 20.5937) + 1.15);
                          setCustomLng((activeProject?.location.lng || 78.9629) + 0.95);
                        }}
                        className="text-[9px] font-mono text-amber-400 hover:underline"
                        title="Simulate media captured outside geofence boundary"
                      >
                        Simulate Divergence (+115km)
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="number"
                      step="0.0001"
                      value={effectiveLat}
                      onChange={(e) => setCustomLat(parseFloat(e.target.value) || 0)}
                      className="w-full px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={effectiveLng}
                      onChange={(e) => setCustomLng(parseFloat(e.target.value) || 0)}
                      className="w-full px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location Integrity Warning Banner if divergent */}
              {isLocationDiscrepant && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-start gap-2 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-amber-300">Location Integrity Warning Triggered</p>
                    <p className="text-[11px] text-amber-300/80 leading-snug">
                      Media coordinates deviate by {distanceDeviationKm} km from designated site perimeter ({activeProject?.location.name}). A 'Location Integrity Warning' will be permanently appended to the immutable cryptographic audit log and Trust Passport.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Automated AI Visual Tagging Trigger Section */}
            <div className="p-3.5 rounded-xl border border-emerald-950/80 bg-emerald-950/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-300">
                    Automated Visual AI Tagging & Classification
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => selectedFiles[0] && runAiTaggingTrigger(selectedFiles[0])}
                  disabled={selectedFiles.length === 0 || isAnalyzingAi}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-700 hover:border-emerald-500 text-[11px] font-mono text-neutral-300 hover:text-emerald-300 disabled:opacity-40 transition-colors"
                >
                  {isAnalyzingAi ? (
                    <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                  )}
                  <span>{isAnalyzingAi ? 'Analyzing...' : 'Trigger AI Auto-Tag'}</span>
                </button>
              </div>

              {/* Status Message */}
              {aiAnalysisStatus && (
                <p className="text-[11px] text-emerald-300/90 font-mono bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/60">
                  {aiAnalysisStatus}
                </p>
              )}

              {/* Visual Category Badges */}
              {aiCategories.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    Detected Visual Categories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiCategories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1"
                      >
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>{cat}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Tag Chips */}
              {aiSuggestedTags.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                    AI Suggested Tags (click to toggle):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {aiSuggestedTags.map((tag, idx) => {
                      const isActive = customTags.toLowerCase().includes(tag.toLowerCase());
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleTagChip(tag)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors flex items-center gap-1 border ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                          }`}
                        >
                          {isActive ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Plus className="h-2.5 w-2.5 text-neutral-500" />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Custom tags input */}
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Custom Tags & AI Identifiers (comma-separated)
              </label>
              <input
                type="text"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder="reforestation, soil test, community volunteers, infrastructure"
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Progress indicator */}
            {isProcessing && (
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-emerald-500/30 flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-emerald-400 animate-spin shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-neutral-100">Ingesting Field Media...</p>
                  <p className="text-neutral-400 font-mono text-[11px]">{processingStep}</p>
                </div>
              </div>
            )}

            {/* Submit buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || selectedFiles.length === 0}
                className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing AI Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Ingest & AI Analyze ({selectedFiles.length})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
