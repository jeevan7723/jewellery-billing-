import React, { useState } from 'react';
import { useJewellery, INITIAL_RATES, INITIAL_INVENTORY, INITIAL_KARAGIRS, INITIAL_REFINERY_BATCHES, INITIAL_INVOICES, INITIAL_SHOWROOM } from '../context/JewelleryContext';
import { Settings, Save, RotateCcw, Building2, TrendingUp, CheckCircle2, Shield, Wrench, Sparkles, Cloud, Database, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SettingsView() {
  const { rates, updateRates, showroom, setShowroom, cloudStatus, syncAllToCloud } = useJewellery();
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Local form state
  const [gold24k, setGold24k] = useState(rates.gold24k);
  const [gold22k, setGold22k] = useState(rates.gold22k);
  const [gold18k, setGold18k] = useState(rates.gold18k);
  const [silver999, setSilver999] = useState(rates.silver999);

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

          <div className="pt-2">
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
            >
              <Save className="w-4 h-4" />
              <span>Save Today's Rates</span>
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
