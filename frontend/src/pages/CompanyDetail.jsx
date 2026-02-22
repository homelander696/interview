// src/pages/CompanyDetail.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../api';

export default function CompanyDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionsError, setQuestionsError] = useState('');
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);

  useEffect(() => {
    (async () => {
      try { setC(await api(`/api/companies/${id}`)); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const total = c?.rounds?.length || 0;
  const last = total ? c.rounds[total - 1] : null;
  const finalLabel = (last?.result || 'pending');

  const finalPill = useMemo(() => {
    const base = 'pill';
    if (finalLabel === 'selected') return `${base} bg-emerald-100 text-emerald-700`;
    if (finalLabel === 'pass')     return `${base} bg-green-100 text-green-700`;
    if (finalLabel === 'fail')     return `${base} bg-red-100 text-red-700`;
    return `${base} bg-yellow-100 text-yellow-700`;
  }, [finalLabel]);

  const pill = (s) =>
    s==='pass'     ? 'pill bg-green-100 text-green-700' :
    s==='selected' ? 'pill bg-emerald-100 text-emerald-700' :
    s==='fail'     ? 'pill bg-red-100 text-red-700' :
                     'pill bg-yellow-100 text-yellow-700';

  const fetchSummary = async () => {
    setSummaryError('');
    setSummaryLoading(true);
    setShowSummaryModal(true);
    try {
      const data = await api(`/api/companies/${id}/summarize`);
      setSummary(data.summary || '');
    } catch (e) {
      setSummaryError(e.message || 'Summary unavailable');
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchSuggestQuestions = async () => {
    setQuestionsError('');
    setQuestionsLoading(true);
    setShowQuestionsModal(true);
    try {
      const data = await api(`/api/companies/${id}/suggest-questions`);
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
    } catch (e) {
      setQuestionsError(e.message || 'Suggestions unavailable');
    } finally {
      setQuestionsLoading(false);
    }
  };

  // URLs → clickable
  const linkify = (txt='') =>
    txt.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
      /^https?:\/\//.test(part)
        ? <a key={i} href={part} target="_blank" rel="noreferrer" className="underline text-brand-600 break-words">{part}</a>
        : <span key={i}>{part}</span>
    );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="section flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size={32} />
            <span className="text-slate-600">Loading…</span>
          </div>
        </main>
      </div>
    );
  }
  if (!c) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="section">
          <div className="card p-8 text-center">
            <p className="text-slate-600">Not found.</p>
            <Link to="/dashboard" className="btn-outline mt-4 focus-ring inline-flex">Back to dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container max-w-6xl px-4 py-8 space-y-6 page-enter">
        {/* Breadcrumb */}
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 focus-ring rounded inline-flex items-center gap-1">
          ← Back to dashboard
        </Link>

        {/* Hero header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{c.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-slate-600">
              <span className="pill">{total} total rounds</span>
              {c.year && <span className="pill">Year: {c.year}</span>}
              {c.college && <span className="pill">College: {c.college}</span>}
              <span className={finalPill}>
                {finalLabel === 'selected' ? 'Final: Selected' : `Final: ${finalLabel}`}
              </span>
              {c.status !== 'approved' && <span className="pill bg-yellow-100 text-yellow-700">{c.status}</span>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fetchSummary}
                disabled={summaryLoading}
                className="btn-primary focus-ring flex items-center gap-2"
              >
                {summaryLoading ? <Spinner size={18} /> : null}
                Summarize
              </button>
              <button
                type="button"
                onClick={fetchSuggestQuestions}
                disabled={questionsLoading}
                className="btn-outline focus-ring flex items-center gap-2"
              >
                {questionsLoading ? <Spinner size={18} /> : null}
                Suggest questions
              </button>
            </div>
          </div>
        </div>

        {/* Summary modal */}
        <Modal open={showSummaryModal} onClose={() => setShowSummaryModal(false)} title="Summary">
          {summaryLoading ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Spinner size={24} />
              <span className="text-slate-600">Generating summary…</span>
            </div>
          ) : summaryError ? (
            <p className="text-red-600">{summaryError}</p>
          ) : (
            <div className="whitespace-pre-line text-slate-700">{summary}</div>
          )}
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={() => setShowSummaryModal(false)} className="btn-outline focus-ring">
              Close
            </button>
          </div>
        </Modal>

        {/* Suggest questions modal */}
        <Modal open={showQuestionsModal} onClose={() => setShowQuestionsModal(false)} title="Top 10 questions to prepare">
          {questionsLoading ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Spinner size={24} />
              <span className="text-slate-600">Generating questions…</span>
            </div>
          ) : questionsError ? (
            <p className="text-red-600">{questionsError}</p>
          ) : questions.length > 0 ? (
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
              {questions.map((q, i) => (
                <li key={i} className="pl-1">{q}</li>
              ))}
            </ol>
          ) : null}
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={() => setShowQuestionsModal(false)} className="btn-outline focus-ring">
              Close
            </button>
          </div>
        </Modal>

        {/* Quick jump */}
        {total > 1 && (
          <div className="card p-4">
            <div className="text-sm text-slate-600 mb-2">Jump to round</div>
            <div className="flex flex-wrap gap-2">
              {c.rounds.map((_, i) => (
                <a key={i} href={`#round-${i+1}`} className="pill hover:bg-slate-200">#{i+1}</a>
              ))}
            </div>
          </div>
        )}

        {/* Rounds timeline */}
        <section className="card-toned p-6 md:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Rounds</h2>

          <ul className="mt-6">
            {c.rounds?.map((r, i) => {
              const totalR = c.rounds.length;
              const isLast = i === totalR - 1;
              const titleText = (r?.title && r.title.trim()) || `Round ${i+1}`;

              return (
                <li key={i} id={`round-${i+1}`} className="relative pl-10">
                  {/* timeline rail & dot */}
                  {!isLast && <span className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-brand-200" />}
                  <span className="absolute left-0 top-5 h-5 w-5 rounded-full bg-brand-500 ring-4 ring-white shadow-soft" />

                  <div className="grid md:grid-cols-12 gap-6 items-start pt-2">
                    <div className="md:col-span-4">
                      <div className="text-slate-900 font-semibold">{titleText}</div>
                      <div className="text-xs text-slate-500 mt-1">#{i+1}</div>
                    </div>

                    {/* Notes & status */}
                    <div className="md:col-span-8">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[15px] leading-7 text-slate-700 whitespace-pre-line break-words">
                          {r?.notes ? linkify(r.notes) : '—'}
                        </div>
                        <span className={pill(r?.result || 'pending')}>{r?.result || 'pending'}</span>
                      </div>
                    </div>
                  </div>

                  {!isLast && <div className="ml-10 mt-8 border-t border-slate-200/70" />}
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
