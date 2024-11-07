import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Mode } from '../App';
import { LanguageSelector } from './LanguageSelector';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  isLoading: boolean;
  mode: Mode;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
  className?: string;
}

export function ChatInput({
  input,
  setInput,
  file,
  setFile,
  isLoading,
  mode,
  language,
  setLanguage,
  onSubmit,
  error,
  className = '',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileSize(selectedFile.size);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pb-6 pt-12 px-4 md:px-0 ${className}`}>
      <div className="max-w-4xl mx-auto space-y-4">
        {mode === 'code' && (
          <LanguageSelector language={language} setLanguage={setLanguage} />
        )}

        <div className={`bg-[#1A1A1A] rounded-2xl shadow-lg transition-all duration-200 ${
          isFocused ? 'ring-2 ring-[#00D1FF]/50 shadow-[#00D1FF]/20' : ''
        }`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask me anything... (Shift + Enter to send)"
            className={`w-full bg-transparent px-6 py-4 focus:outline-none transition-all resize-none ${
              error ? 'text-red-500' : 'text-white'
            } min-h-[52px] placeholder:text-white/30`}
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          />
          
          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center gap-2">
              <label className="p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                <Paperclip className="w-5 h-5 text-white/50" />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".c,.py,.java,.js,.cpp,.go,.txt,.md,.html,.php"
                />
              </label>
              {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
            
            <button
              onClick={(e) => onSubmit(e as any)}
              disabled={isLoading}
              className="p-2 bg-gradient-to-r from-[#00D1FF] to-[#FF3DFF] rounded-xl disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-[#00D1FF]/20 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {file && (
          <div className="bg-[#1A1A1A] rounded-2xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#00D1FF]">
                {file.name} ({formatFileSize(fileSize)})
              </span>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-white/50 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
