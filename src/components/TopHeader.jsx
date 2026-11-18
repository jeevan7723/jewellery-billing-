import React from 'react';
import { Menu, Plus, ScanBarcode, Cloud, CloudCheck, CloudOff } from 'lucide-react';
import { APP_MODULES } from './Sidebar';
import { useJewellery } from '../context/JewelleryContext';
import ThemeToggle from './ThemeToggle';

export default function TopHeader({ 
  activeView, 
  onSelectView, 
  onToggleMobileSidebar, 
  isCollapsed 
}) {
  const { rates, showroom, cloudStatus } = useJewellery();
  const currentModule = APP_MODULES.find(m => m.id === activeView) || APP_MODULES[0];

  return (
    <header className="sticky top-0 z-30 bg-obsidian-950/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Active Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl glass-pill text-slate-300 hover:text-white border border-white/10 cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            {showroom.name}
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-white text-sm sm:text-base">
              {currentModule.label}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Live Rates & Quick New Bill */}
      <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
        {/* Mobile Quick Barcode Scan */}
        <button
          onClick={() => onSelectView('barcode')}
          className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold cursor-pointer shadow-sm active:scale-95 transition-transform"
          title="Scan Barcode"
        >
          <ScanBarcode className="w-3.5 h-3.5" />
          <span>Scan</span>
        </button>

        {/* Firebase Cloud Sync Status */}
        <div 
          onClick={() => onSelectView('settings')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-mono cursor-pointer transition-colors ${
            cloudStatus?.isSyncing
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 animate-pulse'
              : cloudStatus?.connected 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
              : cloudStatus?.loading
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 animate-pulse'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300 hover:border-rose-400'
          }`}
          title={
            cloudStatus?.connected 
              ? `Connected to Firebase Cloud (jewellery-billing-28699) • Last sync: ${cloudStatus?.lastSyncTime || 'Just now'}` 
              : cloudStatus?.error 
              ? `Firebase notice: ${cloudStatus.error}` 
              : 'Connecting to Firebase...'
          }
        >
          <span className={`w-2 h-2 rounded-full ${
            cloudStatus?.isSyncing
              ? 'bg-amber-400 animate-ping'
              : cloudStatus?.connected 
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
              : cloudStatus?.loading 
              ? 'bg-amber-400 animate-ping' 
              : 'bg-rose-400'
          }`} />
          <Cloud className="w-3.5 h-3.5 hidden xs:inline" />
          <span className="hidden sm:inline">
            {cloudStatus?.isSyncing ? 'Syncing...' : cloudStatus?.connected ? 'Live Sync Active' : cloudStatus?.loading ? 'Connecting...' : 'Local Mode'}
          </span>
        </div>

        {/* Live Gold Rate */}
        <div 
          onClick={() => onSelectView('settings')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-900/90 border border-white/10 text-slate-300 hover:border-gold-500/40 cursor-pointer transition-colors"
          title="Click to change daily rates"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">22K Gold:</span>
          <span className="text-gold-300 font-bold">₹{rates.gold22k}/g</span>
        </div>

        {/* Live Silver Rate */}
        <div 
          onClick={() => onSelectView('settings')}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-900/90 border border-white/10 text-slate-300 hover:border-gold-500/40 cursor-pointer transition-colors"
          title="Click to change daily rates"
        >
          <span className="text-slate-400">Silver:</span>
          <span className="text-slate-100 font-bold">₹{rates.silver999}/g</span>
        </div>

        {/* Theme Mode Toggle (Dark / Light) */}
        <ThemeToggle />

        {/* Quick New Bill Action */}
        <button
          onClick={() => onSelectView('billing')}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-xl gold-gradient-btn text-xs font-bold cursor-pointer shadow-gold-glow active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Bill</span>
        </button>
      </div>
    </header>
  );
}
