import type { HistoryEntry } from '../types/history'
import { historyModeFromApp, titleFromPrompt } from '../types/history'
import type {
  AutoChatResult,
  ChatProviderSelection,
  ChatResult,
  CompareItem,
} from '../types'

export const HISTORY_STORAGE_KEY = 'multi-llm-playground-history'
export const HISTORY_MAX = 50

export function prependHistory(
  entries: HistoryEntry[],
  entry: Omit<HistoryEntry, 'id' | 'title' | 'createdAt'>,
): HistoryEntry[] {
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    title: titleFromPrompt(entry.prompt),
    createdAt: Date.now(),
  }
  return [full, ...entries].slice(0, HISTORY_MAX)
}

export function buildHistoryPayload(params: {
  prompt: string
  mode: 'chat' | 'compare'
  provider: ChatProviderSelection
  model?: string
  chatResult?: ChatResult | AutoChatResult | null
  compareItems?: CompareItem[] | null
  comparePrompt?: string
}): Omit<HistoryEntry, 'id' | 'title' | 'createdAt'> {
  const mode = historyModeFromApp(params.mode, params.provider)
  return {
    prompt: params.prompt,
    mode,
    provider: mode === 'auto' ? 'auto' : params.provider,
    model: params.model,
    chatResult: params.chatResult ?? undefined,
    compareItems: params.compareItems ?? undefined,
    comparePrompt: params.comparePrompt,
  }
}
