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

- Node.js 22.12+
- npm

### 1. Install and configure

```bash
npm install
cp .env.example .env.local
cp worker/.dev.vars.example worker/.dev.vars
```

Create a key at [Google AI Studio](https://aistudio.google.com/app/apikey), then paste it after
`GEMINI_API_KEY=` in `worker/.dev.vars`. This file is ignored by Git. Never put the Gemini key in
`.env.local` or any variable beginning with `VITE_`; Vite variables are included in public frontend
code. `.env.local` only needs the non-secret local Worker URL, which is already in `.env.example`.

### 2. Start both development servers

```bash
# Terminal 1: Cloudflare Worker on http://localhost:8787
npm run dev:worker

# Terminal 2: React app
npm run dev
```

The app opens at http://localhost:5173/CoverCraft/. Restart Vite after changing its environment file.

**To test without a backend or API key**, click **"Try Demo"** or **"See a Demo"** on the homepage.
This walks through all four steps using sample data without any API calls.

---

## Deploying the AI backend

The Cloudflare Worker calls Gemini securely so the API key is never stored in frontend code.

### 1. Get a Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key and follow Google's current key-restriction guidance

### 2. Authenticate with Cloudflare

Wrangler is installed as a project development dependency; no global install is needed.

```bash
npx wrangler login
```

### 3. Add the production secret and deploy the Worker

```bash
# Paste your key when prompted; it is stored as a Cloudflare secret
npm run secret:worker

npm run deploy:worker
```

Wrangler will print your Worker URL, e.g.:
`https://covercraft-worker.YOUR-ACCOUNT.workers.dev`

### 4. Configure the frontend

For local development, set `VITE_WORKER_URL` in `.env.local`. For a deployed site, set it to the
Worker URL printed above in your hosting provider's build settings, then rebuild the frontend.
The Worker URL is public configuration, not a secret. The Gemini key must only be in Cloudflare
Secrets (production) or `worker/.dev.vars` (local development).

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
│   │   └── api.ts         # Typed calls to the Cloudflare Worker
│   ├── demo.ts            # Sample data for demo mode
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── App.tsx            # Main app with step routing
│   └── main.tsx
├── worker/
│   ├── index.js           # Cloudflare Worker (AI backend)
│   ├── index.test.js      # Mocked Worker/API contract tests
│   ├── .dev.vars.example  # Local Gemini secret template
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
| AI       | Google Gemini 3.8 Flash               |
| Backend  | Cloudflare Workers                    |
| Hosting  | GitHub Pages                          |

---

## Validation

```bash
npm test                            # Mocked Worker/API contract tests
npm run lint                        # TypeScript/React lint rules
npm run build                       # Type-check and production frontend build
npm run deploy:worker -- --dry-run  # Validate the Worker deployment bundle
```

The tests do not call Gemini or consume API quota. Run one manual analyze/generate/regenerate
walkthrough with your real key before deploying.

---

## Demo mode

Demo mode is built-in and requires no API key. Click **"Try Demo"** on the homepage to see a complete walkthrough with a sample resume, job description, and cover letter. All demo output is clearly labeled with an amber banner.

---

## What's left to do manually

- [ ] Add your Gemini key to `worker/.dev.vars` and complete a real local walkthrough
- [ ] Add the production Gemini secret (`npm run secret:worker`)
- [ ] Deploy the Cloudflare Worker (`npm run deploy:worker`)
- [ ] Add `VITE_WORKER_URL` as a GitHub Actions secret
- [ ] Enable GitHub Pages (Settings → Pages → GitHub Actions)
- [ ] Push to `main` to trigger deployment and test the public site

### Before collecting real users' resumes

- Add rate limiting and abuse protection (for example, Cloudflare Rate Limiting and/or Turnstile).
  CORS protects browser access but does not prevent direct requests to the public Worker.
- Add a privacy notice explaining that resume/job application data is sent to Google Gemini, and
  review Google Cloud and Cloudflare data-handling terms.
- Resolve the remaining `npm audit` development-tool advisories when a compatible patched release
  is available; do not apply npm's suggested breaking downgrade without testing.
- Add browser-level integration/accessibility tests and consider saving drafts across reloads.
- Replace the study-finding placeholders in `DESIGN_RATIONALE.md` with actual coursework findings.
