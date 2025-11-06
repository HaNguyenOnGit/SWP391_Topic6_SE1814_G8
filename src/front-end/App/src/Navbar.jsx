import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaCar, FaCalendarAlt, FaHistory, FaBell, FaHeadset } from "react-icons/fa";
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
                    <NavLink to="/vehicles"><span className="nav-icon"><FaCar /></span><span className="nav-label">Xe của bạn</span></NavLink>
                    <NavLink to="/schedule"><span className="nav-icon"><FaCalendarAlt /></span><span className="nav-label">Đặt lịch</span></NavLink>
                    <NavLink to="/usageHistory"><span className="nav-icon"><FaHistory /></span><span className="nav-label">Lịch sử</span></NavLink>
                    <NavLink to="/notification"><span className="nav-icon"><FaBell /></span><span className="nav-label">Thông báo</span></NavLink>
                    <NavLink to="/support"><span className="nav-icon"><FaHeadset /></span><span className="nav-label">Hỗ trợ</span></NavLink>
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
                    <NavLink to="/vehicles" onClick={() => setMenuOpen(false)}><span className="nav-icon"><FaCar /></span><span className="nav-label">Xe của bạn</span></NavLink>
                    <NavLink to="/schedule" onClick={() => setMenuOpen(false)}><span className="nav-icon"><FaCalendarAlt /></span><span className="nav-label">Đặt lịch</span></NavLink>
                    <NavLink to="/usageHistory" onClick={() => setMenuOpen(false)}><span className="nav-icon"><FaHistory /></span><span className="nav-label">Lịch sử</span></NavLink>
                    <NavLink to="/notification" onClick={() => setMenuOpen(false)}><span className="nav-icon"><FaBell /></span><span className="nav-label">Thông báo</span></NavLink>
                    <NavLink to="/support" onClick={() => setMenuOpen(false)}><span className="nav-icon"><FaHeadset /></span><span className="nav-label">Hỗ trợ</span></NavLink>
                    <div className="username" onClick={handleProfileClick}>
                        <FaUserCircle size={28} />
                        <span style={{ marginLeft: 8 }}>{username || "Tài khoản"}</span>
                    </div>
                </div>
            )}
        </nav>
    );
}
