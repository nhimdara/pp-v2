import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// ── Auth Middleware ──
import {
  getSession,
  loginMiddleware,
  registerMiddleware,
  logoutMiddleware,
} from "./auth/authMiddleware";
import ProtectedRoute from "./components/layout/auth/ProtectedRoute";

// ── Layout ──
import FontStyle from "./components/layout/ui/FontStyle";
import GlobalStyles from "./components/layout/ui/GlobalStyles";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AuthModal from "./components/layout/auth/AuthModal";
import ScrollToTop from "./components/assets/ScrollToTop";

// ── Client Pages ──
import HomePage from "./components/pages/HomePage";
import LessonsPage from "./components/pages/LessonsPage";
import ProjectsPage from "./components/pages/ProjectsPage";
import CalendarPage from "./components/pages/CalendarPage";
import Profile from "./components/pages/Profile/Profile";
// import MyCourses from "./components/pages/Profile/MyCourses";
import Certificates from "./components/pages/Profile/Certificates";
// import Schedule from "./components/pages/Profile/Schedule";
// import ProgressTracker from "./components/pages/Profile/ProgressTracker";
import Settings from "./components/pages/Profile/Settings";
// import Dashboard from "./components/pages/Profile/Dashboard";

// ── Admin Pages ──
import AdminDashboard from "./components/pages/AdminDashboard";
//__ Teacher Pages ──
import TeacherDashboard from "./components/pages/TeacherDashboard";
// ── Auth Pages ──
import RegisterPage from "./components/layout/auth/Registerpage";
import LoginPage from "./components/layout/auth/Loginpage";

// ── Services ──
import AIChat from "./components/service/AIChat";

// ─────────────────────────────────────────────────────────────
//  PageLayout — wraps client pages with Navbar + Footer
// ─────────────────────────────────────────────────────────────
const PageLayout = ({
  isAuthenticated,
  user,
  onLogout,
  onAuthModalOpen,
  children,
  showAIChat = true,
}) => (
  <div className="nav-font min-h-screen flex flex-col">
    <FontStyle />
    <GlobalStyles />
    <Navbar
      isAuthenticated={isAuthenticated}
      user={user}
      onLogout={onLogout}
      onAuthModalOpen={onAuthModalOpen}
    />
    <main className="flex-grow">{children}</main>
    <Footer />
    {showAIChat && <AIChat />}
  </div>
);

// ─────────────────────────────────────────────────────────────
//  AppInner — lives inside <Router> so it can use useNavigate
// ─────────────────────────────────────────────────────────────
const AppInner = () => {
  const navigate = useNavigate();

  // ── Auth state (seeded from session) ──
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // ── Restore session on mount ──
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      setIsAuthenticated(true);
    }
  }, []);

  // ── Theme ──
  useEffect(() => {
    try {
      const settings = JSON.parse(
        localStorage.getItem("learnflow_settings") || "{}",
      );
      if (
        settings.theme === "dark" ||
        (settings.theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark-mode");
      } else {
        document.documentElement.classList.remove("dark-mode");
      }
    } catch {}
  }, []);

  // ─── HANDLERS ──────────────────────────────────────────────

  /**
   * Called by LoginPage / RegisterPage / AuthModal after
   * the middleware already validated credentials.
   * Pass the result object from loginMiddleware/registerMiddleware.
   */
  const handleAuthSuccess = (middlewareResult) => {
    if (!middlewareResult.success) return;

    setUser(middlewareResult.user);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    // ── ROLE-BASED REDIRECT (supports admin, teacher, client) ──
    navigate(middlewareResult.redirect, { replace: true });
  };
  const handleLogout = () => {
    const { redirect } = logoutMiddleware();
    setUser(null);
    setIsAuthenticated(false);
    navigate(redirect, { replace: true });
  };

  const handleUserUpdate = (updated) => {
    setUser(updated);
    localStorage.setItem("learnflow_session", JSON.stringify({ ...updated }));
  };

  const openAuthModal = (mode) => {
    setIsLogin(mode === "signin");
    setIsAuthModalOpen(true);
  };

  // ── Shared layout props ──
  const layoutProps = {
    isAuthenticated,
    user,
    onLogout: handleLogout,
    onAuthModalOpen: openAuthModal,
  };

  // ── Resolve initial redirect for "/" ──
  const hasRegistered = !!localStorage.getItem("has_registered");

  return (
    <Routes>
      {/* ───────────────────────────────────────────────────
          AUTH ROUTES
      ─────────────────────────────────────────────────── */}

      {/* Register — first page for brand-new visitors */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={
                user?.role === "admin"
                  ? "/admin/dashboard"
                  : user?.role === "teacher"
                    ? "/teacher/dashboard"
                    : "/home"
              }
              replace
            />
          ) : (
            <div className="min-h-screen flex flex-col">
              <RegisterPage onAuthSuccess={handleAuthSuccess} />
              <Footer />
            </div>
          )
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={
                user?.role === "admin"
                  ? "/admin/dashboard"
                  : user?.role === "teacher"
                    ? "/teacher/dashboard"
                    : "/home"
              }
              replace
            />
          ) : (
            <div className="min-h-screen flex flex-col">
              <LoginPage onAuthSuccess={handleAuthSuccess} />
              <Footer />
            </div>
          )
        }
      />

      {/* ───────────────────────────────────────────────────
          ADMIN ROUTES  (requiredRole="admin")
      ─────────────────────────────────────────────────── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      {/* ───────────────────────────────────────────────────
    TEACHER ROUTES  (requiredRole="teacher")
─────────────────────────────────────────────────── */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* ───────────────────────────────────────────────────
          CLIENT / PUBLIC ROUTES  (requiredRole="client" or open)
      ─────────────────────────────────────────────────── */}

      {/* Home — public (no login required to browse) */}
      <Route
        path="/home"
        element={
          <PageLayout {...layoutProps}>
            <HomePage onAuthModalOpen={openAuthModal} />
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              isLogin={isLogin}
              setIsLogin={setIsLogin}
              onAuthSuccess={handleAuthSuccess}
            />
          </PageLayout>
        }
      />

      {/* Dashboard — client only
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <Dashboard user={user} />
            </PageLayout>
          </ProtectedRoute>
        }
      /> */}

      {/* Profile — client only */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <Profile user={user} onUserUpdate={handleUserUpdate} />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* Certificates — client only */}
      <Route
        path="/certificates"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <Certificates user={user} />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* Settings — client only */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="client">
            <PageLayout {...layoutProps}>
              <Settings user={user} onLogout={handleLogout} />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* Public pages (open to everyone) */}
      <Route
        path="/lessons"
        element={
          <PageLayout {...layoutProps}>
            <LessonsPage />
          </PageLayout>
        }
      />
      <Route
        path="/projects"
        element={
          <PageLayout {...layoutProps}>
            <ProjectsPage />
          </PageLayout>
        }
      />
      <Route
        path="/calendar"
        element={
          <PageLayout {...layoutProps}>
            <CalendarPage />
          </PageLayout>
        }
      />

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate to={hasRegistered ? "/login" : "/"} replace />}
      />
    </Routes>
  );
};

// ─────────────────────────────────────────────────────────────
//  Root App
// ─────────────────────────────────────────────────────────────
const App = () => (
  <Router>
    <ScrollToTop />
    <AppInner />
  </Router>
);

export default App;
