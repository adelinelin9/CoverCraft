export interface ExperienceRecommendation {
  id: string
  title: string
  skill: string
  explanation: string
}

export interface QuestionnaireAnswers {
  interest: string
  strengths: string
  additionalInfo: string
}

export interface GenerateResult {
  coverLetter: string
  suggestions: string[]
}

export interface AppState {
  step: number
  resume: string
  jobDescription: string
  recommendations: ExperienceRecommendation[]
  selectedIds: Set<string>
  questionnaire: QuestionnaireAnswers
  coverLetter: string
  suggestions: string[]
  isDemo: boolean
}
