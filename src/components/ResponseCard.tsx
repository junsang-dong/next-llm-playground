import type { AutoChatResult, ChatResult } from '../types'
import { isAutoChatResult, PROVIDER_LABELS } from '../types'
import { qualityScore, stars } from '../utils/qualityScore'
import type { ResponseViewMode } from './ResponseViewToggle'
import { MarkdownWebView } from './MarkdownWebView'

interface ResponseCardProps {
  result: ChatResult | AutoChatResult
  viewMode: ResponseViewMode
}

export function ResponseCard({ result, viewMode }: ResponseCardProps) {
  const score = qualityScore(result.response)

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white/90 p-5 text-left shadow-sm">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-[family-name:var(--display)] text-xl font-semibold">
          {isAutoChatResult(result) ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white uppercase">
                AUTO → {PROVIDER_LABELS[result.orchestration.selectedProvider]}
              </span>
              <span className="text-lg">{PROVIDER_LABELS[result.provider]}</span>
            </span>
          ) : (
            PROVIDER_LABELS[result.provider]
          )}
        </h3>
        <span className="font-[family-name:var(--mono)] text-sm text-amber-600">
          {stars(score)}
        </span>
      </header>
      <div className="font-[family-name:var(--mono)] text-xs text-[var(--muted)] mb-2">
        {result.model}
      </div>
      {viewMode === 'markdown' ? (
        <div className="max-h-[32rem] overflow-auto whitespace-pre-wrap font-[family-name:var(--mono)] text-[14px] leading-relaxed text-slate-800">
          {result.response}
        </div>
      ) : (
        <MarkdownWebView content={result.response} />
      )}
    </section>
  )
}
