import React, { useState } from "react";
import Navbar from "../NavBar";

export default function UserProfile() {
    const [user, setUser] = useState({
        fullName: "Nguyen Van A",
        phone: "0901234567",
        email: "nguyenvana@example.com",
        cccd: "123456789012",
        license: "B2",
        bankName: "Vietcombank",
        bankAccount: "0123456789",
    });

    const [section, setSection] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [form, setForm] = useState({});
    const [message, setMessage] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const sendOtp = () => {
        setOtpSent(true);
        setOtpVerified(false);
        setMessage("OTP sent to your email!");
    };

    const verifyOtp = () => {
        if (otp === "123456") {
            setOtpVerified(true);
            setMessage("OTP verified ✅");
        } else {
            setMessage("Invalid OTP ❌");
        }
    };

    const handleSubmit = (type) => {
        if (!otpVerified) return setMessage("Please verify OTP first!");
        if (type === "password") {
            if (form.newPwd !== form.confirmPwd) return setMessage("Passwords do not match!");
            setMessage("Password updated successfully ✅");
        } else if (type === "bank") {
            setUser({ ...user, bankName: form.bankName, bankAccount: form.bankAccount });
            setMessage("Bank info updated ✅");
        }
        setOtpVerified(false);
        setOtpSent(false);
        setForm({});
    };

    return (
        <div>
            <Navbar username="Username" />
            <div className="max-w-xl mx-auto p-6 border rounded-2xl shadow-sm space-y-6">
                <h2 className="text-2xl font-bold">User Profile</h2>

                {/* Personal Info */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">Personal Info</h3>
                    <p><b>Full name:</b> {user.fullName}</p>
                    <p><b>Phone:</b> {user.phone}</p>
                    <p><b>Email:</b> {user.email}</p>
                    <p><b>CCCD:</b> {user.cccd}</p>
                    <p><b>License:</b> {user.license}</p>
                </div>

                {/* Bank Info */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">Bank Info</h3>
                    {section !== "bank" ? (
                        <>
                            <p><b>Bank:</b> {user.bankName}</p>
                            <p><b>Account:</b> {user.bankAccount}</p>
                            <button className="text-blue-600 underline" onClick={() => setSection("bank")}>
                                Edit Bank Info
                            </button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <input name="bankName" placeholder="Bank Name" onChange={handleChange} className="border p-2 w-full" />
                            <input name="bankAccount" placeholder="Bank Account" onChange={handleChange} className="border p-2 w-full" />
                            {!otpSent ? (
                                <button onClick={sendOtp} className="bg-blue-500 text-white px-4 py-2 rounded">Send OTP</button>
                            ) : !otpVerified ? (
                                <>
                                    <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="border p-2 w-full" />
                                    <button onClick={verifyOtp} className="bg-green-500 text-white px-4 py-2 rounded">Verify OTP</button>
                                </>
                            ) : (
                                <button onClick={() => handleSubmit("bank")} className="bg-green-600 text-white px-4 py-2 rounded">Save Changes</button>
                            )}
                        </div>
                    )}
                </div>

                {/* Change Password */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">Change Password</h3>
                    {section !== "password" ? (
                        <button className="text-blue-600 underline" onClick={() => setSection("password")}>
                            Change Password
                        </button>
                    ) : (
                        <div className="space-y-2">
                            {!otpSent ? (
                                <button onClick={sendOtp} className="bg-blue-500 text-white px-4 py-2 rounded">Send OTP</button>
                            ) : !otpVerified ? (
                                <>
                                    <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="border p-2 w-full" />
                                    <button onClick={verifyOtp} className="bg-green-500 text-white px-4 py-2 rounded">Verify OTP</button>
                                </>
                            ) : (
                                <>
                                    <input type="password" name="newPwd" placeholder="New Password" onChange={handleChange} className="border p-2 w-full" />
                                    <input type="password" name="confirmPwd" placeholder="Confirm New Password" onChange={handleChange} className="border p-2 w-full" />
                                    <button onClick={() => handleSubmit("password")} className="bg-green-600 text-white px-4 py-2 rounded">Update Password</button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {message && <p className="text-center text-sm mt-4">{message}</p>}
            </div>
        </div>
    );
}
