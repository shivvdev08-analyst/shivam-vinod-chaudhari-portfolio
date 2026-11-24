// Verified content only — taken from the live Muse portfolio (getsite, 2026-11-24).
// No invented achievements, results, responsibilities, dates or metrics.
// Feature states are labelled honestly: Implemented / In development / Planned / Built at hackathon.

export const profile = {
  name: "Shivam Vinod Chaudhari",
  role: "Aspiring AI Engineer & Full-Stack Developer",
  tagline: "Turning intelligence into innovation.",
  intro:
    "I build intelligent software systems — AI applications, machine-learning solutions and modern full-stack products. I am an MCA student in Pune, a certified data scientist, and the builder of ASTRA and SafeGen AI and co-builder of VERITAS with Divya Padukone.",
  origin:
    "My path into AI started with a simple fascination: software that doesn't just follow instructions, but understands. During my BCA in Jalgaon I moved from programming fundamentals toward data — how information can be cleaned, modelled and turned into decisions. That curiosity became a discipline at Rubixe AI Solutions, where I spent six months as a Data Science Intern, and it now drives my MCA research at Dr. D. Y. Patil Dnyan Prasad Global University in Pune, where I am building document-intelligence systems, self-reflective LLM evaluation frameworks and a personal AI companion. I am an emerging engineer: what I show here is what I have actually built, labelled honestly as completed, in development, or planned.",
  location: "Pune, Maharashtra, India",
  email: "shivv.dev08@gmail.com",
  github: "https://github.com/shivvdev08-analyst",
  linkedin: "https://www.linkedin.com/in/shivam-chaudhari-30a5ba3a8/",
  availability: "Open to AI engineering internships and entry-level roles",
  careerDirections: [
    "AI Engineer",
    "Machine Learning Engineer",
    "Data Scientist",
    "Full-Stack AI Product Engineer",
  ],
};

export const education = [
  {
    title: "Master of Computer Applications (MCA)",
    org: "Dr. D. Y. Patil Dnyan Prasad Global University",
    location: "Tathawade, Pune",
    period: "2025 – 2027",
    badge: "Ongoing · CGPA 9.09",
    detail:
      "School of Management & Research. Two-semester CGPA 9.09. Capstone: VERITAS, a multimodal document intelligence platform.",
  },
  {
    title: "Bachelor of Computer Applications (BCA)",
    org: "Moolji Jetha Autonomous College",
    location: "Jalgaon",
    period: "Completed",
    badge: "CGPA 8.33",
    detail: "Graduated with CGPA 8.33.",
  },
];

export const experience = [
  {
    title: "Data Science Intern",
    org: "Rubixe AI Solutions",
    location: "",
    period: "6 months",
    badge: "Internship",
    detail:
      "Data Science internship at Rubixe AI Solutions. Detailed responsibilities are added here only as verified — ask me in an interview and I'll walk you through the work.",
  },
];

export const certifications = [
  { title: "Certified Data Scientist", issuer: "Rubixe AI Solutions" },
  {
    title: "Data Science Internship Completion Certificate",
    issuer: "Rubixe AI Solutions — 6-month internship",
  },
];

export const achievements = [
  {
    title: "First Position — Hackathon Winner",
    context: "With Team Alpha",
    detail:
      "Data4Viz, an AI-powered EDA automation application, won First Position at a Modern College of Engineering hackathon.",
  },
  {
    title: "MCA Capstone — VERITAS",
    context: "Dr. D. Y. Patil Dnyan Prasad Global University",
    detail:
      "Building a multimodal document & information intelligence platform as the MCA capstone, with Divya Padukone.",
  },
];

export const skillGroups = [
  {
    name: "AI & Machine Learning",
    skills: [
      "Machine Learning",
      "Deep Learning",
      "LLM Evaluation",
      "Semantic Search & Embeddings",
      "Sentiment Analysis (FinBERT)",
      "OCR (EasyOCR)",
    ],
  },
  { name: "Languages", skills: ["Python", "TypeScript", "JavaScript", "SQL"] },
  {
    name: "Backend & Data",
    skills: ["FastAPI", "PostgreSQL", "pgvector", "Node.js", "Express", "MongoDB"],
  },
  {
    name: "Frontend & Product",
    skills: ["React", "Next.js", "Tailwind CSS", "Streamlit"],
  },
  {
    name: "Tools & Platforms",
    skills: [
      "Git & GitHub",
      "Ollama (Local LLMs)",
      "Sentence Transformers",
      "XGBoost",
      "Scikit-learn",
    ],
  },
];

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  status: string;
  team: string;
  stack: string[];
  githubUrl: string;
  simpleSummary: string;
  problem: string;
  objectives: string[];
  implementation: string;
  architecture: string;
  challenges: string;
  results: string;
  limitations: string;
  future: string;
  contribution: string;
  featureStatus: { feature: string; state: string }[];
};

export const projects: Project[] = [
  {
    slug: "astra",
    title: "ASTRA",
    tagline: "The Future, Within Reach.",
    category: "Personal AI",
    status: "in-development",
    team: "Solo project",
    stack: ["Python", "Ollama", "Local LLMs", "Speech Interaction"],
    githubUrl: "https://github.com/shivvdev08-analyst/Astra",
    simpleSummary:
      "ASTRA is my personal AI companion — an assistant designed to be spoken to, not typed at. It is being built around voice-first interaction, local AI through Ollama, application launching and long-term memory, so help feels personal instead of generic.",
    problem:
      "Mainstream assistants are cloud-bound, forget context between sessions, and treat every user the same. I wanted to explore what a personal assistant looks like when it runs locally, remembers, and is designed around one person's workflow.",
    objectives: [
      "Voice-first interaction as the primary interface",
      "Local inference support through Ollama for privacy and offline use",
      "Application launching and personal productivity assistance",
      "Long-term contextual memory across sessions",
      "A foundation that can grow to desktop and Android",
    ],
    implementation:
      "Development directions under active work: voice-first interaction, local AI support through Ollama, application launching, and long-term contextual memory. Feature states below are labelled honestly — planned capabilities are not presented as shipped.",
    architecture:
      "ASTRA is structured around a voice interaction layer feeding an intent-and-assistance core, with a local model runtime (Ollama) and a memory layer intended to persist context between sessions. The public GitHub repository (Python) holds the current development state.",
    challenges:
      "Balancing local-model capability against responsiveness, and designing memory that is useful without becoming a privacy liability, are the two open engineering problems I am working through.",
    results:
      "ASTRA is in active development. I do not publish usage metrics or capability claims beyond the development directions documented here.",
    limitations:
      "Not yet a released product: desktop/Android form factors and full automation are roadmap items, not current features.",
    future:
      "Desktop and Android development, deeper automation, and richer long-term memory — released incrementally as each piece is genuinely working.",
    contribution: "Independent personal project — design, architecture and development are mine.",
    featureStatus: [
      { feature: "Voice-first interaction", state: "In development" },
      { feature: "Local AI via Ollama", state: "In development" },
      { feature: "Application launching", state: "In development" },
      { feature: "Long-term contextual memory", state: "In development" },
      { feature: "Personal productivity assistance", state: "In development" },
      { feature: "Desktop & Android apps", state: "Planned" },
    ],
  },
  {
    slug: "veritas",
    title: "VERITAS",
    tagline: "From documents to trusted knowledge.",
    category: "Document Intelligence",
    status: "in-development",
    team: "Shivam Chaudhari & Divya Padukone (MCA capstone)",
    stack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "EasyOCR", "Sentence Transformers (MiniLM)"],
    githubUrl: "",
    simpleSummary:
      "VERITAS turns piles of documents — including scanned PDFs — into a searchable, question-answerable knowledge base. Upload a document, and VERITAS reads it with OCR, understands it semantically, and lets you ask questions against its actual content.",
    problem:
      "Organisations sit on large collections of PDFs and scanned documents that are effectively invisible: keyword search fails on scans, and manual reading doesn't scale. VERITAS addresses the gap between 'stored documents' and 'usable knowledge'.",
    objectives: [
      "Ingest and process documents, including scanned PDFs",
      "Extract text from scans with OCR (EasyOCR)",
      "Index content semantically with Sentence Transformers (MiniLM, 384-dim embeddings)",
      "Store vectors in PostgreSQL with pgvector for semantic search",
      "Answer questions grounded in the retrieved document content",
    ],
    implementation:
      "Implemented work includes the document upload and processing flow, scanned PDF handling, EasyOCR integration, Sentence Transformers embedding generation, pgvector-backed semantic search, and the question-answering workflow over retrieved content.",
    architecture:
      "Pipeline: document upload → processing and scanned-PDF handling → EasyOCR text extraction → chunking → MiniLM embeddings (384 dimensions) → PostgreSQL/pgvector storage → semantic retrieval → AI-powered question answering over the retrieved passages. FastAPI serves the workflow as an API layer.",
    challenges:
      "OCR quality on real-world scans varies widely, and embedding/retrieval quality depends heavily on chunking strategy — both required iterative tuning rather than one-shot configuration.",
    results:
      "VERITAS is a working capstone platform under continued development. No benchmark figures are published here because formal evaluation is part of the capstone's ongoing work.",
    limitations:
      "Performance depends on source-document quality; highly degraded scans and complex layouts remain hard cases.",
    future:
      "Richer multimodal handling, stronger answer grounding with citations, and broader document-type coverage.",
    contribution:
      "Collaborative MCA capstone built with Divya Padukone. Contributions are shared project work; I do not claim sole ownership of the platform or of Divya's individual work.",
    featureStatus: [
      { feature: "Document upload & processing", state: "Implemented" },
      { feature: "Scanned PDF handling + EasyOCR", state: "Implemented" },
      { feature: "MiniLM 384-dim semantic embeddings", state: "Implemented" },
      { feature: "PostgreSQL + pgvector semantic search", state: "Implemented" },
      { feature: "AI question answering over documents", state: "Implemented" },
    ],
  },
  {
    slug: "safegen-ai",
    title: "SafeGen AI",
    tagline: "A Self-Reflective Framework for Evaluating and Improving LLM Outputs.",
    category: "LLM Evaluation",
    status: "research",
    team: "Solo project",
    stack: ["Python", "LLM-as-a-Judge", "Rule-Based Validation", "JavaScript (updated build)"],
    githubUrl: "https://github.com/shivvdev08-analyst/Safegen",
    simpleSummary:
      "SafeGen AI checks AI answers before you trust them. It generates a response, judges it for hallucinations, safety risks and policy violations, and then repairs it — a Generate → Judge → Repair loop that makes LLM output safer to use.",
    problem:
      "LLMs produce fluent answers that can be wrong, unsafe, or policy-violating, and most applications ship those answers unchecked. SafeGen explores whether a model pipeline can evaluate and improve its own outputs before they reach a user.",
    objectives: [
      "Evaluate LLM outputs with rule-based validation and LLM-as-a-judge",
      "Detect hallucinations, safety risks and policy violations",
      "Automatically generate safer, corrected responses",
      "Structure evaluation as a repeatable Generate → Judge → Repair workflow",
    ],
    implementation:
      "Per the public repository README, SafeGen AI is a meta-AI evaluation engine that analyses LLM outputs using rule-based validation and LLM-as-a-judge mechanisms to detect hallucinations, safety risks and policy violations, and automatically generates safer corrected responses. A second, updated repository (safegen_updated) continues the work.",
    architecture:
      "Three-stage pipeline: (1) Generate — a model produces a candidate response; (2) Judge — rule-based validation combined with an LLM-as-a-judge scores the output for hallucination, safety and policy issues; (3) Repair — flagged outputs are regenerated into safer corrected responses.",
    challenges:
      "The judge itself is an LLM, so evaluation quality, cost and consistency trade against each other; designing checks that catch real failures without over-flagging good answers is the core research tension.",
    results:
      "Experimental results are not published yet — I will add verified evaluation numbers here rather than invent them.",
    limitations: "Research-stage framework; judge reliability is itself an open question the project investigates.",
    future: "Verified benchmark evaluation, more judge strategies, and broader model integration.",
    contribution: "Independent research-oriented project.",
    featureStatus: [
      { feature: "Generate → Judge → Repair workflow", state: "Implemented" },
      { feature: "Rule-based + LLM-as-judge evaluation", state: "Implemented" },
      { feature: "Automatic safer-response repair", state: "Implemented" },
      { feature: "Published benchmark results", state: "Planned" },
    ],
  },
  {
    slug: "data4viz",
    title: "Data4Viz",
    tagline: "AI-powered exploratory data analysis, automated.",
    category: "Data Science",
    status: "completed",
    team: "Team Alpha",
    stack: ["Python", "Data Visualisation", "EDA Automation"],
    githubUrl: "",
    simpleSummary:
      "Data4Viz automates the first, slowest part of data science: exploratory data analysis. It turns raw datasets into visual insight quickly — and it won First Position at a Modern College of Engineering hackathon with Team Alpha.",
    problem:
      "Every data project starts with hours of repetitive EDA — profiling columns, hunting patterns, building the same first charts. Data4Viz automates that first pass so analysts start from insight, not from blank notebooks.",
    objectives: [
      "Automate exploratory data analysis for uploaded datasets",
      "Generate meaningful visualisations without manual chart-by-chart work",
      "Build it fast enough to win a hackathon — and it did",
    ],
    implementation:
      "An AI-powered EDA automation application: dataset in, automated analysis and visualisation out. I am adding verified technical detail from the original codebase rather than reconstructing it from memory.",
    architecture:
      "Detailed implementation notes are being documented from the hackathon codebase; the verified facts presented here are the application's purpose and its hackathon result.",
    challenges:
      "Hackathon constraint: a working end-to-end product inside a fixed, short build window, with a live demonstration at the end.",
    results: "First Position — Modern College of Engineering hackathon, with Team Alpha.",
    limitations: "Hackathon-built product; production hardening was out of scope for the event.",
    future: "Document the full technical write-up and extend the automation depth.",
    contribution: "Built with Team Alpha at a Modern College of Engineering hackathon, where it placed First Position.",
    featureStatus: [
      { feature: "Automated EDA workflow", state: "Built at hackathon" },
      { feature: "First Position, Modern College of Engineering hackathon", state: "Won with Team Alpha" },
    ],
  },
  {
    slug: "sentiment-stock",
    title: "Sentiment Impact on Stock Market",
    tagline: "Can trader sentiment move a prediction? An AI stock-movement study.",
    category: "Data Science",
    status: "completed",
    team: "Solo project",
    stack: ["Python", "FinBERT (Transformers)", "XGBoost", "Scikit-learn", "yfinance", "Streamlit"],
    githubUrl: "https://github.com/shivvdev08-analyst/sentiment-stock-predictor",
    simpleSummary:
      "This project asks whether the mood of traders online says anything about where a stock goes next. It reads trader tweets with FinBERT, scores their sentiment, and feeds that signal into a machine-learning model that predicts UP or DOWN movement — shown in an interactive dashboard.",
    problem:
      "Market movement is influenced by collective sentiment, but that signal is buried in unstructured social text. The project tests a full pipeline from raw tweets to a directional prediction.",
    objectives: [
      "Extract sentiment from trader tweets using FinBERT",
      "Combine sentiment scores with historical market data (Yahoo Finance)",
      "Train an XGBoost model to predict UP/DOWN stock movement",
      "Present predictions in an interactive Streamlit dashboard",
    ],
    implementation:
      "Implemented exactly as documented in the public repository: FinBERT-based sentiment scoring of trader tweets, XGBoost prediction over sentiment + historical price data sourced via yfinance, and a Streamlit dashboard for interaction.",
    architecture:
      "Pipeline (from the repository README): Trader tweets → FinBERT sentiment analysis → sentiment score → XGBoost stock-prediction model with historical data from Yahoo Finance → Streamlit prediction dashboard.",
    challenges:
      "Social sentiment is noisy and sarcasm-prone; aligning tweet timing with market data without leakage is the subtle part of the pipeline.",
    results:
      "The repository documents the working pipeline and dashboard. I present this as a learning/research project — not as investment advice or a proven trading system.",
    limitations: "Sentiment signals are weak and noisy predictors; no profitability claims are made.",
    future: "Broader data sources and stricter out-of-sample evaluation.",
    contribution: "Independent data science project.",
    featureStatus: [
      { feature: "FinBERT sentiment analysis of trader tweets", state: "Implemented" },
      { feature: "XGBoost UP/DOWN prediction", state: "Implemented" },
      { feature: "Streamlit dashboard", state: "Implemented" },
    ],
  },
  {
    slug: "alertx",
    title: "AlertX",
    tagline: "An independent project — full case study being documented.",
    category: "Software",
    status: "documenting",
    team: "Solo project",
    stack: [],
    githubUrl: "https://github.com/shivvdev08-analyst/AlertX",
    simpleSummary:
      "AlertX is one of my independent projects, published on GitHub. I am documenting its full case study — purpose, stack and outcomes — from the codebase before presenting detailed claims here.",
    problem:
      "Being documented from the repository. I would rather show an honest placeholder than guess at features.",
    objectives: ["Publish a verified case study from the source repository"],
    implementation:
      "The public repository exists on GitHub (linked below) but currently ships without a README, so verified technical detail will be added once documented.",
    architecture: "To be documented from the repository.",
    challenges: "",
    results: "",
    limitations: "",
    future: "Complete the case study from the codebase.",
    contribution: "Independent project.",
    featureStatus: [
      { feature: "Repository published on GitHub", state: "Done" },
      { feature: "Verified case study", state: "In documentation" },
    ],
  },
];

export const memories = [
  {
    title: "Data4Viz — First Position at the Hackathon",
    category: "Academic",
    caption:
      "Data4Viz — the AI-powered exploratory data analysis automation app I built with Team Alpha — won First Position at a Modern College of Engineering hackathon.",
    tags: ["Hackathon", "Data4Viz", "Team Alpha", "Winner"],
    featured: true,
  },
];

export const seo = {
  siteTitle: "Shivam Vinod Chaudhari — Aspiring AI Engineer & Full-Stack Developer",
  description:
    "Portfolio of Shivam Vinod Chaudhari: AI engineer in the making. Projects in document intelligence (VERITAS), LLM evaluation (SafeGen AI), personal AI (ASTRA) and data science.",
  keywords: "AI Engineer, Machine Learning, Data Science, Full-Stack Developer, Pune",
};

export const themes = [
  { id: "aurora", name: "Aurora", hint: "teal · violet · emerald" },
  { id: "verdant", name: "Verdant", hint: "green · lime" },
  { id: "solar", name: "Solar Forge", hint: "amber · orange" },
  { id: "ultraviolet", name: "Ultraviolet", hint: "violet · fuchsia" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
