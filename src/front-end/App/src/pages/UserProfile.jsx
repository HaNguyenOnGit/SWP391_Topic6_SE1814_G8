import React, { useState, useEffect } from "react";
import Navbar from "../NavBar";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        fullName: "Nguyễn Văn A",
        phone: "0901234567",
        email: "nguyenvana@example.com",
        cccd: "123456789012",
        license: "B2",
        bankName: "Vietcombank",
        bankAccount: "0123456789",
    });

    const [section, setSection] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [form, setForm] = useState({});
    const [message, setMessage] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [retryCount, setRetryCount] = useState(0);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const sendOtp = () => {
        if (retryCount >= 3) return setMessage("Bạn đã gửi OTP quá 3 lần. Vui lòng thử lại sau.");
        setOtpSent(true);
        setOtpVerified(false);
        setMessage("Mã OTP đã được gửi đến email của bạn!");
        setRetryCount(retryCount + 1);
        setResendTimer(30);
    };

    useEffect(() => {
        if (resendTimer <= 0) return;
        const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [resendTimer]);

    const verifyOtp = () => {
        if (otp === "123456") {
            setOtpVerified(true);
            setMessage("Xác minh OTP thành công!");
        } else {
            setMessage("OTP không hợp lệ. Vui lòng thử lại.");
        }
    };

    const handleSubmit = (type) => {
        if (!otpVerified) return setMessage("Vui lòng xác minh OTP trước!");
        if (type === "password") {
            if (form.newPwd !== form.confirmPwd) return setMessage("Mật khẩu không khớp!");
            setMessage("Đổi mật khẩu thành công!");
        } else if (type === "bank") {
            setUser({ ...user, bankName: form.bankName, bankAccount: form.bankAccount });
            setMessage("Cập nhật thông tin ngân hàng thành công!");
        }
        setOtpVerified(false);
        setOtpSent(false);
        setOtp("");
        setForm({});
    };

    return (
        <div>
            <Navbar username="Người dùng" />
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
                            {!otpSent ? (
                                <button onClick={sendOtp} className="bg-blue-500 text-white px-4 py-2 rounded">Gửi OTP</button>
                            ) : !otpVerified ? (
                                <>
                                    <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập mã OTP" className="border p-2 w-full" />
                                    <button onClick={verifyOtp} className="bg-green-500 text-white px-4 py-2 rounded">Xác minh OTP</button>
                                    {resendTimer > 0 ? (
                                        <p className="text-sm text-gray-500">Gửi lại sau {resendTimer}s</p>
                                    ) : (
                                        <button onClick={sendOtp} className="text-blue-600 underline">Gửi lại OTP</button>
                                    )}
                                </>
                            ) : (
                                <button onClick={() => handleSubmit("bank")} className="bg-green-600 text-white px-4 py-2 rounded">Lưu thay đổi</button>
                            )}
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
                            {!otpSent ? (
                                <button onClick={sendOtp} className="bg-blue-500 text-white px-4 py-2 rounded">Gửi OTP</button>
                            ) : !otpVerified ? (
                                <>
                                    <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập mã OTP" className="border p-2 w-full" />
                                    <button onClick={verifyOtp} className="bg-green-500 text-white px-4 py-2 rounded">Xác minh OTP</button>
                                    {resendTimer > 0 ? (
                                        <p className="text-sm text-gray-500">Gửi lại sau {resendTimer}s</p>
                                    ) : (
                                        <button onClick={sendOtp} className="text-blue-600 underline">Gửi lại OTP</button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <input type="password" name="newPwd" placeholder="Mật khẩu mới" onChange={handleChange} className="border p-2 w-full" />
                                    <input type="password" name="confirmPwd" placeholder="Xác nhận mật khẩu mới" onChange={handleChange} className="border p-2 w-full" />
                                    <button onClick={() => handleSubmit("password")} className="bg-green-600 text-white px-4 py-2 rounded">Cập nhật mật khẩu</button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {message && <p className="text-center text-sm mt-4">{message}</p>}
                <div className="text-center mt-4">
                    <button onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); navigate('/login'); }} className="bg-red-600 text-white px-4 py-2 rounded">Đăng xuất</button>
                </div>
            </div>
        </div>
    );
}

