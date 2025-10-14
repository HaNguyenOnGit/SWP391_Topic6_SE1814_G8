import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
                    <Link to="/vehicles" className="hover:text-gray-300">
                        Xe của bạn
                    </Link>
                    <Link to="/schedule" className="hover:text-gray-300">
                        Đặt lịch
                    </Link>
                    <Link to="/usageHistory" className="hover:text-gray-300">
                        Lịch sử
                    </Link>
                    <Link to="/notifycaition" className="hover:text-gray-300">
                        Thông báo
                    </Link>
                    <Link to="/support" className="hover:text-gray-300">
                        Hỗ trợ
                    </Link>
                </div>
                <div
                    className="username"
                    onClick={handleProfileClick}
                >
                    <FaUserCircle size={28} />
                    <span>{username}</span>
                </div>
            </div>
        </nav>
    );
}
