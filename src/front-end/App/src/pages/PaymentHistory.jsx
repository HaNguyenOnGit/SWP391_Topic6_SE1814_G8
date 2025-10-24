import { useParams } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import "./PaymentHistory.css";

export default function PaymentHistory() {
    const { id } = useParams();

    const vehicles = [
        { id: "1", name: "Xe Honda City", plate: "59D3 - 23456", status: "Đang sử dụng" },
        { id: "2", name: "Xe Toyota Vios", plate: "60A - 56789", status: "Đang trống" },
        { id: "3", name: "Xe Ford Ranger", plate: "61C - 11122", status: "Chưa kích hoạt hợp đồng" },
    ];

    const vehicle = vehicles.find((v) => v.id === id);

    // Mock payment data (with some negative paid values)
    const payments = [
        {
            id: 1,
            name: "Phí bảo dưỡng định kỳ",
            total: "2,000,000đ",
            date: "2025-10-02",
            paid: "-500,000đ",
            proposer: "Nguyễn Văn A",
        },
        {
            id: 2,
            name: "Phí rửa xe hàng tuần",
            total: "300,000đ",
            date: "2025-09-29",
            paid: "100,000đ",
            proposer: "Trần Thị B",
        },
        {
            id: 3,
            name: "Phí gửi xe tháng 10",
            total: "1,500,000đ",
            date: "2025-09-25",
            paid: "-750,000đ",
            proposer: "Lê Văn C",
        },
    ];

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <div className="main-content-layout">
                    <VehicleInfo vehicle={vehicle} />
                    <div className="payment-container">
                        <h2 className="payment-title">Lịch sử chi tiêu</h2>
                        <div className="payment-list">
                            {payments.map((p) => (
                                <div key={p.id} className="payment-item">
                                    <div className="payment-info">
                                        <div className="payment-name">{p.name}</div>
                                        <div className="payment-meta">{p.date}</div>
                                        <div className="payment-meta">{p.proposer}</div>
                                    </div>
                                    <div className="payment-amount">
                                        <div>{p.paid}</div>
                                        <div>-150.000đ</div> {/* Nếu bạn muốn giữ dòng này giống mẫu */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
