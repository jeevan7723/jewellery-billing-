import React from 'react';
import { useJewellery } from '../../context/JewelleryContext';

export default function JewelleryTagTemplate({ item, items = [], showroom: rawShowroom, mode = 'single' }) {
  let isMarathi = false;
  try {
    const ctx = useJewellery();
    isMarathi = ctx?.language === 'mr';
  } catch (e) {
    if (typeof window !== 'undefined') {
      isMarathi = localStorage.getItem('language') === 'mr';
    }
  }

  const showroom = {
    name: 'KARATCRAFT',
    ...(rawShowroom || {})
  };

  const tagList = mode === 'batch' && items.length > 0 ? items : (item ? [item] : []);

  return (
    <div className="bg-white text-black font-mono p-4 sm:p-6 max-w-[210mm] mx-auto text-xs">
      
      <div className="no-print mb-4 pb-3 border-b border-gray-200 flex justify-between items-center text-xs">
        <span className="font-bold text-gray-700">
          🏷️ {isMarathi ? `प्रमाणित दागिने थर्मल टॅग्स (${tagList.length} टॅग्स)` : `Standard Jewellery Rat-Tail Thermal Tags (${tagList.length} Tag${tagList.length > 1 ? 's' : ''})`}
        </span>
        <span className="text-[10px] text-gray-500">
          {isMarathi 
            ? 'झिब्रा / टीएससी / सिटिझन थर्मल टॅग प्रिंटरशी सुसंगत (१००मिमी × २५मिमी)' 
            : 'Compatible with Zebra / TSC / Citizen Thermal Tag Printers (100mm × 25mm)'}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {tagList.map((tagItem, idx) => {
          const gross = tagItem.grossWeight || 0;
          const stone = tagItem.stoneWeight || 0;
          const net = tagItem.netWeight || Math.max(0, gross - stone);
          const karat = tagItem.karat || '22K';
          const code = tagItem.barcode || `KC${Math.floor(100000 + Math.random() * 900000)}`;
          const huid = tagItem.hallmarkNo || '—';

          return (
            <div 
              key={idx}
              className="w-[95mm] h-[32mm] border-2 border-black rounded-lg p-2.5 flex items-center justify-between bg-white text-black relative page-break-inside-avoid shadow-sm print:shadow-none print:border-black"
            >
              {/* Left Side: Brand, Barcode, Code */}
              <div className="w-[52%] pr-2 border-r border-dashed border-gray-400 flex flex-col justify-between h-full">
                <div>
                  <div className="font-extrabold text-[10px] tracking-tight truncate uppercase">
                    {showroom.name || 'KARATCRAFT'}
                  </div>
                  <div className="text-[8px] text-gray-700 truncate">
                    {tagItem.name}
                  </div>
                </div>

                <div className="text-center my-0.5">
                  <div className="barcode-stripes h-5 w-full invert opacity-95 rounded-sm" />
                  <div className="text-[9px] font-bold tracking-widest leading-none mt-0.5">
                    *{code}*
                  </div>
                </div>

                <div className="flex justify-between items-center text-[8px] font-bold text-gray-800">
                  <span>TAG: {code}</span>
                  <span 
                    className="bg-black text-white keep-white px-1 rounded text-[7px]"
                    style={{ color: '#ffffff' }}
                  >
                    {karat}
                  </span>
                </div>
              </div>

              {/* Right Side: Weights & HUID Breakdown */}
              <div className="w-[48%] pl-2 flex flex-col justify-between h-full text-[9px] leading-tight">
                <div className="flex justify-between items-center border-b border-gray-300 pb-0.5">
                  <span className="text-[8px] text-gray-600">{isMarathi ? 'शुद्धता:' : 'PURITY:'}</span>
                  <span className="font-extrabold text-xs">{karat} 916</span>
                </div>

                <div className="space-y-0.5 py-0.5 font-bold">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-normal">{isMarathi ? 'एकूण:' : 'GR.WT:'}</span>
                    <span>{gross.toFixed(3)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-normal">{isMarathi ? 'खडे:' : 'ST.WT:'}</span>
                    <span>{stone.toFixed(3)}g</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-0.5 text-black">
                    <span className="font-bold">{isMarathi ? 'निव्वळ:' : 'NT.WT:'}</span>
                    <span className="text-xs font-black">{net.toFixed(3)}g</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-0.5 flex justify-between items-center text-[8px]">
                  <span className="text-gray-500">BIS HUID:</span>
                  <span className="font-bold font-mono">{huid}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="no-print text-center text-[10px] text-gray-400 mt-6 font-mono">
        💡 {isMarathi 
          ? 'टीप: थेट रोल थर्मल प्रिंटिंगसाठी प्रिंटर सेटिंग्जमध्ये "कस्टम स्केल: १००%" आणि "कागदाचा आकार: १००मिमी × २५मिमी" निवडा.' 
          : 'Tip: Select "Custom Scale: 100%" and "Paper Size: 100mm × 25mm" in printer settings for direct roll thermal printing.'}
      </div>
    </div>
  );
}
