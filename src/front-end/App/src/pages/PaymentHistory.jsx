import { useParams } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";

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
        <div>
            <Navbar username="Username" />
            <div className="p-6">
                <VehicleInfo vehicle={vehicle} />

                <h2 className="text-xl font-semibold mt-6 mb-3">Lịch sử thanh toán</h2>
                <div className="border rounded-lg p-4 max-h-80 overflow-y-auto space-y-4 bg-gray-50">
                    {payments.map((p) => (
                        <div
                            key={p.id}
                            className="p-3 border rounded-md bg-white shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-between font-medium text-gray-800">
                                <span>{p.name}</span>
                                <span>{p.total}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                <div>{p.date}</div>
                                <div>
                                    <span
                                        className={
                                            p.paid.startsWith("-") ? "text-red-600 font-semibold" : "text-green-600"
                                        }
                                    >
                                        {p.paid}
                                    </span>
                                </div>
                                <div>{p.proposer}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
