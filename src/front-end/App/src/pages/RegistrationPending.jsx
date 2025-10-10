import React from "react";

export default function RegistrationPending() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="bg-white shadow-md p-6 rounded-xl text-center">
                <h2 className="text-2xl font-semibold text-green-600 mb-3">
                    Đăng ký thành công!
                </h2>
                <p>
                    Tài khoản của bạn đang được xác minh. Vui lòng kiểm tra email để xác
                    nhận kích hoạt.
                </p>
            </div>
        </div>
    );
}
