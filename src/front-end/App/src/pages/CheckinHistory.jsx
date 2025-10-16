import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";

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
          <div>
            <h3>Hành trình của bạn</h3>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <>
                <p>
                  <b>{tripInfo.distance} km</b>
                </p>

                <p>Lịch sử hành trình</p>
                <div
                  style={{ height: "200px", overflowY: "auto" }}
                >
                  {history.map((h, i) => (
                    <div key={i} className="border-b pb-2 mb-2">
                      <p className="font-semibold">
                        {h.date} | {h.time}
                      </p>
                      <p>{h.distance} km</p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    position: "sticky",
                    bottom: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    onClick={() => navigate(`/vehicle/${id}/checkin`)}
                  >
                    Bắt đầu check-in/out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
