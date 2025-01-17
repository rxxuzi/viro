import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { Message } from './components/Message';
import { ModelType, getModelValue } from './types/models';

export type Mode = 'ask' | 'code' | 'docs' | 'fix';

interface MessageType {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  question?: string;
}

const ENTER_TO_SUBMIT_KEY = 'viro_enter_to_submit';

export default function App() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('ask');
  const [model, setModel] = useState<ModelType>('durian');
  const [language, setLanguage] = useState('javascript');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [cleanupInProgress, setCleanupInProgress] = useState(false);
  const [enterToSubmit, setEnterToSubmit] = useState(() => {
    const saved = localStorage.getItem(ENTER_TO_SUBMIT_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(ENTER_TO_SUBMIT_KEY, JSON.stringify(enterToSubmit));
  }, [enterToSubmit]);

  const handleCleanup = () => {
    setCleanupInProgress(true);
    setTimeout(() => {
      setMessages([]);
      setHasInteracted(false);
      setCleanupInProgress(false);
      setIsSidebarOpen(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    setError(undefined);
    setHasInteracted(true);
    const formData = new FormData();
    formData.append('question', input);
    formData.append('mode', mode);
    formData.append('language', language);
    formData.append('model', getModelValue(model));
    if (file) {
      formData.append('file', file);
    }

    const newMessage = { 
      role: 'user' as const, 
      content: input, 
      id: Date.now().toString(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://10.133.0.61:9200/api/ask', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            accumulatedContent += parsed.response;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === 'assistant') {
                lastMessage.content = accumulatedContent;
                return [...newMessages];
              }
              return [...prev, { 
                role: 'assistant', 
                content: accumulatedContent, 
                id: Date.now().toString(),
                question: input 
              }];
            });
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    // Implement regeneration logic
    console.log('Regenerating response...');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Header
        mode={mode}
        setMode={setMode}
        model={model}
        setModel={setModel}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCleanup={handleCleanup}
        enterToSubmit={enterToSubmit}
        onEnterToSubmitChange={setEnterToSubmit}
      />

      <main className={`flex-1 container mx-auto px-4 transition-all duration-500 ease-in-out ${
        hasInteracted ? 'pt-24 pb-40' : 'pt-0 flex items-center'
      }`}>
        <div className={`transition-all duration-500 ease-in-out ${
          hasInteracted ? 'opacity-100' : 'opacity-0'
        } ${cleanupInProgress ? 'opacity-0' : ''}`}>
          <div className="max-w-4xl mx-auto space-y-6 mb-20">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                question={message.question}
                model={model}
                onRegenerate={message.role === 'assistant' ? handleRegenerate : undefined}
              />
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          file={file}
          setFile={setFile}
          isLoading={isLoading}
          mode={mode}
          model={model}
          language={language}
          setLanguage={setLanguage}
          onSubmit={handleSubmit}
          error={error}
          className={hasInteracted ? '' : 'max-w-2xl mx-auto'}
          enterToSubmit={enterToSubmit}
        />
      </main>
    </div>
  );
}