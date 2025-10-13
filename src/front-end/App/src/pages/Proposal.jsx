import { useParams } from "react-router-dom";
import { useState } from "react";
import Navbar from "../NavBar";
import VehicleInfo from "../VehicleInfo";

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
  const [method, setMethod] = useState("Theo tỉ lệ sở hữu");
  const [stage, setStage] = useState("form"); // form | detail | success

  const coowners = [
    { username: "username1", ratio: 40 },
    { username: "username2", ratio: 30 },
    { username: "username3", ratio: 30 },
  ];

  const [contributions, setContributions] = useState(
    coowners.map((c) => ({ ...c, percent: c.ratio }))
  );

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // chỉ lấy số
    const formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setAmount(formatted);
  };

  const handleSlider = (index, value) => {
    const newList = [...contributions];
    newList[index].percent = Number(value);
    setContributions(newList);
  };

  const handleSubmit = () => {
    if (method === "Góp quỹ" || method === "Theo tỉ lệ sở hữu") {
      setStage("detail");
    } else if (method === "Tự chi trả") {
      handleFinalSubmit(); // chuyển luôn sang submit
    }
  };



  const handleFinalSubmit = () => setStage("success");

  const total = parseInt(amount.replace(/\./g, "")) || 0;

  return (
    <div>
      <Navbar username="Username" />
      <div className="p-6">
        <VehicleInfo vehicle={vehicle} />

        {stage === "form" && (
          <div>
            <h2>Đề xuất khoản chi cho phương tiện</h2>

            <label>Tên chi phí</label>
            <br />
            <input
              type="text"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
            />
            <br /><br />

            <label>Chi phí</label>
            <br />
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Nhập số tiền"
            />
            <br /><br />

            <label>Cách thức</label>
            <br />
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Theo tỉ lệ sở hữu</option>
              <option>Góp quỹ</option>
              <option>Tự chi trả</option>
            </select>
            <br /><br />

            <button onClick={handleSubmit}>Đề xuất</button>
          </div>
        )}

        {stage === "detail" && (
          <div>
            <h3>{expenseName}</h3>
            <h3>Tỉ lệ chi phí</h3>
            <p>{total.toLocaleString("vi-VN")}đ</p>

            {contributions.map((c, i) => {
              const pay = Math.round((c.percent / 100) * total);
              const isFixed = method === "Theo tỉ lệ sở hữu";
              return (
                <div key={i}>
                  <p>{c.username}</p>
                  <p>{pay.toLocaleString("vi-VN")}đ</p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={c.percent}
                    onChange={(e) => handleSlider(i, e.target.value)}
                    disabled={isFixed}
                  />
                  <input
                    type="number"
                    value={c.percent}
                    onChange={(e) => handleSlider(i, e.target.value)}
                    disabled={isFixed}
                    style={{ width: 60, marginLeft: 8 }}
                  /> %
                </div>
              );
            })}

            <button onClick={() => setStage("form")}>Hủy</button>
            <button onClick={handleFinalSubmit}>Đề xuất</button>
          </div>
        )}

        {stage === "success" && (
          <div>
            <h3>Đã tạo đề xuất thành công!</h3>
            <a href="#">Xem đề xuất</a>
          </div>
        )}
      </div>
    </div>
  );
}
