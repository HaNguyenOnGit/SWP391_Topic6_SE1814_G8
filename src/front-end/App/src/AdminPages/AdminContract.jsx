import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { FileText, Search } from "lucide-react";
import AdminNavbar from "./ANavbar";
import "./AdminContract.css";

export default function AdminContracts() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);
    const [search, setSearch] = useState("");
    const [expenses, setExpenses] = useState([]);
    const [showExpenses, setShowExpenses] = useState(false);

    useEffect(() => {
        const fetchContracts = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get("/api/contract/contractListSummary");
                const data = res.data;
                data.reverse(); // Đảo ngược để hiển thị contract mới trước
                setContracts(
                    Array.isArray(data)
                        ? data.map((c) => ({
                            id: c.contractId,
                            vehicle: {
                                name: c.model,
                                license: c.licensePlate,
                                model: "",
                            },
                            owners: c.memberSummaries.map((m) => ({
                                fullName: m.fullName,
                                phone: m.phoneNumber,
                                ratio: m.sharePercent,
                            })),
                            createDate: c.startDate,
                            status: c.status,
                        }))
                        : []
                );
            } catch (e) {
                setError(e.message || "Đã có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    const filteredContracts = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return contracts;

        return contracts.filter((c) => {
            const vehicleMatch =
                c.vehicle.name.toLowerCase().includes(keyword) ||
                c.vehicle.license.toLowerCase().includes(keyword);

            const ownerMatch = c.owners.some((o) => {
                return (
                    o.phone.includes(keyword) ||
                    (o.fullName && o.fullName.toLowerCase().includes(keyword))
                );
            });

            return vehicleMatch || ownerMatch;
        });
    }, [contracts, search]);

    const handlePauseContract = async (id) => {
        if (!window.confirm("Bạn có chắc muốn dừng hợp đồng này?")) return;
        try {
            await axios.patch(`/api/contract/pauseContract/${id}`);
            setContracts((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status: "Đã kết thúc" } : c))
            );
            alert("Đã dừng hợp đồng thành công.");
        } catch (e) {
            alert(e.message || "Dừng hợp đồng thất bại");
        }
    };

    const handleDeleteContract = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa hợp đồng này?")) return;
        try {
            await axios.delete(`/api/contract/deleteContract/${id}`);
            setContracts((prev) =>
                prev.filter((c) => c.id !== id)
            );
            alert("Đã xóa hợp đồng thành công.");
        } catch (e) {
            alert(e.message || "Xóa hợp đồng thất bại");
        }
    };

    const handleExtractExpenses = async (contractId) => {
        try {
            const res = await axios.get(`/api/payment/contract/${contractId}/paid-expenses-details`);
            setExpenses(res.data);
            setShowExpenses(true);
        } catch (e) {
            alert(e.message || "Không thể tải chi tiết chi phí");
        }
    };

    const translateAllocationRule = (rule) => {
        switch (rule.toLowerCase()) {
            case "byshare":
                return "Theo tỉ lệ sở hữu";
            case "selfpaid":
                return "Tự chi trả";
            case "byusage":
                return "Theo lượng sử dụng";
            default:
                return rule;
        }
    };

    const translateStatus = (status) => {
        switch (status.toLowerCase()) {
            case "paid":
                return "đã thanh toán";
            case "pending":
                return "chưa thanh toán";
            default:
                return status;
        }
    };

    return (
        <div className="admin-container">
            <AdminNavbar adminName="Admin" />

            <main className="admin-content">
                <header className="page-header">
                    <h1 className="title">
                        <FileText className="icon" /> Quản lý hợp đồng
                    </h1>
                </header>

                <section className="controls">
                    <div className="search-box">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên xe, biển số hoặc người sở hữu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </section>

                <section className="main-grid">
                    <div className="contract-list">
                        {loading ? (
                            <p>Đang tải hợp đồng...</p>
                        ) : error ? (
                            <p className="error">{error}</p>
                        ) : filteredContracts.length > 0 ? (
                            filteredContracts.map((c) => (
                                <div
                                    key={c.id}
                                    className={`contract-item ${selectedContract?.id === c.id ? "selected" : ""}`}
                                    onClick={() => setSelectedContract(c)}
                                >
                                    <h3>Hợp đồng #{c.id}</h3>
                                    <p>Xe: {c.vehicle.name} ({c.vehicle.license})</p>
                                    <p>Ngày tạo: {c.createDate}</p>
                                    <p>
                                        Trạng thái:{" "}
                                        <span
                                            className={
                                                c.status === "Đã kết thúc" ? "status-ended" : "status-active"
                                            }
                                        >
                                            {c.status}
                                        </span>
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="no-result">Không tìm thấy hợp đồng phù hợp.</p>
                        )}
                    </div>

                    <div className="contract-detail">
                        {selectedContract ? (
                            <>
                                <h2 className="detail-title">
                                    <FileText className="icon" /> Chi tiết hợp đồng
                                </h2>

                                <div className="info-grid">
                                    <p><strong>ID:</strong> {selectedContract.id}</p>
                                    <p><strong>Xe:</strong> {selectedContract.vehicle.name} ({selectedContract.vehicle.license})</p>
                                    <p><strong>Ngày tạo:</strong> {selectedContract.createDate}</p>
                                    <p>
                                        <strong>Trạng thái:</strong>{" "}
                                        <span
                                            className={
                                                selectedContract.status === "Đã kết thúc" ? "status-ended" : "status-active"
                                            }
                                        >
                                            {selectedContract.status}
                                        </span>
                                    </p>
                                </div>

                                <h4>Thành viên</h4>
                                <ul>
                                    {selectedContract.owners.map((o, i) => (
                                        <li key={i}>
                                            {o.fullName} ({o.phone}) - {o.ratio}%
                                        </li>
                                    ))}
                                </ul>

                                <div className="actions">
                                    <button onClick={() => handlePauseContract(selectedContract.id)}>
                                        Dừng hợp đồng
                                    </button>
                                    <button onClick={() => handleExtractExpenses(selectedContract.id)}>
                                        Trích xuất chi tiêu
                                    </button>
                                    <button onClick={() => handleDeleteContract(selectedContract.id)}>
                                        Xóa
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="placeholder">
                                Chọn hợp đồng để xem chi tiết
                            </p>
                        )}
                    </div>
                </section>
            </main>

            {showExpenses && (
                <div className="modal-overlay" onClick={() => setShowExpenses(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Trích xuất chi tiêu</h3>
                        <button className="close-btn" onClick={() => setShowExpenses(false)}>×</button>
                        {expenses.length > 0 ? (
                            <div className="expenses-list">
                                {expenses.map((expense) => (
                                    <div key={expense.expenseId} className="expense-item">
                                        <h4>{expense.expenseName}</h4>
                                        <p><strong>Tổng chi phí:</strong> {expense.totalAmount.toLocaleString()} VND</p>
                                        <p><strong>Cách thức chia:</strong> {translateAllocationRule(expense.allocationRule)}</p>
                                        <h5>Chi tiết thanh toán:</h5>
                                        <ul>
                                            {expense.users.map((user) => (
                                                <li key={user.userId}>
                                                    <strong>{user.userName}:</strong> {user.allocatedAmount.toLocaleString()} VND - {user.payment ? `Đã thanh toán: ${user.payment.paidAmount.toLocaleString()} VND (${translateStatus(user.payment.status)}) - ${new Date(user.payment.paymentDate).toLocaleDateString("vi-VN")}` : 'Chưa thanh toán'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Không có chi phí đã thanh toán nào.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
