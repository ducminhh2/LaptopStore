-- ============================================================================
-- TẠO BẢNG YÊU CẦU BẢO HÀNH (yeu_cau_bao_hanh) - BƯỚC 2
-- ============================================================================
USE LaptopStoreDB;
GO

IF OBJECT_ID('dbo.yeu_cau_bao_hanh', 'U') IS NULL
BEGIN
    CREATE TABLE yeu_cau_bao_hanh (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ma_yeu_cau VARCHAR(50) NOT NULL UNIQUE,
        id_bao_hanh INT NOT NULL,
        id_khach_hang INT NOT NULL,
        id_nhan_vien INT NULL,
        mo_ta_loi NVARCHAR(1000) NOT NULL,
        dien_thoai_lien_he VARCHAR(20) NOT NULL,
        ghi_chu_khach_hang NVARCHAR(500) NULL,
        ngay_yeu_cau DATETIME NOT NULL DEFAULT GETDATE(),
        ngay_tiep_nhan DATETIME NULL,
        ngay_bat_dau_xu_ly DATETIME NULL,
        ngay_hoan_thanh DATETIME NULL,
        trang_thai INT NOT NULL DEFAULT 0,
        ghi_chu_xu_ly NVARCHAR(1000) NULL,
        ly_do_tu_choi NVARCHAR(1000) NULL,

        CONSTRAINT FK_YCBH_BaoHanh
            FOREIGN KEY (id_bao_hanh)
            REFERENCES bao_hanh(id),

        CONSTRAINT FK_YCBH_KhachHang
            FOREIGN KEY (id_khach_hang)
            REFERENCES nguoi_dung(id),

        CONSTRAINT FK_YCBH_NhanVien
            FOREIGN KEY (id_nhan_vien)
            REFERENCES nguoi_dung(id),

        CONSTRAINT CK_YCBH_TrangThai
            CHECK (trang_thai IN (0, 1, 2, 3, 4))
    );

    CREATE INDEX IX_YCBH_BaoHanh ON yeu_cau_bao_hanh(id_bao_hanh);
    CREATE INDEX IX_YCBH_KhachHang ON yeu_cau_bao_hanh(id_khach_hang);
    CREATE INDEX IX_YCBH_NhanVien ON yeu_cau_bao_hanh(id_nhan_vien);
    CREATE INDEX IX_YCBH_TrangThai ON yeu_cau_bao_hanh(trang_thai);
    CREATE INDEX IX_YCBH_NgayYeuCau ON yeu_cau_bao_hanh(ngay_yeu_cau);

    PRINT 'Đã tạo thành công bảng yeu_cau_bao_hanh và các index liên quan.';
END
ELSE
BEGIN
    PRINT 'Bảng yeu_cau_bao_hanh đã tồn tại, không cần tạo lại.';
END
GO
