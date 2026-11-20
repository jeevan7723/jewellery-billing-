import React from 'react';
import { numberToIndianWords } from '../../utils/numberToWords';
import { useJewellery } from '../../context/JewelleryContext';

export default function TaxInvoiceTemplate({ invoice, showroom: rawShowroom, format = 'a4' }) {
  if (!invoice) return null;

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
    name: 'KaratCraft Fine Jewellers',
    tagline: isMarathi ? 'प्रमाणित उच्च दर्जाचे दागिने आणि बुलियन व्यापारी' : 'Certified High Jewellery & Bullion Merchants',
    address: 'Plot 42, Gold Souk, Zaveri Bazaar, Mumbai 400002',
    phone: '+91 98200 12345',
    gstin: '27AADCB2230M1Z2',
    ...(rawShowroom || {})
  };

  const items = invoice.items || [];
  const subtotal = invoice.subtotal || 0;
  const gstAmount = invoice.gst3Percent || Math.round(subtotal * 0.03);
  const cgstAmount = Math.round(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;
  const grandTotal = invoice.grandTotal || (subtotal + gstAmount);
  const invoiceDate = invoice.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceNo = invoice.invoiceNo || 'KC-BILL-8801';
  const paymentMode = invoice.paymentMode || (isMarathi ? 'रोख / UPI' : 'Cash / UPI');
  const oldGoldCredit = Number(invoice.exchangeCredit || invoice.inwardValuation || invoice.purchasedGoldValue || invoice.purchasedGoldCombinedValue || 0);
  const inwardWeight = Number(invoice.inwardGrossWeight || invoice.inwardNetWeight || invoice.purchasedGoldGrossWeight || invoice.purchasedGoldNetWeight || 0);
  const inwardMetal = invoice.inwardMetal || invoice.purchasedGoldMetal || 'Gold';
  const inwardKarat = invoice.inwardKarat || invoice.purchasedGoldKarat || '22K';
  const inwardRate = Number(invoice.inwardRate || invoice.purchasedGoldRate || (inwardWeight > 0 && oldGoldCredit > 0 ? Math.round(oldGoldCredit / inwardWeight) : 0));

  const formatMetal = (m) => {
    if (!isMarathi) return m;
    if (m === 'Gold') return 'सोने';
    if (m === 'Silver') return 'चांदी';
    return m;
  };

  // ================= THERMAL RECEIPT FORMAT (80mm) =================
  if (format === 'thermal') {
    return (
      <div className="bg-white text-black font-mono p-4 text-[11px] leading-tight max-w-[80mm] mx-auto border border-dashed border-gray-300">
        <div className="text-center pb-2 border-b border-dashed border-black">
          <h2 className="font-bold text-sm uppercase">{showroom.name}</h2>
          <p className="text-[10px]">{showroom.address}</p>
          <p className="text-[10px]">{isMarathi ? 'फोन:' : 'Ph:'} {showroom.phone}</p>
          <p className="text-[10px] font-bold">{isMarathi ? 'जीएसटी:' : 'GSTIN:'} {showroom.gstin}</p>
          <p className="text-[9px] uppercase tracking-wider mt-1 font-bold">
            {isMarathi ? '** रिटेल टॅक्स इनव्हॉइस (कर बीजक) **' : '** RETAIL TAX INVOICE **'}
          </p>
        </div>

        <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>{isMarathi ? 'बिल क्र:' : 'Bill No:'} <strong>{invoiceNo}</strong></span>
            <span>{isMarathi ? 'दिनांक:' : 'Date:'} {invoiceDate}</span>
          </div>
          <div>{isMarathi ? 'ग्राहक:' : 'Customer:'} <strong>{invoice.customerName || (isMarathi ? 'किरकोळ ग्राहक' : 'Walk-in Customer')}</strong></div>
          {invoice.phone && <div>{isMarathi ? 'मोबाईल:' : 'Mobile:'} {invoice.phone}</div>}
          <div>{isMarathi ? 'पेमेंट पद्धत:' : 'Payment:'} {paymentMode}</div>
        </div>

        <div className="py-2 border-b border-dashed border-black">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1">{isMarathi ? 'वस्तू / कॅरेट' : 'Item / Karat'}</th>
                <th className="py-1 text-right">{isMarathi ? 'निव्वळ वजन' : 'Net Wt'}</th>
                <th className="py-1 text-right">{isMarathi ? 'रक्कम' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">
                    <div>{item.name}</div>
                    <div className="text-[9px] text-gray-700">
                      {item.karat || '22K 916'} {item.rate ? `• ${isMarathi ? 'दर:' : 'Rate:'} ₹${Number(item.rate).toLocaleString('en-IN')}/g` : ''}
                    </div>
                  </td>
                  <td className="py-1 text-right font-bold">
                    {(item.netWeight || 0).toFixed(3)}g
                  </td>
                  <td className="py-1 text-right font-bold">
                    ₹{(item.total || item.metalValue || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span>{isMarathi ? 'करपात्र उपएकूण:' : 'Taxable Subtotal:'}</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>{isMarathi ? 'CGST (१.५%):' : 'CGST (1.5%):'}</span>
            <span>₹{cgstAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>{isMarathi ? 'SGST (१.५%):' : 'SGST (1.5%):'}</span>
            <span>₹{sgstAmount.toLocaleString('en-IN')}</span>
          </div>
          {/* SEPARATE PURCHASED GOLD TOTAL PRICE LINE IN THERMAL */}
          {oldGoldCredit > 0 ? (
            <div className="flex justify-between font-bold text-gray-900 border-t border-dashed border-gray-400 pt-1">
              <div>
                <span>{isMarathi ? 'वजा: खरेदी सोने एकूण किंमत' : 'Less: Purchased Gold Total'}:</span>
                {inwardWeight > 0 && (
                  <span className="block text-[8px] font-normal text-gray-600">
                    ({inwardWeight.toFixed(3)}g @ ₹{inwardRate}/g)
                  </span>
                )}
              </div>
              <span className="font-bold">-₹{oldGoldCredit.toLocaleString('en-IN')}</span>
            </div>
          ) : (
            <div className="flex justify-between text-gray-500 text-[9px] border-t border-dashed border-gray-300 pt-0.5">
              <span>{isMarathi ? 'खरेदी सोने एकूण किंमत:' : 'Purchased Gold Total:'}</span>
              <span>₹0</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-bold pt-1 border-t border-black">
            <span>{isMarathi ? 'एकूण देय रक्कम:' : 'NET PAYABLE:'}</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="py-2 border-b border-dashed border-black text-[9px]">
          <div className="font-bold">{isMarathi ? 'अक्षरी रक्कम:' : 'Amount in Words:'}</div>
          <div>{numberToIndianWords(grandTotal, isMarathi ? 'mr' : 'en')}</div>
        </div>

        <div className="pt-3 text-center text-[9px] space-y-1">
          <p className="font-bold">
            {isMarathi ? '१००% बीआयएस (BIS) हॉलमार्क प्रमाणित दागिने' : '100% Certified BIS Hallmarked Jewellery'}
          </p>
          <p>{isMarathi ? 'आपल्या खरेदीबद्दल मनःपूर्वक धन्यवाद!' : 'Thank you for shopping with us!'}</p>
          <p className="text-[8px] text-gray-500">{isMarathi ? 'पुन्हा भेट द्या' : 'Visit Again'}</p>
          <div className="barcode-stripes h-6 w-36 mx-auto invert mt-2" />
          <div className="text-[8px] font-bold">*{invoiceNo}*</div>
        </div>
      </div>
    );
  }

  // ================= A4 FORMAL TAX INVOICE FORMAT =================
  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-10 max-w-[210mm] mx-auto text-xs leading-relaxed border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
      
      {/* Top Header / Letterhead */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
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
          <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-600 mt-1 font-mono">
            <span>{isMarathi ? 'फोन:' : 'Phone:'} <strong>{showroom.phone}</strong></span>
            {showroom.email && <span>{isMarathi ? 'ईमेल:' : 'Email:'} <strong>{showroom.email}</strong></span>}
          </div>
        </div>

        <div className="text-right space-y-1">
          <div 
            className="inline-block bg-slate-900 text-white keep-white font-mono font-bold text-xs px-3 py-1 uppercase tracking-wider rounded"
            style={{ color: '#ffffff' }}
          >
            {isMarathi ? 'टॅक्स इनव्हॉइस (कर बीजक)' : 'TAX INVOICE'}
          </div>
          <div className="text-slate-600 text-[10px] font-mono">
            {isMarathi ? '(CGST नियम २०१७ च्या नियम ४६ अंतर्गत)' : '(Under Rule 46 of CGST Rules, 2017)'}
          </div>
          <div className="font-mono text-xs pt-1">
            <span className="text-slate-500">{isMarathi ? 'जीएसटी:' : 'GSTIN:'}</span> <strong>{showroom.gstin}</strong>
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            {isMarathi ? 'राज्य:' : 'State:'} <strong>{isMarathi ? 'महाराष्ट्र (२७)' : 'Maharashtra (27)'}</strong> • HSN: <strong>7113</strong>
          </div>
        </div>
      </div>

      {/* Invoice Meta and Customer Information Box */}
      <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 mb-4 bg-slate-50/50 text-[11px]">
        
        {/* Left: Invoice Particulars */}
        <div className="space-y-1 border-r border-slate-300 pr-3">
          <div className="flex justify-between">
            <span className="text-slate-500 font-mono">
              {isMarathi ? 'इनव्हॉइस क्रमांक:' : 'Invoice Number:'}
            </span>
            <span className="font-mono font-bold text-slate-900">{invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-mono">
              {isMarathi ? 'इनव्हॉइस दिनांक:' : 'Invoice Date:'}
            </span>
            <span className="font-mono font-bold">{invoiceDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-mono">
              {isMarathi ? 'पुरवठा ठिकाण:' : 'Place of Supply:'}
            </span>
            <span className="font-medium">{isMarathi ? 'मुंबई, महाराष्ट्र (२७)' : 'Mumbai, Maharashtra (27)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-mono">
              {isMarathi ? 'पेमेंट पद्धत:' : 'Payment Mode:'}
            </span>
            <span className="font-bold text-slate-800">{paymentMode}</span>
          </div>
        </div>

        {/* Right: Billed To Customer */}
        <div className="space-y-1 pl-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            {isMarathi ? 'बिल धारक (ग्राहकाचा तपशील):' : 'Billed To (Customer Details):'}
          </div>
          <div className="font-bold text-sm text-slate-900">
            {invoice.customerName || (isMarathi ? 'किरकोळ ग्राहक' : 'Walk-in Customer')}
          </div>
          <div className="text-slate-700">
            {isMarathi ? 'संपर्क:' : 'Contact:'} {invoice.phone || '—'}
          </div>
          <div className="text-slate-600 text-[10px]">
            {isMarathi ? 'पत्ता / शहर:' : 'Address / City:'} {invoice.city || '—'}
          </div>
        </div>

      </div>

      {/* Line Items Table */}
      <div className="border border-slate-300 rounded overflow-hidden mb-4">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr 
              className="bg-slate-900 text-white keep-white font-mono text-[10px] uppercase tracking-wider"
              style={{ color: '#ffffff' }}
            >
              <th className="py-2 px-2.5 text-center w-8">#</th>
              <th className="py-2 px-3">{isMarathi ? 'दागिन्यांचे नाव / तपशील' : 'Description of Jewellery'}</th>
              <th className="py-2 px-2 text-center">HSN</th>
              <th className="py-2 px-2 text-center">{isMarathi ? 'कॅरेट' : 'Purity'}</th>
              <th className="py-2 px-2.5 text-right">{isMarathi ? 'एकूण वजन' : 'Gross Wt'}</th>
              <th className="py-2 px-2.5 text-right">{isMarathi ? 'खड्यांचे वजन' : 'Stone Wt'}</th>
              <th className="py-2 px-2.5 text-right">{isMarathi ? 'निव्वळ वजन' : 'Net Wt'}</th>
              <th className="py-2 px-2.5 text-right">{isMarathi ? 'दर (₹/g)' : 'Gold Rate (₹/g)'}</th>
              <th className="py-2 px-2.5 text-right">{isMarathi ? 'घडणावळ (₹)' : 'Making (₹)'}</th>
              <th className="py-2 px-3 text-right">{isMarathi ? 'एकूण रक्कम (₹)' : 'Total (₹)'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const gross = item.grossWeight || 0;
              const stone = item.stoneWeight || 0;
              const net = item.netWeight || Math.max(0, gross - stone);
              const rate = item.rate || 0;
              const making = item.makingTotal || item.makingCharge || 0;
              const total = item.total || Math.round(net * rate + making);

              return (
                <tr key={idx} className="hover:bg-slate-50 font-mono">
                  <td className="py-2 px-2.5 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900">
                    <div>{item.name}</div>
                    {item.hallmarkNo && (
                      <div className="text-[9px] font-mono text-slate-500">
                        BIS HUID: {item.hallmarkNo}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600">7113</td>
                  <td className="py-2 px-2 text-center font-bold text-slate-800">
                    {item.karat || '22K (916)'}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-700">{gross.toFixed(3)}g</td>
                  <td className="py-2 px-2.5 text-right text-slate-500">{stone.toFixed(3)}g</td>
                  <td className="py-2 px-2.5 text-right font-bold text-slate-900">{net.toFixed(3)}g</td>
                  <td className="py-2 px-2.5 text-right text-slate-700">₹{rate.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-2.5 text-right text-slate-700">₹{making.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    ₹{total.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary: Words, BIS Hallmarking Notice & Calculation Box */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        
        {/* Left (7 cols): Amount in words, Hallmarking & Terms */}
        <div className="col-span-7 space-y-3">
          <div className="p-2.5 border border-slate-200 rounded bg-slate-50 text-[11px]">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              {isMarathi ? 'अक्षरी इनव्हॉइस रक्कम:' : 'Invoice Amount in Words:'}
            </span>
            <span className="font-serif font-bold text-slate-900">
              {numberToIndianWords(grandTotal, isMarathi ? 'mr' : 'en')}
            </span>
          </div>

          {/* DEDICATED SEPARATE PURCHASED GOLD TOTAL PRICE CALLOUT */}
          {oldGoldCredit > 0 && (
            <div className="p-2.5 border-2 border-amber-400 rounded-lg bg-amber-50 text-[11px] flex justify-between items-center shadow-sm">
              <div>
                <span className="text-[10px] font-mono uppercase font-black text-amber-900 block flex items-center gap-1">
                  <span>★</span> {isMarathi ? 'खरेदी जुन्या सोन्याची एकूण किंमत (क्रेडिट):' : 'PURCHASED OLD GOLD TOTAL PRICE (CREDIT):'}
                </span>
                <span className="text-slate-700 text-[10px] font-mono">
                  {inwardWeight.toFixed(3)}g {formatMetal(inwardMetal)} ({inwardKarat}) @ ₹{inwardRate.toLocaleString('en-IN')}/g
                </span>
              </div>
              <span className="font-serif font-black text-base text-amber-950">
                ₹{oldGoldCredit.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className="p-2.5 border border-amber-300 rounded bg-amber-50/60 text-[10px] text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <span>★</span> {isMarathi ? 'बीआयएस (BIS) हॉलमार्किंग शुद्धता व अस्सलतेची हमी' : 'BIS HALLMARKING COMPLIANCE & AUTHENTICITY ASSURANCE'}
            </div>
            <p className="leading-normal">
              {isMarathi
                ? 'या कर बीजकाद्वारे (Tax Invoice) विक्री केलेल्या प्रत्येक हॉलमार्क दागिन्यावर भारतीय मानक ब्युरो (BIS) चे अधिकृत चिन्ह, शुद्धता ग्रेड (उदा. 22K916 / 18K750) आणि अधिकृत हॉलमार्किंग केंद्राचा ६ अंकी HUID क्रमांक कोरलेला आहे.'
                : 'Every hallmarked gold article sold under this tax invoice bears the official Bureau of Indian Standards (BIS) hallmark mark, purity grade (e.g. 22K916 / 18K750), and unique 6-digit alphanumeric HUID stamped by an authorized Assaying & Hallmarking Centre.'
              }
            </p>
          </div>

          <div className="text-[9px] text-slate-500 space-y-0.5 leading-tight">
            <p className="font-bold text-slate-700 uppercase">
              {isMarathi ? 'विक्रीच्या अटी व शर्ती:' : 'Terms & Conditions of Sale:'}
            </p>
            {isMarathi ? (
              <>
                <p>१. विकलेला माल परत अथवा बदलून घेताना त्या दिवशीच्या चालू बाजार भावानुसार हिशोब केला जाईल.</p>
                <p>२. दागिन्यांचे एकूण आणि निव्वळ वजन ग्राहकांसमक्ष प्रमाणित डिजिटल काट्यावर तपासून दिले आहे.</p>
                <p>३. धातुच्या मूल्यांकनातून खडे व मीनाकाम यांचे वजन पूर्णपणे वजा केले आहे.</p>
                <p>४. सर्व वाद स्थानिक न्यायालयाच्या अधिकार कक्षेत राहतील.</p>
              </>
            ) : (
              <>
                <p>1. Goods once sold will be exchanged or bought back strictly as per prevailing market bullion rate on the date of return.</p>
                <p>2. Gross scale weight and net pure metal weight were verified on certified digital scale in customer's presence.</p>
                <p>3. Stone and enamel weight deducted in full for bullion valuation.</p>
                <p>4. All disputes are subject to local showroom territorial jurisdiction.</p>
              </>
            )}
          </div>
        </div>

        {/* Right (5 cols): Tax Totals and Calculations */}
        <div className="col-span-5 border border-slate-300 rounded overflow-hidden">
          <table className="w-full text-left font-mono text-[11px]">
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="py-1.5 px-3 text-slate-600">
                  {isMarathi ? 'करपात्र उपएकूण:' : 'Taxable Subtotal:'}
                </td>
                <td className="py-1.5 px-3 text-right font-bold">₹{subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 px-3 text-slate-600">
                  {isMarathi ? 'हॉलमार्किंग शुल्क (BIS):' : 'Hallmarking Fee (BIS):'}
                </td>
                <td className="py-1.5 px-3 text-right font-medium">₹45.00</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 px-3 text-slate-600">
                  {isMarathi ? 'CGST @ १.५%:' : 'CGST @ 1.5%:'}
                </td>
                <td className="py-1.5 px-3 text-right font-medium">₹{cgstAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 px-3 text-slate-600">
                  {isMarathi ? 'SGST @ १.५%:' : 'SGST @ 1.5%:'}
                </td>
                <td className="py-1.5 px-3 text-right font-medium">₹{sgstAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-100">
                <td className="py-1.5 px-3 text-slate-700 font-bold">
                  {isMarathi ? 'एकूण जीएसटी (३%):' : 'Total GST (3%):'}
                </td>
                <td className="py-1.5 px-3 text-right font-bold text-slate-900">₹{gstAmount.toLocaleString('en-IN')}</td>
              </tr>
              {/* SEPARATE PROMINENT ROW FOR PURCHASED GOLD TOTAL PRICE */}
              {oldGoldCredit > 0 ? (
                <tr className="border-b-2 border-amber-400 bg-amber-100/80 text-amber-950 font-bold">
                  <td className="py-2 px-3">
                    <span className="block font-bold">
                      {isMarathi ? 'वजा: खरेदी जुन्या सोन्याची एकूण किंमत:' : 'Less: Purchased Gold Total Price:'}
                    </span>
                    {inwardRate > 0 && (
                      <span className="block text-[9px] text-amber-800 font-normal">
                        ({inwardWeight.toFixed(3)}g {formatMetal(inwardMetal)} {inwardKarat} @ ₹{inwardRate.toLocaleString('en-IN')}/g)
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-serif font-bold text-amber-950 text-sm">
                    -₹{oldGoldCredit.toLocaleString('en-IN')}
                  </td>
                </tr>
              ) : (
                <tr className="border-b border-slate-200 bg-amber-50/40 text-slate-700">
                  <td className="py-1.5 px-3 font-semibold text-[10px]">
                    {isMarathi ? 'खरेदी जुन्या सोन्याची एकूण किंमत:' : 'Purchased Gold Total Price:'}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-700 text-[10px]">
                    ₹0
                  </td>
                </tr>
              )}
              <tr 
                className="bg-slate-900 text-white keep-white"
                style={{ color: '#ffffff' }}
              >
                <td className="py-2.5 px-3 font-serif font-bold text-sm uppercase">
                  {isMarathi ? 'अंतिम देय रक्कम:' : 'Grand Total:'}
                </td>
                <td className="py-2.5 px-3 text-right font-serif font-bold text-base">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 mt-6 text-[10px]">
        <div className="text-center">
          <div className="border-b border-slate-400 w-48 mx-auto mb-1 h-8" />
          <div className="font-bold text-slate-800">
            {isMarathi ? 'ग्राहकाची सही' : "Customer's Signature"}
          </div>
          <div className="text-slate-500 text-[9px]">
            {isMarathi ? '(वजन, दर आणि अटी मला मान्य आहेत)' : '(I accept the weights, rates & terms)'}
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
            {isMarathi ? 'भूलचूक घेणे देणे (E. & O.E.)' : 'E. & O.E.'}
          </div>
        </div>
      </div>

    </div>
  );
}
