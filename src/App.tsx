// import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginForm } from "./components/auth/LoginForm";
import { SinglePageDashboard } from "./pages/SinglePageDashboard";
import { ThemedRestaurantPreview } from "./pages/ThemedRestaurantPreview";
import { PublicRestaurantView } from "./pages/PublicRestaurantView";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SinglePageDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preview"
              element={
                <ProtectedRoute>
                  <ThemedRestaurantPreview />
                </ProtectedRoute>
              }
            />
            {/* Public restaurant view route */}
            <Route path="/:restaurantName" element={<PublicRestaurantView />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
