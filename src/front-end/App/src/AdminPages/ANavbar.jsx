import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import "./ANavbar.css";

export default function AdminNavbar({ adminName }) {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate("/admin/profile");
    };

    return (
        <nav className="admin-navbar">
            <div className="menu">
                <Link to="/admin/users">Quản lý user</Link>
                <Link to="/admin/contracts">Quản lý hợp đồng</Link>
                <Link to="/admin/overview">Tổng quan</Link>
            </div>

            <div className="admin-box" onClick={handleProfileClick}>
                <FaUserShield size={24} />
                <span>{adminName}</span>
            </div>
        </nav>
    );
}

