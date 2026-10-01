USE LaptopStoreDB;
GO

IF NOT EXISTS (SELECT 1 FROM nguoi_dung WHERE ma = 'NV002')
BEGIN
    INSERT INTO nguoi_dung (ma, ten, username, password, dia_chi, dien_thoai, email, id_vai_tro)
    VALUES ('NV002', N'Trần Văn Hùng', 'nhanvien02', '123456', N'Hà Nội', '0945678901', 'hung@laptopstore.vn', 2);
END
GO

DECLARE @maiId INT, @hungId INT, @adminId INT;
SELECT @maiId = id FROM nguoi_dung WHERE ma = 'NV001';
SELECT @hungId = id FROM nguoi_dung WHERE ma = 'NV002';
SELECT @adminId = id FROM nguoi_dung WHERE ma = 'ADMIN001';

UPDATE hoa_don SET id_nhan_vien = @maiId WHERE ma IN ('HD001', 'HD004');
UPDATE hoa_don SET id_nhan_vien = @hungId WHERE ma IN ('HD002', 'HD003');
UPDATE hoa_don SET id_nhan_vien = @adminId WHERE ma IN ('HD005');

SELECT h.ma, h.ten_nguoi_nhan, n.ma AS ma_nv, n.ten AS ten_nv 
FROM hoa_don h LEFT JOIN nguoi_dung n ON h.id_nhan_vien = n.id;
GO
