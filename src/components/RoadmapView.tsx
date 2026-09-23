import React, { useState } from 'react';
import { 
  Milestone, 
  CheckSquare, 
  Square, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  Target, 
  Calendar, 
  Layers,
  Award
} from 'lucide-react';
import { PreparationRoadmap } from '../types';

interface RoadmapViewProps {
  roadmap: PreparationRoadmap | null;
  isLoading: boolean;
  onRegenerate: () => void;
  onConsultSprint: (weekTitle: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  roadmap,
  isLoading,
  onRegenerate,
  onConsultSprint
}) => {
  // Local state for checking off tasks
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    "task-1-1": true
  });
  const [activeDrillWeek, setActiveDrillWeek] = useState<number | null>(1);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-12 text-center shadow-sm">
        <div className="w-10 h-10 border-3 border-[#2F4F3A]/20 border-t-[#2F4F3A] rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="font-serif font-bold text-base text-[#1F1E1B] mb-1">Roadmap Strategist Formulating Sprint</h3>
        <p className="text-xs text-[#1F1E1B]/60 max-w-md mx-auto">
          Benchmarking requirements, sequencing portfolio projects, and designing company-specific STAR interview simulations...
        </p>
      </div>
    );
  }

  if (!roadmap || !roadmap.sprints) {
    return (
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-12 text-center shadow-sm">
        <Milestone className="w-10 h-10 text-[#1F1E1B]/20 mx-auto mb-3" />
        <h3 className="font-serif font-bold text-base text-[#1F1E1B] mb-1">No Preparation Roadmap Formulated</h3>
        <p className="text-xs text-[#1F1E1B]/60 max-w-sm mx-auto mb-4">
          Provide your target career goal and resume in the Dossier & Dispatch tab to build your 4-week step-by-step placement blueprint.
        </p>
        <button
          onClick={onRegenerate}
          className="px-4 py-2 bg-[#2F4F3A] text-white text-xs font-semibold rounded-lg hover:bg-[#253f2e]"
        >
          Formulate 4-Week Roadmap Now
        </button>
      </div>
    );
  }

  // Calculate overall progress
  const allTasks = roadmap.sprints.flatMap(s => s.tasks || []);
  const totalTasksCount = allTasks.length;
  const completedCount = allTasks.filter(t => completedTasks[t.id]).length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  return (
    <div id="roadmap-view" className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F4F3A]"></span>
              <span className="text-xs font-bold text-[#2F4F3A] uppercase tracking-wider">
                Roadmap Strategist Blueprint
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1F1E1B]">
              4-Week Strategic Preparation & Superday Sprint
            </h2>
            <p className="text-xs text-[#1F1E1B]/70 max-w-2xl leading-relaxed">
              Targeting: <strong className="text-[#1F1E1B]">{roadmap.target_role}</strong> in <strong className="text-[#1F1E1B]">{roadmap.domain}</strong>. Follow this structured sprint to close resume gaps, construct portfolio proof-of-work, and master high-frequency interview drills.
            </p>
          </div>

          {/* Progress Widget */}
          <div className="bg-[#FAF8F3] border border-[#1F1E1B]/10 p-4 rounded-xl min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1F1E1B]">Readiness Velocity</span>
              <span className="font-mono font-bold text-[#2F4F3A]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-[#1F1E1B]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2F4F3A] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-[#1F1E1B]/60 flex items-center justify-between pt-1">
              <span>{completedCount} of {totalTasksCount} tasks checked</span>
              <button
                onClick={onRegenerate}
                className="text-[#2F4F3A] hover:underline font-semibold"
              >
                Re-plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sprints Timeline */}
      <div className="space-y-6">
        {roadmap.sprints.map((sprint) => {
          const isDrillOpen = activeDrillWeek === sprint.week;
          return (
            <div
              key={sprint.week}
              className="bg-white rounded-xl border border-[#1F1E1B]/10 p-6 shadow-sm space-y-4"
            >
              {/* Sprint Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F1E1B]/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#2F4F3A] text-white flex items-center justify-center font-bold text-sm font-serif">
                    W{sprint.week}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#1F1E1B]">
                      {sprint.phase_title}
                    </h3>
                    <p className="text-xs text-[#1F1E1B]/70">{sprint.objective}</p>
                  </div>
                </div>

                <button
                  onClick={() => onConsultSprint(sprint.phase_title)}
                  className="px-3 py-1.5 bg-[#FAF8F3] hover:bg-[#EFECE6] border border-[#1F1E1B]/15 text-[#1F1E1B] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#2F4F3A]" />
                  Ask Advisor on Sprint
                </button>
              </div>

              {/* Actionable Tasks List */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-[#1F1E1B]/70 uppercase tracking-wider">
                  Milestone Deliverables:
                </h4>
                {sprint.tasks.map((t) => {
                  const isDone = Boolean(completedTasks[t.id]);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-start gap-3 ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200/70 text-emerald-950'
                          : 'bg-[#FAF8F3] border-[#1F1E1B]/10 text-[#1F1E1B] hover:border-[#2F4F3A]/40'
                      }`}
                    >
                      <button type="button" className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-[#1F1E1B]/40" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`font-semibold ${isDone ? 'line-through opacity-70' : ''}`}>
                          {t.task}
                        </div>
                        <div className="text-[11px] opacity-75 mt-0.5">
                          <strong>Deliverable:</strong> {t.deliverable}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interview Simulation Drill */}
              {sprint.interview_drill && (
                <div className="mt-4 pt-3 border-t border-[#1F1E1B]/10">
                  <button
                    onClick={() => setActiveDrillWeek(isDrillOpen ? null : sprint.week)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-[#FAF8F3] border border-[#1F1E1B]/10 text-left hover:bg-[#EFECE6] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#2F4F3A]" />
                      <span className="text-xs font-bold text-[#1F1E1B]">
                        High-Yield Interview Drill: "{sprint.interview_drill.question}"
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#2F4F3A]">
                      {isDrillOpen ? "Hide Framework & Answer" : "View STAR Answer Drill"}
                    </span>
                  </button>

                  {isDrillOpen && (
                    <div className="mt-2.5 p-4 bg-white border border-[#1F1E1B]/10 rounded-lg space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-[#2F4F3A] uppercase tracking-wider text-[10px] block mb-0.5">
                          Recommended Answering Framework:
                        </span>
                        <p className="text-[#1F1E1B]/80 font-medium leading-relaxed">
                          {sprint.interview_drill.recommended_framework}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[#1F1E1B]/10">
                        <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] block mb-0.5">
                          Tailored STAR-Method Answer Simulation:
                        </span>
                        <p className="text-[#1F1E1B]/85 bg-emerald-50/40 p-3 rounded border border-emerald-200/60 leading-relaxed whitespace-pre-line font-sans">
                          {sprint.interview_drill.star_sample_answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
