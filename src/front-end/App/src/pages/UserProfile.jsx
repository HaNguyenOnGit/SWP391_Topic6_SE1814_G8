import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../NavBar";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        fullName: "",
        phone: "",
        email: "",
        cccd: "",
        license: "",
        bankName: "",
        bankAccount: "",
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
                        cccd: u?.CitizenId ?? u?.citizenId ?? "",
                        license: u?.DriverLicenseId ?? u?.driverLicenseId ?? "",
                        bankName: u?.BankName ?? u?.bankName ?? "",
                        bankAccount: u?.BankAccount ?? u?.bankAccount ?? ""
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
                            cccd: u?.CitizenId ?? u?.citizenId ?? "",
                            license: u?.DriverLicenseId ?? u?.driverLicenseId ?? "",
                            bankName: u?.BankName ?? u?.bankName ?? "",
                            bankAccount: u?.BankAccount ?? u?.bankAccount ?? ""
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
        } else if (type === "bank") {
            setUser({ ...user, bankName: form.bankName, bankAccount: form.bankAccount });
            setMessage("Cập nhật thông tin ngân hàng thành công!");
        }

        setForm({});
        setSection("");
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-xl mx-auto p-6 border rounded-2xl shadow-sm space-y-6">
                <h2 className="text-2xl font-bold">Hồ sơ người dùng</h2>

                {/* Thông tin cá nhân */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">Thông tin cá nhân</h3>
                    <p><b>Họ tên:</b> {user.fullName}</p>
                    <p><b>Số điện thoại:</b> {user.phone}</p>
                    <p><b>Email:</b> {user.email}</p>
                    <p><b>CCCD:</b> {user.cccd}</p>
                    <p><b>Giấy phép lái xe:</b> {user.license}</p>
                </div>

                {/* Thông tin ngân hàng */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">Thông tin ngân hàng</h3>
                    {section !== "bank" ? (
                        <>
                            <p><b>Ngân hàng:</b> {user.bankName}</p>
                            <p><b>Số tài khoản:</b> {user.bankAccount}</p>
                            <button className="text-blue-600 underline" onClick={() => setSection("bank")}>
                                Chỉnh sửa thông tin ngân hàng
                            </button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <input name="bankName" placeholder="Tên ngân hàng" onChange={handleChange} className="border p-2 w-full" />
                            <input name="bankAccount" placeholder="Số tài khoản" onChange={handleChange} className="border p-2 w-full" />
                            <input type="password" name="currentPwd" placeholder="Nhập mật khẩu hiện tại để xác nhận" onChange={handleChange} className="border p-2 w-full" />
                            <button onClick={() => handleSubmit("bank")} className="bg-green-600 text-white px-4 py-2 rounded">
                                Lưu thay đổi
                            </button>
                        </div>
                    )}
                </div>

                {/* Đổi mật khẩu */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">Đổi mật khẩu</h3>
                    {section !== "password" ? (
                        <button className="text-blue-600 underline" onClick={() => setSection("password")}>
                            Đổi mật khẩu
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <input type="password" name="currentPwd" placeholder="Mật khẩu hiện tại" onChange={handleChange} className="border p-2 w-full" />
                            <input type="password" name="newPwd" placeholder="Mật khẩu mới" onChange={handleChange} className="border p-2 w-full" />
                            <input type="password" name="confirmPwd" placeholder="Xác nhận mật khẩu mới" onChange={handleChange} className="border p-2 w-full" />
                            <button onClick={() => handleSubmit("password")} className="bg-green-600 text-white px-4 py-2 rounded">
                                Cập nhật mật khẩu
                            </button>
                        </div>
                    )}
                </div>

                {message && <p className="text-center text-sm mt-4">{message}</p>}
                <div className="text-center mt-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem("auth_token");
                            localStorage.removeItem("auth_user");
                            navigate("/login");
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}

