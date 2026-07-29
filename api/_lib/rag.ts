import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface RagDocumentMeta {
  id: string
  title: string
  filename: string
}

/** Whitelist of project doc files for RAG (server-side only). */
export const RAG_DOCUMENTS: RagDocumentMeta[] = [
  {
    id: 'kpc-customers',
    title: 'KPC AI Cloud 고객 정보',
    filename: 'RAG KPC AI CLOUD 2607 CUSTOMERS INFO.txt',
  },
  {
    id: 'req-features',
    title: 'REQ Features',
    filename: 'REQ Features.md',
  },
  {
    id: 'spec-router',
    title: 'Multi LLM Router SPEC',
    filename: 'SPEC KPC Multi LLM Router by Jun.md',
  },
  {
    id: 'local-hf-models',
    title: '로컬 HF 모델 추천',
    filename: 'local-machine-hf-model-recommendations.md',
  },
  {
    id: 'local-share',
    title: '로컬 LLM 외부 공유',
    filename: '로컬 LLM 외부 공유 방법.md',
  },
]

const DOC_DIR = join(process.cwd(), 'doc')

export function listRagDocuments(): RagDocumentMeta[] {
  return RAG_DOCUMENTS
}

interface ScoredChunk {
  documentId: string
  title: string
  text: string
  score: number
}

function chunkText(text: string, maxLen = 900): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let buf = ''
  for (const p of paragraphs) {
    if ((buf + '\n\n' + p).length > maxLen && buf) {
      chunks.push(buf.trim())
      buf = p
    } else {
      buf = buf ? `${buf}\n\n${p}` : p
    }
  }
  if (buf.trim()) chunks.push(buf.trim())
  if (chunks.length === 0 && text.trim()) chunks.push(text.trim().slice(0, maxLen))
  return chunks
}

function queryTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2)
}

function scoreChunk(chunk: string, terms: string[]): number {
  if (terms.length === 0) return 0
  const lower = chunk.toLowerCase()
  let score = 0
  for (const term of terms) {
    if (lower.includes(term)) score += 1
  }
  return score
}

async function loadDocumentText(filename: string): Promise<string> {
  const path = join(DOC_DIR, filename)
  return readFile(path, 'utf8')
}

export async function retrieveRagContext(
  query: string,
  documentIds: string[],
  supplementalText: string,
  topK: number,
): Promise<ScoredChunk[]> {
  const ids = documentIds.length
    ? documentIds
    : RAG_DOCUMENTS.map((d) => d.id)
  const metaById = new Map(RAG_DOCUMENTS.map((d) => [d.id, d]))
  const terms = queryTerms(query)
  const allChunks: ScoredChunk[] = []

  for (const id of ids) {
    const meta = metaById.get(id)
    if (!meta) continue
    let text: string
    try {
      text = await loadDocumentText(meta.filename)
    } catch {
      continue
    }
    for (const chunk of chunkText(text)) {
      const score = scoreChunk(chunk, terms)
      allChunks.push({
        documentId: id,
        title: meta.title,
        text: chunk,
        score: score > 0 ? score : 0.01,
      })
    }
  }

  if (supplementalText) {
    for (const chunk of chunkText(supplementalText, 1200)) {
      allChunks.push({
        documentId: 'supplemental',
        title: '사용자 추가 문서',
        text: chunk,
        score: Math.max(scoreChunk(chunk, terms), 0.5),
      })
    }
  }

  allChunks.sort((a, b) => b.score - a.score)
  const picked: ScoredChunk[] = []
  const seen = new Set<string>()
  for (const c of allChunks) {
    const key = `${c.documentId}:${c.text.slice(0, 80)}`
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(c)
    if (picked.length >= topK) break
  }

  if (picked.length === 0 && supplementalText) {
    picked.push({
      documentId: 'supplemental',
      title: '사용자 추가 문서',
      text: supplementalText.slice(0, 4000),
      score: 1,
    })
  }

  return picked
}

export function buildRagUserPrompt(userPrompt: string, chunks: ScoredChunk[]): string {
  if (chunks.length === 0) return userPrompt

  const excerpts = chunks
    .map(
      (c, i) =>
        `[${i + 1}] (${c.title})\n${c.text}`,
    )
    .join('\n\n---\n\n')

  return `Use the reference excerpts below for factual content. For response language, persona, tone, and format, always follow the system instructions (and any [System instruction — mandatory] block in the user message).

=== Reference excerpts ===
${excerpts}

=== User question ===
${userPrompt}`
}
