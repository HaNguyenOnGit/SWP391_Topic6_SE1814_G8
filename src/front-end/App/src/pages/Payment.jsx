import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import "./Payment.css";

export default function PaymentHistory() {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [step, setStep] = useState("list");
    const [method, setMethod] = useState("chuyển khoản ngân hàng");
    const [file, setFile] = useState(null);
    const [bankInfo, setBankInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            await new Promise((r) => setTimeout(r, 400));

            const vehicleData = [
                { id: "6", name: "Xe Honda City", plate: "59D3 - 23456", status: "Đang sử dụng" },
                { id: "2", name: "Xe Toyota Vios", plate: "60A - 56789", status: "Đang trống" },
                { id: "3", name: "Xe Ford Ranger", plate: "61C - 11122", status: "Chưa kích hoạt hợp đồng" },
            ].find((v) => v.id === id);

            const paymentsData = [
                { id: 1, name: "Phí bảo dưỡng định kỳ", total: "2,000,000đ", date: "2025-10-02", paid: "500,000đ", proposer: "Nguyễn Văn A", status: "Not Paid" },
                { id: 2, name: "Phí rửa xe hàng tuần", total: "300,000đ", date: "2025-09-29", paid: "300,000đ", proposer: "Trần Thị B", status: "Paid" },
                { id: 3, name: "Phí gửi xe tháng 10", total: "1,500,000đ", date: "2025-09-25", paid: "750,000đ", proposer: "Lê Văn C", status: "Not Paid" },
            ];

            const bankInfoData = {
                accountName: "CÔNG TY TNHH EV SHARE",
                bankName: "Vietcombank",
                accountNumber: "0123456789",
                method: "chuyển khoản ngân hàng",
            };

            setVehicle(vehicleData);
            setPayments(paymentsData);
            setBankInfo(bankInfoData);
        };

        fetchData();
    }, [id]);

    const handleBack = () => {
        setStep("list");
        setSelectedPayment(null);
        setFile(null);
    };

    if (!vehicle || !bankInfo || payments.length === 0)
        return <div style={{ textAlign: "center", color: "#555" }}>Đang tải dữ liệu...</div>;

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
                                        key={p.id}
                                        className="payment-item"
                                        onClick={() => {
                                            if (p.status === "Not Paid") {
                                                setSelectedPayment(p);
                                                setStep("form");
                                            }
                                        }}
                                    >
                                        <div className="left">
                                            <span className="name">{p.name}</span>
                                            <span className="date">{p.date}</span>
                                            <span>{p.proposer}</span>
                                        </div>
                                        <div className="right">
                                            <div className={`amount ${p.status === "Paid" ? "green" : "red"}`}>{p.paid}</div>
                                            <div className="total">{p.total}</div>
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
                                    <span className="total">{selectedPayment.total.toLocaleString("vi-VN")} ₫</span>
                                </div>

                                <div className="row-amount">
                                    <b>Số tiền của bạn:</b>
                                    <span className="user-amount">850.000 ₫</span>
                                </div>

                                <div className="row-amount column">
                                    <b>Số tiền cần trả</b>
                                    <input
                                        className="txtInput"
                                        type="text"
                                        value={selectedPayment.total.toLocaleString("vi-VN")}
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
                                    <b>Người nhận:</b>&nbsp; <span>{bankInfo.accountName}</span>
                                </div>
                            </div>

                            <div className="payment-actions">
                                <button className="payment-btn btn-cancel" onClick={handleBack}>
                                    Hủy
                                </button>
                                <button className="payment-btn btn-confirm" onClick={() => setStep("qr")}>
                                    Thanh toán
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "qr" && (
                        <div className="payment-qr fade-slide-in">
                            <h3>Thanh toán</h3>
                            <div className="qr-box"></div>
                            <div>{method}</div>
                            <div>{bankInfo.accountName}</div>
                            <div>{bankInfo.bankName}</div>
                            <div>{bankInfo.accountNumber}</div>
                            <div><b>Số tiền:</b> {selectedPayment?.total}</div>

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
                                <button className="payment-btn btn-confirm" onClick={() => setStep("success")}>Xác nhận</button>
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
