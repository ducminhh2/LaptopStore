USE LaptopStoreDB;
GO

SET NOCOUNT ON;

PRINT N'=== BẮT ĐẦU NẠP DỮ LIỆU ĐƠN HÀNG VÀ BẢO HÀNH DEMO ĐỒNG BỘ 100% ===';

-- 1. Làm sạch các đơn hàng demo cũ (nếu có) trước khi nạp
DELETE FROM yeu_cau_bao_hanh;
DELETE FROM bao_hanh;
DELETE FROM lich_su_hoa_don;
DELETE FROM chi_tiet_hoa_don_imei;
DELETE FROM chi_tiet_hoa_don;
DELETE FROM hoa_don;
DELETE FROM thanh_toan;

-- Khôi phục toàn bộ IMEI về trạng thái 0 (Trong kho)
UPDATE imei SET trang_thai = 0;

-- Lấy danh sách ID người dùng chuẩn
DECLARE @idAdmin INT = 1;
DECLARE @idNv1 INT = 2; -- minhduc
DECLARE @idNv2 INT = 3; -- thanhliem
DECLARE @idNv3 INT = 4; -- haduyen
DECLARE @idKhachLe INT = 5; -- khachle
DECLARE @idKh1 INT = 6; -- nguyenvanan
DECLARE @idKh2 INT = 7; -- tranthibinh
DECLARE @idKh3 INT = 8; -- lehoangnam
DECLARE @idKh4 INT = 9; -- levanduy

-- ============================================================================
-- ĐƠN HÀNG 1 (HD001): Online COD - Chờ xác nhận (Trạng thái 0)
-- Khách hàng: Nguyễn Văn An (KH001), mua 1 ASUS TUF A15 (CTSP001)
-- ============================================================================
DECLARE @tt1Id INT, @hd1Id INT, @cthd1Id INT;

INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
VALUES ('TT-HD001', N'COD', 18990000, 0, NULL);
SET @tt1Id = SCOPE_IDENTITY();

INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
VALUES ('HD001', @idKh1, N'Số 12 ngõ 45 Cầu Giấy, Hà Nội', '0987654321', DATEADD(HOUR, -2, GETDATE()), N'Nguyễn Văn An', 0, @tt1Id, NULL, N'Đơn đặt Online - Chờ nhân viên xác nhận');
SET @hd1Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
VALUES ('CTHD-001-1', @hd1Id, 1, 1, 18990000);

INSERT INTO lich_su_hoa_don (id_hoa_don, trang_thai, thoi_gian, id_nhan_vien, ten_nguoi_thuc_hien, ghi_chu)
VALUES (@hd1Id, 0, DATEADD(HOUR, -2, GETDATE()), NULL, N'Khách hàng', N'Khách hàng đặt hàng Online COD thành công');


-- ============================================================================
-- ĐƠN HÀNG 2 (HD002): Online - Đã xác nhận (Trạng thái 1) có áp Voucher SALE500K
-- Khách hàng: Trần Thị Bình (KH002), duyệt bởi NV Minh Đức, mua 1 Zenbook 14 OLED (CTSP004)
-- ============================================================================
DECLARE @tt2Id INT, @hd2Id INT, @cthd2Id INT, @imei2Id INT;

-- Chọn 1 IMEI của CTSP004 (id = 4)
SELECT TOP 1 @imei2Id = id FROM imei WHERE id_chi_tiet_san_pham = 4 AND trang_thai = 0 ORDER BY id;

INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
VALUES ('TT-HD002', N'Chuyển khoản Vietcombank', 23490000, 1, DATEADD(HOUR, -5, GETDATE()));
SET @tt2Id = SCOPE_IDENTITY();

INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, id_voucher, tien_giam_voucher, mo_ta)
VALUES ('HD002', @idKh2, N'456 Kim Mã, Ba Đình, Hà Nội', '0976543210', DATEADD(HOUR, -6, GETDATE()), N'Trần Thị Bình', 1, @tt2Id, @idNv1, 2, 500000, N'Đã chuyển khoản - Đã xác nhận và phân bổ IMEI');
SET @hd2Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
VALUES ('CTHD-002-1', @hd2Id, 4, 1, 23990000);
SET @cthd2Id = SCOPE_IDENTITY();

-- Phân bổ IMEI (trạng thái IMEI vẫn 0 vì đang chuẩn bị đóng gói)
INSERT INTO chi_tiet_hoa_don_imei (id_chi_tiet_hoa_don, id_imei)
VALUES (@cthd2Id, @imei2Id);

INSERT INTO lich_su_hoa_don (id_hoa_don, trang_thai, thoi_gian, id_nhan_vien, ten_nguoi_thuc_hien, ghi_chu)
VALUES 
(@hd2Id, 0, DATEADD(HOUR, -6, GETDATE()), NULL, N'Khách hàng', N'Đặt hàng Online'),
(@hd2Id, 1, DATEADD(HOUR, -5, GETDATE()), @idNv1, N'Nguyễn Minh Đức', N'Nhân viên xác nhận đơn hàng và phân bổ IMEI');


-- ============================================================================
-- ĐƠN HÀNG 3 (HD003): Online COD - Đang giao hàng (Trạng thái 2)
-- Khách hàng: Lê Hoàng Nam (KH003), phụ trách NV Thanh Liêm, mua 1 Legion 5 (CTSP019)
-- ============================================================================
DECLARE @tt3Id INT, @hd3Id INT, @cthd3Id INT, @imei3Id INT;

SELECT TOP 1 @imei3Id = id FROM imei WHERE id_chi_tiet_san_pham = 19 AND trang_thai = 0 ORDER BY id;

INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
VALUES ('TT-HD003', N'COD', 26990000, 0, NULL);
SET @tt3Id = SCOPE_IDENTITY();

INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
VALUES ('HD003', @idKh3, N'789 Giải Phóng, Hoàng Mai, Hà Nội', '0965432109', DATEADD(DAY, -1, GETDATE()), N'Lê Hoàng Nam', 2, @tt3Id, @idNv2, N'Đơn hàng đang trên đường giao');
SET @hd3Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
VALUES ('CTHD-003-1', @hd3Id, 19, 1, 26990000);
SET @cthd3Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don_imei (id_chi_tiet_hoa_don, id_imei)
VALUES (@cthd3Id, @imei3Id);

INSERT INTO lich_su_hoa_don (id_hoa_don, trang_thai, thoi_gian, id_nhan_vien, ten_nguoi_thuc_hien, ghi_chu)
VALUES 
(@hd3Id, 0, DATEADD(DAY, -1, GETDATE()), NULL, N'Khách hàng', N'Đặt hàng Online COD'),
(@hd3Id, 1, DATEADD(HOUR, -20, GETDATE()), @idNv2, N'Nguyễn Thanh Liêm', N'Xác nhận đơn và phân bổ IMEI'),
(@hd3Id, 2, DATEADD(HOUR, -12, GETDATE()), @idNv2, N'Nguyễn Thanh Liêm', N'Bàn giao đơn vị vận chuyển - Bắt đầu giao hàng');


-- ============================================================================
-- ĐƠN HÀNG 4 (HD004): Bán tại quầy (POS) - Hoàn thành (Trạng thái 3) & ĐÃ KÍCH HOẠT BẢO HÀNH
-- Khách lẻ / Lê Văn Duy (KH009), bán bởi NV Hà Duyên, mua 1 Dell Inspiron (CTSP010)
-- ============================================================================
DECLARE @tt4Id INT, @hd4Id INT, @cthd4Id INT, @imei4Id INT, @bh4Id INT;

SELECT TOP 1 @imei4Id = id FROM imei WHERE id_chi_tiet_san_pham = 10 AND trang_thai = 0 ORDER BY id;

INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
VALUES ('TT-HD004', N'Tiền mặt tại quầy', 13490000, 1, DATEADD(DAY, -3, GETDATE()));
SET @tt4Id = SCOPE_IDENTITY();

INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
VALUES ('HD004', @idKh4, N'Tại quầy Store', '0123456789', DATEADD(DAY, -3, GETDATE()), N'Lê Văn Duy', 3, @tt4Id, @idNv3, N'Khách mua nhận máy trực tiếp tại cửa hàng');
SET @hd4Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
VALUES ('CTHD-004-1', @hd4Id, 10, 1, 13490000);
SET @cthd4Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don_imei (id_chi_tiet_hoa_don, id_imei)
VALUES (@cthd4Id, @imei4Id);

-- Cập nhật IMEI sang 1 (Đã bán)
UPDATE imei SET trang_thai = 1 WHERE id = @imei4Id;

-- Tự động kích hoạt Phiếu bảo hành 12 tháng
INSERT INTO bao_hanh (ma_phieu, id_imei, ngay_kich_hoat, ngay_het_han, trang_thai)
VALUES ('BH-HD004-01', @imei4Id, DATEADD(DAY, -3, GETDATE()), DATEADD(MONTH, 12, DATEADD(DAY, -3, GETDATE())), 1);

INSERT INTO lich_su_hoa_don (id_hoa_don, trang_thai, thoi_gian, id_nhan_vien, ten_nguoi_thuc_hien, ghi_chu)
VALUES 
(@hd4Id, 0, DATEADD(DAY, -3, GETDATE()), @idNv3, N'Nguyễn Hà Duyên', N'Tạo đơn hàng tại quầy POS'),
(@hd4Id, 1, DATEADD(DAY, -3, GETDATE()), @idNv3, N'Nguyễn Hà Duyên', N'Xác nhận đơn và gán IMEI máy'),
(@hd4Id, 3, DATEADD(DAY, -3, GETDATE()), @idNv3, N'Nguyễn Hà Duyên', N'Thanh toán đủ & bàn giao laptop cho khách hàng');


-- ============================================================================
-- ĐƠN HÀNG 5 (HD005): Online COD - Hoàn thành (Trạng thái 3) & BẢO HÀNH + YÊU CẦU BẢO HÀNH
-- Khách hàng: Lê Hoàng Nam (KH003), mua 1 Dell XPS 13 Plus (CTSP013)
-- Đã kích hoạt bảo hành + Có 1 Yêu cầu bảo hành (Chờ tiếp nhận) để test
-- ============================================================================
DECLARE @tt5Id INT, @hd5Id INT, @cthd5Id INT, @imei5Id INT, @bh5Id INT;

SELECT TOP 1 @imei5Id = id FROM imei WHERE id_chi_tiet_san_pham = 13 AND trang_thai = 0 ORDER BY id;

INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
VALUES ('TT-HD005', N'COD', 36990000, 1, DATEADD(DAY, -15, GETDATE()));
SET @tt5Id = SCOPE_IDENTITY();

INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
VALUES ('HD005', @idKh3, N'789 Giải Phóng, Hoàng Mai, Hà Nội', '0965432109', DATEADD(DAY, -18, GETDATE()), N'Lê Hoàng Nam', 3, @tt5Id, @idNv1, N'Giao hàng và thu tiền COD thành công');
SET @hd5Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
VALUES ('CTHD-005-1', @hd5Id, 13, 1, 36990000);
SET @cthd5Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don_imei (id_chi_tiet_hoa_don, id_imei)
VALUES (@cthd5Id, @imei5Id);

-- Cập nhật IMEI sang 1 (Đã bán)
UPDATE imei SET trang_thai = 1 WHERE id = @imei5Id;

-- Kích hoạt Phiếu bảo hành 12 tháng
INSERT INTO bao_hanh (ma_phieu, id_imei, ngay_kich_hoat, ngay_het_han, trang_thai)
VALUES ('BH-HD005-01', @imei5Id, DATEADD(DAY, -15, GETDATE()), DATEADD(MONTH, 12, DATEADD(DAY, -15, GETDATE())), 1);
SET @bh5Id = SCOPE_IDENTITY();

-- Tạo 1 Yêu cầu bảo hành mẫu ở trạng thái 0 (Chờ tiếp nhận) để test ngay màn hình Bảo hành
INSERT INTO yeu_cau_bao_hanh (
    ma_yeu_cau, id_bao_hanh, id_khach_hang, id_nhan_vien,
    mo_ta_loi, dien_thoai_lien_he, ghi_chu_khach_hang,
    ngay_yeu_cau, ngay_tiep_nhan, ngay_bat_dau_xu_ly, ngay_hoan_thanh,
    trang_thai, ghi_chu_xu_ly, ly_do_tu_choi
)
VALUES (
    'YCBH-000001', @bh5Id, @idKh3, NULL,
    N'Quạt tản nhiệt phát tiếng kêu rè rè khi tải nặng, nhiệt độ máy tăng cao bất thường.',
    '0965432109', N'Mong cửa hàng kiểm tra và vệ sinh lại hệ thống tản nhiệt giúp tôi.',
    DATEADD(HOUR, -4, GETDATE()), NULL, NULL, NULL,
    0, NULL, NULL
);

INSERT INTO lich_su_hoa_don (id_hoa_don, trang_thai, thoi_gian, id_nhan_vien, ten_nguoi_thuc_hien, ghi_chu)
VALUES 
(@hd5Id, 0, DATEADD(DAY, -18, GETDATE()), NULL, N'Khách hàng', N'Đặt hàng Online COD'),
(@hd5Id, 1, DATEADD(DAY, -17, GETDATE()), @idNv1, N'Nguyễn Minh Đức', N'Xác nhận đơn hàng và phân bổ IMEI'),
(@hd5Id, 2, DATEADD(DAY, -16, GETDATE()), @idNv1, N'Nguyễn Minh Đức', N'Bắt đầu giao hàng'),
(@hd5Id, 3, DATEADD(DAY, -15, GETDATE()), @idNv1, N'Nguyễn Minh Đức', N'Giao hàng và thu tiền COD thành công');


-- ============================================================================
-- ĐƠN HÀNG 6 (HD006): Online COD - ĐÃ HỦY (Trạng thái 4)
-- Khách hàng: Nguyễn Văn An (KH001), mua 1 Acer Nitro V 15 (CTSP028)
-- ============================================================================
DECLARE @tt6Id INT, @hd6Id INT, @cthd6Id INT;

INSERT INTO thanh_toan (ma, phuong_thuc, so_tien, trang_thai, ngay_thanh_toan)
VALUES ('TT-HD006', N'COD', 18990000, 0, NULL);
SET @tt6Id = SCOPE_IDENTITY();

INSERT INTO hoa_don (ma, id_khach_hang, dia_chi, dien_thoai, ngay_tao, ten_nguoi_nhan, trang_thai, id_thanh_toan, id_nhan_vien, mo_ta)
VALUES ('HD006', @idKh1, N'Số 12 ngõ 45 Cầu Giấy, Hà Nội', '0987654321', DATEADD(DAY, -5, GETDATE()), N'Nguyễn Văn An', 4, @tt6Id, @idNv1, N'Lý do hủy: Khách hàng đổi ý muốn đổi sang dòng máy mỏng nhẹ hơn');
SET @hd6Id = SCOPE_IDENTITY();

INSERT INTO chi_tiet_hoa_don (ma, id_hoa_don, id_chi_tiet_san_pham, so_luong, gia_tung_san_pham)
VALUES ('CTHD-006-1', @hd6Id, 28, 1, 18990000);

-- Không phân bổ IMEI (hoặc đã được giải phóng về kho)
INSERT INTO lich_su_hoa_don (id_hoa_don, trang_thai, thoi_gian, id_nhan_vien, ten_nguoi_thuc_hien, ghi_chu)
VALUES 
(@hd6Id, 0, DATEADD(DAY, -5, GETDATE()), NULL, N'Khách hàng', N'Đặt hàng Online COD'),
(@hd6Id, 4, DATEADD(DAY, -4, GETDATE()), @idNv1, N'Nguyễn Minh Đức', N'Hủy hóa đơn. Lý do: Khách hàng đổi ý muốn đổi sang dòng máy mỏng nhẹ hơn');


-- ============================================================================
-- CẬP NHẬT TỒN KHO CTSP ĐỒNG BỘ 100% VỚI SỐ IMEI THỰC TẾ TRONG KHO (trang_thai = 0)
-- ============================================================================
UPDATE ctsp
SET so_luong = (
    SELECT COUNT(*) 
    FROM imei i 
    WHERE i.id_chi_tiet_san_pham = ctsp.id AND i.trang_thai = 0
)
FROM chi_tiet_san_pham ctsp;

PRINT N'=== ĐÃ NẠP THÀNH CÔNG 6 ĐƠN HÀNG DEMO, 2 PHIẾU BẢO HÀNH VÀ 1 YÊU CẦU BẢO HÀNH! ===';
GO
