USE LaptopStoreDB;
GO

/* ============================================================================
   MIGRATION: KHUYẾN MÃI THEO CHI TIẾT SẢN PHẨM (CTSP)
   1. Sửa bảng khuyen_mai: thêm loai_giam (1: %, 2: tiền), gia_tri_giam, trang_thai
   2. Sửa bảng chi_tiet_khuyen_mai: chuyển id_sp -> id_ctsp tham chiếu chi_tiet_san_pham
   3. Ràng buộc UNIQUE (id_ctsp, id_khuyen_mai)
   4. Dữ liệu mẫu kiểm thử
   ============================================================================ */

-- 1. CẬP NHẬT BẢNG khuyen_mai
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'khuyen_mai' AND COLUMN_NAME = 'loai_giam')
BEGIN
    ALTER TABLE khuyen_mai ADD loai_giam INT NOT NULL DEFAULT 1;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'khuyen_mai' AND COLUMN_NAME = 'gia_tri_giam')
BEGIN
    ALTER TABLE khuyen_mai ADD gia_tri_giam DECIMAL(18, 2) NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'khuyen_mai' AND COLUMN_NAME = 'trang_thai')
BEGIN
    ALTER TABLE khuyen_mai ADD trang_thai INT DEFAULT 1;
END
GO

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'khuyen_mai' AND COLUMN_NAME = 'phan_tram_giam')
BEGIN
    ALTER TABLE khuyen_mai DROP COLUMN phan_tram_giam;
END
GO

-- 2. CẬP NHẬT BẢNG chi_tiet_khuyen_mai
-- Xóa khóa ngoại cũ nếu có
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_CTKM_SanPham')
BEGIN
    ALTER TABLE chi_tiet_khuyen_mai DROP CONSTRAINT FK_CTKM_SanPham;
END
GO

-- Xóa cột id_sp nếu có
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'chi_tiet_khuyen_mai' AND COLUMN_NAME = 'id_sp')
BEGIN
    ALTER TABLE chi_tiet_khuyen_mai DROP COLUMN id_sp;
END
GO

-- Thêm cột id_ctsp nếu chưa có
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'chi_tiet_khuyen_mai' AND COLUMN_NAME = 'id_ctsp')
BEGIN
    ALTER TABLE chi_tiet_khuyen_mai ADD id_ctsp INT NOT NULL;
END
GO

-- Tạo khóa ngoại mới tới chi_tiet_san_pham
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_CTKM_CTSP')
BEGIN
    ALTER TABLE chi_tiet_khuyen_mai 
    ADD CONSTRAINT FK_CTKM_CTSP FOREIGN KEY (id_ctsp) REFERENCES chi_tiet_san_pham(id) ON DELETE CASCADE;
END
GO

-- Ràng buộc UNIQUE cho cặp (id_ctsp, id_khuyen_mai)
IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_CTKM_CTSP_KM') AND
   NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_CTKM_CTSP_KM')
BEGIN
    ALTER TABLE chi_tiet_khuyen_mai 
    ADD CONSTRAINT UQ_CTKM_CTSP_KM UNIQUE (id_ctsp, id_khuyen_mai);
END
GO

-- 3. DỮ LIỆU MẪU KIỂM THỬ
-- KM001: Giảm 10% (loai_giam = 1, gia_tri_giam = 10)
-- KM002: Giảm 2.000.000đ (loai_giam = 2, gia_tri_giam = 2000000)
IF NOT EXISTS (SELECT 1 FROM khuyen_mai WHERE ma = 'KM001')
BEGIN
    INSERT INTO khuyen_mai (ma, ten_km, loai_giam, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc, trang_thai)
    VALUES ('KM001', N'Khuyến mãi Khai Xuân Giảm 10%', 1, 10.00, DATEADD(day, -5, GETDATE()), DATEADD(day, 30, GETDATE()), 1);
END

IF NOT EXISTS (SELECT 1 FROM khuyen_mai WHERE ma = 'KM002')
BEGIN
    INSERT INTO khuyen_mai (ma, ten_km, loai_giam, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc, trang_thai)
    VALUES ('KM002', N'Tri ân khách hàng Giảm 2.000.000đ', 2, 2000000.00, DATEADD(day, -5, GETDATE()), DATEADD(day, 30, GETDATE()), 1);
END
GO

-- Gán KM001 (giảm 10%) cho CTSP 1 (ASUS TUF A15 Ryzen 5)
-- Gán KM002 (giảm 2tr) cho CTSP 2 (ASUS TUF A15 Ryzen 7)
-- CTSP 3 (Zenbook 14): Không có khuyến mãi
DECLARE @km1Id INT, @km2Id INT;
SELECT @km1Id = id FROM khuyen_mai WHERE ma = 'KM001';
SELECT @km2Id = id FROM khuyen_mai WHERE ma = 'KM002';

IF @km1Id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM chi_tiet_khuyen_mai WHERE id_ctsp = 1 AND id_khuyen_mai = @km1Id)
BEGIN
    INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
    VALUES ('CTKM001', 1, @km1Id);
END

IF @km2Id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM chi_tiet_khuyen_mai WHERE id_ctsp = 2 AND id_khuyen_mai = @km2Id)
BEGIN
    INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
    VALUES ('CTKM002', 2, @km2Id);
END
GO
