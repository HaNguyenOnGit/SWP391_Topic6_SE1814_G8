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
    if (!fromTime || !toTime) {
        alert("Vui lòng nhập cả giờ bắt đầu và kết thúc!");
        return;
    }

    // --- Hàm chuyển "11h11p" → số phút ---
    const parseTime = (str) => {
        const match = str.match(/(\d{1,2})h?(\d{0,2})p?/);
        if (!match) return NaN;
        const h = parseInt(match[1] || "0", 10);
        const m = parseInt(match[2] || "0", 10);
        return h * 60 + m;
    };

    const from = parseTime(fromTime);
    const to = parseTime(toTime);

    if (isNaN(from) || isNaN(to)) {
        alert("Giờ không hợp lệ!");
        return;
    }

    if (from >= to) {
        alert("Giờ bắt đầu phải nhỏ hơn giờ kết thúc!");
        return;
    }

    const key = getDateKey();
    const allBookings = [
        ...(fakeBookings[key] || []),
        ...(bookings[key] || []),
    ];

    const overlap = allBookings.some((b) => {
        const bFrom = parseTime(b.from);
        const bTo = parseTime(b.to);
        return !(to <= bFrom || from >= bTo); // có giao nhau
    });

    if (overlap) {
        alert("Khoảng thời gian này đã có người đặt rồi!");
        return;
    }

    const newBooking = { id: Date.now(), user: "Bạn", from: fromTime, to: toTime };
    setBookings((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), newBooking],
    }));

    setShowBooking(false);
    setFromTime("");
    setToTime("");
    alert("Đặt lịch thành công!");
};



    const handleDeleteBooking = (id) => {
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa lịch này không?");
        if (!confirmDelete) return; // nếu người dùng bấm Hủy thì thoát hàm

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
            <div className="calendar-wrapper">
                {/* --- CỘT TRÁI: Thông tin xe + Lịch --- */}
                <div className="left-section">
                    {/* --- Thông tin xe --- */}
                    <div className="vehicle-header">
                        <h1>{vehicle.name}</h1>
                        <p>{vehicle.plate}</p>
                        <span
                            style={{
                                color: getStatusColor(vehicle.status),
                                fontWeight: "bold",
                            }}
                        >
                            ● {vehicle.status}
                        </span>
                    </div>

                    {/* --- Bộ lọc tháng/năm --- */}
                    <div className="select-row">
                        <select
                            value={selectedMonth}
                            onChange={(e) =>
                                setSelectedMonth(parseInt(e.target.value))
                            }
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Tháng {i + 1}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(parseInt(e.target.value))
                            }
                        >
                            {[2024, 2025, 2026].map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* --- Lịch --- */}
                    <div className="calendar-section">
                        <div className="calendar-header">
                            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
                                (d, i) => (
                                    <div key={i}>{d}</div>
                                )
                            )}
                        </div>

                        <div className="calendar-grid">
                            {Array.from({ length: getStartOffset() }).map(
                                (_, i) => (
                                    <div key={`empty-${i}`} />
                                )
                            )}
                            {Array.from(
                                {
                                    length: daysInMonth(
                                        selectedMonth,
                                        selectedYear
                                    ),
                                },
                                (_, i) => (
                                    <div
                                        key={i + 1}
                                        className={`day ${
                                            selectedDay === i + 1
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setSelectedDay(i + 1)}
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: Danh sách & Đặt lịch --- */}
                <div className="booking-right">
                    {/* --- Danh sách lịch (fake data + bạn đặt) --- */}
                    <div className="booking-list">
                        {currentBookings.length === 0 ? (
                            <div className="empty-booking">
                                Chưa có lịch đặt trong ngày này.
                            </div>
                        ) : (
                            currentBookings.map((b) => (
                                <div key={b.id} className="booking-item">
                                    <span>
                                        <b>{b.user}</b> {b.from} - {b.to}
                                    </span>
                                    {b.user === "Bạn" && (
                                        <button
                                            onClick={() =>
                                                handleDeleteBooking(b.id)
                                            }
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* --- Thanh “Đặt lịch cho bạn” --- */}
                    <div className="booking-bar">
                        <div className="info">
                            <b>Đặt lịch cho bạn</b>
                            <div className="time-inputs">
                                <input
                                    type="text"
                                    placeholder="Từ (VD: 930 → 09h30p)"
                                    value={fromTime}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );
                                        if (val.length > 4)
                                            val = val.slice(0, 4);

                                        let formatted = val;
                                        if (val.length >= 3) {
                                            formatted = `${val.slice(
                                                0,
                                                2
                                            )}h${val.slice(2)}p`;
                                        } else if (val.length >= 1) {
                                            formatted = `${val.slice(0, 2)}h`;
                                        }
                                        setFromTime(formatted);
                                    }}
                                />

                                <input
                                    type="text"
                                    placeholder="Đến (VD: 1415 → 14h15p)"
                                    value={toTime}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );
                                        if (val.length > 4)
                                            val = val.slice(0, 4);

                                        let formatted = val;
                                        if (val.length >= 3) {
                                            formatted = `${val.slice(
                                                0,
                                                2
                                            )}h${val.slice(2)}p`;
                                        } else if (val.length >= 1) {
                                            formatted = `${val.slice(0, 2)}h`;
                                        }
                                        setToTime(formatted);
                                    }}
                                />
                            </div>
                        </div>

                        <button className="addBtn" onClick={handleAddBooking}>
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}