import React, { useState, useMemo } from "react";
import AdminNavbar from "./ANavbar";
import "./UserManagement.css";

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPending, setFilterPending] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [newStatus, setNewStatus] = useState("");

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
        {
            id: 4,
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
        {
            id: 5,
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
        {
            id: 6,
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
        {
            id: 7,
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
        {
            id: 8,
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
        <div className="user-management">
            <AdminNavbar adminName="Admin" />

            <h2>Danh sách người dùng</h2>
            <div className="user-controls">
                <input
                    type="text"
                    placeholder="Tìm theo số điện thoại hoặc email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={() => setFilterPending(!filterPending)}>
                    Cần phê duyệt
                </button>
            </div>

            <div className="user-content">
                {/* Danh sách user bên trái */}
                <div className="user-list">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Tên</th>
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
                                    style={{
                                        backgroundColor:
                                            selectedUser?.id === u.id
                                                ? "#e0e7ff"
                                                : "transparent",
                                    }}
                                >
                                    <td>{u.fullName}</td>
                                    <td>{u.phone}</td>
                                    <td>{u.email}</td>
                                    <td>{u.registerDate}</td>
                                    <td>{u.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Thông tin chi tiết bên phải */}
                {selectedUser ? (
                    <div className="user-detail">
                        <h2>Thông tin chi tiết</h2>
                        <div className="user-info">
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

                            <div className="image-gallery">
                                <img src={selectedUser.cccdFront} alt="CCCD Front" />
                                <img src={selectedUser.cccdBack} alt="CCCD Back" />
                                <img src={selectedUser.licenseFront} alt="License Front" />
                                <img src={selectedUser.licenseBack} alt="License Back" />
                            </div>
                        </div>
                        <div className="user-actions">
                            <button onClick={() => setShowPasswordModal(true)}>Đổi mật khẩu</button>
                            <button onClick={() => setShowStatusModal(true)}>Thay đổi trạng thái</button>
                            {selectedUser.status === "Chờ phê duyệt" && (
                                <button onClick={handleApprove}>Phê duyệt</button>
                            )}
                        </div>
                    </div>
                ) : (
                    <p style={{ flex: "0 0 20%", textAlign: "center", marginTop: "50px" }}>
                        Chọn một user để xem thông tin chi tiết
                    </p>
                )}
            </div>
            {/* Modal đổi mật khẩu */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Đổi mật khẩu</h3>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div>
                            <button onClick={() => setShowPasswordModal(false)}>Hủy</button>
                            <button onClick={handlePasswordChange}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thay đổi trạng thái */}
            {showStatusModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Thay đổi trạng thái</h3>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="">-- Chọn trạng thái --</option>
                            <option value="Đang hoạt động">Đang hoạt động</option>
                            <option value="Bị khóa">Bị khóa</option>
                            <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                        </select>
                        <div>
                            <button onClick={() => setShowStatusModal(false)}>Hủy</button>
                            <button onClick={handleStatusChange}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
