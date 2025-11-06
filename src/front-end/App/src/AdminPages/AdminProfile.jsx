import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./ANavbar";
import { useNavigate } from "react-router-dom";


export default function AdminProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        fullName: "",
        phone: "",
        email: "",
    });

    const [section, setSection] = useState("");
    const [form, setForm] = useState({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchMe = async () => {
            try {
                const res = await axios.get("/api/user/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const u = res?.data?.User ?? res?.data?.user;
                if (u) {
                    localStorage.setItem("auth_user", JSON.stringify(u));
                    setUser({
                        fullName: u?.FullName ?? u?.fullName ?? "",
                        phone: u?.PhoneNumber ?? u?.phoneNumber ?? u?.phone ?? "",
                        email: u?.Email ?? u?.email ?? "",
                    });
                }
            } catch (err) {
                if (err?.response && (err.response.status === 401 || err.response.status === 403)) {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("auth_user");
                    navigate("/login");
                    return;
                }
                const userJson = localStorage.getItem("auth_user");
                if (userJson) {
                    try {
                        const u = JSON.parse(userJson);
                        setUser({
                            fullName: u?.FullName ?? u?.fullName ?? "",
                            phone: u?.PhoneNumber ?? u?.phoneNumber ?? u?.phone ?? "",
                            email: u?.Email ?? u?.email ?? "",
                        });
                    } catch {
                        setUser((prev) => ({ ...prev, fullName: userJson }));
                    }
                }
            }
        };

        fetchMe();
    }, [navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (type) => {
        if (!form.currentPwd) return setMessage("Vui lòng nhập mật khẩu hiện tại để xác nhận!");

        // Giả lập xác minh mật khẩu (thực tế sẽ gửi request backend)
        if (form.currentPwd !== "password123") {
            return setMessage("Mật khẩu hiện tại không đúng!");
        }

        if (type === "password") {
            if (form.newPwd !== form.confirmPwd)
                return setMessage("Mật khẩu mới và xác nhận không khớp!");
            setMessage("Đổi mật khẩu thành công!");
        }

        setForm({});
        setSection("");
    };

    const handleSectionChange = (newSection) => {
        setSection((prevSection) => (prevSection === newSection ? "" : newSection));
    };

    return (
        <div className="admin-container">
            <AdminNavbar adminName={user.fullName || "Admin"} />

            <main className="admin-content">
                {section === "password" ? (
                    <div className="admin-profile-card">
                        <h2>Đổi mật khẩu</h2>
                        <div className="space-y-2">
                            <input type="password" name="currentPwd" placeholder="Mật khẩu hiện tại" onChange={handleChange} />
                            <input type="password" name="newPwd" placeholder="Mật khẩu mới" onChange={handleChange} />
                            <input type="password" name="confirmPwd" placeholder="Xác nhận mật khẩu mới" onChange={handleChange} />
                            <button className="admin-save-btn" onClick={() => handleSubmit("password")}>Cập nhật mật khẩu</button>
                            <a href="#" onClick={() => handleSectionChange("")}>Quay lại</a>
                        </div>
                    </div>
                ) : (
                    <div className="admin-profile-card">
                        <h2>Hồ sơ Admin</h2>

                        <div className="admin-section">
                            <h3>Thông tin cá nhân</h3>
                            <p><b>Họ tên:</b> {user.fullName}</p>
                            <p><b>Số điện thoại:</b> {user.phone}</p>
                            <p><b>Email:</b> {user.email}</p>
                        </div>

                        <div className="admin-section">
                            <h3>Đổi mật khẩu</h3>
                            <button onClick={() => handleSectionChange("password")}>Đổi mật khẩu</button>
                        </div>

                        {message && <p className="admin-message">{message}</p>}
                        <button
                            className="admin-logout-btn"
                            onClick={() => {
                                localStorage.removeItem("auth_token");
                                localStorage.removeItem("auth_user");
                                navigate("/login");
                            }}
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}