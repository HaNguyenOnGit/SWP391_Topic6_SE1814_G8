import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "./Checkin.css";

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
          <span>Upload ảnh ô-đô (tùy chọn)</span>
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

function CheckForm({
  type,
  data,
  setData,
  onConfirm,
  checkinKm,
  lastTripKm,
  disabled = false,
}) {
  const isReady = data.km; // ảnh không bắt buộc
  const kmValue = Number(data.km.replace(/,/g, ""));
  let error = "";

  if (type === "checkin" && kmValue <= lastTripKm)
    error = `Số km check-in phải lớn hơn ${lastTripKm.toLocaleString()} km`;
  if (type === "checkout" && kmValue < checkinKm)
    error = "Số km check-out phải ≥ check-in";

  return (
    <div className="checkin-main-group">
      <OdoUpload
        value={data.image}
        onChange={(file) => setData({ ...data, image: file })}
        disabled={disabled}
      />

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

export default function Checkin() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [phase, setPhase] = useState("checkin");
  const [checkinData, setCheckinData] = useState({ km: "", image: null });
  const [checkoutData, setCheckoutData] = useState({ km: "", image: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, checkinState] = await Promise.all([
          axios.get(`/api/check/usage-history?userId=${userId}&contractId=${id}`),
          axios.get(`/api/check/is-checked-in?contractId=${id}`),
        ]);

        const data = historyRes.data;
        const trips = data.Trips || [];
        // ✅ mỗi trip có CheckOutTime, CheckInTime, Distance
        // => ta chỉ cần tổng Distance
        setHistory(trips.map((t) => ({ endKm: t.Distance || 0 })));
        setTripInfo({ distance: data.TotalDistance || 0 });

        const isCheckedIn = checkinState.data.isCheckedIn; // ✅ fix key đúng

        setVehicle({
          id,
          name: "Xe trong hợp đồng #" + id,
          status: isCheckedIn ? "Đang sử dụng" : "Sẵn sàng",
        });

        if (isCheckedIn) setPhase("checked"); // ✅ sửa key và logic
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      }
    };
    fetchData();
  }, [id, userId]);

  const lastTripKm = history.length ? Math.max(...history.map((h) => h.endKm)) : 0;

  const handleCheckin = async () => {
    try {
      const kmValue = Number(checkinData.km.replace(/,/g, ""));
      let base64Image = null;
      if (checkinData.image) base64Image = await toBase64(checkinData.image);

      await axios.post("/api/check/checkin", {
        ContractId: Number(id),
        UserId: userId,
        Odometer: kmValue,
        ProofImage: base64Image,
      });

      alert("Check-in thành công!");
      setPhase("checked");
      setCheckinData({ km: checkinData.km, image: checkinData.image });
    } catch (err) {
      alert("Lỗi khi check-in: " + (err.response?.data || err.message));
    }
  };

  const handleCheckout = async () => {
    try {
      const kmValue = Number(checkoutData.km.replace(/,/g, ""));
      let base64Image = null;
      if (checkoutData.image) base64Image = await toBase64(checkoutData.image);

      await axios.post("/api/check/checkout", {
        ContractId: Number(id),
        UserId: userId,
        Odometer: kmValue,
        ProofImage: base64Image,
      });

      alert("Checkout thành công!");
      navigate(`/vehicle/${id}/checkinHistory`);
    } catch (err) {
      alert("Lỗi khi checkout: " + (err.response?.data || err.message));
    }
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

            {phase === "checkin" && (
              <CheckForm
                type="checkin"
                data={checkinData}
                setData={setCheckinData}
                lastTripKm={lastTripKm}
                onConfirm={handleCheckin}
              />
            )}

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
                  onConfirm={handleCheckout}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
}
