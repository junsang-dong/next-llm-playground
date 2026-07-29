export interface RagDocumentMeta {
  id: string
  title: string
  filename: string
}

export interface RagSettings {
  enabled: boolean
  documentIds: string[]
  supplementalText: string
}

export interface KnowledgeSettings {
  systemInstruction: string
  rag: RagSettings
}

export const SYSTEM_INSTRUCTION_STORAGE_KEY = 'multi-llm-system-instruction'
export const RAG_SETTINGS_STORAGE_KEY = 'multi-llm-rag-settings'

export const DEFAULT_KNOWLEDGE_SETTINGS: KnowledgeSettings = {
  systemInstruction: '',
  rag: {
    enabled: false,
    documentIds: ['kpc-customers'],
    supplementalText: '',
  },
}

export function buildKnowledgePayload(settings: KnowledgeSettings): {
  systemInstruction?: string
  rag?: {
    enabled: boolean
    documentIds: string[]
    supplementalText?: string
    topK: number
  }
} {
  const systemInstruction = settings.systemInstruction.trim()
  const payload: {
    systemInstruction?: string
    rag?: {
      enabled: boolean
      documentIds: string[]
      supplementalText?: string
      topK: number
    }
  } = {}

  if (systemInstruction) {
    payload.systemInstruction = systemInstruction
  }

  if (settings.rag.enabled) {
    payload.rag = {
      enabled: true,
      documentIds: settings.rag.documentIds,
      supplementalText: settings.rag.supplementalText.trim() || undefined,
      topK: 5,
    }
  }

  return payload
}
