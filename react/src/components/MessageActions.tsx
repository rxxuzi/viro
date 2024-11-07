import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, RefreshCw, Flag, Copy, Check } from 'lucide-react';

interface MessageActionsProps {
  onRegenerate: () => void;
  onFeedback: (type: 'good' | 'bad') => void;
  onReport: () => void;
  onCopyRaw: () => void;
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
}

export function MessageActions({ onRegenerate, onFeedback, onReport, onCopyRaw, message }: MessageActionsProps) {
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFeedback = (type: 'good' | 'bad') => {
    if (feedback !== type) {
      setFeedback(type);
      onFeedback(type);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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
        onClick={onRegenerate}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[#00D1FF]"
        title="Regenerate response"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
      <button
        onClick={handleReport}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[#FF8A00]"
        title="Report response"
      >
        <Flag className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopy}
        className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
          copied ? 'text-[#00D1FF] bg-white/10' : 'text-white/70 hover:text-[#00D1FF]'
        }`}
        title={copied ? 'Copied!' : 'Copy raw markdown'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}