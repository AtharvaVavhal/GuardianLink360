import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GuardianLogin from "./pages/GuardianLogin";
import GuardianDashboard from "./pages/GuardianDashboard";
import IncidentDetail from "./pages/IncidentDetail";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("guardian_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <div className="scanlines">
        <Routes>
          <Route path="/login" element={<GuardianLogin />} />
          <Route path="/" element={<PrivateRoute><GuardianDashboard /></PrivateRoute>} />
          <Route path="/incident/:id" element={<PrivateRoute><IncidentDetail /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
