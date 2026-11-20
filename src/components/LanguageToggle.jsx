import React from 'react';
import { Languages } from 'lucide-react';
import { useJewellery } from '../context/JewelleryContext';

export default function LanguageToggle({ className = '', variant = 'pill' }) {
  const { language, setLanguage, toggleLanguage, theme } = useJewellery();
  const isDark = theme === 'dark';
  const isMarathi = language === 'mr';

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleLanguage}
        type="button"
        className={`p-2 rounded-xl transition-all duration-300 cursor-pointer border active:scale-95 flex items-center justify-center relative ${
          isDark
            ? 'bg-obsidian-900 border-white/10 text-gold-400 hover:border-gold-500/50 hover:bg-gold-500/10 shadow-sm'
            : 'bg-white border-slate-300 text-slate-800 hover:border-gold-500/60 hover:text-gold-600 shadow-sm'
        } ${className}`}
        aria-label={isMarathi ? 'Switch to English' : 'मराठी भाषेत बदला'}
        title={isMarathi ? 'Switch to English' : 'मराठी भाषेत बदला (Change to Marathi)'}
      >
        <Languages className="w-4 h-4" />
        <span className="absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded bg-gold-500 text-obsidian-950 uppercase leading-none py-0.5">
          {isMarathi ? 'मरा' : 'EN'}
        </span>
      </button>
    );
  }

  // Luxury Dual-Pill Toggle (EN | मराठी)
  return (
    <div 
      className={`inline-flex items-center p-1 rounded-full border transition-all duration-300 select-none ${
        isDark
          ? 'bg-obsidian-900/90 border-white/10 hover:border-gold-500/40 text-slate-300 shadow-sm'
          : 'bg-white border-slate-200 hover:border-gold-500/50 text-slate-800 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-center gap-1">
        <div className="pl-1.5 pr-0.5 text-gold-400 flex items-center">
          <Languages className="w-3.5 h-3.5" />
        </div>

        {/* English Button */}
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold transition-all duration-200 cursor-pointer ${
            !isMarathi
              ? 'bg-gold-500 text-obsidian-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white dark:hover:text-white'
          }`}
          title="Switch to English"
        >
          EN
        </button>

        {/* Marathi Button */}
        <button
          type="button"
          onClick={() => setLanguage('mr')}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold transition-all duration-200 cursor-pointer ${
            isMarathi
              ? 'bg-gold-500 text-obsidian-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white dark:hover:text-white'
          }`}
          title="मराठी भाषेमध्ये बदला (Switch to Marathi)"
        >
          मराठी
        </button>
      </div>
    </div>
  );
}
