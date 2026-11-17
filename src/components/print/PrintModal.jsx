import React, { useState } from 'react';
import { Printer, X, FileText, CheckCircle2, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PrintModal({ 
  isOpen, 
  onClose, 
  title = "Print Document",
  children,
  formatToggle = false,
  format = 'a4',
  onFormatChange = () => {}
}) {
  const [printed, setPrinted] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    setPrinted(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-obsidian-950/85 backdrop-blur-md">
      
      {/* Outer Modal Container */}
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-white/20 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="no-print p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-obsidian-900/90 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base leading-tight">
                {title}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Official Document Preview • Ready for A4 Laser & Thermal Printing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle: A4 vs Thermal Receipt */}
            {formatToggle && (
              <div className="flex items-center bg-obsidian-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => onFormatChange('a4')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    format === 'a4' 
                      ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-glow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📄 A4 Invoice
                </button>
                <button
                  type="button"
                  onClick={() => onFormatChange('thermal')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    format === 'thermal' 
                      ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-glow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🧾 80mm Thermal
                </button>
              </div>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-gold-glow"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl glass-pill text-slate-400 hover:text-white cursor-pointer"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900/60 flex justify-center items-start">
          <div 
            id="printable-area" 
            className={`w-full transition-all duration-300 ${
              format === 'thermal' ? 'thermal-format max-w-[80mm]' : 'max-w-[210mm]'
            }`}
          >
            {children}
          </div>
        </div>

      </div>

    </div>
  );
}
