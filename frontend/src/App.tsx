import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProfileSetup } from "./pages/ProfileSetup";
import { Dashboard } from "./pages/Dashboard";
import { Opportunities } from "./pages/Opportunities";
import { Recommendations } from "./pages/Recommendations";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
	<Route
 	 path="/opportunities"
 	 element={
   	 <ProtectedRoute>
     	 <Opportunities />
   	 </ProtectedRoute>
 	 }
	/> 
          <Route
  path="/recommendations"
  element={
    <ProtectedRoute>
      <Recommendations />
    </ProtectedRoute>
  }
/>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
        
  );
}

export default App;