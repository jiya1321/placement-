import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  ShieldCheck,
  Globe2,
  Compass
} from 'lucide-react';
import { UserAccount, UserCareerProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount, defaultProfile: Partial<UserCareerProfile>) => void;
  onCancel?: () => void;
  currentUser?: UserAccount | null;
}

export const DEMO_USERS: (UserAccount & { defaultResume: string })[] = [
  {
    id: "user-kunal",
    name: "Kunal Ahuja",
    email: "kunalahuja74414@gmail.com",
    country: "India",
    preferred_location: "India - Bengaluru / Remote",
    target_domain: "Technology & Software Engineering",
    career_goal: "Software Development Engineer (SDE) Intern at high-growth Indian tech or Tier-1 MNCs",
    education: "B.Tech in Computer Science (State University)",
    grad_year: "2027",
    experience_level: "Student / Intern",
    created_at: "2026-09-18T00:00:00Z",
    defaultResume: `EDUCATION:
B.Tech in Computer Science & Engineering (GPA: 8.8/10.0, Expected June 2027)
Relevant Coursework: Data Structures, Operating Systems, Database Management Systems, Computer Networks

TECHNICAL SKILLS:
Languages: C++, Python, TypeScript, SQL, Java
Frameworks & Tools: React, Node.js, Express, Docker, PostgreSQL, Redis, Git, Linux

EXPERIENCE & PROJECTS:
Full-Stack Web Engineering Intern | Campus Tech Labs (June 2025 - August 2025)
- Worked on frontend features and fixed bugs across the application.
- Was responsible for helping with database queries and team code reviews.
- Built full-stack project with Node and React for student event registrations.

Distributed Key-Value Store | Academic Systems Project (Fall 2025)
- Implemented an in-memory caching service in Python with Redis backend.
- Handled concurrent read requests and stored temporary session tokens.`
  },
  {
    id: "user-priya",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    country: "India",
    preferred_location: "India - Mumbai / Hyderabad",
    target_domain: "Financial Services & Quantitative Finance",
    career_goal: "Summer Investment Banking Analyst or Quantitative Strategy Intern",
    education: "B.Com (Honors) & Finance (St. Xavier's College)",
    grad_year: "2026",
    experience_level: "Student / Intern",
    created_at: "2026-09-18T00:00:00Z",
    defaultResume: `EDUCATION:
B.Com (Honors) in Finance & Economics (Expected May 2026)
Passed CFA Level 1 Candidate, NSE Certified Market Professional

FINANCIAL & QUANTITATIVE SKILLS:
Financial Modeling, DCF Valuation, LBO Analysis, Corporate Finance, Bloomberg Terminal, Advanced Excel (VBA), Python for Data Analysis

EXPERIENCE & LEADERSHIP:
Junior Research Analyst Intern | Apex Capital Advisory, Mumbai (June 2025 - Aug 2025)
- Assisted with researching public equity pitches across enterprise SaaS and retail sectors.
- Was responsible for building basic DCF valuation spreadsheets.
- Helped present weekly stock recommendations to executive committee.`
  },
  {
    id: "user-alex",
    name: "Alex Chen",
    email: "alex.chen@example.edu",
    country: "United States",
    preferred_location: "San Francisco, CA / Remote",
    target_domain: "Technology & Software Engineering",
    career_goal: "Software Engineering Intern at Cloud Infrastructure or Developer Tooling company",
    education: "B.S. in Computer Science",
    grad_year: "2027",
    experience_level: "Student / Intern",
    created_at: "2026-09-18T00:00:00Z",
    defaultResume: `EDUCATION:
B.S. in Computer Science (GPA: 3.8/4.0, Expected May 2027)

TECHNICAL SKILLS:
TypeScript, Go, React, Next.js, Docker, Kubernetes, AWS, PostgreSQL, GraphQL

EXPERIENCE:
Undergraduate Software Developer | University Cloud Systems (Jan 2025 - Present)
- Worked on containerized microservices for research data pipelines.
- Assisted with API design and wrote integration test suites.`
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Sign In Form
  const [signInEmail, setSignInEmail] = useState<string>("kunalahuja74414@gmail.com");
  const [signInPassword, setSignInPassword] = useState<string>("password123");

  // Registration Form
  const [fullName, setFullName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [country, setCountry] = useState<string>("India");
  const [preferredLocation, setPreferredLocation] = useState<string>("India - Bengaluru / Remote");
  const [targetDomain, setTargetDomain] = useState<string>("Technology & Software Engineering");
  const [careerGoal, setCareerGoal] = useState<string>("Software Development Engineer (SDE) Intern");
  const [education, setEducation] = useState<string>("B.Tech in Computer Science & Engineering");
  const [gradYear, setGradYear] = useState<string>("2027");
  const [experienceLevel, setExperienceLevel] = useState<string>("Student / Intern");

  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleDemoSelect = (demo: typeof DEMO_USERS[0]) => {
    const user: UserAccount = {
      id: demo.id,
      name: demo.name,
      email: demo.email,
      country: demo.country,
      preferred_location: demo.preferred_location,
      target_domain: demo.target_domain,
      career_goal: demo.career_goal,
      education: demo.education,
      grad_year: demo.grad_year,
      experience_level: demo.experience_level,
      created_at: demo.created_at
    };

    onLoginSuccess(user, {
      full_name: demo.name,
      email: demo.email,
      preferred_location: demo.preferred_location,
      country: demo.country,
      target_domain: demo.target_domain,
      career_goal: demo.career_goal,
      education: demo.education,
      grad_year: demo.grad_year,
      experience_level: demo.experience_level,
      resume_text: demo.defaultResume
    });
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!signInEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    // Check if matched demo user
    const matched = DEMO_USERS.find(u => u.email.toLowerCase() === signInEmail.toLowerCase());
    if (matched) {
      handleDemoSelect(matched);
      return;
    }

    // Generic sign-in user
    const customUser: UserAccount = {
      id: "user-" + Math.random().toString(36).substring(2, 8),
      name: signInEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      email: signInEmail,
      country: "India",
      preferred_location: "India - Bengaluru / Remote",
      target_domain: "Technology & Software Engineering",
      career_goal: "Software Development Engineer (SDE) Intern",
      education: "B.Tech in Computer Science",
      grad_year: "2027",
      experience_level: "Student / Intern",
      created_at: new Date().toISOString()
    };

    onLoginSuccess(customUser, {
      full_name: customUser.name,
      email: customUser.email,
      preferred_location: customUser.preferred_location,
      country: customUser.country,
      target_domain: customUser.target_domain,
      career_goal: customUser.career_goal,
      education: customUser.education,
      grad_year: customUser.grad_year,
      experience_level: customUser.experience_level
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !regEmail.trim()) {
      setErrorMsg("Please provide your full name and email.");
      return;
    }

    const newUser: UserAccount = {
      id: "user-" + Math.random().toString(36).substring(2, 8),
      name: fullName.trim(),
      email: regEmail.trim(),
      country,
      preferred_location: preferredLocation,
      target_domain: targetDomain,
      career_goal: careerGoal.trim() || "Software Engineer Intern",
      education: education.trim() || "Undergraduate Student",
      grad_year: gradYear,
      experience_level: experienceLevel,
      created_at: new Date().toISOString()
    };

    onLoginSuccess(newUser, {
      full_name: newUser.name,
      email: newUser.email,
      preferred_location: newUser.preferred_location,
      country: newUser.country,
      target_domain: newUser.target_domain,
      career_goal: newUser.career_goal,
      education: newUser.education,
      grad_year: newUser.grad_year,
      experience_level: newUser.experience_level
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F1E1B]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F3] border border-[#1F1E1B]/20 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="bg-[#2F4F3A] text-white p-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PlacePilot Career Intelligence OS</span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            Personalized Placement Account
          </h2>
          <p className="text-xs text-white/80 max-w-md mx-auto mt-1">
            Sign in or set your location and target track. PlacePilot will prioritize verified employers, local stipends, and real application portals.
          </p>

          {onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-xs font-semibold p-1"
            >
              ✕ Close
            </button>
          )}
        </div>

        {/* Quick 1-Click Demo Profiles */}
        <div className="bg-white border-b border-[#1F1E1B]/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#1F1E1B]/70 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2F4F3A]" />
              Quick 1-Click Student Demo Profiles
            </span>
            <span className="text-[10px] text-[#2F4F3A] font-semibold bg-[#2F4F3A]/10 px-2 py-0.5 rounded-full">
              Instant Setup
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleDemoSelect(demo)}
                className="text-left p-3 rounded-lg border border-[#1F1E1B]/10 hover:border-[#2F4F3A] hover:bg-[#FAF8F3] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {demo.country === 'India' ? '🇮🇳' : '🌍'}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-[#1F1E1B] group-hover:text-[#2F4F3A] truncate">
                      {demo.name}
                    </div>
                    <div className="text-[10px] text-[#1F1E1B]/60 truncate">
                      {demo.preferred_location.split(' - ')[1] || demo.preferred_location}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[#2F4F3A] font-medium mt-1 truncate">
                  {demo.target_domain.split('&')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-[#1F1E1B]/10 bg-[#EFECE6]/40">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMsg(""); }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-[#2F4F3A] border-b-2 border-[#2F4F3A]'
                : 'text-[#1F1E1B]/60 hover:text-[#1F1E1B]'
            }`}
          >
            Sign In Existing User
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(""); }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-all ${
              activeTab === 'register'
                ? 'bg-white text-[#2F4F3A] border-b-2 border-[#2F4F3A]'
                : 'text-[#1F1E1B]/60 hover:text-[#1F1E1B]'
            }`}
          >
            Create Account & Location Profile
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Sign In */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignInSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#1F1E1B]/40 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#1F1E1B] focus:outline-none focus:ring-2 focus:ring-[#2F4F3A]/30 focus:border-[#2F4F3A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1F1E1B]/40 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#1F1E1B] focus:outline-none focus:ring-2 focus:ring-[#2F4F3A]/30 focus:border-[#2F4F3A]"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#2F4F3A] hover:bg-[#253f2e] text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Enter Career Intelligence OS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-[#1F1E1B]/60 text-center">
              New here? Click "Create Account & Location Profile" to register.
            </p>
          </form>
        ) : (
          /* Tab 2: Register & Onboarding Profile */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#1F1E1B]/40 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kunal Ahuja"
                    className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#1F1E1B] focus:outline-none focus:ring-2 focus:ring-[#2F4F3A]/30 focus:border-[#2F4F3A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#1F1E1B]/40 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="kunal@university.edu"
                    className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#1F1E1B] focus:outline-none focus:ring-2 focus:ring-[#2F4F3A]/30 focus:border-[#2F4F3A]"
                  />
                </div>
              </div>
            </div>

            {/* LOCATION SELECTOR - Crucial for Indian vs Global job targeting */}
            <div className="bg-[#FAF8F3] border border-[#2F4F3A]/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2F4F3A] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Geographic Location & Job Market Alignment
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Prioritizes Real Companies & Local Stipends
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1F1E1B] mb-1">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (e.target.value === 'India') {
                        setPreferredLocation("India - Bengaluru / Remote");
                      } else {
                        setPreferredLocation("United States - San Francisco / Remote");
                      }
                    }}
                    className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg px-3 py-2 text-xs text-[#1F1E1B] focus:outline-none focus:border-[#2F4F3A]"
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="United States">🇺🇸 United States</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Singapore">🇸🇬 Singapore</option>
                    <option value="Global">🌍 Global / Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1F1E1B] mb-1">
                    Preferred Hub / City
                  </label>
                  <select
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg px-3 py-2 text-xs text-[#1F1E1B] focus:outline-none focus:border-[#2F4F3A]"
                  >
                    {country === 'India' ? (
                      <>
                        <option value="India - Bengaluru / Remote">Bengaluru, Karnataka (Silicon Valley of India)</option>
                        <option value="India - Delhi NCR / Gurgaon / Noida">Delhi NCR / Gurgaon / Noida</option>
                        <option value="India - Hyderabad">Hyderabad, Telangana (Cyberabad Hub)</option>
                        <option value="India - Pune">Pune, Maharashtra</option>
                        <option value="India - Mumbai">Mumbai, Maharashtra (Fintech & Commerce)</option>
                        <option value="India - Remote (Pan-India)">Remote (Anywhere in India)</option>
                      </>
                    ) : (
                      <>
                        <option value="San Francisco, CA / Remote">San Francisco Bay Area / Remote</option>
                        <option value="New York, NY / Hybrid">New York, NY (Finance & Tech)</option>
                        <option value="Seattle, WA">Seattle, WA</option>
                        <option value="London, UK">London, United Kingdom</option>
                        <option value="Remote / Global">100% Remote / Global</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Target Domain & Career Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                  Target Professional Track
                </label>
                <select
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg px-3 py-2.5 text-xs text-[#1F1E1B] focus:outline-none focus:border-[#2F4F3A]"
                >
                  <option value="Technology & Software Engineering">Technology & Software Engineering</option>
                  <option value="Financial Services & Quantitative Finance">Financial Services & Investment Banking</option>
                  <option value="Data Science & Artificial Intelligence">Data Science & Artificial Intelligence</option>
                  <option value="Product Design & UI/UX">Product Design & UI/UX</option>
                  <option value="Biotechnology & Healthcare">Biotechnology & Healthcare</option>
                  <option value="Management Consulting & Strategy">Management Consulting & Strategy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                  Primary Role Goal
                </label>
                <input
                  type="text"
                  required
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. SDE Intern, Backend Engineer, Quant Analyst"
                  className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg px-3 py-2.5 text-xs text-[#1F1E1B] focus:outline-none focus:ring-2 focus:ring-[#2F4F3A]/30 focus:border-[#2F4F3A]"
                />
              </div>
            </div>

            {/* Education & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                  University / Degree
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.Tech in Computer Science, 3rd Year"
                  className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg px-3 py-2 text-xs text-[#1F1E1B] focus:outline-none focus:border-[#2F4F3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1E1B] mb-1">
                  Graduation Year
                </label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg px-3 py-2 text-xs text-[#1F1E1B] focus:outline-none focus:border-[#2F4F3A]"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#2F4F3A] hover:bg-[#253f2e] text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Save Profile & Start Scouting Real Companies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
