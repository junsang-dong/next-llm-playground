export interface LocalLlmStatus {
  available: boolean
  baseUrl: string
  modelCount?: number
  models?: string[]
  error?: string
}

export async function fetchLocalLlmStatus(): Promise<LocalLlmStatus> {
  try {
    const res = await fetch('/api/local/status')
    if (!res.ok) {
      return {
        available: false,
        baseUrl: 'unknown',
        error: `상태 확인 실패 (HTTP ${res.status})`,
      }
    }
    return (await res.json()) as LocalLlmStatus
  } catch {
    return {
      available: false,
      baseUrl: 'unknown',
      error: '로컬 LLM 상태를 확인할 수 없습니다',
    }
  }
}
