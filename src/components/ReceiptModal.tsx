import { useEffect } from 'react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { Transaction, StoreSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction | null;
  storeSettings?: StoreSettings;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, storeSettings, onClose }: ReceiptModalProps) {
  if (!transaction) return null;

  const pSettings = storeSettings?.printSettings;

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
  const paperWidthClass = pSettings?.paperWidth === '80mm' ? 'max-w-[340px]' : 'max-w-[280px]';
  const fontSizeStyle =
    pSettings?.fontSize === 'small'
      ? { fontSize: '11px' }
      : pSettings?.fontSize === 'large'
      ? { fontSize: '13px' }
      : { fontSize: '12px' };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs print:p-0 print:bg-transparent"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[92vh] border border-gray-200 print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-[#E3F2FD] print:hidden">
          <div className="flex items-center gap-2 text-[#0D47A1] font-semibold text-sm">
            <Printer className="w-4 h-4" />
            <span>Struk Transaksi Kasir ({pSettings?.paperWidth || '58mm'})</span>
          </div>
          <button
            id="btn-close-receipt-top"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body (Thermal Style) */}
        <div className="p-6 overflow-y-auto print:p-0">
          <div
            style={fontSizeStyle}
            className={`receipt-paper font-mono leading-relaxed text-gray-800 bg-white border border-dashed border-gray-300 p-4 rounded-xs print:border-none print:p-0 mx-auto ${paperWidthClass}`}
          >
            {/* Store Header */}
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              {/* Optional Logo */}
              {pSettings?.showLogo && storeSettings?.logoUrl && (
                <div className="w-12 h-12 mx-auto mb-1 rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={storeSettings.logoUrl}
                    alt="Logo Toko"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="font-bold text-base tracking-wider text-black uppercase">
                {storeSettings?.storeName || 'HIROSHI COMPUTER'}
              </div>
              <div className="text-[11px] text-gray-600">
                {storeSettings?.tagline || 'Toko Komputer & IT Service Solusi'}
              </div>
              {pSettings?.showStoreAddress !== false && (
                <div className="text-[10px] text-gray-500">
                  {storeSettings?.address || 'Jl. Ahmad Yani No. 88'}
                  {storeSettings?.city ? `, ${storeSettings.city}` : ''}
                </div>
              )}
              {pSettings?.showStoreContact !== false && (
                <div className="text-[10px] text-gray-500">
                  Telp/WA: {storeSettings?.phone || '0812-3456-7890'}
                </div>
              )}
              {pSettings?.headerNote && (
                <div className="text-[10px] font-semibold text-gray-700 mt-1 uppercase border-t border-dashed border-gray-300 pt-1">
                  {pSettings.headerNote}
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="py-2 border-b border-dashed border-gray-400 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>No. TRX:</span>
                <span className="font-semibold">{transaction.id}</span>
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
                <span className="font-bold text-[#0D47A1]">{transaction.paymentMethod}</span>
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
                  <div className="font-semibold text-gray-900 leading-tight">{item.productName}</div>
                  <div className="flex justify-between text-[11px] text-gray-600">
                    <span>{item.qty} x {formatCurrency(item.subtotal / item.qty)}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</span>
                  </div>
                  {pSettings?.showSerialNumber !== false && item.serialNumber && (
                    <div className="text-[10px] text-blue-700 font-medium">
                      SN: {item.serialNumber}
                    </div>
                  )}
                  {pSettings?.showWarranty !== false && item.warranty && item.warranty !== 'Tidak Ada' && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Garansi: {item.warranty}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2 space-y-1 text-[11px]">
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
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(transaction.change || 0)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500 space-y-1">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-medium">
                <CheckCircle className="w-3 h-3" />
                <span>Terima Kasih Atas Kunjungan Anda</span>
              </div>
              <div>
                {pSettings?.footerNote1 || 'Simpan struk ini sebagai kartu garansi resmi.'}
              </div>
              <div>
                {pSettings?.footerNote2 ||
                  'Barang yang dibeli tidak dapat ditukar kecuali ada perjanjian.'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 print:hidden">
          <button
            id="btn-close-receipt-bottom"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Tutup
          </button>
          <button
            id="btn-print-receipt"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Thermal / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
