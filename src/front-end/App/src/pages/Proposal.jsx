import { useParams } from "react-router-dom";
import { useState } from "react";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import axios from "axios";


export default function Proposal() {
  const { id } = useParams();

  const vehicles = [
    { id: "1", name: "Xe Honda City", plate: "59D3 - 23456", status: "Đang sử dụng" },
    { id: "2", name: "Xe Toyota Vios", plate: "60A - 56789", status: "Đang trống" },
    { id: "3", name: "Xe Ford Ranger", plate: "61C - 11122", status: "Chưa kích hoạt hợp đồng" },
  ];
  const vehicle = vehicles.find((v) => v.id === id);

  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [stage, setStage] = useState("form");
  const [percentError, setPercentError] = useState("");

  const coowners = [
    { username: "username1", ratio: 40 },
    { username: "username2", ratio: 30 },
    { username: "username3", ratio: 30 },
  ];

  const [contributions, setContributions] = useState(
    coowners.map((c) => ({ ...c, percent: c.ratio }))
  );

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setAmount(formatted);
  };

  const handleSlider = (index, value) => {
    const newList = [...contributions];
    newList[index].percent = Number(value);
    setContributions(newList);

    const totalPercent = newList.reduce((sum, c) => sum + c.percent, 0);

    if (totalPercent > 100) {
      setPercentError("Tổng tỉ lệ không được vượt quá 100%");
    } else {
      setPercentError("");
    }
  };

  const handleMethodChange = async (e) => {
    const value = e.target.value;
    setMethod(value);

    if (value === "Theo lượng sử dụng") {
      try {
        const res = await axios.get(`/api/usage/ratio/${id}`);
        setContributions(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu lượng sử dụng:", err);
      }
    } else if (value === "Theo tỉ lệ sở hữu") {
      setContributions(coowners.map((c) => ({ ...c, percent: c.ratio })));
    }
  };

  const handleSubmit = () => {
    if (!expenseName.trim() || !amount.trim() || !method.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
      return;
    }

    if (["Góp quỹ", "Theo tỉ lệ sở hữu", "Theo lượng sử dụng"].includes(method)) {
      setStage("detail");
    } else if (method === "Tự chi trả") {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => setStage("success");

  const total = parseInt(amount.replace(/\./g, "")) || 0;

  // Kiểm tra đủ dữ liệu để bật nút
  const isFormValid = expenseName.trim() !== "" && amount.trim() !== "" && method.trim() !== "";

  return (
    <div className="main-container">
      <Navbar username="Username" />
      <div className="main-content">
        <div className="main-content-layout">
          <VehicleInfo vehicle={vehicle} />
          <div>
            <a style={{ color: "#ff9800" }} href={`/vehicle/${id}/proposals`}>Xem đề xuất</a>
            {stage === "form" && (
              <div>
                <h1>Đề xuất khoản chi cho phương tiện</h1>

                <label>Tên chi phí</label><br />
                <input
                  className="txtInput"
                  type="text"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                /><br /><br />

                <label>Chi phí</label><br />
                <input
                  className="txtInput"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Nhập số tiền"
                /><br /><br />

                <label>Cách thức</label><br />
                <select
                  className="txtInput"
                  value={method}
                  onChange={handleMethodChange}
                >
                  <option value="">-- Chọn cách thức --</option>
                  <option>Theo tỉ lệ sở hữu</option>
                  <option>Góp quỹ</option>
                  <option>Tự chi trả</option>
                  <option>Theo lượng sử dụng</option>
                </select><br /><br />

                <button
                  className="btnInput"
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  style={{
                    opacity: isFormValid ? 1 : 0.5,
                    cursor: isFormValid ? "pointer" : "not-allowed",
                  }}
                >
                  Đề xuất
                </button>
              </div>
            )}

            {stage === "detail" && (
              <div>
                <h1>{expenseName}</h1>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2>Tỉ lệ chi phí</h2>
                  <p style={{ color: "#4caf50", fontWeight: "700", margin: "10px 0 20px 0" }}>
                    {total.toLocaleString("vi-VN")}đ
                  </p>
                </div>

                {contributions.map((c, i) => {
                  const pay = Math.round((c.percent / 100) * total);
                  const disabled = ["Theo tỉ lệ sở hữu", "Theo lượng sử dụng"].includes(method);
                  return (
                    <div key={i} className="pSlider">
                      <p className="pSlider-name">{c.username}</p>
                      <p>{pay.toLocaleString("vi-VN")}đ</p>
                      <input
                        className="slider"
                        type="range"
                        min="0"
                        max="100"
                        value={c.percent}
                        onChange={(e) => handleSlider(i, e.target.value)}
                        disabled={disabled}
                      />
                      <input
                        type="number"
                        value={c.percent}
                        onChange={(e) => handleSlider(i, e.target.value)}
                        disabled={disabled}
                        style={{ width: 60, marginLeft: 8 }}
                      /> %
                    </div>
                  );
                })}
                {percentError && (
                  <p style={{ color: "red", fontWeight: "bold", marginTop: 10 }}>
                    {percentError}
                  </p>
                )}

                <button className="btnReturn" onClick={() => setStage("form")}>Hủy</button>
                <button
                  className="btnInput"
                  onClick={handleFinalSubmit}
                  disabled={!!percentError} // vô hiệu hóa nếu có lỗi
                >
                  Đề xuất
                </button>
              </div>
            )}

            {stage === "success" && (
              <div>
                <h3 style={{ color: "#4caf50" }}>Đã tạo đề xuất thành công!</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
