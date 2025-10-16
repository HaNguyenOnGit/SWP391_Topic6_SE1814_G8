import React, { useState } from "react";
import Navbar from "../NavBar";

export default function ContractDetails() {
    // mock contract
    const [contract, setContract] = useState({
        vehicle: {
            name: "Honda City",
            license: "59A-12345",
            model: "2021",
        },
        owners: [
            { phone: "0901234567", ratio: 60 },
            { phone: "0907654321", ratio: 40 },
        ],
        createDate: "2024-10-01",
        status: "Đang hoạt động",
    });

    const [editing, setEditing] = useState(false);
    const [owners, setOwners] = useState(contract.owners);
    const [createDate, setCreateDate] = useState(contract.createDate);
    const [newPhone, setNewPhone] = useState("");

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
        if (owners.some(o => o.phone === newPhone))
            return alert("Thành viên này đã tồn tại");
        setOwners([...owners, { phone: newPhone, ratio: 0 }]);
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
            <div className="main-content">
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
                        <div key={i} style={{ marginBottom: "10px" }}>
                            <span>{o.phone}</span>
                            {editing ? (
                                <>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={o.ratio}
                                        onChange={(e) => updateRatio(i, e.target.value)}
                                        style={{ marginLeft: "10px" }}
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
                                <span> — {o.ratio}%</span>
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
                                    setOwners(contract.owners);
                                    setCreateDate(contract.createDate);
                                    setEditing(false);
                                }}
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <>
                            {contract.status === "Đang hoạt động" && (
                                <>
                                    <button onClick={() => setEditing(true)}>Chỉnh sửa</button>
                                    <button
                                        onClick={endContract}
                                        style={{ marginLeft: "10px", color: "red" }}
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

