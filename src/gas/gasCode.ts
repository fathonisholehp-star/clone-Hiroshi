export const GAS_DEPLOY_STEPS = [
  {
    step: 1,
    title: 'Buat Google Spreadsheet Baru',
    desc: 'Buka https://sheets.new di browser Anda, beri judul spreadsheet misalnya "Database Hiroshi Computer POS".'
  },
  {
    step: 2,
    title: 'Buka Apps Script Editor',
    desc: 'Pada menu bar Google Sheets, klik Extensions (Ekstensi) > Apps Script. Jendela editor skrip akan terbuka.'
  },
  {
    step: 3,
    title: 'Salin Kode ke Code.gs',
    desc: 'Hapus kode bawaan di file Code.gs, lalu paste seluruh isi kode dari tab "Code.gs" di bawah ini. Tekan tombol Save (Ctrl+S / Cmd+S).'
  },
  {
    step: 4,
    title: 'Buat File Index.html',
    desc: 'Di panel kiri editor Apps Script, klik ikon Tambah (+) di samping Files > pilih "HTML". Beri nama file tepat "Index" (tanpa tanda kutip), lalu paste seluruh kode dari tab "Index.html" di bawah ini dan Simpan.'
  },
  {
    step: 5,
    title: 'Jalankan Fungsi setup()',
    desc: 'Di toolbar atas Apps Script, pilih fungsi "setup" pada dropdown fungsi, lalu klik "Run" (Jalankan). Berikan izin otorisasi (Review Permissions > Akun Google Anda > Advanced > Go to Untitled project). Fungsi ini akan otomatis membuat dan memformat 8 tabel sheet (Produk, Transaksi, DetailTransaksi, Service, User, Kategori, StokLog, Absensi).'
  },
  {
    step: 6,
    title: 'Deploy sebagai Web App',
    desc: 'Klik tombol biru "Deploy" di kanan atas > "New deployment" > Pilih tipe "Web app" (ikon gerigi). Isi Description: "Hiroshi POS v1.0", Execute as: "Me" (email Anda), Who has access: "Anyone" (Siapa saja). Klik Deploy dan salin URL Web App yang dihasilkan untuk mulai menggunakan aplikasi!'
  }
];

export const GAS_CODE_GS = `/**
 * HIROSHI COMPUTER - POS & IT SERVICE MANAGEMENT SYSTEM
 * Backend Google Apps Script (Code.gs)
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

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Hiroshi Computer - POS & Service')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function setup() {
  var ss = getSpreadsheet();
  
  // 1. User: [Username, Password, Role]
  var sheetUser = getOrCreateSheet(ss, SHEETS.USER, ['Username', 'Password', 'Role']);
  if (sheetUser.getLastRow() === 1) {
    sheetUser.appendRow(['admin', '123', 'Admin']);
    sheetUser.appendRow(['kasir', '123', 'Kasir']);
    sheetUser.appendRow(['teknisi', '123', 'Teknisi']);
  }

  // 2. Kategori: [ID_Kategori, Nama_Kategori]
  var sheetKategori = getOrCreateSheet(ss, SHEETS.KATEGORI, ['ID_Kategori', 'Nama_Kategori']);
  if (sheetKategori.getLastRow() === 1) {
    sheetKategori.appendRow(['KAT-01', 'Laptop']);
    sheetKategori.appendRow(['KAT-02', 'Part PC']);
    sheetKategori.appendRow(['KAT-03', 'Aksesoris']);
    sheetKategori.appendRow(['KAT-04', 'Peripheral']);
    sheetKategori.appendRow(['KAT-05', 'Jasa Service']);
  }

  // 3. Produk: [ID_Produk, Nama_Produk, Kategori, Harga_Jual, Stok, Min_Stok, Gambar_URL]
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

  // 4. Transaksi: [ID_Transaksi, Tanggal, Kasir, Subtotal, Diskon, Total, Metode_Bayar, Status]
  getOrCreateSheet(ss, SHEETS.TRANSAKSI, [
    'ID_Transaksi', 'Tanggal', 'Kasir', 'Subtotal', 'Diskon', 'Total', 'Metode_Bayar', 'Status'
  ]);

  // 5. DetailTransaksi: [ID_Transaksi, ID_Produk, Nama_Produk, Qty, Subtotal, Serial_Number, Garansi]
  getOrCreateSheet(ss, SHEETS.DETAIL_TRANSAKSI, [
    'ID_Transaksi', 'ID_Produk', 'Nama_Produk', 'Qty', 'Subtotal', 'Serial_Number', 'Garansi'
  ]);

  // 6. Service: [ID_Service, Tanggal_Masuk, Tanggal_Selesai, Nama_Pelanggan, No_WA, Nama_Barang, Keluhan, Estimasi_Biaya, Status_Service, Teknisi]
  getOrCreateSheet(ss, SHEETS.SERVICE, [
    'ID_Service', 'Tanggal_Masuk', 'Tanggal_Selesai', 'Nama_Pelanggan', 'No_WA', 'Nama_Barang', 'Keluhan', 'Estimasi_Biaya', 'Status_Service', 'Teknisi'
  ]);

  // 7. StokLog: [ID_Log, Tanggal, ID_Produk, Tipe_Perubahan, Jumlah, Keterangan, User]
  getOrCreateSheet(ss, SHEETS.STOK_LOG, [
    'ID_Log', 'Tanggal', 'ID_Produk', 'Tipe_Perubahan', 'Jumlah', 'Keterangan', 'User'
  ]);

  // 8. Absensi: [ID_Absensi, Tanggal, Jam, ID_User, Nama_User, Role, Tipe, Latitude, Longitude, Jarak_Meter, Status_Lokasi, Status_Kehadiran, Foto_URL_atau_Data, Keterangan]
  getOrCreateSheet(ss, SHEETS.ABSENSI, [
    'ID_Absensi', 'Tanggal', 'Jam', 'ID_User', 'Nama_User', 'Role', 'Tipe', 'Latitude', 'Longitude', 'Jarak_Meter', 'Status_Lokasi', 'Status_Kehadiran', 'Foto_URL_atau_Data', 'Keterangan'
  ]);

  return { success: true, message: 'Setup database Hiroshi Computer berhasil!' };
}

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

function getCurrentTimestamp() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
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
      trxId, timestamp, trxData.cashier, Number(trxData.subtotal),
      Number(trxData.discount), Number(trxData.total), trxData.paymentMethod, 'Sukses'
    ]);

    var items = trxData.items;
    var prodValues = sheetProduk.getDataRange().getValues();

    for (var i = 0; i < items.length; i++) {
      var itm = items[i];
      sheetDetail.appendRow([
        trxId, itm.productId, itm.productName, Number(itm.qty),
        Number(itm.subtotal), itm.serialNumber || '-', itm.warranty || 'Tidak Ada'
      ]);

      for (var p = 1; p < prodValues.length; p++) {
        if (String(prodValues[p][0]) === String(itm.productId)) {
          var currentStk = Number(prodValues[p][4]);
          sheetProduk.getRange(p + 1, 5).setValue(Math.max(0, currentStk - Number(itm.qty)));
          break;
        }
      }

      logStockChange(itm.productId, 'PENJUALAN', -Number(itm.qty), 'Penjualan: ' + trxId, trxData.cashier);
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

    sheetTrx.getRange(foundRow, 8).setValue('Void');

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

        logStockChange(pId, 'VOID_PENJUALAN', qty, 'Pembatalan (Void) Transaksi: ' + trxId, user || 'admin');
      }
    }

    lock.releaseLock();
    return { success: true, message: 'Transaksi ' + trxId + ' berhasil dibatalkan (VOID)!' };
  } catch (err) {
    if (lock) lock.releaseLock();
    return { success: false, message: err.toString() };
  }
}

function logStockChange(productId, changeType, quantity, notes, user) {
  try {
    var sheet = getSpreadsheet().getSheetByName(SHEETS.STOK_LOG);
    var logId = 'LOG-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss');
    sheet.appendRow([logId, getCurrentTimestamp(), productId, changeType, quantity, notes, user || 'System']);
  } catch (e) {
    console.error(e);
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
    sheet.appendRow([
      newId, getCurrentTimestamp(), '', s.customerName, s.customerPhone,
      s.device, s.complaint, Number(s.estimatedCost || 0), s.status || 'Diterima', s.technician || 'Teknisi'
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
        if (finalCost) sheet.getRange(i + 1, 8).setValue(Number(finalCost));
        if (status === 'Selesai' || status === 'Diambil') sheet.getRange(i + 1, 3).setValue(getCurrentTimestamp());
        return { success: true, message: 'Status berhasil diubah' };
      }
    }
    return { success: false, message: 'Service tidak ditemukan' };
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
      record.photoBase64 ? record.photoBase64.substring(0, 500) + '...[Foto Disimpan]' : '',
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
`;

export const GAS_INDEX_HTML_PREVIEW = `<!DOCTYPE html>
<!-- Lihat file gas_Index.html lengkap di root direktori proyek ini -->
<!-- File ini murni Vanilla JS & Pure CSS untuk Google Apps Script HtmlService -->
`;
