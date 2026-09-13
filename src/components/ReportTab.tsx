import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  CreditCard,
  PackageCheck,
  AlertOctagon,
  Layers,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Transaction, StoreSettings, User } from '../types';
import { formatCurrency, exportToCsv } from '../utils/formatters';
import { downloadSalesReportPdf } from '../utils/pdfReportGenerator';
import ReportPdfModal from './ReportPdfModal';

interface ReportTabProps {
  transactions: Transaction[];
  storeSettings?: StoreSettings;
  currentUser?: User;
}

export default function ReportTab({
  transactions,
  storeSettings,
  currentUser,
}: ReportTabProps) {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'month'>('all');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}`;

  const filteredTrx = transactions.filter((t) => {
    if (filterPeriod === 'today') return t.date.startsWith(todayStr);
    if (filterPeriod === 'month') return t.date.startsWith(monthStr);
    return true;
  });

  const validTrx = filteredTrx.filter((t) => t.status !== 'Void');
  const voidTrx = filteredTrx.filter((t) => t.status === 'Void');

  const totalRevenue = validTrx.reduce((sum, t) => sum + t.total, 0);
  const totalSubtotal = validTrx.reduce((sum, t) => sum + t.subtotal, 0);
  const totalDiscounts = validTrx.reduce((sum, t) => sum + t.discount, 0);
  const averageOrderValue = validTrx.length > 0 ? totalRevenue / validTrx.length : 0;

  // Breakdown by payment method
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  validTrx.forEach((t) => {
    const m = t.paymentMethod || 'Tunai';
    if (!paymentBreakdown[m]) paymentBreakdown[m] = { count: 0, total: 0 };
    paymentBreakdown[m].count += 1;
    paymentBreakdown[m].total += t.total;
  });

  // Top Selling Products
  const productSalesMap: Record<
    string,
    { name: string; qty: number; subtotal: number }
  > = {};
  validTrx.forEach((t) => {
    t.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          qty: 0,
          subtotal: 0,
        };
      }
      productSalesMap[item.productId].qty += item.qty;
      productSalesMap[item.productId].subtotal += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap).sort(
    (a, b) => b.qty - a.qty
  );

  const periodLabel =
    filterPeriod === 'today'
      ? `Hari Ini (${new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })})`
      : filterPeriod === 'month'
      ? `Bulan ${new Date().toLocaleDateString('id-ID', {
          month: 'long',
          year: 'numeric',
        })}`
      : 'Semua Waktu (Seluruh Riwayat)';

  const handleQuickDownloadPdf = () => {
    downloadSalesReportPdf(filteredTrx, storeSettings, currentUser, {
      periodLabel,
      filterPeriod,
      includeDetails: true,
      includeTopProducts: true,
      includeSignatures: true,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'ID_Transaksi',
      'Tanggal',
      'Kasir',
      'Subtotal',
      'Diskon',
      'Total',
      'Metode_Bayar',
      'Status',
      'Jumlah_Item',
    ];

    const rows = filteredTrx.map((t) => [
      t.id,
      t.date,
      t.cashier,
      t.subtotal,
      t.discount,
      t.total,
      t.paymentMethod,
      t.status,
      t.items.reduce((s, itm) => s + itm.qty, 0),
    ]);

    exportToCsv(
      `Laporan_Penjualan_${storeSettings?.storeName?.replace(/\s+/g, '_') || 'Hiroshi'}_${filterPeriod}_${Date.now()}`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Laporan &amp; Analisis Penjualan
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                Laporan Keuangan
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Rekapitulasi penjualan harian, bulanan, statistik produk terlaris, dan ekspor dokumen PDF resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Primary Action: Export PDF dengan format rapi */}
            <button
              id="btn-export-pdf"
              onClick={() => setIsPdfModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              title="Buka opsi dan pratinjau export PDF format rapi"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF Rapi</span>
            </button>

            {/* Quick Instant Download PDF */}
            <button
              id="btn-quick-download-pdf"
              onClick={handleQuickDownloadPdf}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              title="Unduh langsung file PDF (.pdf)"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Unduh Cepat (.pdf)</span>
            </button>

            {/* Secondary: Export CSV */}
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              title="Download data mentah dalam format CSV / Excel"
            >
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-600 mr-1">Filter Periode:</span>
          <div className="flex gap-1.5">
            <button
              id="filter-period-all"
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterPeriod === 'all'
                  ? 'bg-[#1E88E5] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua Waktu
            </button>
            <button
              id="filter-period-month"
              onClick={() => setFilterPeriod('month')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterPeriod === 'month'
                  ? 'bg-[#1E88E5] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bulan Ini
            </button>
            <button
              id="filter-period-today"
              onClick={() => setFilterPeriod('today')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterPeriod === 'today'
                  ? 'bg-[#1E88E5] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hari Ini
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total Omset Bersih</span>
            <div className="p-2 bg-[#E3F2FD] rounded-lg text-[#0D47A1]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0D47A1]">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Diskon diberikan: {formatCurrency(totalDiscounts)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Transaksi Sukses</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {validTrx.length} Nota
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Rata-rata: {formatCurrency(averageOrderValue)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Transaksi Void (Batal)</span>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600">
            {voidTrx.length} Nota
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Stok otomatis dikembalikan
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Metode Pembayaran</span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-900">
            {Object.keys(paymentBreakdown).length} Tipe
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Tunai, QRIS, Transfer, Debit
          </div>
        </div>
      </div>

      {/* Grid: Payment Method Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Selling Products (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-gray-900">
                10 Produk Terlaris (Top Selling Products)
              </h3>
            </div>
            <span className="text-xs text-gray-500">Berdasarkan Kuantitas Terjual</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 text-center w-12">No</th>
                  <th className="py-2.5 px-4">Nama Produk</th>
                  <th className="py-2.5 px-4 text-center">Terjual</th>
                  <th className="py-2.5 px-4 text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400">
                      Belum ada data penjualan pada periode ini.
                    </td>
                  </tr>
                ) : (
                  topProducts.slice(0, 10).map((p, idx) => (
                    <tr key={p.name} className="hover:bg-blue-50/30">
                      <td className="py-3 px-4 text-center font-bold">
                        {idx === 0 ? (
                          <span className="inline-block w-6 h-6 rounded-full bg-amber-400 text-white leading-6 text-xs shadow-xs">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-block w-6 h-6 rounded-full bg-gray-300 text-gray-800 leading-6 text-xs">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-block w-6 h-6 rounded-full bg-amber-600 text-white leading-6 text-xs">
                            3
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{p.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-700">
                        {p.qty} unit
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#0D47A1]">
                        {formatCurrency(p.subtotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-xs p-4 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-gray-900">Metode Pembayaran</h3>
            <p className="text-xs text-gray-500">Distribusi kas &amp; channel transaksi</p>
          </div>

          <div className="space-y-3">
            {Object.keys(paymentBreakdown).length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Belum ada transaksi</p>
            ) : (
              Object.entries(paymentBreakdown).map(([method, data]) => {
                const percent = totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-800">
                      <span>{method} ({data.count}x)</span>
                      <span>{formatCurrency(data.total)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1E88E5] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 text-right">
                      {percent.toFixed(1)}% dari omset
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* PDF Export & Preview Modal */}
      <ReportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        transactions={filteredTrx}
        filterPeriod={filterPeriod}
        periodLabel={periodLabel}
        storeSettings={storeSettings}
        currentUser={currentUser}
      />
    </div>
  );
}
