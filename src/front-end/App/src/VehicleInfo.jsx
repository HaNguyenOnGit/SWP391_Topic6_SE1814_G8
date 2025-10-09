import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function VehicleInfo({ vehicle }) {
    const [coowners, setCoowners] = useState([]);

    useEffect(() => {
        if (!vehicle?.id) return;

        // Simulate API call
        const fetchData = async () => {
            // const res = await fetch(`/api/vehicle/${vehicle.id}/coowners`);
            // const data = await res.json();
            // setCoowners(data);

            // Mock data
            setTimeout(() => {
                setCoowners([
                    { username: "username1", share: 40 },
                    { username: "username2", share: 30 },
                    { username: "username3", share: 30 },
                ]);
            }, 300);
        };

        fetchData();
    }, [vehicle]);

    if (!vehicle) return null;

    const getStatusColor = (status) => {
        if (status === "Đang sử dụng") return "green";
        if (status === "Đang trống") return "orange";
        if (status === "Chưa kích hoạt hợp đồng") return "red";
        return "black";
    };

    return (
        <div>
            {/* Vehicle name + plate */}
            <h2>{vehicle.name}</h2>
            <p>{vehicle.plate}</p>

            {/* Status */}
            <div>
                <span style={{ color: getStatusColor(vehicle.status), fontWeight: "bold" }}>
                    ● {vehicle.status}
                </span>
            </div>

            {/* Co-owners */}
            <h4>Người đồng sở hữu</h4>
            {coowners.length > 0 ? (
                coowners.map((c, index) => (
                    <div key={index}>
                        <input type="radio" name="coowner" aria-label={c.username} />{" "}
                        {c.username}{" "}
                        <span style={{ color: "blue" }}>{c.share}%</span>
                    </div>
                ))
            ) : (
                <p>Đang tải...</p>
            )}

            {/* Navigation links */}
            <div>
                <Link
                    to={`/vehicle/${vehicle.id}`}
                    style={{ color: "purple", textDecoration: "none" }}
                >
                    ← Quay lại phương tiện
                </Link>
                <br></br>
                <Link
                    to={`/vehicle/${vehicle.id}/contract`}
                    style={{ color: "orange", textDecoration: "none" }}
                >
                    Xem hợp đồng →
                </Link>
            </div>
        </div>
    );
}

