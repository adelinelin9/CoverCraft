import { AlertCircle, X } from 'lucide-react'

interface Props {
  message: string
  onDismiss: () => void
}

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onDismiss} className="shrink-0 hover:text-red-900 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
