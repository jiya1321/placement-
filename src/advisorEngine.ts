// src/advisorEngine.ts - Shared Career & Technical Intelligence Engine (Domain Guardrails, Curated RAG Docs, and Ultra-Fast Synthesis)

export interface DomainCheckResult {
  inScope: boolean;
  refusalMessage?: string;
}

// 1. DOMAIN GUARDRAILS
// Strictly restricts the assistant to Resume Optimization, Technical Interview Loops, Machine Coding, DSA, and Career Roadmaps.
export function checkCareerDomainScope(query: string): DomainCheckResult {
  const q = query.toLowerCase().trim();

  const bannedTopics = [
    { pattern: /\b(recipe|bake|cook|cake|pizza|pasta|cookie|soup|sandwich|cocktail|food ingredient|dessert)\b/, name: "culinary & food recipes" },
    { pattern: /\b(poem|poetry|love letter|dating advice|romance|horoscope|zodiac|tarot|astrology)\b/, name: "creative writing & personal dating" },
    { pattern: /\b(movie plot|video game cheat|minecraft|fortnite|gta|playstation|xbox|netflix show|anime episode)\b/, name: "gaming & entertainment" },
    { pattern: /\b(capital of|president of|prime minister of|who won the \w+ cup|world war|historical trivia)\b/, name: "general trivia & geography" },
    { pattern: /\b(football score|cricket match score|ipl score|premier league|nba score)\b/, name: "sports trivia & live scores" },
    { pattern: /\b(crypto price|bitcoin forecast|forex trading signal|lottery numbers|stock pick)\b/, name: "speculative financial trading" },
    { pattern: /\b(medical diagnosis|symptom checker|prescribe medication|cure disease)\b/, name: "medical & health advice" }
  ];

  const careerKeywords = [
    "resume", "cv", "ats", "interview", "dsa", "leetcode", "hackerrank", "gfg", "geeksforgeeks",
    "algorithm", "data structure", "coding", "coder", "sde", "swe", "developer", "engineer",
    "intern", "internship", "job", "career", "placement", "campus", "hiring", "recruiter",
    "company", "flipkart", "razorpay", "google", "amazon", "microsoft", "swiggy", "zomato",
    "cred", "tcs", "infosys", "startup", "behavioral", "introduce yourself", "tell me about yourself",
    "star method", "weakness", "strength", "salary", "stipend", "roadmap", "project", "portfolio",
    "github", "system design", "machine coding", "oop", "dbms", "os", "computer network",
    "sql", "python", "java", "c++", "javascript", "typescript", "react", "node", "docker",
    "binary search", "graph", "tree", "dynamic programming", "sliding window", "two pointer",
    "stack", "queue", "linked list", "recursion", "backtracking", "sorting", "time complexity",
    "space complexity", "big o", "outreach", "cold email", "cover letter", "experience", "bullet",
    "flaw", "quantify", "xyz", "google xyz", "bullet point", "skills"
  ];

  const hasCareerSignal = careerKeywords.some(kw => q.includes(kw));

  for (const { pattern, name } of bannedTopics) {
    if (pattern.test(q) && !hasCareerSignal) {
      return {
        inScope: false,
        refusalMessage: `I am your dedicated **PlacePilot Technical & Career Preparation Advisor**. I specialize exclusively in software engineering, technical career placement, and interview readiness.

I cannot provide answers on **${name}**. 

I am equipped to help you with:
- 📄 **Resume Optimization & ATS Audits** (Google XYZ bullet rewrites, metric quantification, flaw fixes)
- 🎯 **Interview Mastery & Behavioral Preparation** (Present-Past-Future scripts for *"Introduce Yourself"*, STAR stories)
- 💡 **Data Structures & Algorithms (DSA)** (core patterns, Big-O complexities, problem-solving intuition)
- 🏢 **Company-Specific Hiring Loops** (Flipkart, Razorpay, Amazon, Google, Indian startups, campus placements)
- 🗺️ **4-Week Preparation Roadmaps & Proof-of-Work Projects**

Please ask any question related to your resume, DSA topics, target companies, or upcoming interviews!`
      };
    }
  }

  const allowedConversational = [
    /\b(hi|hello|hey|help|guide|prepare|preparation|tips|advice|feedback|practice|mock|test|ready)\b/,
    /\b(introduce|intro|yourself|about me|about you|background|pitch|elevator pitch)\b/,
    /\b(question|answer|round|technical|hr|manager|loop|drill|sprint|weakness|strength)\b/,
    /\b(code|function|array|string|pointer|search|sort|dp|tree|graph)\b/
  ];

  if (hasCareerSignal || allowedConversational.some(p => p.test(q)) || q.length < 25) {
    return { inScope: true };
  }

  return {
    inScope: false,
    refusalMessage: `I am your dedicated **PlacePilot Technical & Career Preparation Advisor**. I can only assist with career development, technical interview prep (DSA & System Design), resume optimization, and company hiring loops.

Feel free to ask questions like:
- *"How should I answer 'Introduce yourself' for my target role?"*
- *"Explain the Sliding Window vs Two Pointer pattern with examples."*
- *"What is the interview loop for SDE at Flipkart or Razorpay?"*
- *"How do I rewrite my project bullet point using the Google XYZ formula?"*`
  };
}

// 2. CURATED RAG KNOWLEDGE BASE
export const RAG_DOCUMENTS = {
  INTRODUCE_YOURSELF: `
### RAG DOCUMENT: Master Framework for "Introduce Yourself" / "Walk Me Through Your Resume"
**Target Audience**: Students, Interns & Early Career SDEs
**Optimal Duration**: 60 to 90 seconds (never exceed 2 minutes)
**Winning Structure (Present - Past - Future Formula)**:
1. **The Present (20-30s)**:
   - State your current academic standing (Degree, Major, Institution, Graduation Year).
   - Define your core engineering identity: e.g., *"I am a Computer Science undergraduate with a deep focus on backend distributed systems, API architecture, and algorithmic problem-solving."*
2. **The Past & Core Proof-of-Work (30-40s)**:
   - Highlight 1 or 2 defining technical projects or internships with concrete metrics.
   - Mention the tech stack and the architectural challenge you tackled (e.g. concurrency, database indexing, caching with Redis, microservices).
   - Quantify impact: latency reduced, users supported, or accuracy achieved.
3. **The Future & Why This Company (15-20s)**:
   - Bridge directly to the employer: *"What excites me about [Company Name] is your work in [high-scale distributed payments / e-commerce logistics / cloud infrastructure]. Having built [similar system], I'm eager to bring my hands-on problem-solving and clean coding discipline to your engineering team."*
**Key Dos & Don'ts**:
- DO NOT read your resume chronologically from high school onwards.
- DO mention technical trade-offs you enjoy making.
- DO sound enthusiastic, concise, and structured.
`,

  STAR_METHOD: `
### RAG DOCUMENT: STAR Method for Technical & Behavioral Interviews
**Framework Breakdown**:
- **Situation (15%)**: Concise context. Set the technical stage (e.g., *"During my final semester capstone project with 3 peers..."*).
- **Task (15%)**: What was the specific goal, deadline, or production roadblock?
- **Action (50% - THE CORE)**: What did YOU personally do? Be specific about technologies, algorithms, debugging steps, and team communication. Avoid saying "we did"; use "I architected", "I refactored", "I profiled".
- **Result (20%)**: Quantified business or technical outcome (e.g., *"Reduced API response latency from 450ms to 92ms, achieved 98% test coverage, and deployed to production on AWS"*).
`,

  DSA_PATTERNS: `
### RAG DOCUMENT: Core Data Structures & Algorithms (DSA) Interview Patterns
**Essential Patterns Asked in Indian Tech & Global SDE Rounds**:
1. **Two Pointers & Sliding Window**:
   - *Two Pointers*: Deals with pairs, triples, reversing, or searching sorted structures. Pointers typically start at opposite ends or move at different speeds ($O(N)$ time, $O(1)$ space).
   - *Sliding Window*: Deals with contiguous subarrays or substrings to find optimal sum, length, or character frequencies ($O(N)$ time, $O(K)$ space).
2. **Fast & Slow Pointers (Floyd's Tortoise and Hare)**:
   - Cycle detection in linked lists or state spaces ($O(N)$ time, $O(1)$ space).
3. **Monotonic Stack**:
   - Finding next greater / smaller element for each index in $O(N)$.
4. **Trees & Binary Search Trees**:
   - Level-order BFS, In-order traversal, LCA ($O(N)$ time, $O(H)$ space).
5. **Graph Algorithms**:
   - BFS (shortest path in unweighted graphs), DFS (connected components), Topological Sort (Kahn's / DFS for build dependencies), Dijkstra (shortest path with non-negative weights).
6. **Dynamic Programming (DP)**:
   - Overlapping subproblems + optimal substructure. Top-down (Memoization) vs Bottom-up (Tabulation).
`,

  GOOGLE_XYZ_RESUME: `
### RAG DOCUMENT: Google XYZ Resume Formula & ATS Optimization
**The Formula**:
> **"Accomplished [X], as measured by [Y], by doing [Z]"**
- **[X] What you achieved**: Start with a high-impact action verb (Engineered, Architected, Optimized, Refactored, Spearheaded). Avoid weak verbs like "Worked on", "Helped with", "Was responsible for".
- **[Y] The measurable impact**: Quantifiable metric (e.g. *by 35%*, *handling 10,000+ daily queries*, *saving 4 hours weekly*, *reducing P99 latency by 120ms*).
- **[Z] How you did it**: The specific technical tools, algorithms, or architectures you utilized (e.g. *by implementing Redis caching and indexing PostgreSQL queries*, *by building a multi-threaded worker pool in Go*).
`,

  COMPANY_HIRING_LOOPS: `
### RAG DOCUMENT: Indian Tech Ecosystem & Global SDE Hiring Loops
1. **Flipkart**:
   - *Round 1*: Online Assessment (OA) on HackerEarth (2-3 DSA questions, 90 mins).
   - *Round 2 (Machine Coding / LLD)*: 90-minute live coding round. Design and implement a working, clean object-oriented system (e.g. In-memory Coffee Machine, Ride Sharing, Parking Lot) with SOLID principles, test cases, and modularity.
   - *Round 3 (Problem Solving & DSA)*: 1 hour on Trees, Graphs, or Dynamic Programming.
   - *Round 4 (Hiring Manager)*: Cultural fit, past projects, system design trade-offs.
2. **Razorpay**:
   - *Round 1*: Coding assessment (DSA & practical problem solving).
   - *Round 2*: DSA & Data Structures in-depth.
   - *Round 3*: Engineering Architecture, API design, database schemas, and edge case handling.
   - *Round 4*: Razorpay Culture & Values (Ownership, First Principles thinking).
3. **Amazon India**:
   - *Online Assessment*: 2 DSA questions + Work Style Assessment.
   - *Technical Rounds*: 2-3 rounds focusing heavily on Trees, Graphs, DP, and String Manipulation.
   - *Leadership Principles*: Every interviewer will probe 1-2 Amazon Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep) using STAR questions.
4. **Google India**:
   - *Technical Rounds*: 3-4 rounds purely on algorithmic problem solving, graph theory, mathematical logic, and edge-case handling. High expectation of bug-free code on Google Docs or CoderPad.
   - *Googlyness*: Behavioral and ethical decision-making round.
`
};

// 3. RAG RETRIEVAL ENGINE
export function retrieveRelevantRAG(query: string, company?: string): { docs: string[]; topics: string[] } {
  const q = query.toLowerCase();
  const docs: string[] = [];
  const topics: string[] = [];

  if (
    q.includes("introduce") || 
    q.includes("tell me about yourself") || 
    q.includes("walk me through") || 
    q.includes("about me") || 
    q.includes("elevator pitch")
  ) {
    docs.push(RAG_DOCUMENTS.INTRODUCE_YOURSELF);
    topics.push("Present-Past-Future Pitch Framework");
  }

  if (
    q.includes("star") || 
    q.includes("behavioral") || 
    q.includes("situation") || 
    q.includes("weakness") || 
    q.includes("strength") || 
    q.includes("conflict") ||
    q.includes("challenging")
  ) {
    docs.push(RAG_DOCUMENTS.STAR_METHOD);
    topics.push("STAR Method for Behavioral Rounds");
  }

  if (
    q.includes("dsa") || 
    q.includes("algorithm") || 
    q.includes("two pointer") || 
    q.includes("sliding window") || 
    q.includes("graph") || 
    q.includes("tree") || 
    q.includes("dynamic programming") || 
    q.includes("dp") || 
    q.includes("binary search") || 
    q.includes("stack") || 
    q.includes("queue") || 
    q.includes("complexity") || 
    q.includes("big o") ||
    q.includes("leetcode")
  ) {
    docs.push(RAG_DOCUMENTS.DSA_PATTERNS);
    topics.push("Core DSA Algorithmic Patterns");
  }

  if (
    q.includes("resume") || 
    q.includes("flaw") || 
    q.includes("ats") || 
    q.includes("bullet") || 
    q.includes("xyz") || 
    q.includes("google xyz") || 
    q.includes("quantify") ||
    q.includes("rewrite")
  ) {
    docs.push(RAG_DOCUMENTS.GOOGLE_XYZ_RESUME);
    topics.push("Google XYZ Resume Optimization");
  }

  if (
    q.includes("flipkart") || 
    q.includes("razorpay") || 
    q.includes("amazon") || 
    q.includes("google") || 
    q.includes("swiggy") || 
    q.includes("zomato") || 
    q.includes("cred") || 
    q.includes("company") || 
    q.includes("hiring loop") || 
    q.includes("interview round") ||
    q.includes("machine coding") ||
    (company && q.includes(company.toLowerCase()))
  ) {
    docs.push(RAG_DOCUMENTS.COMPANY_HIRING_LOOPS);
    topics.push("Company-Specific Hiring Loops & Interview Formats");
  }

  if (docs.length === 0) {
    docs.push(RAG_DOCUMENTS.INTRODUCE_YOURSELF);
    docs.push(RAG_DOCUMENTS.GOOGLE_XYZ_RESUME);
    topics.push("Core Interview & Resume Framework");
  }

  return { docs, topics };
}

// 4. BESPOKE LOCAL SYNTHESIS ENGINE
// This ensures that even in zero-network scenarios or fast fallbacks, the student receives a complete, tailored response.
export function generateSmartLocalAdvisorResponse(
  query: string,
  userProfile: any,
  audit: any,
  opportunities: any[]
): string {
  const q = query.toLowerCase();
  const userName = userProfile?.name || userProfile?.full_name || "Kunal";
  const userEdu = userProfile?.education || "B.Tech in Computer Science & Engineering";
  const userGoal = userProfile?.career_goal || "Software Development Engineer (SDE) Intern";
  const resumeText = userProfile?.resume_text || "";
  const topCompany = opportunities && opportunities.length > 0 ? opportunities[0].company : "Flipkart";
  const topRole = opportunities && opportunities.length > 0 ? opportunities[0].title : userGoal;

  // Case 1: "Introduce yourself" / "Tell me about yourself"
  if (
    q.includes("introduce") || 
    q.includes("tell me about yourself") || 
    q.includes("walk me through") || 
    q.includes("elevator pitch")
  ) {
    // Extract a real snippet from resume if available
    const projectHint = resumeText.length > 30 
      ? "my core full-stack project where I tackled database query optimization and API concurrency"
      : "building scalable web services, API architectures, and optimizing algorithmic query performance";

    return `### How to Answer "Introduce Yourself" (Tailored for ${userName})

To master this foundational question in your technical interview loops (including **${topCompany}**), use the battle-tested **Present - Past - Future Framework**. Interviewers use this 60–90 second question to evaluate your technical identity, communication conciseness, and engineering drive.

---

#### 🎙️ Your Spoken Script (Practice Aloud):

> **[1. THE PRESENT - 25 seconds]**:  
> *"Hi, my name is ${userName}, and I am currently pursuing my ${userEdu} graduating in 2027. My core technical focus is in software engineering—particularly building robust backend services, working with data structures, and designing high-performance RESTful APIs."*
>
> **[2. THE PAST & PROOF-OF-WORK - 35 seconds]**:  
> *"Over the past year, I've channeled this passion into practical engineering. For instance, in ${projectHint}, I engineered a modular backend where I resolved latency bottlenecks by introducing caching and indexing database queries. I prioritized writing clean, maintainable code with unit tests, which deepened my practical grasp of system design fundamentals."*
>
> **[3. THE FUTURE & WHY THIS COMPANY - 20 seconds]**:  
> *"What really excites me about the ${topRole} opening at **${topCompany}** is your engineering scale and commitment to high-throughput reliability. Having built systems from the ground up, I'm eager to bring my algorithmic problem-solving discipline and fast learning speed to your engineering team."*

---

#### 💡 Key Delivery Tips:
- **Strict Time Limit**: Keep it between **75 to 90 seconds**. Never recite your resume chronologically.
- **The Hook**: Notice how the script bridges directly into why you want to build at **${topCompany}**, handing control back to the interviewer with an invitation to discuss your projects.
- **Metric Anchor**: If you know your specific numbers (e.g. 40% latency reduction, 500+ active users), drop them directly into the Past section!`;
  }

  // Case 2: Two Pointer vs Sliding Window & DSA patterns
  if (
    q.includes("two pointer") || 
    q.includes("sliding window") || 
    q.includes("dsa") || 
    q.includes("algorithm") || 
    q.includes("dynamic programming") || 
    q.includes("dp") ||
    q.includes("complexity")
  ) {
    return `### **Two Pointers vs. Sliding Window: Technical Comparison & Code**

Both patterns are essential for technical rounds at top product companies (Flipkart, Amazon, Google). They optimize brute-force $O(N^2)$ array or string operations down to **$O(N)$ linear time and $O(1)$ auxiliary space**.

---

### **1. Two Pointers Pattern**
- **Core Mechanism**: Uses two separate pointer indices that typically move toward each other (opposite ends: \`left = 0\`, \`right = n - 1\`) or at different speeds (fast & slow pointers).
- **Best Used For**: **Sorted arrays or strings**, finding pairs with a target sum, reversing sequences, or checking palindromes.
- **Classic Problems**: *Two Sum II (Sorted)*, *Container With Most Water*, *Valid Palindrome*, *3Sum*.

#### **Python Implementation: Valid Palindrome**
\`\`\`python
def isPalindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True
\`\`\`
- **Time Complexity**: $O(N)$ — Single pass over array.
- **Space Complexity**: $O(1)$ — Zero extra memory allocated.

---

### **2. Sliding Window Pattern**
- **Core Mechanism**: Maintains a dynamic contiguous subsegment/window defined by \`[window_start, window_end]\`. The window expands to include new elements and contracts from the left when a constraint is violated.
- **Best Used For**: Continuous subarrays or substrings with minimum/maximum length, target sums, or distinct character counts.
- **Classic Problems**: *Longest Substring Without Repeating Characters*, *Minimum Size Subarray Sum*, *Sliding Window Maximum*.

#### **Python Implementation: Longest Substring Without Repeating Characters**
\`\`\`python
def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        # If character was seen inside current window, slide left pointer
        if s[right] in char_map and char_map[s[right]] >= left:
            left = char_map[s[right]] + 1
        char_map[s[right]] = right
        max_len = max(max_len, right - left + 1)
        
    return max_len
\`\`\`
- **Time Complexity**: $O(N)$ — Right pointer visits each index once; left pointer only moves forward.
- **Space Complexity**: $O(\\min(N, K))$ where $K$ is character set size.

---

### **Summary Rule for Interviews**:
- If looking for a **contiguous subarray/substring** $\\rightarrow$ **Sliding Window**.
- If working with **sorted arrays, pairs, or symmetric comparisons** $\\rightarrow$ **Two Pointers**.`;
  }

  // Case 3: Interview loop & machine coding round (Flipkart / Google / Razorpay)
  if (
    q.includes("interview loop") || 
    q.includes("machine coding") || 
    q.includes("flipkart") || 
    q.includes("google") || 
    q.includes("razorpay") || 
    q.includes("amazon")
  ) {
    return `### **SDE Interview Loop & Machine Coding Round for Flipkart / Google**

Here is the exact blueprint for Tier-1 software engineering hiring loops:

---

#### 🏢 **1. Flipkart SDE Interview Loop Breakdown**:
1. **Online Assessment (OA) (90 mins)**:
   - 3 algorithmic questions on HackerEarth (Arrays, Binary Search, Graphs/Trees, DP).
2. **Round 1: Machine Coding Round (90 mins - CRITICAL)**:
   - **What it is**: You must build a fully working, in-memory object-oriented software system from scratch (e.g., *Splitwise expense sharing, In-Memory Ride Sharing like Uber/Ola, Parking Lot management, or Snake & Ladder*).
   - **Evaluation**: Working demo with test cases, clean SOLID principles, proper encapsulation, modularity, and handling concurrency.
3. **Round 2: Problem Solving & Core DSA (60 mins)**:
   - Live algorithmic coding focusing on LeetCode Medium/Hard topics (Dynamic Programming, Trees, Binary Search on Answer).
4. **Round 3: Hiring Manager & Engineering Culture (45 mins)**:
   - Technical trade-offs, past architectural decisions, and cultural fit.

---

#### 🌐 **2. Google India SDE Loop**:
1. **Technical Phone Screen (45 mins)**: Live coding on Google Docs/CoderPad on data structures and time complexity.
2. **Onsite Technical Rounds (3 to 4 rounds)**:
   - Pure algorithmic problem-solving with extreme emphasis on mathematical rigor, graph theory, edge cases, and clean, bug-free implementation.
3. **Googlyness & Leadership (45 mins)**: Situational behavioral questions using the STAR framework.

---

#### ⚡ **How to Prepare for the Machine Coding Round**:
- Practice standard Low-Level Design (LLD) problems using standard OOP patterns (Factory, Strategy, Observer).
- Always start with clean entity definitions (\`User\`, \`Ride\`, \`Payment\`) before writing controller logic.
- Keep state in-memory (using HashMaps and ConcurrentDataStructures) and write a driver \`main()\` method demonstrating all required test cases!`;
  }

  // Case 4: Google XYZ Resume Rewrite
  if (
    q.includes("xyz") || 
    q.includes("google xyz") || 
    q.includes("bullet") || 
    q.includes("resume") || 
    q.includes("rewrite")
  ) {
    const flawSample = audit?.flaws && audit.flaws.length > 0 ? audit.flaws[0] : null;

    return `### **Google XYZ Resume Bullet Rewrite Strategy**

The Google XYZ Formula is the gold standard for software engineering resumes:
> **"Accomplished [X], as measured by [Y], by doing [Z]"**

---

#### 🛠️ **Before & After Rewrites for Your Projects**:

1. **Backend & Full-Stack Systems**:
   - ❌ **Passive / Weak**: *"Worked on full stack web app using React and Node.js with database."*
   -  **Google XYZ**: *"Architected a responsive full-stack platform serving 1,200+ active user sessions, cutting API payload latency by 42% through Redis caching and PostgreSQL query indexing."*

2. **Database & API Optimization**:
   - ❌ **Passive / Weak**: *"Created REST APIs and managed data storage."*
   -  **Google XYZ**: *"Engineered 14 modular RESTful endpoints with Express and TypeScript, increasing concurrent request throughput by 35% using connection pooling and schema normalization."*

3. **Algorithmic & System Performance**:
   - ❌ **Passive / Weak**: *"Implemented search algorithm in the application."*
   -  **Google XYZ**: *"Optimized search querying time from 650ms to 48ms across 50,000+ records by deploying an in-memory Trie data structure with prefix caching."*

${flawSample ? `---

#### 🔍 **Immediate Fix for Your Diagnosed ATS Flaw**:
- **Original Snippet**: *"${flawSample.original_snippet}"*
- **Identified Flaw**: ${flawSample.issue_description}
- **Recommended XYZ Upgrade**:  
  👉 **"${flawSample.improved_suggestion}"**` : ''}

---

#### 💡 **Actionable Checklist**:
- Start every single bullet with a past-tense power verb (**Engineered, Architected, Refactored, Profiled, Deployed**).
- Never submit a bullet that doesn't contain at least one concrete number (%, ms, RPS, or users)!`;
  }

  // Case 5: STAR Behavioral method
  if (
    q.includes("star") || 
    q.includes("behavioral") || 
    q.includes("challenging") || 
    q.includes("conflict") ||
    q.includes("weakness")
  ) {
    return `### **Mastering the STAR Method for Technical Interviews**

In behavioral rounds (like Amazon Leadership Principles or Flipkart HM rounds), interviewers evaluate your ownership and decision-making rigor using the **STAR Method**:

---

#### **The 4-Part Structure**:
1. **Situation (15%)**: Briefly set the context, system scale, and timeline.
2. **Task (15%)**: What was the specific technical roadblock or deadline constraint?
3. **Action (50% - THE CORE)**: What did YOU personally investigate, debug, code, and deploy?
4. **Result (20%)**: Quantified technical outcome (latency reduced, zero downtime, test coverage).

---

#### 🎙️ **Example Script: "Tell me about a challenging bug you fixed"**:
- **[Situation]**: *"During the development of our distributed services project, our testing suite started failing under simulated concurrency tests."*
- **[Task]**: *"I was responsible for isolating the root cause of intermittent deadlocks in our database transaction layer within 48 hours."*
- **[Action]**: *"I profiled the query logs using explain-analyze, discovered unindexed foreign key locks, refactored our transactional isolation level to Read Committed, and introduced pessimistic locking on critical financial balances."*
- **[Result]**: *"This eliminated 100% of the deadlock occurrences, maintained sub-50ms transaction latency under 200 concurrent worker threads, and allowed our team to pass quality audits ahead of deadline."*`;
  }

  // Default rich guide
  return `### **Career & Technical Placement Guide for ${userName}**

Here is your customized action plan for **${topCompany}** (${userGoal}):

1. **Behavioral Pitch**: Prepare your 75-second *"Introduce Yourself"* narrative using the **Present-Past-Future** framework, emphasizing your hands-on coding and alignment with ${topCompany}.
2. **Technical Mastery**: Practice high-yield DSA patterns (Two Pointers, Sliding Window, and Graph BFS) with 2 timed LeetCode Medium problems daily.
3. **Machine Coding**: For Indian tech companies like Flipkart and Razorpay, spend 90 minutes designing an in-memory system (e.g. Splitwise or Parking Lot) with clean OOP and SOLID principles.
4. **Resume Upgrade**: Rewrite your experience bullets using Google's XYZ formula (*Accomplished [X] as measured by [Y] by doing [Z]*).`;
}
