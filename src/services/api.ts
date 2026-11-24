import type {
  ExperienceRecommendation,
  GenerateResult,
  QuestionnaireAnswers,
  ReviseResult,
} from '../types'

interface GenerateCoverLetterInput {
  resume: string
  jobDescription: string
  selectedRecommendations: ExperienceRecommendation[]
  questionnaire: QuestionnaireAnswers
}

const WORKER_URL = import.meta.env.VITE_WORKER_URL?.trim().replace(/\/+$/, '')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isRecommendation(value: unknown): value is ExperienceRecommendation {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.skill === 'string' &&
    typeof value.explanation === 'string'
  )
}

async function post(path: string, body: unknown): Promise<unknown> {
  if (!WORKER_URL) {
    throw new Error(
      import.meta.env.DEV
        ? 'The AI service is not configured. Add VITE_WORKER_URL to .env.local and restart the dev server, or use demo mode.'
        : 'The AI service is not configured yet. Please use demo mode or contact the site owner.',
    )
  }

  let response: Response
  try {
    response = await fetch(`${WORKER_URL}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error(
      'Could not connect to the AI service. Make sure the Worker is running, then try again.',
    )
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message = isRecord(data) && typeof data.error === 'string' ? data.error : null
    throw new Error(message ?? `The AI service returned an error (${response.status}). Please try again.`)
  }

  if (data === null) {
    throw new Error('The AI service returned an invalid response. Please try again.')
  }

  return data
}

export async function analyzeExperience(
  resume: string,
  jobDescription: string,
): Promise<ExperienceRecommendation[]> {
  const data = await post('/analyze', { resume, jobDescription })

  if (
    !isRecord(data) ||
    !Array.isArray(data.recommendations) ||
    data.recommendations.length === 0 ||
    !data.recommendations.every(isRecommendation)
  ) {
    throw new Error('The AI service returned unexpected recommendations. Please try again.')
  }

  return data.recommendations
}

export async function generateCoverLetter({
  resume,
  jobDescription,
  selectedRecommendations,
  questionnaire,
}: GenerateCoverLetterInput): Promise<GenerateResult> {
  const data = await post('/generate', {
    resume,
    jobDescription,
    selectedRecommendations,
    questionnaire,
  })

  if (
    !isRecord(data) ||
    typeof data.coverLetter !== 'string' ||
    !data.coverLetter.trim() ||
    !Array.isArray(data.suggestions) ||
    !data.suggestions.every((suggestion) => typeof suggestion === 'string')
  ) {
    throw new Error('The AI service returned an unexpected cover letter. Please try again.')
  }

  return {
    coverLetter: data.coverLetter,
    suggestions: data.suggestions,
  }
}

export async function reviseCoverLetter({
  coverLetter,
  suggestion,
}: {
  coverLetter: string
  suggestion: string
}): Promise<ReviseResult> {
  const data = await post('/revise', { coverLetter, suggestion })

  if (!isRecord(data) || typeof data.revisedLetter !== 'string' || !data.revisedLetter.trim()) {
    throw new Error('The AI service returned an unexpected response. Please try again.')
  }

  return { revisedLetter: data.revisedLetter }
}
