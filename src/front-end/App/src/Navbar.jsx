import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "./auth/AuthContext";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const [username, setUsername] = useState("");

    useEffect(() => {
        // If missing token, redirect to login unless already on login or admin routes
        const path = location.pathname || "";
        const isAdminRoute = path.startsWith("/admin");
        const isLoginRoute = path === "/login";

        if (!isAuthenticated && !isLoginRoute && !isAdminRoute) {
            navigate("/login");
            return;
        }

        if (user) {
            setUsername(user?.FullName || user?.fullName || user?.username || "");
        } else {
            setUsername("");
        }
    }, [location.pathname, navigate, isAuthenticated, user]);

    const handleProfileClick = () => {
        navigate("/profile");
    };

    return (
        <nav className="Navbar">
            <div className="color-box"></div>
            <div className="nvbr-main">
                <div className="navigate">
                    <NavLink to="/vehicles" className={({ isActive }) => isActive ? "active" : ""}>
                        Xe của bạn
                    </NavLink>
                    <NavLink to="/schedule" className={({ isActive }) => isActive ? "active" : ""}>
                        Đặt lịch
                    </NavLink>
                    <NavLink to="/usageHistory" className={({ isActive }) => isActive ? "active" : ""}>
                        Lịch sử
                    </NavLink>
                    <NavLink to="/notifycaition" className={({ isActive }) => isActive ? "active" : ""}>
                        Thông báo
                    </NavLink>
                    <NavLink to="/support" className={({ isActive }) => isActive ? "active" : ""}>
                        Hỗ trợ
                    </NavLink>
                </div>

                <div className="username" style={{ cursor: "pointer" }} onClick={handleProfileClick}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <FaUserCircle size={28} />
                        <span style={{ marginLeft: 8 }}>{username || "Tài khoản"}</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
