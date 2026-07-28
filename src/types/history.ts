import type { AutoChatResult, ChatProviderSelection, ChatResult, CompareItem, ProviderId } from '../types'

export type HistoryMode = 'chat' | 'compare' | 'auto'

export interface HistoryEntry {
  id: string
  title: string
  prompt: string
  mode: HistoryMode
  provider: ChatProviderSelection
  model?: string
  chatResult?: ChatResult | AutoChatResult
  compareItems?: CompareItem[]
  comparePrompt?: string
  createdAt: number
}

export function historyModeFromApp(
  mode: 'chat' | 'compare',
  provider: ChatProviderSelection,
): HistoryMode {
  if (mode === 'compare') return 'compare'
  if (provider === 'auto') return 'auto'
  return 'chat'
}

export function titleFromPrompt(prompt: string, max = 40): string {
  const line = prompt.trim().split(/\r?\n/)[0] ?? ''
  if (line.length <= max) return line || 'Untitled'
  return `${line.slice(0, max)}…`
}

export function providerForHistory(
  mode: HistoryMode,
  provider: ChatProviderSelection,
): ChatProviderSelection {
  if (mode === 'auto') return 'auto'
  if (mode === 'compare') return 'gpt'
  return provider
}

export type ProviderIdOnly = ProviderId
