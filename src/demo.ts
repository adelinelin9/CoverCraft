import type { ExperienceRecommendation, QuestionnaireAnswers } from './types'

export interface DemoScenario {
  id: string
  title: string
  subtitle: string
  iconKey: 'cs' | 'marketing' | 'healthcare'
  resume: string
  jobDescription: string
  recommendations: ExperienceRecommendation[]
  questionnaire: QuestionnaireAnswers
  coverLetter: string
  suggestions: string[]
}

// --- Scenario 1: Computer Science -------------------------------------------

const CS_SCENARIO: DemoScenario = {
  id: 'cs',
  title: 'Computer Science',
  subtitle: 'Software Engineering Internship',
  iconKey: 'cs',

  resume: `Jane Smith
jane.smith@email.com | (555) 123-4567 | linkedin.com/in/janesmith | github.com/janesmith

EDUCATION
University of Utah, Bachelor of Science in Computer Science, GPA: 3.7
Expected Graduation: May 2025

EXPERIENCE
Software Engineering Intern - Lucid Software, Summer 2024
- Built a real-time collaboration feature using WebSockets, reducing document sync latency by 40%
- Collaborated with designers to implement accessible UI components in React
- Wrote unit and integration tests achieving 90% code coverage for new features

Teaching Assistant - University of Utah CS Department, Fall 2023-Present
- Led weekly lab sessions for 30+ students in Algorithms and Data Structures
- Created supplemental learning materials that improved average assignment scores by 15%

Web Development Freelance, 2022-Present
- Designed and built 5 client websites using React, TypeScript, and Tailwind CSS
- Maintained ongoing client relationships and iterated on features based on feedback

PROJECTS
Budget Buddy - Personal Finance App
- Full-stack web app using React, Node.js, and PostgreSQL to help users track expenses
- Implemented data visualizations with Chart.js; 200+ active users

Campus Events Platform
- Led a team of 4 to build an event discovery app serving the university campus
- Integrated Google Maps API for location-based event search

SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frameworks: React, Node.js, Express, Tailwind CSS
Tools: Git, Figma, AWS (S3, Lambda), Docker`,

  jobDescription: `Software Engineer - New Grad
Acme Technologies, Salt Lake City, UT (Hybrid)

About the Role
We're looking for a motivated new graduate to join our frontend engineering team. You'll work on our customer-facing web platform used by thousands of businesses daily.

Responsibilities
- Build and maintain React-based web applications
- Collaborate closely with product designers and backend engineers
- Write clean, testable, well-documented code
- Participate in code reviews and contribute to team standards
- Help improve performance, accessibility, and user experience

Requirements
- BS in Computer Science or related field (or equivalent experience)
- Strong knowledge of JavaScript/TypeScript and React
- Familiarity with modern frontend tooling (Vite, webpack, etc.)
- Experience writing tests (unit, integration)
- Good communication and teamwork skills

Nice to Have
- Experience with real-time features (WebSockets, etc.)
- Familiarity with design tools like Figma
- Open source contributions or personal projects
- Experience mentoring or teaching others

Compensation
$95,000-$115,000 base salary + equity + benefits`,

  recommendations: [
    {
      id: 'rec-1',
      title: 'React & TypeScript Frontend Development',
      skill: 'JavaScript, TypeScript, React, Tailwind CSS',
      explanation:
        "Your freelance projects and internship demonstrate hands-on React and TypeScript experience building real products -- exactly what this role requires for their customer-facing platform.",
    },
    {
      id: 'rec-2',
      title: 'Real-Time Features with WebSockets',
      skill: 'WebSockets, real-time collaboration',
      explanation:
        "At Lucid Software you built a WebSocket-based collaboration feature that cut sync latency by 40%. The job listing specifically mentions real-time features as a nice-to-have.",
    },
    {
      id: 'rec-3',
      title: 'Testing & Code Quality',
      skill: 'Unit testing, integration testing, 90% code coverage',
      explanation:
        "You achieved 90% code coverage during your internship. The role asks for engineers who write clean, testable code -- this directly addresses that requirement.",
    },
    {
      id: 'rec-4',
      title: 'Cross-Functional Collaboration',
      skill: 'Collaboration with designers and backend engineers',
      explanation:
        "Working alongside designers at Lucid and communicating with freelance clients shows you can operate in a cross-functional team, which the job description emphasizes.",
    },
    {
      id: 'rec-5',
      title: 'Teaching & Communication',
      skill: 'Technical communication, mentoring',
      explanation:
        "As a TA you explained complex algorithms to 30+ students and improved outcomes. The role values good communication, and this background signals you can contribute to team knowledge-sharing.",
    },
  ],

  questionnaire: {
    interest:
      "I'm drawn to Acme's focus on building tools that real businesses depend on every day -- I want my work to have direct impact on users, not just internal dashboards.",
    strengths:
      "My WebSocket collaboration feature at Lucid that cut sync latency by 40% -- I'd love that to anchor the letter.",
    accomplishmentImpact:
      "Reduced document sync latency by 40%; also helped onboard two new engineers to the codebase during that project.",
    additionalInfo: "I'm graduating in May and am available to start full-time in June.",
  },

  coverLetter: `Dear Hiring Team,

I am excited to apply for the Software Engineer -- New Grad position at Acme Technologies. Your focus on building a high-quality, customer-facing web platform aligns perfectly with the kind of work I most enjoy: crafting React applications that are fast, accessible, and genuinely useful to real people.

During my internship at Lucid Software, I built a real-time collaboration feature using WebSockets that reduced document sync latency by 40%. I also worked directly with designers to ship accessible UI components, which gave me a strong appreciation for cross-functional collaboration -- exactly the dynamic your team describes. Beyond the internship, I have independently designed and delivered five client websites using React, TypeScript, and Tailwind CSS, which taught me how to manage stakeholder relationships alongside the technical work.

What draws me most to Acme is the scale and visibility of your platform. I want my work to matter to real users, and knowing that thousands of businesses depend on what your team builds every day is genuinely motivating. I believe my background in real-time systems, frontend testing (90% code coverage during my internship), and explaining technical concepts clearly -- as a university TA for Algorithms and Data Structures -- gives me a solid foundation to contribute meaningfully from day one.

I would love the opportunity to bring these experiences to your team. Thank you for your time and consideration.

Sincerely,
Jane Smith`,

  suggestions: [
    "Consider adding a specific metric from your freelance work (e.g., client retention rate or project delivery times) to strengthen the credibility of that paragraph.",
    "The word \"genuinely motivating\" could be made more specific -- mention one concrete thing about Acme's product or mission that excites you.",
    "You could briefly mention your Budget Buddy project to reinforce your full-stack instincts, especially since the role works closely with backend engineers.",
  ],
}

// --- Scenario 2: Business / Marketing ---------------------------------------

const MARKETING_SCENARIO: DemoScenario = {
  id: 'marketing',
  title: 'Business / Marketing',
  subtitle: 'Marketing Internship',
  iconKey: 'marketing',

  resume: `Alex Rivera
alex.rivera@email.com | (602) 555-0192 | linkedin.com/in/alexrivera

EDUCATION
University of Arizona, Bachelor of Science in Marketing, minor in Communications, GPA: 3.5
Expected Graduation: May 2025

EXPERIENCE
Social Media Marketing Intern - SunState Agency, Summer 2024
- Managed Instagram, TikTok, and Pinterest for 5 consumer brands simultaneously
- Grew a food & beverage client's Instagram from 2,100 to 8,400 followers in 10 weeks through A/B content testing and strategic posting cadences
- Produced weekly performance reports in Google Analytics and Hootsuite; insights led to a 22% reallocation of paid budget toward higher-performing content

Brand Ambassador - Campus Life Beverages, Aug 2023-May 2024
- Represented the brand at 20+ campus events, driving product sampling and social engagement
- Coordinated with the regional marketing team to align campus messaging with national campaigns

Marketing Director - AZ Marketing Association (Student Org), Fall 2022-Spring 2024
- Led a team of 8 to plan and execute 15 events, including a 200-person industry networking night
- Redesigned the club's Mailchimp email newsletter; open rate improved from 18% to 34%

PROJECTS
Verde Naturals Brand Campaign (Marketing Capstone)
- Developed a full go-to-market campaign for a sustainable CPG brand, including target personas, media mix, messaging framework, and a $50,000 mock media budget
- Presented to 3 industry professionals; received "Best in Class" designation

Personal Marketing Blog
- Publish biweekly articles on digital marketing trends; 1,400+ monthly readers

SKILLS
Platforms: Google Analytics, Hootsuite, Mailchimp, Sprout Social, Meta Ads Manager
Creative: Canva, Adobe Photoshop (intermediate)
Other: SEO fundamentals, A/B testing, email marketing, copywriting`,

  jobDescription: `Marketing Intern
Brightfield Consumer Goods, Scottsdale, AZ (Hybrid)

About Brightfield
Brightfield Consumer Goods is a mid-size CPG company behind three fast-growing natural snack brands sold in Whole Foods, Target, and regional grocery chains nationwide. We're looking for a Marketing Intern to support our brand marketing and digital teams this summer.

Responsibilities
- Assist in creating and scheduling social media content for our brand accounts
- Support campaign planning and execution across digital channels
- Analyze campaign performance using Google Analytics and Meta Ads Manager
- Help maintain our content calendar and asset library
- Contribute to brainstorming sessions for new campaigns and product launches
- Coordinate with creative and retail teams on upcoming activations

Requirements
- Pursuing a degree in Marketing, Communications, Business, or related field
- Familiarity with social media platforms (Instagram, TikTok, Pinterest)
- Strong written communication and copywriting skills
- Attention to detail and ability to manage multiple projects

Nice to Have
- Experience with analytics tools (Google Analytics, Meta Ads Manager)
- Experience with Canva or Adobe Creative Suite
- Prior internship or brand ambassador experience
- Passion for the natural food/CPG space

Compensation: $18-$20/hr, hybrid (Scottsdale, AZ)`,

  recommendations: [
    {
      id: 'rec-1',
      title: 'Social Media Growth & Content Strategy',
      skill: 'Instagram, TikTok, Pinterest, A/B testing',
      explanation:
        "At SunState you grew a food client's Instagram 4x in 10 weeks using A/B content testing -- directly relevant to Brightfield's social content work across the same platforms.",
    },
    {
      id: 'rec-2',
      title: 'Marketing Analytics & Performance Reporting',
      skill: 'Google Analytics, Hootsuite, Meta Ads Manager',
      explanation:
        "Your weekly analytics reports at SunState informed real budget decisions. Brightfield asks for analytics experience, and you have hands-on work with the exact tools they listed.",
    },
    {
      id: 'rec-3',
      title: 'CPG Brand Campaign Development',
      skill: 'Campaign strategy, go-to-market planning, media mix',
      explanation:
        "Your Verde Naturals capstone produced a complete go-to-market plan for a sustainable CPG brand -- the same industry and challenge Brightfield operates in every day.",
    },
    {
      id: 'rec-4',
      title: 'Email Marketing & Audience Engagement',
      skill: 'Mailchimp, email strategy, open-rate optimization',
      explanation:
        "You improved your student org's newsletter open rate from 18% to 34% by redesigning the Mailchimp setup -- a concrete result that maps directly to Brightfield's digital channel work.",
    },
    {
      id: 'rec-5',
      title: 'Brand Ambassador & Event Activation',
      skill: 'Field marketing, event coordination, campus activation',
      explanation:
        "Representing Campus Life Beverages at 20+ events and coordinating with a regional team shows you can execute brand activations independently -- a core part of Brightfield's internship.",
    },
  ],

  questionnaire: {
    interest:
      "I love that Brightfield is in the natural food space -- it's a category I personally believe in and have researched for my capstone. I want to work on brands where the product actually matters.",
    strengths:
      "Growing a food client's Instagram from 2,100 to 8,400 followers in 10 weeks at SunState. That felt like real proof of what a focused content strategy can do.",
    accomplishmentImpact:
      "4x follower growth in 10 weeks; the content insights I surfaced also led the account team to reallocate 22% of paid budget toward Reels.",
    additionalInfo: "Available for a full-time summer internship starting May 20.",
  },

  coverLetter: `To the Brightfield Marketing Team,

Working at a company where the products genuinely matter to people -- where the snacks on the shelf reflect a real commitment to quality -- is exactly the kind of environment I've been building toward. I'd love to bring my background in social media strategy, campaign analytics, and brand content to Brightfield as a Marketing Intern this summer.

During my internship at SunState Agency, I managed social media for five consumer brands simultaneously, running A/B content tests and producing weekly analytics reports that helped the team reallocate budget toward higher-performing channels. One highlight: I grew a food and beverage client's Instagram following from 2,100 to 8,400 in ten weeks -- a result I'm proud of because it came from strategy, not just activity. That work also surfaced data that shifted 22% of their paid spend toward Reels, which outperformed static posts by a wide margin.

Outside the internship, I redesigned our student marketing club's Mailchimp newsletter, bringing the open rate from 18% to 34%, and completed a full go-to-market campaign for a sustainable CPG brand as my capstone project. That project pushed me to think holistically about brand positioning, media mix, and consumer personas in a way that feels directly relevant to what Brightfield does every day.

I'm eager to contribute to a team building brands I believe in. Thank you for your consideration -- I'd welcome the chance to talk.

Best,
Alex Rivera`,

  suggestions: [
    "Add a specific detail about one of Brightfield's brands or products to personalize the opening -- showing you've researched what they actually sell will stand out.",
    "The Instagram growth stat is strong -- consider briefly naming the content format that drove it (e.g., 'Reels-first posting cadence') to give the hiring team a clearer picture of your strategy.",
    "Connect the Verde Naturals capstone more explicitly to CPG retail -- mentioning that your mock plan included a retail activation or distribution strategy would resonate with a company selling in Whole Foods and Target.",
  ],
}

// --- Scenario 3: Healthcare / Public Health ----------------------------------

const HEALTHCARE_SCENARIO: DemoScenario = {
  id: 'healthcare',
  title: 'Healthcare / Public Health',
  subtitle: 'Public Health Internship',
  iconKey: 'healthcare',

  resume: `Jordan Patel
jordan.patel@email.com | (703) 555-0847 | linkedin.com/in/jordanpatel

EDUCATION
George Mason University, Bachelor of Science in Public Health, concentration in Community Health Education, GPA: 3.6
Expected Graduation: May 2025
Bilingual: English / Spanish

EXPERIENCE
Public Health Research Assistant - GMU Department of Health Administration, Fall 2023-Present
- Assist faculty on a federally funded study examining barriers to preventive care in underserved communities
- Conducted 40+ structured interviews, managed data entry in REDCap, and contributed to a literature review on vaccine hesitancy
- Co-authored a poster presented at the Virginia Public Health Association annual conference

Health Education Volunteer - Fairfax County Community Clinic, Jan 2023-Present
- Facilitate biweekly bilingual (English/Spanish) nutrition and preventive care workshops for 15-25 participants
- Developed English and Spanish patient education materials now used by 3 county clinics
- Support intake staff and connect patients with community resources and social services

Intern - Fairfax County Department of Health, Summer 2023
- Assisted with the county's Community Health Needs Assessment (CHNA)
- Cleaned and analyzed survey data in Excel and SPSS; contributed to a summary report presented to the health department director
- Coordinated outreach to 12 community organizations to distribute the community survey

PROJECTS
Senior Thesis: "Understanding Vaccine Hesitancy in Rural Virginia Communities"
- Qualitative analysis of 25 in-depth interviews; identified 4 key hesitancy themes
- Received departmental distinction

Campus Wellness Campaign: Smoke-Free GMU
- Led a semester-long peer education campaign on tobacco cessation
- Reached 800+ students through tabling, social media, and classroom presentations

SKILLS
Data & Research: REDCap, SPSS, Microsoft Excel, survey design, literature review
Communication: bilingual English/Spanish, health education, motivational interviewing
Other: community outreach, needs assessment, program planning`,

  jobDescription: `Public Health Intern
Meridian Community Health, Northern Virginia (In-Person)

About Meridian
Meridian Community Health is a nonprofit federally qualified health center (FQHC) serving uninsured and underinsured patients across Northern Virginia. We provide primary care, behavioral health, dental, and community health education services to over 18,000 patients annually.

Role Overview
We're seeking a Public Health Intern to support our Community Health Education team this summer. You'll gain hands-on experience in program delivery, community outreach, and health data collection.

Responsibilities
- Assist in planning and delivering community health education workshops
- Support data collection and entry for ongoing program evaluations
- Help develop patient education materials and community outreach content
- Participate in health fairs and community outreach events
- Coordinate with partner organizations on referral networks and resource sharing
- Contribute to grant reporting and program documentation

Requirements
- Enrolled in a public health, health education, community health, or related program
- Strong written and verbal communication skills
- Experience with data collection or community outreach preferred
- Passion for health equity and serving underserved communities

Strongly Preferred
- Bilingual English/Spanish
- Experience with REDCap or similar data tools
- Prior work in a clinical or community health setting

Compensation: $17/hr, in-person (Northern Virginia)`,

  recommendations: [
    {
      id: 'rec-1',
      title: 'Bilingual Community Health Education',
      skill: 'English/Spanish, health education workshops, patient materials',
      explanation:
        "You facilitate bilingual workshops at a county clinic and developed education materials now used by three clinics -- Meridian lists bilingual English/Spanish as strongly preferred and health education delivery as a core responsibility.",
    },
    {
      id: 'rec-2',
      title: 'Public Health Research & Data Skills',
      skill: 'REDCap, SPSS, survey data, literature review',
      explanation:
        "Your research assistant role uses REDCap and your CHNA internship involved SPSS data cleaning and analysis. The job lists REDCap as strongly preferred and program evaluation data as a key duty.",
    },
    {
      id: 'rec-3',
      title: 'Community Needs Assessment Experience',
      skill: 'Community Health Needs Assessment, outreach coordination',
      explanation:
        "At Fairfax County you worked directly on a CHNA -- coordinating outreach to 12 organizations and contributing to the director's summary report. This is exactly the kind of work Meridian's internship involves.",
    },
    {
      id: 'rec-4',
      title: 'Peer Health Education & Awareness Campaigns',
      skill: 'Peer education, tobacco cessation, campus outreach',
      explanation:
        "Your Smoke-Free GMU campaign reached 800+ students across multiple channels. This demonstrates the community engagement and program delivery skills Meridian is looking for.",
    },
    {
      id: 'rec-5',
      title: 'Patient Resource Navigation & Clinic Support',
      skill: 'Social services coordination, clinic volunteer, intake support',
      explanation:
        "Volunteering at the community clinic -- connecting patients to resources and supporting intake staff -- mirrors Meridian's partner referral network and care coordination responsibilities.",
    },
  ],

  questionnaire: {
    interest:
      "Meridian's model -- serving patients who have nowhere else to go -- is exactly the kind of mission-driven environment I want to contribute to. Health equity isn't a concept I read about; it's something I've seen up close.",
    strengths:
      "Developing the bilingual patient education materials now used by three county clinics. That felt like work that outlasts a single shift.",
    accomplishmentImpact:
      "The materials are actively used by 3 clinics across the county; the clinic coordinator told me Spanish-speaking patients found them significantly easier to understand.",
    additionalInfo: "Bilingual in English and Spanish. Available full-time starting June 2.",
  },

  coverLetter: `Dear Meridian Community Health Team,

Health equity isn't a concept I read about in textbooks -- it's something I've seen up close through years of community health work, and it's the reason I want to spend this summer at Meridian.

As a research assistant at George Mason University, I've spent the past year on a federally funded study examining barriers to preventive care in underserved communities -- conducting structured interviews, managing data in REDCap, and contributing to work that will ultimately inform intervention design. That experience, combined with my volunteer role at a Fairfax County community clinic where I facilitate bilingual nutrition and preventive care workshops for 15-25 participants each session, has given me a foundation I'm eager to build on.

One thing I'm especially proud of is developing English and Spanish patient education materials now used by three county clinics. The clinic coordinator shared that Spanish-speaking patients found them significantly easier to understand than what had been used before. Creating accessible resources for Spanish-speaking patients matters to me personally, and I know bilingual capacity is something Meridian actively prioritizes.

I'm drawn to Meridian because of your FQHC model and genuine commitment to patients who often have nowhere else to go. I want to do work that closes gaps rather than documents them, and I believe this internship is the right place to do that.

Thank you for your time. I'd be glad to talk further.

Sincerely,
Jordan Patel`,

  suggestions: [
    "Add a specific outcome from the Fairfax County CHNA internship -- mentioning how many community organizations you surveyed or what the report was ultimately used for would strengthen your data credential.",
    "Consider briefly referencing your senior thesis on vaccine hesitancy -- it speaks directly to Meridian's work with underserved populations and signals research depth beyond coursework.",
    "The phrase 'closes gaps rather than documents them' is memorable -- you could tie it to a specific program area at Meridian (e.g., diabetes education or prenatal outreach) if you know their current focus areas.",
  ],
}

// --- Exports ----------------------------------------------------------------

export const DEMO_SCENARIOS: DemoScenario[] = [
  CS_SCENARIO,
  MARKETING_SCENARIO,
  HEALTHCARE_SCENARIO,
]
