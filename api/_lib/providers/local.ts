import type { ChatResult, ProviderId } from '../types.js'
import { DEFAULT_MODELS } from '../types.js'

import { getLmStudioBaseUrl } from '../localStatus.js'

export async function callLocal(
  prompt: string,
  modelOverride?: string,
  systemInstruction?: string,
): Promise<ChatResult> {
  const baseUrl = getLmStudioBaseUrl()
  const model = modelOverride?.trim() || DEFAULT_MODELS.local

  const started = Date.now()

  let res: Response
  try {
    res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  } catch (err) {
    throw new Error(
      `LM Studio에 연결할 수 없습니다 (${baseUrl}). LM Studio가 실행 중인지 확인하세요.`,
    )
  }

  const elapsed = (Date.now() - started) / 1000
  const data = (await res.json()) as {
    error?: { message?: string }
    choices?: Array<{ message?: { content?: string } }>
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }

  if (!res.ok) {
    throw new Error(data.error?.message || `LM Studio HTTP ${res.status}`)
  }

  const response = data.choices?.[0]?.message?.content ?? ''
  const inputTokens = data.usage?.prompt_tokens ?? 0
  const outputTokens = data.usage?.completion_tokens ?? 0

  return {
    provider: 'local' satisfies ProviderId,
    model,
    response,
    elapsed: Math.round(elapsed * 100) / 100,
    inputTokens,
    outputTokens,
    estimatedCost: 0,
  }
}
