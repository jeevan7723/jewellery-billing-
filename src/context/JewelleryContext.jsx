import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  getDoc
} from 'firebase/firestore';

const JewelleryContext = createContext();

export const INITIAL_RATES = {
  gold24k: 7425, // ₹ / gram
  gold22k: 6806, // ₹ / gram (916 Hallmark)
  gold18k: 5569, // ₹ / gram (750 Fine)
  silver999: 88.5, // ₹ / gram
  silver925: 81.8, // ₹ / gram
  makingChargePercent: 5, // Default 5% making charge
};

export const INITIAL_SHOWROOM = {
  name: "KaratCraft Fine Jewellers",
  tagline: "High Jewellery, Bullion & Heritage Ornaments",
  address: "Zaveri Bazaar, Fort, Mumbai, Maharashtra 400002",
  phone: "+91 98200 12345",
  email: "billing@karatcraft.com",
  gstin: "27AABCK8841F1Z8",
  hsnCode: "7113",
};

export const INITIAL_INVENTORY = [
  {
    id: "KC-INV-101",
    barcode: "KC892101",
    name: "Royal Heritage Floral Kada (22K)",
    category: "Bangles & Kadas",
    metal: "Gold",
    karat: "22K",
    purity: 0.916,
    grossWeight: 24.850,
    stoneWeight: 0.650,
    netWeight: 24.200,
    makingChargeType: "perGram",
    makingChargeRate: 520,
    hallmarkNo: "HUID-9924-MH",
    quantity: 1,
    status: "In Vault Showcase"
  },
  {
    id: "KC-INV-102",
    barcode: "KC892102",
    name: "Temple Goddess Lakshmi Necklace (22K)",
    category: "Necklaces",
    metal: "Gold",
    karat: "22K",
    purity: 0.916,
    grossWeight: 42.180,
    stoneWeight: 2.100,
    netWeight: 40.080,
    makingChargeType: "percentage",
    makingChargeRate: 14,
    hallmarkNo: "HUID-8831-MH",
    quantity: 1,
    status: "In Vault Showcase"
  },
  {
    id: "KC-INV-103",
    barcode: "KC892103",
    name: "Classic Solitaire Diamond Ring (18K)",
    category: "Rings",
    metal: "Gold",
    karat: "18K",
    purity: 0.750,
    grossWeight: 4.520,
    stoneWeight: 0.420,
    netWeight: 4.100,
    makingChargeType: "perGram",
    makingChargeRate: 750,
    hallmarkNo: "HUID-1249-MH",
    quantity: 3,
    status: "In Counter Tray 04"
  },
  {
    id: "KC-INV-104",
    barcode: "KC892104",
    name: "999 Fine Bullion Investment Bar (24K)",
    category: "Bullion",
    metal: "Gold",
    karat: "24K",
    purity: 0.999,
    grossWeight: 10.000,
    stoneWeight: 0.000,
    netWeight: 10.000,
    makingChargeType: "perGram",
    makingChargeRate: 150,
    hallmarkNo: "MMTC-24K-881",
    quantity: 8,
    status: "Vault Locker #01"
  },
  {
    id: "KC-INV-105",
    barcode: "KC892105",
    name: "Antique Handcrafted Silver Puja Thali Set (925)",
    category: "Silver Articles",
    metal: "Silver",
    karat: "925",
    purity: 0.925,
    grossWeight: 345.500,
    stoneWeight: 0.000,
    netWeight: 345.500,
    makingChargeType: "perGram",
    makingChargeRate: 18,
    hallmarkNo: "BIS-SIL-442",
    quantity: 2,
    status: "Silver Gallery"
  }
];

export const INITIAL_KARAGIRS = [
  {
    id: "KAR-01",
    name: "Rameshwar Sutar (Senior Artisan)",
    speciality: "Kadas & Heavy Handcraft",
    phone: "+91 98210 55432",
    address: "Workshop Lane 3, Zaveri Bazaar",
    metalIssued: 150.000,
    metalReturned: 112.450,
    meltingScrap: 1.250,
    balanceMetal: 36.300,
    activeOrders: 2
  },
  {
    id: "KAR-02",
    name: "Babulal Goldsmith",
    speciality: "Filigree & Lightweight Chains",
    phone: "+91 98450 11982",
    address: "Goldsmith Hub, Kalbadevi",
    metalIssued: 85.000,
    metalReturned: 72.800,
    meltingScrap: 0.850,
    balanceMetal: 11.350,
    activeOrders: 1
  },
  {
    id: "KAR-03",
    name: "Dilipkumar Patwa",
    speciality: "Stone Setting & Polishing",
    phone: "+91 97654 33210",
    address: "Diamond District, Opera House",
    metalIssued: 40.000,
    metalReturned: 39.800,
    meltingScrap: 0.200,
    balanceMetal: 0.000,
    activeOrders: 0
  }
];

export const INITIAL_REFINERY_BATCHES = [
  {
    id: "REF-2026-081",
    date: "14-Nov-2026",
    refineryName: "Sovereign Bullion Assay & Refinery",
    metalType: "Old Ornaments Melt (Gold)",
    sentWeightGross: 245.500,
    assayedPurityTested: "84.2% (approx 20.2K)",
    postMeltWeight: 241.100,
    wastageDrossWeight: 4.400,
    wastagePercentage: 1.79,
    fineGoldRecovered: 203.006,
    status: "Completed & Bullion Received"
  },
  {
    id: "REF-2026-082",
    date: "16-Nov-2026",
    refineryName: "Apex Assay Laboratories",
    metalType: "Workshop Scrap & Floor Sweepings",
    sentWeightGross: 82.200,
    assayedPurityTested: "Testing In Progress",
    postMeltWeight: 80.500,
    wastageDrossWeight: 1.700,
    wastagePercentage: 2.06,
    fineGoldRecovered: 64.400,
    status: "In Furnace"
  }
];

export const INITIAL_INVOICES = [
  {
    invoiceNo: "KC-INV-9921",
    date: "16-Nov-2026",
    customerName: "Mrs. Ananya Kulkarni",
    phone: "+91 98200 44321",
    items: [
      { name: "Royal Heritage Floral Kada (22K)", netWeight: 24.200, rate: 6806, makingCharges: 12584, total: 177289 }
    ],
    subtotal: 177289,
    gst3Percent: 5319,
    grandTotal: 182608,
    paymentMode: "NEFT / RTGS"
  },
  {
    invoiceNo: "KC-INV-9920",
    date: "15-Nov-2026",
    customerName: "Dr. Vikram Singhania",
    phone: "+91 98199 88776",
    items: [
      { name: "999 Fine Bullion Investment Bar (24K)", netWeight: 10.000, rate: 7425, makingCharges: 1500, total: 75750 }
    ],
    subtotal: 75750,
    gst3Percent: 2273,
    grandTotal: 78023,
    paymentMode: "Credit Card"
  }
];

// Helper to remove undefined fields and ensure Firestore compatibility
function sanitizeForFirestore(data) {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeForFirestore);
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

export function JewelleryProvider({ children }) {
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('kc_rates');
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...INITIAL_RATES, ...parsed };
  });

  const [showroom, setShowroom] = useState(() => {
    const saved = localStorage.getItem('kc_showroom');
    return saved ? JSON.parse(saved) : INITIAL_SHOWROOM;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('kc_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [karagirs, setKaragirs] = useState(() => {
    const saved = localStorage.getItem('kc_karagirs');
    return saved ? JSON.parse(saved) : [];
  });

  const [refineryBatches, setRefineryBatches] = useState(() => {
    const saved = localStorage.getItem('kc_refinery');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('kc_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  // Cloud status state
  const [cloudStatus, setCloudStatus] = useState({
    connected: false,
    loading: true,
    isSyncing: false,
    error: null,
    lastSyncTime: null,
    lastAction: null
  });

  // Ephemeral live sync notification for floating feedback
  const [liveSyncNotification, setLiveSyncNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);

  // Trigger floating feedback toast
  const triggerSyncNotification = (notif) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    const timestamp = notif.timestamp || new Date().toLocaleTimeString();
    setLiveSyncNotification({ ...notif, timestamp });
    setCloudStatus(prev => ({
      ...prev,
      connected: true,
      isSyncing: false,
      lastSyncTime: timestamp,
      lastAction: notif.title
    }));
    notificationTimeoutRef.current = setTimeout(() => {
      setLiveSyncNotification(null);
    }, 4000);
  };

  // Modern Web Guidance compliant Theme State (Dark / Light)
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      } catch (e) {
        return 'dark';
      }
    }
    return 'dark';
  });

  const applyThemeToDOM = (newTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (newTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = newTheme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = newTheme === 'light' ? '#F8F9FA' : '#07080D';
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {}
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    const handleStorage = (e) => {
      if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        applyThemeToDOM(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [theme]);

  // Real-Time Firebase Subscriptions
  useEffect(() => {
    let isMounted = true;

    const handleSuccessSync = (action) => {
      if (isMounted) {
        setCloudStatus(prev => ({
          ...prev,
          connected: true,
          loading: false,
          isSyncing: false,
          error: null,
          lastSyncTime: new Date().toLocaleTimeString(),
          lastAction: action || prev.lastAction
        }));
      }
    };

    const handleSyncError = (err, source) => {
      console.warn(`[Firebase Live Sync] ${source} listener notice:`, err.message);
      if (isMounted) {
        setCloudStatus(prev => ({
          ...prev,
          connected: false,
          loading: false,
          isSyncing: false,
          error: err.message
        }));
      }
    };

    // 1. Settings / Rates Listener
    const unsubRates = onSnapshot(
      doc(db, 'settings', 'rates'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRates(data);
          localStorage.setItem('kc_rates', JSON.stringify(data));
          handleSuccessSync('Live Rates updated');
        }
      },
      (err) => handleSyncError(err, 'rates')
    );

    // 2. Settings / Showroom Listener
    const unsubShowroom = onSnapshot(
      doc(db, 'settings', 'showroom'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setShowroom(data);
          localStorage.setItem('kc_showroom', JSON.stringify(data));
          handleSuccessSync('Showroom profile updated');
        }
      },
      (err) => handleSyncError(err, 'showroom')
    );

    // 3. Inventory Listener - Live sync with Cloud Firestore
    const unsubInventory = onSnapshot(
      collection(db, 'inventory'),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setInventory(items);
        localStorage.setItem('kc_inventory', JSON.stringify(items));
        handleSuccessSync('Inventory updated');
      },
      (err) => handleSyncError(err, 'inventory')
    );

    // 4. Karagirs Listener - Live sync with Cloud Firestore
    const unsubKaragirs = onSnapshot(
      collection(db, 'karagirs'),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setKaragirs(items);
        localStorage.setItem('kc_karagirs', JSON.stringify(items));
        handleSuccessSync('Karagir ledger updated');
      },
      (err) => handleSyncError(err, 'karagirs')
    );

    // 5. Refinery Listener - Live sync with Cloud Firestore
    const unsubRefinery = onSnapshot(
      collection(db, 'refinery'),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRefineryBatches(items);
        localStorage.setItem('kc_refinery', JSON.stringify(items));
        handleSuccessSync('Refinery batches updated');
      },
      (err) => handleSyncError(err, 'refinery')
    );

    // 6. Invoices Listener - Live sync with Cloud Firestore
    const unsubInvoices = onSnapshot(
      collection(db, 'invoices'),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({
          ...d.data(),
          invoiceNo: d.data().invoiceNo || d.id
        }));
        setInvoices(items);
        localStorage.setItem('kc_invoices', JSON.stringify(items));
        handleSuccessSync('Invoices updated');
      },
      (err) => handleSyncError(err, 'invoices')
    );

    return () => {
      isMounted = false;
      unsubRates();
      unsubShowroom();
      unsubInventory();
      unsubKaragirs();
      unsubRefinery();
      unsubInvoices();
    };
  }, []);

  // ==========================================
  // AUTOMATIC LIVE SYNC ACTIONS
  // Every mutation writes directly to Firestore!
  // ==========================================

  // 1. Update Daily Gold & Silver Rates
  const updateRates = async (newRates) => {
    const updated = { ...rates, ...newRates };
    setRates(updated);
    localStorage.setItem('kc_rates', JSON.stringify(updated));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      await setDoc(doc(db, 'settings', 'rates'), sanitizeForFirestore(updated), { merge: true });
      triggerSyncNotification({
        title: 'Daily Rates & Making Synced',
        message: `Gold 22K: ₹${updated.gold22k}/g • Silver: ₹${updated.silver999}/g • Default Making: ${updated.makingChargePercent ?? 5}%`,
      });
    } catch (err) {
      console.warn('[Firebase] Could not live sync rates:', err.message);
      setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
    }
  };

  // 2. Update Showroom Details
  const updateShowroom = async (newShowroom) => {
    setShowroom(newShowroom);
    localStorage.setItem('kc_showroom', JSON.stringify(newShowroom));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      await setDoc(doc(db, 'settings', 'showroom'), sanitizeForFirestore(newShowroom), { merge: true });
      triggerSyncNotification({
        title: 'Showroom Profile Synced',
        message: `${newShowroom.name} shop details & GST saved to Firebase Cloud.`,
      });
    } catch (err) {
      console.warn('[Firebase] Could not live sync showroom:', err.message);
      setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
    }
  };

  // 3. Add Inventory Item
  const addInventoryItem = async (item) => {
    setInventory(prev => [item, ...prev.filter(i => i.id !== item.id)]);
    localStorage.setItem('kc_inventory', JSON.stringify([item, ...inventory]));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      await setDoc(doc(db, 'inventory', item.id), sanitizeForFirestore(item));
      triggerSyncNotification({
        title: 'Stock Item Synced',
        message: `${item.name} (${item.karat}, ${item.grossWeight}g) added to Firebase Cloud stock.`,
      });
    } catch (err) {
      console.warn('[Firebase] Could not live sync inventory item:', err.message);
      setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
    }
  };

  // 4. Update / Mark Inventory Item (e.g. Billed / Sold / Edited)
  const updateInventoryItem = async (id, updates) => {
    let updatedItem = null;
    let nextInventory = [];
    setInventory(prev => {
      nextInventory = prev.map(item => {
        if (item.id === id) {
          updatedItem = { ...item, ...updates };
          return updatedItem;
        }
        return item;
      });
      try {
        localStorage.setItem('kc_inventory', JSON.stringify(nextInventory));
      } catch (e) {
        console.warn('Could not save inventory to localStorage:', e);
      }
      return nextInventory;
    });

    if (updatedItem) {
      setCloudStatus(prev => ({ ...prev, isSyncing: true }));
      try {
        await setDoc(doc(db, 'inventory', id), sanitizeForFirestore(updatedItem), { merge: true });
        triggerSyncNotification({
          title: 'Stock Item Updated',
          message: `${updatedItem.name} details saved and synced to Firebase Cloud.`,
        });
        setCloudStatus(prev => ({ ...prev, isSyncing: false, lastSynced: new Date().toLocaleTimeString() }));
      } catch (err) {
        console.warn('[Firebase] Could not live update inventory item:', err.message);
        setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
      }
    }
  };

  // 5. Delete Inventory Item
  const deleteInventoryItem = async (id) => {
    const filtered = inventory.filter(i => i.id !== id);
    setInventory(filtered);
    localStorage.setItem('kc_inventory', JSON.stringify(filtered));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      await deleteDoc(doc(db, 'inventory', id));
      triggerSyncNotification({
        title: 'Stock Item Removed',
        message: `Item #${id} removed from Firebase Cloud stock.`,
      });
    } catch (err) {
      console.warn('[Firebase] Could not live delete inventory item:', err.message);
      setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
    }
  };

  // 6. Create Sales Tax Invoice
  const addInvoice = async (invoice) => {
    const docId = String(invoice.invoiceNo || Date.now()).replace(/\//g, '_');
    const cleanInvoice = sanitizeForFirestore(invoice);

    setInvoices(prev => [cleanInvoice, ...prev.filter(i => i.invoiceNo !== cleanInvoice.invoiceNo)]);
    localStorage.setItem('kc_invoices', JSON.stringify([cleanInvoice, ...invoices]));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      console.log('[Firebase Live Sync] Writing invoice to Cloud Firestore:', docId, cleanInvoice);
      await setDoc(doc(db, 'invoices', docId), cleanInvoice);
      console.log('[Firebase Live Sync] Cloud Firestore successfully confirmed write for:', docId);

      triggerSyncNotification({
        title: 'Tax Invoice Live Synced',
        message: `Invoice #${invoice.invoiceNo} (₹${Number(invoice.grandTotal || 0).toLocaleString('en-IN')}) saved directly to Firebase Cloud.`,
      });
      return { success: true };
    } catch (err) {
      console.error('[Firebase Live Sync] FAILED to write invoice to Cloud Firestore:', err);
      triggerSyncNotification({
        title: 'Cloud Sync Failed',
        message: `Could not save invoice #${invoice.invoiceNo} to Firebase: ${err.message}`,
        isError: true
      });
      setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
      return { success: false, error: err.message };
    }
  };

  // Delete Sales Tax Invoice / Exchange Record
  const deleteInvoice = async (invoiceNo) => {
    if (!invoiceNo) return;
    const docId = String(invoiceNo).replace(/\//g, '_');

    setInvoices(prev => {
      const nextInv = prev.filter(i => i.invoiceNo !== invoiceNo);
      try {
        localStorage.setItem('kc_invoices', JSON.stringify(nextInv));
      } catch (e) {
        console.warn('Could not update kc_invoices in localStorage:', e);
      }
      return nextInv;
    });

    setCloudStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      await deleteDoc(doc(db, 'invoices', docId));
      triggerSyncNotification({
        title: 'Bill Record Deleted',
        message: `Bill/Voucher #${invoiceNo} removed from Firebase Cloud records.`,
      });
      setCloudStatus(prev => ({ ...prev, isSyncing: false, lastSynced: new Date().toLocaleTimeString() }));
      return { success: true };
    } catch (err) {
      console.warn('[Firebase] Could not live delete invoice:', err.message);
      setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
      return { success: false, error: err.message };
    }
  };

  // 7. Add Karagir (Artisan) Account
  const addKaragir = async (karagir) => {
    setKaragirs(prev => [karagir, ...prev.filter(k => k.id !== karagir.id)]);
    localStorage.setItem('kc_karagirs', JSON.stringify([karagir, ...karagirs]));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      await setDoc(doc(db, 'karagirs', karagir.id), sanitizeForFirestore(karagir));
      triggerSyncNotification({
        title: 'Artisan Account Synced',
        message: `${karagir.name} (${karagir.speciality}) created in Firebase Cloud.`,
      });
    } catch (err) {
      console.warn('[Firebase] Could not live sync karagir:', err.message);
      setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
    }
  };

  // 8. Issue Metal to Karagir
  const issueMetalToKaragir = async (karagirId, grams) => {
    let updatedKaragir = null;
    const updated = karagirs.map(k => {
      if (k.id === karagirId) {
        const issued = k.metalIssued + grams;
        const balance = issued - k.metalReturned - k.meltingScrap;
        updatedKaragir = { ...k, metalIssued: issued, balanceMetal: balance };
        return updatedKaragir;
      }
      return k;
    });
    setKaragirs(updated);
    localStorage.setItem('kc_karagirs', JSON.stringify(updated));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));

    if (updatedKaragir) {
      try {
        await setDoc(doc(db, 'karagirs', karagirId), sanitizeForFirestore(updatedKaragir), { merge: true });
        triggerSyncNotification({
          title: 'Metal Issue Synced',
          message: `${grams}g issued to ${updatedKaragir.name}. Balance: ${updatedKaragir.balanceMetal}g saved to Firebase.`,
        });
      } catch (err) {
        console.warn('[Firebase] Could not live sync metal issue:', err.message);
        setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
      }
    }
  };

  // 9. Return Metal from Karagir
  const returnMetalFromKaragir = async (karagirId, returnedGrams, scrapGrams) => {
    let updatedKaragir = null;
    const updated = karagirs.map(k => {
      if (k.id === karagirId) {
        const ret = k.metalReturned + returnedGrams;
        const scrap = k.meltingScrap + scrapGrams;
        const balance = Math.max(0, k.metalIssued - ret - scrap);
        updatedKaragir = { ...k, metalReturned: ret, meltingScrap: scrap, balanceMetal: balance };
        return updatedKaragir;
      }
      return k;
    });
    setKaragirs(updated);
    localStorage.setItem('kc_karagirs', JSON.stringify(updated));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));

    if (updatedKaragir) {
      try {
        await setDoc(doc(db, 'karagirs', karagirId), sanitizeForFirestore(updatedKaragir), { merge: true });
        triggerSyncNotification({
          title: 'Metal Return Synced',
          message: `${returnedGrams}g returned + ${scrapGrams}g scrap by ${updatedKaragir.name} saved to Firebase.`,
        });
      } catch (err) {
        console.warn('[Firebase] Could not live sync metal return:', err.message);
        setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
      }
    }
  };

  // 10. Add Refinery Batch
  const addRefineryBatch = async (batch) => {
    setRefineryBatches(prev => [batch, ...prev.filter(b => b.id !== batch.id)]);
    localStorage.setItem('kc_refinery', JSON.stringify([batch, ...refineryBatches]));
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      await setDoc(doc(db, 'refinery', batch.id), sanitizeForFirestore(batch));
      triggerSyncNotification({
        title: 'Melting Batch Synced',
        message: `Refinery Batch #${batch.id} (${batch.sentWeightGross}g) saved to Firebase Cloud.`,
      });
    } catch (err) {
      console.warn('[Firebase] Could not live sync refinery batch:', err.message);
      setCloudStatus(prev => ({ ...prev, isSyncing: false, error: err.message }));
    }
  };

  // 11. Force Full Sync (Push all state to Cloud)
  const syncAllToCloud = async () => {
    try {
      setCloudStatus(prev => ({ ...prev, isSyncing: true, loading: true }));

      // Rates & Showroom
      await setDoc(doc(db, 'settings', 'rates'), sanitizeForFirestore(rates), { merge: true });
      await setDoc(doc(db, 'settings', 'showroom'), sanitizeForFirestore(showroom), { merge: true });

      // Inventory
      const invBatch = writeBatch(db);
      inventory.forEach(item => {
        invBatch.set(doc(db, 'inventory', item.id), sanitizeForFirestore(item));
      });
      await invBatch.commit();

      // Karagirs
      const karBatch = writeBatch(db);
      karagirs.forEach(k => {
        karBatch.set(doc(db, 'karagirs', k.id), sanitizeForFirestore(k));
      });
      await karBatch.commit();

      // Refinery
      const refBatch = writeBatch(db);
      refineryBatches.forEach(b => {
        refBatch.set(doc(db, 'refinery', b.id), sanitizeForFirestore(b));
      });
      await refBatch.commit();

      // Invoices
      const invcBatch = writeBatch(db);
      invoices.forEach(inv => {
        const docId = String(inv.invoiceNo || Date.now()).replace(/\//g, '_');
        invcBatch.set(doc(db, 'invoices', docId), sanitizeForFirestore(inv));
      });
      await invcBatch.commit();

      const timeStr = new Date().toLocaleTimeString();
      triggerSyncNotification({
        title: 'Complete Cloud Sync',
        message: 'All collections (Rates, Stock, Invoices, Karagirs, Refinery) live synced to Firebase.',
        timestamp: timeStr
      });

      return { success: true };
    } catch (err) {
      console.error('[Firebase] Force sync error:', err);
      setCloudStatus(prev => ({
        ...prev,
        connected: false,
        loading: false,
        isSyncing: false,
        error: err.message
      }));
      return { success: false, error: err.message };
    }
  };

  return (
    <JewelleryContext.Provider value={{
      rates,
      updateRates,
      showroom,
      setShowroom: updateShowroom,
      inventory,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      karagirs,
      addKaragir,
      issueMetalToKaragir,
      returnMetalFromKaragir,
      refineryBatches,
      addRefineryBatch,
      invoices,
      addInvoice,
      deleteInvoice,
      cloudStatus,
      liveSyncNotification,
      syncAllToCloud,
      theme,
      setTheme,
      toggleTheme
    }}>
      {children}
    </JewelleryContext.Provider>
  );
}

export const useJewellery = () => useContext(JewelleryContext);
