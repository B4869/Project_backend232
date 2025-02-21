import { useState, useCallback, useEffect, memo } from "react"
import PropTypes from "prop-types"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"
import { ClipboardIcon, ClipboardCheckIcon } from "lucide-react"

const CodeBlock = memo(({ language, children }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""))
    setIsCopied(true)
  }, [children])

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  return (
    <div className="my-4 rounded-md overflow-hidden bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <span className="text-xs text-gray-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="Copy code"
        >
          {isCopied ? (
            <>
              <ClipboardCheckIcon className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          backgroundColor: "#1e1e1e",
        }}
        codeTagProps={{
          className: "font-mono text-sm",
        }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  )
})

CodeBlock.displayName = "CodeBlock"

const FormattedMessage = ({ content, className = "" }) => {
  const components = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      const language = match?.[1] || ""

      return !inline && language ? (
        <CodeBlock language={language}>{children}</CodeBlock>
      ) : (
        <code className="bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono break-words text-white" {...props}>
          {children}
        </code>
      )
    },
    p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 last:mb-0 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 last:mb-0 space-y-2">{children}</ol>,
    li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-1 my-4 bg-gray-50 rounded-r-md">{children}</blockquote>
    ),
    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
    tr: ({ children }) => <tr className="transition-colors hover:bg-gray-50">{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold border-r last:border-r-0 border-gray-200">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-sm whitespace-pre-wrap border-r last:border-r-0 border-gray-200">{children}</td>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-500 underline transition-colors"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      <img
        src={src || "/placeholder.svg"}
        alt={alt || "Embedded content"}
        className="max-w-full h-auto rounded-md my-4"
        loading="lazy"
      />
    ),
  }

  return (
    <div className={`w-full px-4 py-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        urlTransform={(url) => (url.startsWith("http") ? url : undefined)}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

FormattedMessage.propTypes = {
  content: PropTypes.string.isRequired,
  className: PropTypes.string,
}

export default memo(FormattedMessage)

