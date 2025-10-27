// src/pages/CostDetail.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import "./Cost.css";

export default function CostDetail() {
    const { id } = useParams();

    const vehicles = [
        { id: "6", name: "Xe Honda City", plate: "59D3 - 23456", status: "Đang sử dụng" },
        { id: "2", name: "Xe Toyota Vios", plate: "60A - 56789", status: "Đang trống" },
        { id: "3", name: "Xe Ford Ranger", plate: "61C - 11122", status: "Chưa kích hoạt hợp đồng" },
    ];
    const vehicle = vehicles.find((v) => v.id === id);

    const costs = [
        { type: "Phí sạc điện", amount: 150000, detail: "Chi phí sạc điện hàng tháng." },
        { type: "Bảo trì, bảo dưỡng", amount: 550000, detail: "Chi phí thay dầu, kiểm tra định kỳ." },
        { type: "Phí bảo hiểm", amount: 350000, detail: "Phí bảo hiểm trách nhiệm dân sự bắt buộc." },
        { type: "Phí đăng kiểm", amount: 200000, detail: "Chi phí đăng kiểm xe hàng năm." },
        { type: "Phí khấu hao", amount: 200000, detail: "Khấu hao giá trị xe theo thời gian." },
    ];

    const owners = [
        { name: "username1", ratio: 40 }, // Bạn đang xem
        { name: "username2", ratio: 30 },
        { name: "username3", ratio: 30 },
    ];

    const [selectedCost, setSelectedCost] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    if (!vehicle) return <h2>Không tìm thấy phương tiện</h2>;

    const calcTotalFromUser = (userAmount, userRatio) =>
        Math.round(userAmount / (userRatio / 100));

    const calcShares = (total) =>
        owners.map((o) => ({
            ...o,
            share: Math.round((o.ratio / 100) * total),
        }));

    const handlePayment = () => {
        console.log("Thanh toán được kích hoạt (chưa thực hiện xử lý).");
    };

    const handleShowDetail = (cost) => {
        setIsAnimating(true);
        setTimeout(() => {
            setSelectedCost(cost);
            setIsAnimating(false);
        }, 300);
    };

    const handleBack = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setSelectedCost(null);
            setIsAnimating(false);
        }, 300);
    };

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <div className="main-content-layout">
                    <VehicleInfo vehicle={vehicle} />
                    <div className="cost-section">
                        <h3 className="cost-section-title">Thông tin chi phí</h3>

                        {!selectedCost ? (
                            <ul className={`cost-list ${!selectedCost ? "fade-slide-in" : "fade-slide-out"}`}>
                                {costs.map((c, i) => (
                                    <li key={i} className="cost-item">
                                        <div className="cost-left">
                                            <span className="cost-type">{c.type}</span>
                                            <span
                                                className={`cost-amount ${c.amount > 300000 ? "red" : "green"
                                                    }`}
                                            >
                                                {c.amount.toLocaleString()}đ
                                            </span>
                                        </div>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleShowDetail(c);
                                            }}
                                            className="cost-detail-link"
                                        >
                                            Xem thông tin chi tiết
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={`cost-detail-card ${selectedCost ? "fade-slide-in" : "fade-slide-out"}`}>

                                <h4 className="cost-detail-title">{selectedCost.type}</h4>
                                <p className="cost-detail-desc">{selectedCost.detail}</p>

                                {(() => {
                                    const total = calcTotalFromUser(selectedCost.amount, 40);
                                    const shares = calcShares(total);
                                    return (
                                        <>
                                            <div className="cost-total">
                                                <span>Tổng:</span>
                                                <span className="total-value">
                                                    {total.toLocaleString()}đ
                                                </span>
                                            </div>

                                            <div className="your-amount">
                                                <span>Số tiền của bạn:</span>
                                                <span className="your-value">
                                                    {selectedCost.amount.toLocaleString()}đ
                                                </span>
                                            </div>

                                            <h5 className="cost-method">Hình thức</h5>
                                            <p className="cost-note">Theo tỉ lệ sở hữu</p>

                                            <div className="share-list">
                                                {shares.map((o, i) => (
                                                    <div key={i} className="share-item">
                                                        <span>{o.name}</span>
                                                        <div className="share-right">
                                                            <div className="ratio">{o.ratio}%</div>
                                                            <div className="share-value">
                                                                {o.share.toLocaleString()}đ
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}

                                <button className="btn-pay" onClick={handlePayment}>
                                    Thanh toán
                                </button>

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
