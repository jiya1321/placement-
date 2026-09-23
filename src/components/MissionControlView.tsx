import React from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Award, 
  XCircle, 
  Search, 
  Upload, 
  Table, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  CheckSquare, 
  ShieldCheck, 
  Target, 
  Layers,
  Bot
} from 'lucide-react';
import { 
  ApplicationRecord, 
  PreparationRoadmap, 
  ResumeAudit, 
  TargetOpportunity, 
  HistoryItem, 
  UserCareerProfile 
} from '../types';

interface MissionControlViewProps {
  applications: ApplicationRecord[];
  roadmap: PreparationRoadmap | null;
  audit: ResumeAudit | null;
  opportunities: TargetOpportunity[];
  history: HistoryItem[];
  userProfile: UserCareerProfile;
  isOrchestrating: boolean;
  onRunOrchestrator: () => void;
  onGoToSearch: () => void;
  onGoToVault: () => void;
  onGoToLedger: () => void;
  onGoToAssistant: () => void;
  onGoToRoadmap: () => void;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  applications,
  roadmap,
  audit,
  opportunities,
  history,
  userProfile,
  isOrchestrating,
  onRunOrchestrator,
  onGoToSearch,
  onGoToVault,
  onGoToLedger,
  onGoToAssistant,
  onGoToRoadmap
}) => {
  // Compute metric counts
  const totalApps = applications.length;
  const inProgressApps = applications.filter(a => a.status === 'Applied' || a.status === 'Screening').length;
  const interviewApps = applications.filter(a => a.status === 'Interview').length;
  const offerApps = applications.filter(a => a.status === 'Offer').length;
  const rejectedApps = applications.filter(a => a.status === 'Archived').length;

  const hasActiveMissions = Boolean(roadmap && roadmap.sprints && roadmap.sprints.length > 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#143823]">
          Mission Control
        </h1>
        <p className="text-xs sm:text-sm text-[#1F1E1B]/60 mt-0.5">
          Overview of applications, metrics, quick actions, and agent activity
        </p>
      </div>

      {/* Hero Banner (Forest Green Card matching Image 2) */}
      <div className="bg-[#143823] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-2 max-w-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Good morning!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-sans">
            Your PlacePilot Chief-of-Staff is active. Review your live application pipeline, Career Readiness Missions, and agent activity insights.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onRunOrchestrator}
              disabled={isOrchestrating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isOrchestrating ? "Agents Orchestrating..." : "Dispatch All Agents"}
            </button>

            {audit && (
              <span className="text-[11px] px-3 py-1.5 rounded-lg bg-[#0F2B1B] text-emerald-300 border border-emerald-800/40">
                Active ATS Score: <strong className="text-white">{audit.ats_score}/100</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5 Metrics Cards in a Row (Matching Image 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Applications */}
        <div 
          onClick={onGoToLedger}
          className="bg-white rounded-xl p-4 border border-[#1F1E1B]/10 shadow-2xs hover:border-[#143823]/30 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#143823] leading-none mb-1">
              {totalApps}
            </p>
            <p className="text-[11px] text-[#1F1E1B]/60 font-medium">Total Applications</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div 
          onClick={onGoToLedger}
          className="bg-white rounded-xl p-4 border border-[#1F1E1B]/10 shadow-2xs hover:border-[#143823]/30 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#143823] leading-none mb-1">
              {inProgressApps}
            </p>
            <p className="text-[11px] text-[#1F1E1B]/60 font-medium">In Progress</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Interviews */}
        <div 
          onClick={onGoToLedger}
          className="bg-white rounded-xl p-4 border border-[#1F1E1B]/10 shadow-2xs hover:border-[#143823]/30 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#143823] leading-none mb-1">
              {interviewApps}
            </p>
            <p className="text-[11px] text-[#1F1E1B]/60 font-medium">Interviews</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Offers */}
        <div 
          onClick={onGoToLedger}
          className="bg-white rounded-xl p-4 border border-[#1F1E1B]/10 shadow-2xs hover:border-[#143823]/30 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800 leading-none mb-1">
              {offerApps}
            </p>
            <p className="text-[11px] text-[#1F1E1B]/60 font-medium">Offers</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Card 5: Rejected */}
        <div 
          onClick={onGoToLedger}
          className="bg-white rounded-xl p-4 border border-[#1F1E1B]/10 shadow-2xs hover:border-[#143823]/30 transition-all cursor-pointer flex items-center justify-between col-span-2 sm:col-span-1"
        >
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-rose-800 leading-none mb-1">
              {rejectedApps}
            </p>
            <p className="text-[11px] text-[#1F1E1B]/60 font-medium">Rejected</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* YOUR ACTIVE CAREER MISSIONS Section Card (Matching Image 2) */}
      <div className="bg-white rounded-2xl border border-[#1F1E1B]/10 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#143823]">
                YOUR ACTIVE CAREER MISSIONS
              </h3>
              <p className="text-[11px] text-[#1F1E1B]/60">
                Personalized readiness plans & proof projects for target jobs
              </p>
            </div>
          </div>

          <button
            onClick={onGoToSearch}
            className="text-xs font-semibold text-[#143823] hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-[#1F1E1B]/15 hover:border-[#143823]/40 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Search className="w-3.5 h-3.5" />
            Find Internships
          </button>
        </div>

        {/* Inner Mission Box */}
        {hasActiveMissions && roadmap ? (
          <div className="bg-[#FAF8F3] rounded-xl p-5 border border-[#1F1E1B]/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1E1B]/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Active Sprint
                </span>
                <h4 className="font-serif font-bold text-base text-[#143823] mt-1">
                  {roadmap.target_role} ({roadmap.domain})
                </h4>
              </div>
              <button
                onClick={onGoToRoadmap}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
              >
                View 4-Week Sprint Plan
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.sprints.slice(0, 2).map((sprint) => (
                <div key={sprint.week} className="bg-white p-3.5 rounded-lg border border-[#1F1E1B]/10 shadow-2xs">
                  <p className="text-xs font-bold text-[#143823] flex items-center gap-1.5 mb-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                    Week {sprint.week}: {sprint.phase_title}
                  </p>
                  <p className="text-[11px] text-[#1F1E1B]/70 leading-relaxed">
                    {sprint.objective}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State Matching Image 2 */
          <div className="bg-[#FAF8F5] rounded-xl p-8 border border-[#1F1E1B]/10 text-center space-y-4">
            <p className="text-xs text-[#1F1E1B]/70 max-w-md mx-auto">
              No active Career Missions yet. Choose a job in Internship Search and build your first Career Mission.
            </p>
            <button
              onClick={onGoToSearch}
              className="bg-[#143823] text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1E4D32] transition-colors inline-flex items-center gap-2 shadow-xs active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              FIND INTERNSHIPS
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions Row (Matching Image 2) */}
      <div className="bg-white rounded-2xl border border-[#1F1E1B]/10 p-6 shadow-2xs space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#143823]">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Action 1: Find Internships (Dark Green) */}
          <button
            onClick={onGoToSearch}
            className="bg-[#143823] text-white text-xs font-semibold px-4 py-3 rounded-xl hover:bg-[#1E4D32] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
          >
            <Search className="w-4 h-4" />
            Find Internships
          </button>

          {/* Action 2: Upload Resume (White with border) */}
          <button
            onClick={onGoToVault}
            className="bg-white text-[#1F1E1B] text-xs font-semibold px-4 py-3 rounded-xl border border-[#1F1E1B]/15 hover:bg-[#FAF8F3] hover:border-[#1F1E1B]/30 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-95"
          >
            <Upload className="w-4 h-4 text-emerald-800" />
            Upload Resume
          </button>

          {/* Action 3: View Ledger (White with border) */}
          <button
            onClick={onGoToLedger}
            className="bg-white text-[#1F1E1B] text-xs font-semibold px-4 py-3 rounded-xl border border-[#1F1E1B]/15 hover:bg-[#FAF8F3] hover:border-[#1F1E1B]/30 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-95"
          >
            <Table className="w-4 h-4 text-emerald-800" />
            View Ledger
          </button>

          {/* Action 4: Ask Assistant (White with border) */}
          <button
            onClick={onGoToAssistant}
            className="bg-white text-[#1F1E1B] text-xs font-semibold px-4 py-3 rounded-xl border border-[#1F1E1B]/15 hover:bg-[#FAF8F3] hover:border-[#1F1E1B]/30 transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-emerald-800" />
            Ask Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
