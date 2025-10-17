import React from "react";
import Navbar from "../NavBar";
import { Link } from "react-router-dom";

export default function Vehicles() {
    const vehicles = [
        { id: 1, name: "Xe Honda City", status: "Đang sử dụng" },
        { id: 2, name: "Xe Toyota Vios", status: "Đang trống" },
        { id: 3, name: "Xe Ford Ranger", status: "Chưa kích hoạt hợp đồng" },
    ];

    // Hàm xác định class CSS cho trạng thái
    const getStatusClass = (status) => {
        if (status === "Đang sử dụng") return "using";
        if (status === "Đang trống") return "free";
        if (status === "Chưa kích hoạt hợp đồng") return "inactive";
        return "";
    };

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <h1 className="vehicle-title">Phương tiện của bạn</h1>
                <Link to="/newContract">Tạo hợp đồng →</Link>

                {/* Danh sách phương tiện */}
                <div className="vehicle-list">
                    {vehicles.map((vehicle) => (
                        <Link
                            key={vehicle.id}
                            to={`/vehicle/${vehicle.id}`}
                            className="vehicle-card"
                        >
                            <h3>{vehicle.name}</h3>
                            <div className={`status ${getStatusClass(vehicle.status)}`}>
                                {vehicle.status}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
