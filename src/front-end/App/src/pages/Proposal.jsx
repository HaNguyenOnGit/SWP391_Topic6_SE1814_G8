import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
export default function Proposal() {
  const { id } = useParams(); // ContractId
  const { userId } = useAuth(); // user đăng nhập thật
  const [vehicle, setVehicle] = useState(null);
  const [coowners, setCoowners] = useState([]);

  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [stage, setStage] = useState("form"); // form | detail | success
  const [percentError, setPercentError] = useState("");
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1) Lấy thông tin hợp đồng & đồng sở hữu thật
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`/api/contract/contract-detail/${id}`);
        const data = res.data;

        setVehicle({
          id: data.contractId,
          name: data.vehicleName,
          plate: data.licensePlate,
          model: data.model,
          status: translateStatus(data.status),
        });

        const members = (data.members || []).map((m) => ({
          userId: m.userId,
          username: m.fullName,
          ratio: m.sharePercent,
          percent: m.sharePercent, // mặc định = tỉ lệ sở hữu
        }));

        setCoowners(members);
        setContributions(members);
      } catch (err) {
        console.error("❌ Lỗi khi tải thông tin phương tiện:", err);
        alert("Không thể tải dữ liệu phương tiện!");
      }
    };
    fetchVehicle();
  }, [id]);

  // 2) Hàm dịch trạng thái
  const translateStatus = (status) => {
    switch (status) {
      case "Active":
        return "Đang sử dụng";
      case "Available":
        return "Đang trống";
      case "Inactive":
        return "Chưa kích hoạt hợp đồng";
      default:
        return status;
    }
  };

  // 3) Chọn cách tính phân bổ
  const handleMethodChange = async (e) => {
    const value = e.target.value;
    setMethod(value);

    if (value === "Theo lượng sử dụng") {
      try {
        const res = await axios.get(`/api/usage/ratio/${id}`);
        // backend trả dạng [{ userId, username, percent }] hoặc tương tự
        setContributions(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu lượng sử dụng:", err);
        alert("Không thể lấy dữ liệu lượng sử dụng!");
      }
    } else if (value === "Theo tỉ lệ sở hữu") {
      setContributions(coowners.map((c) => ({ ...c, percent: c.ratio })));
    }
  };

  // 4) Gửi đề xuất chi tiêu lên backend
  const handleFinalSubmit = async () => {
    if (!expenseName.trim() || !amount.trim() || !method.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const totalPercent = contributions.reduce((sum, c) => sum + (Number(c.percent) || 0), 0);
    if (totalPercent !== 100) {
      alert("Tổng tỉ lệ phải bằng 100%!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        contractId: Number(id),
        proposedBy: userId || 1, // fallback nếu chưa có auth context
        description: expenseName,
        expectedAmount: Number(String(amount).replace(/\./g, "")) || 0,
        allocationRule: convertRule(method),
        allocations: contributions.map((c) => ({
          userId: c.userId,
          percent: Number(c.percent) || 0,
        })),
      };

      const res = await axios.post("/api/proposal/create", payload);
      console.log("✅ Proposal created:", res.data);
      setStage("success");
    } catch (err) {
      // show detailed error in console to debug
      console.error("❌ Lỗi khi tạo đề xuất:", err.response?.data || err.message);
      // user-facing message
      alert("Không thể tạo đề xuất, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // 5) Mapping FE → BE cho allocationRule
  const convertRule = (value) => {
    switch (value) {
      case "Theo tỉ lệ sở hữu":
        return "ByShare";
      case "Theo lượng sử dụng":
        return "ByUsage";
      case "Góp quỹ":
        return "Equal";
      case "Tự chi trả":
        return "Self";
      default:
        return "Custom";
    }
  };

  // 6) Format tiền
  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setAmount(formatted);
  };

  // 7) Điều chỉnh phần trăm từng người
  const handleSlider = (index, value) => {
    const newList = [...contributions];
    newList[index].percent = Number(value);
    setContributions(newList);

    const totalPercent = newList.reduce((sum, c) => sum + (Number(c.percent) || 0), 0);
    setPercentError(totalPercent > 100 ? "Tổng tỉ lệ không được vượt quá 100%" : "");
  };

  // 8) Xử lý nút “Đề xuất”
  const handleSubmit = () => {
    if (!expenseName.trim() || !amount.trim() || !method.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
      return;
    }

    if (["Góp quỹ", "Theo tỉ lệ sở hữu", "Theo lượng sử dụng"].includes(method)) {
      setStage("detail");
    } else {
      handleFinalSubmit(); // Tự chi trả => gửi luôn
    }
  };

  const total = Number(String(amount).replace(/\./g, "")) || 0;
  const isFormValid = expenseName.trim() && amount.trim() && method.trim();

  if (!vehicle) return <h2>Đang tải dữ liệu phương tiện...</h2>;

  return (
    <div className="main-container">
      <Navbar username="Username" />
      <div className="main-content">
        <div className="main-content-layout">
          <VehicleInfo vehicle={vehicle} />
          <div>
            {/* Use Link to go to ProposalList (SPA navigation) */}
            <Link style={{ color: "#ff9800", display: "inline-block", marginBottom: 12 }} to={`/vehicle/${id}/proposals`}>
              Xem đề xuất
            </Link>

            {/* Giao diện nhập thông tin */}
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
                <select className="txtInput" value={method} onChange={handleMethodChange}>
                  <option value="">-- Chọn cách thức --</option>
                  <option>Theo tỉ lệ sở hữu</option>
                  <option>Góp quỹ</option>
                  <option>Tự chi trả</option>
                  <option>Theo lượng sử dụng</option>
                </select><br /><br />

                <button
                  className="btnInput"
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  style={{
                    opacity: isFormValid ? 1 : 0.5,
                    cursor: isFormValid ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? "Đang gửi..." : "Đề xuất"}
                </button>
              </div>
            )}

            {/* Chi tiết phân bổ */}
            {stage === "detail" && (
              <div>
                <h1>{expenseName}</h1>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2>Tỉ lệ chi phí</h2>
                  <p style={{ color: "#4caf50", fontWeight: "700", margin: "10px 0 20px 0" }}>
                    {total.toLocaleString("vi-VN")}đ
                  </p>
                </div>

                {contributions.map((c, i) => {
                  const pay = Math.round(((Number(c.percent) || 0) / 100) * total);
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

                <button className="btnReturn" onClick={() => setStage("form")}>
                  Quay lại
                </button>
                <button
                  className="btnInput"
                  onClick={handleFinalSubmit}
                  disabled={!!percentError || loading}
                >
                  {loading ? "Đang gửi..." : "Xác nhận đề xuất"}
                </button>
              </div>
            )}

            {/* Thành công */}
            {stage === "success" && (
              <div>
                <h3 style={{ color: "#4caf50" }}>✅ Đã tạo đề xuất thành công!</h3>
                <Link to={`/vehicle/${id}/proposals`} style={{ color: "#ff9800", display: "block", marginTop: 12 }}>
                  Xem danh sách đề xuất
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
