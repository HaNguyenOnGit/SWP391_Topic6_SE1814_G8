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

  // 1) Đếm ngược OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const oldPadding = document.body.style.padding;
  const oldMargin = document.body.style.margin;

  // Gán padding/margin = 0
  document.body.style.padding = "0";
  document.body.style.margin = "0";

  // 2) Thêm Bootstrap + FontAwesome khi vào trang, gỡ khi rời khỏi
  useEffect(() => {
    // Tạo link Bootstrap
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";

    // Tạo link FontAwesome
    const fontAwesomeLink = document.createElement("link");
    fontAwesomeLink.rel = "stylesheet";
    fontAwesomeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";

    // Gắn vào head
    document.head.appendChild(bootstrapLink);
    document.head.appendChild(fontAwesomeLink);

    // Khi component unmount (ví dụ: bạn ấn Hủy → navigate sang Login)
    // thì ta loại bỏ Bootstrap để không ảnh hưởng trang khác
    return () => {
      if (document.head.contains(bootstrapLink)) {
        document.head.removeChild(bootstrapLink);
      }
      if (document.head.contains(fontAwesomeLink)) {
        document.head.removeChild(fontAwesomeLink);
      }
    };

  }, []);


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
        // Check if phone number exists
        const phoneCheckRes = await axios.get(`/api/user/phone/${formData.phone}`);
        if (phoneCheckRes.status === 200) {
          setFormMessage("Số điện thoại đã tồn tại trong hệ thống. Vui lòng sử dụng số khác.");
          return;
        }
      } catch (err) {
        if (err.response && err.response.status !== 404) {
          setFormMessage("Có lỗi khi kiểm tra số điện thoại. Vui lòng thử lại.");
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

  // Small helper to show filename or placeholder
  const fileName = (file) => (file ? file.name || "" : "");

  return (
    <div className="registration-bg">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-xl-7">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <h3 className="card-title text-center mb-4 fw-bold text-primary">
                  Đăng ký
                </h3>

                <form onSubmit={handleSubmit} noValidate>
                  {/* --- Thông tin cá nhân --- */}
                  <div className="p-3 mb-4 rounded border bg-light-subtle">
                    <h5 className="text-primary mb-3">Thông tin cá nhân</h5>
                    <div className="row g-3">
                      {/* fullName */}
                      <div className="col-md-6">
                        <label className="form-label">Họ tên</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-user"></i>
                          </span>
                          <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            type="text"
                            className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                          />
                          {errors.fullName && (
                            <div className="invalid-feedback">{errors.fullName}</div>
                          )}
                        </div>
                      </div>

                      {/* phone */}
                      <div className="col-md-6">
                        <label className="form-label">Số điện thoại</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-phone"></i>
                          </span>
                          <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            type="tel"
                            className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                          />
                          {errors.phone && (
                            <div className="invalid-feedback">{errors.phone}</div>
                          )}
                        </div>
                      </div>

                      {/* email */}
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-envelope"></i>
                          </span>
                          <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>
                      </div>

                      {/* password */}
                      <div className="col-md-6">
                        <label className="form-label">Mật khẩu</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-lock"></i>
                          </span>
                          <input
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            type="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                          />
                          {errors.password && (
                            <div className="invalid-feedback">{errors.password}</div>
                          )}
                        </div>
                      </div>

                      {/* confirmPassword */}
                      <div className="col-md-6">
                        <label className="form-label">Nhập lại mật khẩu</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-lock"></i>
                          </span>
                          <input
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            type="password"
                            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                          />
                          {errors.confirmPassword && (
                            <div className="invalid-feedback">
                              {errors.confirmPassword}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- Thông tin định danh --- */}
                  <div className="p-3 mb-4 rounded border bg-light-subtle">
                    <h5 className="text-primary mb-3">Thông tin định danh</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">CCCD</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-id-card"></i>
                          </span>
                          <input
                            name="cccd"
                            value={formData.cccd}
                            onChange={handleChange}
                            type="text"
                            className={`form-control ${errors.cccd ? "is-invalid" : ""}`}
                          />
                          {errors.cccd && (
                            <div className="invalid-feedback">{errors.cccd}</div>
                          )}
                        </div>
                      </div>

                      <div className="w-100"></div>

                      <div className="col-md-6">
                        <label className="form-label">Ảnh CCCD (Mặt trước)</label>
                        <input
                          type="file"
                          name="cccdFront"
                          accept="image/*"
                          className="form-control"
                          onChange={handleChange}
                        />
                        {fileName(formData.cccdFront) && (
                          <small className="text-muted">{fileName(formData.cccdFront)}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Ảnh CCCD (Mặt sau)</label>
                        <input
                          type="file"
                          name="cccdBack"
                          accept="image/*"
                          className="form-control"
                          onChange={handleChange}
                        />
                        {fileName(formData.cccdBack) && (
                          <small className="text-muted">{fileName(formData.cccdBack)}</small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- Thông tin bằng lái --- */}
                  <div className="p-3 mb-4 rounded border bg-light-subtle">
                    <h5 className="text-primary mb-3">Thông tin bằng lái</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Giấy phép lái xe</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-id-badge"></i>
                          </span>
                          <input
                            name="license"
                            value={formData.license}
                            onChange={handleChange}
                            type="text"
                            className={`form-control ${errors.license ? "is-invalid" : ""}`}
                          />
                          {errors.license && (
                            <div className="invalid-feedback">{errors.license}</div>
                          )}
                        </div>
                      </div>

                      <div className="w-100"></div>

                      <div className="col-md-6">
                        <label className="form-label">Ảnh bằng lái (Mặt trước)</label>
                        <input
                          type="file"
                          name="licenseFront"
                          accept="image/*"
                          className="form-control"
                          onChange={handleChange}
                        />
                        {fileName(formData.licenseFront) && (
                          <small className="text-muted">{fileName(formData.licenseFront)}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Ảnh bằng lái (Mặt sau)</label>
                        <input
                          type="file"
                          name="licenseBack"
                          accept="image/*"
                          className="form-control"
                          onChange={handleChange}
                        />
                        {fileName(formData.licenseBack) && (
                          <small className="text-muted">{fileName(formData.licenseBack)}</small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- Thông tin ngân hàng --- */}
                  <div className="p-3 mb-4 rounded border bg-light-subtle">
                    <h5 className="text-primary mb-3">Thông tin ngân hàng</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Tên ngân hàng</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-university"></i>
                          </span>
                          <input
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            type="text"
                            className={`form-control ${errors.bankName ? "is-invalid" : ""}`}
                          />
                          {errors.bankName && (
                            <div className="invalid-feedback">{errors.bankName}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Số tài khoản</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fa fa-credit-card"></i>
                          </span>
                          <input
                            name="bankNumber"
                            value={formData.bankNumber}
                            onChange={handleChange}
                            type="text"
                            className={`form-control ${errors.bankNumber ? "is-invalid" : ""}`}
                          />
                          {errors.bankNumber && (
                            <div className="invalid-feedback">{errors.bankNumber}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- Buttons --- */}
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <button type="submit" className="btn btn-primary px-4">
                      Đăng ký
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={handleCancel}
                    >
                      Hủy
                    </button>
                  </div>

                  {formMessage && (
                    <div
                      className={`mt-3 text-center ${formMessage.includes("thành công") ? "text-success" : "text-danger"
                        }`}
                    >
                      {formMessage}
                    </div>
                  )}
                </form>
              </div>

              <div className="card-footer text-center small text-muted">
                © EV Share
              </div>
            </div>
          </div>
        </div>

        {/* OTP Modal giữ nguyên */}
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
    </div>
  );
}