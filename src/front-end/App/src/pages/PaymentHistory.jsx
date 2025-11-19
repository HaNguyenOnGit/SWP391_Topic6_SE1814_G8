import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../Navbar";
import VehicleInfo from "../VehicleInfo";
import VehicleSidebar from "../VehicleSidebar";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "./PaymentHistory.css";

export default function PaymentHistory() {
    const { id } = useParams();
    const { userId } = useAuth();

    const [vehicle, setVehicle] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

    const reloadPayments = async () => {
        try {
            const res = await axios.get(
                `/api/payment/contract/${id}/user/${userId}/settlement-history`
            );
            setPayments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách thanh toán:", err);
            setPayments([]);
        }
    };

    useEffect(() => {
        if (!userId || !id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const contractRes = await axios.get(`/api/contract/contract-detail/${id}`);
                setVehicle(contractRes.data);
                await reloadPayments();
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu lịch sử thanh toán.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, userId]);

    if (loading)
        return <div style={{ textAlign: "center", padding: 20 }}>Đang tải dữ liệu...</div>;

    if (error)
        return <div style={{ textAlign: "center", color: "red" }}>{error}</div>;

    if (!vehicle)
        return <div style={{ textAlign: "center" }}>Không tìm thấy hợp đồng.</div>;

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content payment-shell">
                <div className="page-with-sidebar">
                    <VehicleSidebar contractId={id} />
                    <div className="page-main">
                        <div className="payment-content">
                            <VehicleInfo vehicle={vehicle} />
                            <div className="payment-container">
                                <h2 className="payment-title">Lịch sử thanh toán của bạn</h2>

                                <div
                                    className="scroll-box"
                                    style={{
                                        maxHeight: "calc(100vh - 280px)",
                                        overflowY: "auto",
                                        paddingRight: "8px",
                                        marginTop: "8px",
                                    }}
                                >
                                    {payments.length === 0 ? (
                                        <p className="empty-message">
                                            Chưa có lịch sử thanh toán nào.
                                        </p>
                                    ) : (
                                        <ul
                                            className={`payment-list ${!isAnimating ? "fade-slide-in" : "fade-slide-out"
                                                }`}
                                        >
                                            {payments.map((p) => (
                                                <li key={p.settlementId} className="payment-item">
                                                    <div className="payment-info">
                                                        <div className="payment-name">
                                                            {p.expenseName}
                                                        </div>
                                                        <div className="payment-meta">
                                                            Ngày:{" "}
                                                            {p.paymentDate
                                                                ? new Date(p.paymentDate).toLocaleDateString(
                                                                    "vi-VN"
                                                                )
                                                                : "Chưa có"}
                                                        </div>
                                                        <div className="payment-meta">
                                                            Người nhận: {p.receiverName}
                                                        </div>
                                                    </div>

                                                    <div className="payment-amount">
                                                        <div>
                                                            Đã trả:{" "}
                                                            {p.userPaidAmount?.toLocaleString("vi-VN")} ₫
                                                        </div>
                                                        <div>
                                                            Tổng:{" "}
                                                            {p.totalExpenseAmount?.toLocaleString("vi-VN")} ₫
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
