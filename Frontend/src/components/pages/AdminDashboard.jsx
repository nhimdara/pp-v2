// ─────────────────────────────────────────────────────────────
//  AdminDashboard.jsx — responsive version
//  • Collapsible sidebar with hamburger on mobile
//  • Stats grid: 2-col on mobile → 4-col on lg
//  • Users table → card list on mobile (< md)
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Search,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Trash2,
  ChevronRight,
  UserCheck,
  UserX,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import logo from "./../assets/image/logo.png";

const API = "http://localhost:5000";

const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar

  // ── Fetch users ───────────────────────────────────────────
  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API}/api/users`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setApiError("Could not load users from database.");
      console.error("fetchUsers:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Close sidebar when route changes on mobile
  const handleTabChange = (id) => {
    setActiveTab(id);
    refreshUsers();
    setSidebarOpen(false);
  };

  // ── Derived stats ─────────────────────────────────────────
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status !== "inactive").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const newToday = users.filter((u) => u.joinDate === todayStr).length;

  const STATS = [
    {
      label: "Registered Users",
      value: totalUsers,
      delta: newToday > 0 ? `+${newToday} today` : "0 today",
      icon: Users,
      light: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Active Users",
      value: activeUsers,
      delta: `${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%`,
      icon: UserCheck,
      light: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active Courses",
      value: 48,
      delta: "+3",
      icon: BookOpen,
      light: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Completion Rate",
      value: "73%",
      delta: "+5%",
      icon: TrendingUp,
      light: "bg-amber-50 text-amber-600",
    },
  ];

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("deleteUser:", err.message);
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const recentUsers = [...users]
    .sort((a, b) => (b.id > a.id ? 1 : -1))
    .slice(0, 5);

  // ── Sidebar nav items ─────────────────────────────────────
  const NAV = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // ── Sidebar content (shared desktop + mobile) ─────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <img src={logo} alt="LearnFlow Logo" className="w-full h-full" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">
              Elearning
            </p>
            <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
            {item.id === "users" && users.length > 0 && (
              <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {users.length}
              </span>
            )}
            {activeTab === item.id && item.id !== "users" && (
              <ChevronRight className="h-3.5 w-3.5 ml-auto" />
            )}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-slate-950 text-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-center mb-1">
              Delete user?
            </h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              This will permanently remove the account. They won't be able to
              log in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View user modal ── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white font-bold">User Details</h3>
              <button
                onClick={() => setViewUser(null)}
                className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                {viewUser.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-white font-semibold">{viewUser.name}</p>
                <p className="text-slate-400 text-xs">{viewUser.email}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                ["Role", viewUser.role],
                ["Joined", viewUser.joinDate || "—"],
                ["Courses Enrolled", viewUser.coursesEnrolled ?? 0],
                ["Progress", `${viewUser.progress ?? 0}%`],
                ["Certificates", viewUser.certificates ?? 0],
                [
                  "Achievements",
                  (viewUser.achievements || []).join(", ") || "—",
                ],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 border-b border-slate-800"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-200 font-medium capitalize">
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setViewUser(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar (fixed, hidden on mobile) ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-30 flex-col">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar (slide-in drawer) ── */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col md:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button inside mobile drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main className="md:ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold text-white truncate">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "users" && "User Management"}
                {activeTab === "courses" && "Course Management"}
                {activeTab === "settings" && "System Settings"}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={refreshUsers}
              title="Refresh"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="relative">
              <Bell className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
              {newToday > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <div className="w-px h-5 bg-slate-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-indigo-300 text-xs font-semibold">
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Page body */}
        <div className="px-4 md:px-8 py-5 md:py-6">
          {/* API error */}
          {apiError && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{apiError}</span>
              <button
                onClick={refreshUsers}
                className="text-xs underline hover:no-underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mb-4 flex items-center gap-2 text-slate-500 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading users...
            </div>
          )}

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-5 md:space-y-6">
              {/* Stats: 2-col mobile → 4-col lg */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 hover:border-slate-600 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${s.light} flex items-center justify-center`}
                      >
                        <s.icon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <span className="text-emerald-400 text-[10px] md:text-xs font-semibold bg-emerald-500/10 px-1.5 md:px-2 py-0.5 rounded-full">
                        {s.delta}
                      </span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {s.value}
                    </p>
                    <p className="text-slate-500 text-[11px] md:text-xs mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent sign-ups */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-sm md:text-base">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Recent Sign-ups
                  <span className="ml-auto text-xs text-slate-500 font-normal">
                    Last {recentUsers.length} accounts
                  </span>
                </h2>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <UserX className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      No users registered yet.
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      New accounts will appear here instantly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">
                            {u.name}
                          </p>
                          <p className="text-slate-500 text-xs truncate">
                            {u.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span className="text-slate-500 text-xs whitespace-nowrap hidden sm:inline">
                            {u.joinDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Users Tab ── */}
          {activeTab === "users" && (
            <div className="space-y-4 md:space-y-5">
              {/* Search + count */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <span className="text-slate-500 text-sm shrink-0">
                  {filtered.length} of {users.length} users
                </span>
              </div>

              {users.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-16">
                  <UserX className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    No users registered yet.
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    When someone creates an account it will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* ── Desktop: table (md+) ── */}
                  <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/50">
                          {[
                            "Name",
                            "Email",
                            "Role",
                            "Joined",
                            "Progress",
                            "Actions",
                          ].map((h) => (
                            <th
                              key={h}
                              className="py-3 px-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                  {u.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <span className="text-white text-sm font-medium">
                                  {u.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-slate-400 text-sm">
                              {u.email}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-slate-400 text-sm">
                              {u.joinDate || "—"}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                                    style={{ width: `${u.progress ?? 0}%` }}
                                  />
                                </div>
                                <span className="text-slate-400 text-xs">
                                  {u.progress ?? 0}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewUser(u)}
                                  className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(u.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Mobile: card list (< md) ── */}
                  <div className="md:hidden space-y-3">
                    {filtered.map((u) => (
                      <div
                        key={u.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
                      >
                        {/* Header row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">
                              {u.name}
                            </p>
                            <p className="text-slate-500 text-xs truncate">
                              {u.email}
                            </p>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setViewUser(u)}
                              className="p-2 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(u.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize font-semibold">
                            {u.role}
                          </span>
                          <span className="text-slate-500">
                            Joined:{" "}
                            <span className="text-slate-300">
                              {u.joinDate || "—"}
                            </span>
                          </span>
                          {/* Progress bar */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                                style={{ width: `${u.progress ?? 0}%` }}
                              />
                            </div>
                            <span className="text-slate-400 shrink-0">
                              {u.progress ?? 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Courses Tab ── */}
          {activeTab === "courses" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Course management coming soon.</p>
            </div>
          )}

          {/* ── Settings Tab ── */}
          {activeTab === "settings" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <Settings
                className="h-12 w-12 text-slate-600 mx-auto mb-3 animate-spin"
                style={{ animationDuration: "8s" }}
              />
              <p className="text-slate-400">System settings coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
