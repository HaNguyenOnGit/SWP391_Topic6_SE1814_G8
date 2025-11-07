import React, { useEffect, useState } from "react";
import Navbar from "../NavBar";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "./UsageHistory.css";

export default function UsageHistory() {
    const { userId } = useAuth();
    const [groupedPayments, setGroupedPayments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const fetchAllSettlements = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/payment/user/${userId}/all-settlements`);
                const data = res.data || [];
                data.reverse(); // Đảo ngược để hiển thị mới trước

                // ✅ Nhóm các thanh toán theo contractName
                const grouped = data.reduce((acc, item) => {
                    if (!acc[item.contractName]) acc[item.contractName] = [];
                    acc[item.contractName].push(item);
                    return acc;
                }, {});
                setGroupedPayments(grouped);
            } catch (err) {
                console.error(err);
                setError("Không thể tải lịch sử thanh toán.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllSettlements();
    }, [userId]);

    return (
        <div className="main-container">
            <Navbar />
            <div className="main-content">
                <h2 className="payment-title">Lịch sử thanh toán của bạn</h2>

                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : Object.keys(groupedPayments).length === 0 ? (
                    <p>Chưa có thanh toán nào.</p>
                ) : (
                    Object.entries(groupedPayments).map(([contractName, payments]) => (
                        <div key={contractName} className="payment-container">
                            <h3 className="contract-title">{contractName}</h3>

                            {/* ✅ Scroll box giống PaymentHistory */}
                            <div
                                className="scroll-box"
                                style={{
                                    maxHeight: "calc(100vh - 280px)",
                                    overflowY: "auto",
                                    paddingRight: "8px",
                                    marginTop: "8px",
                                }}
                            >
                                <ul className={`payment-list ${!isAnimating ? "fade-slide-in" : "fade-slide-out"}`}>
                                    {payments.map((p) => (
                                        <li key={p.settlementId} className="payment-item">
                                            <div className="payment-info">
                                                <div className="payment-name">{p.expenseName}</div>
                                                <div className="payment-meta">
                                                    Ngày:{" "}
                                                    {new Date(p.paymentDate).toLocaleDateString("vi-VN")}
                                                </div>
                                                <div className="payment-meta">
                                                    Người trả: {p.payerName}
                                                </div>
                                                <div className="payment-meta">
                                                    Người nhận: {p.receiverName}
                                                </div>
                                            </div>
                                            <div className="payment-amount">
                                                <div>
                                                    Đã trả: {p.userPaidAmount?.toLocaleString("vi-VN")} ₫
                                                </div>
                                                <div>
                                                    Tổng: {p.totalExpenseAmount?.toLocaleString("vi-VN")} ₫
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
