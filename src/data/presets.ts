export interface DomainPreset {
  id: string;
  label: string;
  domain: string;
  goal: string;
  resumeSnippet: string;
}

export const DOMAIN_PRESETS: DomainPreset[] = [
  {
    id: "software",
    label: "Software & Systems",
    domain: "Technology & Software Engineering",
    goal: "Backend or Full-Stack Engineering Intern working on distributed microservices and scalable cloud systems.",
    resumeSnippet: `EDUCATION:
B.S. in Computer Science, State University (GPA: 3.7/4.0, Expected May 2027)

TECHNICAL SKILLS:
Languages: TypeScript, Python, SQL, Java
Frameworks: React, Node.js, Express, PostgreSQL, Docker, Git

EXPERIENCE & PROJECTS:
Full-Stack Web Developer Intern | Campus Tech Hub (June 2025 - August 2025)
- Worked on frontend features and fixed bugs across the application.
- Was responsible for helping with database queries and team code reviews.
- Built full-stack project with Node and React for student event registrations.

Distributed File Cache | Personal Academic Project (Fall 2025)
- Implemented a caching service in Python with Redis.
- Handled concurrent read requests and stored temporary keys.`
  },
  {
    id: "finance",
    label: "Investment Banking & Finance",
    domain: "Financial Services & Quantitative Finance",
    goal: "Summer Investment Banking Analyst or Quantitative Trading Intern focusing on financial modeling and M&A valuation.",
    resumeSnippet: `EDUCATION:
B.S. in Finance & Economics, University Business School (GPA: 3.85/4.0, Expected June 2027)

COURSEWORK & COMPETENCIES:
Financial Accounting, Corporate Valuation, Econometrics, Excel Financial Modeling, Python for Finance, Bloomberg Terminal

EXPERIENCE & LEADERSHIP:
Student Investment Fund | Senior Equity Analyst (Sept 2024 - Present)
- Assisted with researching public equity pitches across enterprise SaaS and retail sectors.
- Was responsible for building basic DCF valuation spreadsheets.
- Helped present weekly stock recommendations to executive committee.

Corporate Finance Intern | Regional Advisory Group (June 2025 - August 2025)
- Prepared PowerPoint pitch decks for regional mid-market client meetings.
- Looked up comparative transaction multiples on PitchBook and Capital IQ.`
  },
  {
    id: "biotech",
    label: "Biotech & Healthcare",
    domain: "Biotechnology & Computational Biology",
    goal: "Bioinformatics or Clinical Research Intern analyzing genomics data pipelines and therapeutic assay results.",
    resumeSnippet: `EDUCATION:
B.S. in Biomedical Sciences & Bioinformatics (GPA: 3.8/4.0, Expected May 2027)

LABORATORY & COMPUTATIONAL SKILLS:
Wet Lab: PCR Amplification, Gel Electrophoresis, Cell Culture, ELISA Assays
Computational: Python (BioPython, Pandas), R (Bioconductor), Next-Generation Sequencing (NGS) Analysis, Unix CLI

RESEARCH EXPERIENCE:
Genomic Analytics Lab | Undergraduate Research Assistant (Oct 2024 - Present)
- Worked on analyzing RNA sequencing datasets from cancer cell line samples.
- Ran alignment scripts using command line tools and generated statistical plots in R.
- Maintained lab inventory and assisted PhD candidates with daily pipette protocols.`
  },
  {
    id: "design",
    label: "Product & UI/UX Design",
    domain: "Product Design & Human-Computer Interaction",
    goal: "Associate Product Designer or UX Engineering Intern designing accessible, high-craft digital products.",
    resumeSnippet: `EDUCATION:
B.A. in Cognitive Science & Human-Computer Interaction (GPA: 3.75/4.0, Expected Spring 2027)

DESIGN & PROTOTYPING SKILLS:
Design: Figma, Design Systems, User Research, Wireframing, Interaction Design, Usability Testing
Frontend: HTML5, CSS3, Tailwind, React, Motion, Accessibility (WCAG 2.1 AA)

EXPERIENCE & PORTFOLIO:
Freelance Product Designer (May 2025 - Present)
- Designed websites for local startups and small businesses.
- Made Figma wireframes and conducted user interviews with customers.
- Helped improve mobile navigation layout and button colors.`
  }
];
