import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import "./newContract.css"
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

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
  const { user } = useAuth();

  // Ensure the current authenticated user is included as a co-owner by default
  // and cannot be removed.
  useEffect(() => {
    if (!user) return;
    const phoneNum = user.phoneNumber || user.PhoneNumber || user.phone || user.Phone || null;
    if (!phoneNum) return;
    setOwners((prev) => {
      if (prev.some((o) => o.phone === phoneNum)) return prev;
      const fullName = user.fullName || user.FullName || user.fullname || phoneNum;
      // mark locked so UI won't show delete control for this owner
      return [{ phone: phoneNum, fullName, ratio: 0, locked: true }, ...prev];
    });
  }, [user]);

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
        setOwners(prev => [...prev, { phone: trimmedPhone, fullName, ratio: 0 }]);
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
        <div className="main-inner">
          <h1>Tạo hợp đồng</h1>

          {/* Stepper */}
          <div className="nc-steps">
            <div className={`nc-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
              <span>1</span>
              <p>Phương tiện</p>
            </div>
            <div className={`nc-line ${step > 1 ? 'done' : ''}`}></div>
            <div className={`nc-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
              <span>2</span>
              <p>Đồng sở hữu</p>
            </div>
            <div className={`nc-line ${step > 2 ? 'done' : ''}`}></div>
            <div className={`nc-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`}>
              <span>3</span>
              <p>Điều khoản</p>
            </div>
            <div className={`nc-line ${step > 3 ? 'done' : ''}`}></div>
            <div className={`nc-step ${step >= 4 ? 'active' : ''}`}>
              <span>4</span>
              <p>Hoàn tất</p>
            </div>
          </div>

          {/* Two-column layout: form + live preview */}
          <div className="nc-layout">
            <div className="nc-left">

              {step === 1 && (
                <div className="nc-section">
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
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
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
                </div>
              )}

              {step === 2 && (
                <div className="nc-section">
                  <h2>Thêm người đồng sở hữu</h2>
                  <div className="phone-row">
                    <input
                      className="txtInput"
                      type="text"
                      placeholder="Nhập số điện thoại"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                    <button className="addBtn" onClick={addOwner}>+</button>
                  </div>
                  {ownerError && <p style={{ color: "red" }}>{ownerError}</p>}
                  <div>
                    {owners.map((o, i) => (
                      <div key={i} className="pSlider" style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="pSlider-name" style={{ fontWeight: 500 }}>
                            {o.fullName}
                            {o.locked && (
                              <span style={{ fontSize: 12, color: '#666', marginLeft: 6 }}>(Bạn)</span>
                            )}
                          </span>
                          {!o.locked && (
                            <span
                              style={{
                                cursor: "pointer",
                                color: "red",
                                fontWeight: "bold",
                                fontSize: "16px",
                                lineHeight: "1",
                                marginTop: "-2px"
                              }}
                              onClick={() => setOwners(owners.filter((_, idx) => idx !== i))}
                            >
                              ✕
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
                          <input
                            className="slider"
                            type="range"
                            min="0"
                            max="100"
                            value={o.ratio}
                            onChange={e => updateRatio(i, Number(e.target.value))}
                          />
                          <div style={{ display: "flex", alignItems: "center", marginLeft: "8px", gap: "2px" }}>
                            <input
                              className="pTxtInput"
                              type="number"
                              min="0"
                              max="100"
                              value={o.ratio === 0 ? 0 : String(o.ratio).replace(/^0+(?=\d)/, "")}
                              onChange={e => {
                                let v = e.target.value.replace(/^0+(?=\d)/, "");
                                if (v === "") v = "0";
                                if (Number(v) > 100) v = "100";
                                updateRatio(i, Number(v));
                              }}
                            />
                            <span style={{ fontSize: "25px", fontWeight: 500 }}>%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {ratioError && (
                    <p style={{ color: "red" }}>Tổng tỉ lệ phải bằng 100% (hiện tại {totalRatio}%)</p>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
                    <button className="btnReturn" onClick={() => setStep(1)}>Quay lại</button>
                    <button
                      className="btnInput"
                      disabled={owners.length === 0 || ratioError}
                      onClick={() => setStep(3)}
                    >
                      Tiếp theo
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="nc-section">
                  <h2>Điều khoản hợp đồng</h2>
                  <ul style={{ padding: "20px 0 30px 25px" }}>
                    {terms.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
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
                  </div>
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
                <div className="nc-section">
                  <h2 style={{ color: "#4caf50" }}>Hợp đồng đã được khởi tạo</h2>
                  <p style={{ padding: "10px 0 30px 0" }}>
                    Hợp đồng sẽ được kích hoạt khi các thành viên trong hợp đồng xác nhận.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <button className="btnInput" onClick={() => alert("Đã xác nhận!")}>Xác nhận</button>
                  </div>
                </div>
              )}

            </div>

            {/* Live Preview */}
            <aside className="nc-right">
              <div className="nc-card">
                <div className="nc-card-header">
                  <div className="nc-badge">Xem trước</div>
                  <div className="nc-card-title">{vehicle.name || 'Tên phương tiện'}</div>
                  <div className="nc-card-sub">{vehicle.model || 'Model'}</div>
                </div>
                <div className="nc-card-body">
                  <div className="nc-row">
                    <span className="nc-label">Biển số</span>
                    <span className="nc-value">{vehicle.license || 'VD: 30A-12345'}</span>
                  </div>
                  <div className="nc-row">
                    <span className="nc-label">Số đồng sở hữu</span>
                    <span className="nc-value">{owners.length}</span>
                  </div>
                  <div className="nc-row">
                    <span className="nc-label">Tổng tỷ lệ</span>
                    <span className={`nc-value ${ratioError ? 'warn' : ''}`}>{totalRatio}%</span>
                  </div>
                  <div className="nc-miniowners">
                    {owners.slice(0, 4).map((o, i) => (
                      <div key={i} className="nc-chip">{o.fullName.split(' ').slice(-1)[0]} • {o.ratio}%</div>
                    ))}
                    {owners.length > 4 && (
                      <div className="nc-chip">+{owners.length - 4} nữa</div>
                    )}
                  </div>
                  <br />
                </div>
                <div className="nc-card-footer">
                  <div className={`nc-status-pill ${ratioError ? 'error' : 'ok'}`}>
                    {ratioError ? 'Chưa hợp lệ' : 'Sẵn sàng tạo'}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}