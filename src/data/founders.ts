import sathvikPortrait from "@/assets/founders/sathvik-putta.png";

export interface Degree {
  level: string;
  field: string;
  institution: string;
  country: string;
  year?: string;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  title: string;
  photo: string;
  bio: string[];
  degrees: Degree[];
  expertise: string[];
  linkedin?: string;
  github?: string;
  email?: string;
}

export const founders: Founder[] = [
  {
    id: "onarjae-bonhometre",
    name: "Onarjae Bonhometre",
    role: "Founder & AI Researcher",
    title: "AI & Agentic AI Educator · MBA (AI Specialization)",
    photo: "/images/founders/RJ_profile.png",
    bio: [
      "Onarjae Bonhometre is the founder of GenValue and an AI researcher focused on practical Artificial Intelligence and Agentic AI applications. Currently pursuing an MBA with an AI Specialization at Sacred Heart University, he combines a strong Information Technology background with hands-on experience to help bridge the gap between AI theory and real-world implementation.",
      "His work emphasizes Large Language Models, AI integration, and making complex AI concepts accessible for learners and professionals alike.",
    ],
    degrees: [
      {
        level: "MBA",
        field: "Artificial Intelligence (AI Specialization)",
        institution: "Sacred Heart University",
        country: "United States",
      },
      {
        level: "Bachelor's Degree",
        field: "Information Technology",
        institution: "Sacred Heart University",
        country: "United States",
      },
    ],
    expertise: [
      "Artificial Intelligence (AI)",
      "Agentic AI",
      "AI Integration",
      "Ethical & Responsible AI",
      "AI Governance",
      "Large Language Models (LLMs)",
    ],
    email: "genvalue.academy@gmail.com",
    linkedin: "https://www.linkedin.com/in/onarjae-bonhometre-03304022a/",
  },
  {
    id: "sathvik-putta",
    name: "Sathvik Putta",
    role: "Co-founder & Instructor",
    title: "AI Tools Educator · Course Architect",
    photo: sathvikPortrait.src,
    bio: [
      "Sathvik Putta is the co-founder of GenValue and instructor of the AI Tools Mastery program. With a deep academic foundation in Computer Science and Artificial Intelligence from the United States, he bridges the gap between cutting-edge AI research and practical real-world application.",
      "His teaching philosophy is simple: AI fluency is a skill, not a talent. Anyone who learns the right frameworks can master any AI tool in their domain.",
      "Sathvik designed the 12-week AI Tools Mastery curriculum from the ground up - built on the tools he uses professionally every day.",
    ],
    degrees: [
      {
        level: "Master of Science",
        field: "Data Science / Artificial Intelligence",
        institution: "University - USA",
        country: "United States",
      },
      {
        level: "Bachelor of Engineering",
        field: "Computer Science & Information Technology",
        institution: "University - India",
        country: "India",
      },
    ],
    expertise: [
      "Prompt Engineering",
      "AI Workflow Design",
      "Tool Selection Frameworks",
      "Course Architecture",
      "Data Science",
      "Machine Learning",
    ],
    linkedin: "https://www.linkedin.com/in/sathvik-putta-7612611a4/",
    github: "https://github.com/PuttaSathvik16",
    email: "genvalue.academy@gmail.com",
  },
  {
    id: "srilakshmi-k",
    name: "Srilakshmi K.",
    role: "Chief Product Officer & Instructor",
    title: "AI/ML Engineer · Generative AI & Healthcare Analytics",
    photo: "/images/founders/srilakshmi_profile.png",
    bio: [
      "Srilakshmi K. serves as the Chief Product Officer and Instructor, bringing expertise in Artificial Intelligence, Machine Learning, and healthcare data analytics. With hands-on experience developing production-grade AI solutions, Retrieval-Augmented Generation (RAG) applications, agentic workflows, and machine learning pipelines, she combines strong technical knowledge with practical implementation.",
      "Her background in AI engineering, data engineering, and enterprise analytics enables her to design scalable AI solutions while mentoring learners in modern AI technologies and real-world applications.",
    ],
    degrees: [
      {
        level: "Master of Science",
        field: "Computer Science",
        institution: "University of Central Missouri",
        country: "United States",
      },
      {
        level: "Bachelor of Technology",
        field: "Information Technology",
        institution: "Sree Vidyanikethan Education Trust",
        country: "India",
      },
    ],
    expertise: [
      "Large Language Models (LLMs)",
      "Retrieval-Augmented Generation (RAG)",
      "Generative AI",
      "AI/ML Engineering",
      "Healthcare Data Analytics",
      "Amazon Web Services (AWS)",
    ],
    linkedin: "https://www.linkedin.com/in/kokantisrilakshmi/",
    github: "https://github.com/srilakshmi-k25",
    email: "genvalue.academy@gmail.com",
  },
  {
    id: "sandhya-l",
    name: "Sandhya L",
    role: "Chief Product Officer & Instructor",
    title: "Senior Business Analyst · Data Science & Business Systems",
    photo: "/images/founders/Sandhya_profile.png",
    bio: [
      "Sandhya L serves as the Chief Product Officer and Instructor, bringing over five years of experience in business analysis, data science, and enterprise technology. She specializes in bridging the gap between business and technology by translating complex requirements into scalable, data-driven solutions.",
      "With expertise in Agile methodologies, SQL, Power BI, business systems analysis, and stakeholder collaboration, she combines analytical thinking with practical implementation to help organizations improve operational efficiency and deliver successful digital transformation initiatives.",
    ],
    degrees: [
      {
        level: "Master's Degree",
        field: "Data Science",
        institution: "University of New Haven",
        country: "United States",
      },
      {
        level: "Bachelor's Degree",
        field: "Computer Science",
        institution: "Guru Nanak Institutions",
        country: "India",
      },
    ],
    expertise: [
      "Business Analysis",
      "Business Systems Analysis",
      "Agile & Scrum",
      "SQL",
      "Microsoft Power BI",
      "Project Management",
    ],
    linkedin: "https://www.linkedin.com/in/sandhyal1/",
    email: "genvalue.academy@gmail.com",
  },
  {
    id: "sujith-putta",
    name: "Sujith Putta",
    role: "Chief Technology Officer & Platform Administrator",
    title: "Generative AI Engineer · Full Stack Developer",
    photo: "/images/founders/sujith-putta.png",
    bio: [
      "Sujith Putta serves as the Chief Technology Officer and Platform Administrator, leading the development and technical operations of the platform. Passionate about Generative AI, Machine Learning, and scalable software systems, he specializes in building AI-powered applications, Retrieval-Augmented Generation (RAG) solutions, multi-agent systems, and modern full-stack web applications.",
      "With a strong focus on innovation, user experience, and platform architecture, he is dedicated to developing reliable AI solutions that solve real-world problems while driving continuous technological advancement.",
    ],
    degrees: [
      {
        level: "Bachelor of Technology",
        field: "Computer Science & Technology",
        institution: "Dayananda Sagar University",
        country: "India",
      },
    ],
    expertise: [
      "Generative AI",
      "Machine Learning",
      "Retrieval-Augmented Generation (RAG)",
      "Multi-Agent Systems",
      "Stable Diffusion",
      "PyTorch",
      "LoRA (Low-Rank Adaptation)",
      "Full Stack Development",
    ],
    linkedin: "https://www.linkedin.com/in/sujith-putta-13257a322/",
    github: "https://github.com/sujithputta02",
    email: "genvalue.academy@gmail.com",
  },
];
