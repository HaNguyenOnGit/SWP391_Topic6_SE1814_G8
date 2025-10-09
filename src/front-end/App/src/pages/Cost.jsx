// src/pages/CostDetail.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";

export default function CostDetail() {
    const { id } = useParams();

    // 🔹 Mock data xe
    const vehicles = [
        { id: "1", name: "Xe Honda City", plate: "59D3 - 23456", status: "Đang sử dụng" },
        { id: "2", name: "Xe Toyota Vios", plate: "60A - 56789", status: "Đang trống" },
        { id: "3", name: "Xe Ford Ranger", plate: "61C - 11122", status: "Chưa kích hoạt hợp đồng" },
    ];
    const vehicle = vehicles.find((v) => v.id === id);

    // 🔹 Tổng chi phí cho toàn xe (100%)
    const costs = [
        { type: "Phí sạc điện", amount: 150000, detail: "Chi phí sạc điện hàng tháng." },
        { type: "Bảo trì, bảo dưỡng", amount: 550000, detail: "Chi phí thay dầu, kiểm tra định kỳ." },
        { type: "Phí bảo hiểm", amount: 350000, detail: "Phí bảo hiểm trách nhiệm dân sự bắt buộc." },
        { type: "Phí đăng kiểm", amount: 200000, detail: "Chi phí đăng kiểm xe hàng năm." },
        { type: "Phí khấu hao", amount: 200000, detail: "Khấu hao giá trị xe theo thời gian." },
    ];

    // 🔹 Mock người sở hữu (tỷ lệ phần trăm đóng góp)
    const owners = [
        { name: "username1", ratio: 40 }, // Bạn đang xem
        { name: "username2", ratio: 30 },
        { name: "username3", ratio: 30 },
    ];

    const [selectedCost, setSelectedCost] = useState(null);

    if (!vehicle) return <h2>Không tìm thấy phương tiện</h2>;

    // 🔹 Tính tổng chi phí toàn xe (vì amount = phần 40%)
    const calcTotalFromUser = (userAmount, userRatio) =>
        Math.round(userAmount / (userRatio / 100));

    // 🔹 Tính phần chia của mỗi người
    const calcShares = (total) =>
        owners.map((o) => ({
            ...o,
            share: Math.round((o.ratio / 100) * total),
        }));

    const handlePayment = () => {
        // ⚠️ Bỏ thông báo — hiện chưa gắn hình thức thanh toán
        console.log("Thanh toán được kích hoạt (chưa thực hiện xử lý).");
    };

    return (
        <div>
            <Navbar username="Username" />
            <div className="p-6">
                <VehicleInfo vehicle={vehicle} />

                <h3 className="mt-4 font-semibold text-lg">Thông tin chi phí</h3>

                {/* 🔸 Danh sách chi phí */}
                {!selectedCost ? (
                    <ul className="mt-2">
                        {costs.map((c, i) => (
                            <li
                                key={i}
                                className="flex justify-between items-center border-b py-2"
                            >
                                <div>
                                    <span>{c.type}: </span>
                                    <span
                                        className={
                                            c.amount > 300000
                                                ? "text-red-500"
                                                : "text-green-500"
                                        }
                                    >
                                        {c.amount.toLocaleString()}đ
                                    </span>
                                </div>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedCost(c);
                                    }}
                                    className="text-blue-500 hover:underline text-sm cursor-pointer"
                                >
                                    Xem thông tin chi tiết
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    // 🔸 Chi tiết chi phí
                    <div className="mt-4 p-4 border rounded bg-gray-50 max-w-sm">
                        <h4 className="font-bold mb-2">{selectedCost.type}</h4>
                        <p className="text-gray-700 mb-3">{selectedCost.detail}</p>

                        {/* Tính tổng và phần chia */}
                        {(() => {
                            const total = calcTotalFromUser(selectedCost.amount, 40);
                            const shares = calcShares(total);
                            return (
                                <>
                                    <div className="flex justify-between font-semibold">
                                        <span>Tổng:</span>
                                        <span className="text-green-600">
                                            {total.toLocaleString()}đ
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                                        <span>Số tiền của bạn:</span>
                                        <span className="text-green-500">
                                            {selectedCost.amount.toLocaleString()}đ
                                        </span>
                                    </div>

                                    <h5 className="mt-3 font-semibold text-sm">Hình thức</h5>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Theo tỉ lệ sở hữu
                                    </p>

                                    <div className="space-y-2">
                                        {shares.map((o, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between items-center border rounded px-2 py-1 bg-white"
                                            >
                                                <span>{o.name}</span>
                                                <div className="text-right text-sm">
                                                    <div className="text-blue-500">{o.ratio}%</div>
                                                    <div className="text-gray-700">
                                                        {o.share.toLocaleString()}đ
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}

                        {/* Nút thanh toán */}
                        <button
                            onClick={handlePayment}
                            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                        >
                            Thanh toán
                        </button>

                        {/* Quay lại danh sách */}
                        <div className="mt-6 text-center">
                            <Link
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedCost(null);
                                }}
                                className="text-blue-500 hover:underline text-sm"
                            >
                                ← Quay lại danh sách chi phí
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
