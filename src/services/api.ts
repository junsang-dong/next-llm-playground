import type { AutoChatResult, ChatResult, CompareItem, ProviderId } from '../types'

const VOUCHER_STORAGE_KEY = 'kpc-multi-llm-voucher'

export function getStoredVoucher(): string | null {
  try {
    return sessionStorage.getItem(VOUCHER_STORAGE_KEY)
  } catch {
    return null
  }
}

export function storeVoucher(code: string) {
  sessionStorage.setItem(VOUCHER_STORAGE_KEY, code)
}

export function clearStoredVoucher() {
  sessionStorage.removeItem(VOUCHER_STORAGE_KEY)
}

export function isExpectedVoucher(code: string): boolean {
  const expected = import.meta.env.VITE_VOUCHER_CODE?.trim() ?? ''
  return Boolean(expected) && code.trim() === expected
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  let data: unknown

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(
      text.trim().slice(0, 200) || `HTTP ${res.status}: invalid response`,
    )
  }

  if (!res.ok) {
    const message =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error: unknown }).error)
        : `HTTP ${res.status}`
    throw new Error(message)
  }

  return data as T
}

export function getVoucherForRequest(options?: { guestTrial?: boolean }): string {
  const stored = getStoredVoucher()?.trim()
  if (stored && isExpectedVoucher(stored)) {
    return stored
  }
  if (options?.guestTrial) {
    const fromEnv = import.meta.env.VITE_VOUCHER_CODE?.trim() ?? ''
    if (fromEnv && isExpectedVoucher(fromEnv)) {
      return fromEnv
    }
  }
  throw new Error('유효한 바우처 코드를 입력해주세요')
}

export async function chat(
  provider: ProviderId,
  prompt: string,
  model?: string,
  options?: { guestTrial?: boolean },
): Promise<ChatResult> {
  const voucher = getVoucherForRequest(options)
  const body: Record<string, string> = { provider, prompt, voucher }
  if (model?.trim()) body.model = model.trim()
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<ChatResult>(res)
}

export async function compare(
  prompt: string,
  options?: { guestTrial?: boolean },
): Promise<CompareItem[]> {
  const voucher = getVoucherForRequest(options)
  const res = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, voucher }),
  })
  return parseJson<CompareItem[]>(res)
}

export async function autoChat(
  prompt: string,
  options?: { guestTrial?: boolean },
): Promise<AutoChatResult> {
  const voucher = getVoucherForRequest(options)
  const res = await fetch('/api/auto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, voucher }),
  })
  return parseJson<AutoChatResult>(res)
}
