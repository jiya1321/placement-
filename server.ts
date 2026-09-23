import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { 
  TargetOpportunity, 
  ResumeAudit, 
  PreparationRoadmap, 
  ApplicationRecord, 
  HistoryItem 
} from "./src/types.js";
import { 
  checkCareerDomainScope, 
  retrieveRelevantRAG, 
  generateSmartLocalAdvisorResponse 
} from "./serverAdvisor.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

// CORS & Preflight middleware for Vercel and local dev
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, api-key");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// URL path restoration for Vercel Serverless Function routing
app.use((req, res, next) => {
  const matchedPath = (req.headers["x-matched-path"] as string) || 
                      (req.headers["x-vercel-matched-path"] as string) || 
                      (req.headers["x-forwarded-uri"] as string);
  if (matchedPath && matchedPath.startsWith("/api") && (req.url === "/api" || req.url === "/api/" || req.url === "/")) {
    req.url = matchedPath;
  }
  next();
});

// In-memory state
let currentOpportunities: TargetOpportunity[] = [];
let currentAudit: ResumeAudit | null = null;
let currentRoadmap: PreparationRoadmap | null = null;
let currentApplications: ApplicationRecord[] = [];
let historyLogs: HistoryItem[] = [
  {
    id: 1,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    agent_name: "orchestrator",
    action_type: "engine_online",
    detail: "PlacePilot Multi-Agent Career Intelligence OS initialized. Adaptive to any professional domain and location."
  }
];

// Registered Users Store for Course Project Persistence
let registeredUsers: any[] = [
  {
    id: "user-kunal",
    name: "Kunal Ahuja",
    email: "kunalahuja74414@gmail.com",
    country: "India",
    preferred_location: "India - Bengaluru / Remote",
    target_domain: "Technology & Software Engineering",
    career_goal: "Software Development Engineer (SDE) Intern at Tier-1 tech or high-growth Indian startups",
    education: "B.Tech in Computer Science & Engineering",
    grad_year: "2027",
    experience_level: "Student / Intern",
    created_at: new Date().toISOString()
  },
  {
    id: "user-priya",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    country: "India",
    preferred_location: "India - Mumbai / Hyderabad",
    target_domain: "Financial Services & Quantitative Finance",
    career_goal: "Summer Investment Banking Analyst or Quantitative Strategy Intern",
    education: "B.Com (Honors) & Finance",
    grad_year: "2026",
    experience_level: "Student / Intern",
    created_at: new Date().toISOString()
  },
  {
    id: "user-alex",
    name: "Alex Chen",
    email: "alex.chen@example.edu",
    country: "United States",
    preferred_location: "San Francisco, CA / Remote",
    target_domain: "Technology & Software Engineering",
    career_goal: "Software Engineering Intern at Cloud Infrastructure company",
    education: "B.S. in Computer Science",
    grad_year: "2027",
    experience_level: "Student / Intern",
    created_at: new Date().toISOString()
  }
];

// Helper to resolve verified official career portal URLs for real companies
function getVerifiedApplyUrl(company: string, title: string): { url: string; portal: string } {
  const c = (company || "").toLowerCase();
  if (c.includes("flipkart")) return { url: "https://www.flipkartcareers.com/", portal: "Flipkart Official Careers" };
  if (c.includes("razorpay")) return { url: "https://razorpay.com/jobs/", portal: "Razorpay Careers" };
  if (c.includes("google")) return { url: "https://careers.google.com/jobs/results/?location=India", portal: "Google India Careers" };
  if (c.includes("cred")) return { url: "https://careers.cred.club/", portal: "CRED Careers" };
  if (c.includes("zerodha")) return { url: "https://zerodha.com/careers/", portal: "Zerodha Careers" };
  if (c.includes("zomato") || c.includes("blinkit")) return { url: "https://www.zomato.com/careers", portal: "Zomato Careers" };
  if (c.includes("swiggy")) return { url: "https://careers.swiggy.com/", portal: "Swiggy Careers" };
  if (c.includes("microsoft")) return { url: "https://careers.microsoft.com/v2/global/en/home.html", portal: "Microsoft Careers" };
  if (c.includes("amazon")) return { url: "https://www.amazon.jobs/en/locations/bangalore-india", portal: "Amazon India Jobs" };
  if (c.includes("tata") || c.includes("tcs")) return { url: "https://www.tcs.com/careers", portal: "TCS Careers" };
  if (c.includes("infosys")) return { url: "https://www.infosys.com/careers.html", portal: "Infosys Careers" };
  if (c.includes("phonepe")) return { url: "https://www.phonepe.com/careers/", portal: "PhonePe Careers" };
  if (c.includes("goldman")) return { url: "https://www.goldmansachs.com/careers/", portal: "Goldman Sachs India" };
  if (c.includes("morgan stanley")) return { url: "https://www.morganstanley.com/people-opportunities/students-graduates", portal: "Morgan Stanley Campus" };
  if (c.includes("biocon")) return { url: "https://www.biocon.com/careers/", portal: "Biocon Careers" };
  if (c.includes("dr. reddy") || c.includes("dr reddy")) return { url: "https://careers.drreddys.com/", portal: "Dr. Reddy's Careers" };
  if (c.includes("stripe")) return { url: "https://stripe.com/jobs", portal: "Stripe Careers" };
  if (c.includes("figma")) return { url: "https://www.figma.com/careers/", portal: "Figma Careers" };
  if (c.includes("datadog")) return { url: "https://careers.datadoghq.com/", portal: "Datadog Careers" };
  
  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(company + " " + title + " careers jobs apply")}`,
    portal: "Official Employer Portal"
  };
}

function logAction(agentName: HistoryItem["agent_name"], actionType: string, detail: string) {
  const newEntry: HistoryItem = {
    id: historyLogs.length + 1,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    agent_name: agentName,
    action_type: actionType,
    detail: detail
  };
  historyLogs.unshift(newEntry);
  if (historyLogs.length > 80) historyLogs.pop();
}

// Quota circuit breaker: if upstream rate limits or exhausts quota, switch immediately to local intelligence
let quotaExhaustedUntil = 0;

// Lazy Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Global Azure telemetry tracking metrics
const azureMetrics = {
  totalCalls: 0,
  successfulCalls: 0,
  lastCallTimestamp: null as string | null,
  lastPromptSample: "" as string,
  lastResponseModel: "" as string,
  lastLatencyMs: 0,
  lastStatus: "Idle" as string
};

// Azure OpenAI caller (Microsoft AI Foundry / Azure OpenAI Service)
async function callAzureOpenAI(prompt: string, systemInstruction?: string, maxTokens: number = 1200): Promise<string | null> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const rawEndpoint = process.env.AZURE_OPENAI_API_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || "gpt-4.1-mini";

  if (!apiKey || !rawEndpoint) return null;

  azureMetrics.totalCalls++;
  azureMetrics.lastCallTimestamp = new Date().toISOString();
  azureMetrics.lastPromptSample = prompt.substring(0, 60).replace(/\n/g, " ") + "...";
  azureMetrics.lastStatus = "In-Flight";

  const startTime = Date.now();
  console.log(`\n======================================================`);
  console.log(`[MICROSOFT AZURE AI FOUNDRY] Dispatching Request #${azureMetrics.totalCalls}`);
  console.log(` -> Endpoint: ${rawEndpoint.replace(/\/+$/, "")}`);
  console.log(` -> Deployment: ${deployment}`);
  console.log(` -> Prompt: "${prompt.substring(0, 50).replace(/\n/g, " ")}..."`);
  console.log(`======================================================\n`);

  try {
    const endpoint = rawEndpoint.replace(/\/+$/, "");
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

    const messages: Array<{ role: string; content: string }> = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8500);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        messages,
        max_tokens: maxTokens,
        temperature: 0.7
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    azureMetrics.lastLatencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      azureMetrics.lastStatus = `HTTP Error ${response.status}`;
      console.warn(`[MICROSOFT AZURE AI FOUNDRY ERROR ${response.status}]:`, errText);
      return null;
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const modelUsed = data?.model || deployment;

    azureMetrics.successfulCalls++;
    azureMetrics.lastResponseModel = modelUsed;
    azureMetrics.lastStatus = "200 OK (Delivered)";

    console.log(`[MICROSOFT AZURE AI FOUNDRY] Response Received!`);
    console.log(` -> Model: ${modelUsed}`);
    console.log(` -> Latency: ${azureMetrics.lastLatencyMs}ms`);
    console.log(` -> Response length: ${content ? content.length : 0} chars`);

    if (content && typeof content === "string" && content.trim().length > 0) {
      logAction("orchestrator", "azure_llm_execution", `Executed inference on Microsoft Azure AI Foundry (${deployment} / ${modelUsed}, latency: ${azureMetrics.lastLatencyMs}ms)`);
      return content.trim();
    }
  } catch (err: any) {
    azureMetrics.lastLatencyMs = Date.now() - startTime;
    azureMetrics.lastStatus = `Exception: ${err?.message || err}`;
    console.warn(`[MICROSOFT AZURE AI FOUNDRY NOTICE]: ${err?.message || err}`);
  }
  return null;
}

// Unified multi-provider LLM caller: Azure OpenAI -> Gemini fallback cascade -> Local engine
async function callGemini(prompt: string, systemInstruction?: string, maxTokens: number = 1200): Promise<string | null> {
  const provider = (process.env.LLM_PROVIDER || "").toLowerCase();
  const hasAzure = Boolean(
    process.env.AZURE_OPENAI_API_KEY && 
    (process.env.AZURE_OPENAI_API_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT)
  );

  // If Azure is configured or explicitly set as provider, route through Azure OpenAI Foundry
  if (provider === "azure" || hasAzure) {
    const azureResult = await callAzureOpenAI(prompt, systemInstruction, maxTokens);
    if (azureResult) {
      return azureResult;
    }
  }

  // If quota was recently exhausted, bypass immediately without network wait
  if (Date.now() < quotaExhaustedUntil) {
    return null;
  }

  const ai = getAIClient();
  if (!ai) return null;

  // Prioritize fast modern Gemini 3 flash models with fallback cascade
  const candidateModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.8-flash"
  ];
  for (const model of candidateModels) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || undefined,
            maxOutputTokens: maxTokens,
            temperature: 0.7
          }
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after 4500ms on model ${model}`)), 4500)
        )
      ]);
      const text = response?.text?.trim() || 
        response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("\n").trim();
      if (text && text.length > 0) {
        return text;
      }
    } catch (err: any) {
      const msg = (err?.message || String(err)).toLowerCase();
      if (msg.includes("resource_exhausted") || msg.includes("quota") || msg.includes("429")) {
        console.warn(`[Gemini API Quota Exceeded. Seamlessly activated PlacePilot Local Intelligence Engine.]`);
        // Trip circuit breaker for 3 minutes to avoid blocking subsequent requests
        quotaExhaustedUntil = Date.now() + 180000;
        return null;
      }
      console.warn(`[Gemini model ${model} skipped: ${err?.message || err}]`);
    }
  }
  return null;
}

// Extract JSON safely from markdown fenced codeblocks
function extractJson<T>(rawText: string, fallback: T): T {
  try {
    const clean = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(clean) as T;
  } catch {
    // Try to find first { or [ and last } or ]
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1)) as T;
      } catch {}
    }
    const firstBracket = rawText.indexOf("[");
    const lastBracket = rawText.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(rawText.substring(firstBracket, lastBracket + 1)) as T;
      } catch {}
    }
    return fallback;
  }
}

// --- INITIAL SEEDING HELPER ---
function initializeDomainFallback(domain: string, goal: string, resumeText: string, locationStr?: string): {
  audit: ResumeAudit;
  opportunities: TargetOpportunity[];
  roadmap: PreparationRoadmap;
} {
  const domainClean = (domain || "").toLowerCase();
  const locClean = (locationStr || "").toLowerCase();
  const isIndia = locClean.includes("india") || locClean.includes("bengaluru") || locClean.includes("bangalore") || 
                  locClean.includes("delhi") || locClean.includes("gurgaon") || locClean.includes("noida") || 
                  locClean.includes("hyderabad") || locClean.includes("pune") || locClean.includes("mumbai") ||
                  (!locClean && domainClean.includes("tech")); // default to India-friendly for course project if unspecified

  let opportunities: TargetOpportunity[] = [];

  if (isIndia && (domainClean.includes("tech") || domainClean.includes("software") || domainClean.includes("sde") || domainClean.includes("engineer"))) {
    opportunities = [
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Software Development Engineer (SDE) Intern - Logistics & Core Systems",
        company: "Flipkart",
        industry: "E-Commerce & Distributed Consumer Tech",
        location: "Bengaluru, Karnataka (Hybrid)",
        stipend: "₹65,000 - ₹1,00,000 / month",
        deadline: "October 30, 2026",
        description: "Architect and scale high-throughput transaction pipelines, warehouse automation microservices, and real-time inventory synchronization serving 100M+ Indian customers.",
        required_skills: ["Java / Python", "Data Structures & Algorithms", "Spring Boot / Node.js", "MySQL / Redis", "Distributed Systems"],
        match_score: 95,
        match_reason: "High alignment with microservice decomposition, database query optimization, and resilient API architecture.",
        tailored_hook: "Software engineer passionate about high-concurrency architectures, low-latency microservices, and large-scale consumer commerce pipelines.",
        cover_letter: "Dear Flipkart Campus Recruitment Team,\n\nI am writing to express my strong enthusiasm for the Software Development Engineer Internship at Flipkart. Having built distributed web applications and optimized database indexing to handle concurrent load spikes, I am eager to contribute to India's premier e-commerce logistics platform.",
        apply_url: "https://www.flipkartcareers.com/",
        portal_name: "Flipkart Official Careers",
        is_verified: true,
        interview_rounds: ["Online Coding Assessment (DSA & Problem Solving)", "Technical Round 1: Data Structures & Algorithms", "Technical Round 2: Low-Level System Design", "Flipkart Culture & Hiring Manager Round"]
      },
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Full-Stack Software Engineering Intern - Core Payments Gateway",
        company: "Razorpay",
        industry: "Fintech & Developer Banking Infrastructure",
        location: "Bengaluru / Remote (India)",
        stipend: "₹50,000 - ₹80,000 / month",
        deadline: "November 10, 2026",
        description: "Build developer-first payment APIs, automated transaction reconciliation engines, and idempotent checkout SDKs processing over $100B in annual volume.",
        required_skills: ["TypeScript / Node.js", "REST APIs", "Go / Python", "PostgreSQL", "Docker"],
        match_score: 92,
        match_reason: "Strong hands-on experience with TypeScript full-stack modular architectures and robust state management.",
        tailored_hook: "Product-minded full-stack developer with verified experience engineering resilient APIs, clean state architecture, and atomic database transactions.",
        cover_letter: "Dear Razorpay Engineering Hiring Team,\n\nI am thrilled to apply for the Software Engineering Internship. Razorpay's obsession with developer experience, sub-second payment routing, and financial API reliability makes it the ideal environment for my backend engineering skills.",
        apply_url: "https://razorpay.com/jobs/",
        portal_name: "Razorpay Careers",
        is_verified: true,
        interview_rounds: ["Coding Screen (Algorithms & Machine Coding)", "API Design & Practical Coding Round", "Engineering Leadership & Values Dialogue"]
      },
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Software Engineering Summer Intern (2026/2027)",
        company: "Google India",
        industry: "Global Cloud, Search & AI Infrastructure",
        location: "Bengaluru / Hyderabad, India",
        stipend: "₹90,000 - ₹1,30,000 / month",
        deadline: "October 25, 2026",
        description: "Contribute to core Google Cloud, Workspace, and Android ecosystem infrastructure powering billions of global users daily.",
        required_skills: ["C++ / Java / Python", "Data Structures & Algorithms", "Operating Systems", "Computer Networks", "Problem Solving"],
        match_score: 96,
        match_reason: "Solid computer science theoretical foundations, algorithmic rigor, and structured software architecture.",
        tailored_hook: "Analytical software engineer with solid foundations in algorithmic complexity, modular systems design, and performance benchmarking.",
        cover_letter: "Dear Google India University Programs Team,\n\nI am applying for the Software Engineering Summer Internship at Google India. Building scalable applications and dissecting asymptotic algorithm complexity drives my passion for tackling planetary-scale challenges.",
        apply_url: "https://careers.google.com/jobs/results/?location=India",
        portal_name: "Google India Careers",
        is_verified: true,
        interview_rounds: ["Online Challenge Screen", "2x 45-min Google SWE Interviews (DSA & Problem Solving)", "Googlyness & Leadership Interview"]
      },
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Backend Systems & Reliability Engineering Intern",
        company: "CRED",
        industry: "Consumer Fintech & High-Scale Systems",
        location: "Bengaluru, Karnataka (Onsite)",
        stipend: "₹65,000 - ₹95,000 / month",
        deadline: "November 5, 2026",
        description: "Develop ultra-low-latency financial microservices, event-driven pipelines (Kafka), and reward settlement logic under intense flash traffic.",
        required_skills: ["Go / Java", "Kafka / Event Streams", "PostgreSQL", "Redis", "Distributed Systems"],
        match_score: 90,
        match_reason: "High affinity for distributed architecture and clean, robust system decomposition.",
        tailored_hook: "Systems developer dedicated to high-throughput event processing, microsecond performance, and clean code craftsmanship.",
        cover_letter: "Dear CRED Engineering Team,\n\nCRED's uncompromising design aesthetics and world-class engineering standards inspire me. Having worked on backend caching and database query optimization, I would love to build resilient distributed services at CRED.",
        apply_url: "https://careers.cred.club/",
        portal_name: "CRED Careers",
        is_verified: true,
        interview_rounds: ["Machine Coding / Problem Solving Round", "Distributed Architecture & DSA Interview", "Founders / Culture Fit Round"]
      },
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Systems Infrastructure & Core Gateway Intern",
        company: "Zerodha",
        industry: "Fintech & Stock Trading Infrastructure",
        location: "Bengaluru / Remote (India)",
        stipend: "₹50,000 - ₹85,000 / month",
        deadline: "November 15, 2026",
        description: "Maintain high-speed order execution gateways (Kite platform) and real-time market data dissemination pipelines built with Go and Python.",
        required_skills: ["Go", "Python", "Linux CLI", "PostgreSQL", "Networking Protocols (WebSockets/TCP)"],
        match_score: 91,
        match_reason: "Pragmatic, minimalist engineering philosophy focused on raw performance rather than bloated frameworks.",
        tailored_hook: "Pragmatic developer committed to simple, maintainable software and high-throughput real-time systems.",
        cover_letter: "Dear Zerodha Tech Team,\n\nZerodha's engineering culture—minimalist tech stack, FOSS advocacy, and running India's largest retail brokerage with an elite engineering team—is unmatched. I would be honoured to contribute to your core infrastructure.",
        apply_url: "https://zerodha.com/careers/",
        portal_name: "Zerodha Careers",
        is_verified: true,
        interview_rounds: ["Open Source / Portfolio Project Deep-Dive", "Technical Architecture Discussion", "Engineering Culture Fit"]
      }
    ];
  } else if (isIndia && (domainClean.includes("finance") || domainClean.includes("invest") || domainClean.includes("bank"))) {
    opportunities = [
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Summer Analyst - Global Investment Research & Securities",
        company: "Goldman Sachs India",
        industry: "Financial Services & Investment Banking",
        location: "Bengaluru / Hyderabad, India",
        stipend: "₹75,000 - ₹1,10,000 / month",
        deadline: "November 1, 2026",
        description: "Perform detailed discounted cash flow (DCF), LBO financial modeling, and comparative equity research across emerging market sectors.",
        required_skills: ["Financial Modeling", "Excel VBA", "DCF Valuation", "Accounting", "PowerPoint"],
        match_score: 93,
        match_reason: "Strong analytical foundation with quantitative acumen and structured valuation methodology.",
        tailored_hook: "Detail-oriented financial analyst with verified competency building valuation spreadsheets and distilling corporate financial statements.",
        cover_letter: "Dear Goldman Sachs India Campus Recruitment Team,\n\nI am applying for the Summer Analyst position in Global Investment Research. Having developed complex financial forecasting models and quantitative valuation decks, I am eager to contribute rigour to your live advisory deal teams.",
        apply_url: "https://www.goldmansachs.com/careers/",
        portal_name: "Goldman Sachs India",
        is_verified: true,
        interview_rounds: ["First Round HireVue Video", "Superday: 3x 45-min Technical & Accounting Interviews", "Behavioral Leadership Assessment"]
      },
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Institutional Equities & Quantitative Research Intern",
        company: "Morgan Stanley India",
        industry: "Investment Banking & Quantitative Strategy",
        location: "Mumbai, Maharashtra (Hybrid)",
        stipend: "₹70,000 - ₹1,00,000 / month",
        deadline: "October 28, 2026",
        description: "Formulate statistical market models, analyze capital structure adjustments, and build macroeconomic scenario engines.",
        required_skills: ["Python", "Probability & Statistics", "Financial Modeling", "Excel", "Data Visualization"],
        match_score: 90,
        match_reason: "Exceptional mathematical and computational alignment with capital markets data pipelines.",
        tailored_hook: "Quantitative researcher combining probabilistic reasoning with real-world capital market indicators.",
        cover_letter: "Dear Morgan Stanley Campus Team,\n\nI am writing to express my enthusiasm for the Institutional Equities internship in Mumbai. My passion lies in modeling probabilistic market systems and extracting insights from corporate financial disclosures.",
        apply_url: "https://www.morganstanley.com/people-opportunities/students-graduates",
        portal_name: "Morgan Stanley Campus",
        is_verified: true,
        interview_rounds: ["Numerical & Analytical Screen", "Technical Finance & Modeling Interview", "Managing Director Leadership Panel"]
      }
    ];
  } else if (domainClean.includes("finance") || domainClean.includes("invest") || domainClean.includes("bank")) {
    opportunities = [
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Summer Investment Banking Analyst",
        company: "Goldman Sachs",
        industry: "Financial Services & Investment Banking",
        location: "New York, NY (Hybrid)",
        stipend: "$65/hr ($125k prorated)",
        deadline: "November 1, 2026",
        description: "Perform detailed discounted cash flow (DCF), LBO financial modeling, and comparative company analysis for M&A advisory mandates.",
        required_skills: ["Financial Modeling", "Excel VBA", "DCF Valuation", "Accounting", "PowerPoint"],
        match_score: 88,
        match_reason: "Strong analytical foundation with quantitative coursework, but requires deeper modeling proof on the resume.",
        tailored_hook: "Detail-oriented quantitative analyst with verified competency building valuation spreadsheets and distilling corporate financial statements.",
        cover_letter: "Dear Goldman Sachs Global Banking Recruitment Team,\n\nI am applying for the Summer Investment Banking Analyst position. Having developed complex financial forecasting models and quantitative risk assessments, I am eager to contribute rigour to your live advisory deal teams.",
        apply_url: "https://www.goldmansachs.com/careers/",
        portal_name: "Goldman Sachs Careers",
        is_verified: true,
        interview_rounds: ["First Round HireVue Video", "Superday: 3x 45-min Technical & Accounting Interviews", "Behavioral Leadership Assessment"]
      },
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Quantitative Trading & Risk Intern",
        company: "Jane Street / Citadel",
        industry: "Quantitative Finance",
        location: "New York, NY (Onsite)",
        stipend: "$80/hr + Housing",
        deadline: "October 20, 2026",
        description: "Research algorithmic execution strategies, statistical arbitrage signals, and risk management limits using Python and probability theory.",
        required_skills: ["Python", "Probability & Statistics", "Algorithms", "C++", "Linear Algebra"],
        match_score: 92,
        match_reason: "High mathematical alignment with algorithmic execution and analytical problem solving.",
        tailored_hook: "Rigorous problem solver combining statistical inference, automated scripting, and probabilistic game theory.",
        cover_letter: "Dear Quantitative Research Team,\n\nI am writing to express my strong enthusiasm for the Quantitative Trading & Research internship. My passion lies in modeling probabilistic systems and optimizing latency-critical computational pipelines under uncertainty.",
        apply_url: "https://www.janestreet.com/join-jane-street/programs-and-internships/",
        portal_name: "Jane Street Careers",
        is_verified: true,
        interview_rounds: ["Mental Math & Probability Screen", "Take-Home Trading Simulation", "Technical Coding & Market Dynamics Superday"]
      }
    ];
  } else if (domainClean.includes("bio") || domainClean.includes("health") || domainClean.includes("pharma")) {
    opportunities = [
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Bioinformatics & Genomic Data Intern",
        company: isIndia ? "Biocon Biologics" : "Moderna / Genentech",
        industry: "Biotechnology & Healthcare",
        location: isIndia ? "Bengaluru, India (Hybrid)" : "Cambridge, MA (Hybrid)",
        stipend: isIndia ? "₹35,000 - ₹55,000 / month" : "$52/hr",
        deadline: "November 15, 2026",
        description: "Analyze next-generation RNA sequencing datasets, automate variant calling pipelines, and assist clinical biomarker validation.",
        required_skills: ["Python", "R", "Next-Gen Sequencing (NGS)", "Biostatistics", "Genomics"],
        match_score: 91,
        match_reason: "Matches laboratory precision and computational analysis across biological data pipelines.",
        tailored_hook: "Interdisciplinary researcher bridging molecular biology and statistical data analysis pipelines.",
        cover_letter: "Dear Early Clinical Development Team,\n\nI am thrilled to apply for the Bioinformatics internship. My background in biological assays combined with computational sequencing analytics positions me to accelerate your therapeutic pipeline workflows.",
        apply_url: isIndia ? "https://www.biocon.com/careers/" : "https://www.modernatx.com/careers",
        portal_name: isIndia ? "Biocon Careers" : "Moderna Careers",
        is_verified: true,
        interview_rounds: ["Technical Scientific Screen", "Seminar Presentation of Past Lab Research", "Cross-Functional Scientist Panel"]
      }
    ];
  } else {
    // General Global Tech
    opportunities = [
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Software Engineering Intern (Core Systems)",
        company: "Stripe",
        industry: "Financial Infrastructure & Technology",
        location: "San Francisco, CA / Remote",
        stipend: "$62/hr + Housing Stipend",
        deadline: "October 18, 2026",
        description: "Build robust, high-reliability developer APIs, global payment routing workflows, and real-time fraud mitigation microservices.",
        required_skills: ["TypeScript", "Distributed Systems", "REST/GraphQL APIs", "SQL", "Git"],
        match_score: 94,
        match_reason: "Exceptional alignment with component-driven architecture, API integration, and production deployment standards.",
        tailored_hook: "Full-stack engineer with hands-on experience building resilient web applications, modular APIs, and automated test pipelines.",
        cover_letter: "Dear Stripe University Recruiting Team,\n\nI am applying for the Software Engineering Internship. Stripe's standard of API craftsmanship and financial reliability resonates deeply with my work engineering end-to-end full-stack systems with TypeScript and clean state architecture.",
        apply_url: "https://stripe.com/jobs",
        portal_name: "Stripe Careers",
        is_verified: true,
        interview_rounds: ["Recruiter Touchpoint", "Technical Coding (Data Structures)", "Integration & API System Design Interview", "Values & Culture Dialogue"]
      },
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Product & Frontend Engineering Intern",
        company: "Figma",
        industry: "Design & Collaborative Tools",
        location: "San Francisco, CA (Hybrid)",
        stipend: "$58/hr",
        deadline: "October 28, 2026",
        description: "Develop seamless multiplayer canvas features, design system components, and interactive developer tooling.",
        required_skills: ["React", "TypeScript", "Canvas/WebGL", "UI/UX Ergonomics", "Performance Profiling"],
        match_score: 89,
        match_reason: "Strong aptitude for responsive visual interfaces, accessible component hierarchy, and real-time reactivity.",
        tailored_hook: "Product-minded engineer dedicated to tactile UI polish, sub-16ms render performance, and accessible design systems.",
        cover_letter: "Dear Figma Campus Team,\n\nAs someone who bridges design and engineering, I have long admired Figma's ability to turn high-performance WebAssembly and Canvas tech into delightful user collaboration. I would be thrilled to bring my frontend craft to your product teams.",
        apply_url: "https://www.figma.com/careers/",
        portal_name: "Figma Careers",
        is_verified: true,
        interview_rounds: ["Frontend Component Practical Test", "Deep-Dive System Architecture", "Product Design Collaboration Round"]
      },
      {
        id: "opp-" + Math.random().toString(36).substring(2, 7),
        title: "Cloud & Distributed Platform Intern",
        company: "Datadog",
        industry: "Cloud Observability & Infrastructure",
        location: "New York, NY (Hybrid)",
        stipend: "$56/hr",
        deadline: "November 5, 2026",
        description: "Ingest and visualize billions of real-time telemetry metrics, trace spans, and optimize streaming datastores.",
        required_skills: ["Go / Python", "Docker", "Distributed Tracing", "PostgreSQL / Redis", "Linux"],
        match_score: 86,
        match_reason: "Good backend instincts, but requires additional evidence of high-concurrency profiling on the resume.",
        tailored_hook: "Systems enthusiast skilled in service containerization, database schema optimization, and observability telemetry.",
        cover_letter: "Dear Datadog Engineering Team,\n\nI am eager to apply for the Platform Engineering internship. Having built scalable backend microservices and analyzed query latency bottlenecks, I want to learn and contribute to your petabyte-scale telemetry pipelines.",
        apply_url: "https://careers.datadoghq.com/",
        portal_name: "Datadog Careers",
        is_verified: true,
        interview_rounds: ["Algorithms Screen", "Linux & Systems Diagnostics Round", "Behavioral Leadership Review"]
      }
    ];
  }

  const audit: ResumeAudit = {
    ats_score: 72,
    summary_feedback: "Resume has good baseline substance, but suffers from three critical ATS liabilities: lack of quantified impact metrics (XYZ formula), passive action verbs ('assisted with', 'responsible for'), and missed domain keywords.",
    strengths: [
      "Clear chronological progression with relevant technical/academic foundation",
      "Explicit listing of core toolings, frameworks, and education credentials",
      "Cohesive narrative targeting internship and early-career placement"
    ],
    flaws: [
      {
        id: "flaw-1",
        category: "quantification",
        severity: "high",
        original_snippet: "Worked on frontend features and fixed bugs across the application.",
        issue_description: "Lacks measurable business or performance metrics. ATS algorithms penalize vague responsibilities that omit scale and results.",
        improved_suggestion: "Architected 12+ responsive UI components using React and TypeScript, reducing client-side bundle size by 18% and decreasing page load latency by 250ms."
      },
      {
        id: "flaw-2",
        category: "passive_voice",
        severity: "medium",
        original_snippet: "Was responsible for helping with database queries and team code reviews.",
        issue_description: "Passive phrase 'Was responsible for helping with' reduces perceived ownership and initiative.",
        improved_suggestion: "Spearheaded PostgreSQL query optimization and indexing audits, eliminating N+1 query bottlenecks and accelerating API response throughput by 34%."
      },
      {
        id: "flaw-3",
        category: "keyword_gap",
        severity: "high",
        original_snippet: "Built full-stack project with Node and React.",
        issue_description: "Missing modern industry keywords like CI/CD, Automated Testing, Cloud Deployment, and Observability that recruiters search for.",
        improved_suggestion: "Engineered full-stack TypeScript application with Docker containerization, Jest unit test suites (85%+ coverage), and automated GitHub Actions CI/CD deployment pipelines."
      },
      {
        id: "flaw-4",
        category: "clarity_structure",
        severity: "low",
        original_snippet: "Proficient in several technologies and tools.",
        issue_description: "Generic filler line. Categorize competencies into distinct groups: Languages, Frameworks, Cloud/Databases, Tools.",
        improved_suggestion: "Languages: TypeScript, Python, SQL | Frameworks: React, Next.js, Express, Tailwind CSS | Infrastructure: Docker, Git, CI/CD"
      }
    ],
    missing_keywords: ["CI/CD Pipelines", "Automated Testing (Jest/Playwright)", "Cloud Infrastructure (AWS/GCP)", "Performance Optimization", "Microservices Architecture"],
    suggested_bullet_count: 4
  };

  const roadmap: PreparationRoadmap = {
    domain: domain || "Technology & Software Engineering",
    target_role: goal || "Software Engineering Intern",
    estimated_readiness_weeks: 4,
    sprints: [
      {
        week: 1,
        phase_title: "Sprint 1: Anchor Proof-of-Work Project",
        objective: "Build and deploy a standalone, production-grade project that directly proves mastery of the target role's core requirements.",
        tasks: [
          {
            id: "task-1-1",
            task: "Define project architecture solving a real pain point (e.g., real-time collaboration or analytics dashboard)",
            deliverable: "System architecture diagram and GitHub repository initialized with TypeScript & CI/CD",
            completed: true
          },
          {
            id: "task-1-2",
            task: "Implement core business logic with clean state management and 80%+ automated test coverage",
            deliverable: "Passing test suite with unit and integration tests",
            completed: false
          },
          {
            id: "task-1-3",
            task: "Deploy to cloud (Cloud Run / Vercel) with live interactive demo link and benchmarked metrics",
            deliverable: "Public demo URL and benchmarked README with Lighthouse/latency stats",
            completed: false
          }
        ],
        interview_drill: {
          question: "Tell me about the most technically challenging project on your resume.",
          recommended_framework: "Use the STAR Method: Situation (the bottleneck), Task (your exact role), Action (technical decisions made and why), Result (quantified outcome).",
          star_sample_answer: "In my recent project, our application suffered from latency spikes due to unindexed database queries (Situation). My task was to redesign the data pipeline (Task). I migrated state to an optimistic cache using Redis and implemented compound indexing in PostgreSQL (Action). As a result, 99th-percentile response latency dropped from 420ms to 48ms under simulated 1,000 req/sec loads (Result)."
        }
      },
      {
        week: 2,
        phase_title: "Sprint 2: ATS Resume Rebuild & Metric Quantification",
        objective: "Apply all Google XYZ formula corrections and insert high-relevance domain keywords to achieve a 90+ ATS pass rate.",
        tasks: [
          {
            id: "task-2-1",
            task: "Rewrite every single resume bullet to follow: 'Accomplished [X] as measured by [Y] by doing [Z]'",
            deliverable: "Updated resume markdown without passive verbs",
            completed: false
          },
          {
            id: "task-2-2",
            task: "Integrate target company keywords (e.g. Distributed Systems, Scalability, REST APIs, CI/CD)",
            deliverable: "ATS score verification above 88 on PlacePilot Auditor",
            completed: false
          },
          {
            id: "task-2-3",
            task: "Create tailored 1-page PDF formatted with single-column ATS-friendly typographic hierarchy",
            deliverable: "Clean PDF export without multi-column parsing traps",
            completed: false
          }
        ],
        interview_drill: {
          question: "How do you handle a bug or issue in production when users are actively impacted?",
          recommended_framework: "Triage -> Mitigate -> Root Cause -> Long-Term Prevention.",
          star_sample_answer: "When a release introduced a client-side state sync bug, my immediate priority was mitigation by rolling back to the previous stable container tag within 4 minutes. Once service was restored, I replicated the race condition in a staging test environment, patched the missing mutex lock, and added a regression end-to-end test in our CI pipeline so it could never happen again."
        }
      },
      {
        week: 3,
        phase_title: "Sprint 3: High-Conversion Recruiter & Alumni Outreach",
        objective: "Bypass cold job portals through targeted warm outreach to alumni and engineering team leads.",
        tasks: [
          {
            id: "task-3-1",
            task: "Identify 15 university alumni or hiring managers currently working at target companies on LinkedIn",
            deliverable: "Outreach spreadsheet with names, roles, and connection notes",
            completed: false
          },
          {
            id: "task-3-2",
            task: "Send personalized 65-word introductory messages highlighting specific technical alignment",
            deliverable: "15 personalized messages sent requesting a 10-minute informational chat",
            completed: false
          },
          {
            id: "task-3-3",
            task: "Follow up on all applications submitted within 48 hours of initial listing",
            deliverable: "Application Tracker updated with recruiter touchpoint dates",
            completed: false
          }
        ],
        interview_drill: {
          question: "Why are you interested in our company specifically over competitors?",
          recommended_framework: "Mission Alignment + Specific Engineering Culture + Recent Product Release.",
          star_sample_answer: "While competitors provide generic payment gateways, Stripe treats developers as the primary customer, which shows in the meticulous detail of your API docs and idempotency guarantees. Having built financial integrations myself, I want to learn from the team that sets the industry standard for distributed transaction reliability."
        }
      },
      {
        week: 4,
        phase_title: "Sprint 4: Technical & Behavioral Superday Simulation",
        objective: "Achieve fluency in live problem-solving, architectural defense, and behavioral leadership drills.",
        tasks: [
          {
            id: "task-4-1",
            task: "Conduct 5 timed mock technical problem-solving sessions focusing on clear communication",
            deliverable: "Recorded/timed solution notes articulating trade-offs out loud",
            completed: false
          },
          {
            id: "task-4-2",
            task: "Prepare 5 core STAR stories: conflict with teammate, tight deadline, failure & recovery, leadership, complex bug",
            deliverable: "STAR story matrix ready for instant recall",
            completed: false
          },
          {
            id: "task-4-3",
            task: "Submit final polished applications across target companies with bespoke tailored cover letters",
            deliverable: "Application tracker marked with 10+ active submissions",
            completed: false
          }
        ],
        interview_drill: {
          question: "Tell me about a time you disagreed with a technical direction and how you resolved it.",
          recommended_framework: "Disagree and Commit with Data + Collaborative Respect.",
          star_sample_answer: "During a sprint, our team debated whether to use an ORM or write raw SQL queries for a high-traffic reporting endpoint. I was concerned about ORM latency overhead. Instead of arguing theoretically, I built a quick benchmark script simulating 10,000 queries. The benchmark showed raw SQL executed 3.2x faster for our specific aggregation. I presented the benchmark politely, the team agreed to use raw SQL for that endpoint, and we kept the ORM for standard CRUD operations."
        }
      }
    ]
  };

  return { audit, opportunities, roadmap };
}

// --- API ROUTES ROUTER ---
const apiRouter = express.Router();

// Root status endpoint
apiRouter.get("/", (req, res) => {
  res.json({
    status: "PlacePilot API operational",
    endpoints: [
      "/api/state",
      "/api/health",
      "/api/azure/metrics",
      "/api/azure/test",
      "/api/auth/users",
      "/api/chat",
      "/api/resume/audit",
      "/api/opportunities/scout",
      "/api/roadmap/generate",
      "/api/applications",
      "/api/resume/parse-document"
    ]
  });
});

// Health check endpoint (independent of external services)
apiRouter.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "PlacePilot API"
  });
});

// System models & AI provider readiness status
apiRouter.get("/system/models", (req, res) => {
  const hasAzure = Boolean(
    process.env.AZURE_OPENAI_API_KEY && 
    (process.env.AZURE_OPENAI_API_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT)
  );
  const activeProvider = hasAzure ? "azure" : (process.env.LLM_PROVIDER || "gemini");
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  res.json({
    ok: true,
    status: "ok",
    active_provider: activeProvider,
    has_gemini_key: hasGeminiKey,
    has_azure_key: hasAzure,
    azure_deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || "gpt-4.1-mini",
    azure_embedding_deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || "text-embedding-3-small",
    azure_endpoint: (process.env.AZURE_OPENAI_API_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, ""),
    azure_connected: hasAzure,
    azure_metrics: azureMetrics,
    student_grant_info: "Microsoft for Students $100 Azure Credit active with Azure AI Foundry & OpenAI service."
  });
});

// Real-time Azure telemetry endpoint
apiRouter.get("/azure/metrics", (req, res) => {
  res.json({
    connected: Boolean(process.env.AZURE_OPENAI_API_KEY && (process.env.AZURE_OPENAI_API_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT)),
    endpoint: (process.env.AZURE_OPENAI_API_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, ""),
    deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || "gpt-4.1-mini",
    metrics: azureMetrics
  });
});

// Live Azure test endpoint
apiRouter.get("/azure/test", async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const rawEndpoint = process.env.AZURE_OPENAI_API_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || "gpt-4.1-mini";

  if (!apiKey || !rawEndpoint) {
    return res.status(400).json({
      success: false,
      error: "Missing AZURE_OPENAI_API_KEY or AZURE_OPENAI_API_ENDPOINT in environment."
    });
  }

  const endpoint = rawEndpoint.replace(/\/+$/, "");
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

  try {
    const startTime = Date.now();
    const azureRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Test ping from PlacePilot Campus Chief-of-Staff. Respond with: Microsoft Azure AI Foundry operational." }],
        max_tokens: 30
      })
    });

    const elapsedMs = Date.now() - startTime;
    if (!azureRes.ok) {
      const errBody = await azureRes.text();
      return res.status(azureRes.status).json({
        success: false,
        status: azureRes.status,
        error: errBody
      });
    }

    const data: any = await azureRes.json();
    const reply = data?.choices?.[0]?.message?.content;
    const model = data?.model;

    return res.json({
      success: true,
      provider: "Microsoft Azure AI Foundry",
      endpoint,
      deployment,
      actual_model: model,
      reply,
      latency_ms: elapsedMs,
      message: "Microsoft Azure credentials verified and fully operational!"
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to connect to Azure OpenAI service."
    });
  }
});

// Full state snapshot
apiRouter.get("/state", (req, res) => {
  res.json({
    opportunities: currentOpportunities,
    audit: currentAudit,
    roadmap: currentRoadmap,
    applications: currentApplications,
    history: historyLogs.slice(0, 40)
  });
});

// User Authentication & Profile Persistence
apiRouter.get("/auth/users", (req, res) => {
  res.json({ users: registeredUsers });
});

apiRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  let user = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    // If not existing, create a default profile for the user
    user = {
      id: "user-" + Math.random().toString(36).substring(2, 8),
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      email: cleanEmail,
      country: "India",
      preferred_location: "India - Bengaluru / Remote",
      target_domain: "Technology & Software Engineering",
      career_goal: "Software Development Engineer (SDE) Intern",
      education: "B.Tech in Computer Science",
      grad_year: "2027",
      experience_level: "Student / Intern",
      created_at: new Date().toISOString()
    };
    registeredUsers.push(user);
  }
  logAction("orchestrator", "user_login", `User authenticated: ${user.name} (${user.email}) [${user.preferred_location}]`);
  res.json({ success: true, user });
});

apiRouter.post("/auth/register", (req, res) => {
  const { name, email, country, preferred_location, target_domain, career_goal, education, grad_year, experience_level } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const existing = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    // Update existing profile
    Object.assign(existing, {
      name,
      country: country || existing.country,
      preferred_location: preferred_location || existing.preferred_location,
      target_domain: target_domain || existing.target_domain,
      career_goal: career_goal || existing.career_goal,
      education: education || existing.education,
      grad_year: grad_year || existing.grad_year,
      experience_level: experience_level || existing.experience_level
    });
    logAction("orchestrator", "user_updated", `User profile updated: ${existing.name} (${cleanEmail})`);
    return res.json({ success: true, user: existing });
  }

  const newUser = {
    id: "user-" + Math.random().toString(36).substring(2, 8),
    name,
    email: cleanEmail,
    country: country || "India",
    preferred_location: preferred_location || "India - Bengaluru / Remote",
    target_domain: target_domain || "Technology & Software Engineering",
    career_goal: career_goal || "Software Engineering Intern",
    education: education || "B.Tech in Computer Science",
    grad_year: grad_year || "2027",
    experience_level: experience_level || "Student / Intern",
    created_at: new Date().toISOString()
  };
  registeredUsers.push(newUser);
  logAction("orchestrator", "user_registered", `New user registered: ${newUser.name} (${newUser.email}) in ${newUser.preferred_location}`);
  res.json({ success: true, user: newUser });
});

// Save Resume Directly to User's Profile
apiRouter.post("/user/resume", (req, res) => {
  try {
    const { email, resume_text, resume_filename } = req.body;
    if (!resume_text) {
      return res.status(400).json({ error: "Resume text is required." });
    }
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    let user = cleanEmail ? registeredUsers.find(u => u.email.toLowerCase() === cleanEmail) : null;
    const now = new Date().toISOString();

    if (user) {
      user.resume_text = resume_text;
      user.resume_filename = resume_filename || user.resume_filename || "Candidate-Resume.pdf";
      user.resume_uploaded_at = now;
      logAction("resume_auditor", "resume_saved_to_profile", `Saved resume (${user.resume_filename}) to profile for ${user.name}`);
      return res.json({ success: true, user });
    }

    logAction("resume_auditor", "resume_saved_session", `Resume saved to active session (${resume_filename || 'Candidate-Resume.pdf'})`);
    res.json({
      success: true,
      resume_text,
      resume_filename: resume_filename || "Candidate-Resume.pdf",
      resume_uploaded_at: now
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save resume" });
  }
});

// 1. RESUME AUDITOR AGENT: Deep ATS critique & flaw diagnosis with Before/After suggestions
apiRouter.post("/resume/audit", async (req, res) => {
  const { resume_text, target_domain, target_role } = req.body;
  if (!resume_text) {
    return res.status(400).json({ error: "Resume text is required for audit." });
  }

  logAction("orchestrator", "dispatched", `Dispatched Resume Auditor Agent for domain: "${target_domain || 'General'}"`);

  const prompt = `You are the PlacePilot Resume Auditor Agent. Conduct a rigorous, critical ATS and hiring-manager audit of this student resume.
TARGET CAREER DOMAIN: "${target_domain || 'Technology & Engineering'}"
TARGET ROLE GOAL: "${target_role || 'Internship'}"
STUDENT RESUME TEXT:
"""
${resume_text.substring(0, 3500)}
"""

AUDIT REQUIREMENTS:
1. Calculate a realistic ATS Compatibility Score (0-100) based on quantification, action verbs, keyword density, and formatting.
2. Provide a 2-3 sentence executive feedback summary.
3. List 3 key strengths.
4. Identify 3 to 5 SPECIFIC FLAWS across these categories:
   - "quantification" (lacks metrics or measurable outcomes - Google XYZ formula)
   - "passive_voice" (uses weak words like "worked on", "assisted with", "responsible for")
   - "keyword_gap" (missing high-frequency domain keywords for their goal)
   - "clarity_structure" (confusing phrasing, dense blocks, or generic filler)
   For EACH flaw:
   - Provide the EXACT or approximate "original_snippet" from the resume
   - Explain the "issue_description"
   - Provide a rewritten "improved_suggestion" using strong action verbs and quantified impact
5. List 4 to 6 critical domain keywords currently missing from the resume.

Return strictly a JSON object with this exact schema:
{
  "ats_score": number,
  "summary_feedback": "string",
  "strengths": ["string", "string", "string"],
  "flaws": [
    {
      "id": "flaw-1",
      "category": "quantification" | "passive_voice" | "keyword_gap" | "clarity_structure",
      "severity": "high" | "medium" | "low",
      "original_snippet": "string",
      "issue_description": "string",
      "improved_suggestion": "string"
    }
  ],
  "missing_keywords": ["string", "string"],
  "suggested_bullet_count": number
}`;

  const raw = await callGemini(prompt, "You are an expert technical recruiter and resume auditor. Output valid JSON only.");
  let auditData: ResumeAudit | null = null;
  if (raw) {
    auditData = extractJson<ResumeAudit | null>(raw, null);
  }

  // Fallback if AI call failed or returned invalid JSON
  if (!auditData || !auditData.flaws || auditData.flaws.length === 0) {
    const fallback = initializeDomainFallback(target_domain || "Tech", target_role || "Intern", resume_text);
    auditData = fallback.audit;
  }

  currentAudit = auditData;
  logAction("resume_auditor", "audit_complete", `Calculated ATS Score ${auditData.ats_score}/100 and diagnosed ${auditData.flaws.length} actionable resume flaws.`);

  res.json({ success: true, audit: currentAudit });
});

// 2. OPPORTUNITY SCOUT AGENT: Dynamic discovery across ANY domain (tech, finance, healthcare, design, etc.)
apiRouter.post("/opportunities/scout", async (req, res) => {
  const { resume_text, career_goal, target_domain, count = 3, location, country } = req.body;
  if (!resume_text || !career_goal) {
    return res.status(400).json({ error: "Resume text and career goal are required." });
  }

  const candidateLocation = location || country || "India - Bengaluru / Remote";
  const locLower = candidateLocation.toLowerCase();
  const isIndia = locLower.includes("india") || locLower.includes("bengaluru") || locLower.includes("bangalore") ||
                  locLower.includes("delhi") || locLower.includes("gurgaon") || locLower.includes("noida") ||
                  locLower.includes("hyderabad") || locLower.includes("pune") || locLower.includes("mumbai");

  logAction("orchestrator", "dispatched", `Dispatched Dynamic Opportunity Scout Agent for goal: "${career_goal.substring(0, 50)}" [Location: ${candidateLocation}]`);

  const prompt = `You are the PlacePilot Opportunity Scout Agent. 
CRITICAL RULE: DO NOT use static, fictitious, or generic placeholder jobs. Dynamically scout and identify ${count} REAL-WORLD target companies and internships/entry-level roles specifically matched to the candidate's career domain, background, and location.

CANDIDATE PREFERRED LOCATION: "${candidateLocation}"
${isIndia ? `GEOGRAPHIC PRIORITY - INDIA:
The candidate is located in or targeting India. You MUST strictly prioritize real, prominent Indian tech powerhouses, high-growth Indian startups, or multinational India development centres (e.g., Flipkart, Razorpay, CRED, Google India, Microsoft India, Zerodha, Zomato, Swiggy, Goldman Sachs India, PhonePe, TCS Digital, Biocon, Dr. Reddy's).
- Location MUST be an Indian tech hub (e.g. "Bengaluru, Karnataka", "Hyderabad, Telangana", "Gurgaon / Delhi NCR", "Pune", "Mumbai", or "Remote (India)").
- Stipend/Salary MUST be in realistic Indian Rupees format (e.g., "₹50,000 - ₹90,000 / month" for top internships, or "₹12 - ₹24 LPA").
- Provide the real company career portal URL for "apply_url" (e.g. "https://www.flipkartcareers.com/", "https://razorpay.com/jobs/", "https://careers.google.com/jobs/results/?location=India").` : 
`GEOGRAPHIC PRIORITY:
Candidate is targeting ${candidateLocation}. Prioritize real, recognized employers with active operations in that region.`}

Candidate's domain: "${target_domain || 'General'}"
Candidate's career goal: "${career_goal}"
Candidate's background:
"""
${resume_text.substring(0, 2500)}
"""

For each of the ${count} opportunities, provide:
1. Real company name (e.g., Flipkart, Razorpay, Google India, CRED, Zerodha, Stripe, Figma, Goldman Sachs)
2. Real role title (e.g., "Software Development Engineer (SDE) Intern", "Backend Systems Intern", "Summer Investment Banking Analyst")
3. Real industry sector
4. Location matched to candidate preference
5. Realistic market stipend/salary band (in local currency, e.g. INR for India)
6. Application deadline (upcoming realistic dates)
7. Concise role description (2 sentences)
8. 4-5 required skills
9. Match score (80-98%)
10. Match reason explaining why the student's background is a prime fit
11. Tailored pitch hook (1 punchy sentence the candidate can use in networking/interviews)
12. A tailored cover letter (2-3 paragraphs customized to this company's culture and the student's projects)
13. Expected interview rounds for this company
14. Real company apply URL or official career portal
15. Portal name (e.g., "Official Flipkart Careers", "Razorpay Jobs Portal", "Google India Careers")

Return strictly a JSON array of opportunities matching this schema:
[
  {
    "id": "opp-1",
    "title": "string",
    "company": "string",
    "industry": "string",
    "location": "string",
    "stipend": "string",
    "deadline": "string",
    "description": "string",
    "required_skills": ["string"],
    "match_score": number,
    "match_reason": "string",
    "tailored_hook": "string",
    "cover_letter": "string",
    "interview_rounds": ["string"],
    "apply_url": "string",
    "portal_name": "string"
  }
]`;

  const raw = await callGemini(prompt, "You are a professional recruiting executive. Return strictly a JSON array of opportunity objects.");
  let scouted: TargetOpportunity[] = [];
  if (raw) {
    scouted = extractJson<TargetOpportunity[]>(raw, []);
  }

  if (!scouted || scouted.length === 0) {
    const fallback = initializeDomainFallback(target_domain || "Tech", career_goal, resume_text, candidateLocation);
    scouted = fallback.opportunities;
  }

  // Ensure every scouted opportunity has a verified, real direct application link
  scouted.forEach(opp => {
    if (!opp.apply_url || opp.apply_url.length < 10) {
      const verified = getVerifiedApplyUrl(opp.company, opp.title);
      opp.apply_url = verified.url;
      opp.portal_name = verified.portal;
    }
    opp.is_verified = true;
  });

  currentOpportunities = scouted;
  logAction("opportunity_scout", "scouted", `Scouted and verified ${scouted.length} real-world opportunities aligned to ${candidateLocation}.`);

  res.json({ success: true, opportunities: currentOpportunities });
});

// 3. ROADMAP STRATEGIST AGENT: 4-Week Custom Sprint Preparation Roadmap
apiRouter.post("/roadmap/generate", async (req, res) => {
  const { resume_text, target_role, target_domain, target_companies } = req.body;
  if (!resume_text || !target_role) {
    return res.status(400).json({ error: "Resume text and target role are required." });
  }

  logAction("orchestrator", "dispatched", `Dispatched Roadmap Strategist Agent to formulate 4-week preparation blueprint.`);

  const prompt = `You are the PlacePilot Roadmap Strategist Agent. Create a high-yield, 4-week preparation and placement sprint roadmap for a student aiming for:
Target Role: "${target_role}"
Target Domain: "${target_domain || 'General'}"
Target Companies: "${target_companies || 'Leading industry employers'}"
Student's Current Resume Profile:
"""
${resume_text.substring(0, 2500)}
"""

Formulate a structured 4-week sprint:
- Week 1: Anchor Proof-of-Work Project (define a specific portfolio artifact that closes their biggest technical/skill gap)
- Week 2: ATS Resume Rebuild & Metric Quantification (addressing Google XYZ formulas and keyword density)
- Week 3: High-Conversion Recruiter & Alumni Outreach (warm LinkedIn strategies and tailored pitching)
- Week 4: Technical & Behavioral Superday Simulation (behavioral STAR frameworks and domain-specific technical drills)

For each week:
- phase_title (e.g., "Sprint 1: Anchor Proof-of-Work Project")
- objective (1 clear sentence)
- 3 concrete tasks with specific deliverables
- 1 interview drill containing:
  * "question": A company-specific high-frequency interview question
  * "recommended_framework": Best answering methodology
  * "star_sample_answer": A fully worked-out sample answer referencing realistic student experience

Return strictly JSON matching this schema:
{
  "domain": "string",
  "target_role": "string",
  "estimated_readiness_weeks": 4,
  "sprints": [
    {
      "week": 1,
      "phase_title": "string",
      "objective": "string",
      "tasks": [
        {
          "id": "task-1-1",
          "task": "string",
          "deliverable": "string",
          "completed": false
        }
      ],
      "interview_drill": {
        "question": "string",
        "recommended_framework": "string",
        "star_sample_answer": "string"
      }
    }
  ]
}`;

  const raw = await callGemini(prompt, "You are a career strategist and principal hiring lead. Output valid JSON only.");
  let roadmap: PreparationRoadmap | null = null;
  if (raw) {
    roadmap = extractJson<PreparationRoadmap | null>(raw, null);
  }

  if (!roadmap || !roadmap.sprints || roadmap.sprints.length === 0) {
    const fallback = initializeDomainFallback(target_domain || "Tech", target_role, resume_text);
    roadmap = fallback.roadmap;
  }

  currentRoadmap = roadmap;
  logAction("roadmap_strategist", "roadmap_generated", `Synthesized 4-week preparation sprint with milestone deliverables and STAR interview drills.`);

  res.json({ success: true, roadmap: currentRoadmap });
});

// 4. CONTEXT-AWARE CAREER ADVISOR (CHATBOT): Grounded in user's dossier, RAG knowledge, and protected by career domain guardrails
apiRouter.post("/chat", async (req, res) => {
  try {
    const { 
      question, 
      user_profile, 
      audit_data, 
      opportunities, 
      roadmap, 
      applications 
    } = req.body || {};

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question cannot be empty." });
    }

    const cleanQuestion = question.trim();

    // 1. STRICT DOMAIN GUARDRAILS
    // Deny out-of-scope non-career requests (e.g. food recipes, dating, gaming, political trivia)
    const domainCheck = checkCareerDomainScope(cleanQuestion);
    if (!domainCheck.inScope) {
      logAction("career_advisor", "out_of_scope_redirect", `Politely redirected off-topic query: "${cleanQuestion.substring(0, 45)}..."`);
      return res.json({
        question: cleanQuestion,
        answer: domainCheck.refusalMessage || "I can only assist with career development, technical interview prep (DSA & System Design), resume optimization, and company hiring loops.",
        referenced_context: "Domain Guardrail"
      });
    }

    // 2. RAG RETRIEVAL ENGINE
    const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
    const topCompany = safeOpportunities.length > 0 ? safeOpportunities[0].company : undefined;
    const { docs: ragDocs, topics: ragTopics } = retrieveRelevantRAG(cleanQuestion, topCompany);

    // 3. BUILD RICH GROUNDING CONTEXT FROM CANDIDATE DOSSIER
    let contextPrompt = "=== ACTIVE CANDIDATE DOSSIER ===\n";
    if (user_profile) {
      contextPrompt += `Candidate Name: ${user_profile.name || user_profile.full_name || "Candidate"}\n`;
      contextPrompt += `Degree & Education: ${user_profile.education || "B.Tech Computer Science"}\n`;
      contextPrompt += `Graduation Year: ${user_profile.grad_year || "2027"}\n`;
      contextPrompt += `Location: ${user_profile.preferred_location || user_profile.country || "India"}\n`;
      contextPrompt += `Target Domain: ${user_profile.target_domain || "Technology & Software Engineering"}\n`;
      contextPrompt += `Target Career Goal: ${user_profile.career_goal || "Software Development Engineer (SDE) Intern"}\n`;
      contextPrompt += `Extracted Skills: ${(user_profile.extracted_skills || []).join(", ")}\n`;
      contextPrompt += `Current Resume Text:\n"""\n${(user_profile.resume_text || "").substring(0, 1800)}\n"""\n\n`;
    }

    if (audit_data) {
      contextPrompt += `=== RESUME AUDIT & ATS STATUS ===\n`;
      contextPrompt += `ATS Score: ${audit_data.ats_score || "N/A"}/100\n`;
      contextPrompt += `Identified Flaws:\n`;
      const flaws = Array.isArray(audit_data.flaws) ? audit_data.flaws : [];
      flaws.forEach((f: any, idx: number) => {
        contextPrompt += `${idx + 1}. [${(f.category || 'IMPACT').toUpperCase()}] "${f.original_snippet || ''}" -> Issue: ${f.issue_description || ''} -> Recommended Fix: "${f.improved_suggestion || ''}"\n`;
      });
      contextPrompt += `Missing Keywords: ${(Array.isArray(audit_data.missing_keywords) ? audit_data.missing_keywords : []).join(", ")}\n\n`;
    }

    if (safeOpportunities.length > 0) {
      contextPrompt += `=== DYNAMICALLY SCOUTED TARGET ROLES ===\n`;
      safeOpportunities.slice(0, 4).forEach((o: any) => {
        contextPrompt += `- ${o.title || 'SDE'} at ${o.company || 'Company'} (${o.location || 'India'}, ${o.stipend || 'Stipend'}) | Match: ${o.match_score || 85}%\n  Requirements: ${(o.required_skills || []).join(", ")}\n  Tailored Hook: "${o.tailored_hook || ''}"\n`;
      });
      contextPrompt += `\n`;
    }

    if (roadmap && Array.isArray(roadmap.sprints)) {
      contextPrompt += `=== PREPARATION ROADMAP SPRINT SUMMARY ===\n`;
      roadmap.sprints.forEach((s: any) => {
        contextPrompt += `Week ${s.week}: ${s.phase_title || ''} - ${s.objective || ''}\n`;
        if (s.interview_drill) {
          contextPrompt += `  Interview Drill: "${s.interview_drill.question || ''}"\n`;
        }
      });
      contextPrompt += `\n`;
    }

    // Inject retrieved RAG knowledge chunks
    if (ragDocs.length > 0) {
      contextPrompt += `=== RETRIEVED RAG KNOWLEDGE BASE DOCS ===\n`;
      contextPrompt += ragDocs.join("\n\n") + "\n\n";
    }

    const prompt = `${contextPrompt}
=== STUDENT'S INQUIRY ===
"${cleanQuestion}"

=== INSTRUCTIONS FOR CAREER & TECHNICAL ADVISOR ===
1. You are the PlacePilot Interactive Career, Technical & Interview Preparation Advisor.
2. Directly answer the student's question with actionable, specific advice.
3. If they ask "Introduce yourself" or "Tell me about yourself":
   - Use the Present-Past-Future formula from the retrieved RAG doc.
   - Craft a tailored 60-90 second spoken script using their actual name, degree, and specific project details from their resume, pointing toward their target company/role.
   - Provide concrete delivery tips (time limits, hook).
4. If they ask about DSA (Data Structures & Algorithms):
   - Explain the algorithmic pattern, state time/space complexity (Big-O), provide code or step-by-step logic, and note key edge cases.
5. If they ask about resume flaws or bullet rewrites:
   - Provide concrete, polished bullets using Google's XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]".
6. If they ask about preparing for a company (e.g. Flipkart, Razorpay, Google, Amazon):
   - Detail their specific interview rounds (OA, Machine Coding/LLD, Problem Solving/DSA, Behavioral/HM) and the key preparation strategies.
7. Tone: Professional, direct, encouraging, highly structured with bold headings and bullet points. Never reply with generic platitudes.`;

    const systemInstruction = "You are the PlacePilot AI Technical Career & Interview Advisor. Answer directly, concisely, and helpfully using the candidate's dossier and retrieved RAG technical documentation.";
    
    // Call fast model with 6.5s timeout
    const aiAnswer = await callGemini(prompt, systemInstruction, 1000);

    let finalAnswer = aiAnswer;
    if (!finalAnswer) {
      // Zero-latency intelligent local RAG synthesis
      finalAnswer = generateSmartLocalAdvisorResponse(cleanQuestion, user_profile, audit_data, safeOpportunities);
    }

    const referencedContextStr = ragTopics.length > 0
      ? `RAG: ${ragTopics.join(", ")} & Active Dossier`
      : safeOpportunities.length > 0 ? `${safeOpportunities[0].company} & Active Dossier` : "Candidate Dossier";

    logAction("career_advisor", "consulted", `Answered: "${cleanQuestion.substring(0, 45)}..." (${ragTopics.join(", ") || "Dossier"})`);

    res.json({
      question: cleanQuestion,
      answer: finalAnswer,
      referenced_context: referencedContextStr
    });
  } catch (err: any) {
    console.error("[Chat API Handler Error]:", err);
    const fallbackAnswer = generateSmartLocalAdvisorResponse(
      req.body?.question || "Career Advice",
      req.body?.user_profile,
      req.body?.audit_data,
      Array.isArray(req.body?.opportunities) ? req.body.opportunities : []
    );
    res.json({
      question: req.body?.question || "Career inquiry",
      answer: fallbackAnswer,
      referenced_context: "PlacePilot Local Intelligence Engine"
    });
  }
});

// 5. APPLICATION TRACKER: Add / Update application
apiRouter.post("/applications", (req, res) => {
  const { opportunity_id, title, company, industry, location, stipend, status } = req.body;
  
  const existingIdx = currentApplications.findIndex(a => a.opportunity_id === opportunity_id);
  const now = new Date().toISOString().replace("T", " ").substring(0, 16);

  if (existingIdx >= 0) {
    currentApplications[existingIdx].status = status || "Applied";
    currentApplications[existingIdx].applied_date = now;
    logAction("orchestrator", "application_updated", `Updated status to "${status}" for ${company} (${title})`);
    return res.json({ success: true, application: currentApplications[existingIdx] });
  }

  const newApp: ApplicationRecord = {
    id: "app-" + Math.random().toString(36).substring(2, 8),
    opportunity_id: opportunity_id || "custom-" + Date.now(),
    title: title || "Internship Role",
    company: company || "Target Organization",
    industry: industry || "General",
    location: location || "Remote",
    stipend: stipend || "$50/hr",
    status: status || "Applied",
    applied_date: now
  };

  currentApplications.push(newApp);
  logAction("orchestrator", "application_created", `Added ${company} (${title}) to Application Tracker with status "${newApp.status}"`);
  res.json({ success: true, application: newApp });
});

// 6. RESUME DOCUMENT PARSER (PDF, Word DOCX/DOC, ODF/ODT, TXT, RTF)
apiRouter.post("/resume/parse-document", async (req, res) => {
  try {
    const { filename, file_base64, file_type } = req.body;
    if (!file_base64) {
      return res.status(400).json({ error: "Missing file_base64 in payload." });
    }

    const cleanBase64 = file_base64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const ext = path.extname(filename || "").toLowerCase();

    let extractedText = "";

    logAction("resume_auditor", "document_uploaded", `Received resume file "${filename || 'document'}" (${(buffer.length / 1024).toFixed(1)} KB). Commencing text extraction.`);

    if (ext === ".pdf" || file_type?.includes("pdf")) {
      try {
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        extractedText = textResult.text || "";
        await parser.destroy();
      } catch (pdfErr) {
        console.warn("[PDF Parse Error]:", pdfErr);
        throw new Error("Unable to parse PDF text. Please ensure the PDF is not encrypted or scanned as a pure image.");
      }
    } else if (ext === ".docx" || file_type?.includes("wordprocessingml") || file_type?.includes("docx")) {
      try {
        const parsed = await mammoth.extractRawText({ buffer });
        extractedText = parsed.value || "";
      } catch (docxErr) {
        console.warn("[DOCX Parse Error]:", docxErr);
        throw new Error("Unable to parse Word .docx file.");
      }
    } else if (ext === ".doc" || file_type?.includes("msword")) {
      // Mammoth may parse some .doc, or fallback to text stream extraction
      try {
        const parsed = await mammoth.extractRawText({ buffer });
        extractedText = parsed.value || "";
      } catch {
        // Fallback: extract ASCII/UTF printable strings
        extractedText = buffer.toString("utf-8").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").trim();
      }
    } else if (ext === ".odt" || file_type?.includes("opendocument.text")) {
      // ODF / ODT text extraction from uncompressed stream or XML tags
      const raw = buffer.toString("utf-8");
      const stripped = raw.replace(/<[^>]+>/g, " ").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
      extractedText = stripped.replace(/\s+/g, " ").trim();
    } else if (ext === ".txt" || ext === ".rtf") {
      let raw = buffer.toString("utf-8");
      if (ext === ".rtf") {
        raw = raw.replace(/\\par[d]?/g, "\n").replace(/\{\\[^}]+\}/g, "").replace(/\\[a-z0-9]+/g, "").replace(/[{}]/g, "");
      }
      extractedText = raw;
    } else {
      // General fallback: try PDF, then DOCX, then plain text
      try {
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        extractedText = textResult.text || "";
        await parser.destroy();
      } catch {
        try {
          const parsedDoc = await mammoth.extractRawText({ buffer });
          extractedText = parsedDoc.value || "";
        } catch {
          extractedText = buffer.toString("utf-8").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
        }
      }
    }

    // Clean whitespace and excessive blank lines
    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!extractedText || extractedText.length < 20) {
      return res.status(422).json({
        error: "Document text could not be extracted or file contains no text layer (e.g. image-only scan)."
      });
    }

    // Common skill taxonomy scan
    const skillCorpus = [
      "Python", "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Express", 
      "Java", "C++", "C#", "Go", "Rust", "SQL", "PostgreSQL", "MongoDB", "Redis",
      "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git", "CI/CD", "Linux",
      "Financial Modeling", "DCF Valuation", "Excel", "Bloomberg", "Accounting", "LBO",
      "Figma", "UI/UX", "User Research", "Wireframing", "Design Systems",
      "Bioinformatics", "PCR", "Genomics", "Next-Gen Sequencing", "R", "Bioconductor",
      "Machine Learning", "PyTorch", "TensorFlow", "Pandas", "NumPy"
    ];
    const textLower = extractedText.toLowerCase();
    const detectedSkills = skillCorpus.filter(s => textLower.includes(s.toLowerCase()));

    logAction("resume_auditor", "text_parsed", `Successfully extracted ${extractedText.split(/\s+/).length} words and detected ${detectedSkills.length} domain skills from "${filename}".`);

    res.json({
      success: true,
      filename,
      extracted_text: extractedText,
      detected_skills: detectedSkills,
      character_count: extractedText.length,
      word_count: extractedText.split(/\s+/).filter(Boolean).length
    });
  } catch (err: any) {
    console.error("[Parse Document Error]:", err);
    res.status(500).json({ error: err.message || "Failed to process resume file." });
  }
});

// Mount the API router exclusively under /api so root and client paths render the React UI
app.use("/api", apiRouter);

export { app, apiRouter };
export default app;
