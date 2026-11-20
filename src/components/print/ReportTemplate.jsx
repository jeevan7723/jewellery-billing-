import React from 'react';
import { useJewellery } from '../../context/JewelleryContext';

export default function ReportTemplate({ reportType, data, showroom: rawShowroom }) {
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

  const dateStr = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  const timeStr = new Date().toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getReportTitle = () => {
    if (isMarathi) {
      switch (reportType) {
        case 'sales': return 'जीएसटी विक्री नोंदवही व ग्राहक इनव्हॉइस स्टेटमेंट';
        case 'inventory': return 'शोरूम तिजोरी शिल्लक स्टॉक व मूल्यांकन स्टेटमेंट';
        case 'karagir': return 'कारागीर सोने ताबा व शिल्लक हिशोब स्टेटमेंट';
        case 'refinery': return 'रिफायनरी जुने सोने गाळणी, चाचणी व शुद्ध सोने पुनर्प्राप्ती नोंद';
        default: return 'दागिने शोरूम ऑडिट अहवाल';
      }
    }
    switch (reportType) {
      case 'sales': return 'GST Sales Register & Customer Invoices Statement';
      case 'inventory': return 'Showroom Vault Stock & Inventory Valuation Statement';
      case 'karagir': return 'Artisan (Karagir) Metal Custody & Balance Statement';
      case 'refinery': return 'Refinery Scrap Melting, Assay & Pure Gold Recovery Log';
      default: return 'Jewellery Showroom Audit Report';
    }
  };

  const { invoices = [], inventory = [], karagirs = [], refineryBatches = [] } = data;

  const totalSalesVal = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalGstVal = invoices.reduce((s, i) => s + (i.gst3Percent || 0), 0);
  const totalStockNet = inventory.reduce((s, i) => s + (i.netWeight || 0), 0);
  const totalStockGross = inventory.reduce((s, i) => s + (i.grossWeight || 0), 0);
  const totalKaragirMetal = karagirs.reduce((s, k) => s + (k.balanceMetal || 0), 0);
  const totalRefineryGold = refineryBatches.reduce((s, b) => s + (b.fineGoldRecovered || 0), 0);

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-10 max-w-[210mm] mx-auto text-xs leading-relaxed border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
      
      {/* Letterhead */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
        <div>
          <h1 className="font-serif text-2xl font-black tracking-wide text-slate-900 uppercase">
            {showroom.name}
          </h1>
          <p className="text-xs text-slate-600 font-serif italic mt-0.5">
            {showroom.tagline}
          </p>
          <p className="text-[11px] text-slate-700 mt-1 max-w-md">
            {showroom.address}
          </p>
          <div className="text-[10px] text-slate-600 mt-1 font-mono">
            {isMarathi ? 'जीएसटी:' : 'GSTIN:'} <strong>{showroom.gstin}</strong> • {isMarathi ? 'फोन:' : 'Phone:'} <strong>{showroom.phone}</strong>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div 
            className="inline-block bg-slate-900 text-white keep-white font-mono font-bold text-xs px-3 py-1 uppercase tracking-wider rounded"
            style={{ color: '#ffffff' }}
          >
            {isMarathi ? 'ऑडिट स्टेटमेंट' : 'AUDIT STATEMENT'}
          </div>
          <div className="font-mono text-xs pt-1 font-bold text-slate-900">
            {isMarathi ? 'तयार केले:' : 'Generated:'} {dateStr}
          </div>
          <div className="font-mono text-[10px] text-slate-500">
            {isMarathi ? 'वेळ:' : 'Time:'} {timeStr}
          </div>
        </div>
      </div>

      {/* Statement Header */}
      <div className="p-3 bg-slate-50 border border-slate-300 rounded mb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-500 block">
            {isMarathi ? 'स्टेटमेंट प्रकार:' : 'Statement Type:'}
          </span>
          <span className="font-serif font-bold text-sm text-slate-900">{getReportTitle()}</span>
        </div>
        <div className="text-right font-mono text-[11px]">
          <span className="text-slate-500">{isMarathi ? 'एकूण नोंदी:' : 'Total Records:'} </span>
          <strong className="text-slate-900">
            {reportType === 'sales' && `${invoices.length} ${isMarathi ? 'बिले' : 'Invoices'}`}
            {reportType === 'inventory' && `${inventory.length} ${isMarathi ? 'दागिने' : 'Stock Pieces'}`}
            {reportType === 'karagir' && `${karagirs.length} ${isMarathi ? 'कारागीर' : 'Artisans'}`}
            {reportType === 'refinery' && `${refineryBatches.length} ${isMarathi ? 'बॅचेस' : 'Melts'}`}
          </strong>
        </div>
      </div>

      {/* KPI Cards Box */}
      <div className="grid grid-cols-4 gap-3 mb-4 font-mono text-[11px]">
        <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
          <div className="text-[9px] uppercase text-slate-500">
            {isMarathi ? 'एकूण विक्री मूल्य' : 'Total Sales Value'}
          </div>
          <div className="font-bold text-sm text-slate-900">₹{totalSalesVal.toLocaleString('en-IN')}</div>
        </div>
        <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
          <div className="text-[9px] uppercase text-slate-500">
            {isMarathi ? 'एकूण जीएसटी (३%)' : 'Total GST (3%)'}
          </div>
          <div className="font-bold text-sm text-amber-900">₹{totalGstVal.toLocaleString('en-IN')}</div>
        </div>
        <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
          <div className="text-[9px] uppercase text-slate-500">
            {isMarathi ? 'निव्वळ स्टॉक वजन' : 'Net Stock Weight'}
          </div>
          <div className="font-bold text-sm text-slate-900">{totalStockNet.toFixed(3)}g</div>
        </div>
        <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
          <div className="text-[9px] uppercase text-slate-500">
            {isMarathi ? 'कारागिरांकडील सोने' : 'Karagir Gold Holding'}
          </div>
          <div className="font-bold text-sm text-purple-900">{totalKaragirMetal.toFixed(3)}g</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-slate-300 rounded overflow-hidden mb-6">
        {reportType === 'sales' && (
          <table className="w-full text-left font-mono text-[10px] border-collapse">
            <thead>
              <tr 
                className="bg-slate-900 text-white keep-white uppercase text-[9px]"
                style={{ color: '#ffffff' }}
              >
                <th className="py-2 px-2 text-center">#</th>
                <th className="py-2 px-2.5">{isMarathi ? 'इनव्हॉइस क्र' : 'Invoice No'}</th>
                <th className="py-2 px-2.5">{isMarathi ? 'दिनांक' : 'Date'}</th>
                <th className="py-2 px-3">{isMarathi ? 'ग्राहकाचे नाव' : 'Customer Name'}</th>
                <th className="py-2 px-2">{isMarathi ? 'पेमेंट' : 'Payment'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'करपात्र रक्कम' : 'Taxable Subtotal'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'जीएसटी (३%)' : 'GST (3%)'}</th>
                <th className="py-2 px-3 text-right">{isMarathi ? 'एकूण रक्कम (₹)' : 'Grand Total (₹)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 font-bold text-slate-900">{inv.invoiceNo}</td>
                  <td className="py-1.5 px-2.5 text-slate-600">{inv.date}</td>
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-900">{inv.customerName}</td>
                  <td className="py-1.5 px-2 text-slate-600">{inv.paymentMode}</td>
                  <td className="py-1.5 px-2.5 text-right">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                  <td className="py-1.5 px-2.5 text-right text-amber-800">₹{inv.gst3Percent.toLocaleString('en-IN')}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                    ₹{inv.grandTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[11px]">
                <td colSpan={5} className="py-2 px-3 text-right uppercase">
                  {isMarathi ? 'एकूण गोषवारा:' : 'Consolidated Totals:'}
                </td>
                <td className="py-2 px-2.5 text-right">
                  ₹{invoices.reduce((s, i) => s + i.subtotal, 0).toLocaleString('en-IN')}
                </td>
                <td className="py-2 px-2.5 text-right text-amber-900">
                  ₹{totalGstVal.toLocaleString('en-IN')}
                </td>
                <td className="py-2 px-3 text-right text-sm text-slate-900">
                  ₹{totalSalesVal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {reportType === 'inventory' && (
          <table className="w-full text-left font-mono text-[10px] border-collapse">
            <thead>
              <tr 
                className="bg-slate-900 text-white keep-white uppercase text-[9px]"
                style={{ color: '#ffffff' }}
              >
                <th className="py-2 px-2 text-center">#</th>
                <th className="py-2 px-2.5">{isMarathi ? 'टॅग / बारकोड' : 'Tag / Barcode'}</th>
                <th className="py-2 px-3">{isMarathi ? 'दागिन्यांचे वर्णन' : 'Jewellery Description'}</th>
                <th className="py-2 px-2">{isMarathi ? 'प्रकार' : 'Category'}</th>
                <th className="py-2 px-2 text-center">{isMarathi ? 'कॅरेट' : 'Karat'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'एकूण वजन' : 'Gross Wt'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'खड्यांचे वजन' : 'Stone Wt'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'निव्वळ वजन' : 'Net Wt'}</th>
                <th className="py-2 px-2.5 text-center">{isMarathi ? 'HUID / स्थिती' : 'HUID / Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {inventory.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 font-bold text-slate-900">{item.barcode}</td>
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-900">{item.name}</td>
                  <td className="py-1.5 px-2 text-slate-600">{item.category}</td>
                  <td className="py-1.5 px-2 text-center font-bold">{item.karat}</td>
                  <td className="py-1.5 px-2.5 text-right">{item.grossWeight.toFixed(3)}g</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-500">{item.stoneWeight.toFixed(3)}g</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">{item.netWeight.toFixed(3)}g</td>
                  <td className="py-1.5 px-2.5 text-center text-[9px] text-slate-600">{item.status}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[11px]">
                <td colSpan={5} className="py-2 px-3 text-right uppercase">
                  {isMarathi ? 'एकूण तिजोरी वजन:' : 'Total Vault Weight:'}
                </td>
                <td className="py-2 px-2.5 text-right">{totalStockGross.toFixed(3)}g</td>
                <td className="py-2 px-2.5 text-right text-slate-500">
                  {(totalStockGross - totalStockNet).toFixed(3)}g
                </td>
                <td className="py-2 px-2.5 text-right text-slate-900 font-black">{totalStockNet.toFixed(3)}g</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}

        {reportType === 'karagir' && (
          <table className="w-full text-left font-mono text-[10px] border-collapse">
            <thead>
              <tr 
                className="bg-slate-900 text-white keep-white uppercase text-[9px]"
                style={{ color: '#ffffff' }}
              >
                <th className="py-2 px-2 text-center">#</th>
                <th className="py-2 px-2.5">{isMarathi ? 'कारागीर आयडी' : 'Karagir ID'}</th>
                <th className="py-2 px-3">{isMarathi ? 'कारागिराचे नाव' : 'Artisan Name'}</th>
                <th className="py-2 px-2.5">{isMarathi ? 'कौशल्य' : 'Speciality'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'दिलेले सोने' : 'Metal Issued'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'तयार काम' : 'Finished Work'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'गाळणी स्क्रॅप' : 'Scrap Received'}</th>
                <th className="py-2 px-3 text-right">{isMarathi ? 'शिल्लक ताबा' : 'Balance Holding'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {karagirs.map((k, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 font-bold text-slate-900">{k.id}</td>
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-900">{k.name}</td>
                  <td className="py-1.5 px-2.5 text-slate-600">{k.speciality}</td>
                  <td className="py-1.5 px-2.5 text-right">{k.metalIssued.toFixed(3)}g</td>
                  <td className="py-1.5 px-2.5 text-right font-medium text-emerald-800">{k.metalReturned.toFixed(3)}g</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-600">{k.meltingScrap.toFixed(3)}g</td>
                  <td className="py-1.5 px-3 text-right font-bold text-amber-900">
                    {k.balanceMetal.toFixed(3)}g
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[11px]">
                <td colSpan={4} className="py-2 px-3 text-right uppercase">
                  {isMarathi ? 'एकूण कारागीर सोने ताबा:' : 'Total Karagir Metal Holding:'}
                </td>
                <td className="py-2 px-2.5 text-right">
                  {karagirs.reduce((s, k) => s + k.metalIssued, 0).toFixed(3)}g
                </td>
                <td className="py-2 px-2.5 text-right text-emerald-800">
                  {karagirs.reduce((s, k) => s + k.metalReturned, 0).toFixed(3)}g
                </td>
                <td className="py-2 px-2.5 text-right text-slate-600">
                  {karagirs.reduce((s, k) => s + k.meltingScrap, 0).toFixed(3)}g
                </td>
                <td className="py-2 px-3 text-right font-black text-amber-900">
                  {totalKaragirMetal.toFixed(3)}g
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {reportType === 'refinery' && (
          <table className="w-full text-left font-mono text-[10px] border-collapse">
            <thead>
              <tr 
                className="bg-slate-900 text-white keep-white uppercase text-[9px]"
                style={{ color: '#ffffff' }}
              >
                <th className="py-2 px-2 text-center">#</th>
                <th className="py-2 px-2.5">{isMarathi ? 'बॅच आयडी' : 'Batch ID'}</th>
                <th className="py-2 px-2.5">{isMarathi ? 'दिनांक' : 'Date'}</th>
                <th className="py-2 px-3">{isMarathi ? 'रिफायनरीचे नाव' : 'Refinery Name'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'पाठवलेले वजन' : 'Sent Weight'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'गाळणीनंतर वजन' : 'Post-Melt Wt'}</th>
                <th className="py-2 px-2.5 text-right">{isMarathi ? 'घट %' : 'Melt Loss %'}</th>
                <th className="py-2 px-3 text-right">{isMarathi ? 'शुद्ध २४K प्राप्त' : 'Fine 24K Recovered'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {refineryBatches.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 font-bold text-slate-900">{b.id}</td>
                  <td className="py-1.5 px-2.5 text-slate-600">{b.date}</td>
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-900">{b.refineryName}</td>
                  <td className="py-1.5 px-2.5 text-right">{b.sentWeightGross.toFixed(3)}g</td>
                  <td className="py-1.5 px-2.5 text-right">{b.postMeltWeight.toFixed(3)}g</td>
                  <td className="py-1.5 px-2.5 text-right text-rose-800">{b.wastagePercentage}%</td>
                  <td className="py-1.5 px-3 text-right font-bold text-emerald-800">
                    {b.fineGoldRecovered.toFixed(3)}g
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-[11px]">
                <td colSpan={4} className="py-2 px-3 text-right uppercase">
                  {isMarathi ? 'एकूण शुद्ध सोने पुनर्प्राप्ती:' : 'Consolidated Pure Gold Recovered:'}
                </td>
                <td className="py-2 px-2.5 text-right">
                  {refineryBatches.reduce((s, b) => s + b.sentWeightGross, 0).toFixed(3)}g
                </td>
                <td className="py-2 px-2.5 text-right">
                  {refineryBatches.reduce((s, b) => s + b.postMeltWeight, 0).toFixed(3)}g
                </td>
                <td></td>
                <td className="py-2 px-3 text-right font-black text-emerald-800">
                  {totalRefineryGold.toFixed(3)}g
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Audit Certification Footer */}
      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-[10px]">
        <div>
          <div className="border-b border-slate-400 w-48 mb-1 h-8" />
          <div className="font-bold text-slate-800">
            {isMarathi ? 'शोरूम हिशोबनीस / तयार करणारा' : 'Showroom Accountant / Prepared By'}
          </div>
          <div className="text-slate-500 text-[9px]">
            {isMarathi ? '(काउंटर खात्यावरून तपासणी केली)' : '(Data verified from counter ledger)'}
          </div>
        </div>

        <div className="text-right">
          <div className="border-b border-slate-400 w-48 ml-auto mb-1 h-8" />
          <div className="font-bold text-slate-900">
            {isMarathi ? 'शोरूम व्यवस्थापक / मालक' : 'Showroom Manager / Proprietor'}
          </div>
          <div className="text-slate-500 text-[9px]">{showroom.name}</div>
        </div>
      </div>

    </div>
  );
}
