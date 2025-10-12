import { useState } from "react";
import AdminNavbar from "./ANavbar";

export default function AdminContracts() {
    const users = [
        {
            id: 1,
            fullName: "Nguyen Van A",
            phone: "0901234567",
            email: "nguyenvana@example.com",
            cccd: "123456789012",
            license: "B2",
            bankName: "Vietcombank",
            bankNumber: "0123456789",
            registerDate: "2025-09-20",
            status: "Đang hoạt động",
        },
        {
            id: 2,
            fullName: "Tran Thi B",
            phone: "0987654321",
            email: "tranthib@example.com",
            cccd: "987654321098",
            license: "C",
            bankName: "Techcombank",
            bankNumber: "5678901234",
            registerDate: "2025-09-25",
            status: "Chờ phê duyệt",
        },
        {
            id: 3,
            fullName: "Le Van C",
            phone: "0907654321",
            email: "levanc@example.com",
            cccd: "112233445566",
            license: "A1",
            bankName: "ACB",
            bankNumber: "9988776655",
            registerDate: "2025-09-27",
            status: "Đang hoạt động",
        },
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

                        {c.status === "Đang hoạt động" && (
                            <button
                                onClick={() => handleEndContract(c.id)}
                                className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Chấm dứt
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
