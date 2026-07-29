import { useState } from 'react'
import type { AutoChatResult, ChatResult } from '../types'
import { isAutoChatResult } from '../types'
import { CostCard } from './CostCard'
import { OrchestrationSummary } from './OrchestrationSummary'
import { ResponseCard } from './ResponseCard'
import { ResponseViewToggle } from './ResponseViewToggle'
import type { ResponseViewMode } from './ResponseViewToggle'
import { SpeedCard } from './SpeedCard'
import { KnowledgeBadge } from './KnowledgeBadge'

interface ChatWindowProps {
  result: ChatResult | AutoChatResult | null
  loading: boolean
  error: string | null
  autoMode?: boolean
}

export function ChatWindow({
  result,
  loading,
  error,
  autoMode = false,
}: ChatWindowProps) {
  const [viewMode, setViewMode] = useState<ResponseViewMode>('markdown')

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50/60 px-5 py-10 text-center text-[var(--muted)]">
        {autoMode
          ? '멀티 LLM이 질문을 분석하고 최적 모델을 협의하는 중…'
          : '모델을 호출하는 중…'}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left text-red-700">
        {error}
      </div>
    )
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 px-5 py-10 text-center text-[var(--muted)]">
        프롬프트를 입력하고 모델을 호출해 보세요.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ResponseViewToggle value={viewMode} onChange={setViewMode} />
      <KnowledgeBadge knowledge={result.knowledge} />
      {isAutoChatResult(result) && (
        <OrchestrationSummary orchestration={result.orchestration} />
      )}
      <ResponseCard result={result} viewMode={viewMode} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SpeedCard elapsed={result.elapsed} />
        <CostCard
          inputTokens={result.inputTokens}
          outputTokens={result.outputTokens}
          estimatedCost={result.estimatedCost}
        />
      </div>
    </div>
  )
}
