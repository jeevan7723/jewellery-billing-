import React, { useState, useEffect } from 'react';
import { useJewellery, INITIAL_RATES, INITIAL_INVENTORY, INITIAL_KARAGIRS, INITIAL_REFINERY_BATCHES, INITIAL_INVOICES, INITIAL_SHOWROOM } from '../context/JewelleryContext';
import { Settings, Save, RotateCcw, Building2, TrendingUp, CheckCircle2, Shield, Wrench, Sparkles, Cloud, Database, RefreshCw, Palette, Sun, Moon, Hammer, Percent, Languages } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SettingsView() {
  const { rates, updateRates, showroom, setShowroom, cloudStatus, syncAllToCloud, theme, setTheme, language, setLanguage, t } = useJewellery();
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Local form state
  const [gold24k, setGold24k] = useState(rates.gold24k);
  const [gold22k, setGold22k] = useState(rates.gold22k);
  const [gold18k, setGold18k] = useState(rates.gold18k);
  const [silver999, setSilver999] = useState(rates.silver999);
  const [makingChargePercent, setMakingChargePercent] = useState(
    rates.makingChargePercent !== undefined ? rates.makingChargePercent : 5
  );

  // Keep local state synchronized if rates update from cloud
  useEffect(() => {
    if (rates.gold24k) setGold24k(rates.gold24k);
    if (rates.gold22k) setGold22k(rates.gold22k);
    if (rates.gold18k) setGold18k(rates.gold18k);
    if (rates.silver999) setSilver999(rates.silver999);
    if (rates.makingChargePercent !== undefined) setMakingChargePercent(rates.makingChargePercent);
  }, [rates.gold24k, rates.gold22k, rates.gold18k, rates.silver999, rates.makingChargePercent]);

  const [name, setName] = useState(showroom.name);
  const [tagline, setTagline] = useState(showroom.tagline);
  const [address, setAddress] = useState(showroom.address);
  const [phone, setPhone] = useState(showroom.phone);
  const [email, setEmail] = useState(showroom.email);
  const [gstin, setGstin] = useState(showroom.gstin);
  const [hsnCode, setHsnCode] = useState(showroom.hsnCode);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveRates = (e) => {
    e.preventDefault();
    updateRates({
      gold24k: parseFloat(gold24k) || 0,
      gold22k: parseFloat(gold22k) || 0,
      gold18k: parseFloat(gold18k) || 0,
      silver999: parseFloat(silver999) || 0,
      makingChargePercent: parseFloat(makingChargePercent) >= 0 ? parseFloat(makingChargePercent) : 5,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    confetti({ particleCount: 60, spread: 50 });
  };

  const handleSaveShowroom = (e) => {
    e.preventDefault();
    setShowroom({
      name,
      tagline,
      address,
      phone,
      email,
      gstin,
      hsnCode
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    confetti({ particleCount: 60, spread: 50 });
  };

  const handleResetData = () => {
    if (confirm("Clear local browser cache and reload fresh data from Firebase Cloud?")) {
      localStorage.removeItem('kc_inventory');
      localStorage.removeItem('kc_invoices');
      localStorage.removeItem('kc_karagirs');
      localStorage.removeItem('kc_refinery');
      window.location.reload();
    }
  };

  const handleSyncAll = async () => {
    setSyncingCloud(true);
    setSyncMessage(null);
    const result = await syncAllToCloud();
    setSyncingCloud(false);
    if (result.success) {
      setSyncMessage({ type: 'success', text: 'All data successfully synchronized to Firebase Cloud!' });
      confetti({ particleCount: 50, spread: 45 });
    } else {
      setSyncMessage({ type: 'error', text: `Sync failed: ${result.error}` });
    }
    setTimeout(() => setSyncMessage(null), 5000);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-gold-400 px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/30">
              MODULE #09
            </span>
            <span className="text-xs font-mono text-slate-400">Daily Rates & Shop Settings</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Daily Rates & <span className="gold-gradient-text">Shop Settings</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            Set today's gold and silver rates, shop address, and GST bill details.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Box 1: Daily Rates */}
        <form onSubmit={handleSaveRates} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass-lg space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <TrendingUp className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-white">
              Today's Gold & Silver Rates (₹ per gram)
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Updating these rates changes prices in billing, metal exchange, and stock valuation immediately.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Gold 24K (Pure Gold 999) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <input 
                  type="number"
                  required
                  value={gold24k}
                  onChange={(e) => setGold24k(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-sm font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Gold 22K (916 Hallmarked) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <input 
                  type="number"
                  required
                  value={gold22k}
                  onChange={(e) => setGold22k(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-sm font-mono font-bold text-gold-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Gold 18K (750 Gold) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <input 
                  type="number"
                  required
                  value={gold18k}
                  onChange={(e) => setGold18k(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-sm font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Silver 999 (Pure Silver) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <input 
                  type="number"
                  step="0.1"
                  required
                  value={silver999}
                  onChange={(e) => setSilver999(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-sm font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Owner Making Charges Management Option */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="making-charge-percent" className="text-xs font-mono font-bold text-gold-300 uppercase tracking-wider flex items-center gap-1.5">
                <Hammer className="w-4 h-4 text-gold-400" />
                <span>Default Making Charges (%)</span>
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30 font-bold">
                Default: 5%
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Showroom owner option to set the default percentage (%) for making charges on new jewellery bills and valuations.
            </p>

            <div className="space-y-3 pt-1">
              {/* Stepper + Spacious Input Row */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMakingChargePercent(prev => Math.max(0, +(parseFloat(prev || 0) - 0.5).toFixed(1)))}
                  className="w-10 h-10 rounded-xl bg-obsidian-900 hover:bg-gold-500/20 text-gold-400 font-bold text-lg flex items-center justify-center border border-white/10 hover:border-gold-500/40 cursor-pointer active:scale-95 transition select-none"
                  title="Decrease by 0.5%"
                >
                  −
                </button>

                <div className="relative w-36 sm:w-44">
                  <input 
                    id="making-charge-percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={makingChargePercent}
                    onChange={(e) => setMakingChargePercent(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl glass-input text-base sm:text-lg font-mono font-extrabold text-gold-300 text-center tracking-wider"
                    placeholder="5.0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-400 font-mono font-bold text-sm pointer-events-none select-none">
                    %
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMakingChargePercent(prev => Math.min(100, +(parseFloat(prev || 0) + 0.5).toFixed(1)))}
                  className="w-10 h-10 rounded-xl bg-obsidian-900 hover:bg-gold-500/20 text-gold-400 font-bold text-lg flex items-center justify-center border border-white/10 hover:border-gold-500/40 cursor-pointer active:scale-95 transition select-none"
                  title="Increase by 0.5%"
                >
                  +
                </button>
              </div>

              {/* Quick Presets for Showroom Owner */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">
                  Presets:
                </span>
                {[
                  { label: '3%', val: 3 },
                  { label: '5% (Standard Default)', val: 5 },
                  { label: '8%', val: 8 },
                  { label: '10%', val: 10 },
                  { label: '12%', val: 12 },
                  { label: '14%', val: 14 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setMakingChargePercent(preset.val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${
                      parseFloat(makingChargePercent) === preset.val
                        ? 'bg-gold-500 text-obsidian-950 border-gold-400 font-bold shadow-gold-glow'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-gold-500/30'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Calculation Preview for Owner */}
            <div className="p-3 rounded-xl bg-obsidian-950/70 border border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">
                Live Preview (10g 22K Gold @ ₹{gold22k}/g):
              </span>
              <span className="text-emerald-400 font-bold">
                Making Fee = ₹{Math.round((parseFloat(gold22k) || 0) * 10 * ((parseFloat(makingChargePercent) || 0) / 100)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
            >
              <Save className="w-4 h-4" />
              <span>Save Today's Rates & Making Charges</span>
            </button>
          </div>
        </form>

        {/* Box 2: Shop Details */}
        <form onSubmit={handleSaveShowroom} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Building2 className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-white">
              Shop Details & Bill Header
            </h3>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Jewellery Shop Name *</label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Tagline</label>
            <input 
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">GSTIN Number *</label>
              <input 
                type="text"
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">HSN Code *</label>
              <input 
                type="text"
                required
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Shop Address</label>
            <input 
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
            >
              <Save className="w-4 h-4" />
              <span>Save Shop Details</span>
            </button>
          </div>
        </form>

      </div>

      {/* Showroom Display Theme (Dark / Light Mode) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass-lg space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Showroom Theme & Appearance
            </h3>
            <p className="text-xs text-slate-400">
              Customize the visual environment for billing counters, point-of-sale terminals, and executive desks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-obsidian-900 border-amber-400/60 shadow-gold-glow'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-obsidian-950 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Obsidian Dark Mode</span>
                  {theme === 'dark' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      ACTIVE
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deep black & gold contrast. Ideal for low-light jewellery counters and executive suites.
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              theme === 'dark' ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
            }`}>
              {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-obsidian-950" />}
            </div>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              theme === 'light'
                ? 'bg-white border-gold-500 shadow-md'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Showroom Light Mode</span>
                  {theme === 'light' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-400/40">
                      ACTIVE
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Crisp ivory & gold aesthetics. Ideal for brightly lit retail showrooms and daylight counters.
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              theme === 'light' ? 'border-gold-500 bg-gold-500' : 'border-slate-500'
            }`}>
              {theme === 'light' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
        </div>
      </div>

      {/* Language & Regional Preferences (English / Marathi मराठी) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass-lg space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span>{t('languageSettings', 'Language & Regional Preferences')}</span>
              <span className="text-xs font-mono font-normal text-gold-400">(भाषा प्राधान्ये)</span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'mr' 
                ? 'बिलिंग, पावती आणि मेनूसाठी भाषा निवडा. इंग्रजी आणि मराठी दोन्ही भाषांमध्ये सहजपणे वापरा.'
                : 'Choose the interface language for POS billing counters, receipts, and menu navigation.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* English Option Card */}
          <div
            onClick={() => setLanguage('en')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              language === 'en'
                ? 'bg-obsidian-900 border-gold-500 shadow-gold-glow'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-obsidian-950 border border-gold-500/30 flex items-center justify-center text-gold-400 font-mono font-black text-sm">
                EN
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>English (Default)</span>
                  {language === 'en' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40">
                      ACTIVE
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard Indian jewellery industry terminology with English numerals and labels.
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              language === 'en' ? 'border-gold-500 bg-gold-500' : 'border-slate-500'
            }`}>
              {language === 'en' && <div className="w-2 h-2 rounded-full bg-obsidian-950" />}
            </div>
          </div>

          {/* Marathi Option Card */}
          <div
            onClick={() => setLanguage('mr')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              language === 'mr'
                ? 'bg-obsidian-900 border-gold-500 shadow-gold-glow'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-gold-500/20 border border-amber-400/40 flex items-center justify-center text-gold-300 font-serif font-black text-sm">
                मरा
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>मराठी (Marathi)</span>
                  {language === 'mr' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40">
                      सक्रिय (ACTIVE)
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  महाराष्ट्र सराफा पेढी प्रमाणित मराठी भाषा (दागिने, घडणावळ, गाळणी, कारागीर हिशोब).
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              language === 'mr' ? 'border-gold-500 bg-gold-500' : 'border-slate-500'
            }`}>
              {language === 'mr' && <div className="w-2 h-2 rounded-full bg-obsidian-950" />}
            </div>
          </div>
        </div>
      </div>

      {/* Firebase Cloud Firestore Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  Firebase Cloud Firestore Database
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                  cloudStatus?.connected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : cloudStatus?.loading 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    cloudStatus?.connected ? 'bg-emerald-400' : cloudStatus?.loading ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                  {cloudStatus?.connected ? 'Live Sync Active' : cloudStatus?.loading ? 'Connecting...' : 'Offline / Local'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Real-time multi-device cloud synchronization across showroom counters & billing desks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncingCloud}
            className="px-5 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow active:scale-95 disabled:opacity-50 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${syncingCloud ? 'animate-spin' : ''}`} />
            <span>{syncingCloud ? 'Syncing...' : 'Force Sync All to Cloud'}</span>
          </button>
        </div>

        {syncMessage && (
          <div className={`p-4 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
            syncMessage.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{syncMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-slate-500">Firebase Project ID</span>
            <p className="text-white font-bold truncate">jewellery-billing-28699</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-slate-500">Auth Domain</span>
            <p className="text-white font-bold truncate">jewellery-billing-28699.firebaseapp.com</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-slate-500">Synced Collections</span>
            <p className="text-amber-300 font-bold">rates, showroom, inventory, invoices, karagirs, refinery</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-slate-500">Last Successful Sync</span>
            <p className="text-emerald-400 font-bold">{cloudStatus?.lastSyncTime || 'Pending connection'}</p>
          </div>
        </div>

        {cloudStatus?.error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>Notice / Firestore Rules check:</span>
            </div>
            <p className="text-rose-200/80">{cloudStatus.error}</p>
            <p className="text-slate-400 text-[11px] pt-1">
              If Firestore security rules require permission, ensure test mode or published rules in Firebase Console allow read/write for your showroom terminal.
            </p>
          </div>
        )}
      </div>

      {/* System & Data Status */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-gold-400" />
            System & Data Status
          </h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Status: All 9 Modules Active • Saves locally in browser • No internet required
          </p>
        </div>

        <button 
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Browser Cache & Reload from Cloud</span>
        </button>
      </div>

    </div>
  );
}
