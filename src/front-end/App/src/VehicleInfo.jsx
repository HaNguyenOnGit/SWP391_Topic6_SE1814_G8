import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export default function VehicleInfo() {
    const { id } = useParams(); // id lấy từ URL /vehicle/:id
    const [vehicle, setVehicle] = useState(null);
    const [coowners, setCoowners] = useState([]);

    useEffect(() => {
        if (!id) return;

        axios
            .get(`/api/contract/contract-detail/${id}`)
            .then((res) => {
                const data = res.data;
                setVehicle({
                    id: data.contractId,
                    name: data.vehicleName,
                    plate: data.licensePlate,
                    model: data.model,
                    startDate: data.startDate,
                    status: translateStatus(data.status),
                });

                const members = data.members.map((m) => ({
                    username: m.fullName || m.phoneNumber,
                    share: m.sharePercent,
                }));
                setCoowners(members);
            })
            .catch((err) => console.error("Lỗi khi tải chi tiết hợp đồng:", err));
    }, [id]);

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case "active": return "Đang sử dụng";
            case "available": return "Đang trống";
            case "pending": return "Chờ kích hoạt";
            default: return status || "";
        }
    };

    const getStatusColor = (status) => {
        if (status === "Đang sử dụng") return "green";
        if (status === "Đang trống") return "orange";
        if (status === "Chờ kích hoạt") return "red";
        return "black";
    };

    if (!vehicle) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="vehicle-info">
            <div>
                <h1 style={{ color: "black" }}>{vehicle.name}</h1>
                <p>{vehicle.plate}</p>
                <br />
                <div>
                    <span
                        style={{
                            color: getStatusColor(vehicle.status),
                            fontWeight: "bold",
                        }}
                    >
                        ● {vehicle.status}
                    </span>
                </div>

                <Link
                    to={`/vehicle/${vehicle.id}`}
                    style={{
                        color: "purple",
                        textDecoration: "none",
                        fontSize: "24pt",
                        margin: "20px 0 20px 0",
                    }}
                >
                    ←
                </Link>
            </div>

            <div>
                <h4>Người đồng sở hữu</h4>
                {coowners.length > 0 ? (
                    coowners.map((c, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "220px",
                                margin: "10px 0",
                            }}
                        >
                            <span style={{ color: "black", fontWeight: "bold" }}>
                                {c.username}
                            </span>
                            <span style={{ color: "blue" }}>{c.share}%</span>
                        </div>
                    ))
                ) : (
                    <p>Không có dữ liệu đồng sở hữu.</p>
                )}
            </div>

            <div>
                <Link
                    to={`/vehicle/${vehicle.id}/contract`}
                    style={{ color: "#ff9800", textDecoration: "none" }}
                >
                    Xem hợp đồng →
                </Link>
            </div>
        </div>
    );
}

