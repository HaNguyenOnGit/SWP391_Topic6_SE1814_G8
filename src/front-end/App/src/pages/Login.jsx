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
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <form onSubmit={handleSubmit} noValidate>
                <h2>Đăng Nhập</h2>
                {message && <p>{message}</p>}

                <div style={{ marginBottom: "10px" }}>
                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={phone}
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "8px",
                            marginTop: "5px",
                            borderColor: errors.phone ? "red" : "#ccc",
                        }}
                        required
                    />
                    {errors.phone && (
                        <p style={{ color: "red", fontSize: "12px" }}>{errors.phone}</p>
                    )}
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "8px",
                            marginTop: "5px",
                            borderColor: errors.password ? "red" : "#ccc",
                        }}
                        required
                    />
                    {errors.password && (
                        <p style={{ color: "red", fontSize: "12px" }}>{errors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: "100%", padding: "10px" }}
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>

                <p style={{ marginTop: "10px", textAlign: "center" }}>
                    Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </p>
            </form>
        </div>
    );
}
