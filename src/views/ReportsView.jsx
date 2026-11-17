import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  BarChart3, Download, Printer, FileSpreadsheet, 
  Calendar, CheckCircle2, TrendingUp, Sparkles, Filter 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintModal from '../components/print/PrintModal';
import ReportTemplate from '../components/print/ReportTemplate';

export default function ReportsView() {
  const { invoices, inventory, karagirs, refineryBatches, rates, showroom } = useJewellery();
  const [reportType, setReportType] = useState('sales'); // 'sales' | 'inventory' | 'karagir' | 'refinery'
  const [showPrintModal, setShowPrintModal] = useState(false);

  const totalSalesVal = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalGstVal = invoices.reduce((s, i) => s + (i.gst3Percent || 0), 0);
  const totalStockNet = inventory.reduce((s, i) => s + (i.netWeight || 0), 0);
  const totalKaragirMetal = karagirs.reduce((s, k) => s + (k.balanceMetal || 0), 0);

  // CSV Export utility
  const exportToCSV = (filename, rows) => {
    const processRow = (row) => {
      let finalVal = '';
      for (let j = 0; j < row.length; j++) {
        let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        }
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
          result = '"' + result + '"';
        if (j > 0)
          finalVal += ',';
        finalVal += result;
      }
      return finalVal + '\n';
    };

    let csvFile = '';
    for (let i = 0; i < rows.length; i++) {
      csvFile += processRow(rows[i]);
    }

    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  const handleDownloadReport = () => {
    if (reportType === 'sales') {
      const rows = [
        ["Invoice No", "Date", "Customer Name", "Phone", "Items", "Taxable Amount", "GST 3%", "Grand Total"],
        ...invoices.map(i => [
          i.invoiceNo, i.date, i.customerName, i.phone,
          i.items.map(x => x.name).join('; '),
          i.subtotal, i.gst3Percent, i.grandTotal
        ])
      ];
      exportToCSV(`Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    } else if (reportType === 'inventory') {
      const rows = [
        ["Barcode Tag", "Item Name", "Category", "Karat", "Gross Weight (g)", "Stone Weight (g)", "Net Weight (g)", "Status"],
        ...inventory.map(i => [
          i.barcode, i.name, i.category, i.karat, i.grossWeight, i.stoneWeight, i.netWeight, i.status
        ])
      ];
      exportToCSV(`Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    } else if (reportType === 'karagir') {
      const rows = [
        ["Karagir ID", "Karagir Name", "Work Type", "Phone", "Total Gold Given (g)", "Jewellery Returned (g)", "Scrap (g)", "Gold Balance (g)"],
        ...karagirs.map(k => [
          k.id, k.name, k.speciality, k.phone, k.metalIssued, k.metalReturned, k.meltingScrap, k.balanceMetal
        ])
      ];
      exportToCSV(`Karagir_Report_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    } else {
      const rows = [
        ["Batch ID", "Date", "Refinery Name", "Metal", "Sent Weight (g)", "After Melting (g)", "Wastage (g)", "Pure Gold Received (g)"],
        ...refineryBatches.map(b => [
          b.id, b.date, b.refineryName, b.metalType, b.sentWeightGross, b.postMeltWeight, b.wastageDrossWeight, b.fineGoldRecovered
        ])
      ];
      exportToCSV(`Refinery_Report_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-gold-400 px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/30">
              MODULE #06
            </span>
            <span className="text-xs font-mono text-slate-400">Reports & Download Center</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Reports & <span className="gold-gradient-text">Data Download</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            Download or print sales bills, current stock, karagir gold balance, and refinery melting logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadReport}
            className="px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV / Excel</span>
          </button>
          <button 
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 rounded-xl glass-card hover:border-gold-500/50 text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Types Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'sales', label: '1. Sales Bills (GST)', count: invoices.length },
          { id: 'inventory', label: '2. Current Stock', count: inventory.length },
          { id: 'karagir', label: '3. Karagir Gold Balance', count: karagirs.length },
          { id: 'refinery', label: '4. Refinery Melting Log', count: refineryBatches.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              reportType === tab.id
                ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Report Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-slate-400 block text-[10px]">Total Sales</span>
          <span className="font-serif text-xl font-bold text-white">₹{totalSalesVal.toLocaleString('en-IN')}</span>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-slate-400 block text-[10px]">Total GST (3%)</span>
          <span className="font-serif text-xl font-bold text-gold-300">₹{totalGstVal.toLocaleString('en-IN')}</span>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-slate-400 block text-[10px]">Total Stock Net Weight</span>
          <span className="font-serif text-xl font-bold text-slate-200">{totalStockNet.toFixed(3)}g</span>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-slate-400 block text-[10px]">Karagir Pending Gold</span>
          <span className="font-serif text-xl font-bold text-purple-300">{totalKaragirMetal.toFixed(3)}g</span>
        </div>
      </div>

      {/* Render Current Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glass-lg">
        {reportType === 'sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Taxable Amount</th>
                  <th className="py-3 px-4 text-right">GST (3%)</th>
                  <th className="py-3 px-4 text-right text-gold-300">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-gold-400">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 text-slate-400">{inv.date}</td>
                    <td className="py-3 px-4 text-white font-medium">{inv.customerName}</td>
                    <td className="py-3 px-4 text-slate-400">{inv.paymentMode}</td>
                    <td className="py-3 px-4 text-right">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-gold-300">₹{inv.gst3Percent.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-white text-sm">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                  <th className="py-3 px-4">Barcode Tag</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Karat</th>
                  <th className="py-3 px-4 text-right">Gross Wt</th>
                  <th className="py-3 px-4 text-right text-gold-300">Net Wt</th>
                  <th className="py-3 px-4">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-sky-400">{item.barcode}</td>
                    <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-slate-400">{item.category}</td>
                    <td className="py-3 px-4 font-bold text-gold-300">{item.karat}</td>
                    <td className="py-3 px-4 text-right text-slate-200">{item.grossWeight.toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right font-bold text-gold-300">{item.netWeight.toFixed(3)}g</td>
                    <td className="py-3 px-4 text-emerald-400">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'karagir' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Karagir Name</th>
                  <th className="py-3 px-4">Work Type</th>
                  <th className="py-3 px-4 text-right">Total Given</th>
                  <th className="py-3 px-4 text-right">Returned</th>
                  <th className="py-3 px-4 text-right">Scrap</th>
                  <th className="py-3 px-4 text-right text-amber-400">Gold Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {karagirs.map((k, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-amber-400">{k.id}</td>
                    <td className="py-3 px-4 text-white font-medium">{k.name}</td>
                    <td className="py-3 px-4 text-slate-400">{k.speciality}</td>
                    <td className="py-3 px-4 text-right text-slate-200">{k.metalIssued.toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right text-emerald-300 font-bold">{k.metalReturned.toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right text-slate-400">{k.meltingScrap.toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right font-bold text-amber-400 text-sm">
                      {k.balanceMetal.toFixed(3)}g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'refinery' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Refinery Name</th>
                  <th className="py-3 px-4 text-right">Sent Wt</th>
                  <th className="py-3 px-4 text-right">After Melting</th>
                  <th className="py-3 px-4 text-right">Wastage %</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Pure Gold Received</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {refineryBatches.map((b, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-gold-400">{b.id}</td>
                    <td className="py-3 px-4 text-slate-400">{b.date}</td>
                    <td className="py-3 px-4 text-white font-medium">{b.refineryName}</td>
                    <td className="py-3 px-4 text-right text-slate-200">{b.sentWeightGross.toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right text-slate-200">{b.postMeltWeight.toFixed(3)}g</td>
                    <td className="py-3 px-4 text-right text-rose-400">{b.wastagePercentage}%</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">
                      {b.fineGoldRecovered.toFixed(3)}g
                    </td>
                    <td className="py-3 px-4 text-slate-300">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AUDIT STATEMENT PRINT MODAL */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Audit Statement Preview"
        formatToggle={false}
      >
        <ReportTemplate 
          reportType={reportType}
          data={{ invoices, inventory, karagirs, refineryBatches }}
          showroom={showroom}
        />
      </PrintModal>

    </div>
  );
}
