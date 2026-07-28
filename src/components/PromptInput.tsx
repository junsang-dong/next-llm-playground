import { Send } from 'lucide-react'

export interface PromptExample {
  title: string
  prompt: string
}

export const PROMPT_EXAMPLES: PromptExample[] = [
  {
    title: '모델의 자기인식',
    prompt:
      '기업의 인사(HR) 부서를 위한 AI 업무비서를 구축하려고 합니다. AI 모델로서 귀하의 강점을 활용하여 가장 효과적인 구현 전략을 제안해 주세요.',
  },
  {
    title: 'RAG 기술명세서',
    prompt:
      'React + Vite 기반으로 조직용 RAG 챗봇을 구현하려고 합니다. 프로젝트 폴더 구조, API 설계, TypeScript 인터페이스, 구현 순서를 포함한 기술명세서를 작성해 주세요.',
  },
  {
    title: '복잡한 개념참조',
    prompt:
      'Claude’s Constitution 문서를 분석하여 핵심 내용을 요약하고, 사용자들이 가장 자주 질문할 만한 내용을 FAQ 형식으로 정리한 뒤 개선이 필요한 부분까지 제안해 주세요.\nhttps://www.anthropic.com/constitution',
  },
  {
    title: '다양한 요구반영',
    prompt:
      "AI 입문자를 대상으로 'RAG와 AI 에이전트의 차이'를 이해하기 쉽게 설명해 주세요. 실생활 비유, 단계별 그림 설명, 발표 슬라이드 구성, 실습 아이디어까지 포함해 주세요.",
  },
  {
    title: '최신성 정보참조',
    prompt:
      '2026년 기준 가장 많이 활용되는 RAG 프레임워크와 AI 에이전트 프레임워크를 조사하여 기능, 장단점, 사용 사례를 비교하고 신뢰할 수 있는 출처를 함께 제시해 주세요.',
  },
]

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  locked?: boolean
  placeholder?: string
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  disabled,
  locked,
  placeholder = '바이브코딩 입문자를 위해 OKF의 개요, 특징, 활용 방법을 설명해주겠어?',
}: PromptInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor="prompt"
          className="text-sm font-medium tracking-wide text-[var(--muted)] uppercase"
        >
          Prompt
        </label>
        {PROMPT_EXAMPLES.map((example) => {
          const selected = value === example.prompt
          return (
            <button
              key={example.title}
              type="button"
              disabled={disabled}
              title={example.prompt}
              onClick={() => onChange(example.prompt)}
              className={[
                'rounded-full border px-2.5 py-1 text-xs font-medium transition',
                selected
                  ? 'border-[var(--accent-deep)] bg-[var(--accent-deep)] text-white'
                  : 'border-[var(--line)] bg-white/80 text-[var(--muted)] hover:border-sky-300 hover:text-[var(--ink)]',
                disabled ? 'cursor-not-allowed opacity-60' : '',
              ].join(' ')}
            >
              {example.title}
            </button>
          )
        })}
      </div>
      <div className="relative">
        <textarea
          id="prompt"
          rows={4}
          value={value}
          disabled={disabled}
          placeholder={
            locked ? '바우처 인증 후 프롬프트를 입력할 수 있습니다.' : placeholder
          }
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              if (!disabled) onSubmit()
            }
          }}
          className="w-full resize-y rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3 pr-14 text-base text-[var(--ink)] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Send prompt"
          className="absolute right-3 bottom-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-deep)] text-white transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Send size={18} />
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        {locked
          ? '바우처 코드를 인증하면 전송할 수 있습니다'
          : 'Ctrl/Cmd + Enter 로 전송'}
      </p>
    </div>
  )
}
