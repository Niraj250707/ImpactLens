import React from 'react';
import { Camera, Plus, Sliders, ShieldCheck, LogOut, Building2 } from 'lucide-react';
import { UserProfile } from '../../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'projects' | 'media' | 'beforeafter' | 'reports' | 'stakeholder';
  setActiveTab: (tab: 'dashboard' | 'projects' | 'media' | 'beforeafter' | 'reports' | 'stakeholder') => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
  currentUser: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenSettings,
  onLogout,
  currentUser,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Camera className="h-4 w-4" />
            </div>
            <span className="font-semibold text-neutral-100">
              Impact<span className="text-emerald-400">Lens</span>
            </span>
          </button>

          <span className="hidden sm:inline-block text-xs font-mono text-neutral-500 border-l border-neutral-800 pl-3">
            Cloudinary AI Media Intelligence
          </span>
        </div>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
              activeTab === 'projects'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Projects
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
              activeTab === 'media'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Media Library
          </button>

          <button
            onClick={() => setActiveTab('beforeafter')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
              activeTab === 'beforeafter'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Before & After
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
              activeTab === 'reports'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Impact Stories
          </button>

          <button
            onClick={() => setActiveTab('stakeholder')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md flex items-center gap-1.5 ${
              activeTab === 'stakeholder'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Stakeholder Portal</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions + Profile */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">Upload Media</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Cloudinary API & Role Settings"
            className="flex items-center gap-1.5 p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded-lg transition-colors border border-neutral-800"
          >
            <Sliders className="h-4 w-4" />
          </button>

          <div
            onClick={onOpenSettings}
            className="flex items-center gap-2 pl-2 border-l border-neutral-800 cursor-pointer group"
            title="Account & Role Settings"
          >
            <div className="h-7 w-7 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-xs font-semibold text-emerald-300">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <p className="font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors">
                {currentUser.name.split(' ')[0]}
              </p>
              <p className="text-[10px] text-neutral-500">{currentUser.role}</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Switch Persona / Sign Out"
              className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-emerald-300 hover:bg-neutral-900 rounded-lg transition-colors border border-neutral-800"
            >
              <LogOut className="h-3 w-3 text-neutral-400" />
              <span className="hidden xl:inline text-[11px] font-medium">Switch Role</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile nav bar row */}
      <div className="flex md:hidden items-center justify-around border-t border-neutral-900 px-2 py-2 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2 py-1 ${activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-2 py-1 ${activeTab === 'projects' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`px-2 py-1 ${activeTab === 'media' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}`}
        >
          Media
        </button>
        <button
          onClick={() => setActiveTab('beforeafter')}
          className={`px-2 py-1 ${activeTab === 'beforeafter' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}`}
        >
          Compare
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-2 py-1 ${activeTab === 'reports' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('stakeholder')}
          className={`px-2 py-1 ${activeTab === 'stakeholder' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}`}
        >
          Stakeholders
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-2 py-1 text-neutral-500 hover:text-red-400"
            title="Log Out"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
};
