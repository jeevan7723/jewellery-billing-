import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  Receipt, ShoppingCart, Users, Truck, ArrowUpRight, ArrowDownLeft, 
  Printer, Plus, ArrowRightLeft, Sparkles, Scale, RefreshCw, Layers,
  Trash2, AlertTriangle, X
} from 'lucide-react';
import PrintModal from '../components/print/PrintModal';
import TaxInvoiceTemplate from '../components/print/TaxInvoiceTemplate';
import MetalExchangeTemplate from '../components/print/MetalExchangeTemplate';

export default function SalesPurchaseView({ onNavigate }) {
  const { invoices = [], showroom, deleteInvoice } = useJewellery();
  const [activeTab, setActiveTab] = useState('sales');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [printFormat, setPrintFormat] = useState('a4');
  const [purchaseFilter, setPurchaseFilter] = useState('all'); // 'all' | 'exchange' | 'supplier'
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteInvoice(deleteTarget.invoiceNo);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting invoice:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const [supplierPurchases, setSupplierPurchases] = useState(() => {
    try {
      const saved = localStorage.getItem('kc_supplier_purchases');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Derive Customer Old Gold Purchases directly from live sync exchange invoices!
  const customerOldGoldPurchases = invoices
    .filter(inv => Boolean(inv.isExchange || inv.invoiceType === 'exchange'))
    .map(inv => ({
      purchaseId: `PUR-${inv.invoiceNo}`,
      voucherNo: inv.invoiceNo,
      date: inv.date || 'Recent',
      supplierName: `${inv.customerName || 'Customer'} (Old Gold Exchange)`,
      customerName: inv.customerName,
      item: inv.inwardDescription || `Old ${inv.inwardMetal || 'Gold'} Scrap`,
      metal: inv.inwardMetal || 'Gold',
      grossWeight: Number(inv.inwardGrossWeight || 0),
      netWeight: Number(inv.inwardNetWeight || inv.inwardGrossWeight || 0),
      purity: inv.inwardKarat || '22K',
      ratePerGram: Number(inv.inwardRate || 0),
      totalAmount: Math.round(Number(inv.inwardValuation || 0)),
      status: "In Vault (Old Gold)",
      isExchange: true,
      rawInvoice: inv
    }));

  // Combined Purchases: Supplier Bullion + Inward Customer Old Gold
  const allPurchases = [...customerOldGoldPurchases, ...supplierPurchases];

  const filteredPurchases = allPurchases.filter(p => {
    if (purchaseFilter === 'exchange') return p.isExchange;
    if (purchaseFilter === 'supplier') return !p.isExchange;
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Sales & <span className="gold-gradient-text">Purchases</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            View customer sales bills and all inward gold purchases (including Old Gold Barter).
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-obsidian-900 border border-white/10 text-xs font-mono">
          <button 
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'sales' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Sales ({invoices.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'purchases' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Purchases & Inward Gold ({allPurchases.length})
          </button>
        </div>
      </div>

      {/* SALES TAB */}
      {activeTab === 'sales' && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glass-lg space-y-0">
          <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-white text-base">Customer Bills & Exchanges</h3>
              <p className="text-[11px] font-mono text-slate-400">
                All sales invoices and old gold exchange vouchers live synced to Firebase.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {onNavigate && (
                <button 
                  type="button"
                  onClick={() => onNavigate('metal-exchange')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Old Gold Exchange</span>
                </button>
              )}
              {onNavigate && (
                <button 
                  type="button"
                  onClick={() => onNavigate('billing')}
                  className="px-3.5 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Make New Bill</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                  <th className="py-3 px-4">Bill / Voucher</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Item & Exchange Details</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">GST (3%)</th>
                  <th className="py-3 px-4 text-right text-amber-300">Old Gold Credit</th>
                  <th className="py-3 px-4 text-right text-gold-300">Net Payable (₹)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-10 text-center text-slate-400">
                      No invoices recorded yet. Create a bill or save an exchange to see it here.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, idx) => {
                    const isExch = Boolean(inv.isExchange || inv.invoiceType === 'exchange');
                    const oldGoldCredit = Number(inv.exchangeCredit || inv.inwardValuation || 0);
                    const gstAmount = Number(inv.gst3Percent || 0);

                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className={`font-bold ${isExch ? 'text-purple-400' : 'text-gold-400'}`}>
                              {inv.invoiceNo}
                            </span>
                            {isExch && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                                EXCHANGE
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-400">{inv.date}</td>

                        <td className="py-3 px-4 text-white font-medium">
                          <div>{inv.customerName}</div>
                          {isExch && (
                            <span className="text-[10px] text-purple-300/80 font-mono">
                              Barter Customer
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-400">{inv.phone || '—'}</td>

                        <td className="py-3 px-4 text-slate-300 max-w-xs">
                          {isExch ? (
                            <div>
                              <div className="text-white font-medium">
                                {inv.outwardDescription || inv.items?.[0]?.name || 'New Jewellery'}
                              </div>
                              <div className="text-[10px] text-amber-400 font-mono mt-0.5 flex flex-wrap items-center gap-1">
                                <span>🔄 Inward: <strong>{inv.inwardGrossWeight}g</strong> {inv.inwardMetal} ({inv.inwardKarat})</span>
                                <span className="text-slate-400">• Val: ₹{Number(inv.inwardValuation || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="truncate">
                              {inv.items?.map(i => i.name).join(', ') || 'Jewellery Article'}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right text-slate-300">
                          ₹{Number(inv.subtotal || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Separate GST Column */}
                        <td className="py-3 px-4 text-right font-mono">
                          {gstAmount > 0 ? (
                            <span className="text-slate-300">
                              ₹{gstAmount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Separate Old Gold Credit Column */}
                        <td className="py-3 px-4 text-right font-mono">
                          {oldGoldCredit > 0 ? (
                            <span className="text-amber-400 font-bold">
                              -₹{oldGoldCredit.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="font-serif font-bold text-white text-sm">
                            ₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')}
                          </div>
                          {isExch && (
                            <span className={`text-[10px] font-mono font-bold ${
                              (inv.cashSettlement ?? 0) >= 0 ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {(inv.cashSettlement ?? 0) >= 0 ? 'Refund Due' : 'Balance Paid'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowPrintModal(true);
                              }}
                              className={`p-1.5 rounded-lg glass-pill cursor-pointer transition-all ${
                                isExch 
                                  ? 'text-purple-400 hover:text-white hover:border-purple-500/50' 
                                  : 'text-gold-400 hover:text-white hover:border-gold-500/40'
                              }`}
                              title={isExch ? "Print Old Gold Exchange Slip" : "Print Tax Invoice"}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              type="button"
                              onClick={() => setDeleteTarget(inv)}
                              className="p-1.5 rounded-lg glass-pill text-slate-500 hover:text-rose-400 hover:border-rose-500/40 cursor-pointer transition-all"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PURCHASES TAB */}
      {activeTab === 'purchases' && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glass-lg space-y-0">
          <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-white text-base">Inward Purchases & Customer Old Gold</h3>
              <p className="text-[11px] font-mono text-slate-400">
                Track bullion acquisitions from suppliers and scrap gold deposited by customers in exchange.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onNavigate && (
                <button 
                  type="button"
                  onClick={() => onNavigate('metal-exchange')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Receive Old Gold Exchange</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-Filters: All, Customer Old Gold, Supplier Bullion */}
          <div className="px-4 py-3 bg-white/[0.01] border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs font-mono">
            <span className="text-slate-400 text-[11px] uppercase mr-1">Filter:</span>
            {[
              { id: 'all', label: `All Inward Purchases (${allPurchases.length})` },
              { id: 'exchange', label: `🪙 Customer Old Gold (${customerOldGoldPurchases.length})` },
              { id: 'supplier', label: `🏢 Supplier Bullion (${supplierPurchases.length})` },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPurchaseFilter(f.id)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer border ${
                  purchaseFilter === f.id
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                    : 'bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                  <th className="py-3 px-4">Purchase ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Source / Party</th>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-right">Gross Weight</th>
                  <th className="py-3 px-4">Purity</th>
                  <th className="py-3 px-4 text-right">Rate / g</th>
                  <th className="py-3 px-4 text-right text-gold-300">Total Valuation (₹)</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-10 text-center text-slate-400">
                      No purchases match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((pur, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${pur.isExchange ? 'text-purple-400' : 'text-sky-400'}`}>
                            {pur.purchaseId}
                          </span>
                          {pur.isExchange && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase">
                              OLD GOLD
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-400">{pur.date}</td>

                      <td className="py-3 px-4">
                        <span className="text-white font-medium">{pur.supplierName}</span>
                        {pur.isExchange && (
                          <span className="block text-[10px] text-purple-300/80 font-mono">
                            Customer Exchange Deposit
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-300">{pur.item}</td>

                      <td className="py-3 px-4 text-right text-slate-200 font-bold">
                        {Number(pur.grossWeight || 0).toFixed(3)}g
                      </td>

                      <td className="py-3 px-4 text-gold-300 font-bold">{pur.purity}</td>

                      <td className="py-3 px-4 text-right text-slate-300">
                        ₹{Number(pur.ratePerGram || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-serif font-bold text-white text-sm">
                        ₹{Number(pur.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4">
                        {pur.isExchange ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            In Vault (Scrap)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">{pur.status}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {pur.isExchange ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoice(pur.rawInvoice);
                                setShowPrintModal(true);
                              }}
                              className="p-1.5 rounded-lg glass-pill text-purple-400 hover:text-white hover:border-purple-500/40 cursor-pointer"
                              title="Print Old Gold Barter Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(pur.rawInvoice)}
                              className="p-1.5 rounded-lg glass-pill text-slate-500 hover:text-rose-400 hover:border-rose-500/40 cursor-pointer"
                              title="Delete exchange record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT MODAL: DISPATCHES TO TAX INVOICE OR METAL EXCHANGE TEMPLATE */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title={selectedInvoice?.isExchange 
          ? `Old Gold Exchange Barter Slip: ${selectedInvoice?.invoiceNo || ''}`
          : `Tax Invoice: ${selectedInvoice?.invoiceNo || ''}`
        }
        formatToggle={!selectedInvoice?.isExchange}
        format={printFormat}
        onFormatChange={setPrintFormat}
      >
        {selectedInvoice?.isExchange ? (
          <MetalExchangeTemplate 
            exchangeData={selectedInvoice}
            showroom={showroom}
          />
        ) : selectedInvoice ? (
          <TaxInvoiceTemplate 
            invoice={selectedInvoice}
            showroom={showroom}
            format={printFormat}
          />
        ) : null}
      </PrintModal>

      {/* DELETE RECORD CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 sm:p-7 rounded-3xl border border-rose-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-serif font-bold text-white text-base">
                  Delete {deleteTarget.isExchange || deleteTarget.invoiceType === 'exchange' ? 'Exchange Record' : 'Sales Invoice'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-slate-300">
                Are you sure you want to permanently delete this transaction record?
              </p>
              
              <div className="p-3.5 rounded-2xl bg-obsidian-950/90 border border-white/10 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Voucher / Bill No:</span>
                  <span className={`font-bold ${deleteTarget.isExchange || deleteTarget.invoiceType === 'exchange' ? 'text-purple-400' : 'text-gold-400'}`}>
                    #{deleteTarget.invoiceNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="text-white font-medium">{deleteTarget.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="text-slate-300">{deleteTarget.date}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-400">Settlement Amount:</span>
                  <span className="text-emerald-300 font-bold">
                    ₹{Number(deleteTarget.grandTotal || deleteTarget.cashSettlement || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-sans">
                ⚠️ <strong>Permanent Action:</strong> This record will be permanently deleted from your Sales & Purchases register, inventory histories, and Firebase Cloud sync.
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button 
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-transform disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
