// ─────────────────────────────────────────────────────────────
//  authMiddleware.js - UPDATED with TEACHER support
// ─────────────────────────────────────────────────────────────

const USERS_KEY = "learnflow_users";
const SESSION_KEY = "learnflow_session";

// ── Hardcoded accounts (never overridable by registration) ──
const ADMIN_ACCOUNT = {
  id: "admin-001",
  name: "Admin",
  email: "admin@elearning.com",
  password: "Admin@123",
  role: "admin",
  joinDate: "2024-01-01",
  achievements: ["Super Admin"],
};

// ── Add TEACHER account ──
const TEACHER_ACCOUNT = {
  id: "teacher-001",
  name: "Teacher",
  email: "teacher@elearning.com",
  password: "Teacher@123",
  role: "teacher",
  joinDate: "2024-01-01",
  achievements: ["Master Teacher"],
};

// ── Load all client accounts from localStorage ────────────────
function loadClients() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveClients(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUser(email) {
  const e = email.toLowerCase().trim();
  if (ADMIN_ACCOUNT.email === e) return ADMIN_ACCOUNT;
  if (TEACHER_ACCOUNT.email === e) return TEACHER_ACCOUNT;
  return loadClients().find((u) => u.email === e) || null;
}

// ─────────────────────────────────────────────────────────────
//  SESSION HELPERS
// ─────────────────────────────────────────────────────────────
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  const { password, ...safe } = user;
  const session = {
    ...safe,
    token: btoa(safe.email + ":" + Date.now()),
    loginAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─────────────────────────────────────────────────────────────
//  LOGIN MIDDLEWARE
// ─────────────────────────────────────────────────────────────
export function loginMiddleware(email, password) {
  if (!email || !password) {
    return { success: false, error: "Please enter your email and password." };
  }

  const user = findUser(email);

  if (!user || user.password !== password) {
    return { success: false, error: "Invalid email or password." };
  }

  const session = saveSession(user);

  // Role-based redirect
  let redirect = "/home";
  if (user.role === "admin") redirect = "/admin/dashboard";
  if (user.role === "teacher") redirect = "/teacher/dashboard";

  return {
    success: true,
    user: session,
    role: user.role,
    redirect: redirect,
  };
}

// ─────────────────────────────────────────────────────────────
//  REGISTER MIDDLEWARE — all new accounts are "client"
// ─────────────────────────────────────────────────────────────
export function registerMiddleware(name, email, password) {
  if (!name || name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check against admin and teacher emails
  if (
    normalizedEmail === ADMIN_ACCOUNT.email ||
    normalizedEmail === TEACHER_ACCOUNT.email
  ) {
    return { success: false, error: "This email address is not available." };
  }

  const clients = loadClients();
  if (clients.find((u) => u.email === normalizedEmail)) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  const newUser = {
    id: "user-" + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "client",
    joinDate: new Date().toISOString().split("T")[0],
    achievements: ["New Member"],
    progress: 0,
    coursesEnrolled: 0,
    certificates: 0,
  };

  clients.push(newUser);
  saveClients(clients);
  localStorage.setItem("has_registered", "true");

  const session = saveSession(newUser);

  return {
    success: true,
    user: session,
    role: "client",
    redirect: "/home",
  };
}

// ─────────────────────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────────────────────
export function logoutMiddleware() {
  clearSession();
  return { redirect: "/login" };
}

// ─────────────────────────────────────────────────────────────
//  ROUTE GUARD — used by <ProtectedRoute>
// ─────────────────────────────────────────────────────────────
export function routeGuardMiddleware(requiredRole = null) {
  const session = getSession();

  if (!session) {
    const hasRegistered = !!localStorage.getItem("has_registered");
    return { allowed: false, redirect: hasRegistered ? "/login" : "/" };
  }

  if (requiredRole && session.role !== requiredRole) {
    // Redirect based on user's actual role
    let redirect = "/home";
    if (session.role === "admin") redirect = "/admin/dashboard";
    if (session.role === "teacher") redirect = "/teacher/dashboard";

    return {
      allowed: false,
      redirect: redirect,
    };
  }

  return { allowed: true, user: session };
}
