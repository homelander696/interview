import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { authStore } from "../auth";
import { clearToken } from "../api";

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  return (name[0] || "?").toUpperCase();
}

export default function Navbar() {
  const nav = useNavigate();
  const { pathname, search } = useLocation();
  const u = authStore.user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    clearToken();
    authStore.logout();
    nav("/", { replace: true });
  };

  const showUserSeg = u && u.role !== "admin" && pathname.startsWith("/dashboard");
  const params = new URLSearchParams(search);
  const currentTab = params.get("tab") === "mine" ? "mine" : "browse";
  const goTab = (t) => {
    const q = new URLSearchParams(search);
    if (t === "browse") q.delete("tab");
    else q.set("tab", "mine");
    nav({ pathname: "/dashboard", search: q.toString() ? `?${q.toString()}` : "" });
  };

  const linkCls = (active) =>
    `text-sm px-3 py-2 rounded-xl focus-ring ${
      active
        ? "bg-slate-900/5 text-slate-900 font-semibold"
        : "text-slate-600 hover:text-slate-900"
    }`;

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="nav-accent" />
      <div className="nav-shell">
        <div className="nav-grid px-4 py-3.5 sm:py-3">
          {/* Brand */}
          <Link to="/" className="font-extrabold text-lg sm:text-xl text-slate-900 focus-ring rounded-lg">
            <span className="text-brand-600">Place</span>ment
          </Link>

          {/* Center nav links (desktop) */}
          <nav className="nav-center hidden sm:flex">
            {u &&
              (u.role === "admin" ? (
                <Link
                  to="/admin"
                  className={linkCls(pathname.startsWith("/admin"))}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className={linkCls(pathname.startsWith("/dashboard"))}
                >
                  Dashboard
                </Link>
              ))}
            {showUserSeg && (
              <div className="seg">
                <button
                  onClick={() => goTab("browse")}
                  className={`seg-btn ${
                    currentTab === "browse" ? "seg-btn-active" : "seg-btn-idle"
                  }`}
                >
                  Explore
                </button>
                <button
                  onClick={() => goTab("mine")}
                  className={`seg-btn ${
                    currentTab === "mine" ? "seg-btn-active" : "seg-btn-idle"
                  }`}
                >
                  My Submissions
                </button>
              </div>
            )}
          </nav>

          {/* Right side: desktop links + mobile hamburger */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="nav-right hidden sm:flex flex-wrap gap-2 sm:gap-3">
              {u && u.role !== "admin" && (
                <Link
                  to="/add-experience"
                  className="btn-primary h-9 sm:h-10 text-sm sm:text-base focus-ring"
                >
                  Add Experience
                </Link>
              )}
              {u && (
                <span className="flex items-center gap-2 text-slate-700 text-sm mx-1">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-semibold"
                    aria-hidden
                  >
                    {getInitials(u?.name)}
                  </span>
                  <span className="truncate max-w-[140px] sm:max-w-[180px] font-medium">
                    {u.name || "User"}
                  </span>
                </span>
              )}
              {u ? (
                <button onClick={logout} className="btn-outline h-9 sm:h-10 focus-ring">
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost h-9 sm:h-10 focus-ring">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary h-9 sm:h-10 focus-ring">
                    Signup
                  </Link>
                </>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="flex items-center justify-end gap-2 sm:hidden">
            {u && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mr-1">
                {getInitials(u?.name)}
              </span>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus-ring"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-20 top-[52px] bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg animate-fade-in">
          <nav className="container max-w-7xl mx-auto px-4 py-6 flex flex-col gap-2">
            {u ? (
              <>
                {u.role === "admin" ? (
                  <Link to="/admin" className={`${linkCls(pathname.startsWith("/admin"))} py-3 px-4 block`} onClick={closeMobile}>
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className={`${linkCls(pathname.startsWith("/dashboard"))} py-3 px-4 block`} onClick={closeMobile}>
                      Dashboard
                    </Link>
                    <Link to="/add-experience" className="text-slate-600 hover:bg-slate-100 py-3 px-4 rounded-xl font-medium block" onClick={closeMobile}>
                      Add Experience
                    </Link>
                  </>
                )}
                <button onClick={() => { closeMobile(); logout(); }} className="text-left text-slate-600 hover:bg-slate-100 py-3 px-4 rounded-xl font-medium w-full">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:bg-slate-100 py-3 px-4 rounded-xl font-medium block" onClick={closeMobile}>
                  Login
                </Link>
                <Link to="/signup" className="text-slate-600 hover:bg-slate-100 py-3 px-4 rounded-xl font-medium block" onClick={closeMobile}>
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
