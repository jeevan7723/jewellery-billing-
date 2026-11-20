import React, { useState } from 'react';
import { useJewellery } from '../context/JewelleryContext';
import { 
  Boxes, Plus, Search, Tag, Trash2, CheckCircle2, 
  Sparkles, Filter, Scale, Camera, Pencil, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export default function InventoryView() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, t = (k, f) => f } = useJewellery();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // New Item Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Necklaces');
  const [metal, setMetal] = useState('Gold');
  const [karat, setKarat] = useState('22K');
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('');
  const [makingAmount, setMakingAmount] = useState('');
  const [hallmarkNo, setHallmarkNo] = useState('');

  // Edit Item Form State
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Necklaces');
  const [editMetal, setEditMetal] = useState('Gold');
  const [editKarat, setEditKarat] = useState('22K');
  const [editGrossWeight, setEditGrossWeight] = useState('');
  const [editStoneWeight, setEditStoneWeight] = useState('');
  const [editMakingAmount, setEditMakingAmount] = useState('');
  const [editHallmarkNo, setEditHallmarkNo] = useState('');
  const [editStatus, setEditStatus] = useState('In Showcase');
  const [editBarcode, setEditBarcode] = useState('');

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
    const gross = parseFloat(grossWeight) || 0;
    const stone = parseFloat(stoneWeight) || 0;
    const netWeight = Math.max(0, gross - stone);
    const makingAmt = parseFloat(makingAmount) || 0;
    const newItem = {
      id: `KC-INV-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `KC${Math.floor(100000 + Math.random() * 900000)}`,
      name: name.trim() || 'New Jewellery Item',
      category,
      metal,
      karat,
      purity: karat === '24K' ? 0.999 : (karat === '22K' ? 0.916 : 0.750),
      grossWeight: gross,
      stoneWeight: stone,
      netWeight,
      makingChargeAmount: makingAmt,
      makingChargeRate: makingAmt,
      makingChargeType: 'fixed',
      hallmarkNo: hallmarkNo.trim(),
      quantity: 1,
      status: "In Showcase"
    };

    addInventoryItem(newItem);
    setShowAddModal(false);
    setName('');
    setGrossWeight('');
    setStoneWeight('');
    setMakingAmount('');
    setHallmarkNo('');
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFF6D3', '#10B981']
    });
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditName(item.name || '');
    setEditCategory(item.category || 'Necklaces');
    setEditMetal(item.metal || 'Gold');
    setEditKarat(item.karat || '22K');
    setEditGrossWeight(item.grossWeight !== undefined ? item.grossWeight : '');
    setEditStoneWeight(item.stoneWeight !== undefined ? item.stoneWeight : 0);
    
    // Total Making Charge Amount (₹) set by owner
    let initialMaking = '';
    if (item.makingChargeAmount !== undefined) {
      initialMaking = item.makingChargeAmount;
    } else if (item.makingChargeType === 'fixed') {
      initialMaking = item.makingChargeRate ?? '';
    } else if (item.makingChargeType === 'perGram' && item.makingChargeRate) {
      initialMaking = Math.round((parseFloat(item.grossWeight) || 0) * parseFloat(item.makingChargeRate));
    } else if (item.makingChargeType === 'percentage' && item.makingChargeRate) {
      initialMaking = Math.round(((parseFloat(item.grossWeight) || 0) * (item.purity || 0.916)) * 7425 * (parseFloat(item.makingChargeRate) / 100));
    } else if (item.makingCharges !== undefined) {
      initialMaking = item.makingCharges;
    } else if (item.makingChargeRate !== undefined) {
      initialMaking = item.makingChargeRate;
    }
    setEditMakingAmount(initialMaking);

    setEditHallmarkNo(item.hallmarkNo || '');
    setEditStatus(item.status || 'In Showcase');
    setEditBarcode(item.barcode || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const gross = parseFloat(editGrossWeight) || 0;
    const stone = parseFloat(editStoneWeight) || 0;
    const net = Math.max(0, gross - stone);
    
    let purityRatio = 0.916;
    if (editKarat === '24K') purityRatio = 0.999;
    else if (editKarat === '22K') purityRatio = 0.916;
    else if (editKarat === '18K') purityRatio = 0.750;
    else if (editKarat === '14K') purityRatio = 0.585;
    else if (editKarat === '999') purityRatio = 0.999;
    else if (editKarat === '925') purityRatio = 0.925;

    const makingAmt = parseFloat(editMakingAmount) || 0;
    const updates = {
      name: editName.trim() || editingItem.name,
      category: editCategory,
      metal: editMetal,
      karat: editKarat,
      purity: purityRatio,
      grossWeight: gross,
      stoneWeight: stone,
      netWeight: net,
      makingChargeAmount: makingAmt,
      makingChargeRate: makingAmt,
      makingChargeType: 'fixed',
      hallmarkNo: editHallmarkNo.trim(),
      status: editStatus,
      barcode: editBarcode.trim() || editingItem.barcode,
    };

    updateInventoryItem(editingItem.id, updates);
    setEditingItem(null);
    confetti({
      particleCount: 65,
      spread: 55,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#10B981', '#38BDF8']
    });
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
            {t('inventoryTitle', 'Stock &')} <span className="gold-gradient-text">{t('inventoryTitleAccent', 'Inventory')}</span>
          </h1>
          <p className="text-xs text-slate-300 font-light mt-1">
            {t('inventorySubtitle', 'Track all jewellery items in shop, gross weight, stone deduction, net gold weight, and barcode tags.')}
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addItem', 'Add New Jewellery Item')}</span>
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
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
                        title="Edit jewellery item"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteInventoryItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                    placeholder="0.000"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Stone / Wax Weight (g)</label>
                  <input 
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={stoneWeight}
                    onChange={(e) => setStoneWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Making Charges (₹) <span className="text-emerald-400 font-normal">• Total making charge amount set by owner</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono text-emerald-400 font-bold">₹</span>
                  <input 
                    type="number"
                    step="1"
                    value={makingAmount}
                    onChange={(e) => setMakingAmount(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs font-mono font-bold text-emerald-300"
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

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-amber-400" />
                  <span>Edit Jewellery Item</span>
                </h3>
                <span className="text-[11px] font-mono text-sky-400">
                  Tag: #{editingItem.barcode} • ID: {editingItem.id}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Item Name *</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Traditional Peacock Jhumka (22K)"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Bangles & Kadas" className="bg-obsidian-900">Bangles & Kadas</option>
                    <option value="Necklaces" className="bg-obsidian-900">Necklaces</option>
                    <option value="Rings" className="bg-obsidian-900">Rings</option>
                    <option value="Chains & Mangalsutra" className="bg-obsidian-900">Chains & Mangalsutra</option>
                    <option value="Bullion" className="bg-obsidian-900">Gold Coins & Bars</option>
                    <option value="Silver Articles" className="bg-obsidian-900">Silver Articles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Metal</label>
                  <select 
                    value={editMetal}
                    onChange={(e) => setEditMetal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-amber-300"
                  >
                    <option value="Gold" className="bg-obsidian-900">Gold</option>
                    <option value="Silver" className="bg-obsidian-900">Silver</option>
                    <option value="Platinum" className="bg-obsidian-900">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Purity / Karat</label>
                  <select 
                    value={editKarat}
                    onChange={(e) => setEditKarat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-gold-300"
                  >
                    <option value="24K" className="bg-obsidian-900">Gold 24K (999)</option>
                    <option value="22K" className="bg-obsidian-900">Gold 22K (916)</option>
                    <option value="18K" className="bg-obsidian-900">Gold 18K (750)</option>
                    <option value="14K" className="bg-obsidian-900">Gold 14K (585)</option>
                    <option value="999" className="bg-obsidian-900">Silver 999 Fine</option>
                    <option value="925" className="bg-obsidian-900">Silver 925 Sterling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Gross Wt (g) *</label>
                  <input 
                    type="number"
                    step="0.001"
                    required
                    value={editGrossWeight}
                    onChange={(e) => setEditGrossWeight(e.target.value)}
                    placeholder="0.000"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Stone/Wax (g)</label>
                  <input 
                    type="number"
                    step="0.001"
                    value={editStoneWeight}
                    onChange={(e) => setEditStoneWeight(e.target.value)}
                    placeholder="0.000"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-amber-400 mb-1">Net Metal (g)</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-obsidian-950/80 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 flex items-center">
                    {Math.max(0, (parseFloat(editGrossWeight) || 0) - (parseFloat(editStoneWeight) || 0)).toFixed(3)}g
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Making Charges (₹) <span className="text-emerald-400 font-normal">• Total making charge amount set by owner</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono text-emerald-400 font-bold">₹</span>
                  <input 
                    type="number"
                    step="1"
                    value={editMakingAmount}
                    onChange={(e) => setEditMakingAmount(e.target.value)}
                    placeholder="e.g. 3500"
                    className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs font-mono font-bold text-emerald-300 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Hallmark HUID</label>
                  <input 
                    type="text"
                    value={editHallmarkNo}
                    onChange={(e) => setEditHallmarkNo(e.target.value)}
                    placeholder="e.g. HUID-8731-MH"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Location / Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-400 font-mono"
                  >
                    <option value="In Showcase" className="bg-obsidian-900">In Showcase</option>
                    <option value="In Vault Showcase" className="bg-obsidian-900">In Vault Showcase</option>
                    <option value="In Counter Tray 04" className="bg-obsidian-900">In Counter Tray 04</option>
                    <option value="In Safe" className="bg-obsidian-900">In Safe</option>
                    <option value="Sold / Billed" className="bg-obsidian-900">Sold / Billed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Barcode Tag</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    placeholder="Barcode string"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono text-sky-400 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setEditBarcode(`KC${Math.floor(100000 + Math.random() * 900000)}`)}
                    className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 whitespace-nowrap cursor-pointer"
                    title="Generate new barcode"
                  >
                    Regen
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Stock Item</span>
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
