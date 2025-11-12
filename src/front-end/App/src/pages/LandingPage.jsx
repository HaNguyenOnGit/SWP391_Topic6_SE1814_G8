import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    const oldPadding = document.body.style.padding;
    const oldMargin = document.body.style.margin;

    // Gán padding/margin = 0
    document.body.style.padding = "0";
    document.body.style.margin = "0";

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="logo">
                        <h2>EVShare</h2>
                    </div>
                    <nav className="nav">
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-outline">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Đăng ký
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Đồng sở hữu xe điện <br />
                            <span className="highlight">Chia sẻ chi phí thông minh</span>
                        </h1>
                        <p className="hero-description">
                            EVShare là nền tảng tiên phong cho phép nhiều người cùng sở hữu một chiếc xe điện,
                            chia sẻ chi phí mua xe, bảo trì và vận hành một cách minh bạch và công bằng.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/login" className="btn btn-primary btn-large">
                                Bắt đầu ngay
                            </Link>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src="/theme.png" alt="Electric Vehicles" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Tại sao chọn EVShare?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚗</div>
                            <h3>Đồng sở hữu thông minh</h3>
                            <p>Nhiều người cùng sở hữu một xe điện, giảm chi phí mua xe ban đầu</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💰</div>
                            <h3>Chia sẻ chi phí minh bạch</h3>
                            <p>Chi phí bảo trì, sạc điện, bảo hiểm được chia đều một cách công bằng</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>Quản lý dễ dàng</h3>
                            <p>Ứng dụng thông minh giúp đặt lịch, thanh toán và theo dõi chi phí</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌱</div>
                            <h3>Thân thiện môi trường</h3>
                            <p>Sử dụng xe điện, giảm khí thải, bảo vệ môi trường</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⏰</div>
                            <h3>Linh hoạt thời gian</h3>
                            <p>Đặt lịch sử dụng xe theo nhu cầu cá nhân</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🤝</div>
                            <h3>Cộng đồng tin cậy</h3>
                            <p>Kết nối với những người có chung mục tiêu bền vững</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">Cách thức hoạt động</h2>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Đăng ký tài khoản</h3>
                            <p>Tạo tài khoản và xác thực thông tin cá nhân</p>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Ký hợp đồng</h3>
                            <p>Hoàn tất thủ tục pháp lý và ký hợp đồng đồng sở hữu</p>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Sử dụng và chia sẻ</h3>
                            <p>Đặt lịch sử dụng xe và chia sẻ chi phí một cách minh bạch</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <h2>Sẵn sàng bắt đầu hành trình xanh?</h2>
                    <p>Tham gia EVShare ngay hôm nay và trải nghiệm cách thức sở hữu xe điện thông minh</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary btn-large">
                            Đăng ký ngay
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-large">
                            Đã có tài khoản? Đăng nhập
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>EVShare</h3>
                            <p>Nền tảng đồng sở hữu xe điện thông minh</p>
                        </div>
                        <div className="footer-section">
                            <h4>Liên kết</h4>
                            <ul>
                                <li><Link to="/vehicles">Xe có sẵn</Link></li>
                                <li><Link to="/login">Đăng nhập</Link></li>
                                <li><Link to="/register">Đăng ký</Link></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Hỗ trợ</h4>
                            <ul>
                                <li>Trợ giúp</li>
                                <li>Liên hệ</li>
                                <li>Điều khoản</li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 EVShare. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
