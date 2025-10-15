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
        <div className="vehicle-info">
            <div>
                <h1>{vehicle.name}</h1>
                <p>{vehicle.plate}</p>
                <br></br>
                <div>
                    <span style={{ color: getStatusColor(vehicle.status), fontWeight: "bold" }}>
                        ● {vehicle.status}
                    </span>
                </div>

                <Link
                    to={`/vehicle/${vehicle.id}`}
                    style={{ color: "purple", textDecoration: "none", fontSize: "24pt", margin: "20px 0 20px 0" }}
                >
                    ←
                </Link>
            </div>
            <div>
                <h4>Người đồng sở hữu</h4>
                {coowners.length > 0 ? (
                    coowners.map((c, index) => (
                        <div key={index} style={{ margin: "10px 0 10px 0" }}>
                            <span style={{ marginRight: "10px" }}>
                                {c.username}
                            </span>
                            <span style={{ color: "blue" }}>{c.share}%</span>
                        </div>
                    ))
                ) : (
                    <p>Đang tải...</p>
                )}
            </div>
            <div>
                <Link
                    to={`/vehicle/${vehicle.id}/contract`}
                    style={{ color: "#ff980", textDecoration: "none" }}
                >
                    Xem hợp đồng →
                </Link>
            </div>
        </div>
    );
}

