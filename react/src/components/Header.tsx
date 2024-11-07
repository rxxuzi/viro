import React from 'react';
import { Menu } from 'lucide-react';
import { ModeSelector } from './ModeSelector';
import { Mode } from '../App';

interface HeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  onMenuClick: () => void;
}

export function Header({ mode, setMode, onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#111111]/80 backdrop-blur-xl border-b border-white/10 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/viro-logo.svg" alt="VIRO AI" className="w-8 h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00D1FF] to-[#FF3DFF] bg-clip-text text-transparent">
              VIRO AI
            </h1>
          </div>
        </div>
        <ModeSelector mode={mode} setMode={setMode} />
      </div>
    </header>
  );
}