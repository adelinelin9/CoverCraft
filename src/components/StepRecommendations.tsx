import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import type { ExperienceRecommendation } from '../types'

interface Props {
  recommendations: ExperienceRecommendation[]
  selectedIds: Set<string>
  isDemo: boolean
  onToggle: (id: string) => void
  onBack: () => void
  onContinue: () => void
}

export default function StepRecommendations({
  recommendations,
  selectedIds,
  isDemo,
  onToggle,
  onBack,
  onContinue,
}: Props) {
  const selectedCount = selectedIds.size
  const totalCount = recommendations.length

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your experience matches</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Here's what AI found in your resume that's most relevant to this role. Select the
          experiences you want to highlight in your cover letter.
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          {/* Selection count badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              selectedCount > 0
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            {selectedCount} of {totalCount} selected
          </div>
          {isDemo && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-amber-700 text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Demo mode — sample results
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {recommendations.map((rec) => {
          const selected = selectedIds.has(rec.id)
          return (
            <button
              key={rec.id}
              type="button"
              onClick={() => onToggle(rec.id)}
              aria-pressed={selected}
              className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 ${
                selected
                  ? 'border-purple-300 bg-purple-50 shadow-sm'
                  : 'border-purple-100 bg-white hover:border-purple-200 hover:bg-purple-50/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {selected ? (
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-purple-200" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm mb-0.5">{rec.title}</p>
                  <p className="text-xs text-purple-600 font-medium mb-1.5">{rec.skill}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{rec.explanation}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedCount === 0 && (
        <p className="text-center text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-5">
          Select at least one experience to continue.
        </p>
      )}

      {selectedCount > 0 && (
        <p className="text-center text-xs text-gray-400 mb-5">
          These {selectedCount} experience{selectedCount !== 1 ? 's' : ''} will be passed to AI
          when generating your letter.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-6 rounded-xl border border-gray-200 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={selectedCount === 0}
          className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-200 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none hover:-translate-y-0.5 disabled:translate-y-0"
        >
          Continue to Questionnaire →
        </button>
      </div>
    </div>
  )
}
