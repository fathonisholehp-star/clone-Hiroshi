import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Flame,
  Tag,
  Percent,
  Sparkles,
  Shield,
  ShieldCheck,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  ShoppingCart,
  Wrench,
  Laptop,
  CheckCircle2,
  Copy,
  ExternalLink,
  LogIn,
  Layers,
  Phone,
  MapPin,
  HelpCircle,
  Zap,
  ArrowRight,
  HardDrive,
  Monitor,
  Package,
} from 'lucide-react';
import { Product, ServiceOrder, StoreSettings, User } from '../types';
import { formatCurrency } from '../utils/formatters';
import { INITIAL_PROMO_SLIDES, INITIAL_COUPONS, INITIAL_PC_BUNDLES } from '../data/initialPromo';

interface PromoLandingProps {
  products: Product[];
  services: ServiceOrder[];
  storeSettings: StoreSettings;
  users?: User[];
  currentUser?: User;
  onEnterPos?: () => void;
  onOpenLogin: (prefUsername?: string) => void;
  onLoginAsRole?: (role: 'Admin' | 'Kasir' | 'Teknisi') => void;
}

export default function PromoLanding({
  products,
  services,
  storeSettings,
  users,
  currentUser,
  onEnterPos,
  onOpenLogin,
  onLoginAsRole,
}: PromoLandingProps) {
  const handleRoleLogin = (role: 'Admin' | 'Kasir' | 'Teknisi') => {
    const matched = users?.find((u) => u.role === role);
    onOpenLogin(matched?.username || (role === 'Admin' ? 'admin' : role === 'Kasir' ? 'kasir' : 'teknisi'));
  };

  // Carousel Slide State
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [promoCategory, setPromoCategory] = useState<string>('all');
  const [searchPromo, setSearchPromo] = useState<string>('');

  // Service tracking search state
  const [serviceTrackInput, setServiceTrackInput] = useState('');
  const [trackedService, setTrackedService] = useState<ServiceOrder | null>(null);
  const [trackError, setTrackError] = useState('');

  // Countdown timer simulation (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const promoSlides = INITIAL_PROMO_SLIDES;
  const coupons = INITIAL_COUPONS;
  const pcBundles = INITIAL_PC_BUNDLES;

  // Auto carousel rotation
  useEffect(() => {
    if (promoSlides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [promoSlides.length]);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  // Map products to promo items
  const promoProducts = products.map((prod, idx) => {
    // Generate attractive discounted price for promo display
    const discountPercent = prod.category === 'Laptop' ? 10 : prod.category === 'Part PC' ? 15 : 20;
    const discountedPrice = Math.round((prod.price * (100 - discountPercent)) / 10000) * 100;
    return {
      ...prod,
      discountPercent,
      discountedPrice,
      isFlashSale: idx % 2 === 0,
    };
  });

  const filteredPromoProducts = promoProducts.filter((p) => {
    const matchCategory =
      promoCategory === 'all'
        ? true
        : promoCategory === 'laptop'
        ? p.category === 'Laptop'
        : promoCategory === 'part'
        ? p.category === 'Part PC'
        : promoCategory === 'service'
        ? p.category === 'Jasa Service'
        : p.category === 'Aksesoris' || p.category === 'Peripheral';

    const matchSearch =
      searchPromo.trim() === '' ||
      p.name.toLowerCase().includes(searchPromo.toLowerCase()) ||
      p.category.toLowerCase().includes(searchPromo.toLowerCase());

    return matchCategory && matchSearch;
  });

  // Track service order
  const handleTrackService = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackedService(null);

    const query = serviceTrackInput.trim().toUpperCase();
    if (!query) {
      setTrackError('Silakan masukkan No. Servis (contoh: SRV-001)');
      return;
    }

    const found = services.find(
      (s) =>
        s.id.toUpperCase() === query ||
        s.customerPhone.includes(query) ||
        s.customerName.toUpperCase().includes(query)
    );

    if (found) {
      setTrackedService(found);
    } else {
      setTrackError(`Nomor Servis "${query}" tidak ditemukan dalam sistem.`);
    }
  };

  const storeName = storeSettings.storeName || 'HIROSHI COMPUTER';
  const tagline = storeSettings.tagline || 'Toko Komputer, Part PC & Layanan Service IT';
  const phone = storeSettings.phone || '0812-3456-7890';
  const address = storeSettings.address || 'Jl. Ahmad Yani No. 88';
  const city = storeSettings.city || 'Surabaya, Jawa Timur';

  const waLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(
    storeName
  )},%20saya%20tertarik%20dengan%20promo%20rakit%20PC%20dan%20hardware`;

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 pb-16">
      {/* 1. TOP PROMO BAR & NOTIFICATION */}
      <div className="bg-linear-to-r from-cyan-950 via-blue-900 to-slate-950 border-b border-cyan-800/40 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-cyan-300 font-bold">STORE STATUS: BUKA</span>
            <span className="text-slate-400 hidden sm:inline">&bull; 08:30 - 20:00 WIB</span>
            <span className="text-slate-400 hidden md:inline">&bull; Konsultasi Spek Gratis</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1 text-amber-300 font-semibold">
              <Flame className="w-3.5 h-3.5 animate-bounce text-amber-400" />
              <span>FLASH SALE:</span>
              <span className="bg-slate-900/80 px-1.5 py-0.5 rounded-sm border border-amber-500/40 text-white">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-300">
              <Phone className="w-3 h-3 text-cyan-400" />
              <span>WA: {phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROMOTIONAL HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-b from-cyan-600 to-blue-700 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-mono">
                  {storeName}
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-mono">
                  PROMO HUB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight hidden sm:block">
                {tagline}
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#promo-banner" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Promo Pilihan</span>
            </a>
            <a href="#kupon-diskon" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Kupon Toko</span>
            </a>
            <a href="#paket-rakit" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Paket Rakit PC</span>
            </a>
            <a href="#katalog-promo" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diskon Produk</span>
            </a>
            <a href="#cek-servis" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-purple-400" />
              <span>Cek Status Servis</span>
            </a>
          </nav>

          {/* Action Buttons: Tanya CS & Login Admin */}
          <div className="flex items-center gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tanya CS</span>
            </a>

            {/* Login Admin (Only Admin is permitted) */}
            <button
              id="btn-promo-login-admin"
              onClick={() => handleRoleLogin('Admin')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all cursor-pointer"
              title="Login Administrator (Akses Penuh)"
            >
              <Shield className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Login Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE CAROUSEL (Dinamis Banner Promo) */}
      <section id="promo-banner" className="relative px-4 sm:px-6 pt-6 pb-4 max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl">
          {/* Main Slide Container */}
          <div className="relative min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-10 z-10">
            {/* Background Image with Dark Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
              style={{
                backgroundImage: `url(${promoSlides[activeSlide]?.img || ''})`,
              }}
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#070A12] via-[#070A12]/90 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-[#070A12] via-transparent to-black/30" />

            {/* Slide Content */}
            {promoSlides[activeSlide] && (
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-700">
                    {promoSlides[activeSlide].badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold font-mono uppercase bg-red-600 text-white shadow-md animate-pulse">
                    {promoSlides[activeSlide].discountBadge}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight uppercase">
                  {promoSlides[activeSlide].title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {promoSlides[activeSlide].subtitle}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="#paket-rakit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-all font-mono"
                  >
                    <span>{promoSlides[activeSlide].actionText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleRoleLogin('Kasir')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-cyan-400" />
                    <span>Masuk Transaksi Kasir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Carousel Controls */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveSlide(
                    (prev) => (prev - 1 + promoSlides.length) % promoSlides.length
                  )
                }
                className="p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white border border-slate-700/80 transition-colors"
                title="Slide sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {promoSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeSlide ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setActiveSlide((prev) => (prev + 1) % promoSlides.length)
                }
                className="p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white border border-slate-700/80 transition-colors"
                title="Slide selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DIGITAL DISCOUNT VOUCHERS / KUPON DISKON TOKO */}
      <section id="kupon-diskon" className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-white uppercase font-mono tracking-wider">
                Voucher Diskon Pelanggan
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Salin kode voucher di bawah dan tunjukkan ke kasir saat pembayaran untuk klaim potongan harga.
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-1 rounded-md self-start sm:self-auto">
            Berlaku Hari Ini di Kasir
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {coupons.map((coupon) => {
            const isCopied = copiedCoupon === coupon.code;
            return (
              <div
                key={coupon.code}
                className="relative rounded-xl bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {coupon.tag}
                    </span>
                    <span className="text-xs font-black text-amber-400 font-mono">
                      {coupon.nominal}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{coupon.title}</h4>
                  <p className="text-[11px] text-slate-400">{coupon.minSpend}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-700 font-mono text-xs font-bold text-cyan-400 tracking-wider">
                    {coupon.code}
                  </div>
                  <button
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PAKET BUNDLING RAKIT PC (PC BUILDER DEALS) */}
      <section id="paket-rakit" className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-linear-to-b from-slate-900/90 via-slate-950 to-[#090D16] border border-cyan-900/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Circuit Accent */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
                  Hiroshi Custom Rig
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                Paket Rakit PC Siap Pakai &amp; Bergaransi
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Semua unit dirakit profesional oleh teknisi berpengalaman, cable management rapi, stress test suhu 24 jam &amp; free lisensi Windows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-700/50 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Konsultasi Spek Custom Bebas</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pcBundles.map((bundle) => (
              <div
                key={bundle.id}
                className={`relative rounded-xl p-5 flex flex-col justify-between transition-all ${
                  bundle.isHot
                    ? 'bg-linear-to-b from-cyan-950/40 via-slate-900 to-slate-950 border-2 border-cyan-500 shadow-xl shadow-cyan-500/10'
                    : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {bundle.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                      bundle.isHot
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {bundle.badge}
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-base text-white leading-snug">
                    {bundle.name}
                  </h4>

                  {/* Specifications List */}
                  <div className="space-y-2 py-2 border-y border-slate-800/80">
                    {bundle.specs.map((spec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 line-through font-mono">
                      {formatCurrency(bundle.originalPrice)}
                    </div>
                    <div className="text-xl font-black text-cyan-300 font-mono">
                      {formatCurrency(bundle.promoPrice)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${phone.replace(
                        /[^0-9]/g,
                        ''
                      )}?text=Halo%20Hiroshi%20Computer,%20saya%20tertarik%20dengan%20${encodeURIComponent(
                        bundle.name
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black text-center font-mono transition-colors"
                    >
                      Pesan Lewat WA
                    </a>

                    <button
                      onClick={() => handleRoleLogin('Kasir')}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 cursor-pointer"
                      title="Buka Kasir"
                    >
                      <ShoppingCart className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROMO PRODUK DISKON & FLASH DEALS KATALOG */}
      <section id="katalog-promo" className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              <h3 className="text-sm sm:text-base font-bold text-white uppercase font-mono tracking-wider">
                Promo Produk &amp; Diskon Khusus
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar laptop, hardware PC, aksesoris, dan layanan dengan diskon terbatas hari ini.
            </p>
          </div>

          {/* Search bar promo */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari promo produk..."
              value={searchPromo}
              onChange={(e) => setSearchPromo(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5 text-xs font-mono">
          {[
            { id: 'all', label: 'Semua Promo' },
            { id: 'laptop', label: 'Laptop Promo' },
            { id: 'part', label: 'Part PC & Upgrade' },
            { id: 'acc', label: 'Peripheral & Aksesoris' },
            { id: 'service', label: 'Layanan Service IT' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setPromoCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                promoCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredPromoProducts.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="group rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/60 p-3 flex flex-col justify-between transition-all duration-200 shadow-md"
            >
              <div>
                {/* Image Container with Discount Badge */}
                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-950 mb-2.5">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black font-mono shadow-sm">
                    -{product.discountPercent}%
                  </span>

                  {product.stock <= 2 && product.category !== 'Jasa Service' && (
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-amber-500/90 text-slate-950 text-[9px] font-extrabold font-mono">
                      SISA {product.stock} UNIT!
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-cyan-400 font-mono uppercase font-bold">
                  {product.category}
                </div>

                <h4 className="text-xs font-bold text-white leading-tight line-clamp-2 mt-1">
                  {product.name}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-500 line-through font-mono">
                  {formatCurrency(product.price)}
                </div>
                <div className="text-sm font-black text-cyan-300 font-mono">
                  {formatCurrency(product.discountedPrice)}
                </div>

                <button
                  onClick={() => handleRoleLogin('Kasir')}
                  className="mt-2 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all font-mono cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Beli di Kasir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CEK STATUS SERVIS INTERAKTIF UNTUK PELANGGAN (LIVE TRACKER) */}
      <section id="cek-servis" className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-linear-to-r from-slate-900 via-slate-950 to-blue-950/40 border border-slate-800 p-6 sm:p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Wrench className="w-4 h-4" />
              <span>Pelacakan Servis Mandiri</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white uppercase mt-1">
              Cek Progres Perbaikan Komputer &amp; Laptop Anda
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pelanggan dapat memantau status diagnosa, estimasi biaya, dan kesiapan unit secara langsung menggunakan Nomor Servis (contoh: <code>SRV-001</code>).
            </p>

            {/* Tracking Search Input */}
            <form onSubmit={handleTrackService} className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Ketik No. Nota Servis (cth: SRV-001 atau Nama)..."
                value={serviceTrackInput}
                onChange={(e) => setServiceTrackInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors"
              >
                Cek Status Sekarang
              </button>
            </form>

            {trackError && (
              <p className="text-xs text-red-400 mt-2 font-mono">{trackError}</p>
            )}

            {/* Result Card */}
            {trackedService && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-cyan-800/80 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-cyan-400">
                      {trackedService.id}
                    </span>
                    <span className="text-xs text-white font-bold">
                      &bull; {trackedService.device}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                      trackedService.status === 'Selesai'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : trackedService.status === 'Diproses'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : trackedService.status === 'Pengecekan'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    STATUS: {trackedService.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nama Pemilik:</span>
                    <strong>{trackedService.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Keluhan:</span>
                    <span>{trackedService.complaint}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Teknisi / Biaya:</span>
                    <span>
                      {trackedService.technician} &bull;{' '}
                      <strong className="text-cyan-300">
                        {formatCurrency(trackedService.finalCost || trackedService.estimatedCost)}
                      </strong>
                    </span>
                  </div>
                </div>

                {trackedService.diagnosis && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-cyan-400 block mb-0.5 font-mono">Hasil Diagnosa &amp; Solusi:</strong>
                    <span>{trackedService.diagnosis}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. INFO MENARIK & KEUNGGULAN HIROSHI COMPUTER */}
      <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <h3 className="text-center text-sm font-mono uppercase tracking-widest text-slate-400 mb-6">
          Keunggulan Belanja &amp; Servis di Hiroshi Computer
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-white">100% Produk Original</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Garansi resmi distributor nasional (ASUS, MSI, Gigabyte, Kingston).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 mx-auto flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-white">Teknisi Tersertifikasi</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Penanganan hardware presisi menggunakan peralatan anti-static ESD.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 mx-auto flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-white">Perakitan Express 1 Hari</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Paket PC siap dikirim atau diambil dalam 24 jam dengan uji benchmark.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-white">Garansi Purna Jual</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Bantuan klaim garansi tanpa ribet &amp; pendampingan teknis gratis.
            </p>
          </div>
        </div>
      </section>

      {/* 9. PROMOTIONAL FOOTER */}
      <footer className="mt-8 border-t border-slate-800 pt-8 px-4 sm:px-6 max-w-7xl mx-auto text-xs text-slate-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <h4 className="text-white font-black uppercase font-mono tracking-wider mb-2">
              {storeName}
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              {tagline}
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{address}, {city}</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase font-mono tracking-wider mb-2">
              Jam Operasional &amp; Layanan
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Senin - Sabtu: 08:30 - 20:00 WIB<br />
              Minggu: 09:00 - 17:00 WIB<br />
              Layanan Service: Buka Setiap Hari
            </p>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-white font-bold uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Akses Administrator</span>
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Sistem dikunci khusus untuk otorisasi Administrator dalam pengoperasian POS, inventori, dan service IT.
              </p>
            </div>

            <div>
              <button
                id="btn-footer-login-admin"
                onClick={() => handleRoleLogin('Admin')}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-600/80 hover:border-amber-400 text-amber-200 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Login Administrator (Admin)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <div>&copy; 2026 {storeName}. Hak Cipta Dilindungi.</div>
          <div>Sistem POS &amp; Manajemen Hardware v1.0.0</div>
        </div>
      </footer>

      {/* 10. FLOATING BAR (MOBILE/DESKTOP QUICK ACTION) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 border-t border-slate-800 p-2.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold text-white hidden sm:inline">Diskon Spesial Aktif:</span>
              <span className="text-cyan-400 font-mono font-bold ml-1">Klaim Voucher Diskon s/d Rp 150.000</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xs:flex px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-xs font-bold items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Chat WA</span>
            </a>

            <button
              id="btn-floating-login-admin"
              onClick={() => handleRoleLogin('Admin')}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 font-mono shadow-md cursor-pointer transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-slate-950" />
              <span>Login Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
