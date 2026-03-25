import { useEffect, useState, useCallback } from 'react';
import { marketplaceService } from '../../services';
import { PageLoader, EmptyState, ConfirmModal, Modal, Badge, Pagination } from '../../components/common';
import { ShoppingBag, Plus, Search, Phone, Trash2, Edit, SlidersHorizontal, X, ArrowUpDown, IndianRupee, UserCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['FURNITURE', 'ELECTRONICS', 'APPLIANCES', 'CLOTHING', 'BOOKS', 'SPORTS', 'MISCELLANEOUS'];
const CATEGORY_ICONS = { FURNITURE: '🛋️', ELECTRONICS: '📱', APPLIANCES: '🏠', CLOTHING: '👕', BOOKS: '📚', SPORTS: '⚽', MISCELLANEOUS: '📦' };

const STATUS_COLORS = { AVAILABLE: 'badge-green', SOLD: 'badge-red', RESERVED: 'badge-yellow' };

function ItemCard({ item, onEdit, onDelete, currentUserId, isAdmin }) {
  const isOwner = item.seller?.id === currentUserId;
  const canModify = isOwner || isAdmin;

  return (
    <div className="glass-card-hover overflow-hidden group">
      {/* Image */}
      <div className="h-44 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center relative overflow-hidden">
        {item.images?.length > 0 ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="text-4xl">{CATEGORY_ICONS[item.category] || '📦'}</div>
        )}
        <div className="absolute top-2 left-2">
          <span className={STATUS_COLORS[item.status] || 'badge-blue'}>{item.status}</span>
        </div>
        {canModify && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg bg-dark-800/80 text-slate-300 hover:text-white"><Edit size={13} /></button>
            <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg bg-dark-800/80 text-red-400 hover:text-red-300"><Trash2 size={13} /></button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 flex-1">{item.title}</h3>
        </div>
        <p className="text-slate-400 text-xs mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-400">₹{Number(item.price).toLocaleString('en-IN')}</span>
          <span className="text-xs text-slate-400">{CATEGORY_ICONS[item.category]} {item.category}</span>
        </div>
        {item.status === 'AVAILABLE' && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white">
              {item.seller?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 truncate">{item.seller?.name}</p>
              <p className="text-slate-500">{item.seller?.flatNumber}</p>
            </div>
            {item.seller?.phone && (
              <a href={`tel:${item.seller.phone}`} className="flex items-center gap-1 text-primary-400 hover:text-primary-300">
                <Phone size={11} /> Call
              </a>
            )}
          </div>
        )}
        {item.aiCategory && item.aiCategory !== item.category && (
          <p className="text-xs text-yellow-400/60 mt-1">✦ AI: {item.aiCategory}</p>
        )}
      </div>
    </div>
  );
}

function ListingForm({ onSubmit, loading, defaultValues }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Title *</label>
        <input {...register('title', { required: 'Required' })} className="input-field" placeholder="Samsung 32 inch TV" />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Description *</label>
        <textarea {...register('description', { required: 'Required' })} className="input-field resize-none" rows={3} placeholder="Describe the item, condition, age..." />
        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Price (₹) *</label>
          <input {...register('price', { required: 'Required', min: 0 })} type="number" className="input-field" placeholder="5000" />
          {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Category</label>
          <select {...register('category')} className="input-field">
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>
        </div>
      </div>
      {defaultValues && (
        <div>
          <label className="block text-sm text-slate-300 mb-1">Status</label>
          <select {...register('status')} className="input-field">
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm text-slate-300 mb-1">Contact Info</label>
        <input {...register('contactInfo')} className="input-field" placeholder="+91-9876543210 or WhatsApp" />
      </div>
      {!defaultValues && (
        <div>
          <label className="block text-sm text-slate-300 mb-1">Images (max 5)</label>
          <input {...register('images')} type="file" accept="image/*" multiple className="input-field file:bg-white/10 file:border-0 file:text-slate-300 file:rounded-lg file:mr-3 file:px-3 file:py-1 file:text-xs" />
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : defaultValues ? 'Update Listing' : 'List Item'}
        </button>
      </div>
    </form>
  );
}

export default function MarketplacePage() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('AVAILABLE');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatusFilter('AVAILABLE');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setMineOnly(false);
    setPage(1);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.getAll({
        page,
        limit: 12,
        search: search || undefined,
        category: category || undefined,
        status: statusFilter || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sortBy,
        mine: mineOnly || undefined,
      });
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load marketplace'); }
    finally { setLoading(false); }
  }, [page, search, category, statusFilter, minPrice, maxPrice, sortBy, mineOnly]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (k !== 'images') formData.append(k, v); });
      if (data.images?.[0]) {
        Array.from(data.images).forEach((f) => formData.append('images', f));
      }
      const res = await marketplaceService.create(formData);
      const message = res.data?.warning || res.data?.message || 'Item listed!';
      toast.success(message);
      setShowCreate(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to list item'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (data) => {
    setSubmitting(true);
    try {
      await marketplaceService.update(editItem.id, data);
      toast.success('Listing updated!');
      setEditItem(null);
      load();
    } catch { toast.error('Failed to update'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await marketplaceService.delete(deleteItem.id);
      toast.success('Listing removed');
      setDeleteItem(null);
      load();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-slate-400 text-sm mt-1">Buy & sell within your society</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="btn-secondary sm:hidden flex-1"
          >
            {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />} Filters
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> List Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`glass-card p-4 space-y-3 ${showFilters ? 'block' : 'hidden sm:block'}`}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" placeholder="Search items..." />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <label className="relative">
            <IndianRupee size={14} className="absolute left-3 top-3.5 text-slate-500" />
            <input
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              type="number"
              min="0"
              className="input-field pl-8"
              placeholder="Min price"
            />
          </label>
          <label className="relative">
            <IndianRupee size={14} className="absolute left-3 top-3.5 text-slate-500" />
            <input
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              type="number"
              min="0"
              className="input-field pl-8"
              placeholder="Max price"
            />
          </label>
          <label className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="input-field pl-8"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => { setMineOnly((prev) => !prev); setPage(1); }}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors border flex items-center justify-center gap-2 ${mineOnly ? 'bg-primary-600/25 border-primary-500/50 text-primary-200' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
          >
            <UserCircle2 size={16} /> My listings
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
          <button onClick={() => { setCategory(''); setPage(1); }} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${category === '' ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            All
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); }} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${category === c ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {CATEGORY_ICONS[c]} {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
          {['AVAILABLE', 'RESERVED', 'SOLD', ''].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {s || 'All Status'}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
            Reset filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{pagination.total || 0} items found</p>
      </div>

      {loading ? <PageLoader /> : items.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No items found" description="Be the first to list an item in your society marketplace!" action={<button onClick={() => setShowCreate(true)} className="btn-primary">List an Item</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} currentUserId={user?.id} isAdmin={isAdmin} onEdit={setEditItem} onDelete={setDeleteItem} />
          ))}
        </div>
      )}

      <Pagination page={page} pages={pagination.pages} onPage={setPage} />

      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-4 z-40 sm:hidden w-12 h-12 rounded-full bg-primary-600 shadow-[0_0_28px_rgba(34,197,94,0.45)] text-white flex items-center justify-center"
        aria-label="List new item"
      >
        <Plus size={20} />
      </button>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="List an Item" size="md">
        <ListingForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Listing" size="md">
        {editItem && <ListingForm onSubmit={handleEdit} loading={submitting} defaultValues={editItem} />}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteItem}
        title="Remove Listing"
        message={`Remove "${deleteItem?.title}" from marketplace?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
        loading={deleting}
      />
    </div>
  );
}
