import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
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
import UserProfile from "./pages/UserProfile";
import ContractDetails from "./pages/ContractDetails";
import UserManagement from "./AdminPages/UserManagement";
import AdminContracts from "./AdminPages/AdminContract";
import ProposalList from "./pages/ProposalList";
import ContractVerification from "./pages/ContractVerification";
import UsageHistory from "./pages/UsageHistory";
import Notification from "./pages/Notification";
import AdminProfile from "./AdminPages/AdminProfile";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/land" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
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
        <Route path="/vehicle/:id/contract" element={<ContractDetails />} />
        <Route path="/registrationpending" element={<RegistrationPending />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/contracts" element={<AdminContracts />} />
        <Route path="/admin/profile" element={<AdminProfile />} />

        <Route path="/vehicle/:id/proposals" element={<ProposalList />} />
        <Route path="/contractVerify/:contractId" element={<ContractVerification />} />

        <Route path="/usageHistory" element={<UsageHistory />} />
        <Route path="/notification" element={<Notification />} />

      </Routes>
    </BrowserRouter>
  );
}