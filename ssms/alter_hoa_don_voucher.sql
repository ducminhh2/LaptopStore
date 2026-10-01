USE LaptopStoreDB;
GO

-- 1. Thêm cột id_voucher nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'hoa_don' AND COLUMN_NAME = 'id_voucher'
)
BEGIN
    ALTER TABLE hoa_don ADD id_voucher INT NULL;
    PRINT 'Đã thêm cột id_voucher vào bảng hoa_don.';
END
ELSE
BEGIN
    PRINT 'Cột id_voucher đã tồn tại trong bảng hoa_don.';
END
GO

-- 2. Thêm cột tien_giam_voucher nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'hoa_don' AND COLUMN_NAME = 'tien_giam_voucher'
)
BEGIN
    ALTER TABLE hoa_don ADD tien_giam_voucher DECIMAL(18,2) NOT NULL CONSTRAINT DF_HoaDon_TienGiamVoucher DEFAULT 0;
    PRINT 'Đã thêm cột tien_giam_voucher vào bảng hoa_don.';
END
ELSE
BEGIN
    PRINT 'Cột tien_giam_voucher đã tồn tại trong bảng hoa_don.';
END
GO

-- 3. Thêm khóa ngoại FK_HoaDon_Voucher nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_HoaDon_Voucher'
)
BEGIN
    ALTER TABLE hoa_don ADD CONSTRAINT FK_HoaDon_Voucher 
    FOREIGN KEY (id_voucher) REFERENCES voucher(id);
    PRINT 'Đã thêm khóa ngoại FK_HoaDon_Voucher liên kết hoa_don(id_voucher) -> voucher(id).';
END
ELSE
BEGIN
    PRINT 'Khóa ngoại FK_HoaDon_Voucher đã tồn tại.';
END
GO
