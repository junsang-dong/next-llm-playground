import type { ChatResult, ProviderId } from '../types.js'
import { estimateCost, modelFor } from '../pricing.js'

export async function callPerplexity(
  prompt: string,
  modelOverride?: string,
  systemInstruction?: string,
): Promise<ChatResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured')
  }

  const model = modelFor('perplexity', modelOverride)
  const started = Date.now()

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemInstruction
          ? [{ role: 'system' as const, content: systemInstruction }]
          : []),
        { role: 'user', content: prompt },
      ],
    }),
  })

  const elapsed = (Date.now() - started) / 1000
  const data = (await res.json()) as {
    error?: { message?: string } | string
    choices?: Array<{ message?: { content?: string } }>
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }

  if (!res.ok) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message || `Perplexity HTTP ${res.status}`
    throw new Error(message)
  }

  const response = data.choices?.[0]?.message?.content ?? ''
  const inputTokens = data.usage?.prompt_tokens ?? 0
  const outputTokens = data.usage?.completion_tokens ?? 0

  return {
    provider: 'perplexity' satisfies ProviderId,
    model,
    response,
    elapsed: Math.round(elapsed * 100) / 100,
    inputTokens,
    outputTokens,
    estimatedCost: estimateCost(model, inputTokens, outputTokens),
  }
}
