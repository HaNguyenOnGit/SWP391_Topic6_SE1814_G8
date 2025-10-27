import React, { useEffect, useState } from "react";
import Navbar from "../NavBar";
import { useParams, Link } from "react-router-dom";
import VehicleInfo from "../VehicleInfo";
import "./Vehicle.css";
import axios from "axios";

export default function Vehicle() {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const res = await axios.get(`/api/contract/contract-detail/${id}`);
                const data = res.data;
                console.log("Trạng thái hợp đồng từ API:", data.status);

                const rawStatus = data.status?.toLowerCase() || "";
                setStatus(rawStatus);

                // Kiểm tra nhiều khả năng status khác nhau
                if (
                    rawStatus.includes("inactive") ||
                    rawStatus.includes("cancel") ||
                    rawStatus.includes("pending") ||
                    rawStatus.includes("wait") ||
                    rawStatus.includes("chờ")
                ) {
                    setErrorMessage(
                        rawStatus.includes("cancel")
                            ? "Hợp đồng đã bị hủy. Bạn không thể truy cập các chức năng khác."
                            : "Hợp đồng chưa được kích hoạt. Vui lòng chờ quản trị viên phê duyệt."
                    );
                }

                setVehicle({
                    id: data.contractId,
                    name: data.vehicleName,
                    plate: data.licensePlate,
                    model: data.model,
                    status: translateStatus(data.status),
                    coowners: data.members.map((m) => ({
                        username: m.fullName,
                        phone: m.phoneNumber,
                        share: m.sharePercent,
                    })),
                });
            } catch (err) {
                console.error("Lỗi khi tải thông tin phương tiện:", err);
                setErrorMessage("Không thể tải dữ liệu phương tiện. Vui lòng thử lại sau.");
            }
        };

        fetchVehicle();
    }, [id]);

    const translateStatus = (status) => {
        switch (status) {
            case "Active":
                return "Đang sử dụng";
            case "Available":
                return "Đang trống";
            case "Inactive":
                return "Chưa kích hoạt hợp đồng";
            case "Canceled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    if (!vehicle) return <h2>Đang tải dữ liệu...</h2>;

    const actions = [
        { name: "Đặt lịch", path: `/vehicle/${id}/schedule` },
        { name: "Check-in/out", path: `/vehicle/${id}/checkinHistory` },
        { name: "Thông tin chi phí", path: `/vehicle/${id}/costs` },
        { name: "Đề xuất khoản chi", path: `/vehicle/${id}/proposal` },
        { name: "Thanh toán", path: `/vehicle/${id}/payment` },
        { name: "Lịch sử", path: `/vehicle/${id}/history` },
    ];

    // Nếu hợp đồng bị chờ kích hoạt hoặc hủy → chỉ hiển thị thông báo
    const shouldHideMenu =
        status.includes("inactive") ||
        status.includes("cancel") ||
        status.includes("pending") ||
        status.includes("wait") ||
        status.includes("chờ");

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <div className="main-content-layout">
                    <VehicleInfo vehicle={vehicle} />

                    {shouldHideMenu ? (
                        <div className="status-error">
                            <h3>{errorMessage || "Hợp đồng không khả dụng."}</h3>
                        </div>
                    ) : (
                        <div className="action-menu">
                            {actions.map((action, idx) => (
                                <div key={idx} className="action-item">
                                    <Link to={action.path}>{action.name}</Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
