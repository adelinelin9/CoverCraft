import { useState, useRef } from 'react'
import { Copy, CheckCheck, Sparkles, RotateCcw, Lightbulb, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import ErrorBanner from './ErrorBanner'

interface Props {
  coverLetter: string
  suggestions: string[]
  isDemo: boolean
  /** True when the user changed their selections or questionnaire after generating */
  isStale: boolean
  onChange: (value: string) => void
  /** Returns the newly generated letter so we can track the "clean" version */
  onRegenerate: () => Promise<string>
  onBack: () => void
}

export default function StepCoverLetter({
  coverLetter,
  suggestions,
  isDemo,
  isStale,
  onChange,
  onRegenerate,
  onBack,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(true)

  // Track the last AI-generated version so we can detect user edits
  const aiVersionRef = useRef(coverLetter)
  const isEdited = coverLetter !== aiVersionRef.current

  async function handleCopy() {
    await navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 4000)
  }

  async function handleRegenerate() {
    if (isEdited && !confirmRegen) {
      setConfirmRegen(true)
      return
    }
    setConfirmRegen(false)
    setLoading(true)
    setError(null)
    try {
      const newLetter = await onRegenerate()
      aiVersionRef.current = newLetter
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pb-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cover letter</h2>
        <p className="text-gray-500 text-sm">
          Read it through, make any edits you'd like, then copy it.
        </p>
        {isDemo && (
          <div className="inline-flex items-center gap-1.5 mt-3 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-amber-700 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            Demo mode — sample cover letter
          </div>
        )}
      </div>

      {/* Stale-letter notice — shown when inputs changed since generation */}
      {isStale && !loading && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <RefreshCw className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800">
              Your selections or answers changed since this letter was generated. Your current
              letter is preserved — regenerate when you're ready to update it.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {confirmRegen && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 mb-3">
            You've edited the letter. Regenerating will replace your edits. Continue?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRegenerate}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Yes, regenerate
            </button>
            <button
              type="button"
              onClick={() => setConfirmRegen(false)}
              className="bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Letter editor */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm mb-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-purple-50 bg-purple-50/50">
          <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
            Cover Letter
          </span>
          {isEdited && (
            <span className="text-xs text-gray-400 italic">Edited</span>
          )}
        </div>
        <textarea
          value={coverLetter}
          onChange={(e) => onChange(e.target.value)}
          rows={18}
          className="w-full px-5 py-4 text-sm text-gray-700 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-purple-200"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        />
      </div>

      {/* AI Suggestions — collapsible so they don't compete with the letter */}
      {suggestions.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl mb-5 overflow-hidden">
          <button
            type="button"
            onClick={() => setSuggestionsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-purple-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-purple-700">
                AI Suggestions ({suggestions.length})
              </span>
            </div>
            {suggestionsOpen ? (
              <ChevronUp className="w-4 h-4 text-purple-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-400" />
            )}
          </button>
          {suggestionsOpen && (
            <ul className="px-5 pb-4 space-y-2.5 border-t border-purple-100">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-purple-800 pt-2.5">
                  <span className="mt-0.5 shrink-0 text-purple-400 font-bold">{i + 1}.</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Regenerating your cover letter…" />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBack}
              className="bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-5 rounded-xl border border-gray-200 transition-colors text-sm"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              className="flex items-center gap-2 bg-white hover:bg-purple-50 text-purple-600 font-medium py-3 px-5 rounded-xl border border-purple-200 transition-colors text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>

          {/* Copy confirmation message */}
          {copied && (
            <p className="text-center text-sm text-green-600 font-medium mt-3">
              Your cover letter is ready to use. Good luck! 🎉
            </p>
          )}
        </>
      )}
    </div>
  )
}
