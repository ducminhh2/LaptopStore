USE LaptopStoreDB;
GO

-- 1. Ensure Customers exist
IF NOT EXISTS (SELECT 1 FROM nguoi_dung WHERE dien_thoai = '0862720415')
BEGIN
    INSERT INTO nguoi_dung (ma, ten, username, password, dia_chi, dien_thoai, email, id_vai_tro)
    VALUES ('KH004', N'Lê Minh C', 'leminhc', '$2a$10$Tl6e5ImTgJal6YCfdBdwTedgC1B399gYlIN1odGDefx1Yzxn0Yv4.', N'123 Nguyễn Trãi, Hà Nội', '0862720415', 'leminhc@gmail.com', 3);
END

IF NOT EXISTS (SELECT 1 FROM nguoi_dung WHERE dien_thoai = '0987654321' AND ten = N'Trần Thị B')
BEGIN
    INSERT INTO nguoi_dung (ma, ten, username, password, dia_chi, dien_thoai, email, id_vai_tro)
    VALUES ('KH005', N'Trần Thị B', 'tranthib', '$2a$10$Tl6e5ImTgJal6YCfdBdwTedgC1B399gYlIN1odGDefx1Yzxn0Yv4.', N'456 Kim Mã, Hà Nội', '0987654321', 'tranthib@gmail.com', 3);
END

IF NOT EXISTS (SELECT 1 FROM nguoi_dung WHERE dien_thoai = '0912345678' AND ten = N'Phạm Thị D')
BEGIN
    INSERT INTO nguoi_dung (ma, ten, username, password, dia_chi, dien_thoai, email, id_vai_tro)
    VALUES ('KH006', N'Phạm Thị D', 'phamthid', '$2a$10$Tl6e5ImTgJal6YCfdBdwTedgC1B399gYlIN1odGDefx1Yzxn0Yv4.', N'789 Giải Phóng, Hà Nội', '0912345678', 'phamthid@gmail.com', 3);
END

IF NOT EXISTS (SELECT 1 FROM nguoi_dung WHERE dien_thoai = '0387654321')
BEGIN
    INSERT INTO nguoi_dung (ma, ten, username, password, dia_chi, dien_thoai, email, id_vai_tro)
    VALUES ('KH007', N'Hoàng Văn E', 'hoangvane', '$2a$10$Tl6e5ImTgJal6YCfdBdwTedgC1B399gYlIN1odGDefx1Yzxn0Yv4.', N'101 Hoàng Hoa Thám, Hà Nội', '0387654321', 'hoangvane@gmail.com', 3);
END
GO

-- 2. Update HD001
DECLARE @tt1Id INT, @kh1Id INT;
SELECT TOP 1 @kh1Id = id FROM nguoi_dung WHERE ten LIKE N'%Nguyễn Văn A%' OR id = 1;

IF EXISTS (SELECT 1 FROM hoa_don WHERE ma = 'HD001')
BEGIN
    SELECT @tt1Id = id_thanh_toan FROM hoa_don WHERE ma = 'HD001';
    IF @tt1Id IS NOT NULL
    BEGIN
        UPDATE thanh_toan 
        SET phuong_thuc = 'COD', so_tien = 24490000, trang_thai = 0, ngay_thanh_toan = NULL
        WHERE id = @tt1Id;
    END
    UPDATE hoa_don 
    SET ten_nguoi_nhan = N'Nguyễn Văn A', dien_thoai = '0901234567', dia_chi = N'123 Cầu Giấy, Hà Nội',
        trang_thai = 0, ngay_tao = '2026-09-28 10:15:00', moTa = N'Giao hàng giờ hành chính', id_nhan_vien = NULL
    WHERE ma = 'HD001';
END
GO

-- 3. Insert or update HD002 (Trần Thị B - 32.990.000 - Chuyển khoản - Đã xác nhận [1] - Đã thanh toán [1])
DECLARE @tt2Id INT, @kh2Id INT, @hd2Id INT, @nvId INT;
SELECT TOP 1 @nvId = id FROM nguoi_dung WHERE id_vai_tro = 2;
IF @nvId IS NULL SET @nvId = 4;
SELECT TOP 1 @kh2Id = id FROM nguoi_dung WHERE dien_thoai = '0987654321';
IF @kh2Id IS NULL SET @kh2Id = 1;

IF NOT EXISTS (SELECT 1 FROM hoa_don WHERE ma = 'HD002')
BEGIN
    INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
    VALUES ('TT002', N'Chuyển khoản', 32990000, 1, '2026-09-28 14:20:00');
    SET @tt2Id = SCOPE_IDENTITY();

    INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
    VALUES ('HD002', @kh2Id, N'456 Kim Mã, Hà Nội', '0987654321', '2026-09-28 14:20:00', N'Trần Thị B', 1, @tt2Id, @nvId, N'Đã chuyển khoản qua Vietcombank');
    SET @hd2Id = SCOPE_IDENTITY();

    INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
    VALUES ('CTHD_HD002_1', @hd2Id, 2, 1, 32990000);
END
GO

-- 4. Insert or update HD003 (Lê Minh C - 45.980.000 - COD - Đang giao hàng [2] - Chưa thanh toán [0])
DECLARE @tt3Id INT, @kh3Id INT, @hd3Id INT, @nvId INT, @cthd3Id INT;
SELECT TOP 1 @nvId = id FROM nguoi_dung WHERE id_vai_tro = 2;
IF @nvId IS NULL SET @nvId = 4;
SELECT TOP 1 @kh3Id = id FROM nguoi_dung WHERE dien_thoai = '0862720415';
IF @kh3Id IS NULL SET @kh3Id = 1;

IF NOT EXISTS (SELECT 1 FROM hoa_don WHERE ma = 'HD003')
BEGIN
    INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
    VALUES ('TT003', 'COD', 45980000, 0, NULL);
    SET @tt3Id = SCOPE_IDENTITY();

    INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
    VALUES ('HD003', @kh3Id, N'123 Nguyễn Trãi, Hà Nội', '0862720415', '2026-09-27 16:30:00', N'Lê Minh C', 2, @tt3Id, @nvId, N'Giao giờ hành chính');
    SET @hd3Id = SCOPE_IDENTITY();

    INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
    VALUES ('CTHD_HD003_1', @hd3Id, 1, 2, 22990000);
    SET @cthd3Id = SCOPE_IDENTITY();

    -- Gán 2 IMEI cho CTHD này:
    INSERT INTO chi_tiet_hoa_don_imei (id_chi_tiet_hoa_don, id_imei)
    VALUES (@cthd3Id, 1), (@cthd3Id, 2);
END
GO

-- 5. Insert or update HD004 (Phạm Thị D - 22.990.000 - COD - Hoàn thành [3] - Đã thanh toán [1])
DECLARE @tt4Id INT, @kh4Id INT, @hd4Id INT, @nvId INT, @cthd4Id INT;
SELECT TOP 1 @nvId = id FROM nguoi_dung WHERE id_vai_tro = 2;
IF @nvId IS NULL SET @nvId = 4;
SELECT TOP 1 @kh4Id = id FROM nguoi_dung WHERE dien_thoai = '0912345678';
IF @kh4Id IS NULL SET @kh4Id = 1;

IF NOT EXISTS (SELECT 1 FROM hoa_don WHERE ma = 'HD004')
BEGIN
    INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
    VALUES ('TT004', 'COD', 22990000, 1, '2026-09-26 09:10:00');
    SET @tt4Id = SCOPE_IDENTITY();

    INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
    VALUES ('HD004', @kh4Id, N'789 Giải Phóng, Hà Nội', '0912345678', '2026-09-26 09:10:00', N'Phạm Thị D', 3, @tt4Id, @nvId, N'Đã giao thành công');
    SET @hd4Id = SCOPE_IDENTITY();

    INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
    VALUES ('CTHD_HD004_1', @hd4Id, 3, 1, 22990000);
    SET @cthd4Id = SCOPE_IDENTITY();

    INSERT INTO chi_tiet_hoa_don_imei (id_chi_tiet_hoa_don, id_imei)
    VALUES (@cthd4Id, 9);
    UPDATE imei SET trang_thai = 1 WHERE id = 9;
END
GO

-- 6. Insert or update HD005 (Hoàng Văn E - 18.490.000 - COD - Đã hủy [4] - Chưa thanh toán [0])
DECLARE @tt5Id INT, @kh5Id INT, @hd5Id INT, @nvId INT, @cthd5Id INT;
SELECT TOP 1 @nvId = id FROM nguoi_dung WHERE id_vai_tro = 2;
IF @nvId IS NULL SET @nvId = 4;
SELECT TOP 1 @kh5Id = id FROM nguoi_dung WHERE dien_thoai = '0387654321';
IF @kh5Id IS NULL SET @kh5Id = 1;

IF NOT EXISTS (SELECT 1 FROM hoa_don WHERE ma = 'HD005')
BEGIN
    INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
    VALUES ('TT005', 'COD', 18490000, 0, NULL);
    SET @tt5Id = SCOPE_IDENTITY();

    INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
    VALUES ('HD005', @kh5Id, N'101 Hoàng Hoa Thám, Hà Nội', '0387654321', '2026-09-25 11:45:00', N'Hoàng Văn E', 4, @tt5Id, @nvId, N'Khách đổi ý muốn mua dòng khác');
    SET @hd5Id = SCOPE_IDENTITY();

    INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
    VALUES ('CTHD_HD005_1', @hd5Id, 4, 1, 18490000);
END
GO
