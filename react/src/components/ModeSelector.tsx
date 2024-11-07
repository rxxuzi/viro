import React from 'react';
import { Brain, Code, FileQuestion, FileText } from 'lucide-react';
import { Mode } from '../App';

const modes = [
  { id: 'ask' as Mode, icon: Brain, color: '#FF3DFF', label: 'Ask' },
  { id: 'code' as Mode, icon: Code, color: '#FF8A00', label: 'Code' },
  { id: 'docs' as Mode, icon: FileText, color: '#00FF94', label: 'Docs' },
  { id: 'fix' as Mode, icon: FileQuestion, color: '#00D1FF', label: 'Fix' },
];

interface ModeSelectorProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export function ModeSelector({ mode, setMode }: ModeSelectorProps) {
  return (
    <div className="flex gap-2">
      {modes.map(({ id, icon: Icon, color, label }) => (
        <button
          key={id}
          onClick={() => setMode(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            mode === id
              ? 'bg-white/10 shadow-lg'
              : 'bg-transparent hover:bg-white/5'
          }`}
          style={{
            boxShadow: mode === id ? `0 4px 20px ${color}20` : undefined,
          }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
          <span style={{ color }}>{label}</span>
        </button>
      ))}
    </div>
  );
}