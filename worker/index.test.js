import assert from 'node:assert/strict'
import test from 'node:test'
import worker from './index.js'

const ORIGIN = 'http://localhost:5173'
const ENV = {
  GEMINI_API_KEY: 'test-key',
  ALLOWED_ORIGIN: 'https://adelinelin9.github.io',
}

const RECOMMENDATIONS = [
  {
    id: 'model-id-1',
    title: 'React frontend development',
    skill: 'React and TypeScript',
    explanation: 'The resume includes substantial React and TypeScript project experience.',
  },
  {
    id: 'model-id-2',
    title: 'Accessible interface implementation',
    skill: 'Accessibility',
    explanation: 'The applicant has built accessible interfaces relevant to this role.',
  },
  {
    id: 'model-id-3',
    title: 'Cross-functional collaboration',
    skill: 'Collaboration',
    explanation: 'The resume describes delivering projects with designers and engineers.',
  },
]

const ANALYZE_BODY = {
  resume:
    'Jane Smith\nSoftware engineer with React and TypeScript experience building accessible web applications with designers.',
  jobDescription:
    'Software Engineer\nBuild accessible React applications and collaborate with product designers and backend engineers.',
}

const GENERATE_BODY = {
  ...ANALYZE_BODY,
  selectedRecommendations: RECOMMENDATIONS,
  questionnaire: {
    interest: 'I want to build useful products with a collaborative team.',
    strengths: 'I built an accessible React dashboard with a team of designers.',
    additionalInfo: '',
  },
}

function request(path, body, origin = ORIGIN) {
  return new Request(`http://worker.local${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(body),
  })
}

function geminiResponse(text) {
  return new Response(
    JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

function stubFetch(t, implementation) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = implementation
  t.after(() => {
    globalThis.fetch = originalFetch
  })
}

test('returns a configuration error when the Gemini secret is missing', async () => {
  const response = await worker.fetch(request('/analyze', ANALYZE_BODY), {})
  assert.equal(response.status, 503)
  assert.match((await response.json()).error, /GEMINI_API_KEY/)
})

test('only returns CORS access headers for allowed origins', async () => {
  const allowed = await worker.fetch(
    new Request('http://worker.local/analyze', { method: 'OPTIONS', headers: { Origin: ORIGIN } }),
    ENV,
  )
  assert.equal(allowed.status, 204)
  assert.equal(allowed.headers.get('Access-Control-Allow-Origin'), ORIGIN)

  const disallowed = await worker.fetch(
    new Request('http://worker.local/analyze', {
      method: 'OPTIONS',
      headers: { Origin: 'https://untrusted.example' },
    }),
    ENV,
  )
  assert.equal(disallowed.headers.get('Access-Control-Allow-Origin'), null)
})

test('analyzes a resume and sanitizes Gemini recommendations', async (t) => {
  stubFetch(t, async (url, init) => {
    assert.match(url, /gemini-3\.8-flash:generateContent$/)
    assert.equal(new URL(url).searchParams.has('key'), false)
    assert.equal(init.headers['x-goog-api-key'], 'test-key')

    const upstreamBody = JSON.parse(init.body)
    assert.equal(upstreamBody.generationConfig.responseMimeType, 'application/json')
    assert.match(upstreamBody.contents[0].parts[0].text, /Jane Smith/)
    return geminiResponse(`\`\`\`json\n${JSON.stringify(RECOMMENDATIONS)}\n\`\`\``)
  })

  const response = await worker.fetch(request('/analyze', ANALYZE_BODY), ENV)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN)

  const result = await response.json()
  assert.equal(result.recommendations.length, 3)
  assert.deepEqual(
    result.recommendations.map((recommendation) => recommendation.id),
    ['rec-1', 'rec-2', 'rec-3'],
  )
  assert.equal(result.recommendations[0].title, RECOMMENDATIONS[0].title)
})

test('generates a cover letter and parses its suggestions', async (t) => {
  stubFetch(t, async (_url, init) => {
    const upstreamBody = JSON.parse(init.body)
    assert.equal(upstreamBody.generationConfig.responseMimeType, undefined)
    assert.match(upstreamBody.contents[0].parts[0].text, /React frontend development/)
    return geminiResponse(
      'A personalized cover letter.\n\n---SUGGESTIONS---\n1. Add a specific metric.\n2. Clarify your interest.',
    )
  })

  const response = await worker.fetch(request('/generate', GENERATE_BODY), ENV)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    coverLetter: 'A personalized cover letter.',
    suggestions: ['Add a specific metric.', 'Clarify your interest.'],
  })
})

test('returns a safe bad-gateway error for malformed analysis output', async (t) => {
  stubFetch(t, async () => geminiResponse('This is not JSON.'))
  const response = await worker.fetch(request('/analyze', ANALYZE_BODY), ENV)
  assert.equal(response.status, 502)
  assert.match((await response.json()).error, /unreadable recommendations/)
})

test('passes through a rate-limit response as an actionable client error', async (t) => {
  stubFetch(t, async () => new Response('Upstream quota exceeded', { status: 429 }))
  const response = await worker.fetch(request('/generate', GENERATE_BODY), ENV)
  assert.equal(response.status, 429)
  assert.match((await response.json()).error, /wait a moment/)
})

test('rejects a non-object JSON body', async () => {
  const response = await worker.fetch(
    new Request('http://worker.local/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: 'null',
    }),
    ENV,
  )
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /must be an object/)
})

test('rejects invalid generation input before calling Gemini', async () => {
  const response = await worker.fetch(
    request('/generate', { ...GENERATE_BODY, selectedRecommendations: [] }),
    ENV,
  )
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /at least one valid experience/)
})
