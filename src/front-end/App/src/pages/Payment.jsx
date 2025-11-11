import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../Navbar";
import VehicleInfo from "../VehicleInfo";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "./Payment.css";

export default function Payment() {
    const { id } = useParams(); // contractId
    const { userId } = useAuth();
    const [vehicle, setVehicle] = useState(null);
    const [payments, setPayments] = useState([]);
    const [unpaidPayments, setUnpaidPayments] = useState([]);
    const [paidPayments, setPaidPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [step, setStep] = useState("list");
    const [method, setMethod] = useState("Chuyển khoản ngân hàng");
    const [file, setFile] = useState(null);
    const [bankInfo, setBankInfo] = useState(null);
    const [qrUrl, setQrUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reloadPayments = async () => {
        try {
            const res = await axios.get(`/api/payment/contract/${id}/user/${userId}`);
            const list = Array.isArray(res.data) ? res.data : [];

            // Normalize status
            const normalize = (s) => (s || "").toLowerCase();

            // CHƯA THANH TOÁN (pending + unpaid)
            const unpaid = list
                .filter(p => ["pending", "unpaid"].includes(normalize(p.status)))
                .sort((a, b) => new Date(a.expense.expenseDate) - new Date(b.expense.expenseDate));

            // ĐÃ THANH TOÁN
            const paid = list
                .filter(p => normalize(p.status) === "paid")
                .sort((a, b) => new Date(b.expense.expenseDate) - new Date(a.expense.expenseDate));

            setPayments(list);
            setUnpaidPayments(unpaid);
            setPaidPayments(paid);

        } catch (err) {
            console.error(err);
            setPayments([]);
            setUnpaidPayments([]);
            setPaidPayments([]);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const contractRes = await axios.get(`/api/contract/contract-detail/${id}`);
                setVehicle(contractRes.data);
                await reloadPayments();
            } catch (err) {
                setError("Không thể tải dữ liệu thanh toán.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, userId]);


    const buildQR = (info, amount, desc) => {
        // API public VietQR
        return `https://img.vietqr.io/image/${info.bankName}-${info.bankAccount}-compact.png?amount=${amount}&addInfo=${desc}`;
    }

    const handleBack = () => {
        setStep("list");
        setSelectedPayment(null);
        setFile(null);
        setQrUrl("");
    };

    if (loading)
        return <div style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</div>;

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

                    {step === "list" && (
                        <div className="payment-section fade-slide-in">
                            <h3>Danh sách thanh toán</h3>

                            {/* ✅ CHƯA THANH TOÁN */}
                            <h4 style={{ marginTop: 10 }}>Chưa thanh toán</h4>
                            {unpaidPayments.length === 0 && <div>✔ Tất cả đã thanh toán!</div>}

                            <div className="scroll-box">
                                <div className="payment-list">
                                    {unpaidPayments.map((p) => (
                                        <div
                                            key={p.settlementId}
                                            className="payment-item"
                                            onClick={async () => {
                                                setSelectedPayment(p);
                                                setStep("form");
                                                try {
                                                    const bankRes = await axios.get(`/api/payment/settlement/${p.settlementId}/receiver-info`);
                                                    setBankInfo(bankRes.data);
                                                } catch {
                                                    setBankInfo(null);
                                                }
                                            }}
                                        >
                                            <div className="left">
                                                <span className="name">{p.expense?.description}</span>
                                                <span className="date">{p.expense?.expenseDate}</span>
                                            </div>
                                            <div className="right">
                                                <div className="amount red">{p.amount?.toLocaleString("vi-VN")}</div>
                                                <div className="total">{p.expense?.amount?.toLocaleString("vi-VN")}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ✅ ĐÃ THANH TOÁN */}
                            <h4 style={{ marginTop: 20 }}>Đã thanh toán</h4>
                            {paidPayments.length === 0 && <div>Chưa có thanh toán nào!</div>}

                            <div className="scroll-box">
                                <div className="payment-list">
                                    {paidPayments.map((p) => (
                                        <div key={p.settlementId} className="payment-item paid">
                                            <div className="left">
                                                <span className="name">{p.expense?.description}</span>
                                                <span className="date">{p.expense?.expenseDate}</span>
                                            </div>
                                            <div className="right">
                                                <div className="amount green">{p.amount?.toLocaleString("vi-VN")}</div>
                                                {p.proofImageUrl && (
                                                    <a href={p.proofImageUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                                                        🧾
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                    {step === "form" && selectedPayment && (
                        <div className="payment-form fade-slide-in">
                            <h3>Thông tin thanh toán</h3>
                            <div className="payment-details">
                                <div className="row-amount">
                                    <b>Tổng:</b>
                                    <span className="total">
                                        {selectedPayment.expense?.amount?.toLocaleString("vi-VN")} ₫
                                    </span>
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
                                    <b>Người nhận:</b>&nbsp; <span>{bankInfo?.fullName || "-"}</span>
                                </div>
                            </div>
                            <div className="payment-actions">
                                <button className="payment-btn btn-cancel" onClick={handleBack}>
                                    Hủy
                                </button>
                                <button className="payment-btn btn-confirm" onClick={() => {
                                    if (bankInfo) {
                                        const desc = `EVCO-${selectedPayment.settlementId}`;
                                        setQrUrl(buildQR(bankInfo, selectedPayment.amount, desc));
                                    }
                                    setStep("qr");
                                }}>Thanh toán</button>
                            </div>
                        </div>
                    )}

                    {step === "qr" && (
                        <div className="payment-qr fade-slide-in">
                            <h3>Thanh toán</h3>

                            <div className="qr-box">
                                {qrUrl && <img src={qrUrl} alt="QR Banking" style={{ width: 200 }} />}
                            </div>

                            <div>{bankInfo?.fullName}</div>
                            <div>{bankInfo?.bankName}</div>
                            <div>{bankInfo?.bankAccount}</div>
                            <div><b>Số tiền:</b> {selectedPayment?.amount?.toLocaleString("vi-VN") || "-"}</div>
                            <div><b>Nội dung:</b> EVCO-{selectedPayment?.settlementId}</div>

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
                                    if (!selectedPayment) return;
                                    const formData = new FormData();
                                    formData.append("settlementId", selectedPayment.settlementId);
                                    formData.append("payerId", userId);
                                    formData.append("amount", selectedPayment.amount);
                                    formData.append("method", "Banking");

                                    if (file) formData.append("proofImage", file);

                                    try {
                                        await axios.post("/api/payment/confirm", formData);
                                        await reloadPayments();
                                        setSelectedPayment(null);
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
                            ✅ Xác minh chuyển khoản thành công
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
