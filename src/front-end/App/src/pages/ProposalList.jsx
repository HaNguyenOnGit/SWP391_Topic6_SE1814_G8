import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../NavBar";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import VehicleInfo from "../VehicleInfo";
import "./ProposalList.css";

export default function ProposalList() {
    const { id } = useParams();
    const { userId } = useAuth();
    const [contract, setContract] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const contractRes = await axios.get(`/api/contract/contract-detail/${id}`);
                const c = contractRes.data;
                setContract({
                    id: c.contractId,
                    name: c.vehicleName,
                    plate: c.licensePlate,
                });

                const uid = userId ?? 0;

                // Lấy tất cả đề xuất
                const proposalRes = await axios.get(`/api/proposal/contract/${id}/user/${uid}`);
                const allProposals = Array.isArray(proposalRes.data) ? proposalRes.data : [];
                setProposals(allProposals.sort((a, b) => b.proposalId - a.proposalId));

                // Không cần lấy danh sách pending nữa

            } catch (err) {
                console.error("Lỗi khi tải danh sách đề xuất:", err);
                setError("Không thể tải danh sách đề xuất.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, userId]);

    const handleVote = async (proposalId, decision) => {
        try {
            const res = await axios.post(
                `/api/proposal/${proposalId}/user/${userId}/vote`,
                { Decision: decision },
                { headers: { "Content-Type": "application/json" } }
            );
            if (res.status === 200) {
                // Gọi lại API lấy danh sách đề xuất để cập nhật trạng thái mới nhất
                const proposalRes = await axios.get(`/api/proposal/contract/${id}/user/${userId}`);
                const allProposals = Array.isArray(proposalRes.data) ? proposalRes.data : [];
                setProposals(allProposals.sort((a, b) => b.proposalId - a.proposalId));
            } else {
                alert("Gửi vote thất bại!");
            }
        } catch {
            alert("Gửi vote thất bại!");
        }
    };


    useEffect(() => {
        if (!selected) {
            setDetail(null);
            return;
        }
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`/api/proposal/${selected.proposalId}`);
                setDetail(res.data);
            } catch (err) {
                setDetail({ error: "Không thể tải chi tiết đề xuất." });
            }
        };
        fetchDetail();
    }, [selected]);

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
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <div className="main-content-layout">
                    <VehicleInfo />
                    <div className="All">
                        <h2>Đề xuất chi tiêu</h2>

                        {!selected ? (
                            <div className="proposal-list">
                                {proposals.length === 0 ? (
                                    <p>Chưa có đề xuất nào.</p>
                                ) : (
                                    proposals.map((p) => {
                                        // Tìm vote của user hiện tại (ép kiểu để so sánh đúng)
                                        const myVote = Array.isArray(p.votes)
                                            ? p.votes.find(v => String(v.userId) === String(userId))
                                            : null;
                                        const showAction = myVote && myVote.vote === "Pending" && p.status !== "Rejected";
                                        return (
                                            <div
                                                key={p.proposalId}
                                                className="proposal-item"
                                                onClick={() => setSelected(p)}
                                            >
                                                <div className="proposal-info">
                                                    <strong>{p.description ?? "Không có mô tả"}</strong>
                                                    <div className="proposal-meta">{p.allocationRule ?? p.AllocationRule}</div>
                                                    <div className="proposal-meta">{p.proposedBy ?? p.ProposedBy}</div>
                                                </div>
                                                <div>
                                                    {showAction ? (
                                                        <div className="action-buttons">
                                                            <span>Chờ bạn xác nhận</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleVote(p.proposalId, "Rejected");
                                                                }}
                                                                className="btn btn-danger btn-sm"
                                                            >
                                                                ❌
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleVote(p.proposalId, "Accepted");
                                                                }}
                                                                className="btn btn-success btn-sm"
                                                            >
                                                                ✔️
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            className={`status-text ${p.status === "Approved"
                                                                ? "status-approved"
                                                                : p.status === "Rejected"
                                                                    ? "status-rejected"
                                                                    : "status-pending"
                                                                }`}
                                                        >
                                                            {p.status === "Approved" ? "Hoàn thành" : p.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            <div className="detail-container">
                                <h3>Chi tiết đề xuất</h3>
                                {detail?.error ? (
                                    <p style={{ color: "red" }}>{detail.error}</p>
                                ) : detail ? (
                                    <div>
                                        <div>
                                            <strong>Tên phương tiện:</strong> {contract?.name ?? "-"} <br />
                                            <strong>Biển số:</strong> {contract?.plate ?? "-"}
                                        </div>
                                        <div>
                                            <strong>Tổng chi phí đề xuất:</strong>{" "}
                                            {detail.proposal?.expectedAmount?.toLocaleString("vi-VN") ?? "-"} ₫
                                        </div>
                                        <div>
                                            <strong>Cách chia:</strong> {detail.proposal?.allocationRule ?? "-"}
                                        </div>
                                        <div>
                                            <strong>Mô tả:</strong> {detail.proposal?.description ?? "-"}
                                        </div>
                                        <div>
                                            <strong>Người đề xuất:</strong> {detail.proposal?.proposedBy ?? "-"}
                                        </div>
                                        <div>
                                            <strong>Trạng thái:</strong> {detail.proposal?.status ?? "-"}
                                        </div>
                                        <div>
                                            <strong>Danh sách thành viên & chi tiết chi phí:</strong>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Tên</th>
                                                        <th>Tỉ lệ (%)</th>
                                                        <th>Số tiền (₫)</th>
                                                        <th>Trạng thái</th>
                                                        <th>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detail.allocations?.map((a, idx) => {
                                                        const isCurrentUser = String(a.userId) === String(userId);
                                                        return (
                                                            <tr key={idx}>
                                                                <td>{a.fullName}</td>
                                                                <td>{a.payPercent}</td>
                                                                <td>{a.amount?.toLocaleString("vi-VN")}</td>
                                                                <td>{a.vote}</td>
                                                                <td>
                                                                    {isCurrentUser && a.vote === "Pending" ? (
                                                                        <>
                                                                            {detail.proposal?.status !== "Rejected" && (
                                                                                <>
                                                                                    <button
                                                                                        className="btn btn-danger btn-sm"
                                                                                        onClick={() =>
                                                                                            handleVote(detail.proposal.proposalId, "Rejected")
                                                                                        }
                                                                                    >
                                                                                        ❌ Reject
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-success btn-sm"
                                                                                        onClick={() =>
                                                                                            handleVote(detail.proposal.proposalId, "Accepted")
                                                                                        }
                                                                                    >
                                                                                        ✔️ Accept
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </>
                                                                    ) : null}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style={{ marginTop: "16px" }}>
                                            <strong>Số tiền của bạn:</strong>{" "}
                                            {(() => {
                                                const alloc = detail.allocations?.find(a => a.userId === userId);
                                                return alloc
                                                    ? alloc.amount?.toLocaleString("vi-VN") + " ₫"
                                                    : "-";
                                            })()}
                                        </div>
                                        <button
                                            className="back-btn"
                                            onClick={() => setSelected(null)}
                                        >
                                            ⬅ Quay lại danh sách
                                        </button>
                                    </div>
                                ) : (
                                    <p>Đang tải chi tiết...</p>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

