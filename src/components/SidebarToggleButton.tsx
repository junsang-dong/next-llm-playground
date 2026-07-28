interface SidebarToggleButtonProps {
  onClick: () => void
  /** true when sidebar is open — icon suggests “collapse sidebar” */
  expanded?: boolean
  ariaLabel: string
  className?: string
}

/** ChatGPT-style panel toggle: rounded rect with vertical divider */
export function SidebarToggleButton({
  onClick,
  expanded = true,
  ariaLabel,
  className = '',
}: SidebarToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={expanded}
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-200/80 hover:text-slate-900',
        className,
      ].join(' ')}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect
          x="3"
          y="4"
          width="14"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="12.5"
          y1="4"
          x2="12.5"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  )
}
