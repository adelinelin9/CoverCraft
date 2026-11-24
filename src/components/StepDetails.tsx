import { useState, useRef, useEffect } from 'react'
import { FileText, Briefcase, AlertCircle, Upload, Loader2 } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import ErrorBanner from './ErrorBanner'

interface Props {
  resume: string
  jobDescription: string
  onChange: (field: 'resume' | 'jobDescription', value: string) => void
  onAnalyze: () => Promise<void>
  /** Skips AI analysis and loads the full demo experience */
  onFillDemo: () => void
  isDemo: boolean
}

const MIN_CHARS = 50

type PdfState = 'idle' | 'loading' | 'done' | 'error'

function CharCount({ value, min }: { value: string; min: number }) {
  const len = value.trim().length
  const met = len >= min
  return (
    <span className={`text-xs tabular-nums ${met ? 'text-gray-300' : 'text-gray-400'}`}>
      {len < min ? `${min - len} more characters needed` : `${len} characters`}
    </span>
  )
}

export default function StepDetails({ resume, jobDescription, onChange, onAnalyze, onFillDemo, isDemo }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ resume: false, job: false })

  const [pdfState, setPdfState] = useState<PdfState>('idle')
  const [pdfFilename, setPdfFilename] = useState('')
  const [pdfError, setPdfError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // When resume is externally cleared (e.g. Get Started reset), clear the PDF badge too
  useEffect(() => {
    if (!resume && pdfState === 'done') {
      setPdfState('idle')
      setPdfFilename('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [resume, pdfState])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected after clearing
    e.target.value = ''

    setPdfFilename(file.name)
    setPdfState('loading')
    setPdfError('')

    try {
      const { extractPdfText } = await import('../utils/extractPdfText')
      const text = await extractPdfText(file)
      onChange('resume', text)
      setPdfState('done')
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Could not read the PDF. Please try again.')
      setPdfState('error')
    }
  }

  function handleClearPdf() {
    setPdfState('idle')
    setPdfFilename('')
    setPdfError('')
    onChange('resume', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const resumeInvalid = touched.resume && resume.trim().length < MIN_CHARS
  const jobInvalid = touched.job && jobDescription.trim().length < MIN_CHARS

  async function handleAnalyze() {
    if (pdfState === 'loading') return
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
          Upload or paste your resume, then add the job description.
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

          {/* PDF upload zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {pdfState === 'idle' && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-500 hover:border-purple-400 hover:bg-purple-50/60 transition-colors"
              >
                <Upload className="w-4 h-4 shrink-0" />
                Upload PDF
                <span className="text-gray-300 hidden sm:inline">— or paste below</span>
              </button>
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                We'll automatically extract the text so you can review or edit it before continuing.
              </p>
            </div>
          )}

          {pdfState === 'loading' && (
            <div className="w-full mb-2 flex items-center gap-2 border border-purple-100 rounded-xl px-4 py-2.5 bg-purple-50 text-sm text-purple-600">
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              <span className="truncate">Extracting text from {pdfFilename}…</span>
            </div>
          )}

          {pdfState === 'done' && (
            <div className="w-full mb-2 flex items-center justify-between border border-purple-200 rounded-xl px-4 py-2.5 bg-purple-50">
              <div className="flex items-center gap-2 text-sm text-purple-700 min-w-0">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{pdfFilename}</span>
              </div>
              <button
                type="button"
                onClick={handleClearPdf}
                className="ml-3 shrink-0 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {pdfState === 'error' && (
            <div className="w-full mb-2 border border-red-200 rounded-xl px-4 py-3 bg-red-50">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 flex-1">{pdfError}</p>
                <button
                  type="button"
                  onClick={() => { setPdfState('idle'); setPdfError('') }}
                  className="ml-2 shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Dismiss
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 ml-6 text-xs text-red-600 hover:text-red-800 font-medium underline underline-offset-2"
              >
                Try a different file
              </button>
            </div>
          )}

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
              disabled={pdfState === 'loading'}
              className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0"
            >
              Analyze My Experience →
            </button>
            {!isDemo && (
              <button
                type="button"
                onClick={onFillDemo}
                className="bg-white hover:bg-purple-50 text-purple-600 font-medium py-3 px-5 rounded-xl border border-purple-200 transition-colors text-sm"
              >
                Try Demo Instead
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
