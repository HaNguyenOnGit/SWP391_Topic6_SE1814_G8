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
    // Đặt lịch theo ngày
    const [selectedStartDay, setSelectedStartDay] = useState(null);
    const [selectedEndDay, setSelectedEndDay] = useState(null);
    const [bookingError, setBookingError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case "active": return "Đang sử dụng";
            case "available": return "Đang trống";
            case "pending": return "Chờ kích hoạt";
            case "cancelled": return "Đã hủy";
            default: return status || "";
        }
    };

    // Trả về chuỗi ngày yyyy-mm-dd
    const getDateKey = (day) =>
        `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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
    // Lấy danh sách đặt lịch cho cả tháng
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get(`/api/reservation/contract/${id}/month?month=${selectedMonth}&year=${selectedYear}`);
                setBookings(res.data || []);
            } catch (err) {
                console.error("Lỗi khi tải danh sách đặt lịch:", err);
            }
        };
        fetchBookings();
    }, [id, selectedMonth, selectedYear]);

    // Ensure no date is pre-selected when the calendar first loads or when month/year changes
    useEffect(() => {
        setSelectedStartDay(null);
        setSelectedEndDay(null);
        setBookingError("");
    }, [selectedMonth, selectedYear]);

    const parseTime = (str) => {
        const match = str.match(/(\d{1,2})h?(\d{0,2})p?/);
        if (!match) return NaN;
        const h = parseInt(match[1] || "0", 10);
        const m = parseInt(match[2] || "0", 10);
        return h * 60 + m;
    };

    const handleAddBooking = async () => {
        if (!selectedStartDay) {
            alert("Vui lòng chọn ngày bắt đầu!");
            return;
        }
        const startDay = selectedStartDay;
        const endDay = selectedEndDay || selectedStartDay;
        if (endDay < startDay) {
            alert("Ngày kết thúc phải sau ngày bắt đầu!");
            return;
        }
        try {
            const startDate = getDateKey(startDay) + "T00:00:00";
            const endDate = getDateKey(endDay) + "T23:59:00";
            const res = await axios.post("/api/reservation", {
                contractId: parseInt(id),
                userId: parseInt(userId),
                startTime: startDate,
                endTime: endDate,
            });
            alert(res.data.message || "Đặt lịch thành công!");
            setSelectedStartDay(null);
            setSelectedEndDay(null);
            // reload bookings
            const bookingsRes = await axios.get(`/api/reservation/contract/${id}/month?month=${selectedMonth}&year=${selectedYear}`);
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
            const date = getDateKey();
            const res = await axios.get(`/api/reservation/contract/${id}/month?month=${selectedMonth}&year=${selectedYear}`);
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
    // Tạo mảng các ngày đã đặt
    const bookedDays = (() => {
        const arr = [];
        bookings.forEach(b => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            if (start.getMonth() + 1 === selectedMonth && start.getFullYear() === selectedYear) {
                for (let d = start.getDate(); d <= end.getDate(); d++) {
                    if (d > 0 && d <= daysInMonth(selectedMonth, selectedYear)) arr.push(d);
                }
            }
        });
        return arr;
    })();

    if (!vehicle) return <p>Đang tải thông tin xe...</p>;

    const isUnavailable = vehicle.status === "Chờ kích hoạt" || vehicle.status === "Đã hủy";

    return (
        <div className="main-container">
            <Navbar username="Username" />
            <div className="main-content">
                <div className="calendar-wrapper">
                    <div className="left-section">
                        {/* Luôn hiện thông tin xe */}
                        <div className="vehicle-header">
                            <h1>{vehicle.name}</h1>
                            <p>{vehicle.plate}</p>
                            <span
                                style={{
                                    color:
                                        vehicle.status === "Đang sử dụng"
                                            ? "green"
                                            : vehicle.status === "Đang trống"
                                                ? "orange"
                                                : "red",
                                }}
                            >
                                ● {vehicle.status}
                            </span>
                        </div>

                        {/* Nếu khả dụng mới hiển thị lịch */}
                        {!isUnavailable && (
                            <>
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
                                        {Array.from({ length: daysInMonth(selectedMonth, selectedYear) }, (_, i) => {
                                            const dayNum = i + 1;
                                            const dateObj = new Date(selectedYear, selectedMonth - 1, dayNum);
                                            const today = new Date();
                                            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                            const minAllowed = new Date(todayStart);
                                            minAllowed.setDate(minAllowed.getDate() + 1); // must book at least 1 day before

                                            const isPast = dateObj < todayStart; // past dates
                                            const isTooSoon = dateObj < minAllowed; // today (or within 24h) not allowed
                                            const isBooked = bookedDays.includes(dayNum);
                                            const isSelected = (selectedStartDay !== null && selectedEndDay !== null)
                                                ? dayNum >= selectedStartDay && dayNum <= selectedEndDay
                                                : (selectedStartDay !== null && selectedStartDay === dayNum);
                                            return (
                                                <div
                                                    key={dayNum}
                                                    className={`day${isSelected ? " active" : ""}${isBooked ? " booked" : ""}${isPast ? " past" : ""}`}
                                                    style={{ pointerEvents: (isBooked || isPast) ? "none" : "auto", opacity: (isBooked || isPast) ? 0.5 : 1 }}
                                                    onClick={() => {
                                                        if (isBooked || isPast) return; // disallow clicking past or already booked

                                                        // If the clicked date is too soon (must be at least next day), show error and cancel selection
                                                        if (isTooSoon) {
                                                            setSelectedStartDay(null);
                                                            setSelectedEndDay(null);
                                                            setBookingError("bạn phải đặt lịch trước 1 ngày");
                                                            return;
                                                        }

                                                        // valid click, clear any previous error
                                                        setBookingError("");

                                                        if (!selectedStartDay) {
                                                            setSelectedStartDay(dayNum);
                                                            setSelectedEndDay(null);
                                                        } else if (!selectedEndDay && dayNum > selectedStartDay) {
                                                            // Kiểm tra có ngày đã đặt trong dải
                                                            const hasBooked = bookedDays.some(d => d >= selectedStartDay && d <= dayNum);
                                                            if (hasBooked) {
                                                                setSelectedStartDay(null);
                                                                setSelectedEndDay(null);
                                                                setBookingError("Có ngày đã được đặt!");
                                                                return;
                                                            }
                                                            setSelectedEndDay(dayNum);
                                                        } else {
                                                            setSelectedStartDay(dayNum);
                                                            setSelectedEndDay(null);
                                                        }
                                                    }}
                                                >
                                                    {String(dayNum).padStart(2, "0")}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Cột phải (ẩn nếu không khả dụng) */}
                    {!isUnavailable && (
                        <div className="booking-container">
                            <div className="booking-right">
                                <div className="booking-list">
                                    {bookings.length === 0 ? (
                                        <div className="empty-booking">Chưa có lịch đặt trong tháng này.</div>
                                    ) : (
                                        bookings.map((b) => (
                                            <div style={{ height: "20px" }} key={b.reservationId} className="booking-item">
                                                <span>
                                                    <b>{b.userName}</b> {new Date(b.startTime).getDate()} - {new Date(b.endTime).getDate()}/{selectedMonth}/{selectedYear}
                                                </span>
                                                {b.userId === parseInt(userId) && (
                                                    <button onClick={() => handleDeleteBooking(b.reservationId)}>✕</button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="booking-bar" style={{ minWidth: 220 }}>
                                    <b>Đặt lịch cho bạn</b>
                                    <div className="date-inputs" style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ minWidth: 220, display: 'inline-block' }}>
                                            {selectedStartDay
                                                ? selectedEndDay
                                                    ? `${String(selectedStartDay).padStart(2, "0")}/${String(selectedMonth).padStart(2, "0")}/${selectedYear} - ${String(selectedEndDay).padStart(2, "0")}/${String(selectedMonth).padStart(2, "0")}/${selectedYear}`
                                                    : `${String(selectedStartDay).padStart(2, "0")}/${String(selectedMonth).padStart(2, "0")}/${selectedYear}`
                                                : "Chọn ngày bắt đầu và kết thúc"}
                                        </span>
                                        <button className="addBtn" onClick={handleAddBooking} style={{ marginLeft: 12 }}>
                                            +
                                        </button>
                                    </div>
                                    {bookingError && (
                                        <div style={{ color: 'red', marginTop: 8, fontWeight: 500 }}>
                                            {bookingError}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isUnavailable && (
                    <div className="vehicle-unavailable-wrapper">
                        <div className="vehicle-unavailable">
                            <h2>Xe hiện đang ở trạng thái không khả dụng.</h2>
                            <p>Hợp đồng này chưa kích hoạt hoặc đã bị hủy — bạn không thể đặt lịch.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}
