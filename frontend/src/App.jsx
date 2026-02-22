// src/App.jsx
import { Routes, Route, Link, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CompanyDetail from "./pages/CompanyDetail.jsx";
import AddExperience from "./pages/AddExperience.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";

/* ──────────────────────────────────────────────────────────────
   Public Landing (Hero + Logos in ONE card)
   ────────────────────────────────────────────────────────────── */
function MarketingHome() {
  // Each brand: logo srcs + Wikipedia link (opens when logo is clicked)
  const BRANDS = [
    { name: "Google",    wikipedia: "https://en.wikipedia.org/wiki/Google",                                                                  srcs: ["https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png"]},
    { name: "Microsoft", wikipedia: "https://en.wikipedia.org/wiki/Microsoft",                                                                srcs: ["https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/320px-Microsoft_logo.svg.png"]},
    { name: "Amazon",    wikipedia: "https://en.wikipedia.org/wiki/Amazon_(company)",                                                        srcs: ["https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png"]},
    { name: "Netflix",   wikipedia: "https://en.wikipedia.org/wiki/Netflix",                                                                 srcs: ["https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png"]},
    { name: "IBM",       wikipedia: "https://en.wikipedia.org/wiki/IBM",                                                                     srcs: ["https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/320px-IBM_logo.svg.png"]},
    { name: "Oracle",    wikipedia: "https://en.wikipedia.org/wiki/Oracle_Corporation",                                                        srcs: ["https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/320px-Oracle_logo.svg.png"]},
    { name: "Airbnb",    wikipedia: "https://en.wikipedia.org/wiki/Airbnb",                                                                  srcs: ["https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Bélo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/320px-Airbnb_Logo_B%C3%A9lo.svg.png"]},
    { name: "PayPal",    wikipedia: "https://en.wikipedia.org/wiki/PayPal",                                                                 srcs: ["https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/320px-PayPal.svg.png"]},
    { name: "Paytm",     wikipedia: "https://en.wikipedia.org/wiki/Paytm",                                                                   srcs: ["https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/320px-Paytm_Logo_%28standalone%29.svg.png"]},
    { name: "Spotify",   wikipedia: "https://en.wikipedia.org/wiki/Spotify",                                                                 srcs: ["https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/320px-Spotify_logo_with_text.svg.png"]},
    { name: "LinkedIn",  wikipedia: "https://en.wikipedia.org/wiki/LinkedIn",                                                                srcs: ["https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png","https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/240px-LinkedIn_logo_initials.png"]},
    { name: "Tesla",     wikipedia: "https://en.wikipedia.org/wiki/Tesla,_Inc.",                                                              srcs: ["https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/240px-Tesla_T_symbol.svg.png"]},
    { name: "NVIDIA",    wikipedia: "https://en.wikipedia.org/wiki/Nvidia",                                                                   srcs: ["https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/320px-Nvidia_logo.svg.png"]},
    { name: "Intel",     wikipedia: "https://en.wikipedia.org/wiki/Intel",                                                                   srcs: ["https://upload.wikimedia.org/wikipedia/commons/6/6a/Intel_logo_%282020%2C_dark_blue%29.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Intel_logo_%282020%2C_dark_blue%29.svg/320px-Intel_logo_%282020%2C_dark_blue%29.svg.png"]},
    { name: "Dell",      wikipedia: "https://en.wikipedia.org/wiki/Dell",                                                                    srcs: ["https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/320px-Dell_Logo.svg.png"]},
    { name: "SAP",       wikipedia: "https://en.wikipedia.org/wiki/SAP_SE",                                                                  srcs: ["https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/320px-SAP_2011_logo.svg.png"]},
    { name: "GitHub",    wikipedia: "https://en.wikipedia.org/wiki/GitHub",                                                                   srcs: ["https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/240px-Octicons-mark-github.svg.png"]},
    { name: "Slack",     wikipedia: "https://en.wikipedia.org/wiki/Slack_Technologies",                                                       srcs: ["https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png","https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Slack_Icon.png/240px-Slack_Icon.png"]},
    { name: "Zoom",      wikipedia: "https://en.wikipedia.org/wiki/Zoom_Video_Communications",                                                 srcs: ["https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/320px-Zoom_Communications_Logo.svg.png"]},
    { name: "Dropbox",   wikipedia: "https://en.wikipedia.org/wiki/Dropbox",                                                                  srcs: ["https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg","https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Dropbox_Icon.svg/240px-Dropbox_Icon.svg.png"]},
    { name: "PROSPERR.IO", wikipedia: "https://prosperr.io",                                                                                  srcs: ["/brands/prosperr-io.png"]},
  ];

  const onImgError = (e, list) => {
    const idx = Number(e.currentTarget.dataset.idx || 0);
    const next = list[idx + 1];
    if (next) {
      e.currentTarget.dataset.idx = String(idx + 1);
      e.currentTarget.src = next;
    }
  };

  return (
    <>
      <Navbar />
      <main className="section page-enter">
        {/* ONE premium card: hero + brands */}
        <div className="card overflow-hidden p-0">
          {/* Hero strip */}
          <div className="relative px-8 sm:px-12 pt-14 pb-12 bg-gradient-to-br from-white to-brand-50/50 overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-brand-200/50 blur-3xl" />
              <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-fuchsia-200/40 blur-3xl" />
            </div>
            <div className="relative text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                Placement tracking,{" "}
                <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
                  done right.
                </span>
              </h1>
              <p className="hero-sub mt-4 text-base sm:text-lg text-slate-600">
                Organize companies, rounds and outcomes — all in one beautiful dashboard.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="btn-primary px-6 sm:px-7 py-3 text-sm sm:text-base focus-ring"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  className="btn-outline px-6 sm:px-7 py-3 text-sm sm:text-base focus-ring"
                >
                  I already have an account
                </Link>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Logo wall: grayscale with color on hover */}
          <div className="px-8 sm:px-12 py-12">
            <p className="text-center text-slate-500 text-sm sm:text-base">
              Companies students have shared experiences for
            </p>

            <ul
              className="
                mt-8
                grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6
                gap-x-12 gap-y-10 xl:gap-x-14 xl:gap-y-12
                place-items-center
              "
            >
              {BRANDS.map((b) => (
                <li key={b.name} className="w-full flex items-center justify-center p-2.5 sm:p-3">
                  <a
                    href={b.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full focus-ring rounded-lg outline-offset-2"
                    title={`${b.name} (Wikipedia)`}
                    aria-label={`${b.name} – open Wikipedia`}
                  >
                    <img
                      src={b.srcs[0]}
                      data-idx="0"
                      onError={(e) => onImgError(e, b.srcs)}
                      referrerPolicy="no-referrer"
                      decoding="async"
                      alt={b.name}
                      className="h-11 md:h-12 lg:h-14 max-w-[190px] object-contain grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

/* ────────────────────────────────────────────────────────────── */
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center page-enter">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4" aria-hidden>
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">The page you’re looking for doesn’t exist or was moved.</p>
        <Link to="/" className="btn-primary mt-6 focus-ring inline-flex">
          Go to home
        </Link>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login defaultTab="signup" />} />

      <Route path="/user/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["user", "admin"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/:id"
        element={
          <ProtectedRoute roles={["user", "admin"]}>
            <CompanyDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-experience"
        element={
          <ProtectedRoute roles={["user", "admin"]}>
            <AddExperience />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
