import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SeniorLogin from "./pages/SeniorLogin";
import SeniorHome from "./pages/SeniorHome";
import ThankYou from "./pages/ThankYou";
import Navbar from "./components/Navbar/Navbar";

// Simple auth guard — checks localStorage for session token
function PrivateRoute({ children }) {
  const token = localStorage.getItem("senior_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-dvh flex flex-col font-body">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<SeniorLogin />} />
          <Route path="/thank-you" element={<ThankYou />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <SeniorHome />
                </>
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
