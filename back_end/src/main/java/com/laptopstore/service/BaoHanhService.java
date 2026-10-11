package com.laptopstore.service;

import com.laptopstore.dto.WarrantyResponseDTO;
import com.laptopstore.dto.WarrantyStatsDTO;
import com.laptopstore.entity.BaoHanh;

import java.util.List;

public interface BaoHanhService {
    List<BaoHanh> getAll();
    BaoHanh getById(Integer id);
    BaoHanh getByMaPhieu(String maPhieu);
    BaoHanh getByImei(Integer imeiId);
    BaoHanh getBySoImei(String soImei);
    BaoHanh create(BaoHanh baoHanh);
    BaoHanh update(Integer id, BaoHanh baoHanh);
    void delete(Integer id);

    // ==========================================
    // BƯỚC 2: CÁC PHƯƠNG THỨC ĐỒNG BỘ DỮ LIỆU ĐỌC
    // ==========================================
    WarrantyStatsDTO getWarrantyStats();

    List<WarrantyResponseDTO> getAdminWarrantyList(String search, String status);

    WarrantyResponseDTO getAdminWarrantyDetail(Integer id);

    List<WarrantyResponseDTO> getCustomerWarrantyList(Integer customerId);

    WarrantyResponseDTO getCustomerWarrantyDetail(Integer id, Integer customerId);

    // ==============================================================
    // BƯỚC 3: TỰ ĐỘNG KÍCH HOẠT BẢO HÀNH 12 THÁNG KHI HÓA ĐƠN HOÀN THÀNH
    // ==============================================================
    List<BaoHanh> kichHoatBaoHanhTheoHoaDon(Integer idHoaDon);

    void dongBoBaoHanhChoHoaDonDaHoanThanh();
}

