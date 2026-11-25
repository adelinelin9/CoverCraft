import { useState, useRef, useEffect } from 'react'
import { Copy, CheckCheck, Sparkles, RotateCcw, Lightbulb, ChevronDown, ChevronUp, RefreshCw, Pencil, Loader2, Check, X, Info } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import ErrorBanner from './ErrorBanner'
import { reviseCoverLetter } from '../services/api'

type RevisionState = 'idle' | 'loading' | 'preview'

interface Props {
  coverLetter: string
  suggestions: string[]
  isDemo: boolean
  /** True when the user changed their selections or questionnaire after generating */
  isStale: boolean
  /** The last AI-generated version — lifted to App so it survives step navigation */
  aiVersion: string
  /** Draft counter — lifted to App so it survives step navigation */
  draftVersion: number
  onDraftVersionChange: (v: number) => void
  /** Applied suggestion indices — lifted to App so they survive step navigation */
  appliedSuggestions: Set<number>
  onAppliedSuggestionsChange: (s: Set<number>) => void
  onChange: (value: string) => void
  /** Returns the newly generated letter so we can track the "clean" version */
  onRegenerate: () => Promise<string>
  onBack: () => void
  /** Called when revision preview is entered or exited so App can guard ProgressBar navigation */
  onRevisionProgressChange: (inProgress: boolean) => void
  /** Resets all state and starts the real Get Started workflow from Step 1 */
  onGetStarted: () => void
}

export default function StepCoverLetter({
  coverLetter,
  suggestions,
  isDemo,
  isStale,
  aiVersion,
  draftVersion,
  onDraftVersionChange,
  appliedSuggestions,
  onAppliedSuggestionsChange,
  onChange,
  onRegenerate,
  onBack,
  onRevisionProgressChange,
  onGetStarted,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Derived: true when the current letter differs from the last AI-generated version
  const isEdited = coverLetter !== aiVersion

  // Revision state
  const [revisionState, setRevisionState] = useState<RevisionState>('idle')
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null)
  const [pendingRevision, setPendingRevision] = useState('')
  const [preRevisionSnapshot, setPreRevisionSnapshot] = useState('')
  const [previewTab, setPreviewTab] = useState<'before' | 'after'>('after')
  const [confirmNav, setConfirmNav] = useState(false)

  // Keep App in sync so ProgressBar navigation can be disabled during preview.
  // The cleanup fires on unmount (e.g. logo → home), preventing stale `true` in App.
  useEffect(() => {
    onRevisionProgressChange(revisionState === 'preview')
    return () => onRevisionProgressChange(false)
  }, [revisionState, onRevisionProgressChange])

  function handleBack() {
    if (revisionState === 'preview') {
      setConfirmNav(true)
      return
    }
    onBack()
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coverLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 4000)
    } catch {
      setError('Could not access your clipboard. Select the letter and copy it manually.')
    }
  }

  async function handleApplySuggestion(suggestion: string, index: number) {
    setApplyingIndex(index)
    setRevisionState('loading')
    setPreRevisionSnapshot(coverLetter)
    setError(null)
    setInfoMessage(null)

    try {
      const { revisedLetter } = await reviseCoverLetter({ coverLetter, suggestion })

      if (revisedLetter.trim() === coverLetter.trim()) {
        setInfoMessage('No changes were made. This suggestion may require additional information. Try another suggestion or edit your letter manually.')
        setRevisionState('idle')
        setApplyingIndex(null)
        return
      }

      setPendingRevision(revisedLetter)
      setPreviewTab('after')
      setRevisionState('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not apply the suggestion. Please try again.')
      setRevisionState('idle')
      setApplyingIndex(null)
    }
  }

  function handleAcceptRevision() {
    onChange(pendingRevision)
    // Keep aiVersion as the original AI letter — the revised letter counts as an edit
    // so the existing Edited badge and Regenerate confirmation remain consistent
    onAppliedSuggestionsChange(new Set(appliedSuggestions).add(applyingIndex!))
    onDraftVersionChange(draftVersion + 1)
    setRevisionState('idle')
    setApplyingIndex(null)
    setPendingRevision('')
    setPreRevisionSnapshot('')
  }

  function handleUndoRevision() {
    // App state (coverLetter) was never changed during preview — just clear local state
    setRevisionState('idle')
    setApplyingIndex(null)
    setPendingRevision('')
    setPreRevisionSnapshot('')
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
      await onRegenerate()
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

      {infoMessage && (
        <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-5">
          <Info className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
          <p className="flex-1 text-sm text-purple-800">{infoMessage}</p>
          <button
            type="button"
            onClick={() => setInfoMessage(null)}
            className="text-purple-400 hover:text-purple-600 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
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
            Cover Letter · Draft {draftVersion}
          </span>
          {revisionState === 'preview' ? (
            <div className="flex gap-1">
              {(['before', 'after'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPreviewTab(tab)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors capitalize ${
                    previewTab === tab
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-400 hover:text-purple-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : isEdited ? (
            <span className="text-xs text-gray-400 italic">Edited</span>
          ) : (
            <button
              type="button"
              onClick={() => textareaRef.current?.focus()}
              className="flex items-center gap-1.5 text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors py-1.5 px-2.5 -mr-2 rounded-lg hover:bg-purple-100/60"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Letter
            </button>
          )}
        </div>
        <textarea
          ref={textareaRef}
          value={
            revisionState === 'preview'
              ? previewTab === 'after'
                ? pendingRevision
                : preRevisionSnapshot
              : coverLetter
          }
          onChange={(e) => revisionState === 'idle' && onChange(e.target.value)}
          readOnly={revisionState !== 'idle'}
          className={`w-full px-5 py-4 text-sm text-gray-700 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-purple-200 min-h-[16rem] sm:min-h-[28rem] transition-colors ${
            revisionState !== 'idle' ? 'cursor-default bg-gray-50/40' : 'cursor-text'
          }`}
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        />
      </div>

      {/* Revision preview banner */}
      {revisionState === 'preview' && (
        <div className="mb-5 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
            <p className="text-sm text-purple-800 font-medium">
              Review the revision — toggle Before / After above to compare.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUndoRevision}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Undo
            </button>
            <button
              type="button"
              onClick={handleAcceptRevision}
              className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Save Draft
            </button>
          </div>
        </div>
      )}

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
            <ul className="px-5 pb-4 space-y-3 border-t border-purple-100">
              {suggestions.map((s, i) => {
                const isApplied = appliedSuggestions.has(i)
                const isCurrentlyApplying = applyingIndex === i && revisionState === 'loading'
                const applyDisabled = revisionState !== 'idle' || loading || isApplied || isDemo

                return (
                  <li key={i} className="pt-3">
                    <button
                      type="button"
                      onClick={() => !applyDisabled && handleApplySuggestion(s, i)}
                      disabled={applyDisabled}
                      className={`w-full flex items-start gap-2 text-sm text-left rounded-xl border px-3 py-2.5 transition-colors ${
                        isCurrentlyApplying
                          ? 'bg-purple-50 border-purple-200 text-purple-600 cursor-wait'
                          : isApplied
                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-default'
                            : applyDisabled
                              ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-white hover:bg-purple-50 border-purple-200 text-purple-800 hover:border-purple-300'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0 text-purple-400 font-bold">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <span className="leading-relaxed block">{s}</span>
                        <span className="mt-1.5 text-xs font-medium inline-flex items-center gap-1.5">
                          {isCurrentlyApplying ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Creating draft…
                            </>
                          ) : isApplied ? (
                            <>
                              <Check className="w-3 h-3" />
                              Draft created
                            </>
                          ) : isDemo ? (
                            'Available outside demo mode'
                          ) : (
                            'Click to create a new draft'
                          )}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* Demo mode — nudge toward real workflow */}
      {isDemo && suggestions.length > 0 && (
        <p className="text-xs text-center text-purple-400 mb-5 leading-relaxed">
          <Sparkles className="inline w-3 h-3 mr-0.5 -mt-px" />
          Want to apply AI suggestions to your own cover letter?{' '}
          <button
            type="button"
            onClick={onGetStarted}
            className="font-semibold text-purple-500 hover:text-purple-700 underline underline-offset-2 transition-colors"
          >
            Get Started
          </button>
          {' '}to personalize your experience.
        </p>
      )}

      {/* Navigation guard — shown when user tries to leave during revision preview */}
      {confirmNav && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 mb-3">
            You have an unsaved AI revision. What would you like to do?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { handleAcceptRevision(); onBack() }}
              className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Save & Leave
            </button>
            <button
              type="button"
              onClick={() => { handleUndoRevision(); onBack() }}
              className="bg-white hover:bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-lg border border-amber-200 transition-colors"
            >
              Discard & Leave
            </button>
            <button
              type="button"
              onClick={() => setConfirmNav(false)}
              className="bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors"
            >
              Keep Reviewing
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Regenerating your cover letter…" />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-5 rounded-xl border border-gray-200 transition-colors text-sm"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={revisionState !== 'idle'}
              className="flex items-center gap-2 bg-white hover:bg-purple-50 disabled:bg-gray-50 disabled:border-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed text-purple-600 font-medium py-3 px-5 rounded-xl border border-purple-200 transition-colors text-sm"
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
