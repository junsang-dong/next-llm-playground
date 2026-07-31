const DEFAULT_BASE_URL = 'http://localhost:1234'

export function getLmStudioBaseUrl(): string {
  return (process.env.LM_STUDIO_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(
    /\/+$/,
    '',
  )
}

export interface LocalLlmStatus {
  available: boolean
  baseUrl: string
  modelCount?: number
  models?: string[]
  error?: string
}

/** Probe LM Studio OpenAI-compatible /v1/models (short timeout). */
export async function checkLocalLlmStatus(
  timeoutMs = 2500,
): Promise<LocalLlmStatus> {
  const baseUrl = getLmStudioBaseUrl()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${baseUrl}/v1/models`, {
      method: 'GET',
      signal: controller.signal,
    })
    if (!res.ok) {
      return {
        available: false,
        baseUrl,
        error: `LM Studio HTTP ${res.status}`,
      }
    }
    const data = (await res.json()) as {
      data?: Array<{ id?: string }>
    }
    const models = (data.data ?? [])
      .map((m) => m.id)
      .filter((id): id is string => Boolean(id))
    return {
      available: models.length > 0,
      baseUrl,
      modelCount: models.length,
      models: models.slice(0, 8),
      error:
        models.length === 0
          ? 'LM Studio에 로드된 모델이 없습니다'
          : undefined,
    }
  } catch (err) {
    const aborted =
      typeof err === 'object' &&
      err &&
      'name' in err &&
      (err as { name: string }).name === 'AbortError'
    return {
      available: false,
      baseUrl,
      error: aborted
        ? `LM Studio 응답 시간 초과 (${baseUrl})`
        : `LM Studio에 연결할 수 없습니다 (${baseUrl})`,
    }
  } finally {
    clearTimeout(timer)
  }
}
