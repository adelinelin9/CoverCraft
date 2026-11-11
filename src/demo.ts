import type { ExperienceRecommendation, GenerateResult } from './types'

export const DEMO_RESUME = `Jane Smith
jane.smith@email.com | (555) 123-4567 | linkedin.com/in/janesmith | github.com/janesmith

EDUCATION
University of Utah, Bachelor of Science in Computer Science, GPA: 3.7
Expected Graduation: May 2025

EXPERIENCE
Software Engineering Intern — Lucid Software, Summer 2024
• Built a real-time collaboration feature using WebSockets, reducing document sync latency by 40%
• Collaborated with designers to implement accessible UI components in React
• Wrote unit and integration tests achieving 90% code coverage for new features

Teaching Assistant — University of Utah CS Department, Fall 2023–Present
• Led weekly lab sessions for 30+ students in Algorithms and Data Structures
• Created supplemental learning materials that improved average assignment scores by 15%

Web Development Freelance, 2022–Present
• Designed and built 5 client websites using React, TypeScript, and Tailwind CSS
• Maintained ongoing client relationships and iterated on features based on feedback

PROJECTS
Budget Buddy — Personal Finance App
• Full-stack web app using React, Node.js, and PostgreSQL to help users track expenses
• Implemented data visualizations with Chart.js; 200+ active users

Campus Events Platform
• Led a team of 4 to build an event discovery app serving the university campus
• Integrated Google Maps API for location-based event search

SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frameworks: React, Node.js, Express, Tailwind CSS
Tools: Git, Figma, AWS (S3, Lambda), Docker`

export const DEMO_JOB = `Software Engineer — New Grad
Acme Technologies, Salt Lake City, UT (Hybrid)

About the Role
We're looking for a motivated new graduate to join our frontend engineering team. You'll work on our customer-facing web platform used by thousands of businesses daily.

Responsibilities
• Build and maintain React-based web applications
• Collaborate closely with product designers and backend engineers
• Write clean, testable, well-documented code
• Participate in code reviews and contribute to team standards
• Help improve performance, accessibility, and user experience

Requirements
• BS in Computer Science or related field (or equivalent experience)
• Strong knowledge of JavaScript/TypeScript and React
• Familiarity with modern frontend tooling (Vite, webpack, etc.)
• Experience writing tests (unit, integration)
• Good communication and teamwork skills

Nice to Have
• Experience with real-time features (WebSockets, etc.)
• Familiarity with design tools like Figma
• Open source contributions or personal projects
• Experience mentoring or teaching others

Compensation
$95,000–$115,000 base salary + equity + benefits`

export const DEMO_RECOMMENDATIONS: ExperienceRecommendation[] = [
  {
    id: 'rec-1',
    title: 'React & TypeScript Frontend Development',
    skill: 'JavaScript, TypeScript, React, Tailwind CSS',
    explanation:
      'Your freelance projects and internship demonstrate hands-on React and TypeScript experience building real products—exactly what this role requires for their customer-facing platform.',
  },
  {
    id: 'rec-2',
    title: 'Real-Time Features with WebSockets',
    skill: 'WebSockets, real-time collaboration',
    explanation:
      'At Lucid Software you built a WebSocket-based collaboration feature that cut sync latency by 40%. The job listing specifically mentions real-time features as a nice-to-have.',
  },
  {
    id: 'rec-3',
    title: 'Testing & Code Quality',
    skill: 'Unit testing, integration testing, 90% code coverage',
    explanation:
      'You achieved 90% code coverage during your internship. The role asks for engineers who write clean, testable code—this directly addresses that requirement.',
  },
  {
    id: 'rec-4',
    title: 'Cross-Functional Collaboration',
    skill: 'Collaboration with designers and backend engineers',
    explanation:
      'Working alongside designers at Lucid and communicating with freelance clients shows you can operate in a cross-functional team, which the job description emphasizes.',
  },
  {
    id: 'rec-5',
    title: 'Teaching & Communication',
    skill: 'Technical communication, mentoring',
    explanation:
      'As a TA you explained complex algorithms to 30+ students and improved outcomes. The role values good communication, and this background signals you can contribute to team knowledge-sharing.',
  },
]

export const DEMO_COVER_LETTER = `Dear Hiring Team,

I am excited to apply for the Software Engineer — New Grad position at Acme Technologies. Your focus on building a high-quality, customer-facing web platform aligns perfectly with the kind of work I most enjoy: crafting React applications that are fast, accessible, and genuinely useful to real people.

During my internship at Lucid Software, I built a real-time collaboration feature using WebSockets that reduced document sync latency by 40%. I also worked directly with designers to ship accessible UI components, which gave me a strong appreciation for cross-functional collaboration—exactly the dynamic your team describes. Beyond the internship, I have independently designed and delivered five client websites using React, TypeScript, and Tailwind CSS, which taught me how to manage stakeholder relationships alongside the technical work.

What draws me most to Acme is the scale and visibility of your platform. I want my work to matter to real users, and knowing that thousands of businesses depend on what your team builds every day is genuinely motivating. I believe my background in real-time systems, frontend testing (90% code coverage during my internship), and explaining technical concepts clearly—as a university TA for Algorithms and Data Structures—gives me a solid foundation to contribute meaningfully from day one.

I would love the opportunity to bring these experiences to your team. Thank you for your time and consideration.

Sincerely,
Jane Smith`

export const DEMO_SUGGESTIONS: GenerateResult['suggestions'] = [
  'Consider adding a specific metric from your freelance work (e.g., client retention rate or project delivery times) to strengthen the credibility of that paragraph.',
  'The phrase "genuinely motivating" in the second-to-last paragraph could be made more specific—mention one concrete thing about Acme\'s product that excites you.',
  'You could briefly mention your Budget Buddy project to reinforce your full-stack instincts, especially since the role works with backend engineers.',
]
