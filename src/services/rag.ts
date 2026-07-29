import type { RagDocumentMeta } from '../types/knowledge'

export async function fetchRagDocuments(): Promise<RagDocumentMeta[]> {
  const res = await fetch('/api/rag/documents')
  if (!res.ok) {
    throw new Error('RAG 문서 목록을 불러오지 못했습니다')
  }
  const data = (await res.json()) as { documents?: RagDocumentMeta[] }
  return data.documents ?? []
}
