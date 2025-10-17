import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../NavBar";
import "./Booking.css";

export default function Booking() {
    const { id } = useParams();

    const vehicles = [
        { id: 1, name: "Xe Honda City", plate: "51H-12345", status: "Đang sử dụng" },
        { id: 2, name: "Xe Toyota Vios", plate: "60A-67890", status: "Đang trống" },
        { id: 3, name: "Xe Ford Ranger", plate: "43C-24680", status: "Chưa kích hoạt hợp đồng" },
    ];

    const vehicle = vehicles.find((v) => v.id === parseInt(id));
    const today = new Date();

    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [showBooking, setShowBooking] = useState(false);
    const [fromTime, setFromTime] = useState("");
    const [toTime, setToTime] = useState("");
    const [bookings, setBookings] = useState({});

    const fakeBookings = {
        "2025-10-01": [
            { id: 1, user: "user 1", from: "06h", to: "10h" },
            { id: 2, user: "user 2", from: "12h", to: "14h" },
            { id: 3, user: "user 3", from: "17h", to: "20h" },
        ],
    };

    const getDateKey = () =>
        `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

    const daysInMonth = (month, year) => new Date(year, month, 0).getDate();
    const getStartOffset = () => {
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1;
    };

    const handleAddBooking = () => {
        if (!fromTime || !toTime) return alert("Vui lòng chọn giờ bắt đầu và kết thúc!");
        if (fromTime >= toTime) return alert("Giờ bắt đầu phải nhỏ hơn giờ kết thúc!");

        const key = getDateKey();
        const newBooking = { id: Date.now(), user: "Bạn", from: fromTime, to: toTime };

        setBookings((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), newBooking],
        }));

        setShowBooking(false);
        setFromTime("");
        setToTime("");
    };

    const handleDeleteBooking = (id) => {
        const key = getDateKey();
        setBookings((prev) => ({
            ...prev,
            [key]: prev[key].filter((b) => b.id !== id),
        }));
    };

    const key = getDateKey();
    const currentBookings = [
        ...(fakeBookings[key] || []),
        ...(bookings[key] || []),
    ];

    const getStatusColor = (status) => {
        if (status === "Đang sử dụng") return "green";
        if (status === "Đang trống") return "orange";
        if (status === "Chưa kích hoạt hợp đồng") return "red";
        return "black";
    };

    return (
        <div className="main-container">
            <Navbar username="Username" />

            <div className="main-content">
                <div style={{ marginLeft: "30px" }}>
                    <h1>{vehicle.name}</h1>
                    <p>{vehicle.plate}</p>
                    <br />
                    <div>
                        <span style={{ color: getStatusColor(vehicle.status), fontWeight: "bold" }}>
                            ● {vehicle.status}
                        </span>
                    </div>
                </div>


                {/* --- Bộ lọc tháng năm --- */}
                <div className="select-row">
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
                        {[2024, 2025, 2026].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                {/* --- Bọc lịch và khung đặt lịch thành 2 cột --- */}
                <div className="calendar-wrapper">

                    {/* --- Khu vực Lịch (Cột trái) --- */}
                    <div className="calendar-section">
                        <div className="calendar-header">
                            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d, i) => (
                                <div key={i}>{d}</div>
                            ))}
                        </div>

                        <div className="calendar-grid">
                            {Array.from({ length: getStartOffset() }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from(
                                { length: daysInMonth(selectedMonth, selectedYear) },
                                (_, i) => (
                                    <div
                                        key={i + 1}
                                        className={`day ${selectedDay === i + 1 ? "active" : ""}`}
                                        onClick={() => setSelectedDay(i + 1)}
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* --- Cột phải: danh sách + đặt lịch --- */}
                    <div className="booking-right">

                        {/* --- Danh sách lịch (fake data + bạn đặt) --- */}
                        <div className="booking-list">
                            {currentBookings.map((b) => (
                                <div key={b.id} className="booking-item">
                                    <span>
                                        <b>{b.user}</b> {b.from} - {b.to}
                                    </span>
                                    {b.user === "Bạn" && (
                                        <button onClick={() => handleDeleteBooking(b.id)}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* --- Thanh “Đặt lịch cho bạn” --- */}
                        <div className="booking-bar">
                            <div className="info">
                                <b>Đặt lịch cho bạn</b>
                                <div>Từ - Đến</div>
                            </div>

                            <button
                                className="addBtn"
                                onClick={() => setShowBooking(!showBooking)}
                            >
                                {showBooking ? "−" : "+"}
                            </button>
                        </div>

                        {/* --- Form đặt lịch --- */}
                        {showBooking && (
                            <div className="booking-form">
                                <label>
                                    Từ:
                                    <select
                                        value={fromTime}
                                        onChange={(e) => setFromTime(e.target.value)}
                                    >
                                        <option value="">-- Chọn giờ --</option>
                                        {[...Array(24)].map((_, i) => (
                                            <option key={i} value={`${String(i).padStart(2, "0")}h`}>
                                                {String(i).padStart(2, "0")}h
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Đến:
                                    <select
                                        value={toTime}
                                        onChange={(e) => setToTime(e.target.value)}
                                    >
                                        <option value="">-- Chọn giờ --</option>
                                        {[...Array(24)].map((_, i) => (
                                            <option key={i} value={`${String(i).padStart(2, "0")}h`}>
                                                {String(i).padStart(2, "0")}h
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <button onClick={handleAddBooking}>Lưu lịch</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}