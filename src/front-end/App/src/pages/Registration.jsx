import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Registration.css"

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
  const [formMessage, setFormMessage] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(""); // reset thông báo

    const newErrors = {};
    Object.keys(formData).forEach(
      (key) => (newErrors[key] = validateField(key, formData[key]))
    );
    setErrors(newErrors);

    if (Object.values(newErrors).every((err) => !err)) {
      try {
        const toBase64 = (file) =>
          new Promise((resolve, reject) => {
            if (!file) return resolve("");
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

        const frontIdImage = await toBase64(formData.cccdFront);
        const backIdImage = await toBase64(formData.cccdBack);
        const frontLicenseImage = await toBase64(formData.licenseFront);
        const backLicenseImage = await toBase64(formData.licenseBack);

        const payload = {
          fullName: formData.fullName,
          email: formData.email,
          citizenId: formData.cccd,
          driverLicenseId: formData.license,
          bankName: formData.bankName,
          bankAccount: formData.bankNumber,
          role: "Co-owner",
          phoneNumber: formData.phone,
          password: formData.password,
          frontIdImage,
          backIdImage,
          frontLicenseImage,
          backLicenseImage,
        };

        const res = await axios.post("/api/user/add", payload);

        console.log("Register response:", res.data);
        setShowOTP(true);
        setCountdown(30);
        setFormMessage("Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.");
      } catch (err) {
        console.error("Registration error:", err);
        setFormMessage("Đăng ký có nội dung đã tồn tại hoặc chưa chính xác.");
      }
    } else {
      setFormMessage("Vui lòng kiểm tra lại thông tin bên trên.");
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post(
        `/api/user/confirm-email?email=${formData.email}&code=${otp}`
      );
      setOtpMessage("Xác minh thành công!");
      setTimeout(() => navigate("/registrationpending"), 1500);
    } catch (err) {
      console.error(err);
      setOtpMessage("Mã OTP không đúng hoặc đã hết hạn.");
    }
  };

  const resendCode = async () => {
    if (countdown === 0) {
      try {
        await axios.post(`/api/user/generate-code?email=${formData.email}`);
        setCountdown(30);
        setOtpMessage("Mã xác nhận mới đã được gửi đến email của bạn!");
      } catch (err) {
        setOtpMessage("Không thể gửi lại mã xác nhận.");
      }
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
    setFormMessage("");
    navigate("/login");
  };

  return (
    <div className="registration-page">
      <div className="image-container">
        <img src="/theme.png" alt="img" />
      </div>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <h2>Đăng ký</h2>

        {[
          ["Họ tên", "fullName", "text"],
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
            <br></br>
            <input
              className="txtInput txtInputReg"
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
            />
            {errors[name] && <p style={{ color: "red" }}>{errors[name]}</p>}
          </div>
        ))}

        {[
          ["Ảnh CCCD (Mặt trước)", "cccdFront"],
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

        <div style={{ padding: "20px 0" }}>
          <button className="btnInput" style={{ marginRight: "10px" }} type="submit">Đăng ký</button>
          <button className="btnReturn" type="button" onClick={handleCancel}>
            Hủy
          </button>
        </div>

        {formMessage && (
          <p
            style={{
              color: formMessage.startsWith("Đăng ký thành công") ? "green" : "red",
              marginTop: "10px",
            }}
          >
            {formMessage}
          </p>
        )}
      </form>

      {/* OTP Popup */}
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
            {otpMessage && (
              <p
                style={{
                  color: otpMessage.startsWith("X") ? "green" : "red",
                  marginTop: "8px",
                }}
              >
                {otpMessage}
              </p>
            )}

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




