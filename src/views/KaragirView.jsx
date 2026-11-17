import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  Hammer, Plus, ArrowUpRight, ArrowDownLeft, Scale, 
  CheckCircle2, UserCheck, Phone, Printer 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintModal from '../components/print/PrintModal';
import ReportTemplate from '../components/print/ReportTemplate';

export default function KaragirView() {
  const { karagirs, addKaragir, issueMetalToKaragir, returnMetalFromKaragir, showroom } = useJewellery();
  
  const [selectedKaragirId, setSelectedKaragirId] = useState(karagirs[0]?.id || '');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showAddKaragirModal, setShowAddKaragirModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Forms
  const [issueGrams, setIssueGrams] = useState(25.000);
  const [returnGrams, setReturnGrams] = useState(24.200);
  const [scrapGrams, setScrapGrams] = useState(0.400);

  // New Karagir
  const [newName, setNewName] = useState('');
  const [newSpeciality, setNewSpeciality] = useState('Kadas & Bangles');
  const [newPhone, setNewPhone] = useState('+91 98200 77112');

  const selectedKaragir = karagirs.find(k => k.id === selectedKaragirId) || karagirs[0];
  const totalBalanceAll = karagirs.reduce((sum, k) => sum + k.balanceMetal, 0);

  const handleIssueMetal = (e) => {
    e.preventDefault();
    issueMetalToKaragir(selectedKaragirId, issueGrams);
    setShowIssueModal(false);
    confetti({ particleCount: 60, spread: 50 });
  };

  const handleReturnMetal = (e) => {
    e.preventDefault();
    returnMetalFromKaragir(selectedKaragirId, returnGrams, scrapGrams);
    setShowReturnModal(false);
    confetti({ particleCount: 70, spread: 60 });
  };

  const handleCreateKaragir = (e) => {
    e.preventDefault();
    const newK = {
      id: `KAR-${String(karagirs.length + 1).padStart(2, '0')}`,
      name: newName,
      speciality: newSpeciality,
      phone: newPhone,
      address: "Workshop",
      metalIssued: 0,
      metalReturned: 0,
      meltingScrap: 0,
      balanceMetal: 0,
      activeOrders: 0
    };
    addKaragir(newK);
    setShowAddKaragirModal(false);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Karagir <span className="text-amber-400">Management</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            Track gold given to karagirs, finished jewellery received, scrap returned, and remaining gold balance.
          </p>
        </div>

        <button 
          onClick={() => setShowAddKaragirModal(true)}
          className="px-5 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Karagir</span>
        </button>
      </div>

      {/* Summary Highlight */}
      <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
            Total Gold with Karagirs
          </span>
          <div className="font-serif text-3xl font-extrabold text-white mt-1">
            {totalBalanceAll.toFixed(3)}g <span className="text-sm font-sans font-normal text-slate-400">Pure Gold</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 rounded-xl glass-card hover:border-amber-500/50 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Ledger</span>
          </button>
          <button 
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Give Gold to Karagir</span>
          </button>
          <button 
            onClick={() => setShowReturnModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/30 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Receive Finished Work & Scrap</span>
          </button>
        </div>
      </div>

      {/* Karagirs Grid */}
      {karagirs.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-slate-400 glass-panel rounded-3xl border border-dashed border-white/10">
          No artisan accounts registered. Click <strong className="text-amber-300">"+ Add Karagir"</strong> above to create your first goldsmith account.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {karagirs.map((karagir) => (
            <div 
              key={karagir.id}
              onClick={() => setSelectedKaragirId(karagir.id)}
              className={`p-6 rounded-2xl glass-card border transition-all cursor-pointer space-y-4 ${
                selectedKaragirId === karagir.id 
                  ? 'border-amber-500/50 bg-obsidian-900/90 shadow-gold-glow' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-mono text-amber-400 font-bold">{karagir.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                  {karagir.speciality}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {karagir.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {karagir.phone}
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-obsidian-950/70 border border-white/5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Gold Given:</span>
                  <span className="text-white font-bold">{Number(karagir.metalIssued || 0).toFixed(3)}g</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Finished Pieces Returned:</span>
                  <span className="text-emerald-300 font-bold">{Number(karagir.metalReturned || 0).toFixed(3)}g</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Melting Scrap Returned:</span>
                  <span className="text-slate-300">{Number(karagir.meltingScrap || 0).toFixed(3)}g</span>
                </div>
                <div className="flex justify-between text-amber-300 font-bold border-t border-white/5 pt-1.5">
                  <span>Balance Gold Pending:</span>
                  <span>{Number(karagir.balanceMetal || 0).toFixed(3)}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Issue Metal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-amber-500/40 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Give Raw Gold to Karagir
            </h3>
            <form onSubmit={handleIssueMetal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Select Karagir</label>
                <select 
                  value={selectedKaragirId}
                  onChange={(e) => setSelectedKaragirId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  {karagirs.map(k => (
                    <option key={k.id} value={k.id} className="bg-obsidian-900">{k.name} ({k.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Gold Weight to Give (grams) *</label>
                <input 
                  type="number"
                  step="0.001"
                  required
                  value={issueGrams}
                  onChange={(e) => setIssueGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-xl gold-gradient-btn text-xs font-bold"
                >
                  Save & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Return Metal & Scrap */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-emerald-500/40 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Receive Finished Jewellery & Scrap
            </h3>
            <form onSubmit={handleReturnMetal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Select Karagir</label>
                <select 
                  value={selectedKaragirId}
                  onChange={(e) => setSelectedKaragirId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  {karagirs.map(k => (
                    <option key={k.id} value={k.id} className="bg-obsidian-900">{k.name} ({k.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Finished Jewellery Weight (g) *</label>
                <input 
                  type="number"
                  step="0.001"
                  required
                  value={returnGrams}
                  onChange={(e) => setReturnGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Scrap / Dust Returned (g)</label>
                <input 
                  type="number"
                  step="0.001"
                  value={scrapGrams}
                  onChange={(e) => setScrapGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-xl gold-gradient-btn text-xs font-bold"
                >
                  Save & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Karagir */}
      {showAddKaragirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-amber-500/40 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Add New Karagir
            </h3>
            <form onSubmit={handleCreateKaragir} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Karagir Name *</label>
                <input 
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Goldsmith"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Work Speciality</label>
                <input 
                  type="text"
                  value={newSpeciality}
                  onChange={(e) => setNewSpeciality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Phone Number</label>
                <input 
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setShowAddKaragirModal(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-xl gold-gradient-btn text-xs font-bold"
                >
                  Add Karagir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KARAGIR LEDGER PRINT MODAL */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Karagir Gold Ledger Statement"
        formatToggle={false}
      >
        <ReportTemplate 
          reportType="karagir"
          data={{ karagirs }}
          showroom={showroom}
        />
      </PrintModal>

    </div>
  );
}
