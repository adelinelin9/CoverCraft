# CoverCraft

> AI-assisted cover letter writing — CS 356 Human-Computer Interaction, BYU

CoverCraft is a guided web application that helps job applicants write personalized cover letters. Users paste their resume and a job description, review AI-identified experience matches, answer a short questionnaire, and receive a draft they can edit and copy.

**Live site:** https://adelinelin9.github.io/CoverCraft/

---

## How it works

1. **Your Details** — paste your resume and the job description
2. **Experience Matches** — AI identifies 3–5 relevant experiences from your resume; you choose which to highlight
3. **Personalize** — answer three short questions about your interest in the role
4. **Your Cover Letter** — AI drafts the letter; you edit, refine, and copy it

---

## Running locally

### Prerequisites

- Node.js 18+
- npm

### Steps

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app opens at http://localhost:5173/CoverCraft/

**To test without a backend**, click **"Try Demo"** or **"See a Demo"** on the homepage. This walks through all four steps using sample data without any API calls.

---

## Connecting to the AI backend

The app requires a Cloudflare Worker backend to call the Gemini API securely. The API key is never stored in frontend code.

### 1. Get a Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key (the free tier is sufficient)

### 2. Install Wrangler (Cloudflare CLI)

```bash
npm install -g wrangler
wrangler login
```

### 3. Deploy the Worker

```bash
cd worker

# Add your Gemini API key as a secret (never stored in files)
wrangler secret put GEMINI_API_KEY
# Paste your key when prompted

# Deploy
wrangler deploy
```

Wrangler will print your Worker URL, e.g.:
`https://covercraft-worker.YOUR-ACCOUNT.workers.dev`

### 4. Configure the frontend

Create a `.env.local` file in the project root:

```env
VITE_WORKER_URL=https://covercraft-worker.YOUR-ACCOUNT.workers.dev
```

Restart the dev server (`npm run dev`). The app will now call the real Gemini API.

---

## Deploying to GitHub Pages

### 1. Enable GitHub Pages

1. Push your code to GitHub
2. Go to your repo → **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save

### 2. Add the Worker URL as a GitHub secret

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_WORKER_URL`
4. Value: your Worker URL (e.g. `https://covercraft-worker.YOUR-ACCOUNT.workers.dev`)

### 3. Push to main

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy the site. Your public URL will be:

```
https://adelinelin9.github.io/CoverCraft/
```

---

## Project structure

```
CoverCraft/
├── src/
│   ├── components/        # React UI components (one per step)
│   │   ├── HomePage.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StepDetails.tsx
│   │   ├── StepRecommendations.tsx
│   │   ├── StepQuestionnaire.tsx
│   │   ├── StepCoverLetter.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBanner.tsx
│   ├── services/
│   │   └── api.ts         # Calls to the Cloudflare Worker
│   ├── demo.ts            # Sample data for demo mode
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── App.tsx            # Main app with step routing
│   └── main.tsx
├── worker/
│   ├── index.js           # Cloudflare Worker (AI backend)
│   └── wrangler.toml      # Worker configuration
├── .github/workflows/
│   └── deploy.yml         # GitHub Actions deployment
├── .env.example           # Environment variable template
└── vite.config.ts
```

---

## Tech stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Icons    | Lucide React                          |
| AI       | Google Gemini 2.5 Flash               |
| Backend  | Cloudflare Workers                    |
| Hosting  | GitHub Pages                          |

---

## Demo mode

Demo mode is built-in and requires no API key. Click **"Try Demo"** on the homepage to see a complete walkthrough with a sample resume, job description, and cover letter. All demo output is clearly labeled with an amber banner.

---

## What's left to do manually

- [ ] Get a Gemini API key from Google AI Studio
- [ ] Deploy the Cloudflare Worker (`cd worker && wrangler deploy`)
- [ ] Add `VITE_WORKER_URL` as a GitHub Actions secret
- [ ] Enable GitHub Pages (Settings → Pages → GitHub Actions)
- [ ] Push to `main` to trigger the first deployment
