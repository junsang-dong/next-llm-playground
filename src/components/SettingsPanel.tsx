import { HISTORY_STORAGE_KEY } from '../services/history'
import {
  GUEST_TRIAL_LIMIT,
  GUEST_TRIAL_STORAGE_KEY,
  getGuestTrialUsed,
  resetGuestTrial,
} from '../services/guestTrial'
import { useAuth } from '../contexts/AuthContext'

interface SettingsPanelProps {
  onClearHistory: () => void
  onVoucherLock: () => void
  onGoogleSignOut: () => void
  onGuestTrialReset?: () => void
  guestTrialRemaining: number
  unlocked: boolean
  voucherUnlocked: boolean
}

export function SettingsPanel({
  onClearHistory,
  onVoucherLock,
  onGoogleSignOut,
  onGuestTrialReset,
  guestTrialRemaining,
  unlocked,
  voucherUnlocked,
}: SettingsPanelProps) {
  const { user } = useAuth()

  return (
    <section className="space-y-6 rounded-2xl border border-[var(--line)] bg-white/90 p-6 text-left shadow-sm">
      <div>
        <h2 className="font-[family-name:var(--display)] text-2xl font-semibold text-[var(--ink)]">
          Settings
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Google 계정·바우처·히스토리를 관리합니다.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--line)] bg-slate-50/80 p-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]">Google 계정</h3>
        {user ? (
          <>
            <p className="text-sm text-[var(--muted)]">
              {user.displayName ?? '사용자'} · {user.email}
            </p>
            <button
              type="button"
              onClick={onGoogleSignOut}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:border-red-300 hover:text-red-700"
            >
              Google 로그아웃
            </button>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            로그인되어 있지 않습니다. 메인 화면에서 Google 로그인하세요.
          </p>
        )}
      </div>

      {!user && (
        <div className="space-y-3 rounded-xl border border-[var(--line)] bg-slate-50/80 p-4">
          <h3 className="text-sm font-semibold text-[var(--ink)]">
            방문자 무료 체험
          </h3>
          <p className="text-sm text-[var(--muted)]">
            사용 {getGuestTrialUsed()}/{GUEST_TRIAL_LIMIT}회 · 남음{' '}
            {guestTrialRemaining}회 (
            <code className="text-xs">{GUEST_TRIAL_STORAGE_KEY}</code>)
          </p>
          <button
            type="button"
            onClick={() => {
              resetGuestTrial()
              onGuestTrialReset?.()
            }}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:border-amber-300 hover:text-amber-800"
          >
            체험 횟수 초기화 (교육·디버그)
          </button>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-[var(--line)] bg-slate-50/80 p-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]">바우처</h3>
        <p className="text-sm text-[var(--muted)]">
          {unlocked
            ? 'Google 로그인 및 바우처 인증 완료 — API 호출 가능'
            : voucherUnlocked
              ? '바우처만 인증됨 — Google 로그인이 필요합니다'
              : user
                ? 'Google 로그인됨 — 메인에서 바우처를 입력하세요'
                : guestTrialRemaining > 0
                  ? `방문자 체험 중 — ${guestTrialRemaining}회 남음 (로그인+바우처 시 무제한)`
                  : '체험 소진 — Google 로그인과 바우처가 필요합니다'}
        </p>
        {voucherUnlocked && (
          <button
            type="button"
            onClick={onVoucherLock}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            바우처 잠금
          </button>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--line)] bg-slate-50/80 p-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]">히스토리</h3>
        <p className="text-sm text-[var(--muted)]">
          질문·답변은 브라우저 <code className="text-xs">{HISTORY_STORAGE_KEY}</code>
          키로 localStorage에 저장됩니다.
        </p>
        <button
          type="button"
          onClick={onClearHistory}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:border-red-300 hover:text-red-700"
        >
          히스토리 전체 삭제
        </button>
      </div>
    </section>
  )
}
