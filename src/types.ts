export interface TargetOpportunity {
  id: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  stipend: string;
  deadline: string;
  description: string;
  required_skills: string[];
  match_score: number;
  match_reason: string;
  tailored_hook: string;
  cover_letter: string;
  apply_url?: string;
  portal_name?: string;
  is_verified?: boolean;
  interview_rounds?: string[];
  company_mission?: string;
}

export interface ResumeFlaw {
  id: string;
  category: 'quantification' | 'passive_voice' | 'keyword_gap' | 'clarity_structure';
  severity: 'high' | 'medium' | 'low';
  original_snippet: string;
  issue_description: string;
  improved_suggestion: string;
}

export interface ResumeAudit {
  ats_score: number; // 0 - 100
  summary_feedback: string;
  strengths: string[];
  flaws: ResumeFlaw[];
  missing_keywords: string[];
  suggested_bullet_count: number;
}

export interface RoadmapSprint {
  week: number;
  phase_title: string;
  objective: string;
  tasks: {
    id: string;
    task: string;
    deliverable: string;
    completed: boolean;
  }[];
  interview_drill?: {
    question: string;
    recommended_framework: string;
    star_sample_answer: string;
  };
}

export interface PreparationRoadmap {
  domain: string;
  target_role: string;
  estimated_readiness_weeks: number;
  sprints: RoadmapSprint[];
}

export interface ApplicationRecord {
  id: string;
  opportunity_id: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  stipend: string;
  status: 'Draft' | 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Archived';
  applied_date: string;
  notes?: string;
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  agent_name: 'orchestrator' | 'resume_auditor' | 'opportunity_scout' | 'roadmap_strategist' | 'drafting' | 'career_advisor';
  action_type: string;
  detail: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  referenced_context?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  preferred_location: string;
  country: string;
  target_domain: string;
  career_goal: string;
  education: string;
  grad_year: string;
  experience_level: string;
  resume_filename?: string;
  resume_text?: string;
  resume_uploaded_at?: string;
  created_at: string;
}

export interface UserCareerProfile {
  full_name?: string;
  email?: string;
  preferred_location?: string;
  country?: string;
  target_domain: string;
  career_goal: string;
  resume_text: string;
  resume_filename?: string;
  resume_uploaded_at?: string;
  extracted_skills: string[];
  education: string;
  grad_year?: string;
  experience_level?: string;
}
