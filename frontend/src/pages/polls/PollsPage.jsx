 import { useEffect, useState, useCallback } from 'react';
import { pollService } from '../../services';
import { PageLoader, EmptyState, ConfirmModal, Modal, Badge, Pagination } from '../../components/common';
import { Vote, Plus, Lock, Trash2, ChevronDown, ChevronUp, Users, Clock } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function CreatePollForm({ onSubmit, loading }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', options: [{ text: '' }, { text: '' }], expiresAt: '' },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
 
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Poll Question *</label>
        <input {...register('title', { required: 'Required' })} className="input-field" placeholder="Should we install CCTV in the lobby?" />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Description (optional)</label>
        <textarea {...register('description')} className="input-field resize-none" rows={2} placeholder="Additional context..." />
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-2">Options *</label>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`options.${i}.text`, { required: 'Required' })} className="input-field" placeholder={`Option ${i + 1}`} />
              {fields.length > 2 && (
                <button type="button" onClick={() => remove(i)} className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30">✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => append({ text: '' })} className="btn-secondary text-sm mt-2">
          + Add Option
        </button>
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Expiry Date (optional)</label>
        <input {...register('expiresAt')} type="datetime-local" className="input-field" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
    </form>
  );
}

function PollCard({ poll, isAdmin, onVote, onClose, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const totalVotes = poll._count?.votes || 0;
  const hasVoted = !!poll.userVotedOptionId;
  const canVote = poll.status === 'ACTIVE' && !hasVoted;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge status={poll.status} />
            {poll.expiresAt && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} /> {new Date(poll.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold">{poll.title}</h3>
          {poll.description && <p className="text-slate-400 text-sm mt-1">{poll.description}</p>}
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Users size={11} /> {totalVotes} vote{totalVotes !== 1 ? 's' : ''} · By {poll.creator?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && poll.status === 'ACTIVE' && (
            <button onClick={() => onClose(poll)} className="p-2 rounded-lg hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400 transition-colors" title="Close Poll">
              <Lock size={15} />
            </button>
          )}
          {isAdmin && (
            <button onClick={() => onDelete(poll)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          {poll.options.map((option) => {
            const count = option._count?.votes || 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = poll.userVotedOptionId === option.id;

            return (
              <div key={option.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => canVote && onVote(poll.id, option.id)}
                    disabled={!canVote}
                    className={`flex-1 text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      isSelected ? 'text-primary-300 font-medium' :
                      canVote ? 'text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer' :
                      'text-slate-400 cursor-default'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}{option.text}
                  </button>
                  <span className="text-xs text-slate-400 ml-2 w-10 text-right">{pct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-primary-500' : 'bg-white/20'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {poll.aiSummary && (
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3">
          <p className="text-xs text-primary-300 font-medium mb-1">✦ AI Summary</p>
          <p className="text-xs text-slate-300">{poll.aiSummary}</p>
        </div>
      )}
    </div>
  );
}

export default function PollsPage() {
  const { user, isAdmin } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmClose, setConfirmClose] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pollService.getAll({ status: filter || undefined, page, limit: 10 });
      setPolls(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load polls'); }
    finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data, options: data.options.map((o) => o.text) };
      await pollService.create(payload);
      toast.success('Poll created!');
      setShowCreate(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
    finally { setSubmitting(false); }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await pollService.vote(pollId, optionId);
      toast.success('Vote cast!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to vote'); }
  };

  const handleClose = async () => {
    setActionLoading(true);
    try {
      await pollService.close(confirmClose.id);
      toast.success('Poll closed with AI summary generated!');
      setConfirmClose(null);
      load();
    } catch { toast.error('Failed to close poll'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await pollService.delete(confirmDelete.id);
      toast.success('Poll deleted');
      setConfirmDelete(null);
      load();
    } catch { toast.error('Failed to delete'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Community Polls</h1>
          <p className="page-subtitle">Participate in society decisions</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary w-full sm:w-auto">
            <Plus size={16} /> Create Poll
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="glass-card p-2.5">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
          {['', 'ACTIVE', 'CLOSED', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <PageLoader /> : polls.length === 0 ? (
        <EmptyState icon={Vote} title="No polls found" description="No community polls at the moment." />
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              isAdmin={isAdmin}
              onVote={handleVote}
              onClose={setConfirmClose}
              onDelete={setConfirmDelete}
            />
          ))}
        </div>
      )}

      <Pagination page={page} pages={pagination.pages} onPage={setPage} />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Poll">
        <CreatePollForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <ConfirmModal
        isOpen={!!confirmClose}
        title="Close Poll"
        message={`Close "${confirmClose?.title}"? An AI summary will be generated.`}
        onConfirm={handleClose}
        onCancel={() => setConfirmClose(null)}
        loading={actionLoading}
        danger={false}
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Poll"
        message={`Delete "${confirmDelete?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={actionLoading}
      />
    </div>
  );
}
