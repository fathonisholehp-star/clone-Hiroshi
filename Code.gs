/**
 * ============================================================================
 * HIROSHI COMPUTER - POS & SERVICE MANAGEMENT SYSTEM
 * Backend Google Apps Script (Code.gs)
 * 
 * Toko: HIROSHI COMPUTER
 * Alamat: Jl. Tunggorono No 46 Pucangan, Kartasura
 * No. HP / WhatsApp: 085876500029
 * ============================================================================
 * 
 * FITUR UTAMA:
 * 1. LANGSUNG BISA DI-DEPLOY: Cukup salin file Code.gs ini ke Extensions > Apps Script
 *    dan klik Deploy > New deployment > Web app. Tidak perlu konfigurasi manual!
 * 2. AUTO-SETUP: Seluruh 9 tabel database otomatis terbuat saat pertama kali dijalankan.
 * 3. MENU GOOGLE SHEETS: Menu "🏪 Hiroshi POS" otomatis muncul di toolbar Google Sheets
 *    untuk membuka aplikasi langsung di dalam sheet (Dialog Pop-up & Sidebar).
 * 4. API & WEBHOOK: Mendukung doPost & doGet untuk integrasi langsung dengan aplikasi Web.
 * 5. MODULAR & STANDALONE: Otomatis membaca file 'Index' jika ada, atau menggunakan
 *    UI bawaan terintegrasi jika file Index.html belum dibuat.
 */

// Konfigurasi Nama 9 Sheet Database
var SHEETS = {
  PRODUK: 'Produk',
  TRANSAKSI: 'Transaksi',
  DETAIL_TRANSAKSI: 'DetailTransaksi',
  SERVICE: 'Service',
  USER: 'User',
  KATEGORI: 'Kategori',
  STOK_LOG: 'StokLog',
  ABSENSI: 'Absensi',
  PENGATURAN: 'Pengaturan'
};

var STORE_INFO = {
  name: 'HIROSHI COMPUTER',
  tagline: 'Toko Komputer, Part PC & Layanan Service IT',
  address: 'Jl. Tunggorono No 46 Pucangan, Kartasura',
  phone: '085876500029',
  email: 'info@hiroshicomputer.com'
};

/**
 * ============================================================================
 * MENU DI TOOLBAR GOOGLE SHEETS (onOpen)
 * Otomatis menambahkan menu kustom saat spreadsheet dibuka
 * ============================================================================
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🏪 Hiroshi POS')
      .addItem('🚀 Buka Aplikasi Kasir & Service (Dialog Penuh)', 'openAppDialog')
      .addItem('📱 Buka di Panel Samping (Sidebar)', 'openAppSidebar')
      .addSeparator()
      .addItem('⚙️ Setup / Reset Database Sheets', 'setup')
      .addItem('📊 Lihat Ringkasan Penjualan', 'showQuickSummary')
      .addToUi();
  } catch (err) {
    console.log('onOpen Error:', err);
  }
}

/**
 * Membuka aplikasi Hiroshi POS dalam jendela dialog modal di dalam Google Sheets
 */
function openAppDialog() {
  var html = doGet();
  html.setWidth(1200).setHeight(850);
  SpreadsheetApp.getUi().showModalDialog(html, 'Hiroshi Computer - Sistem Kasir & Service POS');
}

/**
 * Membuka aplikasi Hiroshi POS di panel samping (Sidebar) Google Sheets
 */
function openAppSidebar() {
  var html = doGet();
  html.setTitle('Hiroshi Computer POS');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Menampilkan ringkasan cepat penjualan di dalam pop-up Google Sheets
 */
function showQuickSummary() {
  var rep = getReportSummary();
  var ui = SpreadsheetApp.getUi();
  if (rep && rep.success) {
    var d = rep.data;
    var msg = '📊 RINGKASAN HIROSHI COMPUTER POS\n\n' +
      '• Total Transaksi Berhasil: ' + d.totalOrders + '\n' +
      '• Total Transaksi Batal/Void: ' + d.voidOrders + '\n' +
      '• Total Omset Penjualan: Rp ' + Number(d.totalRevenue).toLocaleString('id-ID') + '\n\n' +
      'Alamat: ' + STORE_INFO.address + '\n' +
      'WhatsApp: ' + STORE_INFO.phone;
    ui.alert('Ringkasan Bisnis', msg, ui.ButtonSet.OK);
  } else {
    ui.alert('Pemberitahuan', 'Silakan jalankan Setup Database terlebih dahulu.', ui.ButtonSet.OK);
  }
}

/**
 * ============================================================================
 * ENTRY POINT WEB APP (doGet & doPost)
 * ============================================================================
 */
function doGet(e) {
  // 1. Pastikan sheet sudah siap
  ensureSetup();

  // 2. Handle request API (GET)
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    var resp = { success: false, message: 'Action tidak dikenal' };

    if (action === 'ping') {
      resp = { success: true, message: 'Koneksi ke Google Sheets Hiroshi POS Aktif!', timestamp: new Date() };
    } else if (action === 'getProducts') {
      resp = getProducts();
    } else if (action === 'getServices') {
      resp = getServices();
    } else if (action === 'getReport') {
      resp = getReportSummary();
    } else if (action === 'getAllData') {
      resp = {
        success: true,
        products: getProducts().data || [],
        services: getServices().data || [],
        categories: getCategories().data || [],
        users: getUsers().data || [],
        attendance: getAttendanceList().data || []
      };
    }

    return ContentService.createTextOutput(JSON.stringify(resp))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 3. Tampilkan Web App
  // Prioritas 1: Mencoba membaca file 'Index.html' di project Apps Script
  try {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Hiroshi Computer - POS & Service')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    // Prioritas 2: Jika user belum membuat file 'Index.html', gunakan UI bawaan yang sudah di-bundle
    // Sehingga Web App langsung bisa diakses TANPA PERNAH ERROR "File not found: Index"!
    return getEmbeddedHtmlOutput();
  }
}

/**
 * Endpoint Webhook / REST API untuk sinkronisasi dari aplikasi web
 */
function doPost(e) {
  try {
    ensureSetup();
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var action = payload.action || '';
    var data = payload.data || payload;
    var result = { success: false, message: 'Action tidak dikenali: ' + action };

    if (action === 'ping' || action === 'testConnection') {
      result = {
        success: true,
        message: 'Koneksi Google Sheets Hiroshi Computer Terhubung!',
        timestamp: new Date().toISOString()
      };
    } else if (action === 'saveTransaction') {
      result = saveTransaction(data);
    } else if (action === 'saveService') {
      result = saveService(data);
    } else if (action === 'updateServiceStatus') {
      result = updateServiceStatus(data.id, data.status, data.finalCost);
    } else if (action === 'saveAttendance') {
      result = saveAttendance(data);
    } else if (action === 'syncProducts') {
      result = syncProductsFromWeb(data);
    } else if (action === 'syncAll') {
      result = syncAllData(data);
    } else if (action === 'getAllData') {
      result = {
        success: true,
        products: getProducts().data || [],
        services: getServices().data || [],
        categories: getCategories().data || [],
        users: getUsers().data || [],
        attendance: getAttendanceList().data || []
      };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ============================================================================
 * INISIALISASI & SETUP DATABASE OTOMATIS
 * ============================================================================
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Memastikan seluruh sheet database sudah ada sebelum fungsi apa pun dijalankan
 */
function ensureSetup() {
  try {
    var ss = getSpreadsheet();
    if (!ss.getSheetByName(SHEETS.PRODUK)) {
      setup();
    }
  } catch (err) {
    console.log('ensureSetup error:', err);
  }
}

/**
 * SETUP DATABASE OTOMATIS
 * Membuat & memformat 9 sheet database sekaligus mengisi data default awal
 */
function setup() {
  var ss = getSpreadsheet();
  
  // 1. Sheet User
  var sheetUser = getOrCreateSheet(ss, SHEETS.USER, ['Username', 'Password', 'Role']);
  if (sheetUser.getLastRow() === 1) {
    sheetUser.appendRow(['admin', '123', 'Admin']);
    sheetUser.appendRow(['kasir', '123', 'Kasir']);
    sheetUser.appendRow(['teknisi', '123', 'Teknisi']);
  }

  // 2. Sheet Kategori
  var sheetKategori = getOrCreateSheet(ss, SHEETS.KATEGORI, ['ID_Kategori', 'Nama_Kategori']);
  if (sheetKategori.getLastRow() === 1) {
    sheetKategori.appendRow(['KAT-01', 'Laptop']);
    sheetKategori.appendRow(['KAT-02', 'Part PC']);
    sheetKategori.appendRow(['KAT-03', 'Aksesoris']);
    sheetKategori.appendRow(['KAT-04', 'Peripheral']);
    sheetKategori.appendRow(['KAT-05', 'Jasa Service']);
  }

  // 3. Sheet Produk
  var sheetProduk = getOrCreateSheet(ss, SHEETS.PRODUK, [
    'ID_Produk', 'Nama_Produk', 'Kategori', 'Harga_Jual', 'Stok', 'Min_Stok', 'Gambar_URL', 'Barcode'
  ]);
  if (sheetProduk.getLastRow() === 1) {
    sheetProduk.appendRow(['PRD-001', 'Laptop ASUS Vivobook 14 (i5 12th/16GB/512GB)', 'Laptop', 8950000, 5, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', '8991001']);
    sheetProduk.appendRow(['PRD-002', 'SSD Kingston NV2 1TB NVMe PCIe 4.0', 'Part PC', 1050000, 12, 3, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500', '8991002']);
    sheetProduk.appendRow(['PRD-003', 'RAM Corsair Vengeance 16GB DDR4 3200MHz', 'Part PC', 650000, 8, 3, 'https://images.unsplash.com/photo-1555617981-d2c673130d7c?w=500', '8991003']);
    sheetProduk.appendRow(['PRD-004', 'Mouse Gaming Logitech G102 Lightsync', 'Aksesoris', 245000, 15, 4, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', '8991004']);
    sheetProduk.appendRow(['PRD-005', 'Jasa Install Ulang Windows 11 + Software Standar', 'Jasa Service', 75000, 999, 0, 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500', '8991005']);
  }

  // 4. Sheet Transaksi
  getOrCreateSheet(ss, SHEETS.TRANSAKSI, [
    'ID_Transaksi', 'Tanggal', 'Kasir', 'Subtotal', 'Diskon', 'Total', 'Metode_Bayar', 'Status'
  ]);

  // 5. Sheet DetailTransaksi
  getOrCreateSheet(ss, SHEETS.DETAIL_TRANSAKSI, [
    'ID_Transaksi', 'ID_Produk', 'Nama_Produk', 'Qty', 'Subtotal', 'Serial_Number', 'Garansi'
  ]);

  // 6. Sheet Service
  var sheetService = getOrCreateSheet(ss, SHEETS.SERVICE, [
    'ID_Service', 'Tanggal_Masuk', 'Tanggal_Selesai', 'Nama_Pelanggan', 'No_WA', 'Nama_Barang', 'Keluhan', 'Estimasi_Biaya', 'Status_Service', 'Teknisi', 'Kelengkapan', 'Diagnosa'
  ]);
  if (sheetService.getLastRow() === 1) {
    sheetService.appendRow([
      'SRV-2026-001', '2026-09-08 09:30', '', 'Ahmad Fauzi', '081234567890',
      'Laptop Acer Nitro 5', 'Overheat & thermal throttling saat gaming', 180000, 'Diproses', 'Budi Santoso', 'Unit, Charger Acer 135W', 'Thermal paste kering dan kipas berdebu'
    ]);
  }

  // 7. Sheet StokLog
  getOrCreateSheet(ss, SHEETS.STOK_LOG, [
    'ID_Log', 'Tanggal', 'ID_Produk', 'Tipe_Perubahan', 'Jumlah', 'Keterangan', 'User'
  ]);

  // 8. Sheet Absensi
  getOrCreateSheet(ss, SHEETS.ABSENSI, [
    'ID_Absensi', 'Tanggal', 'Jam', 'ID_User', 'Nama_User', 'Role', 'Tipe', 'Latitude', 'Longitude', 'Jarak_Meter', 'Status_Lokasi', 'Status_Kehadiran', 'Keterangan'
  ]);

  // 9. Sheet Pengaturan Toko
  var sheetPengaturan = getOrCreateSheet(ss, SHEETS.PENGATURAN, ['Kunci_Pengaturan', 'Nilai', 'Terakhir_Diperbarui']);
  if (sheetPengaturan.getLastRow() === 1) {
    var now = new Date();
    sheetPengaturan.appendRow(['storeName', STORE_INFO.name, now]);
    sheetPengaturan.appendRow(['tagline', STORE_INFO.tagline, now]);
    sheetPengaturan.appendRow(['address', STORE_INFO.address, now]);
    sheetPengaturan.appendRow(['phone', STORE_INFO.phone, now]);
    sheetPengaturan.appendRow(['email', STORE_INFO.email, now]);
  }

  return { success: true, message: 'Database Hiroshi Computer berhasil disiapkan secara lengkap!' };
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0D47A1');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    rows.push(obj);
  }
  return rows;
}

function getCurrentTimestamp() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
}

/**
 * ============================================================================
 * OPERASI DATA (CRUD)
 * ============================================================================
 */

function getUsers() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.USER);
    return { success: true, data: sheetToObjects(sheet) };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function loginUser(username, password) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.USER);
    var users = sheetToObjects(sheet);
    for (var i = 0; i < users.length; i++) {
      if (String(users[i].Username).toLowerCase() === String(username).toLowerCase() &&
          String(users[i].Password) === String(password)) {
        return { success: true, user: { username: users[i].Username, role: users[i].Role } };
      }
    }
    return { success: false, message: 'Username atau Password salah!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function getProducts() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.PRODUK);
    return { success: true, data: sheetToObjects(sheet) };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function getCategories() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.KATEGORI);
    return { success: true, data: sheetToObjects(sheet) };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function saveTransaction(trxData) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = getSpreadsheet();
    var sheetTrx = ss.getSheetByName(SHEETS.TRANSAKSI);
    var sheetDetail = ss.getSheetByName(SHEETS.DETAIL_TRANSAKSI);
    var sheetProduk = ss.getSheetByName(SHEETS.PRODUK);

    var trxId = trxData.id || ('TRX-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss'));
    var timestamp = getCurrentTimestamp();

    sheetTrx.appendRow([
      trxId, timestamp, trxData.cashier || 'Kasir', Number(trxData.subtotal || 0),
      Number(trxData.discount || 0), Number(trxData.total || 0), trxData.paymentMethod || 'Tunai', 'Sukses'
    ]);

    var items = trxData.items || [];
    var prodValues = sheetProduk.getDataRange().getValues();

    for (var i = 0; i < items.length; i++) {
      var itm = items[i];
      sheetDetail.appendRow([
        trxId, itm.productId, itm.productName, Number(itm.qty),
        Number(itm.subtotal), itm.serialNumber || '-', itm.warranty || 'Tidak Ada'
      ]);

      // Potong stok produk otomatis
      for (var p = 1; p < prodValues.length; p++) {
        if (String(prodValues[p][0]) === String(itm.productId)) {
          var currentStk = Number(prodValues[p][4]) || 0;
          sheetProduk.getRange(p + 1, 5).setValue(Math.max(0, currentStk - Number(itm.qty)));
          break;
        }
      }

      logStockChange(itm.productId, 'PENJUALAN', -Number(itm.qty), 'Penjualan: ' + trxId, trxData.cashier || 'Kasir');
    }

    lock.releaseLock();
    return { success: true, transactionId: trxId, message: 'Transaksi berhasil disimpan!' };
  } catch (err) {
    if (lock) lock.releaseLock();
    return { success: false, message: err.toString() };
  }
}

function getServices() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SERVICE);
    return { success: true, data: sheetToObjects(sheet).reverse() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function saveService(s) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SERVICE);
    var newId = s.id || ('SRV-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MMdd-HHmm'));
    
    // Cek apakah update service yang sudah ada
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(newId)) {
        sheet.getRange(i + 1, 4).setValue(s.customerName);
        sheet.getRange(i + 1, 5).setValue(s.customerPhone);
        sheet.getRange(i + 1, 6).setValue(s.device);
        sheet.getRange(i + 1, 7).setValue(s.complaint);
        sheet.getRange(i + 1, 8).setValue(Number(s.estimatedCost || 0));
        sheet.getRange(i + 1, 9).setValue(s.status || 'Diterima');
        sheet.getRange(i + 1, 10).setValue(s.technician || 'Teknisi');
        if (s.accessories) sheet.getRange(i + 1, 11).setValue(s.accessories);
        if (s.diagnosis) sheet.getRange(i + 1, 12).setValue(s.diagnosis);
        return { success: true, serviceId: newId, message: 'Data service berhasil diperbarui!' };
      }
    }

    // Penerimaan Baru
    sheet.appendRow([
      newId, getCurrentTimestamp(), '', s.customerName, s.customerPhone,
      s.device, s.complaint, Number(s.estimatedCost || 0), s.status || 'Diterima',
      s.technician || 'Teknisi', s.accessories || '-', s.diagnosis || '-'
    ]);
    return { success: true, serviceId: newId, message: 'Service berhasil dicatat' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function updateServiceStatus(id, status, finalCost) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SERVICE);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.getRange(i + 1, 9).setValue(status);
        if (finalCost !== undefined && finalCost !== null) {
          sheet.getRange(i + 1, 8).setValue(Number(finalCost));
        }
        if (status === 'Selesai' || status === 'Diambil') {
          sheet.getRange(i + 1, 3).setValue(getCurrentTimestamp());
        }
        return { success: true, message: 'Status berhasil diubah menjadi ' + status };
      }
    }
    return { success: false, message: 'Tiket service tidak ditemukan' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function saveAttendance(record) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.ABSENSI);
    var newId = record.id || ('ATT-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss'));
    var now = new Date();
    var tgl = record.date || Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
    var jam = record.time || Utilities.formatDate(now, 'GMT+7', 'HH:mm:ss');
    
    sheet.appendRow([
      newId,
      tgl,
      jam,
      record.userId || '',
      record.userName || '',
      record.role || '',
      record.type || 'Masuk',
      record.location ? record.location.latitude : '',
      record.location ? record.location.longitude : '',
      record.location ? record.location.distanceMeters : '',
      record.location && record.location.isInStoreRadius ? 'Dalam Toko' : 'Luar Toko',
      record.status || 'Tepat Waktu',
      record.notes || ''
    ]);
    return { success: true, id: newId, message: 'Presensi ' + (record.type || 'Masuk') + ' berhasil dicatat!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function getAttendanceList() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.ABSENSI);
    return { success: true, data: sheetToObjects(sheet).reverse() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function logStockChange(productId, changeType, quantity, notes, user) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.STOK_LOG);
    var logId = 'LOG-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 100);
    sheet.appendRow([logId, getCurrentTimestamp(), productId, changeType, quantity, notes, user || 'System']);
  } catch (e) {
    console.error(e);
  }
}

function getReportSummary() {
  try {
    var ss = getSpreadsheet();
    var sheetTrx = ss.getSheetByName(SHEETS.TRANSAKSI);
    var sheetDetail = ss.getSheetByName(SHEETS.DETAIL_TRANSAKSI);

    var trxs = sheetToObjects(sheetTrx);
    var details = sheetToObjects(sheetDetail);

    var totalRevenue = 0;
    var totalOrders = 0;
    var voidOrders = 0;
    var methodMap = {};

    for (var i = 0; i < trxs.length; i++) {
      var t = trxs[i];
      if (t.Status === 'Void') {
        voidOrders++;
        continue;
      }
      totalOrders++;
      var tot = Number(t.Total) || 0;
      totalRevenue += tot;
      var method = t.Metode_Bayar || 'Tunai';
      methodMap[method] = (methodMap[method] || 0) + tot;
    }

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        voidOrders: voidOrders,
        salesByMethod: methodMap,
        totalDetails: details.length
      }
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Sinkronisasi seluruh kumpulan data dari Web POS ke Google Sheets
 */
function syncAllData(payload) {
  try {
    var ss = getSpreadsheet();
    
    // Sinkronkan Transaksi
    if (payload.transactions && payload.transactions.length > 0) {
      var sheetTrx = ss.getSheetByName(SHEETS.TRANSAKSI);
      var existingTrxs = sheetTrx.getDataRange().getValues();
      var existingIds = {};
      for (var t = 1; t < existingTrxs.length; t++) {
        existingIds[existingTrxs[t][0]] = true;
      }
      for (var i = 0; i < payload.transactions.length; i++) {
        var trx = payload.transactions[i];
        if (!existingIds[trx.ID_Transaksi]) {
          sheetTrx.appendRow([
            trx.ID_Transaksi, trx.Tanggal, trx.Kasir, trx.Subtotal,
            trx.Diskon, trx.Total, trx.Metode_Bayar, trx.Status
          ]);
        }
      }
    }

    // Sinkronkan Service
    if (payload.services && payload.services.length > 0) {
      var sheetSrv = ss.getSheetByName(SHEETS.SERVICE);
      var existingSrv = sheetSrv.getDataRange().getValues();
      var srvIds = {};
      for (var s = 1; s < existingSrv.length; s++) {
        srvIds[existingSrv[s][0]] = true;
      }
      for (var j = 0; j < payload.services.length; j++) {
        var srv = payload.services[j];
        if (!srvIds[srv.ID_Service]) {
          sheetSrv.appendRow([
            srv.ID_Service, srv.Tanggal_Masuk, srv.Tanggal_Selesai || '',
            srv.Nama_Pelanggan, srv.No_WA, srv.Nama_Barang, srv.Keluhan,
            srv.Estimasi_Biaya, srv.Status_Service, srv.Teknisi,
            srv.Kelengkapan || '', srv.Diagnosa || ''
          ]);
        }
      }
    }

    return { success: true, message: 'Sinkronisasi seluruh data ke Google Sheets berhasil!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * ============================================================================
 * STANDALONE EMBEDDED WEB APP OUTPUT
 * Dipakai otomatis jika file 'Index.html' belum dibuat oleh pengguna di Apps Script
 * ============================================================================
 */
function getEmbeddedHtmlOutput() {
  var html = '<!DOCTYPE html>' +
    '<html lang="id">' +
    '<head>' +
    '  <meta charset="UTF-8">' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '  <title>Hiroshi Computer - POS & Service</title>' +
    '  <style>' +
    '    :root { --primary: #0D47A1; --accent: #1E88E5; --bg: #F4F6F9; --surface: #FFFFFF; --text: #1E293B; --border: #CBD5E1; }' +
    '    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }' +
    '    body { background: var(--bg); color: var(--text); padding-bottom: 40px; }' +
    '    header { background: linear-gradient(135deg, #0D47A1, #1976D2); color: white; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }' +
    '    .brand h1 { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }' +
    '    .brand p { font-size: 11px; opacity: 0.85; }' +
    '    .nav-bar { background: white; border-bottom: 1px solid var(--border); display: flex; overflow-x: auto; padding: 0 16px; gap: 8px; }' +
    '    .nav-btn { padding: 12px 16px; border: none; background: none; font-size: 13px; font-weight: 700; color: #64748B; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; white-space: nowrap; }' +
    '    .nav-btn.active { color: var(--accent); border-bottom-color: var(--accent); }' +
    '    .container { max-width: 1200px; margin: 20px auto; padding: 0 16px; }' +
    '    .card { background: white; border-radius: 12px; border: 1px solid var(--border); padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px; }' +
    '    .btn { padding: 8px 16px; border-radius: 8px; border: none; font-weight: 700; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }' +
    '    .btn-primary { background: var(--accent); color: white; }' +
    '    .btn-success { background: #16A34A; color: white; }' +
    '    .grid-pos { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }' +
    '    @media(max-width: 768px) { .grid-pos { grid-template-columns: 1fr; } }' +
    '    .prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-top: 14px; }' +
    '    .prod-card { border: 1px solid var(--border); border-radius: 10px; padding: 12px; background: white; cursor: pointer; transition: transform 0.15s, border-color 0.15s; }' +
    '    .prod-card:hover { transform: translateY(-2px); border-color: var(--accent); }' +
    '    .prod-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }' +
    '    .prod-price { color: #16A34A; font-weight: 800; font-size: 13px; }' +
    '    .prod-stock { font-size: 11px; color: #64748B; margin-top: 4px; }' +
    '    .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #E2E8F0; font-size: 12px; }' +
    '    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }' +
    '    th, td { padding: 10px 12px; border-bottom: 1px solid var(--border); text-align: left; }' +
    '    th { background: #F8FAFC; font-weight: 700; color: #475569; }' +
    '    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }' +
    '    .badge-success { background: #DCFCE7; color: #15803D; }' +
    '    .badge-warning { background: #FEF3C7; color: #B45309; }' +
    '    .badge-info { background: #E0F2FE; color: #0369A1; }' +
    '    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000; }' +
    '    .modal-content { background: white; border-radius: 14px; padding: 24px; max-width: 480px; width: 90%; }' +
    '    .receipt { font-family: "Courier New", Courier, monospace; font-size: 12px; line-height: 1.4; border: 1px dashed #000; padding: 16px; background: #FFF; margin: 14px 0; }' +
    '  </style>' +
    '</head>' +
    '<body>' +
    '  <header>' +
    '    <div class="brand">' +
    '      <h1>HIROSHI COMPUTER - POS & SERVICE</h1>' +
    '      <p>Jl. Tunggorono No 46 Pucangan, Kartasura | WA: 085876500029</p>' +
    '    </div>' +
    '    <div style="font-size:12px; font-weight:bold; background:rgba(255,255,255,0.2); padding:6px 12px; border-radius:20px;">' +
    '      Google Sheets Connected 🟢' +
    '    </div>' +
    '  </header>' +
    '  <div class="nav-bar">' +
    '    <button class="nav-btn active" onclick="showTab(\'kasir\')">🛒 Kasir POS</button>' +
    '    <button class="nav-btn" onclick="showTab(\'service\')">🔧 Service Komputer</button>' +
    '    <button class="nav-btn" onclick="showTab(\'produk\')">📦 Produk & Stok</button>' +
    '    <button class="nav-btn" onclick="showTab(\'laporan\')">📊 Ringkasan Penjualan</button>' +
    '  </div>' +
    '  <div class="container">' +
    '    <!-- TAB KASIR -->' +
    '    <div id="tab-kasir">' +
    '      <div class="grid-pos">' +
    '        <div class="card">' +
    '          <div style="display:flex; justify-content:space-between; align-items:center;">' +
    '            <h2 style="font-size:16px; font-weight:bold;">Katalog Produk</h2>' +
    '            <input type="text" id="posSearch" placeholder="Cari nama atau barcode..." style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; font-size:12px; width:220px;" oninput="filterPosProducts()">' +
    '          </div>' +
    '          <div class="prod-grid" id="posProdGrid">Memuat produk...</div>' +
    '        </div>' +
    '        <div class="card">' +
    '          <h2 style="font-size:16px; font-weight:bold; margin-bottom:12px;">Keranjang Belanja</h2>' +
    '          <div id="cartList" style="min-height:160px; max-height:300px; overflow-y:auto;">' +
    '            <p style="color:#94A3B8; font-size:12px; text-align:center; padding:30px 0;">Keranjang masih kosong</p>' +
    '          </div>' +
    '          <div style="margin-top:16px; border-top:2px solid var(--border); padding-top:12px; font-size:13px;">' +
    '            <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Total:</span><span id="cartTotal" style="font-size:18px; font-weight:900; color:#0D47A1;">Rp 0</span></div>' +
    '            <div style="margin-bottom:10px;"><label style="font-size:11px; font-weight:bold;">Metode Pembayaran:</label>' +
    '              <select id="payMethod" style="width:100%; padding:6px; border-radius:6px; border:1px solid var(--border); font-size:12px; margin-top:4px;">' +
    '                <option value="Tunai">Tunai</option><option value="QRIS">QRIS</option><option value="Transfer Bank">Transfer Bank</option><option value="Debit">Debit Card</option>' +
    '              </select>' +
    '            </div>' +
    '            <button class="btn btn-success" style="width:100%; justify-content:center; padding:12px;" onclick="checkout()">Bayar & Cetak Struk</button>' +
    '          </div>' +
    '        </div>' +
    '      </div>' +
    '    </div>' +
    '    <!-- TAB SERVICE -->' +
    '    <div id="tab-service" style="display:none;">' +
    '      <div class="card">' +
    '        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">' +
    '          <h2 style="font-size:16px; font-weight:bold;">Daftar Service Komputer</h2>' +
    '          <button class="btn btn-primary" onclick="openNewServiceModal()">+ Terima Service Baru</button>' +
    '        </div>' +
    '        <table><thead><tr><th>No. Servis</th><th>Tanggal</th><th>Pelanggan</th><th>Perangkat</th><th>Keluhan</th><th>Estimasi</th><th>Status</th><th>Aksi</th></tr></thead>' +
    '        <tbody id="serviceTableBody"><tr><td colspan="8" style="text-align:center;">Memuat data service...</td></tr></tbody></table>' +
    '      </div>' +
    '    </div>' +
    '    <!-- TAB PRODUK -->' +
    '    <div id="tab-produk" style="display:none;">' +
    '      <div class="card">' +
    '        <h2 style="font-size:16px; font-weight:bold; margin-bottom:14px;">Master Produk & Stok</h2>' +
    '        <table><thead><tr><th>ID</th><th>Nama Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th></tr></thead>' +
    '        <tbody id="productTableBody"><tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr></tbody></table>' +
    '      </div>' +
    '    </div>' +
    '    <!-- TAB LAPORAN -->' +
    '    <div id="tab-laporan" style="display:none;">' +
    '      <div class="card">' +
    '        <h2 style="font-size:16px; font-weight:bold; margin-bottom:14px;">Ringkasan Penjualan</h2>' +
    '        <div id="reportContainer">Memuat laporan...</div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <!-- MODAL STRUK -->' +
    '  <div id="receiptModal" class="modal">' +
    '    <div class="modal-content">' +
    '      <h3 style="font-size:15px; font-weight:bold;">Struk Pembayaran</h3>' +
    '      <div id="receiptPaper" class="receipt"></div>' +
    '      <div style="display:flex; justify-content:flex-end; gap:8px;">' +
    '        <button class="btn" style="background:#E2E8F0;" onclick="closeModal()">Tutup</button>' +
    '        <button class="btn btn-primary" onclick="window.print()">Cetak</button>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <script>' +
    '    var allProducts = [];' +
    '    var cart = [];' +
    '    function showTab(tabName) {' +
    '      ["kasir", "service", "produk", "laporan"].forEach(function(t) {' +
    '        document.getElementById("tab-" + t).style.display = (t === tabName ? "block" : "none");' +
    '      });' +
    '      var btns = document.querySelectorAll(".nav-btn");' +
    '      btns.forEach(function(b, i) { b.classList.toggle("active", ["kasir", "service", "produk", "laporan"][i] === tabName); });' +
    '      if(tabName === "service") loadServices();' +
    '      if(tabName === "laporan") loadReport();' +
    '    }' +
    '    function loadProducts() {' +
    '      google.script.run.withSuccessHandler(function(res) {' +
    '        if(res && res.success) { allProducts = res.data; renderPosProducts(allProducts); renderProductTable(allProducts); }' +
    '      }).getProducts();' +
    '    }' +
    '    function renderPosProducts(list) {' +
    '      var el = document.getElementById("posProdGrid");' +
    '      if(!list || list.length === 0) { el.innerHTML = "<p>Tidak ada produk</p>"; return; }' +
    '      var html = "";' +
    '      list.forEach(function(p) {' +
    '        html += \'<div class="prod-card" onclick="addToCart(\\\'\' + p.ID_Produk + \'\\\')">\' +' +
    '          \'<div class="prod-title">\' + p.Nama_Produk + \'</div>\' +' +
    '          \'<div class="prod-price">Rp \' + Number(p.Harga_Jual).toLocaleString("id-ID") + \'</div>\' +' +
    '          \'<div class="prod-stock">Stok: \' + p.Stok + \'</div></div>\';' +
    '      });' +
    '      el.innerHTML = html;' +
    '    }' +
    '    function filterPosProducts() {' +
    '      var q = (document.getElementById("posSearch").value || "").toLowerCase();' +
    '      var filtered = allProducts.filter(function(p) {' +
    '        return (p.Nama_Produk||"").toLowerCase().indexOf(q) !== -1 || (p.Barcode||"").indexOf(q) !== -1;' +
    '      });' +
    '      renderPosProducts(filtered);' +
    '    }' +
    '    function addToCart(pId) {' +
    '      var prod = allProducts.find(function(p) { return String(p.ID_Produk) === String(pId); });' +
    '      if(!prod) return;' +
    '      var existing = cart.find(function(c) { return c.productId === pId; });' +
    '      if(existing) { existing.qty++; existing.subtotal = existing.qty * existing.price; }' +
    '      else { cart.push({ productId: prod.ID_Produk, productName: prod.Nama_Produk, price: Number(prod.Harga_Jual), qty: 1, subtotal: Number(prod.Harga_Jual) }); }' +
    '      renderCart();' +
    '    }' +
    '    function renderCart() {' +
    '      var el = document.getElementById("cartList");' +
    '      if(cart.length === 0) { el.innerHTML = "<p style=\'color:#94A3B8; text-align:center; padding:30px 0;\'>Keranjang masih kosong</p>"; document.getElementById("cartTotal").innerText = "Rp 0"; return; }' +
    '      var total = 0; var html = "";' +
    '      cart.forEach(function(item, idx) {' +
    '        total += item.subtotal;' +
    '        html += \'<div class="cart-item"><div><strong>\' + item.productName + \'</strong><div style="color:#64748B;">\' + item.qty + \' x Rp \' + item.price.toLocaleString("id-ID") + \'</div></div>\' +' +
    '          \'<div style="text-align:right;"><strong>Rp \' + item.subtotal.toLocaleString("id-ID") + \'</strong><div><button onclick="removeCartItem(\' + idx + \')" style="color:#EF4444; border:none; background:none; cursor:pointer; font-size:11px;">Hapus</button></div></div></div>\';' +
    '      });' +
    '      el.innerHTML = html;' +
    '      document.getElementById("cartTotal").innerText = "Rp " + total.toLocaleString("id-ID");' +
    '    }' +
    '    function removeCartItem(idx) { cart.splice(idx, 1); renderCart(); }' +
    '    function checkout() {' +
    '      if(cart.length === 0) { alert("Keranjang belanja masih kosong!"); return; }' +
    '      var total = cart.reduce(function(acc, c) { return acc + c.subtotal; }, 0);' +
    '      var trxData = {' +
    '        id: "TRX-" + new Date().getTime(),' +
    '        cashier: "Kasir",' +
    '        subtotal: total,' +
    '        discount: 0,' +
    '        total: total,' +
    '        paymentMethod: document.getElementById("payMethod").value,' +
    '        items: cart' +
    '      };' +
    '      google.script.run.withSuccessHandler(function(res) {' +
    '        if(res && res.success) {' +
    '          showReceipt(trxData);' +
    '          cart = []; renderCart(); loadProducts();' +
    '        } else { alert("Gagal simpan: " + (res?res.message:"Error")); }' +
    '      }).saveTransaction(trxData);' +
    '    }' +
    '    function showReceipt(trx) {' +
    '      var itemsText = "";' +
    '      trx.items.forEach(function(it) {' +
    '        itemsText += "<div>" + it.productName + "</div><div style=\'display:flex; justify-content:space-between;\'><span>" + it.qty + " x " + it.price.toLocaleString("id-ID") + "</span><span>" + it.subtotal.toLocaleString("id-ID") + "</span></div>";' +
    '      });' +
    '      var h = "<div style=\'text-align:center; font-weight:bold;\'>HIROSHI COMPUTER</div>" +' +
    '        "<div style=\'text-align:center; font-size:10px;\'>Jl. Tunggorono No 46 Pucangan, Kartasura</div>" +' +
    '        "<div style=\'text-align:center; font-size:10px;\'>WA: 085876500029</div>" +' +
    '        "<hr style=\'border-top:1px dashed #000; margin:6px 0;\'>" +' +
    '        "<div style=\'display:flex; justify-content:space-between; font-size:10px;\'><span>No: " + trx.id + "</span><span>Kasir: " + trx.cashier + "</span></div>" +' +
    '        "<hr style=\'border-top:1px dashed #000; margin:6px 0;\'>" +' +
    '        itemsText +' +
    '        "<hr style=\'border-top:1px dashed #000; margin:6px 0;\'>" +' +
    '        "<div style=\'display:flex; justify-content:space-between; font-weight:bold;\'><span>TOTAL:</span><span>Rp " + trx.total.toLocaleString("id-ID") + "</span></div>" +' +
    '        "<div style=\'display:flex; justify-content:space-between; font-size:10px;\'><span>Metode:</span><span>" + trx.paymentMethod + "</span></div>" +' +
    '        "<hr style=\'border-top:1px dashed #000; margin:6px 0;\'>" +' +
    '        "<div style=\'text-align:center; font-size:10px;\'>Terima kasih atas kunjungan Anda!</div>";' +
    '      document.getElementById("receiptPaper").innerHTML = h;' +
    '      document.getElementById("receiptModal").style.display = "flex";' +
    '    }' +
    '    function closeModal() { document.getElementById("receiptModal").style.display = "none"; }' +
    '    function loadServices() {' +
    '      google.script.run.withSuccessHandler(function(res) {' +
    '        if(res && res.success) {' +
    '          var tbody = document.getElementById("serviceTableBody");' +
    '          var html = "";' +
    '          res.data.forEach(function(s) {' +
    '            html += "<tr><td><strong>" + s.ID_Service + "</strong></td><td>" + (s.Tanggal_Masuk||"-") + "</td><td>" + s.Nama_Pelanggan + "<br><small>" + (s.No_WA||"") + "</small></td><td>" + s.Nama_Barang + "</td><td>" + s.Keluhan + "</td><td>Rp " + Number(s.Estimasi_Biaya||0).toLocaleString("id-ID") + "</td><td><span class=\'badge badge-info\'>" + s.Status_Service + "</span></td><td><button class=\'btn btn-primary\' onclick=\'waNotify(\\\"" + (s.No_WA||"") + "\\\",\\\"" + s.ID_Service + "\\\",\\\"" + s.Nama_Pelanggan + "\\\",\\\"" + s.Status_Service + "\\\")\'>Kirim WA</button></td></tr>";' +
    '          });' +
    '          tbody.innerHTML = html || "<tr><td colspan=\'8\'>Belum ada data service</td></tr>";' +
    '        }' +
    '      }).getServices();' +
    '    }' +
    '    function waNotify(phone, id, name, status) {' +
    '      var clean = phone.replace(/[^0-9]/g, "");' +
    '      if(clean.indexOf("0") === 0) clean = "62" + clean.slice(1);' +
    '      var text = "Halo Kak *" + name + "*! Update status service no *" + id + "* di *Hiroshi Computer* saat ini: *" + status + "*. Terima kasih!";' +
    '      window.open("https://wa.me/" + clean + "?text=" + encodeURIComponent(text), "_blank");' +
    '    }' +
    '    function loadReport() {' +
    '      google.script.run.withSuccessHandler(function(res) {' +
    '        if(res && res.success) {' +
    '          var d = res.data;' +
    '          document.getElementById("reportContainer").innerHTML = "<div style=\'display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;\'>" +' +
    '            "<div style=\'background:#EFF6FF; padding:16px; border-radius:10px;\'><h4>Total Omset</h4><p style=\'font-size:22px; font-weight:bold; color:#1D4ED8;\'>Rp " + Number(d.totalRevenue).toLocaleString("id-ID") + "</p></div>" +' +
    '            "<div style=\'background:#F0FDF4; padding:16px; border-radius:10px;\'><h4>Transaksi Sukses</h4><p style=\'font-size:22px; font-weight:bold; color:#15803D;\'>" + d.totalOrders + "</p></div>" +' +
    '            "<div style=\'background:#FEF2F2; padding:16px; border-radius:10px;\'><h4>Transaksi Void</h4><p style=\'font-size:22px; font-weight:bold; color:#B91C1C;\'>" + d.voidOrders + "</p></div>" +' +
    '          "</div>";' +
    '        }' +
    '      }).getReportSummary();' +
    '    }' +
    '    function renderProductTable(list) {' +
    '      var tbody = document.getElementById("productTableBody");' +
    '      var h = "";' +
    '      list.forEach(function(p) {' +
    '        h += "<tr><td>" + p.ID_Produk + "</td><td><strong>" + p.Nama_Produk + "</strong></td><td>" + p.Kategori + "</td><td>Rp " + Number(p.Harga_Jual).toLocaleString("id-ID") + "</td><td>" + p.Stok + "</td></tr>";' +
    '      });' +
    '      tbody.innerHTML = h;' +
    '    }' +
    '    loadProducts();' +
    '  </script>' +
    '</body>' +
    '</html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle('Hiroshi Computer - POS & Service')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
