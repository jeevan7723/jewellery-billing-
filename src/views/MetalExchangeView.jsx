import React, { useState, useEffect } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  RefreshCw, Scale, ArrowRightLeft, 
  Printer, CheckCircle2, Sparkles, Coins, FileText,
  Boxes, PackageCheck, Save, ArrowRight, Check, Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintModal from '../components/print/PrintModal';
import MetalExchangeTemplate from '../components/print/MetalExchangeTemplate';

const METAL_PURITY_OPTIONS = {
  Gold: [
    { label: 'Gold 24K (99.9% Pure Gold)', ratio: 0.999, karat: '24K' },
    { label: 'Gold 22K (91.6% Hallmarked 916)', ratio: 0.916, karat: '22K' },
    { label: 'Gold 20K (83.3% Traditional Kundan)', ratio: 0.833, karat: '20K' },
    { label: 'Gold 18K (75.0% Diamond Jewellery 750)', ratio: 0.750, karat: '18K' },
    { label: 'Gold 14K (58.5% Lightweight Gold)', ratio: 0.585, karat: '14K' },
    { label: 'Gold 9K (37.5% Low Karat Gold)', ratio: 0.375, karat: '9K' },
  ],
  Silver: [
    { label: 'Silver 999 (Pure Silver Bar / Coin)', ratio: 0.999, karat: '999' },
    { label: 'Silver 925 (Sterling Silver)', ratio: 0.925, karat: '925' },
    { label: 'Silver 800 (Old Silver Jewellery / Payal)', ratio: 0.800, karat: '800' },
    { label: 'Silver 700 (Silver Utensils / Puja Items)', ratio: 0.700, karat: '700' },
  ],
  Platinum: [
    { label: 'Platinum 950 (95% Pure Platinum)', ratio: 0.950, karat: 'Pt 950' },
    { label: 'Platinum 900 (90% Platinum)', ratio: 0.900, karat: 'Pt 900' },
  ]
};

export default function MetalExchangeView({ onNavigate }) {
  const { rates: contextRates, showroom: contextShowroom, inventory = [], addInvoice, updateInventoryItem } = useJewellery();

  const rates = {
    gold24k: 7425,
    gold22k: 6806,
    gold18k: 5569,
    silver999: 88.5,
    silver925: 81.8,
    makingChargePercent: 5,
    ...(contextRates || {})
  };

  const showroom = {
    name: 'KaratCraft Fine Jewellers',
    tagline: 'Certified High Jewellery & Bullion Merchants',
    address: 'Plot 42, Gold Souk, Zaveri Bazaar, Mumbai 400002',
    phone: '+91 98200 12345',
    gstin: '27AADCB2230M1Z2',
    ...(contextShowroom || {})
  };

  // 4 Modes:
  // 1: gold-to-gold, 2: silver-to-silver, 3: gold-to-silver, 4: silver-to-gold
  const [exchangeMode, setExchangeMode] = useState('gold-to-gold');

  // Customer KYC (Default is clean and empty for actual entry)
  const [voucherNo, setVoucherNo] = useState(() => `EXCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [voucherDate, setVoucherDate] = useState(() => 
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  );

  // Inward Metal State (Default clean and empty)
  const [inwardMetal, setInwardMetal] = useState('Gold');
  const [inwardPurityIndex, setInwardPurityIndex] = useState(1); // 22K default
  const [inwardDescription, setInwardDescription] = useState('');
  const [inwardGrossWeight, setInwardGrossWeight] = useState(''); // g
  const [inwardStoneWeight, setInwardStoneWeight] = useState(''); // g
  const [inwardMeltingLossPercent, setInwardMeltingLossPercent] = useState(''); // %

  // Outward Metal State (Default clean and empty)
  const [selectedStockId, setSelectedStockId] = useState('');
  const [outwardMetal, setOutwardMetal] = useState('Gold');
  const [outwardPurityIndex, setOutwardPurityIndex] = useState(1); // 22K default
  const [outwardDescription, setOutwardDescription] = useState('');
  const [outwardGrossWeight, setOutwardGrossWeight] = useState(''); // g
  const [isCustomMaking, setIsCustomMaking] = useState(false);
  const [customMakingInput, setCustomMakingInput] = useState('');
  const [customRateLabel, setCustomRateLabel] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Persistence & Save States
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessVoucher, setSavedSuccessVoucher] = useState(null);
  const [savedInvoiceData, setSavedInvoiceData] = useState(null);

  // Switch conversion modes helper (clean state on switch)
  const handleModeSwitch = (mode) => {
    setExchangeMode(mode);
    setSelectedStockId('');
    setIsCustomMaking(false);
    setCustomMakingInput('');
    setCustomRateLabel(null);
    setVoucherNo(`EXCH-${Math.floor(1000 + Math.random() * 9000)}`);
    setInwardDescription('');
    setOutwardDescription('');
    setInwardGrossWeight('');
    setInwardStoneWeight('');
    setInwardMeltingLossPercent('');
    setOutwardGrossWeight('');
    if (mode === 'gold-to-gold') {
      setInwardMetal('Gold');
      setInwardPurityIndex(1); // 22K
      setOutwardMetal('Gold');
      setOutwardPurityIndex(1); // 22K
    } else if (mode === 'silver-to-silver') {
      setInwardMetal('Silver');
      setInwardPurityIndex(1); // 925
      setOutwardMetal('Silver');
      setOutwardPurityIndex(0); // 999
    } else if (mode === 'gold-to-silver') {
      setInwardMetal('Gold');
      setInwardPurityIndex(1); // 22K
      setOutwardMetal('Silver');
      setOutwardPurityIndex(0); // 999
    } else if (mode === 'silver-to-gold') {
      setInwardMetal('Silver');
      setInwardPurityIndex(1); // 925
      setOutwardMetal('Gold');
      setOutwardPurityIndex(1); // 22K
    }
  };

  // Helper to match stock item karat / purity to METAL_PURITY_OPTIONS
  const findPurityIndex = (metal, karat, purity) => {
    const list = METAL_PURITY_OPTIONS[metal] || METAL_PURITY_OPTIONS.Gold;
    if (!karat && !purity) return 0;
    
    const cleanKarat = String(karat || '').trim().toLowerCase();
    let idx = list.findIndex(opt => opt.karat.toLowerCase() === cleanKarat);
    if (idx !== -1) return idx;

    idx = list.findIndex(opt => opt.label.toLowerCase().includes(cleanKarat));
    if (idx !== -1) return idx;

    if (purity) {
      const numPurity = Number(purity) > 1 ? Number(purity) / 100 : Number(purity);
      idx = list.findIndex(opt => Math.abs(opt.ratio - numPurity) < 0.02);
      if (idx !== -1) return idx;
    }

    return 0;
  };

  // Metal Rates
  const getRate = (metalType) => {
    if (metalType === 'Gold') return Number(rates?.gold24k || 7425);
    if (metalType === 'Silver') return Number(rates?.silver999 || 88.5);
    return 3200;
  };

  // Helper to extract making charge from any inventory item
  const getItemMakingCharge = (item, weight, metal) => {
    if (!item) return 0;
    const wt = parseFloat(weight) || parseFloat(item.grossWeight || item.netWeight) || 0;
    
    // 1. Explicit fixed amount or 'fixed' type set by owner
    if (item.makingChargeAmount !== undefined && Number(item.makingChargeAmount) > 0) {
      return Math.round(Number(item.makingChargeAmount));
    }
    if (item.makingChargeType === 'fixed' && item.makingChargeRate !== undefined) {
      return Math.round(Number(item.makingChargeRate));
    }
    
    // 2. Per Gram rate
    if (item.makingChargeType === 'perGram' && item.makingChargeRate) {
      return Math.round(wt * parseFloat(item.makingChargeRate));
    }
    
    // 3. Percentage rate
    if (item.makingChargeType === 'percentage' && item.makingChargeRate) {
      const metalVal = (wt * (item.purity || 0.916)) * getRate(metal || item.metal || 'Gold');
      return Math.round(metalVal * (parseFloat(item.makingChargeRate) / 100));
    }
    
    // 4. Fallback if any numeric charge exists
    if (item.makingCharges !== undefined && Number(item.makingCharges) > 0) {
      return Math.round(Number(item.makingCharges));
    }
    if (item.makingChargeRate !== undefined && Number(item.makingChargeRate) > 0) {
      return Math.round(Number(item.makingChargeRate));
    }

    return 0;
  };

  // Handler when selecting an item from Showroom Stock dropdown
  const handlePickStockItem = (itemId) => {
    setSelectedStockId(itemId);
    if (!itemId) {
      setOutwardDescription('');
      setOutwardGrossWeight('');
      setIsCustomMaking(false);
      setCustomMakingInput('');
      setCustomRateLabel(null);
      return;
    }

    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // 1. Outward Metal
    const targetMetal = item.metal === 'Silver' ? 'Silver' : item.metal === 'Platinum' ? 'Platinum' : 'Gold';
    setOutwardMetal(targetMetal);

    // 2. Karat Index
    const purityIdx = findPurityIndex(targetMetal, item.karat, item.purity);
    setOutwardPurityIndex(purityIdx);

    // 3. Name / Description
    setOutwardDescription(item.name || '');

    // 4. Weight
    const wt = parseFloat(item.grossWeight || item.netWeight) || 0;
    if (wt > 0) setOutwardGrossWeight(wt);

    // 5. AUTOMATICALLY POPULATE MAKING CHARGES FROM THE STOCK ITEM!
    const stockMaking = getItemMakingCharge(item, wt, targetMetal);
    if (stockMaking > 0) {
      setIsCustomMaking(true);
      setCustomMakingInput(String(stockMaking));
      setCustomRateLabel(`₹${stockMaking.toLocaleString('en-IN')} Stock Making`);
    } else {
      // If item has no making charge set, calculate as per store % default
      setIsCustomMaking(false);
      setCustomMakingInput('');
      setCustomRateLabel(null);
    }
  };

  const safeInwardGross = parseFloat(inwardGrossWeight) || 0;
  const safeInwardStone = parseFloat(inwardStoneWeight) || 0;
  const safeMeltingLoss = parseFloat(inwardMeltingLossPercent) || 0;
  const safeOutwardGross = parseFloat(outwardGrossWeight) || 0;

  // Inward Calculations
  const inwardPurityObj = METAL_PURITY_OPTIONS[inwardMetal]?.[inwardPurityIndex] || METAL_PURITY_OPTIONS.Gold[0];
  const inwardNetScaleWeight = Math.max(0, safeInwardGross - safeInwardStone);
  const inwardNetWeight = inwardNetScaleWeight;
  const inwardPostMeltWeight = inwardNetScaleWeight * (1 - (safeMeltingLoss / 100));
  const inwardFinePureWeight = inwardPostMeltWeight * (inwardPurityObj?.ratio || 0.916);
  const inwardUnitRate = getRate(inwardMetal);
  const inwardValuation = inwardFinePureWeight * inwardUnitRate;

  // Outward Calculations
  const storedMakingPercent = Number(rates?.makingChargePercent ?? 5);
  const outwardPurityObj = METAL_PURITY_OPTIONS[outwardMetal]?.[outwardPurityIndex] || METAL_PURITY_OPTIONS.Gold[0];
  const outwardFinePureRequired = safeOutwardGross * (outwardPurityObj?.ratio || 0.916);
  const outwardUnitRate = getRate(outwardMetal);
  const outwardMetalValue = outwardFinePureRequired * outwardUnitRate;

  // Making charges automatically calculated as per stored making charges by owner (e.g. 5%)
  const autoMakingCharges = safeOutwardGross > 0 ? Math.round(outwardMetalValue * (storedMakingPercent / 100)) : 0;
  const outwardMakingCharges = isCustomMaking 
    ? (customMakingInput === '' ? 0 : (parseFloat(customMakingInput) || 0)) 
    : autoMakingCharges;
  const safeOutwardMakingRate = safeOutwardGross > 0 ? (outwardMakingCharges / safeOutwardGross) : 0;
  const outwardTotalPayable = outwardMetalValue + outwardMakingCharges;

  // Selected Stock Item details & grouped inventory
  const selectedItemDetails = inventory.find(i => i.id === selectedStockId);
  const matchingStock = inventory.filter(item => 
    (item.metal || 'Gold').toLowerCase() === outwardMetal.toLowerCase()
  );
  const otherStock = inventory.filter(item => 
    (item.metal || 'Gold').toLowerCase() !== outwardMetal.toLowerCase()
  );

  // Balance calculation
  const cashBalanceDifference = inwardValuation - outwardTotalPayable;
  const sameMetalTrade = inwardMetal === outwardMetal;
  const fineWeightDifference = sameMetalTrade ? (inwardFinePureWeight - outwardFinePureRequired) : null;

  const handleOpenVoucher = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#A855F7', '#FFF6D3', '#10B981']
    });
    setShowVoucherModal(true);
  };

  const handleSaveAndPrint = async (shouldOpenPrint = true) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const exchangeRecord = {
        invoiceNo: voucherNo,
        date: voucherDate,
        customerName: customerName.trim() || 'Walk-in Customer',
        phone: phone.trim() || '',
        paymentMode: 'Metal Exchange / Barter',
        invoiceType: 'exchange',
        isExchange: true,
        exchangeMode,

        // Inward Scrap Details (Customer brings to shop)
        inwardMetal,
        inwardKarat: inwardPurityObj?.karat || '22K',
        inwardDescription: inwardDescription || 'Old Metal Scrap',
        inwardGrossWeight: safeInwardGross,
        inwardStoneWeight: safeInwardStone,
        inwardNetWeight: inwardNetScaleWeight,
        inwardMeltingLossPercent: safeMeltingLoss,
        inwardPostMeltWeight: Number(inwardPostMeltWeight.toFixed(3)),
        inwardFineEquivalent: Number(inwardFinePureWeight.toFixed(3)),
        inwardRate: inwardUnitRate,
        inwardValuation: Math.round(inwardValuation || 0),

        // Outward New Jewellery Details (Shop sells to customer)
        outwardMetal,
        outwardKarat: outwardPurityObj?.karat || '22K',
        outwardDescription: selectedItemDetails ? `${outwardDescription} [SKU: ${selectedItemDetails.barcode}]` : outwardDescription,
        outwardGrossWeight: safeOutwardGross,
        outwardRate: outwardUnitRate,
        outwardMakingCharges: Math.round(outwardMakingCharges || 0),
        outwardMakingRate: safeOutwardMakingRate,
        outwardValuation: Math.round(outwardTotalPayable || 0),
        selectedStockId: selectedStockId || null,

        // Financial Settlement & Differences
        metalDifferenceGrams: sameMetalTrade && typeof fineWeightDifference === 'number' && !isNaN(fineWeightDifference) 
          ? Number(fineWeightDifference.toFixed(3)) 
          : null,
        cashSettlement: Math.round(cashBalanceDifference || 0),
        settlementType: cashBalanceDifference >= 0 ? 'Refund Due to Customer' : 'Customer Paid Balance',

        // Standard invoice structure so it integrates seamlessly across all reports, dashboards & sales
        items: [
          {
            name: `${outwardDescription} (Exchanged for old ${inwardMetal} ${inwardPurityObj?.karat || '22K'})`,
            metal: outwardMetal,
            karat: outwardPurityObj?.karat || '22K',
            grossWeight: safeOutwardGross,
            netWeight: safeOutwardGross,
            rate: outwardUnitRate,
            makingCharges: Math.round(outwardMakingCharges || 0),
            total: Math.round(outwardTotalPayable || 0)
          }
        ],
        subtotal: Math.round(outwardTotalPayable || 0),
        exchangeCredit: Math.round(inwardValuation || 0),
        gst3Percent: 0,
        grandTotal: Math.abs(Math.round(cashBalanceDifference || 0)),
        status: cashBalanceDifference >= 0 ? 'Refund Settled' : 'Customer Paid',
        createdAt: new Date().toISOString()
      };

      // 1. Save directly to Context & Firebase Cloud Firestore
      if (addInvoice) {
        await addInvoice(exchangeRecord);
      }

      // 2. If a showroom stock item was picked, update its vault status
      if (selectedStockId && updateInventoryItem) {
        await updateInventoryItem(selectedStockId, {
          status: `Exchanged (${voucherNo})`
        });
      }

      // 3. Trigger celebration confetti
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#A855F7', '#FFF6D3', '#10B981']
      });

      setSavedSuccessVoucher(voucherNo);
      setSavedInvoiceData(exchangeRecord);

      // 4. Open print slip modal if requested
      if (shouldOpenPrint) {
        setShowVoucherModal(true);
      }
    } catch (err) {
      console.error('Error saving exchange bill:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewExchange = () => {
    const newVoucher = `EXCH-${Math.floor(1000 + Math.random() * 9000)}`;
    setVoucherNo(newVoucher);
    setVoucherDate(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    setSavedSuccessVoucher(null);
    setSavedInvoiceData(null);
    setSelectedStockId('');
    setCustomerName('');
    setPhone('');
    setInwardDescription('');
    setInwardGrossWeight('');
    setInwardStoneWeight('');
    setInwardMeltingLossPercent('');
    setOutwardDescription('');
    setOutwardGrossWeight('');
    setIsCustomMaking(false);
    setCustomMakingInput('');
    setCustomRateLabel(null);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Old Gold & <span className="text-purple-400">Metal Exchange</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            Calculate exchange value when customers bring old gold or silver to buy new jewellery.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Today's Rate: <strong>Gold ₹{rates.gold24k}/g • Silver ₹{rates.silver999}/g</strong></span>
        </div>
      </div>

      {/* 4 Simple Exchange Options */}
      <div className="p-2 rounded-2xl glass-panel border border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'gold-to-gold', label: '🪙 Gold to Gold', desc: 'Old Gold for New Gold' },
          { id: 'silver-to-silver', label: '🥈 Silver to Silver', desc: 'Old Silver for New Silver' },
          { id: 'gold-to-silver', label: '🪙 ➔ 🥈 Gold to Silver', desc: 'Give Gold, Take Silver' },
          { id: 'silver-to-gold', label: '🥈 ➔ 🪙 Silver to Gold', desc: 'Give Silver, Take Gold' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleModeSwitch(tab.id)}
            className={`flex-1 min-w-[190px] p-3 rounded-xl text-left transition-all cursor-pointer border ${
              exchangeMode === tab.id
                ? 'bg-purple-500/20 text-white border-purple-500/50 shadow-inner'
                : 'bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between">
              <span>{tab.label}</span>
              {exchangeMode === tab.id && <span className="text-[10px] text-purple-300 font-mono">SELECTED</span>}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {savedSuccessVoucher && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 shadow-glass-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Exchange Bill #{savedSuccessVoucher} Saved!</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  LIVE SYNCED
                </span>
              </div>
              <p className="text-xs text-slate-300 font-light">
                Recorded in <strong>Customer Sales</strong> and <strong>Inward Gold Purchases</strong>. Synced to Cloud Firestore.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVoucherModal(true)}
              className="px-3.5 py-2 rounded-xl glass-card hover:border-purple-400 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('sales-purchase')}
                className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>View in Sales & Purchases</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleNewExchange}
              className="px-3.5 py-2 rounded-xl glass-card hover:border-gold-500 text-gold-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Exchange (+)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-purple-500/30 shadow-2xl space-y-8">
        
        {/* Customer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-white/10">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Customer Name *</label>
            <input 
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Phone Number *</label>
            <input 
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 00000 00000"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Date</label>
            <input 
              type="text"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              placeholder="DD-MMM-YYYY"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>
        </div>

        {/* Dual Side: Inward vs Outward */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* LEFT: OLD METAL (Customer Brings) */}
          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-amber-500/30 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                1. Old Metal (Received from Customer)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                {inwardMetal.toUpperCase()}
              </span>
            </div>

            {/* Select Metal & Purity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Metal</label>
                <select 
                  value={inwardMetal}
                  onChange={(e) => {
                    setInwardMetal(e.target.value);
                    setInwardPurityIndex(0);
                  }}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-amber-300 cursor-pointer"
                >
                  <option value="Gold" className="bg-obsidian-900">Gold</option>
                  <option value="Silver" className="bg-obsidian-900">Silver</option>
                  <option value="Platinum" className="bg-obsidian-900">Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Old Metal Purity / Karat</label>
                <select 
                  value={inwardPurityIndex}
                  onChange={(e) => setInwardPurityIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono cursor-pointer"
                >
                  {METAL_PURITY_OPTIONS[inwardMetal]?.map((opt, idx) => (
                    <option key={idx} value={idx} className="bg-obsidian-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Item Description</label>
              <input 
                type="text"
                value={inwardDescription}
                onChange={(e) => setInwardDescription(e.target.value)}
                placeholder="e.g. Old bangles, chain"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
              />
            </div>

            {/* Weights */}
            <div className="p-3.5 rounded-xl bg-obsidian-950/70 border border-white/5 space-y-3">
              <span className="text-[11px] font-mono text-amber-400 uppercase font-bold block">
                Scale Weights & Deductions
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Gross Wt (g)</label>
                  <input 
                    type="number"
                    step="0.001"
                    value={inwardGrossWeight}
                    onChange={(e) => setInwardGrossWeight(e.target.value)}
                    placeholder="0.000"
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Stone/Wax (g)</label>
                  <input 
                    type="number"
                    step="0.001"
                    value={inwardStoneWeight}
                    onChange={(e) => setInwardStoneWeight(e.target.value)}
                    placeholder="0.000"
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Melting Loss (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={inwardMeltingLossPercent}
                    onChange={(e) => setInwardMeltingLossPercent(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* Inward Value Box */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 font-mono text-xs shadow-sm">
              <div className="flex justify-between text-slate-400">
                <span>Net Weight after melting:</span>
                <span className="text-white font-bold">{Number(inwardPostMeltWeight || 0).toFixed(3)}g</span>
              </div>
              <div className="flex justify-between text-amber-300 font-bold border-t border-amber-500/20 pt-2 text-sm">
                <span>Pure Fine {inwardMetal} Weight:</span>
                <span>{Number(inwardFinePureWeight || 0).toFixed(3)}g</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-xs pt-2 border-t border-amber-500/20">
                <span>Value at gold rate (@ ₹{inwardUnitRate.toLocaleString('en-IN')}/g):</span>
                <span className="text-amber-300 font-extrabold text-sm">₹{Math.round(inwardValuation || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: NEW JEWELLERY (From Shop) */}
          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-emerald-500/30 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                2. New Jewellery (Selected by Customer)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                {outwardMetal.toUpperCase()}
              </span>
            </div>

            {/* 1-Click Pick Item from Showroom Stock Dropdown */}
            <div className="p-3.5 rounded-xl bg-obsidian-950/70 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="stock-item-picker" className="text-[11px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Pick Item from Stock</span>
                </label>
                {selectedStockId && (
                  <button
                    type="button"
                    onClick={() => setSelectedStockId('')}
                    className="text-[10px] font-mono text-slate-400 hover:text-amber-400 cursor-pointer underline flex items-center gap-1"
                  >
                    Custom Piece
                  </button>
                )}
              </div>

              <select 
                id="stock-item-picker"
                value={selectedStockId}
                onChange={(e) => handlePickStockItem(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold cursor-pointer border-emerald-500/30 focus:border-emerald-400"
              >
                <option value="" className="bg-obsidian-900 text-slate-300">
                  {inventory && inventory.length > 0 
                    ? `-- Select Showroom Stock Item (${inventory.length} items available) --` 
                    : '-- No Stock Items in Vault (Manual Entry) --'}
                </option>

                {matchingStock.length > 0 && (
                  <optgroup label={`✨ Available ${outwardMetal} Stock (${matchingStock.length})`} className="bg-obsidian-900 font-bold text-emerald-400">
                    {matchingStock.map((item) => {
                      const itemMaking = getItemMakingCharge(item, item.grossWeight || item.netWeight, item.metal);
                      return (
                        <option key={item.id} value={item.id} className="bg-obsidian-900 text-slate-100 font-mono">
                          {item.name} • {item.grossWeight || item.netWeight}g • {item.karat || ''}{itemMaking > 0 ? ` • Making: ₹${itemMaking.toLocaleString('en-IN')}` : ''} [{item.barcode || item.id}]
                        </option>
                      );
                    })}
                  </optgroup>
                )}

                {otherStock.length > 0 && (
                  <optgroup label={`📦 Other Metals Stock (${otherStock.length})`} className="bg-obsidian-900 font-bold text-slate-400">
                    {otherStock.map((item) => {
                      const itemMaking = getItemMakingCharge(item, item.grossWeight || item.netWeight, item.metal);
                      return (
                        <option key={item.id} value={item.id} className="bg-obsidian-900 text-slate-300 font-mono">
                          [{item.metal}] {item.name} • {item.grossWeight || item.netWeight}g{itemMaking > 0 ? ` • Making: ₹${itemMaking.toLocaleString('en-IN')}` : ''} • [{item.barcode || item.id}]
                        </option>
                      );
                    })}
                  </optgroup>
                )}
              </select>

              {selectedItemDetails ? (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Vault Stock Linked
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                    Tag: <strong>{selectedItemDetails.barcode}</strong>
                  </span>
                  {selectedItemDetails.hallmarkNo && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      HUID: <strong>{selectedItemDetails.hallmarkNo}</strong>
                    </span>
                  )}
                  {selectedItemDetails.category && (
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {selectedItemDetails.category}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[10px] font-mono text-slate-400">
                  Select an ornament from your inventory to auto-populate weight, karat, and making rate, or type custom values below.
                </p>
              )}
            </div>

            {/* Outward Metal & Karat */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Metal</label>
                <select 
                  value={outwardMetal}
                  onChange={(e) => {
                    setOutwardMetal(e.target.value);
                    setOutwardPurityIndex(0);
                  }}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-emerald-300 cursor-pointer"
                >
                  <option value="Gold" className="bg-obsidian-900">Gold</option>
                  <option value="Silver" className="bg-obsidian-900">Silver</option>
                  <option value="Platinum" className="bg-obsidian-900">Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">New Jewellery Karat</label>
                <select 
                  value={outwardPurityIndex}
                  onChange={(e) => setOutwardPurityIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono cursor-pointer"
                >
                  {METAL_PURITY_OPTIONS[outwardMetal]?.map((opt, idx) => (
                    <option key={idx} value={idx} className="bg-obsidian-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">New Jewellery Name</label>
              <input 
                type="text"
                value={outwardDescription}
                onChange={(e) => setOutwardDescription(e.target.value)}
                placeholder="e.g. New 22K Bridal Necklace"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
              />
            </div>

            {/* Outward Weight & Making charges */}
            <div className="p-3.5 rounded-xl bg-obsidian-950/70 border border-white/5 space-y-3">
              <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">
                Weight & Making Charges
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Weight (g)</label>
                  <input 
                    type="number"
                    step="0.001"
                    value={outwardGrossWeight}
                    onChange={(e) => setOutwardGrossWeight(e.target.value)}
                    placeholder="0.000"
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Making Charges (₹)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-emerald-400 font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {isCustomMaking 
                          ? (customRateLabel || 'Custom') 
                          : `${storedMakingPercent}% as per Settings`}
                      </span>
                      {isCustomMaking && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomMaking(false);
                            setCustomMakingInput('');
                            setCustomRateLabel(null);
                          }}
                          className="text-[9px] font-mono text-amber-300 hover:text-white px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 cursor-pointer transition-colors"
                          title="Reset to store default percentage calculation"
                        >
                          ↺ Auto ({storedMakingPercent}%)
                        </button>
                      )}
                    </div>
                  </div>
                  <input 
                    type="number"
                    value={isCustomMaking ? customMakingInput : (autoMakingCharges > 0 ? autoMakingCharges : '')}
                    onChange={(e) => {
                      setIsCustomMaking(true);
                      setCustomMakingInput(e.target.value);
                      setCustomRateLabel(null);
                    }}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-emerald-300 font-bold focus:ring-1 focus:ring-emerald-400"
                  />
                  {safeOutwardGross > 0 && outwardMakingCharges > 0 && (
                    <div className="text-[9px] font-mono text-slate-500 mt-1 flex justify-between">
                      <span>Rate: ₹{Math.round(outwardMakingCharges / safeOutwardGross)}/g</span>
                      <span>{outwardMetalValue > 0 ? ((outwardMakingCharges / outwardMetalValue) * 100).toFixed(1) : storedMakingPercent}% of metal</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Outward Total Box */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 font-mono text-xs shadow-sm">
              <div className="flex justify-between text-slate-400">
                <span>Pure {outwardMetal} needed (@ ₹{outwardUnitRate.toLocaleString('en-IN')}/g):</span>
                <span className="text-white font-bold">{Number(outwardFinePureRequired || 0).toFixed(3)}g</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Making Charges ({isCustomMaking ? (customRateLabel ? customRateLabel : 'Custom') : `${storedMakingPercent}%`}):</span>
                <span className="text-emerald-300 font-semibold">₹{Math.round(outwardMakingCharges || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-bold border-t border-emerald-500/20 pt-2 text-sm">
                <span>Total Price of New Jewellery (@ ₹{outwardUnitRate.toLocaleString('en-IN')}/g):</span>
                <span className="font-extrabold text-sm">₹{Math.round(outwardTotalPayable || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM: SIMPLE SETTLEMENT RESULT */}
        <div className="p-6 sm:p-8 rounded-3xl bg-obsidian-900 border border-purple-500/40 space-y-5 shadow-glass">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-mono tracking-widest text-purple-400 font-bold block">
                  Final Exchange Calculation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                  Voucher #{voucherNo}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-extrabold text-white">
                {cashBalanceDifference >= 0 ? (
                  <span className="text-emerald-400">
                    Customer Gets Balance Refund: ₹{Math.round(cashBalanceDifference).toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-amber-400">
                    Customer Pays Remaining: ₹{Math.abs(Math.round(cashBalanceDifference)).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS: SAVE & PRINT, SAVE RECORD, PREVIEW */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button 
                type="button"
                onClick={() => handleSaveAndPrint(true)}
                disabled={isSaving}
                className="px-6 py-3 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-gold-glow whitespace-nowrap active:scale-95 transition-transform disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-obsidian-950" />
                    <span>Saving & Syncing...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 text-obsidian-950" />
                    <Save className="w-4 h-4 text-obsidian-950" />
                    <span>Save & Print Bill</span>
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => handleSaveAndPrint(false)}
                disabled={isSaving}
                className="px-4 py-3 rounded-xl glass-card hover:border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-95 transition-transform disabled:opacity-50"
                title="Save record to Sales & Purchases without opening print dialog"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save to Records</span>
              </button>

              <button 
                type="button"
                onClick={handleOpenVoucher}
                className="px-4 py-3 rounded-xl glass-card hover:border-purple-400/50 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Preview barter slip memorandum before saving"
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Slip Preview</span>
              </button>
            </div>
          </div>

          {/* Simple Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
              <span className="text-slate-400 block text-[10px]">Old Metal Value:</span>
              <span className="text-amber-300 font-bold">
                ₹{Math.round(inwardValuation || 0).toLocaleString('en-IN')}
              </span>
              <div className="text-[10px] text-slate-500 mt-0.5">({Number(inwardFinePureWeight || 0).toFixed(3)}g Pure {inwardMetal})</div>
            </div>

            <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
              <span className="text-slate-400 block text-[10px]">New Jewellery Price:</span>
              <span className="text-emerald-300 font-bold">
                ₹{Math.round(outwardTotalPayable || 0).toLocaleString('en-IN')}
              </span>
              <div className="text-[10px] text-slate-500 mt-0.5">({safeOutwardGross.toFixed(3)}g {outwardPurityObj?.karat || '22K'})</div>
            </div>

            <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/5">
              <span className="text-slate-400 block text-[10px]">Gold Weight Balance:</span>
              <span className="text-purple-300 font-bold">
                {sameMetalTrade && typeof fineWeightDifference === 'number' && !isNaN(fineWeightDifference) ? (
                  fineWeightDifference >= 0 
                    ? `Customer has +${Number(fineWeightDifference).toFixed(3)}g gold left` 
                    : `Customer owes ${Math.abs(Number(fineWeightDifference)).toFixed(3)}g gold`
                ) : (
                  `${inwardMetal} exchanged for ${outwardMetal}`
                )}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* OFFICIAL PRINTABLE BARTER MEMORANDUM MODAL */}
      <PrintModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title="Old Gold Exchange Barter Slip Preview"
        formatToggle={false}
      >
        <MetalExchangeTemplate 
          exchangeData={savedInvoiceData || {
            voucherNo,
            date: voucherDate,
            customerName,
            phone,
            exchangeMode,
            inwardMetal,
            inwardKarat: inwardPurityObj?.karat || '22K',
            inwardGrossWeight: safeInwardGross,
            inwardStoneWeight: safeInwardStone,
            inwardNetWeight: inwardNetScaleWeight,
            inwardMeltingLossPercent: safeMeltingLoss,
            inwardFineEquivalent: inwardFinePureWeight,
            inwardRate: inwardUnitRate,
            inwardValuation: Math.round(inwardValuation || 0),
            outwardMetal,
            outwardKarat: outwardPurityObj?.karat || '22K',
            outwardDescription: selectedItemDetails ? `${outwardDescription} [SKU: ${selectedItemDetails.barcode}]` : outwardDescription,
            outwardGrossWeight: safeOutwardGross,
            outwardRate: outwardUnitRate,
            outwardMakingCharges: Math.round(outwardMakingCharges || 0),
            outwardValuation: Math.round(outwardTotalPayable || 0),
            metalDifferenceGrams: fineWeightDifference,
            cashSettlement: Math.round(cashBalanceDifference || 0),
          }}
          showroom={showroom}
        />
      </PrintModal>

    </div>
  );
}
