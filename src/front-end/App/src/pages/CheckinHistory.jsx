import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import "./CheckinHistory.css";

export default function CheckinHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const mockVehicle = {
        id,
        name: "Xe Honda City",
        plate: "59D3 - 23456",
        status: "Đang sử dụng",
      };
      const mockTrip = { distance: 1234 };
      const mockHistory = [
        { date: "03/10/2025", time: "08:00 - 09:30", distance: 30 },
        { date: "02/10/2025", time: "07:50 - 08:40", distance: 20 },
        { date: "01/10/2025", time: "06:00 - 07:15", distance: 25 },
      ];
      setVehicle(mockVehicle);
      setTripInfo(mockTrip);
      setHistory(mockHistory);
      setLoading(false);
    }, 800);
  }, [id]);

  if (!vehicle) return <h2>Không tìm thấy phương tiện</h2>;

  return (
    <div className="main-container">
      <Navbar username="Username" />
      <div className="main-content">
        <div className="main-content-layout">
          <VehicleInfo vehicle={vehicle} />
          <div className="trip-section"> {/* Thêm class trip-section */}
            <h3>Hành trình của bạn</h3>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <>
                {/* Tổng quãng đường đã đi (5,576 Km) */}
                <p className="trip-total-distance">
                  <b>5,576 Km</b> {/* Dùng giá trị cứng theo ảnh để mô phỏng */}
                </p>

                <p className="history-title">Lịch sử hành trình</p>

                {/* Khung Lịch sử */}
                <div className="history-list">
                  {history.map((h, i) => (
                    <div key={i} className="history-item">
                      <p className="history-time-range">
                        {h.date} | {h.time}
                      </p>
                      <p className="history-distance">{h.distance} Km</p>
                    </div>
                  ))}
                </div>

                {/* Nút Bắt đầu check-in/out */}
                <div className="trip-button-container">
                  <a
                    href={`/vehicle/${id}/checkin`} // Thêm href để nó hoạt động như một link
                    className="start-checkin-btn"
                    onClick={(e) => {
                      e.preventDefault(); // Ngăn hành vi mặc định của link (tải lại trang)
                      navigate(`/vehicle/${id}/checkin`);
                    }}
                  >
                    Bắt đầu check-in/out
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
