import { useState } from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  FileText,
  UserCheck,
  Calendar,
  Smartphone,
  ShieldCheck,
  Sliders,
  QrCode,
  Copy,
  Check,
  Send,
  Wrench,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { ServiceOrder, StoreSettings, PrinterType } from '../types';
import { formatCurrency, createWhatsAppServiceUrl } from '../utils/formatters';
import { printReceiptElement, openReceiptInNewTab } from '../utils/printReceiptHelper';

interface ServiceReceiptModalProps {
  order: ServiceOrder | null;
  storeSettings?: StoreSettings;
  onClose: () => void;
}

export default function ServiceReceiptModal({
  order,
  storeSettings,
  onClose,
}: ServiceReceiptModalProps) {
  if (!order) return null;

  const defaultPrinter: PrinterType =
    storeSettings?.printSettings?.servicePrinterType ||
    storeSettings?.printSettings?.servicePrintSettings?.defaultPrinter ||
    'inkjet-a5';

  const [selectedPrinter, setSelectedPrinter] = useState<PrinterType>(defaultPrinter);
  const [docType, setDocType] = useState<'intake' | 'completion'>(
    order.status === 'Selesai' || order.status === 'Diambil' ? 'completion' : 'intake'
  );
  const [copies, setCopies] = useState<number>(
    storeSettings?.printSettings?.servicePrintSettings?.copies || 1
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const pSettings = storeSettings?.printSettings;
  const srvSettings = pSettings?.servicePrintSettings;

  const storeName = storeSettings?.storeName || 'HIROSHI COMPUTER';
  const tagline = storeSettings?.tagline || 'Toko Komputer, Part PC & Layanan Service IT';
  const address = storeSettings?.address || 'Jl. Tunggorono No 46 Pucangan';
  const city = storeSettings?.city || 'Kartasura';
  const phone = storeSettings?.phone || '085876500029';

  const handlePrint = async () => {
    setIsPrinting(true);
    await printReceiptElement('service-receipt-print-area', {
      title: `Nota-Servis-${order.id}`,
      printerType: selectedPrinter,
      copies: copies,
    });
    setIsPrinting(false);
  };

  const handleOpenCleanTab = () => {
    openReceiptInNewTab('service-receipt-print-area', {
      title: `Nota-Servis-${order.id}`,
      printerType: selectedPrinter,
      copies: copies,
    });
  };

  const handleCopySummary = () => {
    const text =
      `*BUKTI SERAH TERIMA SERVICE - ${storeName}*\n` +
      `No. Servis: ${order.id}\n` +
      `Tipe: ${docType === 'intake' ? 'Tanda Terima Masuk Unit' : 'Nota Selesai & Pengambilan'}\n` +
      `Pelanggan: ${order.customerName} (${order.customerPhone || '-'})\n` +
      `Perangkat: ${order.device}\n` +
      `Keluhan: ${order.complaint}\n` +
      (order.accessories ? `Kelengkapan: ${order.accessories}\n` : '') +
      (docType === 'completion' && order.diagnosis ? `Tindakan: ${order.diagnosis}\n` : '') +
      `Biaya: ${formatCurrency(docType === 'completion' ? (order.finalCost || order.estimatedCost) : order.estimatedCost)}\n` +
      `Alamat: ${address}, ${city}\n` +
      `WA Toko: ${phone}`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const waUrl = createWhatsAppServiceUrl(
    order.customerPhone,
    order.id,
    order.customerName,
    order.device,
    order.status,
    order.finalCost || order.estimatedCost,
    order.diagnosis
  );

  // Printer configuration cards
  const printerProfiles: {
    id: PrinterType;
    label: string;
    sublabel: string;
    badge: string;
    widthClass: string;
  } = {
    'thermal-58': {
      id: 'thermal-58',
      label: 'Thermal 58mm',
      sublabel: 'Mini Bluetooth / POS',
      badge: 'Struk Ringkas',
      widthClass: 'w-[280px]',
    },
    'thermal-80': {
      id: 'thermal-80',
      label: 'Thermal 80mm',
      sublabel: 'POS Kasir Standar',
      badge: 'Standar POS',
      widthClass: 'w-[350px]',
    },
    'dot-matrix': {
      id: 'dot-matrix',
      label: 'Dot Matrix NCR',
      sublabel: 'Epson LX-310 / Rangkap',
      badge: 'Continuous 2-Ply',
      widthClass: 'w-full max-w-[720px]',
    },
    'inkjet-a5': {
      id: 'inkjet-a5',
      label: 'Inkjet / Laser A5',
      sublabel: '1/2 Folio (148 x 210mm)',
      badge: 'Rekomendasi IT',
      widthClass: 'w-[560px]',
    },
    'inkjet-a4': {
      id: 'inkjet-a4',
      label: 'Inkjet / Laser A4',
      sublabel: 'Lembar Resmi Standar',
      badge: 'Berita Acara Lengkap',
      widthClass: 'w-[640px]',
    },
  }[selectedPrinter];

  // Render content of receipt based on printer style
  const renderDocumentContent = (copyIndex: number = 1) => {
    const isThermal = selectedPrinter === 'thermal-58' || selectedPrinter === 'thermal-80';
    const isDotMatrix = selectedPrinter === 'dot-matrix';
    const isLargeSheet = selectedPrinter === 'inkjet-a4' || selectedPrinter === 'inkjet-a5';

    const costToShow =
      docType === 'completion'
        ? order.finalCost !== undefined
          ? order.finalCost
          : order.estimatedCost
        : order.estimatedCost;

    const copyLabel =
      copies > 1
        ? copyIndex === 1
          ? 'LEMBAR 1 : UNTUK PELANGGAN'
          : 'LEMBAR 2 : ARSIP SERVIS TOKO'
        : null;

    if (isThermal) {
      return (
        <div className="font-mono text-gray-900 leading-tight space-y-2 text-xs">
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-gray-400">
            {pSettings?.showLogo && storeSettings?.logoUrl && (
              <div className="w-10 h-10 mx-auto mb-1 rounded-md overflow-hidden flex items-center justify-center">
                <img src={storeSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="font-black text-sm tracking-wider uppercase">{storeName}</div>
            <div className="text-[10px] text-gray-600">{tagline}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {address}, {city}
            </div>
            <div className="text-[10px] text-gray-500">Telp/WA: {phone}</div>
            {copyLabel && (
              <div className="mt-1 inline-block px-1.5 py-0.5 bg-gray-200 text-black text-[9px] font-bold">
                *** {copyLabel} ***
              </div>
            )}
          </div>

          {/* Doc Title */}
          <div className="text-center py-1 border-b border-dashed border-gray-400">
            <div className="font-bold text-xs uppercase tracking-wider text-black">
              {docType === 'intake'
                ? 'TANDA TERIMA MASUK SERVICE'
                : 'SERAH TERIMA PENGAMBILAN UNIT'}
            </div>
            <div className="font-mono font-black text-sm text-blue-900 mt-0.5">
              NO: {order.id}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-1 text-[11px] py-1 border-b border-dashed border-gray-400">
            <div className="flex justify-between">
              <span>Tgl Masuk:</span>
              <span>{order.entryDate}</span>
            </div>
            {docType === 'completion' && order.finishDate && (
              <div className="flex justify-between">
                <span>Tgl Selesai:</span>
                <span>{order.finishDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>WhatsApp:</span>
              <span>{order.customerPhone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Teknisi:</span>
              <span>{order.technician}</span>
            </div>
          </div>

          {/* Device & Problem */}
          <div className="space-y-1 text-[11px] py-1 border-b border-dashed border-gray-400">
            <div>
              <span className="text-gray-500 block">Perangkat / Unit:</span>
              <span className="font-bold text-black text-xs">{order.device}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Keluhan Kerusakan:</span>
              <p className="text-gray-800 italic">"{order.complaint}"</p>
            </div>
            {order.accessories && (
              <div>
                <span className="text-gray-500 block">Kelengkapan:</span>
                <span className="text-gray-800 font-medium">{order.accessories}</span>
              </div>
            )}
            {docType === 'completion' && order.diagnosis && (
              <div>
                <span className="text-gray-500 block">Tindakan / Diagnosa:</span>
                <p className="text-blue-900 font-medium">{order.diagnosis}</p>
              </div>
            )}
            {docType === 'completion' && order.sparepartsUsed && (
              <div>
                <span className="text-gray-500 block">Part Diganti:</span>
                <span className="text-gray-800">{order.sparepartsUsed}</span>
              </div>
            )}
          </div>

          {/* Cost */}
          <div className="py-1 border-b border-dashed border-gray-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>{docType === 'intake' ? 'Estimasi Biaya:' : 'Total Biaya Service:'}</span>
              <span className="font-bold text-sm text-black">{formatCurrency(costToShow)}</span>
            </div>
            {order.downPayment && order.downPayment > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>DP / Uang Muka:</span>
                <span>{formatCurrency(order.downPayment)}</span>
              </div>
            )}
            <div className="flex justify-between text-blue-900">
              <span>Status Unit:</span>
              <span className="font-bold uppercase">{order.status}</span>
            </div>
            {docType === 'completion' && (
              <div className="flex justify-between text-emerald-800 font-semibold pt-0.5">
                <span>Garansi Toko:</span>
                <span>{order.warranty || '30 Hari'}</span>
              </div>
            )}
          </div>

          {/* S&K */}
          {srvSettings?.showTerms !== false && (
            <div className="py-1 text-[9px] text-gray-500 space-y-0.5 border-b border-dashed border-gray-400">
              <div className="font-bold text-gray-700">Syarat &amp; Ketentuan:</div>
              <p>1. Wajib membawa nota ini saat pengambilan unit.</p>
              <p>2. Unit tidak diambil &gt; 30 hari di luar tanggung jawab toko.</p>
              <p>3. Garansi berlaku untuk kerusakan yang sama.</p>
            </div>
          )}

          {/* Signature */}
          {srvSettings?.showSignatureSection !== false && (
            <div className="pt-2 grid grid-cols-2 text-center text-[10px] gap-2">
              <div>
                <p className="text-gray-500 mb-6">Pelanggan,</p>
                <p className="font-bold border-t border-dotted border-gray-400 pt-0.5">
                  ({order.customerName})
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-6">Penerima / Teknisi,</p>
                <p className="font-bold border-t border-dotted border-gray-400 pt-0.5">
                  ({order.technician.split(' ')[0]})
                </p>
              </div>
            </div>
          )}

          <div className="text-center pt-2 text-[9px] text-gray-400">
            SIMPAN NOTA INI DENGAN BAIK &bull; HIROSHI COMPUTER
          </div>
        </div>
      );
    }

    if (isDotMatrix) {
      // Dot matrix continuous form paper style
      return (
        <div className="font-mono text-[11px] text-black leading-snug space-y-1.5 bg-white p-3 border border-black dot-matrix-box">
          <div className="flex justify-between items-start border-b border-black pb-1">
            <div>
              <div className="font-bold text-sm tracking-wide uppercase">{storeName}</div>
              <div className="text-[10px]">{address}, {city} &bull; Telp/WA: {phone}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xs uppercase underline">
                {docType === 'intake' ? 'TANDA TERIMA SERVIS' : 'BUKTI SERAH TERIMA UNIT'}
              </div>
              <div className="font-black text-xs">NO: {order.id}</div>
              {copyLabel && <div className="text-[9px] font-bold">[{copyLabel}]</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] py-1 border-b border-dashed border-black">
            <div>
              <div><span className="inline-block w-20">Pelanggan</span>: <strong>{order.customerName}</strong></div>
              <div><span className="inline-block w-20">No. HP/WA</span>: {order.customerPhone || '-'}</div>
              <div><span className="inline-block w-20">Unit/Barang</span>: <strong>{order.device}</strong></div>
            </div>
            <div>
              <div><span className="inline-block w-20">Tgl Masuk</span>: {order.entryDate}</div>
              {docType === 'completion' && (
                <div><span className="inline-block w-20">Tgl Selesai</span>: {order.finishDate || '-'}</div>
              )}
              <div><span className="inline-block w-20">Teknisi</span>: {order.technician}</div>
            </div>
          </div>

          <div className="text-[10px] py-1 border-b border-dashed border-black space-y-1">
            <div>
              <span className="font-bold">Keluhan Kerusakan:</span> {order.complaint}
            </div>
            {order.accessories && (
              <div>
                <span className="font-bold">Kelengkapan Bawaan:</span> {order.accessories}
              </div>
            )}
            {docType === 'completion' && order.diagnosis && (
              <div>
                <span className="font-bold">Diagnosa / Tindakan:</span> {order.diagnosis}
              </div>
            )}
            {docType === 'completion' && order.sparepartsUsed && (
              <div>
                <span className="font-bold">Sparepart Diganti:</span> {order.sparepartsUsed}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center py-1 border-b border-black text-[11px]">
            <div>
              Status: <span className="font-bold uppercase">[{order.status}]</span>
              {docType === 'completion' && (
                <span className="ml-3 font-semibold">Garansi: {order.warranty || '30 Hari'}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs">{docType === 'intake' ? 'Estimasi Biaya' : 'TOTAL BIAYA'}: </span>
              <span className="text-sm font-black">{formatCurrency(costToShow)}</span>
            </div>
          </div>

          {srvSettings?.showTerms !== false && (
            <div className="text-[9px] text-gray-700 italic border-b border-dashed border-black pb-1">
              Catatan: 1. Wajib bawa nota saat ambil unit. 2. Unit &gt; 30 hari di luar tanggung jawab toko. 3. Garansi kerusakan sama.
            </div>
          )}

          {srvSettings?.showSignatureSection !== false && (
            <div className="grid grid-cols-2 pt-2 text-center text-[10px]">
              <div>
                <p className="mb-8">Tanda Tangan Pelanggan,</p>
                <p className="font-bold">(&nbsp;&nbsp;&nbsp;&nbsp;{order.customerName}&nbsp;&nbsp;&nbsp;&nbsp;)</p>
              </div>
              <div>
                <p className="mb-8">Hormat Kami / Teknisi,</p>
                <p className="font-bold">(&nbsp;&nbsp;&nbsp;&nbsp;{order.technician}&nbsp;&nbsp;&nbsp;&nbsp;)</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default: Inkjet / Laser (A4 or A5) Sheet
    return (
      <div className="text-gray-900 leading-normal space-y-3 p-2">
        {/* Official Header */}
        <div className="flex justify-between items-start border-b-2 border-blue-900 pb-3">
          <div className="flex items-start gap-3">
            {pSettings?.showLogo && storeSettings?.logoUrl ? (
              <img
                src={storeSettings.logoUrl}
                alt="Logo"
                className="w-14 h-14 object-contain rounded-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-xl">
                HC
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wide text-blue-950 uppercase font-sans">
                {storeName}
              </h1>
              <p className="text-xs text-blue-800 font-medium">{tagline}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {address}, {city} &bull; No. HP/WA: <strong className="text-gray-900">{phone}</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                docType === 'intake'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {docType === 'intake'
                ? 'TANDA TERIMA SERVIS MASUK'
                : 'BERITA ACARA SERAH TERIMA UNIT'}
            </span>
            <div className="mt-1 font-mono font-extrabold text-sm text-blue-900">
              {order.id}
            </div>
            {copyLabel && (
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">
                {copyLabel}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Customer & Unit Details */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
              Informasi Pelanggan &amp; Unit
            </h4>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-gray-500">Nama Pelanggan</span>
              <span className="col-span-2 font-bold text-gray-900">: {order.customerName}</span>

              <span className="text-gray-500">No. HP / WA</span>
              <span className="col-span-2 font-mono text-gray-900">: {order.customerPhone || '-'}</span>

              <span className="text-gray-500">Tipe Perangkat</span>
              <span className="col-span-2 font-bold text-blue-950">: {order.device}</span>

              <span className="text-gray-500">Kelengkapan</span>
              <span className="col-span-2 font-medium text-gray-800">
                : {order.accessories || 'Unit Only (Tanpa Charger/Aksesoris)'}
              </span>
            </div>
          </div>

          {/* Ticket Meta Details */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-gray-200 pb-1">
              Detail Tiket Pengerjaan
            </h4>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-gray-500">Tgl Masuk</span>
              <span className="col-span-2 font-mono text-gray-900">: {order.entryDate}</span>

              {docType === 'completion' && (
                <>
                  <span className="text-gray-500">Tgl Selesai</span>
                  <span className="col-span-2 font-mono text-gray-900">
                    : {order.finishDate || 'Hari Ini'}
                  </span>
                </>
              )}

              <span className="text-gray-500">Teknisi PIC</span>
              <span className="col-span-2 font-semibold text-gray-900">: {order.technician}</span>

              <span className="text-gray-500">Status Saat Ini</span>
              <span className="col-span-2 font-bold text-blue-800 uppercase">: {order.status}</span>
            </div>
          </div>
        </div>

        {/* Complaints & Actions Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-2.5">Keterangan / Uraian Perbaikan</th>
                <th className="p-2.5 text-right w-44">Estimasi / Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-2.5">
                  <div className="font-bold text-gray-900">Keluhan Pelanggan:</div>
                  <p className="text-gray-700 mt-0.5 italic">"{order.complaint}"</p>

                  {docType === 'completion' && order.diagnosis && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="font-bold text-blue-900">Tindakan Servis &amp; Solusi:</div>
                      <p className="text-gray-800 mt-0.5">{order.diagnosis}</p>
                    </div>
                  )}

                  {docType === 'completion' && order.sparepartsUsed && (
                    <div className="mt-1">
                      <span className="font-semibold text-gray-700">Sparepart yang Diganti: </span>
                      <span className="text-gray-900">{order.sparepartsUsed}</span>
                    </div>
                  )}
                </td>
                <td className="p-2.5 text-right align-top">
                  <div className="font-bold text-sm text-gray-900">
                    {formatCurrency(costToShow)}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {docType === 'intake' ? '(Estimasi awal)' : '(Total tagihan)'}
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-blue-50/50 font-bold border-t border-gray-200">
              <tr>
                <td className="p-2.5 text-right">
                  {docType === 'intake' ? 'Perkiraan Total Biaya:' : 'TOTAL PEMBAYARAN:'}
                </td>
                <td className="p-2.5 text-right text-sm font-black text-blue-950">
                  {formatCurrency(costToShow)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Warranty Notice in Completion Mode */}
        {docType === 'completion' && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Masa Garansi Servis:</strong> {order.warranty || '30 Hari sejak unit diambil'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-800">
              *Hanya berlaku untuk unit &amp; jenis kerusakan yang sama
            </span>
          </div>
        )}

        {/* Terms & Conditions */}
        {srvSettings?.showTerms !== false && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-600 space-y-1">
            <div className="font-bold text-gray-800 uppercase tracking-wide">
              Ketentuan Service &amp; Pengambilan Unit:
            </div>
            <p>1. Lembar bukti ini merupakan tanda terima resmi dan <strong>WAJIB</strong> dibawa saat mengambil unit.</p>
            <p>2. Unit yang telah selesai dikonfirmasi dan tidak diambil lebih dari 30 (tiga puluh) hari bukan lagi tanggung jawab toko.</p>
            <p>3. Toko tidak bertanggung jawab atas kehilangan data pada media penyimpanan (harddisk/SSD). Pelanggan diharapkan telah mem-backup data penting.</p>
            {docType === 'completion' && (
              <p className="font-semibold text-gray-800">
                4. Dengan menandatangani lembar ini, pelanggan menyatakan telah menguji dan menerima unit dalam kondisi baik dan normal.
              </p>
            )}
          </div>
        )}

        {/* Signature Area */}
        {srvSettings?.showSignatureSection !== false && (
          <div className="pt-2 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-gray-500 mb-10">
                {docType === 'intake' ? 'Pelanggan / Yang Menyerahkan,' : 'Pelanggan / Yang Menerima,'}
              </p>
              <p className="font-bold text-gray-900 border-t border-gray-300 pt-1">
                (&nbsp;&nbsp;{order.customerName}&nbsp;&nbsp;)
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-10">
                {storeName} / Teknisi PIC,
              </p>
              <p className="font-bold text-gray-900 border-t border-gray-300 pt-1">
                (&nbsp;&nbsp;{order.technician}&nbsp;&nbsp;)
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id="service-receipt-modal-backdrop"
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
                <span>Cetak Nota &amp; Serah Terima Service IT</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-normal">
                  {order.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                HIROSHI COMPUTER &bull; Pilihan Format Berbagai Macam Printer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Salin Rangkuman Teks"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Tersalin' : 'Salin Teks'}</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Kirim ke WhatsApp Pelanggan"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim WA</span>
            </a>

            <button
              id="btn-close-service-receipt"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Controls - Hidden on Print */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 print:hidden space-y-3">
          {/* Top Row: Doc Type Switcher & Copy Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Type selector */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setDocType('intake')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  docType === 'intake'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>1. Tanda Terima Masuk (Intake)</span>
              </button>

              <button
                type="button"
                onClick={() => setDocType('completion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  docType === 'completion'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2. Serah Terima Selesai / Ambil</span>
              </button>
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
                  2x Rangkap (Toko + Customer)
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
                Ukuran: {printerProfiles.badge}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  {
                    id: 'inkjet-a5',
                    name: 'Inkjet / Laser A5',
                    desc: '1/2 Folio Standar',
                    icon: '📄',
                  },
                  {
                    id: 'inkjet-a4',
                    name: 'Inkjet / Laser A4',
                    desc: 'Lembar Resmi Penuh',
                    icon: '📑',
                  },
                  {
                    id: 'thermal-80',
                    name: 'Thermal 80mm',
                    desc: 'Struk Kasir Standar',
                    icon: '🧾',
                  },
                  {
                    id: 'thermal-58',
                    name: 'Thermal 58mm',
                    desc: 'Mini Bluetooth POS',
                    icon: '📱',
                  },
                  {
                    id: 'dot-matrix',
                    name: 'Dot Matrix NCR',
                    desc: 'Epson Continuous',
                    icon: '🖨️',
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
          <div id="service-receipt-print-area" className="space-y-6">
            {/* Copy 1 */}
            <div
              id="printable-service-sheet"
              className={`receipt-paper bg-white border border-gray-300 p-5 rounded-lg shadow-md print:shadow-none print:border-none print:p-0 mx-auto transition-all ${printerProfiles.widthClass}`}
            >
              {renderDocumentContent(1)}
            </div>

            {/* Copy 2 if requested */}
            {copies > 1 && (
              <div
                className={`receipt-paper bg-white border border-dashed border-gray-400 p-5 rounded-lg shadow-md print:shadow-none print:border-none print:p-0 mx-auto transition-all page-break print:break-before-page ${printerProfiles.widthClass}`}
              >
                {renderDocumentContent(2)}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions - Hidden on Print */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-gray-500">
            Printer aktif: <strong className="text-gray-800">{printerProfiles.label}</strong> ({printerProfiles.badge})
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleOpenCleanTab}
              className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Buka Nota Bersih di Tab Baru"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Tab Baru</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              id="btn-print-service-document"
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="py-2.5 px-5 sm:px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Menyiapkan Cetak...' : `Cetak Sekarang (${printerProfiles.label})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
