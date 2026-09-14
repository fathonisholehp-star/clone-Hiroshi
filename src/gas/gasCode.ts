export const GAS_DEPLOY_STEPS = [
  {
    step: 1,
    title: 'Buka Google Spreadsheet Baru',
    desc: 'Buka https://sheets.new di browser Anda, beri nama spreadsheet misalnya "Database Hiroshi Computer POS".'
  },
  {
    step: 2,
    title: 'Buka Apps Script Editor',
    desc: 'Pada menu bar Google Sheets, klik menu Extensions (Ekstensi) > Apps Script. Editor skrip akan terbuka di tab baru.'
  },
  {
    step: 3,
    title: 'Salin Kode ke Code.gs',
    desc: 'Hapus semua kode bawaan di file Code.gs, lalu klik tombol "Salin Kode Code.gs" di bawah ini dan tempelkan (Ctrl+V). Tekan Simpan (Ctrl+S).'
  },
  {
    step: 4,
    title: 'Opsional: Buat File Index.html (Untuk Tampilan Penuh)',
    desc: 'Di panel kiri editor, klik ikon Tambah (+) di samping Files > pilih "HTML". Beri nama "Index" (tanpa .html), lalu salin seluruh isi dari tab Index.html. (Catatan: Jika dilewati, sistem tetap otomatis berjalan menggunakan UI bawaan di Code.gs).'
  },
  {
    step: 5,
    title: 'Deploy sebagai Web App',
    desc: 'Klik tombol biru "Deploy" (Terapkan) di kanan atas > "New deployment". Pilih tipe "Web app" (ikon gerigi). Isi Description: "Hiroshi POS", Execute as: "Me" (email Anda), Who has access: "Anyone" (Siapa saja). Klik "Deploy" dan berikan izin akses Google.'
  },
  {
    step: 6,
    title: 'Selesai & Hubungkan ke POS',
    desc: 'Salin URL Web App yang dihasilkan. Tempelkan URL tersebut pada kolom "Integrasi Google Sheets" di aplikasi ini. Selesai! Database 9 sheet dan menu toolbar "🏪 Hiroshi POS" di Google Sheets sudah otomatis aktif!'
  }
];

export const GAS_CODE_GS = `/**
 * ============================================================================
 * HIROSHI COMPUTER - POS & SERVICE MANAGEMENT SYSTEM
 * Backend Google Apps Script (Code.gs)
 * 
 * Toko: HIROSHI COMPUTER
 * Alamat: Jl. Tunggorono No 46 Pucangan, Kartasura
 * No. HP / WhatsApp: 085876500029
 * ============================================================================
 */

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

function openAppDialog() {
  var html = doGet();
  html.setWidth(1200).setHeight(850);
  SpreadsheetApp.getUi().showModalDialog(html, 'Hiroshi Computer - Sistem Kasir & Service POS');
}

function openAppSidebar() {
  var html = doGet();
  html.setTitle('Hiroshi Computer POS');
  SpreadsheetApp.getUi().showSidebar(html);
}

function showQuickSummary() {
  var rep = getReportSummary();
  var ui = SpreadsheetApp.getUi();
  if (rep && rep.success) {
    var d = rep.data;
    var msg = '📊 RINGKASAN HIROSHI COMPUTER POS\\n\\n' +
      '• Total Transaksi Berhasil: ' + d.totalOrders + '\\n' +
      '• Total Transaksi Batal/Void: ' + d.voidOrders + '\\n' +
      '• Total Omset Penjualan: Rp ' + Number(d.totalRevenue).toLocaleString('id-ID') + '\\n\\n' +
      'Alamat: ' + STORE_INFO.address + '\\n' +
      'WhatsApp: ' + STORE_INFO.phone;
    ui.alert('Ringkasan Bisnis', msg, ui.ButtonSet.OK);
  } else {
    ui.alert('Pemberitahuan', 'Silakan jalankan Setup Database terlebih dahulu.', ui.ButtonSet.OK);
  }
}

function doGet(e) {
  ensureSetup();

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

  try {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Hiroshi Computer - POS & Service')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return getEmbeddedHtmlOutput();
  }
}

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
    } else if (action === 'syncAll') {
      result = syncAllData(data);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

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

function setup() {
  var ss = getSpreadsheet();
  
  var sheetUser = getOrCreateSheet(ss, SHEETS.USER, ['Username', 'Password', 'Role']);
  if (sheetUser.getLastRow() === 1) {
    sheetUser.appendRow(['admin', '123', 'Admin']);
    sheetUser.appendRow(['kasir', '123', 'Kasir']);
    sheetUser.appendRow(['teknisi', '123', 'Teknisi']);
  }

  var sheetKategori = getOrCreateSheet(ss, SHEETS.KATEGORI, ['ID_Kategori', 'Nama_Kategori']);
  if (sheetKategori.getLastRow() === 1) {
    sheetKategori.appendRow(['KAT-01', 'Laptop']);
    sheetKategori.appendRow(['KAT-02', 'Part PC']);
    sheetKategori.appendRow(['KAT-03', 'Aksesoris']);
    sheetKategori.appendRow(['KAT-04', 'Peripheral']);
    sheetKategori.appendRow(['KAT-05', 'Jasa Service']);
  }

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

  getOrCreateSheet(ss, SHEETS.TRANSAKSI, [
    'ID_Transaksi', 'Tanggal', 'Kasir', 'Subtotal', 'Diskon', 'Total', 'Metode_Bayar', 'Status'
  ]);

  getOrCreateSheet(ss, SHEETS.DETAIL_TRANSAKSI, [
    'ID_Transaksi', 'ID_Produk', 'Nama_Produk', 'Qty', 'Subtotal', 'Serial_Number', 'Garansi'
  ]);

  var sheetService = getOrCreateSheet(ss, SHEETS.SERVICE, [
    'ID_Service', 'Tanggal_Masuk', 'Tanggal_Selesai', 'Nama_Pelanggan', 'No_WA', 'Nama_Barang', 'Keluhan', 'Estimasi_Biaya', 'Status_Service', 'Teknisi', 'Kelengkapan', 'Diagnosa'
  ]);
  if (sheetService.getLastRow() === 1) {
    sheetService.appendRow([
      'SRV-2026-001', '2026-09-08 09:30', '', 'Ahmad Fauzi', '081234567890',
      'Laptop Acer Nitro 5', 'Overheat & thermal throttling saat gaming', 180000, 'Diproses', 'Budi Santoso', 'Unit, Charger Acer 135W', 'Thermal paste kering dan kipas berdebu'
    ]);
  }

  getOrCreateSheet(ss, SHEETS.STOK_LOG, [
    'ID_Log', 'Tanggal', 'ID_Produk', 'Tipe_Perubahan', 'Jumlah', 'Keterangan', 'User'
  ]);

  getOrCreateSheet(ss, SHEETS.ABSENSI, [
    'ID_Absensi', 'Tanggal', 'Jam', 'ID_User', 'Nama_User', 'Role', 'Tipe', 'Latitude', 'Longitude', 'Jarak_Meter', 'Status_Lokasi', 'Status_Kehadiran', 'Keterangan'
  ]);

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

function syncAllData(payload) {
  try {
    var ss = getSpreadsheet();
    
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

function getEmbeddedHtmlOutput() {
  return HtmlService.createHtmlOutput('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hiroshi POS</title></head><body><h2>Hiroshi Computer POS Siap Digunakan!</h2><p>Buka menggunakan URL Web App atau tambahkan file Index.html untuk antarmuka penuh.</p></body></html>')
    .setTitle('Hiroshi Computer - POS & Service')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
`;

export const GAS_INDEX_HTML_PREVIEW = `<!DOCTYPE html>
<!-- Lihat file Index.html lengkap di root direktori proyek ini -->
<!-- File ini murni Vanilla JS & Pure CSS untuk Google Apps Script HtmlService -->
`;
