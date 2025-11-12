import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { FaCar, FaUsers } from "react-icons/fa";

export default function VehicleInfo() {
    const { id } = useParams(); // id lấy từ URL /vehicle/:id
    const [vehicle, setVehicle] = useState(null);
    const [coowners, setCoowners] = useState([]);
    const [usingBy, setUsingBy] = useState(null);

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

                setUsingBy(data.usingBy);

                const members = data.members.map((m) => ({
                    userId: m.userId,
                    username: m.fullName || m.phoneNumber,
                    share: m.sharePercent,
                    // backend may call this field different names; try common ones, fallback to 'Confirmed'
                    status: (m.status || m.invitationStatus || m.memberStatus || m.statusName || 'Confirmed')
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

    const getMemberNameColor = (member) => {
        if (usingBy && member.userId === usingBy) return 'green'; // Màu lá cho người đang dùng
        const status = member.status;
        if (!status) return 'black';
        const s = String(status).toLowerCase();
        if (s === 'confirmed') return 'black';
        if (s === 'pending') return 'goldenrod'; // vàng
        if (s === 'rejected') return 'red';
        // also handle vietnamese versions just in case
        if (s.includes('chờ') || s.includes('pending')) return 'goldenrod';
        if (s.includes('từ chối') || s.includes('rejected')) return 'red';
        return 'black';
    };

    return (
        <div className="vehicle-info">
            <div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "0 0 10px 0"
                }}>
                    <div style={{
                        color: "#2196F3",
                        marginRight: "10px",
                        display: "flex",
                        alignItems: "center",
                        width: "20px",
                        justifyContent: "center"
                    }}>
                        <FaCar />
                    </div>
                    <div>
                        <h1 style={{ color: "black", margin: 0 }}>
                            {vehicle.name}
                        </h1>
                    </div>
                </div>
                <p>{vehicle.plate}</p>
                <br />
                <div>
                    <span
                        style={{
                            color: getStatusColor(vehicle.status),
                            fontWeight: "bold",
                        }}
                    >
                        {vehicle.status}
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
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "20px 0 15px 0"
                }}>
                    <div style={{
                        color: "#4CAF50",
                        marginRight: "10px",
                        display: "flex",
                        alignItems: "center",
                        width: "20px",
                        justifyContent: "center"
                    }}>
                        <FaUsers />
                    </div>
                    <div>
                        <h4 style={{ color: "black", margin: 0 }}>
                            Người đồng sở hữu
                        </h4>
                    </div>
                </div>
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
                            <span style={{ color: getMemberNameColor(c), fontWeight: "bold" }}>
                                {c.username}
                            </span>
                            <span style={{ color: "blue" }}>{c.share}%</span>
                        </div>
                    ))
                ) : (
                    <p>Không có dữ liệu đồng sở hữu.</p>
                )}
            </div>

            <div style={{ marginTop: "30px" }}>
                <Link
                    to={`/vehicle/${vehicle.id}/contract`}
                    style={{
                        color: "#ff9800",
                        textDecoration: "none"
                    }}
                >
                    Xem hợp đồng →
                </Link>
            </div>
        </div>
    );
}

