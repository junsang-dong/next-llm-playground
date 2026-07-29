import type { ProviderId } from './types.js'
import { DEFAULT_MODELS } from './types.js'

/** USD per 1M tokens */
const PRICING: Record<
  string,
  { input: number; output: number }
> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-5-mini': { input: 0.25, output: 2 },
  'gpt-5': { input: 1.25, output: 10 },
  'gemini-2.5-flash': { input: 0.3, output: 2.5 },
  'gemini-2.5-pro': { input: 1.25, output: 10 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 },
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-opus-4-5': { input: 15.0, output: 75.0 },
  sonar: { input: 1.0, output: 1.0 },
  'sonar-pro': { input: 3.0, output: 15.0 },
  'gemma-4-12b-qat': { input: 0, output: 0 },
}

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const price = PRICING[model] ?? { input: 1, output: 1 }
  const cost =
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  return Math.round(cost * 1_000_000) / 1_000_000
}

export function modelFor(provider: ProviderId, override?: string): string {
  return override || DEFAULT_MODELS[provider]
}
