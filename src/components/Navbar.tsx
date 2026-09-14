import {
  ShoppingCart,
  Package,
  Wrench,
  BarChart3,
  Users,
  Code2,
  UserCheck,
  Settings,
} from 'lucide-react';
import { UserRole, StoreTheme } from '../types';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  pendingServiceCount: number;
  theme?: StoreTheme;
}

export default function Navbar({
  activeTab,
  onSelectTab,
  userRole,
  pendingServiceCount,
  theme = 'dark-stealth',
}: NavbarProps) {
  const tabs = [
    {
      id: 'kasir',
      label: 'Kasir & Penjualan',
      icon: ShoppingCart,
      roles: ['Admin', 'Kasir', 'Teknisi'],
    },
    {
      id: 'produk',
      label: 'Katalog & Stok PC',
      icon: Package,
      roles: ['Admin', 'Kasir'],
    },
    {
      id: 'service',
      label: 'Work order Service IT',
      icon: Wrench,
      badge: pendingServiceCount > 0 ? pendingServiceCount : undefined,
      roles: ['Admin', 'Kasir', 'Teknisi'],
    },
    {
      id: 'absensi',
      label: 'Presensi Karyawan',
      icon: UserCheck,
      roles: ['Admin', 'Kasir', 'Teknisi'],
    },
    {
      id: 'laporan',
      label: 'Laporan Penjualan',
      icon: BarChart3,
      roles: ['Admin', 'Kasir'],
    },
    {
      id: 'user',
      label: 'Manajemen User',
      icon: Users,
      roles: ['Admin'],
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Toko',
      icon: Settings,
      roles: ['Admin'],
    },
    {
      id: 'gas',
      label: 'Script Google Sheets',
      icon: Code2,
      roles: ['Admin', 'Kasir'],
      highlight: true,
    },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(userRole));

  const isDark = theme === 'dark-stealth';
  const isTitanium = theme === 'titanium-clean';

  const navContainerBg = isDark
    ? 'bg-[#0B0F19] border-b border-slate-800 shadow-md'
    : isTitanium
    ? 'bg-white border-b border-slate-200 shadow-xs'
    : 'bg-white border-b border-gray-200 shadow-xs';

  return (
    <>
      {/* DESKTOP & TABLET TOP NAVIGATION */}
      <nav
        id="desktop-tablet-navbar"
        className={`${navContainerBg} sticky top-[57px] z-30 hidden sm:block transition-colors print:hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              let tabStyle = '';
              if (isDark) {
                tabStyle = isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-inner font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium';
              } else if (isTitanium) {
                tabStyle = isActive
                  ? 'border-blue-600 text-blue-700 bg-blue-50/70 font-bold'
                  : 'border-transparent text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium';
              } else {
                tabStyle = isActive
                  ? 'border-[#1E88E5] text-[#0D47A1] bg-[#E3F2FD]/50 font-bold'
                  : 'border-transparent text-gray-600 hover:text-[#1E88E5] hover:bg-gray-50 font-medium';
              }

              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm rounded-t-lg transition-all whitespace-nowrap border-b-2 ${tabStyle}`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? isDark
                          ? 'text-cyan-400'
                          : isTitanium
                          ? 'text-blue-600'
                          : 'text-[#1E88E5]'
                        : isDark
                        ? 'text-slate-500'
                        : 'text-gray-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isDark
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* SMARTPHONE BOTTOM NAVIGATION BAR (Pengoperasian Satu Tangan) */}
      <nav
        id="smartphone-bottom-navbar"
        className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 px-1 py-1.5 flex justify-around items-center border-t transition-colors print:hidden ${
          isDark
            ? 'bg-[#0B0F19] border-slate-800 shadow-2xl text-slate-400'
            : 'bg-white border-gray-200 shadow-lg text-gray-500'
        }`}
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const activeColor = isDark
            ? 'text-cyan-400'
            : isTitanium
            ? 'text-blue-600'
            : 'text-[#1E88E5]';

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors relative ${
                isActive ? `${activeColor} font-bold` : 'hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 truncate max-w-[54px]">
                {tab.id === 'kasir'
                  ? 'Kasir'
                  : tab.id === 'produk'
                  ? 'Katalog'
                  : tab.id === 'service'
                  ? 'Service'
                  : tab.id === 'absensi'
                  ? 'Absensi'
                  : tab.id === 'laporan'
                  ? 'Laporan'
                  : tab.id === 'user'
                  ? 'User'
                  : tab.id === 'pengaturan'
                  ? 'Setting'
                  : 'GAS'}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
