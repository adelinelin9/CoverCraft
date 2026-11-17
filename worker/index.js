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
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent'

const MAX_BODY_BYTES = 50_000 // 50 KB limit

// ─── CORS helpers ────────────────────────────────────────────────────────────

function getAllowedOrigins(env) {
  const origins = ['http://localhost:5173', 'http://localhost:4173']
  if (env.ALLOWED_ORIGIN) origins.push(env.ALLOWED_ORIGIN.trim())
  return origins
}

function corsHeaders(origin, env) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
  if (getAllowedOrigins(env).includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
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

async function gemini(prompt, apiKey, jsonResponse = false) {
  let res
  try {
    res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          ...(jsonResponse ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    })
  } catch {
    throw { status: 502, message: 'Could not reach the AI service. Please try again.' }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`Gemini API error ${res.status}: ${text.slice(0, 500)}`)
    if (res.status === 429) {
      throw { status: 429, message: 'The AI service is busy. Please wait a moment and try again.' }
    }
    throw {
      status: 502,
      message: 'The AI service could not complete the request. Check the Worker logs for details.',
    }
  }

  let data
  try {
    data = await res.json()
  } catch {
    throw { status: 502, message: 'The AI service returned an invalid response. Please try again.' }
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw { status: 502, message: 'The AI service returned an empty response. Please try again.' }
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

  const raw = await gemini(prompt, apiKey, true)

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw { status: 502, message: 'The AI service returned unreadable recommendations. Please try again.' }
  }

  if (!Array.isArray(parsed)) {
    throw { status: 502, message: 'The AI service returned unexpected recommendations. Please try again.' }
  }

  const recommendations = parsed
    .filter(
      (rec) =>
        rec &&
        typeof rec.title === 'string' &&
        rec.title.trim() &&
        typeof rec.skill === 'string' &&
        rec.skill.trim() &&
        typeof rec.explanation === 'string' &&
        rec.explanation.trim(),
    )
    .slice(0, 5)
    .map((rec, index) => ({
      id: `rec-${index + 1}`,
      title: rec.title.trim(),
      skill: rec.skill.trim(),
      explanation: rec.explanation.trim(),
    }))

  if (recommendations.length === 0) {
    throw { status: 502, message: 'The AI service returned no valid recommendations. Please try again.' }
  }

  return { recommendations }
}

async function handleGenerate(body, apiKey) {
  const { resume, jobDescription, selectedRecommendations, questionnaire } = body

  if (typeof resume !== 'string' || resume.trim().length < 50)
    throw { status: 400, message: 'Resume must be at least 50 characters.' }
  if (typeof jobDescription !== 'string' || jobDescription.trim().length < 50)
    throw { status: 400, message: 'Job description must be at least 50 characters.' }
  if (
    !Array.isArray(selectedRecommendations) ||
    selectedRecommendations.length === 0 ||
    !selectedRecommendations.every(
      (rec) =>
        rec &&
        typeof rec.title === 'string' &&
        rec.title.trim() &&
        typeof rec.explanation === 'string' &&
        rec.explanation.trim(),
    )
  )
    throw { status: 400, message: 'Select at least one valid experience.' }
  if (
    !questionnaire ||
    typeof questionnaire.interest !== 'string' ||
    !questionnaire.interest.trim() ||
    typeof questionnaire.strengths !== 'string' ||
    !questionnaire.strengths.trim() ||
    (questionnaire.additionalInfo !== undefined && typeof questionnaire.additionalInfo !== 'string')
  )
    throw { status: 400, message: 'Missing or invalid questionnaire answers.' }

  const experienceList = selectedRecommendations
    .slice(0, 5)
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

  if (!coverLetter) {
    throw { status: 502, message: 'The AI service returned an empty cover letter. Please try again.' }
  }

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
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return err('JSON body must be an object.', 400, origin, env)
      }
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
