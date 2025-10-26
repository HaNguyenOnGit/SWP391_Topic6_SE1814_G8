import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../NavBar";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

export default function ProposalList() {
    const { id } = useParams(); // contractId
    const { userId } = useAuth(); // user hiện tại
    const [contract, setContract] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                // --- Lấy thông tin hợp đồng ---
                const contractRes = await axios.get(`/api/contract/contract-detail/${id}`);
                const c = contractRes.data;
                setContract({
                    id: c.contractId,
                    name: c.vehicleName,
                    plate: c.licensePlate,
                });

                // --- Gọi đúng API backend (vẫn trả về toàn bộ danh sách) ---
                const uid = userId ?? 0;
                const proposalRes = await axios.get(`/api/proposal/contract/${id}/user/${uid}`);

                console.log("✅ Proposal list response:", proposalRes.data);

                // --- Set danh sách ---
                setProposals(Array.isArray(proposalRes.data) ? proposalRes.data : []);
            } catch (err) {
                console.error("❌ Lỗi khi tải danh sách đề xuất:", err);
                setError("Không thể tải danh sách đề xuất. Kiểm tra console hoặc API.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, userId]);

    if (loading) return <p>Đang tải dữ liệu...</p>;

    if (error)
        return (
            <>
                <Navbar />
                <div className="container mt-4">
                    <p style={{ color: "red" }}>{error}</p>
                    <Link to={`/vehicle/${id}`}>⬅ Quay lại</Link>
                </div>
            </>
        );

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h2>Danh sách đề xuất cho {contract?.name ?? `Hợp đồng #${id}`}</h2>

                {proposals.length === 0 ? (
                    <p>Chưa có đề xuất nào.</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Mô tả</th>
                                <th>Số tiền</th>
                                <th>Người đề xuất</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.map((p) => (
                                <tr key={p.proposalId || p.ProposalId}>
                                    <td>{p.proposalId ?? p.ProposalId}</td>
                                    <td>{p.description ?? p.Description}</td>
                                    <td>
                                        {Number(p.expectedAmount ?? p.ExpectedAmount ?? 0).toLocaleString("vi-VN")} ₫
                                    </td>
                                    <td>{p.proposedBy ?? p.ProposedBy}</td>
                                    <td>{p.status ?? p.Status}</td>
                                    <td>
                                        {p.createdAt || p.CreatedAt
                                            ? new Date(p.createdAt ?? p.CreatedAt).toLocaleString("vi-VN")
                                            : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div style={{ marginTop: "1rem" }}>
                    <Link to={`/vehicle/${id}`} className="btn btn-secondary">
                        ⬅ Quay lại
                    </Link>
                </div>
            </div>
        </>
    );
}
