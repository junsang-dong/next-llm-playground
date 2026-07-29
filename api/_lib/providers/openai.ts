import type { ChatResult, ProviderId } from '../types.js'
import { estimateCost, modelFor } from '../pricing.js'

export async function callOpenAI(
  prompt: string,
  modelOverride?: string,
  systemInstruction?: string,
): Promise<ChatResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const model = modelFor('gpt', modelOverride)
  const started = Date.now()

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
    error?: { message?: string }
    choices?: Array<{ message?: { content?: string } }>
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }

  if (!res.ok) {
    throw new Error(data.error?.message || `OpenAI HTTP ${res.status}`)
  }

  const response = data.choices?.[0]?.message?.content ?? ''
  const inputTokens = data.usage?.prompt_tokens ?? 0
  const outputTokens = data.usage?.completion_tokens ?? 0

  return {
    provider: 'gpt' satisfies ProviderId,
    model,
    response,
    elapsed: Math.round(elapsed * 100) / 100,
    inputTokens,
    outputTokens,
    estimatedCost: estimateCost(model, inputTokens, outputTokens),
  }
}
