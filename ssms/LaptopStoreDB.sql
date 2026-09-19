
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LaptopStoreDB')
BEGIN
    CREATE DATABASE LaptopStoreDB;
END
GO

USE LaptopStoreDB;
GO

IF OBJECT_ID('dbo.vai_tro', 'U') IS NOT NULL DROP TABLE dbo.vai_tro;
CREATE TABLE vai_tro (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_vai_tro NVARCHAR(50) NOT NULL
);
GO

IF OBJECT_ID('dbo.nguoi_dung', 'U') IS NOT NULL DROP TABLE dbo.nguoi_dung;
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

IF OBJECT_ID('dbo.danh_muc', 'U') IS NOT NULL DROP TABLE dbo.danh_muc;
CREATE TABLE danh_muc (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_danh_muc NVARCHAR(100) NOT NULL
);
GO

IF OBJECT_ID('dbo.thuong_hieu', 'U') IS NOT NULL DROP TABLE dbo.thuong_hieu;
CREATE TABLE thuong_hieu (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_thuong_hieu NVARCHAR(100) NOT NULL
);
GO

IF OBJECT_ID('dbo.san_pham', 'U') IS NOT NULL DROP TABLE dbo.san_pham;
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

IF OBJECT_ID('dbo.hinh_anh', 'U') IS NOT NULL DROP TABLE dbo.hinh_anh;
CREATE TABLE hinh_anh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    url_hinh_anh VARCHAR(500) NOT NULL,
    id_san_pham INT NOT NULL,
    CONSTRAINT FK_HinhAnh_SanPham FOREIGN KEY (id_san_pham) REFERENCES san_pham(id) ON DELETE CASCADE
);
GO

IF OBJECT_ID('dbo.mau_sac', 'U') IS NOT NULL DROP TABLE dbo.mau_sac;
CREATE TABLE mau_sac (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_mau NVARCHAR(50) NOT NULL
);
GO

IF OBJECT_ID('dbo.cpu', 'U') IS NOT NULL DROP TABLE dbo.cpu;
CREATE TABLE cpu (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_cpu NVARCHAR(100) NOT NULL
);
GO

IF OBJECT_ID('dbo.ram', 'U') IS NOT NULL DROP TABLE dbo.ram;
CREATE TABLE ram (
    id INT IDENTITY(1,1) PRIMARY KEY,
    dung_luong NVARCHAR(50) NOT NULL,
    loai_ram NVARCHAR(50)
);
GO

IF OBJECT_ID('dbo.o_cung', 'U') IS NOT NULL DROP TABLE dbo.o_cung;
CREATE TABLE o_cung (
    id INT IDENTITY(1,1) PRIMARY KEY,
    loai_o_cung NVARCHAR(50) NOT NULL,
    dung_luong NVARCHAR(50) NOT NULL
);
GO

IF OBJECT_ID('dbo.card_do_hoa', 'U') IS NOT NULL DROP TABLE dbo.card_do_hoa;
CREATE TABLE card_do_hoa (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_card NVARCHAR(100) NOT NULL
);
GO

IF OBJECT_ID('dbo.man_hinh', 'U') IS NOT NULL DROP TABLE dbo.man_hinh;
CREATE TABLE man_hinh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    kich_thuoc NVARCHAR(50) NOT NULL,
    do_phan_giai NVARCHAR(50) NOT NULL,
    tan_so_quet NVARCHAR(50)
);
GO

IF OBJECT_ID('dbo.chi_tiet_san_pham', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_san_pham;
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

IF OBJECT_ID('dbo.hinh_anh_chi_tiet', 'U') IS NOT NULL DROP TABLE dbo.hinh_anh_chi_tiet;
CREATE TABLE hinh_anh_chi_tiet (
    id INT IDENTITY(1,1) PRIMARY KEY,
    url_hinh_anh VARCHAR(500) NOT NULL,
    id_ctsp INT NOT NULL,
    CONSTRAINT FK_HinhAnhCT_CTSP FOREIGN KEY (id_ctsp) REFERENCES chi_tiet_san_pham(id) ON DELETE CASCADE
);
GO

IF OBJECT_ID('dbo.imei', 'U') IS NOT NULL DROP TABLE dbo.imei;
CREATE TABLE imei (
    id INT IDENTITY(1,1) PRIMARY KEY,
    so_imei VARCHAR(100) UNIQUE NOT NULL,
    id_chi_tiet_san_pham INT NOT NULL,
    trang_thai INT DEFAULT 0, 
    ngay_nhap DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_IMEI_CTSP FOREIGN KEY (id_chi_tiet_san_pham) REFERENCES chi_tiet_san_pham(id)
);
GO

IF OBJECT_ID('dbo.gio_hang', 'U') IS NOT NULL DROP TABLE dbo.gio_hang;
CREATE TABLE gio_hang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    id_khach_hang INT NOT NULL,
    tong_so_tien DECIMAL(18, 2) DEFAULT 0,
    tong_so_luong INT DEFAULT 0,
    CONSTRAINT FK_GioHang_KhachHang FOREIGN KEY (id_khach_hang) REFERENCES nguoi_dung(id)
);
GO

IF OBJECT_ID('dbo.chi_tiet_gio_hang', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_gio_hang;
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

IF OBJECT_ID('dbo.thanh_toan', 'U') IS NOT NULL DROP TABLE dbo.thanh_toan;
CREATE TABLE thanh_toan (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    phuong_thuc NVARCHAR(100) NOT NULL,
    so_tien DECIMAL(18, 2) NOT NULL,
    ngay_thanh_toan DATETIME DEFAULT GETDATE()
);
GO

IF OBJECT_ID('dbo.hoa_don', 'U') IS NOT NULL DROP TABLE dbo.hoa_don;
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
    mo_ta NVARCHAR(MAX),
    CONSTRAINT FK_HoaDon_KhachHang FOREIGN KEY (id_khach_hang) REFERENCES nguoi_dung(id),
    CONSTRAINT FK_HoaDon_ThanhToan FOREIGN KEY (id_thanh_toan) REFERENCES thanh_toan(id),
    CONSTRAINT FK_HoaDon_NhanVien FOREIGN KEY (id_nhan_vien) REFERENCES nguoi_dung(id)
);
GO

IF OBJECT_ID('dbo.chi_tiet_hoa_don', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_hoa_don;
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

IF OBJECT_ID('dbo.chi_tiet_hoa_don_imei', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_hoa_don_imei;
CREATE TABLE chi_tiet_hoa_don_imei (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_chi_tiet_hoa_don INT NOT NULL,
    id_imei INT UNIQUE NOT NULL,
    CONSTRAINT FK_CTHD_IMEI_CTHD FOREIGN KEY (id_chi_tiet_hoa_don) REFERENCES chi_tiet_hoa_don(id) ON DELETE CASCADE,
    CONSTRAINT FK_CTHD_IMEI_IMEI FOREIGN KEY (id_imei) REFERENCES imei(id)
);
GO

IF OBJECT_ID('dbo.bao_hanh', 'U') IS NOT NULL DROP TABLE dbo.bao_hanh;
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

IF OBJECT_ID('dbo.khuyen_mai', 'U') IS NOT NULL DROP TABLE dbo.khuyen_mai;
CREATE TABLE khuyen_mai (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma VARCHAR(50) UNIQUE NOT NULL,
    ten_km NVARCHAR(200) NOT NULL,
    phan_tram_giam DECIMAL(5, 2),
    ngay_bat_dau DATETIME NOT NULL,
    ngay_ket_thuc DATETIME NOT NULL
);
GO

IF OBJECT_ID('dbo.chi_tiet_khuyen_mai', 'U') IS NOT NULL DROP TABLE dbo.chi_tiet_khuyen_mai;
CREATE TABLE chi_tiet_khuyen_mai (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma_ctkm VARCHAR(50),
    id_sp INT NOT NULL,
    id_khuyen_mai INT NOT NULL,
    CONSTRAINT FK_CTKM_SanPham FOREIGN KEY (id_sp) REFERENCES san_pham(id) ON DELETE CASCADE,
    CONSTRAINT FK_CTKM_KhuyenMai FOREIGN KEY (id_khuyen_mai) REFERENCES khuyen_mai(id) ON DELETE CASCADE
);
GO

USE LaptopStoreDB;
GO

/* =========================================================
   1. VAI TRÒ
   ========================================================= */
INSERT INTO vai_tro (ten_vai_tro)
VALUES
(N'Quản trị viên'),
(N'Nhân viên'),
(N'Khách hàng');
GO


/* =========================================================
   2. NGƯỜI DÙNG / KHÁCH HÀNG
   ========================================================= */
INSERT INTO nguoi_dung
(ma, ten, username, password, dia_chi, dien_thoai, email, id_vai_tro)
VALUES
('KH001', N'Nguyễn Văn An', 'nguyenvanan', '123456',
 N'Hà Nội', '0901234567', 'an@gmail.com', 3),

('KH002', N'Trần Minh Đức', 'tranminhduc', '123456',
 N'Phú Thọ', '0912345678', 'duc@gmail.com', 3),

('KH003', N'Lê Hoàng Nam', 'lehoangnam', '123456',
 N'Hải Phòng', '0923456789', 'nam@gmail.com', 3),

('NV001', N'Nguyễn Thị Mai', 'nhanvien01', '123456',
 N'Hà Nội', '0934567890', 'mai@laptopstore.vn', 2),

('ADMIN001', N'Admin', 'admin', '123456',
 N'Hà Nội', '0999999999', 'admin@laptopstore.vn', 1);
GO


/* =========================================================
   3. DANH MỤC
   ========================================================= */
INSERT INTO danh_muc (ten_danh_muc)
VALUES
(N'Laptop Gaming'),
(N'Laptop Văn phòng'),
(N'Laptop Đồ họa'),
(N'Laptop Mỏng nhẹ');
GO


/* =========================================================
   4. THƯƠNG HIỆU
   ========================================================= */
INSERT INTO thuong_hieu (ten_thuong_hieu)
VALUES
(N'ASUS'),
(N'Dell'),
(N'Lenovo'),
(N'Acer'),
(N'HP');
GO


/* =========================================================
   5. MÀU SẮC
   ========================================================= */
INSERT INTO mau_sac (ten_mau)
VALUES
(N'Đen'),
(N'Xám'),
(N'Bạc'),
(N'Xanh');
GO


/* =========================================================
   6. CPU
   ========================================================= */
INSERT INTO cpu (ten_cpu)
VALUES
(N'Intel Core i5-13420H'),
(N'Intel Core i7-13620H'),
(N'Intel Core Ultra 5 125H'),
(N'AMD Ryzen 5 7535HS'),
(N'AMD Ryzen 7 8845HS');
GO


/* =========================================================
   7. RAM
   ========================================================= */
INSERT INTO ram (dung_luong, loai_ram)
VALUES
(N'8GB',  N'DDR4'),
(N'16GB', N'DDR4'),
(N'16GB', N'DDR5'),
(N'32GB', N'DDR5');
GO


/* =========================================================
   8. Ổ CỨNG
   ========================================================= */
INSERT INTO o_cung (loai_o_cung, dung_luong)
VALUES
(N'SSD NVMe', N'256GB'),
(N'SSD NVMe', N'512GB'),
(N'SSD NVMe', N'1TB'),
(N'SSD NVMe', N'2TB');
GO


/* =========================================================
   9. CARD ĐỒ HỌA
   ========================================================= */
INSERT INTO card_do_hoa (ten_card)
VALUES
(N'Intel Iris Xe Graphics'),
(N'Intel Arc Graphics'),
(N'NVIDIA GeForce RTX 3050 6GB'),
(N'NVIDIA GeForce RTX 4050 6GB'),
(N'NVIDIA GeForce RTX 4060 8GB'),
(N'AMD Radeon 780M');
GO


/* =========================================================
   10. MÀN HÌNH
   ========================================================= */
INSERT INTO man_hinh (kich_thuoc, do_phan_giai, tan_so_quet)
VALUES
(N'14 inch',   N'1920x1200', N'60Hz'),
(N'14 inch',   N'2880x1800', N'120Hz'),
(N'15.6 inch', N'1920x1080', N'144Hz'),
(N'16 inch',   N'2560x1600', N'165Hz');
GO


/* =========================================================
   11. SẢN PHẨM
   ========================================================= */
INSERT INTO san_pham
(ma_sp, ten_sp, gia_co_ban, mo_ta, id_danh_muc, id_thuong_hieu)
VALUES
(
    'SP001',
    N'ASUS TUF Gaming A15',
    18990000,
    N'Laptop gaming hiệu năng cao, phù hợp chơi game và học tập.',
    1,
    1
),
(
    'SP002',
    N'ASUS Zenbook 14 OLED',
    22990000,
    N'Laptop mỏng nhẹ với màn hình OLED, phù hợp văn phòng và di chuyển.',
    4,
    1
),
(
    'SP003',
    N'Dell Inspiron 15',
    15990000,
    N'Laptop văn phòng phù hợp học tập và công việc.',
    2,
    2
),
(
    'SP004',
    N'Lenovo Legion 5',
    26990000,
    N'Laptop gaming hiệu năng cao với màn hình tần số quét cao.',
    1,
    3
),
(
    'SP005',
    N'Acer Nitro V 15',
    19990000,
    N'Laptop gaming phổ thông với GPU NVIDIA GeForce RTX.',
    1,
    4
);
GO


/* =========================================================
   12. CHI TIẾT SẢN PHẨM / CẤU HÌNH
   ========================================================= */
INSERT INTO chi_tiet_san_pham
(
    ma_ctsp,
    id_san_pham,
    id_mau_sac,
    id_cpu,
    id_ram,
    id_o_cung,
    id_card_do_hoa,
    id_man_hinh,
    so_luong,
    gia,
    mo_ta,
    trang_thai
)
VALUES

/* ASUS TUF Gaming A15 - cấu hình 1 */
(
    'CTSP001',
    1,              -- ASUS TUF
    1,              -- Đen
    4,              -- Ryzen 5 7535HS
    3,              -- 16GB DDR5
    2,              -- SSD 512GB
    4,              -- RTX 4050
    3,              -- 15.6 FHD 144Hz
    3,
    18990000,
    N'Ryzen 5 7535HS / RAM 16GB / SSD 512GB / RTX 4050',
    1
),

/* ASUS TUF Gaming A15 - cấu hình 2 */
(
    'CTSP002',
    1,
    1,
    5,              -- Ryzen 7 8845HS
    4,              -- 32GB DDR5
    3,              -- SSD 1TB
    5,              -- RTX 4060
    3,
    5,
    24990000,
    N'Ryzen 7 8845HS / RAM 32GB / SSD 1TB / RTX 4060',
    1
),

/* ASUS Zenbook 14 OLED */
(
    'CTSP003',
    2,
    2,              -- Xám
    3,              -- Core Ultra 5
    3,              -- 16GB DDR5
    2,              -- 512GB
    2,              -- Intel Arc
    2,              -- 14 inch OLED 120Hz
    4,
    22990000,
    N'Core Ultra 5 / RAM 16GB / SSD 512GB / Intel Arc',
    1
),

/* Dell Inspiron 15 */
(
    'CTSP004',
    3,
    3,              -- Bạc
    1,              -- i5
    2,              -- 16GB DDR4
    2,              -- 512GB
    1,              -- Iris Xe
    3,
    2,
    15990000,
    N'Core i5 / RAM 16GB / SSD 512GB / Intel Iris Xe',
    1
),

/* Lenovo Legion 5 */
(
    'CTSP005',
    4,
    2,
    2,              -- i7
    4,              -- 32GB
    3,              -- 1TB
    5,              -- RTX 4060
    4,              -- 16 inch 165Hz
    3,
    28990000,
    N'Core i7 / RAM 32GB / SSD 1TB / RTX 4060',
    1
),

/* Acer Nitro V */
(
    'CTSP006',
    5,
    1,
    1,
    3,
    2,
    4,
    3,
    3,
    19990000,
    N'Core i5 / RAM 16GB / SSD 512GB / RTX 4050',
    1
);
GO


/* =========================================================
   13. HÌNH ẢNH SẢN PHẨM
   ========================================================= */
INSERT INTO hinh_anh (url_hinh_anh, id_san_pham)
VALUES
('https://example.com/images/asus-tuf-a15.jpg', 1),
('https://example.com/images/asus-zenbook-14.jpg', 2),
('https://example.com/images/dell-inspiron-15.jpg', 3),
('https://example.com/images/lenovo-legion-5.jpg', 4),
('https://example.com/images/acer-nitro-v15.jpg', 5);
GO


/* =========================================================
   14. HÌNH ẢNH CHI TIẾT
   ========================================================= */
INSERT INTO hinh_anh_chi_tiet (url_hinh_anh, id_ctsp)
VALUES
('https://example.com/images/tuf-a15-16gb-512gb-1.jpg', 1),
('https://example.com/images/tuf-a15-16gb-512gb-2.jpg', 1),

('https://example.com/images/tuf-a15-32gb-1tb-1.jpg', 2),

('https://example.com/images/zenbook-14-gray-1.jpg', 3),

('https://example.com/images/dell-inspiron-silver-1.jpg', 4),

('https://example.com/images/legion-5-gray-1.jpg', 5),

('https://example.com/images/nitro-v15-black-1.jpg', 6);
GO


/* =========================================================
   15. IMEI / SERIAL CỦA TỪNG LAPTOP VẬT LÝ
   ========================================================= */
INSERT INTO imei
(so_imei, id_chi_tiet_san_pham, trang_thai)
VALUES

/* CTSP001 - số lượng 3 */
('ASUSTUF00100001', 1, 0),
('ASUSTUF00100002', 1, 0),
('ASUSTUF00100003', 1, 0),

/* CTSP002 - số lượng 5 */
('ASUSTUF00200001', 2, 0),
('ASUSTUF00200002', 2, 0),
('ASUSTUF00200003', 2, 0),
('ASUSTUF00200004', 2, 0),
('ASUSTUF00200005', 2, 0),

/* CTSP003 - số lượng 4 */
('ZENBOOK00300001', 3, 0),
('ZENBOOK00300002', 3, 0),
('ZENBOOK00300003', 3, 0),
('ZENBOOK00300004', 3, 0),

/* CTSP004 - số lượng 2 */
('DELL00400001', 4, 0),
('DELL00400002', 4, 0),

/* CTSP005 - số lượng 3 */
('LEGION00500001', 5, 0),
('LEGION00500002', 5, 0),
('LEGION00500003', 5, 0),

/* CTSP006 - số lượng 3 */
('ACERNITRO00600001', 6, 0),
('ACERNITRO00600002', 6, 0),
('ACERNITRO00600003', 6, 0);
GO