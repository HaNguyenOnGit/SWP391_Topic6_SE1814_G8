import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import LoginPage from "./pages/Login";
import RegistrationForm from "./pages/Registration";
import Vehicles from "./pages/Vehicles";
import Vehicle from "./pages/Vehicle";
import NewContract from "./pages/NewContract";
import CostDetail from "./pages/Cost";
import CheckInOutHistory from "./pages/CheckinHistory";
import Checkin from "./pages/Checkin";
import PaymentHistory from "./pages/PaymentHistory";
import Payment from "./pages/Payment";
import Schedule from "./pages/Schedule";
import Booking from "./pages/Booking";
import Proposal from "./pages/Proposal";
import RegistrationPending from "./pages/RegistrationPending";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
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
        <Route path="/vehicle/:id/payment" element={<Payment />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/vehicle/:id/schedule" element={<Booking />} />
        <Route path="/vehicle/:id/proposal" element={<Proposal />} />
        <Route path="/registrationpending" element={<RegistrationPending />} />
      </Routes>
    </BrowserRouter>
  );
}