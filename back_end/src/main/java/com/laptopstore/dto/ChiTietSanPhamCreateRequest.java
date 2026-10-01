package com.laptopstore.dto;

import com.laptopstore.entity.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietSanPhamCreateRequest {
    private Integer id;
    private String maCtsp;

    // Both flat IDs and nested entity objects supported
    private Integer idSanPham;
    private SanPham sanPham;

    private Integer idMauSac;
    private MauSac mauSac;

    private Integer idCpu;
    private Cpu cpu;

    private Integer idRam;
    private Ram ram;

    private Integer idOCung;
    private OCung oCung;

    private Integer idCardDoHoa;
    private CardDoHoa cardDoHoa;

    private Integer idManHinh;
    private ManHinh manHinh;

    private BigDecimal gia;
    private Integer soLuong;
    private String moTa;
    private Integer trangThai;

    private List<String> danhSachImei;
}
