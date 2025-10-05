import React from "react";
import { Link } from "react-router-dom";

export default function VehicleInfo({ vehicle }) {
    if (!vehicle) return null;

    const getStatusColor = (status) => {
        if (status === "Đang sử dụng") return "green";
        if (status === "Đang trống") return "orange";
        if (status === "Chưa kích hoạt hợp đồng") return "red";
        return "black";
    };

    return (
        <div className="mb-6 bg-gray-100 p-4 rounded">
            {/* Tên + biển số */}
            <h2 className="text-xl font-bold">{vehicle.name}</h2>
            <p className="text-gray-700">{vehicle.plate}</p>

            {/* Trạng thái */}
            <div className="mt-1">
                <span style={{ color: getStatusColor(vehicle.status) }}>●</span>{" "}
                <span style={{ color: getStatusColor(vehicle.status) }}>
                    {vehicle.status}
                </span>
            </div>

            {/* ← Quay lại phương tiện */}
            <div className="mt-2">
                <Link
                    to={`/vehicle/${vehicle.id}`}
                    className="text-purple-500 hover:text-purple-600"
                >
                    ← Quay lại phương tiện
                </Link>
            </div>

            {/* Người đồng sở hữu */}
            <h4 className="mt-4 font-semibold">Người đồng sở hữu</h4>
            <div>
                <input type="radio" name="coowner" /> username1{" "}
                <span style={{ color: "blue" }}>40%</span>
            </div>
            <div>
                <input type="radio" name="coowner" /> username2{" "}
                <span style={{ color: "blue" }}>30%</span>
            </div>
            <div>
                <input type="radio" name="coowner" /> username3{" "}
                <span style={{ color: "blue" }}>30%</span>
            </div>

            {/* Xem hợp đồng */}
            <div className="mt-3">
                <Link
                    to={`/vehicle/${vehicle.id}/contract`}
                    className="text-orange-500 hover:text-orange-600"
                >
                    Xem hợp đồng →
                </Link>
            </div>
        </div>
    );
}
