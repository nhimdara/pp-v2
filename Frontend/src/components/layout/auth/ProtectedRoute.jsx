// ─────────────────────────────────────────────────────────────
//  ProtectedRoute.jsx  —  Role-based Route Guard Component
// ─────────────────────────────────────────────────────────────
import React from "react";
import { Navigate } from "react-router-dom";
import { routeGuardMiddleware } from "../../../auth/authMiddleware";

/**
 * ProtectedRoute
 *
 * Usage:
 *   <ProtectedRoute requiredRole="admin">   → only admins
 *   <ProtectedRoute requiredRole="client">  → only clients
 *   <ProtectedRoute>                        → any logged-in user
 *
 * Props:
 *   children     — the page/component to render if allowed
 *   requiredRole — "admin" | "client" | null (any authenticated)
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const guard = routeGuardMiddleware(requiredRole);

  if (!guard.allowed) {
    return <Navigate to={guard.redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;