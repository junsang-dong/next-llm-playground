import { Trash2 } from 'lucide-react'
import type { HistoryEntry } from '../types/history'

interface HistoryListProps {
  entries: HistoryEntry[]
  selectedId: string | null
  onSelect: (entry: HistoryEntry) => void
  onClear: () => void
}

function formatWhen(ts: number): string {
  return new Date(ts).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HistoryList({
  entries,
  selectedId,
  onSelect,
  onClear,
}: HistoryListProps) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-2 flex justify-end px-1">
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600"
            title="전체 삭제"
          >
            <Trash2 size={12} />
            전체 삭제
          </button>
        )}
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <li className="rounded-lg border border-dashed border-[var(--line)] px-3 py-4 text-center text-xs text-[var(--muted)]">
            질문·답변이 여기에 저장됩니다
          </li>
        ) : (
          entries.map((entry) => {
            const selected = entry.id === selectedId
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className={[
                'w-full rounded-lg border px-3 py-2 text-left transition',
                selected
                  ? 'border-sky-200 bg-white shadow-sm ring-1 ring-sky-100'
                  : 'border-transparent hover:bg-slate-200/50',
                  ].join(' ')}
                >
                  <div className="line-clamp-2 text-sm font-medium text-[var(--ink)]">
                    {entry.title}
                  </div>
                  <div className="mt-1 font-[family-name:var(--mono)] text-[10px] text-[var(--muted)]">
                    {entry.mode.toUpperCase()} · {formatWhen(entry.createdAt)}
                  </div>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
