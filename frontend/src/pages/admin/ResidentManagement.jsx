import { useEffect, useState, useCallback } from 'react';
import { residentService } from '../../services';
import { PageLoader, EmptyState, ConfirmModal, Modal, Badge, Pagination } from '../../components/common';
import { Users, Plus, Search, Edit, Trash2, Eye, Phone, Home, Car } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function ResidentForm({ onSubmit, loading, defaultValues }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Full Name *</label>
          <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Rahul Sharma" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Flat Number *</label>
          <input {...register('flatNumber', { required: 'Required' })} className="input-field" placeholder="B-101" />
          {errors.flatNumber && <p className="text-red-400 text-xs mt-1">{errors.flatNumber.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Email *</label>
        <input {...register('email', { required: 'Required' })} type="email" className="input-field" placeholder="resident@example.com" />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Phone</label>
        <input {...register('phone')} className="input-field" placeholder="+91-9876543210" />
      </div>
      {!defaultValues && (
        <div>
          <label className="block text-sm text-slate-300 mb-1">Password</label>
          <input {...register('password')} type="password" className="input-field" placeholder="Default: Resident@123" />
        </div>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : defaultValues ? 'Update Resident' : 'Add Resident'}
        </button>
      </div>
    </form>
  );
}

function ResidentMobileCard({ resident, onView, onEdit, onDelete }) {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-600 shadow-[0_0_18px_rgba(56,189,248,0.35)] flex items-center justify-center font-bold text-sm">
            {resident.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{resident.name}</p>
            <p className="text-slate-400 text-xs truncate">{resident.email}</p>
          </div>
        </div>
        <span className={resident.isActive ? 'badge-green' : 'badge-red'}>{resident.isActive ? 'Active' : 'Inactive'}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/5 rounded-xl p-2.5">
          <p className="text-slate-500">Flat</p>
          <p className="text-slate-200 mt-1 flex items-center gap-1"><Home size={12} /> {resident.flatNumber || '—'}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5">
          <p className="text-slate-500">Vehicles</p>
          <p className="text-slate-200 mt-1 flex items-center gap-1"><Car size={12} /> {resident.vehicles?.length || 0}</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 flex items-center gap-1"><Phone size={12} className="text-slate-500" /> {resident.phone || 'No phone added'}</p>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onView(resident)} className="btn-secondary text-xs px-2 py-2">
          <Eye size={14} /> View
        </button>
        <button onClick={() => onEdit(resident)} className="btn-secondary text-xs px-2 py-2 text-cyan-300 border-cyan-500/30">
          <Edit size={14} /> Edit
        </button>
        <button onClick={() => onDelete(resident)} className="btn-danger text-xs px-2 py-2">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

export default function ResidentManagement() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [editResident, setEditResident] = useState(null);
  const [viewResident, setViewResident] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await residentService.getAll({ page, limit: 10, search });
      setResidents(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load residents'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (data) => {
    setSubmitting(true);
    try {
      await residentService.create(data);
      toast.success('Resident added!');
      setShowAdd(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (data) => {
    setSubmitting(true);
    try {
      await residentService.update(editResident.id, data);
      toast.success('Resident updated!');
      setEditResident(null);
      load();
    } catch { toast.error('Failed to update'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await residentService.delete(deleteTarget.id);
      toast.success('Resident removed');
      setDeleteTarget(null);
      load();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Residents</h1>
          <p className="text-slate-400 text-sm mt-1">{pagination.total || 0} residents registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> Add Resident
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
            placeholder="Search by name, email, or flat number..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? <PageLoader /> : residents.length === 0 ? (
          <EmptyState icon={Users} title="No residents found" description="Add the first resident to get started." />
        ) : (
          <>
            <div className="grid gap-3 p-3 sm:p-4 md:hidden">
              {residents.map((resident) => (
                <ResidentMobileCard
                  key={resident.id}
                  resident={resident}
                  onView={setViewResident}
                  onEdit={setEditResident}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="table-header px-6 py-4 text-left">Resident</th>
                    <th className="table-header px-6 py-4 text-left">Flat</th>
                    <th className="table-header px-6 py-4 text-left">Contact</th>
                    <th className="table-header px-6 py-4 text-left">Vehicles</th>
                    <th className="table-header px-6 py-4 text-left">Status</th>
                    <th className="table-header px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map((r) => (
                    <tr key={r.id} className="table-row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-600 shadow-[0_0_16px_rgba(56,189,248,0.35)] flex items-center justify-center font-bold text-sm">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{r.name}</p>
                            <p className="text-slate-400 text-xs">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-sm text-slate-300">
                          <Home size={14} className="text-slate-400" /> {r.flatNumber || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-sm text-slate-300">
                          <Phone size={14} className="text-slate-400" /> {r.phone || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-sm text-slate-300">
                          <Car size={14} className="text-slate-400" /> {r.vehicles?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={r.isActive ? 'badge-green' : 'badge-red'}>{r.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewResident(r)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => setEditResident(r)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-primary-300 transition-colors">
                            <Edit size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Pagination page={page} pages={pagination.pages} onPage={setPage} />

      {/* Modals */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Resident">
        <ResidentForm onSubmit={handleAdd} loading={submitting} />
      </Modal>

      <Modal isOpen={!!editResident} onClose={() => setEditResident(null)} title="Edit Resident">
        {editResident && <ResidentForm onSubmit={handleEdit} loading={submitting} defaultValues={editResident} />}
      </Modal>

      <Modal isOpen={!!viewResident} onClose={() => setViewResident(null)} title="Resident Details">
        {viewResident && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 shadow-[0_0_24px_rgba(56,189,248,0.35)] flex items-center justify-center text-2xl font-bold">
                {viewResident.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{viewResident.name}</h3>
                <p className="text-slate-400">{viewResident.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['Flat', viewResident.flatNumber], ['Phone', viewResident.phone], ['Status', viewResident.isActive ? 'Active' : 'Inactive'], ['Vehicles', viewResident.vehicles?.length || 0]].map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="text-sm font-medium text-white mt-1">{v || '—'}</p>
                </div>
              ))}
            </div>
            {viewResident.vehicles?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Registered Vehicles</h4>
                {viewResident.vehicles.map((v) => (
                  <div key={v.id} className="bg-white/5 rounded-xl p-3 mb-2">
                    <p className="text-white text-sm">{v.licensePlate} — {v.vehicleType}</p>
                    {v.brand && <p className="text-xs text-slate-400">{v.brand} {v.model} · {v.color}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Remove Resident"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
