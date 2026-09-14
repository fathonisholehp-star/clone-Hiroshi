import { useState, useEffect } from 'react';
import {
  Cpu,
  AlertTriangle,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Palette,
  Clock,
  Sparkles,
  ShieldAlert,
  Tv,
} from 'lucide-react';
import { User, Product, StoreSettings, StoreTheme } from '../types';

interface HeaderProps {
  currentUser: User;
  products: Product[];
  storeSettings?: StoreSettings;
  onOpenLogin: () => void;
  onSelectTab: (tab: string) => void;
  onUpdateTheme?: (theme: StoreTheme) => void;
  onOpenPromo?: () => void;
  onLogout?: () => void;
}

export default function Header({
  currentUser,
  products,
  storeSettings,
  onOpenLogin,
  onSelectTab,
  onUpdateTheme,
  onOpenPromo,
  onLogout,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Live real-time clock for POS hardware terminal feel
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const lowStockCount = products.filter(
    (p) => p.category !== 'Jasa Service' && p.stock <= p.minStock
  ).length;

  const currentTheme = storeSettings?.theme || 'dark-stealth';

  const roleStyles: Record<string, string> = {
    Admin: 'bg-purple-950/40 text-purple-300 border-purple-500/40 shadow-xs',
    Kasir: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-xs',
    Teknisi: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 shadow-xs',
  };

  const storeName = storeSettings?.storeName || 'HIROSHI COMPUTER';
  const tagline = storeSettings?.tagline || 'Toko Komputer, Part PC & Layanan Service IT';
  const hasCustomLogo = Boolean(storeSettings?.showLogoInHeader && storeSettings?.logoUrl);

  const cycleTheme = () => {
    if (!onUpdateTheme) return;
    if (currentTheme === 'dark-stealth') onUpdateTheme('titanium-clean');
    else if (currentTheme === 'titanium-clean') onUpdateTheme('classic-blue');
    else onUpdateTheme('dark-stealth');
  };

  const headerBgClass =
    currentTheme === 'dark-stealth'
      ? 'bg-[#090D16] border-b border-slate-800/90 text-slate-100 shadow-lg shadow-black/40'
      : currentTheme === 'titanium-clean'
      ? 'bg-[#0F172A] border-b border-slate-800 text-slate-100 shadow-md'
      : 'bg-linear-to-r from-[#0D47A1] via-[#1565C0] to-[#1E88E5] text-white shadow-md';

  return (
    <header id="main-app-header" className={`${headerBgClass} px-4 sm:px-6 py-2.5 sticky top-0 z-40 transition-colors print:hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Identity & Hardware Store Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-b from-slate-800 to-slate-900 border border-slate-700/80 text-cyan-400 flex items-center justify-center font-black text-xl shadow-inner shrink-0 overflow-hidden relative group">
            {hasCustomLogo ? (
              <img
                src={storeSettings!.logoUrl}
                alt={storeName}
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <>
                <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white leading-tight uppercase font-mono">
                {storeName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-800/80 border border-slate-700 text-cyan-300 font-mono tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                POS HARDWARE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-none mt-0.5 flex items-center gap-1.5">
              <span>{tagline}</span>
            </p>
          </div>
        </div>

        {/* Right: Telemetry, Stock Warning, Theme Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Terminal Clock */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime || '08:00:00 WIB'}</span>
          </div>

          {/* Low stock pill */}
          {lowStockCount > 0 && (
            <button
              id="header-low-stock-alert"
              onClick={() => onSelectTab('produk')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/25 transition-colors"
              title="Klik untuk melihat produk dengan stok menipis"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">{lowStockCount} Stok Menipis</span>
              <span className="sm:hidden">{lowStockCount}</span>
            </button>
          )}

          {/* Button to switch to Promotional Display Mode */}
          {onOpenPromo && (
            <button
              id="btn-header-open-promo"
              onClick={onOpenPromo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 text-xs font-semibold transition-all shadow-xs cursor-pointer font-mono"
              title="Buka Halaman Awal Promosi & Showcase Toko"
            >
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline text-[11px]">Display Promo</span>
            </button>
          )}

          {/* Quick Theme Switcher Button */}
          {onUpdateTheme && (
            <div className="relative">
              <button
                id="btn-header-theme-toggle"
                onClick={cycleTheme}
                onMouseEnter={() => setIsThemeMenuOpen(true)}
                onMouseLeave={() => setIsThemeMenuOpen(false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium transition-all shadow-xs"
                title={`Tema Toko Saat Ini: ${
                  currentTheme === 'dark-stealth'
                    ? 'Dark Stealth (PC Gaming)'
                    : currentTheme === 'titanium-clean'
                    ? 'Titanium Clean'
                    : 'Classic Blue'
                } - Klik untuk ganti`}
              >
                {currentTheme === 'dark-stealth' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden xl:inline text-[11px] font-mono text-cyan-300">Dark Stealth</span>
                  </>
                ) : currentTheme === 'titanium-clean' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden xl:inline text-[11px] font-mono text-amber-300">Titanium Clean</span>
                  </>
                ) : (
                  <>
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden xl:inline text-[11px] font-mono text-blue-300">Classic Blue</span>
                  </>
                )}
              </button>

              {/* Hover quick picker */}
              {isThemeMenuOpen && (
                <div
                  onMouseEnter={() => setIsThemeMenuOpen(true)}
                  onMouseLeave={() => setIsThemeMenuOpen(false)}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Pilih Tema Toko
                  </div>
                  <button
                    onClick={() => {
                      onUpdateTheme('dark-stealth');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      currentTheme === 'dark-stealth'
                        ? 'bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-800/60'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <div>Dark Stealth PC</div>
                      <div className="text-[10px] text-slate-400">Elegan Gaming/Hardware</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onUpdateTheme('titanium-clean');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      currentTheme === 'titanium-clean'
                        ? 'bg-amber-950/60 text-amber-300 font-bold border border-amber-800/60'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div>Titanium Clean</div>
                      <div className="text-[10px] text-slate-400">Boutique IT &amp; Tech</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onUpdateTheme('classic-blue');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      currentTheme === 'classic-blue'
                        ? 'bg-blue-950/60 text-blue-300 font-bold border border-blue-800/60'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <div>Classic Hiroshi Blue</div>
                      <div className="text-[10px] text-slate-400">Tampilan Asli</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Profile Pill with Hardware Terminal Look */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/80 hover:bg-slate-800 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-700/80 transition-colors shadow-inner">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white leading-tight font-mono">
                {currentUser.fullName.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                ID: {currentUser.username}
              </div>
            </div>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                roleStyles[currentUser.role] || 'bg-slate-700 text-slate-200 border-slate-600'
              }`}
            >
              {currentUser.role}
            </span>

            {/* Re-login / Switch user button */}
            <button
              id="btn-header-login-switch"
              onClick={onOpenLogin}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              title="Ganti Pengguna / Login Admin"
            >
              <LogIn className="w-3.5 h-3.5" />
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                id="btn-header-logout"
                onClick={onLogout}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/60 hover:border-red-600 text-red-300 hover:text-white text-[11px] font-mono font-bold transition-all cursor-pointer shadow-xs"
                title="Logout dari Akun / Keluar Sesi"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
