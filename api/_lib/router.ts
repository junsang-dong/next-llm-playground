import type { ChatResult, ProviderId } from './types.js'
import { DEFAULT_MODELS, PROVIDERS } from './types.js'
import { callOpenAI } from './providers/openai.js'
import { callGemini } from './providers/gemini.js'
import { callAnthropic } from './providers/anthropic.js'
import { callPerplexity } from './providers/perplexity.js'
import { callLocal } from './providers/local.js'

import type { ChatInvokeOptions } from './knowledge.js'
import { prepareChatInput } from './prepareChat.js'

type ProviderCall = (
  prompt: string,
  model?: string,
  systemInstruction?: string,
) => Promise<ChatResult>

const adapters: Record<ProviderId, ProviderCall> = {
  gpt: callOpenAI,
  gemini: callGemini,
  claude: callAnthropic,
  perplexity: callPerplexity,
  local: callLocal,
}

export function isProviderId(value: unknown): value is ProviderId {
  return (
    value === 'gpt' ||
    value === 'gemini' ||
    value === 'claude' ||
    value === 'perplexity' ||
    value === 'local'
  )
}

export async function routeChat(
  provider: ProviderId,
  prompt: string,
  model?: string,
  options?: ChatInvokeOptions,
): Promise<ChatResult> {
  const prepared = await prepareChatInput(prompt, options)
  const adapter = adapters[provider]
  const result = await adapter(
    prepared.userPrompt,
    model,
    prepared.systemInstruction,
  )
  return { ...result, knowledge: prepared.knowledge }
}

export function defaultModel(provider: ProviderId): string {
  return DEFAULT_MODELS[provider]
}

const API_KEY_ENV: Record<ProviderId, string> = {
  gpt: 'OPENAI_API_KEY',
  gemini: 'GOOGLE_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
  perplexity: 'PERPLEXITY_API_KEY',
  local: '',
}

export function getAvailableProviders(): ProviderId[] {
  return PROVIDERS.filter((provider) =>
    provider === 'local' || Boolean(process.env[API_KEY_ENV[provider]]?.trim()),
  )
}
