import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Inbox, FileText } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Toast from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../api';

export default function AdminDashboard() {
  const [tab, setTab] = useState('pending'); // 'pending' | 'all'
  const [q, setQ] = useState('');
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'
  const [modal, setModal] = useState(null); // { type: 'approve'|'reject'|'delete', id, name?, reason? }
  const [rejectReason, setRejectReason] = useState('');

  const showToast = (message, type = 'success') => {
    setToastType(type);
    setToastMsg(message);
  };
  const dismissToast = () => setToastMsg('');
  const fail = (e) => showToast(e.message || 'Something went wrong', 'error');

  async function loadPending() {
    setLoading(true);
    try { setPending(await api(`/api/companies/pending?search=${encodeURIComponent(q)}`)); }
    catch (e) { fail(e); }
    finally { setLoading(false); }
  }
  async function loadAll() {
    setLoading(true);
    try { setAll(await api(`/api/companies?search=${encodeURIComponent(q)}`)); }
    catch (e) { fail(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { tab === 'pending' ? loadPending() : loadAll(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps -- run when tab changes only
  const onSearch = () => (tab === 'pending' ? loadPending() : loadAll());

  function openApprove(id, name) { setModal({ type: 'approve', id, name }); }
  function openReject(id, name) { setModal({ type: 'reject', id, name }); setRejectReason(''); }
  function openDelete(id, name) { setModal({ type: 'delete', id, name }); }
  function closeModal() { setModal(null); setRejectReason(''); }

  async function confirmApprove() {
    if (!modal?.id) return;
    const id = modal.id;
    closeModal();
    try {
      await api(`/api/companies/${id}/approve`, { method: 'PATCH' });
      setPending(p => p.filter(x => x._id !== id));
      setAll(a => a.map(x => x._id===id ? {...x, status:'approved'} : x));
      showToast('Approved');
    } catch (e) { fail(e); }
  }
  async function confirmReject() {
    if (!modal?.id) return;
    const id = modal.id;
    const reason = rejectReason.trim();
    closeModal();
    try {
      await api(`/api/companies/${id}/reject`, { method: 'PATCH', body: { reason } });
      setPending(p => p.filter(x => x._id !== id));
      setAll(a => a.map(x => x._id===id ? {...x, status:'rejected', rejectionReason: reason} : x));
      showToast('Rejected');
    } catch (e) { fail(e); }
  }
  async function confirmDelete() {
    if (!modal?.id) return;
    const id = modal.id;
    closeModal();
    try {
      await api(`/api/companies/${id}`, { method: 'DELETE' });
      setAll(a => a.filter(x => x._id !== id));
      setPending(p => p.filter(x => x._id !== id));
      showToast('Deleted');
    } catch (e) { fail(e); }
  }

  const pill = (s) =>
    s==='approved' ? 'pill bg-green-100 text-green-700' :
    s==='pending'  ? 'pill bg-yellow-100 text-yellow-700' :
    s==='rejected' ? 'pill bg-red-100 text-red-700' : 'pill';

  const SegTabs = (
    <div className="seg">
      <button type="button" className={`seg-btn focus-ring ${tab==='pending'?'seg-btn-active':'seg-btn-idle'}`} onClick={()=>setTab('pending')}>
        Pending {pending.length ? `(${pending.length})` : ''}
      </button>
      <button type="button" className={`seg-btn focus-ring ${tab==='all'?'seg-btn-active':'seg-btn-idle'}`} onClick={()=>setTab('all')}>
        All
      </button>
    </div>
  );

  const SearchBar = (
    <div className="card p-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" aria-hidden />
          <input
            className="input pl-10"
            placeholder={tab==='pending' ? 'Search pending…' : 'Search all companies…'}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
          />
        </div>
        <button onClick={onSearch} disabled={loading} className="btn-outline focus-ring">
          {loading ? <Spinner size={20} /> : 'Search'}
        </button>
      </div>
    </div>
  );

  const Card = ({ c, showModeration }) => (
    <li className="card p-4 hover:shadow-soft transition">
      <div className="flex items-start justify-between">
        <Link to={`/company/${c._id}`} className="font-semibold text-slate-900 hover:underline">{c.name}</Link>
        <div className="flex items-center gap-2">
          <span className="pill">{c.roundsCount} rounds</span>
          <span className={pill(c.status)}>{c.status}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/company/${c._id}`} className="btn-outline focus-ring">Open</Link>
        {showModeration && (
          <>
            <button onClick={() => openApprove(c._id, c.name)} className="btn-primary focus-ring">Approve</button>
            <button onClick={() => openReject(c._id, c.name)} className="btn-outline focus-ring">Reject</button>
          </>
        )}
        <button onClick={() => openDelete(c._id, c.name)} className="btn-outline focus-ring">Delete</button>
      </div>
    </li>
  );

  return (
    <div className="min-h-screen">
      <Navbar/>
      <Toast message={toastMsg} type={toastType} visible={!!toastMsg} onDismiss={dismissToast} duration={3000} />

      {/* Modals */}
      <Modal open={modal?.type === 'approve'} onClose={closeModal} title="Approve submission">
        <p className="text-slate-600 mb-4">
          Approve &quot;{modal?.name}&quot;? It will be visible to all users.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={closeModal} className="btn-outline focus-ring">Cancel</button>
          <button onClick={confirmApprove} className="btn-primary focus-ring">Approve</button>
        </div>
      </Modal>
      <Modal open={modal?.type === 'reject'} onClose={closeModal} title="Reject submission">
        <p className="text-slate-600 mb-2">Reject &quot;{modal?.name}&quot;?</p>
        <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
        <textarea
          className="input min-h-[80px] mb-4"
          placeholder="Reason for rejection…"
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={closeModal} className="btn-outline focus-ring">Cancel</button>
          <button onClick={confirmReject} className="btn-outline focus-ring text-red-600 border-red-200 hover:bg-red-50">Reject</button>
        </div>
      </Modal>
      <Modal open={modal?.type === 'delete'} onClose={closeModal} title="Delete permanently">
        <p className="text-slate-600 mb-4">
          Delete &quot;{modal?.name}&quot;? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={closeModal} className="btn-outline focus-ring">Cancel</button>
          <button onClick={confirmDelete} className="btn-outline focus-ring text-red-600 border-red-200 hover:bg-red-50">Delete</button>
        </div>
      </Modal>

      <main className="container max-w-7xl px-4 py-8 space-y-6 page-enter">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin</h1>
            <p className="text-slate-600">Approve or reject user submissions.</p>
          </div>
          {SegTabs}
        </header>

        {SearchBar}

        {tab==='pending' ? (
          loading && pending.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="mt-2 h-4 bg-slate-100 rounded w-1/2" />
                  <div className="mt-4 flex gap-2"><div className="h-9 bg-slate-100 rounded w-16" /><div className="h-9 bg-slate-100 rounded w-16" /></div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pending.length === 0 && (
                <li className="col-span-full">
                  <EmptyState icon={Inbox} title="No pending submissions" description="All caught up. New submissions will appear here." />
                </li>
              )}
              {pending.map(c => <Card key={c._id} c={c} showModeration={true} />)}
            </ul>
          )
        ) : (
          loading && all.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="mt-2 h-4 bg-slate-100 rounded w-1/2" />
                  <div className="mt-4 flex gap-2"><div className="h-9 bg-slate-100 rounded w-16" /><div className="h-9 bg-slate-100 rounded w-16" /></div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {all.length === 0 && (
                <li className="col-span-full">
                  <EmptyState icon={FileText} title="Nothing here" description="No companies in the list yet." />
                </li>
              )}
              {all.map(c => <Card key={c._id} c={c} showModeration={c.status==='pending'} />)}
            </ul>
          )
        )}
      </main>
    </div>
  );
}
