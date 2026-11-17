import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  Boxes, Plus, Search, Tag, Trash2, CheckCircle2, 
  Sparkles, Filter, Scale, Camera 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export default function InventoryView() {
  const { inventory, addInventoryItem, deleteInventoryItem } = useJewellery();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // New Item Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Necklaces');
  const [metal, setMetal] = useState('Gold');
  const [karat, setKarat] = useState('22K');
  const [grossWeight, setGrossWeight] = useState(15.000);
  const [stoneWeight, setStoneWeight] = useState(0.500);
  const [makingType, setMakingType] = useState('perGram');
  const [makingRate, setMakingRate] = useState(500);
  const [hallmarkNo, setHallmarkNo] = useState(`HUID-${Math.floor(1000 + Math.random() * 9000)}-MH`);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalGross = inventory.reduce((sum, i) => sum + i.grossWeight, 0);
  const totalNet = inventory.reduce((sum, i) => sum + i.netWeight, 0);

  const handleAddItem = (e) => {
    e.preventDefault();
    const netWeight = Math.max(0, grossWeight - stoneWeight);
    const newItem = {
      id: `KC-INV-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `KC${Math.floor(100000 + Math.random() * 900000)}`,
      name,
      category,
      metal,
      karat,
      purity: karat === '24K' ? 0.999 : (karat === '22K' ? 0.916 : 0.750),
      grossWeight,
      stoneWeight,
      netWeight,
      makingChargeType: makingType,
      makingChargeRate: makingRate,
      hallmarkNo,
      quantity: 1,
      status: "In Showcase"
    };

    addInventoryItem(newItem);
    setShowAddModal(false);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFF6D3', '#10B981']
    });
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            Stock & <span className="gold-gradient-text">Inventory</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            Track all jewellery items in shop, gross weight, stone deduction, net gold weight, and barcode tags.
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Jewellery Item</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Items in Stock</span>
          <span className="font-serif text-2xl font-bold text-white">{inventory.length} Pieces</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Gross Weight</span>
          <span className="font-serif text-2xl font-bold text-slate-200">{totalGross.toFixed(3)}g</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-gold-500/30">
          <span className="text-gold-400 text-[10px] font-mono uppercase block">Total Net Gold Weight</span>
          <span className="font-serif text-2xl font-bold text-gold-300">{totalNet.toFixed(3)}g</span>
        </div>
      </div>

      {/* Filters & Search with Camera Barcode Scanner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or barcode..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs font-mono"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCameraScanner(true)}
            className="px-3 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-sky-500/30 cursor-pointer whitespace-nowrap shadow-sm"
            title="Scan physical jewellery tag to find item"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Tag</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {['All', 'Bangles & Kadas', 'Necklaces', 'Rings', 'Bullion', 'Silver Articles'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat 
                  ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-glow' 
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glass-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02] text-left">
                <th className="py-3 px-4">Barcode Tag</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Purity</th>
                <th className="py-3 px-4 text-right">Gross Wt</th>
                <th className="py-3 px-4 text-right">Stone Wt</th>
                <th className="py-3 px-4 text-right text-gold-300">Net Wt</th>
                <th className="py-3 px-4">Hallmark HUID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-mono text-xs">
                    No jewellery items in vault. Click <strong className="text-gold-300">"+ Add Jewellery Tag"</strong> above to add new stock to Firebase.
                  </td>
                </tr>
              )}
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-sky-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-sky-400" />
                    <span>{item.barcode}</span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-slate-400">{item.category}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/20 font-bold">
                      {item.karat}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-200">{item.grossWeight.toFixed(3)}g</td>
                  <td className="py-3 px-4 text-right text-slate-400">{item.stoneWeight.toFixed(3)}g</td>
                  <td className="py-3 px-4 text-right font-bold text-gold-300">{item.netWeight.toFixed(3)}g</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{item.hallmarkNo}</td>
                  <td className="py-3 px-4 text-emerald-400 text-[11px]">{item.status}</td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => deleteInventoryItem(item.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-gold-500/40 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Add New Jewellery Item to Stock
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Item Name *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Traditional Peacock Jhumka (22K)"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Bangles & Kadas">Bangles & Kadas</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Rings">Rings</option>
                    <option value="Chains & Mangalsutra">Chains & Mangalsutra</option>
                    <option value="Bullion">Gold Coins & Bars</option>
                    <option value="Silver Articles">Silver Articles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Purity / Karat</label>
                  <select 
                    value={karat}
                    onChange={(e) => setKarat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="24K">Gold 24K (999)</option>
                    <option value="22K">Gold 22K (916)</option>
                    <option value="18K">Gold 18K (750)</option>
                    <option value="925">Silver 925</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Gross Weight (g) *</label>
                  <input 
                    type="number"
                    step="0.001"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Stone / Wax Weight (g)</label>
                  <input 
                    type="number"
                    step="0.001"
                    value={stoneWeight}
                    onChange={(e) => setStoneWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-xl gold-gradient-btn text-xs font-bold"
                >
                  Save Item & Make Barcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE CAMERA BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScan={(code) => setSearchTerm(code)}
        sampleItems={inventory}
      />

    </div>
  );
}
