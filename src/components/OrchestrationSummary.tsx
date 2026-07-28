import type { AutoChatResult } from '../types'
import { PROVIDER_LABELS } from '../types'
import { formatElapsed } from '../utils/format'

interface OrchestrationSummaryProps {
  orchestration: AutoChatResult['orchestration']
}

export function OrchestrationSummary({
  orchestration,
}: OrchestrationSummaryProps) {
  const { selectedProvider, votes, routingElapsed } = orchestration

  return (
    <details className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-left">
      <summary className="cursor-pointer list-none font-medium text-violet-900 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-violet-600 px-2 py-0.5 text-xs font-semibold tracking-wide text-white uppercase">
            AUTO
          </span>
          <span>
            협의 결과 → {PROVIDER_LABELS[selectedProvider]} (
            {formatElapsed(routingElapsed)} 협의)
          </span>
        </span>
      </summary>
      <ul className="mt-4 space-y-3 border-t border-violet-200/80 pt-4">
        {votes.length === 0 ? (
          <li className="text-sm text-violet-800/80">
            유효한 표가 없어 기본 규칙으로 모델을 선택했습니다.
          </li>
        ) : (
          votes.map((vote) => (
            <li
              key={vote.voter}
              className="rounded-xl border border-white/80 bg-white/60 px-3 py-2 text-sm"
            >
              <div className="font-[family-name:var(--mono)] text-xs text-[var(--muted)]">
                {PROVIDER_LABELS[vote.voter]} →{' '}
                {PROVIDER_LABELS[vote.recommended]}
              </div>
              <p className="mt-1 text-slate-800">{vote.reason}</p>
            </li>
          ))
        )}
      </ul>
    </details>
  )
}
