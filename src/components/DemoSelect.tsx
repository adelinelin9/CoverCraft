import { Code2, TrendingUp, Activity } from 'lucide-react'
import type { DemoScenario } from '../demo'

interface Props {
  scenarios: DemoScenario[]
  onSelect: (scenarioId: string) => void
  onBack: () => void
}

const ICONS = {
  cs: Code2,
  marketing: TrendingUp,
  healthcare: Activity,
} as const

export default function DemoSelect({ scenarios, onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Try a demo</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Pick a scenario to see how CoverCraft works with your field. No account or resume
            needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10">
          {scenarios.map((scenario) => {
            const Icon = ICONS[scenario.iconKey]
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onSelect(scenario.id)}
                className="group text-left bg-white rounded-2xl border border-purple-100 p-6 shadow-sm hover:border-purple-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-purple-50 group-hover:bg-purple-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{scenario.title}</h3>
                <p className="text-sm text-gray-500 leading-snug mb-4">{scenario.subtitle}</p>
                <span className="inline-flex items-center text-xs font-semibold text-purple-600 group-hover:text-purple-800 transition-colors">
                  Start demo →
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </div>
  )
}
