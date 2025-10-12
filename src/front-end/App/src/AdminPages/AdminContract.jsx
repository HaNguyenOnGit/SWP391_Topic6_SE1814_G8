import { useState } from "react";
import AdminNavbar from "./ANavbar";

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
        <div>
            <AdminNavbar adminName="Admin" />

            <div className="p-6">
                <h1 className="text-xl font-semibold mb-4">Quản lý hợp đồng</h1>

                {contracts.map((c) => (
                    <div key={c.id} className="border p-4 rounded mb-4 bg-gray-50">
                        <h2 className="font-semibold">Hợp đồng #{c.id}</h2>
                        <p><strong>Xe:</strong> {c.vehicle.name} ({c.vehicle.license})</p>
                        <p><strong>Ngày tạo:</strong> {c.createDate}</p>

                        <h3 className="mt-2">Người đồng sở hữu:</h3>
                        {c.owners.map((o, i) => {
                            const user = users.find((u) => u.phone === o.phone);
                            return (
                                <p key={i}>
                                    - {user ? `${user.fullName} (${o.phone})` : o.phone} ({o.ratio}%)
                                </p>
                            );
                        })}

                        <p>
                            <strong>Trạng thái:</strong>{" "}
                            <span style={{ color: c.status === "Đã kết thúc" ? "red" : "green" }}>
                                {c.status}
                            </span>
                        </p>

                        {/* --- Các nút thao tác theo yêu cầu --- */}
                        <div className="flex gap-2 mt-2">
                            {c.status === "Đang hoạt động" && (
                                <button
                                    onClick={() => handleEndContract(c.id)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Ngừng hợp đồng
                                </button>
                            )}

                            <button
                                onClick={() => alert("Tính năng trích xuất chi tiêu đang phát triển!")}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Trích xuất chi tiêu
                            </button>

                            <button
                                onClick={() => alert("Tính năng chỉnh sửa thành viên đang phát triển!")}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                                Chỉnh sửa thành viên
                            </button>

                            <button
                                onClick={() => handleDeleteContract(c.id)}
                                className="bg-red-700 text-white px-3 py-1 rounded"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
