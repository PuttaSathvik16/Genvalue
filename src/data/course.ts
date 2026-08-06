export interface Instructor {
  readonly name: string;
  readonly email: string;
  readonly academy: string;
}

export interface Stat {
  readonly label: string;
  readonly value: string;
}

export interface ToolCategory {
  readonly category: string;
  readonly tools: readonly string[];
  readonly accent: string;
}

export interface WeekSyllabus {
  readonly week: number;
  readonly theme: string;
  readonly topic: string;
  readonly concepts: string;
  readonly toolsUsed: readonly string[];
  readonly assignment: string;
  readonly useCase: string;
}

export interface EvaluationCriteria {
  readonly component: string;
  readonly weight: string;
  readonly description: string;
}

export interface CareerOutcome {
  readonly role: string;
  readonly benefit: string;
  readonly outcome: string;
}

export interface Course {
  readonly title: string;
  readonly subtitle: string;
  readonly duration: string;
  readonly level: string;
  readonly price: string;
  readonly instructor: Instructor;
  readonly stats: readonly Stat[];
  readonly learningObjectives: readonly string[];
  readonly toolCategories: readonly ToolCategory[];
  readonly syllabus: readonly WeekSyllabus[];
  readonly evaluationCriteria: readonly EvaluationCriteria[];
  readonly careerOutcomes: readonly CareerOutcome[];
}

export const course = {
  title: "AI Tools Mastery",
  subtitle: "Choosing the Right AI Tool for Every Professional Task",
  duration: "12 Weeks",
  level: "Beginner to Early Professional",
  price: "Contact for Pricing",
  instructor: {
    name: "Sathvik Putta",
    email: "genvalue.academy@gmail.com",
    academy: "GenValue",
  },
  stats: [
    { label: "Duration", value: "12 Weeks" },
    { label: "Tools", value: "40+" },
    { label: "Categories", value: "11" },
    { label: "Capstone", value: "1" },
  ],
  learningObjectives: [
    "Tool Selection - Judge when to use ChatGPT vs Claude vs Gemini vs specialized tools for any deliverable.",
    "Prompting - Engineer prompts for clarity, consistency, and repeatable professional outputs.",
    "Automation - Chain AI with Zapier, Make, or n8n to eliminate repetitive workflows.",
    "Content - Produce writing, images, video, and audio that matches brand voice and production standards.",
    "Research - Extract insights from papers, reports, and the web using AI search and synthesis tools.",
    "Coding - Ship and debug features faster with Cursor, Copilot, and AI-assisted development workflows.",
    "Career - Present a portfolio of AI-powered projects employers recognize as real-world proof.",
  ],
  toolCategories: [
    {
      category: "General AI Assistants",
      tools: ["ChatGPT", "Claude", "Gemini", "Microsoft Copilot", "Meta AI", "Perplexity"],
      accent: "#2563EB",
    },
    {
      category: "Coding & Development",
      tools: ["Cursor", "GitHub Copilot", "Replit AI", "Devin", "Codeium", "Lovable", "Bolt.new"],
      accent: "#7C3AED",
    },
    {
      category: "Writing & Content",
      tools: ["Jasper", "Copy.ai", "Grammarly", "Notion AI", "Writesonic"],
      accent: "#EC4899",
    },
    {
      category: "Image Generation",
      tools: ["Midjourney", "DALL·E 3", "Adobe Firefly", "Stable Diffusion", "Canva AI"],
      accent: "#F97316",
    },
    {
      category: "Video & Audio",
      tools: ["Sora", "Runway Gen-3", "HeyGen", "Synthesia", "ElevenLabs", "Descript"],
      accent: "#EF4444",
    },
    {
      category: "Research & Search",
      tools: ["Perplexity Pro", "NotebookLM", "Elicit", "Consensus", "Semantic Scholar"],
      accent: "#10B981",
    },
    {
      category: "Productivity",
      tools: ["Notion AI", "Motion", "Gamma", "Otter.ai", "Fathom", "Reclaim AI"],
      accent: "#22D3EE",
    },
    {
      category: "AI Agents & Automation",
      tools: ["Zapier AI", "Make", "n8n", "AutoGPT", "CrewAI", "Lindy AI"],
      accent: "#A855F7",
    },
    {
      category: "Design & UI",
      tools: ["Figma AI", "Framer AI", "Wix AI", "Google Stitch", "Uizard"],
      accent: "#F59E0B",
    },
    {
      category: "Data & Analytics",
      tools: ["Julius AI", "Power BI Copilot", "Tableau AI", "Obviously AI"],
      accent: "#84CC16",
    },
    {
      category: "Marketing & Sales",
      tools: ["Surfer SEO", "AdCreative.ai", "Clay", "HubSpot AI", "Instantly AI"],
      accent: "#06B6D4",
    },
  ],
  syllabus: [
    {
      week: 1,
      theme: "Month 1 - Foundations",
      topic: "AI Tools Landscape & Selection",
      concepts:
        "How foundation models differ · Tool categories · Safety & accuracy · When general vs specialized tools win · Quick comparison frameworks",
      toolsUsed: ["ChatGPT", "Claude", "Gemini", "Perplexity"],
      assignment: "Document your role’s top 10 recurring tasks and match each to an initial tool pick.",
      useCase: "A PM compares assistants for PRDs, roadmaps, and stakeholder emails.",
    },
    {
      week: 2,
      theme: "Month 1 - Foundations",
      topic: "Prompting Fundamentals",
      concepts:
        "Prompt anatomy · System instructions · Chain-of-thought · Few-shot examples · Iteration loops · Evaluating output quality",
      toolsUsed: ["ChatGPT", "Claude", "Gemini"],
      assignment: "Rewrite five weak prompts from your work using a structured template and score improvements.",
      useCase: "A support lead builds reusable prompts for ticket summaries and escalation notes.",
    },
    {
      week: 3,
      theme: "Month 1 - Foundations",
      topic: "Research & Synthesis",
      concepts:
        "AI-native search · Citations & hallucination checks · Long-document synthesis · Literature review workflows",
      toolsUsed: ["Perplexity Pro", "NotebookLM", "Elicit", "Consensus"],
      assignment: "Produce a two-page brief with linked sources on a technical or market topic.",
      useCase: "An analyst compresses 20 papers into an exec summary with verifiable claims.",
    },
    {
      week: 4,
      theme: "Month 1 - Foundations",
      topic: "Writing & Communications",
      concepts:
        "Tone & voice control · Long-form structure · Email & deck copy · Light SEO alignment · Editing passes",
      toolsUsed: ["Jasper", "Copy.ai", "Grammarly", "Writesonic"],
      assignment: "Draft a blog post, three customer emails, and a one-pager; refine with a style guide.",
      useCase: "A founder ships launch-week messaging without a full content team.",
    },
    {
      week: 5,
      theme: "Month 2 - Creative & Technical",
      topic: "Image Generation & Visual Systems",
      concepts:
        "Prompting for composition & style · Brand-safe imagery · Inpainting & variations · Export specs",
      toolsUsed: ["Midjourney", "DALL·E 3", "Adobe Firefly", "Canva AI"],
      assignment: "Create a five-asset visual kit (hero, social, iconography) for a fictional product.",
      useCase: "A freelancer delivers campaign visuals in one afternoon.",
    },
    {
      week: 6,
      theme: "Month 2 - Creative & Technical",
      topic: "Video & Audio Production",
      concepts:
        "Text-to-video pipelines · AI avatars · Voice synthesis · Editing & captions · Multilingual delivery",
      toolsUsed: ["Sora", "HeyGen", "Synthesia", "ElevenLabs", "Descript"],
      assignment: "Produce a 60-second explainer with voiceover, captions, and brand bumpers.",
      useCase: "HR rolls out multilingual onboarding clips without a studio.",
    },
    {
      week: 7,
      theme: "Month 2 - Creative & Technical",
      topic: "Coding with AI",
      concepts:
        "Inline completion vs chat · Prompt-to-app flows · Tests & refactors · Agent-assisted debugging · Ship discipline",
      toolsUsed: ["Cursor", "GitHub Copilot", "Replit AI", "Lovable", "Bolt.new"],
      assignment: "Build and deploy a small web app or internal tool from a written spec.",
      useCase: "A marketer ships a lead-capture page without hand-writing CSS.",
    },
    {
      week: 8,
      theme: "Month 2 - Creative & Technical",
      topic: "Productivity Systems",
      concepts:
        "Notes → actions · Meeting intelligence · Calendar triage · Slide & memo generation · Personal operating system",
      toolsUsed: ["Notion AI", "Motion", "Gamma", "Otter.ai", "Fathom"],
      assignment: "Design a weekly productivity stack diagram and automate one recurring report.",
      useCase: "A consultant automates recap emails and follow-up tasks after calls.",
    },
    {
      week: 9,
      theme: "Month 3 - Advanced & Applied",
      topic: "Data Analysis with AI",
      concepts:
        "Conversational analytics · Chart intent · BI copilots · Storytelling with numbers · Sanity checks",
      toolsUsed: ["Julius AI", "Power BI Copilot", "Tableau AI"],
      assignment: "Analyze a provided dataset: charts, narrative, and three decision recommendations.",
      useCase: "Finance walks leadership through variance drivers with AI-assisted visuals.",
    },
    {
      week: 10,
      theme: "Month 3 - Advanced & Applied",
      topic: "Agents & Automation",
      concepts:
        "Trigger/action design · Multi-step workflows · Error handling · Human-in-the-loop approvals · Cost awareness",
      toolsUsed: ["Zapier AI", "Make", "n8n", "AutoGPT", "CrewAI"],
      assignment: "Automate a real workflow (e.g., lead routing, document routing, alerts).",
      useCase: "Ops connects form → CRM → Slack with AI enrichment in the middle.",
    },
    {
      week: 11,
      theme: "Month 3 - Advanced & Applied",
      topic: "Integrated Workflows & Ethics",
      concepts:
        "Cross-tool orchestration · Role-specific stacks · Privacy & IP · Bias & disclosure · Speed vs quality trade-offs",
      toolsUsed: ["Mixed stack from weeks 1-10"],
      assignment: "Reverse-engineer a published workflow and propose a safer, faster alternative.",
      useCase: "Teams debate governance for customer-facing AI outputs.",
    },
    {
      week: 12,
      theme: "Month 3 - Advanced & Applied",
      topic: "Capstone - Final Project",
      concepts:
        "Scoping · Multi-tool integration · Documentation · Presentation · Portfolio packaging · Peer feedback",
      toolsUsed: ["Student choice - minimum three tools from the course"],
      assignment:
        "Deliver a capstone that solves a real problem: documented stack, artifacts, and live demo.",
      useCase: "Learners present portfolio-grade work to peers and instructor review.",
    },
  ],
  evaluationCriteria: [
    {
      component: "Weekly Application",
      weight: "40%",
      description:
        "Quality of outputs, appropriateness of tool choices, and iteration depth across hands-on work.",
    },
    {
      component: "Assignments",
      weight: "30%",
      description:
        "Completeness, clarity, and demonstration of concepts for each week’s deliverable.",
    },
    {
      component: "Capstone Project",
      weight: "30%",
      description:
        "Problem framing, integration of multiple tools, output polish, and presentation of results.",
    },
  ],
  careerOutcomes: [
    {
      role: "Digital Marketer",
      benefit: "End-to-end AI for copy, creative, SEO, and campaign ops.",
      outcome: "Ship multichannel campaigns faster with measurable lift in output volume.",
    },
    {
      role: "Content Creator",
      benefit: "Scripts, thumbnails, edits, and publishing workflows accelerated by AI.",
      outcome: "Publish on a consistent cadence without burning out on production.",
    },
    {
      role: "Data & BI Analyst",
      benefit: "Chat with data, draft narratives, and automate recurring reporting.",
      outcome: "Deliver stakeholder-ready insights with fewer manual spreadsheet cycles.",
    },
    {
      role: "Software Developer",
      benefit: "AI-assisted coding, reviews, tests, and lightweight prototyping.",
      outcome: "Shorten delivery cycles while keeping code review and security habits intact.",
    },
    {
      role: "Founder / Operator",
      benefit: "MVPs, ops automation, and customer comms without a large team.",
      outcome: "Validate ideas and run daily operations with an AI-augmented workflow.",
    },
    {
      role: "Freelancer / Consultant",
      benefit: "Higher throughput and new premium AI-enhanced service lines.",
      outcome: "Win engagements with faster proposals, demos, and deliverables.",
    },
    {
      role: "Student / Career Switcher",
      benefit: "Portfolio proof across categories employers actually recognize.",
      outcome: "Stand out in interviews with shipped projects, not just course certificates.",
    },
  ],
} as const satisfies Course;
