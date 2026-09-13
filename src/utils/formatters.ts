export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateTime(date: Date = new Date()): string {
  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function generateTrxId(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TRX-${y}${m}${d}-${rand}`;
}

export function generateServiceId(existingCount: number = 0): string {
  const date = new Date();
  const y = date.getFullYear();
  const num = String(existingCount + 1).padStart(3, '0');
  return `SRV-${y}-${num}`;
}

export function generateProductId(categoryPrefix: string = 'PRD', existingCount: number = 0): string {
  const num = String(existingCount + 1).padStart(3, '0');
  return `${categoryPrefix}-${num}`;
}

export function generateLogId(existingCount: number = 0): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const num = String(existingCount + 1).padStart(4, '0');
  return `LOG-${y}${m}${d}-${num}`;
}

export function createWhatsAppServiceUrl(
  phone: string,
  serviceId: string,
  customerName: string,
  device: string,
  status: string,
  cost: number,
  notes?: string
): string {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62') && cleanPhone.length > 0) {
    cleanPhone = '62' + cleanPhone;
  }

  let statusMsg = '';
  switch (status) {
    case 'Diterima':
      statusMsg = 'Perangkat Anda telah kami terima dan terdaftar dalam antrean perbaikan Hiroshi Computer.';
      break;
    case 'Pengecekan':
      statusMsg = 'Perangkat Anda sedang dalam proses diagnosa / pengecekan menyeluruh oleh teknisi kami.';
      break;
    case 'Diproses':
      statusMsg = 'Perangkat Anda saat ini sedang dalam proses pengerjaan perbaikan / penggantian part.';
      break;
    case 'Selesai':
      statusMsg = 'Perangkat Anda TELAH SELESAI diperbaiki dan sudah lulus tahap uji kelayakan (Quality Control). Perangkat siap diambil!';
      break;
    case 'Diambil':
      statusMsg = 'Terima kasih, perangkat telah diambil. Simpan nota ini sebagai bukti garansi service.';
      break;
    default:
      statusMsg = `Status perangkat saat ini: ${status}`;
  }

  const message = `Halo Kak *${customerName}*,\n\nKami dari *Hiroshi Computer & IT Service* ingin menginformasikan update perbaikan perangkat Anda:\n\n` +
    `📌 *No. Service:* ${serviceId}\n` +
    `💻 *Perangkat:* ${device}\n` +
    `🔄 *Status:* *${status.toUpperCase()}*\n` +
    `💰 *Estimasi/Total Biaya:* ${formatCurrency(cost)}\n` +
    (notes ? `📝 *Keterangan Teknisi:* ${notes}\n` : '') +
    `\n📢 *Informasi:* ${statusMsg}\n\n` +
    `📍 *Hiroshi Computer*\n` +
    `Jl. Ahmad Yani No. 88, Komputer & IT Solution\n` +
    `Terima kasih atas kepercayaan Anda!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel
    headers.map(escapeCsv).join(',') +
    '\n' +
    rows.map((row) => row.map(escapeCsv).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const STORE_COORDINATES = {
  lat: -6.2088,
  lng: 106.8456,
  name: 'Toko Hiroshi Computer & IT Service',
  address: 'Jl. Ahmad Yani No. 88',
  maxAllowedRadiusMeters: 100, // Radius maksimal agar dianggap berada di area toko
};

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function generateAttendanceId(existingCount: number = 0): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  const num = String(existingCount + 1).padStart(3, '0');
  return `ATT-${y}${m}${d}-${num}${rand}`;
}
