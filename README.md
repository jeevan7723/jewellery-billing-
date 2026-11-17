# KaratCraft ERP™ — Jewellery Billing & Management Software

A modern, high-performance web software suite built for Indian retail jewellery showrooms, bullion traders, and multi-counter stores.

Designed with an obsidian and champagne gold glassmorphism interface, offline-first local state persistence, live optical barcode scanning, and GST-compliant printable documents.

---

## 💎 Features & Modules

1. **New Bill (Rupees Billing)**:
   - Digital scale weight calculation (Gross Weight, Stone/Wax deduction, Net Gold Weight).
   - Dynamic making charges (per gram ₹ or percentage %).
   - 3% Jewellery GST calculation (CGST 1.5% + SGST 1.5%).
   - Customer KYC and printable GST Tax Invoice.

2. **Barcode POS Billing**:
   - Optical barcode lookup for fast checkout.
   - Built-in live camera barcode scanner (webcam & phone camera).
   - Generates and prints 100mm × 25mm rat-tail jewellery tags with BIS 6-digit HUID.
   - 80mm thermal receipt counter printer support.

3. **Old Gold / Metal-to-Metal Exchange (Module #03)**:
   - Supports 4 direct exchange pathways:
     - 🪙 Gold ↔ Gold (Old gold ornaments against new BIS hallmarked jewellery)
     - 🥈 Silver ↔ Silver (Old silver articles against 999 fine silver)
     - 🪙 ➔ 🥈 Gold to Silver (Gold scrap against fine silver bullion)
     - 🥈 ➔ 🪙 Silver to Gold (Bulk silver against gold jewellery with live parity ratio)
   - Detailed purity options: Gold 24K, 22K 916, 20K Kundan, 18K Diamond, 14K, 9K; Silver 999, 925, 800, 700; Platinum Pt 950, Pt 900.
   - Official printable Barter Memorandum / Exchange Voucher with legal customer declaration.

4. **Stock & Inventory Vault**:
   - Live tracking of items across categories: Bangles & Kadas, Necklaces, Rings, Bullion, and Silver Articles.
   - Tracks Gross Wt, Stone Wt, Net Gold Wt, Category, and HUID codes.
   - Search by name or scan physical tag to filter stock.

5. **Karagir (Artisan) Work Management**:
   - Issue pure metal to karagirs.
   - Receive finished ornaments, scrap, and calculate balance gold holding.
   - Printable Karagir Gold Ledger.

6. **Gold Refinery & Scrap Melting**:
   - Track scrap gold sent for melting, post-melt weight, melting loss %, and pure 24K recovery.
   - Printable melting audit statements.

7. **Reports & Data Export**:
   - 1-click export to Excel / CSV for Sales, Stock, Karagir, and Refinery.
   - Printable A4 audit statements.

8. **Daily Bullion Rates & Showroom Settings**:
   - Set live daily rates for 24K, 22K 916, 18K gold, and 999 silver.
   - Customize shop name, tagline, address, phone, GSTIN, and HSN code.

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import this GitHub repository (`billing-software`).
4. Framework Preset will be automatically detected as **Vite**.
5. Click **"Deploy"**.
