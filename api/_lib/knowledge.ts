export interface RagRequest {
  enabled: boolean
  documentIds?: string[]
  supplementalText?: string
  topK?: number
}

export interface ChatInvokeOptions {
  systemInstruction?: string
  rag?: RagRequest
}

export interface KnowledgeMeta {
  systemInstructionApplied: boolean
  ragApplied: boolean
  ragDocumentIds?: string[]
  ragChunkCount?: number
}

export function parseChatInvokeOptions(body: unknown): ChatInvokeOptions {
  const raw = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const systemInstruction =
    typeof raw.systemInstruction === 'string' ? raw.systemInstruction.trim() : ''

  let rag: RagRequest | undefined
  const ragRaw = raw.rag
  if (ragRaw && typeof ragRaw === 'object') {
    const r = ragRaw as Record<string, unknown>
    const enabled = r.enabled === true
    if (enabled) {
      const documentIds = Array.isArray(r.documentIds)
        ? r.documentIds.filter((id): id is string => typeof id === 'string')
        : []
      const supplementalText =
        typeof r.supplementalText === 'string' ? r.supplementalText.trim() : ''
      const topK =
        typeof r.topK === 'number' && r.topK > 0 ? Math.min(12, Math.floor(r.topK)) : 5
      rag = { enabled: true, documentIds, supplementalText, topK }
    }
  }

  return {
    systemInstruction: systemInstruction || undefined,
    rag,
  }
}
