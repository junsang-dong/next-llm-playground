import { HISTORY_STORAGE_KEY } from '../services/history'

interface SettingsPanelProps {
  onClearHistory: () => void
  onLock: () => void
  unlocked: boolean
}

export function SettingsPanel({
  onClearHistory,
  onLock,
  unlocked,
}: SettingsPanelProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-[var(--line)] bg-white/90 p-6 text-left shadow-sm">
      <div>
        <h2 className="font-[family-name:var(--display)] text-2xl font-semibold text-[var(--ink)]">
          Settings
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          바우처·히스토리 등 로컬 설정을 관리합니다.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--line)] bg-slate-50/80 p-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]">바우처</h3>
        <p className="text-sm text-[var(--muted)]">
          {unlocked
            ? '인증됨 — API 호출이 가능합니다. 잠금하면 세션 바우처가 삭제됩니다.'
            : '미인증 — 메인 화면에서 바우처를 입력하세요.'}
        </p>
        {unlocked && (
          <button
            type="button"
            onClick={onLock}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            잠금 (로그아웃)
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
