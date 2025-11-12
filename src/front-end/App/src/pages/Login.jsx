import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Login.css";


export default function LoginPage({ apiUrl }) {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const oldPadding = document.body.style.padding;
    const oldMargin = document.body.style.margin;

    // Gán padding/margin = 0
    document.body.style.padding = "0";
    document.body.style.margin = "0";

    // Validate 1 field
    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "phone":
                if (!/^[0-9]{10}$/.test(value)) error = "Số điện thoại phải đủ 10 số";
                break;
            case "password":
                if (value.length < 6) error = "Mật khẩu phải từ 6 ký tự trở lên";
                break;
            default:
                break;
        }
        return error;
    };

    // Xử lý change realtime
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone") setPhone(value);
        if (name === "password") setPassword(value);

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // kiểm tra toàn bộ form
        const newErrors = {
            phone: validateField("phone", phone),
            password: validateField("password", password),
        };
        setErrors(newErrors);

        if (Object.values(newErrors).some((err) => err)) return;

        setLoading(true);
        try {
            // Use provided apiUrl if available, otherwise use relative path
            const url = apiUrl ? `${apiUrl.replace(/\/+$/, '')}/api/user/login` : `/api/user/login`;

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ PhoneNumber: phone, Password: password }),
            });

            // Try parse JSON but fallback to text for better error messages
            let data = null;
            const text = await res.text();
            try { data = text ? JSON.parse(text) : null; } catch { data = text; }

            if (!res.ok) {
                const errMsg = (data && data.message) || (typeof data === 'string' ? data : 'Đăng nhập thất bại');
                throw new Error(errMsg);
            }

            // Backend returns { Token, User }
            const token = data?.Token || data?.token;
            const user = data?.User || data?.user || null;

            // Store via AuthContext to update session-wide state
            setAuth({ token, user });

            setMessage("Đăng nhập thành công!");
            setPhone("");
            setPassword("");

            // Determine role: prefer value from returned user object, fallback to token payload if present
            let roleValue = user?.role || user?.Role || user?.roleName || user?.RoleName || null;
            if (!roleValue && token) {
                try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                        const json = atob(base64);
                        const payload = JSON.parse(json);
                        roleValue = payload.role || payload.Role || null;
                    }
                } catch { /* ignore */ }
            }

            const roleLower = roleValue ? String(roleValue).toLowerCase() : null;
            if (roleLower === 'admin') {
                navigate('/admin/users');
            } else {
                navigate('/vehicles');
            }
        } catch (err) {
            setMessage("Số điện thoại hoặc mật khẩu không đúng!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background"></div>
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <i className="fas fa-car-alt"></i>
                        </div>
                        <h2>Chào mừng trở lại!</h2>
                        <p>Đăng nhập vào tài khoản EV Share của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="login-form">
                        <div className="input-group">
                            <label>Số điện thoại</label>
                            <div className="input-wrapper">
                                <i className="fas fa-phone"></i>
                                <input
                                    type="text"
                                    name="phone"
                                    value={phone}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                    className={errors.phone ? "error" : ""}
                                    required
                                />
                            </div>
                            {errors.phone && (
                                <span className="error-message">{errors.phone}</span>
                            )}
                        </div>

                        <div className="input-group">
                            <label>Mật khẩu</label>
                            <div className="input-wrapper">
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                    className={errors.password ? "error" : ""}
                                    required
                                />
                            </div>
                            {errors.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                        </div>

                        {message && (
                            <div className={`message ${message.includes("thành công") ? "success" : "error"}`}>
                                <i className={`fas ${message.includes("thành công") ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i>
                                    Đăng nhập
                                </>
                            )}
                        </button>

                        <div className="login-footer">
                            <p>
                                Chưa có tài khoản?
                                <Link to="/register"> Đăng ký ngay</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
