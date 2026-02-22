import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Inbox, FileQuestion } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api } from '../api';
import { authStore } from '../auth';

export default function UserDashboard(){
  const u = authStore.user;
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState('browse'); // 'browse' | 'mine'
  const [qBrowse, setQBrowse] = useState('');
  const [qMine, setQMine] = useState('');
  const [browse, setBrowse] = useState([]);  // approved only
  const [mine, setMine] = useState([]);      // my submissions (any status)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get('tab');
    setTab(t === 'mine' ? 'mine' : 'browse');
  }, [searchParams]);

  useEffect(() => { loadBrowse(); loadMine(); }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial load only

  const loadBrowse = useCallback(async () => {
    setLoading(true);
    try { setBrowse(await api(`/api/companies?search=${encodeURIComponent(qBrowse)}`)); }
    catch { setBrowse([]); }
    finally { setLoading(false); }
  }, [qBrowse]);
  const loadMine = useCallback(async () => {
    setLoading(true);
    try { setMine(await api(`/api/companies/mine?search=${encodeURIComponent(qMine)}`)); }
    catch { setMine([]); }
    finally { setLoading(false); }
  }, [qMine]);
  const onBrowseKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); loadBrowse(); } };
  const onMineKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); loadMine(); } };

  const pill = (s) =>
    s==='approved' ? 'pill bg-green-100 text-green-700' :
    s==='pending'  ? 'pill bg-yellow-100 text-yellow-700' :
    s==='rejected' ? 'pill bg-red-100 text-red-700' : 'pill';

  const roundsPreview = (c) => Array.isArray(c.rounds) ? c.rounds.slice(0,2) : [];

  const borderAccent = (status) => {
    if (status === 'approved') return 'border-l-4 border-l-green-500';
    if (status === 'pending') return 'border-l-4 border-l-yellow-500';
    if (status === 'rejected') return 'border-l-4 border-l-red-500';
    return '';
  };

  const CompanyCard = ({ c, showStatus=false }) => {
    const last = Array.isArray(c.rounds) && c.rounds.length ? c.rounds[c.rounds.length - 1] : null;
    const lastLabel = (last?.result || 'pending');

    return (
      <li className="group relative">
        <div className={`relative card-toned card-toned-hover p-6 md:p-7 min-h-[140px] cursor-pointer ${showStatus ? borderAccent(c.status) : ''}`}>
          <Link to={`/company/${c._id}`} aria-label={`Open ${c.name}`} className="absolute inset-0 z-10 rounded-2xl" />

          <div className="flex items-start justify-between">
            <div className="font-semibold text-[17px] text-slate-900">{c.name}</div>
            <div className="flex items-center gap-2">
              <span className="pill">{c.roundsCount} rounds</span>
              {showStatus && <span className={pill(c.status)}>{c.status}</span>}
            </div>
          </div>

          {/* Year • College meta */}
          <div className="mt-2 text-xs text-slate-500">
            {(c.year ? `${c.year}` : '')}{c.year && c.college ? ' • ' : ''}{c.college || ''}
          </div>

          <div className="mt-4">
            <span className={`pill ${
              lastLabel==='selected' ? 'bg-emerald-100 text-emerald-700' :
              lastLabel==='pass'     ? 'bg-green-100 text-green-700'   :
              lastLabel==='fail'     ? 'bg-red-100 text-red-700'       :
                                       'bg-yellow-100 text-yellow-700'
            }`}>
              {lastLabel === 'selected' ? 'Selected' : lastLabel}
            </span>
          </div>
        </div>

        {/* Hover preview above card */}
        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition pointer-events-none pop-panel-top">
          <div className="pop-card">
            <div className="text-sm text-slate-500 mb-2">Round preview</div>
            {(!c.rounds || c.rounds.length===0) ? (
              <div className="text-slate-500 text-sm">No details yet.</div>
            ) : (
              <ul className="space-y-2">
                {roundsPreview(c).map((r, i) => (
                  <li key={i} className="grid md:grid-cols-12 gap-2 items-start">
                    <div className="md:col-span-3 font-medium text-slate-900">
                      {r?.title?.trim() || `Round ${i+1}`}
                    </div>
                    <div className="md:col-span-8 text-slate-600">
                      {(r.notes || '').slice(0,140) || '—'}{r.notes && r.notes.length>140 ? '…' : ''}
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <span className={pill(r.result || 'pending')}>{r.result || 'pending'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar/>

      <main className="container max-w-7xl px-4 py-8 space-y-8">
        {/* ✨ New copy */}
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Interview Experiences</h1>
          <p className="text-slate-600">
            Welcome {u?.name || ''}. Explore verified interview experiences from students and alumni, or track your own submissions.
          </p>
        </header>

        {/* Explore (approved) */}
        {tab==='browse' && (
          <section className="space-y-4 page-enter">
            <div className="card p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" aria-hidden />
                  <input
                    className="input pl-10"
                    placeholder="Search approved interview experiences (e.g., TCS, SDE-1, 2024)"
                    value={qBrowse}
                    onChange={e=>setQBrowse(e.target.value)}
                    onKeyDown={onBrowseKeyDown}
                  />
                </div>
                <button onClick={loadBrowse} disabled={loading} className="btn-outline focus-ring">
                  {loading ? <Spinner size={20} /> : 'Search'}
                </button>
              </div>
            </div>

            {loading && browse.length === 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="card-toned p-6 rounded-2xl animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                    <div className="mt-2 h-4 bg-slate-100 rounded w-1/2" />
                    <div className="mt-4 h-6 bg-slate-100 rounded-full w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {browse.length === 0 && (
                  <li className="col-span-full">
                    <EmptyState
                      icon={FileQuestion}
                      title="No approved experiences yet"
                      description="Try another search or check back soon. Approved submissions from the community will appear here."
                    />
                  </li>
                )}
                {browse.map(c => <CompanyCard key={c._id} c={c} showStatus={false} />)}
              </ul>
            )}
          </section>
        )}

        {/* My Submissions */}
        {tab==='mine' && (
          <section className="space-y-4 page-enter">
            <div className="card p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" aria-hidden />
                  <input
                    className="input pl-10"
                    placeholder="Search your submissions (company, role, year…)"
                    value={qMine}
                    onChange={e=>setQMine(e.target.value)}
                    onKeyDown={onMineKeyDown}
                  />
                </div>
                <button onClick={loadMine} disabled={loading} className="btn-outline focus-ring">
                  {loading ? <Spinner size={20} /> : 'Filter'}
                </button>
              </div>
            </div>

            {loading && mine.length === 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="card-toned p-6 rounded-2xl animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                    <div className="mt-2 h-4 bg-slate-100 rounded w-1/2" />
                    <div className="mt-4 h-6 bg-slate-100 rounded-full w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mine.length === 0 && (
                  <li className="col-span-full">
                    <EmptyState
                      icon={Inbox}
                      title="No submissions yet"
                      description="You haven’t shared an experience yet. Add one and admins will review it before it goes live."
                      ctaLabel="Add Experience"
                      ctaTo="/add-experience"
                    />
                  </li>
                )}
                {mine.map(c => <CompanyCard key={c._id} c={c} showStatus={true} />)}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
