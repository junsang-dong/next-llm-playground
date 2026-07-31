export function AboutPanel() {
  return (
    <section className="space-y-6 rounded-2xl border border-[var(--line)] bg-white/90 p-6 text-left shadow-sm">
      <div>
        <p className="font-[family-name:var(--mono)] text-xs tracking-[0.2em] text-[var(--accent-deep)] uppercase">
          All-in-One AI Gateway
        </p>
        <h2 className="mt-2 font-[family-name:var(--display)] text-3xl font-bold text-[var(--ink)]">
          NextLLM Playground
        </h2>
        <p className="mt-3 max-w-xl text-base text-[var(--muted)]">
          GPT, Gemini, Claude, Perplexity를 하나의 게이트웨이에서 호출하고
          Chat·Compare·AUTO 협의로 속도·비용·품질을 학습합니다.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-slate-50/80 p-4 text-sm text-[var(--muted)]">
        <p className="font-medium text-[var(--ink)]">기술 스택</p>
        <p className="mt-2">
          React · Vite · TypeScript · Tailwind CSS · Vercel Serverless ·
          react-markdown
        </p>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Developed by JUN ·{' '}
        <a
          href="https://nextplatform.net"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-[var(--accent-deep)]"
        >
          NextPlatform
        </a>{' '}
        · Version 1.1.0 · © 2026
      </p>
    </section>
  )
}
