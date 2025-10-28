import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../NavBar";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import VehicleInfo from "../VehicleInfo";

export default function ProposalList() {
    const { id } = useParams();
    const { userId } = useAuth();
    const [contract, setContract] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [pendingIds, setPendingIds] = useState([]);
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

                // ✅ Lấy tất cả đề xuất
                const proposalRes = await axios.get(`/api/proposal/contract/${id}/user/${uid}`);
                const allProposals = Array.isArray(proposalRes.data) ? proposalRes.data : [];
                setProposals(allProposals.sort((a, b) => b.proposalId - a.proposalId));

                // ✅ Lấy danh sách pending (bắt riêng lỗi)
                try {
                    const pendingRes = await axios.get(`/api/proposal/contract/${id}/user/${uid}/pending`);
                    const pendingData = Array.isArray(pendingRes.data) ? pendingRes.data : [];
                    setPendingIds(pendingData.map(p => p.proposalId));
                } catch (err) {
                    console.warn("Không thể tải danh sách pending:", err);
                    setPendingIds([]); // tránh crash
                }

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
            await axios.post(
                `/api/proposal/${proposalId}/user/${userId}/vote`,
                { Decision: decision },
                { headers: { "Content-Type": "application/json" } }
            );

            setPendingIds((prev) => prev.filter((pid) => pid !== proposalId));

            setProposals((prev) =>
                prev.map((p) =>
                    p.proposalId === proposalId
                        ? { ...p, status: decision === "Accepted" ? "Approved" : "Rejected" }
                        : p
                )
            );
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
                    <div>
                        <h2>Đề xuất chi tiêu</h2>

                        {!selected ? (
                            <div
                                style={{
                                    maxHeight: "400px",
                                    overflowY: "auto",
                                    paddingRight: "8px",
                                }}
                            >
                                {proposals.length === 0 ? (
                                    <p>Chưa có đề xuất nào.</p>
                                ) : (
                                    proposals.map((p) => (
                                        <div key={p.proposalId} onClick={() => setSelected(p)}>
                                            <div>
                                                <div>
                                                    <strong style={{ fontSize: "1.05rem" }}>
                                                        {p.description ?? "Không có mô tả"}
                                                    </strong>
                                                    <div>{p.allocationRule ?? p.AllocationRule}</div>
                                                    <div>{p.proposedBy ?? p.ProposedBy}</div>
                                                </div>

                                                <div>
                                                    {pendingIds.includes(p.proposalId) ? (
                                                        <div>
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
                                                        <span>
                                                            {p.status === "Approved"
                                                                ? "Hoàn thành"
                                                                : p.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div>
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
                                            <strong>Tổng chi phí đề xuất:</strong> {detail.proposal?.expectedAmount?.toLocaleString("vi-VN") ?? "-"} ₫
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
                                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                                                        const isCurrentUser = a.userId === userId;
                                                        return (
                                                            <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                                                                <td>{a.fullName}</td>
                                                                <td>{a.payPercent}</td>
                                                                <td>{a.amount?.toLocaleString("vi-VN")}</td>
                                                                <td>{a.vote}</td>
                                                                <td>
                                                                    {isCurrentUser && a.vote === "Pending" ? (
                                                                        <>
                                                                            <button
                                                                                className="btn btn-danger btn-sm"
                                                                                onClick={() => handleVote(detail.proposal.proposalId, "Rejected")}
                                                                            >
                                                                                ❌ Reject
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-success btn-sm"
                                                                                onClick={() => handleVote(detail.proposal.proposalId, "Accepted")}
                                                                            >
                                                                                ✔️ Accept
                                                                            </button>
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
                                            <strong>Số tiền của bạn:</strong> {
                                                (() => {
                                                    const alloc = detail.allocations?.find(a => a.userId === userId);
                                                    return alloc ? alloc.amount?.toLocaleString("vi-VN") + " ₫" : "-";
                                                })()
                                            }
                                        </div>
                                        <button className="btn btn-secondary" onClick={() => setSelected(null)} style={{ marginTop: "16px" }}>
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

