import { useState } from 'react'
import { FileText } from 'lucide-react'
import HomePage from './components/HomePage'
import ProgressBar from './components/ProgressBar'
import StepDetails from './components/StepDetails'
import StepRecommendations from './components/StepRecommendations'
import StepQuestionnaire from './components/StepQuestionnaire'
import StepCoverLetter from './components/StepCoverLetter'
import type { ExperienceRecommendation, QuestionnaireAnswers } from './types'
import { analyzeExperience, generateCoverLetter } from './services/api'
import {
  DEMO_RESUME,
  DEMO_JOB,
  DEMO_RECOMMENDATIONS,
  DEMO_COVER_LETTER,
  DEMO_SUGGESTIONS,
} from './demo'

type NumericStep = 1 | 2 | 3 | 4
type Step = 'home' | NumericStep

export default function App() {
  const [step, setStep] = useState<Step>('home')
  const [maxStep, setMaxStep] = useState<NumericStep>(1)

  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [recommendations, setRecommendations] = useState<ExperienceRecommendation[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireAnswers>({
    interest: '',
    strengths: '',
    additionalInfo: '',
  })
  const [coverLetter, setCoverLetter] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isDemo, setIsDemo] = useState(false)

  // True when inputs have changed after the cover letter was last generated.
  // Clears only on a fresh generate or regenerate — the letter is never changed silently.
  const [letterIsStale, setLetterIsStale] = useState(false)

  function goToStep(s: NumericStep) {
    setStep(s)
    if (s > maxStep) setMaxStep(s)
  }

  function markStaleIfLetterExists() {
    if (coverLetter) setLetterIsStale(true)
  }

  function handleFieldChange(field: 'resume' | 'jobDescription', value: string) {
    markStaleIfLetterExists()
    if (field === 'resume') setResume(value)
    else setJobDescription(value)
  }

  async function handleAnalyze() {
    const result = await analyzeExperience(resume, jobDescription)
    markStaleIfLetterExists()
    setRecommendations(result)
    setSelectedIds(new Set(result.slice(0, 3).map((recommendation) => recommendation.id)))
    setIsDemo(false)
    goToStep(2)
  }

  function handleGetStarted() {
    setResume('')
    setJobDescription('')
    setRecommendations([])
    setSelectedIds(new Set())
    setQuestionnaire({ interest: '', strengths: '', additionalInfo: '' })
    setCoverLetter('')
    setSuggestions([])
    setIsDemo(false)
    setLetterIsStale(false)
    setMaxStep(1)
    goToStep(1)
  }

  function handleDemoStart() {
    setResume(DEMO_RESUME)
    setJobDescription(DEMO_JOB)
    setRecommendations(DEMO_RECOMMENDATIONS)
    setSelectedIds(new Set(DEMO_RECOMMENDATIONS.slice(0, 3).map((r) => r.id)))
    setIsDemo(true)
    goToStep(1)
  }

  function handleToggle(id: string) {
    markStaleIfLetterExists()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleQuestionnaireChange(field: keyof QuestionnaireAnswers, value: string) {
    markStaleIfLetterExists()
    setQuestionnaire((prev) => ({ ...prev, [field]: value }))
  }

  const selectedExperiences = recommendations.filter((r) => selectedIds.has(r.id))

  async function requestCoverLetter(): Promise<string> {
    const result = await generateCoverLetter({
      resume,
      jobDescription,
      selectedRecommendations: selectedExperiences,
      questionnaire,
    })
    setCoverLetter(result.coverLetter)
    setSuggestions(result.suggestions)
    setLetterIsStale(false)
    return result.coverLetter
  }

  async function handleGenerate() {
    if (isDemo) {
      setCoverLetter(DEMO_COVER_LETTER)
      setSuggestions(DEMO_SUGGESTIONS)
      setLetterIsStale(false)
    } else {
      await requestCoverLetter()
    }
    goToStep(4)
  }

  async function handleRegenerate(): Promise<string> {
    if (isDemo) {
      setCoverLetter(DEMO_COVER_LETTER)
      setSuggestions(DEMO_SUGGESTIONS)
      setLetterIsStale(false)
      return DEMO_COVER_LETTER
    }
    return requestCoverLetter()
  }

  if (step === 'home') {
    return <HomePage onGetStarted={handleGetStarted} onDemo={handleDemoStart} />
  }

  const numericStep = step as NumericStep

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Top bar */}
      <header className="border-b border-purple-100 bg-white sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep('home')}
            className="flex items-center gap-1.5 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">CoverCraft</span>
          </button>
        </div>
      </header>

      <ProgressBar
        currentStep={numericStep}
        onNavigate={(s) => setStep(s as NumericStep)}
      />

      <main className="pt-2">
        {step === 1 && (
          <StepDetails
            resume={resume}
            jobDescription={jobDescription}
            onChange={handleFieldChange}
            onAnalyze={handleAnalyze}
            onFillDemo={handleDemoStart}
            isDemo={isDemo}
          />
        )}

        {step === 2 && (
          <StepRecommendations
            recommendations={recommendations}
            selectedIds={selectedIds}
            isDemo={isDemo}
            onToggle={handleToggle}
            onBack={() => setStep(1)}
            onContinue={() => goToStep(3)}
          />
        )}

        {step === 3 && (
          <StepQuestionnaire
            answers={questionnaire}
            selectedExperiences={selectedExperiences}
            onChange={handleQuestionnaireChange}
            onGenerate={handleGenerate}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepCoverLetter
            coverLetter={coverLetter}
            suggestions={suggestions}
            isDemo={isDemo}
            isStale={letterIsStale}
            onChange={setCoverLetter}
            onRegenerate={handleRegenerate}
            onBack={() => setStep(3)}
          />
        )}
      </main>
    </div>
  )
}
