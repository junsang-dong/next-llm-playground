import type { ProviderId } from '../types'
import { DEFAULT_MODELS } from '../types'

export interface ModelOption {
  id: string
  label: string
}

export const MODEL_OPTIONS: Record<ProviderId, ModelOption[]> = {
  gpt: [
    { id: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { id: 'gpt-4o', label: 'gpt-4o' },
    { id: 'gpt-5-mini', label: 'gpt-5-mini' },
    { id: 'gpt-5', label: 'gpt-5' },
  ],
  gemini: [
    { id: 'gemini-2.5-flash', label: 'Flash (2.5)' },
    { id: 'gemini-2.5-pro', label: 'Pro (2.5)' },
  ],
  claude: [
    { id: 'claude-haiku-4-5', label: 'Haiku 4.5' },
    { id: 'claude-sonnet-4-5', label: 'Sonnet 4.5' },
    { id: 'claude-opus-4-5', label: 'Opus 4.5' },
  ],
  perplexity: [
    { id: 'sonar', label: 'Sonar' },
    { id: 'sonar-pro', label: 'Sonar Pro' },
  ],
  local: [
    { id: 'gemma-4-12b-qat', label: 'Gemma 4 12B' },
  ],
}

export function defaultModelForProvider(provider: ProviderId): string {
  const options = MODEL_OPTIONS[provider]
  const preferred = DEFAULT_MODELS[provider]
  if (options.some((o) => o.id === preferred)) return preferred
  return options[0]?.id ?? preferred
}

export function isValidModelForProvider(
  provider: ProviderId,
  modelId: string,
): boolean {
  return MODEL_OPTIONS[provider].some((o) => o.id === modelId)
}
