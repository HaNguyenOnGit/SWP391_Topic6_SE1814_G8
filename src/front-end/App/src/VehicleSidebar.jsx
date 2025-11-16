import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaCalendarAlt, FaDoorOpen, FaFileInvoiceDollar, FaExclamationCircle, FaMoneyBillWave, FaHistory, FaCar, FaFileContract } from "react-icons/fa";
import "./VehicleSidebar.css";

export default function VehicleSidebar({ contractId }) {
    const location = useLocation();
    const { id: idFromParams } = useParams();
    const id = contractId || idFromParams;

    const items = [
        { key: "schedule", label: "Đặt lịch", to: `/vehicle/${id}/schedule`, icon: FaCalendarAlt },
        { key: "checkin", label: "Check-in/out", to: `/vehicle/${id}/checkinHistory`, icon: FaDoorOpen },
        { key: "costs", label: "Chi phí", to: `/vehicle/${id}/costs`, icon: FaFileInvoiceDollar },
        { key: "proposal", label: "Đề xuất", to: `/vehicle/${id}/proposal`, icon: FaExclamationCircle },
        { key: "payment", label: "Thanh toán", to: `/vehicle/${id}/payment`, icon: FaMoneyBillWave },
        { key: "history", label: "Lịch sử", to: `/vehicle/${id}/history`, icon: FaHistory },
        { key: "contract", label: "Hợp đồng", to: `/vehicle/${id}/contract`, icon: FaFileContract },
    ];

    const isActive = (to) => location.pathname.startsWith(to);

    return (
        <aside className="vehicle-sidebar" aria-label="Vehicle sidebar navigation">
            <div className="sidebar-header">
                <span className="sidebar-logo"><FaCar /></span>
                <span className="sidebar-title">Phương tiện</span>
            </div>
            <nav className="sidebar-nav">
                {items.map(({ key, label, to, icon: Icon }) => (
                    <Link key={key} to={to} className={`sidebar-link${isActive(to) ? " active" : ""}`}>
                        <span className="sidebar-icon"><Icon /></span>
                        <span className="sidebar-label">{label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
