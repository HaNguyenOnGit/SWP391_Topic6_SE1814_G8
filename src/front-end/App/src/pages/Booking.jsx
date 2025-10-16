import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";

export default function Booking() {
    const { id } = useParams();

    // --- Danh sách xe (dữ liệu demo) ---
    const vehicles = [
        { id: 1, name: "Xe Honda City", plate: "51H-12345", status: "Đang sử dụng" },
        { id: 2, name: "Xe Toyota Vios", plate: "60A-67890", status: "Đang trống" },
        { id: 3, name: "Xe Ford Ranger", plate: "43C-24680", status: "Chưa kích hoạt hợp đồng" },
    ];

    // --- Lấy xe theo id từ URL ---
    const vehicle = vehicles.find((v) => v.id === parseInt(id));

    const today = new Date();
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    // --- Data ảo của các user khác ---
    const fakeBookings = {
        "2025-10-07": [
            { id: 1, user: "user 1", from: "06:00", to: "10:00" },
            { id: 2, user: "user 2", from: "12:00", to: "14:00" },
        ],
        "2025-10-08": [
            { id: 3, user: "user 3", from: "09:00", to: "11:00" },
        ],
        "2025-10-09": [
            { id: 4, user: "user 4", from: "13:00", to: "16:00" },
        ],
    };

    // --- Booking người dùng thật ---
    const [bookings, setBookings] = useState({});
    const [showBooking, setShowBooking] = useState(false);
    const [fromTime, setFromTime] = useState("");
    const [toTime, setToTime] = useState("");

    // --- Helper ---
    const getDateKey = () =>
        `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

    const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

    const getStartOffset = () => {
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1;
    };

    // --- Kiểm tra trùng lịch ---
    const isOverlapping = (existing, from, to) => {
        // Nếu thời gian mới có phần giao nhau với lịch cũ thì báo lỗi
        return !(to <= existing.from || from >= existing.to);
    };

    // --- Thêm lịch mới ---
    const handleAddBooking = () => {
        if (!fromTime || !toTime) {
            alert("⚠️ Vui lòng chọn đầy đủ giờ bắt đầu và kết thúc!");
            return;
        }

        if (fromTime >= toTime) {
            alert("⚠️ Giờ bắt đầu phải nhỏ hơn giờ kết thúc!");
            return;
        }

        const key = getDateKey();
        const allBookings = [
            ...(fakeBookings[key] || []),
            ...(bookings[key] || []),
        ];

        // Kiểm tra trùng lịch
        const hasConflict = allBookings.some((b) =>
            isOverlapping(b, fromTime, toTime)
        );

        if (hasConflict) {
            alert("❌ Khung giờ này đã có người đặt! Vui lòng chọn giờ khác.");
            return;
        }

        const newBooking = {
            id: Date.now(),
            user: "Bạn",
            from: fromTime,
            to: toTime,
        };

        setBookings((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), newBooking],
        }));

        setFromTime("");
        setToTime("");
        setShowBooking(false);
        alert("✅ Đặt lịch thành công!");
    };

    // --- Xóa lịch của chính mình ---
    const handleDeleteBooking = (id) => {
        if (window.confirm("🗑️ Bạn có chắc muốn xóa lịch này không?")) {
            const key = getDateKey();
            setBookings((prev) => ({
                ...prev,
                [key]: prev[key].filter((b) => b.id !== id),
            }));
            setTimeout(() => alert("✅ Đã xóa lịch thành công!"), 200);
        }
    };

    // --- Gộp data ảo + data thật ---
    const key = getDateKey();
    const currentBookings = [
        ...(fakeBookings[key] || []),
        ...(bookings[key] || []),
    ];

    // --- Danh sách giờ ---
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);


    return (
        <div className="main-container">
            <Navbar username="Username" />

            <div className="main-content">
                <h2 className="text-xl font-semibold mb-4">
                    {vehicle?.name}
                </h2>
                {/* --- Chọn tháng & năm --- */}
                <div style={{ marginBottom: "10px" }}>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                Tháng {i + 1}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {[2024, 2025, 2026].map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* --- Lịch hiển thị --- */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        maxWidth: "280px",
                        textAlign: "center",
                        fontWeight: "bold",
                        marginBottom: "4px",
                    }}
                >
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => (
                        <div key={i}>{d}</div>
                    ))}
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "6px",
                        maxWidth: "280px",
                    }}
                >
                    {Array.from({ length: getStartOffset() }).map((_, i) => (
                        <div key={`empty-${i}`}></div>
                    ))}

                    {Array.from({ length: daysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                        <div
                            key={i + 1}
                            onClick={() => setSelectedDay(i + 1)}
                            style={{
                                padding: "8px",
                                textAlign: "center",
                                borderRadius: "50%",
                                cursor: "pointer",
                                background:
                                    selectedDay === i + 1
                                        ? "linear-gradient(45deg, #d47dff, #79c7ff)"
                                        : "transparent",
                                color: selectedDay === i + 1 ? "white" : "black",
                                fontWeight: selectedDay === i + 1 ? "bold" : "normal",
                            }}
                        >
                            {String(i + 1).padStart(2, "0")}
                        </div>
                    ))}
                </div>

                {/* --- Khung đặt lịch --- */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fff",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
                        width: "260px",
                        marginTop: "20px",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", fontSize: "13px" }}>
                        <strong>
                            Đặt lịch cho ngày {selectedDay}/{selectedMonth}
                        </strong>
                        <div style={{ color: "#888", marginTop: "3px" }}>
                            Từ&nbsp;–&nbsp;Đến
                        </div>
                    </div>

                    <button
                        onClick={() => setShowBooking(!showBooking)}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            border: "none",
                            background: "linear-gradient(45deg, #d47dff, #79c7ff)",
                            color: "white",
                            fontSize: "22px",
                            cursor: "pointer",
                        }}
                        title="Thêm lịch"
                    >
                        {showBooking ? "−" : "+"}
                    </button>
                </div>

                {/* --- Form đặt giờ --- */}
                {showBooking && (
                    <div
                        style={{
                            marginTop: "10px",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            width: "260px",
                            background: "#fafafa",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label>
                                Từ:
                                <select
                                    value={fromTime}
                                    onChange={(e) => setFromTime(e.target.value)}
                                    style={{ width: "100%", padding: "4px" }}
                                >
                                    <option value="">-- Chọn giờ bắt đầu --</option>
                                    {hours.map((h) => (
                                        <option key={h} value={h}>
                                            {h}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Đến:
                                <select
                                    value={toTime}
                                    onChange={(e) => setToTime(e.target.value)}
                                    style={{ width: "100%", padding: "4px" }}
                                >
                                    <option value="">-- Chọn giờ kết thúc --</option>
                                    {hours.map((h) => (
                                        <option key={h} value={h}>
                                            {h}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button
                                onClick={handleAddBooking}
                                style={{
                                    marginTop: "5px",
                                    background: "linear-gradient(45deg, #79c7ff, #d47dff)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Lưu lịch
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Danh sách lịch --- */}
                {currentBookings.length > 0 && (
                    <div style={{ marginTop: "15px", width: "260px" }}>
                        <h5 style={{ fontSize: "14px", marginBottom: "6px" }}>
                            Lịch đã đặt ({selectedDay}/{selectedMonth}):
                        </h5>
                        {currentBookings.map((b) => (
                            <div
                                key={b.id}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #eee",
                                    borderRadius: "8px",
                                    padding: "6px 10px",
                                    marginBottom: "5px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "13px",
                                }}
                            >
                                <span>
                                    <strong>{b.user}</strong> &nbsp;
                                    {b.from} → {b.to}
                                </span>

                                {b.user === "Bạn" && (
                                    <button
                                        onClick={() => handleDeleteBooking(b.id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "red",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
