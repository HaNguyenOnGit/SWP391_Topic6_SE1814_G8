import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { FaCar, FaChevronRight, FaPlusCircle } from "react-icons/fa";

export default function Vehicles() {
    const { userId } = useAuth();
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        if (!userId) return;
        axios
            .get(`/api/contract/user-contracts/${userId}`)
            .then((res) => setVehicles(res.data))
            .catch((err) => console.error("Lỗi khi tải danh sách hợp đồng:", err));
    }, [userId]);

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case "active": return "using";
            case "available": return "free";
            case "pending": return "inactive";
            default: return "";
        }
    };

    const translateStatus = (status) => {
        switch (status.toLowerCase()) {
            case "active": return "Đang sử dụng";
            case "available": return "Đang trống";
            case "pending": return "Chờ kích hoạt";
            default: return status;
        }
    };

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <h1 className="vehicle-title"><span className="nav-icon title-icon"><FaCar /></span> Phương tiện của bạn</h1>
                <Link to="/newContract"><span className="nav-icon create-icon"><FaPlusCircle /></span> Tạo hợp đồng</Link>

                <div className="vehicle-list">
                    {vehicles.length > 0 ? (
                        vehicles.map((v) => (
                            <Link
                                key={v.contractId}
                                to={`/vehicle/${v.contractId}`}
                                className="vehicle-card"
                            >
                                <div className="vehicle-card-header">
                                    <div className="vehicle-card-left">
                                        <span className="nav-icon"><FaCar /></span>
                                        <div>
                                            <h3 className="vehicle-card-title">{v.vehicleName}</h3>
                                            <div className="vehicle-plate">{v.licensePlate ?? v.LicensePlate}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`status ${getStatusClass(v.status)}`}>
                                    {translateStatus(v.status)}
                                </div>

                                <span className="chevron"><FaChevronRight /></span>
                            </Link>
                        ))
                    ) : (
                        <p>Không có hợp đồng nào.</p>
                    )}
                </div>
            </div>
        </div>
    );
}


