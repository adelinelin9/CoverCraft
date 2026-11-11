import { FileText, Sparkles, PenLine, FileCheck, ArrowRight } from 'lucide-react'

interface Props {
  onGetStarted: () => void
  onDemo: () => void
}

export default function HomePage({ onGetStarted, onDemo }: Props) {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-800 text-lg">CoverCraft</span>
        </div>
        <button
          onClick={onDemo}
          className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
        >
          Try Demo
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-3xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 text-purple-700 text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Assisted Cover Letters
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
          Cover letters that{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-600">
            actually sound like you
          </span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          Paste your resume and a job description. CoverCraft's AI surfaces your most relevant
          experience, then guides you through writing a letter that's genuinely yours.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <button
            onClick={onGetStarted}
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onDemo}
            className="flex items-center justify-center gap-2 bg-white hover:bg-purple-50 text-purple-700 font-semibold px-8 py-3.5 rounded-xl border border-purple-200 transition-all duration-200"
          >
            See a Demo
          </button>
        </div>

        {/* How it works — 4 steps, 2×2 grid */}
        <div className="grid grid-cols-2 gap-4 w-full text-left">
          {[
            {
              icon: FileText,
              title: '1. Add your details',
              desc: 'Paste your resume and the job description. No account needed.',
            },
            {
              icon: Sparkles,
              title: '2. Review AI matches',
              desc: 'See which of your experiences best match the role and choose what to highlight.',
            },
            {
              icon: PenLine,
              title: '3. Personalize your letter',
              desc: 'Answer a few questions in your own words so the letter sounds like you.',
            },
            {
              icon: FileCheck,
              title: '4. Review your cover letter',
              desc: 'Read the draft, make any edits you want, then copy it.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        CS 356 Human-Computer Interaction · BYU
      </footer>
    </div>
  )
}
