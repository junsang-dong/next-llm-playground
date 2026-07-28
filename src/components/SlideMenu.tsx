import {
  GitCompareArrows,
  History,
  Info,
  MessageSquare,
  Settings,
  Sparkles,
} from 'lucide-react'
import type { ReactNode } from 'react'

export type AppView = 'chat' | 'compare' | 'auto' | 'settings' | 'about'

interface SlideMenuProps {
  activeView: AppView
  onNavigate: (view: AppView) => void
  historyPanel: ReactNode
  onAfterNavigate?: () => void
}

const NAV: { view: AppView; label: string; icon: typeof MessageSquare }[] = [
  { view: 'chat', label: 'Chat', icon: MessageSquare },
  { view: 'compare', label: 'Compare', icon: GitCompareArrows },
  { view: 'auto', label: 'Auto', icon: Sparkles },
  { view: 'settings', label: 'Settings', icon: Settings },
  { view: 'about', label: 'About', icon: Info },
]

export function SlideMenu({
  activeView,
  onNavigate,
  historyPanel,
  onAfterNavigate,
}: SlideMenuProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <nav className="shrink-0 space-y-0.5">
        {NAV.map(({ view, label, icon: Icon }) => {
          const active = activeView === view
          return (
            <button
              key={view}
              type="button"
              onClick={() => {
                onNavigate(view)
                onAfterNavigate?.()
              }}
              className={[
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition',
                active
                  ? 'bg-white text-[var(--ink)] shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900',
              ].join(' ')}
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col border-t border-slate-200/90 pt-3">
        <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          <History size={14} />
          History
        </div>
        <div className="min-h-0 flex-1 overflow-hidden px-0.5">{historyPanel}</div>
      </div>
    </div>
  )
}
