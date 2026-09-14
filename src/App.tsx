import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import CashierTab from './components/CashierTab';
import ProductTab from './components/ProductTab';
import ServiceTab from './components/ServiceTab';
import ReportTab from './components/ReportTab';
import UserTab from './components/UserTab';
import GasTab from './components/GasTab';
import AttendanceTab from './components/AttendanceTab';
import SettingsTab from './components/SettingsTab';
import PromoManagerTab from './components/PromoManagerTab';
import ReceiptModal from './components/ReceiptModal';
import LoginModal from './components/LoginModal';
import PromoLanding from './components/PromoLanding';
import {
  Product,
  Transaction,
  ServiceOrder,
  User,
  UserRole,
  StockLog,
  ServiceStatus,
  Category,
  AttendanceRecord,
  StoreSettings,
  PaymentMethod,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_SERVICES,
  INITIAL_USERS,
  INITIAL_STOCK_LOGS,
  INITIAL_ATTENDANCE,
  INITIAL_STORE_SETTINGS,
} from './data/initialData';
import { generateLogId, generateTrxId, formatCurrency, formatDateTime } from './utils/formatters';
import {
  syncTransactionToSheets,
  syncServiceToSheets,
  syncAttendanceToSheets,
} from './utils/googleSheetsSync';

export default function App() {
  // State with LocalStorage fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hiroshi_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('hiroshi_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('hiroshi_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [services, setServices] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('hiroshi_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hiroshi_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem('hiroshi_stock_logs');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_LOGS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('hiroshi_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('hiroshi_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Admin by default
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('hiroshi_store_settings');
    if (!saved) return INITIAL_STORE_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      // Migrate old default address / phone if needed
      if (!parsed.address || parsed.address === 'Jl. Ahmad Yani No. 88') {
        parsed.address = 'Jl. Tunggorono No 46 Pucangan';
        parsed.city = 'Kartasura';
      }
      if (!parsed.phone || parsed.phone === '0812-3456-7890') {
        parsed.phone = '085876500029';
      }
      return {
        ...INITIAL_STORE_SETTINGS,
        ...parsed,
        printSettings: {
          ...INITIAL_STORE_SETTINGS.printSettings,
          ...(parsed.printSettings || {}),
          servicePrintSettings: {
            ...INITIAL_STORE_SETTINGS.printSettings.servicePrintSettings,
            ...(parsed.printSettings?.servicePrintSettings || {}),
          },
        },
      };
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('kasir');
  const [viewMode, setViewMode] = useState<'promo' | 'pos'>(() => {
    const saved = localStorage.getItem('hiroshi_view_mode');
    return (saved as 'promo' | 'pos') || 'promo';
  });
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [loginDefaultUsername, setLoginDefaultUsername] = useState<string>('admin');
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenLogin = (prefUsername?: string) => {
    if (prefUsername) {
      setLoginDefaultUsername(prefUsername);
    }
    setIsLoginOpen(true);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('hiroshi_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('hiroshi_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('hiroshi_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('hiroshi_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hiroshi_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('hiroshi_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('hiroshi_stock_logs', JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem('hiroshi_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('hiroshi_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hiroshi_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Sinkronisasi otomatis: pastikan semua servis dengan status Selesai / Diambil
  // memiliki catatan transaksi di Laporan Keuangan (self-healing / backwards compatibility)
  useEffect(() => {
    const missingTrxServices = services.filter(
      (s) =>
        (s.status === 'Selesai' || s.status === 'Diambil') &&
        !transactions.some(
          (t) =>
            (s.transactionId && t.id === s.transactionId) ||
            t.serviceId === s.id ||
            t.items.some((itm) => itm.productId === `SRV-${s.id}` || itm.serialNumber === s.id)
        )
    );

    if (missingTrxServices.length > 0) {
      const backfilledTrx: Transaction[] = missingTrxServices.map((s) => {
        const cost =
          s.finalCost !== undefined && s.finalCost >= 0
            ? s.finalCost
            : s.estimatedCost || 0;
        const trxId = s.transactionId || generateTrxId();
        return {
          id: trxId,
          date: s.finishDate || s.entryDate || formatDateTime(new Date()),
          cashier: s.technician || 'Teknisi',
          subtotal: cost,
          discount: 0,
          total: cost,
          paymentMethod: s.paymentMethod || 'Tunai',
          amountPaid: cost,
          change: 0,
          status: 'Sukses',
          type: 'SERVICE',
          serviceId: s.id,
          notes: `Pelunasan Servis ${s.id} - ${s.customerName} (${s.device})`,
          items: [
            {
              transactionId: trxId,
              productId: `SRV-${s.id}`,
              productName: `Jasa Servis IT: ${s.device} (${s.customerName})`,
              qty: 1,
              subtotal: cost,
              serialNumber: s.id,
              warranty: s.warranty || '30 Hari Garansi Servis',
            },
          ],
        };
      });

      setTransactions((prev) => [...backfilledTrx, ...prev]);
    }
  }, [services]);

  // Show auto-dismissing toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Role-Based Access Control (RBAC) rules:
  // - Teknisi: hanya presensi karyawan, work order service IT, dan kasir & penjualan
  // - Kasir: semua akses KECUALI manajemen user dan pengaturan toko
  // - Admin: semua akses terbuka (Administrator)
  const isTabAllowedForRole = (tab: string, role: UserRole): boolean => {
    if (role === 'Admin') return true;
    if (role === 'Teknisi') {
      return ['absensi', 'service', 'kasir'].includes(tab);
    }
    if (role === 'Kasir') {
      return !['user', 'pengaturan', 'promosi'].includes(tab);
    }
    return false;
  };

  // Switch tab with RBAC safety
  const handleSelectTab = (tab: string) => {
    if (!isTabAllowedForRole(tab, currentUser.role)) {
      if (currentUser.role === 'Teknisi') {
        showToast('Akses dibatasi: Teknisi hanya diberi akses Presensi Karyawan, Work Order Service IT, dan Kasir & Penjualan.');
      } else if (currentUser.role === 'Kasir') {
        showToast('Akses dibatasi: Kasir tidak memiliki akses ke Kelola Promosi, Manajemen User, dan Pengaturan Toko.');
      } else {
        showToast('Akses dibatasi untuk peran pengguna Anda.');
      }
      return;
    }
    setActiveTab(tab);
  };

  // Auto redirect to permitted tab if user role changes or active tab is unauthorized
  useEffect(() => {
    if (!isTabAllowedForRole(activeTab, currentUser.role)) {
      setActiveTab('kasir');
    }
  }, [currentUser.role, activeTab]);

  // Handle successful login for any role with proper welcome & permission alignment
  const handleUserLoginSuccess = (u: User) => {
    setCurrentUser(u);
    setViewMode('pos');
    if (!isTabAllowedForRole(activeTab, u.role)) {
      setActiveTab('kasir');
    }
    if (u.role === 'Admin') {
      showToast(`Login berhasil sebagai Administrator: <strong>${u.fullName}</strong>. Seluruh akses menu terbuka.`);
    } else if (u.role === 'Kasir') {
      showToast(`Login berhasil sebagai Kasir: <strong>${u.fullName}</strong>. Akses aktif kecuali Manajemen User & Pengaturan Toko.`);
    } else {
      showToast(`Login berhasil sebagai Teknisi: <strong>${u.fullName}</strong>. Akses aktif: Presensi Karyawan, Service IT, dan Kasir & Penjualan.`);
    }
  };

  // Handlers for Transactions & Stock Integrity
  const handleSaveTransaction = (newTrx: Transaction) => {
    // 1. Add transaction
    setTransactions((prev) => [newTrx, ...prev]);

    // 2. Decrement product stock & create stock logs
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLogs: StockLog[] = [];

    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const cartItem = newTrx.items.find((itm) => itm.productId === prod.id);
        if (cartItem && prod.category !== 'Jasa Service') {
          const newQty = Math.max(0, prod.stock - cartItem.qty);
          newLogs.push({
            id: generateLogId(stockLogs.length + newLogs.length),
            date: timestamp,
            productId: prod.id,
            productName: prod.name,
            changeType: 'PENJUALAN',
            quantity: -cartItem.qty,
            notes: `Penjualan Kasir: ${newTrx.id}`,
            user: newTrx.cashier,
          });
          return { ...prod, stock: newQty };
        }
        return prod;
      })
    );

    if (newLogs.length > 0) {
      setStockLogs((prev) => [...newLogs, ...prev]);
    }

    // Auto-sync ke Google Sheets jika URL Web App sudah terpasang
    if (
      storeSettings.googleSheetsSettings?.webAppUrl &&
      storeSettings.googleSheetsSettings.autoSyncTransactions !== false
    ) {
      syncTransactionToSheets(
        storeSettings.googleSheetsSettings.webAppUrl,
        newTrx
      ).catch((err) => {
        console.warn('[Google Sheets Sync] Transaksi offline/pending:', err);
      });
    }

    showToast(`Transaksi ${newTrx.id} berhasil dicatat &amp; stok diperbarui.`);
  };

  // Void Transaction (Admin Only)
  const handleVoidTransaction = (trxId: string) => {
    const targetTrx = transactions.find((t) => t.id === trxId);
    if (!targetTrx || targetTrx.status === 'Void') return;

    // 1. Mark transaction as Void
    setTransactions((prev) =>
      prev.map((t) => (t.id === trxId ? { ...t, status: 'Void' as const } : t))
    );

    // 2. Restore stock
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLogs: StockLog[] = [];

    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const item = targetTrx.items.find((itm) => itm.productId === prod.id);
        if (item && prod.category !== 'Jasa Service') {
          newLogs.push({
            id: generateLogId(stockLogs.length + newLogs.length),
            date: timestamp,
            productId: prod.id,
            productName: prod.name,
            changeType: 'VOID_PENJUALAN',
            quantity: item.qty,
            notes: `Batal Transaksi (Void): ${trxId}`,
            user: currentUser.username,
          });
          return { ...prod, stock: prod.stock + item.qty };
        }
        return prod;
      })
    );

    if (newLogs.length > 0) {
      setStockLogs((prev) => [...newLogs, ...prev]);
    }

    showToast(`Transaksi ${trxId} telah di-VOID dan stok barang dikembalikan.`);
  };

  // Save / Update Product
  const handleSaveProduct = (
    product: Product,
    isNew: boolean,
    reason: string = 'Penyesuaian stok'
  ) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (isNew) {
      setProducts((prev) => [product, ...prev]);
      setStockLogs((prev) => [
        {
          id: generateLogId(prev.length),
          date: timestamp,
          productId: product.id,
          productName: product.name,
          changeType: 'MASUK',
          quantity: product.stock,
          notes: reason || 'Produk baru ditambahkan',
          user: currentUser.username,
        },
        ...prev,
      ]);
      showToast(`Produk "${product.name}" berhasil ditambahkan.`);
    } else {
      const existing = products.find((p) => p.id === product.id);
      const delta = product.stock - (existing ? existing.stock : 0);

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );

      if (delta !== 0) {
        setStockLogs((prev) => [
          {
            id: generateLogId(prev.length),
            date: timestamp,
            productId: product.id,
            productName: product.name,
            changeType: delta > 0 ? 'MASUK' : 'PENYESUAIAN',
            quantity: delta,
            notes: reason,
            user: currentUser.username,
          },
          ...prev,
        ]);
      }
      showToast(`Data produk "${product.name}" berhasil diperbarui.`);
    }
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(`Produk ${productId} telah dihapus.`);
  };

  // Helper to record/update financial transaction when service status is Selesai or Diambil
  const recordServiceFinancialTransaction = (
    order: ServiceOrder,
    cost: number,
    paymentMethod?: PaymentMethod
  ): string => {
    const now = new Date();
    const dateFormatted = formatDateTime(now);
    const method = paymentMethod || order.paymentMethod || 'Tunai';

    // Periksa apakah transaksi untuk tiket servis ini sudah pernah dibuat
    const existing = transactions.find(
      (t) =>
        (order.transactionId && t.id === order.transactionId) ||
        t.serviceId === order.id ||
        t.items.some((itm) => itm.productId === `SRV-${order.id}` || itm.serialNumber === order.id)
    );

    if (existing) {
      const updatedTrx: Transaction = {
        ...existing,
        subtotal: cost,
        total: cost,
        amountPaid: cost,
        status: 'Sukses',
        paymentMethod: method,
        items: existing.items.map((itm) =>
          itm.productId === `SRV-${order.id}` || itm.serialNumber === order.id
            ? { ...itm, subtotal: cost }
            : itm
        ),
      };

      setTransactions((prev) =>
        prev.map((t) => (t.id === existing.id ? updatedTrx : t))
      );

      // Sinkronkan ke Google Sheets jika URL aktif
      if (
        storeSettings.googleSheetsSettings?.webAppUrl &&
        storeSettings.googleSheetsSettings.autoSyncTransactions !== false
      ) {
        syncTransactionToSheets(
          storeSettings.googleSheetsSettings.webAppUrl,
          updatedTrx
        ).catch((err) => {
          console.warn('[Google Sheets Sync] Update service trx failed:', err);
        });
      }

      return existing.id;
    } else {
      // Buat transaksi pemasukan baru di Laporan Keuangan
      const newTrxId = generateTrxId();
      const newTrx: Transaction = {
        id: newTrxId,
        date: dateFormatted,
        cashier: order.technician || currentUser.fullName,
        subtotal: cost,
        discount: 0,
        total: cost,
        paymentMethod: method,
        amountPaid: cost,
        change: 0,
        status: 'Sukses',
        type: 'SERVICE',
        serviceId: order.id,
        notes: `Pelunasan Servis ${order.id} - ${order.customerName} (${order.device})`,
        items: [
          {
            transactionId: newTrxId,
            productId: `SRV-${order.id}`,
            productName: `Jasa Servis IT: ${order.device} (${order.customerName})`,
            qty: 1,
            subtotal: cost,
            serialNumber: order.id,
            warranty: order.warranty || '30 Hari Garansi Servis',
          },
        ],
      };

      setTransactions((prev) => [newTrx, ...prev]);

      // Sinkronkan ke Google Sheets Transaksi jika URL aktif
      if (
        storeSettings.googleSheetsSettings?.webAppUrl &&
        storeSettings.googleSheetsSettings.autoSyncTransactions !== false
      ) {
        syncTransactionToSheets(
          storeSettings.googleSheetsSettings.webAppUrl,
          newTrx
        ).catch((err) => {
          console.warn('[Google Sheets Sync] New service trx failed:', err);
        });
      }

      return newTrxId;
    }
  };

  // Save Service Order
  const handleSaveService = (order: ServiceOrder, isNew: boolean) => {
    let orderToSave = { ...order };

    // Jika status service langsung Selesai atau Diambil saat disimpan/diedit
    if (orderToSave.status === 'Selesai' || orderToSave.status === 'Diambil') {
      const resolvedCost =
        orderToSave.finalCost !== undefined && orderToSave.finalCost >= 0
          ? orderToSave.finalCost
          : orderToSave.estimatedCost || 0;
      const linkedTrxId = recordServiceFinancialTransaction(
        orderToSave,
        resolvedCost,
        orderToSave.paymentMethod
      );
      orderToSave.transactionId = linkedTrxId;
      orderToSave.finalCost = resolvedCost;
      if (!orderToSave.finishDate) {
        orderToSave.finishDate = formatDateTime(new Date());
      }
    }

    if (isNew) {
      setServices((prev) => [orderToSave, ...prev]);
      showToast(`Tiket service ${orderToSave.id} untuk ${orderToSave.customerName} didaftarkan.`);
    } else {
      setServices((prev) =>
        prev.map((s) => (s.id === orderToSave.id ? orderToSave : s))
      );
      showToast(`Tiket service ${orderToSave.id} diperbarui.`);
    }

    // Auto-sync servis ke Google Sheets
    if (
      storeSettings.googleSheetsSettings?.webAppUrl &&
      storeSettings.googleSheetsSettings.autoSyncServices !== false
    ) {
      syncServiceToSheets(
        storeSettings.googleSheetsSettings.webAppUrl,
        orderToSave
      ).catch((err) => {
        console.warn('[Google Sheets Sync] Service order offline/pending:', err);
      });
    }
  };

  // Update Service Status
  const handleUpdateServiceStatus = (
    serviceId: string,
    status: ServiceStatus,
    finalCost?: number,
    diagnosis?: string,
    paymentMethod?: PaymentMethod
  ) => {
    const now = new Date();
    const dateFormatted = formatDateTime(now);

    const targetService = services.find((s) => s.id === serviceId);
    if (!targetService) return;

    const resolvedCost =
      finalCost !== undefined && finalCost >= 0
        ? finalCost
        : targetService.finalCost !== undefined && targetService.finalCost >= 0
        ? targetService.finalCost
        : targetService.estimatedCost || 0;

    let linkedTrxId = targetService.transactionId;

    // KETIKA STATUS SELESAI ATAU DIAMBIL: Otomatis masuk ke Laporan Keuangan
    if (status === 'Selesai' || status === 'Diambil') {
      linkedTrxId = recordServiceFinancialTransaction(
        { ...targetService, finalCost: resolvedCost },
        resolvedCost,
        paymentMethod
      );
    } else {
      // Jika status diturunkan kembali (misal Pengecekan / Diproses)
      // dan sebelumnya ada transaksi yang linked, ubah ke Void agar keuangan tetap akurat
      if (targetService.transactionId) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === targetService.transactionId
              ? {
                  ...t,
                  status: 'Void',
                  notes: `[VOID] Status servis ${serviceId} dikembalikan ke ${status}`,
                }
              : t
          )
        );
      }
    }

    const updatedService: ServiceOrder = {
      ...targetService,
      status,
      finalCost: resolvedCost,
      diagnosis: diagnosis !== undefined ? diagnosis : targetService.diagnosis,
      completionDate:
        status === 'Selesai' || status === 'Diambil'
          ? dateFormatted
          : targetService.completionDate,
      finishDate:
        status === 'Selesai' || status === 'Diambil'
          ? dateFormatted
          : targetService.finishDate,
      transactionId: linkedTrxId,
      paymentMethod: paymentMethod || targetService.paymentMethod,
    };

    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? updatedService : s))
    );

    // Auto-sync order servis ke Google Sheets
    if (
      storeSettings.googleSheetsSettings?.webAppUrl &&
      storeSettings.googleSheetsSettings.autoSyncServices !== false
    ) {
      syncServiceToSheets(
        storeSettings.googleSheetsSettings.webAppUrl,
        updatedService
      ).catch((err) => {
        console.warn('[Google Sheets Sync] Service status sync failed:', err);
      });
    }

    if (status === 'Selesai' || status === 'Diambil') {
      showToast(
        `✅ Servis ${serviceId} Selesai! Tagihan ${formatCurrency(
          resolvedCost
        )} otomatis masuk ke Laporan Keuangan (${linkedTrxId || 'Tercatat'}).`
      );
    } else {
      showToast(`Status tiket ${serviceId} berhasil diubah ke: ${status}`);
    }
  };

  // Save or Edit User
  const handleSaveUser = (user: User, originalUsername?: string) => {
    setUsers((prev) => {
      const searchKey = (originalUsername || user.username).toLowerCase();
      const idx = prev.findIndex(
        (u) => u.username.toLowerCase() === searchKey
      );
      if (idx >= 0) {
        return prev.map((u, i) => (i === idx ? user : u));
      }
      return [...prev, user];
    });
    showToast(`Pengguna "${user.fullName}" (${user.role}) berhasil disimpan.`);
  };

  // Delete User
  const handleDeleteUser = (username: string) => {
    if (username.toLowerCase() === currentUser.username.toLowerCase()) {
      showToast('Tidak dapat menghapus akun yang sedang aktif digunakan.');
      return;
    }
    const targetUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (targetUser?.role === 'Admin' && users.filter((u) => u.role === 'Admin').length <= 1) {
      showToast('Tidak dapat menghapus satu-satunya akun Administrator.');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.username.toLowerCase() !== username.toLowerCase()));
    showToast(`Pengguna "${username}" berhasil dihapus dari sistem.`);
  };

  // Save Attendance Record
  const handleSaveAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => [record, ...prev]);
    showToast(`Presensi ${record.type} untuk ${record.userName} berhasil disimpan.`);

    // Auto-sync absensi ke Google Sheets
    if (
      storeSettings.googleSheetsSettings?.webAppUrl &&
      storeSettings.googleSheetsSettings.autoSyncAttendance !== false
    ) {
      syncAttendanceToSheets(
        storeSettings.googleSheetsSettings.webAppUrl,
        record
      ).catch((err) => {
        console.warn('[Google Sheets Sync] Absensi offline/pending:', err);
      });
    }
  };

  // Reset to Factory Demo Data
  const handleResetData = () => {
    if (
      confirm(
        'Kembalikan data ke kondisi awal (Initial Sample Data)? Semua transaksi dan perubahan lokal akan direset.'
      )
    ) {
      localStorage.clear();
      setProducts(INITIAL_PRODUCTS);
      setCategories(INITIAL_CATEGORIES);
      setTransactions(INITIAL_TRANSACTIONS);
      setServices(INITIAL_SERVICES);
      setUsers(INITIAL_USERS);
      setStockLogs(INITIAL_STOCK_LOGS);
      setAttendanceRecords(INITIAL_ATTENDANCE);
      setStoreSettings(INITIAL_STORE_SETTINGS);
      setCurrentUser(INITIAL_USERS[0]);
      showToast('Data berhasil direset ke sampel awal.');
    }
  };

  // Save Store Settings
  const handleSaveStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
  };

  // Handle Logout - clears active session and returns to promo landing screen
  const handleLogout = () => {
    const adminUser = users.find((u) => u.role === 'Admin') || INITIAL_USERS[0];
    setCurrentUser(adminUser);
    setViewMode('promo');
    setActiveReceipt(null);
    showToast('<strong>Logout berhasil</strong>. Anda telah keluar dari sesi kerja POS.');
  };

  // Pending service count for navbar badge
  const pendingServiceCount = services.filter(
    (s) => s.status !== 'Diambil'
  ).length;

  const activeTheme = storeSettings.theme || 'dark-stealth';
  const themeContainerClass =
    activeTheme === 'dark-stealth'
      ? 'theme-dark-stealth bg-[#090D16] text-slate-100'
      : activeTheme === 'titanium-clean'
      ? 'theme-titanium-clean bg-[#F1F5F9] text-slate-900'
      : 'theme-classic-blue bg-[#F5F5F5] text-[#212121]';

  if (viewMode === 'promo') {
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-100">
        <PromoLanding
          products={products}
          services={services}
          storeSettings={storeSettings}
          users={users}
          currentUser={currentUser}
          onEnterPos={() => handleOpenLogin('kasir')}
          onOpenLogin={(prefUsername) => handleOpenLogin(prefUsername || 'admin')}
          onLoginAsRole={(role) => {
            const matchedUser = users.find((u) => u.role === role);
            handleOpenLogin(matchedUser?.username || (role === 'Admin' ? 'admin' : role === 'Kasir' ? 'kasir' : 'teknisi'));
          }}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          currentUser={currentUser}
          users={users}
          defaultUsername={loginDefaultUsername}
          onSelectUser={handleUserLoginSuccess}
        />

        {toastMessage && (
          <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 bg-gray-900/95 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <span dangerouslySetInnerHTML={{ __html: toastMessage }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors ${themeContainerClass}`}>
      {/* 1. Header with Computer Store Theme & Telemetry */}
      <Header
        currentUser={currentUser}
        products={products}
        storeSettings={storeSettings}
        onOpenLogin={() => handleOpenLogin(currentUser.username)}
        onSelectTab={handleSelectTab}
        onOpenPromo={() => setViewMode('promo')}
        onLogout={handleLogout}
        onUpdateTheme={(newTheme) => {
          const updated = { ...storeSettings, theme: newTheme };
          handleSaveStoreSettings(updated);
          showToast(`Tema diubah ke: <strong>${
            newTheme === 'dark-stealth'
              ? 'Dark Stealth PC'
              : newTheme === 'titanium-clean'
              ? 'Titanium Clean'
              : 'Classic Blue'
          }</strong>`);
        }}
      />

      {/* 2. Top Navigation (Desktop & Tablet) + Bottom Bar (Smartphone) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        userRole={currentUser.role}
        pendingServiceCount={pendingServiceCount}
        theme={activeTheme}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 pb-24 sm:pb-8">
        {activeTab === 'kasir' && isTabAllowedForRole('kasir', currentUser.role) && (
          <CashierTab
            products={products}
            categories={categories}
            currentUser={currentUser}
            onSaveTransaction={handleSaveTransaction}
            transactions={transactions}
            onVoidTransaction={handleVoidTransaction}
            onShowReceipt={(trx) => setActiveReceipt(trx)}
          />
        )}

        {activeTab === 'produk' && isTabAllowedForRole('produk', currentUser.role) && (
          <ProductTab
            products={products}
            categories={categories}
            currentUser={currentUser}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            stockLogs={stockLogs}
          />
        )}

        {activeTab === 'service' && isTabAllowedForRole('service', currentUser.role) && (
          <ServiceTab
            services={services}
            currentUser={currentUser}
            storeSettings={storeSettings}
            onSaveService={handleSaveService}
            onUpdateStatus={handleUpdateServiceStatus}
          />
        )}

        {activeTab === 'absensi' && isTabAllowedForRole('absensi', currentUser.role) && (
          <AttendanceTab
            currentUser={currentUser}
            attendanceRecords={attendanceRecords}
            storeSettings={storeSettings}
            onSaveAttendance={handleSaveAttendance}
          />
        )}

        {activeTab === 'laporan' && isTabAllowedForRole('laporan', currentUser.role) && (
          <ReportTab
            transactions={transactions}
            storeSettings={storeSettings}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'promosi' && isTabAllowedForRole('promosi', currentUser.role) && (
          <PromoManagerTab
            currentUser={currentUser}
            onOpenPromoDisplay={() => setViewMode('promo')}
          />
        )}

        {activeTab === 'user' && isTabAllowedForRole('user', currentUser.role) && (
          <UserTab
            users={users}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'pengaturan' && isTabAllowedForRole('pengaturan', currentUser.role) && (
          <SettingsTab
            currentUser={currentUser}
            settings={storeSettings}
            onSaveSettings={(newSettings) => {
              setStoreSettings(newSettings);
              showToast('Pengaturan toko dan preferensi cetak berhasil disimpan!');
            }}
            onResetSettings={() => {
              setStoreSettings(INITIAL_STORE_SETTINGS);
              showToast('Pengaturan toko dikembalikan ke konfigurasi default.');
            }}
          />
        )}

        {activeTab === 'gas' && isTabAllowedForRole('gas', currentUser.role) && (
          <GasTab
            storeSettings={storeSettings}
            onUpdateSettings={(newSettings) => {
              setStoreSettings(newSettings);
              showToast('Konfigurasi Google Sheets berhasil diperbarui.');
            }}
            products={products}
            transactions={transactions}
            services={services}
            attendance={attendanceRecords}
          />
        )}

        {/* Unauthorized Fallback Guard */}
        {!isTabAllowedForRole(activeTab, currentUser.role) && (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-red-800/60 max-w-lg mx-auto my-12 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 mx-auto flex items-center justify-center mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Akses Menu Dibatasi</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Akun <strong>{currentUser.fullName}</strong> dengan peran <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-cyan-400 border border-slate-700">{currentUser.role}</span> tidak memiliki izin mengakses modul ini.
            </p>
            <button
              onClick={() => setActiveTab('kasir')}
              className="mt-5 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl font-mono transition-colors cursor-pointer"
            >
              Kembali ke Menu Kasir &amp; Penjualan
            </button>
          </div>
        )}
      </main>

      {/* 4. Footer (Desktop) */}
      <footer className={`border-t py-3 px-4 text-center text-xs hidden sm:block transition-colors print:hidden ${
        activeTheme === 'dark-stealth'
          ? 'bg-[#0B0F19] border-slate-800 text-slate-400'
          : activeTheme === 'titanium-clean'
          ? 'bg-white border-slate-200 text-slate-600'
          : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>{storeSettings.storeName} POS &amp; IT Service</strong> &bull; Google Apps Script Ready &bull; Versi 1.0.0
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-footer-open-promo"
              onClick={() => setViewMode('promo')}
              className={`font-semibold hover:underline flex items-center gap-1 ${
                activeTheme === 'dark-stealth' ? 'text-cyan-400' : 'text-[#1E88E5]'
              }`}
              title="Buka Halaman Awal Promosi Toko"
            >
              <span>📺 Display Promosi</span>
            </button>
            <span>&bull;</span>
            <button
              id="btn-footer-logout"
              onClick={handleLogout}
              className="font-semibold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
              title="Logout dan kembali ke halaman promosi"
            >
              <span>🚪 Logout Sesi</span>
            </button>
            <span>&bull;</span>
            {isTabAllowedForRole('pengaturan', currentUser.role) && (
              <>
                <button
                  onClick={() => handleSelectTab('pengaturan')}
                  className={`font-semibold hover:underline ${
                    activeTheme === 'dark-stealth' ? 'text-cyan-400' : 'text-[#1E88E5]'
                  }`}
                >
                  Pengaturan Toko
                </button>
                <span>&bull;</span>
              </>
            )}
            {isTabAllowedForRole('gas', currentUser.role) && (
              <>
                <button
                  onClick={() => handleSelectTab('gas')}
                  className={`font-semibold hover:underline ${
                    activeTheme === 'dark-stealth' ? 'text-cyan-400' : 'text-[#1E88E5]'
                  }`}
                >
                  Petunjuk Deploy Google Sheets
                </button>
                <span>&bull;</span>
              </>
            )}
            <button
              onClick={handleResetData}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Reset data demo"
            >
              Reset Data Demo
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      <ReceiptModal
        transaction={activeReceipt}
        storeSettings={storeSettings}
        onClose={() => setActiveReceipt(null)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        users={users}
        defaultUsername={loginDefaultUsername}
        onSelectUser={handleUserLoginSuccess}
      />

      {/* 6. Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 bg-gray-900/95 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span dangerouslySetInnerHTML={{ __html: toastMessage }} />
        </div>
      )}
    </div>
  );
}
