import React from 'react';
import { 
  Gem, LayoutDashboard, IndianRupee, ScanBarcode, RefreshCw, 
  Boxes, Hammer, Flame, Receipt, BarChart3, Settings, 
  ChevronLeft, ChevronRight, X, Radio 
} from 'lucide-react';
import { useJewellery } from '../context/JewelleryContext';

export const APP_MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Home' },
  { id: 'billing', label: 'New Bill (Rupees)', icon: IndianRupee, badge: 'Billing' },
  { id: 'barcode', label: 'Barcode Billing', icon: ScanBarcode, badge: 'Fast POS' },
  { id: 'metal-exchange', label: 'Old Gold Exchange', icon: RefreshCw, badge: 'Barter' },
  { id: 'inventory', label: 'Stock & Inventory', icon: Boxes, badge: 'Stock' },
  { id: 'karagir', label: 'Karagir (Artisan) Work', icon: Hammer, badge: 'Artisans' },
  { id: 'refinery', label: 'Gold Refinery', icon: Flame, badge: 'Melting' },
  { id: 'sales-purchase', label: 'Sales & Purchases', icon: Receipt, badge: 'Records' },
  { id: 'reports', label: 'Reports & Download', icon: BarChart3, badge: 'Reports' },
  { id: 'settings', label: 'Gold Rates & Settings', icon: Settings, badge: 'Setup' },
];

export default function Sidebar({ 
  activeView, 
  onSelectView, 
  isOpen, 
  onClose,
  isCollapsed,
  onToggleCollapse
}) {
  const { rates, showroom } = useJewellery();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-obsidian-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 transition-all duration-300 ease-in-out glass-panel border-r border-white/10 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-20' : 'w-72 sm:w-80 lg:w-72'
        }`}
      >
        {/* Top: Brand Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-600 to-amber-900 p-[1px] shadow-gold-glow flex-shrink-0">
              <div className="w-full h-full bg-obsidian-900 rounded-[10px] flex items-center justify-center">
                <Gem className="w-5 h-5 text-gold-400" />
              </div>
            </div>

            {!isCollapsed && (
              <div className="transition-opacity duration-300 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-lg font-bold tracking-wider text-white whitespace-nowrap">
                    Karat<span className="text-gold-400">Craft</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-gold-500/10 border border-gold-500/30 text-gold-300 font-bold">
                    ERP
                  </span>
                </div>
                <p className="text-[10px] tracking-widest text-slate-400 uppercase font-mono truncate">
                  Jewellery Software
                </p>
              </div>
            )}
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg glass-pill text-slate-400 hover:text-white lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Collapse/Expand for desktop */}
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg glass-pill text-slate-400 hover:text-white hover:border-gold-500/40 cursor-pointer transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Main Menu
            </div>
          )}

          {APP_MODULES.map((module) => {
            const Icon = module.icon;
            const isActive = activeView === module.id;

            return (
              <button
                key={module.id}
                onClick={() => {
                  onSelectView(module.id);
                  if (onClose) onClose();
                }}
                title={isCollapsed ? module.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/20 to-amber-600/10 text-gold-200 border border-gold-500/40 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  isActive ? 'bg-gold-500 text-obsidian-950 font-bold' : 'bg-white/5 text-slate-400 group-hover:text-gold-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{module.label}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                      isActive 
                        ? 'bg-gold-500/20 text-gold-300 border-gold-500/40' 
                        : 'bg-white/5 text-slate-500 border-white/5'
                    }`}>
                      {module.badge}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Live Rates Widget */}
        <div className="p-3 sm:p-4 border-t border-white/10 space-y-2">
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-obsidian-900/90 border border-white/5 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-gold-400 font-bold">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  TODAY'S RATES
                </span>
                <span className="text-emerald-400">● LIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gold 22K (916):</span>
                <span className="font-bold text-gold-300">₹{rates.gold22k}/g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Silver:</span>
                <span className="font-bold text-slate-200">₹{rates.silver999}/g</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Rates Live">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          )}

          {!isCollapsed && (
            <div className="text-[10px] font-mono text-center text-slate-500 truncate">
              {showroom.name}
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
