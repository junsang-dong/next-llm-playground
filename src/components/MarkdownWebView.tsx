import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownWebViewProps {
  content: string
}

export function MarkdownWebView({ content }: MarkdownWebViewProps) {
  return (
    <div className="response-webview max-h-[32rem] overflow-auto text-[15px] leading-relaxed text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-deep)] underline underline-offset-2"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
