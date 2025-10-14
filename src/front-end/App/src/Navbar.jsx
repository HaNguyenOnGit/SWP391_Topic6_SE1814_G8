import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar({ username }) {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate("/profile");
    };

    return (
        <nav className="Navbar">
            <div className="color-box"></div>
            <div className="nvbr-main">
                <div className="navigate">
                    <NavLink
                        to="/vehicles"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Xe của bạn
                    </NavLink>
                    <NavLink
                        to="/schedule"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Đặt lịch
                    </NavLink>
                    <NavLink
                        to="/usageHistory"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Lịch sử
                    </NavLink>
                    <NavLink
                        to="/notifycaition"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Thông báo
                    </NavLink>
                    <NavLink
                        to="/support"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Hỗ trợ
                    </NavLink>
                </div>
                <div className="username" onClick={handleProfileClick}>
                    <FaUserCircle size={28} />
                    <span>{username}</span>
                </div>
            </div>
        </nav>
    );
}
