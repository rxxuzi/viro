import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Copy, Check } from 'lucide-react';

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
  onRegenerate?: () => void;
}

export function Message({ message, onRegenerate }: MessageProps) {
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    if (!navigator?.clipboard) {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedBlock(code);
        setTimeout(() => setCopiedBlock(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlock(code);
      setTimeout(() => setCopiedBlock(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            
            return !inline && match ? (
              <div className="relative group my-6 first:mt-0 last:mb-0">
                <div className="absolute top-0 right-0 left-0 h-12 bg-[#1E1E1E] border-b border-white/10 rounded-t-xl flex items-center justify-between px-4">
                  <span className="text-sm text-white/50 font-mono">{match[1]}</span>
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
                <div className="mt-12 overflow-x-auto">
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-xl !mt-0 !bg-[#1E1E1E] !p-4"
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
            ) : (
              <code className={`${className} bg-black/30 rounded px-1.5 py-0.5 font-mono text-sm`} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
}