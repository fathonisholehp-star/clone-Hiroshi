import { useState, FormEvent } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  FileText,
  Search,
  Check,
  X,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Product, StockLog, User, Category } from '../types';
import { formatCurrency, generateProductId } from '../utils/formatters';

interface ProductTabProps {
  products: Product[];
  categories: (Category | string)[];
  currentUser: User;
  onSaveProduct: (product: Product, isNew: boolean, reason?: string) => void;
  onDeleteProduct: (productId: string) => void;
  stockLogs: StockLog[];
}

export default function ProductTab({
  products,
  categories,
  currentUser,
  onSaveProduct,
  onDeleteProduct,
  stockLogs,
}: ProductTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    name: '',
    category: 'Laptop',
    price: 0,
    stock: 0,
    minStock: 2,
    imageUrl: '',
    barcode: '',
  });
  const [changeReason, setChangeReason] = useState('Penyesuaian stok master');

  const isAdmin = currentUser.role === 'Admin';

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query));
    return matchCat && matchSearch;
  });

  const handleOpenAdd = () => {
    const newId = generateProductId('PRD', products.length);
    setEditingProduct(null);
    const firstCatName =
      categories.length > 0
        ? typeof categories[0] === 'string'
          ? categories[0]
          : categories[0].name
        : 'Laptop';

    setFormData({
      id: newId,
      name: '',
      category: firstCatName,
      price: 100000,
      stock: 5,
      minStock: 2,
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
      barcode: `899${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setChangeReason('Stok awal produk baru');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setChangeReason('Pembaruan data / penyesuaian stok produk');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.id?.trim()) {
      alert('Nama produk dan ID wajib diisi!');
      return;
    }

    const productToSave: Product = {
      id: formData.id,
      name: formData.name.trim(),
      category: formData.category || 'Laptop',
      price: Number(formData.price || 0),
      stock: Number(formData.stock || 0),
      minStock: Number(formData.minStock || 0),
      imageUrl:
        formData.imageUrl ||
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
      barcode: formData.barcode || formData.id,
    };

    onSaveProduct(productToSave, !editingProduct, changeReason);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header card with filters and actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              Master Produk &amp; Manajemen Stok
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Kelola katalog komputer, suku cadang, serial number, batas stok minimum, dan audit trail log.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-open-stock-logs"
              onClick={() => setIsLogModalOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <History className="w-4 h-4 text-blue-600" />
              <span>Log Stok ({stockLogs.length})</span>
            </button>

            {isAdmin && (
              <button
                id="btn-add-product"
                onClick={handleOpenAdd}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, nama produk, atau barcode..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#1E88E5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua ({products.length})
            </button>
            {categories.map((cat) => {
              const catName = typeof cat === 'string' ? cat : cat.name;
              const catId = typeof cat === 'string' ? cat : cat.id;
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === catName
                      ? 'bg-[#1E88E5] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#E3F2FD]/60 text-[#0D47A1] border-b border-[#1E88E5]/20 font-bold">
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">ID &amp; Barcode</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-center">Batas Min.</th>
                <th className="py-3 px-4 text-center">Status Stok</th>
                {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock =
                    p.category !== 'Jasa Service' && p.stock <= 0;
                  const isLowStock =
                    p.category !== 'Jasa Service' &&
                    p.stock > 0 &&
                    p.stock <= p.minStock;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg bg-gray-100 shrink-0 border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">
                              {p.name}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              Terdaftar di inventaris
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                        <div>{p.id}</div>
                        {p.barcode && p.barcode !== p.id && (
                          <div className="text-[10px] text-gray-400">
                            BC: {p.barcode}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-extrabold text-[#0D47A1]">
                        {formatCurrency(p.price)}
                      </td>

                      <td className="py-3 px-4 text-center font-bold">
                        {p.category === 'Jasa Service' ? (
                          <span className="text-blue-600 text-xs">Unlim.</span>
                        ) : (
                          <span
                            className={
                              isOutOfStock
                                ? 'text-red-600'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-gray-900'
                            }
                          >
                            {p.stock}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center text-gray-500 font-medium">
                        {p.category === 'Jasa Service' ? '-' : p.minStock}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.category === 'Jasa Service' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                            Jasa IT
                          </span>
                        ) : isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800">
                            Habis (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center justify-center gap-1 mx-auto w-max">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Stok Menipis</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aman
                          </span>
                        )}
                      </td>

                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit Produk"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Hapus produk "${p.name}" dari master data?`
                                  )
                                ) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="bg-[#0D47A1] text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-200" />
                <span>{editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ID Produk (Kode Unik)
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    required
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Barcode / Scanner Code
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    placeholder="Contoh: 8991234"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Produk Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Contoh: Laptop Lenovo Slim 3 Ryzen 5 / SSD 1TB..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                  >
                    {categories.map((cat) => {
                      const catName = typeof cat === 'string' ? cat : cat.name;
                      const catId = typeof cat === 'string' ? cat : cat.id;
                      return (
                        <option key={catId} value={catName}>
                          {catName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Math.max(0, Number(e.target.value)),
                      })
                    }
                    required
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jumlah Stok Fisik
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: Math.max(0, Number(e.target.value)),
                      })
                    }
                    required
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Batas Minimum Stok (Min_Stok)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStock: Math.max(0, Number(e.target.value)),
                      })
                    }
                    required
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL Gambar Produk
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Keterangan untuk Catatan StokLog:
                </label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Misal: Restock dari vendor, opname stok berkala..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-sm font-bold rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK LOG AUDIT MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#0D47A1] text-white px-5 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-base">Audit Trail Perubahan Stok (StokLog)</h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                      <th className="py-2.5 px-3">Tanggal &amp; Waktu</th>
                      <th className="py-2.5 px-3">Produk</th>
                      <th className="py-2.5 px-3">Tipe</th>
                      <th className="py-2.5 px-3 text-center">Perubahan</th>
                      <th className="py-2.5 px-3">Keterangan</th>
                      <th className="py-2.5 px-3">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          Belum ada log stok.
                        </td>
                      </tr>
                    ) : (
                      stockLogs.map((log) => {
                        const isPositive = log.quantity > 0;
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                              {log.date}
                            </td>
                            <td className="py-2 px-3 font-semibold text-gray-900">
                              {log.productName}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.changeType === 'MASUK'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : log.changeType === 'PENJUALAN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : log.changeType === 'VOID_PENJUALAN'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {log.changeType}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold">
                              <span
                                className={`inline-flex items-center gap-0.5 ${
                                  isPositive ? 'text-emerald-700' : 'text-red-700'
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                )}
                                {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-600">{log.notes}</td>
                            <td className="py-2 px-3 font-mono text-[11px] text-gray-500">
                              {log.user}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
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
