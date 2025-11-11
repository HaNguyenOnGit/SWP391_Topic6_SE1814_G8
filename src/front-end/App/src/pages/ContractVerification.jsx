import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
            <div className="main-content">
                <h1>Xác nhận hợp đồng</h1>

                {contract ? (
                    <div>
                        <h2>Thông tin hợp đồng</h2>
                        <p><strong>Tên phương tiện:</strong> {contract.vehicleName}</p>
                        <p><strong>Biển kiểm soát:</strong> {contract.licensePlate}</p>
                        <p><strong>Model:</strong> {contract.model}</p>
                        <p><strong>Ngày bắt đầu:</strong> {contract.startDate}</p>
                        <p><strong>Trạng thái:</strong> {contract.status}</p>

                        <h3>Danh sách đồng sở hữu</h3>
                        <ul>
                            {contract.members.map((m, index) => (
                                <li key={index}>
                                    {m.fullName} - {m.phoneNumber} ({m.sharePercent}%) —
                                    <i> {m.status}</i>
                                </li>
                            ))}
                        </ul>

                        <h3>Điều khoản</h3>
                        <ul>
                            {terms.map((term, i) => (
                                <li key={i}>{term}</li>
                            ))}
                        </ul>

                        <div style={{ marginTop: "20px" }}>
                            <button
                                className="btnInput"
                                onClick={() => handleResponse(true)}
                            >
                                Chấp nhận
                            </button>
                            <button
                                className="btnReturn"
                                onClick={() => handleResponse(false)}
                                style={{ marginLeft: "10px" }}
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
