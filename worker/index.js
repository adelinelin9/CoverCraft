/**
 * CoverCraft Cloudflare Worker
 *
 * Routes:
 *   POST /analyze  — resume + job description → experience recommendations
 *   POST /generate — full inputs → cover letter + improvement suggestions
 *
 * Secrets (set via `wrangler secret put GEMINI_API_KEY`):
 *   GEMINI_API_KEY
 *
 * Environment variables (set in wrangler.toml or dashboard):
 *   ALLOWED_ORIGIN — your GitHub Pages URL, e.g. https://adelinelin9.github.io
 */

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const MAX_BODY_BYTES = 50_000 // 50 KB limit

// ─── CORS helpers ────────────────────────────────────────────────────────────

function getAllowedOrigins(env) {
  const origins = ['http://localhost:5173', 'http://localhost:4173']
  if (env.ALLOWED_ORIGIN) origins.push(env.ALLOWED_ORIGIN.trim())
  return origins
}

function corsHeaders(origin, env) {
  const allowed = getAllowedOrigins(env)
  const use = allowed.includes(origin) ? origin : allowed[0]
  return {
    'Access-Control-Allow-Origin': use,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data, status = 200, origin = '', env = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, env) },
  })
}

function err(message, status, origin, env) {
  return json({ error: message }, status, origin, env)
}

// ─── Gemini helper ───────────────────────────────────────────────────────────

async function gemini(prompt, apiKey) {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini.')
  return text
}

// ─── Route handlers ──────────────────────────────────────────────────────────

async function handleAnalyze(body, apiKey) {
  const { resume, jobDescription } = body

  if (typeof resume !== 'string' || resume.trim().length < 50)
    throw { status: 400, message: 'Resume must be at least 50 characters.' }
  if (typeof jobDescription !== 'string' || jobDescription.trim().length < 50)
    throw { status: 400, message: 'Job description must be at least 50 characters.' }

  const prompt = `You are an expert career coach helping a job applicant identify their most relevant experiences.

RESUME:
"""
${resume.slice(0, 8000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 4000)}
"""

TASK: Identify 3–5 experiences or skills from the resume that are most relevant to this specific job.

RULES:
- Only reference experiences or skills actually present in the resume. Do not invent or assume anything.
- Be specific about why each item matches the job requirements.
- Keep explanations concise (1–2 sentences each).

Respond with ONLY a JSON array (no markdown, no extra text) in this exact format:
[
  {
    "id": "rec-1",
    "title": "Short title (5–8 words)",
    "skill": "Specific skill or technology name",
    "explanation": "Why this matches the job requirements."
  }
]`

  const raw = await gemini(prompt, apiKey)

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let recommendations
  try {
    recommendations = JSON.parse(cleaned)
  } catch {
    throw new Error('Could not parse AI response. Please try again.')
  }

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    throw new Error('AI returned an unexpected format. Please try again.')
  }

  return { recommendations }
}

async function handleGenerate(body, apiKey) {
  const { resume, jobDescription, selectedRecommendations, questionnaire } = body

  if (!resume || !jobDescription) throw { status: 400, message: 'Missing resume or job description.' }
  if (!Array.isArray(selectedRecommendations) || selectedRecommendations.length === 0)
    throw { status: 400, message: 'No experiences selected.' }
  if (!questionnaire?.interest || !questionnaire?.strengths)
    throw { status: 400, message: 'Missing questionnaire answers.' }

  const experienceList = selectedRecommendations
    .map((r) => `- ${r.title}: ${r.explanation}`)
    .join('\n')

  const prompt = `You are a professional cover letter writer helping a job applicant craft a personalized, authentic letter.

RESUME:
"""
${resume.slice(0, 8000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 4000)}
"""

EXPERIENCES THE APPLICANT WANTS TO HIGHLIGHT:
${experienceList}

APPLICANT'S OWN WORDS:
- What interests them about this position: "${questionnaire.interest}"
- A specific experience or accomplishment they want to focus on: "${questionnaire.strengths}"
- Additional context: "${questionnaire.additionalInfo || 'None provided.'}"

INSTRUCTIONS:
- Write a professional cover letter, 250–350 words.
- Sound natural and genuine — avoid generic filler phrases like "I am writing to express my interest."
- Incorporate the applicant's stated interest in the position and spotlight the specific experience or accomplishment they want to focus on.
- Emphasize only the highlighted experiences. Never invent qualifications, achievements, or company details not supported by the resume.
- Do not include a date, address block, or "Dear Hiring Manager" salutation — start directly with the opening paragraph.
- End with a professional closing and the applicant's name (from the resume).

After the cover letter, on a new line, write exactly: ---SUGGESTIONS---
Then provide 2–3 short, specific, actionable suggestions for how the applicant could strengthen this letter further. Number them 1., 2., 3.`

  const raw = await gemini(prompt, apiKey)

  const parts = raw.split('---SUGGESTIONS---')
  const coverLetter = parts[0].trim()
  const suggestionBlock = parts[1]?.trim() ?? ''

  const suggestions = suggestionBlock
    .split(/\n+/)
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3)

  return { coverLetter, suggestions }
}

// ─── Main fetch handler ───────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) })
    }

    // Only POST allowed
    if (request.method !== 'POST') {
      return err('Method not allowed.', 405, origin, env)
    }

    // Enforce body size
    const contentLength = parseInt(request.headers.get('Content-Length') ?? '0', 10)
    if (contentLength > MAX_BODY_BYTES) {
      return err('Request body too large.', 413, origin, env)
    }

    if (!env.GEMINI_API_KEY) {
      return err('Server is not configured. Please add your GEMINI_API_KEY secret.', 503, origin, env)
    }

    let body
    try {
      const text = await request.text()
      if (text.length > MAX_BODY_BYTES) return err('Request body too large.', 413, origin, env)
      body = JSON.parse(text)
    } catch {
      return err('Invalid JSON body.', 400, origin, env)
    }

    try {
      if (url.pathname === '/analyze') {
        const result = await handleAnalyze(body, env.GEMINI_API_KEY)
        return json(result, 200, origin, env)
      }

      if (url.pathname === '/generate') {
        const result = await handleGenerate(body, env.GEMINI_API_KEY)
        return json(result, 200, origin, env)
      }

      return err('Not found.', 404, origin, env)
    } catch (e) {
      if (e.status) return err(e.message, e.status, origin, env)
      console.error(e)
      return err('An unexpected error occurred. Please try again.', 500, origin, env)
    }
  },
}
