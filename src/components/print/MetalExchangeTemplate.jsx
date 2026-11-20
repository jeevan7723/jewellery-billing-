import React from 'react';
import { numberToIndianWords } from '../../utils/numberToWords';
import { useJewellery } from '../../context/JewelleryContext';

export default function MetalExchangeTemplate({ exchangeData, showroom: rawShowroom }) {
  if (!exchangeData) return null;

  let contextRates = null;
  let isMarathi = false;
  try {
    const ctx = useJewellery();
    contextRates = ctx?.rates;
    isMarathi = ctx?.language === 'mr';
  } catch (e) {
    if (typeof window !== 'undefined') {
      isMarathi = localStorage.getItem('language') === 'mr';
    }
  }

  const showroom = {
    name: 'KaratCraft Fine Jewellers',
    tagline: isMarathi ? 'प्रमाणित उच्च दर्जाचे दागिने आणि बुलियन व्यापारी' : 'Certified High Jewellery & Bullion Merchants',
    address: 'Plot 42, Gold Souk, Zaveri Bazaar, Mumbai 400002',
    phone: '+91 98200 12345',
    gstin: '27AADCB2230M1Z2',
    ...(rawShowroom || {})
  };

  const {
    voucherNo = `EXCH-${Math.floor(1000 + Math.random() * 9000)}`,
    date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    customerName = isMarathi ? 'किरकोळ ग्राहक' : 'Walk-in Customer',
    phone = '—',
    exchangeMode = 'gold-to-gold',
    inwardMetal = 'Gold',
    inwardKarat = '22K',
    inwardGrossWeight = 0,
    inwardStoneWeight = 0,
    inwardNetWeight = 0,
    inwardMeltingLossPercent = 0,
    inwardFineEquivalent = 0,
    inwardRate = 0,
    inwardValuation = 0,
    outwardMetal = 'Gold',
    outwardKarat = '22K',
    outwardDescription = isMarathi ? 'दागिने वस्तू' : 'Jewellery Article',
    outwardGrossWeight = 0,
    outwardRate = 0,
    outwardMakingCharges = 0,
    outwardValuation = 0,
    metalDifferenceGrams = null,
    cashSettlement = 0,
  } = exchangeData;

  const safeCashSettlement = Number(cashSettlement) || 0;
  const isCustomerRefund = safeCashSettlement > 0; // Positive: Showroom refunds customer
  const isCustomerPayable = safeCashSettlement < 0; // Negative: Customer pays remaining balance
  const absSettlement = Math.abs(safeCashSettlement);

  const safeInwardGross = Number(inwardGrossWeight) || 0;
  const safeInwardStone = Number(inwardStoneWeight) || 0;
  const safeInwardNet = Number(inwardNetWeight) || 0;
  const safeMeltingLoss = Number(inwardMeltingLossPercent) || 0;
  const safeInwardFine = Number(inwardFineEquivalent) || 0;
  const safeInwardValuation = Number(inwardValuation) || 0;

  const PURITY_RATIOS = {
    '24K': 0.999,
    '22K': 0.916,
    '20K': 0.833,
    '18K': 0.750,
    '14K': 0.585,
    '9K': 0.375,
    '999': 0.999,
    '925': 0.925,
    '800': 0.800,
    '700': 0.700,
  };

  const getPurityRatio = (karat) => {
    if (!karat) return 0.916;
    for (const [k, ratio] of Object.entries(PURITY_RATIOS)) {
      if (String(karat).toUpperCase().includes(k)) return ratio;
    }
    return 0.916;
  };

  const inwardRatio = getPurityRatio(inwardKarat);
  const outwardRatio = getPurityRatio(outwardKarat);

  // Safe benchmark 24K rate
  const safeInwardRate = Number(inwardRate) 
    || (safeInwardValuation > 0 && safeInwardFine > 0 ? Math.round(safeInwardValuation / safeInwardFine) : 0)
    || (safeInwardValuation > 0 && safeInwardNet > 0 ? Math.round(safeInwardValuation / (safeInwardNet * inwardRatio)) : 0)
    || Number(contextRates?.gold24k || 0);

  const safeOutwardGross = Number(outwardGrossWeight) || 0;
  const safeOutwardValuation = Number(outwardValuation) || 0;
  const safeOutwardMaking = Number(outwardMakingCharges) || 0;
  const safeOutwardRate = Number(outwardRate || inwardRate) 
    || (safeOutwardValuation > 0 && safeOutwardGross > 0 ? Math.round((safeOutwardValuation - safeOutwardMaking) / (safeOutwardGross * outwardRatio)) : 0)
    || safeInwardRate 
    || Number(contextRates?.gold24k || 0);

  const effectiveInwardRate = Math.round(safeInwardRate * inwardRatio);
  const effectiveOutwardRate = Math.round(safeOutwardRate * outwardRatio);

  const hasValidMetalDiff = typeof metalDifferenceGrams === 'number' && !isNaN(metalDifferenceGrams);
  const safeDiff = hasValidMetalDiff ? Math.abs(metalDifferenceGrams) : 0;

  const formatMetal = (m) => {
    if (!isMarathi) return m;
    if (m === 'Gold') return 'सोने';
    if (m === 'Silver') return 'चांदी';
    return m;
  };

  const exchangeModeDisplay = () => {
    if (isMarathi) {
      if (exchangeMode === 'gold-to-gold') return 'सोन्यावर सोने (Gold to Gold)';
      if (exchangeMode === 'silver-to-silver') return 'चांदीवर चांदी (Silver to Silver)';
      if (exchangeMode === 'gold-to-silver') return 'सोन्यावर चांदी (Gold to Silver)';
      if (exchangeMode === 'silver-to-gold') return 'चांदीवर सोने (Silver to Gold)';
      return exchangeMode.replace(/-/g, ' ');
    }
    return exchangeMode.replace(/-/g, ' ');
  };

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-10 max-w-[210mm] mx-auto text-xs leading-relaxed border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-purple-900 pb-4 mb-4">
        <div>
          <h1 className="font-serif text-2xl font-black tracking-wide text-slate-900 uppercase">
            {showroom.name}
          </h1>
          <p className="text-xs text-slate-600 font-serif italic mt-0.5">
            {showroom.tagline || (isMarathi ? 'प्रमाणित उच्च दर्जाचे दागिने आणि बुलियन व्यापारी' : 'Certified High Jewellery & Bullion Merchants')}
          </p>
          <p className="text-[11px] text-slate-700 mt-1 max-w-md">
            {showroom.address}
          </p>
          <div className="text-[10px] text-slate-600 mt-1 font-mono">
            {isMarathi ? 'फोन' : 'Phone'}: <strong>{showroom.phone}</strong> • {isMarathi ? 'जीएसटी' : 'GSTIN'}: <strong>{showroom.gstin}</strong>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div 
            className="inline-block bg-purple-950 text-white keep-white font-mono font-bold text-xs px-3 py-1 uppercase tracking-wider rounded shadow-sm"
            style={{ color: '#ffffff' }}
          >
            {isMarathi ? 'मेटल बार्टर स्लिप' : 'METAL BARTER SLIP'}
          </div>
          <div className="text-slate-600 text-[10px] font-mono">
            {isMarathi ? '(जुने सोने / चांदी देवाणघेवाण पावती)' : '(Old Gold / Silver Exchange Voucher)'}
          </div>
          <div className="font-mono text-xs pt-1 font-bold text-purple-900">
            {isMarathi ? 'पावती क्र.' : 'Voucher'} #{voucherNo}
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            {isMarathi ? 'दिनांक' : 'Date'}: <strong>{date}</strong>
          </div>
        </div>
      </div>

      {/* Customer Info & Mode Bar */}
      <div className="grid grid-cols-12 gap-3 bg-slate-50 border border-slate-300 rounded p-3 mb-4 text-[11px] items-center">
        <div className="col-span-5">
          <span className="text-slate-500 uppercase text-[10px] font-mono block">
            {isMarathi ? 'ग्राहकाचे नाव व तपशील:' : 'Customer Particulars:'}
          </span>
          <span className="font-bold text-sm text-slate-900">{customerName}</span>
          {phone && phone !== '—' && <span className="text-slate-600 ml-2 font-mono">({phone})</span>}
        </div>
        <div className="col-span-4 text-center border-l border-slate-200">
          <span className="text-slate-500 uppercase text-[10px] font-mono block">
            {isMarathi ? 'खरेदी केलेला दर:' : 'Purchased Gold Rate:'}
          </span>
          <span className="font-bold font-mono text-xs text-amber-900">
            ₹{effectiveInwardRate.toLocaleString('en-IN')} / g {inwardKarat ? `(${inwardKarat})` : ''}
          </span>
        </div>
        <div className="col-span-3 text-right border-l border-slate-200">
          <span className="text-slate-500 uppercase text-[10px] font-mono block">
            {isMarathi ? 'अदलाबदल पद्धत:' : 'Exchange Mode:'}
          </span>
          <span className="font-bold font-mono text-xs uppercase px-2 py-0.5 bg-purple-100 text-purple-900 rounded border border-purple-300">
            {exchangeModeDisplay()}
          </span>
        </div>
      </div>

      {/* 2-Column Comparison Grid: Inward vs Outward */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        
        {/* Box A: Inward Metal (Customer Deposited) */}
        <div className="border border-slate-300 rounded p-3 bg-rose-50/20">
          <div className="font-bold text-xs text-rose-900 uppercase border-b border-rose-200 pb-1.5 mb-2 flex justify-between">
            <span>{isMarathi ? '१. जमा केलेला जुना धातू (ग्राहकाकडून)' : '1. Inward Metal (Old Deposit)'}</span>
            <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1 rounded">{formatMetal(inwardMetal)}</span>
          </div>

          <table className="w-full text-[11px] font-mono">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-600">
                  {isMarathi ? 'धातू आणि शुद्धता कॅरेट:' : 'Metal & Purity Karat:'}
                </td>
                <td className="py-1 text-right font-bold text-slate-900">{formatMetal(inwardMetal)} ({inwardKarat})</td>
              </tr>
              <tr className="border-b border-slate-200 bg-amber-50/70">
                <td className="py-1.5 text-amber-950 font-bold">
                  {isMarathi ? `खरेदी सोने दर (${inwardKarat}):` : `Purchased Gold Rate (${inwardKarat}):`}
                </td>
                <td className="py-1.5 text-right font-bold text-amber-900 font-mono text-xs">
                  ₹{effectiveInwardRate.toLocaleString('en-IN')} / g
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-600">
                  {isMarathi ? 'काट्यावरील एकूण वजन:' : 'Gross Scale Weight:'}
                </td>
                <td className="py-1 text-right font-medium text-slate-900">{safeInwardGross.toFixed(3)}g</td>
              </tr>
              <tr className="border-b border-slate-200 text-rose-700">
                <td className="py-1">
                  {isMarathi ? 'वजा: खडे / मेण / कचरा:' : 'Less: Stones / Wax / Dirt:'}
                </td>
                <td className="py-1 text-right font-medium">-{safeInwardStone.toFixed(3)}g</td>
              </tr>
              <tr className="border-b border-slate-200 font-bold bg-white/60">
                <td className="py-1 text-slate-900">
                  {isMarathi ? 'निव्वळ वजन:' : 'Net Metal Weight:'}
                </td>
                <td className="py-1 text-right text-slate-900">{safeInwardNet.toFixed(3)}g</td>
              </tr>
              <tr className="border-b border-slate-200 text-slate-600">
                <td className="py-1">
                  {isMarathi ? `गाळणी घट (Melting Loss ${safeMeltingLoss}%):` : `Melting / Assay Loss (${safeMeltingLoss}%):`}
                </td>
                <td className="py-1 text-right font-medium">
                  -{((safeInwardNet * safeMeltingLoss) / 100).toFixed(3)}g
                </td>
              </tr>
              <tr className="border-b border-slate-200 font-bold text-amber-900 bg-amber-50">
                <td className="py-1">
                  {isMarathi ? 'शुद्ध २४K सममूल्य सोने:' : 'Fine Pure Metal (24K Equiv):'}
                </td>
                <td className="py-1 text-right text-xs">{safeInwardFine.toFixed(3)}g</td>
              </tr>
              <tr className="pt-2 text-slate-900">
                <td className="py-1 font-bold">
                  {isMarathi ? 'जुन्या सोन्याचे मूल्यांकन:' : 'Purchased Gold Valuation:'}
                </td>
                <td className="py-1 text-right font-bold font-serif text-sm">
                  ₹{safeInwardValuation.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Box B: Outward Metal (Showroom Stock Issued) */}
        <div className="border border-slate-300 rounded p-3 bg-emerald-50/20">
          <div className="font-bold text-xs text-emerald-900 uppercase border-b border-emerald-200 pb-1.5 mb-2 flex justify-between">
            <span>{isMarathi ? '२. दिलेले नवीन दागिने (दुकानातून)' : '2. Outward Metal (New Jewellery)'}</span>
            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">{formatMetal(outwardMetal)}</span>
          </div>

          <table className="w-full text-[11px] font-mono">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-600">
                  {isMarathi ? 'दागिन्यांचे नाव / तपशील:' : 'Article Description:'}
                </td>
                <td className="py-1 text-right font-bold truncate max-w-[130px] text-slate-900">{outwardDescription}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-600">
                  {isMarathi ? 'धातू आणि हॉलमार्क कॅरेट:' : 'Metal & Hallmark Karat:'}
                </td>
                <td className="py-1 text-right font-bold text-slate-900">{formatMetal(outwardMetal)} ({outwardKarat})</td>
              </tr>
              <tr className="border-b border-slate-200 bg-emerald-50/70">
                <td className="py-1.5 text-emerald-950 font-bold">
                  {isMarathi ? `सोने दर (${outwardKarat}):` : `Gold Rate (${outwardKarat}):`}
                </td>
                <td className="py-1.5 text-right font-bold text-emerald-900 font-mono text-xs">
                  ₹{effectiveOutwardRate.toLocaleString('en-IN')} / g
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-600">
                  {isMarathi ? 'एकूण वजन:' : 'Gross Weight:'}
                </td>
                <td className="py-1 text-right font-medium text-slate-900">{safeOutwardGross.toFixed(3)}g</td>
              </tr>
              <tr className="border-b border-slate-200 font-bold bg-white/60">
                <td className="py-1 text-slate-900">
                  {isMarathi ? 'निव्वळ वजन:' : 'Net Metal Weight:'}
                </td>
                <td className="py-1 text-right text-slate-900">{safeOutwardGross.toFixed(3)}g</td>
              </tr>
              <tr className="border-b border-slate-200 text-slate-600">
                <td className="py-1">
                  {isMarathi ? 'घडणावळ (Making Charges):' : 'Making Charges:'}
                </td>
                <td className="py-1 text-right font-medium text-slate-900">₹{safeOutwardMaking.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-slate-200 text-slate-600">
                <td className="py-1">
                  {isMarathi ? 'हॉलमार्किंग शुल्क (BIS):' : 'Hallmarking Fee (BIS):'}
                </td>
                <td className="py-1 text-right font-medium text-slate-900">₹45.00</td>
              </tr>
              <tr className="pt-2 text-slate-900">
                <td className="py-1 font-bold">
                  {isMarathi ? 'नवीन दागिन्यांचे मूल्यांकन:' : 'New Jewellery Valuation:'}
                </td>
                <td className="py-1 text-right font-bold font-serif text-sm">
                  ₹{safeOutwardValuation.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Barter Settlement Summary */}
      <div className="border-2 border-slate-900 rounded p-4 mb-4 bg-slate-50">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {isMarathi ? 'निव्वळ देवाणघेवाण हिशोब (Settlement)' : 'Net Barter Settlement'}
            </div>
            <div className="font-serif text-lg font-black text-slate-900">
              {isCustomerRefund 
                ? (isMarathi 
                    ? `ग्राहकास परत द्यायची रक्कम: ₹${absSettlement.toLocaleString('en-IN')}` 
                    : `REFUND DUE TO CUSTOMER: ₹${absSettlement.toLocaleString('en-IN')}`)
                : (isCustomerPayable 
                    ? (isMarathi 
                        ? `ग्राहकाकडून येणे बाकी रक्कम: ₹${absSettlement.toLocaleString('en-IN')}` 
                        : `NET PAYABLE BY CUSTOMER: ₹${absSettlement.toLocaleString('en-IN')}`)
                    : (isMarathi 
                        ? `संतुलित व्यवहार (शून्य बाकी)` 
                        : `BALANCED TRADE (NIL BALANCE)`)
                  )
              }
            </div>
            <div className="text-[10px] text-slate-600 font-mono mt-0.5">
              {hasValidMetalDiff ? (
                isMarathi ? (
                  <>निव्वळ शुद्ध {formatMetal(inwardMetal)} फरक: <strong>{safeDiff.toFixed(3)}g</strong> ({isCustomerRefund ? 'शिल्लक धातू ग्राहकास जमा' : (isCustomerPayable ? 'अतिरिक्त धातू ग्राहकास नावे' : 'संतुलित देवाणघेवाण')})</>
                ) : (
                  <>Net pure {inwardMetal} difference: <strong>{safeDiff.toFixed(3)}g</strong> ({isCustomerRefund ? 'Surplus metal credited' : (isCustomerPayable ? 'Additional metal debited' : 'Balanced trade')})</>
                )
              ) : (
                isMarathi ? (
                  <>{formatMetal(inwardMetal)} ({inwardKarat}) च्या बदल्यात {formatMetal(outwardMetal)} ({outwardKarat})</>
                ) : (
                  <>Exchange of {inwardMetal} ({inwardKarat}) for {outwardMetal} ({outwardKarat})</>
                )
              )}
            </div>
          </div>

          <div className="text-right">
            <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
              isCustomerRefund 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : (isCustomerPayable 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-slate-100 text-slate-700 border border-slate-300')
            }`}>
              {isCustomerRefund 
                ? (isMarathi ? 'ग्राहकास परतावा (Refund)' : 'Showroom Payable (Refund)') 
                : (isCustomerPayable 
                    ? (isMarathi ? 'ग्राहकाकडून येणे (Payable)' : 'Customer Payable') 
                    : (isMarathi ? 'शून्य बाकी' : 'Nil Balance'))}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-serif font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2">
          {isMarathi ? 'अक्षरी रक्कम:' : 'Amount in Words:'} {numberToIndianWords(absSettlement, isMarathi ? 'mr' : 'en')}
        </div>
      </div>

      {/* Legal Declaration */}
      <div className="p-3 border border-slate-300 rounded bg-slate-50/50 text-[10px] text-slate-600 mb-6 space-y-1">
        <div className="font-bold text-slate-800 uppercase">
          {isMarathi ? 'ग्राहकाचे स्वामित्त्व व संमती घोषणापत्र:' : 'Customer Declaration of Title & Consent:'}
        </div>
        <p className="leading-tight">
          {isMarathi
            ? `"मी याद्वारे घोषित करतो/करते की शोरूममध्ये दिलेले जुने दागिने/वस्तू कायदेशीररीत्या माझ्या मालकीचे असून त्यावर कोणताही बोजा किंवा वाद नाही. मी ${showroom.name} ला हे दागिने तपासण्यास, चाचणी करण्यास व वितळवण्यास संमती देत आहे. मी डिजिटल काट्यावरील वजन प्रत्यक्ष पाहिले असून खडे व कचरा वजावट, गाळणी घट आणि वरीलप्रमाणे केलेले अंतिम मूल्यांकन मला पूर्णपणे मान्य आहे."`
            : `"I hereby declare that the old precious metal ornaments/articles delivered to the showroom belong to me by legal right and free from all encumbrances. I authorize ${showroom.name} to test, assay, and melt the metal. I have physically witnessed the digital weighing scale readings and accepted the stone deduction, melting loss percentage, and net valuation as recorded above."`
          }
        </p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-4 text-[10px]">
        <div className="text-center">
          <div className="border-b border-slate-400 w-48 mx-auto mb-1 h-8" />
          <div className="font-bold text-slate-800">
            {isMarathi ? 'ग्राहकाची सही' : "Customer's Signature"}
          </div>
          <div className="text-slate-500 text-[9px]">
            {isMarathi ? '(घोषणापत्र मान्य)' : '(Declaration Confirmed)'}
          </div>
        </div>

        <div className="text-center">
          <div className="border-b border-slate-400 w-48 mx-auto mb-1 h-8 flex items-end justify-center font-serif text-[10px] text-slate-600">
            {isMarathi ? `${showroom.name} करिता` : `For ${showroom.name}`}
          </div>
          <div className="font-bold text-slate-900">
            {isMarathi ? 'अधिकृत स्वाक्षरी व शिक्का' : 'Authorised Signatory & Seal'}
          </div>
          <div className="text-slate-500 text-[9px]">
            {isMarathi ? 'तपासणी अधिकारी' : 'Verified Assayer'}
          </div>
        </div>
      </div>

    </div>
  );
}
