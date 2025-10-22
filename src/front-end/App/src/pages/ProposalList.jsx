import { useState } from "react";
import Navbar from "../NavBar";

export default function ProposalList() {
    const currentUser = "userB"; // Giả lập user đang đăng nhập

    const [proposals, setProposals] = useState([
        {
            id: 1,
            expenseName: "Mua vỏ xe mới",
            amount: 2000000,
            method: "Chia đều",
            createdBy: "userA",
            contributions: [
                { username: "userA", percent: 50, decision: "accepted" },
                { username: "userB", percent: 30, decision: null },
                { username: "userC", percent: 20, decision: null },
            ],
        },
        {
            id: 2,
            expenseName: "Thay nhớt",
            amount: 500000,
            method: "Tỷ lệ sở hữu",
            createdBy: "userC",
            contributions: [
                { username: "userA", percent: 40, decision: "accepted" },
                { username: "userB", percent: 60, decision: "rejected" },
            ],
        },
    ]);

    const handleDecision = (proposalId, username, decision) => {
        const updated = proposals.map((p) => {
            if (p.id === proposalId) {
                return {
                    ...p,
                    contributions: p.contributions.map((c) =>
                        c.username === username ? { ...c, decision } : c
                    ),
                };
            }
            return p;
        });
        setProposals(updated);
    };

    return (
        <div>
            <Navbar username={currentUser} />
            <div className="p-6">
                <h2>Danh sách đề xuất chi tiêu</h2>

                {proposals.map((p) => (
                    <div key={p.id} className="border p-4 rounded mb-4 bg-gray-50">
                        <h3>{p.expenseName}</h3>
                        <p>
                            Tổng: <strong>{p.amount.toLocaleString("vi-VN")}đ</strong> (
                            {p.method})
                        </p>
                        <p>Người đề xuất: {p.createdBy}</p>

                        <h4>Người đồng sở hữu:</h4>
                        {p.contributions.map((c, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center mb-2"
                            >
                                <span>
                                    {c.username} ({c.percent}%)
                                </span>

                                {c.decision ? (
                                    <span>
                                        {c.decision === "accepted" ? "✅ Đồng ý" : "❌ Từ chối"}
                                    </span>
                                ) : c.username === currentUser ? (
                                    <span>
                                        <button
                                            onClick={() =>
                                                handleDecision(p.id, currentUser, "accepted")
                                            }
                                            className="bg-green-500 text-white px-2 py-1 rounded mr-1"
                                        >
                                            ✅
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDecision(p.id, currentUser, "rejected")
                                            }
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            ❌
                                        </button>
                                    </span>
                                ) : (
                                    <span>Chờ phê duyệt</span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
