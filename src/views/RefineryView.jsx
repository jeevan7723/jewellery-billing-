import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { Flame, Plus, Scale, CheckCircle2, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintModal from '../components/print/PrintModal';
import ReportTemplate from '../components/print/ReportTemplate';

export default function RefineryView() {
  const { refineryBatches, addRefineryBatch, showroom, purchasedGoldSummary, t = (k, f) => f } = useJewellery();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // New Batch State
  const [refineryName, setRefineryName] = useState('');
  const [metalType, setMetalType] = useState('Old Gold Scrap Melt');
  const [sentWeightGross, setSentWeightGross] = useState('');
  const [assayedPurityTested, setAssayedPurityTested] = useState('');
  const [postMeltWeight, setPostMeltWeight] = useState('');

  const numSent = parseFloat(sentWeightGross) || 0;
  const numPostMelt = parseFloat(postMeltWeight) || 0;
  const wastageDross = Math.max(0, numSent - numPostMelt);
  const wastagePercent = numSent > 0 ? ((wastageDross / numSent) * 100).toFixed(2) : '0';
  const fineGoldRecovered = (numPostMelt * 0.885).toFixed(3);

  const handleCreateBatch = (e) => {
    e.preventDefault();
    const newB = {
      id: `REF-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      refineryName: refineryName.trim() || 'Assay Refinery',
      metalType: metalType.trim() || 'Old Gold Scrap Melt',
      sentWeightGross: numSent,
      assayedPurityTested: assayedPurityTested.trim() || 'Testing In Progress',
      postMeltWeight: numPostMelt,
      wastageDrossWeight: wastageDross,
      wastagePercentage: parseFloat(wastagePercent),
      fineGoldRecovered: parseFloat(fineGoldRecovered),
      status: "Melting in Progress"
    };

    addRefineryBatch(newB);
    setRefineryName('');
    setSentWeightGross('');
    setAssayedPurityTested('');
    setPostMeltWeight('');
    setShowAddModal(false);
    confetti({ particleCount: 70, spread: 60 });
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            {t('refineryTitle', 'Gold Refinery &')} <span className="text-amber-500">{t('refineryTitleAccent', 'Melting')}</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            {t('refinerySubtitle', 'Track scrap gold sent for melting, post-melt weight, melting loss, and pure gold received.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 rounded-xl glass-card hover:border-amber-500/50 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Melting Log</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Melting Batch</span>
          </button>
        </div>
      </div>

      {/* Purchased Scrap Gold in Vault Status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">
              Inward Purchased Scrap Gold in Vault
            </div>
            <p className="text-[11px] text-slate-400">
              Gold purchased from customer exchanges ready to melt or refine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:border-l sm:border-amber-500/20 sm:pl-4">
          <div>
            <span className="text-slate-400 block text-[10px]">COMBINED WEIGHT:</span>
            <span className="text-white font-bold text-base">
              {Number(purchasedGoldSummary?.totalGrossWeight || 0).toFixed(3)}g
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">COMBINED VALUE:</span>
            <span className="text-amber-300 font-bold text-base">
              ₹{Number(purchasedGoldSummary?.totalValue || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Refinery Batches Grid */}
      {refineryBatches.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-slate-400 glass-panel rounded-3xl border border-dashed border-white/10">
          No melting batches logged. Click <strong className="text-amber-400">"+ Add Melting Batch"</strong> above to record scrap sent for refining to Firebase.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {refineryBatches.map((batch) => (
            <div key={batch.id} className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-gold-400">{batch.id}</span>
                  <span className="text-[11px] text-slate-400 font-mono ml-2">• {batch.date}</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  batch.status.includes('Completed') 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {batch.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {batch.refineryName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Item: {batch.metalType}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-obsidian-950/70 border border-white/5 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Scrap Sent Weight:</span>
                  <span className="text-white font-bold">{Number(batch.sentWeightGross || 0).toFixed(3)}g</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Post-Melt Weight:</span>
                  <span className="text-slate-200 font-bold">{Number(batch.postMeltWeight || 0).toFixed(3)}g</span>
                </div>
                <div>
                  <span className="text-rose-400 block text-[10px]">Melting Loss:</span>
                  <span className="text-rose-300 font-bold">
                    {Number(batch.wastageDrossWeight || 0).toFixed(3)}g ({batch.wastagePercentage}%)
                  </span>
                </div>
                <div>
                  <span className="text-emerald-400 block text-[10px]">Pure Gold Received:</span>
                  <span className="text-emerald-300 font-bold">{Number(batch.fineGoldRecovered || 0).toFixed(3)}g</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-1">
                Assayed Purity: <strong className="text-gold-300">{batch.assayedPurityTested}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Add New Melting Batch
            </h3>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Refinery Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Apex Assay Laboratories"
                  value={refineryName}
                  onChange={(e) => setRefineryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Scrap Description</label>
                <input 
                  type="text"
                  placeholder="e.g. Old Gold Scrap Melt"
                  value={metalType}
                  onChange={(e) => setMetalType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Scrap Weight Sent (g) *</label>
                  <input 
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={sentWeightGross}
                    onChange={(e) => setSentWeightGross(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Post-Melt Bar Weight (g) *</label>
                  <input 
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={postMeltWeight}
                    onChange={(e) => setPostMeltWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-950/70 border border-white/5 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Melting Loss / Slag:</span>
                  <span className="text-rose-400 font-bold">{wastageDross.toFixed(3)}g ({wastagePercent}%)</span>
                </div>
                <div className="flex justify-between text-gold-300 font-bold">
                  <span>Pure 24K Gold Recovered:</span>
                  <span>{fineGoldRecovered}g</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-xl gold-gradient-btn text-xs font-bold"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFINERY MELTING LOG PRINT MODAL */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Refinery Scrap Melting & Assay Audit Statement"
        formatToggle={false}
      >
        <ReportTemplate 
          reportType="refinery"
          data={{ refineryBatches }}
          showroom={showroom}
        />
      </PrintModal>

    </div>
  );
}
