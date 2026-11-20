import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { translations } from '../utils/translations';
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

export const INITIAL_INVENTORY = [];
export const INITIAL_KARAGIRS = [];
export const INITIAL_REFINERY_BATCHES = [];
export const INITIAL_INVOICES = [];

export const DEMO_INVENTORY_IDS = ['KC-INV-101', 'KC-INV-102', 'KC-INV-103', 'KC-INV-104', 'KC-INV-105'];
export const DEMO_KARAGIR_IDS = ['KAR-01', 'KAR-02', 'KAR-03'];
export const DEMO_REFINERY_IDS = ['REF-2026-081', 'REF-2026-082'];
export const DEMO_INVOICE_NOS = ['KC-INV-9921', 'KC-INV-9920'];

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
    try {
      const saved = localStorage.getItem('kc_inventory');
      const items = saved ? JSON.parse(saved) : [];
      const clean = items.filter(i => !DEMO_INVENTORY_IDS.includes(i.id));
      if (clean.length !== items.length) {
        localStorage.setItem('kc_inventory', JSON.stringify(clean));
      }
      return clean;
    } catch (e) {
      return [];
    }
  });

  const [karagirs, setKaragirs] = useState(() => {
    try {
      const saved = localStorage.getItem('kc_karagirs');
      const items = saved ? JSON.parse(saved) : [];
      const clean = items.filter(k => !DEMO_KARAGIR_IDS.includes(k.id));
      if (clean.length !== items.length) {
        localStorage.setItem('kc_karagirs', JSON.stringify(clean));
      }
      return clean;
    } catch (e) {
      return [];
    }
  });

  const [refineryBatches, setRefineryBatches] = useState(() => {
    try {
      const saved = localStorage.getItem('kc_refinery');
      const items = saved ? JSON.parse(saved) : [];
      const clean = items.filter(b => !DEMO_REFINERY_IDS.includes(b.id));
      if (clean.length !== items.length) {
        localStorage.setItem('kc_refinery', JSON.stringify(clean));
      }
      return clean;
    } catch (e) {
      return [];
    }
  });

  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('kc_invoices');
      const items = saved ? JSON.parse(saved) : [];
      const clean = items.filter(i => !DEMO_INVOICE_NOS.includes(i.invoiceNo));
      if (clean.length !== items.length) {
        localStorage.setItem('kc_invoices', JSON.stringify(clean));
      }
      return clean;
    } catch (e) {
      return [];
    }
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

  // Combined Purchased Gold Tracking (Stored in LocalStorage & Context)
  const getPurchasedGoldSummary = (invList = invoices) => {
    const exchangeInvs = (invList || []).filter(inv => 
      Boolean(inv.isExchange || inv.invoiceType === 'exchange' || Number(inv.inwardValuation || 0) > 0)
    );
    
    let totalValue = 0;
    let totalGrossWeight = 0;
    let totalNetWeight = 0;
    let totalFineWeight = 0;

    exchangeInvs.forEach(inv => {
      const val = Number(inv.purchasedGoldValue || inv.purchasedGoldCombinedValue || inv.inwardValuation || inv.exchangeCredit || 0);
      const gross = Number(inv.purchasedGoldGrossWeight || inv.inwardGrossWeight || 0);
      const net = Number(inv.purchasedGoldNetWeight || inv.inwardNetWeight || gross);
      const fine = Number(inv.purchasedGoldFineWeight || inv.inwardFineEquivalent || (net * 0.916));

      totalValue += val;
      totalGrossWeight += gross;
      totalNetWeight += net;
      totalFineWeight += fine;
    });

    return {
      count: exchangeInvs.length,
      totalValue: Math.round(totalValue),
      totalGrossWeight: Number(totalGrossWeight.toFixed(3)),
      totalNetWeight: Number(totalNetWeight.toFixed(3)),
      totalFineWeight: Number(totalFineWeight.toFixed(3)),
    };
  };

  const [purchasedGoldSummary, setPurchasedGoldSummary] = useState(() => {
    try {
      const saved = localStorage.getItem('kc_purchased_gold_combined_value');
      return saved ? JSON.parse(saved) : getPurchasedGoldSummary([]);
    } catch (e) {
      return getPurchasedGoldSummary([]);
    }
  });

  useEffect(() => {
    const summary = getPurchasedGoldSummary(invoices);
    setPurchasedGoldSummary(summary);
    try {
      localStorage.setItem('kc_purchased_gold_combined_value', JSON.stringify(summary));
    } catch (e) {
      console.warn('Could not store kc_purchased_gold_combined_value in localStorage:', e);
    }
  }, [invoices]);

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

  // Bilingual State (English 'en' / Marathi 'mr')
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('language');
        if (saved === 'en' || saved === 'mr') return saved;
      } catch (e) {}
    }
    return 'en';
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('language', newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch (e) {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };

  const t = (key, fallback) => {
    return translations[language]?.[key] || fallback || translations['en']?.[key] || key;
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    const handleLangStorage = (e) => {
      if (e.key === 'language' && (e.newValue === 'en' || e.newValue === 'mr')) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener('storage', handleLangStorage);
    return () => window.removeEventListener('storage', handleLangStorage);
  }, [language]);

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

    // Purge demo records from Firestore if they were previously pushed
    DEMO_INVENTORY_IDS.forEach(id => deleteDoc(doc(db, 'inventory', id)).catch(() => {}));
    DEMO_KARAGIR_IDS.forEach(id => deleteDoc(doc(db, 'karagirs', id)).catch(() => {}));
    DEMO_REFINERY_IDS.forEach(id => deleteDoc(doc(db, 'refinery', id)).catch(() => {}));
    DEMO_INVOICE_NOS.forEach(invNo => deleteDoc(doc(db, 'invoices', invNo)).catch(() => {}));

    // 3. Inventory Listener - Live sync with Cloud Firestore
    const unsubInventory = onSnapshot(
      collection(db, 'inventory'),
      (snapshot) => {
        const items = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(i => !DEMO_INVENTORY_IDS.includes(i.id));
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
        const items = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(k => !DEMO_KARAGIR_IDS.includes(k.id));
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
        const items = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(b => !DEMO_REFINERY_IDS.includes(b.id));
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
        const items = snapshot.docs
          .map(d => ({
            ...d.data(),
            invoiceNo: d.data().invoiceNo || d.id
          }))
          .filter(i => !DEMO_INVOICE_NOS.includes(i.invoiceNo));
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
      purchasedGoldSummary,
      getPurchasedGoldSummary,
      cloudStatus,
      liveSyncNotification,
      syncAllToCloud,
      theme,
      setTheme,
      toggleTheme,
      language,
      setLanguage,
      toggleLanguage,
      t
    }}>
      {children}
    </JewelleryContext.Provider>
  );
}

export const useJewellery = () => useContext(JewelleryContext);
