import React from 'react';
import { 
  Compass, 
  ArrowRight, 
  Play, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Bot, 
  ExternalLink,
  MapPin,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';
import { TargetOpportunity, UserAccount } from '../types';

interface LandingPageViewProps {
  onEnterApp: () => void;
  onOpenAuth: () => void;
  currentUser: UserAccount | null;
  opportunities: TargetOpportunity[];
  onSelectTab: (tab: 'mission_control' | 'ledger' | 'vault' | 'search' | 'assistant' | 'roadmap') => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterApp,
  onOpenAuth,
  currentUser,
  opportunities,
  onSelectTab
}) => {
  const sampleOpp1 = opportunities[0] || {
    title: "Frontend Developer Intern",
    company: "Flipkart",
    location: "Bengaluru, India",
    match_score: 92
  };

  const sampleOpp2 = opportunities[1] || {
    title: "Software Engineering Intern",
    company: "Microsoft",
    location: "Hyderabad, India",
    match_score: 88
  };

  // When unauthenticated, Get Started triggers Sign In / Sign Up
  const handleGetStarted = () => {
    if (currentUser) {
      onEnterApp();
    } else {
      onOpenAuth();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1F1E1B] flex flex-col font-sans selection:bg-[#143823]/20 selection:text-[#143823]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#1F1E1B]/10 px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterApp}>
            <div className="w-10 h-10 rounded-xl bg-[#143823] text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xl tracking-tight text-[#143823]">PlacePilot</span>
              </div>
              <p className="text-[9px] tracking-[0.2em] font-semibold text-[#143823]/70 uppercase">
                YOUR CAMPUS CHIEF-OF-STAFF
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1F1E1B]/75">
            <a href="#features" className="hover:text-[#143823] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#143823] transition-colors">How It Works</a>
            <a href="#for-students" className="hover:text-[#143823] transition-colors">For Students</a>
            <a href="#about" className="hover:text-[#143823] transition-colors">About</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={onEnterApp}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-[#143823]/20 hover:bg-[#143823]/5 transition-colors flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {currentUser.name}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-[#1F1E1B]/20 hover:bg-black/5 transition-colors"
              >
                Sign In
              </button>
            )}

            <button
              onClick={handleGetStarted}
              className="bg-[#143823] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#1E4D32] transition-all flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#143823]/8 border border-[#143823]/15 text-[#143823] text-[11px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>REAL OPPORTUNITIES. REAL PROGRESS.</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[62px] leading-[1.08] text-[#143823] font-normal tracking-tight">
              Your career,<br />
              <span className="italic font-serif font-medium text-[#1E4D32]">orchestrated.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#1F1E1B]/75 leading-relaxed max-w-lg font-sans">
              Find real opportunities, match them with your resume, draft applications, and keep your entire career pipeline organized — all from one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleGetStarted}
                className="bg-[#143823] text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#1E4D32] transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#preview-walkthrough"
                className="bg-white text-[#1F1E1B] text-sm font-semibold px-6 py-3.5 rounded-full border border-[#1F1E1B]/15 hover:bg-[#FAF8F3] hover:border-[#1F1E1B]/30 transition-all flex items-center gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-[#143823] text-[#143823]" />
                See How It Works
              </a>
            </div>

            {/* Feature Checklist Divider */}
            <div className="pt-6 border-t border-[#1F1E1B]/10 space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-[#1F1E1B]/80 font-medium">
                <Briefcase className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Real Company Jobs</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#1F1E1B]/80 font-medium">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Resume-Powered Matches</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#1F1E1B]/80 font-medium">
                <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Your Application Journey, Organized</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Browser App Mockup */}
          <div className="lg:col-span-6 relative">
            {/* Top Annotation */}
            <div className="absolute -top-7 right-6 hidden sm:flex items-center gap-2 text-emerald-900/80 font-handwriting text-xl sm:text-2xl select-none pointer-events-none">
              <span>Discover. Apply. Grow.</span>
              <svg className="w-8 h-8 text-emerald-800 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Browser Mockup Container */}
            <div className="bg-[#0E2417] text-white rounded-2xl shadow-2xl border border-emerald-950/60 overflow-hidden ring-1 ring-black/10 transition-transform hover:scale-[1.01] duration-300">
              {/* Browser Header Bar */}
              <div className="px-4 py-2.5 bg-[#091A10] border-b border-emerald-900/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                </div>

                <div className="px-4 py-1 rounded-full bg-[#122F1F] text-emerald-300/80 text-[11px] font-mono flex items-center gap-1.5 border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  placepilot.com/app
                </div>

                <div className="w-10"></div>
              </div>

              {/* Inside Window Content */}
              <div className="grid grid-cols-12 min-h-[380px]">
                {/* Mini Sidebar */}
                <div className="col-span-4 bg-[#0A1E13] p-3.5 border-r border-emerald-900/30 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1 py-1">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span className="font-serif font-bold text-xs tracking-tight text-white">PlacePilot</span>
                    </div>

                    <div className="space-y-1">
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#18442A] text-white text-[11px] font-medium flex items-center gap-2 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Mission Control
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-emerald-100/60 text-[11px] flex items-center gap-2 hover:text-white transition-colors">
                        <FileText className="w-3 h-3" />
                        Application Ledger
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-emerald-100/60 text-[11px] flex items-center gap-2 hover:text-white transition-colors">
                        <ShieldCheck className="w-3 h-3" />
                        Resume Vault
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-emerald-100/60 text-[11px] flex items-center gap-2 hover:text-white transition-colors">
                        <Search className="w-3 h-3" />
                        Internship Search
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg text-emerald-100/60 text-[11px] flex items-center gap-2 hover:text-white transition-colors">
                        <Bot className="w-3 h-3" />
                        Career Assistant
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#122F1F]/60 text-[10px] text-emerald-200/70 border border-emerald-800/30">
                    <p className="font-semibold text-emerald-100">Live Orchestrator</p>
                    <p className="text-[9px] text-emerald-300/60">Chief-of-Staff Active</p>
                  </div>
                </div>

                {/* Mini Main Area */}
                <div className="col-span-8 bg-[#FAF8F5] text-[#1F1E1B] p-4 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#143823]">Good morning!</h4>
                      <p className="text-[11px] text-[#1F1E1B]/60">Here's your application pipeline and personalized insights.</p>
                    </div>

                    {/* 4 Stats Pill Row */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-[#1F1E1B]/10 text-center shadow-2xs">
                        <p className="font-serif font-bold text-sm text-[#143823]">12</p>
                        <p className="text-[8px] text-[#1F1E1B]/60 leading-tight">Total Applications</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#1F1E1B]/10 text-center shadow-2xs">
                        <p className="font-serif font-bold text-sm text-[#143823]">5</p>
                        <p className="text-[8px] text-[#1F1E1B]/60 leading-tight">In Progress</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#1F1E1B]/10 text-center shadow-2xs">
                        <p className="font-serif font-bold text-sm text-[#143823]">4</p>
                        <p className="text-[8px] text-[#1F1E1B]/60 leading-tight">Interviews</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#1F1E1B]/10 text-center shadow-2xs">
                        <p className="font-serif font-bold text-sm text-emerald-700">2</p>
                        <p className="text-[8px] text-[#1F1E1B]/60 leading-tight">Offers</p>
                      </div>
                    </div>

                    {/* Recommended for You */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#143823]">
                        <span>Recommended for You</span>
                        <span className="text-[9px] text-emerald-600 font-normal flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Live matching
                        </span>
                      </div>

                      {/* Card 1 */}
                      <div className="bg-white p-2 rounded-lg border border-[#1F1E1B]/10 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                            F
                          </div>
                          <div>
                            <p className="font-semibold text-[11px] text-[#1F1E1B] leading-tight">{sampleOpp1.title}</p>
                            <p className="text-[9px] text-[#1F1E1B]/60">{sampleOpp1.company} • {sampleOpp1.location}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                          {sampleOpp1.match_score}% match
                        </span>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white p-2 rounded-lg border border-[#1F1E1B]/10 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center">
                            M
                          </div>
                          <div>
                            <p className="font-semibold text-[11px] text-[#1F1E1B] leading-tight">{sampleOpp2.title}</p>
                            <p className="text-[9px] text-[#1F1E1B]/60">{sampleOpp2.company} • {sampleOpp2.location}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                          {sampleOpp2.match_score}% match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Micro action trigger inside mockup */}
                  <button
                    onClick={handleGetStarted}
                    className="w-full mt-2 py-1.5 bg-[#143823] text-white text-[11px] font-semibold rounded-md hover:bg-[#1E4D32] transition-colors flex items-center justify-center gap-1.5"
                  >
                    Enter Mission Control
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Annotation */}
            <div className="mt-4 pl-4 flex items-center gap-2 text-emerald-900/80 font-handwriting text-xl select-none">
              <svg className="w-7 h-7 text-emerald-800 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span>Your next opportunity is closer than you think.</span>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section id="features" className="px-6 lg:px-12 py-16 bg-white border-y border-[#1F1E1B]/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Complete Placement Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#143823] font-bold">
              Five specialized agents, one unified pipeline.
            </h2>
            <p className="text-sm text-[#1F1E1B]/70 font-sans">
              Stop guessing why applications get ghosted. PlacePilot audits your resume, uncovers real openings, crafts bespoke applications, and drills your interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div 
              onClick={() => onSelectTab('vault')}
              className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#1F1E1B]/10 hover:border-emerald-600/40 transition-all hover:shadow-sm cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#143823] text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#143823] mb-2">Resume Vault & ATS Auditor</h3>
              <p className="text-xs text-[#1F1E1B]/70 leading-relaxed mb-4">
                Parse PDF and Word files with in-memory stream extraction. Identifies missing Google XYZ formulas, passive voice, and provides 1-click interactive rewrites.
              </p>
              <span className="text-xs font-semibold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
                Audit Your Resume <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 2 */}
            <div 
              onClick={() => onSelectTab('search')}
              className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#1F1E1B]/10 hover:border-emerald-600/40 transition-all hover:shadow-sm cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#143823] text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#143823] mb-2">Internship Search & Scout</h3>
              <p className="text-xs text-[#1F1E1B]/70 leading-relaxed mb-4">
                Scouts real-world openings matched to your location and profile (Flipkart, Razorpay, Google India, CRED, Zerodha) with real stipend bands and verified links.
              </p>
              <span className="text-xs font-semibold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
                Explore Opportunities <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 3 */}
            <div 
              onClick={() => onSelectTab('roadmap')}
              className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#1F1E1B]/10 hover:border-emerald-600/40 transition-all hover:shadow-sm cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#143823] text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#143823] mb-2">4-Week Career Sprint</h3>
              <p className="text-xs text-[#1F1E1B]/70 leading-relaxed mb-4">
                Structured timeline from Anchor Proof-of-Work Project to STAR behavioral drills, tailored cover letters, and live interview simulations.
              </p>
              <span className="text-xs font-semibold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
                View 4-Week Sprint <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 4 */}
            <div 
              onClick={() => onSelectTab('assistant')}
              className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#1F1E1B]/10 hover:border-emerald-600/40 transition-all hover:shadow-sm cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#143823] text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#143823] mb-2">Career Assistant & Advisor</h3>
              <p className="text-xs text-[#1F1E1B]/70 leading-relaxed mb-4">
                Chatbot with career domain guardrails grounded in your uploaded resume, target companies, and active sprint milestones.
              </p>
              <span className="text-xs font-semibold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
                Ask Career Questions <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 5 */}
            <div 
              onClick={() => onSelectTab('ledger')}
              className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#1F1E1B]/10 hover:border-emerald-600/40 transition-all hover:shadow-sm cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#143823] text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#143823] mb-2">Application Ledger</h3>
              <p className="text-xs text-[#1F1E1B]/70 leading-relaxed mb-4">
                Visual status tracker organizing submissions across Saved, Applied, Screening, Interview, and Offer with verified application links.
              </p>
              <span className="text-xs font-semibold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
                Open Application Ledger <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Feature 6 */}
            <div 
              onClick={handleGetStarted}
              className="bg-[#143823] text-white p-6 rounded-2xl border border-[#143823] hover:bg-[#1A442B] transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-white mb-2">Mission Control Dashboard</h3>
                <p className="text-xs text-emerald-100/75 leading-relaxed">
                  The executive cockpit bringing pipeline metrics, quick actions, and career mission roadmaps together into a single screen.
                </p>
              </div>
              <div className="pt-4">
                <span className="text-xs font-semibold text-emerald-300 inline-flex items-center gap-1">
                  Launch Mission Control <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 lg:px-12 py-16 bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#143823] bg-[#143823]/10 px-3 py-1 rounded-full">
              Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#143823] font-bold">
              How PlacePilot Works
            </h2>
            <p className="text-sm text-[#1F1E1B]/70 font-sans">
              From raw resume to confirmed offer in three coordinated phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-[#1F1E1B]/10 shadow-2xs relative">
              <div className="w-8 h-8 rounded-full bg-[#143823] text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-serif font-bold text-base text-[#143823] mb-2">Upload or Select Profile</h4>
              <p className="text-xs text-[#1F1E1B]/70 leading-relaxed">
                Drop your PDF, Word DOCX, or text resume. The document engine extracts keywords, experience levels, and preferred locations instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-[#1F1E1B]/10 shadow-2xs relative">
              <div className="w-8 h-8 rounded-full bg-[#143823] text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-serif font-bold text-base text-[#143823] mb-2">Multi-Agent Orchestration</h4>
              <p className="text-xs text-[#1F1E1B]/70 leading-relaxed">
                Auditor flags ATS flaws, Scout finds verified matching jobs in India and abroad, and Strategist formulates your 4-week preparation sprint.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-[#1F1E1B]/10 shadow-2xs relative">
              <div className="w-8 h-8 rounded-full bg-[#143823] text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-serif font-bold text-base text-[#143823] mb-2">Execute & Track Pipeline</h4>
              <p className="text-xs text-[#1F1E1B]/70 leading-relaxed">
                Submit tailored cover letters, check off weekly sprint tasks, consult your Career Advisor on interview drills, and track offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section id="for-students" className="px-6 lg:px-12 py-16 bg-white border-t border-[#1F1E1B]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              For Campus & Off-Campus Hiring
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#143823] font-bold leading-tight">
              Engineered specifically for student placement cycles.
            </h2>
            <p className="text-sm text-[#1F1E1B]/75 leading-relaxed">
              Whether you are preparing for campus superdays at IITs, NITs, and top engineering universities, or applying off-campus to high-growth Indian startups, PlacePilot provides the exact tooling and company-specific insight you need.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs text-[#1F1E1B]/80 font-medium">Prioritizes Bengaluru, Hyderabad, Pune, Gurgaon, and remote Indian tech hubs.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs text-[#1F1E1B]/80 font-medium">Realistic stipend expectations (INR ₹50,000 - ₹1,20,000/month or LPA bands).</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs text-[#1F1E1B]/80 font-medium">Compatible with Microsoft for Students $100 Azure Grants for free institutional deployment.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#1F1E1B]/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#143823] text-white flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#143823]">Zero-Barrier Career Readiness</h4>
                <p className="text-xs text-[#1F1E1B]/60">Everything you need without costly career counseling.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#1F1E1B]/10 space-y-2 text-xs">
              <p className="font-bold text-[#143823]">Supported Document Formats:</p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#1F1E1B]/10 font-mono">PDF (.pdf)</span>
                <span className="px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#1F1E1B]/10 font-mono">Word (.docx, .doc)</span>
                <span className="px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#1F1E1B]/10 font-mono">OpenDocument (.odt)</span>
                <span className="px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#1F1E1B]/10 font-mono">Plain Text (.txt)</span>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full py-3 bg-[#143823] text-white rounded-full font-semibold text-xs hover:bg-[#1E4D32] transition-colors flex items-center justify-center gap-2"
            >
              Open PlacePilot Mission Control
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 lg:px-12 py-16 bg-[#143823] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            Ready to orchestrate your career?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl mx-auto font-sans leading-relaxed">
            Dispatch your Chief-of-Staff agents now. Diagnose ATS flaws, uncover verified company openings, and take control of your placement trajectory.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGetStarted}
              className="bg-white text-[#143823] text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-emerald-50 transition-all inline-flex items-center gap-2 shadow-lg active:scale-95"
            >
              Launch PlacePilot
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="px-6 lg:px-12 py-10 bg-[#0A1C12] text-emerald-100/60 text-xs border-t border-emerald-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#143823] text-emerald-300 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif font-bold text-white text-sm">PlacePilot</span>
            <span className="text-[10px] text-emerald-300/40">| Multi-Agent Placement Operating System</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#for-students" className="hover:text-white transition-colors">For Students</a>
            <span className="text-emerald-400/80">Azure Student Grant Ready</span>
          </div>

          <p className="text-[10px] text-emerald-300/40">
            © 2026 PlacePilot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
