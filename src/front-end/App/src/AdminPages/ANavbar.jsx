import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUsers, FaFileContract, FaChartPie } from "react-icons/fa";
import { useAuth } from "../auth/AuthContext";
import "./ANavbar.css";

export default function AdminNavbar({ adminName }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    const getInitials = (name) => {
        if (!name) return "A";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const handleProfileClick = () => {
        navigate("/admin/profile");
    };

    // Ensure only admin users can access admin routes
    useEffect(() => {
        // If not authenticated, send to login
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        // determine role from user object (robust to different field names)
        const roleValue = user?.role || user?.Role || user?.roleName || user?.RoleName || null;
        const roleLower = roleValue ? String(roleValue).toLowerCase() : null;
        if (roleLower !== "admin") {
            // not admin -> redirect to vehicles (non-admin area)
            navigate("/vehicles");
        }
    }, [isAuthenticated, user, navigate, location.pathname]);

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
                <div className="avatar">{getInitials(adminName)}</div>
                <span>{adminName}</span>
            </div>
        </nav>
    );
}
