/**
 * HIROSHI COMPUTER - POS & IT SERVICE MANAGEMENT SYSTEM
 * Backend Google Apps Script (Code.gs)
 * 
 * Fitur:
 * - setup() otomatis membuat & mengonfigurasi sheet database jika belum ada
 * - Autentikasi User (Admin, Kasir, Teknisi)
 * - Master Produk, Kategori, dan Manajemen Stok dengan StokLog
 * - Transaksi Kasir, Serial Number, Garansi, Cetak Struk, dan Void Transaksi
 * - Manajemen Service Komputer, Update Status, dan Log Notifikasi WhatsApp
 * - Laporan Penjualan Harian, Bulanan, dan Produk Terlaris
 */

// Konfigurasi Nama Sheet Database
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

/**
 * Entry point Web App
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Hiroshi Computer - POS & Service')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Mengambil referensi Spreadsheet aktif
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * SETUP DATABASE OTOMATIS
 * Jalankan fungsi ini satu kali di awal dari Apps Script Editor untuk menyiapkan seluruh sheet & data awal.
 */
function setup() {
  var ss = getSpreadsheet();
  
  // 1. Sheet User: [Username, Password, Role]
  var sheetUser = getOrCreateSheet(ss, SHEETS.USER, ['Username', 'Password', 'Role']);
  if (sheetUser.getLastRow() === 1) {
    sheetUser.appendRow(['admin', '123', 'Admin']);
    sheetUser.appendRow(['kasir', '123', 'Kasir']);
    sheetUser.appendRow(['teknisi', '123', 'Teknisi']);
  }

  // 2. Sheet Kategori: [ID_Kategori, Nama_Kategori]
  var sheetKategori = getOrCreateSheet(ss, SHEETS.KATEGORI, ['ID_Kategori', 'Nama_Kategori']);
  if (sheetKategori.getLastRow() === 1) {
    sheetKategori.appendRow(['KAT-01', 'Laptop']);
    sheetKategori.appendRow(['KAT-02', 'Part PC']);
    sheetKategori.appendRow(['KAT-03', 'Aksesoris']);
    sheetKategori.appendRow(['KAT-04', 'Peripheral']);
    sheetKategori.appendRow(['KAT-05', 'Jasa Service']);
  }

  // 3. Sheet Produk: [ID_Produk, Nama_Produk, Kategori, Harga_Jual, Stok, Min_Stok, Gambar_URL]
  var sheetProduk = getOrCreateSheet(ss, SHEETS.PRODUK, [
    'ID_Produk', 'Nama_Produk', 'Kategori', 'Harga_Jual', 'Stok', 'Min_Stok', 'Gambar_URL'
  ]);
  if (sheetProduk.getLastRow() === 1) {
    sheetProduk.appendRow(['PRD-001', 'Laptop ASUS Vivobook 14 (i5 12th/16GB/512GB)', 'Laptop', 8950000, 5, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500']);
    sheetProduk.appendRow(['PRD-002', 'SSD Kingston NV2 1TB NVMe PCIe 4.0', 'Part PC', 1050000, 12, 3, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500']);
    sheetProduk.appendRow(['PRD-003', 'RAM Corsair Vengeance 16GB DDR4 3200MHz', 'Part PC', 650000, 8, 3, 'https://images.unsplash.com/photo-1555617981-d2c673130d7c?w=500']);
    sheetProduk.appendRow(['PRD-004', 'Mouse Gaming Logitech G102 Lightsync', 'Aksesoris', 245000, 15, 4, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500']);
    sheetProduk.appendRow(['PRD-005', 'Jasa Install Ulang Windows 11 + Software', 'Jasa Service', 75000, 999, 0, 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500']);
  }

  // 4. Sheet Transaksi: [ID_Transaksi, Tanggal, Kasir, Subtotal, Diskon, Total, Metode_Bayar, Status]
  getOrCreateSheet(ss, SHEETS.TRANSAKSI, [
    'ID_Transaksi', 'Tanggal', 'Kasir', 'Subtotal', 'Diskon', 'Total', 'Metode_Bayar', 'Status'
  ]);

  // 5. Sheet DetailTransaksi: [ID_Transaksi, ID_Produk, Nama_Produk, Qty, Subtotal, Serial_Number, Garansi]
  getOrCreateSheet(ss, SHEETS.DETAIL_TRANSAKSI, [
    'ID_Transaksi', 'ID_Produk', 'Nama_Produk', 'Qty', 'Subtotal', 'Serial_Number', 'Garansi'
  ]);

  // 6. Sheet Service: [ID_Service, Tanggal_Masuk, Tanggal_Selesai, Nama_Pelanggan, No_WA, Nama_Barang, Keluhan, Estimasi_Biaya, Status_Service, Teknisi]
  var sheetService = getOrCreateSheet(ss, SHEETS.SERVICE, [
    'ID_Service', 'Tanggal_Masuk', 'Tanggal_Selesai', 'Nama_Pelanggan', 'No_WA', 'Nama_Barang', 'Keluhan', 'Estimasi_Biaya', 'Status_Service', 'Teknisi'
  ]);
  if (sheetService.getLastRow() === 1) {
    sheetService.appendRow([
      'SRV-2026-001', '2026-09-08 09:30', '', 'Ahmad Fauzi', '081234567890',
      'Laptop Acer Nitro 5', 'Overheat & thermal throttling saat gaming', 180000, 'Diproses', 'Budi Santoso'
    ]);
  }

  // 7. Sheet StokLog: [ID_Log, Tanggal, ID_Produk, Tipe_Perubahan, Jumlah, Keterangan, User]
  getOrCreateSheet(ss, SHEETS.STOK_LOG, [
    'ID_Log', 'Tanggal', 'ID_Produk', 'Tipe_Perubahan', 'Jumlah', 'Keterangan', 'User'
  ]);

  // 8. Sheet Absensi: [ID_Absensi, Tanggal, Jam, ID_User, Nama_User, Role, Tipe, Latitude, Longitude, Jarak_Meter, Status_Lokasi, Status_Kehadiran, Foto_URL_atau_Data, Keterangan]
  getOrCreateSheet(ss, SHEETS.ABSENSI, [
    'ID_Absensi', 'Tanggal', 'Jam', 'ID_User', 'Nama_User', 'Role', 'Tipe', 'Latitude', 'Longitude', 'Jarak_Meter', 'Status_Lokasi', 'Status_Kehadiran', 'Foto_URL_atau_Data', 'Keterangan'
  ]);

  return { success: true, message: 'Setup database Hiroshi Computer berhasil dikonfigurasi!' };
}

/**
 * Helper membuat sheet baru jika belum ada dan memformat header
 */
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1E88E5');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Helper konversi baris sheet ke array of object
 */
function sheetToObjects(sheet) {
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

/**
 * Helper format tanggal sekarang
 */
function getCurrentTimestamp() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/* ============================================================
   1. AUTENTIKASI & USER
   ============================================================ */
function loginUser(username, password) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.USER);
    if (!sheet) return { success: false, message: 'Database User belum di-setup!' };
    
    var users = sheetToObjects(sheet);
    for (var i = 0; i < users.length; i++) {
      if (String(users[i].Username).toLowerCase() === String(username).toLowerCase() &&
          String(users[i].Password) === String(password)) {
        return {
          success: true,
          user: {
            username: users[i].Username,
            role: users[i].Role
          }
        };
      }
    }
    return { success: false, message: 'Username atau Password salah!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function getUsers() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.USER);
    var list = sheetToObjects(sheet);
    return { success: true, data: list.map(function(u) { return { Username: u.Username, Role: u.Role }; }) };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function saveUser(userData) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.USER);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase() === String(userData.username).toLowerCase()) {
        sheet.getRange(i + 1, 2).setValue(userData.password);
        sheet.getRange(i + 1, 3).setValue(userData.role);
        return { success: true, message: 'User berhasil diperbarui' };
      }
    }
    sheet.appendRow([userData.username, userData.password, userData.role]);
    return { success: true, message: 'User baru berhasil didaftarkan' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/* ============================================================
   2. MASTER PRODUK & KATEGORI
   ============================================================ */
function getProducts() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.PRODUK);
    var products = sheetToObjects(sheet);
    return { success: true, data: products };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function getCategories() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.KATEGORI);
    var cats = sheetToObjects(sheet);
    return { success: true, data: cats };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function saveProduct(product) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEETS.PRODUK);
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;
    var oldStock = 0;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(product.id)) {
        foundIndex = i + 1;
        oldStock = Number(data[i][4]);
        break;
      }
    }

    var newStock = Number(product.stock);

    if (foundIndex > 0) {
      // Update produk
      sheet.getRange(foundIndex, 2).setValue(product.name);
      sheet.getRange(foundIndex, 3).setValue(product.category);
      sheet.getRange(foundIndex, 4).setValue(Number(product.price));
      sheet.getRange(foundIndex, 5).setValue(newStock);
      sheet.getRange(foundIndex, 6).setValue(Number(product.minStock));
      sheet.getRange(foundIndex, 7).setValue(product.imageUrl || '');

      // Log jika stok berubah manual
      var diff = newStock - oldStock;
      if (diff !== 0) {
        logStockChange(
          product.id,
          diff > 0 ? 'MASUK' : 'PENYESUAIAN',
          diff,
          'Penyesuaian stok master produk: ' + product.name,
          product.currentUser || 'admin'
        );
      }
      return { success: true, message: 'Produk berhasil diupdate!' };
    } else {
      // Tambah produk baru
      var newId = product.id || ('PRD-' + Utilities.formatDate(new Date(), 'GMT+7', 'mmss'));
      sheet.appendRow([
        newId,
        product.name,
        product.category,
        Number(product.price),
        newStock,
        Number(product.minStock),
        product.imageUrl || ''
      ]);

      logStockChange(
        newId,
        'MASUK',
        newStock,
        'Stok awal produk baru: ' + product.name,
        product.currentUser || 'admin'
      );
      return { success: true, message: 'Produk baru berhasil ditambahkan!' };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function deleteProduct(productId) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.PRODUK);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(productId)) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Produk berhasil dihapus' };
      }
    }
    return { success: false, message: 'Produk tidak ditemukan' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/* ============================================================
   3. TRANSAKSI PENJUALAN & KASIR
   ============================================================ */
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

    // 1. Simpan Header Transaksi: [ID_Transaksi, Tanggal, Kasir, Subtotal, Diskon, Total, Metode_Bayar, Status]
    sheetTrx.appendRow([
      trxId,
      timestamp,
      trxData.cashier,
      Number(trxData.subtotal),
      Number(trxData.discount),
      Number(trxData.total),
      trxData.paymentMethod,
      'Sukses'
    ]);

    // 2. Simpan Detail Transaksi & Kurangi Stok
    var items = trxData.items;
    var prodValues = sheetProduk.getDataRange().getValues();

    for (var i = 0; i < items.length; i++) {
      var itm = items[i];
      // [ID_Transaksi, ID_Produk, Nama_Produk, Qty, Subtotal, Serial_Number, Garansi]
      sheetDetail.appendRow([
        trxId,
        itm.productId,
        itm.productName,
        Number(itm.qty),
        Number(itm.subtotal),
        itm.serialNumber || '-',
        itm.warranty || 'Tidak Ada'
      ]);

      // Cari baris produk untuk kurangi stok
      for (var p = 1; p < prodValues.length; p++) {
        if (String(prodValues[p][0]) === String(itm.productId)) {
          var currentStk = Number(prodValues[p][4]);
          var updatedStk = Math.max(0, currentStk - Number(itm.qty));
          sheetProduk.getRange(p + 1, 5).setValue(updatedStk);
          break;
        }
      }

      // Catat ke StokLog
      logStockChange(
        itm.productId,
        'PENJUALAN',
        -Number(itm.qty),
        'Penjualan No: ' + trxId + ' (SN: ' + (itm.serialNumber || '-') + ')',
        trxData.cashier
      );
    }

    lock.releaseLock();
    return { success: true, transactionId: trxId, message: 'Transaksi berhasil disimpan!' };
  } catch (err) {
    if (lock) lock.releaseLock();
    return { success: false, message: err.toString() };
  }
}

function voidTransaction(trxId, user) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = getSpreadsheet();
    var sheetTrx = ss.getSheetByName(SHEETS.TRANSAKSI);
    var sheetDetail = ss.getSheetByName(SHEETS.DETAIL_TRANSAKSI);
    var sheetProduk = ss.getSheetByName(SHEETS.PRODUK);

    var trxData = sheetTrx.getDataRange().getValues();
    var foundRow = -1;
    for (var i = 1; i < trxData.length; i++) {
      if (String(trxData[i][0]) === String(trxId)) {
        if (trxData[i][7] === 'Void') {
          lock.releaseLock();
          return { success: false, message: 'Transaksi ini sudah di-void sebelumnya!' };
        }
        foundRow = i + 1;
        break;
      }
    }

    if (foundRow === -1) {
      lock.releaseLock();
      return { success: false, message: 'ID Transaksi tidak ditemukan' };
    }

    // Ubah status jadi Void
    sheetTrx.getRange(foundRow, 8).setValue('Void');

    // Kembalikan stok item
    var details = sheetToObjects(sheetDetail);
    var prodValues = sheetProduk.getDataRange().getValues();

    for (var d = 0; d < details.length; d++) {
      if (String(details[d].ID_Transaksi) === String(trxId)) {
        var pId = details[d].ID_Produk;
        var qty = Number(details[d].Qty);

        for (var p = 1; p < prodValues.length; p++) {
          if (String(prodValues[p][0]) === String(pId)) {
            var currentStk = Number(sheetProduk.getRange(p + 1, 5).getValue());
            sheetProduk.getRange(p + 1, 5).setValue(currentStk + qty);
            break;
          }
        }

        logStockChange(
          pId,
          'VOID_PENJUALAN',
          qty,
          'Pembatalan (Void) Transaksi: ' + trxId,
          user || 'admin'
        );
      }
    }

    lock.releaseLock();
    return { success: true, message: 'Transaksi ' + trxId + ' berhasil dibatalkan (VOID) dan stok dikembalikan!' };
  } catch (err) {
    if (lock) lock.releaseLock();
    return { success: false, message: err.toString() };
  }
}

function getTransactions() {
  try {
    var sheetTrx = getSpreadsheet().getSheetByName(SHEETS.TRANSAKSI);
    var sheetDetail = getSpreadsheet().getSheetByName(SHEETS.DETAIL_TRANSAKSI);
    var trxs = sheetToObjects(sheetTrx);
    var details = sheetToObjects(sheetDetail);

    // Pasangkan detail item ke transaksi
    var map = {};
    for (var i = 0; i < trxs.length; i++) {
      trxs[i].items = [];
      map[trxs[i].ID_Transaksi] = trxs[i];
    }
    for (var j = 0; j < details.length; j++) {
      var tid = details[j].ID_Transaksi;
      if (map[tid]) {
        map[tid].items.push(details[j]);
      }
    }

    return { success: true, data: trxs.reverse() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/* ============================================================
   4. MODUL SERVICE KOMPUTER (TEKNISI & ADMIN)
   ============================================================ */
function getServices() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SERVICE);
    var list = sheetToObjects(sheet);
    return { success: true, data: list.reverse() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function saveService(serviceData) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SERVICE);
    var data = sheet.getDataRange().getValues();
    var srvId = serviceData.id;

    // Cek jika update existing
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(srvId)) {
        sheet.getRange(i + 1, 3).setValue(serviceData.finishDate || '');
        sheet.getRange(i + 1, 4).setValue(serviceData.customerName);
        sheet.getRange(i + 1, 5).setValue(serviceData.customerPhone);
        sheet.getRange(i + 1, 6).setValue(serviceData.device);
        sheet.getRange(i + 1, 7).setValue(serviceData.complaint);
        sheet.getRange(i + 1, 8).setValue(Number(serviceData.estimatedCost));
        sheet.getRange(i + 1, 9).setValue(serviceData.status);
        sheet.getRange(i + 1, 10).setValue(serviceData.technician);
        return { success: true, serviceId: srvId, message: 'Data service berhasil diperbarui!' };
      }
    }

    // Penerimaan Service Baru
    // [ID_Service, Tanggal_Masuk, Tanggal_Selesai, Nama_Pelanggan, No_WA, Nama_Barang, Keluhan, Estimasi_Biaya, Status_Service, Teknisi]
    var newId = srvId || ('SRV-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MMdd-HHmm'));
    sheet.appendRow([
      newId,
      getCurrentTimestamp(),
      '',
      serviceData.customerName,
      serviceData.customerPhone,
      serviceData.device,
      serviceData.complaint,
      Number(serviceData.estimatedCost || 0),
      serviceData.status || 'Diterima',
      serviceData.technician || 'Budi Santoso'
    ]);

    return { success: true, serviceId: newId, message: 'Tiket service baru berhasil dibuat!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function updateServiceStatus(serviceId, status, finalCost, notes) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.SERVICE);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(serviceId)) {
        sheet.getRange(i + 1, 9).setValue(status);
        if (finalCost !== undefined && finalCost !== null) {
          sheet.getRange(i + 1, 8).setValue(Number(finalCost));
        }
        if (status === 'Selesai' || status === 'Diambil') {
          sheet.getRange(i + 1, 3).setValue(getCurrentTimestamp());
        }
        return { success: true, message: 'Status service berhasil diubah menjadi ' + status };
      }
    }
    return { success: false, message: 'Tiket service tidak ditemukan' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/* ============================================================
   5. AUDIT STOK (STOK LOG)
   ============================================================ */
function logStockChange(productId, changeType, quantity, notes, user) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.STOK_LOG);
    var logId = 'LOG-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 100);
    // [ID_Log, Tanggal, ID_Produk, Tipe_Perubahan, Jumlah, Keterangan, User]
    sheet.appendRow([
      logId,
      getCurrentTimestamp(),
      productId,
      changeType,
      quantity,
      notes,
      user || 'System'
    ]);
  } catch (e) {
    console.error('Gagal mencatat StokLog:', e);
  }
}

function getStockLogs() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.STOK_LOG);
    var logs = sheetToObjects(sheet);
    return { success: true, data: logs.reverse() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/* ============================================================
   6. MODUL LAPORAN PENJUALAN
   ============================================================ */
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
    var topProductsMap = {};
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

    for (var j = 0; j < details.length; j++) {
      var d = details[j];
      var pName = d.Nama_Produk;
      var q = Number(d.Qty) || 0;
      if (!topProductsMap[pName]) {
        topProductsMap[pName] = { name: pName, qty: 0, subtotal: 0 };
      }
      topProductsMap[pName].qty += q;
      topProductsMap[pName].subtotal += (Number(d.Subtotal) || 0);
    }

    var topProducts = [];
    for (var key in topProductsMap) {
      topProducts.push(topProductsMap[key]);
    }
    topProducts.sort(function(a, b) { return b.qty - a.qty; });

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        voidOrders: voidOrders,
        salesByMethod: methodMap,
        topProducts: topProducts.slice(0, 10)
      }
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Menyimpan presensi kehadiran Teknisi/Kasir dengan foto wajah dan geotagging GPS
 */
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
      record.photoBase64 ? record.photoBase64.substring(0, 500) + '...[Foto Disimpan]' : '',
      record.notes || ''
    ]);
    return { success: true, id: newId, message: 'Presensi ' + (record.type || 'Masuk') + ' berhasil dicatat!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Mengambil riwayat log absensi
 */
function getAttendanceList() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.ABSENSI);
    return { success: true, data: sheetToObjects(sheet).reverse() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Mengambil data pengaturan toko
 */
function getStoreSettings() {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.PENGATURAN);
    if (!sheet) return { success: true, data: null };
    var rows = sheet.getDataRange().getValues();
    var map = {};
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]) map[rows[i][0]] = rows[i][1];
    }
    return { success: true, data: map };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Menyimpan pengaturan toko ke sheet Pengaturan
 */
function saveStoreSettings(settings) {
  try {
    var ss = getSpreadsheet();
    var sheet = getOrCreateSheet(ss, SHEETS.PENGATURAN, ['Kunci_Pengaturan', 'Nilai', 'Terakhir_Diperbarui']);
    for (var key in settings) {
      var val = typeof settings[key] === 'object' ? JSON.stringify(settings[key]) : String(settings[key]);
      var updated = false;
      var data = sheet.getDataRange().getValues();
      for (var r = 1; r < data.length; r++) {
        if (data[r][0] === key) {
          sheet.getRange(r + 1, 2).setValue(val);
          sheet.getRange(r + 1, 3).setValue(new Date());
          updated = true;
          break;
        }
      }
      if (!updated) {
        sheet.appendRow([key, val, new Date()]);
      }
    }
    return { success: true, message: 'Pengaturan toko berhasil disimpan ke Google Sheets' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

