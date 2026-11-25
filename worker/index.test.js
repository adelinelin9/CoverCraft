import assert from 'node:assert/strict'
import test from 'node:test'
import worker from './index.js'

const ORIGIN = 'http://localhost:5173'
const ENV = {
  OPENAI_API_KEY: 'test-key',
  OPENAI_MODEL: 'gpt-6-luna',
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

function openAIResponse(text) {
  return new Response(
    JSON.stringify({
      id: 'resp_test',
      object: 'response',
      status: 'completed',
      output: [
        {
          id: 'msg_test',
          type: 'message',
          status: 'completed',
          role: 'assistant',
          content: [{ type: 'output_text', text, annotations: [] }],
        },
      ],
    }),
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

test('returns a configuration error when the OpenAI secret is missing', async () => {
  const response = await worker.fetch(request('/analyze', ANALYZE_BODY), {})
  assert.equal(response.status, 503)
  assert.match((await response.json()).error, /OPENAI_API_KEY/)
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

test('analyzes a resume using OpenAI Structured Outputs and sanitizes recommendations', async (t) => {
  stubFetch(t, async (url, init) => {
    assert.equal(url, 'https://api.openai.com/v1/responses')
    assert.equal(new URL(url).searchParams.has('key'), false)
    assert.equal(init.headers.Authorization, 'Bearer test-key')
    assert.equal(init.headers['Content-Type'], 'application/json')

    const upstreamBody = JSON.parse(init.body)
    assert.equal(upstreamBody.model, 'gpt-6-luna')
    assert.equal(upstreamBody.reasoning.effort, 'low')
    assert.equal(upstreamBody.store, false)
    assert.equal(upstreamBody.max_output_tokens, 4096)
    assert.equal(upstreamBody.text.format.type, 'json_schema')
    assert.equal(upstreamBody.text.format.strict, true)
    assert.equal(upstreamBody.text.format.schema.additionalProperties, false)
    assert.match(upstreamBody.input, /Jane Smith/)

    const recommendations = RECOMMENDATIONS.map(({ title, skill, explanation }) => ({
      title,
      skill,
      explanation,
    }))
    return openAIResponse(JSON.stringify({ recommendations }))
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
    assert.equal(upstreamBody.text, undefined)
    assert.match(upstreamBody.input, /React frontend development/)
    return openAIResponse(
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
  stubFetch(t, async () => openAIResponse('This is not JSON.'))
  const response = await worker.fetch(request('/analyze', ANALYZE_BODY), ENV)
  assert.equal(response.status, 502)
  assert.match((await response.json()).error, /unreadable recommendations/)
})

test('passes through a rate-limit response as an actionable client error', async (t) => {
  stubFetch(t, async () => new Response('Upstream quota exceeded', { status: 429 }))
  const response = await worker.fetch(request('/generate', GENERATE_BODY), ENV)
  assert.equal(response.status, 429)
  assert.match((await response.json()).error, /try again later/)
})

test('returns an actionable error when OpenAI rejects the configured key', async (t) => {
  stubFetch(t, async () => new Response('Invalid API key', { status: 401 }))
  const response = await worker.fetch(request('/analyze', ANALYZE_BODY), ENV)
  assert.equal(response.status, 502)
  assert.match((await response.json()).error, /OPENAI_API_KEY/)
})

test('handles an OpenAI refusal without returning it as a cover letter', async (t) => {
  stubFetch(t, async () =>
    new Response(
      JSON.stringify({
        status: 'completed',
        output: [
          {
            type: 'message',
            content: [{ type: 'refusal', refusal: 'Request declined' }],
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ),
  )
  const response = await worker.fetch(request('/generate', GENERATE_BODY), ENV)
  assert.equal(response.status, 502)
  assert.match((await response.json()).error, /declined this request/)
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

test('rejects invalid generation input before calling OpenAI', async () => {
  const response = await worker.fetch(
    request('/generate', { ...GENERATE_BODY, selectedRecommendations: [] }),
    ENV,
  )
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /at least one valid experience/)
})

const REVISE_BODY = {
  coverLetter:
    'I am excited to apply for this role. My experience with React and TypeScript, combined with my work on accessible UI components, makes me a strong candidate for your frontend team.',
  suggestion: 'Add a specific metric to show the impact of your React work.',
}

test('revises a cover letter and returns the updated text', async (t) => {
  stubFetch(t, async (_url, init) => {
    const upstreamBody = JSON.parse(init.body)
    assert.match(upstreamBody.input, /CURRENT COVER LETTER/)
    assert.match(upstreamBody.input, /SUGGESTION TO APPLY/)
    assert.match(upstreamBody.input, /Add a specific metric/)
    assert.equal(upstreamBody.text, undefined, 'revise must not use structured output format')
    return openAIResponse('I am excited to apply — I improved render performance by 35% using React memoization.')
  })

  const response = await worker.fetch(request('/revise', REVISE_BODY), ENV)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    revisedLetter: 'I am excited to apply — I improved render performance by 35% using React memoization.',
  })
})

test('rejects a cover letter that is too short for revision', async () => {
  const response = await worker.fetch(
    request('/revise', { coverLetter: 'Too short.', suggestion: 'Make it better.' }),
    ENV,
  )
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /at least 50 characters/)
})

test('rejects a revision request with an empty suggestion', async () => {
  const response = await worker.fetch(
    request('/revise', { ...REVISE_BODY, suggestion: '   ' }),
    ENV,
  )
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /non-empty string/)
})

test('includes accomplishmentImpact in the generate prompt when provided', async (t) => {
  stubFetch(t, async (_url, init) => {
    const upstreamBody = JSON.parse(init.body)
    assert.match(upstreamBody.input, /Impact or results they want highlighted/)
    assert.match(upstreamBody.input, /Improved team onboarding time by 30%/)
    return openAIResponse('Cover letter.\n\n---SUGGESTIONS---\n1. Add more detail.')
  })

  const response = await worker.fetch(
    request('/generate', {
      ...GENERATE_BODY,
      questionnaire: {
        ...GENERATE_BODY.questionnaire,
        accomplishmentImpact: 'Improved team onboarding time by 30%',
      },
    }),
    ENV,
  )
  assert.equal(response.status, 200)
})

test('omits accomplishmentImpact from the generate prompt when blank', async (t) => {
  stubFetch(t, async (_url, init) => {
    const upstreamBody = JSON.parse(init.body)
    assert.doesNotMatch(upstreamBody.input, /Impact or results they want highlighted/)
    return openAIResponse('Cover letter.\n\n---SUGGESTIONS---\n1. Add more detail.')
  })

  const response = await worker.fetch(
    request('/generate', {
      ...GENERATE_BODY,
      questionnaire: {
        ...GENERATE_BODY.questionnaire,
        accomplishmentImpact: '',
      },
    }),
    ENV,
  )
  assert.equal(response.status, 200)
})
