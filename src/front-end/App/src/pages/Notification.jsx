import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FaBell } from "react-icons/fa";
import "./Notification.css";

export default function Notification() {
    const { user, isAuthenticated } = useAuth(); // ✅ lấy user từ context
    const userId = user?.id || user?.userId;     // ✅ đảm bảo lấy đúng ID
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated || !userId) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem thông báo.");
            return;
        }

        const fetchContracts = async () => {
            try {
                const res = await axios.get(`/api/contract/user-contracts/${userId}`);
                const data = res.data || [];
                data.reverse(); // Đảo ngược để hiển thị contract mới trước
                setContracts(data);
            } catch (err) {
                console.error("Lỗi khi tải hợp đồng:", err);
                setError("Không thể tải thông tin hợp đồng.");
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, [userId, isAuthenticated]);

    if (loading) return <p style={{ padding: "1rem" }}>Đang tải...</p>;
    if (error) return (
        <div className="main-container">
            <Navbar />
            <div className="main-content">
                <p style={{ color: "red" }}>{error}</p>
            </div>
        </div>
    );

    return (
        <div className="main-container">
            <Navbar />
            <div className="main-content">
                <h1><FaBell /> Thông báo</h1>

                {contracts.length === 0 ? (
                    <p className="no-notifications">Không có thông báo nào.</p>
                ) : (
                    <div className="notification-list">
                        {contracts.map((contract) => (
                            <div key={contract.contractId} className="notification-item">
                                <div className="notification-icon">
                                    <FaBell />
                                </div>
                                <div className="notification-content">
                                    <strong>{contract.vehicleName}</strong>
                                    <span>Trạng thái: {contract.status}</span>
                                    {contract.status === "Pending" && (
                                        <span>
                                            {" "}
                                            -{" "}
                                            <Link
                                                to={`/contractVerify/${contract.contractId}`}
                                                className="notification-link"
                                            >
                                                Xác nhận hợp đồng
                                            </Link>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
