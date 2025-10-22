import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield, FaUsers, FaFileContract, FaChartPie } from "react-icons/fa";
import "./ANavbar.css";

export default function AdminNavbar({ adminName }) {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate("/admin/profile");
    };

    return (
        <nav className="admin-navbar">
            <div className="menu">
                <Link to="/admin/users">
                    <FaUsers className="nav-icon" /> Quản lý user
                </Link>
                <Link to="/admin/contracts">
                    <FaFileContract className="nav-icon" /> Quản lý hợp đồng
                </Link>
                <Link to="/admin/overview">
                    <FaChartPie className="nav-icon" /> Tổng quan
                </Link>
            </div>

            <div className="admin-box" onClick={handleProfileClick}>
                <FaUserShield className="nav-icon" size={20} />
                <span>{adminName}</span>
            </div>
        </nav>
    );
}
