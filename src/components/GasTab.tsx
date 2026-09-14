import { useState, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Layers,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Link,
  RefreshCw,
  Send,
  Wifi,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { GAS_DEPLOY_STEPS, GAS_CODE_GS } from '../gas/gasCode';
import { Product, Transaction, ServiceOrder, AttendanceRecord, StoreSettings } from '../types';
import {
  testGoogleSheetsConnection,
  syncAllDataToSheets,
} from '../utils/googleSheetsSync';

interface GasTabProps {
  storeSettings?: StoreSettings;
  onUpdateSettings?: (settings: StoreSettings) => void;
  products?: Product[];
  transactions?: Transaction[];
  services?: ServiceOrder[];
  attendance?: AttendanceRecord[];
}

export default function GasTab({
  storeSettings,
  onUpdateSettings,
  products = [],
  transactions = [],
  services = [],
  attendance = [],
}: GasTabProps) {
  const [subTab, setSubTab] = useState<'steps' | 'sync' | 'code_gs' | 'index_html' | 'schema'>('steps');
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('// Memuat isi file Index.html...');

  // State untuk Integrasi & Sinkronisasi
  const initialUrl = storeSettings?.googleSheetsSettings?.webAppUrl || localStorage.getItem('hiroshi_gas_url') || '';
  const [webAppUrl, setWebAppUrl] = useState(initialUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/Index.html')
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then((data) => setHtmlContent(data))
      .catch(() => {
        setHtmlContent(
          '<!-- Silakan lihat file /gas_Index.html di root direktori proyek ini -->'
        );
      });
  }, []);

  const handleCopy = (text: string, type: 'gs' | 'html') => {
    navigator.clipboard.writeText(text);
    if (type === 'gs') {
      setCopiedGs(true);
      setTimeout(() => setCopiedGs(false), 2500);
    } else {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  const downloadFile = (filename: string, text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveUrl = (urlToSave: string) => {
    setWebAppUrl(urlToSave);
    localStorage.setItem('hiroshi_gas_url', urlToSave);
    if (storeSettings && onUpdateSettings) {
      const updated: StoreSettings = {
        ...storeSettings,
        googleSheetsSettings: {
          webAppUrl: urlToSave,
          autoSyncTransactions: storeSettings.googleSheetsSettings?.autoSyncTransactions ?? true,
          autoSyncServices: storeSettings.googleSheetsSettings?.autoSyncServices ?? true,
          autoSyncAttendance: storeSettings.googleSheetsSettings?.autoSyncAttendance ?? true,
          lastSyncTime: storeSettings.googleSheetsSettings?.lastSyncTime || '',
        },
      };
      onUpdateSettings(updated);
    }
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({ success: false, message: 'Harap masukkan URL Web App Google Sheets terlebih dahulu!' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGoogleSheetsConnection(webAppUrl);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Gagal terhubung' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncAll = async () => {
    if (!webAppUrl.trim()) {
      setSyncResult({ success: false, message: 'Harap hubungkan URL Web App terlebih dahulu!' });
      return;
    }
    setIsSyncingAll(true);
    setSyncResult(null);
    try {
      const res = await syncAllDataToSheets(webAppUrl, {
        products,
        transactions,
        services,
        attendance,
      });
      setSyncResult(res);
      if (res.success && storeSettings && onUpdateSettings) {
        const now = new Date().toLocaleString('id-ID');
        onUpdateSettings({
          ...storeSettings,
          googleSheetsSettings: {
            ...storeSettings.googleSheetsSettings!,
            lastSyncTime: now,
          },
        });
      }
    } catch (err: any) {
      setSyncResult({ success: false, message: err.message || 'Gagal sinkronisasi data' });
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#E3F2FD] text-[#0D47A1]">
                Google Apps Script Ready 🟢
              </span>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Integrasi &amp; Deployment Google Sheets
              </h2>
            </div>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl">
              Aplikasi ini siap langsung dideploy ke Google Sheets melalui Google Apps Script. Dilengkapi dengan auto-setup 9 tabel database, toolbar menu, dan sinkronisasi data real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buka Google Sheets Baru</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Sub-tabs switch */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
          {[
            { id: 'steps', label: '1. Panduan Deployment (Langsung Jadi)', icon: CheckCircle2 },
            { id: 'sync', label: '2. 🔗 Hubungkan & Sinkronisasi', icon: Link },
            { id: 'code_gs', label: '3. Code.gs (Backend Script)', icon: Code2 },
            { id: 'index_html', label: '4. Index.html (Frontend Web App)', icon: FileCode },
            { id: 'schema', label: '5. Skema 9 Sheet Database', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = subTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`gas-subtab-${tab.id}`}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#1E88E5] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: DEPLOYMENT STEPS */}
      {subTab === 'steps' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {GAS_DEPLOY_STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0D47A1] text-white text-xs font-black flex items-center justify-center">
                      {item.step}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pl-8">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#1E88E5] font-semibold pl-8">
                  <span>Langkah {item.step} dari 6</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#E3F2FD] border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-sm text-[#0D47A1]">
              <Sparkles className="w-4 h-4" />
              <span>Keunggulan Deployment Langsung ke Google Sheets:</span>
            </div>
            <p>
              &bull; <strong>Auto-Setup Database:</strong> Seluruh 9 tabel sheet (Produk, Transaksi, DetailTransaksi, Service, User, Kategori, StokLog, Absensi, Pengaturan) otomatis terbuat saat pertama kali dibuka.
            </p>
            <p>
              &bull; <strong>Menu Toolbar di Spreadsheet:</strong> Menu <em>"🏪 Hiroshi POS"</em> otomatis muncul di toolbar Google Sheets Anda untuk membuka POS langsung dalam jendela modal dialog atau sidebar!
            </p>
            <p>
              &bull; <strong>Gratis Selamanya:</strong> Menggunakan hosting Google Apps Script dan database Google Drive tanpa biaya bulanan.
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 2: HUBUNGKAN & SINKRONISASI */}
      {subTab === 'sync' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Link className="w-4 h-4 text-[#1E88E5]" />
                  <span>Koneksi URL Web App Google Sheets</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Masukkan URL Web App yang Anda dapatkan setelah melakukan Deploy di Google Apps Script.
                </p>
              </div>

              {webAppUrl ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>URL Terdaftar</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Belum Terhubung</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">
                URL Web App Google Apps Script (exec):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={webAppUrl}
                  onChange={(e) => handleSaveUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-lg bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Wifi className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse' : ''}`} />
                  <span>{isTesting ? 'Menguji...' : 'Uji Koneksi (Ping)'}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Format: <code>https://script.google.com/macros/s/ID_DEPLOYMENT/exec</code>
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {testResult.success ? 'Koneksi Berhasil!' : 'Koneksi Gagal'}
                  </div>
                  <div className="mt-0.5 text-[11px]">{testResult.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* SINKRONISASI MANUAL & OTOMATIS */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <span>Sinkronisasi Data ke Google Sheets</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kirim seluruh data produk, transaksi, servis, dan absensi dari aplikasi ini ke spreadsheet Anda.
                </p>
              </div>

              {storeSettings?.googleSheetsSettings?.lastSyncTime && (
                <span className="text-[11px] text-gray-500">
                  Terakhir sinkron: <strong>{storeSettings.googleSheetsSettings.lastSyncTime}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-lg font-bold text-gray-900">{products.length}</div>
                <div className="text-[11px] text-gray-500 font-medium">Produk</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-lg font-bold text-gray-900">{transactions.length}</div>
                <div className="text-[11px] text-gray-500 font-medium">Transaksi</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-lg font-bold text-gray-900">{services.length}</div>
                <div className="text-[11px] text-gray-500 font-medium">Service</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-lg font-bold text-gray-900">{attendance.length}</div>
                <div className="text-[11px] text-gray-500 font-medium">Presensi</div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncingAll || !webAppUrl.trim()}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-bounce' : ''}`} />
                <span>
                  {isSyncingAll ? 'Mengirim Data ke Sheets...' : 'Kirim Seluruh Data ke Google Sheets'}
                </span>
              </button>

              {webAppUrl && (
                <a
                  href={webAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Buka Web App di Tab Baru</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                </a>
              )}
            </div>

            {syncResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  syncResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {syncResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {syncResult.success ? 'Sinkronisasi Selesai!' : 'Sinkronisasi Gagal'}
                  </div>
                  <div className="mt-0.5 text-[11px]">{syncResult.message}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CODE.GS */}
      {subTab === 'code_gs' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-gray-900 text-white flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-bold text-blue-200">Code.gs</span>
              <span className="text-[11px] text-gray-400">
                (Google Apps Script Backend Server &amp; Auto-Setup)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-codegs"
                onClick={() => handleCopy(GAS_CODE_GS, 'gs')}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedGs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGs ? 'Tersalin!' : 'Salin Code.gs'}</span>
              </button>

              <button
                onClick={() => downloadFile('Code.gs', GAS_CODE_GS)}
                className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .gs</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto max-h-[600px] select-all leading-relaxed">
            <pre>{GAS_CODE_GS}</pre>
          </div>
        </div>
      )}

      {/* SUBTAB 4: INDEX.HTML */}
      {subTab === 'index_html' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-gray-900 text-white flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-emerald-200">Index.html</span>
              <span className="text-[11px] text-gray-400">
                (Single File Frontend Vanilla JS &amp; Pure CSS)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-indexhtml"
                onClick={() => handleCopy(htmlContent, 'html')}
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHtml ? 'Tersalin!' : 'Salin Index.html'}</span>
              </button>

              <button
                onClick={() => downloadFile('Index.html', htmlContent)}
                className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .html</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-950 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[600px] select-all leading-relaxed">
            <pre>{htmlContent}</pre>
          </div>
        </div>
      )}

      {/* SUBTAB 5: SCHEMA */}
      {subTab === 'schema' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: '1. Sheet: Produk',
              desc: 'Master data barang dagangan, laptop, sparepart, dan jasa.',
              columns: ['ID_Produk', 'Nama_Produk', 'Kategori', 'Harga_Jual', 'Stok', 'Min_Stok', 'Gambar_URL', 'Barcode'],
            },
            {
              name: '2. Sheet: Transaksi',
              desc: 'Header ringkasan nota penjualan yang telah terverifikasi.',
              columns: ['ID_Transaksi', 'Tanggal', 'Kasir', 'Subtotal', 'Diskon', 'Total', 'Metode_Bayar', 'Status'],
            },
            {
              name: '3. Sheet: DetailTransaksi',
              desc: 'Rincian item produk terjual, Serial Number (SN), dan garansi.',
              columns: ['ID_Transaksi', 'ID_Produk', 'Nama_Produk', 'Qty', 'Subtotal', 'Serial_Number', 'Garansi'],
            },
            {
              name: '4. Sheet: Service',
              desc: 'Tiket perbaikan komputer/laptop dari pelanggan masuk hingga selesai.',
              columns: ['ID_Service', 'Tanggal_Masuk', 'Tanggal_Selesai', 'Nama_Pelanggan', 'No_WA', 'Nama_Barang', 'Keluhan', 'Estimasi_Biaya', 'Status_Service', 'Teknisi', 'Kelengkapan', 'Diagnosa'],
            },
            {
              name: '5. Sheet: User',
              desc: 'Kredensial login dan role akses (Admin, Kasir, Teknisi).',
              columns: ['Username', 'Password', 'Role'],
            },
            {
              name: '6. Sheet: Kategori',
              desc: 'Klasifikasi produk (Laptop, Part PC, Aksesoris, Peripheral, Jasa Service).',
              columns: ['ID_Kategori', 'Nama_Kategori'],
            },
            {
              name: '7. Sheet: StokLog',
              desc: 'Audit trail setiap perubahan stok: masuk, penjualan, void, penyesuaian.',
              columns: ['ID_Log', 'Tanggal', 'ID_Produk', 'Tipe_Perubahan', 'Jumlah', 'Keterangan', 'User'],
            },
            {
              name: '8. Sheet: Absensi',
              desc: 'Pencatatan presensi masuk dan pulang karyawan berbasis geolokasi.',
              columns: ['ID_Absensi', 'Tanggal', 'Jam', 'ID_User', 'Nama_User', 'Role', 'Tipe', 'Latitude', 'Longitude', 'Jarak_Meter', 'Status_Lokasi', 'Status_Kehadiran', 'Keterangan'],
            },
            {
              name: '9. Sheet: Pengaturan',
              desc: 'Konfigurasi profil toko Hiroshi Computer dan kontak resmi.',
              columns: ['Kunci_Pengaturan', 'Nilai', 'Terakhir_Diperbarui'],
            },
          ].map((table) => (
            <div
              key={table.name}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0D47A1]">{table.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {table.columns.length} Kolom
                </span>
              </div>
              <p className="text-xs text-gray-500">{table.desc}</p>
              <div className="pt-2 flex flex-wrap gap-1">
                {table.columns.map((col) => (
                  <span
                    key={col}
                    className="font-mono text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
