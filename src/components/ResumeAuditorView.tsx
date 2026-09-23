import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  FileCheck2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ResumeAudit, ResumeFlaw } from '../types';

interface ResumeAuditorViewProps {
  audit: ResumeAudit | null;
  isLoading: boolean;
  onApplyFix: (flaw: ResumeFlaw) => void;
  onAddKeyword: (keyword: string) => void;
  onReaudit: () => void;
}

export const ResumeAuditorView: React.FC<ResumeAuditorViewProps> = ({
  audit,
  isLoading,
  onApplyFix,
  onAddKeyword,
  onReaudit
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-12 text-center shadow-sm">
        <div className="w-10 h-10 border-3 border-[#2F4F3A]/20 border-t-[#2F4F3A] rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="font-serif font-bold text-base text-[#1F1E1B] mb-1">Resume Auditor Agent Running</h3>
        <p className="text-xs text-[#1F1E1B]/60 max-w-md mx-auto">
          Scanning syntax, parsing action verbs, measuring quantification density, and matching ATS keyword vectors...
        </p>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-12 text-center shadow-sm">
        <ShieldAlert className="w-10 h-10 text-[#1F1E1B]/20 mx-auto mb-3" />
        <h3 className="font-serif font-bold text-base text-[#1F1E1B] mb-1">No Resume Audit Conducted Yet</h3>
        <p className="text-xs text-[#1F1E1B]/60 max-w-sm mx-auto mb-4">
          Provide your resume in the Dossier & Dispatch tab and run the Multi-Agent Orchestrator to calculate your ATS score and uncover critical red flags.
        </p>
        <button
          onClick={onReaudit}
          className="px-4 py-2 bg-[#2F4F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#253f2e]"
        >
          Audit Current Resume Now
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'quantification':
        return { label: 'Missing Metrics (Google XYZ)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'passive_voice':
        return { label: 'Passive Action Verb', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'keyword_gap':
        return { label: 'Missing ATS Keyword', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Clarity & Structure', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  return (
    <div id="resume-auditor-view" className="space-y-6">
      {/* Header Banner & Score */}
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F4F3A]"></span>
              <span className="text-xs font-bold text-[#2F4F3A] uppercase tracking-wider">
                Resume Auditor Agent Report
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1F1E1B]">
              ATS Compliance & Diagnostic Red-Flags
            </h2>
            <p className="text-xs text-[#1F1E1B]/70 max-w-2xl leading-relaxed">
              {audit.summary_feedback}
            </p>
          </div>

          {/* ATS Score Card */}
          <div className="flex items-center gap-4 bg-[#FAF8F3] border border-[#1F1E1B]/10 p-4 rounded-xl shrink-0">
            <div className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center font-bold font-serif ${getScoreColor(audit.ats_score)}`}>
              <span className="text-2xl leading-none">{audit.ats_score}</span>
              <span className="text-[10px] uppercase font-sans font-semibold tracking-wider opacity-80">/ 100</span>
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-[#1F1E1B]">ATS Readability Rating</div>
              <div className="text-[#1F1E1B]/60">
                {audit.ats_score >= 80 ? 'Competitive pass rate' : 'Action items required'}
              </div>
              <button
                onClick={onReaudit}
                className="text-[11px] text-[#2F4F3A] font-semibold hover:underline flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                Re-scan Resume
              </button>
            </div>
          </div>
        </div>

        {/* Strengths Row */}
        {audit.strengths && audit.strengths.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#1F1E1B]/10">
            <h4 className="text-xs font-bold text-[#1F1E1B]/80 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Verified Profile Strengths
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {audit.strengths.map((str, idx) => (
                <div key={idx} className="bg-[#FAF8F3] p-3 rounded-lg border border-[#1F1E1B]/5 text-xs text-[#1F1E1B]/80">
                  {str}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords Box */}
        {audit.missing_keywords && audit.missing_keywords.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#1F1E1B]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1F1E1B]/80 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                Detected ATS Keyword Blindspots (Click to add to your skills profile)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {audit.missing_keywords.map(kw => (
                <button
                  key={kw}
                  onClick={() => onAddKeyword(kw)}
                  className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Click to integrate into your profile"
                >
                  <Plus className="w-3 h-3 text-purple-600" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Identified Flaws & Before/After Fixes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#1F1E1B] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Diagnosed Resume Flaws & One-Click Rewrites ({audit.flaws.length})
          </h3>
          <span className="text-xs text-[#1F1E1B]/60">
            Click "Accept & Update Resume" to adopt the rewritten bullet immediately
          </span>
        </div>

        <div className="space-y-4">
          {audit.flaws.map((flaw, idx) => {
            const badge = getCategoryBadge(flaw.category);
            return (
              <div
                key={flaw.id || idx}
                className="bg-white rounded-xl border border-[#1F1E1B]/10 p-5 shadow-sm space-y-3 transition-all hover:border-[#2F4F3A]/30"
              >
                {/* Flaw Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      flaw.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {flaw.severity} priority
                    </span>
                  </div>
                  <button
                    onClick={() => onApplyFix(flaw)}
                    className="px-3 py-1.5 bg-[#2F4F3A] hover:bg-[#253f2e] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    Accept & Update Resume
                  </button>
                </div>

                {/* Issue explanation */}
                <p className="text-xs text-[#1F1E1B]/70 leading-relaxed">
                  <strong className="text-[#1F1E1B]">Why this hurts you:</strong> {flaw.issue_description}
                </p>

                {/* Before vs After comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Before */}
                  <div className="p-3 bg-rose-50/50 border border-rose-200/60 rounded-lg text-xs">
                    <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                      Current Flawed Phrasing:
                    </div>
                    <p className="text-rose-950 font-mono italic leading-relaxed">
                      "{flaw.original_snippet}"
                    </p>
                  </div>

                  {/* After */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Google XYZ Rewritten Suggestion:
                    </div>
                    <p className="text-emerald-950 font-sans font-medium leading-relaxed">
                      "{flaw.improved_suggestion}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
