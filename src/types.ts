export type UserRole = 'Admin' | 'Kasir' | 'Teknisi';

export interface User {
  id?: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
}

export interface Category {
  id: string; // e.g., "KAT-01"
  name: string;
}

export interface Product {
  id: string; // ID_Produk (e.g. "PRD-001" or Barcode "899123456")
  name: string; // Nama_Produk
  category: string; // Kategori
  price: number; // Harga_Jual
  stock: number; // Stok
  minStock: number; // Min_Stok
  imageUrl: string; // Gambar_URL
  barcode?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  serialNumber: string; // Serial_Number (misal: "SN-LNV-99824")
  warranty: string; // Garansi (misal: "1 Tahun", "6 Bulan", "Tidak Ada")
  itemDiscount: number; // Diskon item
}

export type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer Bank' | 'Debit';
export type TransactionStatus = 'Sukses' | 'Void';

export interface TransactionDetail {
  transactionId: string;
  productId: string;
  productName: string;
  qty: number;
  subtotal: number;
  serialNumber: string;
  warranty: string;
}

export interface Transaction {
  id: string; // ID_Transaksi (e.g., "TRX-20260909-001")
  date: string; // ISO / formatted
  cashier: string; // Kasir username
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: TransactionStatus;
  items: TransactionDetail[];
  notes?: string;
}

export type ServiceStatus = 'Diterima' | 'Pengecekan' | 'Diproses' | 'Selesai' | 'Diambil';

export interface ServiceOrder {
  id: string; // ID_Service (e.g., "SRV-2026-001")
  entryDate: string; // Tanggal_Masuk
  finishDate?: string; // Tanggal_Selesai
  customerName: string; // Nama_Pelanggan
  customerPhone: string; // No_WA / Telegram
  device: string; // Nama_Barang (Laptop ASUS TUF, PC Custom, dll)
  complaint: string; // Keluhan (Mati total, bluescreen, ganti thermal paste, dll)
  estimatedCost: number; // Estimasi_Biaya
  finalCost?: number;
  status: ServiceStatus; // Status_Service
  technician: string; // Teknisi
  diagnosis?: string;
  sparepartsUsed?: string;
  accessories?: string; // Kelengkapan (Charger, Tas, Box, dll)
  warranty?: string; // Garansi Service (e.g., "30 Hari")
  downPayment?: number; // DP / Uang Muka
}

export type StockChangeType = 'MASUK' | 'KELUAR' | 'PENYESUAIAN' | 'PENJUALAN' | 'VOID_PENJUALAN';

export interface StockLog {
  id: string; // ID_Log
  date: string;
  productId: string;
  productName: string;
  changeType: StockChangeType; // Tipe_Perubahan
  quantity: number; // Jumlah (positif atau negatif)
  notes: string; // Keterangan
  user: string; // User
}

export type AttendanceType = 'Masuk' | 'Pulang';
export type AttendanceStatus = 'Tepat Waktu' | 'Terlambat' | 'Lembur';

export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  distanceMeters: number;
  isInStoreRadius: boolean;
  addressOrNote: string;
}

export interface AttendanceRecord {
  id: string; // e.g. "ATT-20260909-001"
  userId: string;
  userName: string;
  role: UserRole;
  type: AttendanceType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: string;
  location: AttendanceLocation;
  photoBase64: string; // Data URL foto selfie wajah
  notes?: string;
  status: AttendanceStatus;
}

export type PrinterType =
  | 'thermal-58'
  | 'thermal-80'
  | 'dot-matrix'
  | 'inkjet-a4'
  | 'inkjet-a5';

export interface ServicePrintSettings {
  defaultPrinter: PrinterType;
  copies?: number;
  showStoreHeader: boolean;
  showCustomerInfo: boolean;
  showDeviceDetails: boolean;
  showAccessories: boolean;
  showEstimatedCost: boolean;
  showSignatureSection: boolean;
  showSignatures?: boolean;
  showDiagnosis?: boolean;
  showTerms: boolean;
  termsText: string;
  termsNote?: string;
  warrantyText: string;
  warrantyNote?: string;
  showQrTracking: boolean;
  autoPrintOnSave?: boolean;
}

export interface PrintSettings {
  paperWidth: '58mm' | '80mm'; // Compatible with legacy
  salesPrinterType: PrinterType;
  servicePrinterType?: PrinterType;
  fontSize: 'small' | 'normal' | 'large'; // 11px, 12px, 13px
  showLogo: boolean;
  showStoreAddress: boolean;
  showStoreContact: boolean;
  showCashierName: boolean;
  showSerialNumber: boolean;
  showWarranty: boolean;
  headerNote: string;
  footerNote1: string;
  footerNote2: string;
  autoPrintDialog: boolean;
  printCopies: number; // 1 or 2
  dotMatrixDraftFont: boolean;
  servicePrintSettings: ServicePrintSettings;
}

export interface GeofenceSettings {
  latitude: number;
  longitude: number;
  maxRadiusMeters: number;
  workStartHour: string; // "08:30"
  workEndHour: string; // "18:00"
}

export type StoreTheme = 'dark-stealth' | 'titanium-clean' | 'classic-blue';

export interface StoreSettings {
  theme?: StoreTheme;
  storeName: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string; // Base64 or URL
  showLogoInHeader: boolean;
  printSettings: PrintSettings;
  geofenceSettings: GeofenceSettings;
}

export interface PromoSlide {
  id: string | number;
  badge: string;
  title: string;
  subtitle: string;
  discountBadge: string;
  actionText: string;
  accentColor: string;
  bgGlow: string;
  img: string;
}

export interface PcBundle {
  id: string;
  name: string;
  category: string;
  specs: string[];
  originalPrice: number;
  promoPrice: number;
  badge: string;
  isHot: boolean;
}

export interface PromoCoupon {
  id?: string;
  code: string;
  title: string;
  nominal: string;
  minSpend: string;
  tag: string;
}
