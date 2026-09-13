import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, StoreSettings, User } from '../types';
import { formatCurrency } from './formatters';

export interface PdfReportOptions {
  periodLabel: string;
  filterPeriod: 'all' | 'today' | 'month';
  includeDetails?: boolean;
  includeTopProducts?: boolean;
  includeSignatures?: boolean;
}

export function generateSalesReportPdf(
  transactions: Transaction[],
  storeSettings?: StoreSettings,
  currentUser?: User,
  options: PdfReportOptions = {
    periodLabel: 'Semua Waktu',
    filterPeriod: 'all',
    includeDetails: true,
    includeTopProducts: true,
    includeSignatures: true,
  }
): jsPDF {
  // Initialize A4 Portrait document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;

  // Filter calculations
  const validTrx = transactions.filter((t) => t.status !== 'Void');
  const voidTrx = transactions.filter((t) => t.status === 'Void');

  const totalRevenue = validTrx.reduce((sum, t) => sum + t.total, 0);
  const totalSubtotal = validTrx.reduce((sum, t) => sum + t.subtotal, 0);
  const totalDiscounts = validTrx.reduce((sum, t) => sum + t.discount, 0);
  const averageOrderValue = validTrx.length > 0 ? totalRevenue / validTrx.length : 0;

  // Payment Breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  validTrx.forEach((t) => {
    const m = t.paymentMethod || 'Tunai';
    if (!paymentBreakdown[m]) paymentBreakdown[m] = { count: 0, total: 0 };
    paymentBreakdown[m].count += 1;
    paymentBreakdown[m].total += t.total;
  });

  // Top Products
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

  const topProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);

  // Store information
  const storeName = storeSettings?.storeName || 'HIROSHI COMPUTER';
  const tagline = storeSettings?.tagline || 'Toko Komputer, Part PC & Layanan Service IT';
  const address = storeSettings?.address || 'Jl. Ahmad Yani No. 88, Komputer & IT Solution';
  const city = storeSettings?.city || 'Jakarta Pusat';
  const phone = storeSettings?.phone || '0812-3456-7890';
  const email = storeSettings?.email || 'kontak@hiroshicomputer.com';

  const printedAt = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';

  // --- HEADER SECTION ---
  let currentY = 14;

  // Store Brand Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(storeName.toUpperCase(), marginX, currentY);

  // Store Tagline
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(tagline, marginX, currentY);

  // Address & Contacts (two lines)
  currentY += 4.5;
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${address}, ${city} | Telp: ${phone} | Email: ${email}`, marginX, currentY);

  // Divider Line
  currentY += 4;
  doc.setDrawColor(30, 136, 229); // #1E88E5 primary blue
  doc.setLineWidth(0.8);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  // Subtle second divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY + 1.2, pageWidth - marginX, currentY + 1.2);

  // --- REPORT TITLE & METADATA ---
  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(13, 71, 161); // #0D47A1
  doc.text('LAPORAN PENJUALAN & KEUANGAN', marginX, currentY);

  // Right-aligned report metadata block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Periode: ${options.periodLabel}`, marginX, currentY + 5);
  doc.text(`Dicetak: ${printedAt}`, marginX, currentY + 9.5);
  doc.text(
    `Operator: ${currentUser?.fullName || 'Admin'} (${currentUser?.role || 'Admin'})`,
    marginX,
    currentY + 14
  );

  // Total Transactions Badge on Right
  const rightBadgeX = pageWidth - marginX;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Transaksi: ${validTrx.length} Nota Sukses`, rightBadgeX, currentY + 5, {
    align: 'right',
  });
  if (voidTrx.length > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text(`(${voidTrx.length} Nota Void/Batal)`, rightBadgeX, currentY + 9.5, {
      align: 'right',
    });
  }

  currentY += 18;

  // --- EXECUTIVE SUMMARY KPI BOXES (Structured Table) ---
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [
      [
        'TOTAL OMSET BERSIH',
        'TOTAL NOTA SUKSES',
        'TOTAL DISKON',
        'RATA-RATA ORDER (AOV)',
        'TRANSAKSI VOID',
      ],
    ],
    body: [
      [
        formatCurrency(totalRevenue),
        `${validTrx.length} Transaksi`,
        formatCurrency(totalDiscounts),
        formatCurrency(averageOrderValue),
        `${voidTrx.length} Nota`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // #0F172A dark slate
      textColor: [241, 245, 249],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: [13, 71, 161],
      fontSize: 9.5,
      fontStyle: 'bold',
      halign: 'center',
      fillColor: [240, 249, 255], // sky-50
    },
    columnStyles: {
      0: { textColor: [13, 71, 161], fontSize: 10 }, // Big revenue
      4: { textColor: voidTrx.length > 0 ? [220, 38, 38] : [100, 116, 139] },
    },
  });

  // Get position after KPI Table
  currentY = (doc as any).lastAutoTable.finalY + 7;

  // --- PAYMENT BREAKDOWN & TOP PRODUCTS (Two neat side-by-side or stacked tables) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Ringkasan Kanal Pembayaran', marginX, currentY);

  const paymentRows = Object.entries(paymentBreakdown).map(([method, data]) => {
    const pct = totalRevenue > 0 ? ((data.total / totalRevenue) * 100).toFixed(1) : '0.0';
    return [method, `${data.count}x`, formatCurrency(data.total), `${pct}%`];
  });

  // Add total row
  paymentRows.push([
    'TOTAL KESELURUHAN',
    `${validTrx.length}x`,
    formatCurrency(totalRevenue),
    '100%',
  ]);

  autoTable(doc, {
    startY: currentY + 2,
    margin: { left: marginX, right: marginX },
    head: [['Metode Pembayaran', 'Frekuensi', 'Total Nominal', 'Porsi (% Omset)']],
    body: paymentRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 136, 229], // primary blue
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      3: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.row.index === paymentRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [226, 232, 240];
        data.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // --- TOP SELLING PRODUCTS ---
  if (options.includeTopProducts && topProducts.length > 0) {
    // Check if we need space or new page
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Top 10 Produk & Part PC Terlaris', marginX, currentY);

    const topRows = topProducts.slice(0, 10).map((p, idx) => [
      `#${idx + 1}`,
      p.name,
      `${p.qty} unit`,
      formatCurrency(p.subtotal),
    ]);

    autoTable(doc, {
      startY: currentY + 2,
      margin: { left: marginX, right: marginX },
      head: [['Rank', 'Nama Produk / Komponen PC', 'Qty Terjual', 'Total Omset Produk']],
      body: topRows,
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105], // slate-600
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
        1: { fontStyle: 'bold' },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 7;
  }

  // --- DETAILED TRANSACTIONS LIST ---
  if (options.includeDetails && transactions.length > 0) {
    if (currentY > pageHeight - 65) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `3. Rincian Riwayat Transaksi (${transactions.length} Data)`,
      marginX,
      currentY
    );

    const detailRows = transactions.map((t, idx) => {
      const itemsSummary = t.items
        .map((itm) => `${itm.productName} (${itm.qty}x)`)
        .join(', ');

      const formattedDate = t.date.replace('T', ' ').slice(0, 16);

      return [
        (idx + 1).toString(),
        t.id,
        formattedDate,
        t.cashier || '-',
        itemsSummary || 'Barang/Jasa',
        t.paymentMethod || 'Tunai',
        t.discount > 0 ? formatCurrency(t.discount) : '-',
        formatCurrency(t.total),
        t.status.toUpperCase(),
      ];
    });

    autoTable(doc, {
      startY: currentY + 2,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'No',
          'ID Nota',
          'Waktu',
          'Kasir',
          'Rincian Produk/Part',
          'Metode',
          'Diskon',
          'Total Bayar',
          'Status',
        ],
      ],
      body: detailRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [51, 65, 85],
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 26, fontStyle: 'bold' },
        2: { cellWidth: 24, fontSize: 6.5 },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 42 },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 16, halign: 'right' },
        7: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        8: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rowData = detailRows[data.row.index];
          if (rowData && rowData[8] === 'VOID') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fillColor = [254, 242, 242]; // red-50
          }
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- SIGNATURE SECTION ---
  if (options.includeSignatures) {
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 20;
    }

    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const leftSignX = marginX + 15;
    const rightSignX = pageWidth - marginX - 55;

    doc.text(`${city}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, rightSignX, currentY);
    
    currentY += 4;
    doc.text('Dibuat & Diverifikasi Oleh,', leftSignX, currentY);
    doc.text('Mengetahui / Disetujui,', rightSignX, currentY);

    currentY += 16; // Space for physical signature or stamp
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`( ${currentUser?.fullName || 'Kasir / Admin'} )`, leftSignX - 5, currentY);
    doc.text('( Pemilik / Manager Toko )', rightSignX - 5, currentY);

    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Role: ${currentUser?.role || 'Admin'}`, leftSignX - 5, currentY);
    doc.text(`${storeName}`, rightSignX - 5, currentY);
  }

  // --- PAGE NUMBERING & FOOTER ON ALL PAGES ---
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 10, pageWidth - marginX, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Dokumen Resmi ${storeName} POS • Sistem Kasir & Inventori Hardware • Dicetak: ${printedAt}`,
      marginX,
      pageHeight - 6.5
    );
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginX, pageHeight - 6.5, {
      align: 'right',
    });
  }

  return doc;
}

export function downloadSalesReportPdf(
  transactions: Transaction[],
  storeSettings?: StoreSettings,
  currentUser?: User,
  options?: PdfReportOptions
) {
  const doc = generateSalesReportPdf(transactions, storeSettings, currentUser, options);
  const period = options?.filterPeriod || 'all';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `Laporan_Penjualan_${storeSettings?.storeName?.replace(/\s+/g, '_') || 'Hiroshi'}_${period}_${timestamp}.pdf`;
  doc.save(filename);
}

export function openSalesReportPdfInNewTab(
  transactions: Transaction[],
  storeSettings?: StoreSettings,
  currentUser?: User,
  options?: PdfReportOptions
) {
  const doc = generateSalesReportPdf(transactions, storeSettings, currentUser, options);
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
}
