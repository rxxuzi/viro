import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Copy, Check, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { submitEvaluation } from '../utils/evaluation';
import { getBrowserId } from '../utils/browserId';
import { ModelType } from '../types/models';

// ... (keep existing interfaces)

export function Message({ message, onRegenerate, question, model }: MessageProps) {
  // ... (keep existing state and handlers)

  return (
    <div
      className={`p-6 rounded-2xl shadow-lg transition-all duration-200 ${
        message.role === 'user'
          ? 'ml-4 md:ml-12 bg-gradient-to-r from-[#FF3DFF]/10 to-[#00D1FF]/10 border border-[#FF3DFF]/20'
          : 'mr-4 md:mr-12 bg-[#1A1A1A] border border-white/10 hover:border-white/20'
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // ... (keep existing heading components)

          table: ({ node, ...props }) => (
            <div className="my-6 w-full overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full border-collapse bg-[#0D0D0D]" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#1A1A1A] border-b border-white/10" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-3 text-left text-sm font-semibold text-white/90" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-sm border-t border-white/5" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-white/5 transition-colors" {...props} />
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            
            return !inline ? (
              <div className="relative my-6 first:mt-0 last:mb-0">
                <div className="relative">
                  <div 
                    className="sticky top-0 right-0 left-0 h-12 bg-[#1E1E1E] border-b border-white/10 rounded-t-xl flex items-center justify-between px-4"
                    style={{ zIndex: 20 }}
                  >
                    <span className="text-sm text-white/50 font-mono">{match?.[1] || 'plaintext'}</span>
                    <button
                      onClick={() => handleCopyCode(code)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copiedBlock === code ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/50" />
                      )}
                    </button>
                  </div>
                  <div className="relative" style={{ zIndex: 10 }}>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match?.[1] || 'plaintext'}
                      PreTag="div"
                      className="rounded-xl !mt-0 !bg-[#1E1E1E] !p-4 !pt-16"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.75rem',
                        background: '#1E1E1E',
                      }}
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            ) : (
              <code className="bg-black/30 rounded px-1.5 py-0.5 font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>

      {message.role === 'assistant' && (
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => handleFeedback('good')}
            disabled={isSubmitting}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
              feedback === 'good' ? 'text-[#00FF94] bg-white/10' : 'text-white/70 hover:text-[#00FF94]'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Good response"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleFeedback('bad')}
            disabled={isSubmitting}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
              feedback === 'bad' ? 'text-[#FF3DFF] bg-white/10' : 'text-white/70 hover:text-[#FF3DFF]'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Bad response"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button
            onClick={handleReport}
            disabled={isSubmitting}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[#FF8A00] ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Report response"
          >
            <Flag className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyRaw}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
              copied ? 'text-[#00D1FF] bg-white/10' : 'text-white/70 hover:text-[#00D1FF]'
            }`}
            title={copied ? 'Copied!' : 'Copy raw markdown'}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}