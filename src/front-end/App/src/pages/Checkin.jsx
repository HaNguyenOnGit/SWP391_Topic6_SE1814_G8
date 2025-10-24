import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import "./Checkin.css";

// ========== COMPONENT UPLOAD ẢNH Ô-ĐÔ ==========
function OdoUpload({ value, onChange, disabled }) {
  const [preview, setPreview] = useState(value || null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file);
    }
  };

  return (
    <div
      className={`camera-box ${disabled ? "disabled" : ""}`}
      onClick={() => !disabled && document.getElementById("odoInput").click()}
    >
      {preview ? (
        <img src={preview} alt="Odo" className="odo-image" />
      ) : (
        <div className="upload-text">
          <span>📸</span>
          <span>Upload ảnh ô-đô</span>
        </div>
      )}
      <input
        id="odoInput"
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden-input"
      />
      {!disabled && preview && <span className="change-photo-btn">Thay đổi ảnh</span>}
    </div>
  );
}

// ========== COMPONENT NHẬP KM ==========
function KmInput({ value, onChange, disabled }) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    onChange(formatted);
  };

  return (
    <div className="km-action-group">
      <label className="km-label">Số Km</label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        className="km-input"
        placeholder="Nhập số km"
      />
    </div>
  );
}

// ========== FORM CHECK-IN / CHECK-OUT ==========
function CheckForm({
  type,
  data,
  setData,
  onConfirm,
  checkinKm,
  lastTripKm,
  disabled = false,
}) {
  const isReady = data.image && data.km;
  const kmValue = Number(data.km.replace(/,/g, ""));
  let error = "";

  if (type === "checkin" && kmValue <= lastTripKm)
    error = `Số km check-in phải lớn hơn ${lastTripKm.toLocaleString()} km`;
  if (type === "checkout" && kmValue < checkinKm)
    error = "Số km check-out phải ≥ check-in";

  return (
    <div className="checkin-main-group">
      {/* Cột trái: Upload ảnh */}
      <OdoUpload
        value={data.image}
        onChange={(file) => setData({ ...data, image: file })}
        disabled={disabled}
      />

      {/* Cột phải: nhập Km + nút xác nhận */}
      <div className="km-action-group">
        <h3 className="km-label">{type === "checkin" ? "Check-in" : "Check-out"}</h3>
        <KmInput
          value={data.km}
          onChange={(val) => setData({ ...data, km: val })}
          disabled={disabled}
        />
        {error && <p className="error-message">{error}</p>}

        {!disabled ? (
          <button
            disabled={!isReady || !!error}
            className={`confirm-btn ${isReady && !error ? "ready" : "disabled"}`}
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        ) : (
          <p className="confirmed-message">
            Đã xác nhận lúc {new Date().toLocaleTimeString("vi-VN")}
          </p>
        )}
      </div>
    </div>
  );
}

// ========== TRANG CHÍNH ==========
export default function Checkin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [phase, setPhase] = useState("checkin");
  const [checkinData, setCheckinData] = useState({ km: "", image: null });
  const [checkoutData, setCheckoutData] = useState({ km: "", image: null });

  useEffect(() => {
    const mockVehicle = {
      id,
      name: "Xe Honda City",
      plate: "59D3 - 23456",
      status: "Đang sử dụng",
    };
    const mockTrip = { distance: 1234 };
    const mockHistory = [{ endKm: 10200 }, { endKm: 10170 }, { endKm: 10150 }];
    setVehicle(mockVehicle);
    setTripInfo(mockTrip);
    setHistory(mockHistory);
  }, [id]);

  const lastTripKm = history.length ? Math.max(...history.map((h) => h.endKm)) : 0;

  useEffect(() => {
    const saved = localStorage.getItem("checkinData");
    if (saved) {
      setPhase("checked");
      setCheckinData(JSON.parse(saved));
    }
  }, []);

  const reset = () => {
    localStorage.removeItem("checkinData");
    setPhase("checkin");
    setCheckinData({ km: "", image: null });
    setCheckoutData({ km: "", image: null });
    navigate(`/vehicle/${id}/checkinHistory`);
  };

  if (!vehicle) return <h2>Không tìm thấy phương tiện</h2>;

  return (
    <div className="main-container">
      <Navbar username="Username" />
      <div className="main-content">
        <div className="main-content-layout">
          <VehicleInfo vehicle={vehicle} />

          <div className="check-form-content">
            {tripInfo && (
              <>
                <h3 className="check-form-title">Hành trình của bạn</h3>
                <p className="checkin-distance">
                  <b>{tripInfo.distance} Km</b>
                </p>
              </>
            )}

            {/* Check-in */}
            {phase === "checkin" && (
              <CheckForm
                type="checkin"
                data={checkinData}
                setData={setCheckinData}
                lastTripKm={lastTripKm}
                onConfirm={() => {
                  localStorage.setItem("checkinData", JSON.stringify(checkinData));
                  setPhase("checked");
                }}
              />
            )}

            {/* Check-in & Check-out */}
            {phase === "checked" && (
              <>
                <CheckForm
                  type="checkin"
                  data={checkinData}
                  setData={setCheckinData}
                  lastTripKm={lastTripKm}
                  disabled
                />
                <CheckForm
                  type="checkout"
                  data={checkoutData}
                  setData={setCheckoutData}
                  checkinKm={Number(checkinData.km.replace(/,/g, ""))}
                  onConfirm={() => {
                    alert("Đã hoàn tất check-out!");
                    reset();
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
