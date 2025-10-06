import { useParams } from "react-router-dom";
import Navbar from "../NavBar";

export default function PaymentHistory() {
    const { id } = useParams();

    const vehicles = [
        { id: "1", name: "Xe Honda City", plate: "59D3 - 23456", status: "Đang sử dụng" },
        { id: "2", name: "Xe Toyota Vios", plate: "60A - 56789", status: "Đang trống" },
        { id: "3", name: "Xe Ford Ranger", plate: "61C - 11122", status: "Chưa kích hoạt hợp đồng" },
    ];

    const payment = [

    ];

    const vehicle = vehicles.find((v) => v.id === id);
    return (
        <div>
            <Navbar username="Username" />
            <div className="p-6">
                <VehicleInfo vehicle={vehicle} />
            </div>
        </div>
    )
}