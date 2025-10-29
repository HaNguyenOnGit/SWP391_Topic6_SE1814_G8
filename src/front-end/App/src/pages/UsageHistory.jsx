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

    useEffect(() => {
        if (!userId) return;

        const fetchAllSettlements = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/payment/user/${userId}/all-settlements`);
                const data = res.data || [];

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
                <h2>Lịch sử thanh toán của bạn</h2>

                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : Object.keys(groupedPayments).length === 0 ? (
                    <p>Chưa có thanh toán nào.</p>
                ) : (
                    Object.entries(groupedPayments).map(([contractName, payments]) => (
                        <div key={contractName} className="contract-group">
                            <h3 className="contract-title">{contractName}</h3>
                            {payments.map((p) => (
                                <div key={p.settlementId} className="payment-item">
                                    <div><strong>Chi phí:</strong> {p.expenseName}</div>
                                    <div><strong>Bạn trả:</strong> {p.userPaidAmount?.toLocaleString("vi-VN")}đ</div>
                                    <div><strong>Tổng:</strong> {p.totalExpenseAmount?.toLocaleString("vi-VN")}đ</div>
                                    <div><strong>Ngày:</strong> {new Date(p.paymentDate).toLocaleDateString("vi-VN")}</div>
                                    <div><strong>Người nhận:</strong> {p.receiverName}</div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
