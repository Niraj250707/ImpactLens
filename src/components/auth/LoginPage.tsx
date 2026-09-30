import React, { useState } from 'react';
import { 
  Camera, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  SlidersHorizontal,
  Cloud
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

const DEMO_PERSONAS: { user: UserProfile; subtitle: string; description: string }[] = [
  {
    user: {
      id: 'usr-901',
      name: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@earthforward.org',
      role: 'NGO Director',
      organization: 'EarthForward Foundation',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    subtitle: 'Executive & Impact Leadership',
    description: 'Portfolio-wide governance, Evidence Strength Score tracking, and institutional donor reporting.',
  },
  {
    user: {
      id: 'usr-902',
      name: 'Rajan Pillai',
      email: 'rajan.pillai@westernbio.org',
      role: 'Field Coordinator',
      organization: 'Western Ghats Agroforestry Collective',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    subtitle: 'Field Operations & Ingestion',
    description: 'Direct field camera uploads, GPS tagging, and before/after baseline documentation.',
  },
  {
    user: {
      id: 'usr-903',
      name: 'Suresh Menon',
      email: 'suresh.menon@auditcompliance.org',
      role: 'M&E Auditor',
      organization: 'Global Impact Assurance Lab',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    subtitle: 'Cryptographic Verification',
    description: 'Audit chains, SHA-256 tamper-proof validation, and independent compliance seals.',
  },
  {
    user: {
      id: 'usr-904',
      name: 'Vikram Singhania',
      email: 'vikram.singhania@rainforestalliance.org',
      role: 'CSR / Donor Partner',
      organization: 'Global Rainforest Alliance Grant Committee',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    subtitle: 'Institutional Grant & Audit',
    description: 'Verifiable before-after change proof review and grant tranche disbursement.',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('NGO Director');
  const [orgName, setOrgName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const customUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Field Operative',
      email,
      role: selectedRole,
      organization: orgName || 'Field Sustainability Initiative',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    onLogin(customUser);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Top Banner */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-neutral-100">
                Impact<span className="text-emerald-400">Lens</span>
              </span>
              <span className="hidden sm:inline-block ml-3 text-xs font-mono text-neutral-500 border-l border-neutral-800 pl-3">
                Cloudinary Track Sponsor · Problem Statement 02
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Cryptographic Proof Engine</span>
          </div>
        </div>
      </header>

      {/* Main Login Arena */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Brand Context (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-mono">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Code Cubicle 6.0 Finalist</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100 leading-tight">
              Prove Real Impact with <span className="text-emerald-400">Clarity & Speed</span>
            </h1>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Transform unstructured field photos and videos into searchable evidence, measurable change, and verifiable visual stories powered by Cloudinary AI.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Automatic Cloudinary AI tagging & scene recognition</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Interactive Before-and-After slider proof</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Mathematical Evidence Strength Score (0–100)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Tamper-proof SHA-256 Trust Passport™ on every file</span>
              </div>
            </div>
          </div>

          {/* Right Login Box (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            
            {/* Persona Switch / Form Toggle */}
            <div className="flex items-center justify-between pb-5 border-b border-neutral-800 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  {isCustomMode ? 'Direct Account Authentication' : 'Instant Demo Personas'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isCustomMode
                    ? 'Log in with custom organizational credentials'
                    : 'Select a verified persona to inspect role-specific M&E workflows'}
                </p>
              </div>

              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline"
              >
                {isCustomMode ? 'Use Quick Personas' : 'Manual Login'}
              </button>
            </div>

            {!isCustomMode ? (
              /* Demo Personas Grid (1-Click Login) */
              <div className="space-y-3">
                {/* 1-Click Instant Demo Button */}
                <button
                  onClick={() => onLogin(DEMO_PERSONAS[0].user)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.99]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Instant Demo Access (Enter as NGO Director)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-neutral-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-mono text-neutral-500 uppercase">Or select verified persona</span>
                  <div className="flex-grow border-t border-neutral-800"></div>
                </div>

                {DEMO_PERSONAS.map((item) => (
                  <div
                    key={item.user.id}
                    onClick={() => onLogin(item.user)}
                    className="group p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/70 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold shrink-0">
                        {item.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-neutral-100 group-hover:text-emerald-300 transition-colors truncate">
                            {item.user.name}
                          </p>
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                            {item.user.role}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-medium truncate mt-0.5">
                          {item.user.organization}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5 hidden sm:block">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-neutral-950 text-xs font-semibold transition-all shrink-0">
                      <span>Enter</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Manual Input Form */
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="auditor@organization.org"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Wildlife Trust of India"
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Platform Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="NGO Director">NGO Director</option>
                      <option value="Field Coordinator">Field Coordinator</option>
                      <option value="M&E Auditor">M&E Auditor</option>
                      <option value="CSR / Donor Partner">CSR / Donor Partner</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md mt-2"
                >
                  <span>Authorize & Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <button
                onClick={() => onLogin(DEMO_PERSONAS[0].user)}
                className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-sans text-xs"
              >
                <span>Continue as Guest</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <span>Encrypted Session · Cloudinary AI</span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 px-6 py-4 text-center text-xs text-neutral-500 font-mono">
        Code Cubicle 6.0 Hackathon by Geek Room · Problem Statement 02 · Cloudinary Track
      </footer>

    </div>
  );
};
