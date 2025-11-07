import React, { useState, useMemo, useEffect } from "react";
import {
    Search,
    KeyRound,
    CheckCircle,
    AlertTriangle,
    Shield,
    Loader2,
    UserCog,
} from "lucide-react";
import AdminNavbar from "./ANavbar";
import "./UserManagement.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// --- Helper ---
const mapStatusLabel = (status) => {
    switch ((status || "").toLowerCase()) {
        case "enabled":
            return "Đang hoạt động";
        case "disabled":
        default:
            return "Chờ phê duyệt";
    }
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

const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    return s === "đang hoạt động" ? "status-active" : "status-pending";
};

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
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                data.reverse(); // Đảo ngược để hiển thị user mới trước
                setUsers(Array.isArray(data) ? data.map(mapUserFromApi) : []);
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
                user.phone.includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterPending
                ? user.status === "Chờ phê duyệt"
                : true;
            return matchesSearch && matchesFilter;
        });
    }, [users, searchTerm, filterPending]);

    const enableUser = async (userId) => {
        const res = await fetch(`${API_BASE}/api/user/${userId}/enable`, {
            method: "PUT",
        });
        if (!res.ok) throw new Error(await res.text());
    };

    const updatePassword = async (userId, password) => {
        const res = await fetch(`${API_BASE}/api/user/updateUserRequest`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, newPassword: password }),
        });
        if (!res.ok) throw new Error(await res.text());
    };

    const handleApprove = async () => {
        try {
            await enableUser(selectedUser.id);
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === selectedUser.id ? { ...u, status: "Đang hoạt động" } : u
                )
            );
            alert(`✅ Đã phê duyệt: ${selectedUser.fullName}`);
        } catch (e) {
            alert(e.message || "Phê duyệt thất bại");
        }
    };

    const handlePasswordChange = async () => {
        if (!newPassword) return alert("Vui lòng nhập mật khẩu mới");
        try {
            await updatePassword(selectedUser.id, newPassword);
            alert(`🔑 Đổi mật khẩu cho ${selectedUser.fullName} thành công`);
            setShowPasswordModal(false);
            setNewPassword("");
        } catch (e) {
            alert(e.message || "Đổi mật khẩu thất bại");
        }
    };

    const handleStatusChange = async () => {
        try {
            if (newStatus === "Đang hoạt động") {
                await enableUser(selectedUser.id);
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === selectedUser.id ? { ...u, status: "Đang hoạt động" } : u
                    )
                );
                alert("✅ Cập nhật trạng thái thành công");
            } else {
                alert("Chỉ hỗ trợ chuyển sang 'Đang hoạt động'");
            }
        } catch (e) {
            alert(e.message || "Cập nhật trạng thái thất bại");
        } finally {
            setShowStatusModal(false);
            setNewStatus("");
        }
    };

    return (
        <div className="admin-container">
            {/* --- Thanh navbar --- */}
            <AdminNavbar adminName="Admin" />

            {/* --- Nội dung chính --- */}
            <main className="admin-content">
                {/* Tiêu đề trang */}
                <header className="page-header">
                    <h1 className="title">
                        <UserCog className="icon" /> Quản lý người dùng
                    </h1>
                </header>

                {/* Bộ điều khiển tìm kiếm + lọc */}
                <section className="controls">
                    <div className="search-box">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm theo số điện thoại hoặc email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        className={`filter-btn ${filterPending ? "active" : ""}`}
                        onClick={() => setFilterPending(!filterPending)}
                    >
                        {filterPending ? "Hiển thị tất cả" : "Cần phê duyệt"}
                    </button>
                </section>

                {/* Bố cục 2 cột: danh sách + chi tiết */}
                <section className="main-grid">
                    {/* --- Cột trái: Danh sách người dùng --- */}
                    <div className="user-list">
                        {loading ? (
                            <div className="loading">
                                <Loader2 className="spin" /> Đang tải...
                            </div>
                        ) : error ? (
                            <p className="error">{error}</p>
                        ) : (
                            <table>
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
                                            className={selectedUser?.id === u.id ? "selected" : ""}
                                            onClick={() => setSelectedUser(u)}
                                        >
                                            <td>{u.fullName}</td>
                                            <td>{u.phone || "—"}</td>
                                            <td>{u.email || "—"}</td>
                                            <td>{u.role || "Người dùng"}</td>
                                            <td>
                                                <span className={getStatusClass(u.status)}>
                                                    {u.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* --- Cột phải: Thông tin chi tiết --- */}
                    <div className="user-detail">
                        {selectedUser ? (
                            <>
                                <h2 className="detail-title">
                                    <Shield className="icon" /> Thông tin chi tiết
                                </h2>

                                <div className="info-grid">
                                    <p><b>Họ tên:</b> {selectedUser.fullName}</p>
                                    <p><b>SĐT:</b> {selectedUser.phone}</p>
                                    <p><b>Email:</b> {selectedUser.email}</p>
                                    <p><b>Vai trò:</b> {selectedUser.role}</p>
                                    <p>
                                        <b>Trạng thái:</b>{" "}
                                        <span className={getStatusClass(selectedUser.status)}>
                                            {selectedUser.status}
                                        </span>
                                    </p>
                                    <p><b>CCCD:</b> {selectedUser.cccd}</p>
                                    <p><b>Bằng lái:</b> {selectedUser.license}</p>
                                    <p><b>Ngân hàng:</b> {selectedUser.bankName}</p>
                                    <p><b>Số TK:</b> {selectedUser.bankNumber}</p>
                                </div>

                                {/* Ảnh giấy tờ */}
                                <div className="image-grid">
                                    {selectedUser.cccdFront && (
                                        <img style={{ width: "160px", height: "90px", objectFit: "cover" }} src={`http://localhost:5170/${selectedUser.cccdFront}`} alt="CCCD Trước" />
                                    )}
                                    {selectedUser.cccdBack && (
                                        <img style={{ width: "160px", height: "90px", objectFit: "cover" }} src={`http://localhost:5170/${selectedUser.cccdBack}`} alt="CCCD Sau" />
                                    )}
                                    {selectedUser.licenseFront && (
                                        <img style={{ width: "160px", height: "90px", objectFit: "cover" }} src={`http://localhost:5170/${selectedUser.licenseFront}`} alt="Bằng lái Trước" />
                                    )}
                                    {selectedUser.licenseBack && (
                                        <img style={{ width: "160px", height: "90px", objectFit: "cover" }} src={`http://localhost:5170/${selectedUser.licenseBack}`} alt="Bằng lái Sau" />
                                    )}
                                </div>

                                {/* Nút hành động */}
                                <div className="actions">
                                    <button onClick={() => setShowPasswordModal(true)}>
                                        <KeyRound /> Đổi mật khẩu
                                    </button>
                                    <button onClick={() => setShowStatusModal(true)}>
                                        <AlertTriangle /> Thay đổi trạng thái
                                    </button>
                                    {selectedUser.status === "Chờ phê duyệt" && (
                                        <button className="approve" onClick={handleApprove}>
                                            <CheckCircle /> Phê duyệt
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="placeholder">
                                Chọn người dùng để xem chi tiết
                            </p>
                        )}
                    </div>
                </section>
            </main>

            {/* --- Modal: Đổi mật khẩu --- */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Đổi mật khẩu</h3>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button onClick={() => setShowPasswordModal(false)}>Hủy</button>
                            <button onClick={handlePasswordChange}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Modal: Thay đổi trạng thái --- */}
            {showStatusModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Thay đổi trạng thái</h3>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="">-- Chọn trạng thái --</option>
                            <option value="Đang hoạt động">Đang hoạt động</option>
                            <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                        </select>
                        <div className="modal-buttons">
                            <button onClick={() => setShowStatusModal(false)}>Hủy</button>
                            <button onClick={handleStatusChange}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
