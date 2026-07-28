export const GUEST_TRIAL_LIMIT = 3
export const GUEST_TRIAL_STORAGE_KEY = 'multi-llm-guest-trial-used'

export function getGuestTrialUsed(): number {
  try {
    const raw = localStorage.getItem(GUEST_TRIAL_STORAGE_KEY)
    const n = raw ? parseInt(raw, 10) : 0
    if (Number.isNaN(n) || n < 0) return 0
    return Math.min(n, GUEST_TRIAL_LIMIT)
  } catch {
    return 0
  }
}

export function getGuestTrialRemaining(): number {
  return Math.max(0, GUEST_TRIAL_LIMIT - getGuestTrialUsed())
}

export function canUseGuestTrial(): boolean {
  return getGuestTrialRemaining() > 0
}

export function recordGuestTrialUse(): void {
  const next = Math.min(GUEST_TRIAL_LIMIT, getGuestTrialUsed() + 1)
  try {
    localStorage.setItem(GUEST_TRIAL_STORAGE_KEY, String(next))
  } catch {
    /* private mode / quota */
  }
}

export function resetGuestTrial(): void {
  try {
    localStorage.removeItem(GUEST_TRIAL_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
