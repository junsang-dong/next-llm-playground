import type { ChatResult, ProviderId } from '../types.js'
import { estimateCost, modelFor } from '../pricing.js'

export async function callAnthropic(
  prompt: string,
  modelOverride?: string,
  systemInstruction?: string,
): Promise<ChatResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const model = modelFor('claude', modelOverride)
  const started = Date.now()

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      ...(systemInstruction ? { system: systemInstruction } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const elapsed = (Date.now() - started) / 1000
  const data = (await res.json()) as {
    error?: { message?: string }
    content?: Array<{ type?: string; text?: string }>
    usage?: { input_tokens?: number; output_tokens?: number }
  }

  if (!res.ok) {
    throw new Error(data.error?.message || `Anthropic HTTP ${res.status}`)
  }

  const response =
    data.content
      ?.filter((c) => c.type === 'text')
      .map((c) => c.text ?? '')
      .join('') ?? ''
  const inputTokens = data.usage?.input_tokens ?? 0
  const outputTokens = data.usage?.output_tokens ?? 0

  return {
    provider: 'claude' satisfies ProviderId,
    model,
    response,
    elapsed: Math.round(elapsed * 100) / 100,
    inputTokens,
    outputTokens,
    estimatedCost: estimateCost(model, inputTokens, outputTokens),
  }
}
