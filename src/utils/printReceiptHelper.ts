import { PrinterType } from '../types';

export interface PrintReceiptOptions {
  title?: string;
  printerType?: PrinterType;
  copies?: number;
  autoPrint?: boolean;
}

/**
 * Print utility designed specifically for POS receipt & service invoice printing.
 * Uses an isolated hidden iframe so that main application chrome (header, navbar,
 * background cards, modals, and toolbars) NEVER leak into the printed document.
 * This guarantees:
 * 1. Exactly 1 sheet of paper (or exact copy count) on Epson LX-310 and thermal printers
 * 2. No application headers, URLs, or background service cards are printed
 * 3. Crisp monochrome typography and border formatting for dot-matrix and thermal
 */
export function printReceiptElement(
  elementOrId: HTMLElement | string,
  options: PrintReceiptOptions = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const sourceElement =
        typeof elementOrId === 'string'
          ? document.getElementById(elementOrId)
          : elementOrId;

      if (!sourceElement) {
        console.warn('[PrintHelper] Target element not found for printing, fallback to window.print()');
        window.print();
        resolve(false);
        return;
      }

      const {
        title = 'Nota Transaksi / Servis IT',
        printerType = 'dot-matrix',
        copies = 1,
      } = options;

      // Extract outer/inner HTML
      const contentHtml = sourceElement.outerHTML;

      // Remove previous print frame if any
      const existingFrame = document.getElementById('pos-print-hidden-frame');
      if (existingFrame) {
        existingFrame.remove();
      }

      // Create a fresh isolated iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'pos-print-hidden-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!frameDoc) {
        console.warn('[PrintHelper] Could not access iframe document, fallback to window.print()');
        window.print();
        resolve(false);
        return;
      }

      // Determine printer-specific page styles
      let pageRules = '';
      let bodyStyles = '';

      if (printerType === 'dot-matrix') {
        // Epson LX-310 ESC/P & Continuous Form Paper (80-column)
        pageRules = `
          @page {
            size: auto;
            margin: 2mm 3mm 2mm 3mm;
          }
        `;
        bodyStyles = `
          font-family: 'JetBrains Mono', 'Courier New', Consolas, monospace !important;
          font-size: 11px;
          line-height: 1.35;
          color: #000000 !important;
          background: #ffffff !important;
          width: 100% !important;
          max-width: 760px;
          margin: 0 auto;
          padding: 2px 4px;
        `;
      } else if (printerType === 'thermal-58') {
        // 58mm Thermal Bluetooth / POS
        pageRules = `
          @page {
            size: 58mm auto;
            margin: 0;
          }
        `;
        bodyStyles = `
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 11px;
          line-height: 1.25;
          color: #000000 !important;
          background: #ffffff !important;
          width: 48mm;
          max-width: 48mm;
          margin: 0 auto;
          padding: 1mm 0 2mm 0;
        `;
      } else if (printerType === 'thermal-80') {
        // 80mm Thermal Cashier
        pageRules = `
          @page {
            size: 80mm auto;
            margin: 0;
          }
        `;
        bodyStyles = `
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 11.5px;
          line-height: 1.3;
          color: #000000 !important;
          background: #ffffff !important;
          width: 72mm;
          max-width: 72mm;
          margin: 0 auto;
          padding: 2mm 0 3mm 0;
        `;
      } else if (printerType === 'inkjet-a5') {
        // A5 Sheet (1/2 Folio)
        pageRules = `
          @page {
            size: A5 landscape;
            margin: 4mm 6mm;
          }
        `;
        bodyStyles = `
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #0f172a;
          background: #ffffff !important;
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          padding: 4px;
        `;
      } else {
        // A4 Standard
        pageRules = `
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
        `;
        bodyStyles = `
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: 12px;
          line-height: 1.45;
          color: #0f172a;
          background: #ffffff !important;
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding: 8px;
        `;
      }

      // Build Complete Clean Document
      const completeHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    ${pageRules}

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      ${bodyStyles}
    }

    /* Reset unnecessary container borders / shadows when printed */
    .receipt-paper {
      box-shadow: none !important;
      background: #ffffff !important;
      margin: 0 auto !important;
      padding: 4px !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    /* Dot Matrix specific sharp contrast */
    .dot-matrix-box {
      border: 1px solid #000000 !important;
      background: #ffffff !important;
      color: #000000 !important;
      width: 100% !important;
    }

    .border-black { border-color: #000000 !important; }
    .border-dashed { border-style: dashed !important; }
    .border-b { border-bottom-width: 1px !important; }
    .border-t { border-top-width: 1px !important; }
    .border { border-width: 1px !important; }

    /* Flexbox & Grid Resets for Clean Layout */
    .flex { display: flex !important; }
    .flex-col { flex-direction: column !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .justify-between { justify-content: space-between !important; }
    .justify-center { justify-content: center !important; }
    .justify-end { justify-content: flex-end !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .text-left { text-align: left !important; }
    .font-bold { font-weight: 700 !important; }
    .font-black { font-weight: 900 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-medium { font-weight: 500 !important; }
    .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace !important; }
    .uppercase { text-transform: uppercase !important; }
    .underline { text-decoration: underline !important; }
    .italic { font-style: italic !important; }

    .grid { display: grid !important; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .col-span-2 { grid-column: span 2 / span 2 !important; }
    .gap-1 { gap: 4px !important; }
    .gap-2 { gap: 8px !important; }
    .gap-3 { gap: 12px !important; }
    .gap-4 { gap: 16px !important; }
    .gap-8 { gap: 32px !important; }

    .space-y-1 > * + * { margin-top: 4px !important; }
    .space-y-1\\.5 > * + * { margin-top: 6px !important; }
    .space-y-2 > * + * { margin-top: 8px !important; }
    .space-y-3 > * + * { margin-top: 12px !important; }

    .p-1 { padding: 4px !important; }
    .p-2 { padding: 8px !important; }
    .p-3 { padding: 12px !important; }
    .p-4 { padding: 16px !important; }
    .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
    .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
    .pb-1 { padding-bottom: 4px !important; }
    .pb-2 { padding-bottom: 8px !important; }
    .pb-3 { padding-bottom: 12px !important; }
    .pt-1 { padding-top: 4px !important; }
    .pt-2 { padding-top: 8px !important; }
    .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
    .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
    .mb-6 { margin-bottom: 24px !important; }
    .mb-8 { margin-bottom: 32px !important; }
    .mb-10 { margin-bottom: 40px !important; }
    .mt-0\\.5 { margin-top: 2px !important; }
    .mt-1 { margin-top: 4px !important; }
    .mt-2 { margin-top: 8px !important; }

    .inline-block { display: inline-block !important; }
    .w-20 { width: 80px !important; }
    .w-full { width: 100% !important; }
    .w-12 { width: 48px !important; }
    .h-12 { height: 48px !important; }
    .w-14 { width: 56px !important; }
    .h-14 { height: 56px !important; }
    .w-10 { width: 40px !important; }
    .h-10 { height: 40px !important; }

    table { width: 100% !important; border-collapse: collapse !important; }
    th, td { padding: 4px 6px !important; }

    /* Page break for multi-copy receipts */
    .page-break {
      page-break-after: always !important;
      break-after: page !important;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }

    /* Hide any buttons, shadows, or UI chrome that were cloned inside */
    button, .no-print, [class*="print:hidden"] {
      display: none !important;
    }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;

      frameDoc.open();
      frameDoc.write(completeHtml);
      frameDoc.close();

      // Give browser brief tick to calculate layout and load local fonts/images
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve(true);
        } catch (err) {
          console.error('[PrintHelper] Error triggering print inside iframe:', err);
          window.print();
          resolve(false);
        }
      }, 300);
    } catch (e) {
      console.error('[PrintHelper] Top-level error in printReceiptElement:', e);
      window.print();
      resolve(false);
    }
  });
}

/**
 * Alternative helper to open clean receipt in a new tab if popup is preferred.
 */
export function openReceiptInNewTab(
  elementOrId: HTMLElement | string,
  options: PrintReceiptOptions = {}
) {
  const sourceElement =
    typeof elementOrId === 'string'
      ? document.getElementById(elementOrId)
      : elementOrId;

  if (!sourceElement) return;

  const printWindow = window.open('', '_blank', 'width=800,height=700');
  if (!printWindow) {
    // Popup blocked, fallback to iframe print
    printReceiptElement(sourceElement, options);
    return;
  }

  const { title = 'Nota Transaksi / Servis IT', printerType = 'dot-matrix' } = options;
  const contentHtml = sourceElement.outerHTML;

  printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { size: auto; margin: 3mm 4mm; }
    body {
      font-family: ${printerType === 'dot-matrix' || printerType.startsWith('thermal') ? "'JetBrains Mono', monospace" : "sans-serif"};
      margin: 10px auto;
      max-width: ${printerType === 'dot-matrix' ? '760px' : printerType === 'thermal-58' ? '280px' : printerType === 'thermal-80' ? '350px' : '720px'};
      padding: 10px;
      color: #000;
      background: #fff;
    }
    .page-break { page-break-after: always; break-after: page; }
    button, .no-print { display: none !important; }
  </style>
</head>
<body>
  ${contentHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}
