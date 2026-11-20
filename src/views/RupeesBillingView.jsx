import React, { useState, useEffect } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  IndianRupee, Printer, Plus, Trash2, CheckCircle2, 
  Sparkles, User, Phone, Receipt, Camera, ScanBarcode 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintModal from '../components/print/PrintModal';
import TaxInvoiceTemplate from '../components/print/TaxInvoiceTemplate';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export default function RupeesBillingView() {
  const { rates, showroom, inventory, addInvoice, updateInventoryItem, t } = useJewellery();

  // Customer KYC
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');

  // Item Line
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [itemName, setItemName] = useState('');
  const [metal, setMetal] = useState('Gold');
  const [karat, setKarat] = useState('22K');
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('');
  const [ratePerGram, setRatePerGram] = useState(rates.gold22k);
  const [makingType, setMakingType] = useState('percentage'); // Default to given % from settings
  const [makingValue, setMakingValue] = useState(() => (rates.makingChargePercent ?? 5));
  const [hallmarkFee, setHallmarkFee] = useState(45);
  const [discount, setDiscount] = useState(0);

  // Auto-sync making charges % with Gold Rate Settings
  useEffect(() => {
    if (rates.makingChargePercent !== undefined && !selectedInventoryId && makingType === 'percentage') {
      setMakingValue(rates.makingChargePercent);
    }
  }, [rates.makingChargePercent, selectedInventoryId, makingType]);

  // Success & Print State
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4' | 'thermal'

  // Camera Barcode Scanner
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Handle Barcode Scan from Camera
  const handleBarcodeScan = (scannedCode) => {
    const item = inventory.find(i => i.barcode.toLowerCase() === scannedCode.trim().toLowerCase());
    if (item) {
      handleInventorySelect({ target: { value: item.id } });
      confetti({ particleCount: 50, spread: 60 });
    } else {
      setItemName(`Jewellery Article (${scannedCode})`);
    }
  };

  // Select item from existing stock
  const handleInventorySelect = (e) => {
    const id = e.target.value;
    setSelectedInventoryId(id);
    if (!id) {
      setItemName('');
      setGrossWeight('');
      setStoneWeight('');
      return;
    }
    const item = inventory.find(i => i.id === id);
    if (item) {
      setItemName(item.name || '');
      setMetal(item.metal || 'Gold');
      setKarat(item.karat || '22K');
      setGrossWeight(item.grossWeight ?? '');
      setStoneWeight(item.stoneWeight ?? '');
      if (item.makingChargeType === 'fixed' || item.makingChargeAmount !== undefined) {
        setMakingType('fixed');
        setMakingValue(item.makingChargeAmount ?? item.makingChargeRate ?? 0);
      } else {
        setMakingType(item.makingChargeType || 'percentage');
        setMakingValue(item.makingChargeRate || rates.makingChargePercent || 5);
      }
      if (item.karat === '24K') setRatePerGram(rates.gold24k);
      else if (item.karat === '22K') setRatePerGram(rates.gold22k);
      else if (item.karat === '18K') setRatePerGram(rates.gold18k);
      else if (item.metal === 'Silver') setRatePerGram(rates.silver999);
    }
  };

  const handleKaratChange = (e) => {
    const k = e.target.value;
    setKarat(k);
    if (k === '24K') setRatePerGram(rates.gold24k);
    else if (k === '22K') setRatePerGram(rates.gold22k);
    else if (k === '18K') setRatePerGram(rates.gold18k);
    else if (k === 'Silver 999') {
      setMetal('Silver');
      setRatePerGram(rates.silver999);
    }
  };

  // Calculations
  const numGross = parseFloat(grossWeight) || 0;
  const numStone = parseFloat(stoneWeight) || 0;
  const numRate = parseFloat(ratePerGram) || 0;
  const netWeight = Math.max(0, numGross - numStone);
  const metalValue = netWeight * numRate;
  const makingTotal = makingType === 'fixed'
    ? Number(makingValue || 0)
    : (makingType === 'perGram' 
        ? (netWeight * Number(makingValue || 0))
        : (metalValue * (Number(makingValue || 0) / 100)));

  const hasItem = numGross > 0 || Boolean(itemName.trim());
  const activeHallmark = hasItem ? Number(hallmarkFee || 0) : 0;
  const taxableAmount = hasItem ? Math.max(0, metalValue + makingTotal + activeHallmark - Number(discount || 0)) : 0;
  const gstAmount = taxableAmount * 0.03; // 3% Jewellery GST
  const grandTotal = Math.round(taxableAmount + gstAmount);

  const handleCreateBill = async (e) => {
    e.preventDefault();
    const cleanGrandTotal = Math.round(Number(grandTotal)) || 0;
    const cleanSubtotal = Math.round(Number(taxableAmount)) || 0;
    const cleanGst = Math.round(Number(gstAmount)) || 0;

    const newInv = {
      invoiceNo: `KC-BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: customerName.trim() || 'Walk-in Customer',
      phone: phone.trim() || '—',
      city: city.trim() || '',
      paymentMode: paymentMode || 'Cash',
      items: [
        {
          name: itemName.trim() || 'Jewellery Article',
          karat: karat || '22K',
          grossWeight: numGross,
          stoneWeight: numStone,
          netWeight: Number(netWeight.toFixed(3)),
          rate: numRate,
          makingTotal: Math.round(Number(makingTotal)),
          total: Math.round(Number(metalValue + makingTotal))
        }
      ],
      hallmarkFee: activeHallmark,
      discount: Number(discount) || 0,
      subtotal: cleanSubtotal,
      gst3Percent: cleanGst,
      grandTotal: cleanGrandTotal,
    };

    setGeneratedInvoice(newInv);
    setShowPrintModal(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFF6D3', '#10B981']
    });

    // Write to Firebase Cloud
    await addInvoice(newInv);

    if (selectedInventoryId) {
      await updateInventoryItem(selectedInventoryId, {
        status: `Sold (${newInv.invoiceNo})`
      });
    }

    // Reset form for next transaction
    setSelectedInventoryId('');
    setItemName('');
    setGrossWeight('');
    setStoneWeight('');
    setCustomerName('');
    setPhone('');
    setCity('');
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Make New Bill <span className="gold-gradient-text">(Rupees Billing)</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            Enter customer details, pick an item, enter scale weight, add making charges, and calculate 3% GST.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-slate-300">
            Gold 22K: <strong className="text-gold-300">₹{rates.gold22k}/g</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-slate-300">
            Silver: <strong className="text-slate-100">₹{rates.silver999}/g</strong>
          </div>
        </div>
      </div>

      {/* Main Billing Form & Bill Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <form onSubmit={handleCreateBill} className="lg:col-span-7 space-y-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass-lg">
          
          {/* Customer Details */}
          <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-gold-400 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> {t('customerDetails', 'Customer Details')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomerName('');
                  setPhone('');
                  setCity('');
                  setSelectedInventoryId('');
                  setItemName('');
                  setGrossWeight('');
                  setStoneWeight('');
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-amber-400 cursor-pointer transition-colors underline"
                title="Clear all fields"
              >
                Clear to Blank
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">{t('customerName', 'Customer Name')} *</label>
                <input 
                  type="text"
                  required
                  placeholder="Enter customer name..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">{t('phone', 'Phone Number')} *</label>
                <input 
                  type="text"
                  required
                  placeholder="+91..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">{t('city', 'City')}</label>
                <input 
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Quick Select from Stock or Scan Tag */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                Pick Item from Stock or Scan Tag
              </label>
              <button
                type="button"
                onClick={() => setShowCameraScanner(true)}
                className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-sky-500/30 cursor-pointer shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📷 Scan Barcode Tag</span>
              </button>
            </div>
            <select 
              value={selectedInventoryId}
              onChange={handleInventorySelect}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs cursor-pointer"
            >
              <option value="">-- Choose from stock, scan tag, or type new item below --</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id} className="bg-obsidian-900">
                  {item.name} ({item.karat}) • Net: {item.netWeight}g • Tag: {item.barcode}
                </option>
              ))}
            </select>
          </div>

          {/* Item Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Item Name *
              </label>
              <input 
                type="text"
                required
                placeholder="Enter jewellery item name..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Purity / Karat *
              </label>
              <select 
                value={karat}
                onChange={handleKaratChange}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs cursor-pointer"
              >
                <option value="24K" className="bg-obsidian-900">Gold 24K (Pure Bullion)</option>
                <option value="22K" className="bg-obsidian-900">Gold 22K (916 Hallmarked)</option>
                <option value="18K" className="bg-obsidian-900">Gold 18K (750 Fine)</option>
                <option value="Silver 999" className="bg-obsidian-900">Silver 999</option>
              </select>
            </div>
          </div>

          {/* Weights */}
          <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-white/5 space-y-3">
            <span className="text-xs font-mono text-gold-400 font-bold uppercase block">
              Scale Weight (in grams)
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gross Weight (g)</label>
                <input 
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Stone / Wax Wt (g)</label>
                <input 
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={stoneWeight}
                  onChange={(e) => setStoneWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gold-300 mb-1 font-bold">Net Gold Wt (g)</label>
                <div className="px-3 py-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-sm font-mono font-extrabold text-gold-300">
                  {netWeight.toFixed(3)}g
                </div>
              </div>
            </div>
          </div>

          {/* Rates & Making Charges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Gold Rate (₹ per gram)
              </label>
              <input 
                type="number"
                value={ratePerGram}
                onChange={(e) => setRatePerGram(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm font-mono font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase">
                  Making Charges
                </label>
                <div className="flex gap-1 text-[10px] font-mono">
                  <button 
                    type="button"
                    onClick={() => {
                      setMakingType('percentage');
                      if (makingValue > 100 || makingValue === 480) {
                        setMakingValue(rates.makingChargePercent ?? 5);
                      }
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${makingType === 'percentage' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'text-slate-400'}`}
                  >
                    % (Given Rate)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setMakingType('perGram');
                      if (makingValue <= 20) {
                        setMakingValue(Math.round((ratePerGram * (rates.makingChargePercent ?? 5)) / 100) || 480);
                      }
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${makingType === 'perGram' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'text-slate-400'}`}
                  >
                    ₹ / g
                  </button>
                </div>
              </div>

              {makingType === 'percentage' ? (
                <div className="space-y-1.5">
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={makingValue}
                      onChange={(e) => setMakingValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 pr-8 rounded-xl glass-input text-sm font-mono font-bold text-gold-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                      %
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1 font-mono">
                    {[3, 5, 8, 10, 12, 14].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setMakingValue(p)}
                        className={`flex-1 py-0.5 text-[9px] rounded cursor-pointer transition-all border ${
                          Number(makingValue) === p
                            ? 'bg-gold-500/20 text-gold-300 border-gold-500/50 font-bold'
                            : 'bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-0.5">
                    <span>Auto Per Gram:</span>
                    <span className="text-white font-bold">
                      ₹{Math.round((ratePerGram * Number(makingValue || 0)) / 100).toLocaleString('en-IN')} / g
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <input 
                      type="number"
                      value={makingValue}
                      onChange={(e) => setMakingValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 pr-12 rounded-xl glass-input text-sm font-mono font-bold text-slate-200"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] pointer-events-none">
                      ₹/g
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-0.5">
                    <span>Equivalent %:</span>
                    <span className="text-gold-400 font-bold">
                      {ratePerGram > 0 ? ((Number(makingValue || 0) / ratePerGram) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Mode & Submit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Payment Mode
              </label>
              <select 
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs cursor-pointer"
              >
                <option value="Cash" className="bg-obsidian-900">Cash</option>
                <option value="UPI / QR" className="bg-obsidian-900">UPI / QR Code</option>
                <option value="Card" className="bg-obsidian-900">Debit / Credit Card</option>
                <option value="Bank Transfer" className="bg-obsidian-900">Bank Transfer / NEFT</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full py-3 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-gold-glow"
              >
                <Receipt className="w-4 h-4" />
                <span>{t('saveAndPrint', 'Save & Print Bill')}</span>
              </button>
            </div>
          </div>

        </form>

        {/* Right Column: Live Bill Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-gold-500/30 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <div className="font-serif text-lg font-bold text-white">
                  {showroom.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  GSTIN: {showroom.gstin}
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  {showroom.address}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 font-bold block mb-1">
                  TAX INVOICE
                </span>
                <div className="text-xs font-mono font-bold text-gold-300">
                  {generatedInvoice ? generatedInvoice.invoiceNo : '#KC-BILL-PREVIEW'}
                </div>
              </div>
            </div>

            {/* Customer Box */}
            <div className="bg-obsidian-900/60 p-3 rounded-xl border border-white/5 mb-4 text-xs font-mono">
              <div className="text-slate-400 text-[10px] uppercase">Customer:</div>
              <div className="text-white font-bold">{customerName.trim() || 'Walk-in Customer'}</div>
              <div className="text-slate-400 text-[11px]">
                {(phone || city) ? [phone, city].filter(Boolean).join(' • ') : 'Walk-in / Counter Sale'}
              </div>
            </div>

            {/* Itemized Calculation */}
            <div className="space-y-2 mb-4 text-xs font-mono">
              <div className="flex justify-between font-bold text-slate-200 border-b border-white/5 pb-1">
                <span>Item</span>
                <span>Amount</span>
              </div>
              
              <div className="flex justify-between text-slate-300">
                <div>
                  <div className="text-white font-medium">{itemName.trim() || 'New Jewellery Item'}</div>
                  <div className="text-[10px] text-slate-400">
                    Net: {netWeight.toFixed(3)}g @ ₹{numRate}/g ({karat})
                  </div>
                </div>
                <div className="text-right font-semibold">
                  ₹{Math.round(metalValue).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Making Charges ({makingType === 'perGram' ? `₹${makingValue}/g` : `${makingValue}%`})</span>
                <span>₹{Math.round(makingTotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Hallmarking Charge</span>
                <span>₹{hallmarkFee}</span>
              </div>

              <div className="border-t border-white/5 pt-1.5 flex justify-between text-slate-300 text-[11px]">
                <span>Subtotal</span>
                <span>₹{Math.round(taxableAmount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-gold-300 text-[11px]">
                <span>GST (3%)</span>
                <span>+₹{Math.round(gstAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-gold-500/20 via-amber-500/15 to-transparent border border-gold-500/40 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-gold-300 uppercase tracking-widest">
                    Total Amount
                  </div>
                  <div className="font-serif text-3xl font-extrabold text-white">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {paymentMode}
                  </span>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <button 
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="w-full py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-gold-glow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill (A4 / Thermal Roll)</span>
            </button>

          </div>
        </div>

      </div>

      {/* PROFESSIONAL PRINT MODAL */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="GST Tax Invoice Preview"
        formatToggle={true}
        format={printFormat}
        onFormatChange={setPrintFormat}
      >
        <TaxInvoiceTemplate 
          invoice={generatedInvoice || {
            invoiceNo: "KC-BILL-8921",
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            customerName,
            phone,
            city,
            paymentMode,
            items: [
              {
                name: itemName,
                karat,
                grossWeight,
                stoneWeight,
                netWeight,
                rate: ratePerGram,
                makingTotal,
                total: Math.round(metalValue + makingTotal)
              }
            ],
            hallmarkFee,
            discount,
            subtotal: Math.round(taxableAmount),
            gst3Percent: Math.round(gstAmount),
            grandTotal,
          }}
          showroom={showroom}
          format={printFormat}
        />
      </PrintModal>

      {/* LIVE CAMERA BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScan={handleBarcodeScan}
        sampleItems={inventory}
      />

    </div>
  );
}
