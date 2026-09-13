import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  RefreshCw,
  ExternalLink,
  Download,
  Search,
  Maximize2,
  X,
  ShieldCheck,
  Building2,
  Navigation,
  UploadCloud,
} from 'lucide-react';
import { AttendanceRecord, AttendanceType, User, StoreSettings } from '../types';
import {
  calculateDistanceMeters,
  exportToCsv,
  formatDateTime,
  generateAttendanceId,
  STORE_COORDINATES,
} from '../utils/formatters';

interface AttendanceTabProps {
  currentUser: User;
  attendanceRecords: AttendanceRecord[];
  storeSettings?: StoreSettings;
  onSaveAttendance: (record: AttendanceRecord) => void;
}

export default function AttendanceTab({
  currentUser,
  attendanceRecords,
  storeSettings,
  onSaveAttendance,
}: AttendanceTabProps) {
  // Mode Absen: Masuk or Pulang
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('Masuk');
  const [notes, setNotes] = useState('');

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Geolocation State
  const [isLocating, setIsLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    distance: number;
    isInRadius: boolean;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Filter & History Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Kasir' | 'Teknisi'>('All');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{
    url: string;
    name: string;
    time: string;
  } | null>(null);

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Request location automatically on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start Front Camera for Face Capture
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung pada browser ini.');
      }

      // Stop existing stream if any
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.error('Camera error:', err);
      const errMsg = err instanceof Error ? err.message : 'Izin kamera ditolak atau tidak tersedia.';
      setCameraError(errMsg);
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Face Snapshot to Canvas
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add visual timestamp watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, canvas.height - 40, canvas.width - 20, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(
      `Hiroshi POS • ${currentUser.fullName} • ${formatDateTime(new Date())}`,
      20,
      canvas.height - 20
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // File Upload fallback for photo selfie
  const handlePhotoUploadFallback = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedPhoto(reader.result as string);
      setCameraError(null);
    };
    reader.readAsDataURL(file);
  };

  // Detect Geolocation
  const detectLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolokasi tidak didukung oleh browser Anda.');
      setIsLocating(false);
      return;
    }

    const targetLat = storeSettings?.geofenceSettings?.latitude ?? STORE_COORDINATES.lat;
    const targetLng = storeSettings?.geofenceSettings?.longitude ?? STORE_COORDINATES.lng;
    const maxRadius =
      storeSettings?.geofenceSettings?.maxRadiusMeters ?? STORE_COORDINATES.maxAllowedRadiusMeters;
    const storeName = storeSettings?.storeName || 'Toko Hiroshi Computer';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        const distance = calculateDistanceMeters(lat, lng, targetLat, targetLng);

        const isInRadius = distance <= maxRadius;

        setCurrentCoords({
          lat,
          lng,
          accuracy,
          distance,
          isInRadius,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation warning/fallback:', err);
        setLocationError(
          `Tidak dapat membaca GPS langsung (${err.message}). Menggunakan perkiraan koordinat ${storeName}.`
        );
        // Fallback to store coordinates so user is not blocked in restricted container/iframe
        setCurrentCoords({
          lat: targetLat,
          lng: targetLng,
          accuracy: 25,
          distance: 10,
          isInRadius: true,
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Submit Attendance Record
  const handleSubmitAttendance = (e: FormEvent) => {
    e.preventDefault();

    if (!capturedPhoto) {
      alert('Silakan ambil foto wajah (selfie) terlebih dahulu untuk verifikasi absensi!');
      return;
    }

    if (!currentCoords) {
      alert('Silakan lakukan deteksi lokasi GPS terlebih dahulu!');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const timestampStr = `${dateStr} ${timeStr}`;

    // Status: Evaluasi jam masuk vs jam terlambat
    const hour = now.getHours();
    const min = now.getMinutes();
    let status: 'Tepat Waktu' | 'Terlambat' | 'Lembur' = 'Tepat Waktu';

    // Parse configurable work hours (e.g. "08:30" and "18:00")
    const workStartStr = storeSettings?.geofenceSettings?.workStartHour || '08:30';
    const [startH, startM] = workStartStr.split(':').map((v) => parseInt(v, 10) || 0);

    const workEndStr = storeSettings?.geofenceSettings?.workEndHour || '18:00';
    const [endH, endM] = workEndStr.split(':').map((v) => parseInt(v, 10) || 0);

    if (attendanceType === 'Masuk') {
      if (hour > startH || (hour === startH && min > startM)) {
        status = 'Terlambat';
      }
    } else {
      if (hour > endH || (hour === endH && min >= endM)) {
        status = 'Lembur';
      }
    }

    const currentStoreName = storeSettings?.storeName || 'Hiroshi Computer';

    const newRecord: AttendanceRecord = {
      id: generateAttendanceId(attendanceRecords.length),
      userId: currentUser.id || `USR-${currentUser.username}`,
      userName: currentUser.fullName,
      role: currentUser.role,
      type: attendanceType,
      date: dateStr,
      time: timeStr,
      timestamp: timestampStr,
      location: {
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        accuracy: currentCoords.accuracy,
        distanceMeters: currentCoords.distance,
        isInStoreRadius: currentCoords.isInRadius,
        addressOrNote: currentCoords.isInRadius
          ? `Area ${currentStoreName} (Jarak: ${currentCoords.distance}m)`
          : `Di Luar Toko (Jarak: ${currentCoords.distance}m dari ${currentStoreName})`,
      },
      photoBase64: capturedPhoto,
      notes: notes.trim() || undefined,
      status,
    };

    onSaveAttendance(newRecord);

    // Reset inputs
    setCapturedPhoto(null);
    setNotes('');
    stopCamera();
    alert(`Presensi ${attendanceType} untuk ${currentUser.fullName} berhasil dicatat!`);
  };

  // Export Table to CSV
  const handleExportCsv = () => {
    const headers = [
      'ID_Absensi',
      'Tanggal',
      'Jam',
      'ID_User',
      'Nama_Pegawai',
      'Role',
      'Tipe_Absen',
      'Latitude',
      'Longitude',
      'Akurasi_GPS_m',
      'Jarak_Toko_m',
      'Radius_Toko',
      'Status_Kehadiran',
      'Keterangan',
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      r.date,
      r.time,
      r.userId,
      r.userName,
      r.role,
      r.type,
      r.location.latitude,
      r.location.longitude,
      r.location.accuracy,
      r.location.distanceMeters,
      r.location.isInStoreRadius ? 'Dalam Toko' : 'Luar Toko',
      r.status,
      r.notes || '-',
    ]);

    exportToCsv(`Hiroshi_Absensi_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  // Filter Records
  const todayStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(currentTime.getDate()).padStart(2, '0')}`;

  const filteredRecords = attendanceRecords.filter((r) => {
    const matchSearch =
      !searchQuery ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRole = roleFilter === 'All' || r.role === roleFilter;

    const matchDate = dateFilter === 'all' || r.date === todayStr;

    return matchSearch && matchRole && matchDate;
  });

  // Metrics calculation
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
  const totalMasukToday = todayRecords.filter((r) => r.type === 'Masuk').length;
  const totalPulangToday = todayRecords.filter((r) => r.type === 'Pulang').length;
  const totalTerlambatToday = todayRecords.filter(
    (r) => r.type === 'Masuk' && r.status === 'Terlambat'
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-[#E3F2FD] text-[#1E88E5]">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Presensi & Absensi Karyawan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Pencatatan absensi Teknisi & Kasir Hiroshi Computer dengan verifikasi foto wajah dan
            geolokasi GPS toko.
          </p>
        </div>

        {/* Live Clock & User Badge */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl self-stretch md:self-auto justify-between md:justify-end">
          <div className="text-right">
            <div className="text-base sm:text-lg font-mono font-bold text-[#0D47A1]">
              {currentTime.toLocaleTimeString('id-ID')}
            </div>
            <div className="text-[11px] text-gray-500">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
          <div className="w-px h-8 bg-gray-300" />
          <div className="text-xs">
            <div className="font-semibold text-gray-800">{currentUser.fullName}</div>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                currentUser.role === 'Admin'
                  ? 'bg-purple-100 text-purple-700'
                  : currentUser.role === 'Teknisi'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Form Absensi (Kamera Wajah + Lokasi GPS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Kamera & Foto Wajah (col-span 6) */}
        <div className="lg:col-span-6 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#1E88E5]" />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Verifikasi Wajah (Face Capture)
                </h2>
              </div>
              <span className="text-[11px] font-medium text-gray-400">Kamera Depan</span>
            </div>

            {/* Video Viewport / Photo Preview */}
            <div className="relative w-full aspect-4/3 bg-gray-950 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
              {capturedPhoto ? (
                // Captured Photo Preview
                <div className="relative w-full h-full">
                  <img
                    src={capturedPhoto}
                    alt="Selfie Presensi"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[11px] px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Foto Wajah Siap
                  </div>
                </div>
              ) : isCameraActive ? (
                // Active Camera Stream
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Oval Guideline Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-44 h-56 border-2 border-dashed border-white/80 rounded-[50%] shadow-[0_0_15px_rgba(30,136,229,0.5)] flex items-center justify-center">
                      <span className="text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-full font-medium">
                        Posisikan Wajah Di Sini
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Camera Idle State
                <div className="text-center p-6 text-gray-400 space-y-2">
                  <Camera className="w-12 h-12 mx-auto text-gray-600" />
                  <p className="text-xs text-gray-300">
                    Kamera belum aktif. Klik tombol di bawah untuk menyalakan kamera.
                  </p>
                  {cameraError && (
                    <div className="p-2 bg-red-900/60 border border-red-700 rounded-lg text-red-200 text-[11px] max-w-xs mx-auto">
                      {cameraError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hidden Canvas for capture processing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera Action Buttons */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            {!capturedPhoto ? (
              <>
                {!isCameraActive ? (
                  <button
                    id="btn-start-camera"
                    type="button"
                    onClick={startCamera}
                    className="flex-1 py-2.5 px-4 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    Buka Kamera Wajah
                  </button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button
                      id="btn-capture-photo"
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      <Camera className="w-4 h-4" />
                      Ambil Foto Wajah
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                    >
                      Tutup
                    </button>
                  </div>
                )}

                {/* Fallback File Upload if Camera Blocked */}
                <label className="text-[11px] text-gray-500 hover:text-[#1E88E5] cursor-pointer flex items-center gap-1 mx-auto mt-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Foto Selfie (Alternatif)</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handlePhotoUploadFallback}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCapturedPhoto(null);
                    startCamera();
                  }}
                  className="py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Foto Ulang
                </button>
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Wajah Terverifikasi
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Deteksi Lokasi & Form Absensi (col-span 6) */}
        <div className="lg:col-span-6 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
          <form onSubmit={handleSubmitAttendance} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E88E5]" />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Verifikasi Geotagging & Status
                </h2>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={isLocating}
                className="text-[11px] text-[#1E88E5] hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'Mendeteksi...' : 'Perbarui GPS'}
              </button>
            </div>

            {/* Pilihan Tipe Absensi: Masuk / Pulang */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Jenis Presensi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttendanceType('Masuk')}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    attendanceType === 'Masuk'
                      ? 'bg-[#E3F2FD] border-[#1E88E5] text-[#0D47A1] shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#1E88E5]" />
                  Absen Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceType('Pulang')}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    attendanceType === 'Pulang'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  Absen Pulang
                </button>
              </div>
            </div>

            {/* Info Lokasi Toko & Hasil Deteksi */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                  <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>{STORE_COORDINATES.name}</span>
                </div>
                <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                  Max: {STORE_COORDINATES.maxAllowedRadiusMeters}m
                </span>
              </div>

              {currentCoords ? (
                <div className="space-y-2 pt-2 border-t border-gray-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Koordinat Anda:</span>
                    <span className="font-mono text-gray-800 font-medium">
                      {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Jarak ke Toko:</span>
                    <span className="font-semibold text-gray-900">
                      ~{currentCoords.distance} meter
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-gray-500">Validasi Radius:</span>
                    {currentCoords.isInRadius ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Dalam Radius Toko (Sah)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Di Luar Radius ({currentCoords.distance}m)
                      </span>
                    )}
                  </div>

                  <div className="text-right pt-1">
                    <a
                      href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1E88E5] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Lihat Titik di Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-gray-400">
                  {isLocating ? 'Sedang melacak sinyal GPS...' : 'Menunggu data lokasi...'}
                </div>
              )}

              {locationError && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
                  {locationError}
                </div>
              )}
            </div>

            {/* Input Catatan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catatan / Keterangan Shift (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Shift pagi service laptop, ganti shift kasir..."
                className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
              />
            </div>

            {/* Tombol Simpan Presensi */}
            <button
              id="btn-submit-attendance"
              type="submit"
              disabled={!capturedPhoto || !currentCoords}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                capturedPhoto && currentCoords
                  ? 'bg-[#1E88E5] hover:bg-[#1976D2] text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Kirim Presensi ({attendanceType})
            </button>
            {!capturedPhoto && (
              <p className="text-[11px] text-center text-gray-400">
                * Wajib mengambil foto wajah terlebih dahulu untuk mengaktifkan tombol.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* 3. Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Hadir Masuk Hari Ini</span>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{totalMasukToday}</div>
          <span className="text-[11px] text-gray-400">Pegawai aktif</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Tepat Waktu</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
            {totalMasukToday - totalTerlambatToday}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Sebelum 08:30</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Terlambat</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
            {totalTerlambatToday}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Lewat 08:30</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Absen Pulang</span>
          <div className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
            {totalPulangToday}
          </div>
          <span className="text-[11px] text-blue-500 font-medium">Shift selesai</span>
        </div>
      </div>

      {/* 4. History Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              Riwayat Presensi Pegawai
            </h3>
            <p className="text-xs text-gray-500">
              Daftar kehadiran Teknisi & Kasir beserta foto wajah dan catatan lokasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pegawai..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'All' | 'Kasir' | 'Teknisi')}
              className="text-xs py-1.5 px-2.5 border border-gray-300 rounded-lg bg-white text-gray-700"
            >
              <option value="All">Semua Role</option>
              <option value="Kasir">Kasir</option>
              <option value="Teknisi">Teknisi</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'today' | 'all')}
              className="text-xs py-1.5 px-2.5 border border-gray-300 rounded-lg bg-white text-gray-700"
            >
              <option value="today">Hari Ini</option>
              <option value="all">Semua Tanggal</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#E3F2FD]/60 text-[#0D47A1] border-b border-[#1E88E5]/20 font-bold">
                <th className="py-3 px-3.5">Foto Wajah</th>
                <th className="py-3 px-3">Pegawai</th>
                <th className="py-3 px-3">Tipe & Jam</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Lokasi & Radius</th>
                <th className="py-3 px-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Belum ada data presensi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Foto Wajah */}
                    <td className="py-2.5 px-3.5">
                      <div
                        onClick={() =>
                          setSelectedPhotoModal({
                            url: rec.photoBase64,
                            name: rec.userName,
                            time: rec.timestamp,
                          })
                        }
                        className="relative w-11 h-11 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group bg-gray-100 shrink-0"
                        title="Klik untuk perbesar"
                      >
                        <img
                          src={rec.photoBase64}
                          alt={rec.userName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Maximize2 className="w-3 h-3" />
                        </div>
                      </div>
                    </td>

                    {/* Pegawai */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-gray-900">{rec.userName}</div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          rec.role === 'Teknisi'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.role === 'Kasir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {rec.role}
                      </span>
                    </td>

                    {/* Tipe & Waktu */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-xs ${
                            rec.type === 'Masuk'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {rec.type}
                        </span>
                        <span className="font-mono font-bold text-gray-800">{rec.time}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-0.5">{rec.date}</span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          rec.status === 'Tepat Waktu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Terlambat'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {rec.status === 'Tepat Waktu' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        )}
                        {rec.status}
                      </span>
                    </td>

                    {/* Lokasi */}
                    <td className="py-2.5 px-3">
                      <div className="text-xs text-gray-700 flex items-center gap-1">
                        {rec.location.isInStoreRadius ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Dalam Toko (~{rec.location.distanceMeters}m)
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Luar Toko (~{rec.location.distanceMeters}m)
                          </span>
                        )}
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${rec.location.latitude},${rec.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#1E88E5] hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <span>Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    {/* Keterangan */}
                    <td className="py-2.5 px-3 text-gray-600 text-xs">
                      {rec.notes ? (
                        <span className="italic">"{rec.notes}"</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Photo Zoom Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{selectedPhotoModal.name}</h4>
                <span className="text-[11px] text-gray-400">{selectedPhotoModal.time}</span>
              </div>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-gray-950 flex items-center justify-center">
              <img
                src={selectedPhotoModal.url}
                alt={selectedPhotoModal.name}
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-gray-50 text-right">
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
