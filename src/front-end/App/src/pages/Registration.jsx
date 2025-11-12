import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Registration.css"

export default function RegistrationForm() {
  useEffect(() => {
    const originalPadding = document.body.style.padding;
    const originalMargin = document.body.style.margin;

    document.body.style.padding = "0";
    document.body.style.margin = "0";

    return () => {
      document.body.style.padding = originalPadding;
      document.body.style.margin = originalMargin;
    };
  }, []);

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
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpMessage, setOtpMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ...existing validation and handler functions...

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
        if (!/^[0-9]{12}$/.test(value)) error = "Giấy phép lái xe phải gồm 12 số";
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
    setFormMessage("");
    setIsLoading(true);

    const newErrors = {};
    Object.keys(formData).forEach(
      (key) => (newErrors[key] = validateField(key, formData[key]))
    );
    setErrors(newErrors);

    if (Object.values(newErrors).every((err) => !err)) {
      try {
        // Check if phone number exists
        const phoneCheckRes = await axios.get(`/api/user/phone/${formData.phone}`);
        if (phoneCheckRes.status === 200) {
          setFormMessage("Số điện thoại đã tồn tại trong hệ thống. Vui lòng sử dụng số khác.");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        if (err.response && err.response.status !== 404) {
          setFormMessage("Có lỗi khi kiểm tra số điện thoại. Vui lòng thử lại.");
          setIsLoading(false);
          return;
        }
      }

      try {
        const data = new FormData();
        data.append('FullName', formData.fullName);
        data.append('Email', formData.email);
        data.append('CitizenId', formData.cccd);
        data.append('DriverLicenseId', formData.license);
        data.append('BankName', formData.bankName);
        data.append('BankAccount', formData.bankNumber);
        data.append('Role', 'Co-owner');
        data.append('PhoneNumber', formData.phone);
        data.append('Password', formData.password);

        if (formData.cccdFront) data.append('FrontIdImageFile', formData.cccdFront);
        if (formData.cccdBack) data.append('BackIdImageFile', formData.cccdBack);
        if (formData.licenseFront) data.append('FrontLicenseImageFile', formData.licenseFront);
        if (formData.licenseBack) data.append('BackLicenseImageFile', formData.licenseBack);

        const res = await axios.post("/api/user/add", data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

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
    setIsLoading(false);
  };

  // ...existing OTP handlers...
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpMessage("Vui lòng nhập đầy đủ 6 số OTP.");
      return;
    }

    try {
      const res = await axios.post(
        `/api/user/confirm-email?email=${formData.email}&code=${otpString}`
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
        setOtp(["", "", "", "", "", ""]);
        setOtpMessage("Mã xác nhận mới đã được gửi đến email của bạn!");
      } catch (err) {
        setOtpMessage("Không thể gửi lại mã xác nhận.");
      }
    }
  };

  const handleCancel = () => {
    // Reset form data về trạng thái ban đầu
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
    setIsLoading(false);
    navigate("/login");
  };


  const fileName = (file) => (file ? file.name || "" : "");

  return (
    <div className="registration-page">
      <div className="registration-background"></div>

      {!showOTP ? (
        <div className="registration-container">
          <div className="registration-card">
            {/* Header */}
            <div className="registration-header">
              <div className="registration-logo">
                <i className="fas fa-user-plus"></i>
              </div>
              <h2>Đăng ký tài khoản</h2>
              <p>Tạo tài khoản mới để tham gia chia sẻ xe điện</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {/* Personal Information Section */}
              <div className="form-section">
                <h5 className="section-title">
                  <i className="fas fa-user"></i>
                  Thông tin cá nhân
                </h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Họ tên *</label>
                      <div className="input-wrapper">
                        <input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          type="text"
                          placeholder="Nhập họ tên đầy đủ"
                          className={errors.fullName ? "input-error" : ""}
                        />
                        <i className="fas fa-user"></i>
                      </div>
                      {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Số điện thoại *</label>
                      <div className="input-wrapper">
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          className={errors.phone ? "input-error" : ""}
                        />
                        <i className="fas fa-phone"></i>
                      </div>
                      {errors.phone && <div className="error-message">{errors.phone}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Email *</label>
                      <div className="input-wrapper">
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          type="email"
                          placeholder="Nhập địa chỉ email"
                          className={errors.email ? "input-error" : ""}
                        />
                        <i className="fas fa-envelope"></i>
                      </div>
                      {errors.email && <div className="error-message">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Mật khẩu *</label>
                      <div className="input-wrapper">
                        <input
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          type="password"
                          placeholder="Nhập mật khẩu"
                          className={errors.password ? "input-error" : ""}
                        />
                        <i className="fas fa-lock"></i>
                      </div>
                      {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Nhập lại mật khẩu *</label>
                      <div className="input-wrapper">
                        <input
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          type="password"
                          placeholder="Nhập lại mật khẩu"
                          className={errors.confirmPassword ? "input-error" : ""}
                        />
                        <i className="fas fa-lock"></i>
                      </div>
                      {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity Information Section */}
              <div className="form-section">
                <h5 className="section-title">
                  <i className="fas fa-id-card"></i>
                  Thông tin định danh
                </h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Số CCCD *</label>
                      <div className="input-wrapper">
                        <input
                          name="cccd"
                          value={formData.cccd}
                          onChange={handleChange}
                          type="text"
                          placeholder="Nhập số CCCD"
                          className={errors.cccd ? "input-error" : ""}
                        />
                        <i className="fas fa-id-card"></i>
                      </div>
                      {errors.cccd && <div className="error-message">{errors.cccd}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Số giấy phép lái xe *</label>
                      <div className="input-wrapper">
                        <input
                          name="license"
                          value={formData.license}
                          onChange={handleChange}
                          type="text"
                          placeholder="Nhập số GPLX"
                          className={errors.license ? "input-error" : ""}
                        />
                        <i className="fas fa-id-badge"></i>
                      </div>
                      {errors.license && <div className="error-message">{errors.license}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Ảnh CCCD (Mặt trước)</label>
                      <input
                        type="file"
                        name="cccdFront"
                        accept="image/*"
                        className="file-input"
                        onChange={handleChange}
                      />
                      {fileName(formData.cccdFront) && (
                        <small className="text-muted mt-1">{fileName(formData.cccdFront)}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Ảnh CCCD (Mặt sau)</label>
                      <input
                        type="file"
                        name="cccdBack"
                        accept="image/*"
                        className="file-input"
                        onChange={handleChange}
                      />
                      {fileName(formData.cccdBack) && (
                        <small className="text-muted mt-1">{fileName(formData.cccdBack)}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Ảnh GPLX (Mặt trước)</label>
                      <input
                        type="file"
                        name="licenseFront"
                        accept="image/*"
                        className="file-input"
                        onChange={handleChange}
                      />
                      {fileName(formData.licenseFront) && (
                        <small className="text-muted mt-1">{fileName(formData.licenseFront)}</small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Ảnh GPLX (Mặt sau)</label>
                      <input
                        type="file"
                        name="licenseBack"
                        accept="image/*"
                        className="file-input"
                        onChange={handleChange}
                      />
                      {fileName(formData.licenseBack) && (
                        <small className="text-muted mt-1">{fileName(formData.licenseBack)}</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Information Section */}
              <div className="form-section">
                <h5 className="section-title">
                  <i className="fas fa-university"></i>
                  Thông tin ngân hàng
                </h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Tên ngân hàng *</label>
                      <div className="input-wrapper">
                        <input
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleChange}
                          type="text"
                          placeholder="Nhập tên ngân hàng"
                          className={errors.bankName ? "input-error" : ""}
                        />
                        <i className="fas fa-university"></i>
                      </div>
                      {errors.bankName && <div className="error-message">{errors.bankName}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="input-group">
                      <label>Số tài khoản *</label>
                      <div className="input-wrapper">
                        <input
                          name="bankNumber"
                          value={formData.bankNumber}
                          onChange={handleChange}
                          type="text"
                          placeholder="Nhập số tài khoản"
                          className={errors.bankNumber ? "input-error" : ""}
                        />
                        <i className="fas fa-credit-card"></i>
                      </div>
                      {errors.bankNumber && <div className="error-message">{errors.bankNumber}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Message */}
              {formMessage && (
                <div className={`message ${formMessage.includes("thành công") ? "success" : "error"}`}>
                  <i className={`fas ${formMessage.includes("thành công") ? "fa-check-circle" : "fa-exclamation-triangle"}`}></i>
                  {formMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="btn-group">
                <button
                  type="submit"
                  className="register-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      Đăng ký
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  <i className="fas fa-times"></i>
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // OTP Modal
        <div className="otp-modal">
          <div className="otp-card">
            <div className="otp-header">
              <i className="fas fa-shield-alt"></i>
              <h3>Xác minh email</h3>
              <p>Nhập mã OTP đã được gửi đến email của bạn</p>
              <div className="mt-3">
                <strong>{formData.email}</strong>
              </div>
            </div>

            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  name={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="otp-input"
                  maxLength="1"
                />
              ))}
            </div>

            {otpMessage && (
              <div className={`message ${otpMessage.includes("thành công") ? "success" : "error"}`}>
                <i className={`fas ${otpMessage.includes("thành công") ? "fa-check-circle" : "fa-exclamation-triangle"}`}></i>
                {otpMessage}
              </div>
            )}

            <div className="btn-group">
              <button
                onClick={handleVerify}
                disabled={otp.some(digit => !digit)}
                className="register-button"
              >
                <i className="fas fa-check"></i>
                Xác minh
              </button>

              <button
                onClick={resendCode}
                disabled={countdown > 0}
                className="cancel-button"
              >
                <i className="fas fa-refresh"></i>
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
              </button>

              <button
                onClick={() => {
                  setShowOTP(false);
                  setOtp(["", "", "", "", "", ""]);
                  setOtpMessage("");
                }}
                className="cancel-button"
              >
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </button>
            </div>

            <div className="text-center mt-4">
              <small className="text-muted">
                <i className="fas fa-clock"></i>
                Mã OTP có hiệu lực trong 10 phút
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}