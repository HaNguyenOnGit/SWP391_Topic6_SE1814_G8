import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
                <h1>Thông báo</h1>

                {contracts.length === 0 ? (
                    <p>Không có thông báo nào.</p>
                ) : (
                    <ul>
                        {contracts.map((contract) => (
                            <li key={contract.contractId}>
                                <strong>{contract.vehicleName}</strong> — Trạng thái:{" "}
                                <span style={{ fontWeight: 500 }}>{contract.status}</span>
                                {contract.status === "Pending" && (
                                    <span>
                                        {" "}
                                        -{" "}
                                        <Link
                                            to={`/contractVerify/${contract.contractId}`}
                                            style={{ color: "blue" }}
                                        >
                                            Xác nhận hợp đồng
                                        </Link>
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
