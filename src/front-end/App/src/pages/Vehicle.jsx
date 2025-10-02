import React from "react";
import Navbar from "../NavBar";
import { useParams, Link } from "react-router-dom";

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
        { name: "Check-in/out", path: `/vehicle/${id}/checkin` },
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
        <div>
            <Navbar username="Username" />

            <h2>{vehicle.name}</h2>
            <p>{vehicle.plate}</p>
            <p>
                <span style={{ color: getStatusColor(vehicle.status) }}>●</span>{" "}
                {vehicle.status}
            </p>

            <h4>Người đồng sở hữu</h4>
            <div>
                <input type="radio" name="coowner" /> username1 - <span style={{ color: "blue" }}>40%</span>
            </div>
            <div>
                <input type="radio" name="coowner" /> username2 - <span style={{ color: "blue" }}>30%</span>
            </div>
            <div>
                <input type="radio" name="coowner" /> username3 - <span style={{ color: "blue" }}>30%</span>
            </div>

            <div style={{ marginTop: "20px" }}>
                <Link to={`/vehicle/${id}/contract`}>Xem hợp đồng →</Link>
            </div>
            <div style={{ marginTop: "30px", border: "1px solid black", padding: "15px" }}>
                {actions.map((action, idx) => (
                    <div key={idx} style={{ marginBottom: "10px" }}>
                        <Link to={action.path}>{action.name}</Link>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "20px" }}>
                <Link to="/vehicles">← Quay lại danh sách</Link>
            </div>
        </div>
    );
}
