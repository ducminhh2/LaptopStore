package com.laptopstore.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyRequestResponseDTO {

    private Integer id;
    private String maYeuCau;

    // Liên kết Phiếu Bảo Hành & IMEI
    private Integer idBaoHanh;
    private String maPhieuBaoHanh;
    private Integer idImei;
    private String soImei;

    // Laptop
    private String tenLaptop;
    private String cauHinh;
    private String hinhAnh;
    private String maHoaDon;

    // Khách hàng
    private Integer idKhachHang;
    private String tenKhachHang;
    private String emailKhachHang;
    private String dienThoaiLienHe;
    private String ghiChuKhachHang;

    // Nội dung sự cố
    private String moTaLoi;

    // Tiến trình xử lý (ngày giờ)
    private LocalDateTime ngayGui;           // Mapping từ ngayYeuCau
    private LocalDateTime ngayTiepNhan;
    private LocalDateTime ngayBatDauXuLy;
    private LocalDateTime ngayHoanThanh;

    // Nhân viên phụ trách
    private Integer idNhanVien;
    private String tenNhanVien;             // "Nguyễn Minh Đức (NV001)" hoặc null nếu chưa tiếp nhận

    // Trạng thái INT (0..4) - Không dùng Enum
    private Integer trangThai;

    // Kết quả & Lý do
    private String ghiChuXuLy;
    private String lyDoTuChoi;

    // Snapshot thời hạn bảo hành gốc
    private LocalDateTime ngayKichHoatBaoHanh;
    private LocalDateTime ngayHetHanBaoHanh;
    private Integer thoiHanThang;
    private Integer trangThaiBaoHanh;
    private String statusKeyBaoHanh;

    // Trạng thái cho phép tạo yêu cầu mới (Bước 4)
    private Boolean canCreateRequest;
    private String message;
}
