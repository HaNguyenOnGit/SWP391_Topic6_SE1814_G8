import { useState } from "react";
import AdminNavbar from "./ANavbar";
import "./AdminContract.css";


export default function AdminContracts() {
    const users = [
        { id: 1, fullName: "Nguyen Van A", phone: "0901234567" },
        { id: 2, fullName: "Tran Thi B", phone: "0987654321" },
        { id: 3, fullName: "Le Van C", phone: "0907654321" },
    ];

    const [contracts, setContracts] = useState([
        {
            id: 1,
            vehicle: { name: "Honda City", license: "59A-12345", model: "2021" },
            owners: [
                { phone: "0901234567", ratio: 60 },
                { phone: "0907654321", ratio: 40 },
            ],
            createDate: "2024-10-01",
            status: "Đang hoạt động",
        },
    ]);

    const handleEndContract = (id) => {
        if (window.confirm("Bạn có chắc muốn chấm dứt hợp đồng này?")) {
            setContracts((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status: "Đã kết thúc" } : c))
            );
        }
    };

    const handleDeleteContract = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa hợp đồng này?")) {
            setContracts((prev) => prev.filter((c) => c.id !== id));
        }
    };

    return (

        <div className="contracts-container">
            <AdminNavbar adminName="Admin" />

            <h1>Quản lý hợp đồng</h1>

            {contracts.map((c) => (
                <div key={c.id} className="contract-card">
                    <div className="contract-info">
                        <h2>Hợp đồng #{c.id}</h2>
                        <p><strong>Xe:</strong> {c.vehicle.name} ({c.vehicle.license})</p>
                        <p><strong>Ngày tạo:</strong> {c.createDate}</p>
                    </div>

                    <div className="coowners">
                        <p><strong>Người đồng sở hữu:</strong></p>
                        {c.owners.map((o, i) => {
                            const user = users.find((u) => u.phone === o.phone);
                            return (
                                <p key={i}>
                                    - {user ? `${user.fullName} (${o.phone})` : o.phone} ({o.ratio}%)
                                </p>
                            );
                        })}
                    </div>

                    <p>
                        <strong>Trạng thái:</strong>{" "}
                        <span className={c.status === "Đã kết thúc" ? "status-ended" : "status-active"}>
                            {c.status}
                        </span>
                    </p>

                    <div className="actions">
                        {c.status === "Đang hoạt động" && (
                            <button onClick={() => handleEndContract(c.id)} className="btn-stop">
                                Ngừng hợp đồng
                            </button>
                        )}
                        <button className="btn-export">Trích xuất chi tiêu</button>
                        <button className="btn-edit">Chỉnh sửa thành viên</button>
                        <button onClick={() => handleDeleteContract(c.id)} className="btn-delete">
                            Xóa
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
