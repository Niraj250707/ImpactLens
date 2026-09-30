import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  Layers, 
  ShieldCheck, 
  SlidersHorizontal, 
  FileText, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  MapPin, 
  FolderPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { 
  INITIAL_PROJECTS, 
  INITIAL_MEDIA_ASSETS, 
  INITIAL_BEFORE_AFTER_PAIRS, 
  INITIAL_REPORTS, 
  CURRENT_USER 
} from './data/mockData';

import { Project, MediaAsset, BeforeAfterPair, ImpactReport, UserProfile } from './types';
import { calculateEvidenceScore } from './services/evidenceScore';

import { Navbar } from './components/layout/Navbar';
import { ProjectCard } from './components/dashboard/ProjectCard';
import { EvidenceScoreRadar } from './components/dashboard/EvidenceScoreRadar';
import { MediaGrid } from './components/media/MediaGrid';
import { BeforeAfterStudio } from './components/beforeafter/BeforeAfterStudio';
import { ImpactReportGenerator } from './components/reports/ImpactReportGenerator';
import { SmartUploadModal } from './components/upload/SmartUploadModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { IntegrityAuditSection } from './components/dashboard/IntegrityAuditSection';
import { LoginPage } from './components/auth/LoginPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('impactlens_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return CURRENT_USER;
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('impactlens_session') === 'true';
  });

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_MEDIA_ASSETS);
  const [pairs, setPairs] = useState<BeforeAfterPair[]>(INITIAL_BEFORE_AFTER_PAIRS);
  const [reports, setReports] = useState<ImpactReport[]>(INITIAL_REPORTS);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'media' | 'beforeafter' | 'reports'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activePairIdForStudio, setActivePairIdForStudio] = useState<string | undefined>(undefined);

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadPreselectedProjectId, setUploadPreselectedProjectId] = useState<string | undefined>(undefined);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false);

  // Re-calculate scores whenever assets or pairs change
  const updatedProjects = useMemo(() => {
    return projects.map((p) => {
      const breakdown = calculateEvidenceScore(p, assets, pairs);
      return {
        ...p,
        evidenceScore: breakdown.totalScore,
      };
    });
  }, [projects, assets, pairs]);

  const activeProject = useMemo(() => {
    return updatedProjects.find((p) => p.id === selectedProjectId);
  }, [updatedProjects, selectedProjectId]);

  // Aggregate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalAssets = assets.length;
    const totalPairs = pairs.length;
    const avgScore = updatedProjects.length > 0
      ? Math.round(updatedProjects.reduce((acc, p) => acc + p.evidenceScore, 0) / updatedProjects.length)
      : 0;
    const verifiedHashCount = assets.filter((a) => a.trustPassport?.sha256Hash).length;

    return { totalAssets, totalPairs, avgScore, verifiedHashCount };
  }, [assets, pairs, updatedProjects]);

  // Aggregate portfolio score breakdown
  const portfolioScoreData = useMemo(() => {
    const fakeRepresentativeProject = updatedProjects[0] || INITIAL_PROJECTS[0];
    return calculateEvidenceScore(fakeRepresentativeProject, assets, pairs);
  }, [updatedProjects, assets, pairs]);

  const handleOpenUploadForProject = (projectId?: string) => {
    setUploadPreselectedProjectId(projectId || projects[0]?.id);
    setShowUploadModal(true);
  };

  const handleOpenBeforeAfterForProject = (pairId?: string) => {
    setActivePairIdForStudio(pairId);
    setActiveTab('beforeafter');
  };

  const handleGenerateReportForProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('reports');
  };

  const handleUploadSuccess = (newAssets: MediaAsset[]) => {
    setAssets((prev) => [...newAssets, ...prev]);
  };

  const handleSaveNewPair = (newPair: BeforeAfterPair) => {
    setPairs((prev) => [newPair, ...prev]);
  };

  const handleSaveReport = (newReport: ImpactReport) => {
    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(user) => {
          try {
            localStorage.setItem('impactlens_user', JSON.stringify(user));
            localStorage.setItem('impactlens_session', 'true');
          } catch {
            // ignore
          }
          setCurrentUser(user);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('impactlens_session');
    } catch {
      // ignore
    }
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* 3-Zone Clean Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'projects') setSelectedProjectId(null);
        }}
        onOpenUpload={() => handleOpenUploadForProject()}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Mission Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                    Code Cubicle 6.0 · Problem Statement 02
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    Sponsor: Cloudinary
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
                  Media Intelligence & Evidence Command
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
                  Transforming chaotic field media into searchable evidence, measurable impact, before-and-after proof, and tamper-proof visual stories.
                </p>
              </div>

              {/* Quick action cluster */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-neutral-400" />
                  <span>New Initiative</span>
                </button>

                <button
                  onClick={() => handleOpenBeforeAfterForProject(pairs[0]?.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Before-After Studio</span>
                </button>

                <button
                  onClick={() => handleOpenUploadForProject()}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Upload Field Media</span>
                </button>
              </div>
            </div>

            {/* Core Quantitative Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Metric 1: Total Assets */}
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs">Documented Assets</span>
                  <Layers className="h-4 w-4 text-neutral-500" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-100 tabular-nums">
                  {portfolioMetrics.totalAssets}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  100% Cloudinary AI indexed
                </p>
              </div>

              {/* Metric 2: Verified Pairs */}
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs">Verified Before/After</span>
                  <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
                  {portfolioMetrics.totalPairs}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Substantiated change proof
                </p>
              </div>

              {/* Metric 3: Portfolio Evidence Score */}
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs">Portfolio Evidence Score</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1 font-mono text-2xl sm:text-3xl font-bold text-neutral-100 tabular-nums">
                  {portfolioMetrics.avgScore}
                  <span className="text-xs text-neutral-500 font-normal">/100</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                  Verified High Institutional Trust
                </p>
              </div>

              {/* Metric 4: Trust Passports */}
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs">Trust Passports</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-neutral-100 tabular-nums">
                  {portfolioMetrics.verifiedHashCount}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  SHA-256 tamper-proof ledger
                </p>
              </div>

            </div>

            {/* Evidence Strength Radar for Portfolio */}
            <EvidenceScoreRadar
              scoreData={portfolioScoreData}
              projectTitle="Portfolio Audit Overview (All Initiatives)"
              onTakeAction={() => handleOpenUploadForProject()}
            />

            {/* Cryptographic Integrity Audit Sentinel */}
            <IntegrityAuditSection
              assets={assets}
              projects={updatedProjects}
              onUpdateAssets={(updated) => setAssets(updated)}
              onNavigateToMedia={() => setActiveTab('media')}
            />

            {/* Active Impact Initiatives */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-neutral-100">
                    Active Impact Initiatives ({updatedProjects.length})
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Select a project to inspect its photographic timeline, evidence audit, or generate donor dossiers.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Initiative</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                {updatedProjects.map((proj) => {
                  const pAssets = assets.filter((a) => a.projectId === proj.id);
                  const pPairs = pairs.filter((p) => p.projectId === proj.id);

                  return (
                    <ProjectCard
                      key={proj.id}
                      project={proj}
                      assetCount={pAssets.length}
                      pairCount={pPairs.length}
                      onSelectProject={(id) => {
                        setSelectedProjectId(id);
                        setActiveTab('projects');
                      }}
                      onViewBeforeAfter={() => handleOpenBeforeAfterForProject(pPairs[0]?.id)}
                      onGenerateReport={(id) => handleGenerateReportForProject(id)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Recent Ingestion Stream with Cloudinary AI Signals */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Recent Cloudinary AI Ingestions & Trust Verifications
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('media')}
                  className="text-xs font-semibold text-emerald-400 hover:underline"
                >
                  View All Media ➔
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assets.slice(0, 3).map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-start gap-3"
                  >
                    <img
                      src={asset.url}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-lg object-cover bg-neutral-900 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                          {asset.stage}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {new Date(asset.capturedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-medium text-neutral-200 truncate">{asset.title}</h4>
                      <p className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">
                        SHA-256: {asset.trustPassport?.sha256Hash?.substring(0, 14)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PROJECTS VIEW */}
        {activeTab === 'projects' && (
          <div>
            {selectedProjectId && activeProject ? (
              <ProjectDetailView
                project={activeProject}
                assets={assets}
                pairs={pairs}
                onBack={() => setSelectedProjectId(null)}
                onOpenUpload={(projId) => handleOpenUploadForProject(projId)}
                onOpenBeforeAfter={(pairId) => handleOpenBeforeAfterForProject(pairId)}
                onGenerateReport={(projId) => handleGenerateReportForProject(projId)}
                onUpdateAssets={(updated) => setAssets(updated)}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
                      Impact Initiatives & Evidence Hub
                    </h1>
                    <p className="text-xs text-neutral-400 mt-1">
                      Explore initiatives, evaluate Evidence Strength Scores, and manage photographic documentation.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateProjectModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Initiative</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {updatedProjects.map((proj) => {
                    const pAssets = assets.filter((a) => a.projectId === proj.id);
                    const pPairs = pairs.filter((p) => p.projectId === proj.id);
                    return (
                      <ProjectCard
                        key={proj.id}
                        project={proj}
                        assetCount={pAssets.length}
                        pairCount={pPairs.length}
                        onSelectProject={(id) => setSelectedProjectId(id)}
                        onViewBeforeAfter={() => handleOpenBeforeAfterForProject(pPairs[0]?.id)}
                        onGenerateReport={(id) => handleGenerateReportForProject(id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEDIA LIBRARY VIEW */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
                  Intelligent Field Media Library
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Full natural language & structured search powered by Cloudinary AI object detection and SHA-256 provenance.
                </p>
              </div>

              <button
                onClick={() => handleOpenUploadForProject()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload Media</span>
              </button>
            </div>

            <MediaGrid
              assets={assets}
              projects={updatedProjects}
              onUpdateAssets={(updated) => setAssets(updated)}
              onCompareWithThis={(assetId) => {
                handleOpenBeforeAfterForProject();
              }}
            />
          </div>
        )}

        {/* TAB 4: BEFORE-AND-AFTER STUDIO VIEW */}
        {activeTab === 'beforeafter' && (
          <BeforeAfterStudio
            pairs={pairs}
            assets={assets}
            projects={updatedProjects}
            activePairId={activePairIdForStudio}
            onSaveNewPair={handleSaveNewPair}
            onOpenUpload={() => handleOpenUploadForProject()}
          />
        )}

        {/* TAB 5: IMPACT REPORTS VIEW */}
        {activeTab === 'reports' && (
          <ImpactReportGenerator
            projects={updatedProjects}
            assets={assets}
            pairs={pairs}
            reports={reports}
            currentUser={currentUser}
            onSaveReport={handleSaveReport}
          />
        )}

      </main>

      {/* Global Modals */}
      {showUploadModal && (
        <SmartUploadModal
          projects={updatedProjects}
          currentUser={currentUser}
          preselectedProjectId={uploadPreselectedProjectId}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          currentUser={currentUser}
          onUpdateUser={setCurrentUser}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showCreateProjectModal && (
        <CreateProjectModal
          onClose={() => setShowCreateProjectModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {/* Subtle Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-4 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>
            ImpactLens · Code Cubicle 6.0 Hackathon (Geek Room) · Problem Statement 02 · Cloudinary Track
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Cloudinary API Settings
            </button>
            <span aria-hidden="true">·</span>
            <span>Verifiable Evidence for Real Impact</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
