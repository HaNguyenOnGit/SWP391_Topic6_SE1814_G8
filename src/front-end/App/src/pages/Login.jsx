import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage({ apiUrl }) {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

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
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Đăng nhập thất bại");

            if (data.token) {
                localStorage.setItem("auth_token", data.token);
            }

            setMessage("Đăng nhập thành công!");
            setPhone("");
            setPassword("");
        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
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
    );
}
