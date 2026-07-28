import { useState } from 'react'
import { GitCompareArrows, MessageSquare } from 'lucide-react'
import { ModelSelector } from './components/ModelSelector'
import { PromptInput, PROMPT_EXAMPLES } from './components/PromptInput'
import { ChatWindow } from './components/ChatWindow'
import { CompareView } from './components/CompareView'
import { VoucherGate } from './components/VoucherGate'
import {
  autoChat,
  chat,
  clearStoredVoucher,
  compare,
  getStoredVoucher,
  isExpectedVoucher,
  storeVoucher,
} from './services/api'
import type {
  AutoChatResult,
  ChatResult,
  ChatProviderSelection,
  CompareItem,
} from './types'

type Mode = 'chat' | 'compare'

export default function App() {
  const [mode, setMode] = useState<Mode>('chat')
  const [provider, setProvider] = useState<ChatProviderSelection>('gpt')
  const [prompt, setPrompt] = useState(PROMPT_EXAMPLES[0].prompt)
  const [loading, setLoading] = useState(false)
  const [chatResult, setChatResult] = useState<ChatResult | AutoChatResult | null>(
    null,
  )
  const [compareItems, setCompareItems] = useState<CompareItem[] | null>(null)
  const [comparePrompt, setComparePrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(() => {
    const stored = getStoredVoucher()
    return Boolean(stored && isExpectedVoucher(stored))
  })

  function handleUnlock(code: string) {
    if (!isExpectedVoucher(code)) return false
    storeVoucher(code.trim())
    setUnlocked(true)
    setError(null)
    return true
  }

  function handleLock() {
    clearStoredVoucher()
    setUnlocked(false)
  }

  async function handleSubmit() {
    const trimmed = prompt.trim()
    if (!trimmed || loading || !unlocked) return

    setLoading(true)
    setError(null)

    try {
      if (mode === 'chat') {
        if (provider === 'auto') {
          const result = await autoChat(trimmed)
          setChatResult(result)
        } else {
          const result = await chat(provider, trimmed)
          setChatResult(result)
        }
      } else {
        const items = await compare(trimmed)
        setCompareItems(items)
        setComparePrompt(trimmed)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 text-left">
        <p className="mb-2 font-[family-name:var(--mono)] text-xs tracking-[0.2em] text-[var(--accent-deep)] uppercase">
          Goorm AI Gateway
        </p>
        <h1 className="font-[family-name:var(--display)] text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">
          Multi LLM Playground
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
          GPT, Gemini, Claude, Perplexity를 하나의 게이트웨이에서 호출하고
          속도·비용·품질을 비교합니다.
        </p>
      </header>

      <div className="mb-6 inline-flex w-fit rounded-xl border border-[var(--line)] bg-white/80 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setMode('chat')}
          className={[
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
            mode === 'chat'
              ? 'bg-[var(--accent-deep)] text-white'
              : 'text-[var(--muted)] hover:text-[var(--ink)]',
          ].join(' ')}
        >
          <MessageSquare size={16} />
          Chat
        </button>
        <button
          type="button"
          onClick={() => setMode('compare')}
          className={[
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
            mode === 'compare'
              ? 'bg-[var(--accent-deep)] text-white'
              : 'text-[var(--muted)] hover:text-[var(--ink)]',
          ].join(' ')}
        >
          <GitCompareArrows size={16} />
          Compare
        </button>
      </div>

      <main className="space-y-6 rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_20px_60px_-40px_rgba(3,105,161,0.45)] backdrop-blur-sm sm:p-8">
        <VoucherGate
          unlocked={unlocked}
          onUnlock={handleUnlock}
          onLock={handleLock}
        />

        {mode === 'chat' && (
          <ModelSelector
            value={provider}
            onChange={setProvider}
            disabled={loading || !unlocked}
          />
        )}

        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmit}
          disabled={loading || !unlocked}
          locked={!unlocked}
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
      </main>

      <footer className="mt-8 space-y-1.5 text-center text-xs text-[var(--muted)]">
        <p>API keys stay on the server · USD × 1400 ≈ KRW</p>
        <p>
          Developed by JUN ·{' '}
          <a
            href="https://nextplatform.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--line)] underline-offset-2 transition hover:text-[var(--accent-deep)] hover:decoration-[var(--accent)]"
          >
            NextPlatform
          </a>{' '}
          | React · Vite · TypeScript · Vercel
        </p>
        <p>
          Built with Cursor · Claude Code · Codex · ChatGPT | Version 1.0.0 · ©
          2026
        </p>
      </footer>
    </div>
  )
}
