import { useCallback, useEffect, useMemo, useState } from 'react'
import { AboutPanel } from './components/AboutPanel'
import { AppShell } from './components/AppShell'
import { ChatWindow } from './components/ChatWindow'
import { CompareView } from './components/CompareView'
import { HistoryList } from './components/HistoryList'
import {
  defaultModelForProvider,
  ModelSelector,
} from './components/ModelSelector'
import { PromptInput, PROMPT_EXAMPLES } from './components/PromptInput'
import { SettingsPanel } from './components/SettingsPanel'
import { SlideMenu, type AppView } from './components/SlideMenu'
import { AccessGate } from './components/AccessGate'
import { isValidModelForProvider } from './constants/models'
import { KnowledgePanel } from './components/KnowledgePanel'
import { useKnowledgeSettings } from './hooks/useKnowledgeSettings'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAuth } from './contexts/AuthContext'
import {
  autoChat,
  chat,
  clearStoredVoucher,
  compare,
  getStoredVoucher,
  isExpectedVoucher,
  storeVoucher,
} from './services/api'
import {
  buildHistoryPayload,
  HISTORY_STORAGE_KEY,
  prependHistory,
} from './services/history'
import {
  getGuestTrialRemaining,
  recordGuestTrialUse,
} from './services/guestTrial'
import { fetchLocalLlmStatus } from './services/localStatus'
import type {
  AutoChatResult,
  ChatResult,
  ChatProviderSelection,
  CompareItem,
  ProviderId,
} from './types'
import type { HistoryEntry } from './types/history'
import { PROVIDERS } from './types'

function initialModels(): Record<ProviderId, string> {
  return Object.fromEntries(
    PROVIDERS.map((p) => [p, defaultModelForProvider(p)]),
  ) as Record<ProviderId, string>
}

export default function App() {
  const { user, authLoading, signOutGoogle } = useAuth()
  const [activeView, setActiveView] = useState<AppView>('chat')
  const [mode, setMode] = useState<'chat' | 'compare'>('chat')
  const [provider, setProvider] = useState<ChatProviderSelection>('gpt')
  const [modelsByProvider, setModelsByProvider] =
    useState<Record<ProviderId, string>>(initialModels)
  const [prompt, setPrompt] = useState(PROMPT_EXAMPLES[0].prompt)
  const [loading, setLoading] = useState(false)
  const [chatResult, setChatResult] = useState<ChatResult | AutoChatResult | null>(
    null,
  )
  const [compareItems, setCompareItems] = useState<CompareItem[] | null>(null)
  const [comparePrompt, setComparePrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(
    'multi-llm-sidebar-open',
    typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 768px)').matches,
  )
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    HISTORY_STORAGE_KEY,
    [],
  )
  const [guestTrialTick, setGuestTrialTick] = useState(0)
  const [voucherUnlocked, setVoucherUnlocked] = useState(() => {
    const stored = getStoredVoucher()
    return Boolean(stored && isExpectedVoucher(stored))
  })
  const [knowledgeSettings, setKnowledgeSettings] = useKnowledgeSettings()
  const [localStatusLoading, setLocalStatusLoading] = useState(true)
  const [localUnavailableReason, setLocalUnavailableReason] = useState<
    string | null
  >(null)

  useEffect(() => {
    let cancelled = false
    setLocalStatusLoading(true)
    fetchLocalLlmStatus()
      .then((status) => {
        if (cancelled) return
        if (status.available) {
          setLocalUnavailableReason(null)
        } else {
          setLocalUnavailableReason(
            status.error ?? 'LM Studio를 사용할 수 없습니다',
          )
          setProvider((prev) => (prev === 'local' ? 'gpt' : prev))
        }
      })
      .finally(() => {
        if (!cancelled) setLocalStatusLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const unavailableProviders = useMemo(() => {
    if (!localUnavailableReason) return {}
    return { local: localUnavailableReason }
  }, [localUnavailableReason])

  const unlocked = Boolean(user && voucherUnlocked && !authLoading)
  const guestTrialRemaining = useMemo(() => {
    void guestTrialTick
    return getGuestTrialRemaining()
  }, [guestTrialTick])
  const guestAccess = Boolean(
    !user && !authLoading && guestTrialRemaining > 0,
  )
  const canExecute = unlocked || guestAccess

  const handleNavigate = useCallback((view: AppView) => {
    setActiveView(view)
    setError(null)
    if (view === 'compare') {
      setMode('compare')
    } else if (view === 'auto') {
      setMode('chat')
      setProvider('auto')
    } else if (view === 'chat') {
      setMode('chat')
      setProvider((prev) => (prev === 'auto' ? 'gpt' : prev))
    }
  }, [])

  function handleUnlock(code: string) {
    if (!isExpectedVoucher(code)) return false
    storeVoucher(code.trim())
    setVoucherUnlocked(true)
    setError(null)
    return true
  }

  function handleVoucherLock() {
    clearStoredVoucher()
    setVoucherUnlocked(false)
  }

  async function handleGoogleSignOut() {
    handleVoucherLock()
    await signOutGoogle()
  }

  function handleProviderChange(next: ChatProviderSelection) {
    if (next === 'local' && localUnavailableReason) return
    setProvider(next)
    if (next === 'auto') {
      setActiveView('auto')
      setMode('chat')
    } else {
      setActiveView(mode === 'compare' ? 'compare' : 'chat')
    }
  }

  function handleModelChange(providerId: ProviderId, modelId: string) {
    setModelsByProvider((prev) => ({ ...prev, [providerId]: modelId }))
  }

  const applyHistoryEntry = useCallback(
    (entry: HistoryEntry) => {
      setSelectedHistoryId(entry.id)
      setPrompt(entry.prompt)
      setError(null)

      if (entry.mode === 'compare') {
        setMode('compare')
        setActiveView('compare')
        setComparePrompt(entry.comparePrompt ?? entry.prompt)
        setCompareItems(entry.compareItems ?? null)
        setChatResult(null)
      } else {
        setMode('chat')
        setActiveView(entry.mode === 'auto' ? 'auto' : 'chat')
        const nextProvider =
          entry.provider === 'local' && localUnavailableReason
            ? 'gpt'
            : entry.provider
        setProvider(nextProvider)
        setChatResult(entry.chatResult ?? null)
        setCompareItems(null)
        setComparePrompt('')
        if (
          entry.provider !== 'auto' &&
          entry.model &&
          isValidModelForProvider(entry.provider, entry.model)
        ) {
          setModelsByProvider((prev) => ({
            ...prev,
            [entry.provider]: entry.model!,
          }))
        }
      }
    },
    [localUnavailableReason],
  )

  async function handleSubmit() {
    const trimmed = prompt.trim()
    if (!trimmed || loading || !canExecute) return
    if (activeView === 'settings' || activeView === 'about') return

    const useGuestTrial = guestAccess
    const apiOpts = {
      ...(useGuestTrial ? { guestTrial: true as const } : {}),
      knowledge: knowledgeSettings,
    }

    setLoading(true)
    setError(null)

    try {
      if (mode === 'chat') {
        if (provider === 'auto') {
          const result = await autoChat(trimmed, apiOpts)
          setChatResult(result)
          setCompareItems(null)
          setHistory((prev) =>
            prependHistory(
              prev,
              buildHistoryPayload({
                prompt: trimmed,
                mode: 'chat',
                provider: 'auto',
                chatResult: result,
              }),
            ),
          )
          setSelectedHistoryId(null)
        } else {
          const model = modelsByProvider[provider]
          const result = await chat(provider, trimmed, model, apiOpts)
          setChatResult(result)
          setCompareItems(null)
          setHistory((prev) =>
            prependHistory(
              prev,
              buildHistoryPayload({
                prompt: trimmed,
                mode: 'chat',
                provider,
                model,
                chatResult: result,
              }),
            ),
          )
          setSelectedHistoryId(null)
        }
      } else {
        const items = await compare(trimmed, apiOpts)
        setCompareItems(items)
        setComparePrompt(trimmed)
        setChatResult(null)
        setHistory((prev) =>
          prependHistory(
            prev,
            buildHistoryPayload({
              prompt: trimmed,
              mode: 'compare',
              provider: 'gpt',
              compareItems: items,
              comparePrompt: trimmed,
            }),
          ),
        )
        setSelectedHistoryId(null)
      }
      if (useGuestTrial) {
        recordGuestTrialUse()
        setGuestTrialTick((t) => t + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const showPlayground =
    activeView === 'chat' ||
    activeView === 'compare' ||
    activeView === 'auto'

  const historyPanel = useMemo(
    () => (
      <HistoryList
        entries={history}
        selectedId={selectedHistoryId}
        onSelect={applyHistoryEntry}
        onClear={() => {
          setHistory([])
          setSelectedHistoryId(null)
        }}
      />
    ),
    [history, selectedHistoryId, setHistory, applyHistoryEntry],
  )

  return (
    <AppShell
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      sidebar={
        <SlideMenu
          activeView={activeView}
          onNavigate={handleNavigate}
          historyPanel={historyPanel}
          onAfterNavigate={() => {
            if (window.matchMedia('(max-width: 767px)').matches) {
              setSidebarOpen(false)
            }
          }}
        />
      }
      topBar={
        <div className="min-w-0 py-0.5">
          <p className="truncate font-[family-name:var(--mono)] text-[10px] tracking-[0.15em] text-[var(--accent-deep)] uppercase sm:text-xs">
            All-in-One AI Gateway
          </p>
          <h1 className="truncate font-[family-name:var(--display)] text-lg font-bold tracking-tight text-[var(--ink)] sm:text-xl">
            NextLLM Playground
          </h1>
        </div>
      }
      footer={
        <footer className="space-y-1 text-center text-xs text-[var(--muted)]">
          <p>
            Developed by Jun ·{' '}
            <a
              href="https://nextplatform.net"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--line)] underline-offset-2 hover:text-[var(--accent-deep)]"
            >
              NextPlatform
            </a>{' '}
            | React · Vite · TypeScript · Vercel
          </p>
          <p>Built with Cursor · SPEC with ChatGPT | Version 1.0.0 · © 2026</p>
        </footer>
      }
    >
      <p className="mb-6 text-sm text-[var(--muted)]">
        GPT, Gemini, Claude, Perplexity를 하나의 게이트웨이에서 호출하고
        속도·비용·품질을 비교합니다.
      </p>
      <main className="space-y-6 rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_20px_60px_-40px_rgba(3,105,161,0.45)] backdrop-blur-sm sm:p-8">
        <AccessGate
          voucherUnlocked={voucherUnlocked}
          guestTrialRemaining={guestTrialRemaining}
          onUnlock={handleUnlock}
          onVoucherLock={handleVoucherLock}
        />

        {activeView === 'settings' && (
          <SettingsPanel
            unlocked={unlocked}
            voucherUnlocked={voucherUnlocked}
            guestTrialRemaining={guestTrialRemaining}
            onGuestTrialReset={() => setGuestTrialTick((t) => t + 1)}
            onVoucherLock={handleVoucherLock}
            onGoogleSignOut={() => void handleGoogleSignOut()}
            onClearHistory={() => {
              setHistory([])
              setSelectedHistoryId(null)
            }}
          />
        )}

        {activeView === 'about' && <AboutPanel />}

        {showPlayground && (
          <>
            {mode === 'chat' && (
              <ModelSelector
                value={provider}
                onChange={handleProviderChange}
                modelsByProvider={modelsByProvider}
                onModelChange={handleModelChange}
                disabled={loading || !canExecute}
                unavailableProviders={unavailableProviders}
                localStatusLoading={localStatusLoading}
              />
            )}

            <KnowledgePanel
              value={knowledgeSettings}
              onChange={setKnowledgeSettings}
              disabled={loading || !canExecute}
            />

            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmit}
              disabled={loading || !canExecute}
              locked={!canExecute}
            />

            {mode === 'chat' ? (
              <ChatWindow
                result={chatResult}
                loading={loading}
                error={error}
                autoMode={provider === 'auto'}
              />
            ) : (
              <CompareView
                prompt={comparePrompt}
                items={compareItems}
                loading={loading}
                error={error}
              />
            )}
          </>
        )}
      </main>
    </AppShell>
  )
}
