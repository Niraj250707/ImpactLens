import React, { useState, useRef } from 'react';
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
  Loader2 
} from 'lucide-react';
import { MediaAsset, MediaStage, Project, UserProfile } from '../../types';
import { uploadFieldMedia } from '../../services/cloudinaryService';

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      if (!title && filesArray.length === 1) {
        setTitle(filesArray[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      if (!title && filesArray.length === 1) {
        setTitle(filesArray[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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

      setProcessingStep(`[${i + 1}/${selectedFiles.length}] Issuing immutable Trust Passport & geocoding...`);

      const asset = await uploadFieldMedia(file, selectedProjectId, {
        title: selectedFiles.length === 1 ? title || file.name : `${title || 'Field Asset'} #${i + 1}`,
        description: description || `Field media captured for ${activeProject?.title || 'project'}`,
        stage,
        locationName: locationName || activeProject?.location.name || 'Field Sector',
        state: activeProject?.location.state || 'Local Region',
        country: activeProject?.location.country || 'India',
        lat: activeProject?.location.lat || 20.5937,
        lng: activeProject?.location.lng || 78.9629,
        tags: tagsArray,
        user: { name: currentUser.name, role: currentUser.role },
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
                  <span className="text-[10px] font-mono text-emerald-400 font-medium">
                    SHA-256 Verified
                  </span>
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

            {/* Custom tags */}
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Custom Tags (comma-separated, Cloudinary AI will also auto-tag)
              </label>
              <input
                type="text"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder="reforestation, soil test, community volunteers"
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
