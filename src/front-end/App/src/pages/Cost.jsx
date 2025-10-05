// src/pages/CostDetail.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";

export default function CostDetail() {
    const { id } = useParams();

    // Mock data xe
    const vehicles = [
        { id: "1", name: "Xe Honda City", plate: "59D3 - 23456", status: "Đang sử dụng" },
        { id: "2", name: "Xe Toyota Vios", plate: "60A - 56789", status: "Đang trống" },
        { id: "3", name: "Xe Ford Ranger", plate: "61C - 11122", status: "Chưa kích hoạt hợp đồng" },
    ];
    const vehicle = vehicles.find((v) => v.id === id);

    // Mock data chi phí
    const costs = [
        { type: "Phí sạc điện", amount: 150000, detail: "Chi phí sạc điện hàng tháng." },
        { type: "Bảo trì, bảo dưỡng", amount: 550000, detail: "Chi phí thay dầu, kiểm tra định kỳ." },
        { type: "Phí bảo hiểm", amount: 350000, detail: "Phí bảo hiểm trách nhiệm dân sự bắt buộc." },
        { type: "Phí đăng kiểm", amount: 200000, detail: "Chi phí đăng kiểm xe hàng năm." },
        { type: "Phí khấu hao", amount: 200000, detail: "Khấu hao giá trị xe theo thời gian." },
    ];

    const [selectedCost, setSelectedCost] = useState(null);

    if (!vehicle) return <h2>Không tìm thấy phương tiện</h2>;

    return (
        <div>
            <Navbar username="Username" />
            <div className="p-6">

            <VehicleInfo vehicle={vehicle} />

                <h3 className="mt-4 font-semibold">Thông tin chi phí</h3>

                {/* Nếu chưa chọn cost thì hiển thị danh sách */}
                {!selectedCost ? (
                    <ul className="mt-2">
                        {costs.map((c, i) => (
                            <li key={i} className="flex justify-between items-center border-b py-2">
                                <div>
                                    <span>{c.type}: </span>
                                    <span
                                        className={c.amount > 300000 ? "text-red-500" : "text-green-500"}
                                    >
                                        {c.amount.toLocaleString()}đ
                                    </span>
                                </div>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault(); // chặn reload trang
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
                    // Nếu đã chọn cost thì hiển thị chi tiết
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                        <h4 className="font-bold">{selectedCost.type}</h4>
                        <p className="mt-2">
                            Số tiền:{" "}
                            <span
                                className={selectedCost.amount > 300000 ? "text-red-500" : "text-green-500"}
                            >
                                {selectedCost.amount.toLocaleString()}đ
                            </span>
                        </p>
                        <p className="mt-2">{selectedCost.detail}</p>
                        <Link
                            to="#"
                            onClick={(e) => {
                                e.preventDefault(); // chặn điều hướng
                                setSelectedCost(null);
                            }}
                            className="text-blue-500 hover:underline mt-4 block"
                        >
                            ← Quay lại danh sách chi phí
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
