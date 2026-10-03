IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LaptopStoreDB')
BEGIN
    CREATE DATABASE LaptopStoreDB;
END
GO

USE LaptopStoreDB;
GO

SET NOCOUNT ON;


IF OBJECT_ID('dbo.bao_hanh', 'U') IS NOT NULL DROP TABLE dbo.bao_hanh;
IF OBJECT_ID('dbo.chi_tiet_hoa_don_imei', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_hoa_don_imei;
IF OBJECT_ID('dbo.chi_tiet_hoa_don', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_hoa_don;
IF OBJECT_ID('dbo.hoa_don', 'U') IS NOT NULL DROP TABLE dbo.hoa_don;
IF OBJECT_ID('dbo.chi_tiet_gio_hang', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_gio_hang;
IF OBJECT_ID('dbo.gio_hang', 'U') IS NOT NULL DROP TABLE dbo.gio_hang;
IF OBJECT_ID('dbo.imei', 'U') IS NOT NULL DROP TABLE dbo.imei;
IF OBJECT_ID('dbo.hinh_anh_chi_tiet', 'U') IS NOT NULL DROP TABLE dbo.hinh_anh_chi_tiet;
IF OBJECT_ID('dbo.chi_tiet_khuyen_mai', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_khuyen_mai;
IF OBJECT_ID('dbo.chi_tiet_san_pham', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_san_pham;
IF OBJECT_ID('dbo.hinh_anh', 'U') IS NOT NULL DROP TABLE dbo.hinh_anh;
IF OBJECT_ID('dbo.san_pham', 'U') IS NOT NULL DROP TABLE dbo.san_pham;
IF OBJECT_ID('dbo.khuyen_mai', 'U') IS NOT NULL DROP TABLE dbo.khuyen_mai;
IF OBJECT_ID('dbo.voucher', 'U') IS NOT NULL DROP TABLE dbo.voucher;
IF OBJECT_ID('dbo.thanh_toan', 'U') IS NOT NULL DROP TABLE dbo.thanh_toan;
IF OBJECT_ID('dbo.nguoi_dung', 'U') IS NOT NULL DROP TABLE dbo.nguoi_dung;
IF OBJECT_ID('dbo.vai_tro', 'U') IS NOT NULL DROP TABLE dbo.vai_tro;
IF OBJECT_ID('dbo.danh_muc', 'U') IS NOT NULL DROP TABLE dbo.danh_muc;
IF OBJECT_ID('dbo.thuong_hieu', 'U') IS NOT NULL DROP TABLE dbo.thuong_hieu;
IF OBJECT_ID('dbo.mau_sac', 'U') IS NOT NULL DROP TABLE dbo.mau_sac;
IF OBJECT_ID('dbo.cpu', 'U') IS NOT NULL DROP TABLE dbo.cpu;
IF OBJECT_ID('dbo.ram', 'U') IS NOT NULL DROP TABLE dbo.ram;
IF OBJECT_ID('dbo.o_cung', 'U') IS NOT NULL DROP TABLE dbo.o_cung;
IF OBJECT_ID('dbo.card_do_hoa', 'U') IS NOT NULL DROP TABLE dbo.card_do_hoa;
IF OBJECT_ID('dbo.man_hinh', 'U') IS NOT NULL DROP TABLE dbo.man_hinh;
GO



-- 1. Vai trò
CREATE TABLE vai_tro (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_vai_tro NVARCHAR(50) NOT NULL
);
GO

-- 2. Người dùng
CREATE TABLE nguoi_dung (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    ten NVARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    dia_chi NVARCHAR(255),
    dien_thoai VARCHAR(20),
    email VARCHAR(100),
    id_vai_tro INT NOT NULL,
    CONSTRAINT FK_NguoiDung_VaiTro FOREIGN KEY (id_vai_tro) REFERENCES vai_tro(id)
);
GO

-- 3. Danh mục
CREATE TABLE danh_muc (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_danh_muc NVARCHAR(100) NOT NULL
);
GO

-- 4. Thương hiệu
CREATE TABLE thuong_hieu (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_thuong_hieu NVARCHAR(100) NOT NULL
);
GO

-- 5. Màu sắc
CREATE TABLE mau_sac (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_mau NVARCHAR(50) NOT NULL
);
GO

-- 6. CPU
CREATE TABLE cpu (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_cpu NVARCHAR(100) NOT NULL
);
GO

-- 7. RAM
CREATE TABLE ram (
    id INT IDENTITY(1,1) PRIMARY KEY,
    dung_luong NVARCHAR(50) NOT NULL,
    loai_ram NVARCHAR(50)
);
GO

-- 8. Ổ cứng
CREATE TABLE o_cung (
    id INT IDENTITY(1,1) PRIMARY KEY,
    loai_o_cung NVARCHAR(50) NOT NULL,
    dung_luong NVARCHAR(50) NOT NULL
);
GO

-- 9. Card đồ họa
CREATE TABLE card_do_hoa (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_card NVARCHAR(100) NOT NULL
);
GO

-- 10. Màn hình
CREATE TABLE man_hinh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    kich_thuoc NVARCHAR(50) NOT NULL,
    do_phan_giai NVARCHAR(50) NOT NULL,
    tan_so_quet NVARCHAR(50)
);
GO

-- 11. Sản phẩm
CREATE TABLE san_pham (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma_sp VARCHAR(50) UNIQUE NOT NULL,
    ten_sp NVARCHAR(200) NOT NULL,
    gia_co_ban DECIMAL(18, 2) DEFAULT 0,
    mo_ta NVARCHAR(MAX),
    id_danh_muc INT NOT NULL,
    id_thuong_hieu INT NOT NULL,
    CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (id_danh_muc) REFERENCES danh_muc(id),
    CONSTRAINT FK_SanPham_ThuongHieu FOREIGN KEY (id_thuong_hieu) REFERENCES thuong_hieu(id)
);
GO

-- 12. Hình ảnh sản phẩm
CREATE TABLE hinh_anh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    url_hinh_anh VARCHAR(500) NOT NULL,
    id_san_pham INT NOT NULL,
    CONSTRAINT FK_HinhAnh_SanPham FOREIGN KEY (id_san_pham) REFERENCES san_pham(id) ON DELETE CASCADE
);
GO

-- 13. Chi tiết sản phẩm (CTSP)
CREATE TABLE chi_tiet_san_pham (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma_ctsp VARCHAR(50) UNIQUE NOT NULL,
    id_san_pham INT NOT NULL,
    id_mau_sac INT NOT NULL,
    id_cpu INT NOT NULL,
    id_ram INT NOT NULL,
    id_o_cung INT NOT NULL,
    id_card_do_hoa INT NOT NULL,
    id_man_hinh INT NOT NULL,
    so_luong INT DEFAULT 0,
    gia DECIMAL(18, 2) NOT NULL,
    mo_ta NVARCHAR(MAX),
    trang_thai INT DEFAULT 1,
    CONSTRAINT FK_CTSP_SanPham FOREIGN KEY (id_san_pham) REFERENCES san_pham(id),
    CONSTRAINT FK_CTSP_MauSac FOREIGN KEY (id_mau_sac) REFERENCES mau_sac(id),
    CONSTRAINT FK_CTSP_CPU FOREIGN KEY (id_cpu) REFERENCES cpu(id),
    CONSTRAINT FK_CTSP_RAM FOREIGN KEY (id_ram) REFERENCES ram(id),
    CONSTRAINT FK_CTSP_OCung FOREIGN KEY (id_o_cung) REFERENCES o_cung(id),
    CONSTRAINT FK_CTSP_Card FOREIGN KEY (id_card_do_hoa) REFERENCES card_do_hoa(id),
    CONSTRAINT FK_CTSP_ManHinh FOREIGN KEY (id_man_hinh) REFERENCES man_hinh(id)
);
GO

-- 14. Hình ảnh chi tiết
CREATE TABLE hinh_anh_chi_tiet (
    id INT IDENTITY(1,1) PRIMARY KEY,
    url_hinh_anh VARCHAR(500) NOT NULL,
    id_ctsp INT NOT NULL,
    CONSTRAINT FK_HinhAnhCT_CTSP FOREIGN KEY (id_ctsp) REFERENCES chi_tiet_san_pham(id) ON DELETE CASCADE
);
GO

-- 15. IMEI
CREATE TABLE imei (
    id INT IDENTITY(1,1) PRIMARY KEY,
    so_imei VARCHAR(100) UNIQUE NOT NULL,
    id_chi_tiet_san_pham INT NOT NULL,
    trang_thai INT DEFAULT 0, 
    ngay_nhap DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_IMEI_CTSP FOREIGN KEY (id_chi_tiet_san_pham) REFERENCES chi_tiet_san_pham(id)
);
GO

-- 16. Giỏ hàng
CREATE TABLE gio_hang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    id_khach_hang INT NOT NULL,
    tong_so_tien DECIMAL(18, 2) DEFAULT 0,
    tong_so_luong INT DEFAULT 0,
    CONSTRAINT FK_GioHang_KhachHang FOREIGN KEY (id_khach_hang) REFERENCES nguoi_dung(id)
);
GO

-- 17. Chi tiết giỏ hàng
CREATE TABLE chi_tiet_gio_hang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50),
    so_luong INT NOT NULL DEFAULT 1,
    id_gio_hang INT NOT NULL,
    id_chi_tiet_san_pham INT NOT NULL,
    gia_tung_san_pham DECIMAL(18, 2) NOT NULL,
    CONSTRAINT FK_CTGioHang_GioHang FOREIGN KEY (id_gio_hang) REFERENCES gio_hang(id) ON DELETE CASCADE,
    CONSTRAINT FK_CTGioHang_CTSP FOREIGN KEY (id_chi_tiet_san_pham) REFERENCES chi_tiet_san_pham(id)
);
GO

-- 18. Phương thức thanh toán
CREATE TABLE thanh_toan (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    phuong_thuc NVARCHAR(100) NOT NULL,
    so_tien DECIMAL(18, 2) NOT NULL,
    trang_thai INT DEFAULT 0,
    ngay_thanh_toan DATETIME NULL
);
GO

-- 19. Voucher
CREATE TABLE voucher (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    ten_voucher NVARCHAR(200) NOT NULL,
    loai_giam INT NOT NULL,                     -- 1: Giảm %, 2: Giảm số tiền VNĐ
    gia_tri_giam DECIMAL(18, 2) NOT NULL,
    gia_tri_don_toi_thieu DECIMAL(18, 2) NOT NULL DEFAULT 0,
    giam_toi_da DECIMAL(18, 2) NULL,
    ngay_bat_dau DATETIME NOT NULL,
    ngay_ket_thuc DATETIME NOT NULL,
    trang_thai INT NOT NULL DEFAULT 1           -- 0: Ngừng hoạt động, 1: Đang hoạt động
);
GO

-- 20. Hóa đơn
CREATE TABLE hoa_don (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    id_khach_hang INT NOT NULL,
    dia_chi NVARCHAR(255) NOT NULL,
    dien_thoai VARCHAR(20) NOT NULL,
    ngay_tao DATETIME DEFAULT GETDATE(),
    ten_nguoi_nhan NVARCHAR(100) NOT NULL,
    trang_thai INT DEFAULT 0,
    id_thanh_toan INT,
    id_nhan_vien INT,
    id_voucher INT,
    tien_giam_voucher DECIMAL(18, 2) NOT NULL DEFAULT 0,
    mo_ta NVARCHAR(MAX),
    CONSTRAINT FK_HoaDon_KhachHang FOREIGN KEY (id_khach_hang) REFERENCES nguoi_dung(id),
    CONSTRAINT FK_HoaDon_ThanhToan FOREIGN KEY (id_thanh_toan) REFERENCES thanh_toan(id),
    CONSTRAINT FK_HoaDon_NhanVien FOREIGN KEY (id_nhan_vien) REFERENCES nguoi_dung(id),
    CONSTRAINT FK_HoaDon_Voucher FOREIGN KEY (id_voucher) REFERENCES voucher(id)
);
GO

-- 21. Chi tiết hóa đơn
CREATE TABLE chi_tiet_hoa_don (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50),
    id_hoa_don INT NOT NULL,
    id_chi_tiet_san_pham INT NOT NULL,
    so_luong INT NOT NULL,
    gia_tung_san_pham DECIMAL(18, 2) NOT NULL,
    CONSTRAINT FK_CTHoaDon_HoaDon FOREIGN KEY (id_hoa_don) REFERENCES hoa_don(id) ON DELETE CASCADE,
    CONSTRAINT FK_CTHoaDon_CTSP FOREIGN KEY (id_chi_tiet_san_pham) REFERENCES chi_tiet_san_pham(id)
);
GO

-- 22. Chi tiết hóa đơn - IMEI
CREATE TABLE chi_tiet_hoa_don_imei (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_chi_tiet_hoa_don INT NOT NULL,
    id_imei INT UNIQUE NOT NULL,
    CONSTRAINT FK_CTHD_IMEI_CTHD FOREIGN KEY (id_chi_tiet_hoa_don) REFERENCES chi_tiet_hoa_don(id) ON DELETE CASCADE,
    CONSTRAINT FK_CTHD_IMEI_IMEI FOREIGN KEY (id_imei) REFERENCES imei(id)
);
GO

-- 23. Lịch sử trạng thái hóa đơn
CREATE TABLE lich_su_hoa_don (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_hoa_don INT NOT NULL,
    trang_thai INT NOT NULL,
    thoi_gian DATETIME NOT NULL DEFAULT GETDATE(),
    id_nhan_vien INT NULL,
    ten_nguoi_thuc_hien NVARCHAR(100) NULL,
    ghi_chu NVARCHAR(500) NULL,
    CONSTRAINT FK_LSHoaDon_HoaDon FOREIGN KEY (id_hoa_don) REFERENCES hoa_don(id) ON DELETE CASCADE,
    CONSTRAINT FK_LSHoaDon_NhanVien FOREIGN KEY (id_nhan_vien) REFERENCES nguoi_dung(id)
);
GO

-- 24. Bảo hành
CREATE TABLE bao_hanh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma_phieu VARCHAR(50) UNIQUE NOT NULL,
    id_imei INT UNIQUE NOT NULL,
    ngay_kich_hoat DATETIME DEFAULT GETDATE(),
    ngay_het_han DATETIME NOT NULL,
    trang_thai INT DEFAULT 1,
    CONSTRAINT FK_BaoHanh_IMEI FOREIGN KEY (id_imei) REFERENCES imei(id)
);
GO

-- 24. Khuyến mãi sản phẩm
CREATE TABLE khuyen_mai (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    ten_km NVARCHAR(200) NOT NULL,
    loai_giam INT NOT NULL DEFAULT 1, -- 1: Giảm %, 2: Giảm số tiền
    gia_tri_giam DECIMAL(18, 2) NOT NULL DEFAULT 0,
    ngay_bat_dau DATETIME NOT NULL,
    ngay_ket_thuc DATETIME NOT NULL,
    trang_thai INT DEFAULT 1          -- 0: Ngừng hoạt động, 1: Hoạt động
);
GO

-- 25. Chi tiết khuyến mãi
CREATE TABLE chi_tiet_khuyen_mai (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma_ctkm VARCHAR(50),
    id_ctsp INT NOT NULL,
    id_khuyen_mai INT NOT NULL,
    CONSTRAINT FK_CTKM_CTSP FOREIGN KEY (id_ctsp) REFERENCES chi_tiet_san_pham(id) ON DELETE CASCADE,
    CONSTRAINT FK_CTKM_KhuyenMai FOREIGN KEY (id_khuyen_mai) REFERENCES khuyen_mai(id) ON DELETE CASCADE,
    CONSTRAINT UQ_CTKM_CTSP_KM UNIQUE (id_ctsp, id_khuyen_mai)
);
GO

/* ============================================================================
   INSERT DỮ LIỆU CHUẨN MỚI 100%
   ============================================================================ */

/* 1. BẢNG VAI TRÒ */
INSERT INTO vai_tro (ten_vai_tro) VALUES
(N'Quản trị viên'), -- ID 1
(N'Nhân viên'),     -- ID 2
(N'Khách hàng');    -- ID 3
GO

/* 2. BẢNG NGƯỜI DÙNG */
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

/* 3. GIỎ HÀNG KHỞI TẠO CHO KHÁCH HÀNG */
INSERT INTO gio_hang (ma, id_khach_hang, tong_so_tien, tong_so_luong)
SELECT 'GH0001', id, 0, 0 FROM nguoi_dung WHERE username = 'nguyenvanan';

INSERT INTO gio_hang (ma, id_khach_hang, tong_so_tien, tong_so_luong)
SELECT 'GH0002', id, 0, 0 FROM nguoi_dung WHERE username = 'tranthibinh';

INSERT INTO gio_hang (ma, id_khach_hang, tong_so_tien, tong_so_luong)
SELECT 'GH0003', id, 0, 0 FROM nguoi_dung WHERE username = 'lehoangnam';
GO

/* 4. THUỘC TÍNH SẢN PHẨM */
-- CPU (10 mẫu)
INSERT INTO cpu (ten_cpu) VALUES
(N'Intel Core i5-12450H'),
(N'Intel Core i5-13500H'),
(N'Intel Core i7-13700H'),
(N'Intel Core i9-13900HX'),
(N'Intel Core Ultra 7 155H'),
(N'AMD Ryzen 5 7535HS'),
(N'AMD Ryzen 7 7735HS'),
(N'AMD Ryzen 7 7840HS'),
(N'AMD Ryzen 9 7940HS'),
(N'Apple M3 Pro Chip');

-- Card đồ họa (10 mẫu)
INSERT INTO card_do_hoa (ten_card) VALUES
(N'NVIDIA GeForce RTX 3050 4GB'),
(N'NVIDIA GeForce RTX 4050 6GB'),
(N'NVIDIA GeForce RTX 4060 8GB'),
(N'NVIDIA GeForce RTX 4070 8GB'),
(N'NVIDIA GeForce RTX 4080 12GB'),
(N'AMD Radeon RX 7600S 8GB'),
(N'AMD Radeon 680M'),
(N'AMD Radeon 780M'),
(N'Intel Iris Xe Graphics'),
(N'Apple 14-Core GPU');

-- Danh mục (5 cái)
INSERT INTO danh_muc (ten_danh_muc) VALUES
(N'Laptop Gaming'),
(N'Laptop Đồ Họa - Kỹ Thuật'),
(N'Laptop Mỏng Nhẹ - Cao Cấp'),
(N'Laptop Học Tập - Văn Phòng'),
(N'Laptop Doanh Nhân');

-- Thương hiệu (5 hãng)
INSERT INTO thuong_hieu (ten_thuong_hieu) VALUES
(N'ASUS'),
(N'Dell'),
(N'Lenovo'),
(N'Acer'),
(N'HP');

-- RAM (5 cái)
INSERT INTO ram (dung_luong, loai_ram) VALUES
(N'8GB', N'DDR4 3200MHz'),
(N'16GB', N'DDR4 3200MHz'),
(N'16GB', N'DDR5 4800MHz'),
(N'32GB', N'DDR5 5200MHz'),
(N'64GB', N'DDR5 5600MHz');

-- Ổ cứng (5 cái)
INSERT INTO o_cung (loai_o_cung, dung_luong) VALUES
(N'SSD NVMe PCIe Gen3', N'256GB'),
(N'SSD NVMe PCIe Gen4', N'512GB'),
(N'SSD NVMe PCIe Gen4', N'1TB'),
(N'SSD NVMe PCIe Gen4', N'2TB'),
(N'SSD NVMe PCIe Gen3', N'512GB');

-- Màn hình (5 cái)
INSERT INTO man_hinh (kich_thuoc, do_phan_giai, tan_so_quet) VALUES
(N'14.0 inch', N'Full HD (1920x1080) IPS', N'60Hz'),
(N'14.0 inch', N'2.8K (2880x1800) OLED', N'120Hz'),
(N'15.6 inch', N'Full HD (1920x1080) IPS', N'144Hz'),
(N'15.6 inch', N'2K QHD (2560x1440) IPS', N'165Hz'),
(N'16.0 inch', N'WQXGA (2560x1600) IPS', N'165Hz');

-- Màu sắc (5 cái)
INSERT INTO mau_sac (ten_mau) VALUES
(N'Xám không gian (Space Gray)'),
(N'Đen bóng đêm (Midnight Black)'),
(N'Bạc ánh trăng (Luna Silver)'),
(N'Trắng tuyết (Glacier White)'),
(N'Xanh đậm (Dark Blue)');
GO

/* 5. BẢNG SẢN PHẨM (Mỗi hãng 3 sản phẩm = 15 sản phẩm) */
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

/* 6. HÌNH ẢNH SẢN PHẨM */
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

/* 7. CHI TIẾT SẢN PHẨM (Mỗi sản phẩm 3 cấu hình = 45 CTSP, so_luong = 5) */
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

/* 8. HÌNH ẢNH CHO 45 CHI TIẾT SẢN PHẨM */
INSERT INTO hinh_anh_chi_tiet (url_hinh_anh, id_ctsp)
SELECT h.url_hinh_anh, ct.id
FROM chi_tiet_san_pham ct
JOIN hinh_anh h ON h.id_san_pham = ct.id_san_pham;
GO

/* 9. BẢNG IMEI (Mỗi cấu hình 5 IMEI x 45 CTSP = 225 IMEI, trang_thai = 0 Trong kho) */
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

/* 10. VOUCHER HÓA ĐƠN */
INSERT INTO voucher 
(ma, ten_voucher, loai_giam, gia_tri_giam, gia_tri_don_toi_thieu, giam_toi_da, ngay_bat_dau, ngay_ket_thuc, trang_thai)
VALUES
('SALE10', N'Voucher Siêu Sale 10%', 1, 10, 15000000, 2000000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('SALE500K', N'Voucher Giảm 500.000đ Toàn Đơn', 2, 500000, 10000000, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('VIPMEMBER', N'Ưu Đãi Khách Thân Thiết 1.000.000đ', 2, 1000000, 25000000, NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1);
GO

/* 11. KHUYẾN MÃI SẢN PHẨM */
INSERT INTO khuyen_mai 
(ma, ten_km, loai_giam, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc, trang_thai)
VALUES
('KM_HOT_SALE', N'Siêu Sale Khai Xuân 2026', 1, 10, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('KM_GAMING', N'Tuần Lễ Laptop Gaming', 2, 1500000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('KM_STUDENT', N'Ưu Đãi Tân Sinh Viên', 1, 5, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1);
GO

-- Gán Khuyến Mãi vào một số CTSP:
INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_01', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP001' AND km.ma = 'KM_HOT_SALE';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_04', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP004' AND km.ma = 'KM_HOT_SALE';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_10', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP010' AND km.ma = 'KM_HOT_SALE';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_28', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP028' AND km.ma = 'KM_HOT_SALE';

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

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_22', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP022' AND km.ma = 'KM_STUDENT';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_25', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP025' AND km.ma = 'KM_STUDENT';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_37', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP037' AND km.ma = 'KM_STUDENT';

INSERT INTO chi_tiet_khuyen_mai (ma_ctkm, id_ctsp, id_khuyen_mai)
SELECT 'CTKM_40', ct.id, km.id FROM chi_tiet_san_pham ct, khuyen_mai km WHERE ct.ma_ctsp = 'CTSP040' AND km.ma = 'KM_STUDENT';
GO

PRINT N'=== ĐÃ KHỞI TẠO BẢNG VÀ INSERT DỮ LIỆU LAPTOP STORE THÀNH CÔNG RỰC RỠ! ===';
GO