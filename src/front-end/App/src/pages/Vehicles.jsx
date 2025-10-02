import React from "react";
import Navbar from "../NavBar";
import { Link } from "react-router-dom";

export default function Vehicles() {
    // Mock data
    const vehicles = [
        { id: 1, name: "Xe Honda City", status: "Đang sử dụng" },
        { id: 2, name: "Xe Toyota Vios", status: "Đang trống" },
        { id: 3, name: "Xe Ford Ranger", status: "Chưa kích hoạt hợp đồng" },
    ];

    const getStatusColor = (status) => {
        if (status === "Đang sử dụng") return "green";
        if (status === "Đang trống") return "orange";
        if (status === "Chưa kích hoạt hợp đồng") return "red";
        return "black";
    };

    return (
        <div>
            <Navbar username="Username" />

            <h1>Phương tiện của bạn</h1>
            <Link to="/newContract">Tạo hợp đồng</Link>

            {vehicles.map((vehicle) => (
                <div key={vehicle.id}>
                    <Link to={`/vehicle/${vehicle.id}`}>
                        <span>{vehicle.name} - </span>
                        <span style={{ color: getStatusColor(vehicle.status) }}>
                            {vehicle.status}
                        </span>
                    </Link>
                </div>
            ))}
        </div>
    );
}
