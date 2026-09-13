import { useState, useEffect, FormEvent } from 'react';
import {
  Shield,
  KeyRound,
  User as UserIcon,
  X,
  Info,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  defaultUsername?: string;
  onSelectUser: (user: User) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  users,
  defaultUsername = 'admin',
  onSelectUser,
}: LoginModalProps) {
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Reset form state whenever modal opens or default username changes
  useEffect(() => {
    if (isOpen) {
      setUsername(defaultUsername || 'admin');
      setPassword('');
      setError('');
    }
  }, [isOpen, defaultUsername]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setError('Silakan masukkan username akun!');
      return;
    }

    if (!cleanPassword) {
      setError('Silakan masukkan password akun!');
      return;
    }

    // Check user data in Manajemen User (users)
    const targetUser = users.find(
      (u) => u.username.toLowerCase() === cleanUsername
    );

    // If username is not found in user management
    if (!targetUser) {
      setError(`Username "${username}" tidak terdaftar dalam data Manajemen User!`);
      return;
    }

    // Verify password strictly against user management data
    if (targetUser.password !== cleanPassword) {
      setError('Password salah! Password harus sesuai dengan data akun di Manajemen User.');
      return;
    }

    // Success: credentials match user management data exactly
    onSelectUser(targetUser);
    setError('');
    setPassword('');
    onClose();
  };

  const handleQuickSelect = (u: User) => {
    setUsername(u.username);
    setPassword(''); // Password must be inputted manually
    setError('');
  };

  const roleBadges: Record<UserRole, { bg: string; text: string; border: string; desc: string }> = {
    Admin: {
      bg: 'bg-purple-950/60',
      text: 'text-purple-300',
      border: 'border-purple-500/50',
      desc: 'Semua Akses (Administrator)',
    },
    Kasir: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-500/50',
      desc: 'Semua Akses kecuali Manajemen User & Pengaturan Toko',
    },
    Teknisi: {
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-300',
      border: 'border-cyan-500/50',
      desc: 'Presensi Karyawan, Work Order Service IT, dan Kasir & Penjualan',
    },
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-700 text-slate-100 animate-in fade-in zoom-in-95 duration-200 my-4">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-wide font-mono">
                Login Sistem POS &amp; Layanan IT
              </h3>
              <p className="text-xs text-slate-400">
                HIROSHI COMPUTER &bull; Autentikasi Pengguna Sesuai Manajemen User
              </p>
            </div>
          </div>
          <button
            id="btn-close-login-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Ketentuan Keamanan & Autentikasi */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300 leading-relaxed">
              Masukkan <strong className="text-white">Username</strong> dan <strong className="text-white">Password</strong> yang terdaftar pada menu <span className="text-amber-300 font-semibold font-mono">Manajemen User</span> untuk membuka menu aplikasi.
            </div>
          </div>

          {/* Quick Account Switcher Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Pilih Akun Terdaftar:
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Klik akun untuk mengisi username
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = username.toLowerCase() === u.username.toLowerCase();
                const badgeInfo = roleBadges[u.role] || roleBadges.Kasir;
                return (
                  <button
                    key={u.id || u.username}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-xs font-bold text-white truncate">
                        @{u.username}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {u.fullName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-700 rounded-xl text-xs text-red-200 font-medium animate-in fade-in duration-150 flex items-start gap-2 shadow-lg shadow-red-950/50">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Login Kredensial */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Username Akun
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Contoh: admin / kasir / teknisi"
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-950/90 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Password Akun
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Masukkan password akun yang sesuai..."
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-950/90 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Default awal sistem: <strong className="text-cyan-300 font-mono">admin / 123</strong></span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">
                Target: <strong className="text-white">@{username}</strong>
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                id="btn-cancel-login"
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-bold border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition-all font-mono cursor-pointer"
              >
                Batal
              </button>

              <button
                id="btn-submit-login"
                type="submit"
                className="flex-2 py-2.5 text-xs font-black rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all font-mono cursor-pointer"
              >
                <span>Masuk ke Menu</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
