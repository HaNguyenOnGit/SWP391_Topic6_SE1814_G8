using System;
using System.Collections.Generic;

namespace DataAccessLayer.Entities;

public partial class Settlement
{
    public int SettlementId { get; set; }

    public int AllocationId { get; set; }

    public int PayerId { get; set; }

    public int ReceiverId { get; set; }

    public decimal Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string Method { get; set; } = null!;

    public string? Reference { get; set; }

    // Thêm property lưu đường dẫn ảnh xác nhận thanh toán
    public string? ProofImageUrl { get; set; }

    // Thêm property Status để fix lỗi truy cập trạng thái
    public string Status { get; set; } = null!;

    public virtual ExpenseAllocation Allocation { get; set; } = null!;

    public virtual User Payer { get; set; } = null!;

    public virtual User Receiver { get; set; } = null!;
}
