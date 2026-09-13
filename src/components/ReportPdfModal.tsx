import { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  CreditCard,
  PenTool,
  TrendingUp,
} from 'lucide-react';
import { Transaction, StoreSettings, User } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  downloadSalesReportPdf,
  openSalesReportPdfInNewTab,
  PdfReportOptions,
} from '../utils/pdfReportGenerator';

interface ReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  filterPeriod: 'all' | 'today' | 'month';
  periodLabel: string;
  storeSettings?: StoreSettings;
  currentUser?: User;
}

export default function ReportPdfModal({
  isOpen,
  onClose,
  transactions,
  filterPeriod,
  periodLabel,
  storeSettings,
  currentUser,
}: ReportPdfModalProps) {
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeTopProducts, setIncludeTopProducts] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const validTrx = transactions.filter((t) => t.status !== 'Void');
  const voidTrx = transactions.filter((t) => t.status === 'Void');
  const totalRevenue = validTrx.reduce((sum, t) => sum + t.total, 0);

  const getPdfOptions = (): PdfReportOptions => ({
    periodLabel,
    filterPeriod,
    includeDetails,
    includeTopProducts,
    includeSignatures,
  });

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      downloadSalesReportPdf(
        transactions,
        storeSettings,
        currentUser,
        getPdfOptions()
      );
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setIsGenerating(false);
    }
  };

  const handleOpenPrint = () => {
    try {
      openSalesReportPdfInNewTab(
        transactions,
        storeSettings,
        currentUser,
        getPdfOptions()
      );
    } catch (err) {
      console.error('Failed to open PDF:', err);
    }
  };

  return (
    <div
      id="modal-pdf-report-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="modal-pdf-report-container"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-linear-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Export Laporan PDF
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Format Rapi Resmi
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Dokumen formal A4 dengan kop toko, ringkasan finansial, tabel terstruktur &amp; tanda tangan.
              </p>
            </div>
          </div>

          <button
            id="btn-close-pdf-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-gray-800 flex-1">
          {/* Quick Overview Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-gray-500">Periode:</span>
              <strong className="text-gray-900 font-semibold">{periodLabel}</strong>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-500">Total Omset:</span>
              <strong className="text-emerald-700 font-bold">{formatCurrency(totalRevenue)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span className="text-gray-500">Jumlah Nota:</span>
              <strong className="text-gray-900 font-bold">
                {validTrx.length} Nota {voidTrx.length > 0 ? `(${voidTrx.length} Void)` : ''}
              </strong>
            </div>
          </div>

          {/* PDF Format Preview Highlights */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Struktur Format PDF Yang Dihasilkan:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Kop Surat Resmi Toko</strong>
                  <p className="text-[11px] text-gray-500">
                    Nama {storeSettings?.storeName || 'Hiroshi Computer'}, alamat, telepon, dan divider garis biru.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Ringkasan KPI Finansial</strong>
                  <p className="text-[11px] text-gray-500">
                    Omset bersih, diskon total, AOV, dan rekapitulasi status nota.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Kanal Pembayaran</strong>
                  <p className="text-[11px] text-gray-500">
                    Tabel distribusi Tunai, QRIS, Transfer Bank, dan Debit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Penomoran Halaman Rapi</strong>
                  <p className="text-[11px] text-gray-500">
                    Footer halaman otomatis &ldquo;Halaman X dari Y&rdquo; dengan tanggal cetak.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Customization Options */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Sesuaikan Bagian Dokumen PDF:
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/80 cursor-pointer transition-colors">
                <input
                  id="pdf-opt-details"
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-900">
                    Sertakan Tabel Riwayat Transaksi Lengkap
                  </span>
                  <span className="text-gray-500 block text-[11px]">
                    Mencantumkan No. Nota, rincian produk belanja, kasir, metode pembayaran, dan status transaksi.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/80 cursor-pointer transition-colors">
                <input
                  id="pdf-opt-topproducts"
                  type="checkbox"
                  checked={includeTopProducts}
                  onChange={(e) => setIncludeTopProducts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-900">
                    Sertakan Top 10 Produk Terlaris
                  </span>
                  <span className="text-gray-500 block text-[11px]">
                    Tabel peringkat produk PC dan sparepart yang paling banyak terjual.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/80 cursor-pointer transition-colors">
                <input
                  id="pdf-opt-signatures"
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    Sertakan Kolom Tanda Tangan &amp; Otorisasi
                  </span>
                  <span className="text-gray-500 block text-[11px]">
                    Kolom resmi pengesahan Dibuat Oleh (Admin/Kasir) dan Disetujui Oleh (Pemilik Toko).
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-open-pdf-print"
              type="button"
              onClick={handleOpenPrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Buka &amp; Cetak PDF</span>
            </button>

            <button
              id="btn-confirm-download-pdf"
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#0D47A1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Memproses...' : 'Unduh File PDF (.pdf)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
