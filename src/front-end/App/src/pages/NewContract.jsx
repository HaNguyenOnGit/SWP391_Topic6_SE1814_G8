import React, { useState } from "react";
import Navbar from "../NavBar";
import "./newContract.css"
import axios from "axios";

export default function NewContract() {
  const [step, setStep] = useState(1);

  // form 1 state
  const [vehicle, setVehicle] = useState({
    name: "",
    license: "",
    model: ""
  });
  const [errors, setErrors] = useState({});

  // form 2 state
  const [owners, setOwners] = useState([]);
  const [ownerError, setOwnerError] = useState("");
  const [phone, setPhone] = useState("");

  // form 3 state
  const terms = [
    "Các bên phải tuân thủ luật giao thông đường bộ.",
    "Không được tự ý bán hoặc chuyển nhượng khi chưa có sự đồng ý của đồng sở hữu.",
    "Mọi chi phí bảo dưỡng, sửa chữa sẽ được chia theo tỷ lệ sở hữu."
  ];
  const [submitMessage, setSubmitMessage] = useState("");

  // validate license plate VN
  const licenseRegex = /^([0-9]{2}[A-Z]{1,2}-[0-9]{3}\.?[0-9]{2,3})$/;

  // realtime validation
  const validateField = (field, value) => {
    let msg = "";
    if (field === "name" && !value.trim()) {
      msg = "Tên phương tiện không được để trống";
    }
    if (field === "license") {
      if (!value.trim()) msg = "Biển kiểm soát không được để trống";
      else if (!licenseRegex.test(value)) msg = "Biển kiểm soát không đúng định dạng (VD: 30A-12345)";
    }
    if (field === "model" && !value.trim()) {
      msg = "Model không được để trống";
    }
    setErrors(prev => ({ ...prev, [field]: msg }));
  };

  // add owner
  const addOwner = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setOwnerError("Vui lòng nhập số điện thoại");
      return;
    }

    if (owners.some(o => o.phone === trimmedPhone)) {
      setOwnerError("Số điện thoại này đã được thêm");
      return;
    }

    try {
      const res = await axios.get(`/api/user/phone/${trimmedPhone}`);
      if (res.status === 200) {
        const fullName = res.data; // API trả về FullName (string)
        setOwners([...owners, { phone: trimmedPhone, fullName, ratio: 0 }]);
        setPhone("");
        setOwnerError("");
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setOwnerError("Số điện thoại này không tồn tại trong hệ thống");
      } else {
        setOwnerError("Có lỗi khi kiểm tra số điện thoại");
        console.error(err);
      }
    }
  }

  // update ratio
  const updateRatio = (i, val) => {
    const updated = [...owners];
    updated[i].ratio = val;
    setOwners(updated);
  };

  // check tổng tỉ lệ
  const totalRatio = owners.reduce((a, b) => a + b.ratio, 0);
  const ratioError = totalRatio !== 100;

  return (
    <div className="main-container">
      <Navbar username="Username" />
      <div className="main-content">
        <h1>Tạo hợp đồng</h1>

        {step === 1 && (
          <div>
            <h2>Thông tin phương tiện</h2>
            <div>
              <label>Tên phương tiện</label>
              <br></br>
              <input
                className="txtInput"
                type="text"
                value={vehicle.name}
                onChange={e => {
                  setVehicle({ ...vehicle, name: e.target.value });
                  validateField("name", e.target.value);
                }}
              />
              {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
            </div>
            <div>
              <label>Biển kiểm soát</label>
              <br></br>
              <input
                className="txtInput"
                type="text"
                value={vehicle.license}
                placeholder="VD: 30A-12345"
                onChange={e => {
                  setVehicle({ ...vehicle, license: e.target.value });
                  validateField("license", e.target.value);
                }}
              />
              {errors.license && <p style={{ color: "red" }}>{errors.license}</p>}
            </div>
            <div>
              <label>Model</label>
              <br></br>
              <input
                className="txtInput"
                type="text"
                value={vehicle.model}
                onChange={e => {
                  setVehicle({ ...vehicle, model: e.target.value });
                  validateField("model", e.target.value);
                }}
              />
              {errors.model && <p style={{ color: "red" }}>{errors.model}</p>}
            </div>
            <button
              className="btnInput"
              disabled={
                !vehicle.name.trim() ||
                !vehicle.license.trim() ||
                !vehicle.model.trim() ||
                errors.name ||
                errors.license ||
                errors.model
              }
              onClick={() => setStep(2)}
            >
              Tiếp theo
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Thêm người đồng sở hữu</h2>
            <input
              className="txtInput"
              type="text"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <button className="addBtn" onClick={addOwner}>+</button>
            {ownerError && <p style={{ color: "red" }}>{ownerError}</p>}
            <div>
              {owners.map((o, i) => (
                <div key={i} className="pSlider">
                  <span className="pSlider-name">
                    {o.fullName}
                  </span>
                  <br />
                  <input
                    className="slider"
                    type="range"
                    min="0"
                    max="100"
                    value={o.ratio}
                    onChange={e => updateRatio(i, Number(e.target.value))}
                  />
                  <input
                    className="pTxtInput"
                    type="number"
                    min="0"
                    max="100"
                    value={o.ratio}
                    onChange={e => updateRatio(i, Number(e.target.value))}
                    style={{ width: "50px", marginLeft: "8px" }}
                  />
                  <span>%</span>
                </div>
              ))}
            </div>
            {ratioError && (
              <p style={{ color: "red" }}>Tổng tỉ lệ phải bằng 100% (hiện tại {totalRatio}%)</p>
            )}

            <button className="btnReturn" onClick={() => setStep(1)}>Quay lại</button>
            <button
              className="btnInput"
              disabled={owners.length === 0 || ratioError}
              onClick={() => setStep(3)}
            >
              Tiếp theo
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Điều khoản hợp đồng</h2>
            <ul style={{ padding: "20px 0 30px 25px" }}>
              {terms.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <button className="btnReturn" onClick={() => setStep(2)}>Quay lại</button>
            <button
              className="btnInput"
              disabled={terms.length === 0 || owners.length === 0 || totalRatio !== 100}
              onClick={async () => {
                setSubmitMessage(""); // reset message
                try {
                  // Build members exactly like teammate's JSON
                  const members = owners.map(o => ({
                    PhoneNumber: o.phone,
                    SharePercent: o.ratio.toFixed(2) // string like "60.00"
                  }));

                  // Build contract JSON
                  const contractData = {
                    VehicleName: vehicle.name,
                    LicensePlate: vehicle.license,
                    Model: vehicle.model,
                    StartDate: new Date().toISOString().split("T")[0], // "YYYY-MM-DD"
                    Status: "Pending",
                    Members: members
                  };

                  // Call backend API
                  const res = await axios.post("/api/contract/contractRequest", contractData);

                  console.log("Tạo hợp đồng thành công:", res.data);
                  setSubmitMessage("Tạo hợp đồng thành công!");
                  setStep(4); // move to confirmation step
                } catch (err) {
                  console.error("Lỗi khi tạo hợp đồng:", err.response?.data || err.message);
                  setSubmitMessage("Có lỗi khi tạo hợp đồng. Vui lòng thử lại!");
                }
              }}
            >
              Xác nhận
            </button>
            {submitMessage && (
              <p
                style={{
                  marginTop: "10px",
                  color: submitMessage.includes("thành công") ? "green" : "red"
                }}
              >
                {submitMessage}
              </p>
            )}

          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ color: "#4caf50" }}>Hợp đồng đã được khởi tạo</h2>
            <p style={{ padding: "10px 0 30px 0" }}>
              Hợp đồng sẽ được kích hoạt khi các thành viên trong hợp đồng xác nhận.
            </p>
            <button className="btnInput" onClick={() => alert("Đã xác nhận!")}>Xác nhận</button>
          </div>
        )}
      </div>
    </div>
  );
}