import React, { useEffect, useState } from "react";
import Navbar from "../NavBar";
import axios from "axios";
// import "./contractVerification.css";
import { useParams } from "react-router-dom";

export default function ContractVerification() {
    const { contractId } = useParams();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [responseMessage, setResponseMessage] = useState("");

    useEffect(() => {
        // Mock contract data for styling
        const mockContract = {
            VehicleName: "Toyota Camry",
            LicensePlate: "30A-12345",
            Model: "2022",
            StartDate: "2025-10-01",
            Status: "Pending",
            Members: [
                { FullName: "Nguyen Van A", PhoneNumber: "0123456789", SharePercent: 50 },
                { FullName: "Tran Thi B", PhoneNumber: "0987654321", SharePercent: 50 },
            ],
            Terms: [
                "Các bên phải tuân thủ luật giao thông đường bộ.",
                "Không được tự ý bán hoặc chuyển nhượng khi chưa có sự đồng ý của đồng sở hữu.",
                "Mọi chi phí bảo dưỡng, sửa chữa sẽ được chia theo tỷ lệ sở hữu."
            ]
        };

        setContract(mockContract);
        setLoading(false);
    }, []);

    const handleResponse = async (accept) => {
        try {
            // Mock API call to respond to contract
            const res = await axios.post(`/api/mock/contract/${contractId}/response`, {
                accept,
            });
            setResponseMessage(
                accept
                    ? "Bạn đã chấp nhận hợp đồng."
                    : "Bạn đã từ chối hợp đồng."
            );
        } catch (err) {
            console.error("Error responding to contract:", err);
            setResponseMessage("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    if (loading) {
        return <p>Đang tải...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <h1>Xác nhận hợp đồng</h1>
                {contract ? (
                    <div>
                        <h2>Thông tin hợp đồng</h2>
                        <p><strong>Tên phương tiện:</strong> {contract.VehicleName}</p>
                        <p><strong>Biển kiểm soát:</strong> {contract.LicensePlate}</p>
                        <p><strong>Model:</strong> {contract.Model}</p>
                        <p><strong>Ngày bắt đầu:</strong> {contract.StartDate}</p>
                        <p><strong>Trạng thái:</strong> {contract.Status}</p>

                        <h3>Danh sách đồng sở hữu</h3>
                        <ul>
                            {contract.Members.map((member, index) => (
                                <li key={index}>
                                    {member.FullName} - {member.PhoneNumber} ({member.SharePercent}%)
                                </li>
                            ))}
                        </ul>

                        <h3>Điều khoản</h3>
                        <ul>
                            {contract.Terms.map((term, index) => (
                                <li key={index}>{term}</li>
                            ))}
                        </ul>

                        <div style={{ marginTop: "20px" }}>
                            <button
                                className="btnInput"
                                onClick={() => handleResponse(true)}
                                disabled={responseMessage}
                            >
                                Chấp nhận
                            </button>
                            <button
                                className="btnReturn"
                                onClick={() => handleResponse(false)}
                                disabled={responseMessage}
                                style={{ marginLeft: "10px" }}
                            >
                                Từ chối
                            </button>
                        </div>

                        {responseMessage && (
                            <p style={{ marginTop: "10px", color: "green" }}>{responseMessage}</p>
                        )}
                    </div>
                ) : (
                    <p>Không tìm thấy hợp đồng.</p>
                )}
            </div>
        </div>
    );
}