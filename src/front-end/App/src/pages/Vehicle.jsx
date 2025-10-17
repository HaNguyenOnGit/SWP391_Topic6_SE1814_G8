import React from "react";
import Navbar from "../NavBar";
import { useParams, Link } from "react-router-dom";
import VehicleInfo from "../VehicleInfo";
import "./Vehicle.css";

export default function Vehicle() {
    const { id } = useParams();

    // Mock data (sau này thay bằng API)
    const vehicles = [
        { id: 1, name: "Xe Honda City", plate: "59D3 - 23456", status: "Đang sử dụng" },
        { id: 2, name: "Xe Toyota Vios", plate: "60A - 56789", status: "Đang trống" },
        { id: 3, name: "Xe Ford Ranger", plate: "61C - 11122", status: "Chưa kích hoạt hợp đồng" },
    ];

    const vehicle = vehicles.find((v) => v.id.toString() === id);

    if (!vehicle) return <h2>Không tìm thấy phương tiện</h2>;

    const actions = [
        { name: "Đặt lịch", path: `/vehicle/${id}/schedule` },
        { name: "Check-in/out", path: `/vehicle/${id}/checkinHistory` },
        { name: "Thông tin chi phí", path: `/vehicle/${id}/costs` },
        { name: "Đề xuất khoản chi", path: `/vehicle/${id}/proposal` },
        { name: "Thanh toán", path: `/vehicle/${id}/payment` },
        { name: "Lịch sử", path: `/vehicle/${id}/history` },
    ];

    const getStatusColor = (status) => {
        if (status === "Đang sử dụng") return "green";
        if (status === "Đang trống") return "orange";
        if (status === "Chưa kích hoạt hợp đồng") return "red";
        return "black";
    };

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <div className="main-content-layout">
                    <VehicleInfo vehicle={vehicle} />

                    <div className="action-menu">
                        {actions.map((action, idx) => (
                            <div key={idx} className="action-item">
                                <Link to={action.path}>{action.name}</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
