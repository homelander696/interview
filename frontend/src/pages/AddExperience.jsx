import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../api';

const STEPS = ['Company', 'Rounds', 'Submit'];

export default function AddExperience() {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => thisYear + 1 - i);

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [rounds, setRounds] = useState([{ title: 'Round 1', notes: '', result: 'pending' }]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateRound = (i, f, v) => setRounds(r => r.map((x, idx) => idx === i ? { ...x, [f]: v } : x));
  const removeRound = (i) => setRounds(r => r.filter((_, idx) => idx !== i));
  const addRound = () => setRounds(r => [...r, { title: `Round ${r.length + 1}`, notes: '', result: 'pending' }]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setLoading(true);
    try {
      await api('/api/companies', { method: 'POST', body: { name, college, year, rounds } });
      setSubmitted(true);
    } catch (e) {
      setErr(e.message || 'Submit failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container max-w-4xl px-4 py-8 page-enter">
          <div className="card p-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Submitted for approval</h2>
            <p className="mt-2 text-slate-600">Admins will review your experience before it goes live.</p>
            <Link to="/dashboard?tab=mine" className="btn-primary mt-6 focus-ring">
              View in Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container max-w-4xl px-4 py-8 space-y-6 page-enter">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Add Company Experience</h1>
          <p className="text-slate-600">Fill details and submit for admin approval.</p>
          {/* Stepper */}
          <div className="mt-4 flex items-center gap-2">
            {STEPS.map((step, i) => (
              <span key={step} className="flex items-center gap-2 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-medium">{i + 1}</span>
                <span className="text-slate-600">{step}</span>
                {i < STEPS.length - 1 && <span className="text-slate-300">→</span>}
              </span>
            ))}
          </div>
        </header>

        <section className="card p-6">
          <form onSubmit={submit} className="space-y-4">
            <input className="input h-12 focus-ring" placeholder="Company name" value={name} onChange={e => setName(e.target.value)} required />

            <div className="grid md:grid-cols-3 gap-3">
              <input className="input focus-ring" placeholder="College name (e.g., IIT Delhi)" value={college} onChange={e => setCollege(e.target.value)} />
              <select className="input focus-ring" value={year} onChange={e => setYear(e.target.value)}>
                <option value="">Year of interview (optional)</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {rounds.map((r, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900">{r.title?.trim() || `Round ${i + 1}`}</div>
                    {rounds.length > 1 && (
                      <button type="button" onClick={() => removeRound(i)} className="text-xs text-red-600 hover:underline focus-ring rounded">Remove</button>
                    )}
                  </div>
                  <div className="mt-3 grid gap-3">
                    <input className="input focus-ring" placeholder="Round title (e.g., Aptitude / Technical / HR)" value={r.title} onChange={e => updateRound(i, 'title', e.target.value)} />
                    <textarea className="input min-h-[200px] focus-ring" placeholder="Notes (questions, difficulty, tips, etc.)" value={r.notes} onChange={e => updateRound(i, 'notes', e.target.value)} />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Status</span>
                        <select className="input w-44 focus-ring" value={r.result} onChange={e => updateRound(i, 'result', e.target.value)}>
                          <option>pending</option><option>pass</option><option>fail</option><option>selected</option>
                        </select>
                      </div>
                      <span className="text-xs text-slate-500">#{i + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn-outline focus-ring" onClick={addRound}>+ Add Round</button>
            </div>

            {msg && <div className="text-sm text-green-600">{msg}</div>}
            {err && <div className="text-sm text-red-600">{err}</div>}
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary focus-ring flex items-center gap-2">
                {loading ? <Spinner size={20} /> : 'Submit for approval'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
