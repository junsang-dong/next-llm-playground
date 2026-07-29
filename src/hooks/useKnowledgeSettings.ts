import { useCallback, useState } from 'react'
import {
  DEFAULT_KNOWLEDGE_SETTINGS,
  RAG_SETTINGS_STORAGE_KEY,
  SYSTEM_INSTRUCTION_STORAGE_KEY,
  type KnowledgeSettings,
} from '../types/knowledge'

function readKnowledgeSettings(): KnowledgeSettings {
  try {
    const sys = localStorage.getItem(SYSTEM_INSTRUCTION_STORAGE_KEY)
    const ragRaw = localStorage.getItem(RAG_SETTINGS_STORAGE_KEY)
    let rag = DEFAULT_KNOWLEDGE_SETTINGS.rag
    if (ragRaw) {
      const parsed = JSON.parse(ragRaw) as Partial<KnowledgeSettings['rag']>
      rag = {
        enabled: Boolean(parsed.enabled),
        documentIds: Array.isArray(parsed.documentIds)
          ? parsed.documentIds.filter((id): id is string => typeof id === 'string')
          : DEFAULT_KNOWLEDGE_SETTINGS.rag.documentIds,
        supplementalText:
          typeof parsed.supplementalText === 'string' ? parsed.supplementalText : '',
      }
    }
    return {
      systemInstruction: typeof sys === 'string' ? sys : '',
      rag,
    }
  } catch {
    return DEFAULT_KNOWLEDGE_SETTINGS
  }
}

export function useKnowledgeSettings(): [
  KnowledgeSettings,
  (next: KnowledgeSettings) => void,
] {
  const [settings, setSettingsState] = useState<KnowledgeSettings>(readKnowledgeSettings)

  const setSettings = useCallback((next: KnowledgeSettings) => {
    setSettingsState(next)
    try {
      localStorage.setItem(SYSTEM_INSTRUCTION_STORAGE_KEY, next.systemInstruction)
      localStorage.setItem(RAG_SETTINGS_STORAGE_KEY, JSON.stringify(next.rag))
    } catch {
      /* private mode */
    }
  }, [])

  return [settings, setSettings]
}
