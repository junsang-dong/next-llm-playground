import { useState } from 'react'
import { KeyRound, Lock, Sparkles, Unlock } from 'lucide-react'
import { GUEST_TRIAL_LIMIT } from '../services/guestTrial'
import { useAuth } from '../contexts/AuthContext'

interface AccessGateProps {
  voucherUnlocked: boolean
  guestTrialRemaining: number
  onUnlock: (code: string) => boolean
  onVoucherLock: () => void
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

function GoogleSignInBlock({
  firebaseReady,
  authError,
  clearAuthError,
  signInWithGoogle,
  title,
  description,
}: {
  firebaseReady: boolean
  authError: string | null
  clearAuthError: () => void
  signInWithGoogle: () => Promise<void>
  title: string
  description: string
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
        <Lock size={16} />
        <span className="tracking-wide uppercase">{title}</span>
      </div>
      <p className="text-sm text-[var(--muted)]">{description}</p>
      <button
        type="button"
        disabled={!firebaseReady}
        onClick={() => {
          clearAuthError()
          void signInWithGoogle()
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <GoogleIcon />
        Google로 계속
      </button>
      {!firebaseReady && (
        <p className="text-sm text-[var(--danger)]">
          Firebase가 설정되지 않았습니다. `.env`의 VITE_FIREBASE_* 항목을
          확인하세요.
        </p>
      )}
      {authError && (
        <p className="text-sm text-[var(--danger)]">{authError}</p>
      )}
    </>
  )
}

export function AccessGate({
  voucherUnlocked,
  guestTrialRemaining,
  onUnlock,
  onVoucherLock,
}: AccessGateProps) {
  const {
    user,
    authLoading,
    firebaseReady,
    signInWithGoogle,
    authError,
    clearAuthError,
  } = useAuth()

  const [code, setCode] = useState('')
  const [voucherError, setVoucherError] = useState<string | null>(null)

  function handleUnlock() {
    const ok = onUnlock(code)
    if (ok) {
      setVoucherError(null)
      setCode('')
      return
    }
    setVoucherError('바우처 코드가 올바르지 않습니다')
  }

  if (authLoading) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3 text-sm text-[var(--muted)]">
        로그인 상태 확인 중…
      </div>
    )
  }

  if (!user && guestTrialRemaining > 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent-deep)]">
          <Sparkles size={16} />
          <span>방문자 무료 체험</span>
        </div>
        <p className="text-sm text-[var(--ink)]">
          Chat · Compare · AUTO 합산{' '}
          <strong>
            {guestTrialRemaining}/{GUEST_TRIAL_LIMIT}회
          </strong>{' '}
          남음 — 로그인 없이 바로 실행할 수 있습니다.
        </p>
        <p className="text-xs text-[var(--muted)]">
          체험 횟수는 이 브라우저의 localStorage에 저장됩니다.
        </p>
        <div className="border-t border-sky-200/80 pt-3">
          <p className="mb-2 text-xs text-[var(--muted)]">
            지금 Google 로그인 후 바우처를 인증하면 무제한으로 사용할 수
            있습니다.
          </p>
          <button
            type="button"
            disabled={!firebaseReady}
            onClick={() => {
              clearAuthError()
              void signInWithGoogle()
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            Google 로그인 (선택)
          </button>
          {authError && (
            <p className="mt-2 text-sm text-[var(--danger)]">{authError}</p>
          )}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/90 p-4 shadow-sm">
        <GoogleSignInBlock
          firebaseReady={firebaseReady}
          authError={authError}
          clearAuthError={clearAuthError}
          signInWithGoogle={signInWithGoogle}
          title="Sign in"
          description="무료 체험 3회를 모두 사용했습니다. Google 계정으로 로그인한 뒤 바우처를 입력하면 계속 사용할 수 있습니다."
        />
      </div>
    )
  }

  if (voucherUnlocked) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full border border-emerald-200"
            />
          ) : null}
          <div className="min-w-0 text-sm">
            <div className="flex items-center gap-2 text-[var(--ok)]">
              <Unlock size={16} className="shrink-0" />
              <span className="font-medium">
                Google · 바우처 인증 완료 · 실행 가능
              </span>
            </div>
            <p className="truncate text-[var(--muted)]">
              {user.displayName ?? user.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onVoucherLock}
          className="shrink-0 text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          바우처 잠금
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/90 p-4 shadow-sm">
      <div className="flex items-center gap-3 border-b border-[var(--line)] pb-3">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="h-10 w-10 rounded-full border border-[var(--line)]"
          />
        ) : null}
        <div className="min-w-0 text-sm">
          <p className="font-medium text-[var(--ink)]">
            {user.displayName ?? 'Google 사용자'}
          </p>
          <p className="truncate text-[var(--muted)]">{user.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
          <KeyRound size={16} />
          <span className="tracking-wide uppercase">Voucher</span>
        </div>
        <p className="text-sm text-[var(--muted)]">
          프롬프트를 실행하려면 바우처 코드를 입력하세요.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <KeyRound
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                if (voucherError) setVoucherError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleUnlock()
                }
              }}
              placeholder="바우처 코드 입력"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-[var(--line)] bg-white py-2.5 pr-3 pl-10 text-sm text-[var(--ink)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={!code.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--accent-deep)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            인증
          </button>
        </div>
        {voucherError && (
          <p className="text-sm text-[var(--danger)]">{voucherError}</p>
        )}
      </div>
    </div>
  )
}
