import React from 'react';
import { numberToIndianWords } from '../../utils/numberToWords';

export default function TaxInvoiceTemplate({ invoice, showroom, format = 'a4' }) {
  if (!invoice) return null;

  const items = invoice.items || [];
  const subtotal = invoice.subtotal || 0;
  const gstAmount = invoice.gst3Percent || Math.round(subtotal * 0.03);
  const cgstAmount = Math.round(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;
  const grandTotal = invoice.grandTotal || (subtotal + gstAmount);
  const invoiceDate = invoice.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceNo = invoice.invoiceNo || 'KC-BILL-8801';
  const paymentMode = invoice.paymentMode || 'Cash / UPI';

  // ================= THERMAL RECEIPT FORMAT (80mm) =================
  if (format === 'thermal') {
    return (
      <div className="bg-white text-black font-mono p-4 text-[11px] leading-tight max-w-[80mm] mx-auto border border-dashed border-gray-300">
        <div className="text-center pb-2 border-b border-dashed border-black">
          <h2 className="font-bold text-sm uppercase">{showroom.name}</h2>
          <p className="text-[10px]">{showroom.address}</p>
          <p className="text-[10px]">Ph: {showroom.phone}</p>
          <p className="text-[10px] font-bold">GSTIN: {showroom.gstin}</p>
          <p className="text-[9px] uppercase tracking-wider mt-1">** RETAIL TAX INVOICE **</p>
        </div>

        <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Bill No: <strong>{invoiceNo}</strong></span>
            <span>Date: {invoiceDate}</span>
          </div>
          <div>Customer: <strong>{invoice.customerName || 'Walk-in Customer'}</strong></div>
          {invoice.phone && <div>Mobile: {invoice.phone}</div>}
          <div>Payment: {paymentMode}</div>
        </div>

        <div className="py-2 border-b border-dashed border-black">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1">Item / Karat</th>
                <th className="py-1 text-right">Net Wt</th>
                <th className="py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1">
                    <div>{item.name}</div>
                    <div className="text-[9px] text-gray-700">{item.karat || '22K 916'}</div>
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
            <span>Taxable Subtotal:</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>CGST (1.5%):</span>
            <span>₹{cgstAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST (1.5%):</span>
            <span>₹{sgstAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs font-bold pt-1 border-t border-black">
            <span>NET PAYABLE:</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="py-2 border-b border-dashed border-black text-[9px]">
          <div className="font-bold">Amount in Words:</div>
          <div>{numberToIndianWords(grandTotal)}</div>
        </div>

        <div className="pt-3 text-center text-[9px] space-y-1">
          <p className="font-bold">100% Certified BIS Hallmarked Jewellery</p>
          <p>Thank you for shopping with us!</p>
          <p className="text-[8px] text-gray-500">Visit Again</p>
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
            {showroom.tagline || 'Certified High Jewellery & Bullion Merchants'}
          </p>
          <p className="text-[11px] text-slate-700 mt-1 max-w-md">
            {showroom.address}
          </p>
          <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-600 mt-1 font-mono">
            <span>Phone: <strong>{showroom.phone}</strong></span>
            {showroom.email && <span>Email: <strong>{showroom.email}</strong></span>}
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 uppercase tracking-wider rounded">
            TAX INVOICE
          </div>
          <div className="text-slate-600 text-[10px] font-mono">
            (Under Rule 46 of CGST Rules, 2017)
          </div>
          <div className="font-mono text-xs pt-1">
            <span className="text-slate-500">GSTIN:</span> <strong>{showroom.gstin}</strong>
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            State: <strong>Maharashtra (27)</strong> • HSN: <strong>7113</strong>
          </div>
        </div>
      </div>

      {/* Invoice Meta and Customer Information Box */}
      <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 mb-4 bg-slate-50/50 text-[11px]">
        
        {/* Left: Invoice Particulars */}
        <div className="space-y-1 border-r border-slate-300 pr-3">
          <div className="flex justify-between">
            <span className="text-slate-500 font-mono">Invoice Number:</span>
            <span className="font-mono font-bold text-slate-900">{invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-mono">Invoice Date:</span>
            <span className="font-mono font-bold">{invoiceDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-mono">Place of Supply:</span>
            <span className="font-medium">Mumbai, Maharashtra (27)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-mono">Payment Mode:</span>
            <span className="font-bold text-slate-800">{paymentMode}</span>
          </div>
        </div>

        {/* Right: Billed To Customer */}
        <div className="space-y-1 pl-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Billed To (Customer Details):
          </div>
          <div className="font-bold text-sm text-slate-900">
            {invoice.customerName || 'Walk-in Customer'}
          </div>
          <div className="text-slate-700">
            Contact: {invoice.phone || '—'}
          </div>
          <div className="text-slate-600 text-[10px]">
            Address / City: {invoice.city || '—'}
          </div>
        </div>

      </div>

      {/* Line Items Table */}
      <div className="border border-slate-300 rounded overflow-hidden mb-4">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-900 text-white font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2 px-2.5 text-center w-8">#</th>
              <th className="py-2 px-3">Description of Jewellery</th>
              <th className="py-2 px-2 text-center">HSN</th>
              <th className="py-2 px-2 text-center">Purity</th>
              <th className="py-2 px-2.5 text-right">Gross Wt</th>
              <th className="py-2 px-2.5 text-right">Stone Wt</th>
              <th className="py-2 px-2.5 text-right">Net Wt</th>
              <th className="py-2 px-2.5 text-right">Rate (₹/g)</th>
              <th className="py-2 px-2.5 text-right">Making (₹)</th>
              <th className="py-2 px-3 text-right">Total (₹)</th>
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
              Invoice Amount in Words:
            </span>
            <span className="font-serif font-bold text-slate-900">
              {numberToIndianWords(grandTotal)}
            </span>
          </div>

          <div className="p-2.5 border border-amber-300 rounded bg-amber-50/60 text-[10px] text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <span>★</span> BIS HALLMARKING COMPLIANCE & AUTHENTICITY ASSURANCE
            </div>
            <p className="leading-normal">
              Every hallmarked gold article sold under this tax invoice bears the official Bureau of Indian Standards (BIS) hallmark mark, purity grade (e.g. 22K916 / 18K750), and unique 6-digit alphanumeric HUID stamped by an authorized Assaying & Hallmarking Centre.
            </p>
          </div>

          <div className="text-[9px] text-slate-500 space-y-0.5 leading-tight">
            <p className="font-bold text-slate-700 uppercase">Terms & Conditions of Sale:</p>
            <p>1. Goods once sold will be exchanged or bought back strictly as per prevailing market bullion rate on the date of return.</p>
            <p>2. Gross scale weight and net pure metal weight were verified on certified digital scale in customer's presence.</p>
            <p>3. Stone and enamel weight deducted in full for bullion valuation.</p>
            <p>4. All disputes are subject to local showroom territorial jurisdiction.</p>
          </div>
        </div>

        {/* Right (5 cols): Tax Totals and Calculations */}
        <div className="col-span-5 border border-slate-300 rounded overflow-hidden">
          <table className="w-full text-left font-mono text-[11px]">
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="py-1.5 px-3 text-slate-600">Taxable Subtotal:</td>
                <td className="py-1.5 px-3 text-right font-bold">₹{subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 px-3 text-slate-600">Hallmarking Fee (BIS):</td>
                <td className="py-1.5 px-3 text-right font-medium">₹45.00</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 px-3 text-slate-600">CGST @ 1.5%:</td>
                <td className="py-1.5 px-3 text-right font-medium">₹{cgstAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 px-3 text-slate-600">SGST @ 1.5%:</td>
                <td className="py-1.5 px-3 text-right font-medium">₹{sgstAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-100">
                <td className="py-1.5 px-3 text-slate-700 font-bold">Total GST (3%):</td>
                <td className="py-1.5 px-3 text-right font-bold text-slate-900">₹{gstAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-slate-900 text-white">
                <td className="py-2.5 px-3 font-serif font-bold text-sm uppercase">Grand Total:</td>
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
          <div className="font-bold text-slate-800">Customer's Signature</div>
          <div className="text-slate-500 text-[9px]">(I accept the weights, rates & terms)</div>
        </div>

        <div className="text-center">
          <div className="border-b border-slate-400 w-48 mx-auto mb-1 h-8 flex items-end justify-center font-serif text-[10px] text-slate-600">
            For {showroom.name}
          </div>
          <div className="font-bold text-slate-900">Authorised Signatory & Seal</div>
          <div className="text-slate-500 text-[9px]">E. & O.E.</div>
        </div>
      </div>

    </div>
  );
}
