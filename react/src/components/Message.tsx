import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Flag } from 'lucide-react';

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
  onRegenerate?: () => void;
}

export function Message({ message, onRegenerate }: MessageProps) {
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlock(code);
      setTimeout(() => setCopiedBlock(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
    }
  };

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleFeedback = (type: 'good' | 'bad') => {
    if (feedback !== type) {
      setFeedback(type);
    }
  };

  const handleReport = async () => {
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message.role === 'assistant' ? '' : message.content,
          answer: message.role === 'assistant' ? message.content : '',
          date: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to report:', error);
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
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#00D1FF] to-[#FF3DFF] bg-clip-text text-transparent" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mb-4 text-white/90" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold mb-3 text-white/80" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a 
              className="text-[#00D1FF] hover:text-[#FF3DFF] transition-colors duration-300 border-b border-[#00D1FF]/30 hover:border-[#FF3DFF]"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="mb-4 pl-6 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="mb-4 pl-6 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="relative before:absolute before:left-[-1em] before:content-['•'] before:text-[#00D1FF]" {...props} />
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            
            return !inline && match ? (
              <div className="relative group my-6 first:mt-0 last:mb-0">
                <div className="absolute top-0 right-0 left-0 h-12 bg-[#1E1E1E] border-b border-white/10 rounded-t-xl flex items-center justify-between px-4 z-10">
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
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1] || 'plaintext'}
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
            ) : (
              <code className="bg-black/30 rounded px-1.5 py-0.5 font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>

      {message.role === 'assistant' && (
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => handleFeedback('good')}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
              feedback === 'good' ? 'text-[#00FF94] bg-white/10' : 'text-white/70 hover:text-[#00FF94]'
            }`}
            title="Good response"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleFeedback('bad')}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
              feedback === 'bad' ? 'text-[#FF3DFF] bg-white/10' : 'text-white/70 hover:text-[#FF3DFF]'
            }`}
            title="Bad response"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button
            onClick={handleReport}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[#FF8A00]"
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