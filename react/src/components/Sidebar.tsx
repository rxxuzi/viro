import React from 'react';
import { X, Shield, HelpCircle, FileText, Trash2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanup: () => void;
}

const menuItems = [
  { icon: HelpCircle, label: 'Help', path: '/help' },
  { icon: Shield, label: 'Security', path: '/security' },
  { icon: FileText, label: 'License', path: '/license' },
];

export function Sidebar({ isOpen, onClose, onCleanup }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-[#111111] border-r border-white/10 p-6 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <a
              key={path}
              href={path}
              className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </a>
          ))}
          <button
            onClick={onCleanup}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Cleanup Chat</span>
          </button>
        </nav>
      </div>
    </>
  );
}