import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    cccd: "",
    license: "",
    cccdFront: null,
    cccdBack: null,
    licenseFront: null,
    licenseBack: null,
    bankName: "",
    bankNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const mockOTP = "123456";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Họ tên là bắt buộc";
        break;
      case "phone":
        if (!/^[0-9]{10}$/.test(value)) error = "Số điện thoại phải đủ 10 số";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Email không hợp lệ";
        break;
      case "password":
        if (value.length < 6) error = "Mật khẩu phải từ 6 ký tự trở lên";
        break;
      case "confirmPassword":
        if (value !== formData.password) error = "Mật khẩu nhập lại không khớp";
        break;
      case "cccd":
        if (!/^[0-9]{12}$/.test(value)) error = "CCCD phải gồm 12 số";
        break;
      case "license":
        if (!value.trim()) error = "Số giấy phép lái xe là bắt buộc";
        break;
      case "bankName":
        if (!value.trim()) error = "Tên ngân hàng là bắt buộc";
        break;
      case "bankNumber":
        if (!/^[0-9]{8,20}$/.test(value)) error = "Số tài khoản không hợp lệ";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const fieldValue = files ? files[0] : value;
    setFormData({ ...formData, [name]: fieldValue });
    setErrors((prev) => ({ ...prev, [name]: validateField(name, fieldValue) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(
      (key) => (newErrors[key] = validateField(key, formData[key]))
    );
    setErrors(newErrors);

    if (Object.values(newErrors).every((err) => !err)) {
      setShowOTP(true);
      setCountdown(30);
      alert(`Mock gửi OTP (${mockOTP}) tới email: ${formData.email}`);
    }
  };

  const handleVerify = () => {
    if (otp === mockOTP) {
      navigate("/registrationpending");
    } else {
      setMessage("Mã OTP không đúng, vui lòng thử lại.");
    }
  };

  const resendCode = () => {
    if (countdown === 0) {
      setCountdown(30);
      alert(`🔄 Mã mới (mock): ${mockOTP}`);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      cccd: "",
      license: "",
      cccdFront: null,
      cccdBack: null,
      licenseFront: null,
      licenseBack: null,
      bankName: "",
      bankNumber: "",
    });
    setErrors({});
    navigate("/login");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <h2>Đăng ký</h2>

        {[["Họ tên", "fullName", "text"],
        ["Số điện thoại", "phone", "tel"],
        ["Email", "email", "email"],
        ["Mật khẩu", "password", "password"],
        ["Nhập lại mật khẩu", "confirmPassword", "password"],
        ["CCCD", "cccd", "text"],
        ["Giấy phép lái xe", "license", "text"],
        ["Tên ngân hàng", "bankName", "text"],
        ["Số tài khoản", "bankNumber", "text"],
        ].map(([label, name, type]) => (
          <div key={name}>
            <label>{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
            />
            {errors[name] && <p style={{ color: "red" }}>{errors[name]}</p>}
          </div>
        ))}

        {[["Ảnh CCCD (Mặt trước)", "cccdFront"],
        ["Ảnh CCCD (Mặt sau)", "cccdBack"],
        ["Ảnh bằng lái (Mặt trước)", "licenseFront"],
        ["Ảnh bằng lái (Mặt sau)", "licenseBack"],
        ].map(([label, name]) => (
          <div key={name}>
            <button
              type="button"
              onClick={() => document.getElementById(name).click()}
            >
              {label}
            </button>
            <input
              id={name}
              type="file"
              name={name}
              accept="image/*"
              onChange={handleChange}
              style={{ display: "none" }}
            />
            {formData[name] && <span> {formData[name].name}</span>}
          </div>
        ))}

        <div>
          <button type="submit">Đăng ký</button>
          <button type="button" onClick={handleCancel}>
            Hủy
          </button>
        </div>
      </form>

      {/* Overlay OTP */}
      {showOTP && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3>Xác minh email</h3>
            <p>{formData.email}</p>
            <input
              type="number"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {message && <p style={{ color: "red" }}>{message}</p>}

            <button onClick={handleVerify}>Xác minh</button>
            <button
              onClick={resendCode}
              disabled={countdown > 0}
              style={{
                color: countdown > 0 ? "gray" : "blue",
                background: "none",
                border: "none",
              }}
            >
              {countdown > 0
                ? `Gửi lại mã sau ${countdown}s`
                : "Gửi lại mã xác minh"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
