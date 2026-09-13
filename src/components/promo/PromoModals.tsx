import React, { useState, useEffect, FormEvent } from 'react';
import { X, Check, Image, Tag, Laptop, Trash2, AlertTriangle, Sparkles, Percent } from 'lucide-react';
import { PromoSlide, PcBundle, PromoCoupon } from '../../types';

// ======================= 1. SLIDE BANNER MODAL =======================
interface SlideModalProps {
  isOpen: boolean;
  slide: PromoSlide | null; // null means adding new
  onClose: () => void;
  onSave: (slide: PromoSlide) => void;
}

export function SlideModal({ isOpen, slide, onClose, onSave }: SlideModalProps) {
  const [formData, setFormData] = useState<PromoSlide>({
    id: '',
    badge: 'PROMO SPESIAL TOKO',
    title: '',
    subtitle: '',
    discountBadge: 'DISKON SPESIAL',
    actionText: 'Lihat Promo',
    accentColor: 'from-cyan-500 to-blue-600',
    bgGlow: 'bg-cyan-500/10',
    img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&auto=format&fit=crop&q=80',
  });

  useEffect(() => {
    if (slide) {
      setFormData(slide);
    } else {
      setFormData({
        id: `slide-${Date.now()}`,
        badge: 'PROMO SPESIAL TOKO',
        title: '',
        subtitle: '',
        discountBadge: 'DISKON HINGGA 25%',
        actionText: 'Lihat Promo Selengkapnya',
        accentColor: 'from-cyan-500 to-blue-600',
        bgGlow: 'bg-cyan-500/10',
        img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&auto=format&fit=crop&q=80',
      });
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul banner wajib diisi!');
      return;
    }
    onSave({
      ...formData,
      id: formData.id || `slide-${Date.now()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-cyan-500/40 text-slate-100 overflow-hidden my-6">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {slide ? 'Edit Banner Slide Promo' : 'Tambah Banner Slide Baru'}
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">Khusus Administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Judul Utama Banner *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: MEGA SALE RAKIT PC GAMING & DESAIN"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Sub-Judul / Penjelasan Singkat
            </label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Jelaskan keuntungan promo, cashback, free instalasi, dsb..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-400 focus:outline-hidden text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Badge Atas (Kategori/Tema)
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="PROMO SPESIAL BULAN INI"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Badge Diskon Merah
              </label>
              <input
                type="text"
                value={formData.discountBadge}
                onChange={(e) => setFormData({ ...formData, discountBadge: e.target.value })}
                placeholder="HEMAT S/D RP 1.500.000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-hidden font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Teks Tombol Aksi (CTA)
              </label>
              <input
                type="text"
                value={formData.actionText}
                onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
                placeholder="Lihat Paket Rakitan"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tema Warna Aksen
              </label>
              <select
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-hidden"
              >
                <option value="from-cyan-500 to-blue-600">Cyber Cyan &amp; Blue</option>
                <option value="from-amber-500 to-orange-600">Sunset Amber &amp; Orange</option>
                <option value="from-emerald-500 to-teal-600">Emerald Glow &amp; Teal</option>
                <option value="from-purple-500 to-pink-600">Neon Purple &amp; Pink</option>
                <option value="from-red-500 to-rose-700">Crimson Power &amp; Rose</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              URL Gambar Background (Web / Unsplash)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={formData.img}
                onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-hidden font-mono"
              />
            </div>
            {formData.img && (
              <div className="mt-2 relative rounded-lg overflow-hidden h-24 border border-slate-800 bg-slate-950">
                <img
                  src={formData.img}
                  alt="Preview"
                  className="w-full h-full object-cover opacity-75"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute bottom-1.5 right-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded text-slate-300">
                  Pratinjau Gambar
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Check className="w-4 h-4" />
              <span>{slide ? 'Simpan Perubahan' : 'Terbitkan Banner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ======================= 2. PAKET RAKIT PC MODAL =======================
interface BundleModalProps {
  isOpen: boolean;
  bundle: PcBundle | null; // null means adding new
  onClose: () => void;
  onSave: (bundle: PcBundle) => void;
}

export function BundleModal({ isOpen, bundle, onClose, onSave }: BundleModalProps) {
  const [formData, setFormData] = useState<PcBundle>({
    id: '',
    name: '',
    category: 'Gaming / Editing / Streaming',
    specs: [],
    originalPrice: 8000000,
    promoPrice: 6990000,
    badge: 'DISKON PROMO',
    isHot: false,
  });
  const [specsText, setSpecsText] = useState('');

  useEffect(() => {
    if (bundle) {
      setFormData(bundle);
      setSpecsText(bundle.specs.join('\n'));
    } else {
      const defaultSpecs = [
        'Intel Core i5-12400F / Ryzen 5 5600',
        'VGA RTX 3060 12GB GDDR6',
        'RAM 16GB Dual Channel DDR4 3200MHz',
        'SSD 512GB NVMe M.2 Ultra Fast',
        'PSU 550W 80+ Bronze Certified',
        'Casing Gaming Tempered Glass + 3 Fan RGB',
      ];
      setFormData({
        id: `bundle-${Date.now()}`,
        name: '',
        category: 'Gaming / Editing / Streaming',
        specs: defaultSpecs,
        originalPrice: 9500000,
        promoPrice: 8250000,
        badge: 'BEST SELLER 🔥',
        isHot: true,
      });
      setSpecsText(defaultSpecs.join('\n'));
    }
  }, [bundle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama paket PC wajib diisi!');
      return;
    }
    const parsedSpecs = specsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSave({
      ...formData,
      id: formData.id || `bundle-${Date.now()}`,
      specs: parsedSpecs.length > 0 ? parsedSpecs : ['Spesifikasi belum ditentukan'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-cyan-500/40 text-slate-100 overflow-hidden my-6">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {bundle ? 'Edit Paket Rakit PC' : 'Tambah Paket Rakit PC Baru'}
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">Khusus Administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nama Paket PC *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Paket Gaming eSports & Streamer Starter"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-hidden font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Kategori Target / Penggunaan
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Valorant / GTA V / Editing"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Badge / Label Promo
              </label>
              <input
                type="text"
                required
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="BEST SELLER 🔥"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 text-xs font-mono font-bold focus:ring-2 focus:ring-cyan-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Harga Normal (Rp) *
              </label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-400 font-mono text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-hidden line-through"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-400 mb-1">
                Harga Promo Sale (Rp) *
              </label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                value={formData.promoPrice}
                onChange={(e) =>
                  setFormData({ ...formData, promoPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-cyan-500 rounded-lg text-cyan-300 font-mono font-bold text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Daftar Spesifikasi Komponen (1 baris per komponen):
            </label>
            <textarea
              rows={5}
              required
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              placeholder="Processor: AMD Ryzen 5 5600&#10;VGA: NVIDIA GeForce RTX 3060 12GB&#10;RAM: 16GB Dual Channel DDR4&#10;SSD: 512GB NVMe M.2"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-cyan-400 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Gunakan Enter untuk memisahkan setiap komponen part PC.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-xs block">
                Sorot sebagai Paket Hot / Rekomendasi
              </span>
              <span className="text-[11px] text-slate-400">
                Memberikan bingkai neon cyan dan animasi badge khusus.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isHot}
                onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Check className="w-4 h-4" />
              <span>{bundle ? 'Simpan Paket' : 'Terbitkan Paket PC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ======================= 3. KUPON DISKON MODAL =======================
interface CouponModalProps {
  isOpen: boolean;
  coupon: PromoCoupon | null; // null means adding new
  onClose: () => void;
  onSave: (coupon: PromoCoupon) => void;
}

export function CouponModal({ isOpen, coupon, onClose, onSave }: CouponModalProps) {
  const [formData, setFormData] = useState<PromoCoupon>({
    code: '',
    title: '',
    nominal: '',
    minSpend: '',
    tag: 'Paket PC',
  });

  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData({
        code: `PROMO${Math.floor(100 + Math.random() * 900)}`,
        title: '',
        nominal: 'Potongan Rp 100.000',
        minSpend: 'Min. belanja Rp 2.000.000',
        tag: 'Hardware',
      });
    }
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode || !formData.title.trim()) {
      alert('Kode Kupon dan Judul wajib diisi!');
      return;
    }
    onSave({
      ...formData,
      code: cleanCode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-amber-500/40 text-slate-100 overflow-hidden my-6">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {coupon ? 'Edit Kupon Diskon' : 'Tambah Kupon Diskon Baru'}
              </h3>
              <p className="text-[11px] text-amber-400 font-mono">Khusus Administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Kode Kupon Diskon *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase().replace(/\s+/g, ''),
                })
              }
              placeholder="CONTOH: HIROSHIPC150"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold tracking-wider focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Judul Kupon Promo *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Diskon Rakit PC Baru"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nominal / Besaran Diskon *
              </label>
              <input
                type="text"
                required
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                placeholder="Potongan Rp 150.000 atau 15%"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Kategori Tag
              </label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
              >
                <option value="Paket PC">Paket PC</option>
                <option value="Hardware">Hardware &amp; Part</option>
                <option value="Laptop">Laptop</option>
                <option value="Service IT">Service IT</option>
                <option value="Aksesoris">Aksesoris</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Syarat &amp; Ketentuan Minimal Belanja
            </label>
            <input
              type="text"
              required
              value={formData.minSpend}
              onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
              placeholder="Contoh: Min. belanja Rp 4.000.000"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              <span>{coupon ? 'Simpan Kupon' : 'Aktifkan Kupon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ======================= 4. DELETE CONFIRMATION MODAL =======================
interface DeletePromoModalProps {
  isOpen: boolean;
  itemType: 'Banner Slide' | 'Paket PC' | 'Kupon Diskon';
  itemTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePromoModal({
  isOpen,
  itemType,
  itemTitle,
  onClose,
  onConfirm,
}: DeletePromoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full border border-red-500/40 text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            Hapus {itemType}?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus {itemType.toLowerCase()}{' '}
            <strong className="text-white">"{itemTitle}"</strong> dari menu display promosi?
          </p>
          <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-[11px] text-red-300 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>Tindakan ini akan langsung menghapus item dari tampilan pelanggan toko.</span>
          </div>
        </div>

        <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-800 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-lg shadow-red-600/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}
