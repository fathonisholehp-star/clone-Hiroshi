import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  History,
  RotateCcw,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { Product, CartItem, PaymentMethod, Transaction, User, Category } from '../types';
import { formatCurrency, generateTrxId } from '../utils/formatters';

interface CashierTabProps {
  products: Product[];
  categories: (Category | string)[];
  currentUser: User;
  onSaveTransaction: (trx: Transaction) => void;
  transactions: Transaction[];
  onVoidTransaction: (trxId: string) => void;
  onShowReceipt: (trx: Transaction) => void;
}

export default function CashierTab({
  products,
  categories,
  currentUser,
  onSaveTransaction,
  transactions,
  onVoidTransaction,
  onShowReceipt,
}: CashierTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Transaction History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Barcode input ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query));
    return matchCategory && matchSearch;
  });

  // Handle Quick Barcode Scan Submit
  const handleBarcodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Check exact match by barcode or ID first
    const found = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === query.toLowerCase()) ||
        p.id.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      addToCart(found);
      setSearchQuery('');
    } else if (filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      setSearchQuery('');
    }
  };

  // Add item to cart
  const addToCart = (product: Product) => {
    if (product.category !== 'Jasa Service' && product.stock <= 0) {
      alert(`Stok untuk "${product.name}" telah habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (
          product.category !== 'Jasa Service' &&
          existing.qty + 1 > product.stock
        ) {
          alert(`Jumlah melebihi stok yang tersedia (${product.stock})!`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      // Default warranty based on category
      let defaultWarranty = 'Tidak Ada';
      if (product.category === 'Laptop') defaultWarranty = '2 Tahun Resmi';
      else if (product.category === 'Part PC') defaultWarranty = '1 Tahun';
      else if (product.category === 'Aksesoris') defaultWarranty = '6 Bulan';
      else if (product.category === 'Jasa Service') defaultWarranty = '1 Bulan Garansi Service';

      return [
        ...prev,
        {
          product,
          qty: 1,
          serialNumber: '',
          warranty: defaultWarranty,
          itemDiscount: 0,
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            if (
              item.product.category !== 'Jasa Service' &&
              newQty > item.product.stock
            ) {
              alert(`Maksimal stok yang tersedia: ${item.product.stock}`);
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const updateItemSN = (productId: string, serialNumber: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, serialNumber } : item
      )
    );
  };

  const updateItemWarranty = (productId: string, warranty: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, warranty } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Kosongkan keranjang belanja?')) {
      setCart([]);
      setDiscount(0);
    }
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const total = Math.max(0, subtotal - discount);
  const change = Math.max(0, amountPaid - total);

  const openCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong!');
      return;
    }
    setAmountPaid(total);
    setIsPaymentOpen(true);
  };

  // Process checkout
  const handleProcessPayment = () => {
    if (paymentMethod === 'Tunai' && amountPaid < total) {
      alert('Uang yang dibayarkan kurang dari total tagihan!');
      return;
    }

    const transactionId = generateTrxId();
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTransaction: Transaction = {
      id: transactionId,
      date: dateFormatted,
      cashier: currentUser.username,
      subtotal,
      discount,
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'Tunai' ? amountPaid : total,
      change: paymentMethod === 'Tunai' ? change : 0,
      status: 'Sukses',
      items: cart.map((item) => ({
        transactionId,
        productId: item.product.id,
        productName: item.product.name,
        qty: item.qty,
        subtotal: item.product.price * item.qty,
        serialNumber: item.serialNumber || '-',
        warranty: item.warranty || 'Tidak Ada',
      })),
    };

    onSaveTransaction(newTransaction);
    setIsPaymentOpen(false);
    setCart([]);
    setDiscount(0);
    onShowReceipt(newTransaction);
  };

  return (
    <div className="space-y-4">
      {/* 2-Column / POS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Catalog & Products (col-span 7 on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Top Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  ref={searchInputRef}
                  id="pos-search-barcode-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama produk, kode ID, atau scan barcode... (tekan Enter)"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
                />
                <Barcode className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
              </div>

              <button
                id="btn-pos-history"
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <History className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Riwayat Transaksi</span>
              </button>
            </form>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                id="pos-cat-all"
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[#1E88E5] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua Produk ({products.length})
              </button>

              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const catId = typeof cat === 'string' ? cat : cat.id;
                const count = products.filter((p) => p.category === catName).length;
                return (
                  <button
                    key={catId}
                    id={`pos-cat-${catId}`}
                    onClick={() => setSelectedCategory(catName)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === catName
                        ? 'bg-[#1E88E5] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {catName} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium text-sm">Tidak ada produk yang cocok</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs text-[#1E88E5] font-semibold hover:underline"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isOutOfStock =
                  product.category !== 'Jasa Service' && product.stock <= 0;
                const isLowStock =
                  product.category !== 'Jasa Service' &&
                  product.stock > 0 &&
                  product.stock <= product.minStock;

                return (
                  <div
                    key={product.id}
                    id={`product-card-${product.id}`}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`bg-white rounded-xl border p-3 flex flex-col justify-between transition-all duration-150 relative group ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                        : 'hover:border-[#1E88E5] hover:shadow-md cursor-pointer border-gray-200 active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      {/* Image */}
                      <div className="relative aspect-4/3 w-full bg-gray-100 rounded-lg overflow-hidden mb-2.5">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-gray-800 shadow-xs">
                          {product.category}
                        </span>

                        {isLowStock && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500 text-white shadow-xs">
                            Stok Tipis
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-red-600 text-white shadow-xs">
                            Habis
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-100">
                      <div className="text-sm sm:text-base font-extrabold text-[#0D47A1]">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-500 mt-1">
                        <span>{product.id}</span>
                        <span
                          className={`font-semibold ${
                            product.category === 'Jasa Service'
                              ? 'text-blue-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : isOutOfStock
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {product.category === 'Jasa Service'
                            ? 'Layanan'
                            : `Stok: ${product.stock}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Cart & Checkout (col-span 5 on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-[115px]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1E88E5]/10 rounded-md text-[#1E88E5]">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 leading-tight">Keranjang Kasir</h3>
                  <span className="text-[11px] text-gray-500">
                    {cart.reduce((acc, itm) => acc + itm.qty, 0)} item dipilih
                  </span>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  id="btn-clear-cart"
                  onClick={clearCart}
                  className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-3 overflow-y-auto divide-y divide-gray-100 flex-1 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Keranjang masih kosong</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Klik produk di sebelah kiri atau ketik barcode untuk menambah item.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="pt-3 first:pt-0 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-xs font-bold text-gray-900 leading-tight">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {formatCurrency(item.product.price)} x {item.qty}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-[#0D47A1]">
                          {formatCurrency(item.product.price * item.qty)}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-gray-400 hover:text-red-600 p-1 text-xs transition-colors"
                          title="Hapus item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Serial Number & Warranty Inputs */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F5F5F5] p-2 rounded-lg border border-gray-200/80">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">
                          Serial Number (SN):
                        </label>
                        <input
                          type="text"
                          value={item.serialNumber}
                          onChange={(e) => updateItemSN(item.product.id, e.target.value)}
                          placeholder="SN: contoh SN-9821..."
                          className="w-full text-[11px] py-1 px-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#1E88E5] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">
                          Garansi:
                        </label>
                        <select
                          value={item.warranty}
                          onChange={(e) =>
                            updateItemWarranty(item.product.id, e.target.value)
                          }
                          className="w-full text-[11px] py-1 px-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#1E88E5] focus:outline-hidden"
                        >
                          <option value="Tidak Ada">Tidak Ada</option>
                          <option value="1 Bulan">1 Bulan</option>
                          <option value="3 Bulan">3 Bulan</option>
                          <option value="6 Bulan">6 Bulan</option>
                          <option value="1 Tahun">1 Tahun</option>
                          <option value="2 Tahun Resmi">2 Tahun Resmi</option>
                          <option value="3 Tahun">3 Tahun</option>
                          <option value="Lifetime Garansi">Lifetime</option>
                        </select>
                      </div>
                    </div>

                    {/* Quantity Adjustment Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-gray-500">Jumlah:</span>
                      <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQty(item.product.id, -1)}
                          className="p-1 hover:bg-gray-100 text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-900 min-w-8 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.product.id, 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Diskon Transaksi (Rp)</span>
                <input
                  id="pos-discount-input"
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount || ''}
                  placeholder="0"
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-right px-2 py-1 text-xs border border-gray-300 rounded bg-white font-medium focus:outline-hidden focus:ring-1 focus:ring-[#1E88E5]"
                />
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total Tagihan</span>
                <span className="text-xl font-extrabold text-[#0D47A1]">
                  {formatCurrency(total)}
                </span>
              </div>

              <button
                id="btn-pos-checkout"
                type="button"
                onClick={openCheckout}
                disabled={cart.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                  cart.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#1E88E5] hover:bg-[#0D47A1] text-white active:scale-[0.99] cursor-pointer'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Bayar &amp; Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0D47A1] text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-200" />
                <span>Penyelesaian Pembayaran</span>
              </h3>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#E3F2FD] p-4 rounded-xl border border-blue-200 text-center">
                <div className="text-xs text-blue-800 font-medium uppercase tracking-wider">
                  Total yang Harus Dibayar
                </div>
                <div className="text-2xl font-black text-[#0D47A1] mt-1">
                  {formatCurrency(total)}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Pilih Metode Pembayaran:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Tunai', icon: Banknote, label: 'Tunai (Cash)' },
                    { id: 'QRIS', icon: QrCode, label: 'QRIS Instant' },
                    { id: 'Transfer Bank', icon: Building2, label: 'Transfer Bank' },
                    { id: 'Debit', icon: CreditCard, label: 'Kartu Debit' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id as PaymentMethod);
                          if (m.id !== 'Tunai') setAmountPaid(total);
                        }}
                        className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-[#1E88E5] bg-[#E3F2FD] text-[#0D47A1] shadow-2xs ring-2 ring-[#1E88E5]/30'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#1E88E5]' : 'text-gray-400'}`} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Input & Suggestions */}
              {paymentMethod === 'Tunai' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    Nominal Uang Tunai Diterima (Rp):
                  </label>
                  <input
                    id="modal-cash-input"
                    type="number"
                    value={amountPaid || ''}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-base font-bold text-gray-900 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
                    placeholder="Contoh: 100000"
                    autoFocus
                  />

                  {/* Quick Cash Suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setAmountPaid(total)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                    >
                      Uang Pas
                    </button>
                    {[50000, 100000, 200000, 500000, 1000000, 5000000, 10000000]
                      .filter((val) => val >= total)
                      .slice(0, 4)
                      .map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmountPaid(val)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md"
                        >
                          {formatCurrency(val)}
                        </button>
                      ))}
                  </div>

                  {/* Kembalian */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-gray-600">Kembalian:</span>
                    <span
                      className={`text-base font-extrabold ${
                        amountPaid < total ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {amountPaid < total
                        ? `Kurang ${formatCurrency(total - amountPaid)}`
                        : formatCurrency(change)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod !== 'Tunai' && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Pembayaran non-tunai diverifikasi lunas secara otomatis ({paymentMethod}).
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-payment"
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={paymentMethod === 'Tunai' && amountPaid < total}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-white shadow-sm flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'Tunai' && amountPaid < total
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#1E88E5] hover:bg-[#0D47A1]'
                  }`}
                >
                  <span>Selesai &amp; Cetak</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION HISTORY MODAL (WITH VOID OPTION FOR ADMIN) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#0D47A1] text-white px-5 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-base">Riwayat Transaksi Penjualan</h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Belum ada transaksi tersimpan.
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((trx) => (
                    <div
                      key={trx.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        trx.status === 'Void'
                          ? 'bg-red-50/60 border-red-200 opacity-75'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{trx.id}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                trx.status === 'Void'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {trx.status}
                            </span>
                            <span className="text-xs text-gray-500">{trx.date}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Kasir: <strong>{trx.cashier}</strong> &bull; Metode:{' '}
                            <span className="font-medium text-[#0D47A1]">
                              {trx.paymentMethod}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-extrabold text-gray-900">
                            {formatCurrency(trx.total)}
                          </div>
                          <div className="flex gap-1.5 mt-1 justify-end">
                            <button
                              onClick={() => onShowReceipt(trx)}
                              className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium"
                            >
                              Lihat Struk
                            </button>

                            {/* Void button only for Admin */}
                            {currentUser.role === 'Admin' && trx.status !== 'Void' && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Batalkan (VOID) transaksi ${trx.id}? Stok barang akan otomatis dikembalikan ke inventaris.`
                                    )
                                  ) {
                                    onVoidTransaction(trx.id);
                                  }
                                }}
                                className="px-2.5 py-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded font-semibold flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Void</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="mt-2.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        {trx.items.map((itm, i) => (
                          <div key={i} className="flex justify-between py-0.5">
                            <span>
                              {itm.qty}x {itm.productName}{' '}
                              {itm.serialNumber && itm.serialNumber !== '-' ? (
                                <span className="text-[10px] text-blue-700 font-mono">
                                  (SN: {itm.serialNumber})
                                </span>
                              ) : null}
                            </span>
                            <span className="font-medium">{formatCurrency(itm.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsHistoryOpen(false)}
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
