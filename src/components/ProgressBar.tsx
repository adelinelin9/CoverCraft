interface Props {
  currentStep: number
  /** If provided, completed steps become clickable back-links */
  onNavigate?: (step: number) => void
}

const STEPS = ['Your Details', 'Experience Matches', 'Personalize', 'Your Cover Letter']

export default function ProgressBar({ currentStep, onNavigate }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between relative">
        {/* track background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-purple-100 z-0" />
        {/* track fill */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-purple-400 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((label, i) => {
          const stepNum = i + 1
          const done = stepNum < currentStep
          const active = stepNum === currentStep
          const clickable = done && !!onNavigate

          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-1.5">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onNavigate(stepNum)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  done
                    ? 'bg-purple-500 text-white'
                    : active
                      ? 'bg-white border-2 border-purple-500 text-purple-600'
                      : 'bg-white border-2 border-purple-100 text-purple-200'
                } ${clickable ? 'cursor-pointer hover:bg-purple-600 hover:scale-110' : 'cursor-default'}`}
                aria-label={clickable ? `Go back to ${label}` : label}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : stepNum}
              </button>
              <span
                className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${
                  active
                    ? 'text-purple-700'
                    : done
                      ? clickable
                        ? 'text-purple-500 underline underline-offset-2 cursor-pointer'
                        : 'text-purple-400'
                      : 'text-gray-300'
                }`}
                onClick={() => clickable && onNavigate(stepNum)}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
