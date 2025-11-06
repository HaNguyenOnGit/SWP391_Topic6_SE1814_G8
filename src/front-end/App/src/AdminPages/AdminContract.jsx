import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import AdminNavbar from "./ANavbar";
import "./AdminContract.css";

export default function AdminContracts() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [contractDetail, setContractDetail] = useState(null);
    // Fix: Add missing search state
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchContracts = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get("/api/contract/contractListSummary");
                const data = res.data;
                setContracts(
                    Array.isArray(data)
                        ? data.map((c) => ({
                            id: c.contractId,
                            vehicle: {
                                name: c.model,
                                license: c.licensePlate,
                                model: "", // If you want to show model year, add it to API
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

    const handleExpand = async (id) => {
        if (expandedId === id) {
            setExpandedId(null);
            setContractDetail(null);
            return;
        }
        setExpandedId(id);
        setDetailLoading(true);
        setContractDetail(null);
        try {
            const res = await axios.get(`/api/contract/contract-detail/${id}`);
            setContractDetail(res.data);
        } catch (e) {
            setContractDetail({ error: e.message || "Không tải được chi tiết hợp đồng" });
        } finally {
            setDetailLoading(false);
        }
    };

    // 🧠 Lọc hợp đồng theo từ khóa
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

    // Gọi API dừng hợp đồng
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

    return (
        <div className="contracts-container">
            <AdminNavbar adminName="Admin" />

            <h1>Quản lý hợp đồng</h1>

            {/* 🔍 Ô tìm kiếm */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Tìm theo tên xe, biển số hoặc người sở hữu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* 📄 Danh sách hợp đồng */}
            {loading ? (
                <p>Đang tải hợp đồng...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : filteredContracts.length > 0 ? (
                filteredContracts.map((c) => (
                    <div key={c.id} className={`contract-card${expandedId === c.id ? " expanded" : ""}`}>
                        <div className="contract-info" onClick={() => handleExpand(c.id)} style={{ cursor: "pointer" }}>
                            <h2>Hợp đồng #{c.id}</h2>
                            <p>
                                <strong>Xe:</strong> {c.vehicle.name} ({c.vehicle.license})
                            </p>
                            {/* Nếu có model year, hiển thị ở đây */}
                            {/* <p><strong>Năm SX:</strong> {c.vehicle.model}</p> */}
                            <p>
                                <strong>Ngày tạo:</strong> {c.createDate}
                            </p>
                        </div>

                        <div className="coowners">
                            <p>
                                <strong>Người đồng sở hữu:</strong>
                            </p>
                            {c.owners.map((o, i) => (
                                <p key={i}>
                                    - {o.fullName} ({o.phone}) ({o.ratio}%)
                                </p>
                            ))}
                        </div>

                        <p>
                            <strong>Trạng thái:</strong>{" "}
                            <span
                                className={
                                    c.status === "Đã kết thúc" ? "status-ended" : "status-active"
                                }
                            >
                                {c.status}
                            </span>
                        </p>

                        <div className="actions">
                            <button
                                onClick={() => handlePauseContract(c.id)}
                                className="btn-stop"
                            >
                                Dừng hợp đồng
                            </button>
                            <button className="btn-export">Trích xuất chi tiêu</button>
                            <button
                                onClick={() => handleDeleteContract(c.id)}
                                className="btn-delete"
                            >
                                Xóa
                            </button>
                        </div>

                        {/* Chi tiết hợp đồng mở rộng */}
                        {expandedId === c.id && (
                            <div className="contract-detail">
                                {detailLoading ? (
                                    <p>Đang tải chi tiết hợp đồng...</p>
                                ) : contractDetail && contractDetail.error ? (
                                    <p className="error">{contractDetail.error}</p>
                                ) : contractDetail ? (
                                    <>
                                        <h3>Chi tiết hợp đồng</h3>
                                        <p><strong>Tên xe:</strong> {contractDetail.vehicleName}</p>
                                        <p><strong>Model:</strong> {contractDetail.model}</p>
                                        <p><strong>Biển số:</strong> {contractDetail.licensePlate}</p>
                                        <p><strong>Ngày bắt đầu:</strong> {contractDetail.startDate}</p>
                                        <p><strong>Trạng thái:</strong> {contractDetail.status}</p>
                                        <h4>Thành viên</h4>
                                        <ul>
                                            {contractDetail.members.map((m) => (
                                                <li key={m.userId}>
                                                    {m.fullName} ({m.phoneNumber}) - {m.sharePercent}%
                                                    <br />
                                                    Trạng thái: {m.status} | Tham gia: {m.joinedAt}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="no-result">Không tìm thấy hợp đồng phù hợp.</p>
            )}
        </div>
    );
}
