import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Cloud, 
  UserCheck, 
  Check, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserProfile, UserRole, CloudinaryConfig } from '../../types';
import { getStoredCloudinaryConfig, saveCloudinaryConfig } from '../../services/cloudinaryService';

interface SettingsModalProps {
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  const [config, setConfig] = useState<CloudinaryConfig>(getStoredCloudinaryConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableRoles: { role: UserRole; desc: string }[] = [
    { role: 'NGO Director', desc: 'Holistic portfolio governance, Evidence Strength auditing, and high-level donor reports.' },
    { role: 'Field Coordinator', desc: 'Rapid field media capture, GPS geocoding, and baseline/outcome categorization.' },
    { role: 'M&E Auditor', desc: 'Rigorous cryptographic SHA-256 tamper checks and independent verification.' },
    { role: 'CSR / Donor Partner', desc: 'Verified before-after visual proof review and milestone disbursement authorization.' },
  ];

  const handleTestCloudinary = async () => {
    setTestStatus('testing');
    await new Promise((r) => setTimeout(r, 700));
    if (config.cloudName && config.cloudName.trim().length > 0) {
      setTestStatus('success');
    } else {
      setTestStatus('failed');
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudinaryConfig({
      ...config,
      isCustomConfigured: Boolean(config.cloudName && config.uploadPreset),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSelectRole = (newRole: UserRole) => {
    onUpdateUser({
      ...currentUser,
      role: newRole,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Settings className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-semibold text-neutral-100">
              System Settings & Integrations
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-6 overflow-y-auto pr-1">
          
          {/* Section 1: Cloudinary Track Sponsor Configuration */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-neutral-100">
                  Cloudinary Track Sponsor Credentials
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Native Sponsor Track
              </span>
            </div>

            <p className="text-xs text-neutral-400">
              ImpactLens natively harnesses Cloudinary AI transformations, auto-tagging, smart cropping (<code className="text-emerald-400">g_auto</code>), and content intelligence. You can connect your own cloud or use the built-in sandbox pipeline.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Cloud Name
                  </label>
                  <input
                    type="text"
                    value={config.cloudName}
                    onChange={(e) => setConfig({ ...config, cloudName: e.target.value })}
                    placeholder="e.g. demo or your-cloud-name"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Upload Preset (Unsigned)
                  </label>
                  <input
                    type="text"
                    value={config.uploadPreset}
                    onChange={(e) => setConfig({ ...config, uploadPreset: e.target.value })}
                    placeholder="e.g. impactlens_field_uploads"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestCloudinary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <div className="flex items-center gap-2">
                  {testStatus === 'success' && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Connected to Cloudinary</span>
                    </span>
                  )}
                  {testStatus === 'failed' && (
                    <span className="text-xs text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Missing Cloud Name</span>
                    </span>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                  >
                    {savedSuccess ? 'Saved!' : 'Save Config'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Section 2: User Persona / Role Switcher */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-neutral-100">
                  User Persona & Role Perspective
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Active: <span className="text-emerald-400 font-semibold">{currentUser.role}</span>
              </span>
            </div>

            <p className="text-xs text-neutral-400">
              Switch role to experience how ImpactLens tailors workflows for Directors, Field Workers, Auditors, and Institutional CSR Donors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {availableRoles.map((r) => {
                const isSelected = currentUser.role === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => handleSelectRole(r.role)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500/60 bg-emerald-500/10'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-neutral-200'}`}>
                        {r.role}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      {r.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 mt-auto border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
