import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CurrentUserProvider } from "./context/CurrentUserContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRoute } from "./components/RoleRoute";

import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

// Lazy-loaded routes
const ProfileSetup = lazy(() => import("./pages/ProfileSetup").then(module => ({ default: module.ProfileSetup })));
const Dashboard = lazy(() => import("./pages/Dashboard").then(module => ({ default: module.Dashboard })));
const Opportunities = lazy(() => import("./pages/Opportunities").then(module => ({ default: module.Opportunities })));
const Recommendations = lazy(() => import("./pages/Recommendations").then(module => ({ default: module.Recommendations })));
const Bookmarks = lazy(() => import("./pages/Bookmarks").then(module => ({ default: module.Bookmarks })));
const Applications = lazy(() => import("./pages/Applications").then(module => ({ default: module.Applications })));
const Organizer = lazy(() => import("./pages/Organizer").then(module => ({ default: module.Organizer })));
const AdminReviewQueue = lazy(() => import("./pages/AdminReviewQueue").then(module => ({ default: module.AdminReviewQueue })));

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CurrentUserProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<FullPageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
                <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
                <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
                <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                <Route path="/organizer" element={<ProtectedRoute><Organizer /></ProtectedRoute>} />
                <Route path="/admin/review-queue" element={<ProtectedRoute><RoleRoute allowedRoles={["ADMIN"]}><AdminReviewQueue /></RoleRoute></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </CurrentUserProvider>
    </AuthProvider>
  );
}

export default App;
