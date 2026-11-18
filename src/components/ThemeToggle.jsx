import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useJewellery } from '../context/JewelleryContext';

export default function ThemeToggle({ className = '', variant = 'pill' }) {
  const { theme, toggleTheme } = useJewellery();
  const isDark = theme === 'dark';

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-xl transition-all duration-300 cursor-pointer border active:scale-95 ${
          isDark
            ? 'bg-obsidian-900 border-white/10 text-amber-300 hover:border-amber-400/50 hover:bg-amber-400/10 shadow-sm'
            : 'bg-white border-slate-300 text-slate-700 hover:border-gold-500/60 hover:text-gold-600 shadow-sm'
        } ${className}`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45 text-amber-300" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12 text-slate-700" />
        )}
      </button>
    );
  }

  // Default Luxury Pill Toggle Button
  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer border active:scale-95 select-none ${
        isDark 
          ? 'bg-obsidian-900/90 hover:bg-obsidian-850 border-white/10 hover:border-amber-400/40 text-slate-300 shadow-sm' 
          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-gold-500/50 text-slate-800 shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode (Showroom Ivory)' : 'Switch to Dark Mode (Obsidian Gold)'}
    >
      {/* Sliding mini toggle track */}
      <div 
        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
          isDark ? 'bg-amber-500/20 border border-amber-400/30' : 'bg-slate-200 border border-slate-300'
        }`}
      >
        <div
          className={`w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
            isDark 
              ? 'translate-x-4 bg-gradient-to-tr from-amber-400 to-yellow-300 text-obsidian-950' 
              : 'translate-x-0 bg-slate-700 text-white'
          }`}
        >
          {isDark ? (
            <Sun className="w-2.5 h-2.5 stroke-[2.5]" />
          ) : (
            <Moon className="w-2.5 h-2.5 stroke-[2.5]" />
          )}
        </div>
      </div>

      {/* Label */}
      <span className="text-[11px] font-mono font-medium hidden xs:inline tracking-tight">
        {isDark ? (
          <span className="text-amber-300/90 group-hover:text-amber-300 flex items-center gap-1">
            <span>Dark</span>
          </span>
        ) : (
          <span className="text-slate-700 group-hover:text-slate-900 flex items-center gap-1">
            <span>Light</span>
          </span>
        )}
      </span>
    </button>
  );
}
