import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { useParams } from "react-router-dom";
import axios from "axios";

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
            default: return status || "";
        }
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (!contract) return <p>Không tìm thấy hợp đồng.</p>;

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
            <div className="main-content" style={{ overflowY: "scroll" }}>
                <h1>Chi tiết hợp đồng</h1>

                {/* Vehicle info */}
                <section style={{ marginTop: "20px" }}>
                    <h2>Thông tin phương tiện</h2>
                    <p><strong>Tên:</strong> {contract.vehicle.name}</p>
                    <p><strong>Biển số:</strong> {contract.vehicle.license}</p>
                    <p><strong>Model:</strong> {contract.vehicle.model}</p>
                </section>

                {/* Owner list */}
                <section style={{ marginTop: "20px" }}>
                    <h2>Danh sách đồng sở hữu</h2>

                    {owners.map((o, i) => (
                        <div
                            key={i}
                            style={{
                                marginBottom: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                width: "300px",
                            }}
                        >
                            <span>
                                <strong>{o.name}</strong> ({o.phone})
                            </span>
                            {editing ? (
                                <>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={o.ratio}
                                        onChange={(e) => updateRatio(i, e.target.value)}
                                        style={{ margin: "0 10px", flex: 1 }}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={o.ratio}
                                        onChange={(e) => updateRatio(i, e.target.value)}
                                        style={{ width: "50px", marginLeft: "8px" }}
                                    />
                                    <span>%</span>
                                    <button
                                        onClick={() => removeOwner(i)}
                                        style={{ marginLeft: "10px", color: "red" }}
                                    >
                                        Xóa
                                    </button>
                                </>
                            ) : (
                                <span style={{ color: "blue" }}>{o.ratio}%</span>
                            )}
                        </div>
                    ))}

                    {editing && (
                        <div style={{ marginTop: "10px" }}>
                            <input
                                type="text"
                                placeholder="Nhập số điện thoại mới"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                            />
                            <button onClick={addOwner} style={{ marginLeft: "10px" }}>
                                Thêm thành viên
                            </button>
                        </div>
                    )}

                    {editing && ratioError && (
                        <p style={{ color: "red" }}>
                            Tổng tỉ lệ phải bằng 100% (hiện tại {totalRatio}%)
                        </p>
                    )}
                </section>

                {/* Date */}
                <section style={{ marginTop: "20px" }}>
                    <h2>Ngày tạo hợp đồng</h2>
                    {editing ? (
                        <input
                            type="date"
                            value={createDate}
                            onChange={(e) => setCreateDate(e.target.value)}
                        />
                    ) : (
                        <p>{createDate}</p>
                    )}
                </section>

                {/* Status */}
                <section style={{ marginTop: "20px" }}>
                    <h2>Trạng thái</h2>
                    <p style={{ color: contract.status === "Đã kết thúc" ? "red" : "green" }}>
                        {contract.status}
                    </p>
                </section>

                {/* Buttons */}
                <div style={{ marginTop: "30px" }}>
                    {editing ? (
                        <>
                            <button onClick={handleSave}>Lưu thay đổi</button>
                            <button
                                style={{ marginLeft: "10px" }}
                                onClick={() => {
                                    setEditing(false);
                                    setOwners(contract.owners);
                                    setCreateDate(contract.createDate);
                                }}
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <>
                            {contract.status === "Đang sử dụng" && (
                                <>
                                    <button onClick={() => setEditing(true)}>Chỉnh sửa</button>
                                    <button
                                        style={{ marginLeft: "10px", color: "red" }}
                                        onClick={endContract}
                                    >
                                        Chấm dứt hợp đồng
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
