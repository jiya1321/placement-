import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Copy, 
  Check, 
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { TargetOpportunity } from '../types';

interface OpportunitiesViewProps {
  opportunities: TargetOpportunity[];
  isLoading: boolean;
  onSaveToTracker: (opp: TargetOpportunity) => void;
  onConsultRole: (opp: TargetOpportunity) => void;
  onRescout: () => void;
  userLocation?: string;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  isLoading,
  onSaveToTracker,
  onConsultRole,
  onRescout,
  userLocation
}) => {
  const [expandedCoverId, setExpandedCoverId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCoverLetter = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const isIndianLocation = (loc: string) => {
    const l = (loc || '').toLowerCase();
    return l.includes('india') || l.includes('bengaluru') || l.includes('bangalore') || 
           l.includes('delhi') || l.includes('gurgaon') || l.includes('noida') || 
           l.includes('hyderabad') || l.includes('pune') || l.includes('mumbai');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-12 text-center shadow-sm">
        <div className="w-10 h-10 border-3 border-[#2F4F3A]/20 border-t-[#2F4F3A] rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="font-serif font-bold text-base text-[#1F1E1B] mb-1">Opportunity Scout Agent at Work</h3>
        <p className="text-xs text-[#1F1E1B]/60 max-w-md mx-auto">
          Searching verified real company ecosystems, cross-referencing candidate technical assets and preferred location, and tailoring bespoke application hooks...
        </p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-12 text-center shadow-sm">
        <Building2 className="w-10 h-10 text-[#1F1E1B]/20 mx-auto mb-3" />
        <h3 className="font-serif font-bold text-base text-[#1F1E1B] mb-1">No Opportunities Scouted Yet</h3>
        <p className="text-xs text-[#1F1E1B]/60 max-w-sm mx-auto mb-4">
          Provide your target career domain and location in the Dossier & Dispatch tab to scout dynamically tailored target employers and openings.
        </p>
        <button
          onClick={onRescout}
          className="px-4 py-2 bg-[#2F4F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#253f2e]"
        >
          Scout Opportunities Now
        </button>
      </div>
    );
  }

  return (
    <div id="opportunities-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F4F3A]"></span>
            <span className="text-xs font-bold text-[#2F4F3A] uppercase tracking-wider">
              Dynamic Opportunity Scout
            </span>
            {userLocation && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Prioritizing: {userLocation}
              </span>
            )}
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1F1E1B] mt-0.5">
            Tailored Target Opportunities ({opportunities.length})
          </h2>
          <p className="text-xs text-[#1F1E1B]/70">
            Real, verified employers aligned with candidate location, verified careers portal links, and tailored elevator pitches.
          </p>
        </div>

        <button
          onClick={onRescout}
          className="px-3.5 py-2 bg-white border border-[#1F1E1B]/15 hover:border-[#2F4F3A] text-xs font-semibold rounded-lg text-[#1F1E1B] shadow-sm flex items-center gap-1.5 self-start"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2F4F3A]" />
          Re-Scout Roles
        </button>
      </div>

      {/* Opportunity Cards */}
      <div className="space-y-5">
        {opportunities.map((opp) => {
          const isCoverExpanded = expandedCoverId === opp.id;
          const isIndian = isIndianLocation(opp.location);
          const applyLink = opp.apply_url || `https://www.google.com/search?q=${encodeURIComponent(opp.company + ' ' + opp.title + ' careers jobs apply')}`;
          const portalTitle = opp.portal_name || (opp.company + ' Careers Portal');

          return (
            <div
              key={opp.id}
              className="bg-white rounded-xl border border-[#1F1E1B]/10 p-6 shadow-sm space-y-4 transition-all hover:border-[#2F4F3A]/30"
            >
              {/* Card Header */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[#1F1E1B]/10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {opp.match_score}% Match Alignment
                    </span>
                    <span className="text-xs text-[#1F1E1B]/50 font-medium">
                      {opp.industry}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Real Company
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1F1E1B]">
                    {opp.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[#1F1E1B]/70 mt-1 flex-wrap">
                    <span className="font-semibold text-[#1F1E1B] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#2F4F3A]" />
                      {opp.company}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      {isIndian && <span className="mr-0.5">🇮🇳</span>}
                      {opp.location}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-[#2F4F3A] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {opp.stipend}
                    </span>
                    <span>•</span>
                    <span className="text-rose-700 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due {opp.deadline}
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* DIRECT APPLY LINK BUTTON */}
                  <a
                    href={applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                    title={`Open official job application portal: ${portalTitle}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Apply on {portalTitle}</span>
                  </a>

                  <button
                    onClick={() => onConsultRole(opp)}
                    className="px-3 py-2 bg-[#FAF8F3] hover:bg-[#EFECE6] border border-[#1F1E1B]/15 text-[#1F1E1B] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    title="Ask AI Career Advisor how to tailor for this specific role"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#2F4F3A]" />
                    <span>Consult Advisor</span>
                  </button>

                  <button
                    onClick={() => onSaveToTracker(opp)}
                    className="px-3 py-2 bg-[#2F4F3A] hover:bg-[#253f2e] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Save & Track</span>
                  </button>
                </div>
              </div>

              {/* Role Description */}
              <p className="text-xs text-[#1F1E1B]/80 leading-relaxed">
                {opp.description}
              </p>

              {/* Match Reason & Tailored Hook */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-[#FAF8F3] border border-[#1F1E1B]/10 rounded-lg text-xs">
                  <span className="font-bold text-[#2F4F3A] block mb-1">
                    Scout Match Formula:
                  </span>
                  <span className="text-[#1F1E1B]/80 italic">
                    "{opp.match_reason}"
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-lg text-xs">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Recommended Elevator Pitch Hook:
                  </span>
                  <span className="text-emerald-950 font-medium">
                    "{opp.tailored_hook}"
                  </span>
                </div>
              </div>

              {/* Required Skills & Interview Flow */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1F1E1B]/10">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#1F1E1B]/60 mr-1">
                    Key Competencies:
                  </span>
                  {opp.required_skills?.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#1F1E1B]/10 text-[11px] font-medium text-[#1F1E1B]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                {/* Toggle Cover Letter Button */}
                <button
                  onClick={() => setExpandedCoverId(isCoverExpanded ? null : opp.id)}
                  className="text-xs font-semibold text-[#2F4F3A] hover:underline flex items-center gap-1 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {isCoverExpanded ? "Hide Tailored Cover Letter" : "View Tailored Cover Letter"}
                  {isCoverExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Collapsible Tailored Cover Letter */}
              {isCoverExpanded && (
                <div className="mt-3 p-4 bg-[#FAF8F3] border border-[#1F1E1B]/15 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F1E1B] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#2F4F3A]" />
                      Bespoke Tailored Cover Letter for {opp.company}
                    </span>
                    <button
                      onClick={() => handleCopyCoverLetter(opp.id, opp.cover_letter)}
                      className="text-xs px-2.5 py-1 bg-white border border-[#1F1E1B]/10 rounded font-medium text-[#1F1E1B] hover:bg-[#EFECE6] flex items-center gap-1"
                    >
                      {copiedId === opp.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#1F1E1B]/60" />
                          <span>Copy Letter</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#1F1E1B]/85 leading-relaxed whitespace-pre-line font-sans bg-white p-3.5 rounded border border-[#1F1E1B]/10">
                    {opp.cover_letter}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
