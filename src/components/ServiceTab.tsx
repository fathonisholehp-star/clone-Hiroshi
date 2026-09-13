import { useState, FormEvent } from 'react';
import {
  Wrench,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Search,
  MessageSquare,
  Smartphone,
  Calendar,
  DollarSign,
  UserCheck,
  Edit3,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ServiceOrder, ServiceStatus, User } from '../types';
import {
  formatCurrency,
  generateServiceId,
  createWhatsAppServiceUrl,
} from '../utils/formatters';

interface ServiceTabProps {
  services: ServiceOrder[];
  currentUser: User;
  onSaveService: (order: ServiceOrder, isNew: boolean) => void;
  onUpdateStatus: (
    serviceId: string,
    status: ServiceStatus,
    finalCost?: number,
    diagnosis?: string
  ) => void;
}

export default function ServiceTab({
  services,
  currentUser,
  onSaveService,
  onUpdateStatus,
}: ServiceTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);

  // Status update modal
  const [statusModalOrder, setStatusModalOrder] = useState<ServiceOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ServiceStatus>('Diproses');
  const [finalCostInput, setFinalCostInput] = useState<number>(0);
  const [diagnosisInput, setDiagnosisInput] = useState<string>('');

  // Form State for new/edit service
  const [formData, setFormData] = useState<Partial<ServiceOrder>>({
    customerName: '',
    customerPhone: '',
    device: '',
    complaint: '',
    estimatedCost: 150000,
    technician: currentUser.fullName,
    status: 'Diterima',
  });

  const isTechnicianOrAdmin =
    currentUser.role === 'Teknisi' || currentUser.role === 'Admin';

  const filteredServices = services.filter((s) => {
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      s.id.toLowerCase().includes(query) ||
      s.customerName.toLowerCase().includes(query) ||
      s.customerPhone.includes(query) ||
      s.device.toLowerCase().includes(query) ||
      s.complaint.toLowerCase().includes(query);
    return matchStatus && matchQuery;
  });

  const handleOpenAdd = () => {
    const newId = generateServiceId(services.length);
    setEditingOrder(null);
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setFormData({
      id: newId,
      entryDate: dateFormatted,
      customerName: '',
      customerPhone: '',
      device: '',
      complaint: '',
      estimatedCost: 150000,
      technician: currentUser.fullName,
      status: 'Diterima',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.customerName?.trim() ||
      !formData.device?.trim() ||
      !formData.complaint?.trim()
    ) {
      alert('Nama pelanggan, perangkat, dan keluhan wajib diisi!');
      return;
    }

    const orderToSave: ServiceOrder = {
      id: formData.id || generateServiceId(services.length),
      entryDate: formData.entryDate || new Date().toISOString(),
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone || '',
      device: formData.device.trim(),
      complaint: formData.complaint.trim(),
      estimatedCost: Number(formData.estimatedCost || 0),
      status: formData.status || 'Diterima',
      technician: formData.technician || currentUser.fullName,
      diagnosis: formData.diagnosis || '',
      sparepartsUsed: formData.sparepartsUsed || '',
    };

    onSaveService(orderToSave, !editingOrder);
    setIsModalOpen(false);
  };

  const handleOpenStatusModal = (order: ServiceOrder) => {
    setStatusModalOrder(order);
    setSelectedStatus(order.status);
    setFinalCostInput(order.finalCost || order.estimatedCost);
    setDiagnosisInput(order.diagnosis || '');
  };

  const handleSaveStatusModal = () => {
    if (!statusModalOrder) return;
    onUpdateStatus(
      statusModalOrder.id,
      selectedStatus,
      finalCostInput,
      diagnosisInput
    );
    setStatusModalOrder(null);
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'Diterima':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Diterima
          </span>
        );
      case 'Pengecekan':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            Pengecekan
          </span>
        );
      case 'Diproses':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Diproses
          </span>
        );
      case 'Selesai':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Selesai
          </span>
        );
      case 'Diambil':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            Diambil
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Modul Service Komputer &amp; IT
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                Teknisi &amp; Service Desk
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Penerimaan barang service masuk, diagnosa kerusakan, progres perbaikan, dan notifikasi WhatsApp instan ke pelanggan.
            </p>
          </div>

          <button
            id="btn-add-service"
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Penerimaan Service Baru</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID tiket, nama pelanggan, no. WA, atau jenis laptop/PC..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Diterima', 'Pengecekan', 'Diproses', 'Selesai', 'Diambil'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-[#1E88E5] text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st === 'All' ? `Semua (${services.length})` : st}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Services List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium text-sm">Tidak ada tiket service yang cocok</p>
          </div>
        ) : (
          filteredServices.map((order) => {
            const waUrl = createWhatsAppServiceUrl(
              order.customerPhone,
              order.id,
              order.customerName,
              order.device,
              order.status,
              order.finalCost || order.estimatedCost,
              order.diagnosis
            );

            return (
              <div
                key={order.id}
                id={`service-ticket-${order.id}`}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0D47A1] font-mono">
                          {order.id}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Masuk: {order.entryDate}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">Estimasi Biaya</div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(order.finalCost || order.estimatedCost)}
                      </div>
                    </div>
                  </div>

                  {/* Customer & Device */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pelanggan:</span>
                      <span className="font-bold text-gray-900">{order.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">WhatsApp / HP:</span>
                      <span className="font-mono text-gray-800">{order.customerPhone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Perangkat:</span>
                      <span className="font-semibold text-blue-900">{order.device}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Keluhan:</span>
                      <p className="p-2 bg-gray-50 rounded-lg text-gray-700 text-[11px] italic border border-gray-200/70">
                        "{order.complaint}"
                      </p>
                    </div>

                    {order.diagnosis && (
                      <div>
                        <span className="text-gray-500 block mb-0.5">Diagnosa / Tindakan:</span>
                        <p className="p-2 bg-blue-50/50 rounded-lg text-blue-900 text-[11px] border border-blue-100">
                          {order.diagnosis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls: WhatsApp Trigger & Status Update */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>{order.technician}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp Notification Trigger Button */}
                    <a
                      id={`btn-wa-service-${order.id}`}
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      title="Kirim notifikasi update status ke WhatsApp Pelanggan"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Kirim WA</span>
                    </a>

                    {/* Update Status Button */}
                    {isTechnicianOrAdmin && (
                      <button
                        id={`btn-update-service-${order.id}`}
                        onClick={() => handleOpenStatusModal(order)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Status</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: NEW SERVICE TICKET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="bg-[#0D47A1] text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-200" />
                <span>Formulir Penerimaan Service Masuk</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="Contoh: Bpk. Budi Santoso"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    placeholder="081234567890"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Perangkat (Laptop / PC / Peripheral)
                </label>
                <input
                  type="text"
                  required
                  value={formData.device}
                  onChange={(e) =>
                    setFormData({ ...formData, device: e.target.value })
                  }
                  placeholder="Contoh: Laptop ASUS ROG Strix / PC Rakitan Gaming..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Keluhan / Kerusakan
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.complaint}
                  onChange={(e) =>
                    setFormData({ ...formData, complaint: e.target.value })
                  }
                  placeholder="Jelaskan kendala: layar blank, blue screen, panas berlebih, dll..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Estimasi Biaya Awal (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedCost: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Teknisi Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) =>
                      setFormData({ ...formData, technician: e.target.value })
                    }
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
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
                  <span>Daftarkan Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE SERVICE STATUS */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-[#0D47A1] text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-200" />
                <span>Update Tiket {statusModalOrder.id}</span>
              </h3>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Ubah Status Perbaikan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Diterima', 'Pengecekan', 'Diproses', 'Selesai', 'Diambil'] as ServiceStatus[]).map(
                    (st) => {
                      const isSel = selectedStatus === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedStatus(st)}
                          className={`p-2 rounded-lg text-xs font-bold border transition-all text-left flex items-center gap-1.5 ${
                            isSel
                              ? 'bg-[#E3F2FD] border-[#1E88E5] text-[#0D47A1] shadow-2xs ring-2 ring-[#1E88E5]/30'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              st === 'Selesai'
                                ? 'bg-emerald-500'
                                : st === 'Diproses'
                                ? 'bg-blue-500'
                                : st === 'Pengecekan'
                                ? 'bg-sky-500'
                                : st === 'Diterima'
                                ? 'bg-amber-500'
                                : 'bg-gray-500'
                            }`}
                          />
                          <span>{st}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Diagnosa / Catatan Teknisi
                </label>
                <textarea
                  rows={2}
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  placeholder="Penyebab kerusakan, part yang diganti..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Biaya Akhir / Tagihan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={finalCostInput}
                  onChange={(e) => setFinalCostInput(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="flex-1 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatusModal}
                  className="flex-1 py-2 text-sm font-bold rounded-lg bg-[#1E88E5] hover:bg-[#0D47A1] text-white flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
