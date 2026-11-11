import type { ExperienceRecommendation, GenerateResult, QuestionnaireAnswers } from '../types'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || ''

export async function analyzeResume(
  resume: string,
  jobDescription: string
): Promise<ExperienceRecommendation[]> {
  if (!WORKER_URL) {
    throw new Error('WORKER_URL not configured. Please set VITE_WORKER_URL in your .env file.')
  }

  const response = await fetch(`${WORKER_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, jobDescription }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`Analysis failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  if (!Array.isArray(data.recommendations)) {
    throw new Error('Unexpected response format from server.')
  }
  return data.recommendations as ExperienceRecommendation[]
}

export async function generateCoverLetter(
  resume: string,
  jobDescription: string,
  selectedRecommendations: ExperienceRecommendation[],
  questionnaire: QuestionnaireAnswers
): Promise<GenerateResult> {
  if (!WORKER_URL) {
    throw new Error('WORKER_URL not configured. Please set VITE_WORKER_URL in your .env file.')
  }

  const response = await fetch(`${WORKER_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, jobDescription, selectedRecommendations, questionnaire }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`Generation failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  if (typeof data.coverLetter !== 'string') {
    throw new Error('Unexpected response format from server.')
  }
  return data as GenerateResult
}
