import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import VehicleSidebar from "../VehicleSidebar";
import "./ContractDetails.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCar, FaIdCard, FaCogs, FaUsers, FaCalendarAlt, FaInfoCircle, FaSave, FaTimes, FaEdit, FaStop, FaSpinner } from "react-icons/fa";

export default function ContractDetails() {
    const { id } = useParams(); // lấy id từ URL
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [owners, setOwners] = useState([]);
    const [createDate, setCreateDate] = useState("");
    const [editing, setEditing] = useState(false);
    const [newPhone, setNewPhone] = useState("");

    // gọi API khi id thay đổi
    useEffect(() => {
        if (!id) return;
        axios
            .get(`/api/contract/contract-detail/${id}`)
            .then((res) => {
                const data = res.data;

                setContract({
                    vehicle: {
                        name: data.vehicleName,
                        license: data.licensePlate,
                        model: data.model,
                    },
                    createDate: data.startDate,
                    status: translateStatus(data.status),
                });

                setOwners(
                    data.members?.map((m) => ({
                        name: m.fullName || "Chưa có tên",
                        phone: m.phoneNumber || "Không có SĐT",
                        ratio: m.sharePercent || 0,
                    })) || []
                );
                setCreateDate(data.startDate);
            })
            .catch((err) => console.error("Lỗi khi tải chi tiết hợp đồng:", err))
            .finally(() => setLoading(false));
    }, [id]);

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case "active": return "Đang sử dụng";
            case "available": return "Đang trống";
            case "pending": return "Chờ kích hoạt";
            case "cancelled": return "Đã hủy";
            default: return status || "";
        }
    };

    if (loading) return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="loading-container">
                <FaSpinner className="spinner" />
                <p>Đang tải dữ liệu...</p>
            </div>
        </div>
    );
    if (!contract) return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="error-container">
                <FaInfoCircle />
                <h2>Không tìm thấy hợp đồng</h2>
                <p>Vui lòng kiểm tra lại ID hợp đồng.</p>
            </div>
        </div>
    );

    // tổng tỉ lệ
    const totalRatio = owners.reduce((a, b) => a + Number(b.ratio), 0);
    const ratioError = totalRatio !== 100;

    const updateRatio = (i, val) => {
        const updated = [...owners];
        updated[i].ratio = Number(val);
        setOwners(updated);
    };

    const addOwner = () => {
        if (!newPhone.trim()) return alert("Vui lòng nhập số điện thoại");
        if (owners.some((o) => o.phone === newPhone))
            return alert("Thành viên này đã tồn tại");
        setOwners([...owners, { name: "Thành viên mới", phone: newPhone, ratio: 0 }]);
        setNewPhone("");
    };

    const removeOwner = (i) => {
        const updated = owners.filter((_, idx) => idx !== i);
        setOwners(updated);
    };

    const handleSave = () => {
        if (ratioError) return alert("Tổng tỉ lệ phải bằng 100%");
        setContract({ ...contract, owners, createDate });
        setEditing(false);
        alert("Đã lưu thay đổi hợp đồng!");
    };

    const endContract = () => {
        if (window.confirm("Bạn có chắc muốn chấm dứt hợp đồng này?")) {
            setContract({ ...contract, status: "Đã kết thúc" });
            alert("Hợp đồng đã được chấm dứt.");
        }
    };

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content contract-shell">
                <div className="page-with-sidebar">
                    <VehicleSidebar contractId={id} />
                    <div className="page-main">
                        <h1 className="page-title">Chi tiết hợp đồng</h1>
                        <div className="contract-content">
                            {/* Left: Vehicle info */}
                            <div className="contract-left">
                                <section className="info-section">
                                    <h2><FaCar /> Thông tin phương tiện</h2>
                                    <div className="info-item">
                                        <FaCar />
                                        <div>
                                            <strong>Tên:</strong> {contract.vehicle.name}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <FaIdCard />
                                        <div>
                                            <strong>Biển số:</strong> {contract.vehicle.license}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <FaCogs />
                                        <div>
                                            <strong>Model:</strong> {contract.vehicle.model}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right: Main details */}
                            <div className="contract-right">
                                {/* Owner list */}
                                <section className="info-section">
                                    <h2><FaUsers /> Danh sách đồng sở hữu</h2>
                                    <div className="owners-list">
                                        {owners.map((o, i) => (
                                            <div key={i} className="owner-item">
                                                <div className="owner-info">
                                                    <strong>{o.name}</strong> ({o.phone})
                                                </div>
                                                {editing ? (
                                                    <div className="owner-edit">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={o.ratio}
                                                            onChange={(e) => updateRatio(i, e.target.value)}
                                                            className="ratio-slider"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={o.ratio}
                                                            onChange={(e) => updateRatio(i, e.target.value)}
                                                            className="ratio-input"
                                                        />
                                                        <span>%</span>
                                                        <button
                                                            onClick={() => removeOwner(i)}
                                                            className="btn-remove"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="owner-ratio">{o.ratio}%</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {editing && (
                                        <div className="add-owner">
                                            <input
                                                type="text"
                                                placeholder="Nhập số điện thoại mới"
                                                value={newPhone}
                                                onChange={(e) => setNewPhone(e.target.value)}
                                                className="input-text"
                                            />
                                            <button onClick={addOwner} className="btn-add">
                                                Thêm thành viên
                                            </button>
                                        </div>
                                    )}

                                    {editing && ratioError && (
                                        <p className="ratio-error">
                                            Tổng tỉ lệ phải bằng 100% (hiện tại {totalRatio}%)
                                        </p>
                                    )}
                                </section>

                                {/* Date */}
                                <section className="info-section">
                                    <h2><FaCalendarAlt /> Ngày tạo hợp đồng</h2>
                                    {editing ? (
                                        <input
                                            type="date"
                                            value={createDate}
                                            onChange={(e) => setCreateDate(e.target.value)}
                                            className="input-date"
                                        />
                                    ) : (
                                        <p className="date-display">{createDate}</p>
                                    )}
                                </section>

                                {/* Status */}
                                <section className="info-section">
                                    <h2><FaInfoCircle /> Trạng thái</h2>
                                    <p className={`status ${contract.status === "Đã kết thúc" ? "status-ended" : "status-active"}`}>
                                        {contract.status}
                                    </p>
                                </section>

                                {/* Buttons */}
                                <div className="action-buttons">
                                    {editing ? (
                                        <>
                                            <button onClick={handleSave} className="btn-save">
                                                <FaSave /> Lưu thay đổi
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditing(false);
                                                    setOwners(contract.owners || []);
                                                    setCreateDate(contract.createDate);
                                                }}
                                                className="btn-cancel"
                                            >
                                                <FaTimes /> Hủy
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {contract.status === "Đang sử dụng" && (
                                                <>
                                                    <button onClick={() => setEditing(true)} className="btn-edit">
                                                        <FaEdit /> Chỉnh sửa
                                                    </button>
                                                    <button onClick={endContract} className="btn-end">
                                                        <FaStop /> Chấm dứt hợp đồng
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
