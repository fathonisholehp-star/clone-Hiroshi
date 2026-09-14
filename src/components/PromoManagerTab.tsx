import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Tag,
  Laptop,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Monitor,
  Image as ImageIcon,
  Check,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { User, PromoSlide, PcBundle, PromoCoupon } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  INITIAL_PROMO_SLIDES,
  INITIAL_COUPONS,
  INITIAL_PC_BUNDLES,
  STORAGE_KEY_PROMO_SLIDES,
  STORAGE_KEY_PC_BUNDLES,
  STORAGE_KEY_COUPONS,
} from '../data/initialPromo';
import {
  SlideModal,
  BundleModal,
  CouponModal,
  DeletePromoModal,
} from './promo/PromoModals';

interface PromoManagerTabProps {
  currentUser: User;
  onOpenPromoDisplay: () => void;
}

export default function PromoManagerTab({
  currentUser,
  onOpenPromoDisplay,
}: PromoManagerTabProps) {
  // Hanya Admin yang diizinkan mengakses
  const isAdmin = currentUser.role === 'Admin';

  const [activeSection, setActiveSection] = useState<'banners' | 'bundles' | 'coupons'>('banners');

  // Dynamic state loaded from localStorage
  const [promoSlides, setPromoSlides] = useState<PromoSlide[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMO_SLIDES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load promo slides', e);
    }
    return INITIAL_PROMO_SLIDES;
  });

  const [pcBundles, setPcBundles] = useState<PcBundle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PC_BUNDLES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load pc bundles', e);
    }
    return INITIAL_PC_BUNDLES;
  });

  const [coupons, setCoupons] = useState<PromoCoupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUPONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load coupons', e);
    }
    return INITIAL_COUPONS;
  });

  // Modal States
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<PromoSlide | null>(null);

  const [bundleModalOpen, setBundleModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<PcBundle | null>(null);

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<PromoCoupon | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    itemTitle: string;
    itemType: 'banner' | 'bundle' | 'coupon';
    itemId: string | number;
  }>({
    isOpen: false,
    itemTitle: '',
    itemType: 'banner',
    itemId: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROMO_SLIDES, JSON.stringify(promoSlides));
    } catch (e) {
      console.error('Error saving promo slides', e);
    }
  }, [promoSlides]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PC_BUNDLES, JSON.stringify(pcBundles));
    } catch (e) {
      console.error('Error saving pc bundles', e);
    }
  }, [pcBundles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
    } catch (e) {
      console.error('Error saving coupons', e);
    }
  }, [coupons]);

  // If user is not admin, deny access immediately
  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-red-500/40 p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Akses Terbatas: Hanya Administrator</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
          Menu <strong>Kelola Promosi</strong> hanya dapat diubah atau diedit oleh pengguna dengan role <strong>Admin</strong>. Pengguna dengan hak akses Kasir atau Teknisi tidak diizinkan mengubah materi promosi toko.
        </p>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono">
          <span>Role Anda saat ini:</span>
          <span className="font-bold text-amber-400">{currentUser.role}</span>
        </div>
      </div>
    );
  }

  // === HANDLERS: BANNER SLIDES ===
  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: PromoSlide) => {
    setEditingSlide(slide);
    setSlideModalOpen(true);
  };

  const handleSaveSlide = (savedSlide: PromoSlide) => {
    const idx = promoSlides.findIndex((s) => String(s.id) === String(savedSlide.id));
    if (idx >= 0) {
      const updated = [...promoSlides];
      updated[idx] = savedSlide;
      setPromoSlides(updated);
      showToast('Banner slide promo berhasil diperbarui!');
    } else {
      setPromoSlides([...promoSlides, savedSlide]);
      showToast('Banner slide promo baru berhasil ditambahkan!');
    }
    setSlideModalOpen(false);
  };

  const promptDeleteSlide = (slide: PromoSlide) => {
    if (promoSlides.length <= 1) {
      alert('Minimal harus ada 1 banner promo yang aktif!');
      return;
    }
    setDeleteModalState({
      isOpen: true,
      itemTitle: slide.title || 'Banner Slide',
      itemType: 'banner',
      itemId: slide.id,
    });
  };

  // === HANDLERS: PAKET RAKIT PC ===
  const handleOpenAddBundle = () => {
    setEditingBundle(null);
    setBundleModalOpen(true);
  };

  const handleOpenEditBundle = (bundle: PcBundle) => {
    setEditingBundle(bundle);
    setBundleModalOpen(true);
  };

  const handleSaveBundle = (savedBundle: PcBundle) => {
    const idx = pcBundles.findIndex((b) => b.id === savedBundle.id);
    if (idx >= 0) {
      const updated = [...pcBundles];
      updated[idx] = savedBundle;
      setPcBundles(updated);
      showToast('Paket rakit PC berhasil diperbarui!');
    } else {
      setPcBundles([...pcBundles, savedBundle]);
      showToast('Paket rakit PC baru berhasil ditambahkan!');
    }
    setBundleModalOpen(false);
  };

  const promptDeleteBundle = (bundle: PcBundle) => {
    setDeleteModalState({
      isOpen: true,
      itemTitle: bundle.name,
      itemType: 'bundle',
      itemId: bundle.id,
    });
  };

  // === HANDLERS: KUPON DISKON ===
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon: PromoCoupon) => {
    setEditingCoupon(coupon);
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = (savedCoupon: PromoCoupon) => {
    const idx = coupons.findIndex(
      (c) => (c.id && savedCoupon.id && c.id === savedCoupon.id) || c.code === savedCoupon.code
    );
    if (idx >= 0) {
      const updated = [...coupons];
      updated[idx] = savedCoupon;
      setCoupons(updated);
      showToast('Kupon diskon berhasil diperbarui!');
    } else {
      setCoupons([...coupons, savedCoupon]);
      showToast('Kupon diskon baru berhasil ditambahkan!');
    }
    setCouponModalOpen(false);
  };

  const promptDeleteCoupon = (coupon: PromoCoupon) => {
    setDeleteModalState({
      isOpen: true,
      itemTitle: `${coupon.code} - ${coupon.title}`,
      itemType: 'coupon',
      itemId: coupon.id || coupon.code,
    });
  };

  // === DELETE CONFIRMATION ===
  const handleConfirmDelete = () => {
    const { itemType, itemId } = deleteModalState;
    if (itemType === 'banner') {
      const updated = promoSlides.filter((s) => String(s.id) !== String(itemId));
      setPromoSlides(updated);
      showToast('Banner slide promo berhasil dihapus.');
    } else if (itemType === 'bundle') {
      setPcBundles(pcBundles.filter((b) => b.id !== itemId));
      showToast('Paket rakit PC berhasil dihapus.');
    } else if (itemType === 'coupon') {
      setCoupons(coupons.filter((c) => (c.id ? c.id !== itemId : c.code !== itemId)));
      showToast('Kupon diskon berhasil dihapus.');
    }
    setDeleteModalState({
      isOpen: false,
      itemTitle: '',
      itemType: 'banner',
      itemId: '',
    });
  };

  // === RESET DATA ===
  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Kembalikan seluruh materi promosi (Banner, Paket PC, dan Kupon) ke setelan standar bawaan toko?'
      )
    ) {
      setPromoSlides(INITIAL_PROMO_SLIDES);
      setPcBundles(INITIAL_PC_BUNDLES);
      setCoupons(INITIAL_COUPONS);
      showToast('Display promosi berhasil direset ke pengaturan bawaan!');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Admin Role Badge & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  Kelola Display Promosi
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>Admin Only</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola banner carousel, voucher diskon kasir, dan paket bundling rakit PC yang tampil di display pelanggan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct link to public customer display */}
          <button
            id="btn-open-customer-display"
            onClick={onOpenPromoDisplay}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all cursor-pointer"
            title="Buka tampilan layar display pelanggan"
          >
            <Monitor className="w-4 h-4" />
            <span>Buka Display Pelanggan</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            onClick={handleResetToDefault}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset display promosi ke konfigurasi standar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* 2. Section Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSection('banners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'banners'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Banner Slide ({promoSlides.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('bundles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'bundles'
              ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Paket Rakit PC ({pcBundles.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'coupons'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Kupon Diskon ({coupons.length})</span>
        </button>
      </div>

      {/* 3. TAB CONTENT 1: BANNER SLIDES */}
      {activeSection === 'banners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Daftar Slide Banner Promo Carousel
              </h2>
              <p className="text-xs text-slate-400">
                Banner ini otomatis berganti setiap 6 detik di halaman utama display toko.
              </p>
            </div>
            <button
              onClick={handleOpenAddSlide}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-cyan-400/20 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Banner Slide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promoSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg group hover:border-cyan-500/50 transition-all"
              >
                {/* Banner Thumbnail Preview */}
                <div className="relative h-40 bg-slate-950 overflow-hidden">
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-cyan-300 border border-cyan-800">
                      Slide #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white">
                      {slide.discountBadge}
                    </span>
                  </div>
                </div>

                {/* Banner Content Summary */}
                <div className="p-4 space-y-2 flex-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
                    {slide.badge}
                  </span>
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <span>Tombol CTA:</span>
                    <span className="text-cyan-300 font-bold">"{slide.actionText}"</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditSlide(slide)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Banner</span>
                  </button>

                  <button
                    onClick={() => promptDeleteSlide(slide)}
                    disabled={promoSlides.length <= 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer disabled:opacity-40"
                    title={promoSlides.length <= 1 ? 'Minimal harus ada 1 slide aktif' : 'Hapus slide banner'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Tambah Banner Card Placeholder */}
            <button
              onClick={handleOpenAddSlide}
              className="rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 p-6 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-sm text-cyan-300 font-mono block">
                  + Tambah Banner Slide Baru
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Unggah gambar dan tentukan tajuk promo
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT 2: PAKET RAKIT PC */}
      {activeSection === 'bundles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Daftar Paket Bundling Rakit PC (Custom Rig)
              </h2>
              <p className="text-xs text-slate-400">
                Paket PC siap pakai dengan rincian spesifikasi, harga coret, dan harga promo.
              </p>
            </div>
            <button
              onClick={handleOpenAddBundle}
              className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Paket PC</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pcBundles.map((bundle) => (
              <div
                key={bundle.id}
                className={`rounded-xl p-5 flex flex-col justify-between transition-all bg-slate-900 border ${
                  bundle.isHot ? 'border-cyan-500/80 shadow-lg shadow-cyan-500/10' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
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

                  <h3 className="font-bold text-white text-base leading-snug">
                    {bundle.name}
                  </h3>

                  {/* Specs List */}
                  <div className="space-y-1.5 my-3 py-2 border-y border-slate-800 text-xs text-slate-300">
                    {bundle.specs.map((spec, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{spec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 line-through font-mono">
                      {formatCurrency(bundle.originalPrice)}
                    </div>
                    <div className="text-lg font-black text-cyan-300 font-mono">
                      {formatCurrency(bundle.promoPrice)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditBundle(bundle)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Paket</span>
                  </button>

                  <button
                    onClick={() => promptDeleteBundle(bundle)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                    title="Hapus paket rakit PC"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Tambah Bundle Card Placeholder */}
            <button
              onClick={handleOpenAddBundle}
              className="rounded-xl border-2 border-dashed border-blue-500/40 hover:border-blue-400 bg-blue-500/5 hover:bg-blue-500/10 p-6 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-sm text-blue-300 font-mono block">
                  + Tambah Paket Rakit PC Baru
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Atur spesifikasi part & harga promo
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT 3: KUPON DISKON */}
      {activeSection === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Daftar Kupon &amp; Voucher Diskon Pelanggan
              </h2>
              <p className="text-xs text-slate-400">
                Kupon yang dapat disalin oleh pelanggan di display dan diklaim saat checkout di kasir.
              </p>
            </div>
            <button
              onClick={handleOpenAddCoupon}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Kupon Diskon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="rounded-xl p-4 bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-md group hover:border-amber-400/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {coupon.tag}
                    </span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {coupon.nominal}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{coupon.title}</h3>
                  <p className="text-xs text-slate-400">{coupon.minSpend}</p>

                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-dashed border-slate-700 font-mono text-xs font-bold text-cyan-400 tracking-wider inline-block">
                      {coupon.code}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditCoupon(coupon)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Kupon</span>
                  </button>

                  <button
                    onClick={() => promptDeleteCoupon(coupon)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                    title="Hapus kupon ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Tambah Kupon Card Placeholder */}
            <button
              onClick={handleOpenAddCoupon}
              className="rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 p-6 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer min-h-[180px]"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-sm text-amber-300 font-mono block">
                  + Tambah Kupon Baru
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Atur kode voucher & nominal potongan
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CRUD MODALS */}
      <SlideModal
        isOpen={slideModalOpen}
        slide={editingSlide}
        onClose={() => setSlideModalOpen(false)}
        onSave={handleSaveSlide}
      />

      <BundleModal
        isOpen={bundleModalOpen}
        bundle={editingBundle}
        onClose={() => setBundleModalOpen(false)}
        onSave={handleSaveBundle}
      />

      <CouponModal
        isOpen={couponModalOpen}
        coupon={editingCoupon}
        onClose={() => setCouponModalOpen(false)}
        onSave={handleSaveCoupon}
      />

      <DeletePromoModal
        isOpen={deleteModalState.isOpen}
        itemType={
          deleteModalState.itemType === 'banner'
            ? 'Banner Slide'
            : deleteModalState.itemType === 'bundle'
            ? 'Paket PC'
            : 'Kupon Diskon'
        }
        itemTitle={deleteModalState.itemTitle}
        onClose={() =>
          setDeleteModalState({
            isOpen: false,
            itemTitle: '',
            itemType: 'banner',
            itemId: '',
          })
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
