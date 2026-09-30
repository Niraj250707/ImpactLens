import React, { useState } from 'react';
import { X, FolderPlus, MapPin, Tag } from 'lucide-react';
import { Project, ProjectCategory } from '../../types';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onCreateProject,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Afforestation');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [targetLabel, setTargetLabel] = useState('');
  const [targetCount, setTargetCount] = useState(1000);
  const [targetUnit, setTargetUnit] = useState('trees');
  const [donor, setDonor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationName) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title,
      category,
      description,
      location: {
        name: locationName,
        state: state || 'Field Region',
        country: country || 'India',
        lat: 20.5937 + (Math.random() - 0.5) * 5,
        lng: 78.9629 + (Math.random() - 0.5) * 5,
      },
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      targetMetric: {
        label: targetLabel || 'Target Milestone',
        target: Number(targetCount) || 1000,
        current: 0,
        unit: targetUnit || 'units',
      },
      donorOrGrant: donor || 'Institutional Impact Fund',
      coverImageUrl: coverUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
      leadCoordinator: 'Field Operations Team',
      evidenceScore: 40, // Baseline new project score
      tags: tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    };

    onCreateProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FolderPlus className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-semibold text-neutral-100">
              Register New Impact Initiative
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Initiative Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aravalli Green Wall & Water Recharging"
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="Afforestation">Afforestation</option>
                <option value="River & Water">River & Water</option>
                <option value="Education & School">Education & School</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Community Health">Community Health</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Funding Partner / Grant</label>
              <input
                type="text"
                value={donor}
                onChange={(e) => setDonor(e.target.value)}
                placeholder="e.g. Green Planet CSR Grant #402"
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Description & Scope</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of baseline condition, intended intervention, and community impact..."
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Location Site</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Alwar Valley"
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Rajasthan"
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Target Metric</label>
              <input
                type="text"
                value={targetLabel}
                onChange={(e) => setTargetLabel(e.target.value)}
                placeholder="e.g. Saplings Planted"
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Goal Quantity</label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Unit</label>
              <input
                type="text"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder="e.g. saplings"
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="reforestation, biodiversity, soil water conservation"
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
            />
          </div>

          <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
