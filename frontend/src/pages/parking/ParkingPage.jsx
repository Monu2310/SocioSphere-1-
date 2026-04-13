import { useEffect, useState, useCallback } from 'react';
import { parkingService, residentService } from '../../services';
import { PageLoader, EmptyState, ConfirmModal, Modal, Badge, StatCard } from '../../components/common';
import { Car, Plus, Users, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function SlotGrid({ slots, isAdmin, onAssign, onRelease }) {
  const getSlotColor = (slot) => {
    if (slot.status === 'OCCUPIED') return 'bg-red-500/20 border-red-500/30';
    if (slot.slotType === 'VISITOR') return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-cyan-500/10 border-cyan-500/20';
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
      {slots.map((slot) => {
        const assignment = slot.assignments?.[0];
        return (
          <div
            key={slot.id}
            className={`relative group rounded-xl border p-2 text-center cursor-pointer transition-all hover:scale-105 ${getSlotColor(slot)}`}
            onClick={() => isAdmin && (slot.status === 'AVAILABLE' ? onAssign(slot) : onRelease(slot))}
            title={assignment ? `${assignment.user?.name} (${assignment.user?.flatNumber})` : slot.slotNumber}
          >
            <Car size={14} className={`mx-auto mb-1 ${slot.status === 'OCCUPIED' ? 'text-red-400' : slot.slotType === 'VISITOR' ? 'text-yellow-400' : 'text-cyan-300'}`} />
            <p className={`text-xs font-mono ${slot.status === 'OCCUPIED' ? 'text-red-300' : 'text-slate-300'}`}>{slot.slotNumber}</p>
            {isAdmin && slot.status === 'OCCUPIED' && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/60 rounded-xl flex items-center justify-center transition-opacity">
                <X size={16} className="text-red-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SlotListMobile({ slots, isAdmin, onAssign, onRelease }) {
  return (
    <div className="space-y-2 sm:hidden">
      {slots.map((slot) => {
        const assignment = slot.assignments?.[0];
        const isOccupied = slot.status === 'OCCUPIED';
        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => isAdmin && (isOccupied ? onRelease(slot) : onAssign(slot))}
            className="w-full glass-card p-3 text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold text-sm">{slot.slotNumber}</p>
                <p className="text-xs text-slate-400 mt-0.5">{slot.floor ? `Floor ${slot.floor}` : 'Floor -'} {slot.block ? `· Block ${slot.block}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={slot.status} />
                <Badge status={slot.slotType} />
              </div>
            </div>
            {assignment && (
              <p className="text-xs text-slate-300 mt-2">Assigned to {assignment.user?.name} ({assignment.user?.flatNumber})</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function ParkingPage() {
  const { isAdmin, user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [residents, setResidents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [assignSlot, setAssignSlot] = useState(null);
  const [releaseSlot, setReleaseSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const { register: reg2, handleSubmit: sub2, reset: reset2 } = useForm();
  const { register: reg3, handleSubmit: sub3, reset: reset3 } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const [slotsRes, statsRes] = await Promise.all([
        parkingService.getAll(params),
        parkingService.getStats(),
      ]);
      setSlots(slotsRes.data.data);
      setStats(statsRes.data.data);
    } catch { toast.error('Failed to load parking data'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (isAdmin) {
      residentService.getAll({ limit: 100 }).then((res) => setResidents(res.data.data)).catch(() => {});
    }
  }, [isAdmin]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await parkingService.createSlot(data);
      toast.success('Slot created!');
      setShowCreate(false); reset();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleBulk = async (data) => {
    setSubmitting(true);
    try {
      await parkingService.createBulk({ ...data, count: parseInt(data.count) });
      toast.success('Slots created!');
      setShowBulk(false); reset2();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleAssign = async (data) => {
    setSubmitting(true);
    try {
      await parkingService.assignSlot(assignSlot.id, data);
      toast.success('Slot assigned!');
      setAssignSlot(null); reset3();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleRelease = async () => {
    setSubmitting(true);
    try {
      await parkingService.releaseSlot(releaseSlot.id);
      toast.success('Slot released!');
      setReleaseSlot(null);
      load();
    } catch { toast.error('Failed to release'); }
    finally { setSubmitting(false); }
  };

  // Resident view: show own assignments
  const myAssignments = !isAdmin ? slots.filter((s) => s.assignments?.some((a) => a.userId === user?.id && a.isActive)) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Parking Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage society parking spaces</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setShowCreate(true)} className="btn-secondary text-sm flex-1 sm:flex-none"><Plus size={15} /> New Slot</button>
            <button onClick={() => setShowBulk(true)} className="btn-primary text-sm flex-1 sm:flex-none"><Plus size={15} /> Bulk Create</button>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Car} label="Total Slots" value={stats.total} color="blue" />
          <StatCard icon={Check} label="Occupied" value={stats.occupied} sub={`${stats.utilizationRate}% utilized`} color="red" />
          <StatCard icon={Car} label="Available" value={stats.available} color="green" />
          <StatCard icon={Users} label="Visitor Slots" value={stats.visitor?.total || 0} sub={`${stats.visitor?.available || 0} available`} color="purple" />
        </div>
      )}

      {/* Filter */}
      <div className="glass-card p-2.5">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
        {[['', 'All'], ['AVAILABLE', 'Available'], ['OCCUPIED', 'Occupied']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === val ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {label}
          </button>
        ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-500/50"></span>Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/40 border border-red-500/50"></span>Occupied</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/40"></span>Visitor</span>
        {isAdmin && <span className="text-slate-500">· Click available = assign · Click occupied = release</span>}
      </div>

      {/* Slot Grid */}
      <div className="glass-card p-6">
        {loading ? <PageLoader /> : slots.length === 0 ? (
          <EmptyState icon={Car} title="No parking slots" description={isAdmin ? "Create parking slots to get started." : "No parking slots configured."} />
        ) : (
          <>
            <SlotListMobile slots={slots} isAdmin={isAdmin} onAssign={setAssignSlot} onRelease={setReleaseSlot} />
            <div className="hidden sm:block">
              <SlotGrid slots={slots} isAdmin={isAdmin} onAssign={setAssignSlot} onRelease={setReleaseSlot} />
            </div>
          </>
        )}
      </div>

      {/* Resident: My Parking */}
      {!isAdmin && myAssignments.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">My Assigned Slots</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {myAssignments.map((slot) => (
              <div key={slot.id} className="bg-white/5 rounded-xl p-4">
                <p className="text-white font-medium">{slot.slotNumber}</p>
                <p className="text-sm text-slate-400">{slot.floor && `Floor ${slot.floor}`} {slot.block && `· Block ${slot.block}`}</p>
                <Badge status={slot.slotType} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Parking Slot" size="sm">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <input {...register('slotNumber', { required: true })} className="input-field" placeholder="Slot number (e.g. P-001)" />
          <select {...register('slotType')} className="input-field">
            <option value="RESIDENT">Resident</option>
            <option value="VISITOR">Visitor</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input {...register('floor')} className="input-field" placeholder="Floor (e.g. B1)" />
            <input {...register('block')} className="input-field" placeholder="Block (e.g. A)" />
          </div>
          <div className="flex justify-end"><button type="submit" disabled={submitting} className="btn-primary">Create</button></div>
        </form>
      </Modal>

      <Modal isOpen={showBulk} onClose={() => setShowBulk(false)} title="Bulk Create Slots" size="sm">
        <form onSubmit={sub2(handleBulk)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-slate-400 mb-1">Prefix</label><input {...reg2('prefix', { required: true })} className="input-field" placeholder="P-" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Count (max 200)</label><input {...reg2('count', { required: true })} type="number" min="1" max="200" className="input-field" placeholder="20" /></div>
          </div>
          <select {...reg2('slotType')} className="input-field">
            <option value="RESIDENT">Resident</option>
            <option value="VISITOR">Visitor</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input {...reg2('floor')} className="input-field" placeholder="Floor" />
            <input {...reg2('block')} className="input-field" placeholder="Block" />
          </div>
          <div className="flex justify-end"><button type="submit" disabled={submitting} className="btn-primary">Create All</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!assignSlot} onClose={() => setAssignSlot(null)} title={`Assign Slot ${assignSlot?.slotNumber}`} size="sm">
        <form onSubmit={sub3(handleAssign)} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Resident *</label>
            <select {...reg3('userId', { required: true })} className="input-field">
              <option value="">Select resident...</option>
              {residents.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.flatNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Expiry (optional)</label>
            <input {...reg3('expiresAt')} type="datetime-local" className="input-field" />
          </div>
          <div className="flex justify-end"><button type="submit" disabled={submitting} className="btn-primary">Assign</button></div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!releaseSlot}
        title="Release Slot"
        message={`Release slot ${releaseSlot?.slotNumber}? The resident will lose their parking spot.`}
        onConfirm={handleRelease}
        onCancel={() => setReleaseSlot(null)}
        loading={submitting}
      />
    </div>
  );
}
