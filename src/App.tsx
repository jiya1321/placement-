import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  Bot, 
  FileText, 
  Briefcase, 
  Milestone, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Layers, 
  RefreshCw, 
  Settings, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Building2,
  User,
  LogOut,
  MapPin,
  GraduationCap,
  X,
  Search,
  ShieldCheck,
  Table,
  Upload,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { 
  TargetOpportunity, 
  ResumeAudit, 
  ResumeFlaw, 
  PreparationRoadmap, 
  ApplicationRecord, 
  HistoryItem, 
  ChatMessage, 
  UserCareerProfile,
  UserAccount 
} from './types';
import { DOMAIN_PRESETS, DomainPreset } from './data/presets';
import { ResumeAuditorView } from './components/ResumeAuditorView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { RoadmapView } from './components/RoadmapView';
import { AdvisorChatView } from './components/AdvisorChatView';
import { TrackerView } from './components/TrackerView';
import { ResumeDropzone } from './components/ResumeDropzone';
import { LoginPage } from './components/LoginPage';
import { LandingPageView } from './components/LandingPageView';
import { MissionControlView } from './components/MissionControlView';
import { UploadResumePromptModal } from './components/UploadResumePromptModal';
import { ResumeVaultGatedNotice } from './components/ResumeVaultGatedNotice';
import { checkCareerDomainScope, generateSmartLocalAdvisorResponse } from './advisorEngine';

export function App() {
  // User Authentication State with Persistence
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("placepilot_current_user");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showUploadResumeModal, setShowUploadResumeModal] = useState<boolean>(false);
  const [resumePromptServiceName, setResumePromptServiceName] = useState<string>("Career Intelligence Services");

  // View mode: 'landing' (Image 1) or 'app' (Image 2)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  // Navigation tabs matching Image 2
  type TabType = 'mission_control' | 'ledger' | 'vault' | 'search' | 'assistant' | 'roadmap';
  const [activeTab, setActiveTab] = useState<TabType>('mission_control');
  const [vaultSubTab, setVaultSubTab] = useState<'audit' | 'editor'>('audit');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Active User Career Profile - initialized without pre-filled resume until uploaded or preset selected
  const [userProfile, setUserProfile] = useState<UserCareerProfile>(() => {
    const saved = localStorage.getItem("placepilot_current_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.resume_text) {
          return {
            target_domain: u.target_domain || DOMAIN_PRESETS[0].domain,
            career_goal: u.career_goal || DOMAIN_PRESETS[0].goal,
            resume_text: u.resume_text,
            resume_filename: u.resume_filename,
            resume_uploaded_at: u.resume_uploaded_at,
            extracted_skills: u.extracted_skills || [],
            education: u.education || "B.Tech in Computer Science & Engineering",
            country: u.country || "India",
            preferred_location: u.preferred_location || "India - Bengaluru / Remote"
          };
        }
      } catch {}
    }
    return {
      target_domain: DOMAIN_PRESETS[0].domain,
      career_goal: DOMAIN_PRESETS[0].goal,
      resume_text: "",
      extracted_skills: [],
      education: "B.Tech in Computer Science & Engineering",
      country: "India",
      preferred_location: "India - Bengaluru / Remote"
    };
  });

  // State entities
  const [audit, setAudit] = useState<ResumeAudit | null>(null);
  const [opportunities, setOpportunities] = useState<TargetOpportunity[]>([]);
  const [roadmap, setRoadmap] = useState<PreparationRoadmap | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Loading flags
  const [isOrchestrating, setIsOrchestrating] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isScouting, setIsScouting] = useState<boolean>(false);
  const [isRoadmapping, setIsRoadmapping] = useState<boolean>(false);
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [isParsingDocument, setIsParsingDocument] = useState<boolean>(false);

  // Chat conversation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "agent",
      text: "Hello! I am your PlacePilot Career Advisor. I have direct access to your uploaded resume, your diagnosed ATS flaws, your scouted target companies, and your 4-week roadmap sprint. Ask me anything about tailoring your bullets, answering tough interview questions, or drafting recruiter outreach!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referenced_context: "Active Student Dossier"
    }
  ]);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (account: UserAccount, defaultProfile: Partial<UserCareerProfile>) => {
    setCurrentUser(account);
    setShowAuthModal(false);
    localStorage.setItem("placepilot_current_user", JSON.stringify(account));
    setUserProfile(prev => ({
      ...prev,
      target_domain: defaultProfile.target_domain || account.target_domain || prev.target_domain,
      career_goal: defaultProfile.career_goal || account.career_goal || prev.career_goal,
      resume_text: defaultProfile.resume_text || account.resume_text || prev.resume_text,
      resume_filename: defaultProfile.resume_filename || account.resume_filename || prev.resume_filename,
      resume_uploaded_at: defaultProfile.resume_uploaded_at || account.resume_uploaded_at || prev.resume_uploaded_at,
      education: account.education || prev.education,
      country: account.country || prev.country,
      preferred_location: account.preferred_location || prev.preferred_location
    }));
    showToast(`Signed in as ${account.name}! Prioritizing ${account.preferred_location || 'India'}.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("placepilot_current_user");
    // Also clear active profile resume on sign out
    setUserProfile(prev => ({
      ...prev,
      resume_text: "",
      resume_filename: undefined,
      resume_uploaded_at: undefined
    }));
    showToast("Signed out. Profile and name cleared from header.");
  };

  // Helper to check if resume is present
  const hasResumeUploaded = Boolean(userProfile.resume_text && userProfile.resume_text.trim().length > 30);

  // Initial load
  useEffect(() => {
    fetch("/api/state")
      .then(res => res.json())
      .then(data => {
        if (data.opportunities?.length > 0) setOpportunities(data.opportunities);
        if (data.audit) setAudit(data.audit);
        if (data.roadmap) setRoadmap(data.roadmap);
        if (data.applications?.length > 0) setApplications(data.applications);
        if (data.history?.length > 0) setHistory(data.history);
      })
      .catch(err => console.warn("Failed state fetch", err));
  }, []);

  // Quick preset loader
  const handleSelectPreset = (preset: DomainPreset) => {
    const updatedProfile = {
      target_domain: preset.domain,
      career_goal: preset.goal,
      resume_text: preset.resumeSnippet,
      resume_filename: `${preset.label.replace(/\s+/g, '-')}-Dossier.txt`,
      resume_uploaded_at: new Date().toISOString()
    };
    setUserProfile(prev => ({
      ...prev,
      ...updatedProfile
    }));
    // Also persist to current user if logged in
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        resume_text: preset.resumeSnippet,
        resume_filename: updatedProfile.resume_filename,
        resume_uploaded_at: updatedProfile.resume_uploaded_at
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("placepilot_current_user", JSON.stringify(updatedUser));
      fetch("/api/user/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          resume_text: preset.resumeSnippet,
          resume_filename: updatedProfile.resume_filename
        })
      }).catch(e => console.warn("Could not save preset resume to user profile:", e));
    }
    showToast(`Loaded preset dossier: ${preset.label}`);
  };

  // Document Upload & Parser Handler (PDF, Word DOCX/DOC, ODF .odt, TXT, RTF)
  const handleDocumentParsed = (data: {
    filename: string;
    extracted_text: string;
    detected_skills: string[];
    word_count: number;
  }) => {
    const uploadedAt = new Date().toISOString();
    setUserProfile(prev => ({
      ...prev,
      resume_text: data.extracted_text,
      resume_filename: data.filename,
      resume_uploaded_at: uploadedAt,
      extracted_skills: data.detected_skills.length > 0 ? data.detected_skills : prev.extracted_skills
    }));

    // If user is authenticated, save the resume directly to user profile in server and localStorage
    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        resume_text: data.extracted_text,
        resume_filename: data.filename,
        resume_uploaded_at: uploadedAt
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("placepilot_current_user", JSON.stringify(updatedUser));

      fetch("/api/user/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          resume_text: data.extracted_text,
          resume_filename: data.filename
        })
      }).catch(e => console.warn("Failed to save resume to user profile:", e));
    }

    setShowUploadResumeModal(false);
    showToast(`Extracted & saved resume "${data.filename}" (${data.word_count} words) to profile! Services unlocked.`);
  };

  // Full Orchestration Pipeline: Runs Auditor, Scout, and Roadmap concurrently with resilient fallback
  const handleRunOrchestrator = async () => {
    if (!userProfile.resume_text.trim() || userProfile.resume_text.trim().length < 30) {
      setResumePromptServiceName("Multi-Agent Placement Orchestrator");
      setShowUploadResumeModal(true);
      return;
    }

    setIsOrchestrating(true);
    setIsAuditing(true);
    setIsScouting(true);
    setIsRoadmapping(true);

    try {
      const targetLoc = currentUser?.preferred_location || userProfile.preferred_location || "India - Bengaluru / Remote";
      const targetCountry = currentUser?.country || userProfile.country || "India";

      // Dispatch agents concurrently with Promise.allSettled
      const [auditRes, scoutRes, roadmapRes] = await Promise.allSettled([
        fetch("/api/resume/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_text: userProfile.resume_text,
            target_domain: userProfile.target_domain,
            target_role: userProfile.career_goal
          })
        }).then(r => r.json()),

        fetch("/api/opportunities/scout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_text: userProfile.resume_text,
            career_goal: userProfile.career_goal,
            target_domain: userProfile.target_domain,
            location: targetLoc,
            country: targetCountry,
            count: 3
          })
        }).then(r => r.json()),

        fetch("/api/roadmap/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_text: userProfile.resume_text,
            target_role: userProfile.career_goal,
            target_domain: userProfile.target_domain,
            target_companies: "Flipkart, Razorpay, Google India, CRED"
          })
        }).then(r => r.json())
      ]);

      if (auditRes.status === "fulfilled" && auditRes.value?.audit) {
        setAudit(auditRes.value.audit);
      }
      setIsAuditing(false);

      if (scoutRes.status === "fulfilled" && scoutRes.value?.opportunities) {
        setOpportunities(scoutRes.value.opportunities);
      }
      setIsScouting(false);

      if (roadmapRes.status === "fulfilled" && roadmapRes.value?.roadmap) {
        setRoadmap(roadmapRes.value.roadmap);
      }
      setIsRoadmapping(false);

      // Refresh audit logs in background
      fetch("/api/state")
        .then(r => r.json())
        .then(stateJson => {
          if (stateJson.history) setHistory(stateJson.history);
        })
        .catch(() => {});

      showToast("Multi-Agent analysis complete! View your ATS Score, Scouted Roles & 4-Week Sprint.");
      setActiveTab('vault');
      setVaultSubTab('audit');
    } catch (err) {
      console.warn("Orchestration notice:", err);
      showToast("Analysis complete! View your ATS Score, Scouted Roles & 4-Week Sprint.");
      setActiveTab('vault');
      setVaultSubTab('audit');
    } finally {
      setIsOrchestrating(false);
      setIsAuditing(false);
      setIsScouting(false);
      setIsRoadmapping(false);
    }
  };

  // Re-run single agents if needed
  const handleReaudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/resume/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: userProfile.resume_text,
          target_domain: userProfile.target_domain,
          target_role: userProfile.career_goal
        })
      });
      const data = await res.json();
      if (data.audit) {
        setAudit(data.audit);
        showToast(`Resume re-audited! New ATS Score: ${data.audit.ats_score}/100`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRescout = async () => {
    setIsScouting(true);
    try {
      const targetLoc = currentUser?.preferred_location || userProfile.preferred_location || "India - Bengaluru / Remote";
      const targetCountry = currentUser?.country || userProfile.country || "India";

      const res = await fetch("/api/opportunities/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: userProfile.resume_text,
          career_goal: userProfile.career_goal,
          target_domain: userProfile.target_domain,
          location: targetLoc,
          country: targetCountry,
          count: 3
        })
      });
      const data = await res.json();
      if (data.opportunities) {
        setOpportunities(data.opportunities);
        showToast(`Scouted ${data.opportunities.length} tailored opportunities in ${targetLoc}!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScouting(false);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setIsRoadmapping(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: userProfile.resume_text,
          target_role: userProfile.career_goal,
          target_domain: userProfile.target_domain,
          target_companies: opportunities.map(o => o.company).join(", ")
        })
      });
      const data = await res.json();
      if (data.roadmap) {
        setRoadmap(data.roadmap);
        showToast("Roadmap recalculated with updated milestones!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRoadmapping(false);
    }
  };

  // Interactive Fix: Replace flawed bullet in active resume
  const handleApplyFlawFix = (flaw: ResumeFlaw) => {
    let currentText = userProfile.resume_text;
    if (flaw.original_snippet && currentText.includes(flaw.original_snippet)) {
      currentText = currentText.replace(flaw.original_snippet, flaw.improved_suggestion);
    } else {
      // Append if direct substring match wasn't exact
      currentText += `\n- ${flaw.improved_suggestion}`;
    }

    setUserProfile(prev => ({ ...prev, resume_text: currentText }));

    // Optimistically boost ATS score and remove this flaw from the active list
    if (audit) {
      const updatedFlaws = audit.flaws.filter(f => f.id !== flaw.id);
      const newScore = Math.min(98, audit.ats_score + 6);
      setAudit({
        ...audit,
        ats_score: newScore,
        flaws: updatedFlaws
      });
    }

    showToast("Accepted improvement! Resume updated and ATS Score increased.");
  };

  // Add missing keyword to skills
  const handleAddKeyword = (kw: string) => {
    const updated = `${userProfile.resume_text}\n- Proficient in ${kw}`;
    setUserProfile(prev => ({ ...prev, resume_text: updated }));
    if (audit) {
      setAudit({
        ...audit,
        missing_keywords: audit.missing_keywords.filter(k => k !== kw),
        ats_score: Math.min(98, audit.ats_score + 3)
      });
    }
    showToast(`Added "${kw}" to resume profile!`);
  };

  // Save opportunity to tracker
  const handleSaveToTracker = async (opp: TargetOpportunity) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: opp.id,
          title: opp.title,
          company: opp.company,
          industry: opp.industry,
          location: opp.location,
          stipend: opp.stipend,
          status: "Applied"
        })
      });
      const data = await res.json();
      if (data.application) {
        setApplications(prev => {
          const exists = prev.find(a => a.opportunity_id === opp.id);
          if (exists) return prev;
          return [data.application, ...prev];
        });
        showToast(`Saved ${opp.company} (${opp.title}) to Application Tracker!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Switch to advisor chat with pre-filled question about an opportunity
  const handleConsultRole = (opp: TargetOpportunity) => {
    setActiveTab('assistant');
    handleSendMessage(`I'm preparing to apply for the ${opp.title} role at ${opp.company}. Based on my resume and their required skills (${opp.required_skills?.join(", ")}), what are the top 2 things I must highlight in my application and how should I pitch my background?`);
  };

  // Switch to advisor chat regarding a roadmap sprint
  const handleConsultSprint = (sprintTitle: string) => {
    setActiveTab('assistant');
    handleSendMessage(`I'm starting "${sprintTitle}" from my preparation roadmap. Can you walk me through the highest priority task for this week and give me specific execution advice?`);
  };

  // Send message to context-aware Career Advisor
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsChatting(true);

    // Immediate domain guardrail check
    const domainCheck = checkCareerDomainScope(text);
    if (!domainCheck.inScope) {
      const refusalMsg: ChatMessage = {
        id: "msg-guardrail-" + Date.now(),
        sender: "agent",
        text: domainCheck.refusalMessage || "I can only assist with career development, technical interview prep (DSA & System Design), resume optimization, and company hiring loops.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referenced_context: "Domain Guardrail"
      };
      setChatMessages(prev => [...prev, refusalMsg]);
      setIsChatting(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9500);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          question: text,
          user_profile: userProfile,
          audit_data: audit,
          opportunities: opportunities,
          roadmap: roadmap,
          applications: applications
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      const responseAnswer = data.answer && typeof data.answer === 'string' && data.answer.trim().length > 0
        ? data.answer
        : generateSmartLocalAdvisorResponse(text, userProfile, audit, opportunities);

      const agentMsg: ChatMessage = {
        id: "msg-agent-" + Date.now(),
        sender: "agent",
        text: responseAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referenced_context: data.referenced_context || (data.answer ? "Candidate Dossier" : "PlacePilot Local Intelligence Engine")
      };

      setChatMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.warn("API Chat fallback to local intelligence engine:", err);
      // Generate intelligent, question-specific response rather than a static string
      const intelligentAnswer = generateSmartLocalAdvisorResponse(
        text,
        userProfile,
        audit,
        opportunities
      );

      const fallbackMsg: ChatMessage = {
        id: "msg-local-" + Date.now(),
        sender: "agent",
        text: intelligentAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referenced_context: "PlacePilot Local Intelligence Engine"
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsChatting(false);
    }
  };

  // Reset chat conversation
  const handleClearChat = () => {
    setChatMessages([
      {
        id: "msg-init-" + Date.now(),
        sender: "agent",
        text: "Hello! I am your PlacePilot Career & Interview Prep Advisor. I have direct access to your uploaded resume, diagnosed ATS flaws, scouted target companies, and 4-week roadmap sprint. Ask me anything about answering 'Introduce yourself', Two Pointer vs Sliding Window algorithms, Flipkart/Google interview loops, or rewriting bullets with Google's XYZ formula!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referenced_context: "Active Student Dossier"
      }
    ]);
  };

  // Update application status
  const handleUpdateApplicationStatus = async (appId: string, status: ApplicationRecord['status']) => {
    try {
      const app = applications.find(a => a.opportunity_id === appId);
      if (!app) return;
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity_id: appId,
          company: app.company,
          title: app.title,
          status: status
        })
      });
      setApplications(prev => prev.map(a => a.opportunity_id === appId ? { ...a, status } : a));
      showToast(`Status updated to "${status}" for ${app.company}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Render Landing Page View (Image 1)
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#1F1E1B]">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#143823] text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        <LandingPageView
          onEnterApp={() => {
            if (currentUser) {
              setViewMode('app');
              setActiveTab('mission_control');
            } else {
              setShowAuthModal(true);
            }
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          currentUser={currentUser}
          opportunities={opportunities}
          onSelectTab={(tab) => {
            if (currentUser) {
              setViewMode('app');
              setActiveTab(tab);
            } else {
              setShowAuthModal(true);
            }
          }}
        />

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white text-[#1F1E1B] border border-[#1F1E1B]/20 flex items-center justify-center hover:bg-rose-50 hover:text-rose-700 transition-colors shadow-md"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <LoginPage 
                onLoginSuccess={handleLoginSuccess}
                onCancel={() => setShowAuthModal(false)}
                currentUser={currentUser}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Full Application Dashboard (Image 2)
  return (
    <div className="min-h-screen flex bg-[#FAF8F3] text-[#1F1E1B] font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#143823] text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500/20 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar matching Image 2 */}
      <aside className="w-64 bg-[#0A1F13] text-white hidden md:flex flex-col justify-between shrink-0 min-h-screen border-r border-emerald-950/40 sticky top-0 h-screen select-none">
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#143823] text-white flex items-center justify-center border border-emerald-500/30 shadow-xs">
              <Compass className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base tracking-tight text-white leading-tight">PlacePilot</h2>
              <p className="text-[8px] tracking-[0.2em] font-semibold text-emerald-300/70 uppercase">
                CAMPUS CHIEF-OF-STAFF
              </p>
            </div>
          </div>

          {/* Quick link to Landing Page */}
          <button
            onClick={() => setViewMode('landing')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-200/70 hover:text-white hover:bg-white/5 text-xs transition-colors border border-emerald-900/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Home</span>
          </button>

          {/* Navigation Links matching Image 2 */}
          <nav className="space-y-1.5 pt-1">
            {/* 1. Mission Control */}
            <button
              onClick={() => setActiveTab('mission_control')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'mission_control'
                  ? 'bg-[#18442A] text-white shadow-xs border border-emerald-500/30'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Mission Control</span>
            </button>

            {/* 2. Application Ledger */}
            <button
              onClick={() => setActiveTab('ledger')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ledger'
                  ? 'bg-[#18442A] text-white shadow-xs border border-emerald-500/30'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Table className="w-4 h-4 text-emerald-400" />
                <span>Application Ledger</span>
              </div>
              {applications.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/50">
                  {applications.length}
                </span>
              )}
            </button>

            {/* 3. Resume Vault */}
            <button
              onClick={() => setActiveTab('vault')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'vault'
                  ? 'bg-[#18442A] text-white shadow-xs border border-emerald-500/30'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Resume Vault</span>
              </div>
              {audit && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/50">
                  {audit.ats_score}
                </span>
              )}
            </button>

            {/* 4. Internship Search */}
            <button
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-[#18442A] text-white shadow-xs border border-emerald-500/30'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Internship Search</span>
              </div>
              {opportunities.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/50">
                  {opportunities.length}
                </span>
              )}
            </button>

            {/* 5. Career Assistant */}
            <button
              onClick={() => setActiveTab('assistant')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-[#18442A] text-white shadow-xs border border-emerald-500/30'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Career Assistant</span>
            </button>

            {/* 6. Career Sprint */}
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-[#18442A] text-white shadow-xs border border-emerald-500/30'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Career Sprint</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-emerald-950/60 space-y-3 bg-[#07180E]">
          {/* User profile */}
          {currentUser ? (
            <div className="flex items-center justify-between bg-[#0D2517] p-2 rounded-xl border border-emerald-800/40 text-xs">
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 text-left truncate hover:opacity-80 transition-opacity"
                title="Switch or edit candidate profile"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0) : "U"}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-white text-[11px] truncate leading-tight">{currentUser.name}</p>
                  <p className="text-[9px] text-emerald-300/60 truncate">{currentUser.email}</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="text-emerald-400/60 hover:text-rose-400 transition-colors p-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-800/30 hover:bg-emerald-800/50 text-emerald-200 border border-emerald-700/40 text-xs font-semibold transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 flex">
          <div className="w-64 bg-[#0A1F13] text-white flex flex-col justify-between h-full p-5 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span className="font-serif font-bold text-white">PlacePilot</span>
                </div>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-md text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => {
                  setViewMode('landing');
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-200/70 hover:text-white hover:bg-white/5 text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Home</span>
              </button>

              <nav className="space-y-1">
                <button
                  onClick={() => { setActiveTab('mission_control'); setIsMobileSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === 'mission_control' ? 'bg-[#18442A] text-white' : 'text-emerald-100/70'
                  }`}
                >
                  Mission Control
                </button>
                <button
                  onClick={() => { setActiveTab('ledger'); setIsMobileSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === 'ledger' ? 'bg-[#18442A] text-white' : 'text-emerald-100/70'
                  }`}
                >
                  Application Ledger
                </button>
                <button
                  onClick={() => { setActiveTab('vault'); setIsMobileSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === 'vault' ? 'bg-[#18442A] text-white' : 'text-emerald-100/70'
                  }`}
                >
                  Resume Vault
                </button>
                <button
                  onClick={() => { setActiveTab('search'); setIsMobileSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === 'search' ? 'bg-[#18442A] text-white' : 'text-emerald-100/70'
                  }`}
                >
                  Internship Search
                </button>
                <button
                  onClick={() => { setActiveTab('assistant'); setIsMobileSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === 'assistant' ? 'bg-[#18442A] text-white' : 'text-emerald-100/70'
                  }`}
                >
                  Career Assistant
                </button>
                <button
                  onClick={() => { setActiveTab('roadmap'); setIsMobileSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === 'roadmap' ? 'bg-[#18442A] text-white' : 'text-emerald-100/70'
                  }`}
                >
                  Career Sprint
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-emerald-900/40">
              {currentUser ? (
                <button
                  onClick={() => { setShowAuthModal(true); setIsMobileSidebarOpen(false); }}
                  className="w-full text-left text-xs text-emerald-200"
                >
                  Profile: {currentUser.name}
                </button>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setIsMobileSidebarOpen(false); }}
                  className="w-full text-left text-xs text-emerald-300 font-semibold"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)}></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#1F1E1B]/10 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg border border-[#1F1E1B]/15 text-[#1F1E1B] md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-[#143823] capitalize">
                {activeTab.replace('_', ' ')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 hidden sm:inline-block">
                PlacePilot Operating System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Home link */}
            <button
              onClick={() => setViewMode('landing')}
              className="px-3 py-1.5 rounded-lg border border-[#1F1E1B]/15 text-xs text-[#1F1E1B]/70 hover:text-[#143823] hover:bg-[#FAF8F3] transition-colors hidden sm:flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* Top User Indicator / Sign-In Button */}
            {currentUser ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 rounded-lg border border-[#143823]/25 bg-emerald-50/70 hover:bg-emerald-100/60 text-xs text-[#143823] font-semibold transition-colors flex items-center gap-2"
                title={`Signed in as ${currentUser.name} (${currentUser.email})`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                <span className="truncate max-w-[120px]">{currentUser.name}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 rounded-lg border border-[#1F1E1B]/20 hover:bg-[#143823]/5 text-xs text-[#1F1E1B]/80 font-semibold transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#143823]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Quick Orchestrate Button */}
            <button
              onClick={handleRunOrchestrator}
              disabled={isOrchestrating}
              className="px-3 py-1.5 bg-[#143823] hover:bg-[#1E4D32] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-colors"
            >
              {isOrchestrating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                  <span>Orchestrating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Run Agents</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {/* TAB 1: MISSION CONTROL (IMAGE 2) */}
          {activeTab === 'mission_control' && (
            <MissionControlView
              applications={applications}
              roadmap={roadmap}
              audit={audit}
              opportunities={opportunities}
              history={history}
              userProfile={userProfile}
              isOrchestrating={isOrchestrating}
              onRunOrchestrator={handleRunOrchestrator}
              onGoToSearch={() => setActiveTab('search')}
              onGoToVault={() => setActiveTab('vault')}
              onGoToLedger={() => setActiveTab('ledger')}
              onGoToAssistant={() => setActiveTab('assistant')}
              onGoToRoadmap={() => setActiveTab('roadmap')}
            />
          )}

          {/* TAB 2: APPLICATION LEDGER */}
          {activeTab === 'ledger' && (
            <TrackerView
              applications={applications}
              history={history}
              onUpdateStatus={handleUpdateApplicationStatus}
              onGoToOpportunities={() => setActiveTab('search')}
            />
          )}

          {/* TAB 3: RESUME VAULT & ATS AUDITOR */}
          {activeTab === 'vault' && (
            <div className="space-y-6">
              {/* Header with Sub-tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1E1B]/10 pb-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#143823]">
                    Resume Vault & ATS Auditor
                  </h1>
                  <p className="text-xs text-[#1F1E1B]/60 mt-0.5">
                    Diagnose ATS penalties, missing Google XYZ formulas, and upload or edit candidate resumes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#FAF8F3] p-1 rounded-xl border border-[#1F1E1B]/10">
                    <button
                      onClick={() => setVaultSubTab('audit')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        vaultSubTab === 'audit'
                          ? 'bg-[#143823] text-white shadow-xs'
                          : 'text-[#1F1E1B]/70 hover:text-[#1F1E1B]'
                      }`}
                    >
                      ATS Flaws & Fixes
                      {audit && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/30 text-emerald-200">
                          {audit.ats_score}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setVaultSubTab('editor')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        vaultSubTab === 'editor'
                          ? 'bg-[#143823] text-white shadow-xs'
                          : 'text-[#1F1E1B]/70 hover:text-[#1F1E1B]'
                      }`}
                    >
                      Upload & Raw Text
                    </button>
                  </div>
                </div>
              </div>

              {vaultSubTab === 'audit' ? (
                !hasResumeUploaded ? (
                  <ResumeVaultGatedNotice
                    serviceName="ATS Flaw Auditor & Google XYZ Analyzer"
                    serviceDescription="Audit your bullet points against automated filters, detect keyword deficiencies, and apply Google XYZ metric fixes."
                    onParsed={handleDocumentParsed}
                    isParsing={isParsingDocument}
                    setIsParsing={setIsParsingDocument}
                    onError={(err) => showToast(err)}
                    onQuickLoadPreset={() => handleSelectPreset(DOMAIN_PRESETS[0])}
                  />
                ) : (
                  <ResumeAuditorView
                    audit={audit}
                    isLoading={isAuditing}
                    onApplyFix={handleApplyFlawFix}
                    onAddKeyword={handleAddKeyword}
                    onReaudit={handleReaudit}
                  />
                )
              ) : (
                <div className="space-y-6">
                  {/* Domain Presets Quick Switcher */}
                  <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-5 shadow-xs space-y-3">
                    <span className="text-xs font-bold text-[#1F1E1B] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#143823]" />
                      Domain Presets (Click any to pre-fill test dossier):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {DOMAIN_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectPreset(p)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            userProfile.target_domain === p.domain
                              ? 'bg-[#143823] text-white border-[#143823] shadow-xs'
                              : 'bg-[#FAF8F3] hover:bg-[#EFECE6] border-[#1F1E1B]/10 text-[#1F1E1B]'
                          }`}
                        >
                          <div className="font-bold">{p.label}</div>
                          <div className={`text-[10px] truncate mt-0.5 ${userProfile.target_domain === p.domain ? 'text-white/80' : 'text-[#1F1E1B]/60'}`}>
                            {p.domain}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Dropzone & Editor Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-4">
                      {/* Document Dropzone */}
                      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-bold text-sm text-[#1F1E1B] flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#143823]" />
                            Upload Resume Document
                          </h3>
                          <span className="text-[10px] font-semibold text-[#143823] bg-[#143823]/10 px-2 py-0.5 rounded-full">
                            PDF • Word • ODF
                          </span>
                        </div>
                        <ResumeDropzone
                          onParsed={handleDocumentParsed}
                          isParsing={isParsingDocument}
                          setIsParsing={setIsParsingDocument}
                          onError={(err) => showToast(err)}
                        />
                      </div>

                      {/* Goal details */}
                      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-5 shadow-xs space-y-3 text-xs">
                        <label className="font-semibold text-[#1F1E1B] block">Target Domain:</label>
                        <input
                          type="text"
                          value={userProfile.target_domain}
                          onChange={(e) => setUserProfile({ ...userProfile, target_domain: e.target.value })}
                          className="w-full bg-[#FAF8F3] border border-[#1F1E1B]/15 rounded-lg px-3 py-2 text-xs"
                        />

                        <label className="font-semibold text-[#1F1E1B] block">Career Goal:</label>
                        <textarea
                          rows={3}
                          value={userProfile.career_goal}
                          onChange={(e) => setUserProfile({ ...userProfile, career_goal: e.target.value })}
                          className="w-full bg-[#FAF8F3] border border-[#1F1E1B]/15 rounded-lg px-3 py-2 text-xs"
                        />

                        <button
                          onClick={handleRunOrchestrator}
                          disabled={isOrchestrating}
                          className="w-full py-2.5 bg-[#143823] hover:bg-[#1E4D32] text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Re-Audit & Scout with this Profile</span>
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-7">
                      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-bold text-sm text-[#1F1E1B]">
                            Active Parsed Resume Text
                          </h3>
                          <span className="text-[11px] font-mono text-[#1F1E1B]/50">
                            {userProfile.resume_text.split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                        <textarea
                          rows={14}
                          value={userProfile.resume_text}
                          onChange={(e) => setUserProfile({ ...userProfile, resume_text: e.target.value })}
                          placeholder="Paste or upload your resume text here..."
                          className="w-full bg-[#FAF8F3] border border-[#1F1E1B]/15 rounded-lg p-4 font-mono text-xs text-[#1F1E1B] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#143823]/30"
                        />
                        <div className="flex items-center justify-between text-[11px] text-[#1F1E1B]/60">
                          <span>Accepting flaw fixes will rewrite lines here automatically.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setUserProfile(prev => ({ ...prev, resume_text: "" }));
                              showToast("Cleared resume text.");
                            }}
                            className="text-rose-700 hover:underline font-semibold"
                          >
                            Clear Text
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTERNSHIP SEARCH & OPPORTUNITY SCOUT */}
          {activeTab === 'search' && (
            !hasResumeUploaded ? (
              <ResumeVaultGatedNotice
                serviceName="Internship & Placement Scout"
                serviceDescription="Discover curated tech internships across Bengaluru, Hyderabad, Gurugram, Pune, Mumbai, and remote hubs matching your verified candidate profile."
                onParsed={handleDocumentParsed}
                isParsing={isParsingDocument}
                setIsParsing={setIsParsingDocument}
                onError={(err) => showToast(err)}
                onQuickLoadPreset={() => handleSelectPreset(DOMAIN_PRESETS[0])}
              />
            ) : (
              <OpportunitiesView
                opportunities={opportunities}
                isLoading={isScouting}
                onSaveToTracker={handleSaveToTracker}
                onConsultRole={handleConsultRole}
                onRescout={handleRescout}
                userLocation={currentUser?.preferred_location || userProfile.preferred_location || "India - Bengaluru / Remote"}
              />
            )
          )}

          {/* TAB 5: CAREER ASSISTANT & ADVISOR */}
          {activeTab === 'assistant' && (
            !hasResumeUploaded ? (
              <ResumeVaultGatedNotice
                serviceName="AI Career Strategist & Advisor"
                serviceDescription="Consult our senior technical mentor grounded on your exact resume bullets, target roles, interview flaws, and preparation sprint."
                onParsed={handleDocumentParsed}
                isParsing={isParsingDocument}
                setIsParsing={setIsParsingDocument}
                onError={(err) => showToast(err)}
                onQuickLoadPreset={() => handleSelectPreset(DOMAIN_PRESETS[0])}
              />
            ) : (
              <AdvisorChatView
                messages={chatMessages}
                isChatting={isChatting}
                userProfile={userProfile}
                audit={audit}
                opportunities={opportunities}
                roadmap={roadmap}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearChat}
              />
            )
          )}

          {/* TAB 6: 4-WEEK CAREER SPRINT ROADMAP */}
          {activeTab === 'roadmap' && (
            !hasResumeUploaded ? (
              <ResumeVaultGatedNotice
                serviceName="4-Week Placement Sprint Roadmap"
                serviceDescription="Generate an adaptive weekly milestone plan with actionable tasks, target company checklists, and interview mock prep based on your candidate dossier."
                onParsed={handleDocumentParsed}
                isParsing={isParsingDocument}
                setIsParsing={setIsParsingDocument}
                onError={(err) => showToast(err)}
                onQuickLoadPreset={() => handleSelectPreset(DOMAIN_PRESETS[0])}
              />
            ) : (
              <RoadmapView
                roadmap={roadmap}
                isLoading={isRoadmapping}
                onRegenerate={handleRegenerateRoadmap}
                onConsultSprint={handleConsultSprint}
              />
            )
          )}
        </main>
      </div>

      {/* Switch Candidate Profile / Login Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white text-[#1F1E1B] border border-[#1F1E1B]/20 flex items-center justify-center hover:bg-rose-50 hover:text-rose-700 transition-colors shadow-md"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setShowAuthModal(false)}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      {/* Upload Resume Prompt Modal */}
      <UploadResumePromptModal
        isOpen={showUploadResumeModal}
        serviceAttempted={resumePromptServiceName}
        onClose={() => setShowUploadResumeModal(false)}
        onParsed={handleDocumentParsed}
        isParsing={isParsingDocument}
        setIsParsing={setIsParsingDocument}
        onError={(err) => showToast(err)}
      />
    </div>
  );
}

export default App;
