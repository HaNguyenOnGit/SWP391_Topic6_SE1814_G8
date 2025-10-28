
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "./Payment.css";


export default function PaymentHistory() {
    const { id } = useParams(); // contractId
    const { userId } = useAuth();
    const [vehicle, setVehicle] = useState(null);
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [step, setStep] = useState("list");
    const [method, setMethod] = useState("Chuyển khoản ngân hàng");
    const [file, setFile] = useState(null);
    const [bankInfo, setBankInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy thông tin xe
                const contractRes = await axios.get(`/api/contract/contract-detail/${id}`);
                setVehicle(contractRes.data);

                // Lấy danh sách các khoản thanh toán của user trong hợp đồng
                const paymentsRes = await axios.get(`/api/payment/contract/${id}/user/${userId}`);
                setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
            } catch (err) {
                setError("Không thể tải dữ liệu thanh toán.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, userId]);

    const handleBack = () => {
        setStep("list");
        setSelectedPayment(null);
        setFile(null);
    };


    if (loading) return <div style={{ textAlign: "center", color: "#555" }}>Đang tải dữ liệu...</div>;
    if (error) return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
    if (!vehicle || payments.length === 0)
        return <div style={{ textAlign: "center", color: "#555" }}>Không có dữ liệu thanh toán.</div>;

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <div className="main-content-layout">
                    <VehicleInfo vehicle={vehicle} />

                    {step === "list" && (
                        <div className="payment-section fade-slide-in">
                            <h3>Chọn khoản thanh toán</h3>
                            <div className="payment-list">
                                {payments.map((p) => (
                                    <div
                                        key={p.settlementId}
                                        className="payment-item"
                                        onClick={async () => {
                                            if (p.status === "Pending" || p.status === "Unpaid") {
                                                setSelectedPayment(p);
                                                setStep("form");
                                                try {
                                                    const bankRes = await axios.get(`/api/payment/settlement/${p.settlementId}/receiver-info`);
                                                    setBankInfo(bankRes.data);
                                                } catch {
                                                    setBankInfo(null);
                                                }
                                            }
                                        }}
                                    >
                                        <div className="left">
                                            <span className="name">{p.expense?.description}</span>
                                            <span className="date">{p.expense?.expenseDate}</span>
                                            <span>{p.method}</span>
                                        </div>
                                        <div className="right">
                                            <div className={`amount ${p.status === "Paid" ? "green" : "red"}`}>{p.amount?.toLocaleString("vi-VN")}</div>
                                            <div className="total">{p.expense?.amount?.toLocaleString("vi-VN")}</div>
                                            {p.proofImageUrl && (
                                                <a href={p.proofImageUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                                                    <span role="img" aria-label="bill">🧾</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "form" && selectedPayment && (
                        <div className="payment-form fade-slide-in">
                            <h3>Thông tin thanh toán</h3>
                            <div className="payment-details">
                                <div className="row-amount">
                                    <b>Tổng:</b>
                                    <span className="total">{selectedPayment.totalAmount?.toLocaleString("vi-VN") || selectedPayment.expenseAmount?.toLocaleString("vi-VN") || selectedPayment.amount?.toLocaleString("vi-VN") || "-"} ₫</span>
                                </div>
                                <div className="row-amount">
                                    <b>Số tiền của bạn:</b>
                                    <span className="user-amount">{selectedPayment.amount?.toLocaleString("vi-VN") || "-"} ₫</span>
                                </div>
                                <div className="row-amount column">
                                    <b>Số tiền cần trả</b>
                                    <input
                                        className="txtInput"
                                        type="text"
                                        value={selectedPayment.amount?.toLocaleString("vi-VN") || "-"}
                                        readOnly
                                    />
                                </div>
                                <div className="row-payment column">
                                    <b>Hình thức thanh toán</b>
                                    <select
                                        className="txtInput"
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value)}
                                    >
                                        <option>Chuyển khoản ngân hàng</option>
                                    </select>
                                </div>
                                <div className="row-recipient">
                                    <b>Người nhận:</b>&nbsp; <span>{bankInfo?.accountName || "-"}</span>
                                </div>
                            </div>
                            <div className="payment-actions">
                                <button className="payment-btn btn-cancel" onClick={handleBack}>
                                    Hủy
                                </button>
                                <button className="payment-btn btn-confirm" onClick={() => setStep("qr")}>Thanh toán</button>
                            </div>
                        </div>
                    )}

                    {step === "qr" && (
                        <div className="payment-qr fade-slide-in">
                            <h3>Thanh toán</h3>
                            <div className="qr-box"></div>
                            <div>{method}</div>
                            <div>{bankInfo?.accountName}</div>
                            <div>{bankInfo?.bankName}</div>
                            <div>{bankInfo?.accountNumber}</div>
                            <div><b>Số tiền:</b> {selectedPayment?.amount?.toLocaleString("vi-VN") || "-"}</div>
                            <div className="payment-actions">
                                <button className="payment-btn btn-cancel" onClick={handleBack}>Hủy</button>
                                <button className="payment-btn btn-confirm" onClick={() => setStep("confirm")}>Xác nhận</button>
                            </div>
                        </div>
                    )}

                    {step === "confirm" && (
                        <div className="payment-confirm fade-slide-in">
                            <h3>Xác minh thanh toán</h3>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            {file && <p style={{ color: "green" }}>Đã chọn: {file.name}</p>}
                            <p>Upload bill chuyển khoản</p>
                            <div className="payment-actions">
                                <button className="payment-btn btn-confirm" onClick={async () => {
                                    // Gọi API xác nhận thanh toán
                                    if (!selectedPayment) return;
                                    const formData = new FormData();
                                    formData.append("settlementId", selectedPayment.settlementId);
                                    formData.append("payerId", userId);
                                    formData.append("amount", selectedPayment.amount);
                                    // Luôn gửi method là tiếng Anh 'Banking'
                                    formData.append("method", "Banking");
                                    if (file) formData.append("proofImage", file);
                                    try {
                                        await axios.post("/api/payment/confirm", formData);
                                        setStep("success");
                                    } catch {
                                        alert("Xác nhận thanh toán thất bại!");
                                    }
                                }}>Xác nhận</button>
                            </div>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="payment-success fade-slide-in">
                            Xác minh chuyển khoản thành công
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
