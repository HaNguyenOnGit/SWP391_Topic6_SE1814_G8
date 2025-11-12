import React from "react";
import { Link } from "react-router-dom";
import "./Registration.css" // Sử dụng chung CSS với Registration

export default function RegistrationPending() {
    return (
        <div className="registration-page">
            <div className="registration-background"></div>

            <div className="registration-container">
                <div className="registration-card">
                    {/* Header */}
                    <div className="registration-header">
                        <div className="registration-logo">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h2>Đăng ký thành công!</h2>
                        <p>Tài khoản của bạn đã được tạo và đang chờ xác minh từ quản trị viên</p>
                    </div>

                    {/* Success Message */}
                    <div className="form-section">
                        <div className="success-content">
                            <div className="success-icon">
                                <i className="fas fa-hourglass-half"></i>
                            </div>
                            <h4>Tài khoản đang được xử lý</h4>
                            <p className="success-description">
                                Chúng tôi sẽ xem xét thông tin của bạn và gửi email thông báo kết quả trong vòng <strong>24-48 giờ</strong> tới.
                            </p>

                            <div className="next-steps">
                                <h5>
                                    <i className="fas fa-list-ul"></i>
                                    Các bước tiếp theo:
                                </h5>
                                <ul>
                                    <li>
                                        <i className="fas fa-envelope"></i>
                                        Kiểm tra email để nhận thông báo xác nhận
                                    </li>
                                    <li>
                                        <i className="fas fa-clock"></i>
                                        Chờ quản trị viên xác minh thông tin
                                    </li>
                                    <li>
                                        <i className="fas fa-sign-in-alt"></i>
                                        Đăng nhập sau khi tài khoản được kích hoạt
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="btn-group">
                        <Link to="/login" className="register-button">
                            <i className="fas fa-sign-in-alt"></i>
                            Đăng nhập
                        </Link>

                        <Link to="/" className="cancel-button">
                            <i className="fas fa-home"></i>
                            Về trang chủ
                        </Link>
                    </div>

                    {/* Contact Support */}
                    <div className="support-section">
                        <p className="support-text">
                            <i className="fas fa-question-circle"></i>
                            Cần hỗ trợ? Liên hệ với chúng tôi qua email:
                            <a href="mailto:support@evshare.com" className="support-link">
                                support@evshare.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
