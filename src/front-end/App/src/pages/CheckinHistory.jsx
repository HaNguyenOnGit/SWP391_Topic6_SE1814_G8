import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../Navbar";
import VehicleInfo from "../VehicleInfo";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "./CheckinHistory.css";

export default function CheckinHistory() {
  const { id } = useParams(); // contractId
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canCheckin, setCanCheckin] = useState(false);
  const [hasOngoingTrip, setHasOngoingTrip] = useState(false);

  // --- Gọi API usage-history ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi song song hai API: usage-history và quyền checkin
        const [usageRes, checkinRes] = await Promise.all([
          axios.get(`/api/check/usage-history?userId=${userId}&contractId=${id}`),
          axios.get(`/api/check/can-checkin?userId=${userId}&contractId=${id}`),
        ]);

        const data = usageRes.data || {};
        const canCheckinFromApi = checkinRes.data?.canCheckin ?? false;

        const trips = Array.isArray(data.trips)
          ? data.trips.map((t) => {
            const checkIn = t.checkInTime ? new Date(t.checkInTime) : null;
            const checkOut = t.checkOutTime ? new Date(t.checkOutTime) : null;

            const date = checkIn
              ? checkIn.toLocaleDateString("vi-VN")
              : checkOut
                ? checkOut.toLocaleDateString("vi-VN")
                : "Không rõ";

            const timeRange = checkIn
              ? `${checkIn.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${checkOut
                ? checkOut.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : ""
              }`
              : "";

            return {
              date,
              time: timeRange,
              distance: t.distance || 0,
              checkOutTime: checkOut, // Để check ongoing và sort
              checkInTime: checkIn, // Để sort
              isOngoing: !checkOut, // Checkin chưa checkout
            };
          }).sort((a, b) => {
            // Ưu tiên checkin chưa checkout ở đầu
            if (a.isOngoing && !b.isOngoing) return -1;
            if (!a.isOngoing && b.isOngoing) return 1;
            // Nếu cả hai đã checkout, sort theo checkOutTime descending (mới nhất trước)
            if (!a.isOngoing && !b.isOngoing) {
              return b.checkOutTime - a.checkOutTime;
            }
            // Nếu cả hai chưa checkout (hiếm), sort theo checkInTime descending
            return b.checkInTime - a.checkInTime;
          })
          : [];

        // Mở rộng điều kiện: Cho phép vào checkin nếu có trip đang ongoing (chưa checkout)
        const hasOngoingTrip = trips.some(t => !t.checkOutTime);
        setCanCheckin(canCheckinFromApi || hasOngoingTrip);
        setHasOngoingTrip(hasOngoingTrip);

        setHistory(trips);
        setTripInfo({ distance: data.totalDistance || 0 });
        setVehicle({
          id,
          name: "Xe trong hợp đồng #" + id,
          status: (data.totalDistance || 0) > 0 ? "Đã sử dụng" : "Chưa sử dụng",
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!vehicle) return <h2>Không tìm thấy phương tiện</h2>;

  return (
    <div className="main-container">
      <Navbar username="Username" />
      <div className="main-content">
        <div className="main-content-layout">
          <VehicleInfo vehicle={vehicle} />

          <div className="trip-section">
            <h3>Hành trình của bạn</h3>

            {/* Tổng quãng đường */}
            <p className="trip-total-distance">
              <b>{(tripInfo?.distance ?? 0).toLocaleString("vi-VN")} Km</b>
            </p>

            <p className="history-title">Lịch sử hành trình</p>

            <div className="history-list">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className="history-item">
                    <p className="history-time-range">
                      {h.date} | {h.time}
                    </p>
                    <p className="history-distance">
                      {h.distance.toLocaleString("vi-VN")} Km
                    </p>
                  </div>
                ))
              ) : (
                <p>Chưa có lịch sử hành trình.</p>
              )}
            </div>

            {/* Nút chuyển đến trang checkin/checkout */}
            <div className="trip-button-container">
              <Link
                to={canCheckin ? `/vehicle/${id}/checkin` : "#"}
                className={`start-checkin-btn ${!canCheckin ? "disabled" : ""}`}
                onClick={(e) => {
                  if (!canCheckin) e.preventDefault();
                }}
              >
                {hasOngoingTrip ? "Tiếp tục checkout" : "Bắt đầu check-in"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
