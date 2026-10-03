USE LaptopStoreDB;
GO

SET NOCOUNT ON;

PRINT N'=== BẮT ĐẦU XÓA DỮ LIỆU CŨ VÀ TÁI TẠO CSDL LAPTOP STORE SẠCH SẼ ===';

-- 1. Vô hiệu hóa constraints tạm thời
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";

-- 2. Xóa dữ liệu các bảng
DELETE FROM chi_tiet_hoa_don_imei;
DELETE FROM chi_tiet_hoa_don;
DELETE FROM hoa_don;
DELETE FROM thanh_toan;
DELETE FROM bao_hanh;
DELETE FROM chi_tiet_khuyen_mai;
DELETE FROM khuyen_mai;
DELETE FROM voucher;
DELETE FROM chi_tiet_gio_hang;
DELETE FROM gio_hang;
DELETE FROM imei;
DELETE FROM hinh_anh_chi_tiet;
DELETE FROM hinh_anh;
DELETE FROM chi_tiet_san_pham;
DELETE FROM san_pham;
DELETE FROM thuong_hieu;
DELETE FROM danh_muc;
DELETE FROM mau_sac;
DELETE FROM cpu;
DELETE FROM ram;
DELETE FROM o_cung;
DELETE FROM card_do_hoa;
DELETE FROM man_hinh;
DELETE FROM nguoi_dung;
DELETE FROM vai_tro;

-- 3. Bật lại constraints
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";

-- 4. Reseed Identity về 0 để tự tăng từ 1
DBCC CHECKIDENT ('vai_tro', RESEED, 0);
DBCC CHECKIDENT ('nguoi_dung', RESEED, 0);
DBCC CHECKIDENT ('danh_muc', RESEED, 0);
DBCC CHECKIDENT ('thuong_hieu', RESEED, 0);
DBCC CHECKIDENT ('san_pham', RESEED, 0);
DBCC CHECKIDENT ('hinh_anh', RESEED, 0);
DBCC CHECKIDENT ('mau_sac', RESEED, 0);
DBCC CHECKIDENT ('cpu', RESEED, 0);
DBCC CHECKIDENT ('ram', RESEED, 0);
DBCC CHECKIDENT ('o_cung', RESEED, 0);
DBCC CHECKIDENT ('card_do_hoa', RESEED, 0);
DBCC CHECKIDENT ('man_hinh', RESEED, 0);
DBCC CHECKIDENT ('chi_tiet_san_pham', RESEED, 0);
DBCC CHECKIDENT ('hinh_anh_chi_tiet', RESEED, 0);
DBCC CHECKIDENT ('imei', RESEED, 0);
DBCC CHECKIDENT ('gio_hang', RESEED, 0);
DBCC CHECKIDENT ('chi_tiet_gio_hang', RESEED, 0);
DBCC CHECKIDENT ('thanh_toan', RESEED, 0);
DBCC CHECKIDENT ('hoa_don', RESEED, 0);
DBCC CHECKIDENT ('chi_tiet_hoa_don', RESEED, 0);
DBCC CHECKIDENT ('chi_tiet_hoa_don_imei', RESEED, 0);
DBCC CHECKIDENT ('bao_hanh', RESEED, 0);
DBCC CHECKIDENT ('khuyen_mai', RESEED, 0);
DBCC CHECKIDENT ('chi_tiet_khuyen_mai', RESEED, 0);
DBCC CHECKIDENT ('voucher', RESEED, 0);
GO

/* ============================================================================
   1. BẢNG VAI TRÒ (3 vai trò)
   ============================================================================ */
INSERT INTO vai_tro (ten_vai_tro) VALUES
(N'Quản trị viên'), -- ID 1
(N'Nhân viên'),     -- ID 2
(N'Khách hàng');    -- ID 3
GO

/* ============================================================================
   2. BẢNG NGƯỜI DÙNG (1 Admin, 3 Nhân viên, 1 Khách lẻ, 3 Khách hàng)
   Mật khẩu tất cả đều là: 123456
   ============================================================================ */
INSERT INTO nguoi_dung (ma, ten, username, password, dia_chi, dien_thoai, email, id_vai_tro) VALUES
('AD001', N'Quản trị viên Hệ Thống', 'admin', '123456', N'Hà Nội', '0900000001', 'admin@laptopstore.vn', 1),
('NV001', N'Nguyễn Minh Đức', 'minhduc', '123456', N'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', '0912345671', 'minhduc@laptopstore.vn', 2),
('NV002', N'Nguyễn Thanh Liêm', 'thanhliem', '123456', N'Số 12 Chùa Bộc, Đống Đa, Hà Nội', '0912345672', 'thanhliem@laptopstore.vn', 2),
('NV003', N'Nguyễn Hà Duyên', 'haduyen', '123456', N'Số 250 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', '0912345673', 'haduyen@laptopstore.vn', 2),
('KH000', N'Khách lẻ tại quầy', 'khachle', '123456', N'Tại quầy Store', NULL, 'khachle@laptopstore.vn', 3),
('KH001', N'Nguyễn Văn An', 'nguyenvanan', '123456', N'Số 88 Cầu Giấy, Hà Nội', '0987654321', 'vanan@gmail.com', 3),
('KH002', N'Trần Thị Bình', 'tranthibinh', '123456', N'Số 45 Giải Phóng, Hai Bà Trưng, Hà Nội', '0976543210', 'thibinh@gmail.com', 3),
('KH003', N'Lê Hoàng Nam', 'lehoangnam', '123456', N'Số 19 Nguyễn Trãi, Thanh Xuân, Hà Nội', '0965432109', 'hoangnam@gmail.com', 3);
GO

/* ============================================================================
   3. TẠO SẴN GIỎ HÀNG RỖNG CHO 3 KHÁCH HÀNG (KH001, KH002, KH003)
   ============================================================================ */
INSERT INTO gio_hang (ma, id_khach_hang, tong_so_tien, tong_so_luong)
SELECT 'GH0001', id, 0, 0 FROM nguoi_dung WHERE username = 'nguyenvanan';

INSERT INTO gio_hang (ma, id_khach_hang, tong_so_tien, tong_so_luong)
SELECT 'GH0002', id, 0, 0 FROM nguoi_dung WHERE username = 'tranthibinh';

INSERT INTO gio_hang (ma, id_khach_hang, tong_so_tien, tong_so_luong)
SELECT 'GH0003', id, 0, 0 FROM nguoi_dung WHERE username = 'lehoangnam';
GO

/* ============================================================================
   4. THUỘC TÍNH SẢN PHẨM
   - 10 CPU
   - 10 Card đồ họa
   - 5 Danh mục
   - 5 Thương hiệu
   - 5 RAM
   - 5 Ổ cứng
   - 5 Màn hình
   - 5 Màu sắc
   ============================================================================ */
-- 4.1. CPU (10 mẫu)
INSERT INTO cpu (ten_cpu) VALUES
(N'Intel Core i5-12450H'),  -- ID 1
(N'Intel Core i5-13500H'),  -- ID 2
(N'Intel Core i7-13700H'),  -- ID 3
(N'Intel Core i9-13900HX'), -- ID 4
(N'Intel Core Ultra 7 155H'),-- ID 5
(N'AMD Ryzen 5 7535HS'),    -- ID 6
(N'AMD Ryzen 7 7735HS'),    -- ID 7
(N'AMD Ryzen 7 7840HS'),    -- ID 8
(N'AMD Ryzen 9 7940HS'),    -- ID 9
(N'Apple M3 Pro Chip');     -- ID 10

-- 4.2. Card đồ họa (10 mẫu)
INSERT INTO card_do_hoa (ten_card) VALUES
(N'NVIDIA GeForce RTX 3050 4GB'), -- ID 1
(N'NVIDIA GeForce RTX 4050 6GB'), -- ID 2
(N'NVIDIA GeForce RTX 4060 8GB'), -- ID 3
(N'NVIDIA GeForce RTX 4070 8GB'), -- ID 4
(N'NVIDIA GeForce RTX 4080 12GB'),-- ID 5
(N'AMD Radeon RX 7600S 8GB'),     -- ID 6
(N'AMD Radeon 680M'),             -- ID 7
(N'AMD Radeon 780M'),             -- ID 8
(N'Intel Iris Xe Graphics'),      -- ID 9
(N'Apple 14-Core GPU');           -- ID 10

-- 4.3. Danh mục (5 cái)
INSERT INTO danh_muc (ten_danh_muc) VALUES
(N'Laptop Gaming'),             -- ID 1
(N'Laptop Đồ Họa - Kỹ Thuật'),   -- ID 2
(N'Laptop Mỏng Nhẹ - Cao Cấp'),  -- ID 3
(N'Laptop Học Tập - Văn Phòng'), -- ID 4
(N'Laptop Doanh Nhân');          -- ID 5

-- 4.4. Thương hiệu (5 hãng)
INSERT INTO thuong_hieu (ten_thuong_hieu) VALUES
(N'ASUS'),   -- ID 1
(N'Dell'),   -- ID 2
(N'Lenovo'), -- ID 3
(N'Acer'),   -- ID 4
(N'HP');     -- ID 5

-- 4.5. RAM (5 cái)
INSERT INTO ram (dung_luong, loai_ram) VALUES
(N'8GB', N'DDR4 3200MHz'),   -- ID 1
(N'16GB', N'DDR4 3200MHz'),  -- ID 2
(N'16GB', N'DDR5 4800MHz'),  -- ID 3
(N'32GB', N'DDR5 5200MHz'),  -- ID 4
(N'64GB', N'DDR5 5600MHz');  -- ID 5

-- 4.6. Ổ cứng (5 cái)
INSERT INTO o_cung (loai_o_cung, dung_luong) VALUES
(N'SSD NVMe PCIe Gen3', N'256GB'), -- ID 1
(N'SSD NVMe PCIe Gen4', N'512GB'), -- ID 2
(N'SSD NVMe PCIe Gen4', N'1TB'),   -- ID 3
(N'SSD NVMe PCIe Gen4', N'2TB'),   -- ID 4
(N'SSD NVMe PCIe Gen3', N'512GB'); -- ID 5

-- 4.7. Màn hình (5 cái)
INSERT INTO man_hinh (kich_thuoc, do_phan_giai, tan_so_quet) VALUES
(N'14.0 inch', N'Full HD (1920x1080) IPS', N'60Hz'),    -- ID 1
(N'14.0 inch', N'2.8K (2880x1800) OLED', N'120Hz'),     -- ID 2
(N'15.6 inch', N'Full HD (1920x1080) IPS', N'144Hz'),   -- ID 3
(N'15.6 inch', N'2K QHD (2560x1440) IPS', N'165Hz'),    -- ID 4
(N'16.0 inch', N'WQXGA (2560x1600) IPS', N'165Hz');    -- ID 5

-- 4.8. Màu sắc (5 cái)
INSERT INTO mau_sac (ten_mau) VALUES
(N'Xám không gian (Space Gray)'), -- ID 1
(N'Đen bóng đêm (Midnight Black)'),-- ID 2
(N'Bạc ánh trăng (Luna Silver)'), -- ID 3
(N'Trắng tuyết (Glacier White)'), -- ID 4
(N'Xanh đậm (Dark Blue)');        -- ID 5
GO

/* ============================================================================
   5. BẢNG SẢN PHẨM (Mỗi hãng 3 sản phẩm = 15 sản phẩm)
   ============================================================================ */
INSERT INTO san_pham (ma_sp, ten_sp, gia_co_ban, mo_ta, id_danh_muc, id_thuong_hieu) VALUES
-- ASUS (Hãng 1)
('SP001', N'ASUS TUF Gaming A15', 19990000, N'Laptop Gaming chiến game đỉnh cao, chuẩn độ bền quân đội Mỹ.', 1, 1),
('SP002', N'ASUS Zenbook 14 OLED', 24990000, N'Tuyệt tác siêu mỏng nhẹ với màn hình OLED 2.8K rực rỡ.', 3, 1),
('SP003', N'ASUS ROG Strix G16', 32990000, N'Hiệu năng eSports vượt trội, tản nhiệt thông minh 3 quạt.', 1, 1),

-- Dell (Hãng 2)
('SP004', N'Dell Inspiron 15 3520', 14990000, N'Laptop văn phòng bền bỉ, màn hình 120Hz mượt mà.', 4, 2),
('SP005', N'Dell XPS 13 Plus', 39990000, N'Kiệt tác công nghệ cao cấp bậc nhất thế giới doanh nhân.', 3, 2),
('SP006', N'Dell Gaming G15 5530', 22990000, N'Thiết kế đậm chất viễn tưởng, cấu hình mạnh mẽ cho game thủ.', 1, 2),

-- Lenovo (Hãng 3)
('SP007', N'Lenovo Legion 5 15IRX9', 27990000, N'Cỗ máy chiến game hoàn hảo, bàn phím Legion TrueStrike đỉnh cao.', 1, 3),
('SP008', N'Lenovo ThinkPad E14 Gen 5', 18990000, N'Biểu tượng của độ bền và bàn phím gõ êm ái bậc nhất.', 5, 3),
('SP009', N'Lenovo IdeaPad Slim 3', 12990000, N'Lựa chọn tối ưu học tập văn phòng với mức giá hợp lý.', 4, 3),

-- Acer (Hãng 4)
('SP010', N'Acer Nitro V 15', 19990000, N'Ông hoàng laptop gaming quốc dân phân khúc tầm trung.', 1, 4),
('SP011', N'Acer Predator Helios Neo 16', 35990000, N'Quái thú hiệu năng cực đại với hệ thống tản nhiệt kim loại lỏng.', 1, 4),
('SP012', N'Acer Swift Go 14', 20990000, N'Laptop mỏng nhẹ thanh lịch tích hợp AI thông minh.', 3, 4),

-- HP (Hãng 5)
('SP013', N'HP Victus 15', 18990000, N'Thiết kế tối giản sang trọng kết hợp cấu hình gaming mạnh mẽ.', 1, 5),
('SP014', N'HP Pavilion 14', 15990000, N'Trợ thủ đắc lực cho sinh viên và nhân viên văn phòng.', 4, 5),
('SP015', N'HP Envy x360 14', 23990000, N'Laptop xoay gập 360 độ cao cấp với bút cảm ứng tiện lợi.', 3, 5);
GO

/* ============================================================================
   6. HÌNH ẢNH SẢN PHẨM (Mỗi sản phẩm 1 ảnh đại diện)
   ============================================================================ */
INSERT INTO hinh_anh (url_hinh_anh, id_san_pham) VALUES
('https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80', 1),
('https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', 2),
('https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', 3),
('https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', 4),
('https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80', 5),
('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 6),
('https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80', 7),
('https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', 8),
('https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', 9),
('https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80', 10),
('https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', 11),
('https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80', 12),
('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 13),
('https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', 14),
('https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80', 15);
GO

/* ============================================================================
   7. CHI TIẾT SẢN PHẨM (Mỗi sản phẩm 3 cấu hình = 45 CTSP)
   so_luong = 5 (tương ứng với 5 IMEI trong kho)
   ============================================================================ */
INSERT INTO chi_tiet_san_pham 
(ma_ctsp, id_san_pham, id_mau_sac, id_cpu, id_ram, id_o_cung, id_card_do_hoa, id_man_hinh, so_luong, gia, mo_ta, trang_thai)
VALUES
-- SP001: ASUS TUF Gaming A15
('CTSP001', 1, 1, 6, 2, 2, 1, 3, 5, 18990000, N'Ryzen 5 7535HS / RAM 16GB / SSD 512GB / RTX 3050 4GB / 15.6" FHD 144Hz / Xám', 1),
('CTSP002', 1, 2, 7, 3, 2, 2, 3, 5, 21990000, N'Ryzen 7 7735HS / RAM 16GB DDR5 / SSD 512GB / RTX 4050 6GB / 15.6" FHD 144Hz / Đen', 1),
('CTSP003', 1, 1, 8, 4, 3, 3, 4, 5, 26990000, N'Ryzen 7 7840HS / RAM 32GB DDR5 / SSD 1TB / RTX 4060 8GB / 15.6" 2K 165Hz / Xám', 1),

-- SP002: ASUS Zenbook 14 OLED
('CTSP004', 2, 3, 2, 2, 2, 9, 2, 5, 23990000, N'Core i5-13500H / RAM 16GB / SSD 512GB / Iris Xe / 14" 2.8K OLED / Bạc', 1),
('CTSP005', 2, 5, 3, 3, 3, 9, 2, 5, 27990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 1TB / Iris Xe / 14" 2.8K OLED / Xanh', 1),
('CTSP006', 2, 3, 5, 4, 3, 9, 2, 5, 32990000, N'Core Ultra 7 155H / RAM 32GB DDR5 / SSD 1TB / Intel Arc / 14" 2.8K OLED / Bạc', 1),

-- SP003: ASUS ROG Strix G16
('CTSP007', 3, 2, 3, 3, 2, 3, 5, 5, 31990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 512GB / RTX 4060 8GB / 16" 165Hz / Đen', 1),
('CTSP008', 3, 2, 4, 4, 3, 4, 5, 5, 39990000, N'Core i9-13900HX / RAM 32GB DDR5 / SSD 1TB / RTX 4070 8GB / 16" 165Hz / Đen', 1),
('CTSP009', 3, 2, 4, 5, 4, 5, 5, 5, 54990000, N'Core i9-13900HX / RAM 64GB DDR5 / SSD 2TB / RTX 4080 12GB / 16" 165Hz / Đen', 1),

-- SP004: Dell Inspiron 15 3520
('CTSP010', 4, 3, 1, 1, 1, 9, 3, 5, 13490000, N'Core i5-12450H / RAM 8GB / SSD 256GB / Iris Xe / 15.6" FHD 120Hz / Bạc', 1),
('CTSP011', 4, 2, 1, 2, 2, 9, 3, 5, 15490000, N'Core i5-12450H / RAM 16GB / SSD 512GB / Iris Xe / 15.6" FHD 120Hz / Đen', 1),
('CTSP012', 4, 3, 3, 2, 2, 9, 3, 5, 18490000, N'Core i7-13700H / RAM 16GB / SSD 512GB / Iris Xe / 15.6" FHD 120Hz / Bạc', 1),

-- SP005: Dell XPS 13 Plus
('CTSP013', 5, 3, 3, 3, 2, 9, 2, 5, 36990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 512GB / Iris Xe / 13.4" 3.5K OLED / Bạc', 1),
('CTSP014', 5, 1, 3, 4, 3, 9, 2, 5, 42990000, N'Core i7-13700H / RAM 32GB DDR5 / SSD 1TB / Iris Xe / 13.4" 3.5K OLED / Xám', 1),
('CTSP015', 5, 1, 5, 4, 3, 9, 2, 5, 48990000, N'Core Ultra 7 155H / RAM 32GB DDR5 / SSD 1TB / Intel Arc / 13.4" 3.5K OLED / Xám', 1),

-- SP006: Dell Gaming G15 5530
('CTSP016', 6, 1, 2, 2, 2, 1, 3, 5, 21990000, N'Core i5-13500H / RAM 16GB / SSD 512GB / RTX 3050 6GB / 15.6" FHD 120Hz / Xám', 1),
('CTSP017', 6, 2, 3, 3, 2, 2, 3, 5, 25990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 512GB / RTX 4050 6GB / 15.6" FHD 165Hz / Đen', 1),
('CTSP018', 6, 4, 3, 4, 3, 3, 4, 5, 30990000, N'Core i7-13700H / RAM 32GB DDR5 / SSD 1TB / RTX 4060 8GB / 15.6" 2K 165Hz / Trắng', 1),

-- SP007: Lenovo Legion 5 15IRX9
('CTSP019', 7, 1, 2, 3, 2, 2, 4, 5, 26990000, N'Core i5-13500H / RAM 16GB DDR5 / SSD 512GB / RTX 4050 6GB / 15.6" WQHD 165Hz / Xám', 1),
('CTSP020', 7, 1, 3, 3, 3, 3, 4, 5, 31990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 1TB / RTX 4060 8GB / 15.6" WQHD 165Hz / Xám', 1),
('CTSP021', 7, 2, 4, 4, 3, 4, 4, 5, 38990000, N'Core i9-13900HX / RAM 32GB DDR5 / SSD 1TB / RTX 4070 8GB / 15.6" WQHD 165Hz / Đen', 1),

-- SP008: Lenovo ThinkPad E14 Gen 5
('CTSP022', 8, 2, 1, 1, 1, 9, 1, 5, 16990000, N'Core i5-12450H / RAM 8GB / SSD 256GB / Iris Xe / 14.0" WUXGA / Đen', 1),
('CTSP023', 8, 2, 2, 2, 2, 9, 1, 5, 19990000, N'Core i5-13500H / RAM 16GB / SSD 512GB / Iris Xe / 14.0" WUXGA / Đen', 1),
('CTSP024', 8, 2, 3, 3, 3, 9, 1, 5, 23990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 1TB / Iris Xe / 14.0" 2.2K / Đen', 1),

-- SP009: Lenovo IdeaPad Slim 3
('CTSP025', 9, 3, 6, 1, 2, 7, 1, 5, 11990000, N'Ryzen 5 7535HS / RAM 8GB / SSD 512GB / Radeon 680M / 14.0" FHD / Bạc', 1),
('CTSP026', 9, 1, 6, 2, 2, 7, 1, 5, 13490000, N'Ryzen 5 7535HS / RAM 16GB / SSD 512GB / Radeon 680M / 14.0" FHD / Xám', 1),
('CTSP027', 9, 3, 7, 2, 2, 8, 1, 5, 15990000, N'Ryzen 7 7735HS / RAM 16GB / SSD 512GB / Radeon 780M / 14.0" FHD / Bạc', 1),

-- SP010: Acer Nitro V 15
('CTSP028', 10, 2, 1, 2, 2, 1, 3, 5, 18990000, N'Core i5-12450H / RAM 16GB / SSD 512GB / RTX 3050 6GB / 15.6" FHD 144Hz / Đen', 1),
('CTSP029', 10, 2, 2, 3, 2, 2, 3, 5, 21990000, N'Core i5-13500H / RAM 16GB DDR5 / SSD 512GB / RTX 4050 6GB / 15.6" FHD 144Hz / Đen', 1),
('CTSP030', 10, 2, 3, 3, 3, 3, 3, 5, 25990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 1TB / RTX 4060 8GB / 15.6" FHD 165Hz / Đen', 1),

-- SP011: Acer Predator Helios Neo 16
('CTSP031', 11, 2, 3, 3, 2, 3, 5, 5, 33990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 512GB / RTX 4060 8GB / 16" WQXGA 165Hz / Đen', 1),
('CTSP032', 11, 2, 4, 4, 3, 4, 5, 5, 41990000, N'Core i9-13900HX / RAM 32GB DDR5 / SSD 1TB / RTX 4070 8GB / 16" WQXGA 165Hz / Đen', 1),
('CTSP033', 11, 2, 4, 5, 4, 5, 5, 5, 56990000, N'Core i9-13900HX / RAM 64GB DDR5 / SSD 2TB / RTX 4080 12GB / 16" WQXGA 165Hz / Đen', 1),

-- SP012: Acer Swift Go 14
('CTSP034', 12, 3, 2, 2, 2, 9, 2, 5, 19990000, N'Core i5-13500H / RAM 16GB / SSD 512GB / Iris Xe / 14.0" 2.8K OLED 90Hz / Bạc', 1),
('CTSP035', 12, 1, 3, 3, 3, 9, 2, 5, 23990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 1TB / Iris Xe / 14.0" 2.8K OLED 90Hz / Xám', 1),
('CTSP036', 12, 3, 5, 4, 3, 9, 2, 5, 28990000, N'Core Ultra 7 155H / RAM 32GB DDR5 / SSD 1TB / Intel Arc / 14.0" 2.8K OLED 120Hz / Bạc', 1),

-- SP013: HP Victus 15
('CTSP037', 13, 2, 1, 2, 2, 1, 3, 5, 18490000, N'Core i5-12450H / RAM 16GB / SSD 512GB / RTX 3050 4GB / 15.6" FHD 144Hz / Đen', 1),
('CTSP038', 13, 1, 2, 3, 2, 2, 3, 5, 21490000, N'Core i5-13500H / RAM 16GB DDR5 / SSD 512GB / RTX 4050 6GB / 15.6" FHD 144Hz / Xám', 1),
('CTSP039', 13, 4, 3, 3, 3, 3, 3, 5, 25490000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 1TB / RTX 4060 8GB / 15.6" FHD 144Hz / Trắng', 1),

-- SP014: HP Pavilion 14
('CTSP040', 14, 3, 1, 1, 2, 9, 1, 5, 14990000, N'Core i5-12450H / RAM 8GB / SSD 512GB / Iris Xe / 14.0" FHD IPS / Bạc', 1),
('CTSP041', 14, 3, 2, 2, 2, 9, 1, 5, 16990000, N'Core i5-13500H / RAM 16GB / SSD 512GB / Iris Xe / 14.0" FHD IPS / Bạc', 1),
('CTSP042', 14, 4, 3, 2, 3, 9, 1, 5, 19990000, N'Core i7-13700H / RAM 16GB / SSD 1TB / Iris Xe / 14.0" FHD IPS / Trắng', 1),

-- SP015: HP Envy x360 14
('CTSP043', 15, 3, 2, 2, 2, 9, 2, 5, 22990000, N'Core i5-13500H / RAM 16GB / SSD 512GB / Iris Xe / 14" 2.8K OLED Cảm ứng / Bạc', 1),
('CTSP044', 15, 5, 3, 3, 3, 9, 2, 5, 26990000, N'Core i7-13700H / RAM 16GB DDR5 / SSD 1TB / Iris Xe / 14" 2.8K OLED Cảm ứng / Xanh', 1),
('CTSP045', 15, 3, 5, 4, 3, 9, 2, 5, 31990000, N'Core Ultra 7 155H / RAM 32GB DDR5 / SSD 1TB / Intel Arc / 14" 2.8K OLED Cảm ứng / Bạc', 1);
GO

/* ============================================================================
   8. HÌNH ẢNH CHO 45 CHI TIẾT SẢN PHẨM
   ============================================================================ */
INSERT INTO hinh_anh_chi_tiet (url_hinh_anh, id_ctsp)
SELECT h.url_hinh_anh, ct.id
FROM chi_tiet_san_pham ct
JOIN hinh_anh h ON h.id_san_pham = ct.id_san_pham;
GO

/* ============================================================================
   9. BẢNG IMEI (Mỗi cấu hình 5 IMEI x 45 CTSP = 225 IMEI, trang_thai = 0 - Trong kho)
   ============================================================================ */
DECLARE @ctspId INT;
DECLARE @imeiIndex INT;
DECLARE @soImei VARCHAR(100);

DECLARE ctsp_cursor CURSOR FOR 
SELECT id FROM chi_tiet_san_pham;

OPEN ctsp_cursor;
FETCH NEXT FROM ctsp_cursor INTO @ctspId;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @imeiIndex = 1;
    WHILE @imeiIndex <= 5
    BEGIN
        SET @soImei = 'LP' + RIGHT('000' + CAST(@ctspId AS VARCHAR(10)), 3) + RIGHT('00000' + CAST(@imeiIndex AS VARCHAR(10)), 5) + RIGHT(CAST(ABS(CHECKSUM(NEWID())) AS VARCHAR(20)), 4);
        INSERT INTO imei (so_imei, id_chi_tiet_san_pham, trang_thai, ngay_nhap)
        VALUES (@soImei, @ctspId, 0, GETDATE());

        SET @imeiIndex = @imeiIndex + 1;
    END
    FETCH NEXT FROM ctsp_cursor INTO @ctspId;
END

CLOSE ctsp_cursor;
DEALLOCATE ctsp_cursor;
GO

/* ============================================================================
   10. VOUCHER HÓA ĐƠN (3 Voucher đang hoạt động)
   ============================================================================ */
INSERT INTO voucher 
(ma, ten_voucher, loai_giam, gia_tri_giam, gia_tri_don_toi_thieu, giam_toi_da, ngay_bat_dau, ngay_ket_thuc, trang_thai)
VALUES
('SALE10', N'Voucher Siêu Sale 10%', 1, 10, 15000000, 2000000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('SALE500K', N'Voucher Giảm 500.000đ Toàn Đơn', 2, 500000, 10000000, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('VIPMEMBER', N'Ưu Đãi Khách Thân Thiết 1.000.000đ', 2, 1000000, 25000000, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1);
GO

/* ============================================================================
   11. KHUYẾN MÃI SẢN PHẨM (3 Chương trình đang hoạt động & Gán CTSP)
   ============================================================================ */
INSERT INTO khuyen_mai 
(ma, ten_km, loai_giam, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc, trang_thai)
VALUES
('KM_HOT_SALE', N'Siêu Sale Khai Xuân 2026', 1, 10, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('KM_GAMING', N'Tuần Lễ Laptop Gaming', 2, 1500000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('KM_STUDENT', N'Ưu Đãi Tân Sinh Viên', 1, 5, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1);
GO

-- Gán Khuyến Mãi vào một số CTSP:
-- KM 1 (Giảm 10%): áp dụng cho CTSP 1, 4, 10, 28 (Gaming + Mỏng nhẹ phổ biến)
INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_01', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP001' AND km.ma = 'KM_HOT_SALE';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_04', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP004' AND km.ma = 'KM_HOT_SALE';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_10', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP010' AND km.ma = 'KM_HOT_SALE';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_28', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP028' AND km.ma = 'KM_HOT_SALE';

-- KM 2 (Giảm 1.500.000đ): áp dụng cho CTSP 2, 7, 16, 19, 31 (Gaming cao cấp)
INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_02', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP002' AND km.ma = 'KM_GAMING';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_07', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP007' AND km.ma = 'KM_GAMING';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_16', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP016' AND km.ma = 'KM_GAMING';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_19', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP019' AND km.ma = 'KM_GAMING';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_31', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP031' AND km.ma = 'KM_GAMING';

-- KM 3 (Giảm 5%): áp dụng cho CTSP 22, 25, 37, 40 (Văn phòng, sinh viên)
INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_22', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP022' AND km.ma = 'KM_STUDENT';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_25', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP025' AND km.ma = 'KM_STUDENT';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_37', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP037' AND km.ma = 'KM_STUDENT';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_40', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP040' AND km.ma = 'KM_STUDENT';
GO

PRINT N'=== TÁI TẠO CƠ SỞ DỮ LIỆU THÀNH CÔNG RỰC RỠ! ===';
GO
