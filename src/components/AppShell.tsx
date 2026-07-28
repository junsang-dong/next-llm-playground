import type { ReactNode } from 'react'
import { SidebarToggleButton } from './SidebarToggleButton'

interface AppShellProps {
  sidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
  sidebar: ReactNode
  children: ReactNode
  topBar?: ReactNode
  footer?: ReactNode
}

const SIDEBAR_WIDTH = '17rem'

export function AppShell({
  sidebarOpen,
  onSidebarOpenChange,
  sidebar,
  children,
  topBar,
  footer,
}: AppShellProps) {
  return (
    <div className="flex h-svh overflow-hidden bg-[var(--surface)]">
      {/* Desktop: push layout */}
      <aside
        className={[
          'hidden shrink-0 flex-col border-r border-slate-200/90 bg-[#f7f7f8] transition-[width,margin] duration-200 ease-out md:flex',
          sidebarOpen ? 'w-[var(--sidebar-w)]' : 'w-0 overflow-hidden border-r-0',
        ].join(' ')}
        style={{ ['--sidebar-w' as string]: SIDEBAR_WIDTH }}
      >
        <div
          className="flex h-full flex-col"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <div className="flex shrink-0 items-center justify-end px-2 pt-2 pb-1">
            <SidebarToggleButton
              expanded={sidebarOpen}
              onClick={() => onSidebarOpenChange(false)}
              ariaLabel="사이드바 닫기"
            />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-3">
            {sidebar}
          </div>
        </div>
      </aside>

      {/* Mobile: overlay drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45"
            aria-label="사이드바 닫기"
            onClick={() => onSidebarOpenChange(false)}
          />
          <aside
            className="relative flex h-full w-[min(100%,17rem)] flex-col border-r border-slate-200 bg-[#f7f7f8] shadow-xl"
          >
            <div className="flex shrink-0 items-center justify-end px-2 pt-2 pb-1">
              <SidebarToggleButton
                expanded
                onClick={() => onSidebarOpenChange(false)}
                ariaLabel="사이드바 닫기"
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-3">
              {sidebar}
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white/70 px-3 py-2 backdrop-blur-sm sm:px-4">
          {!sidebarOpen && (
            <SidebarToggleButton
              expanded={false}
              onClick={() => onSidebarOpenChange(true)}
              ariaLabel="사이드바 열기"
            />
          )}
          {topBar}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
          {footer && (
            <div className="border-t border-slate-200/80 px-4 py-6">{footer}</div>
          )}
        </div>
      </div>
    </div>
  )
}
