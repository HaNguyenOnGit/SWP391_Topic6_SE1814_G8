import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RegistrationForm from "./pages/Registration";
import Vehicles from "./pages/Vehicles";
import Vehicle from "./pages/Vehicle";
import NewContract from "./pages/NewContract";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/newContract" element={<NewContract />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/vehicles" element={< Vehicles />} />
        <Route path="/vehicle/:id" element={<Vehicle />} />
      </Routes>
    </BrowserRouter>
  );
}