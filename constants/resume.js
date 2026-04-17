const defaultResumeData = {
  config: {
    theme: "professional-blue",
    showProfilePictures: true,
    displayOrder: ["summary", "experience", "projects", "skills", "education"]
  },
  basics: {
    name: "Bazil Suhail",
    label: "Senior Frontend Engineer",
    email: "bazilsuhail@email.com",
    phone: "+1-202-555-0143",
    summary: "Full-stack developer with 8+ years of experience specializing in high-performance web applications and design systems.",
    location: {
      city: "San Francisco",
      region: "CA",
      country: "USA"
    },
    links: [
      { label: "Portfolio", url: "https://bazilsuhail.netlify.app/", icon: "globe" },
      { label: "GitHub", url: "http://github.com/BazilSuhail", icon: "github" },
      { label: "LinkedIn", url: "https://linkedin.com/in/bazil-suhail", icon: "linkedin" }
    ]
  },
  experience: [
    {
      company: "TechStream Inc.",
      location: "Remote",
      url: "https://techstream.io",
      roles: [
        {
          title: "Staff Engineer",
          startDate: "2021-03",
          endDate: null,
          isCurrent: true,
          highlights: [
            "Migrated a monolith architecture to micro-frontends using Module Federation.",
            "Led a team of 12 developers to deliver a cross-platform mobile app.",
            "Optimized CI/CD pipelines, reducing deployment time by 50%."
          ]
        },
        {
          title: "Senior Developer",
          startDate: "2018-06",
          endDate: "2021-02",
          isCurrent: false,
          highlights: [
            "Developed an internal UI kit used by 40+ internal teams.",
            "Mentored 4 junior engineers into mid-level roles."
          ]
        }
      ]
    }
  ],
  projects: [
    {
      name: "Omni-Editor",
      description: "A collaborative markdown editor with real-time sync capabilities.",
      startDate: "2023-01",
      endDate: "2023-05",
      keywords: ["WebSockets", "React", "Yjs", "ProseMirror"],
      links: [
        { label: "Source", url: "https://github.com/arivera/omni" },
        { label: "Live Demo", url: "https://omni-editor.app" }
      ],
      highlights: [
        "Implemented CRDTs for conflict-free concurrent editing.",
        "Scaled backend to support 5,000+ concurrent users via Redis."
      ]
    },
    {
      "name": "Aura-Market",
      "description": "A hyper-personalized e-commerce platform featuring AI-driven product recommendations.",
      "startDate": "2024-02",
      "endDate": "2024-08",
      "keywords": ["Next.js", "MongoDB", "OpenAI API", "Stripe", "Tailwind CSS"],
      "links": [
        { "label": "Source", "url": "https://github.com/arivera/aura-market" },
        { "label": "Live Demo", "url": "https://aura-market.io" }
      ],
      "highlights": [
        "Integrated OpenAI to generate dynamic, user-specific product descriptions and shopping guides.",
        "Built a secure checkout flow using Stripe, supporting multi-currency and global tax compliance.",
        "Optimized frontend performance, achieving a 98/100 Lighthouse performance score via Next.js SSR."
      ]
    },
    {
      "name": "VitalPath",
      "description": "A cross-platform mobile app for real-time health monitoring and automated workout generation.",
      "startDate": "2024-09",
      "endDate": "2025-01",
      "keywords": ["Flutter", "Firebase", "TensorFlow Lite", "HealthKit", "Google Fit"],
      "links": [
        { "label": "App Store", "url": "https://apps.apple.com/vitalpath" },
        { "label": "Play Store", "url": "https://play.google.com/vitalpath" }
      ],
      "highlights": [
        "Utilized TensorFlow Lite for on-device pose estimation to track exercise form in real-time.",
        "Synchronized health data across iOS and Android using HealthKit and Google Fit APIs.",
        "Implemented background push notifications via Firebase Cloud Messaging to increase user retention by 25%."
      ]
    }
  ],
  skills: [
    {
      category: "Frontend",
      keywords: ["React", "TypeScript", "Next.js", "Redux", "SCSS", "Canvas API"]
    },
    {
      category: "Backend",
      keywords: ["Node.js", "PostgreSQL", "GraphQL", "Python", "Redis"]
    },
    {
      category: "DevOps & Tools",
      keywords: ["Docker", "AWS (EC2, S3)", "GitHub Actions", "Vercel"]
    }
  ],
  education: [
    {
      institution: "Georgia Institute of Technology",
      area: "Computer Science",
      studyType: "Master of Science",
      startDate: "2019",
      endDate: "2021",
      score: "4.0 GPA",
      courses: ["Advanced Algorithms", "Machine Learning"]
    },
    {
      institution: "State University",
      area: "Software Engineering",
      studyType: "Bachelor of Science",
      startDate: "2014",
      endDate: "2018",
      score: "3.8 GPA"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022-11",
      url: "https://aws.amazon.com/verification"
    }
  ],
  languages: [
    { language: "English", fluency: "Native" },
    { language: "Spanish", fluency: "Professional Working" }
  ]
};

export default defaultResumeData;
