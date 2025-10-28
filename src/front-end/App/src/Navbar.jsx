import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "./auth/AuthContext";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const [username, setUsername] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const path = location.pathname || "";
        const isAdminRoute = path.startsWith("/admin");
        const isLoginRoute = path === "/login";

        if (!isAuthenticated && !isLoginRoute && !isAdminRoute) {
            navigate("/login");
            return;
        }

        setUsername(user?.FullName || user?.fullName || user?.username || "");
    }, [location.pathname, navigate, isAuthenticated, user]);

    const handleProfileClick = () => {
        navigate("/profile");
        setMenuOpen(false);
    };

    return (
        <nav className="Navbar">
            <div className="color-box"></div>
            <div className="menu-btn" onClick={() => setMenuOpen(true)}>
                <FaBars />
            </div>

            <div className="nvbr-main">
                <div className="navigate">
                    <NavLink to="/vehicles">Xe của bạn</NavLink>
                    <NavLink to="/schedule">Đặt lịch</NavLink>
                    <NavLink to="/usageHistory">Lịch sử</NavLink>
                    <NavLink to="/notifycaition">Thông báo</NavLink>
                    <NavLink to="/support">Hỗ trợ</NavLink>
                </div>
                <div className="username" onClick={handleProfileClick}>
                    <FaUserCircle size={28} />
                    <span style={{ marginLeft: 8 }}>{username || "Tài khoản"}</span>
                </div>
            </div>

            {menuOpen && (
                <div className="nvbr-overlay">
                    <FaTimes
                        size={30}
                        style={{ position: "absolute", top: 20, right: 20, cursor: "pointer" }}
                        onClick={() => setMenuOpen(false)}
                    />
                    <NavLink to="/vehicles" onClick={() => setMenuOpen(false)}>Xe của bạn</NavLink>
                    <NavLink to="/schedule" onClick={() => setMenuOpen(false)}>Đặt lịch</NavLink>
                    <NavLink to="/usageHistory" onClick={() => setMenuOpen(false)}>Lịch sử</NavLink>
                    <NavLink to="/notifycaition" onClick={() => setMenuOpen(false)}>Thông báo</NavLink>
                    <NavLink to="/support" onClick={() => setMenuOpen(false)}>Hỗ trợ</NavLink>
                    <div className="username" onClick={handleProfileClick}>
                        <FaUserCircle size={28} />
                        <span style={{ marginLeft: 8 }}>{username || "Tài khoản"}</span>
                    </div>
                </div>
            )}
        </nav>
    );
}
