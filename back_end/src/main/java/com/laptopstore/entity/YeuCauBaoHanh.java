package com.laptopstore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "yeu_cau_bao_hanh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YeuCauBaoHanh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_yeu_cau", unique = true, nullable = false, length = 50)
    private String maYeuCau;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_bao_hanh", nullable = false)
    private BaoHanh baoHanh;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_khach_hang", nullable = false)
    private NguoiDung khachHang;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_nhan_vien")
    private NguoiDung nhanVien;

    @Column(name = "mo_ta_loi", nullable = false, length = 1000)
    private String moTaLoi;

    @Column(name = "dien_thoai_lien_he", nullable = false, length = 20)
    private String dienThoaiLienHe;

    @Column(name = "ghi_chu_khach_hang", length = 500)
    private String ghiChuKhachHang;

    @Column(name = "ngay_yeu_cau", nullable = false)
    @Builder.Default
    private LocalDateTime ngayYeuCau = LocalDateTime.now();

    @Column(name = "ngay_tiep_nhan")
    private LocalDateTime ngayTiepNhan;

    @Column(name = "ngay_bat_dau_xu_ly")
    private LocalDateTime ngayBatDauXuLy;

    @Column(name = "ngay_hoan_thanh")
    private LocalDateTime ngayHoanThanh;

    /**
     * Trạng thái yêu cầu (Sử dụng INT thuần túy, tuyệt đối KHÔNG dùng Enum theo quy ước):
     * 0: Chờ tiếp nhận
     * 1: Đã tiếp nhận
     * 2: Đang xử lý
     * 3: Hoàn thành
     * 4: Từ chối
     */
    @Column(name = "trang_thai", nullable = false)
    @Builder.Default
    private Integer trangThai = 0;

    @Column(name = "ghi_chu_xu_ly", length = 1000)
    private String ghiChuXuLy;

    @Column(name = "ly_do_tu_choi", length = 1000)
    private String lyDoTuChoi;
}
