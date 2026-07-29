import type { ChatResult, ProviderId } from '../types.js'
import { estimateCost, modelFor } from '../pricing.js'

export async function callGemini(
  prompt: string,
  modelOverride?: string,
  systemInstruction?: string,
): Promise<ChatResult> {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured')
  }

  const model = modelFor('gemini', modelOverride)
  const started = Date.now()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(systemInstruction
        ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
        : {}),
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  const elapsed = (Date.now() - started) / 1000
  const data = (await res.json()) as {
    error?: { message?: string }
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    usageMetadata?: {
      promptTokenCount?: number
      candidatesTokenCount?: number
    }
  }

  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini HTTP ${res.status}`)
  }

  const response =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ??
    ''
  const inputTokens = data.usageMetadata?.promptTokenCount ?? 0
  const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0

  return {
    provider: 'gemini' satisfies ProviderId,
    model,
    response,
    elapsed: Math.round(elapsed * 100) / 100,
    inputTokens,
    outputTokens,
    estimatedCost: estimateCost(model, inputTokens, outputTokens),
  }
}
