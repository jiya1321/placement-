import React from 'react';
import { 
  CheckCircle2, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar, 
  Layers,
  Sparkles
} from 'lucide-react';
import { ApplicationRecord, HistoryItem } from '../types';

interface TrackerViewProps {
  applications: ApplicationRecord[];
  history: HistoryItem[];
  onUpdateStatus: (appId: string, status: ApplicationRecord['status']) => void;
  onGoToOpportunities: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  applications,
  history,
  onUpdateStatus,
  onGoToOpportunities
}) => {
  const getStatusBadge = (status: ApplicationRecord['status']) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Interview':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Screening':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Applied':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div id="tracker-view" className="space-y-6">
      {/* Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F4F3A]"></span>
            <span className="text-xs font-bold text-[#2F4F3A] uppercase tracking-wider">
              Placement Operations Board
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1F1E1B]">
            Application Pipeline & Milestones ({applications.length})
          </h2>
          <p className="text-xs text-[#1F1E1B]/70">
            Track interview rounds, offer letters, and submission milestones coordinated by the multi-agent system.
          </p>
        </div>

        <button
          onClick={onGoToOpportunities}
          className="px-3.5 py-2 bg-[#2F4F3A] hover:bg-[#253f2e] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 self-start"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Add More Target Opportunities
        </button>
      </div>

      {/* Applications Table */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-12 text-center shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-[#1F1E1B]/20 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-base text-[#1F1E1B] mb-1">
            No Opportunities Tracked Yet
          </h3>
          <p className="text-xs text-[#1F1E1B]/60 max-w-sm mx-auto mb-4">
            Visit the "Scouted Opportunities" tab and click "Save & Track" on any role to monitor its progress here.
          </p>
          <button
            onClick={onGoToOpportunities}
            className="px-4 py-2 bg-[#2F4F3A] text-white text-xs font-semibold rounded-lg"
          >
            Explore Scouted Opportunities
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#1F1E1B]/10 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F3] border-b border-[#1F1E1B]/10 text-[#1F1E1B]/70 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Target Company & Role</th>
                <th className="p-4">Industry / Location</th>
                <th className="p-4">Stipend Band</th>
                <th className="p-4">Status & Stage</th>
                <th className="p-4">Logged Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1E1B]/10">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#1F1E1B]">{app.title}</div>
                    <div className="text-[#1F1E1B]/60 font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-[#2F4F3A]" />
                      {app.company}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-[#1F1E1B]/80">{app.industry}</div>
                    <div className="text-[11px] text-[#1F1E1B]/50 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {app.location}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-[#2F4F3A]">
                    {app.stipend}
                  </td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.opportunity_id, e.target.value as ApplicationRecord['status'])}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(app.status)}`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Applied">Applied</option>
                      <option value="Screening">Screening</option>
                      <option value="Interview">Interviewing</option>
                      <option value="Offer">Offer Received 🎉</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </td>
                  <td className="p-4 text-[#1F1E1B]/60 font-mono text-[11px]">
                    {app.applied_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
