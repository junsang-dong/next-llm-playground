import type { ChatProviderSelection, ProviderId } from '../types'
import { PROVIDER_LABELS, PROVIDERS } from '../types'
import {
  defaultModelForProvider,
  MODEL_OPTIONS,
} from '../constants/models'

interface ModelSelectorProps {
  value: ChatProviderSelection
  onChange: (selection: ChatProviderSelection) => void
  modelsByProvider: Record<ProviderId, string>
  onModelChange: (provider: ProviderId, modelId: string) => void
  disabled?: boolean
  /** Providers that cannot be selected (e.g. Local when LM Studio is offline) */
  unavailableProviders?: Partial<Record<ProviderId, string>>
  localStatusLoading?: boolean
}

export function ModelSelector({
  value,
  onChange,
  modelsByProvider,
  onModelChange,
  disabled,
  unavailableProviders = {},
  localStatusLoading,
}: ModelSelectorProps) {
  const activeProvider = value !== 'auto' ? value : null

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium tracking-wide text-[var(--muted)] uppercase">
        Model
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        {PROVIDERS.map((provider) => {
          const selected = value === provider
          const unavailableReason = unavailableProviders[provider]
          const providerDisabled = Boolean(unavailableReason)
          return (
            <label
              key={provider}
              title={unavailableReason}
              className={[
                'rounded-xl border px-3 py-3 text-left transition',
                providerDisabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100/80 opacity-55'
                  : 'cursor-pointer',
                !providerDisabled && selected
                  ? 'border-[var(--accent)] bg-sky-50 shadow-[0_0_0_1px_var(--accent)]'
                  : '',
                !providerDisabled && !selected
                  ? 'border-[var(--line)] bg-white/70 hover:border-sky-300'
                  : '',
                disabled && !providerDisabled ? 'opacity-60' : '',
              ].join(' ')}
            >
              <input
                type="radio"
                name="provider"
                className="sr-only"
                checked={selected}
                disabled={providerDisabled || disabled}
                onChange={() => {
                  if (!providerDisabled) onChange(provider)
                }}
              />
              <div className="font-[family-name:var(--display)] text-base font-semibold text-[var(--ink)]">
                {PROVIDER_LABELS[provider]}
              </div>
              <div className="mt-1 font-[family-name:var(--mono)] text-xs text-[var(--muted)]">
                {provider === 'local' && localStatusLoading
                  ? '확인 중…'
                  : providerDisabled
                    ? '사용 불가'
                    : modelsByProvider[provider]}
              </div>
            </label>
          )
        })}
        <label
          className={[
            'cursor-pointer rounded-xl border px-3 py-3 text-left transition',
            'border-[var(--accent-deep)] bg-[var(--accent-deep)] text-white hover:bg-[var(--accent)]',
            value === 'auto'
              ? 'shadow-[0_0_0_2px_var(--accent-deep)] ring-1 ring-sky-800'
              : '',
            disabled ? 'opacity-60' : '',
          ].join(' ')}
        >
          <input
            type="radio"
            name="provider"
            className="sr-only"
            checked={value === 'auto'}
            onChange={() => onChange('auto')}
          />
          <div className="font-[family-name:var(--display)] text-base font-semibold text-white">
            AUTO
          </div>
          <div className="mt-1 font-[family-name:var(--mono)] text-xs text-sky-100">
            Multi-LLM 협의
          </div>
        </label>
      </div>

      {activeProvider && !unavailableProviders[activeProvider] && (
        <div className="rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3">
          <label
            htmlFor="model-select"
            className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--muted)] uppercase"
          >
            {PROVIDER_LABELS[activeProvider]} 모델
          </label>
          <select
            id="model-select"
            disabled={disabled}
            value={modelsByProvider[activeProvider]}
            onChange={(e) => onModelChange(activeProvider, e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-[family-name:var(--mono)] text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
          >
            {MODEL_OPTIONS[activeProvider].map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {unavailableProviders.local && (
        <p className="text-xs text-[var(--muted)]">
          Local LLM: {unavailableProviders.local}. LM Studio Local Server를
          켠 뒤 페이지를 새로고침하세요.
        </p>
      )}
    </fieldset>
  )
}

export { defaultModelForProvider }
