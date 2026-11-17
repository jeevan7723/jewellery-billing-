import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  RefreshCw, Scale, ArrowRightLeft, 
  Printer, CheckCircle2, Sparkles, Coins, FileText 
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

export default function MetalExchangeView() {
  const { rates: contextRates, showroom: contextShowroom } = useJewellery();

  const rates = {
    gold24k: 7425,
    gold22k: 6806,
    gold18k: 5569,
    silver999: 88.5,
    silver925: 81.8,
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

  // Customer KYC
  const [customerName, setCustomerName] = useState('Mr. Anandram Verma');
  const [phone, setPhone] = useState('+91 98220 88771');
  const [voucherDate, setVoucherDate] = useState('16-Nov-2026');

  // Inward Metal State
  const [inwardMetal, setInwardMetal] = useState('Gold');
  const [inwardPurityIndex, setInwardPurityIndex] = useState(1); // 22K default
  const [inwardDescription, setInwardDescription] = useState('Old Bangles & Chain');
  const [inwardGrossWeight, setInwardGrossWeight] = useState(32.500); // g
  const [inwardStoneWeight, setInwardStoneWeight] = useState(1.200); // g
  const [inwardMeltingLossPercent, setInwardMeltingLossPercent] = useState(1.5); // %

  // Outward Metal State
  const [outwardMetal, setOutwardMetal] = useState('Gold');
  const [outwardPurityIndex, setOutwardPurityIndex] = useState(1); // 22K default
  const [outwardDescription, setOutwardDescription] = useState('New 22K Bridal Necklace');
  const [outwardGrossWeight, setOutwardGrossWeight] = useState(28.000); // g
  const [outwardMakingRate, setOutwardMakingRate] = useState(480); // ₹ / g
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Switch conversion modes helper
  const handleModeSwitch = (mode) => {
    setExchangeMode(mode);
    if (mode === 'gold-to-gold') {
      setInwardMetal('Gold');
      setInwardPurityIndex(1); // 22K
      setOutwardMetal('Gold');
      setOutwardPurityIndex(1); // 22K
      setInwardDescription('Old 22K Gold Ornaments');
      setOutwardDescription('New 22K Gold Hallmarked Jewellery');
      setInwardGrossWeight(30.000);
      setOutwardGrossWeight(25.000);
      setOutwardMakingRate(480);
    } else if (mode === 'silver-to-silver') {
      setInwardMetal('Silver');
      setInwardPurityIndex(1); // 925
      setOutwardMetal('Silver');
      setOutwardPurityIndex(0); // 999
      setInwardDescription('Old Silver Anklets & Utensils');
      setOutwardDescription('New 999 Silver Puja Thali Set');
      setInwardGrossWeight(450.000);
      setOutwardGrossWeight(400.000);
      setOutwardMakingRate(25);
    } else if (mode === 'gold-to-silver') {
      setInwardMetal('Gold');
      setInwardPurityIndex(1); // 22K
      setOutwardMetal('Silver');
      setOutwardPurityIndex(0); // 999
      setInwardDescription('Old Gold Rings & Scrap');
      setOutwardDescription('Fine Silver 999 Bullion Bars');
      setInwardGrossWeight(15.000);
      setOutwardGrossWeight(1000.000); // 1kg silver
      setOutwardMakingRate(12);
    } else if (mode === 'silver-to-gold') {
      setInwardMetal('Silver');
      setInwardPurityIndex(1); // 925
      setOutwardMetal('Gold');
      setOutwardPurityIndex(1); // 22K
      setInwardDescription('Old Silver Utensils & Payal');
      setOutwardDescription('New 22K Gold Chain');
      setInwardGrossWeight(2500.000); // 2.5 kg silver
      setOutwardGrossWeight(25.000);
      setOutwardMakingRate(500);
    }
  };

  // Metal Rates
  const getRate = (metalType) => {
    if (metalType === 'Gold') return Number(rates?.gold24k || 7425);
    if (metalType === 'Silver') return Number(rates?.silver999 || 88.5);
    return 3200;
  };

  const safeInwardGross = Number(inwardGrossWeight) || 0;
  const safeInwardStone = Number(inwardStoneWeight) || 0;
  const safeMeltingLoss = Number(inwardMeltingLossPercent) || 0;
  const safeOutwardGross = Number(outwardGrossWeight) || 0;
  const safeOutwardMakingRate = Number(outwardMakingRate) || 0;

  // Inward Calculations
  const inwardPurityObj = METAL_PURITY_OPTIONS[inwardMetal]?.[inwardPurityIndex] || METAL_PURITY_OPTIONS.Gold[0];
  const inwardNetScaleWeight = Math.max(0, safeInwardGross - safeInwardStone);
  const inwardNetWeight = inwardNetScaleWeight;
  const inwardPostMeltWeight = inwardNetScaleWeight * (1 - (safeMeltingLoss / 100));
  const inwardFinePureWeight = inwardPostMeltWeight * (inwardPurityObj?.ratio || 0.916);
  const inwardUnitRate = getRate(inwardMetal);
  const inwardValuation = inwardFinePureWeight * inwardUnitRate;

  // Outward Calculations
  const outwardPurityObj = METAL_PURITY_OPTIONS[outwardMetal]?.[outwardPurityIndex] || METAL_PURITY_OPTIONS.Gold[0];
  const outwardFinePureRequired = safeOutwardGross * (outwardPurityObj?.ratio || 0.916);
  const outwardUnitRate = getRate(outwardMetal);
  const outwardMetalValue = outwardFinePureRequired * outwardUnitRate;
  const outwardMakingCharges = safeOutwardGross * safeOutwardMakingRate;
  const outwardTotalPayable = outwardMetalValue + outwardMakingCharges;

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
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Phone Number *</label>
            <input 
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Date</label>
            <input 
              type="text"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
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
                    onChange={(e) => setInwardGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Stone/Wax (g)</label>
                  <input 
                    type="number"
                    step="0.001"
                    value={inwardStoneWeight}
                    onChange={(e) => setInwardStoneWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Melting Loss (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={inwardMeltingLossPercent}
                    onChange={(e) => setInwardMeltingLossPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* Inward Value Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-obsidian-900 border border-amber-500/30 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Net Weight after melting:</span>
                <span className="text-white font-bold">{Number(inwardPostMeltWeight || 0).toFixed(3)}g</span>
              </div>
              <div className="flex justify-between text-amber-300 font-bold border-t border-white/5 pt-1.5 text-sm">
                <span>Pure Fine {inwardMetal} Weight:</span>
                <span>{Number(inwardFinePureWeight || 0).toFixed(3)}g</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                <span>Value at today's rate:</span>
                <span className="text-white font-bold">₹{Math.round(inwardValuation || 0).toLocaleString('en-IN')}</span>
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
                    onChange={(e) => setOutwardGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Making Charges (₹ per gram)</label>
                  <input 
                    type="number"
                    value={outwardMakingRate}
                    onChange={(e) => setOutwardMakingRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Outward Total Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-obsidian-900 border border-emerald-500/30 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Pure {outwardMetal} needed:</span>
                <span className="text-white font-bold">{Number(outwardFinePureRequired || 0).toFixed(3)}g</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Making Charges:</span>
                <span className="text-slate-300 font-semibold">₹{Math.round(outwardMakingCharges || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-bold border-t border-white/5 pt-1.5 text-sm">
                <span>Total Price of New Jewellery:</span>
                <span>₹{Math.round(outwardTotalPayable || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM: SIMPLE SETTLEMENT RESULT */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border border-purple-500/40 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-purple-400 font-bold block mb-1">
                Final Exchange Calculation
              </span>
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

            <button 
              onClick={handleOpenVoucher}
              className="px-6 py-3 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-gold-glow whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Print Exchange Slip</span>
            </button>
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
              <div className="text-[10px] text-slate-500 mt-0.5">({Number(outwardGrossWeight || 0).toFixed(3)}g {outwardPurityObj?.karat || '22K'})</div>
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
          exchangeData={{
            voucherNo: `EXCH-${Math.floor(1000 + Math.random() * 9000)}`,
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
            outwardDescription,
            outwardGrossWeight: safeOutwardGross,
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
