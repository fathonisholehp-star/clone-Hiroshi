import { useState, ChangeEvent, FormEvent } from 'react';
import {
  Store,
  Printer,
  MapPin,
  Save,
  RotateCcw,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Eye,
  Sliders,
  Phone,
  Mail,
  Globe,
  FileText,
  Navigation,
  Clock,
  Sparkles,
  Wrench,
  Package,
  Layers,
  FileCheck,
} from 'lucide-react';
import { StoreSettings, User, PrinterType, ServicePrintSettings } from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/initialData';
import { formatCurrency } from '../utils/formatters';
import { printReceiptElement } from '../utils/printReceiptHelper';

interface SettingsTabProps {
  currentUser: User;
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onResetSettings: () => void;
}

export default function SettingsTab({
  currentUser,
  settings,
  onSaveSettings,
  onResetSettings,
}: SettingsTabProps) {
  // Local form state
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [activeSubSection, setActiveSubSection] = useState<'theme' | 'profile' | 'print' | 'geofence'>(
    'theme'
  );
  const [printCategoryTab, setPrintCategoryTab] = useState<'sales' | 'service'>('sales');
  const [previewDocType, setPreviewDocType] = useState<'sales' | 'service'>('sales');
  const [previewPrinter, setPreviewPrinter] = useState<PrinterType>(
    settings.printSettings.salesPrinterType || 'thermal-58'
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // If not Admin, show restricted access
  if (currentUser.role !== 'Admin') {
    return (
      <div className="bg-white rounded-xl p-8 border border-red-200 text-center max-w-lg mx-auto shadow-sm my-10">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Akses Ditolak</h2>
        <p className="text-sm text-gray-500 mt-1">
          Halaman Pengaturan Toko &amp; Konfigurasi Cetak hanya dapat diakses oleh pengguna dengan hak
          akses <strong>Administrator</strong>. Silakan login menggunakan akun Admin.
        </p>
      </div>
    );
  }

  // Handle Input Changes for General Profile
  const handleProfileChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Print Settings Changes
  const handlePrintChange = (field: keyof StoreSettings['printSettings'], value: any) => {
    setFormData((prev) => ({
      ...prev,
      printSettings: {
        ...prev.printSettings,
        [field]: value,
      },
    }));
  };

  // Handle Service-Specific Print Settings Changes
  const handleServicePrintChange = (
    field: keyof ServicePrintSettings,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      printSettings: {
        ...prev.printSettings,
        servicePrintSettings: {
          ...INITIAL_STORE_SETTINGS.printSettings.servicePrintSettings,
          ...(prev.printSettings.servicePrintSettings || {}),
          [field]: value,
        },
      },
    }));
  };

  // Handle Geofence Settings Changes
  const handleGeofenceChange = (field: keyof StoreSettings['geofenceSettings'], value: any) => {
    setFormData((prev) => ({
      ...prev,
      geofenceSettings: {
        ...prev.geofenceSettings,
        [field]: value,
      },
    }));
  };

  // Logo file upload handler
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 2) {
      alert('Ukuran file logo maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleProfileChange('logoUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Detect GPS location directly from browser
  const handleDetectCurrentLocation = () => {
    setIsDetectingLocation(true);
    setLocationFeedback(null);

    if (!navigator.geolocation) {
      setLocationFeedback('Browser tidak mendukung geolokasi GPS.');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormData((prev) => ({
          ...prev,
          geofenceSettings: {
            ...prev.geofenceSettings,
            latitude: lat,
            longitude: lng,
          },
        }));
        setLocationFeedback(
          `Koordinat berhasil diambil dari perangkat: ${lat}, ${lng} (Akurasi: ±${Math.round(
            pos.coords.accuracy
          )}m)`
        );
        setIsDetectingLocation(false);
      },
      (err) => {
        setLocationFeedback(`Gagal membaca GPS: ${err.message}.`);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit & Save
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Reset to default
  const handleReset = () => {
    if (confirm('Kembalikan semua pengaturan toko, cetak, dan geofence ke konfigurasi default?')) {
      setFormData(INITIAL_STORE_SETTINGS);
      onResetSettings();
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  // Trigger Print Test
  const handleTestPrint = () => {
    const targetId =
      previewDocType === 'sales'
        ? 'settings-preview-receipt'
        : 'settings-preview-service-receipt';
    printReceiptElement(targetId, {
      title: `Tes-Cetak-${previewDocType === 'sales' ? 'Kasir' : 'Servis'}`,
      printerType: previewPrinter,
    });
  };

  // Sample data for live receipt preview
  const sampleItems = [
    {
      name: 'SSD NVMe Kingston 500GB Gen4',
      qty: 1,
      price: 650000,
      sn: 'SN-KNG-99120',
      warranty: '3 Tahun Resmi',
    },
    {
      name: 'RAM DDR4 Corsair 8GB 3200MHz',
      qty: 2,
      price: 340000,
      sn: 'SN-CSR-44102',
      warranty: 'Lifetime Warranty',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-[#E3F2FD] text-[#0D47A1]">
              <Store className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Pengaturan Toko &amp; Sistem
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Kelola profil toko, ganti logo, format cetak struk kasir (thermal 58mm/80mm), dan
            koordinat GPS toko untuk absensi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-initial px-3.5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Default</span>
          </button>
          <button
            id="btn-save-all-settings"
            type="button"
            onClick={handleSubmit}
            className="flex-1 sm:flex-initial px-4 py-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Pengaturan toko, logo, dan preferensi cetak berhasil disimpan secara permanen!</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Tersimpan
          </span>
        </div>
      )}

      {/* 2. Main Grid: Form Sections + Live Receipt Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="bg-white rounded-xl p-1.5 border border-gray-200 shadow-xs flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSubSection('theme')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeSubSection === 'theme'
                  ? 'bg-[#E3F2FD] text-[#0D47A1] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>Tema Toko</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubSection('profile')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeSubSection === 'profile'
                  ? 'bg-[#E3F2FD] text-[#0D47A1] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Profil &amp; Logo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubSection('print')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeSubSection === 'print'
                  ? 'bg-[#E3F2FD] text-[#0D47A1] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubSection('geofence')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeSubSection === 'geofence'
                  ? 'bg-[#E3F2FD] text-[#0D47A1] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Lokasi &amp; GPS</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 0: TEMA & TAMPILAN TOKO KOMPUTER */}
            {activeSubSection === 'theme' && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1E88E5]" />
                    Pilihan Tema &amp; Estetika Toko Komputer
                  </h2>
                  <p className="text-xs text-gray-500">
                    Sesuaikan suasana tampilan POS dan aplikasi dengan estetika toko komputer modern, gaming rig center, atau showroom retail IT premium.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Theme Option 1: Dark Stealth PC */}
                  <div
                    onClick={() => handleProfileChange('theme', 'dark-stealth')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                      (formData.theme || 'dark-stealth') === 'dark-stealth'
                        ? 'border-cyan-500 bg-slate-900 text-white ring-2 ring-cyan-500/20 shadow-lg'
                        : 'border-gray-200 bg-slate-900/90 text-slate-200 hover:border-gray-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                          Rekomendasi PC Store
                        </span>
                        {(formData.theme || 'dark-stealth') === 'dark-stealth' && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <h3 className="text-sm font-black font-mono text-white mb-1">
                        Dark Stealth PC
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        Gaya toko komputer modern, rakitan PC gaming, &amp; hardware enthusiast. Background obsidian gelap dengan border presisi dan aksen neon cyan/ice blue.
                      </p>
                    </div>

                    {/* Preview Swatches */}
                    <div className="p-2 rounded-lg bg-[#090D16] border border-slate-800 flex items-center justify-between gap-1 text-[10px] font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                      </div>
                      <span className="text-cyan-400 font-bold">Obsidian Dark</span>
                    </div>
                  </div>

                  {/* Theme Option 2: Titanium Clean */}
                  <div
                    onClick={() => handleProfileChange('theme', 'titanium-clean')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                      formData.theme === 'titanium-clean'
                        ? 'border-blue-600 bg-white text-gray-900 ring-2 ring-blue-600/20 shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                          Showroom Retail IT
                        </span>
                        {formData.theme === 'titanium-clean' && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <h3 className="text-sm font-black text-gray-900 mb-1">
                        Titanium Clean
                      </h3>
                      <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                        Gaya showroom retail komputer premium (seperti Micro Center atau Apple Store). Canvas titanium terang berpadu header stealth gelap dan aksen tech blue.
                      </p>
                    </div>

                    {/* Preview Swatches */}
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between gap-1 text-[10px] font-mono text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300 inline-block" />
                      </div>
                      <span className="text-blue-700 font-bold">Clean Titanium</span>
                    </div>
                  </div>

                  {/* Theme Option 3: Classic Blue */}
                  <div
                    onClick={() => handleProfileChange('theme', 'classic-blue')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                      formData.theme === 'classic-blue'
                        ? 'border-blue-500 bg-blue-50/50 text-gray-900 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-200 text-gray-700">
                          Standar
                        </span>
                        {formData.theme === 'classic-blue' && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        Classic Hiroshi Blue
                      </h3>
                      <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                        Tampilan awal dengan gradien biru cerah korporat dan palet standard abu-abu.
                      </p>
                    </div>

                    {/* Preview Swatches */}
                    <div className="p-2 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-between gap-1 text-[10px] font-mono text-blue-800">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0D47A1] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
                      </div>
                      <span className="text-blue-800 font-bold">Hiroshi Blue</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                  <div>
                    <strong>Tip Cepat:</strong> Anda juga dapat mengganti tema kapan saja melalui tombol ikon <strong>Bulan / Matahari</strong> di bar header atas.
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shrink-0 ml-3"
                  >
                    Terapkan Tema Ini
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 1: PROFIL & IDENTITAS TOKO */}
            {activeSubSection === 'profile' && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#1E88E5]" />
                    Identitas &amp; Informasi Toko
                  </h2>
                  <p className="text-xs text-gray-500">
                    Informasi ini akan ditampilkan pada header aplikasi, nota service, dan struk
                    pembelian kasir.
                  </p>
                </div>

                {/* Logo Toko Section */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-bold text-gray-700">
                    Logo Toko (Header &amp; Struk)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Logo Preview Circle / Square */}
                    <div className="w-20 h-20 rounded-xl bg-white border border-gray-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo Toko"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <Store className="w-8 h-8 text-gray-400 mx-auto" />
                          <span className="text-[9px] text-gray-400 block mt-0.5">Tanpa Logo</span>
                        </div>
                      )}
                    </div>

                    {/* Logo Controls */}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="py-1.5 px-3 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload File Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.logoUrl && (
                          <button
                            type="button"
                            onClick={() => handleProfileChange('logoUrl', '')}
                            className="py-1.5 px-3 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Hapus Logo
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleProfileChange(
                              'logoUrl',
                              'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=60'
                            )
                          }
                          className="py-1.5 px-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-medium"
                        >
                          Gunakan Sampel Logo
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.logoUrl}
                        onChange={(e) => handleProfileChange('logoUrl', e.target.value)}
                        placeholder="Atau tempel URL gambar logo di sini (https://...)"
                        className="w-full text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
                      />
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={formData.showLogoInHeader}
                          onChange={(e) =>
                            handleProfileChange('showLogoInHeader', e.target.checked)
                          }
                          className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                        />
                        <span className="text-xs text-gray-700">
                          Tampilkan logo toko pada bilah header aplikasi
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Nama Toko & Slogan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Toko / Usaha *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.storeName}
                      onChange={(e) => handleProfileChange('storeName', e.target.value)}
                      placeholder="Contoh: HIROSHI COMPUTER"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Slogan / Tagline
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => handleProfileChange('tagline', e.target.value)}
                      placeholder="Contoh: Toko Komputer, Part PC & Service IT"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Alamat & Kota */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Alamat Lengkap Toko *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      placeholder="Contoh: Jl. Ahmad Yani No. 88"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Kota / Wilayah
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleProfileChange('city', e.target.value)}
                      placeholder="Contoh: Surabaya, Jawa Timur"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Kontak: Telepon, Email, Website */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span>No. Telp / WhatsApp *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="0812-3456-7890"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      <span>Email Resmi</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="info@hiroshicomputer.com"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-gray-500" />
                      <span>Website / Medsos</span>
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleProfileChange('website', e.target.value)}
                      placeholder="www.hiroshicomputer.com"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: PENGATURAN CETAK STRUK & SERAH TERIMA SERVICE */}
            {activeSubSection === 'print' && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Printer className="w-5 h-5 text-[#1E88E5]" />
                      <span>Konfigurasi Printer Penjualan &amp; Serah Terima Service</span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      Sesuaikan berbagai macam printer (Thermal 58/80mm, Dot Matrix NCR, atau Inkjet A4/A5)
                      untuk nota kasir dan tanda terima service.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestPrint}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cetak Uji Coba</span>
                  </button>
                </div>

                {/* Sub-Tabs: Penjualan vs Service */}
                <div className="flex border-b border-gray-200 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintCategoryTab('sales');
                      setPreviewDocType('sales');
                      setPreviewPrinter(formData.printSettings.salesPrinterType || 'thermal-58');
                    }}
                    className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      printCategoryTab === 'sales'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>1. Printer Nota Penjualan Kasir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPrintCategoryTab('service');
                      setPreviewDocType('service');
                      setPreviewPrinter(formData.printSettings.servicePrinterType || 'inkjet-a5');
                    }}
                    className={`pb-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      printCategoryTab === 'service'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>2. Printer Nota &amp; Serah Terima Service</span>
                  </button>
                </div>

                {/* TAB 1: NOTA PENJUALAN KASIR */}
                {printCategoryTab === 'sales' && (
                  <div className="space-y-5">
                    {/* Pilih Hardware Printer Penjualan */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">
                        Tipe Printer Kasir Utama (Penjualan)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {(
                          [
                            {
                              id: 'thermal-58',
                              name: 'Thermal 58mm',
                              desc: 'Mini Bluetooth POS',
                              icon: '📱',
                            },
                            {
                              id: 'thermal-80',
                              name: 'Thermal 80mm',
                              desc: 'Kasir Standar POS',
                              icon: '🧾',
                            },
                            {
                              id: 'dot-matrix',
                              name: 'Dot Matrix NCR',
                              desc: 'Epson LX-310 Rangkap',
                              icon: '🖨️',
                            },
                            {
                              id: 'inkjet-a5',
                              name: 'Nota A5',
                              desc: '1/2 Folio Toko',
                              icon: '📄',
                            },
                            {
                              id: 'inkjet-a4',
                              name: 'Faktur A4',
                              desc: 'Invoice Full Lembar',
                              icon: '📑',
                            },
                          ] as const
                        ).map((p) => {
                          const isSelected =
                            (formData.printSettings.salesPrinterType || 'thermal-58') === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                handlePrintChange('salesPrinterType', p.id);
                                if (p.id === 'thermal-80') {
                                  handlePrintChange('paperWidth', '80mm');
                                } else if (p.id === 'thermal-58') {
                                  handlePrintChange('paperWidth', '58mm');
                                }
                                setPreviewPrinter(p.id);
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="text-xl mb-1">{p.icon}</div>
                              <span
                                className={`text-xs font-bold leading-tight ${
                                  isSelected ? 'text-blue-900' : 'text-gray-800'
                                }`}
                              >
                                {p.name}
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5">{p.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ukuran Huruf & Rangkap */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Ukuran Huruf Struk
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['small', 'normal', 'large'] as const).map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handlePrintChange('fontSize', size)}
                              className={`py-2 px-2 rounded-lg text-xs font-bold border capitalize transition-all cursor-pointer ${
                                formData.printSettings.fontSize === size
                                  ? 'bg-[#E3F2FD] border-[#1E88E5] text-[#0D47A1] shadow-xs'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {size === 'small' ? 'Kecil' : size === 'normal' ? 'Normal' : 'Besar'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Jumlah Rangkap Cetak Penjualan
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handlePrintChange('printCopies', num)}
                              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                (formData.printSettings.printCopies || 1) === num
                                  ? 'bg-[#E3F2FD] border-[#1E88E5] text-[#0D47A1] shadow-xs'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {num === 1 ? '1x Lembar (Pelanggan)' : '2x Rangkap (Toko + Customer)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Checklist Elemen Struk */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                      <span className="text-xs font-bold text-gray-800 block">
                        Elemen yang Ditampilkan pada Struk Kasir:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.printSettings.showLogo}
                            onChange={(e) => handlePrintChange('showLogo', e.target.checked)}
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Tampilkan Logo Toko di Atas Struk</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.printSettings.showStoreAddress}
                            onChange={(e) =>
                              handlePrintChange('showStoreAddress', e.target.checked)
                            }
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Tampilkan Alamat Toko ({formData.address})</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.printSettings.showStoreContact}
                            onChange={(e) =>
                              handlePrintChange('showStoreContact', e.target.checked)
                            }
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Tampilkan No. Telp / WA ({formData.phone})</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.printSettings.showCashierName}
                            onChange={(e) => handlePrintChange('showCashierName', e.target.checked)}
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Tampilkan Nama Kasir</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.printSettings.showSerialNumber}
                            onChange={(e) =>
                              handlePrintChange('showSerialNumber', e.target.checked)
                            }
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Tampilkan Serial Number (SN) Unit</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.printSettings.showWarranty}
                            onChange={(e) => handlePrintChange('showWarranty', e.target.checked)}
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Tampilkan Info Garansi Tiap Produk</span>
                        </label>
                      </div>
                    </div>

                    {/* Header & Footer Custom Texts */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Teks Header / Slogan Tambahan
                        </label>
                        <input
                          type="text"
                          value={formData.printSettings.headerNote}
                          onChange={(e) => handlePrintChange('headerNote', e.target.value)}
                          placeholder="Contoh: SOLUSI IT & SERVICE TERPERCAYA"
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Catatan Kaki Struk Baris 1 (Ketentuan Garansi)
                        </label>
                        <input
                          type="text"
                          value={formData.printSettings.footerNote1}
                          onChange={(e) => handlePrintChange('footerNote1', e.target.value)}
                          placeholder="Simpan struk ini sebagai kartu garansi resmi."
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Catatan Kaki Struk Baris 2 (Syarat Retur / Kebijakan)
                        </label>
                        <input
                          type="text"
                          value={formData.printSettings.footerNote2}
                          onChange={(e) => handlePrintChange('footerNote2', e.target.value)}
                          placeholder="Barang yang dibeli tidak dapat ditukar kecuali ada perjanjian."
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Auto Print dialog toggle */}
                    <div className="pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={formData.printSettings.autoPrintDialog}
                          onChange={(e) => handlePrintChange('autoPrintDialog', e.target.checked)}
                          className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#0D47A1] block">
                            Otomatis Buka Dialog Cetak Saat Transaksi Kasir Selesai
                          </span>
                          <span className="text-[11px] text-gray-600">
                            Memudahkan kasir langsung mencetak tanpa perlu klik manual.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: NOTA & SERAH TERIMA SERVICE */}
                {printCategoryTab === 'service' && (
                  <div className="space-y-5">
                    {/* Hardware Printer Service Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">
                        Tipe Printer Khusus Serah Terima &amp; Nota Service
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {(
                          [
                            {
                              id: 'thermal-58',
                              name: 'Thermal 58mm',
                              desc: 'Kecil Ringkas',
                              icon: '📱',
                            },
                            {
                              id: 'thermal-80',
                              name: 'Thermal 80mm',
                              desc: 'Standar POS',
                              icon: '🧾',
                            },
                            {
                              id: 'dot-matrix',
                              name: 'Dot Matrix NCR',
                              desc: 'Form Rangkap Kertas',
                              icon: '🖨️',
                            },
                            {
                              id: 'inkjet-a5',
                              name: 'Nota A5 (Rekomendasi)',
                              desc: '1/2 Folio Standar IT',
                              icon: '📄',
                            },
                            {
                              id: 'inkjet-a4',
                              name: 'Faktur A4 Lembar Kerja',
                              desc: 'Lengkap dengan Form',
                              icon: '📑',
                            },
                          ] as const
                        ).map((p) => {
                          const isSelected =
                            (formData.printSettings.servicePrinterType || 'inkjet-a5') === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                handlePrintChange('servicePrinterType', p.id);
                                setPreviewPrinter(p.id);
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="text-xl mb-1">{p.icon}</div>
                              <span
                                className={`text-xs font-bold leading-tight ${
                                  isSelected ? 'text-blue-900' : 'text-gray-800'
                                }`}
                              >
                                {p.name}
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5">{p.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rangkap Cetak Service */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Rangkap Dokumen Serah Terima Service
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        {[1, 2].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleServicePrintChange('copies', num)}
                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              (formData.printSettings.servicePrintSettings?.copies || 2) === num
                                ? 'bg-[#E3F2FD] border-[#1E88E5] text-[#0D47A1] shadow-xs'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {num === 1
                              ? '1 Lembar (Tanda Terima)'
                              : '2 Rangkap (Pelanggan + Arsip Teknisi)'}
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-500 mt-1 block">
                        Untuk bengkel/service center, 2 rangkap sangat disarankan untuk bukti pengambilan unit.
                      </span>
                    </div>

                    {/* Checklist Pengaturan Service */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                      <span className="text-xs font-bold text-gray-800 block">
                        Elemen Dokumen Serah Terima Service:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={
                              formData.printSettings.servicePrintSettings?.showAccessories !== false
                            }
                            onChange={(e) =>
                              handleServicePrintChange('showAccessories', e.target.checked)
                            }
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Catat Kelengkapan Unit Bawaan (Charger, Tas, Box)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={
                              formData.printSettings.servicePrintSettings?.showDiagnosis !== false
                            }
                            onChange={(e) =>
                              handleServicePrintChange('showDiagnosis', e.target.checked)
                            }
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Tampilkan Diagnosa Masuk &amp; Tindakan Teknisi</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={
                              formData.printSettings.servicePrintSettings?.showSignatures !== false
                            }
                            onChange={(e) =>
                              handleServicePrintChange('showSignatures', e.target.checked)
                            }
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Kolom Tanda Tangan Serah Terima (Teknisi &amp; Pelanggan)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={
                              formData.printSettings.servicePrintSettings?.showTerms !== false
                            }
                            onChange={(e) =>
                              handleServicePrintChange('showTerms', e.target.checked)
                            }
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Tampilkan Syarat &amp; Ketentuan Hukum Service</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={
                              formData.printSettings.servicePrintSettings?.autoPrintOnSave ?? false
                            }
                            onChange={(e) =>
                              handleServicePrintChange('autoPrintOnSave', e.target.checked)
                            }
                            className="rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                          />
                          <span>Otomatis Munculkan Cetak Saat Tiket Service Didaftarkan</span>
                        </label>
                      </div>
                    </div>

                    {/* Syarat & Ketentuan Service Textarea */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Syarat &amp; Ketentuan Serah Terima Service (Dicetak di Lembar Tanda Terima)
                        </label>
                        <textarea
                          rows={3}
                          value={
                            formData.printSettings.servicePrintSettings?.termsNote ||
                            '1. Unit yang tidak diambil lebih dari 30 hari di luar tanggung jawab toko.\n2. Backup data pribadi merupakan tanggung jawab pemilik unit.\n3. Pengambilan unit wajib membawa lembar bukti tanda terima ini.'
                          }
                          onChange={(e) =>
                            handleServicePrintChange('termsNote', e.target.value)
                          }
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Kebijakan Garansi Service
                        </label>
                        <input
                          type="text"
                          value={
                            formData.printSettings.servicePrintSettings?.warrantyNote ||
                            'Garansi berlaku sesuai nota perbaikan dengan syarat segel utuh dan nota fisik dibawa.'
                          }
                          onChange={(e) =>
                            handleServicePrintChange('warrantyNote', e.target.value)
                          }
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: LOKASI & GEOFENCE PRESENSI */}
            {activeSubSection === 'geofence' && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-5">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1E88E5]" />
                      Titik Lokasi Toko &amp; Geofencing Absensi
                    </h2>
                    <p className="text-xs text-gray-500">
                      Koordinat GPS dan batas jarak (radius) agar presensi wajah teknisi/kasir
                      dinyatakan berada di dalam area toko resmi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="px-3 py-1.5 bg-[#E3F2FD] hover:bg-blue-100 text-[#0D47A1] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200"
                  >
                    <Navigation
                      className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`}
                    />
                    <span>{isDetectingLocation ? 'Membaca GPS...' : 'Ambil GPS Sekarang'}</span>
                  </button>
                </div>

                {locationFeedback && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                    {locationFeedback}
                  </div>
                )}

                {/* Koordinat Lat & Lng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Latitude Toko *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.geofenceSettings.latitude}
                      onChange={(e) =>
                        handleGeofenceChange('latitude', parseFloat(e.target.value) || 0)
                      }
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Longitude Toko *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.geofenceSettings.longitude}
                      onChange={(e) =>
                        handleGeofenceChange('longitude', parseFloat(e.target.value) || 0)
                      }
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Radius Maksimal & Jam Kerja */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Radius Presensi Sah (Meter)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={formData.geofenceSettings.maxRadiusMeters}
                      onChange={(e) =>
                        handleGeofenceChange(
                          'maxRadiusMeters',
                          parseInt(e.target.value, 10) || 100
                        )
                      }
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Standar rekomendasi: 50m - 100m
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>Batas Jam Masuk</span>
                    </label>
                    <input
                      type="time"
                      value={formData.geofenceSettings.workStartHour}
                      onChange={(e) =>
                        handleGeofenceChange('workStartHour', e.target.value)
                      }
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Lewat jam ini dihitung Terlambat
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>Jam Pulang / Lembur</span>
                    </label>
                    <input
                      type="time"
                      value={formData.geofenceSettings.workEndHour}
                      onChange={(e) =>
                        handleGeofenceChange('workEndHour', e.target.value)
                      }
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Absen pulang setelah ini dihitung Lembur
                    </span>
                  </div>
                </div>

                {/* Google Maps link preview */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-semibold text-gray-800 block">
                      Pratinjau Koordinat di Google Maps:
                    </span>
                    <span className="text-gray-500 font-mono text-[11px]">
                      {formData.geofenceSettings.latitude},{' '}
                      {formData.geofenceSettings.longitude}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${formData.geofenceSettings.latitude},${formData.geofenceSettings.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-blue-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Buka Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Bottom Save Bar inside Form */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              >
                Reset Default
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Semua Pengaturan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Dynamic Live Preview for Sales & Service Receipts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                <Eye className="w-4 h-4 text-[#1E88E5]" />
                <span>Live Preview Cetak Nota</span>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100 uppercase">
                {previewPrinter}
              </span>
            </div>

            {/* Document Selector Pills */}
            <div className="my-2.5 flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPreviewDocType('sales');
                  setPreviewPrinter(formData.printSettings.salesPrinterType || 'thermal-58');
                }}
                className={`flex-1 py-1.5 px-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  previewDocType === 'sales'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Nota Kasir</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewDocType('service');
                  setPreviewPrinter(formData.printSettings.servicePrinterType || 'inkjet-a5');
                }}
                className={`flex-1 py-1.5 px-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  previewDocType === 'service'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Serah Terima Service</span>
              </button>
            </div>

            {/* Quick Profile Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 text-[11px]">
              {(
                [
                  { id: 'thermal-58', label: '58mm' },
                  { id: 'thermal-80', label: '80mm' },
                  { id: 'dot-matrix', label: 'Dot Matrix' },
                  { id: 'inkjet-a5', label: 'Nota A5' },
                  { id: 'inkjet-a4', label: 'Faktur A4' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreviewPrinter(p.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 font-medium ${
                    previewPrinter === p.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Receipt Preview Canvas */}
            <div className="bg-gray-100 p-3 sm:p-4 rounded-xl border border-gray-200 flex items-center justify-center overflow-x-auto min-h-[440px] max-h-[640px] overflow-y-auto">
              {/* 1. SALES RECEIPT PREVIEW */}
              {previewDocType === 'sales' && (
                <div
                  style={{
                    fontSize:
                      formData.printSettings.fontSize === 'small'
                        ? '11px'
                        : formData.printSettings.fontSize === 'large'
                        ? '13px'
                        : '12px',
                  }}
                  id="settings-preview-receipt"
                  className={`font-mono text-gray-900 bg-white border border-dashed border-gray-400 p-4 rounded-xs shadow-md transition-all ${
                    previewPrinter === 'thermal-58'
                      ? 'w-[280px]'
                      : previewPrinter === 'thermal-80'
                      ? 'w-[340px]'
                      : previewPrinter === 'dot-matrix'
                      ? 'w-[360px] bg-amber-50/40 border-amber-300'
                      : 'w-[400px]'
                  }`}
                >
                  {/* Store Header */}
                  <div className="text-center pb-2 border-b border-dashed border-gray-400">
                    {formData.printSettings.showLogo && formData.logoUrl && (
                      <div className="w-12 h-12 mx-auto mb-1 rounded-md overflow-hidden flex items-center justify-center">
                        <img
                          src={formData.logoUrl}
                          alt="Logo Toko"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <div className="font-bold text-sm tracking-wider uppercase">
                      {formData.storeName || 'HIROSHI COMPUTER'}
                    </div>

                    {formData.tagline && (
                      <div className="text-[10px] text-gray-600 leading-tight">
                        {formData.tagline}
                      </div>
                    )}

                    {formData.printSettings.showStoreAddress && formData.address && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {formData.address}
                        {formData.city ? `, ${formData.city}` : ''}
                      </div>
                    )}

                    {formData.printSettings.showStoreContact && formData.phone && (
                      <div className="text-[10px] text-gray-500">Telp/WA: {formData.phone}</div>
                    )}

                    {formData.printSettings.headerNote && (
                      <div className="text-[10px] font-semibold text-gray-700 mt-1 uppercase border-t border-dashed border-gray-300 pt-1">
                        {formData.printSettings.headerNote}
                      </div>
                    )}
                  </div>

                  {/* Transaction Meta Sample */}
                  <div className="py-2 border-b border-dashed border-gray-400 text-[11px] space-y-0.5">
                    <div className="flex justify-between">
                      <span>No. TRX:</span>
                      <span className="font-semibold">TRX-20260909-001</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>2026-09-09 14:25</span>
                    </div>
                    {formData.printSettings.showCashierName && (
                      <div className="flex justify-between">
                        <span>Kasir:</span>
                        <span>{currentUser.fullName.split(' ')[0]}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Metode:</span>
                      <span className="font-bold">Tunai / QRIS</span>
                    </div>
                  </div>

                  {/* Sample Items List */}
                  <div className="py-2 border-b border-dashed border-gray-400 space-y-2">
                    {sampleItems.map((it, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="font-semibold text-gray-900 leading-tight">{it.name}</div>
                        <div className="flex justify-between text-[11px] text-gray-600">
                          <span>
                            {it.qty} x {formatCurrency(it.price)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(it.price * it.qty)}
                          </span>
                        </div>
                        {formData.printSettings.showSerialNumber && it.sn && (
                          <div className="text-[10px] text-blue-700 font-medium">SN: {it.sn}</div>
                        )}
                        {formData.printSettings.showWarranty && it.warranty && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                            <ShieldCheck className="w-3 h-3 shrink-0" />
                            <span>Garansi: {it.warranty}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="py-2 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(1330000)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs text-black pt-1 border-t border-dashed border-gray-400">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(1330000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bayar (Tunai):</span>
                      <span>{formatCurrency(1350000)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Kembalian:</span>
                      <span>{formatCurrency(20000)}</span>
                    </div>
                  </div>

                  {/* Footer Notes */}
                  <div className="pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500 space-y-1">
                    <div className="font-semibold text-emerald-600">
                      Terima Kasih Atas Kunjungan Anda
                    </div>
                    {formData.printSettings.footerNote1 && (
                      <div>{formData.printSettings.footerNote1}</div>
                    )}
                    {formData.printSettings.footerNote2 && (
                      <div>{formData.printSettings.footerNote2}</div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. SERVICE HANDOVER RECEIPT PREVIEW */}
              {previewDocType === 'service' && (
                <div
                  id="settings-preview-service-receipt"
                  className={`font-sans text-gray-900 bg-white border border-gray-300 p-4 rounded-xs shadow-md transition-all text-xs ${
                    previewPrinter === 'thermal-58'
                      ? 'w-[280px] font-mono text-[11px]'
                      : previewPrinter === 'thermal-80'
                      ? 'w-[340px] font-mono text-xs'
                      : previewPrinter === 'dot-matrix'
                      ? 'w-[380px] font-mono bg-amber-50/30 border-amber-300'
                      : 'w-[430px]'
                  }`}
                >
                  {/* Service Header */}
                  <div className="text-center pb-2 border-b-2 border-gray-800">
                    <div className="font-black text-sm uppercase tracking-wide">
                      {formData.storeName || 'HIROSHI COMPUTER'}
                    </div>
                    <div className="text-[10px] text-gray-600 font-medium">
                      {formData.address} • Telp/WA: {formData.phone}
                    </div>
                    <div className="inline-block bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 mt-1 rounded uppercase tracking-wider">
                      BUKTI TANDA TERIMA SERVICE
                    </div>
                  </div>

                  {/* Service Ticket Meta */}
                  <div className="py-2 border-b border-gray-200 grid grid-cols-2 gap-1 text-[11px]">
                    <div>
                      <span className="text-gray-500">No. Tiket:</span>{' '}
                      <span className="font-bold">SRV-20260912-004</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">Tgl:</span> 12/09/2026
                    </div>
                    <div>
                      <span className="text-gray-500">Pelanggan:</span>{' '}
                      <span className="font-semibold">Bpk. Haryono</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">WA:</span> 081234567890
                    </div>
                  </div>

                  {/* Unit & Issues */}
                  <div className="py-2 border-b border-gray-200 space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Tipe Unit / Seri:</span>
                      <span className="font-bold text-gray-900">
                        Laptop ASUS TUF Gaming FX505 (SN: FX505-88210)
                      </span>
                    </div>

                    {formData.printSettings.servicePrintSettings?.showAccessories !== false && (
                      <div className="bg-gray-50 p-1.5 rounded border border-gray-200 text-[10px]">
                        <span className="font-bold text-gray-700">Kelengkapan Unit:</span> Unit Laptop + Adaptor Charger Original 20V + Tas
                      </div>
                    )}

                    <div className="bg-red-50/70 p-1.5 rounded border border-red-200 text-[10px]">
                      <span className="font-bold text-red-800">Keluhan:</span> Mati mendadak saat gaming &amp; kipas berisik
                    </div>

                    {formData.printSettings.servicePrintSettings?.showDiagnosis !== false && (
                      <div className="bg-blue-50/70 p-1.5 rounded border border-blue-200 text-[10px]">
                        <span className="font-bold text-blue-800">Diagnosa / Tindakan:</span> Repaste Thermal Paste Grizzly + Deep Clean Fan + Reinstall OS
                      </div>
                    )}
                  </div>

                  {/* Biaya & Status DP */}
                  <div className="py-2 border-b border-gray-200 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimasi Biaya:</span>
                      <span className="font-semibold">{formatCurrency(250000)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Uang Muka (DP):</span>
                      <span className="font-bold">{formatCurrency(100000)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 pt-0.5 border-t border-dashed border-gray-300">
                      <span>Sisa Pembayaran:</span>
                      <span>{formatCurrency(150000)}</span>
                    </div>
                    <div className="text-[10px] text-blue-700 font-medium pt-0.5">
                      Garansi Service: 1 Bulan (Suku Cadang &amp; Jasa)
                    </div>
                  </div>

                  {/* Signatures */}
                  {formData.printSettings.servicePrintSettings?.showSignatures !== false && (
                    <div className="py-2.5 grid grid-cols-2 gap-4 text-center text-[10px] text-gray-700">
                      <div>
                        <div>Teknisi Toko</div>
                        <div className="h-10 border-b border-dotted border-gray-400 mt-2"></div>
                        <div className="text-gray-500 mt-0.5">({currentUser.fullName})</div>
                      </div>
                      <div>
                        <div>Yang Menyerahkan</div>
                        <div className="h-10 border-b border-dotted border-gray-400 mt-2"></div>
                        <div className="text-gray-500 mt-0.5">(Pelanggan)</div>
                      </div>
                    </div>
                  )}

                  {/* Terms */}
                  {formData.printSettings.servicePrintSettings?.showTerms !== false && (
                    <div className="pt-2 border-t border-gray-200 text-[9px] text-gray-500 leading-tight">
                      <div className="font-bold text-gray-700 mb-0.5">Syarat &amp; Ketentuan:</div>
                      <div>
                        1. Unit yang tidak diambil &gt; 30 hari di luar tanggung jawab toko.
                      </div>
                      <div>2. Harap membawa bukti tanda terima ini saat pengambilan.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Test Print Button */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleTestPrint}
                className="w-full py-2 px-3 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Tes Cetak Format Dokumen Ini</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
