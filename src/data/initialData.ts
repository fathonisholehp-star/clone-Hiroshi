import { Category, Product, ServiceOrder, Transaction, User, StockLog, AttendanceRecord, StoreSettings } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-01',
    username: 'admin',
    password: '123',
    role: 'Admin',
    fullName: 'Hiroshi Tanaka (Owner/Admin)'
  },
  {
    id: 'USR-02',
    username: 'kasir',
    password: '123',
    role: 'Kasir',
    fullName: 'Siti Rahma (Kasir)'
  },
  {
    id: 'USR-03',
    username: 'teknisi',
    password: '123',
    role: 'Teknisi',
    fullName: 'Budi Santoso (Teknisi IT)'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'KAT-01', name: 'Laptop' },
  { id: 'KAT-02', name: 'Part PC' },
  { id: 'KAT-03', name: 'Aksesoris' },
  { id: 'KAT-04', name: 'Peripheral' },
  { id: 'KAT-05', name: 'Jasa Service' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'PRD-001',
    name: 'Laptop ASUS Vivobook 14 (i5 12th/16GB/512GB)',
    category: 'Laptop',
    price: 8950000,
    stock: 5,
    minStock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60',
    barcode: '8991001'
  },
  {
    id: 'PRD-002',
    name: 'Laptop Lenovo IdeaPad Slim 3 Ryzen 5',
    category: 'Laptop',
    price: 7450000,
    stock: 4,
    minStock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=60',
    barcode: '8991002'
  },
  {
    id: 'PRD-003',
    name: 'SSD Kingston NV2 1TB NVMe PCIe 4.0',
    category: 'Part PC',
    price: 1050000,
    stock: 12,
    minStock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=60',
    barcode: '8992001'
  },
  {
    id: 'PRD-004',
    name: 'RAM Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
    category: 'Part PC',
    price: 650000,
    stock: 8,
    minStock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1555617981-d2c673130d7c?w=500&auto=format&fit=crop&q=60',
    barcode: '8992002'
  },
  {
    id: 'PRD-005',
    name: 'VGA Card RTX 4060 8GB GDDR6 Dual Fan',
    category: 'Part PC',
    price: 4950000,
    stock: 2, // Low stock warning test
    minStock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60',
    barcode: '8992003'
  },
  {
    id: 'PRD-006',
    name: 'Power Supply 650W 80+ Bronze Modular',
    category: 'Part PC',
    price: 820000,
    stock: 1, // Low stock alert
    minStock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=60',
    barcode: '8992004'
  },
  {
    id: 'PRD-007',
    name: 'Mouse Gaming Logitech G102 Lightsync RGB',
    category: 'Aksesoris',
    price: 245000,
    stock: 15,
    minStock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60',
    barcode: '8993001'
  },
  {
    id: 'PRD-008',
    name: 'Keyboard Mechanical 60% RGB Red Switch',
    category: 'Peripheral',
    price: 450000,
    stock: 6,
    minStock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
    barcode: '8994001'
  },
  {
    id: 'PRD-009',
    name: 'Jasa Install Ulang OS Windows 11 + Software Standar',
    category: 'Jasa Service',
    price: 75000,
    stock: 999,
    minStock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500&auto=format&fit=crop&q=60',
    barcode: '8995001'
  },
  {
    id: 'PRD-010',
    name: 'Jasa Deep Cleaning & Repaste Thermal Komputer / Laptop',
    category: 'Jasa Service',
    price: 120000,
    stock: 999,
    minStock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=60',
    barcode: '8995002'
  }
];

export const INITIAL_SERVICES: ServiceOrder[] = [
  {
    id: 'SRV-001',
    entryDate: '2026-09-08 09:30',
    customerName: 'Ahmad Fauzi',
    customerPhone: '6281234567890',
    device: 'Laptop Acer Nitro 5',
    complaint: 'Overheat saat gaming, kipas berisik dan kadang restart sendiri',
    estimatedCost: 180000,
    finalCost: 180000,
    status: 'Diproses',
    technician: 'Budi Santoso',
    diagnosis: 'Thermal paste kering mengeras, debu heatsink tebal',
    sparepartsUsed: 'Thermal Paste Arctic MX-4'
  },
  {
    id: 'SRV-002',
    entryDate: '2026-09-07 14:15',
    finishDate: '2026-09-08 16:00',
    customerName: 'Dewi Kartika',
    customerPhone: '6285712345678',
    device: 'Laptop HP Pavilion 14',
    complaint: 'Layar blank hitam setelah booting, indikator power nyala',
    estimatedCost: 450000,
    finalCost: 400000,
    status: 'Selesai',
    technician: 'Budi Santoso',
    diagnosis: 'Konektor fleksibel LCD kendor dan korosi debu pin RAM',
    sparepartsUsed: '-'
  },
  {
    id: 'SRV-003',
    entryDate: '2026-09-09 08:45',
    customerName: 'Rendy Pratama',
    customerPhone: '6287890123456',
    device: 'PC Gaming Rakitan Intel i7',
    complaint: 'Blue Screen of Death (BSOD) terus menerus saat masuk Windows',
    estimatedCost: 150000,
    status: 'Pengecekan',
    technician: 'Budi Santoso',
    diagnosis: 'Pemeriksaan bad sector NVMe SSD dan uji memory memtest'
  },
  {
    id: 'SRV-004',
    entryDate: '2026-09-06 11:20',
    finishDate: '2026-09-07 10:00',
    customerName: 'Pak Hendra (Kantor Notaris)',
    customerPhone: '6281322334455',
    device: 'PC All-in-One Dell Inspiron',
    complaint: 'Lambat sekali, harddisk lama 1TB sering 100% disk usage',
    estimatedCost: 850000,
    finalCost: 850000,
    status: 'Diambil',
    technician: 'Budi Santoso',
    diagnosis: 'Upgrade ke SSD NVMe 512GB + Kloning Windows 11',
    sparepartsUsed: 'SSD 512GB + Caddy'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-20260908-001',
    date: '2026-09-08 10:45',
    cashier: 'kasir',
    subtotal: 1050000,
    discount: 0,
    total: 1050000,
    paymentMethod: 'QRIS',
    amountPaid: 1050000,
    change: 0,
    status: 'Sukses',
    items: [
      {
        transactionId: 'TRX-20260908-001',
        productId: 'PRD-003',
        productName: 'SSD Kingston NV2 1TB NVMe PCIe 4.0',
        qty: 1,
        subtotal: 1050000,
        serialNumber: 'SN-KNG-20260908-41',
        warranty: '3 Tahun'
      }
    ]
  },
  {
    id: 'TRX-20260908-002',
    date: '2026-09-08 15:20',
    cashier: 'kasir',
    subtotal: 8950000,
    discount: 50000,
    total: 8900000,
    paymentMethod: 'Transfer Bank',
    amountPaid: 8900000,
    change: 0,
    status: 'Sukses',
    items: [
      {
        transactionId: 'TRX-20260908-002',
        productId: 'PRD-001',
        productName: 'Laptop ASUS Vivobook 14 (i5 12th/16GB/512GB)',
        qty: 1,
        subtotal: 8950000,
        serialNumber: 'SN-ASUS-VB-883921',
        warranty: '2 Tahun Resmi ASUS'
      }
    ]
  }
];

export const INITIAL_STOCK_LOGS: StockLog[] = [
  {
    id: 'LOG-001',
    date: '2026-09-08 09:00',
    productId: 'PRD-001',
    productName: 'Laptop ASUS Vivobook 14 (i5 12th/16GB/512GB)',
    changeType: 'MASUK',
    quantity: 5,
    notes: 'Restock supplier PT Synnex Metrodata',
    user: 'admin'
  },
  {
    id: 'LOG-002',
    date: '2026-09-08 10:45',
    productId: 'PRD-003',
    productName: 'SSD Kingston NV2 1TB NVMe PCIe 4.0',
    changeType: 'PENJUALAN',
    quantity: -1,
    notes: 'Penjualan TRX-20260908-001',
    user: 'kasir'
  },
  {
    id: 'LOG-003',
    date: '2026-09-08 15:20',
    productId: 'PRD-001',
    productName: 'Laptop ASUS Vivobook 14 (i5 12th/16GB/512GB)',
    changeType: 'PENJUALAN',
    quantity: -1,
    notes: 'Penjualan TRX-20260908-002',
    user: 'kasir'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-20260909-001',
    userId: 'USR-02',
    userName: 'Siti Rahma (Kasir)',
    role: 'Kasir',
    type: 'Masuk',
    date: '2026-09-09',
    time: '07:55',
    timestamp: '2026-09-09 07:55',
    location: {
      latitude: -6.2088,
      longitude: 106.8456,
      accuracy: 12,
      distanceMeters: 18,
      isInStoreRadius: true,
      addressOrNote: 'Area Toko Hiroshi Computer (Radius: 18m)'
    },
    photoBase64: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=60',
    notes: 'Shift Pagi Kasir',
    status: 'Tepat Waktu'
  },
  {
    id: 'ATT-20260909-002',
    userId: 'USR-03',
    userName: 'Budi Santoso (Teknisi IT)',
    role: 'Teknisi',
    type: 'Masuk',
    date: '2026-09-09',
    time: '08:10',
    timestamp: '2026-09-09 08:10',
    location: {
      latitude: -6.2087,
      longitude: 106.8457,
      accuracy: 15,
      distanceMeters: 25,
      isInStoreRadius: true,
      addressOrNote: 'Area Workshop Teknisi (Radius: 25m)'
    },
    photoBase64: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=60',
    notes: 'Shift Service Laptop & PC',
    status: 'Tepat Waktu'
  },
  {
    id: 'ATT-20260908-001',
    userId: 'USR-02',
    userName: 'Siti Rahma (Kasir)',
    role: 'Kasir',
    type: 'Pulang',
    date: '2026-09-08',
    time: '17:05',
    timestamp: '2026-09-08 17:05',
    location: {
      latitude: -6.2088,
      longitude: 106.8456,
      accuracy: 10,
      distanceMeters: 15,
      isInStoreRadius: true,
      addressOrNote: 'Area Toko Hiroshi Computer'
    },
    photoBase64: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=60',
    notes: 'Selesai shift kasir sore',
    status: 'Tepat Waktu'
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  theme: 'dark-stealth',
  storeName: 'HIROSHI COMPUTER',
  tagline: 'Toko Komputer, Part PC & Layanan Service IT',
  address: 'Jl. Tunggorono No 46 Pucangan',
  city: 'Kartasura',
  phone: '085876500029',
  email: 'info@hiroshicomputer.com',
  website: 'www.hiroshicomputer.com',
  logoUrl: '', // Default icon
  showLogoInHeader: true,
  printSettings: {
    paperWidth: '58mm',
    salesPrinterType: 'thermal-58',
    fontSize: 'normal',
    showLogo: true,
    showStoreAddress: true,
    showStoreContact: true,
    showCashierName: true,
    showSerialNumber: true,
    showWarranty: true,
    headerNote: 'SOLUSI IT & SERVICE TERPERCAYA',
    footerNote1: 'Simpan struk ini sebagai kartu garansi resmi.',
    footerNote2: 'Barang yang dibeli tidak dapat ditukar kecuali ada perjanjian.',
    autoPrintDialog: false,
    printCopies: 1,
    dotMatrixDraftFont: false,
    servicePrintSettings: {
      defaultPrinter: 'inkjet-a5',
      showStoreHeader: true,
      showCustomerInfo: true,
      showDeviceDetails: true,
      showAccessories: true,
      showEstimatedCost: true,
      showSignatureSection: true,
      showTerms: true,
      termsText:
        '1. Nota ini merupakan bukti resmi penerimaan & pengambilan unit service.\n2. Pengambilan unit WAJIB membawa nota serah terima ini.\n3. Unit yang tidak diambil lebih dari 30 hari setelah konfirmasi selesai, di luar tanggung jawab toko.\n4. Garansi service berlaku untuk kerusakan yang sama sesuai masa garansi tercatat.',
      warrantyText: 'Garansi service berlaku 30 hari terhitung sejak tanggal unit diserahkan kembali.',
      showQrTracking: true,
    },
  },
  geofenceSettings: {
    latitude: -7.5568,
    longitude: 110.7438,
    maxRadiusMeters: 150,
    workStartHour: '08:30',
    workEndHour: '18:00',
  },
  googleSheetsSettings: {
    webAppUrl: '',
    autoSyncTransactions: true,
    autoSyncServices: true,
    autoSyncAttendance: true,
    lastSyncTime: '',
  },
};

