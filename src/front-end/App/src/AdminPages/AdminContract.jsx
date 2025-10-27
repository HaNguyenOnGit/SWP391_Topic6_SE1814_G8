import { useState, useMemo } from "react";
import AdminNavbar from "./ANavbar";
import "./AdminContract.css";

export default function AdminContracts() {
    const users = [
        { id: 1, fullName: "Nguyen Van A", phone: "0901234567" },
        { id: 2, fullName: "Tran Thi B", phone: "0987654321" },
        { id: 3, fullName: "Le Van C", phone: "0907654321" },
        { id: 4, fullName: "Pham Thi D", phone: "0912345678" },
        { id: 5, fullName: "Hoang Van E", phone: "0933333333" },
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
        {
            id: 2,
            vehicle: { name: "Toyota Vios", license: "51B-67890", model: "2020" },
            owners: [
                { phone: "0987654321", ratio: 100 },
            ],
            createDate: "2023-06-15",
            status: "Đã kết thúc",
        },
        {
            id: 3,
            vehicle: { name: "Kia Morning", license: "60A-11223", model: "2019" },
            owners: [
                { phone: "0912345678", ratio: 50 },
                { phone: "0933333333", ratio: 50 },
            ],
            createDate: "2024-02-10",
            status: "Đang hoạt động",
        },
        {
            id: 4,
            vehicle: { name: "Mazda 3", license: "43C-44556", model: "2022" },
            owners: [
                { phone: "0901234567", ratio: 70 },
                { phone: "0987654321", ratio: 30 },
            ],
            createDate: "2024-08-20",
            status: "Đang hoạt động",
        },
        {
            id: 5,
            vehicle: { name: "VinFast VF8", license: "30H-88888", model: "2023" },
            owners: [
                { phone: "0907654321", ratio: 100 },
            ],
            createDate: "2024-04-12",
            status: "Đã kết thúc",
        },
        {
            id: 6,
            vehicle: { name: "Hyundai Accent", license: "65A-22222", model: "2021" },
            owners: [
                { phone: "0912345678", ratio: 60 },
                { phone: "0987654321", ratio: 40 },
            ],
            createDate: "2025-01-05",
            status: "Đang hoạt động",
        },
    ]);

    const [search, setSearch] = useState("");

    // 🧠 Lọc hợp đồng theo từ khóa
    const filteredContracts = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return contracts;

        return contracts.filter((c) => {
            const vehicleMatch =
                c.vehicle.name.toLowerCase().includes(keyword) ||
                c.vehicle.license.toLowerCase().includes(keyword);

            const ownerMatch = c.owners.some((o) => {
                const user = users.find((u) => u.phone === o.phone);
                return (
                    o.phone.includes(keyword) ||
                    (user && user.fullName.toLowerCase().includes(keyword))
                );
            });

            return vehicleMatch || ownerMatch;
        });
    }, [contracts, search, users]);

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

            {/* 🔍 Ô tìm kiếm */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Tìm theo tên xe, biển số hoặc người sở hữu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* 📄 Danh sách hợp đồng */}
            {filteredContracts.length > 0 ? (
                filteredContracts.map((c) => (
                    <div key={c.id} className="contract-card">
                        <div className="contract-info">
                            <h2>Hợp đồng #{c.id}</h2>
                            <p>
                                <strong>Xe:</strong> {c.vehicle.name} ({c.vehicle.license})
                            </p>
                            <p>
                                <strong>Năm SX:</strong> {c.vehicle.model}
                            </p>
                            <p>
                                <strong>Ngày tạo:</strong> {c.createDate}
                            </p>
                        </div>

                        <div className="coowners">
                            <p>
                                <strong>Người đồng sở hữu:</strong>
                            </p>
                            {c.owners.map((o, i) => {
                                const user = users.find((u) => u.phone === o.phone);
                                return (
                                    <p key={i}>
                                        - {user ? `${user.fullName} (${o.phone})` : o.phone} (
                                        {o.ratio}%)
                                    </p>
                                );
                            })}
                        </div>

                        <p>
                            <strong>Trạng thái:</strong>{" "}
                            <span
                                className={
                                    c.status === "Đã kết thúc" ? "status-ended" : "status-active"
                                }
                            >
                                {c.status}
                            </span>
                        </p>

                        <div className="actions">
                            {c.status === "Đang hoạt động" && (
                                <button
                                    onClick={() => handleEndContract(c.id)}
                                    className="btn-stop"
                                >
                                    Ngừng hợp đồng
                                </button>
                            )}
                            <button className="btn-export">Trích xuất chi tiêu</button>
                            <button className="btn-edit">Chỉnh sửa thành viên</button>
                            <button
                                onClick={() => handleDeleteContract(c.id)}
                                className="btn-delete"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="no-result">Không tìm thấy hợp đồng phù hợp.</p>
            )}
        </div>
    );
}
