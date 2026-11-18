import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  TrendingUp, IndianRupee, Boxes, Hammer, Flame, 
  Receipt, ArrowUpRight, Scale, Sparkles, Printer, Plus, Radio 
} from 'lucide-react';
import PrintModal from '../components/print/PrintModal';
import TaxInvoiceTemplate from '../components/print/TaxInvoiceTemplate';

export default function DashboardView({ onNavigate }) {
  const { rates, inventory, invoices, karagirs, refineryBatches, showroom, purchasedGoldSummary } = useJewellery();
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [printFormat, setPrintFormat] = useState('a4');

  // Calculations
  const totalSalesToday = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalStockItems = inventory.length;
  const totalGrossWeight = inventory.reduce((sum, item) => sum + item.grossWeight, 0);
  const totalNetWeight = inventory.reduce((sum, item) => sum + item.netWeight, 0);
  
  // Metal balance held with artisans
  const totalKaragirBalance = karagirs.reduce((sum, k) => sum + k.balanceMetal, 0);

  return (
    <div className="space-y-8 p-4 sm:p-8 animate-in fade-in duration-300">
      
      {/* Top Welcome & Daily Rates Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl glass-panel border border-gold-500/30 shadow-glass-lg relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-mono font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Counter 01 Ready • {showroom.name}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Jewellery Shop <span className="gold-gradient-text">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-xl">
            See your daily sales, vault stock weight, gold given to karagirs, and live market rates in one place.
          </p>
        </div>

        {/* Live Rates Quick Display */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 relative z-10">
          <div className="p-3.5 rounded-2xl bg-obsidian-900/90 border border-white/10 text-center min-w-[120px]">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Gold 22K (916)</div>
            <div className="text-base font-bold font-mono text-gold-300">₹{rates.gold22k}/g</div>
            <div className="text-[9px] font-mono text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> Live Today
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-obsidian-900/90 border border-white/10 text-center min-w-[120px]">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Gold 24K (Pure)</div>
            <div className="text-base font-bold font-mono text-white">₹{rates.gold24k}/g</div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">Bullion Rate</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-obsidian-900/90 border border-white/10 text-center min-w-[120px]">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Silver (999)</div>
            <div className="text-base font-bold font-mono text-slate-200">₹{rates.silver999}/g</div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">₹{(rates.silver999 * 1000).toLocaleString('en-IN')}/kg</div>
          </div>
        </div>
      </div>

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Today's Sales */}
        <div 
          onClick={() => onNavigate('billing')}
          className="glass-card p-5 rounded-2xl border border-white/10 hover:border-gold-500/40 cursor-pointer space-y-3 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-white">
            ₹{totalSalesToday.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>{invoices.length} Bills Made</span>
            <span className="text-gold-400">Make Bill →</span>
          </div>
        </div>

        {/* Card 2: Vault Stock Weight */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="glass-card p-5 rounded-2xl border border-white/10 hover:border-gold-500/40 cursor-pointer space-y-3 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Net Gold in Stock</span>
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-gold-300">
            {totalNetWeight.toFixed(3)}g
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Gross: {totalGrossWeight.toFixed(3)}g</span>
            <span className="text-gold-400">{totalStockItems} Pieces</span>
          </div>
        </div>

        {/* Card 3: Purchased Old Gold (Combined Value) */}
        <div 
          onClick={() => onNavigate('sales-purchase')}
          className="glass-card p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 cursor-pointer space-y-3 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">Purchased Old Gold</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-amber-300">
            ₹{Number(purchasedGoldSummary?.totalValue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>{Number(purchasedGoldSummary?.totalGrossWeight || 0).toFixed(3)}g Inward</span>
            <span className="text-amber-400">View Inward →</span>
          </div>
        </div>

        {/* Card 4: Artisan Metal with Karagirs */}
        <div 
          onClick={() => onNavigate('karagir')}
          className="glass-card p-5 rounded-2xl border border-white/10 hover:border-gold-500/40 cursor-pointer space-y-3 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Gold with Karagirs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-white">
            {totalKaragirBalance.toFixed(3)}g
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>With {karagirs.length} Karagirs</span>
            <span className="text-purple-400">View Balance</span>
          </div>
        </div>

        {/* Card 5: Active Refinery Batches */}
        <div 
          onClick={() => onNavigate('refinery')}
          className="glass-card p-5 rounded-2xl border border-white/10 hover:border-gold-500/40 cursor-pointer space-y-3 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Gold in Refinery</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-white">
            {refineryBatches.length} Batches
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Melting Batches</span>
            <span className="text-amber-400">View Batches</span>
          </div>
        </div>

      </div>

      {/* Quick Action Buttons */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-400" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => onNavigate('billing')}
            className="p-4 rounded-xl glass-card hover:bg-gold-500/10 hover:border-gold-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div className="font-semibold text-white text-xs">Make New Bill</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Calculate GST & Print</div>
          </button>

          <button 
            onClick={() => onNavigate('barcode')}
            className="p-4 rounded-xl glass-card hover:bg-gold-500/10 hover:border-gold-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="font-semibold text-white text-xs">Scan Barcode Bill</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Quick Bill by Tag</div>
          </button>

          <button 
            onClick={() => onNavigate('metal-exchange')}
            className="p-4 rounded-xl glass-card hover:bg-gold-500/10 hover:border-gold-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
            <div className="font-semibold text-white text-xs">Old Gold Exchange</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Convert Old Gold to New</div>
          </button>

          <button 
            onClick={() => onNavigate('karagir')}
            className="p-4 rounded-xl glass-card hover:bg-gold-500/10 hover:border-gold-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Hammer className="w-4 h-4" />
            </div>
            <div className="font-semibold text-white text-xs">Give Gold to Karagir</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Track Balance Weight</div>
          </button>
        </div>
      </div>

      {/* Recent Bills Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-serif font-bold text-white text-base">
              Recent Bills Made
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              List of recent customer sales invoices
            </p>
          </div>

          <button 
            onClick={() => onNavigate('billing')}
            className="text-xs font-mono text-gold-400 hover:text-gold-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Billing Counter</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-left">
                <th className="py-2.5 px-3">Bill No.</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3 text-right">Net Wt</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
                <th className="py-2.5 px-3 text-center">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No bills generated yet. Create a bill from the billing counter to see it here.
                  </td>
                </tr>
              ) : (
                invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-bold text-gold-300">{inv.invoiceNo}</td>
                    <td className="py-3 px-3 text-slate-400">{inv.date}</td>
                    <td className="py-3 px-3 text-white font-medium">{inv.customerName}</td>
                    <td className="py-3 px-3 text-slate-300">
                      {inv.items?.map(i => i.name).join(', ') || 'Jewellery Article'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-200">
                      {inv.items?.reduce((s, i) => s + (i.netWeight || 0), 0).toFixed(3)}g
                    </td>
                    <td className="py-3 px-3 text-right font-serif font-bold text-white text-sm">
                      ₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setShowPrintModal(true);
                        }}
                        className="p-1.5 rounded-lg glass-pill text-gold-400 hover:text-white hover:border-gold-500/40 cursor-pointer"
                        title="Print Tax Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TAX INVOICE PRINT MODAL */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title={`Tax Invoice: ${selectedInvoice?.invoiceNo || ''}`}
        formatToggle={true}
        format={printFormat}
        onFormatChange={setPrintFormat}
      >
        {selectedInvoice && (
          <TaxInvoiceTemplate 
            invoice={selectedInvoice}
            showroom={showroom}
            format={printFormat}
          />
        )}
      </PrintModal>

    </div>
  );
}
