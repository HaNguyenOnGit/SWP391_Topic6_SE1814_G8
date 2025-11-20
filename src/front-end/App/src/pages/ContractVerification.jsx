import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FaFileContract, FaUsers, FaListUl } from "react-icons/fa";
import "./ContractVerification.css";

export default function ContractVerification() {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuth();

    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const terms = [
        "Các bên phải tuân thủ luật giao thông đường bộ.",
        "Không được tự ý bán hoặc chuyển nhượng khi chưa có sự đồng ý của đồng sở hữu.",
        "Mọi chi phí bảo dưỡng, sửa chữa sẽ được chia theo tỷ lệ sở hữu."
    ];

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const res = await axios.get(`/api/contract/contract-detail/${contractId}`);
                setContract(res.data);
            } catch (err) {
                console.error(err);
                setError("Không thể tải thông tin hợp đồng.");
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, [contractId]);

    const handleResponse = async (accept) => {
        try {
            await axios.post("/api/contract/update-member-status", {
                contractId: parseInt(contractId),
                userId: parseInt(userId),
                status: accept ? "Confirmed" : "Rejected",
            });

            alert(accept ? "Bạn đã chấp nhận hợp đồng." : "Bạn đã từ chối hợp đồng.");
            navigate("/vehicles"); // chuyển hướng sau khi xác nhận
        } catch (err) {
            console.error("Error responding to contract:", err);
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content contract-verification">
                <h1>Xác nhận hợp đồng</h1>

                {contract ? (
                    <div>
                        <div className="contract-info">
                            <div className="section-title">
                                <div className="icon"><FaFileContract /></div>
                                <h2>Thông tin hợp đồng</h2>
                            </div>
                            <p><strong>Tên phương tiện:</strong> {contract.vehicleName}</p>
                            <p><strong>Biển kiểm soát:</strong> {contract.licensePlate}</p>
                            <p><strong>Model:</strong> {contract.model}</p>
                            <p><strong>Ngày bắt đầu:</strong> {contract.startDate}</p>
                            <p><strong>Trạng thái:</strong> {contract.status}</p>
                        </div>

                        <div className="members-list">
                            <div className="section-title">
                                <div className="icon users"><FaUsers /></div>
                                <h3>Danh sách đồng sở hữu</h3>
                            </div>
                            {contract.members && contract.members.length > 0 ? (
                                <div className="owners-grid">
                                    {contract.members.map((m, index) => (
                                        <div key={index} className="owner-card">
                                            <div className="owner-row">
                                                <span className="owner-name">{m.fullName} - {m.phoneNumber}</span>
                                                <span className="owner-share">{m.sharePercent}%</span>
                                            </div>
                                            <div className="share-bar">
                                                <div className="share-fill" style={{ width: `${Math.min(Math.max(m.sharePercent || 0, 0), 100)}%` }} />
                                            </div>
                                            <div className="owner-status">
                                                <i>{m.status}</i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Không có dữ liệu đồng sở hữu.</p>
                            )}
                        </div>

                        <div className="terms-section">
                            <div className="section-title">
                                <div className="icon"><FaListUl /></div>
                                <h3>Điều khoản</h3>
                            </div>
                            <ul>
                                {terms.map((term, i) => (
                                    <li key={i}>{term}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="button-group">
                            <button
                                className="btnInput"
                                onClick={() => handleResponse(true)}
                            >
                                Chấp nhận
                            </button>
                            <button
                                className="btnReturn"
                                onClick={() => handleResponse(false)}
                            >
                                Từ chối
                            </button>
                        </div>
                    </div>
                ) : (
                    <p>Không tìm thấy hợp đồng.</p>
                )}
            </div>
        </div>
    );
}
