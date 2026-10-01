-- ============================================================================
-- SCRIPT TẠO BẢNG VOUCHER (QUẢN LÝ VOUCHER HÓA ĐƠN)
-- Thiết kế độc lập hoàn toàn với KhuyenMai sản phẩm
-- ============================================================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'voucher')
BEGIN
    CREATE TABLE voucher (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ma VARCHAR(50) UNIQUE NOT NULL,
        ten_voucher NVARCHAR(200) NOT NULL,
        loai_giam INT NOT NULL,                     -- 1: Giảm theo phần trăm (%), 2: Giảm theo số tiền (VNĐ)
        gia_tri_giam DECIMAL(18,2) NOT NULL,        -- % hoặc số tiền
        gia_tri_don_toi_thieu DECIMAL(18,2) NOT NULL DEFAULT 0, -- Giá trị đơn tối thiểu để áp dụng
        giam_toi_da DECIMAL(18,2) NULL,             -- Mức giảm tối đa (chỉ dùng cho loại %, loại tiền để NULL)
        ngay_bat_dau DATETIME NOT NULL,             -- Ngày giờ bắt đầu áp dụng
        ngay_ket_thuc DATETIME NOT NULL,            -- Ngày giờ kết thúc áp dụng
        trang_thai INT NOT NULL DEFAULT 1           -- 0: Ngừng hoạt động, 1: Hoạt động
    );

    PRINT N'Bảng voucher đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT N'Bảng voucher đã tồn tại.';
END
GO
