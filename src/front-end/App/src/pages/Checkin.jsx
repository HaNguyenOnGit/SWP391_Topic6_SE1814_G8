import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";

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
      className={`relative w-40 h-40 border rounded overflow-hidden flex items-center justify-center bg-gray-50 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      onClick={() => !disabled && document.getElementById("odoInput").click()}
    >
      {preview ? (
        <img src={preview} alt="Odo" className="object-cover w-full h-full" />
      ) : (
        <span className="text-gray-500 text-sm text-center px-2">
          Upload ảnh ô-đô
        </span>
      )}
      <input
        id="odoInput"
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      {!disabled && preview && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white text-xs px-2 py-0.5 rounded shadow">
          Thay đổi ảnh
        </span>
      )}
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
    <input
      type="text"
      value={value}
      disabled={disabled}
      onChange={handleChange}
      className="border p-2 rounded w-40"
      placeholder="Số km"
    />
  );
}

function CheckForm({ type, data, setData, onConfirm, checkinKm, lastTripKm, disabled = false }) {
  const isReady = data.image && data.km;
  const kmValue = Number(data.km.replace(/,/g, ""));
  let error = "";

  if (type === "checkin" && kmValue <= lastTripKm)
    error = `Số km check-in phải lớn hơn ${lastTripKm.toLocaleString()} km`;
  if (type === "checkout" && kmValue < checkinKm)
    error = "Số km check-out phải ≥ check-in";

  return (
    <div className="mt-4 space-y-3">
      <h3 className="font-semibold text-lg">
        {type === "checkin" ? "Check-in" : "Check-out"}
      </h3>
      <OdoUpload value={data.image} onChange={(file) => setData({ ...data, image: file })} disabled={disabled} />
      <KmInput value={data.km} onChange={(val) => setData({ ...data, km: val })} disabled={disabled} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!disabled ? (
        <button
          disabled={!isReady || !!error}
          className={`px-4 py-2 rounded text-white font-semibold ${isReady && !error ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
            }`}
          onClick={onConfirm}
        >
          Xác nhận
        </button>
      ) : (
        <p className="text-sm text-gray-600">
          Đã xác nhận lúc {new Date().toLocaleTimeString("vi-VN")}
        </p>
      )}
    </div>
  );
}

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
    const mockHistory = [
      { endKm: 10200 },
      { endKm: 10170 },
      { endKm: 10150 },
    ];
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
          <div>
            {tripInfo && (
              <>
                <h3 className="mt-4 font-semibold text-lg">Hành trình của bạn</h3>
                <p className="mb-2">
                  <b>{tripInfo.distance} km</b>
                </p>
              </>
            )}

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

            {phase === "checked" && (
              <>
                <CheckForm type="checkin" data={checkinData} setData={setCheckinData} lastTripKm={lastTripKm} disabled />
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
