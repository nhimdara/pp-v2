// ─────────────────────────────────────────────────────────────
//  AdminDashboard.jsx — reads real registered users from
//  localStorage key "learnflow_users" (set by authMiddleware)
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
} from "lucide-react";

// ── Same key used in authMiddleware.js ────────────────────────
const USERS_KEY = "learnflow_users";

function loadRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ─────────────────────────────────────────────────────────────
const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to confirm delete
  const [viewUser, setViewUser] = useState(null);           // user object to view

  // ── Load users from localStorage on mount + on tab switch ──
  const refreshUsers = useCallback(() => {
    setUsers(loadRegisteredUsers());
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // ── Derived stats ──────────────────────────────────────────
  const totalUsers    = users.length;
  const activeUsers   = users.filter((u) => u.status !== "inactive").length;
  const inactiveUsers = users.filter((u) => u.status === "inactive").length;
  const todayStr      = new Date().toISOString().split("T")[0];
  const newToday      = users.filter((u) => u.joinDate === todayStr).length;

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

  // ── Delete user ────────────────────────────────────────────
  const handleDelete = (id) => {
    const updated = users.filter((u) => u.id !== id);
    saveRegisteredUsers(updated);
    setUsers(updated);
    setDeleteConfirm(null);
  };

  // ── Filter ────────────────────────────────────────────────
  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Recent sign-ups (last 5) ───────────────────────────────
  const recentUsers = [...users]
    .sort((a, b) => (b.id > a.id ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-center mb-1">Delete user?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              This will permanently remove the account. They won't be able to log in.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white font-bold">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-slate-500 hover:text-white transition-colors text-lg leading-none">✕</button>
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
                ["Achievements", (viewUser.achievements || []).join(", ") || "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-200 font-medium capitalize">{val}</span>
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

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-30 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">LearnFlow</p>
              <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { id: "overview", label: "Overview",   icon: BarChart2 },
            { id: "users",    label: "Users",       icon: Users },
            { id: "courses",  label: "Courses",     icon: BookOpen },
            { id: "settings", label: "Settings",    icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); refreshUsers(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="h-4 w-4" />
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

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name || "Admin"}</p>
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
      </aside>

      {/* ── Main ── */}
      <main className="ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "users"    && "User Management"}
              {activeTab === "courses"  && "Course Management"}
              {activeTab === "settings" && "System Settings"}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshUsers}
              title="Refresh user list"
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
            <div className="w-px h-5 bg-slate-700" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-indigo-300 text-xs font-semibold">ADMIN</span>
            </div>
          </div>
        </header>

        <div className="px-8 py-6">

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat cards — live from localStorage */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center`}>
                        <s.icon className="h-5 w-5" />
                      </div>
                      <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {s.delta}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-slate-500 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent sign-ups */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Recent Sign-ups
                  <span className="ml-auto text-xs text-slate-500 font-normal">Last {recentUsers.length} accounts</span>
                </h2>

                {recentUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <UserX className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No users registered yet.</p>
                    <p className="text-slate-600 text-xs mt-1">New accounts will appear here instantly.</p>
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
                          <p className="text-slate-200 text-sm font-medium truncate">{u.name}</p>
                          <p className="text-slate-500 text-xs truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span className="text-slate-500 text-xs whitespace-nowrap">{u.joinDate}</span>
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
            <div className="space-y-5">
              {/* Search + count */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
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

              {/* Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {users.length === 0 ? (
                  <div className="text-center py-16">
                    <UserX className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No users registered yet.</p>
                    <p className="text-slate-600 text-xs mt-1">When someone creates an account it will appear here.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50">
                        {["Name", "Email", "Role", "Joined", "Progress", "Actions"].map((h) => (
                          <th key={h} className="py-3 px-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((u) => (
                        <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                          {/* Name */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {u.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <span className="text-white text-sm font-medium">{u.name}</span>
                            </div>
                          </td>
                          {/* Email */}
                          <td className="py-3.5 px-5 text-slate-400 text-sm">{u.email}</td>
                          {/* Role */}
                          <td className="py-3.5 px-5">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                              {u.role}
                            </span>
                          </td>
                          {/* Joined */}
                          <td className="py-3.5 px-5 text-slate-400 text-sm">{u.joinDate || "—"}</td>
                          {/* Progress */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                                  style={{ width: `${u.progress ?? 0}%` }}
                                />
                              </div>
                              <span className="text-slate-400 text-xs">{u.progress ?? 0}%</span>
                            </div>
                          </td>
                          {/* Actions */}
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
                )}
              </div>
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
              <Settings className="h-12 w-12 text-slate-600 mx-auto mb-3 animate-spin" style={{ animationDuration: "8s" }} />
              <p className="text-slate-400">System settings coming soon.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;