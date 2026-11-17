import React, { useState, useEffect } from 'react';
import { JewelleryProvider, useJewellery } from './context/JewelleryContext';
import { Cloud, CheckCircle2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import ErrorBoundary from './components/ErrorBoundary';

// Views for the 9 Modules in the Quotation
import DashboardView from './views/DashboardView';
import RupeesBillingView from './views/RupeesBillingView';
import BarcodeBillingView from './views/BarcodeBillingView';
import MetalExchangeView from './views/MetalExchangeView';
import InventoryView from './views/InventoryView';
import KaragirView from './views/KaragirView';
import RefineryView from './views/RefineryView';
import SalesPurchaseView from './views/SalesPurchaseView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

function AppContent() {
  const { liveSyncNotification } = useJewellery();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });

  // Ambient mouse spotlight across viewport for luxury feel
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveView} />;
      case 'billing':
        return <RupeesBillingView />;
      case 'barcode':
        return <BarcodeBillingView />;
      case 'metal-exchange':
        return <MetalExchangeView />;
      case 'inventory':
        return <InventoryView />;
      case 'karagir':
        return <KaragirView />;
      case 'refinery':
        return <RefineryView />;
      case 'sales-purchase':
        return <SalesPurchaseView onNavigate={setActiveView} />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 relative selection:bg-gold-500/30 selection:text-gold-200">
      
      {/* Luxury dynamic mouse spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-60 hidden lg:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 175, 55, 0.04), transparent 80%)`,
        }}
      />

      {/* Fixed Luxury Frosted Glass Sidebar */}
      <Sidebar 
        activeView={activeView}
        onSelectView={setActiveView}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div 
        className={`min-h-screen transition-all duration-300 ease-in-out flex flex-col justify-between ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Sticky Frosted Header with Mobile Menu & Status Pills */}
        <TopHeader 
          activeView={activeView}
          onSelectView={setActiveView}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Active Operational Module View with smooth transition */}
        <main className="flex-1">
          <ErrorBoundary key={activeView} onNavigateDashboard={() => setActiveView('dashboard')}>
            {renderActiveView()}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-4 px-6 text-center text-xs font-mono text-slate-500">
          KaratCraft ERP™ • Jewellery Billing & Management Software • Multi-Counter Showroom Deployment
        </footer>
      </div>

      {/* Floating Real-time Cloud Sync Feedback Toast */}
      {liveSyncNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-obsidian-900/95 border text-white shadow-2xl backdrop-blur-xl ${
            liveSyncNotification.isError ? 'border-rose-500/50' : 'border-emerald-500/40'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              liveSyncNotification.isError ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Cloud className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold ${
                  liveSyncNotification.isError ? 'text-rose-300' : 'text-emerald-300'
                }`}>
                  {liveSyncNotification.title}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {liveSyncNotification.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans max-w-sm line-clamp-1">
                {liveSyncNotification.message}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <JewelleryProvider>
      <AppContent />
    </JewelleryProvider>
  );
}
