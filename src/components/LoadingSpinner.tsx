interface Props {
  message?: string
}

export default function LoadingSpinner({ message = 'Working on it…' }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
        <div className="absolute inset-0 rounded-full border-4 border-purple-400 border-t-transparent animate-spin" />
      </div>
      <p className="text-purple-700 font-medium text-sm">{message}</p>
    </div>
  )
}
