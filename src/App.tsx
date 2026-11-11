import { useState } from 'react'
import { FileText } from 'lucide-react'
import HomePage from './components/HomePage'
import ProgressBar from './components/ProgressBar'
import StepDetails from './components/StepDetails'
import StepRecommendations from './components/StepRecommendations'
import StepQuestionnaire from './components/StepQuestionnaire'
import StepCoverLetter from './components/StepCoverLetter'
import { analyzeResume, generateCoverLetter } from './services/api'
import type { ExperienceRecommendation, QuestionnaireAnswers } from './types'
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
  // Track the highest step reached so the progress bar knows what's navigable
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

  function goToStep(s: NumericStep) {
    setStep(s)
    if (s > maxStep) setMaxStep(s)
  }

  function handleFieldChange(field: 'resume' | 'jobDescription', value: string) {
    if (field === 'resume') setResume(value)
    else setJobDescription(value)
  }

  async function handleAnalyze() {
    const recs = await analyzeResume(resume, jobDescription)
    setRecommendations(recs)
    setSelectedIds(new Set(recs.map((r) => r.id)))
    setIsDemo(false)
    goToStep(2)
  }

  function handleDemoStart() {
    setResume(DEMO_RESUME)
    setJobDescription(DEMO_JOB)
    setRecommendations(DEMO_RECOMMENDATIONS)
    setSelectedIds(new Set(DEMO_RECOMMENDATIONS.map((r) => r.id)))
    setIsDemo(true)
    goToStep(2)
  }

  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleQuestionnaireChange(field: keyof QuestionnaireAnswers, value: string) {
    setQuestionnaire((prev) => ({ ...prev, [field]: value }))
  }

  async function handleGenerate() {
    if (isDemo) {
      setCoverLetter(DEMO_COVER_LETTER)
      setSuggestions(DEMO_SUGGESTIONS)
      goToStep(4)
      return
    }
    const selected = recommendations.filter((r) => selectedIds.has(r.id))
    const result = await generateCoverLetter(resume, jobDescription, selected, questionnaire)
    setCoverLetter(result.coverLetter)
    setSuggestions(result.suggestions)
    goToStep(4)
  }

  // Returns the new letter so StepCoverLetter can update its "clean version" ref
  async function handleRegenerate(): Promise<string> {
    if (isDemo) {
      setCoverLetter(DEMO_COVER_LETTER)
      setSuggestions(DEMO_SUGGESTIONS)
      return DEMO_COVER_LETTER
    }
    const selected = recommendations.filter((r) => selectedIds.has(r.id))
    const result = await generateCoverLetter(resume, jobDescription, selected, questionnaire)
    setCoverLetter(result.coverLetter)
    setSuggestions(result.suggestions)
    return result.coverLetter
  }

  const selectedExperiences = recommendations.filter((r) => selectedIds.has(r.id))

  if (step === 'home') {
    return <HomePage onGetStarted={() => goToStep(1)} onDemo={handleDemoStart} />
  }

  const numericStep = step as NumericStep

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Top bar */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
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
            onChange={setCoverLetter}
            onRegenerate={handleRegenerate}
            onBack={() => setStep(3)}
          />
        )}
      </main>
    </div>
  )
}
