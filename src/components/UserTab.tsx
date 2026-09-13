import { useState, FormEvent } from 'react';
import { Users, Plus, Shield, Check, X, KeyRound, UserCheck, ShieldAlert, Pencil, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { User, UserRole } from '../types';

interface UserTabProps {
  users: User[];
  currentUser: User;
  onSaveUser: (user: User, originalUsername?: string) => void;
  onDeleteUser?: (username: string) => void;
}

export default function UserTab({ users, currentUser, onSaveUser, onDeleteUser }: UserTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalUsername, setOriginalUsername] = useState('');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<User>({
    username: '',
    password: '123',
    role: 'Kasir',
    fullName: '',
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setOriginalUsername('');
    setErrorMessage('');
    setShowPassword(false);
    setFormData({
      id: `USR-${Date.now()}`,
      username: '',
      password: '123',
      role: 'Kasir',
      fullName: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setIsEditing(true);
    setOriginalUsername(user.username);
    setErrorMessage('');
    setShowPassword(false);
    setFormData({
      id: user.id || `USR-${Date.now()}`,
      username: user.username,
      password: user.password || '123',
      role: user.role,
      fullName: user.fullName,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmUser || !onDeleteUser) return;
    onDeleteUser(deleteConfirmUser.username);
    setDeleteConfirmUser(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanUsername = formData.username.trim().toLowerCase();
    const cleanFullName = formData.fullName.trim();

    if (!cleanUsername || !cleanFullName) {
      setErrorMessage('Username dan Nama Lengkap wajib diisi!');
      return;
    }

    // Check if username is already taken by another user
    const existing = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.username.toLowerCase() !== originalUsername.toLowerCase()
    );

    if (existing) {
      setErrorMessage(`Username "${cleanUsername}" sudah digunakan oleh staf lain. Gunakan username lain.`);
      return;
    }

    onSaveUser(
      {
        ...formData,
        username: cleanUsername,
        fullName: cleanFullName,
      },
      originalUsername
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Manajemen Pengguna &amp; Hak Akses (RBAC)
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                Khusus Admin
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Kelola, edit data akun, ubah role hak akses, dan hapus pengguna sistem POS &amp; Service Hiroshi Computer.
            </p>
          </div>

          <button
            id="btn-add-user"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Role Matrix Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-sm text-purple-900 mb-1.5">
            <Shield className="w-4 h-4 text-purple-700" />
            <span>👑 Role: Admin</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            Pemilik toko atau manajer operasional toko dengan otoritas tertinggi.
          </p>
          <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside">
            <li>Semua akses menu &amp; modul terbuka penuh</li>
            <li>CRUD Master Produk, Stok, dan Kategori</li>
            <li>Laporan Penjualan, Omset, dan Margin</li>
            <li>Manajemen User, Akun, &amp; Hak Akses</li>
            <li>Pengaturan Toko &amp; Konfigurasi Printer Struk</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 mb-1.5">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>🛒 Role: Kasir</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            Staf frontline toko berfokus pada kelancaran operasional &amp; penjualan.
          </p>
          <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside">
            <li>Semua akses menu dibuka KECUALI User &amp; Pengaturan Toko</li>
            <li>Kasir &amp; Penjualan, Cetak Struk, SN, &amp; Garansi</li>
            <li>Katalog &amp; Manajemen Stok Produk</li>
            <li>Work Order Service IT &amp; Presensi Karyawan</li>
            <li>Laporan Penjualan &amp; Skrip Google Sheets</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>🔧 Role: Teknisi</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            Spesialis perbaikan hardware komputer, laptop, dan IT solutions.
          </p>
          <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside">
            <li>Presensi Karyawan (Check-in &amp; Check-out)</li>
            <li>Work Order Service IT &amp; Update Status Pengerjaan</li>
            <li>Kasir &amp; Penjualan (Billing Service / Sparepart)</li>
            <li>Dibatasi dari menu User, Pengaturan, Katalog, &amp; Laporan</li>
          </ul>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#E3F2FD]/60 text-[#0D47A1] font-bold border-b border-[#1E88E5]/20">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Hak Akses Modul</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isCurrent = u.username.toLowerCase() === currentUser.username.toLowerCase();
                const isSoleAdmin = u.role === 'Admin' && users.filter((x) => x.role === 'Admin').length <= 1;

                return (
                  <tr key={u.username} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0D47A1] font-bold text-xs flex items-center justify-center shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <span>{u.fullName}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                            (Anda)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">{u.username}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'Kasir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {u.role === 'Admin'
                        ? 'Semua Akses Modul (Administrator Penuh)'
                        : u.role === 'Kasir'
                        ? 'Semua Akses KECUALI Manajemen User & Pengaturan Toko'
                        : 'Presensi Karyawan, Service IT, dan Kasir & Penjualan'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          id={`btn-edit-user-${u.username}`}
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border border-blue-200 text-xs font-bold font-mono flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title={`Edit data akun ${u.fullName}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          id={`btn-delete-user-${u.username}`}
                          type="button"
                          onClick={() => handleOpenDelete(u)}
                          disabled={isCurrent || isSoleAdmin}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono flex items-center gap-1 transition-all shadow-2xs ${
                            isCurrent || isSoleAdmin
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                              : 'bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border-red-200 cursor-pointer'
                          }`}
                          title={
                            isCurrent
                              ? 'Tidak dapat menghapus akun yang sedang aktif'
                              : isSoleAdmin
                              ? 'Tidak dapat menghapus satu-satunya akun Administrator'
                              : `Hapus pengguna ${u.fullName}`
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0D47A1] text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Pencil className="w-5 h-5 text-blue-200" />
                    <span>Edit Data Pengguna</span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 text-blue-200" />
                    <span>Tambah Pengguna Baru</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap Staf
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Contoh: Rian Anggara"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 font-mono">
                    Username Login
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="rian"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 font-mono">
                    Password / PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="123"
                      className="w-full text-xs sm:text-sm px-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pilih Role Hak Akses:
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-semibold"
                >
                  <option value="Kasir">Kasir (Fokus Transaksi &amp; Struk)</option>
                  <option value="Teknisi">Teknisi (Modul Service IT &amp; WA)</option>
                  <option value="Admin">Admin (Akses Penuh Seluruh Sistem)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs sm:text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Daftarkan Staf'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-red-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Hapus Pengguna Ini?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun{' '}
                <strong className="text-gray-900">{deleteConfirmUser.fullName}</strong> (username:{' '}
                <code className="text-red-700 bg-red-50 px-1 py-0.5 rounded font-mono">
                  {deleteConfirmUser.username}
                </code>
                )? Tindakan ini permanen dan tidak dapat dibatalkan.
              </p>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Pengguna tidak akan dapat login lagi ke sistem kasir atau modul service.</span>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
