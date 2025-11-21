import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import { useParams, Link } from "react-router-dom";
import { FaCalendarAlt, FaDoorOpen, FaFileInvoiceDollar, FaExclamationCircle, FaMoneyBillWave, FaHistory, FaChevronLeft, FaCar, FaUsers } from "react-icons/fa";
import "./Vehicle.css";
import axios from "axios";

export default function Vehicle() {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [status, setStatus] = useState("");
    const [usingBy, setUsingBy] = useState(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const res = await axios.get(`/api/contract/contract-detail/${id}`);
                const data = res.data;
                console.log("Trạng thái hợp đồng từ API:", data.status);

                const rawStatus = data.status?.toLowerCase() || "";
                setStatus(rawStatus);

                // Ai đang sử dụng hiện tại
                setUsingBy(data.usingBy || null);

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
                    coowners: (data.members || []).map((m) => ({
                        userId: m.userId,
                        username: m.fullName || m.phoneNumber,
                        phone: m.phoneNumber,
                        share: m.sharePercent,
                        status: m.status || m.invitationStatus || m.memberStatus || m.statusName || "Confirmed",
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
            case "Cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    // Màu tên đồng sở hữu theo trạng thái + người đang sử dụng
    const getMemberNameColor = (member) => {
        if (!member) return "#111";
        if (usingBy && member.userId === usingBy) return "green";
        const s = String(member.status || "").toLowerCase();
        if (!s) return "#111";
        if (s === "confirmed") return "#111";
        if (s === "pending" || s.includes("chờ")) return "goldenrod";
        if (s === "rejected" || s.includes("từ chối")) return "red";
        return "#111";
    };

    const getStatusColor = (st) => {
        const s = String(st || "").toLowerCase();
        if (s.includes("đang sử dụng") || s.includes("active")) return "#1e8e3e";
        if (s.includes("trống") || s.includes("available")) return "#c07500";
        if (s.includes("chưa") || s.includes("inactive") || s.includes("cancel") || s.includes("hủy")) return "#b3261e";
        return "#222";
    };

    if (!vehicle) return <h2>Đang tải dữ liệu...</h2>;

    const actions = [
        { name: "Đặt lịch", path: `/vehicle/${id}/schedule`, icon: FaCalendarAlt },
        { name: "Check-in/out", path: `/vehicle/${id}/checkinHistory`, icon: FaDoorOpen },
        { name: "Thông tin chi phí", path: `/vehicle/${id}/costs`, icon: FaFileInvoiceDollar },
        { name: "Đề xuất khoản chi", path: `/vehicle/${id}/proposal`, icon: FaExclamationCircle },
        { name: "Thanh toán", path: `/vehicle/${id}/payment`, icon: FaMoneyBillWave },
        { name: "Lịch sử", path: `/vehicle/${id}/history`, icon: FaHistory },
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
            <div className="main-contenttt">
                <div className="main-content-layouttt">
                    <div className="vehicle-column">
                        <header className="vehicle-header">
                            <div className="icon"><FaCar /></div>
                            <div className="titles">
                                <h1 className="vehicle-name">{vehicle.name}</h1>
                                <p className="vehicle-plate">{vehicle.plate}</p>
                            </div>
                        </header>

                        <div className="vehicle-stats">
                            <div className="stat">
                                <span className="label">Tình trạng</span>
                                <span className="status-pill" style={{ color: getStatusColor(vehicle.status), borderColor: getStatusColor(vehicle.status) }}>
                                    {vehicle.status}
                                </span>
                            </div>
                            <div className="stat">
                                <span className="label">Mẫu xe</span>
                                <span className="value">{vehicle.model || "—"}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Hợp đồng</span>
                                <span className="value"><Link to={`/vehicle/${vehicle.id}/contract`} className="contract-link">Xem hợp đồng →</Link></span>
                            </div>
                        </div>

                        <section className="owners-section">
                            <div className="owners-title">
                                <div className="icon users"><FaUsers /></div>
                                <h4>Người đồng sở hữu</h4>
                            </div>
                            {vehicle.coowners && vehicle.coowners.length > 0 ? (
                                <div className="owners-grid">
                                    {vehicle.coowners.map((c, idx) => (
                                        <div key={idx} className="owner-card">
                                            <div className="owner-row">
                                                <span className="owner-name" style={{ color: getMemberNameColor(c) }}>{c.username}</span>
                                                <span className="owner-share">{c.share}%</span>
                                            </div>
                                            <div className="share-bar">
                                                <div className="share-fill" style={{ width: `${Math.min(Math.max(c.share || 0, 0), 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Không có dữ liệu đồng sở hữu.</p>
                            )}
                        </section>
                    </div>

                    <div className="menu-column">
                        {shouldHideMenu ? (
                            <div className="status-error">
                                <h3>{errorMessage || "Hợp đồng không khả dụng."}</h3>
                            </div>
                        ) : (
                            <div className="action-menu">
                                {actions.map((action, idx) => {
                                    const Icon = action.icon;
                                    return (
                                        <div key={idx} className="action-item">
                                            <Link to={action.path} className="action-link">
                                                <span className="nav-icon"><Icon /></span>
                                                <span className="action-label">{action.name}</span>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
