import { useEffect, useState } from 'react'
import { BookOpen, FileText } from 'lucide-react'
import { fetchRagDocuments } from '../services/rag'
import type { KnowledgeSettings, RagDocumentMeta } from '../types/knowledge'

interface KnowledgePanelProps {
  value: KnowledgeSettings
  onChange: (next: KnowledgeSettings) => void
  disabled?: boolean
}

export function KnowledgePanel({
  value,
  onChange,
  disabled,
}: KnowledgePanelProps) {
  const [documents, setDocuments] = useState<RagDocumentMeta[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchRagDocuments()
      .then((docs) => {
        if (!cancelled) setDocuments(docs)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : '문서 목록 로드 실패')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  function toggleDocument(id: string) {
    const set = new Set(value.rag.documentIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    onChange({
      ...value,
      rag: { ...value.rag, documentIds: [...set] },
    })
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/80 p-4">
      <div className="flex items-center gap-2 text-sm font-medium tracking-wide text-[var(--muted)] uppercase">
        <FileText size={16} />
        <span>Knowledge</span>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="system-instruction"
          className="block text-xs font-medium tracking-wide text-[var(--muted)] uppercase"
        >
          System instruction
        </label>
        <textarea
          id="system-instruction"
          rows={3}
          disabled={disabled}
          value={value.systemInstruction}
          onChange={(e) =>
            onChange({ ...value, systemInstruction: e.target.value })
          }
          placeholder="예: 답변은 한국어로, 기술명세서 형식으로, 표와 목록을 활용해 작성하세요."
          className="w-full resize-y rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
        />
      </div>

      <div className="space-y-3 border-t border-[var(--line)] pt-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink)]">
          <input
            type="checkbox"
            disabled={disabled}
            checked={value.rag.enabled}
            onChange={(e) =>
              onChange({
                ...value,
                rag: { ...value.rag, enabled: e.target.checked },
              })
            }
            className="h-4 w-4 rounded border-[var(--line)]"
          />
          <BookOpen size={16} className="text-[var(--accent-deep)]" />
          RAG — 프로젝트 문서 기반 응답
        </label>
        <p className="text-xs text-[var(--muted)]">
          서버의 <code className="text-[10px]">doc/</code> 폴더 문서에서 질문과
          관련된 발췌를 검색해 프롬프트에 포함합니다.
        </p>

        {value.rag.enabled && (
          <>
            {loadError && (
              <p className="text-xs text-[var(--danger)]">{loadError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => {
                const selected = value.rag.documentIds.includes(doc.id)
                return (
                  <button
                    key={doc.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDocument(doc.id)}
                    className={[
                      'rounded-full border px-2.5 py-1 text-xs font-medium transition',
                      selected
                        ? 'border-[var(--accent-deep)] bg-sky-50 text-[var(--accent-deep)]'
                        : 'border-[var(--line)] bg-white text-[var(--muted)] hover:border-sky-300',
                      disabled ? 'opacity-60' : '',
                    ].join(' ')}
                  >
                    {doc.title}
                  </button>
                )
              })}
            </div>
            <div className="space-y-1">
              <label
                htmlFor="rag-supplement"
                className="block text-xs font-medium text-[var(--muted)]"
              >
                추가 참고 텍스트 (선택)
              </label>
              <textarea
                id="rag-supplement"
                rows={2}
                disabled={disabled}
                value={value.rag.supplementalText}
                onChange={(e) =>
                  onChange({
                    ...value,
                    rag: { ...value.rag, supplementalText: e.target.value },
                  })
                }
                placeholder="붙여넣기 또는 회의록·메모 등"
                className="w-full resize-y rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
