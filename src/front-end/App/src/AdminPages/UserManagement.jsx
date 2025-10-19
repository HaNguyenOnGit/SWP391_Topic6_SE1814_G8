import React, { useState, useMemo, useEffect } from "react";
import AdminNavbar from "./ANavbar";
import "./UserManagement.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; // e.g., http://localhost:5000

const mapStatusLabel = (status) => {
    switch ((status || "").toLowerCase()) {
        case "enabled":
            return "Đang hoạt động";
        case "disabled":
        default:
            return "Chờ phê duyệt";
    }
};

const getStatusStyle = (label) => {
    const l = (label || "").toLowerCase();
    if (l === "đang hoạt động") {
        return {
            color: "#065f46",
            backgroundColor: "#d1fae5",
            borderRadius: "12px",
            padding: "2px 8px",
            fontWeight: 600,
            display: "inline-block",
        };
    }
    return {
        color: "#92400e",
        backgroundColor: "#fef3c7",
        borderRadius: "12px",
        padding: "2px 8px",
        fontWeight: 600,
        display: "inline-block",
    };
};

const mapUserFromApi = (u) => ({
    id: u.userId,
    fullName: u.fullName,
    phone: u.phoneNumber ?? "",
    email: u.email ?? "",
    cccd: u.citizenId ?? "",
    license: u.driverLicenseId ?? "",
    cccdFront: u.frontIdImage ?? "",
    cccdBack: u.backIdImage ?? "",
    licenseFront: u.frontLicenseImage ?? "",
    licenseBack: u.backLicenseImage ?? "",
    bankName: u.bankName ?? "",
    bankNumber: u.bankAccount ?? "",
    role: u.role ?? "",
    status: mapStatusLabel(u.status ?? ""),
});

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [filterPending, setFilterPending] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [newStatus, setNewStatus] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${API_BASE}/api/user/all`);
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `Failed to fetch users (${res.status})`);
                }
                const data = await res.json();
                // data is expected to be an array of users from backend
                const mapped = Array.isArray(data) ? data.map(mapUserFromApi) : [];
                setUsers(mapped);
            } catch (e) {
                setError(e.message || "Đã có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                (user.phone || "").includes(searchTerm) ||
                (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterPending ? user.status === "Chờ phê duyệt" : true;
            return matchesSearch && matchesFilter;
        });
    }, [users, searchTerm, filterPending]);

    const enableUser = async (userId) => {
        const res = await fetch(`${API_BASE}/api/user/${userId}/enable`, {
            method: "PUT",
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Enable failed (${res.status})`);
        }
        return res.json();
    };

    const updatePassword = async (userId, password) => {
        const res = await fetch(`${API_BASE}/api/user/updateUserRequest`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, newPassword: password }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Update password failed (${res.status})`);
        }
    };

    const handleApprove = async () => {
        if (!selectedUser) return;
        try {
            await enableUser(selectedUser.id);
            setUsers((prev) =>
                prev.map((u) => (u.id === selectedUser.id ? { ...u, status: "Đang hoạt động" } : u))
            );
            setSelectedUser((prev) => (prev ? { ...prev, status: "Đang hoạt động" } : prev));
            alert(`Đã phê duyệt người dùng: ${selectedUser.fullName}`);
        } catch (e) {
            alert(e.message || "Phê duyệt thất bại");
        }
    };

    const handlePasswordChange = async () => {
        if (!selectedUser) return;
        if (!newPassword) {
            alert("Vui lòng nhập mật khẩu mới");
            return;
        }
        try {
            await updatePassword(selectedUser.id, newPassword);
            alert(`Đổi mật khẩu cho ${selectedUser.fullName} thành công`);
            setShowPasswordModal(false);
            setNewPassword("");
        } catch (e) {
            alert(e.message || "Đổi mật khẩu thất bại");
        }
    };

    const handleStatusChange = async () => {
        if (!selectedUser) return;
        try {
            if (newStatus === "Đang hoạt động" && selectedUser.status !== "Đang hoạt động") {
                await enableUser(selectedUser.id);
                setUsers((prev) =>
                    prev.map((u) => (u.id === selectedUser.id ? { ...u, status: "Đang hoạt động" } : u))
                );
                setSelectedUser((prev) => (prev ? { ...prev, status: "Đang hoạt động" } : prev));
                alert("Đã cập nhật trạng thái thành công");
            } else {
                alert("Chỉ hỗ trợ chuyển sang 'Đang hoạt động' (Enable) tại thời điểm này");
            }
        } catch (e) {
            alert(e.message || "Cập nhật trạng thái thất bại");
        } finally {
            setShowStatusModal(false);
            setNewStatus("");
        }
    };

    return (
        <div className="user-management">
            <AdminNavbar adminName="Admin" />

            <h2>Danh sách người dùng</h2>

            {loading && <p>Đang tải...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

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
                                <th>Vai trò</th>
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
                                    <td>{u.role}</td>
                                    <td><span style={getStatusStyle(u.status)}>{u.status}</span></td>
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
                                <p><strong>Vai trò:</strong> {selectedUser.role}</p>
                                <p><strong>Trạng thái:</strong> <span style={getStatusStyle(selectedUser.status)}>{selectedUser.status}</span></p>
                                <p><strong>CCCD:</strong> {selectedUser.cccd}</p>
                                <p><strong>Bằng lái:</strong> {selectedUser.license}</p>
                                <p><strong>Ngân hàng:</strong> {selectedUser.bankName}</p>
                                <p><strong>Số tài khoản:</strong> {selectedUser.bankNumber}</p>
                            </div>

                            <div className="image-gallery">
                                {selectedUser.cccdFront && (
                                    <img src={selectedUser.cccdFront} alt="CCCD Front" />
                                )}
                                {selectedUser.cccdBack && (
                                    <img src={selectedUser.cccdBack} alt="CCCD Back" />
                                )}
                                {selectedUser.licenseFront && (
                                    <img src={selectedUser.licenseFront} alt="License Front" />
                                )}
                                {selectedUser.licenseBack && (
                                    <img src={selectedUser.licenseBack} alt="License Back" />
                                )}
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
