export type ResponseViewMode = 'markdown' | 'webview'

interface ResponseViewToggleProps {
  value: ResponseViewMode
  onChange: (mode: ResponseViewMode) => void
}

export function ResponseViewToggle({
  value,
  onChange,
}: ResponseViewToggleProps) {
  return (
    <div
      className="inline-flex w-full rounded-xl border border-[var(--line)] bg-white/80 p-1 shadow-sm sm:w-auto"
      role="tablist"
      aria-label="응답 보기 방식"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'markdown'}
        onClick={() => onChange('markdown')}
        className={[
          'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none',
          value === 'markdown'
            ? 'bg-[var(--accent-deep)] text-white'
            : 'text-[var(--muted)] hover:text-[var(--ink)]',
        ].join(' ')}
      >
        마크다운 보기
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'webview'}
        onClick={() => onChange('webview')}
        className={[
          'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none',
          value === 'webview'
            ? 'bg-[var(--accent-deep)] text-white'
            : 'text-[var(--muted)] hover:text-[var(--ink)]',
        ].join(' ')}
      >
        웹뷰 보기
      </button>
    </div>
  )
}
