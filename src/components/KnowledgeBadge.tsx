import type { KnowledgeMeta } from '../types'

interface KnowledgeBadgeProps {
  knowledge?: KnowledgeMeta
}

export function KnowledgeBadge({ knowledge }: KnowledgeBadgeProps) {
  if (!knowledge) return null
  if (!knowledge.systemInstructionApplied && !knowledge.ragApplied) return null

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {knowledge.systemInstructionApplied && (
        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-violet-800">
          System instruction 적용
        </span>
      )}
      {knowledge.ragApplied && (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-emerald-800">
          RAG {knowledge.ragChunkCount ?? 0}개 발췌
        </span>
      )}
    </div>
  )
}
