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
} from 'lucide-react';
import { GAS_DEPLOY_STEPS, GAS_CODE_GS } from '../gas/gasCode';

export default function GasTab() {
  const [subTab, setSubTab] = useState<'steps' | 'code_gs' | 'index_html' | 'schema'>('steps');
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('// Memuat isi file Index.html...');

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

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#E3F2FD] text-[#0D47A1]">
                Google Apps Script Ready
              </span>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Paket Deployment Google Apps Script
              </h2>
            </div>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl">
              Seluruh kode telah dioptimalkan murni dengan <strong>Vanilla JS &amp; CSS</strong> tanpa framework eksternal untuk dideploy ke Google Sheets &amp; Apps Script Web App secara instan.
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
            { id: 'steps', label: '1. Panduan Deployment (Step-by-Step)', icon: CheckCircle2 },
            { id: 'code_gs', label: '2. Code.gs (Backend Script)', icon: Code2 },
            { id: 'index_html', label: '3. Index.html (Frontend Web App)', icon: FileCode },
            { id: 'schema', label: '4. Skema Database (7 Sheet)', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = subTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`gas-subtab-${tab.id}`}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
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
              <span>Tips Konfigurasi Deployment Web App:</span>
            </div>
            <p>
              &bull; <strong>Execute as:</strong> Pilih <strong>"Me" (akun Google Anda)</strong> agar Web App memiliki izin membaca dan menulis data ke Google Sheets secara aman.
            </p>
            <p>
              &bull; <strong>Who has access:</strong> Pilih <strong>"Anyone" (Siapa saja)</strong> agar staf kasir dan teknisi dapat mengakses Web App melalui URL browser tanpa perlu login ke konsol Google Cloud.
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CODE.GS */}
      {subTab === 'code_gs' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden space-y-0">
          <div className="p-4 bg-gray-900 text-white flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-bold text-blue-200">Code.gs</span>
              <span className="text-[11px] text-gray-400">
                (Google Apps Script Backend Server)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-codegs"
                onClick={() => handleCopy(GAS_CODE_GS, 'gs')}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedGs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGs ? 'Tersalin!' : 'Salin Code.gs'}</span>
              </button>

              <button
                onClick={() => downloadFile('Code.gs', GAS_CODE_GS)}
                className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1 transition-colors"
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

      {/* SUBTAB 3: INDEX.HTML */}
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
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHtml ? 'Tersalin!' : 'Salin Index.html'}</span>
              </button>

              <button
                onClick={() => downloadFile('Index.html', htmlContent)}
                className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1 transition-colors"
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

      {/* SUBTAB 4: SCHEMA */}
      {subTab === 'schema' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: '1. Sheet: Produk',
              desc: 'Master data barang dagangan, laptop, sparepart, dan jasa.',
              columns: ['ID_Produk', 'Nama_Produk', 'Kategori', 'Harga_Jual', 'Stok', 'Min_Stok', 'Gambar_URL'],
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
              columns: ['ID_Service', 'Tanggal_Masuk', 'Tanggal_Selesai', 'Nama_Pelanggan', 'No_WA', 'Nama_Barang', 'Keluhan', 'Estimasi_Biaya', 'Status_Service', 'Teknisi'],
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
