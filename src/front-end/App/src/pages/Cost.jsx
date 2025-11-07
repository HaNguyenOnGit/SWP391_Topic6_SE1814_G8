import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "./Cost.css";

export default function CostDetail() {
    const { id } = useParams(); // contractId
    const { userId } = useAuth();

    const [vehicle, setVehicle] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

    const translateAllocationRule = (rule) => {
        if (!rule) return "";
        const r = String(rule).toLowerCase();
        switch (r) {
            case "byshare":
            case "byshare":
                return "Theo tỉ lệ sở hữu";
            case "selfpaid":
            case "self_paid":
            case "selfpaid":
                return "Tự trả";
            case "byshareplus":
            case "byshare_plus":
                return "Theo tỉ lệ + cố định";
            default:
                return rule;
        }
    };

    const reloadExpenses = async () => {
        try {
            const res = await axios.get(`/api/payment/contract/${id}/user/${userId}/user-expenses`);
            setExpenses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách chi phí:", err);
            setExpenses([]);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const contractRes = await axios.get(`/api/contract/contract-detail/${id}`);
                setVehicle(contractRes.data);
                await reloadExpenses();
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu chi phí.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, userId]);

    const handleShowDetail = async (expense) => {
        setIsAnimating(true);
        try {
            const res = await axios.get(`/api/payment/expense/${expense.expenseId}/user/${userId}/detail`);
            setTimeout(() => {
                setSelectedExpense({ ...expense, detail: res.data });
                setIsAnimating(false);
            }, 300);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết expense:", err);
            alert("Không thể tải chi tiết chi phí.");
            setIsAnimating(false);
        }
    };

    const handleBack = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setSelectedExpense(null);
            setIsAnimating(false);
        }, 300);
    };

    if (loading)
        return <div style={{ textAlign: "center", padding: 20 }}>Đang tải dữ liệu...</div>;

    if (error)
        return <div style={{ textAlign: "center", color: "red" }}>{error}</div>;

    if (!vehicle)
        return <div style={{ textAlign: "center" }}>Không tìm thấy hợp đồng.</div>;

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <div className="main-content-layout">
                    <VehicleInfo vehicle={vehicle} />
                    <div className="cost-section">
                        <h3 className="cost-section-title">Thông tin chi phí</h3>

                        {!selectedExpense ? (
                            <div
                                className="scroll-box"
                                style={{
                                    maxHeight: "calc(100vh - 280px)",
                                    overflowY: "auto",
                                    paddingRight: "8px",
                                    marginTop: "8px",
                                }}
                            >
                                <ul className={`cost-list ${!isAnimating ? "fade-slide-in" : "fade-slide-out"}`}>
                                    {expenses.length === 0 && <li>Không có chi phí nào.</li>}
                                    {expenses.map((exp, i) => (
                                        <li key={i} className={`cost-item ${exp.status === "Paid" ? "paid" : ""}`}>
                                            <div className="cost-left">
                                                <span className="cost-type">{exp.expenseName}</span>
                                                <span
                                                    className={`cost-amount ${exp.status === "Paid" ? "green" : "red"}`}
                                                >
                                                    {exp.userAmount?.toLocaleString("vi-VN")} ₫
                                                </span>
                                            </div>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleShowDetail(exp);
                                                }}
                                                className="cost-detail-link"
                                            >
                                                Xem thông tin chi tiết
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (

                            <div
                                className={`cost-detail-card ${!isAnimating ? "fade-slide-in" : "fade-slide-out"}`}
                            >
                                <h4 className="cost-detail-title">
                                    {selectedExpense.detail.expenseName}
                                </h4>
                                <p className="cost-detail-desc">
                                    {translateAllocationRule(selectedExpense.detail.allocationRule)}
                                </p>

                                <div className="cost-total">
                                    <span>Tổng:</span>
                                    <span className="total-value">
                                        {selectedExpense.detail.totalAmount.toLocaleString("vi-VN")} ₫
                                    </span>
                                </div>

                                <div className="your-amount">
                                    <span>Số tiền của bạn:</span>
                                    <span
                                        className={`your-value ${selectedExpense.status === "Paid" ? "green" : "red"}`}
                                    >
                                        {selectedExpense.detail.userAmount.toLocaleString("vi-VN")} ₫
                                    </span>
                                </div>

                                <h5 className="cost-method">Hình thức</h5>
                                <p className="cost-note">Theo tỉ lệ sở hữu</p>

                                <div className="share-list">
                                    {selectedExpense.detail.owners.map((o, i) => (
                                        <div key={i} className="share-item">
                                            <span>{o.fullName}</span>
                                            <div className="share-right">
                                                <div className="ratio">{o.percent}%</div>
                                                <div className="share-value">
                                                    {o.amount.toLocaleString("vi-VN")} ₫
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedExpense.status !== "Paid" && (
                                    <Link to={`/vehicle/${id}/payment`} className="btn-pay">
                                        Thanh toán
                                    </Link>
                                )}

                                <div className="back-section">
                                    <Link
                                        to="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleBack();
                                        }}
                                        className="back-link"
                                    >
                                        ← Quay lại danh sách chi phí
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}