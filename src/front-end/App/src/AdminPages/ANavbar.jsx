import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";

export default function AdminNavbar({ adminName }) {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate("/admin/profile");
    };

    return (
        <nav className="flex items-center justify-between bg-gray-900 px-6 py-3 text-white">
            {/* Left Side Menu */}
            <div className="flex space-x-6">
                <Link to="/admin/users" className="hover:text-gray-300">
                    Quản lý user
                </Link>
                <Link to="/admin/contracts" className="hover:text-gray-300">
                    Quản lý hợp đồng
                </Link>
                <Link to="/admin/overview" className="hover:text-gray-300">
                    Tổng quan
                </Link>
            </div>

            {/* Admin Box */}
            <div
                className="flex items-center space-x-2 cursor-pointer hover:text-gray-300"
                onClick={handleProfileClick}
            >
                <FaUserShield size={28} />
                <span>{adminName}</span>
            </div>
        </nav>
    );
}
