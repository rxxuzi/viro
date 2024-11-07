import React from 'react';
import { ThumbsUp, ThumbsDown, RefreshCw, Flag, Copy } from 'lucide-react';

interface MessageActionsProps {
  onRegenerate: () => void;
  onFeedback: (type: 'good' | 'bad') => void;
  onReport: () => void;
  onCopyRaw: () => void;
}

export function MessageActions({ onRegenerate, onFeedback, onReport, onCopyRaw }: MessageActionsProps) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={() => onFeedback('good')}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[#00FF94]"
        title="Good response"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFeedback('bad')}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[#FF3DFF]"
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
        onClick={onReport}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[#FF8A00]"
        title="Report response"
      >
        <Flag className="w-4 h-4" />
      </button>
      <button
        onClick={onCopyRaw}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[#00D1FF]"
        title="Copy raw markdown"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}