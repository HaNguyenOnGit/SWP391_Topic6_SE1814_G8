import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
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
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Họ tên là bắt buộc";
        break;
      case "phone":
        if (!/^[0-9]{10}$/.test(value)) error = "Số điện thoại phải đủ 10 số";
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
      case "cccdFront":
        if (!value) error = "Vui lòng tải ảnh CCCD mặt trước";
        break;
      case "cccdBack":
        if (!value) error = "Vui lòng tải ảnh CCCD mặt sau";
        break;
      case "licenseFront":
        if (!value) error = "Vui lòng tải ảnh bằng lái mặt trước";
        break;
      case "licenseBack":
        if (!value) error = "Vui lòng tải ảnh bằng lái mặt sau";
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

    const errorMsg = validateField(name, fieldValue);
    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg || "",
    }));

    if (name === "password" && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).every((err) => !err)) {
      console.log("Form data:", formData);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      phone: "",
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
    <div
      style={{
        width: "400px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <h2>Đăng ký</h2>

        {/* Full Name */}
        <label>Họ tên</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          style={{ borderColor: errors.fullName ? "red" : "#ccc", width: "100%" }}
        />
        {errors.fullName && <p style={{ color: "red" }}>{errors.fullName}</p>}

        {/* Phone */}
        <label>Số điện thoại</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          style={{ borderColor: errors.phone ? "red" : "#ccc", width: "100%" }}
        />
        {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}

        {/* Password */}
        <label>Mật khẩu</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          style={{ borderColor: errors.password ? "red" : "#ccc", width: "100%" }}
        />
        {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

        {/* Confirm Password */}
        <label>Nhập lại mật khẩu</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={{ borderColor: errors.confirmPassword ? "red" : "#ccc", width: "100%" }}
        />
        {errors.confirmPassword && <p style={{ color: "red" }}>{errors.confirmPassword}</p>}

        {/* CCCD */}
        <label>CCCD</label>
        <input
          type="text"
          name="cccd"
          value={formData.cccd}
          onChange={handleChange}
          style={{ borderColor: errors.cccd ? "red" : "#ccc", width: "100%" }}
        />
        {errors.cccd && <p style={{ color: "red" }}>{errors.cccd}</p>}

        {/* License */}
        <label>Giấy phép lái xe</label>
        <input
          type="text"
          name="license"
          value={formData.license}
          onChange={handleChange}
          style={{ borderColor: errors.license ? "red" : "#ccc", width: "100%" }}
        />
        {errors.license && <p style={{ color: "red" }}>{errors.license}</p>}

        {/* CCCD Front */}
        <div style={{ marginTop: "10px" }}>
          <button type="button" onClick={() => document.getElementById("cccdFrontInput").click()}>
            Ảnh CCCD (Mặt trước)
          </button>
          <input
            id="cccdFrontInput"
            type="file"
            name="cccdFront"
            accept="image/*"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          {formData.cccdFront && <span> {formData.cccdFront.name}</span>}
          {errors.cccdFront && <p style={{ color: "red" }}>{errors.cccdFront}</p>}
        </div>

        {/* CCCD Back */}
        <div style={{ marginTop: "10px" }}>
          <button type="button" onClick={() => document.getElementById("cccdBackInput").click()}>
            Ảnh CCCD (Mặt sau)
          </button>
          <input
            id="cccdBackInput"
            type="file"
            name="cccdBack"
            accept="image/*"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          {formData.cccdBack && <span> {formData.cccdBack.name}</span>}
          {errors.cccdBack && <p style={{ color: "red" }}>{errors.cccdBack}</p>}
        </div>

        {/* License Front */}
        <div style={{ marginTop: "10px" }}>
          <button type="button" onClick={() => document.getElementById("licenseFrontInput").click()}>
            Ảnh bằng lái (Mặt trước)
          </button>
          <input
            id="licenseFrontInput"
            type="file"
            name="licenseFront"
            accept="image/*"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          {formData.licenseFront && <span> {formData.licenseFront.name}</span>}
          {errors.licenseFront && <p style={{ color: "red" }}>{errors.licenseFront}</p>}
        </div>

        {/* License Back */}
        <div style={{ marginTop: "10px" }}>
          <button type="button" onClick={() => document.getElementById("licenseBackInput").click()}>
            Ảnh bằng lái (Mặt sau)
          </button>
          <input
            id="licenseBackInput"
            type="file"
            name="licenseBack"
            accept="image/*"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          {formData.licenseBack && <span> {formData.licenseBack.name}</span>}
          {errors.licenseBack && <p style={{ color: "red" }}>{errors.licenseBack}</p>}
        </div>

        {/* Bank Name */}
        <label style={{ marginTop: "10px", display: "block" }}>Tên ngân hàng</label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          style={{ borderColor: errors.bankName ? "red" : "#ccc", width: "100%" }}
        />
        {errors.bankName && <p style={{ color: "red" }}>{errors.bankName}</p>}

        {/* Bank Number */}
        <label style={{ marginTop: "10px", display: "block" }}>Số tài khoản</label>
        <input
          type="text"
          name="bankNumber"
          value={formData.bankNumber}
          onChange={handleChange}
          style={{ borderColor: errors.bankNumber ? "red" : "#ccc", width: "100%" }}
        />
        {errors.bankNumber && <p style={{ color: "red" }}>{errors.bankNumber}</p>}

        {/* Buttons */}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button type="submit">Đăng ký</button>
          <button type="button" onClick={handleCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
