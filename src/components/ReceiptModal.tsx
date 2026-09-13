import { useEffect, useState } from 'react';
import {
  Printer,
  X,
  CheckCircle,
  ShieldCheck,
  Layers,
  FileText,
  Barcode,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { Transaction, StoreSettings, PrinterType } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction | null;
  storeSettings?: StoreSettings;
  onClose: () => void;
}

export default function ReceiptModal({
  transaction,
  storeSettings,
  onClose,
}: ReceiptModalProps) {
  if (!transaction) return null;

  const pSettings = storeSettings?.printSettings;
  const initialPrinter: PrinterType =
    pSettings?.salesPrinterType ||
    (pSettings?.paperWidth === '80mm' ? 'thermal-80' : 'thermal-58');

  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType>(initialPrinter);
  const [copies, setCopies] = useState<number>(pSettings?.printCopies || 1);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (transaction && pSettings?.autoPrintDialog) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [transaction?.id, pSettings?.autoPrintDialog]);

  const handlePrint = () => {
    window.print();
  };

  const storeName = storeSettings?.storeName || 'HIROSHI COMPUTER';
  const tagline = storeSettings?.tagline || 'Toko Komputer, Part PC & Layanan Service IT';
  const address = storeSettings?.address || 'Jl. Tunggorono No 46 Pucangan';
  const city = storeSettings?.city || 'Kartasura';
  const phone = storeSettings?.phone || '085876500029';

  const handleCopyReceipt = () => {
    const itemsSummary = transaction.items
      .map(
        (i) =>
          `• ${i.productName} (${i.qty}x @${formatCurrency(i.subtotal / i.qty)}) = ${formatCurrency(i.subtotal)}${
            i.warranty ? ` [Garansi: ${i.warranty}]` : ''
          }`
      )
      .join('\n');

    const text =
      `*STRUK TRANSAKSI - ${storeName}*\n` +
      `No. Nota: ${transaction.id}\n` +
      `Tgl: ${transaction.date}\n` +
      `Kasir: ${transaction.cashier}\n` +
      `--------------------------------\n` +
      `${itemsSummary}\n` +
      `--------------------------------\n` +
      `Total: ${formatCurrency(transaction.total)}\n` +
      `Metode: ${transaction.paymentMethod}\n` +
      `Alamat: ${address}, ${city}\n` +
      `No. HP/WA: ${phone}\n` +
      `*Simpan struk ini sebagai bukti garansi resmi.*`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const printerProfiles: {
    id: PrinterType;
    label: string;
    sublabel: string;
    widthClass: string;
  } = {
    'thermal-58': {
      id: 'thermal-58',
      label: 'Thermal 58mm',
      sublabel: 'Mini Bluetooth',
      widthClass: 'w-[280px]',
    },
    'thermal-80': {
      id: 'thermal-80',
      label: 'Thermal 80mm',
      sublabel: 'Kasir Standar',
      widthClass: 'w-[350px]',
    },
    'dot-matrix': {
      id: 'dot-matrix',
      label: 'Dot Matrix NCR',
      sublabel: 'Epson LX-310 Rangkap',
      widthClass: 'w-[520px]',
    },
    'inkjet-a5': {
      id: 'inkjet-a5',
      label: 'Nota A5',
      sublabel: '1/2 Folio Formal',
      widthClass: 'w-[560px]',
    },
    'inkjet-a4': {
      id: 'inkjet-a4',
      label: 'Faktur A4',
      sublabel: 'Invoice Lembar Penuh',
      widthClass: 'w-[640px]',
    },
  }[selectedPrinter];

  const renderReceiptContent = (copyIndex: number = 1) => {
    const isThermal = selectedPrinter === 'thermal-58' || selectedPrinter === 'thermal-80';
    const isDotMatrix = selectedPrinter === 'dot-matrix';
    const isInvoice = selectedPrinter === 'inkjet-a4' || selectedPrinter === 'inkjet-a5';

    const copyLabel =
      copies > 1
        ? copyIndex === 1
          ? 'LEMBAR 1 : ASLI (PELANGGAN)'
          : 'LEMBAR 2 : ARSIP PEMBUKUAN TOKO'
        : null;

    if (isThermal) {
      return (
        <div className="font-mono text-gray-900 leading-tight space-y-2 text-xs">
          {/* Store Header */}
          <div className="text-center pb-2 border-b border-dashed border-gray-400">
            {pSettings?.showLogo && storeSettings?.logoUrl && (
              <div className="w-10 h-10 mx-auto mb-1 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={storeSettings.logoUrl}
                  alt="Logo Toko"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="font-bold text-sm tracking-wider text-black uppercase">
              {storeName}
            </div>
            <div className="text-[10px] text-gray-600">{tagline}</div>
            {pSettings?.showStoreAddress !== false && (
              <div className="text-[10px] text-gray-500">
                {address}, {city}
              </div>
            )}
            {pSettings?.showStoreContact !== false && (
              <div className="text-[10px] text-gray-500">Telp/WA: {phone}</div>
            )}
            {copyLabel && (
              <div className="mt-1 inline-block px-1.5 py-0.5 bg-gray-200 text-black text-[9px] font-bold">
                *** {copyLabel} ***
              </div>
            )}
            {pSettings?.headerNote && (
              <div className="text-[10px] font-semibold text-gray-700 mt-1 uppercase border-t border-dashed border-gray-300 pt-1">
                {pSettings.headerNote}
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="py-1.5 border-b border-dashed border-gray-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>No. TRX:</span>
              <span className="font-bold">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{transaction.date}</span>
            </div>
            {pSettings?.showCashierName !== false && (
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{transaction.cashier}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Metode:</span>
              <span className="font-bold text-blue-900">{transaction.paymentMethod}</span>
            </div>
            {transaction.status === 'Void' && (
              <div className="text-center font-bold text-red-600 bg-red-50 py-1 rounded my-1 border border-red-200">
                *** TRANSAKSI DIBATALKAN (VOID) ***
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="py-2 border-b border-dashed border-gray-400 space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-semibold text-gray-900 leading-tight">
                  {item.productName}
                </div>
                <div className="flex justify-between text-[11px] text-gray-700">
                  <span>
                    {item.qty} x {formatCurrency(item.subtotal / item.qty)}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
                {pSettings?.showSerialNumber !== false && item.serialNumber && (
                  <div className="text-[10px] text-blue-800 font-medium">
                    SN: {item.serialNumber}
                  </div>
                )}
                {pSettings?.showWarranty !== false &&
                  item.warranty &&
                  item.warranty !== 'Tidak Ada' && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Garansi: {item.warranty}</span>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-1.5 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon:</span>
                <span>- {formatCurrency(transaction.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-black pt-1 border-t border-dashed border-gray-400">
              <span>TOTAL:</span>
              <span>{formatCurrency(transaction.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar ({transaction.paymentMethod}):</span>
              <span>{formatCurrency(transaction.amountPaid || transaction.total)}</span>
            </div>
            {transaction.paymentMethod === 'Tunai' && (
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Kembalian:</span>
                <span>{formatCurrency(transaction.change || 0)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500 space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-700 font-medium">
              <CheckCircle className="w-3 h-3" />
              <span>Terima Kasih Atas Kunjungan Anda</span>
            </div>
            <div>{pSettings?.footerNote1 || 'Simpan struk ini sebagai kartu garansi resmi.'}</div>
            <div>
              {pSettings?.footerNote2 ||
                'Barang yang dibeli tidak dapat ditukar kecuali ada perjanjian.'}
            </div>
          </div>
        </div>
      );
    }

    if (isDotMatrix) {
      // Dot matrix continuous form draft monospace style
      return (
        <div className="font-mono text-[11px] text-black leading-tight space-y-1.5 bg-[#FEFDF9] p-3 border border-black">
          <div className="flex justify-between items-start border-b border-black pb-1">
            <div>
              <div className="font-bold text-sm uppercase">{storeName}</div>
              <div className="text-[10px]">{address}, {city} &bull; Telp/WA: {phone}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xs uppercase underline">NOTA PENJUALAN KASIR</div>
              <div className="font-black text-xs">NO: {transaction.id}</div>
              {copyLabel && <div className="text-[9px] font-bold">[{copyLabel}]</div>}
            </div>
          </div>

          <div className="flex justify-between text-[10px] py-1 border-b border-dashed border-black">
            <div>
              <div>Tanggal : {transaction.date}</div>
              <div>Kasir   : {transaction.cashier}</div>
            </div>
            <div className="text-right">
              <div>Metode : <strong>{transaction.paymentMethod}</strong></div>
              <div>Status : {transaction.status}</div>
            </div>
          </div>

          {/* Table Header */}
          <div className="text-[10px] py-1 border-b border-black font-bold flex justify-between">
            <span className="w-1/2">NAMA BARANG / ITEM</span>
            <span className="w-16 text-center">QTY</span>
            <span className="w-24 text-right">HARGA</span>
            <span className="w-24 text-right">JUMLAH</span>
          </div>

          {/* Table Rows */}
          <div className="space-y-1 text-[10px] py-1 border-b border-dashed border-black">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="w-1/2 truncate font-semibold">{item.productName}</span>
                  <span className="w-16 text-center">{item.qty}</span>
                  <span className="w-24 text-right">{formatCurrency(item.subtotal / item.qty)}</span>
                  <span className="w-24 text-right font-bold">{formatCurrency(item.subtotal)}</span>
                </div>
                {(item.serialNumber || item.warranty) && (
                  <div className="text-[9px] text-gray-700 pl-2">
                    {item.serialNumber ? `SN: ${item.serialNumber} ` : ''}
                    {item.warranty ? `[Garansi: ${item.warranty}]` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dot Matrix Totals */}
          <div className="space-y-0.5 text-[10px] py-1 border-b border-black">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between">
                <span>Potongan Diskon:</span>
                <span>- {formatCurrency(transaction.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-xs pt-1 border-t border-dotted border-black">
              <span>TOTAL PEMBAYARAN:</span>
              <span>{formatCurrency(transaction.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar ({transaction.paymentMethod}):</span>
              <span>{formatCurrency(transaction.amountPaid || transaction.total)}</span>
            </div>
            {transaction.paymentMethod === 'Tunai' && (
              <div className="flex justify-between font-bold">
                <span>Kembalian:</span>
                <span>{formatCurrency(transaction.change || 0)}</span>
              </div>
            )}
          </div>

          <div className="text-[9px] text-gray-800 italic pt-1 flex justify-between items-center">
            <span>* Simpan nota ini sebagai bukti garansi resmi produk.</span>
            <span>Kasir: {transaction.cashier}</span>
          </div>
        </div>
      );
    }

    // A4 / A5 Invoice / Faktur Sheet
    return (
      <div className="text-gray-900 leading-normal space-y-3 p-2 font-sans">
        {/* Official Header */}
        <div className="flex justify-between items-start border-b-2 border-blue-900 pb-3">
          <div className="flex items-start gap-3">
            {pSettings?.showLogo && storeSettings?.logoUrl ? (
              <img
                src={storeSettings.logoUrl}
                alt="Logo Toko"
                className="w-14 h-14 object-contain rounded-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-xl font-mono">
                HC
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wide text-blue-950 uppercase">
                {storeName}
              </h1>
              <p className="text-xs text-blue-800 font-medium">{tagline}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {address}, {city} &bull; No. HP/WA: <strong className="text-gray-900">{phone}</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
              FAKTUR PENJUALAN RESMI
            </span>
            <div className="mt-1 font-mono font-extrabold text-sm text-blue-900">
              {transaction.id}
            </div>
            {copyLabel && (
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                {copyLabel}
              </div>
            )}
          </div>
        </div>

        {/* Info Strip */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div>
            <div className="flex"><span className="w-24 text-gray-500">Tanggal</span>: <strong className="ml-1">{transaction.date}</strong></div>
            <div className="flex"><span className="w-24 text-gray-500">Kasir</span>: <span className="ml-1">{transaction.cashier}</span></div>
          </div>
          <div>
            <div className="flex"><span className="w-24 text-gray-500">Metode Bayar</span>: <strong className="ml-1 text-blue-900">{transaction.paymentMethod}</strong></div>
            <div className="flex"><span className="w-24 text-gray-500">Status Transaksi</span>: <span className="ml-1 text-emerald-800 font-bold uppercase">{transaction.status}</span></div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-2 w-10 text-center">No</th>
                <th className="p-2">Deskripsi Produk / Komponen</th>
                <th className="p-2 text-center w-16">Qty</th>
                <th className="p-2 text-right w-28">Harga Satuan</th>
                <th className="p-2 text-right w-32">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transaction.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="p-2 text-center text-gray-500">{idx + 1}</td>
                  <td className="p-2">
                    <div className="font-bold text-gray-900">{item.productName}</div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
                      {item.serialNumber && (
                        <span className="text-blue-700 font-medium">SN: {item.serialNumber}</span>
                      )}
                      {item.warranty && item.warranty !== 'Tidak Ada' && (
                        <span className="text-emerald-700 font-medium">Garansi: {item.warranty}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 text-center font-medium">{item.qty}</td>
                  <td className="p-2 text-right text-gray-700">
                    {formatCurrency(item.subtotal / item.qty)}
                  </td>
                  <td className="p-2 text-right font-bold text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold border-t border-gray-200">
              <tr>
                <td colSpan={4} className="p-2 text-right text-gray-600">Subtotal:</td>
                <td className="p-2 text-right text-gray-900">{formatCurrency(transaction.subtotal)}</td>
              </tr>
              {transaction.discount > 0 && (
                <tr>
                  <td colSpan={4} className="p-2 text-right text-red-600">Potongan Diskon:</td>
                  <td className="p-2 text-right text-red-600 font-bold">- {formatCurrency(transaction.discount)}</td>
                </tr>
              )}
              <tr className="bg-blue-50/70 border-t border-gray-300">
                <td colSpan={4} className="p-2 text-right font-black text-sm text-blue-950">TOTAL TRANSAKSI:</td>
                <td className="p-2 text-right font-black text-sm text-blue-950">{formatCurrency(transaction.total)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="p-2 text-right text-gray-600">Jumlah Dibayar ({transaction.paymentMethod}):</td>
                <td className="p-2 text-right font-bold text-gray-900">{formatCurrency(transaction.amountPaid || transaction.total)}</td>
              </tr>
              {transaction.paymentMethod === 'Tunai' && (
                <tr>
                  <td colSpan={4} className="p-2 text-right text-emerald-800">Kembalian:</td>
                  <td className="p-2 text-right font-bold text-emerald-800">{formatCurrency(transaction.change || 0)}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* Terms & Signatures */}
        <div className="grid grid-cols-2 gap-6 pt-2 text-xs">
          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-600 space-y-0.5">
            <div className="font-bold text-gray-800">Syarat &amp; Ketentuan Garansi:</div>
            <p>1. Simpan lembar faktur ini sebagai bukti klaim garansi resmi hardware.</p>
            <p>2. Segel garansi wajib dalam kondisi utuh dan tidak rusak/sobek.</p>
            <p>3. Garansi tidak berlaku untuk kerusakan akibat korsleting, cairan, jatuh, atau petir.</p>
          </div>

          <div className="grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-gray-500 mb-8">Penerima / Pembeli,</p>
              <p className="font-bold border-t border-gray-300 pt-0.5">(.........................)</p>
            </div>
            <div>
              <p className="text-gray-500 mb-8">{storeName},</p>
              <p className="font-bold border-t border-gray-300 pt-0.5">({transaction.cashier})</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs print:p-0 print:bg-transparent overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[94vh] border border-gray-200 print:shadow-none print:border-none print:max-w-none print:w-full my-auto">
        {/* Header - Hidden on Print */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-slate-900 text-white print:hidden gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Cetak Nota Penjualan</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-normal">
                  {transaction.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {storeName} &bull; {address}, {city} (Telp: {phone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReceipt}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Salin Rincian Transaksi ke Clipboard"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedText ? 'Tersalin' : 'Salin Teks'}</span>
            </button>

            <button
              id="btn-close-receipt-top"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Controls - Hidden on Print */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 print:hidden space-y-3">
          {/* Top Row: Copies and Quick info */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-gray-700">
              Total Belanja: <strong className="text-blue-900 text-sm">{formatCurrency(transaction.total)}</strong> ({transaction.items.length} item)
            </div>

            {/* Copies */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Jumlah Rangkap:</span>
              </label>
              <div className="flex items-center rounded-lg border border-gray-300 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setCopies(1)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    copies === 1 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  1x Lembar
                </button>
                <button
                  type="button"
                  onClick={() => setCopies(2)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    copies === 2 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  2x Rangkap (Toko + Pelanggan)
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Printer Profile Selector Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Pilih Tipe Printer Sesuai Hardware Anda:
              </span>
              <span className="text-[11px] font-mono text-blue-700 font-semibold">
                Ukuran: {printerProfiles.label}
              </span>
            </div>

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
                    desc: 'Kasir POS Standar',
                    icon: '🧾',
                  },
                  {
                    id: 'dot-matrix',
                    name: 'Dot Matrix NCR',
                    desc: 'Epson Continuous',
                    icon: '🖨️',
                  },
                  {
                    id: 'inkjet-a5',
                    name: 'Nota A5',
                    desc: '1/2 Folio Formal',
                    icon: '📄',
                  },
                  {
                    id: 'inkjet-a4',
                    name: 'Faktur A4',
                    desc: 'Lembar Resmi Full',
                    icon: '📑',
                  },
                ] as const
              ).map((p) => {
                const isSelected = selectedPrinter === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPrinter(p.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{p.icon}</span>
                      <span
                        className={`text-xs font-bold leading-tight truncate ${
                          isSelected ? 'text-blue-900' : 'text-gray-800'
                        }`}
                      >
                        {p.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-gray-200/70 print:bg-white print:p-0 flex-1">
          <div className="space-y-6">
            {/* Copy 1 */}
            <div
              id="printable-sales-receipt"
              className={`receipt-paper bg-white border border-gray-300 p-5 rounded-lg shadow-md print:shadow-none print:border-none print:p-0 mx-auto transition-all ${printerProfiles.widthClass}`}
            >
              {renderReceiptContent(1)}
            </div>

            {/* Copy 2 if requested */}
            {copies > 1 && (
              <div
                className={`receipt-paper bg-white border border-dashed border-gray-400 p-5 rounded-lg shadow-md print:shadow-none print:border-none print:p-0 mx-auto transition-all print:break-before-page ${printerProfiles.widthClass}`}
              >
                {renderReceiptContent(2)}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions - Hidden on Print */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-gray-500">
            Printer aktif: <strong className="text-gray-800">{printerProfiles.label}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-close-receipt-bottom"
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              id="btn-print-receipt"
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang ({printerProfiles.label})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
