import React, { useState, useMemo } from "react";
import AdminNavbar from "./ANavbar";

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPending, setFilterPending] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [newStatus, setNewStatus] = useState("");

    // Mock data
    const users = [
        {
            id: 1,
            fullName: "Nguyen Van A",
            phone: "0901234567",
            email: "nguyenvana@example.com",
            cccd: "123456789012",
            license: "B2",
            cccdFront: "https://via.placeholder.com/150?text=CCCD+Front",
            cccdBack: "https://via.placeholder.com/150?text=CCCD+Back",
            licenseFront: "https://via.placeholder.com/150?text=License+Front",
            licenseBack: "https://via.placeholder.com/150?text=License+Back",
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
            cccdFront: "https://via.placeholder.com/150?text=CCCD+Front",
            cccdBack: "https://via.placeholder.com/150?text=CCCD+Back",
            licenseFront: "https://via.placeholder.com/150?text=License+Front",
            licenseBack: "https://via.placeholder.com/150?text=License+Back",
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
            cccdFront: "https://via.placeholder.com/150?text=CCCD+Front",
            cccdBack: "https://via.placeholder.com/150?text=CCCD+Back",
            licenseFront: "https://via.placeholder.com/150?text=License+Front",
            licenseBack: "https://via.placeholder.com/150?text=License+Back",
            bankName: "ACB",
            bankNumber: "9988776655",
            registerDate: "2025-09-27",
            status: "Đang hoạt động",
        },
    ];

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.phone.includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterPending
                ? user.status === "Chờ phê duyệt"
                : true;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterPending]);

    const handleApprove = () => {
        alert(`Đã phê duyệt người dùng: ${selectedUser.fullName}`);
        setSelectedUser({ ...selectedUser, status: "Đang hoạt động" });
    };

    const handlePasswordChange = () => {
        alert(`Đổi mật khẩu cho ${selectedUser.fullName} thành "${newPassword}"`);
        setShowPasswordModal(false);
        setNewPassword("");
    };

    const handleStatusChange = () => {
        alert(`Trạng thái mới: ${newStatus}`);
        setShowStatusModal(false);
        setNewStatus("");
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminNavbar adminName="Admin" />

            <div className="p-6 grid grid-cols-3 gap-4">
                {/* Left panel - user list */}
                <div className="col-span-1 bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
                    <div className="flex space-x-2 mb-3">
                        <input
                            type="text"
                            placeholder="Tìm theo số điện thoại hoặc email"
                            className="border rounded px-3 py-1 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={() => setFilterPending(!filterPending)}
                            className={`px-3 py-1 rounded ${filterPending ? "bg-blue-600 text-white" : "bg-gray-200"
                                }`}
                        >
                            Cần phê duyệt
                        </button>
                    </div>

                    <table className="w-full text-left border-t">
                        <thead>
                            <tr className="border-b text-sm text-gray-600">
                                <th className="py-2">Tên</th>
                                <th>SĐT</th>
                                <th>Email</th>
                                <th>Ngày đăng ký</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr
                                    key={u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`cursor-pointer hover:bg-gray-100 ${selectedUser?.id === u.id ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <td className="py-2">{u.fullName}</td>
                                    <td>{u.phone}</td>
                                    <td>{u.email}</td>
                                    <td>{u.registerDate}</td>
                                    <td>{u.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right panel - user details */}
                <div className="col-span-2 bg-white rounded-lg shadow p-6">
                    {selectedUser ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Thông tin chi tiết
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Họ tên:</strong> {selectedUser.fullName}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedUser.phone}</p>
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                    <p><strong>Ngày đăng ký:</strong> {selectedUser.registerDate}</p>
                                    <p><strong>Trạng thái:</strong> {selectedUser.status}</p>
                                    <p><strong>CCCD:</strong> {selectedUser.cccd}</p>
                                    <p><strong>Bằng lái:</strong> {selectedUser.license}</p>
                                    <p><strong>Ngân hàng:</strong> {selectedUser.bankName}</p>
                                    <p><strong>Số tài khoản:</strong> {selectedUser.bankNumber}</p>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Ảnh giấy tờ:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <img src={selectedUser.cccdFront} alt="CCCD Front" className="rounded border" />
                                        <img src={selectedUser.cccdBack} alt="CCCD Back" className="rounded border" />
                                        <img src={selectedUser.licenseFront} alt="License Front" className="rounded border" />
                                        <img src={selectedUser.licenseBack} alt="License Back" className="rounded border" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-5">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    Đổi mật khẩu
                                </button>

                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    onClick={() => setShowStatusModal(true)}
                                >
                                    Thay đổi trạng thái
                                </button>

                                {selectedUser.status === "Chờ phê duyệt" && (
                                    <button
                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                        onClick={handleApprove}
                                    >
                                        Phê duyệt
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center mt-20">
                            Chọn một user để xem thông tin chi tiết
                        </div>
                    )}
                </div>
            </div>

            {/* Modal đổi mật khẩu */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            className="border rounded px-3 py-2 w-full mb-3"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setShowPasswordModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handlePasswordChange}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thay đổi trạng thái */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Thay đổi trạng thái</h3>
                        <select
                            className="border rounded px-3 py-2 w-full mb-3"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="">-- Chọn trạng thái --</option>
                            <option value="Đang hoạt động">Đang hoạt động</option>
                            <option value="Bị khóa">Bị khóa</option>
                            <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setShowStatusModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded"
                                onClick={handleStatusChange}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


