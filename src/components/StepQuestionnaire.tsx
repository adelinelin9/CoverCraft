import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import ErrorBanner from './ErrorBanner'
import type { ExperienceRecommendation, QuestionnaireAnswers } from '../types'

interface Props {
  answers: QuestionnaireAnswers
  selectedExperiences: ExperienceRecommendation[]
  onChange: (field: keyof QuestionnaireAnswers, value: string) => void
  onGenerate: () => Promise<void>
  onBack: () => void
}

export default function StepQuestionnaire({
  answers,
  selectedExperiences,
  onChange,
  onGenerate,
  onBack,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ interest: false, strengths: false })
  const [contextOpen, setContextOpen] = useState(true)

  async function handleGenerate() {
    setTouched({ interest: true, strengths: true })
    if (!answers.interest.trim() || !answers.strengths.trim()) return
    setLoading(true)
    setError(null)
    try {
      await onGenerate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pb-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell us a little more</h2>
        <p className="text-gray-500 text-sm">
          Your answers help AI write a letter that actually sounds like you.
        </p>
      </div>

      {/* Selected experiences context panel */}
      {selectedExperiences.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => setContextOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-100/50 transition-colors"
          >
            <span>
              AI will highlight {selectedExperiences.length} experience
              {selectedExperiences.length !== 1 ? 's' : ''} from your resume
            </span>
            {contextOpen ? (
              <ChevronUp className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0" />
            )}
          </button>
          {contextOpen && (
            <ul className="px-4 pb-3 space-y-1.5">
              {selectedExperiences.map((exp) => (
                <li key={exp.id} className="flex items-baseline gap-2 text-sm text-purple-800">
                  <span className="text-purple-400 shrink-0">•</span>
                  <span>
                    <span className="font-medium">{exp.title}</span>
                    <span className="text-purple-500 ml-1 text-xs">— {exp.skill}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="space-y-6">
        {/* Q1 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            What interests you most about this position?
            <span className="text-red-400 ml-0.5">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            What genuinely excites you about this role or company?
          </p>
          <textarea
            value={answers.interest}
            onChange={(e) => onChange('interest', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, interest: true }))}
            placeholder="e.g. I love that this role combines front-end engineering with direct user impact…"
            rows={3}
            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 ${
              touched.interest && !answers.interest.trim()
                ? 'border-red-300 bg-red-50'
                : 'border-purple-100 bg-white'
            }`}
          />
          {touched.interest && !answers.interest.trim() && (
            <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3" />
              Please answer this question.
            </p>
          )}
        </div>

        {/* Q2 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Which skills or strengths would you like to emphasize?
            <span className="text-red-400 ml-0.5">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Mention skills you're proud of or that you feel set you apart.
          </p>
          <textarea
            value={answers.strengths}
            onChange={(e) => onChange('strengths', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, strengths: true }))}
            placeholder="e.g. My ability to quickly learn new frameworks and my experience shipping features end-to-end…"
            rows={3}
            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 ${
              touched.strengths && !answers.strengths.trim()
                ? 'border-red-300 bg-red-50'
                : 'border-purple-100 bg-white'
            }`}
          />
          {touched.strengths && !answers.strengths.trim() && (
            <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3" />
              Please answer this question.
            </p>
          )}
        </div>

        {/* Q3 (optional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Is there anything else you'd like the employer to know?
            <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Context, career goals, unique circumstances — anything that helps tell your story.
          </p>
          <textarea
            value={answers.additionalInfo}
            onChange={(e) => onChange('additionalInfo', e.target.value)}
            placeholder="e.g. I'm relocating to the area in January and am very motivated to establish myself here…"
            rows={3}
            className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {loading ? (
          <LoadingSpinner message="Crafting your cover letter…" />
        ) : (
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-6 rounded-xl border border-gray-200 transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Generate My Cover Letter ✨
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
