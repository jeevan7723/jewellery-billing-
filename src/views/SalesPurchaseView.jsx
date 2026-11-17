import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { Receipt, ShoppingCart, Users, Truck, ArrowUpRight, ArrowDownLeft, Printer, Plus } from 'lucide-react';
import PrintModal from '../components/print/PrintModal';
import TaxInvoiceTemplate from '../components/print/TaxInvoiceTemplate';

export default function SalesPurchaseView({ onNavigate }) {
  const { invoices, showroom } = useJewellery();
  const [activeTab, setActiveTab] = useState('sales');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [printFormat, setPrintFormat] = useState('a4');

  const [purchases, setPurchases] = useState([
    {
      purchaseId: "PUR-2026-044",
      date: "14-Nov-2026",
      supplierName: "MMTC-PAMP India Bullion Ltd",
      item: "24K Fine Gold Bars",
      metal: "Gold",
      grossWeight: 500.000,
      purity: "99.99%",
      ratePerGram: 7390,
      totalAmount: 3695000,
      status: "In Vault"
    },
    {
      purchaseId: "PUR-2026-043",
      date: "12-Nov-2026",
      supplierName: "Gujarat Bullion Refineries",
      item: "Fine Silver 999 Bullion",
      metal: "Silver",
      grossWeight: 5000.000,
      purity: "99.9%",
      ratePerGram: 88.0,
      totalAmount: 440000,
      status: "In Vault"
    }
  ]);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Sales & <span className="gold-gradient-text">Purchases</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            View all customer sales bills and gold purchases from suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-obsidian-900 border border-white/10 text-xs font-mono">
          <button 
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'sales' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Sales ({invoices.length})
          </button>
          <button 
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'purchases' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Supplier Purchases ({purchases.length})
          </button>
        </div>
      </div>

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glass-lg">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-serif font-bold text-white text-base">Customer Bills</h3>
            <button 
              onClick={() => onNavigate('billing')}
              className="px-4 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Make New Bill</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                  <th className="py-3 px-4">Bill No.</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">GST (3%)</th>
                  <th className="py-3 px-4 text-right text-gold-300">Total (₹)</th>
                  <th className="py-3 px-4 text-center">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-gold-400">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 text-slate-400">{inv.date}</td>
                    <td className="py-3 px-4 text-white font-medium">{inv.customerName}</td>
                    <td className="py-3 px-4 text-slate-400">{inv.phone}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {inv.items.map(i => i.name).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">₹{inv.subtotal?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-slate-400">₹{inv.gst3Percent?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-white text-sm">
                      ₹{inv.grandTotal?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PURCHASES TAB */}
      {activeTab === 'purchases' && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glass-lg">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-serif font-bold text-white text-base">Gold & Silver Purchases from Suppliers</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                  <th className="py-3 px-4">Purchase ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4 text-right">Gross Weight</th>
                  <th className="py-3 px-4">Purity</th>
                  <th className="py-3 px-4 text-right">Rate / g</th>
                  <th className="py-3 px-4 text-right text-gold-300">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {purchases.map((pur, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-sky-400">{pur.purchaseId}</td>
                    <td className="py-3 px-4 text-slate-400">{pur.date}</td>
                    <td className="py-3 px-4 text-white font-medium">{pur.supplierName}</td>
                    <td className="py-3 px-4 text-slate-300">{pur.item}</td>
                    <td className="py-3 px-4 text-right text-slate-200">{pur.grossWeight.toFixed(3)}g</td>
                    <td className="py-3 px-4 text-gold-300 font-bold">{pur.purity}</td>
                    <td className="py-3 px-4 text-right text-slate-300">₹{pur.ratePerGram}</td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-white text-sm">
                      ₹{pur.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-emerald-400">{pur.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
