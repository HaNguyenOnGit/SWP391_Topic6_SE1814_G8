import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../NavBar";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import "./Booking.css";

export default function Booking() {
    const { id } = useParams(); // contractId
    const { userId } = useAuth();

    const [vehicle, setVehicle] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [fromTime, setFromTime] = useState("");
    const [toTime, setToTime] = useState("");
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case "active": return "Đang sử dụng";
            case "available": return "Đang trống";
            case "pending": return "Chờ kích hoạt";
            default: return status || "";
        }
    };

    const getDateKey = () =>
        `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

    // Lấy thông tin xe (từ contract)
    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const res = await axios.get(`/api/contract/contract-detail/${id}`);
                const data = res.data;
                setVehicle({
                    name: data.vehicleName,
                    plate: data.licensePlate,
                    model: data.model,
                    status: translateStatus(data.status),
                });
            } catch (err) {
                console.error("Lỗi khi tải hợp đồng:", err);
            }
        };
        fetchVehicle();
    }, [id]);

    // Lấy danh sách đặt lịch theo ngày
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const date = getDateKey();
                const res = await axios.get(`/api/reservation/contract/${id}?date=${date}`);
                setBookings(res.data || []);
            } catch (err) {
                console.error("Lỗi khi tải danh sách đặt lịch:", err);
            }
        };
        fetchBookings();
    }, [id, selectedDay, selectedMonth, selectedYear]);

    const parseTime = (str) => {
        const match = str.match(/(\d{1,2})h?(\d{0,2})p?/);
        if (!match) return NaN;
        const h = parseInt(match[1] || "0", 10);
        const m = parseInt(match[2] || "0", 10);
        return h * 60 + m;
    };

    const handleAddBooking = async () => {
        if (!fromTime || !toTime) {
            alert("Vui lòng nhập cả giờ bắt đầu và kết thúc!");
            return;
        }

        const from = parseTime(fromTime);
        const to = parseTime(toTime);
        if (isNaN(from) || isNaN(to) || from >= to) {
            alert("Khoảng thời gian không hợp lệ!");
            return;
        }

        try {
            const date = getDateKey();
            const start = `${date}T${String(Math.floor(from / 60)).padStart(2, "0")}:${String(from % 60).padStart(2, "0")}:00`;
            const end = `${date}T${String(Math.floor(to / 60)).padStart(2, "0")}:${String(to % 60).padStart(2, "0")}:00`;

            const res = await axios.post("/api/reservation/reservationRequest", {
                contractId: parseInt(id),
                userId: parseInt(userId),
                startTime: start,
                endTime: end,
            });

            alert(res.data.message || "Đặt lịch thành công!");
            setFromTime("");
            setToTime("");

            // reload bookings
            const bookingsRes = await axios.get(`/api/reservation/contract/${id}?date=${date}`);
            setBookings(bookingsRes.data || []);
        } catch (err) {
            if (err.response?.status === 409)
                alert(err.response.data?.error || "Trùng lịch!");
            else
                alert("Có lỗi xảy ra khi đặt lịch!");
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        const confirmDel = window.confirm("Bạn có chắc muốn xóa lịch này?");
        if (!confirmDel) return;

        try {
            await axios.delete(`/api/reservation/${bookingId}`);
            alert("Xóa lịch thành công!");

            // refresh lại danh sách
            const date = getDateKey();
            const res = await axios.get(`/api/reservation/contract/${id}?date=${date}`);
            setBookings(res.data || []);
        } catch (err) {
            alert("Lỗi khi xóa lịch!");
            console.error(err);
        }
    };

    const daysInMonth = (month, year) => new Date(year, month, 0).getDate();
    const getStartOffset = () => {
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1;
    };

    if (!vehicle) return <p>Đang tải thông tin xe...</p>;

    return (
        <div className="main-container">
            <Navbar username="Username" />

            <div className="main-content">
                <div className="calendar-wrapper">
                    {/* --- CỘT TRÁI: Thông tin xe + Lịch --- */}
                    <div className="left-section">
                        <div className="vehicle-header">
                            <h1>{vehicle.name}</h1>
                            <p>{vehicle.plate}</p>
                            <span style={{ color: vehicle.status === "Đang sử dụng" ? "green" : vehicle.status === "Đang trống" ? "orange" : "red" }}>
                                ● {vehicle.status}
                            </span>
                        </div>

                        <div className="select-row">
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Tháng {i + 1}
                                    </option>
                                ))}
                            </select>
                            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                                {[2024, 2025, 2026].map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                {Array.from({ length: daysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                                    <div
                                        key={i + 1}
                                        className={`day ${selectedDay === i + 1 ? "active" : ""}`}
                                        onClick={() => setSelectedDay(i + 1)}
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: Đặt lịch --- */}
                    <div className="booking-container">
                        <div className="booking-right">
                            <div className="booking-list">
                                {bookings.length === 0 ? (
                                    <div className="empty-booking">Chưa có lịch đặt trong ngày này.</div>
                                ) : (
                                    bookings.map((b) => (
                                        <div key={b.reservationId} className="booking-item">
                                            <span>
                                                <b>{b.userName}</b> {b.startTime.slice(11, 16)} - {b.endTime.slice(11, 16)}
                                            </span>
                                            {b.userId === parseInt(userId) && (
                                                <button onClick={() => handleDeleteBooking(b.reservationId)}>✕</button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="booking-bar">
                                <b>Đặt lịch cho bạn</b>
                                <div className="time-inputs">
                                    <input
                                        type="text"
                                        placeholder="Từ (hh:mm)"
                                        maxLength={5}
                                        value={fromTime}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, ""); // chỉ giữ số
                                            if (val.length > 2) val = val.slice(0, 2) + ":" + val.slice(2, 4);
                                            setFromTime(val);
                                        }}
                                    />
                                    <b>→</b>
                                    <input
                                        type="text"
                                        placeholder="Đến (hh:mm)"
                                        maxLength={5}
                                        value={toTime}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, ""); // chỉ giữ số
                                            if (val.length > 2) val = val.slice(0, 2) + ":" + val.slice(2, 4);
                                            setToTime(val);
                                        }}
                                    />
                                    <button className="addBtn" onClick={handleAddBooking}>
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}