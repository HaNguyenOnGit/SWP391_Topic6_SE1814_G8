import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import VehicleInfo from "../VehicleInfo";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import "./Checkin.css";

function OdoUpload({ value, onChange, disabled, inputId = "odoInput" }) {
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
      onClick={() => !disabled && document.getElementById(inputId).click()}
    >
      {preview ? (
        <img src={preview} alt="Odo" className="odo-image" />
      ) : (
        <div className="upload-text">
          <span>📸</span>
          <span>Upload ảnh ô-đô (bắt buộc)</span>
        </div>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden-input"
        required
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
  contractTotalKm,
  disabled = false,
  checkinTime = null,
}) {
  const isReady = data.km && data.image;
  const kmValue = Number(data.km.replace(/,/g, ""));
  let error = "";

  // RÀNG BUỘC
  if ((type === "checkin" && kmValue < contractTotalKm) || (type === "checkout" && kmValue < contractTotalKm))
    error += "Số km không phù hợp! ";
  if (!data.image)
    error += "Hãy upload ảnh!";
  error = error.trim();

  return (
    <div className="checkin-main-group">
      <OdoUpload
        value={data.image}
        onChange={(file) => setData({ ...data, image: file })}
        disabled={disabled}
        inputId={`${type}OdoInput`}
      />

      {/* Nếu form bị disable (đã checkin) thì chỉ hiển thị thời gian xác nhận */}
      {disabled ? (
        <p className="confirmed-message">
          Đã xác nhận lúc{" "}
          {checkinTime
            ? new Date(checkinTime).toLocaleTimeString("vi-VN")
            : "Không xác định"}
        </p>
      ) : (
        <div className="km-action-group">
          <h3 className="km-label">
            {type === "checkin" ? "Check-in" : "Check-out"}
          </h3>
          <KmInput
            value={data.km}
            onChange={(val) => setData({ ...data, km: val })}
            disabled={disabled}
          />
          {error && <p className="error-message">{error}</p>}

          <button
            disabled={!isReady || !!error}
            className={`confirm-btn ${isReady && !error ? "ready" : "disabled"}`}
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        </div>
      )}
    </div>
  );
}

export default function Checkin() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);
  const [phase, setPhase] = useState("checkin");
  const [checkinData, setCheckinData] = useState({ km: "", image: null });
  const [checkoutData, setCheckoutData] = useState({ km: "", image: null });
  const [contractTotalKm, setContractTotalKm] = useState(0);
  const [checkinTime, setCheckinTime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const [usageRes, checkinState, contractKmRes] = await Promise.all([
          axios.get(`/api/check/usage-history?userId=${userId}&contractId=${id}`),
          axios.get(`/api/check/is-checked-in?contractId=${id}`),
          axios.get(`/api/check/contract-total-distance?contractId=${id}`),
        ]);

        const data = usageRes.data || {};
        const trips = Array.isArray(data.trips)
          ? data.trips.map((t) => ({
            checkInTime: t.checkInTime,
            checkOutTime: t.checkOutTime,
            distance: t.distance || 0,
          }))
          : [];

        setTripInfo({ distance: contractKmRes.data.totalDistance || 0 });
        setContractTotalKm(contractKmRes.data.totalDistance || 0);

        const activeTrip = trips.find((t) => !t.checkOutTime);
        if (activeTrip) {
          setCheckinTime(activeTrip.checkInTime);
          setPhase("checked");
        }

        const isCheckedIn = checkinState.data.isCheckedIn;
        setVehicle({
          id,
          name: "Xe trong hợp đồng #" + id,
          status: isCheckedIn ? "Đang sử dụng" : "Sẵn sàng",
        });
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      }
    };

    fetchData();
  }, [id, userId]);

  const handleCheckin = async () => {
    try {
      const kmValue = Number(checkinData.km.replace(/,/g, ""));
      const formData = new FormData();
      formData.append("ContractId", Number(id));
      formData.append("UserId", Number(userId));
      formData.append("Odometer", kmValue);
      if (checkinData.image) {
        formData.append("ProofImageInFile", checkinData.image);
      }

      await axios.post("/api/check/checkin", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Check-in thành công!");
      setPhase("checked");
    } catch (err) {
      alert("Lỗi khi check-in: " + (err.response?.data || err.message));
    }
  };

  const handleCheckout = async () => {
    try {
      const kmValue = Number(checkoutData.km.replace(/,/g, ""));
      const formData = new FormData();
      formData.append("ContractId", Number(id));
      formData.append("UserId", Number(userId));
      formData.append("Odometer", kmValue);
      if (checkoutData.image) {
        formData.append("ProofImageOutFile", checkoutData.image);
      }

      await axios.post("/api/check/checkout", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
                <h3 className="check-form-title">Hành trình của xe</h3>
                <p className="trip-total-distance">
                  <b>{(tripInfo?.distance ?? 0).toLocaleString("vi-VN")} Km</b>
                </p>
                {/* <p className="checkin-distance">
                  <b>{tripInfo.distance} Km</b>
                </p> */}
              </>
            )}

            {phase === "checkin" && (
              <CheckForm
                type="checkin"
                data={checkinData}
                setData={setCheckinData}
                contractTotalKm={contractTotalKm}
                onConfirm={handleCheckin}
              />
            )}

            {phase === "checked" && (
              <>
                <CheckForm
                  type="checkin"
                  data={checkinData}
                  setData={setCheckinData}
                  disabled
                  contractTotalKm={contractTotalKm}
                  checkinTime={checkinTime}
                />
                <CheckForm
                  type="checkout"
                  data={checkoutData}
                  setData={setCheckoutData}
                  checkinKm={Number(checkinData.km.replace(/,/g, ""))}
                  contractTotalKm={contractTotalKm}
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
