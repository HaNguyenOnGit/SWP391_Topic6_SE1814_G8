import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegistrationForm from "./pages/Registration";
import Vehicles from "./pages/Vehicles";
import Vehicle from "./pages/Vehicle";
import NewContract from "./pages/NewContract";
import CostDetail from "./pages/Cost";
import CheckInOutHistory from "./pages/CheckinHistory";
import Checkin from "./pages/Checkin";
import PaymentHistory from "./pages/PaymentHistory";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route
          path="/login"
          element={
            <>
              <h2 style={{ textAlign: "center" }}>Đăng nhập</h2>
              <LoginPage />
            </>
          }
        />
        <Route path="/newContract" element={<NewContract />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/vehicles" element={< Vehicles />} />
        <Route path="/vehicle/:id" element={<Vehicle />} />
        <Route path="/vehicle/:id/costs" element={<CostDetail />} />
        <Route path="/vehicle/:id/checkinHistory" element={<CheckInOutHistory />} />
        <Route path="/vehicle/:id/checkin" element={<Checkin />} />
        <Route path="/vehicle/:id/history" element={<PaymentHistory />} />
      </Routes>
    </BrowserRouter>
  );
}