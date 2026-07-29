export type ProviderId = 'gpt' | 'gemini' | 'claude' | 'perplexity' | 'local'

export interface ChatRequest {
  provider: ProviderId
  prompt: string
  model?: string
}

export interface KnowledgeMeta {
  systemInstructionApplied: boolean
  ragApplied: boolean
  ragDocumentIds?: string[]
  ragChunkCount?: number
}

export interface ChatResult {
  provider: ProviderId
  model: string
  response: string
  elapsed: number
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  knowledge?: KnowledgeMeta
}

export interface ChatErrorResult {
  provider: ProviderId
  model: string
  error: string
  elapsed: number
}

export type CompareItem = ChatResult | ChatErrorResult

export function isChatError(item: CompareItem): item is ChatErrorResult {
  return 'error' in item
}

export const PROVIDERS: ProviderId[] = ['gpt', 'gemini', 'claude', 'perplexity', 'local']

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  gpt: 'gpt-4o-mini',
  gemini: 'gemini-2.5-flash',
  claude: 'claude-haiku-4-5',
  perplexity: 'sonar',
  local: 'gemma-4-12b-qat',
}

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  gpt: 'GPT',
  gemini: 'Gemini',
  claude: 'Claude',
  perplexity: 'Perplexity',
  local: 'Local',
}

export interface OrchestrationVote {
  voter: ProviderId
  recommended: ProviderId
  reason: string
}

export interface AutoChatResult extends ChatResult {
  orchestration: {
    selectedProvider: ProviderId
    votes: OrchestrationVote[]
    routingElapsed: number
    totalEstimatedCost: number
  }
}
