import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaCar, FaCalendarAlt, FaHistory, FaBell, FaHeadset, FaChevronDown, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "./auth/AuthContext";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const [username, setUsername] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
        setDropdownOpen(false);
    };

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate("/login");
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="Navbar">
            <div className="color-box"></div>
            <div className="menu-btn" onClick={() => setMenuOpen(true)}>
                <FaBars />
            </div>

            <div className="nvbr-main">
                <div className="navigate">
                    <NavLink to="/vehicles" style={{ marginBottom: '30px' }}><span className="nav-icon"><FaCar /></span><span className="nav-label">Xe của bạn</span></NavLink>
                    <NavLink to="/schedule" style={{ marginBottom: '30px' }}><span className="nav-icon"><FaCalendarAlt /></span><span className="nav-label">Đặt lịch</span></NavLink>
                    <NavLink to="/usageHistory" style={{ marginBottom: '30px' }}><span className="nav-icon"><FaHistory /></span><span className="nav-label">Lịch sử</span></NavLink>
                    <NavLink to="/notification" style={{ marginBottom: '30px' }}><span className="nav-icon"><FaBell /></span><span className="nav-label">Thông báo</span></NavLink>
                    <NavLink to="/support" style={{ marginBottom: '30px' }}><span className="nav-icon"><FaHeadset /></span><span className="nav-label">Hỗ trợ</span></NavLink>
                </div>
                <div className="username-container">
                    <div className="username" onClick={toggleDropdown}>
                        <FaUserCircle size={28} />
                        <span style={{ marginLeft: 8, marginRight: 8 }}>{username || "Tài khoản"}</span>
                        <FaChevronDown size={12} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
                    </div>
                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={handleProfileClick}>
                                <FaUser size={16} />
                                Thông tin cá nhân
                            </div>
                            <div className="dropdown-item logout" onClick={handleLogout}>
                                <FaSignOutAlt size={16} />
                                Đăng xuất
                            </div>
                        </div>
                    )}
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
                    <div className="username-container mobile">
                        <div className="username" onClick={toggleDropdown}>
                            <FaUserCircle size={28} />
                            <span style={{ marginLeft: 8, marginRight: 8 }}>{username || "Tài khoản"}</span>
                            <FaChevronDown size={12} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
                        </div>
                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-item" onClick={handleProfileClick}>
                                    <FaUser size={16} />
                                    Thông tin cá nhân
                                </div>
                                <div className="dropdown-item logout" onClick={handleLogout}>
                                    <FaSignOutAlt size={16} />
                                    Đăng xuất
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
