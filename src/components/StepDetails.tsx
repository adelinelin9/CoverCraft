import { useState } from 'react'
import { FileText, Briefcase, AlertCircle } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import ErrorBanner from './ErrorBanner'

interface Props {
  resume: string
  jobDescription: string
  onChange: (field: 'resume' | 'jobDescription', value: string) => void
  onAnalyze: () => Promise<void>
  /** Skips AI analysis and loads the full demo experience */
  onFillDemo: () => void
}

const MIN_CHARS = 50

function CharCount({ value, min }: { value: string; min: number }) {
  const len = value.trim().length
  const met = len >= min
  return (
    <span className={`text-xs tabular-nums ${met ? 'text-gray-300' : 'text-gray-400'}`}>
      {len < min ? `${min - len} more characters needed` : `${len} characters`}
    </span>
  )
}

export default function StepDetails({ resume, jobDescription, onChange, onAnalyze, onFillDemo }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ resume: false, job: false })

  const resumeInvalid = touched.resume && resume.trim().length < MIN_CHARS
  const jobInvalid = touched.job && jobDescription.trim().length < MIN_CHARS

  async function handleAnalyze() {
    setTouched({ resume: true, job: true })
    if (resume.trim().length < MIN_CHARS || jobDescription.trim().length < MIN_CHARS) return
    setLoading(true)
    setError(null)
    try {
      await onAnalyze()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Add your details</h2>
        <p className="text-gray-500 text-sm">
          Paste your resume and the job description you're applying for.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="space-y-5">
        {/* Resume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 text-purple-500" />
              Your Resume
            </label>
            <CharCount value={resume} min={MIN_CHARS} />
          </div>
          <textarea
            value={resume}
            onChange={(e) => onChange('resume', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, resume: true }))}
            placeholder="Paste your resume here — experience, education, skills, etc."
            rows={10}
            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-y transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 ${
              resumeInvalid ? 'border-red-300 bg-red-50' : 'border-purple-100 bg-white'
            }`}
          />
          {resumeInvalid && (
            <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3" />
              Please paste your resume (at least {MIN_CHARS} characters).
            </p>
          )}
        </div>

        {/* Job Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Briefcase className="w-4 h-4 text-purple-500" />
              Job Description
            </label>
            <CharCount value={jobDescription} min={MIN_CHARS} />
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => onChange('jobDescription', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, job: true }))}
            placeholder="Paste the job description here — responsibilities, requirements, etc."
            rows={8}
            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-y transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 ${
              jobInvalid ? 'border-red-300 bg-red-50' : 'border-purple-100 bg-white'
            }`}
          />
          {jobInvalid && (
            <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3" />
              Please paste the job description (at least {MIN_CHARS} characters).
            </p>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Analyzing your experience against the job…" />
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Analyze My Experience →
            </button>
            <button
              type="button"
              onClick={onFillDemo}
              className="bg-white hover:bg-purple-50 text-purple-600 font-medium py-3 px-5 rounded-xl border border-purple-200 transition-colors text-sm"
            >
              Try Demo Instead
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
