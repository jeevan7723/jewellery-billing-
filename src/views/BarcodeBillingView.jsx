import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  Camera, ScanBarcode, Printer, Search, CheckCircle2, 
  Sparkles, Tag, ArrowRight, Zap, Layers, Smartphone 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintModal from '../components/print/PrintModal';
import TaxInvoiceTemplate from '../components/print/TaxInvoiceTemplate';
import JewelleryTagTemplate from '../components/print/JewelleryTagTemplate';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export default function BarcodeBillingView() {
  const { rates, inventory, showroom, addInvoice, updateInventoryItem } = useJewellery();
  const [scannedCode, setScannedCode] = useState('');
  const [matchedItem, setMatchedItem] = useState(() => inventory[0] || null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  // Auto-select first item when inventory updates if nothing selected
  React.useEffect(() => {
    if (!matchedItem && inventory.length > 0) {
      setMatchedItem(inventory[0]);
    }
  }, [inventory, matchedItem]);

  // Camera Barcode Scanner
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Print Modals
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagMode, setTagMode] = useState('single'); // 'single' | 'batch'
  const [showBillModal, setShowBillModal] = useState(false);
  const [billFormat, setBillFormat] = useState('thermal'); // 'thermal' | 'a4'
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);

  const handleScan = (code) => {
    setScannedCode(code);
    const found = inventory.find(i => i.barcode.toLowerCase() === code.trim().toLowerCase());
    if (found) {
      setMatchedItem(found);
    }
  };

  const handleInstantCheckout = async () => {
    if (!matchedItem) return;
    const rate = matchedItem.karat === '24K' ? rates.gold24k : (matchedItem.karat === '22K' ? rates.gold22k : rates.gold18k);
    const metalVal = matchedItem.netWeight * rate;
    const making = matchedItem.makingChargeType === 'fixed' || matchedItem.makingChargeAmount !== undefined
      ? Number(matchedItem.makingChargeAmount ?? matchedItem.makingChargeRate ?? 0)
      : (matchedItem.makingChargeType === 'perGram' ? matchedItem.netWeight * matchedItem.makingChargeRate : metalVal * (matchedItem.makingChargeRate / 100));
    const subtotal = Math.round(metalVal + making + 45);
    const gst = Math.round(subtotal * 0.03);

    const newInv = {
      invoiceNo: `KC-BAR-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: (customerName && customerName.trim()) || 'Walk-in Customer',
      phone: (phone && phone.trim()) || '+91 00000 00000',
      city: 'Showroom Counter',
      paymentMode: "Barcode Quick Pay",
      items: [{
        name: matchedItem.name,
        karat: matchedItem.karat,
        grossWeight: Number(matchedItem.grossWeight) || 0,
        stoneWeight: Number(matchedItem.stoneWeight) || 0,
        netWeight: Number(matchedItem.netWeight) || 0,
        rate: Number(rate) || 0,
        makingTotal: Math.round(making),
        total: subtotal
      }],
      hallmarkFee: 45,
      discount: 0,
      subtotal,
      gst3Percent: gst,
      grandTotal: subtotal + gst,
    };

    setCheckoutInvoice(newInv);
    setShowBillModal(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#38BDF8', '#10B981']
    });

    await addInvoice(newInv);
    if (matchedItem) {
      await updateInventoryItem(matchedItem.id, {
        status: `Sold (${newInv.invoiceNo})`
      });
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Barcode Billing & <span className="text-sky-400">Print Tags</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            Scan barcode tag for quick counter checkout, and print thermal jewellery rat-tail tags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setShowCameraScanner(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-obsidian-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>📷 Scan with Camera</span>
          </button>
          <button 
            type="button"
            onClick={() => {
              setTagMode('batch');
              setShowTagModal(true);
            }}
            className="px-4 py-2.5 rounded-xl glass-card hover:border-sky-500/50 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Print All Tags ({inventory.length})</span>
          </button>
        </div>
      </div>

      {/* Mobile-Friendly Quick Scan Card */}
      <div className="lg:hidden p-4 rounded-2xl bg-gradient-to-r from-sky-500/20 via-blue-500/15 to-transparent border border-sky-500/40 flex items-center justify-between gap-3 shadow-lg">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Mobile Camera Ready</span>
          </div>
          <p className="text-[10px] text-slate-300 font-mono">
            Tap to open your phone's back camera & scan barcode tag
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCameraScanner(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-obsidian-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/20 active:scale-95 transition-transform whitespace-nowrap"
        >
          <Camera className="w-4 h-4 text-obsidian-950" />
          <span>Tap to Scan</span>
        </button>
      </div>

      {/* Grid: Barcode Scanner & Item Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Barcode Scanner Input */}
        <div className="lg:col-span-7 space-y-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass-lg">
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                Scan Barcode or Type Code
              </label>
              <button
                type="button"
                onClick={() => setShowCameraScanner(true)}
                className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Camera Scanner</span>
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <ScanBarcode className="w-5 h-5 absolute left-3.5 top-3.5 text-sky-400" />
                <input 
                  type="text"
                  value={scannedCode}
                  onChange={(e) => handleScan(e.target.value)}
                  placeholder="Scan barcode or type tag (e.g. KC892101)..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm font-mono font-bold text-sky-300 placeholder:text-slate-500"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => setShowCameraScanner(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-obsidian-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 transition-all whitespace-nowrap"
              >
                <Camera className="w-4 h-4 text-obsidian-950" />
                <span>📷 Scan with Camera</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 font-mono mt-1.5 flex items-center justify-between">
              <span>Supports device webcam / phone camera, or USB handheld barcode scanner.</span>
              <span className="text-emerald-400 font-bold">● Scanner Ready</span>
            </p>
          </div>

          {/* Quick-Scan Buttons to Test */}
          {inventory.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                Available In-Stock Tags:
              </span>
              <div className="flex flex-wrap gap-2">
                {inventory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleScan(item.barcode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                      matchedItem?.barcode === item.barcode
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-inner font-bold'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                    }`}
                  >
                    🏷️ {item.barcode} ({item.karat})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Customer Name</label>
              <input 
                type="text"
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Phone Number</label>
              <input 
                type="text"
                placeholder="+91..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Quick POS Checkout Button */}
          <button 
            type="button"
            onClick={handleInstantCheckout}
            disabled={!matchedItem}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-obsidian-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-obsidian-950" />
            <span>Instant POS Checkout & Print Bill</span>
          </button>

        </div>

        {/* Right: Item Details & Tag Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-glass-lg">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400" />
                Jewellery Tag Preview
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Thermal Tag</span>
            </div>

            {matchedItem ? (
              <div className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-300 font-mono shadow-md">
                <div className="flex justify-between items-start border-b border-dashed border-slate-400 pb-2 mb-2 text-[11px]">
                  <div>
                    <div className="font-extrabold text-xs">{showroom.name.toUpperCase()}</div>
                    <div className="text-[9px] text-slate-600">{matchedItem.hallmarkNo}</div>
                  </div>
                  <div className="text-right font-bold text-xs">
                    {matchedItem.karat}
                  </div>
                </div>

                <div className="text-xs font-bold leading-tight line-clamp-1 mb-2">
                  {matchedItem.name}
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px] mb-3">
                  <div>Gr.Wt: <strong>{Number(matchedItem.grossWeight || 0).toFixed(3)}g</strong></div>
                  <div>Nt.Wt: <strong>{Number(matchedItem.netWeight || 0).toFixed(3)}g</strong></div>
                  <div>St.Wt: <strong>{Number(matchedItem.stoneWeight || 0).toFixed(3)}g</strong></div>
                  <div>Tag: <strong>{matchedItem.barcode}</strong></div>
                </div>

                {/* Barcode Stripes Graphic */}
                <div className="pt-1 text-center">
                  <div className="w-full h-8 barcode-stripes invert opacity-90 rounded mb-1" />
                  <div className="text-[10px] tracking-widest font-bold">*{matchedItem.barcode}*</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-slate-400 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                No items in inventory. Scan a barcode tag or add items in the Inventory section.
              </div>
            )}

            <button 
              type="button"
              onClick={() => {
                setTagMode('single');
                setShowTagModal(true);
              }}
              className="w-full py-2.5 rounded-xl glass-card hover:border-sky-500/50 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print Single Tag</span>
            </button>

          </div>
        </div>

      </div>

      {/* PRINT TAG MODAL */}
      <PrintModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        title={tagMode === 'batch' ? `Print All Stock Tags (${inventory.length})` : `Print Tag: ${matchedItem?.barcode}`}
        formatToggle={false}
      >
        <JewelleryTagTemplate 
          item={matchedItem}
          items={inventory}
          showroom={showroom}
          mode={tagMode}
        />
      </PrintModal>

      {/* PRINT BILL MODAL */}
      <PrintModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        title="POS Retail Bill Preview"
        formatToggle={true}
        format={billFormat}
        onFormatChange={setBillFormat}
      >
        {checkoutInvoice && (
          <TaxInvoiceTemplate 
            invoice={checkoutInvoice}
            showroom={showroom}
            format={billFormat}
          />
        )}
      </PrintModal>

      {/* LIVE CAMERA BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScan={(code) => handleScan(code)}
        sampleItems={inventory}
      />

    </div>
  );
}
